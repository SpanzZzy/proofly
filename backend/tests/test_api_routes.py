"""End-to-end integration tests for FastAPI routes."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.test_payment_analyzer import generate_dummy_image_bytes


@pytest.mark.asyncio
async def test_api_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "engine" in data


@pytest.mark.asyncio
async def test_api_models():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/models")
        assert response.status_code == 200
        data = response.json()
        assert "default_model" in data


@pytest.mark.asyncio
async def test_api_analyze_message():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/analyze/message", json={
            "text": "Your Netflix account is on hold. Update payment at: http://netflix-update.xyz",
            "channel": "sms"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] >= 30
        assert "claim" in data
        assert "observations" in data
        assert "signals" in data
        assert "unknowns" in data
        assert "actions" in data


@pytest.mark.asyncio
async def test_api_analyze_url():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/analyze/url", json={
            "url": "http://paypal-verification.security-portal.xyz/signin"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["risk_score"] >= 30
        assert data["risk_level"] in ("medium", "high", "critical")


@pytest.mark.asyncio
async def test_api_analyze_phone():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/analyze/phone", json={
            "phone_number": "+91 98200 55555",
            "country_code": "IN",
            "call_description": "Claimed to be TRAI and said my mobile number would be disconnected today."
        })
        assert response.status_code == 200
        data = response.json()
        assert "metadata" in data
        assert data["metadata"]["phone_number"] == "+919820055555"


@pytest.mark.asyncio
async def test_api_analyze_payment():
    dummy_img = generate_dummy_image_bytes("PNG")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"image": ("test_receipt.png", dummy_img, "image/png")}
        response = await ac.post("/api/analyze/payment", files=files, data={"claimed_amount": "2500"})
        assert response.status_code == 200
        data = response.json()
        assert "claim" in data
        assert "actions" in data


@pytest.mark.asyncio
async def test_cors_preflight_vercel_origin():
    """Verify CORS preflight OPTIONS request explicitly allows Vercel frontend origin."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.options(
            "/api/analyze/message",
            headers={
                "Origin": "https://proofly-brown.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            }
        )
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-origin") == "https://proofly-brown.vercel.app"
        assert "access-control-allow-methods" in response.headers


def test_cors_origins_parsing(monkeypatch):
    """Verify get_cors_origins parses environment strings and JSON arrays properly."""
    from app.config import get_cors_origins, DEFAULT_CORS_ORIGINS

    # Default fallback includes Vercel
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    origins = get_cors_origins()
    assert "https://proofly-brown.vercel.app" in origins

    # Comma-separated list
    monkeypatch.setenv("CORS_ORIGINS", "https://custom-preview.vercel.app, https://test.internal/")
    origins = get_cors_origins()
    assert "https://custom-preview.vercel.app" in origins
    assert "https://test.internal" in origins
    assert "https://proofly-brown.vercel.app" in origins

    # JSON array
    monkeypatch.setenv("CORS_ORIGINS", '["https://json-frontend.vercel.app"]')
    origins = get_cors_origins()
    assert "https://json-frontend.vercel.app" in origins
    assert "https://proofly-brown.vercel.app" in origins


@pytest.mark.asyncio
async def test_message_analyzer_ollama_unavailable(monkeypatch):
    """Verify message analyzer handles Ollama unavailability gracefully via deterministic fallback."""
    from app.ai.ollama_client import ollama_client

    async def mock_generate_json_error(*args, **kwargs):
        raise ConnectionError("Ollama daemon is unreachable at 127.0.0.1:11434")

    monkeypatch.setattr(ollama_client, "generate_json", mock_generate_json_error)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/analyze/message", json={
            "text": "URGENT: Your SBI account is suspended. Click http://bit.ly/sbi-verify and submit your OTP.",
            "channel": "sms"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["model_used"] == "deterministic-rule-engine"
        assert data["risk_score"] >= 50
        assert data["risk_level"] in ("high", "critical")
        assert len(data["signals"]) > 0

