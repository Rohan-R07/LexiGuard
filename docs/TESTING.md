# Testing Strategy & Execution Guide — LexiGuard (Phase 3)

## 1. Overview

LexiGuard maintains 39 automated tests spanning backend unit tests, validation suites, vector store isolation, RAG grounded Q&A, multi-contract comparison, and frontend component/interaction suites.

---

## 2. Backend Testing (Pytest — 22 Tests)

Run the backend test suite:
```bash
cd backend
python -m pytest -v
```

### Complete Test Catalog:
1. **`test_health.py`**:
   - `test_health_endpoint`: Validates health status `200 OK` and schema.
2. **`test_upload_validation.py`**:
   - `test_valid_pdf_upload_success`: Validates valid PDF upload and metadata.
   - `test_non_pdf_file_rejected`: Rejects `.txt` files with 400 Bad Request.
   - `test_pdf_with_invalid_magic_bytes_rejected`: Rejects files missing `%PDF-` signature.
   - `test_empty_file_rejected`: Rejects 0-byte uploads.
   - `test_oversized_file_rejected`: Rejects files exceeding 25MB with 413 Payload Too Large.
3. **`test_document_service.py`**:
   - `test_document_listing_and_retrieval`: Validates document list, detail fetching, and page extraction.
   - `test_nonexistent_document_returns_404`: Validates 404 for unknown document IDs.
4. **`test_analysis.py`**:
   - `test_document_analysis_structured_output`: Validates summary, key clauses, obligations, and issues.
   - `test_analysis_nonexistent_document_returns_404`: Validates 404 on missing document analysis.
   - `test_prompt_injection_safety_preservation`: Validates adversarial prompt resistance.
5. **`test_rag_foundation.py`**:
   - `test_chunking_preserves_page_numbers_and_unique_ids`: Validates chunk isolation within pages.
   - `test_vector_store_strict_document_isolation`: Validates zero cross-document vector leakage.
   - `test_retrieval_service_top_k_ranking`: Validates top-k semantic ranking.
6. **`test_chat_rag.py`**:
   - `test_rag_chat_grounded_question_answer`: Validates question answering with page citations.
   - `test_rag_chat_insufficient_evidence_handling`: Validates insufficient information fallback.
   - `test_rag_chat_prompt_injection_safety`: Validates prompt injection immunity in RAG snippets.
   - `test_chat_history_lifecycle`: Validates recording and clearing in-memory conversation history.
   - `test_chat_nonexistent_document_returns_404`: Validates 404 for unknown document IDs.
7. **`test_comparison.py`**:
   - `test_comparison_between_two_documents`: Validates added, removed, and modified clause detection with dual page references.
   - `test_comparison_same_document_rejected`: Rejects comparing a document to itself with 400.
   - `test_comparison_missing_document_returns_404`: Validates 404 on missing documents.

---

## 3. Frontend Testing (Vitest — 17 Tests)

Run the frontend test suite:
```bash
cd frontend
npm test
```

### Complete Test Catalog:
1. **`HomePage.test.jsx`** (4 tests): Branding, headline, CTAs, disclaimer.
2. **`UploadPage.test.jsx`** (3 tests): Dropzone, PDF selection, error alerts.
3. **`DocumentsPage.test.jsx`** (2 tests): Document library listing, empty state.
4. **`DocumentDetailPage.test.jsx`** (3 tests): Detail metadata, analysis cards, source page jumping.
5. **`ChatPage.test.jsx`** (3 tests): Document picker, grounded question answering with page citations, insufficient information state.
6. **`ComparePage.test.jsx`** (2 tests): Document pair selection, comparison trigger, added/modified changes rendering.

---

## 4. Production Build Verification
```bash
cd frontend
npm run build
```
*(Builds in under 3 seconds with zero bundling errors).*
