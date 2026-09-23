import pytest
from fastapi.testclient import TestClient
from tests.test_upload_validation import create_sample_pdf_bytes


def test_document_listing_and_retrieval(client: TestClient):
    """Test listing documents and fetching detail with page-by-page text."""
    # 1. Upload a 2-page PDF
    pdf_bytes = create_sample_pdf_bytes(num_pages=2, text_content="Contract for legal services.")
    files = {"file": ("master_agreement.pdf", pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["document_id"]

    # 2. List documents
    list_res = client.get("/api/documents")
    assert list_res.status_code == 200
    docs = list_res.json()
    assert len(docs) >= 1
    matching_doc = next((d for d in docs if d["id"] == doc_id), None)
    assert matching_doc is not None
    assert matching_doc["filename"] == "master_agreement.pdf"
    assert matching_doc["page_count"] == 2

    # 3. Retrieve specific document detail
    detail_res = client.get(f"/api/documents/{doc_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == doc_id
    assert len(detail["pages"]) == 2
    assert detail["pages"][0]["page_number"] == 1
    assert "Page 1 Content" in detail["pages"][0]["text"]
    assert detail["pages"][1]["page_number"] == 2
    assert "Page 2 Content" in detail["pages"][1]["text"]

    # 4. Retrieve pages endpoint
    pages_res = client.get(f"/api/documents/{doc_id}/pages")
    assert pages_res.status_code == 200
    pages = pages_res.json()
    assert len(pages) == 2
    assert pages[0]["page_number"] == 1


def test_nonexistent_document_returns_404(client: TestClient):
    """Test that querying a non-existent document ID returns a clean 404."""
    response = client.get("/api/documents/non-existent-uuid-12345")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

    pages_response = client.get("/api/documents/non-existent-uuid-12345/pages")
    assert pages_response.status_code == 404
