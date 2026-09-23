import math
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from app.services.chunking_service import DocumentChunk


class VectorRecord(BaseModel):
    """Vector entry storing text, metadata, and embedding vector."""

    chunk: DocumentChunk
    embedding: List[float]


class ScoredChunk(BaseModel):
    """Retrieved chunk paired with its cosine similarity score."""

    chunk: DocumentChunk
    similarity_score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")


class VectorStore:
    """
    In-memory vector store with strict document isolation.
    Guarantees that vector search on a document only searches chunks belonging
    to that document.
    """

    def __init__(self):
        # Keyed by document_id -> List[VectorRecord]
        self._store: Dict[str, List[VectorRecord]] = {}

    def add_document_chunks(
        self,
        document_id: str,
        chunks: List[DocumentChunk],
        embeddings: List[List[float]],
    ) -> None:
        """Store chunk records and embedding vectors for a specific document."""
        if len(chunks) != len(embeddings):
            raise ValueError("Chunks and embeddings lists must be of identical length.")

        records = [
            VectorRecord(chunk=chunk, embedding=emb)
            for chunk, emb in zip(chunks, embeddings)
        ]
        self._store[document_id] = records

    def has_document(self, document_id: str) -> bool:
        """Check if document has been indexed in vector store."""
        return document_id in self._store and len(self._store[document_id]) > 0

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Calculate cosine similarity between two numeric vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))

        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0

        return max(0.0, min(1.0, dot_product / (norm_a * norm_b)))

    def search(
        self,
        query_embedding: List[float],
        document_id: str,
        top_k: int = 4,
        min_similarity: float = 0.05,
    ) -> List[ScoredChunk]:
        """
        Retrieve top-k most similar chunks for a query embedding.
        STRICT DOCUMENT ISOLATION: Searches exclusively within `document_id`.
        """
        records = self._store.get(document_id, [])
        if not records:
            return []

        scored_results: List[ScoredChunk] = []
        for record in records:
            score = self._cosine_similarity(query_embedding, record.embedding)
            if score >= min_similarity:
                scored_results.append(ScoredChunk(chunk=record.chunk, similarity_score=score))

        # Sort descending by similarity score
        scored_results.sort(key=lambda item: item.similarity_score, reverse=True)
        return scored_results[:top_k]

    def remove_document(self, document_id: str) -> bool:
        """Remove document index from vector store."""
        if document_id in self._store:
            del self._store[document_id]
            return True
        return False

    def clear(self) -> None:
        """Clear entire vector store."""
        self._store.clear()


vector_store = VectorStore()
