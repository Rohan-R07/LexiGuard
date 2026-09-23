from typing import List, Optional, Literal
from datetime import datetime, timezone
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ComparisonRequest(BaseModel):
    """Request payload to compare two ingested legal documents."""

    document_id_a: str = Field(..., description="Base document ID (Document A)")
    document_id_b: str = Field(..., description="Target document ID to compare against (Document B)")


class DocumentChange(BaseModel):
    """A specific semantic difference identified between the two documents."""

    change_type: Literal["added", "removed", "modified"] = Field(
        ...,
        description="Type of contractual difference: 'added' in B, 'removed' from A, or 'modified' between A and B"
    )
    category: str = Field(..., description="Contractual category (e.g. Termination, Indemnity, Notice Period, Liability)")
    description: str = Field(..., description="Description of the specific contractual difference")
    document_a_page: Optional[int] = Field(None, description="Source page number in Document A (if applicable)")
    document_b_page: Optional[int] = Field(None, description="Source page number in Document B (if applicable)")
    document_a_text: Optional[str] = Field(None, description="Relevant excerpt from Document A")
    document_b_text: Optional[str] = Field(None, description="Relevant excerpt from Document B")
    significance_explanation: str = Field(..., description="Neutral explanation of why this change warrants attention")


class ComparisonResult(BaseModel):
    """Complete structured comparison report between two documents."""

    document_a_id: str = Field(..., description="Document A identifier")
    document_b_id: str = Field(..., description="Document B identifier")
    document_a_filename: str = Field(..., description="Filename of Document A")
    document_b_filename: str = Field(..., description="Filename of Document B")
    summary: str = Field(..., description="Executive plain-language summary of differences")
    changes: List[DocumentChange] = Field(default_factory=list, description="Categorized list of detected differences")
    created_at: datetime = Field(default_factory=get_utc_now, description="Comparison timestamp")
    disclaimer: str = Field(
        default="LexiGuard provides informational assistance for understanding documents and does not provide legal advice or legal representation. AI-generated information may be incomplete or incorrect. For decisions requiring legal judgment, consult a qualified legal professional.",
        description="Mandatory legal disclaimer"
    )
