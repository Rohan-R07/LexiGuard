from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="API Health Check")
async def get_health() -> HealthResponse:
    """Return the health status of the LexiGuard API."""
    return HealthResponse(status="ok", service="lexiguard-api")
