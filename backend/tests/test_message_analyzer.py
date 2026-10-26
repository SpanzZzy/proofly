"""Unit tests for message scam detector."""

import pytest
from app.schemas import MessageAnalysisRequest
from app.detectors.message_analyzer import analyze_message, run_deterministic_message_rules


@pytest.mark.asyncio
async def test_phishing_bank_message():
    text = "Dear customer, your SBI account will be blocked within 24 hours. Click here to verify pan card: http://bit.ly/sbi-verify and share OTP."
    req = MessageAnalysisRequest(text=text, channel="sms")
    res = await analyze_message(req)

    assert res.risk_score >= 50
    assert res.risk_level in ("high", "critical")
    assert any("OTP" in s.name or "Urgency" in s.name or "Brand" in s.name for s in res.signals)
    assert len(res.observations) > 0
    assert len(res.actions) > 0
    assert len(res.unknowns) > 0
    assert res.claim != ""


@pytest.mark.asyncio
async def test_legitimate_casual_message():
    text = "Hey Dad, I reached Pune safely. Meeting friends for lunch near FC Road at 1pm."
    req = MessageAnalysisRequest(text=text, channel="whatsapp")
    res = await analyze_message(req)

    assert res.risk_score <= 25
    assert res.risk_level == "low"
    assert not any(s.severity in ("critical", "high") for s in res.signals)


@pytest.mark.asyncio
async def test_fake_job_recruitment_message():
    text = "Part-time job offer! Work from home and earn Rs 3000 to 8000 daily by liking YouTube videos. Join our Telegram task group today!"
    req = MessageAnalysisRequest(text=text, channel="sms")
    res = await analyze_message(req)

    assert res.risk_score >= 25
    assert any("Job" in s.name or "Task" in s.name or "Financial" in s.name for s in res.signals)
