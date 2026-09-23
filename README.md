# LexiGuard — GenAI Legal Document Assistant

> **Phase 2: Core Document Intelligence Release**  
> *Legal information and document intelligence assistance, not legal advice.*

---

## 1. Project Overview

**LexiGuard** is an AI-powered legal document intelligence platform designed to empower individuals, small businesses, and non-legal professionals to understand, compare, and navigate complex contracts and agreements.

### Problem Statement
Legal agreements are often dense, opaque, and filled with difficult jargon. Non-lawyers frequently sign contracts without fully understanding their obligations, potential liabilities, hidden penalties, or critical deadlines. Furthermore, hiring legal counsel for routine document review can be prohibitively expensive.

### Solution
LexiGuard provides accessible, AI-assisted document comprehension. It translates legalese into plain language, extracts key clauses and obligations, flags potential risks and inconsistencies, and assists users in preparing targeted questions for licensed legal counsel.

---

## 2. Feature Status & Roadmap

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Secure PDF Ingestion** | File validation, size limits (25MB), signature checks, and safe ID generation. | ✅ Completed (Phase 2) |
| **Page-Aware Text Extraction** | PyMuPDF parsing preserving 1-indexed page boundaries. | ✅ Completed (Phase 2) |
| **Plain-Language Summary** | Synthesis of agreement purpose and core provisions. | ✅ Completed (Phase 2) |
| **Important Clause Identification** | Cataloging key terms (Indemnity, Termination, Governing Law) with source quotes. | ✅ Completed (Phase 2) |
| **Obligations & Deadlines Extraction** | Actionable requirements, deliverables, and notice periods linked to responsible parties. | ✅ Completed (Phase 2) |
| **Potential Issues Requiring Review** | Flagging unilateral terms, ambiguities, and uncapped liabilities with review rationales. | ✅ Completed (Phase 2) |
| **Interactive Source Page Navigation** | Clickable source page citations that jump directly into the page-by-page reader. | ✅ Completed (Phase 2) |
| **Conversational Document Q&A / RAG** | Vector embeddings, retrieval-augmented chat, and citations. | ⏳ Phase 3 |
| **Side-by-Side Contract Comparison** | Multi-document alignment, policy diffing, and redline matrices. | ⏳ Phase 3 |
| **Persistent Storage & Auth** | PostgreSQL integration, document ownership, and user authentication. | ⏳ Phase 3 |

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Navy / Slate / Indigo palette)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, jsdom

### Backend
- **Framework**: Python 3.10+, FastAPI
- **PDF Engine**: PyMuPDF (`fitz`)
- **Server**: Uvicorn (ASGI)
- **Data Validation & Settings**: Pydantic v2 & Pydantic Settings
- **AI Integration**: Gemini / OpenAI structured models with evidence-grounded fallback
- **Testing**: Pytest, HTTPX

---

## 4. Project Structure

```text
lexiguard/
│
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # Reusable UI & layout elements
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
│   ├── package.json              # Frontend scripts & dependencies
│   ├── vite.config.js            # Vite bundler configuration
│   └── vitest.config.js          # Vitest testing configuration
│
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # Endpoints (/health, /documents, /analysis, placeholders for chat & comparison)
│   │   ├── core/                 # Configuration (Pydantic settings, CORS)
│   │   ├── schemas/              # Pydantic data schemas (health, document, analysis)
│   │   ├── services/             # pdf_service, document_service, ai_service
│   │   ├── utils/                # file_validation.py
│   │   └── main.py               # FastAPI application factory
│   ├── tests/                    # test_health, test_upload_validation, test_document_service, test_analysis
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture & data flow
│   ├── SECURITY.md               # Security policy & prompt injection defenses
│   ├── TESTING.md                # Testing strategy & execution commands
│   └── QUALITY_CHECKLIST.md      # Hackathon evaluation criteria audit
│
├── .env.example                  # Template environment variables
├── .gitignore                    # Git exclusions
└── README.md                     # Project documentation
```

---

## 5. Getting Started & Setup Instructions

### Prerequisites
- Node.js (v18.0.0 or higher) & npm
- Python 3.10+ & pip

### Backend Setup

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Configure an AI provider in `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   # or
   OPENAI_API_KEY=your_openai_key_here
   ```
   *Note: If no API key is set, LexiGuard automatically activates its deterministic evidence-based extraction engine so the entire application remains fully functional and testable offline.*

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * API Documentation: `http://localhost:8000/docs`
   * Health Check: `http://localhost:8000/api/health`

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
   The application is available at `http://localhost:5173`.

---

## 6. Running Automated Tests

### Backend Tests (Pytest)
```bash
cd backend
python -m pytest -v
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 7. Legal Information & Disclaimer

> **LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation.** AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.
