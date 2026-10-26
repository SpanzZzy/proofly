"""Email Forensics Module: MIME parsing, domain mismatch, SPF/DKIM/DMARC checks, and threat analysis."""

import re
import email
from email import policy
from email.parser import BytesParser, Parser
from typing import List, Tuple, Dict, Any, Optional

from app.config import AI_PROVIDER
from app.schemas import AnalysisResponse, SignalItem, EmailAnalysisRequest
from app.utils.helpers import get_iso_timestamp, calculate_risk_level, extract_urls_from_text, clean_html_to_text
from app.ai.ollama_client import ollama_client
from app.ai.prompts import EMAIL_ANALYSIS_PROMPT
from app.detectors.rule_engine import run_comprehensive_rule_engine


SUSPICIOUS_ATTACHMENT_EXTENSIONS = {
    ".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".jse", ".wsf", ".ps1",
    ".iso", ".img", ".jar", ".hta", ".cpl", ".msc", ".inf", ".reg", ".dll",
    ".zip.exe", ".pdf.exe", ".docx.exe", ".xlsx.exe"
}

INVOICE_FRAUD_PATTERNS = [
    r"\b(overdue invoice|payment remittance|updated bank details|wire transfer|payment instructions|account details changed|remit payment|swift transfer|new banking coordinates)\b"
]

CREDENTIAL_HARVESTING_PATTERNS = [
    r"\b(password expiring|verify your mailbox|storage quota exceeded|re-authenticate|login credentials|unauthorized sign-in attempt|confirm your email password)\b"
]


def extract_domain(addr: str) -> str:
    """Extracts domain part from an email string."""
    if not addr:
        return ""
    # Extract email within <...>
    match = re.search(r"<([^>]+)>", addr)
    target = match.group(1) if match else addr
    if "@" in target:
        return target.split("@")[-1].strip().lower()
    return target.strip().lower()


def parse_raw_or_mime_email(raw_content: str) -> Dict[str, Any]:
    """Parses raw email string or .eml file content safely without code execution."""
    result: Dict[str, Any] = {
        "from": "",
        "from_domain": "",
        "reply_to": "",
        "reply_to_domain": "",
        "return_path": "",
        "return_path_domain": "",
        "subject": "",
        "date": "",
        "auth_results": "",
        "spf_status": "Unknown (Headers not present)",
        "dkim_status": "Unknown (Headers not present)",
        "dmarc_status": "Unknown (Headers not present)",
        "attachments": [],
        "body_text": "",
        "extracted_links": []
    }

    try:
        msg = Parser(policy=policy.default).parsestr(raw_content)
        result["from"] = msg.get("From", "")
        result["from_domain"] = extract_domain(result["from"])
        result["reply_to"] = msg.get("Reply-To", "")
        result["reply_to_domain"] = extract_domain(result["reply_to"])
        result["return_path"] = msg.get("Return-Path", "")
        result["return_path_domain"] = extract_domain(result["return_path"])
        result["subject"] = msg.get("Subject", "")
        result["date"] = msg.get("Date", "")
        result["auth_results"] = msg.get("Authentication-Results", "")

        # Extract Authentication Headers
        auth_hdr = result["auth_results"].lower()
        if "spf=" in auth_hdr or msg.get("Received-SPF"):
            spf_val = msg.get("Received-SPF", "") or auth_hdr
            if "pass" in spf_val.lower():
                result["spf_status"] = "Pass (Reported in header)"
            elif "fail" in spf_val.lower():
                result["spf_status"] = "Fail"
            elif "softfail" in spf_val.lower():
                result["spf_status"] = "Softfail"
            else:
                result["spf_status"] = "Present (Neutral/Permerror)"

        if "dkim=" in auth_hdr or msg.get("DKIM-Signature"):
            if "dkim=pass" in auth_hdr:
                result["dkim_status"] = "Pass (Reported in header)"
            elif "dkim=fail" in auth_hdr:
                result["dkim_status"] = "Fail"
            else:
                result["dkim_status"] = "Signature Present (Unverified by third party)"

        if "dmarc=" in auth_hdr:
            if "dmarc=pass" in auth_hdr:
                result["dmarc_status"] = "Pass (Reported in header)"
            elif "dmarc=fail" in auth_hdr:
                result["dmarc_status"] = "Fail"
            else:
                result["dmarc_status"] = "Present in header"

        # Extract attachments and body parts
        body_parts = []
        for part in msg.walk():
            content_type = part.get_content_type()
            disposition = part.get_content_disposition()
            filename = part.get_filename()

            if filename:
                result["attachments"].append(filename)

            if disposition == "attachment":
                if filename and filename not in result["attachments"]:
                    result["attachments"].append(filename)
                continue

            if content_type == "text/plain":
                try:
                    payload = part.get_content()
                    if isinstance(payload, str):
                        body_parts.append(payload)
                except Exception:
                    pass
            elif content_type == "text/html":
                try:
                    payload = part.get_content()
                    if isinstance(payload, str):
                        body_parts.append(clean_html_to_text(payload))
                except Exception:
                    pass

        result["body_text"] = "\n".join(body_parts).strip()
        # If body was empty, maybe plain text was pasted
        if not result["body_text"] and not msg.is_multipart():
            result["body_text"] = raw_content

    except Exception:
        # Fallback if raw text wasn't valid MIME
        result["body_text"] = raw_content

    # Extract embedded links
    all_text = f"{result['body_text']} {raw_content}"
    result["extracted_links"] = extract_urls_from_text(all_text)
    return result


