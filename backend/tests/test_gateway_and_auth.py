"""Tests for Proofly Authenticated AI Gateway and Bearer Token Security."""

import os
import json
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock

# Ensure test token is set before importing gateway
os.environ["OLLAMA_GATEWAY_TOKEN"] = "test-secret-gateway-token-12345"
from gateway.gateway import app as gateway_app, EXPECTED_TOKEN
from app.ai.ollama_client import OllamaClient


@pytest.mark.asyncio
async def test_gateway_unauthorized_missing_token():
    """Requests without an Authorization header must be rejected with 401."""
    async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
        response = await client.get("/api/tags")
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "Unauthorized" in data["error"]


@pytest.mark.asyncio
async def test_gateway_unauthorized_invalid_token():
    """Requests with an invalid Bearer token must be rejected with 401."""
    async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
        response = await client.get("/api/tags", headers={"Authorization": "Bearer wrong-token-xyz"})
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "Unauthorized" in data["error"]


@pytest.mark.asyncio
async def test_gateway_blocked_management_endpoints():
    """All Ollama model management endpoints (pull, delete, create, copy, push) must return 403."""
    valid_headers = {"Authorization": f"Bearer {EXPECTED_TOKEN}"}
    blocked_endpoints = [
        ("POST", "/api/pull"),
        ("DELETE", "/api/delete"),
        ("POST", "/api/create"),
        ("POST", "/api/copy"),
        ("POST", "/api/push"),
        ("POST", "/api/embed"),
        ("POST", "/api/blobs/test")
    ]

    async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
        for method, endpoint in blocked_endpoints:
            if method == "POST":
                res = await client.post(endpoint, json={"name": "malicious"}, headers=valid_headers)
            elif method == "DELETE":
                res = await client.delete(endpoint, headers=valid_headers)
            assert res.status_code == 403, f"Endpoint {endpoint} was not blocked!"
            assert "Forbidden" in res.json()["error"]


@pytest.mark.asyncio
async def test_gateway_oversized_payload_rejection():
    """Requests with payloads exceeding size limits must return 413."""
    valid_headers = {
        "Authorization": f"Bearer {EXPECTED_TOKEN}",
        "Content-Length": str(15 * 1024 * 1024)  # 15 MB
    }
    async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
        res = await client.post("/api/generate", content=b"x" * 100, headers=valid_headers)
        assert res.status_code == 413
        assert "exceeds" in res.json()["error"]


@pytest.mark.asyncio
async def test_gateway_health_endpoint():
    """The /health endpoint returns gateway status and reports authentication check."""
    async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert data["service"] == "proofly-ai-gateway"
        assert data["authenticated"] is False

        # With valid token:
        res_auth = await client.get("/health", headers={"Authorization": f"Bearer {EXPECTED_TOKEN}"})
        assert res_auth.status_code == 200
        assert res_auth.json()["authenticated"] is True


@pytest.mark.asyncio
async def test_backend_ollama_client_token_headers():
    """Verify OllamaClient correctly applies Bearer token when configured."""
    client_with_token = OllamaClient(
        base_url="https://tunnel.trycloudflare.com",
        model="gemma4",
        token="my-secure-token"
    )
    headers = client_with_token._get_headers()
    assert headers["Authorization"] == "Bearer my-secure-token"
    assert headers["Content-Type"] == "application/json"

    client_without_token = OllamaClient(
        base_url="http://127.0.0.1:11434",
        model="gemma4:e2b",
        token=""
    )
    headers_no_token = client_without_token._get_headers()
    assert "Authorization" not in headers_no_token


@pytest.mark.asyncio
async def test_gateway_proxy_tags_success():
    """Authorized /api/tags proxies successfully to mock Ollama response."""
    import httpx
    mock_tags_response = {
        "models": [
            {"name": "gemma4:e2b", "size": 7500000000}
        ]
    }

    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps(mock_tags_response).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with patch("gateway.gateway.httpx.AsyncClient") as mock_client_cls:
        mock_instance = AsyncMock()
        mock_instance.get.return_value = mock_resp
        mock_instance.__aenter__.return_value = mock_instance
        mock_client_cls.return_value = mock_instance

        valid_headers = {"Authorization": f"Bearer {EXPECTED_TOKEN}"}
        async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
            res = await client.get("/api/tags", headers=valid_headers)
            assert res.status_code == 200
            data = res.json()
            assert len(data["models"]) == 1
            assert data["models"][0]["name"] == "gemma4:e2b"


@pytest.mark.asyncio
async def test_gateway_model_aliasing_gemma4():
    """Verify 'model': 'gemma4' is transparently rewritten to 'gemma4:e2b'."""
    import httpx
    mock_resp = httpx.Response(
        status_code=200,
        content=json.dumps({"response": '{"claim": "test"}'}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with patch("gateway.gateway.httpx.AsyncClient") as mock_client_cls:
        mock_instance = AsyncMock()
        mock_instance.post.return_value = mock_resp
        mock_instance.__aenter__.return_value = mock_instance
        mock_client_cls.return_value = mock_instance

        valid_headers = {"Authorization": f"Bearer {EXPECTED_TOKEN}"}
        async with AsyncClient(transport=ASGITransport(app=gateway_app), base_url="http://test") as client:
            res = await client.post(
                "/api/generate",
                json={"model": "gemma4", "prompt": "verify this"},
                headers=valid_headers
            )
            assert res.status_code == 200

            call_kwargs = mock_instance.post.call_args[1]
            raw_content = call_kwargs.get("content")
            assert raw_content is not None
            forwarded_payload = json.loads(raw_content)
            assert forwarded_payload["model"] == "gemma4:e2b"
