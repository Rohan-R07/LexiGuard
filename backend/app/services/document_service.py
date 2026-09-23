import uuid
from typing import Dict, List, Optional
from datetime import datetime, timezone
from app.schemas.document import DocumentDetail, DocumentSummaryItem, PageText
from app.schemas.analysis import AnalysisResponse


class StoredDocument:
    """In-memory document storage entity for Phase 2 lifecycle."""

    def __init__(
        self,
        doc_id: str,
        filename: str,
        size_bytes: int,
        pages: List[PageText],
        created_at: Optional[datetime] = None,
    ):
        self.id = doc_id
        self.filename = filename
        self.size_bytes = size_bytes
        self.pages = pages
        self.page_count = len(pages)
        self.status = "processed"
        self.created_at = created_at or datetime.now(timezone.utc)
        self.analysis: Optional[AnalysisResponse] = None

    def to_summary(self) -> DocumentSummaryItem:
        return DocumentSummaryItem(
            id=self.id,
            filename=self.filename,
            page_count=self.page_count,
            size_bytes=self.size_bytes,
            status=self.status,
            has_analysis=self.analysis is not None,
            created_at=self.created_at,
        )

    def to_detail(self) -> DocumentDetail:
        return DocumentDetail(
            id=self.id,
            filename=self.filename,
            page_count=self.page_count,
            size_bytes=self.size_bytes,
            status=self.status,
            has_analysis=self.analysis is not None,
            created_at=self.created_at,
            pages=self.pages,
        )


class DocumentService:
    """
    Service managing document lifecycle and retrieval during Phase 2.
    NOTE: In Phase 2, documents are stored in a controlled in-memory repository.
    This abstraction decouples endpoints from storage mechanisms and can be replaced
    with PostgreSQL/Object Storage in Phase 3.
    """

    def __init__(self):
        self._documents: Dict[str, StoredDocument] = {}

    def create_document(self, filename: str, size_bytes: int, pages: List[PageText]) -> StoredDocument:
        doc_id = str(uuid.uuid4())
        stored_doc = StoredDocument(
            doc_id=doc_id,
            filename=filename,
            size_bytes=size_bytes,
            pages=pages,
        )
        self._documents[doc_id] = stored_doc
        return stored_doc

    def get_document(self, doc_id: str) -> Optional[StoredDocument]:
        return self._documents.get(doc_id)

    def list_documents(self) -> List[DocumentSummaryItem]:
        sorted_docs = sorted(self._documents.values(), key=lambda d: d.created_at, reverse=True)
        return [doc.to_summary() for doc in sorted_docs]

    def delete_document(self, doc_id: str) -> bool:
        if doc_id in self._documents:
            del self._documents[doc_id]
            return True
        return False

    def save_analysis(self, doc_id: str, analysis: AnalysisResponse) -> None:
        if doc_id in self._documents:
            self._documents[doc_id].analysis = analysis

    def get_analysis(self, doc_id: str) -> Optional[AnalysisResponse]:
        doc = self.get_document(doc_id)
        return doc.analysis if doc else None

    def clear(self) -> None:
        """Clear all stored documents (useful for test resets)."""
        self._documents.clear()


document_service = DocumentService()
