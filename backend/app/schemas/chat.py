from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SourceCitation(BaseModel):
    """Source page and chunk citation for document-grounded answers."""

    page_number: int = Field(..., description="1-indexed source page number", ge=1)
    chunk_id: str = Field(..., description="Unique chunk identifier")
    source_text: str = Field(..., description="Verbatim or condensed excerpt from the document")


class ChatRequest(BaseModel):
    """Request payload for asking questions against an ingested document."""

    question: str = Field(..., description="User question about the document", min_length=1)


class ChatResponse(BaseModel):
    """Grounded answer with citations and evidence status."""

    document_id: str = Field(..., description="ID of the queried document")
    question: str = Field(..., description="User question asked")
    answer: str = Field(..., description="Synthesized grounded answer")
    sources: List[SourceCitation] = Field(default_factory=list, description="Source citations used")
    grounded: bool = Field(default=True, description="True if evidence was found in document, False otherwise")
    created_at: datetime = Field(default_factory=get_utc_now, description="Response timestamp")


class ChatMessage(BaseModel):
    """Single message in a conversational session."""

    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")
    sources: Optional[List[SourceCitation]] = Field(default=None, description="Citations if assistant message")
    grounded: Optional[bool] = Field(default=None, description="Grounded status if assistant message")
    timestamp: datetime = Field(default_factory=get_utc_now, description="Timestamp")
