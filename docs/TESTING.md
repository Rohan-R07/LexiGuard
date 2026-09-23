# Testing Strategy & Execution Guide — LexiGuard (Phase 2)

## 1. Overview

LexiGuard maintains an end-to-end automated test suite spanning backend unit/API tests, file validation, PDF parsing, AI structured schema validation, and frontend component/interaction testing.

---

## 2. Backend Testing (Pytest)

The backend test suite runs via **Pytest** and FastAPI's **TestClient**.

### Test Suites (`backend/tests/`)
1. **`test_health.py`**:
   - `test_health_endpoint`: Asserts `GET /api/health` returns status `200` with expected service name.
2. **`test_upload_validation.py`**:
   - `test_valid_pdf_upload_success`: Asserts valid multi-page PDF upload returns 201 with metadata.
   - `test_non_pdf_file_rejected`: Asserts non-PDF (.txt, etc.) uploads return 400 Bad Request.
   - `test_pdf_with_invalid_magic_bytes_rejected`: Asserts fake PDFs without `%PDF-` signature are rejected.
   - `test_empty_file_rejected`: Asserts empty files return 400 Bad Request.
   - `test_oversized_file_rejected`: Asserts files exceeding size limit return 413 Payload Too Large.
3. **`test_document_service.py`**:
   - `test_document_listing_and_retrieval`: Validates document listing, detail fetching, and page extraction preservation.
   - `test_nonexistent_document_returns_404`: Asserts invalid document IDs return clean 404s.
4. **`test_analysis.py`**:
   - `test_document_analysis_structured_output`: Validates structured output schema (summary, clauses, obligations, issues, disclaimer).
   - `test_analysis_nonexistent_document_returns_404`: Asserts 404 on missing document analysis.
   - `test_prompt_injection_safety_preservation`: Verifies adversarial prompts in documents are safely handled as passive text.

### Running Backend Tests
```bash
cd backend
python -m pytest -v
```

---

## 3. Frontend Testing (Vitest & React Testing Library)

### Test Suites (`frontend/src/pages/`)
1. **`HomePage.test.jsx`**: Asserts branding, headline, CTAs, and legal disclaimer render.
2. **`UploadPage.test.jsx`**: Validates drag & drop dropzone, PDF selection, invalid file error alerts, and upload trigger.
3. **`DocumentsPage.test.jsx`**: Validates document listing cards and empty state.
4. **`DocumentDetailPage.test.jsx`**: Validates document metadata rendering, structured AI analysis cards, and interactive source page jumping.

### Running Frontend Tests
```bash
cd frontend
npm test
```

---

## 4. Production Build Verification
```bash
cd frontend
npm run build
```
