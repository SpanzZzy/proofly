"""Unit tests for website and URL static heuristic inspector."""

import pytest
from app.schemas import UrlAnalysisRequest
from app.detectors.url_analyzer import analyze_url, run_deterministic_url_rules


@pytest.mark.asyncio
async def test_punycode_homograph_attack():
    req = UrlAnalysisRequest(url="https://xn--pple-43d.com/login")
    res = await analyze_url(req)

    assert res.risk_score >= 40
    assert any("Punycode" in s.name for s in res.signals)


@pytest.mark.asyncio
async def test_ip_address_host():
    req = UrlAnalysisRequest(url="http://192.168.1.50/banking/login.php")
    res = await analyze_url(req)

    assert res.risk_score >= 40
    assert any("IP Address" in s.name for s in res.signals)


@pytest.mark.asyncio
async def test_userinfo_at_symbol_deception():
    req = UrlAnalysisRequest(url="https://google.com@phishing-server.xyz/verify")
    res = await analyze_url(req)

    assert res.risk_score >= 45
    assert any("@" in s.name or "UserInfo" in s.name for s in res.signals)


@pytest.mark.asyncio
async def test_legitimate_clean_url():
    req = UrlAnalysisRequest(url="https://proofly.dev")
    res = await analyze_url(req)

    assert res.risk_score <= 20
    assert res.risk_level == "low"
