from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentSummaryItem,
    DocumentDetail,
    PageText,
)
from app.utils.file_validation import validate_pdf_upload, sanitize_filename
from app.services.pdf_service import pdf_service
from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and ingest a legal PDF document",
)
async def upload_document(file: UploadFile = File(...)) -> DocumentUploadResponse:
    """
    Securely upload and parse a PDF legal document:
    - Validates file size, MIME type, and PDF magic signature.
    - Sanitizes filename and generates a safe internal UUID.
    - Extracts text page-by-page preserving page numbers.
    - Returns structured metadata (does not dump full text).
    """
    # 1. Validate file stream & security constraints
    pdf_bytes = await validate_pdf_upload(file)
    safe_name = sanitize_filename(file.filename)

    # 2. Extract text page-by-page using PyMuPDF
    pages = pdf_service.extract_pages(pdf_bytes)

    # 3. Store in document service repository
    stored_doc = document_service.create_document(
        filename=safe_name,
        size_bytes=len(pdf_bytes),
        pages=pages,
    )

    return DocumentUploadResponse(
        document_id=stored_doc.id,
        filename=stored_doc.filename,
        page_count=stored_doc.page_count,
        size_bytes=stored_doc.size_bytes,
        content_type="application/pdf",
        status=stored_doc.status,
        created_at=stored_doc.created_at,
    )


@router.get(
    "",
    response_model=List[DocumentSummaryItem],
    summary="List all uploaded documents",
)
async def list_documents() -> List[DocumentSummaryItem]:
    """Retrieve metadata summaries of all currently ingested documents."""
    return document_service.list_documents()


@router.get(
    "/{document_id}",
    response_model=DocumentDetail,
    summary="Get document details including page count and metadata",
)
async def get_document(document_id: str) -> DocumentDetail:
    """Retrieve specific document detail by ID."""
    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return doc.to_detail()


@router.get(
    "/{document_id}/pages",
    response_model=List[PageText],
    summary="Get extracted text by page for a document",
)
async def get_document_pages(document_id: str) -> List[PageText]:
    """Retrieve page-by-page extracted text for a specific document."""
    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return doc.pages
