from fastapi.testclient import TestClient


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