def run_deterministic_email_rules(
    parsed_email: Dict[str, Any]
) -> Tuple[int, List[SignalItem], List[str], List[str], List[str]]:
    """Runs deterministic forensics on parsed email headers and content."""
    score = 0
    signals: List[SignalItem] = []
    observations: List[str] = []
    actions: List[str] = [
        "Do not click any embedded links, download attachments, or reply with sensitive information.",
        "Verify any urgent financial or security request via a known phone number or out-of-band communication."
    ]
    unknowns: List[str] = [
        "Authentication status cannot be verified from pasted text alone without raw cryptographic mail server logs.",
        "Display names can be spoofed by any sender on the internet."
    ]

    from_domain = parsed_email.get("from_domain", "")
    reply_to_domain = parsed_email.get("reply_to_domain", "")
    return_path_domain = parsed_email.get("return_path_domain", "")
    sender_raw = parsed_email.get("from", "")
    subject = parsed_email.get("subject", "")
    body = parsed_email.get("body_text", "")
    body_lower = body.lower()
    subject_lower = subject.lower()

    observations.append(f"Sender: {sender_raw or 'Not specified'}")
    if subject:
        observations.append(f"Subject: {subject}")
    observations.append(f"SPF Status: {parsed_email.get('spf_status')}")
    observations.append(f"DKIM Status: {parsed_email.get('dkim_status')}")
    observations.append(f"DMARC Status: {parsed_email.get('dmarc_status')}")

    # 1. Domain Mismatch: From vs Reply-To / Return-Path
    if from_domain and reply_to_domain and from_domain != reply_to_domain:
        score += 35
        signals.append(SignalItem(
            name="Sender Domain Mismatch (From vs Reply-To)",
            severity="critical",
            description=f"The sender claims to be from '{from_domain}', but replies are routed to a completely different domain: '{reply_to_domain}'. This is a hallmark of spear phishing and BEC (Business Email Compromise).",
            evidence=f"From: {from_domain} | Reply-To: {reply_to_domain}"
        ))

    if from_domain and return_path_domain and from_domain != return_path_domain:
        score += 25
        signals.append(SignalItem(
            name="Return-Path Domain Divergence",
            severity="high",
            description=f"The Return-Path domain '{return_path_domain}' does not align with the visible From address '{from_domain}'.",
            evidence=f"From: {from_domain} | Return-Path: {return_path_domain}"
        ))

    # 2. Display Name Spoofing
    # e.g. "PayPal Security" <support@gmail.com> or <billing@randomsite.com>
    if sender_raw:
        common_trusted = ["paypal", "microsoft", "google", "apple", "netflix", "bank", "support", "security team", "it helpdesk"]
        for brand in common_trusted:
            if brand in sender_raw.lower() and from_domain and brand not in from_domain:
                score += 35
                signals.append(SignalItem(
                    name="Display Name Deception / Brand Impersonation",
                    severity="critical",
                    description=f"The display name mentions '{brand}', but the actual mailing domain is '{from_domain}', which is not the official brand domain.",
                    evidence=sender_raw
                ))
                break

    # 3. Authentication Failures
    if "fail" in parsed_email.get("spf_status", "").lower():
        score += 30
        signals.append(SignalItem(
            name="SPF Authentication Failure",
            severity="high",
            description="The originating mail server was not authorized by the domain's SPF DNS record to send messages.",
            evidence=parsed_email.get("spf_status")
        ))
    if "fail" in parsed_email.get("dkim_status", "").lower():
        score += 30
        signals.append(SignalItem(
            name="DKIM Cryptographic Signature Failure",
            severity="high",
            description="The DKIM cryptographic signature was invalid, indicating potential tampering in transit or signature forgery.",
            evidence=parsed_email.get("dkim_status")
        ))

    # 4. Dangerous Attachments
    attachments = parsed_email.get("attachments", [])
    if attachments:
        observations.append(f"Attachments detected ({len(attachments)}): {', '.join(attachments)}")
        for att in attachments:
            att_lower = att.lower()
            if any(att_lower.endswith(ext) for ext in SUSPICIOUS_ATTACHMENT_EXTENSIONS):
                score += 50
                signals.append(SignalItem(
                    name="High-Risk Executable or Script Attachment",
                    severity="critical",
                    description=f"Attachment '{att}' contains an executable, script, or disk image extension frequently used in trojan delivery.",
                    evidence=att
                ))
                actions.insert(0, f"DO NOT open or double-click the attachment '{att}'.")

    # 5. Invoice Fraud / Payment Redirection
    for pattern in INVOICE_FRAUD_PATTERNS:
        if re.search(pattern, body_lower) or re.search(pattern, subject_lower):
            score += 30
            signals.append(SignalItem(
                name="Invoice Redirection / Wire Transfer Request",
                severity="high",
                description="Contains language requesting wire transfers or altered bank account payment coordinates, typical of CEO fraud and supplier payment diversion.",
                evidence=re.search(pattern, body_lower).group(0) if re.search(pattern, body_lower) else subject
            ))
            actions.append("Directly phone the vendor using previously established accounting contact numbers before initiating any payment.")
            break

    # 6. Credential Harvesting Signals
    for pattern in CREDENTIAL_HARVESTING_PATTERNS:
        if re.search(pattern, body_lower) or re.search(pattern, subject_lower):
            score += 30
            signals.append(SignalItem(
                name="Account Credential Harvesting Vector",
                severity="critical",
                description="Prompts the recipient to re-authenticate, update credentials, or increase mailbox storage quota.",
                evidence=re.search(pattern, body_lower).group(0) if re.search(pattern, body_lower) else subject
            ))
            break

    # 7. Phishing Links in Email Body
    links = parsed_email.get("extracted_links", [])
    if links:
        observations.append(f"Extracted {len(links)} link(s) from email body.")
        if any("bit.ly" in l.lower() or "tinyurl" in l.lower() for l in links):
            score += 20
            signals.append(SignalItem(
                name="Shortened Action Link in Email",
                severity="medium",
                description="Email employs shortened link redirectors to conceal the target destination.",
                evidence=links[0]
            ))

    risk_score = min(score, 100)
    return risk_score, signals, observations, actions, unknowns


