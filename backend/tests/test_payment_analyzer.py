"""Unit tests for Payment Proof Lab and Image Evidence Inspector."""

import io
import pytest
from PIL import Image
from app.detectors.payment_analyzer import analyze_payment
from app.detectors.image_analyzer import analyze_image


def generate_dummy_image_bytes(format="PNG") -> bytes:
    """Generates an in-memory valid test image."""
    img = Image.new("RGB", (400, 600), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


@pytest.mark.asyncio
async def test_payment_proof_analysis():
    img_bytes = generate_dummy_image_bytes("PNG")
    res = await analyze_payment(
        image_bytes=img_bytes,
        claimed_amount="5000",
        currency="INR",
        transaction_notes="Customer sent Google Pay screenshot"
    )

    assert res.risk_score >= 30  # Baseline uncertainty for screenshots
    assert len(res.observations) > 0
    assert any("bank or UPI" in a.lower() or "statement" in a.lower() for a in res.actions)
    assert any("not proof" in u.lower() or "generator" in u.lower() for u in res.unknowns)


@pytest.mark.asyncio
async def test_image_inspector_analysis():
    img_bytes = generate_dummy_image_bytes("JPEG")
    res = await analyze_image(
        image_bytes=img_bytes,
        context_description="Ad claiming 90% discount on iPhone 16 Pro if booked in 10 minutes"
    )

    assert res.risk_score >= 20
    assert len(res.observations) > 0
    assert any("reverse image search" in a.lower() or "verify" in a.lower() for a in res.actions)
