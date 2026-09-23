import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """
    Ensure automated tests run deterministically with mock/offline NLP
    as required (no real API requests or token expenditure in tests).
    """
    original_provider = settings.LLM_PROVIDER
    settings.LLM_PROVIDER = "mock"
    yield
    settings.LLM_PROVIDER = original_provider


@pytest.fixture(scope="module")
def client() -> TestClient:
    """Fixture providing a test client for FastAPI."""
    with TestClient(app) as test_client:
        yield test_client
