"""Unit tests for Caller Intelligence module."""

import pytest
from app.schemas import PhoneAnalysisRequest
from app.detectors.phone_analyzer import analyze_phone, parse_phone_metadata


@pytest.mark.asyncio
async def test_phone_number_only_without_call_desc():
    # When user only provides a phone number, scam status must NOT be falsely claimed
    req = PhoneAnalysisRequest(phone_number="+91 98200 12345", country_code="IN")
    res = await analyze_phone(req)

    assert res.risk_score <= 25
    assert res.risk_level == "low"
    assert any("CANNOT BE DETERMINED" in u for u in res.unknowns)


@pytest.mark.asyncio
async def test_digital_arrest_scam_call():
    call_transcript = "Caller stated they were Mumbai Police Cyber Crime Cell and CBI. They said my Aadhaar was found in an illegal parcel with narcotics and money laundering. They demanded I stay on video call for digital arrest and not disconnect."
    req = PhoneAnalysisRequest(
        phone_number="+91 98200 12345",
        country_code="IN",
        claimed_org="Mumbai Police CBI",
        call_description=call_transcript
    )
    res = await analyze_phone(req)

    assert res.risk_score >= 50
    assert any("Digital Arrest" in s.name or "Police" in s.name for s in res.signals)
    assert any("spoofed" in u.lower() for u in res.unknowns)


@pytest.mark.asyncio
async def test_remote_access_anydesk_call():
    call_transcript = "Caller claimed to be HDFC bank manager. They asked me to install AnyDesk app immediately to unblock my debit card."
    req = PhoneAnalysisRequest(
        phone_number="+91 22 2850 1234",
        country_code="IN",
        claimed_org="HDFC Bank",
        call_description=call_transcript
    )
    res = await analyze_phone(req)

    assert res.risk_score >= 50
    assert any("Remote Desktop" in s.name or "Screen" in s.name for s in res.signals)
