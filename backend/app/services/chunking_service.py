import re
from typing import List
from pydantic import BaseModel, Field
from app.schemas.document import PageText


class DocumentChunk(BaseModel):
    """A granular chunk of document text bounded within a single page."""

    chunk_id: str = Field(..., description="Unique chunk identifier (e.g. doc-id-p1-c0)")
    document_id: str = Field(..., description="Parent document identifier")
    page_number: int = Field(..., description="1-indexed source page number", ge=1)
    text: str = Field(..., description="Normalized chunk text")
    character_offset: int = Field(default=0, description="Start character offset on the page")


class ChunkingService:
    """
    Deterministic chunking service that partitions page-aware text into
    contextually bounded segments while strictly preserving page boundaries.
    """

    def __init__(self, target_chunk_size: int = 500, chunk_overlap: int = 100):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_page(self, page: PageText, document_id: str) -> List[DocumentChunk]:
        """
        Split a single page into chunks. Chunks NEVER cross page boundaries,
        guaranteeing that any chunk citation maps to its exact page.
        """
        text = page.text.strip()
        if not text or text.startswith("[No machine-readable text"):
            return []

        # If page is short, keep as single chunk
        if len(text) <= self.target_chunk_size:
            chunk_id = f"{document_id}-p{page.page_number}-c0"
            return [
                DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    page_number=page.page_number,
                    text=text,
                    character_offset=0,
                )
            ]

        # Break page into sentences/paragraphs
        sentences = re.split(r"(?<=[.!?\n])\s+", text)
        chunks: List[DocumentChunk] = []
        current_chunk_sentences: List[str] = []
        current_length = 0
        chunk_index = 0
        current_offset = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len > self.target_chunk_size and current_chunk_sentences:
                chunk_text = " ".join(current_chunk_sentences).strip()
                chunk_id = f"{document_id}-p{page.page_number}-c{chunk_index}"
                chunks.append(
                    DocumentChunk(
                        chunk_id=chunk_id,
                        document_id=document_id,
                        page_number=page.page_number,
                        text=chunk_text,
                        character_offset=current_offset,
                    )
                )
                chunk_index += 1
                current_offset += len(chunk_text)

                # Keep overlap sentences for continuity
                overlap_length = 0
                overlap_sentences = []
                for s in reversed(current_chunk_sentences):
                    if overlap_length + len(s) <= self.chunk_overlap:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s)
                    else:
                        break
                current_chunk_sentences = overlap_sentences
                current_length = sum(len(s) for s in current_chunk_sentences)

            current_chunk_sentences.append(sentence)
            current_length += sentence_len

        # Append trailing chunk
        if current_chunk_sentences:
            chunk_text = " ".join(current_chunk_sentences).strip()
            chunk_id = f"{document_id}-p{page.page_number}-c{chunk_index}"
            chunks.append(
                DocumentChunk(
                    chunk_id=chunk_id,
                    document_id=document_id,
                    page_number=page.page_number,
                    text=chunk_text,
                    character_offset=current_offset,
                )
            )

        return chunks

    def chunk_document(self, pages: List[PageText], document_id: str) -> List[DocumentChunk]:
        """Process all pages of a document into page-traceable chunks."""
        all_chunks: List[DocumentChunk] = []
        for page in pages:
            page_chunks = self.chunk_page(page, document_id)
            all_chunks.extend(page_chunks)
        return all_chunks


chunking_service = ChunkingService()
