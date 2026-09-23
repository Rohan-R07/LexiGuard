from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage
from app.services.rag_service import rag_service
from app.services.document_service import document_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "/{document_id}",
    response_model=ChatResponse,
    summary="Ask a document-grounded question via RAG",
)
async def ask_document_question(document_id: str, request: ChatRequest) -> ChatResponse:
    """
    Ask a natural language question about an uploaded document:
    - Retrieves top relevant chunks using document-isolated vector search.
    - Synthesizes an evidence-grounded answer citing source pages.
    - Responds with 'insufficient information' notice if evidence is missing.
    - Defends against prompt injection via strict delimiters.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty.",
        )

    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )

    try:
        response = await rag_service.answer_question(document_id, request.question.strip())
        return response
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate document answer. Please try again.",
        )


@router.get(
    "/{document_id}/history",
    response_model=List[ChatMessage],
    summary="Get conversation history for a document",
)
async def get_chat_history(document_id: str) -> List[ChatMessage]:
    """Retrieve the in-memory conversation history for the current document session."""
    doc = document_service.get_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return rag_service.get_history(document_id)


@router.delete(
    "/{document_id}/history",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Clear conversation history for a document",
)
async def clear_chat_history(document_id: str):
    """Reset and clear conversation history for a document."""
    rag_service.clear_history(document_id)
    return None
