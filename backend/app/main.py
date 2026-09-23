from fastapi import FastAPI
from app.core.config import settings
from app.core.cors import setup_cors
from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.api.analysis import router as analysis_router
from app.api.chat import router as chat_router
from app.api.comparison import router as comparison_router


def create_application() -> FastAPI:
    """Application factory for LexiGuard API."""
    app = FastAPI(
        title="LexiGuard API",
        description="GenAI-powered legal document assistant backend API foundation.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS
    setup_cors(app, settings)

    # Register Routers under configured prefix
    app.include_router(health_router, prefix=settings.API_PREFIX)
    app.include_router(documents_router, prefix=settings.API_PREFIX)
    app.include_router(analysis_router, prefix=settings.API_PREFIX)
    app.include_router(chat_router, prefix=settings.API_PREFIX)
    app.include_router(comparison_router, prefix=settings.API_PREFIX)

    return app


app = create_application()
