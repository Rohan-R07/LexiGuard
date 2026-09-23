"""
Comparison API Router (Phase 1 Placeholder).

This module defines architectural boundaries for future multi-document and contract comparison endpoints.
No business logic, diffing algorithms, or mock comparison results are implemented in Phase 1.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/comparison", tags=["Comparison"])
