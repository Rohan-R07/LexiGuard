import pytest
from app.schemas.document import PageText
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store
from app.services.retrieval_service import retrieval_service
from app.services.document_service import document_service


@pytest.mark.asyncio
async def test_chunking_preserves_page_numbers_and_unique_ids():
    """Verify that chunking strictly respects page boundaries and assigns unique IDs."""
    pages = [
        PageText(page_number=1, text="This is page one text. " * 30, character_count=720),
        PageText(page_number=2, text="This is page two text. " * 20, character_count=480),
    ]
    chunks = chunking_service.chunk_document(pages, "test-doc-1")

    assert len(chunks) > 0
    chunk_ids = set()

    for chunk in chunks:
        assert chunk.document_id == "test-doc-1"
        assert chunk.page_number in [1, 2]
        assert chunk.chunk_id not in chunk_ids
        chunk_ids.add(chunk.chunk_id)

    # Verify no chunk spans both page 1 and page 2
    page1_chunks = [c for c in chunks if c.page_number == 1]
    page2_chunks = [c for c in chunks if c.page_number == 2]
    assert len(page1_chunks) > 0
    assert len(page2_chunks) > 0


@pytest.mark.asyncio
async def test_vector_store_strict_document_isolation():
    """
    CRITICAL SECURITY TEST: Ensure vector store never leaks chunks between documents.
    """
    vector_store.clear()

    # Document A (Confidentiality)
    pages_a = [PageText(page_number=1, text="Confidentiality agreement protecting proprietary source code.", character_count=60)]
    chunks_a = chunking_service.chunk_document(pages_a, "doc-A")
    emb_a = await embedding_service.embed_chunks(chunks_a)
    vector_store.add_document_chunks("doc-A", chunks_a, emb_a)

    # Document B (Termination)
    pages_b = [PageText(page_number=1, text="Termination clause requiring 60 days written notice.", character_count=52)]
    chunks_b = chunking_service.chunk_document(pages_b, "doc-B")
    emb_b = await embedding_service.embed_chunks(chunks_b)
    vector_store.add_document_chunks("doc-B", chunks_b, emb_b)

    # Query doc-A for termination
    query_emb = await embedding_service.embed_text("termination notice")
    results_from_a = vector_store.search(query_emb, document_id="doc-A", top_k=5)

    # All returned chunks must belong to doc-A, NEVER doc-B
    for res in results_from_a:
        assert res.chunk.document_id == "doc-A"
        assert res.chunk.document_id != "doc-B"


@pytest.mark.asyncio
async def test_retrieval_service_top_k_ranking():
    """Test retrieval service retrieves the most relevant page chunks."""
    document_service.clear()
    vector_store.clear()

    pages = [
        PageText(page_number=1, text="General preamble and recitals.", character_count=32),
        PageText(page_number=2, text="Indemnification and liability hold harmless provision.", character_count=55),
        PageText(page_number=3, text="Resignation notice period is 30 calendar days.", character_count=46),
    ]
    doc = document_service.create_document("employee_agreement.pdf", 1024, pages)

    results = await retrieval_service.retrieve_relevant_chunks(doc.id, "How long is the resignation notice period?", top_k=2)

    assert len(results) > 0
    # Top result should be Page 3 mentioning resignation
    assert any(r.chunk.page_number == 3 for r in results)
    assert any("resignation" in r.chunk.text.lower() for r in results)
