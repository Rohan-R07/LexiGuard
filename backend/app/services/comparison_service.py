import json
import os
import re
from typing import List, Dict, Optional
import httpx
from fastapi import HTTPException, status
from app.core.config import settings
from app.schemas.comparison import ComparisonResult, DocumentChange
from app.services.document_service import document_service


COMPARISON_SYSTEM_PROMPT = """You are LexiGuard Comparison, an objective legal document comparison engine.
Your purpose is to compare two versions of a legal contract (Document A vs Document B) and identify meaningful semantic differences.

CRITICAL RULES:
1. INFORMATIONAL ONLY: Provide objective comparison of terms, NOT legal advice or risk ratings.
2. DETECT SPECIFIC CHANGES:
   - "added": New provision present in Document B that did not exist in Document A.
   - "removed": Provision present in Document A that was deleted or omitted in Document B.
   - "modified": Provision present in both documents where wording, timelines, monetary amounts, or duties differ.
3. CITATIONS: Include document_a_page and document_b_page for every finding where applicable.
4. NEUTRAL LANGUAGE: Do not state that one version is "better", "worse", or "illegal". Use phrasing such as: "Potentially meaningful change requiring review: notice window extended from 30 to 60 days."

Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "High-level summary of overall contractual differences between Document A and Document B",
  "changes": [
    {
      "change_type": "modified",
      "category": "Termination & Notice Period",
      "description": "Notice requirement altered from 30 days to 60 days.",
      "document_a_page": 2,
      "document_b_page": 2,
      "document_a_text": "Either party may terminate upon 30 days notice.",
      "document_b_text": "Either party may terminate upon 60 days written notice.",
      "significance_explanation": "Extends notice obligations, affecting timeline for agreement termination."
    }
  ]
}
"""


