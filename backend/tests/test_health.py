import pytest
from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
import httpx
from app.core.config import settings


def test_health_endpoint(client: TestClient):
    """
    Test GET /api/health endpoint.
    Verifies:
    1. HTTP status code is 200.
    2. Response contains {"status": "ok", "service": "lexiguard-api"}.
    """
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "lexiguard-api"


def test_ai_health_endpoint_connected(client: TestClient):
    """Test GET /api/health/ai returns connected when mock OpenRouter request succeeds."""
    mock_resp = httpx.Response(200, json={"choices": [{"message": {"content": "OK"}}]})
    orig_provider = settings.LLM_PROVIDER
    orig_key = settings.OPENROUTER_API_KEY
    try:
        settings.LLM_PROVIDER = "openrouter"
        settings.OPENROUTER_API_KEY = "test-mock-key"
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_resp
            response = client.get("/api/health/ai")
            assert response.status_code == 200
            data = response.json()
            assert data["provider"] == "openrouter"
            assert data["configured"] is True
            assert data["status"] == "connected"
    finally:
        settings.LLM_PROVIDER = orig_provider
        settings.OPENROUTER_API_KEY = orig_key


def test_ai_health_endpoint_invalid_credentials_401(client: TestClient):
    """Test GET /api/health/ai safely maps 401 response without leaking key."""
    mock_resp = httpx.Response(401, json={"error": {"message": "Invalid API key"}})
    orig_provider = settings.LLM_PROVIDER
    orig_key = settings.OPENROUTER_API_KEY
    try:
        settings.LLM_PROVIDER = "openrouter"
        settings.OPENROUTER_API_KEY = "test-mock-key"
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_resp
            response = client.get("/api/health/ai")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "invalid_credentials"
            assert "key" not in data
            assert "authorization" not in str(data).lower()
    finally:
        settings.LLM_PROVIDER = orig_provider
        settings.OPENROUTER_API_KEY = orig_key


def test_ai_health_endpoint_rate_limited_429(client: TestClient):
    """Test GET /api/health/ai safely maps 429 rate limit."""
    mock_resp = httpx.Response(429, json={"error": {"message": "Rate limit reached"}})
    orig_provider = settings.LLM_PROVIDER
    orig_key = settings.OPENROUTER_API_KEY
    try:
        settings.LLM_PROVIDER = "openrouter"
        settings.OPENROUTER_API_KEY = "test-mock-key"
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_resp
            response = client.get("/api/health/ai")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "rate_limited"
    finally:
        settings.LLM_PROVIDER = orig_provider
        settings.OPENROUTER_API_KEY = orig_key
