# LexiGuard — AI-Powered Legal Document Intelligence

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PyMuPDF](https://img.shields.io/badge/PDF_Engine-PyMuPDF-FF6F00.svg?style=flat)](https://pymupdf.readthedocs.io/)
[![Tests](https://img.shields.io/badge/Tests-23%20Passed-brightgreen.svg?style=flat)](#running-automated-tests)
[![Status](https://img.shields.io/badge/Release-Phase%202%20Active-indigo.svg?style=flat)](#project-phases--status)

> **LexiGuard** is a GenAI-powered legal document intelligence platform built to help individuals, small businesses, and professionals comprehend, navigate, and analyze complex legal agreements with page-level traceability and strict legal-safety guardrails.
>
> *Disclaimer: LexiGuard provides informational assistance only and does not provide legal advice or legal representation.*

---

## 📌 Table of Contents

1. [Problem Statement & Solution](#-problem-statement--solution)
2. [Project Phases & Status](#-project-phases--status)
3. [Key Capabilities](#-key-capabilities)
4. [Architecture & Pipeline](#-architecture--pipeline)
5. [Technology Stack](#-technology-stack)
6. [Project Structure](#-project-structure)
7. [Getting Started & Setup](#-getting-started--setup)
8. [API Documentation](#-api-documentation)
9. [Running Automated Tests](#-running-automated-tests)
10. [Security & Legal-Safety Guardrails](#-security--legal-safety-guardrails)
11. [Changelog & Commit History](#-changelog--commit-history)

---

## 🎯 Problem Statement & Solution

### The Problem
Legal documents (NDAs, MSAs, vendor contracts, employment agreements, terms of service) are notoriously dense, technical, and full of legalese. Non-lawyers frequently sign agreements without recognizing:
* One-sided liability provisions and unilateral termination clauses.
* Strict deliverables, notice windows, and penalty deadlines.
* Ambiguous definitions that create unbudgeted legal exposure.
* Inability to afford expensive attorney retainers for routine document comprehension.

### The LexiGuard Solution
LexiGuard bridges the gap with accessible, structured document intelligence:
* **Evidence-Grounded Synthesis**: Translates contractual provisions into plain language.
* **Page-by-Page Traceability**: Every extracted clause, obligation, and flagged issue cites its exact 1-indexed source page.
* **Legal-Safety Phrasing**: Highlights *potential issues requiring review* with neutral, objective rationale instead of generating risky legal conclusions.
* **Preparation for Legal Counsel**: Equips users with organized talking points and focused questions before speaking to a licensed attorney.

---

## 📊 Project Phases & Status

| Phase | Scope & Highlights | Status |
| :--- | :--- | :--- |
| **Phase 1: Foundation** | FastAPI app factory, CORS whitelist, Pydantic settings, health check endpoint, React + Vite + Tailwind shell, accessible navigation, legal disclaimer, Pytest + Vitest scaffolding. | ✅ **Completed & Approved** |
| **Phase 2: Core Document Intelligence** | Multi-layer PDF upload validation, PyMuPDF page-aware text extraction, in-memory document repository, structured AI analysis (summary, key clauses, obligations/deadlines, potential issues), dual-panel interactive reader with source page jump badges, 23 unit tests. | ✅ **Completed & Active** |
| **Phase 3: Deep Intelligence & Collaboration** | Vector embeddings, RAG conversational Q&A over documents, multi-contract side-by-side diff comparison matrices, PostgreSQL persistence, authentication. | ⏳ *Planned Roadmap* |

---

## ⚡ Key Capabilities

### 1. Secure Multi-Tier PDF Ingestion
* Enforces `.pdf` extension check and `application/pdf` MIME header.
* Magic byte inspection (`%PDF-` at byte offset 0) blocks disguised executables.
* Rejects oversized payloads exceeding 25MB (`MAX_UPLOAD_SIZE_MB`).
* Sanitizes filenames and references files using generated UUIDv4 tokens.

### 2. Page-Aware PyMuPDF Text Extraction
* Extracts text page-by-page while preserving exact 1-indexed page boundaries.
* Normalizes non-standard whitespace and tabs while preserving paragraph structure.
* Gracefully flags scanned/image-only pages when no machine-readable text is found.

### 3. Structured Legal Intelligence (Pydantic Validated)
* **Plain-Language Summary**: Comprehensive overview with bullet-pointed core provisions.
* **Important Clauses**: Standard terms (Termination, Indemnity, Liability, Governing Law) paired with plain explanations and exact source text.
* **Obligations & Deadlines**: Mapped obligations specifying responsible party, duty, explicit timeframes, and source quotes.
* **Potential Issues Requiring Review**: Flags unilateral discretion, uncapped liabilities, and ambiguous clauses with explicit "Why Attention is Needed" rationales.

### 4. Interactive Dual-Panel Workspace UI
* **Left Panel**: Structured findings cards (Summary, Clauses, Obligations, Issues).
* **Right Panel**: Page-by-page extracted text viewer with page switcher (Prev/Next/Jump).
* **Interactive Traceability**: Clicking on any `Page X` badge immediately navigates and highlights that page in the document text viewer.

---

## 🏗 Architecture & Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                         React Frontend Client                          │
│     (Vite + Tailwind CSS + Lucide Icons + React Router + Axios)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Gateway                         │
│             - Pydantic Settings & Strict Origin CORS                   │
│             - File Ingestion & Magic Byte Validation                   │
└─────────────┬────────────────────────────────────────────┬─────────────┘
              │                                            │
              ▼                                            ▼
┌───────────────────────────┐                ┌───────────────────────────┐
│   PyMuPDF Text Engine     │                │   Document Repository     │
│  - Page-by-Page Parsing   │                │  - In-Memory Lifecycle    │
│  - Whitespace Cleaning    │                │  - Cached AI Analysis     │
└─────────────┬─────────────┘                └─────────────┬─────────────┘
              │                                            │
              └─────────────────────┬──────────────────────┘
                                    │ PageText (Page 1..N)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       AI Intelligence Service                          │
│   - Strict Safety Boundaries (=== UNTRUSTED DOCUMENT CONTENT ===)     │
│   - LLM Provider: Gemini 1.5 Flash / OpenAI / Heuristic Engine         │
│   - Prompt Injection Defense & Evidence Grounding                      │
│   - Strict Pydantic Output Validation (AnalysisResponse)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Structured JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Dual-Workspace Document UI                        │
│   [ Structured AI Findings ]  ◀── (Jump Badges) ──▶  [ Page Text View ]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
* **Core**: React 18.3, JavaScript (ES Modules)
* **Bundler & Dev Server**: Vite 6.1
* **Styling**: Tailwind CSS 3.4 (Navy/Slate palette with Indigo accents)
* **Routing**: React Router v6.28
* **Icons**: Lucide React
* **Testing**: Vitest 3.0, React Testing Library, jsdom

### Backend
* **Language & Runtime**: Python 3.10+
* **Framework**: FastAPI 0.110+
* **ASGI Server**: Uvicorn 0.28+
* **PDF Extraction Engine**: PyMuPDF (`fitz`) 1.28+
* **Data Validation & Settings**: Pydantic v2 & Pydantic Settings
* **Testing Client**: Pytest 9.1, HTTPX 0.28

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
│   │   ├── pages/                # UploadPage, DocumentsPage, DocumentDetailPage, HomePage
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
│   │   ├── api/                  # Endpoints (health, documents, analysis, chat, comparison)
│   │   ├── core/                 # Configuration (config.py, cors.py)
│   │   ├── schemas/              # Pydantic models (health, document, analysis)
│   │   ├── services/             # pdf_service, document_service, ai_service
│   │   ├── utils/                # file_validation.py
│   │   └── main.py               # FastAPI application factory
│   ├── tests/                    # test_health, test_upload_validation, test_document_service, test_analysis
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Detailed architecture & component boundaries
│   ├── SECURITY.md               # Security policy & prompt injection defenses
│   ├── TESTING.md                # Testing strategy & test execution guide
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
   # Copy template
   cp ../.env.example .env
   ```
   *Note: If `GEMINI_API_KEY` or `OPENAI_API_KEY` is not set, LexiGuard runs its deterministic evidence-based analysis engine seamlessly offline.*

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **API ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
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
* `GET /api/health` — Returns status `200 OK` with `{"status": "ok", "service": "lexiguard-api"}`.

### Document Endpoints
* `POST /api/documents/upload` — Ingests single PDF (`multipart/form-data`). Returns metadata and page count.
* `GET /api/documents` — Returns list of all ingested document summaries.
* `GET /api/documents/{document_id}` — Returns document metadata and page text count.
* `GET /api/documents/{document_id}/pages` — Returns page-by-page extracted text.

### Analysis Endpoints
* `POST /api/analysis/{document_id}` — Triggers structured AI analysis, extracts clauses, obligations, issues, and caches result.
* `GET /api/analysis/{document_id}` — Retrieves existing analysis without re-running LLM calls.

---

## 🧪 Running Automated Tests

LexiGuard maintains full automated test coverage across both backend and frontend.

### 1. Backend Pytest Suite (11 Tests)
```bash
cd backend
python -m pytest -v
```
**Test Coverage Includes**:
* Health check schema validation (`test_health.py`)
* Valid PDF uploads, non-PDF rejection, corrupted signature rejection, empty file rejection, and 25MB size limit (`test_upload_validation.py`)
* Document retrieval, page index preservation, and 404 responses (`test_document_service.py`)
* Structured AI analysis schema validation, adversarial prompt injection safety, and error handling (`test_analysis.py`)

### 2. Frontend Vitest Suite (12 Tests)
```bash
cd frontend
npm test
```
**Test Coverage Includes**:
* Homepage branding, headline, CTAs, and disclaimer (`HomePage.test.jsx`)
* Upload drag & drop dropzone, PDF selection, error alerts, and upload trigger (`UploadPage.test.jsx`)
* Document library listing and empty state (`DocumentsPage.test.jsx`)
* Document detail view, analysis cards rendering, and interactive source page jumping (`DocumentDetailPage.test.jsx`)

### 3. Production Bundle Check
```bash
cd frontend
npm run build
```

---

## 🛡 Security & Legal-Safety Guardrails

1. **Zero Secret Leakage**: No API keys or credentials committed; `.env` excluded via `.gitignore`.
2. **Explicit CORS Whitelist**: Configured in `app/core/cors.py` (no wildcards `*`).
3. **Prompt Injection Defense**: Untrusted document text strictly bounded within delimiters (`=== BEGIN UNTRUSTED DOCUMENT CONTENT ===` ... `=== END UNTRUSTED DOCUMENT CONTENT ===`).
4. **No Definitive Legal Conclusions**: Findings formulated as *"Potential issues requiring review"* rather than claiming clauses are "illegal" or "void".
5. **Multi-Modal Accessibility**: WCAG AA compliant colors, visible focus rings, keyboard tab navigation, and descriptive text alongside all visual status badges.

---

## 📝 Changelog & Commit History

| Commit | Scope | Description |
| :--- | :--- | :--- |
| `417224d` | **Phase 1 & Phase 2** | Implemented Phase 1 Foundation and Phase 2 Core Document Intelligence (FastAPI, PyMuPDF, Pydantic schemas, React UI, 23 tests, security documentation). |
| `HEAD` | **Docs Enhancement** | Comprehensive README update with interactive architecture diagrams, badges, API reference, setup guide, and changelog. |

---

## ⚖️ Legal Disclaimer

> **LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation.** AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.
