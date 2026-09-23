# LexiGuard — AI-Powered Legal Document Intelligence

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PyMuPDF](https://img.shields.io/badge/PDF_Engine-PyMuPDF-FF6F00.svg?style=flat)](https://pymupdf.readthedocs.io/)
[![RAG Pipeline](https://img.shields.io/badge/RAG-Vector%20Retrieval-8A2BE2.svg?style=flat)](#-rag--document-grounded-qa)
[![Tests](https://img.shields.io/badge/Tests-43%20Passed-brightgreen.svg?style=flat)](#-running-automated-tests)
[![Status](https://img.shields.io/badge/Release-Phase%204%20Complete-indigo.svg?style=flat)](#-project-phases--status)

> **LexiGuard** is a GenAI-powered legal document intelligence platform that empowers individuals, small businesses, and professionals to understand, query (via RAG), and compare complex legal agreements with page-level citations and strict legal-safety boundaries.
>
> *Disclaimer: LexiGuard provides informational assistance only and does not provide legal advice or legal representation.*

---

## 📌 Table of Contents

1. [Problem Statement & Solution](#-problem-statement--solution)
2. [Project Phases & Status](#-project-phases--status)
3. [Core Capabilities & Workflow](#-core-capabilities--workflow)
4. [System Architecture & RAG Pipeline](#-system-architecture--rag-pipeline)
5. [Technology Stack](#-technology-stack)
6. [Project Structure](#-project-structure)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
8. [API Documentation](#-api-documentation)
9. [Running Automated Tests](#-running-automated-tests)
10. [Security & Prompt Injection Defenses](#-security--prompt-injection-defenses)
11. [Changelog & Commit History](#-changelog--commit-history)

---

## 🎯 Problem Statement & Solution

### The Problem
Legal contracts (NDAs, MSAs, vendor agreements, employment contracts) are dense, lengthy, and full of legalese. Non-lawyers often:
* Misunderstand core liabilities, notice timelines, and termination rights.
* Struggle to get quick answers to specific questions about a 30-page agreement without reading every line.
* Cannot easily identify what changed between two versions of an agreement (V1 vs V2).
* Cannot afford routine attorney retainers for initial document comprehension.

### The LexiGuard Solution
* **UPLOAD**: Secure PDF ingestion with multi-tier MIME, size, and magic bytes validation.
* **UNDERSTAND**: Automatic structured synthesis of summary, classified document type, important clauses, obligations, and potential issues.
* **VERIFY**: High-contrast, clickable source citations that link directly to the page-by-page document reader.
* **COMPARE**: Semantic multi-contract difference detection identifying added, removed, and modified clauses between agreements.
* **DETECT**: Objective identification of ambiguous clauses and obligations with deadlines for professional review.
* **ACT**: Informed next steps and legal counsel discussion preparation.

---

## 📊 Project Phases & Status

| Phase | Scope & Highlights | Status |
| :--- | :--- | :--- |
| **Phase 1: Foundation** | FastAPI app factory, CORS whitelist, Pydantic settings, health check endpoint, React + Vite + Tailwind shell, accessible navigation, legal disclaimer, Pytest + Vitest foundation. | ✅ **Completed & Approved** |
| **Phase 2: Core Document Intelligence** | Secure PDF upload validation, PyMuPDF page-aware text extraction, in-memory repository, structured analysis (summary, key clauses, obligations/deadlines, potential issues), dual-panel interactive reader with source page jump badges. | ✅ **Completed & Approved** |
| **Phase 3: RAG, Grounded Q&A & Comparison** | Deterministic page-bound chunking, embedding service, vector store with document isolation, RAG Q&A with prompt injection defense & insufficient-evidence fallback, semantic document comparison, OpenRouter LLM integration. | ✅ **Completed & Approved** |
| **Phase 4: Final Polish, Quality & Accessibility** | End-to-end workflow hardening, evidence-grounded document classification, AI diagnostic endpoints (`GET /api/health/ai`), enhanced citation cards with readable excerpts, full keyboard accessibility, 43 automated tests. | ✅ **Completed & Demo Ready** |

---

## ⚡ Core Capabilities

### 1. Document-Grounded Q&A (RAG Pipeline)
* **Document-Isolated Vector Store**: In-memory vector store filters queries strictly by `document_id` to guarantee zero cross-document data leakage.
* **Prompt Injection Defenses**: Untrusted document text is encapsulated within strict delimiters (`=== BEGIN UNTRUSTED RETRIEVED DOCUMENT CONTEXT ===`); system instructions forbid executing commands found in document text.
* **Evidence-Grounded Answers**: Answers are derived exclusively from retrieved page chunks.
* **Insufficient Evidence Fallback**: When questions cannot be answered from document content, LexiGuard states: *"The uploaded document does not provide enough information to answer this confidently."* without hallucinating.

### 2. Semantic Document Comparison
* **Multi-Contract Diff Engine**: Compares Document A and Document B to detect:
  * `added` clauses (new provisions in Document B).
  * `removed` clauses (provisions deleted from Document A).
  * `modified` clauses (altered notice periods, liability caps, or responsibilities).
* **Dual Source Citations**: Every change cites the exact page number from both Document A and Document B.
* **Neutral Legal Phrasing**: Highlights changes as *"Potentially meaningful change requiring review"* with clear explanations.

### 3. Document Ingestion & Structured Intelligence
* **Multi-Layer File Validation**: MIME check (`application/pdf`), magic bytes (`%PDF-`), and 25MB limit.
* **Page-Aware PyMuPDF Engine**: 1-indexed page preservation with whitespace normalization.
* **Structured Extraction**: Plain-language summaries, key clauses with source quotes, obligations with deadlines, and flagged issues.

---

## 🏗 System Architecture & RAG Pipeline

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

## 💻 Technology Stack

### Frontend
* **Core**: React 18.3, JavaScript (ES Modules)
* **Bundler & Dev Server**: Vite 6.1
* **Styling**: Tailwind CSS 3.4 (Navy/Slate with Indigo accents)
* **Routing**: React Router v6.28
* **Icons**: Lucide React
* **Testing**: Vitest 3.0, React Testing Library, jsdom

### Backend
* **Language & Runtime**: Python 3.10+
* **Framework**: FastAPI 0.110+
* **ASGI Server**: Uvicorn 0.28+
* **PDF Extraction Engine**: PyMuPDF (`fitz`) 1.28+
* **Vector Store & Embeddings**: In-Memory Cosine Vector Index, Gemini / OpenAI / Semantic Vectorizer
* **Data Validation & Settings**: Pydantic v2 & Pydantic Settings
* **Testing Suite**: Pytest 9.1, Pytest-Asyncio, HTTPX 0.28

---

## 📂 Project Structure

```text
lexiguard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # StatusBadge, LegalDisclaimer, SourcePageBadge
│   │   │   ├── layout/           # Accessible Navbar & Header
│   │   │   └── analysis/         # SummaryCard, ClausesList, ObligationsTable, PotentialIssuesList
│   │   ├── pages/                # UploadPage, DocumentsPage, DocumentDetailPage, ChatPage, ComparePage
│   │   ├── services/             # Centralized Axios API client (api.js)
│   │   ├── hooks/                # Custom React hooks (useHealthCheck)
│   │   ├── utils/                # Utility helpers (cn class merger)
│   │   ├── App.jsx               # Top-level routing & layout shell
│   │   ├── main.jsx              # App entrypoint
│   │   └── index.css             # Tailwind base styles
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vite.config.js            # Vite bundler configuration
│   └── vitest.config.js          # Vitest testing configuration
│
├── backend/
│   ├── app/
│   │   ├── api/                  # health.py, documents.py, analysis.py, chat.py, comparison.py
│   │   ├── core/                 # config.py, cors.py
│   │   ├── schemas/              # health.py, document.py, analysis.py, chat.py, comparison.py
│   │   ├── services/             # pdf_service, document_service, ai_service, chunking_service, embedding_service, vector_store, retrieval_service, rag_service, comparison_service
│   │   ├── utils/                # file_validation.py
│   │   └── main.py               # FastAPI application factory
│   ├── tests/                    # test_health, test_upload_validation, test_document_service, test_analysis, test_rag_foundation, test_chat_rag, test_comparison
│   ├── pytest.ini                # Pytest configuration
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture, RAG, and comparison designs
│   ├── SECURITY.md               # Security policy, prompt injection defense, and document isolation
│   ├── TESTING.md                # Testing strategy & automated test execution catalog
│   └── QUALITY_CHECKLIST.md      # Six-criteria audit checklist
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusions
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Getting Started & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: 3.10 or higher
* **Git**

---

### Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. (Recommended) Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (optional):
   ```bash
   cp ../.env.example .env
   ```
   *Note: If `GEMINI_API_KEY` or `OPENAI_API_KEY` is not provided, LexiGuard runs its deterministic evidence-based vector and analysis engines seamlessly offline.*

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Frontend Setup

1. In a separate terminal, navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   * **Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Documentation

### Health Endpoint
* `GET /api/health` — Returns `{"status": "ok", "service": "lexiguard-api"}`.

### Document Ingestion Endpoints
* `POST /api/documents/upload` — Ingests PDF (`multipart/form-data`), parses pages, and returns document metadata.
* `GET /api/documents` — Lists all ingested document summaries.
* `GET /api/documents/{id}` — Retrieves document detail and page count.
* `GET /api/documents/{id}/pages` — Retrieves page-by-page extracted text.

### Structured Analysis Endpoints
* `POST /api/analysis/{document_id}` — Generates and caches plain-language summary, key clauses, obligations, and potential issues.
* `GET /api/analysis/{document_id}` — Retrieves cached analysis.

### Document Q&A (RAG) Endpoints
* `POST /api/chat/{document_id}` — Asks a grounded question via vector retrieval and returns synthesized answer with page citations.
* `GET /api/chat/{document_id}/history` — Retrieves in-memory conversation history.
* `DELETE /api/chat/{document_id}/history` — Clears in-memory conversation history.

### Document Comparison Endpoints
* `POST /api/comparison` — Compares two documents and returns detected added, removed, and modified clauses with dual page references.

---

## 🧪 Running Automated Tests

LexiGuard maintains 39 automated tests covering all backend services and frontend components.

### 1. Backend Pytest Suite (22 Tests)
```bash
cd backend
python -m pytest -v
```
**Test Suites**:
* `test_health.py` — Health endpoint validation.
* `test_upload_validation.py` — PDF validation, non-PDF rejection, fake magic byte rejection, and 25MB limit.
* `test_document_service.py` — Document storage, page extraction, and 404 handling.
* `test_analysis.py` — Structured analysis schema validation and prompt injection defenses.
* `test_rag_foundation.py` — Page-aware chunking, embedding service, and strict vector store document isolation.
* `test_chat_rag.py` — Grounded Q&A, insufficient-evidence handling, prompt injection safety, and conversation history.
* `test_comparison.py` — Added/removed/modified clause detection and dual page citations.

### 2. Frontend Vitest Suite (17 Tests)
```bash
cd frontend
npm test
```
**Test Suites**:
* `HomePage.test.jsx` — Branding, headline, and primary CTA buttons.
* `UploadPage.test.jsx` — Drag & drop upload, file validation, and error alerts.
* `DocumentsPage.test.jsx` — Document library listing and empty state.
* `DocumentDetailPage.test.jsx` — Detail metadata, analysis cards, and interactive source page jumping.
* `ChatPage.test.jsx` — Document selection, grounded question answering, source citations, and insufficient information state.
* `ComparePage.test.jsx` — Document pair selection, comparison trigger, and added/modified changes rendering.

### 3. Production Bundle Check
```bash
cd frontend
npm run build
```

---

## 🛡 Security & Prompt Injection Defenses

1. **Zero Hardcoded Secrets**: Secrets loaded exclusively from environment variables; `.env` excluded via `.gitignore`.
2. **Strict Vector Document Isolation**: RAG search strictly filters queries by `document_id`, eliminating cross-document data leakage.
3. **Prompt Injection Defense**: Retrieved document chunks are encapsulated in explicit boundaries (`=== BEGIN UNTRUSTED RETRIEVED DOCUMENT CONTEXT ===`); instructions within documents cannot alter system prompts.
4. **Source Integrity & Citation Verification**: Citations are derived exclusively from actual retrieved chunk metadata.
5. **Non-Definitive Legal Phrasing**: Neutral, objective wording ("Potential issue requiring review") prevents liability risks.
6. **Multi-Modal Accessibility**: WCAG AA compliant contrast, visible focus rings, keyboard tab support, and descriptive ARIA labels.

---

## 📝 Changelog & Commit History

| Commit | Milestone | Description |
| :--- | :--- | :--- |
| `417224d` | **Phase 1 & 2** | Foundation release and Core Document Intelligence (PyMuPDF, structured analysis, dual reader UI). |
| `761af8c` | **Docs** | Comprehensive README enhancement with architecture diagrams and API reference. |
| `bc14e6e` | **Phase 3.1** | Phase 3 RAG foundation: chunking service, embedding service, vector store with document isolation, and retrieval service. |
| `41172ac` | **Phase 3.2** | Document-grounded Chat & Q&A: RAG service, prompt injection defenses, `/api/chat/{id}`, and interactive ChatPage UI. |
| `bad1334` | **Phase 3.3** | Document Comparison: semantic comparison service, `/api/comparison`, and ComparePage UI with dual page citations. |
| `HEAD` | **Phase 3.4** | Complete Phase 3 verification, 39 automated tests, security documentation, and quality checklist audit. |

---

## ⚖️ Legal Disclaimer

> **LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation.** AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.
