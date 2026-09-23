from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import Settings


def setup_cors(app: FastAPI, settings: Settings) -> None:
    """
    Configure strict, explicit Cross-Origin Resource Sharing (CORS) for the application.
    Avoids unrestricted wildcard origins (*).
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
