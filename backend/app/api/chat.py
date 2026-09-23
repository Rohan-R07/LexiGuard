"""
Chat API Router (Phase 1 Placeholder).

This module defines architectural boundaries for future conversational document Q&A and RAG endpoints.
No business logic, mock responses, or conversational loops are implemented in Phase 1.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["Chat"])