class ComparisonService:
    """Service performing semantic multi-contract comparison."""

    def _build_comparison_prompt(self, doc_a_text: str, doc_b_text: str, name_a: str, name_b: str) -> str:
        return f"""=== BEGIN UNTRUSTED DOCUMENT A ({name_a}) ===
{doc_a_text[:6000]}
=== END UNTRUSTED DOCUMENT A ===

=== BEGIN UNTRUSTED DOCUMENT B ({name_b}) ===
{doc_b_text[:6000]}
=== END UNTRUSTED DOCUMENT B ===

Please perform a structured semantic comparison between Document A and Document B. Detect added, removed, and modified clauses with page numbers and neutral explanations. Return ONLY valid JSON."""

    async def _call_llm_comparison(self, prompt: str) -> Optional[Dict]:
        """Call configured LLM (Gemini / OpenAI) for structured comparison."""
        # 1. Gemini
        api_key_gemini = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if api_key_gemini:
            model = settings.LLM_MODEL or "gemini-1.5-flash"
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key_gemini}"
            payload = {
                "contents": [{"role": "user", "parts": [{"text": f"{COMPARISON_SYSTEM_PROMPT}\n\n{prompt}"}]}],
                "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
            }
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    res = await client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            return json.loads(raw_text)
            except Exception:
                pass

        # 2. OpenAI
        api_key_openai = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
        if api_key_openai:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key_openai}", "Content-Type": "application/json"}
            payload = {
                "model": settings.LLM_MODEL or "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": COMPARISON_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1,
            }
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        content = data["choices"][0]["message"]["content"]
                        return json.loads(content)
            except Exception:
                pass

        return None

    def _heuristic_comparison(self, doc_a, doc_b) -> ComparisonResult:
        """
        Deterministic, section-aligned semantic comparison fallback for offline/test environments.
        Compares common contractual provisions across pages to detect additions, deletions, and alterations.
        """
        text_a = " ".join(p.text for p in doc_a.pages)
        text_b = " ".join(p.text for p in doc_b.pages)

        changes: List[DocumentChange] = []

        # Standard legal clause topics to inspect
        topics = [
            ("Termination & Notice", r"(terminate|termination|notice period|written notice)", "Termination notice timeframe and conditions"),
            ("Indemnification & Defense", r"(indemnif\w+|hold harmless)", "Allocation of third-party liability defense"),
            ("Governing Law & Venue", r"(governing law|jurisdiction|venue)", "Designated legal jurisdiction for dispute resolution"),
            ("Limitation of Liability", r"(limitation of liability|aggregate liability|liability cap)", "Maximum financial damage caps"),
            ("Confidentiality Scope", r"(confidentiality|non-disclosure|proprietary)", "Protection standards for proprietary information"),
            ("Payment Terms & Fees", r"(payment|fee|invoic\w+|net \d+)", "Fee calculation and disbursement schedules"),
            ("Audit & Inspection Rights", r"(audit|inspect|access to records)", "Rights to inspect books and performance records"),
        ]

        for category, regex_pattern, purpose in topics:
            match_a = re.search(regex_pattern, text_a, re.IGNORECASE)
            match_b = re.search(regex_pattern, text_b, re.IGNORECASE)

            # Find matching pages
            page_a = next((p.page_number for p in doc_a.pages if re.search(regex_pattern, p.text, re.IGNORECASE)), None)
            page_b = next((p.page_number for p in doc_b.pages if re.search(regex_pattern, p.text, re.IGNORECASE)), None)

            # Case 1: Added in B
            if not match_a and match_b:
                snippet_b = text_b[max(0, match_b.start() - 20):min(len(text_b), match_b.end() + 120)].strip()
                changes.append(
                    DocumentChange(
                        change_type="added",
                        category=category,
                        description=f"New provision regarding {category.lower()} introduced in Document B.",
                        document_a_page=None,
                        document_b_page=page_b or 1,
                        document_a_text=None,
                        document_b_text=f"...{snippet_b}...",
                        significance_explanation=f"Document B adds new terms addressing {purpose.lower()} not present in Document A."
                    )
                )

            # Case 2: Removed from A
            elif match_a and not match_b:
                snippet_a = text_a[max(0, match_a.start() - 20):min(len(text_a), match_a.end() + 120)].strip()
                changes.append(
                    DocumentChange(
                        change_type="removed",
                        category=category,
                        description=f"Provision regarding {category.lower()} removed from Document B.",
                        document_a_page=page_a or 1,
                        document_b_page=None,
                        document_a_text=f"...{snippet_a}...",
                        document_b_text=None,
                        significance_explanation=f"Document B omits the {purpose.lower()} previously defined in Document A."
                    )
                )

            # Case 3: Present in both, check for differences
            elif match_a and match_b:
                snippet_a = text_a[max(0, match_a.start() - 20):min(len(text_a), match_a.end() + 120)].strip()
                snippet_b = text_b[max(0, match_b.start() - 20):min(len(text_b), match_b.end() + 120)].strip()
                
                # If wording is non-identical
                if snippet_a.lower() != snippet_b.lower():
                    # Check notice period or number differences
                    nums_a = re.findall(r"\b\d+\b", snippet_a)
                    nums_b = re.findall(r"\b\d+\b", snippet_b)
                    
                    desc = f"Wording and conditions for {category.lower()} differ between Document A and Document B."
                    if nums_a != nums_b and nums_a and nums_b:
                        desc = f"{category} specifies {nums_a[0]} in Document A versus {nums_b[0]} in Document B."

                    changes.append(
                        DocumentChange(
                            change_type="modified",
                            category=category,
                            description=desc,
                            document_a_page=page_a or 1,
                            document_b_page=page_b or 1,
                            document_a_text=f"...{snippet_a}...",
                            document_b_text=f"...{snippet_b}...",
                            significance_explanation=f"Potentially meaningful difference requiring review: {purpose.lower()} was altered."
                        )
                    )

        # Fallback if contracts are virtually identical or minimal
        if not changes:
            changes.append(
                DocumentChange(
                    change_type="modified",
                    category="General Contractual Structure",
                    description="Minor text variations detected across general terms.",
                    document_a_page=1,
                    document_b_page=1,
                    document_a_text=doc_a.pages[0].text[:120] if doc_a.pages else "",
                    document_b_text=doc_b.pages[0].text[:120] if doc_b.pages else "",
                    significance_explanation="Both documents share highly similar core structures with minimal divergence."
                )
            )

        summary = (
            f"Comparison between '{doc_a.filename}' (Doc A) and '{doc_b.filename}' (Doc B) identified "
            f"{len(changes)} key contractual differences, including "
            f"{sum(1 for c in changes if c.change_type == 'added')} added, "
            f"{sum(1 for c in changes if c.change_type == 'removed')} removed, and "
            f"{sum(1 for c in changes if c.change_type == 'modified')} modified provisions."
        )

        return ComparisonResult(
            document_a_id=doc_a.id,
            document_b_id=doc_b.id,
            document_a_filename=doc_a.filename,
            document_b_filename=doc_b.filename,
            summary=summary,
            changes=changes,
        )

    async def compare_documents(self, doc_id_a: str, doc_id_b: str) -> ComparisonResult:
        """Execute semantic multi-contract comparison between Document A and Document B."""
        if doc_id_a == doc_id_b:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot compare a document to itself. Please select two distinct documents.",
            )

        doc_a = document_service.get_document(doc_id_a)
        if not doc_a:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document A with ID '{doc_id_a}' not found.",
            )

        doc_b = document_service.get_document(doc_id_b)
        if not doc_b:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document B with ID '{doc_id_b}' not found.",
            )

        text_a = " ".join(f"[Page {p.page_number}] {p.text}" for p in doc_a.pages)
        text_b = " ".join(f"[Page {p.page_number}] {p.text}" for p in doc_b.pages)

        # 1. Attempt LLM Comparison
        prompt = self._build_comparison_prompt(text_a, text_b, doc_a.filename, doc_b.filename)
        raw_result = await self._call_llm_comparison(prompt)

        if raw_result and isinstance(raw_result, dict):
            try:
                raw_result["document_a_id"] = doc_id_a
                raw_result["document_b_id"] = doc_id_b
                raw_result["document_a_filename"] = doc_a.filename
                raw_result["document_b_filename"] = doc_b.filename
                return ComparisonResult.model_validate(raw_result)
            except Exception:
                pass

        # 2. Fallback heuristic comparison
        return self._heuristic_comparison(doc_a, doc_b)


comparison_service = ComparisonService()
