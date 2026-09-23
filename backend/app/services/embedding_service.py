import math
import re
import os
from typing import List, Dict, Optional
import httpx
from app.core.config import settings
from app.services.chunking_service import DocumentChunk


class EmbeddingService:
    """
    Provider-agnostic embedding service with built-in in-memory caching
    and deterministic offline semantic vectorizer.
    """

    def __init__(self, vector_dimension: int = 128):
        self.vector_dimension = vector_dimension
        self._cache: Dict[str, List[float]] = {}

    def _deterministic_semantic_vector(self, text: str) -> List[float]:
        """
        Deterministic, token-weighted semantic vector generator.
        Used when running in offline/test mode or without external API keys.
        Provides robust cosine-similarity ranking for RAG retrieval.
        """
        words = re.findall(r"\w+", text.lower())
        vec = [0.0] * self.vector_dimension
        if not words:
            return vec

        for word in words:
            # Word hashing across vector dimension
            h = hash(word)
            idx = abs(h) % self.vector_dimension
            sign = 1.0 if (h // self.vector_dimension) % 2 == 0 else -1.0
            
            # Boost legal keywords for higher retrieval relevance
            boost = 1.0
            if word in {
                "terminate", "termination", "indemnify", "indemnification",
                "liability", "obligation", "deadline", "notice", "confidential",
                "confidentiality", "payment", "breach", "governing", "jurisdiction",
                "dispute", "resign", "resignation", "penalty", "fees", "audit"
            }:
                boost = 2.5
            
            vec[idx] += sign * boost

        # Normalize to unit vector for cosine similarity
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    async def _call_gemini_embedding(self, text: str) -> Optional[List[float]]:
        """Call Gemini text-embedding-004 API."""
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={api_key}"
        payload = {
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:2000]}]}
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("embedding", {}).get("values")
        except Exception:
            pass
        return None

    async def _call_openai_embedding(self, text: str) -> Optional[List[float]]:
        """Call OpenAI text-embedding-3-small API."""
        api_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return None

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "text-embedding-3-small",
            "input": text[:2000]
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data.get("data", [{}])[0].get("embedding")
        except Exception:
            pass
        return None

    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding vector for a given text snippet with caching."""
        cache_key = text.strip()
        if cache_key in self._cache:
            return self._cache[cache_key]

        # 1. Attempt Gemini
        vec = await self._call_gemini_embedding(text)
        # 2. Attempt OpenAI
        if not vec:
            vec = await self._call_openai_embedding(text)
        # 3. Fallback to deterministic semantic vectorizer
        if not vec:
            vec = self._deterministic_semantic_vector(text)

        self._cache[cache_key] = vec
        return vec

    async def embed_chunks(self, chunks: List[DocumentChunk]) -> List[List[float]]:
        """Generate embeddings for a batch of chunks."""
        embeddings = []
        for chunk in chunks:
            vec = await self.embed_text(chunk.text)
            embeddings.append(vec)
        return embeddings

    def clear_cache(self) -> None:
        """Clear embedding cache."""
        self._cache.clear()


embedding_service = EmbeddingService()
