import pytest
from fastapi.testclient import TestClient
from tests.test_upload_validation import create_sample_pdf_bytes


def test_comparison_between_two_documents(client: TestClient):
    """Test comparing two distinct contracts for added, removed, and modified terms."""
    # Document A: Base contract with 30 days notice and confidentiality
    text_a = (
        "MASTER SERVICES AGREEMENT V1\n"
        "Section 1: Confidentiality shall be maintained for 3 years.\n"
        "Section 2: Termination requires thirty (30) days notice."
    )
    pdf_a = create_sample_pdf_bytes(num_pages=2, text_content=text_a)
    upload_a = client.post("/api/documents/upload", files={"file": ("msa_v1.pdf", pdf_a, "application/pdf")})
    doc_id_a = upload_a.json()["document_id"]

    # Document B: Revised contract with 60 days notice and added indemnity
    text_b = (
        "MASTER SERVICES AGREEMENT V2\n"
        "Section 1: Termination requires sixty (60) days notice.\n"
        "Section 2: Indemnification. Provider agrees to indemnify Client against all claims."
    )
    pdf_b = create_sample_pdf_bytes(num_pages=2, text_content=text_b)
    upload_b = client.post("/api/documents/upload", files={"file": ("msa_v2.pdf", pdf_b, "application/pdf")})
    doc_id_b = upload_b.json()["document_id"]

    # Compare
    payload = {"document_id_a": doc_id_a, "document_id_b": doc_id_b}
    res = client.post("/api/comparison", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["document_a_id"] == doc_id_a
    assert data["document_b_id"] == doc_id_b
    assert "msa_v1.pdf" in data["document_a_filename"]
    assert "msa_v2.pdf" in data["document_b_filename"]
    assert len(data["summary"]) > 0
    assert len(data["changes"]) > 0

    # Verify changes have valid types
    valid_types = {"added", "removed", "modified"}
    for change in data["changes"]:
        assert change["change_type"] in valid_types
        assert len(change["category"]) > 0
        assert len(change["significance_explanation"]) > 0


def test_comparison_same_document_rejected(client: TestClient):
    """Test that comparing a document to itself is rejected with 400."""
    pdf = create_sample_pdf_bytes(num_pages=1, text_content="Contract text.")
    upload = client.post("/api/documents/upload", files={"file": ("doc_same.pdf", pdf, "application/pdf")})
    doc_id = upload.json()["document_id"]

    payload = {"document_id_a": doc_id, "document_id_b": doc_id}
    res = client.post("/api/comparison", json=payload)
    assert res.status_code == 400
    assert "cannot compare a document to itself" in res.json()["detail"].lower()


def test_comparison_missing_document_returns_404(client: TestClient):
    """Test 404 when comparing non-existent document ID."""
    payload = {"document_id_a": "missing-id-1", "document_id_b": "missing-id-2"}
    res = client.post("/api/comparison", json=payload)
    assert res.status_code == 404