async def analyze_email(req: EmailAnalysisRequest, raw_eml_bytes: Optional[bytes] = None) -> AnalysisResponse:
    """Forensic examination of email text, headers, and .eml file uploads."""
    # 1. Parse Email Content
    raw_content = ""
    if raw_eml_bytes:
        try:
            raw_content = raw_eml_bytes.decode("utf-8", errors="replace")
        except Exception:
            raw_content = ""
    elif req.raw_headers or req.text:
        headers_block = f"{req.raw_headers}\n\n" if req.raw_headers else ""
        from_block = f"From: {req.sender}\n" if req.sender else ""
        subj_block = f"Subject: {req.subject}\n" if req.subject else ""
        raw_content = f"{from_block}{subj_block}{headers_block}{req.text or ''}"

    parsed = parse_raw_or_mime_email(raw_content)

    # Override with explicit fields if user supplied them separately
    if req.sender and not parsed["from"]:
        parsed["from"] = req.sender
        parsed["from_domain"] = extract_domain(req.sender)
    if req.subject and not parsed["subject"]:
        parsed["subject"] = req.subject

    # 2. Run Deterministic Forensics
    risk_score, signals, observations, actions, unknowns = run_deterministic_email_rules(parsed)

    # Run comprehensive keyword/heuristic analysis on email body
    body_text = parsed.get("body_text", "")
    if body_text.strip():
        b_score, b_signals, b_obs, b_actions, b_unknowns, _, _ = run_comprehensive_rule_engine(body_text, channel="email")
        for s in b_signals:
            if not any(existing.name.lower() == s.name.lower() for existing in signals):
                signals.append(s)
        for obs in b_obs:
            if obs not in observations:
                observations.append(obs)
        for act in b_actions:
            if act not in actions:
                actions.append(act)
        risk_score = min(max(risk_score, b_score), 100)


    claim = f"The email purports to be from {parsed.get('from') or 'the sender'} regarding '{parsed.get('subject') or 'unspecified subject'}'."
    summary = f"Detected {len(signals)} forensic warning sign(s) in this email."
    ai_analysis = None
    model_used = "deterministic-rule-engine"

    # 3. Gemma 4 AI Deep Semantic Analysis
    if AI_PROVIDER == "ollama":
        try:
            headers_summary = f"From: {parsed.get('from')}, SPF: {parsed.get('spf_status')}, DKIM: {parsed.get('dkim_status')}"
            prompt = EMAIL_ANALYSIS_PROMPT.format(
                sender=parsed.get("from", "Unspecified"),
                subject=parsed.get("subject", "Unspecified"),
                headers_summary=headers_summary,
                text=parsed.get("body_text", "")[:2500]  # Cap for prompt efficiency
            )
            ai_result = await ollama_client.generate_json(prompt)

            if ai_result:
                model_used = "gemma4:e2b"
                if ai_result.get("claim"):
                    claim = ai_result["claim"]
                if ai_result.get("reasoning"):
                    ai_analysis = ai_result["reasoning"]
                    summary = ai_result["reasoning"]
                if ai_result.get("observations") and isinstance(ai_result["observations"], list):
                    for obs in ai_result["observations"]:
                        if obs not in observations:
                            observations.append(obs)
                if ai_result.get("actions") and isinstance(ai_result["actions"], list):
                    for act in ai_result["actions"]:
                        if act not in actions:
                            actions.insert(0, act)
        except Exception:
            pass


    if len(signals) == 0:
        risk_score = 10
        claim = "Email lacks prominent phishing indicators or sender mismatches in available text."
        summary = "No obvious phishing or domain spoofing patterns observed in available headers."
        title = "Email Appears Standard (Verify Context)"
    else:
        risk_level = calculate_risk_level(risk_score)
        title = f"{risk_level.capitalize()} Risk Email Detected"

    risk_level = calculate_risk_level(risk_score)

    return AnalysisResponse(
        title=title,
        risk_score=risk_score,
        risk_level=risk_level,
        summary=summary,
        claim=claim,
        observations=observations,
        signals=signals,
        unknowns=unknowns,
        actions=actions,
        metadata={
            "from": parsed.get("from"),
            "reply_to": parsed.get("reply_to"),
            "return_path": parsed.get("return_path"),
            "subject": parsed.get("subject"),
            "spf_status": parsed.get("spf_status"),
            "dkim_status": parsed.get("dkim_status"),
            "dmarc_status": parsed.get("dmarc_status"),
            "attachments": parsed.get("attachments"),
            "link_count": len(parsed.get("extracted_links", []))
        },
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
