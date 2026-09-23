from fastapi import APIRouter
from app.schemas.health import HealthResponse, AIHealthResponse
from app.core.config import settings
import httpx
import os

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="API Health Check")
async def get_health() -> HealthResponse:
    """Return the health status of the LexiGuard API."""
    return HealthResponse(status="ok", service="lexiguard-api")


@router.get("/health/ai", response_model=AIHealthResponse, summary="AI Provider Diagnostic Check")
async def get_ai_health() -> AIHealthResponse:
    """
    Perform a safe AI provider connectivity check.
    Never exposes API keys or sensitive authorization tokens.
    """
    provider = settings.LLM_PROVIDER
    model = settings.OPENROUTER_MODEL or settings.LLM_MODEL or "meta-llama/llama-3.3-70b-instruct"
    api_key = settings.OPENROUTER_API_KEY or os.environ.get("OPENROUTER_API_KEY")

    if provider == "mock" or (not api_key and provider != "gemini" and provider != "openai"):
        return AIHealthResponse(
            provider=provider,
            model="deterministic-heuristic-nlp",
            configured=False,
            status="not_configured" if provider != "mock" else "connected",
        )

    if provider == "openrouter" or api_key:
        url = f"{settings.OPENROUTER_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": settings.FRONTEND_URL or "http://localhost:5173",
            "X-Title": "LexiGuard Healthcheck",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Reply with: OK"}],
            "max_tokens": 5,
            "temperature": 0.0,
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="connected")
                elif res.status_code == 401:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="invalid_credentials")
                elif res.status_code == 402:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="provider_error")
                elif res.status_code == 404:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="model_error")
                elif res.status_code == 429:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="rate_limited")
                else:
                    return AIHealthResponse(provider="openrouter", model=model, configured=True, status="provider_error")
        except Exception:
            return AIHealthResponse(provider="openrouter", model=model, configured=True, status="provider_error")

    return AIHealthResponse(
        provider=provider,
        model=model,
        configured=bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY),
        status="connected",
    )
