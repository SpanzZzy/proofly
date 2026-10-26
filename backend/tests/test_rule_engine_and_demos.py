"""Comprehensive tests for Rule-Based Scam Engine, Smart Scoring, and Predefined Demos."""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.detectors.rule_engine import run_comprehensive_rule_engine
from app.detectors.predefined_demos import PREDEFINED_DEMOS, get_predefined_demo


def test_category_a_urgency_and_pressure():
    text = "Immediate action required! Your account is blocked. Respond now within 24 hours."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 20
    assert any("Urgency" in s.name or "Deadline" in s.name or "Termination" in s.name for s in signals)
    assert any("within 24 hours" in s.evidence or "account is blocked" in s.evidence or "respond now" in s.evidence for s in signals)


def test_category_b_sensitive_info_requests():
    text = "Please verify your account and share your one-time password and netbanking password."
    score, signals, signals_obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 35
    assert any("OTP" in s.name or "Credential" in s.name for s in signals)


def test_category_c_financial_fraud():
    text = "Pay 500 Rs processing fee to release your guaranteed returns and investment doubling payout."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 30
    assert any("Advance-Fee" in s.name or "Guarantee" in s.name for s in signals)


def test_category_d_rewards_and_prizes():
    text = "Congratulations! You are the lucky draw cash prize winner. Claim your prize now."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 25
    assert any("Lottery" in s.name or "Prize" in s.name or "Reward" in s.name for s in signals)


def test_category_e_impersonation():
    text = "Official government notice from RBI and income tax department: complete your KYC update immediately."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 25
    assert any("Impersonation" in s.name or "KYC" in s.name for s in signals)


def test_category_f_phishing_links():
    text = "Click to update details: http://bit.ly/bank-auth or visit https://192.168.1.100/verify"
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 25
    assert any("Obfuscated" in s.name or "IP Address" in s.name for s in signals)


def test_category_g_threats_and_coercion():
    text = "Digital arrest warrant issued against you by police. Stay on video call or face legal action."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 40
    assert any("Digital Arrest" in s.name or "Coercion" in s.name or "Detention" in s.name for s in signals)


def test_category_h_job_and_investment_scams():
    text = "Work from home part-time job! Earn 5000 per day by liking videos on Telegram task group."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 25
    assert any("Work-From-Home" in s.name or "Telegram" in s.name or "Task" in s.name for s in signals)


def test_context_awareness_educational_negation():
    # Educational security message telling people NEVER to share OTP
    text = "Security Alert: Never share your OTP, password, or PIN with anyone claiming to be from your bank."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    # Score should be tempered down because it's protective advice, not an attack!
    assert score <= 20
    assert any("Advisory" in o or "Educational" in o for o in obs)


def test_harmless_casual_mentions_low_risk():
    text = "Hey, I sent you 200 via UPI for the movie tickets yesterday. Let me know when you receive it."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score <= 20


def test_empty_and_whitespace_input():
    text = "   \n\t  "
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score <= 10
    assert len(signals) == 0


def test_mixed_case_matching():
    text = "uRgEnT: sBi BaNk aCcOuNt bLoCkEd! sHaRe OtP nOw!"
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 75
    assert any("OTP" in s.name for s in signals)
    assert any("Urgency" in s.name or "Termination" in s.name for s in signals)


def test_compound_risk_escalation():
    # Urgency + Credentials + Link
    text = "FINAL WARNING: Your account is suspended. Click http://bit.ly/unblock-now and submit your OTP."
    score, signals, obs, actions, unknowns, claim, summary = run_comprehensive_rule_engine(text)
    assert score >= 85
    assert any("Compound pattern detected" in o for o in obs)


def test_all_16_predefined_demos_exist():
    expected_demo_ids = [
        "msg_sbi_kyc", "msg_wfh_task", "msg_legit_personal",
        "web_punycode_apple", "web_ip_host", "web_userinfo_at", "web_legit_proofly",
        "email_ceo_wire", "email_storage_quota",
        "phone_digital_arrest", "phone_anydesk_remote", "phone_telemarketing",
        "payment_upi_pending", "payment_missing_utr",
        "image_discount_ad", "image_bogus_rbi_subsidy"
    ]
    assert len(PREDEFINED_DEMOS) == 16
    for demo_id in expected_demo_ids:
        demo = get_predefined_demo(demo_id)
        assert demo is not None
        assert demo.risk_score >= 0 and demo.risk_score <= 100
        assert demo.risk_level in ("low", "medium", "high", "critical")
        assert len(demo.claim) > 0
        assert len(demo.actions) > 0
        assert len(demo.unknowns) > 0
        assert demo.model_used == "demo-predefined"


@pytest.mark.asyncio
async def test_api_demo_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test valid demo ID
        response = await ac.get("/api/demo/msg_sbi_kyc")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Critical Risk Banking Phishing & Credential Harvest"
        assert data["risk_score"] == 95
        assert data["model_used"] == "demo-predefined"

        # Test non-existent demo ID
        response_404 = await ac.get("/api/demo/non_existent_demo_123")
        assert response_404.status_code == 404
