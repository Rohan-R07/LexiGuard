from fastapi import APIRouter, HTTPException, status
from app.schemas.analysis import AnalysisResponse
from app.services.document_service import document_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post(
    "/{document_id}",
    response_model=AnalysisResponse,
    summary="Trigger and retrieve structured AI analysis for a document",
)
async def analyze_document(document_id: str) -> AnalysisResponse:
    """
    Generate or retrieve structured AI analysis for an ingested legal document:
    - Verifies document presence.
    - Uses page-aware text representations.
    - Extracts plain-language summary, key clauses, obligations, deadlines, and potential issues requiring review.
    - Caches analysis result on the document entity.
    """
    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    # Return cached analysis if already generated
    cached_analysis = document_service.get_analysis(document_id)
    if cached_analysis:
        return cached_analysis

    try:
        analysis = await ai_service.analyze_document(doc.pages, document_id)
        document_service.save_analysis(document_id, analysis)
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        # Prevent stack trace leakage to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate document analysis. Please try again later.",
        )


@router.get(
    "/{document_id}",
    response_model=AnalysisResponse,
    summary="Get existing analysis for a document",
)
async def get_document_analysis(document_id: str) -> AnalysisResponse:
    """Retrieve existing analysis for a document without re-triggering AI processing."""
    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    analysis = document_service.get_analysis(document_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis has not yet been generated for this document. Use POST /api/analysis/{document_id} to generate it.",
        )
    return analysis
