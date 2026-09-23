from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PageText(BaseModel):
    """Extracted text of an individual document page."""

    page_number: int = Field(..., description="1-indexed page number", ge=1)
    text: str = Field(..., description="Extracted and normalized text content for this page")
    character_count: int = Field(default=0, description="Total characters on this page")


class DocumentBase(BaseModel):
    """Base document metadata."""

    filename: str = Field(..., description="Original safe filename")
    page_count: int = Field(..., description="Total pages extracted from the PDF", ge=1)
    size_bytes: int = Field(..., description="File size in bytes", ge=0)


class DocumentUploadResponse(DocumentBase):
    """Response returned upon successful document upload."""

    document_id: str = Field(..., description="Unique generated document identifier")
    content_type: str = Field(default="application/pdf", description="MIME content type")
    status: str = Field(default="processed", description="Document ingestion status")
    created_at: datetime = Field(default_factory=get_utc_now, description="Upload timestamp")


class DocumentSummaryItem(BaseModel):
    """Summary item in document list."""

    id: str = Field(..., description="Unique document identifier")
    filename: str = Field(..., description="Document filename")
    page_count: int = Field(..., description="Total number of pages")
    size_bytes: int = Field(..., description="File size in bytes")
    status: str = Field(default="processed", description="Current status")
    has_analysis: bool = Field(default=False, description="Whether analysis has been generated")
    created_at: datetime = Field(default_factory=get_utc_now, description="Upload timestamp")


class DocumentDetail(DocumentSummaryItem):
    """Detailed document representation with page structure."""

    pages: List[PageText] = Field(default_factory=list, description="Page-by-page extracted text")
