import re
import os
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

PDF_MAGIC_BYTES = b"%PDF-"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize the uploaded filename to prevent directory traversal and injection.
    Strips directory components and removes non-standard characters.
    """
    if not filename:
        return "document.pdf"
    
    basename = os.path.basename(filename)
    clean_name = re.sub(r"[^\w\s\.-]", "_", basename).strip()
    return clean_name if clean_name else "document.pdf"


async def validate_pdf_upload(file: UploadFile) -> bytes:
    """
    Validate an uploaded PDF file for:
    1. Presence and non-empty filename.
    2. File extension (.pdf).
    3. Declared MIME type (application/pdf).
    4. Magic byte signature (%PDF- at byte offset 0).
    5. Size within configured MAX_UPLOAD_SIZE_MB limit.

    Returns the validated file bytes.
    Raises HTTPException with clear, safe error messages on failure.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was provided for upload.",
        )

    # 1. Extension check
    filename_lower = file.filename.lower()
    if not filename_lower.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF (.pdf) files are supported.",
        )

    # 2. Content-Type check
    if file.content_type and file.content_type.lower() not in settings.ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported media type '{file.content_type}'. Expected 'application/pdf'.",
        )

    # 3. Read content and check size limit
    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE if hasattr(status, "HTTP_413_REQUEST_ENTITY_TOO_LARGE") else 413,
            detail=f"File size exceeds the maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    # 4. Check PDF magic bytes (%PDF-)
    if not content.startswith(PDF_MAGIC_BYTES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is not a valid PDF document (missing PDF file signature).",
        )

    return content
