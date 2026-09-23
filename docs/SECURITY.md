# Security Architecture & Policies — LexiGuard (Phase 2)

## 1. Phase 2 Implemented Security Controls

Phase 2 strengthens the application security baseline across file ingestion, AI processing, and error handling:

### 1.1 Secure File Ingestion & Validation (`app/utils/file_validation.py`)
- **MIME-Type & Extension Check**: Uploads strictly limited to `.pdf` with `application/pdf` MIME headers.
- **Magic Byte Signature**: First 5 bytes verified for `%PDF-` signature to block renamed malicious executables.
- **Enforced Size Limit**: Requests exceeding 25MB (`MAX_UPLOAD_SIZE_MB`) rejected with HTTP 413.
- **Filename Sanitization**: Path traversal sequences (`../`, `..\`) stripped; filenames cleaned of non-alphanumeric characters.
- **Generated UUIDs**: Documents referenced internally via generated UUIDv4 tokens, never raw file paths.
- **No Path Traversal**: Filesystem paths never exposed in API payloads or error responses.

### 1.2 GenAI Prompt Injection Defenses (`app/services/ai_service.py`)
- **Explicit Safety Delimiters**: Document text encapsulated in unambiguous boundary markers (`=== BEGIN UNTRUSTED DOCUMENT CONTENT ===` ... `=== END UNTRUSTED DOCUMENT CONTENT ===`).
- **Passive Data Rule**: System prompt explicitly instructs the LLM that document content is untrusted data and must never be executed as instructions.
- **Structured JSON Schema Guard**: Output strictly validated against Pydantic models (`AnalysisResponse`), discarding rogue or uncontrolled text outputs.

### 1.3 Legal Safety & Liability Boundaries
- **No Definitive Conclusions**: Findings framed as "Potential issues requiring review" rather than conclusions of illegality or unenforceability.
- **Three-Way Separation**: Clear visual and conceptual separation between:
  1. *What the document text explicitly states*
  2. *What the AI plain-language explanation is*
  3. *What requires qualified legal review*
- **Source Verification**: Every AI claim requires a corresponding page number and verbatim excerpt.
- **Prominent Disclaimers**: Displayed across all interfaces and API responses.

### 1.4 API & Secrets Hygiene
- Zero secrets committed to version control; `.env` excluded via `.gitignore`.
- Explicit CORS restricted to configured origins.
- Safe exception handling suppressing internal python tracebacks.

---

## 2. Future Security Roadmap (Phase 3)

* **Antivirus Scanning**: Integration of file scanning (e.g., ClamAV) in high-security production deployments.
* **PII Redaction**: Pre-LLM filter to scrub SSNs, credit card numbers, and confidential contact information.
* **Access Control & Multi-Tenancy**: Row-level security (RLS) in PostgreSQL ensuring documents are only accessible to authorized users.
