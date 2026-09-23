# System Architecture — LexiGuard (Phase 2)

## 1. Architectural Overview

LexiGuard is architected as a modular, lightweight legal document intelligence pipeline. It enforces strict separation of concerns across UI presentation, API orchestration, PDF extraction, and structured AI intelligence.

---

## 2. Ingestion & Analysis Data Flow (Phase 2)

```
[ User PDF Upload ]
        │ (multipart/form-data)
        ▼
[ File Validation & Sanitization ] ──── (MIME, Magic Bytes, 25MB Limit)
        │
        ▼
[ PyMuPDF Text Extraction Engine ] ──── (Page-aware extraction, whitespace normalization)
        │
        ▼
[ Document Repository (Phase 2 In-Memory) ]
        │
        ▼ (PageText Structure: Page 1..N)
[ AI Service Prompt Boundary ] ──────── (System guardrails, untrusted content delimiters)
        │
        ▼
[ LLM Provider / Structured Engine ] ── (Gemini / OpenAI / Heuristic fallback)
        │
        ▼
[ Pydantic Schema Validation ] ──────── (Summary, Clauses, Obligations, Issues)
        │
        ▼
[ React Dual Workspace UI ] ─────────── (Analysis cards + Interactive Page Reader with Jump Badges)
```

---

## 3. Core Component Boundaries

### 3.1 PDF Service (`app/services/pdf_service.py`)
- Leverages PyMuPDF (`fitz`) for speed and minimal memory footprint.
- Extracts page text independently to maintain 1-indexed page boundaries for auditability.
- Normalizes irregular whitespace while preserving structural paragraph breaks.

### 3.2 Document Storage (`app/services/document_service.py`)
- Employs a clean repository pattern (`create`, `get`, `list`, `delete`, `save_analysis`).
- Caches extracted text and generated analysis in-memory for the current application lifecycle.
- *Limitation*: Phase 2 storage is local/MVP development storage and not yet multi-user persistent storage (deferred to PostgreSQL in Phase 3).

### 3.3 AI Service & Legal-Safety Guardrails (`app/services/ai_service.py`)
- Decoupled from route handlers behind a clear service interface.
- Embeds prompt injection defenses: treats document text as strictly passive, untrusted input.
- Enforces non-definitive legal formulations ("Potential issue requiring review" instead of "This clause is illegal").
- Attaches exact page citations (`page_number`) and verbatim source excerpts (`source_text`) to every finding.

### 3.4 Interactive Frontend Reader (`DocumentDetailPage.jsx`)
- Dual-panel layout displaying structured findings alongside raw page text.
- Interactive `SourcePageBadge` elements allow instantaneous navigation from any AI finding directly to its source page in the reader.

---

## 4. Phase 3 Architectural Boundaries (Intentionally Deferred)

The following components are deferred to Phase 3 and have clean placeholder boundaries:
- **Vector Database & Embeddings**: Semantic chunking and vector index.
- **RAG & Interactive Chat**: Conversational Q&A router `/api/chat`.
- **Contract Comparison**: Multi-document diff router `/api/comparison`.
- **Persistent Database**: PostgreSQL + SQLAlchemy migration.
- **Authentication**: JWT / User access control.
