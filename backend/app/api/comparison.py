from fastapi import APIRouter, HTTPException, status
from app.schemas.comparison import ComparisonRequest, ComparisonResult
from app.services.comparison_service import comparison_service

router = APIRouter(prefix="/comparison", tags=["Comparison"])


@router.post(
    "",
    response_model=ComparisonResult,
    summary="Compare two legal documents for semantic differences",
)
async def compare_documents(request: ComparisonRequest) -> ComparisonResult:
    """
    Compare two ingested legal contracts:
    - Identifies added, removed, and modified clauses.
    - Preserves source page numbers for Document A and Document B.
    - Provides neutral legal-safety explanations.
    """
    try:
        result = await comparison_service.compare_documents(
            doc_id_a=request.document_id_a,
            doc_id_b=request.document_id_b,
        )
        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compare documents. Please try again.",
        )
