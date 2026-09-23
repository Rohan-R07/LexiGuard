from typing import List
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store, ScoredChunk
from app.services.document_service import document_service


class RetrievalService:
    """Service handling document indexing and similarity-based chunk retrieval."""

    async def ensure_document_indexed(self, document_id: str) -> bool:
        """
        Check if document is indexed in vector store; if not, chunk and embed once.
        Ensures documents are embedded only once during application lifecycle.
        """
        if vector_store.has_document(document_id):
            return True

        doc = document_service.get_document(document_id)
        if not doc or not doc.pages:
            return False

        # 1. Chunk document across page boundaries
        chunks = chunking_service.chunk_document(doc.pages, document_id)
        if not chunks:
            return False

        # 2. Generate embeddings
        embeddings = await embedding_service.embed_chunks(chunks)

        # 3. Store in vector store
        vector_store.add_document_chunks(document_id, chunks, embeddings)
        return True

    async def retrieve_relevant_chunks(
        self,
        document_id: str,
        query: str,
        top_k: int = 4,
    ) -> List[ScoredChunk]:
        """
        Retrieve top-k relevant chunks for a user question.
        Guarantees strict document isolation (filtering by document_id).
        """
        # Ensure document is embedded
        indexed = await self.ensure_document_indexed(document_id)
        if not indexed:
            return []

        # Generate query vector
        query_vector = await embedding_service.embed_text(query)

        # Vector search strictly filtered by document_id
        results = vector_store.search(
            query_embedding=query_vector,
            document_id=document_id,
            top_k=top_k,
        )
        return results


retrieval_service = RetrievalService()
