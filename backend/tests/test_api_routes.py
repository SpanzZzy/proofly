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
