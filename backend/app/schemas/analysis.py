from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class DocumentTypeInfo(BaseModel):
    """Classified document type with evidence-based confidence level."""

    document_type: str = Field(
        default="Unknown legal document",
        description="Classified legal document type based on document evidence"
    )
    confidence: str = Field(
        default="medium",
        description="Classification confidence: 'high' | 'medium' | 'low' | 'unknown'"
    )


class DocumentSummary(BaseModel):
    """Plain-language overview and key takeaways of the document."""

    summary: str = Field(..., description="High-level plain-language summary of the document purpose and scope")
    key_points: List[str] = Field(default_factory=list, description="Bullet-point summary of core provisions")


class ImportantClause(BaseModel):
    """Cataloged important clause with explanation and source page citation."""

    title: str = Field(..., description="Clause title or category (e.g., Termination, Indemnification)")
    explanation: str = Field(..., description="Plain-language explanation of what this clause does")
    page_number: int = Field(..., description="1-indexed source page where clause appears", ge=1)
    source_text: str = Field(..., description="Exact or condensed excerpt from the document text")


class Obligation(BaseModel):
    """Actionable obligation or requirement mapped to a specific party."""

    party: str = Field(..., description="Party responsible for the obligation (e.g., 'Vendor', 'Client')")
    obligation: str = Field(..., description="Description of the duty or required action")
    deadline: Optional[str] = Field(None, description="Explicit date, timeframe, or notice period if stated")
    page_number: int = Field(..., description="1-indexed source page where obligation is specified", ge=1)
    source_text: str = Field(..., description="Relevant source excerpt")


class PotentialIssue(BaseModel):
    """Potential issue or ambiguity requiring professional legal review."""

    category: str = Field(..., description="Category of concern (e.g., 'Unilateral Termination', 'Vague Indemnity')")
    description: str = Field(..., description="Description of the specific provision or ambiguity found")
    why_attention_is_needed: str = Field(..., description="Objective explanation of why this provision warrants review by counsel")
    page_number: int = Field(..., description="1-indexed source page where issue occurs", ge=1)
    source_text: str = Field(..., description="Excerpt of the clause requiring review")


class AnalysisResponse(BaseModel):
    """Complete structured document analysis output."""

    document_id: str = Field(..., description="Associated document ID")
    document_type: DocumentTypeInfo = Field(
        default_factory=lambda: DocumentTypeInfo(document_type="Unknown legal document", confidence="unknown"),
        description="Classified document type and confidence level"
    )
    summary: DocumentSummary = Field(..., description="Summary and key highlights")
    important_clauses: List[ImportantClause] = Field(default_factory=list, description="Key clauses identified")
    obligations: List[Obligation] = Field(default_factory=list, description="Extracted obligations and deliverables")
    potential_issues: List[PotentialIssue] = Field(default_factory=list, description="Issues requiring legal review")
    created_at: datetime = Field(default_factory=get_utc_now, description="Analysis generation timestamp")
    disclaimer: str = Field(
        default="LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation. AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.",
        description="Mandatory legal disclaimer"
    )
