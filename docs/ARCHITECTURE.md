# System Architecture — LexiGuard (Phase 3)

## 1. Architectural Overview

LexiGuard is architected as a modular, lightweight legal document intelligence and comparison platform. It coordinates document ingestion, PyMuPDF parsing, vector embeddings, RAG-grounded Q&A, and semantic multi-contract comparison behind decoupled services.

---

## 2. Complete Phase 3 System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LexiGuard React Client                          │
│     (Vite + Tailwind CSS + Lucide Icons + React Router + Axios)        │
├───────────────────┬────────────────────────────┬───────────────────────┤
│  [ Upload Page ]  │  [ Document Detail View ]  │  [ Chat & Compare ]   │
└─────────┬─────────┴─────────────┬──────────────┴───────────┬───────────┘
          │ (PDF File)            │ (Analysis / Read)        │ (Q&A / Compare)
          ▼                       ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Gateway                         │
│               (Strict CORS, Pydantic Schema Validation)                │
└─────────┬───────────────────────┬──────────────────────────┬───────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌────────────────────────┐
│  PyMuPDF Parser  │    │ Document Service │    │  RAG & Compare Engine  │
│  - Page Splitter │    │  - Repo Storage  │    │  - Page Chunking       │
│  - Normalizer    │    │  - Cache State   │    │  - Vector Store (Iso)  │
└──────────────────┘    └──────────────────┘    │  - Semantic Alignment │
                                                └───────────┬────────────┘
                                                            │
                                                            ▼
                                                ┌────────────────────────┐
                                                │ LLM / Guardrail Layer  │
                                                │ - Gemini / OpenAI /    │
                                                │   Deterministic Engine │
                                                │ - Injection Defenses   │
                                                │ - Source Citations     │
                                                └────────────────────────┘
```

---

## 3. RAG Pipeline Architecture

```
[ User Question ]
       │
       ▼
[ Embedding Service ] ── (Generates query vector via Gemini / OpenAI / Semantic Vectorizer)
       │
       ▼
[ Vector Store Search ] ─ (Strict document_id filter prevents cross-document retrieval)
       │
       ▼
[ Top-k Scored Chunks ] ─ (Preserves page_number, chunk_id, and verbatim text)
       │
       ▼
[ Prompt Injection Boundary ] ─ (Delimits untrusted snippets: === UNTRUSTED CONTEXT ===)
       │
       ▼
[ LLM / Grounded Synthesis ] ── (Answers ONLY from retrieved context; falls back if info is missing)
       │
       ▼
[ ChatResponse Schema ] ─────── (Returns answer, grounded flag, and clickable page citations)
```

---

## 4. Semantic Comparison Engine

```
[ Document A ]                           [ Document B ]
      │                                       │
      ▼                                       ▼
[ PyMuPDF Page Text A ]                 [ PyMuPDF Page Text B ]
      │                                       │
      └───────────────────┬───────────────────┘
                          │
                          ▼
             [ Section Alignment Engine ]
          (Matches clauses: Termination, Notice,
           Indemnity, Liability, Payment terms)
                          │
                          ▼
            [ Semantic Diff Classification ]
            - "added": New in Document B
            - "removed": Omitted from Document A
            - "modified": Altered timelines or terms
                          │
                          ▼
             [ Dual Citation Synthesis ]
           (Doc A: Page X  |  Doc B: Page Y)
                          │
                          ▼
              [ ComparisonResult Schema ]
```

---

## 5. Phase 4 Deferred Scope

The following enterprise capabilities are deliberately deferred to Phase 4:
* **Persistent Database**: PostgreSQL migration for multi-user document storage.
* **Authentication & RBAC**: JWT auth and user-level document permissions.
* **OCR Support**: Tesseract / Cloud OCR for scanned image PDFs.
* **Background Worker Queues**: Celery / Redis for large batch document processing.
