import io
import fitz
import pytest
from fastapi.testclient import TestClient
from app.core.config import settings


def create_sample_pdf_bytes(num_pages: int = 2, text_content: str = "This is legal document text.") -> bytes:
    """Helper to create valid in-memory PDF bytes with PyMuPDF."""
    doc = fitz.open()
    for i in range(num_pages):
        page = doc.new_page()
        page.insert_text((50, 72), f"Page {i + 1} Content: {text_content}\nClause: Party shall deliver notices within 30 days.")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_valid_pdf_upload_success(client: TestClient):
    """Test that a valid PDF file uploads successfully and returns expected metadata."""
    pdf_bytes = create_sample_pdf_bytes(num_pages=3)
    files = {"file": ("test_agreement.pdf", pdf_bytes, "application/pdf")}

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert "document_id" in data
    assert data["filename"] == "test_agreement.pdf"
    assert data["page_count"] == 3
    assert data["size_bytes"] == len(pdf_bytes)
    assert data["content_type"] == "application/pdf"
    assert data["status"] == "processed"


def test_non_pdf_file_rejected(client: TestClient):
    """Test that non-PDF files (e.g. .txt, .exe) are rejected with 400 Bad Request."""
    files = {"file": ("malicious_script.txt", b"plain text script content", "text/plain")}

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 400
    assert "Only PDF (.pdf) files are supported" in response.json()["detail"]


def test_pdf_with_invalid_magic_bytes_rejected(client: TestClient):
    """Test that files named .pdf but lacking '%PDF-' signature are rejected."""
    fake_pdf = b"NOT_A_REAL_PDF_HEADER_12345"
    files = {"file": ("fake.pdf", fake_pdf, "application/pdf")}

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 400
    assert "missing PDF file signature" in response.json()["detail"]


def test_empty_file_rejected(client: TestClient):
    """Test that empty uploads are rejected."""
    files = {"file": ("empty.pdf", b"", "application/pdf")}

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_oversized_file_rejected(client: TestClient, monkeypatch):
    """Test that files exceeding MAX_UPLOAD_SIZE_MB are rejected with 413 Payload Too Large."""
    # Temporarily set max size to 100 bytes for testing
    monkeypatch.setattr(settings, "MAX_UPLOAD_SIZE_MB", 1 / (1024 * 1024) * 100)

    pdf_bytes = create_sample_pdf_bytes(num_pages=1)  # standard PDF is ~1KB+
    files = {"file": ("oversized.pdf", pdf_bytes, "application/pdf")}

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 413
    assert "exceeds the maximum allowed limit" in response.json()["detail"]
