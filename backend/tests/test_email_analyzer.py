"""Unit tests for Email Forensics module."""

import pytest
from app.schemas import EmailAnalysisRequest
from app.detectors.email_analyzer import analyze_email, parse_raw_or_mime_email


@pytest.mark.asyncio
async def test_email_domain_mismatch_and_wire_fraud():
    raw_headers = """From: "CEO John Doe" <john.doe@company.com>
Reply-To: attacker-vault@offshore-mail.xyz
Subject: Urgent: Overdue invoice wire transfer
Date: Mon, 26 Oct 2026 10:00:00 +0000
Authentication-Results: spf=fail; dkim=fail
"""
    body = "Please process this overdue invoice immediately. Update the banking coordinates and send wire transfer of $45,000 before 2pm."

    req = EmailAnalysisRequest(
        sender='"CEO John Doe" <john.doe@company.com>',
        subject="Urgent: Overdue invoice wire transfer",
        raw_headers=raw_headers,
        text=body
    )
    res = await analyze_email(req)

    assert res.risk_score >= 50
    assert any("Domain Mismatch" in s.name or "Invoice" in s.name for s in res.signals)
    assert res.metadata.get("spf_status") == "Fail"


@pytest.mark.asyncio
async def test_email_dangerous_attachment():
    raw_eml = """From: "HR Team" <hr@legitcorp.com>
Subject: Your Q4 Bonus Statement
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="sep123"

--sep123
Content-Type: text/plain

Please find your quarterly bonus details attached.
--sep123
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="bonus_statement.pdf.exe"

TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAA
--sep123--
""".encode("utf-8")

    req = EmailAnalysisRequest()
    res = await analyze_email(req, raw_eml_bytes=raw_eml)

    assert res.risk_score >= 50
    assert any("Attachment" in s.name for s in res.signals)
    assert "bonus_statement.pdf.exe" in res.metadata.get("attachments", [])
