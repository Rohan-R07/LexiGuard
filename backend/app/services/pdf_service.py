import re
from typing import List
import fitz  # PyMuPDF
from fastapi import HTTPException, status
from app.schemas.document import PageText


class PDFProcessingError(Exception):
    """Raised when PDF extraction encounters unrecoverable corruption."""
    pass


class PDFService:
    """Service responsible for extracting text from PDF files with page-level granularity."""

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Clean and normalize raw extracted text:
        - Replaces multiple consecutive blank lines with double newlines
        - Replaces non-standard whitespace/tabs with spaces
        - Trims leading/trailing whitespace
        """
        if not text:
            return ""
        # Normalize tab characters and non-breaking spaces
        text = text.replace("\xa0", " ").replace("\t", "    ")
        # Collapse multiple spaces into single space on a line
        text = re.sub(r"[ \t]+", " ", text)
        # Collapse 3+ newlines into 2
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @classmethod
    def extract_pages(cls, pdf_bytes: bytes) -> List[PageText]:
        """
        Open PDF bytes safely and extract text from each page preserving 1-indexed page numbers.
        Handles empty or sparse pages gracefully.
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to open or parse the PDF document. The file may be encrypted or corrupted.",
            )

        try:
            if doc.page_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The uploaded PDF contains no pages.",
                )

            extracted_pages: List[PageText] = []

            for page_index in range(doc.page_count):
                page = doc.load_page(page_index)
                raw_text = page.get_text("text") or ""
                cleaned_text = cls.normalize_text(raw_text)

                # Fallback message for scanned/image-only pages without text in Phase 2
                if not cleaned_text:
                    cleaned_text = "[No machine-readable text detected on this page.]"

                page_number = page_index + 1
                extracted_pages.append(
                    PageText(
                        page_number=page_number,
                        text=cleaned_text,
                        character_count=len(cleaned_text),
                    )
                )

            return extracted_pages
        finally:
            doc.close()


pdf_service = PDFService()
