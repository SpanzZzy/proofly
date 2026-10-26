"""Message Scam Detector: Analyzes SMS, WhatsApp, social chats, and text messages."""

import re
from typing import List, Tuple
from app.config import AI_PROVIDER
from app.schemas import AnalysisResponse, SignalItem, MessageAnalysisRequest
from app.utils.helpers import get_iso_timestamp, calculate_risk_level, extract_urls_from_text
from app.ai.ollama_client import ollama_client
from app.ai.prompts import MESSAGE_ANALYSIS_PROMPT
from app.detectors.rule_engine import run_comprehensive_rule_engine, run_deterministic_message_rules


# Rule Patterns with weights
URGENCY_PATTERNS = [
    (r"\b(immediately|urgent|urgently|within 24 hours|within 12 hours|by tonight|before midnight|account.*(blocked|suspended|deactivated|closed)|final warning|last notice)\b", "Artificial Urgency Trigger", "high", "Imposes immediate pressure to bypass rational verification."),
    (r"\b(electricity.*disconnect|power.*cut|sim.*deactivate|card.*block)\b", "Imminent Service Disconnection Threat", "critical", "Falsely threatens vital service disruption to induce panic.")
]

CREDENTIAL_PATTERNS = [
    (r"\b(share.*otp|enter.*otp|send.*otp|provide.*otp|give.*otp|verification code|one time password)\b", "Direct OTP / Verification Code Solicitation", "critical", "Legitimate organizations never solicit OTPs via chat or SMS."),
    (r"\b(password|pin|cvv|netbanking password|atm pin|secret key|seed phrase)\b", "Sensitive Credential Request", "critical", "Direct request for banking PIN or secrets."),
    (r"\b(update.*kyc|complete.*kyc|pan.*link|aadhaar.*link|verify.*pan|unblock.*account)\b", "Unsolicited KYC / Account Suspension Lure", "high", "Common pretense used by credential harvesting portals.")
]

FINANCIAL_LURE_PATTERNS = [
    (r"\b(congratulations.*won|lottery|lucky draw|cash prize|jackpot|reward.*claim|won.*(\$|₹|rs|inr))\b", "Lottery or Prize Lure", "high", "Unsolicited announcement of winning an unentered contest."),
    (r"\b(part[- ]time job|work from home.*earn|earn.*(\$|₹|rs|inr).*per day|like.*video.*earn|telegram task|easy money)\b", "Daily Task / Fake Job Recruitment Fraud", "high", "Pyramid task scam targeting users to deposit funds into bogus portals."),
    (r"\b(guaranteed return|double.*investment|crypto profit|100% safe profit|zero risk)\b", "Unrealistic Financial Guarantee", "high", "High-yield investment fraud tactic.")
]

IMPERSONATION_PATTERNS = [
    (r"\b(sbi|hdfc|icici|axis bank|punjab national bank|paytm|phonepe|google pay|gpay|income tax|rbi|cbi|police|customs|trai|courier|fedex)\b", "Institutional / Brand Impersonation", "medium", "References recognized banks, government agencies, or delivery services.")
]


def run_deterministic_message_rules(text: str) -> Tuple[int, List[SignalItem], List[str], List[str]]:
    """Runs deterministic rule checks on the input message text."""
    score = 0
    signals: List[SignalItem] = []
    observations: List[str] = []
    text_lower = text.lower()

    # Length observation
    observations.append(f"Message length is {len(text)} characters.")

    # Check URLs
    urls = extract_urls_from_text(text)
    if urls:
        observations.append(f"Contains {len(urls)} embedded link(s): {', '.join(urls[:3])}")
        for u in urls:
            u_lower = u.lower()
            if any(shortener in u_lower for shortener in ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy"]):
                score += 25
                signals.append(SignalItem(
                    name="Obfuscated / Shortened URL",
                    severity="high",
                    description="Uses a link shortening service to mask the real destination domain.",
                    evidence=u
                ))
            elif any(tld in u_lower for tld in [".xyz", ".top", ".buzz", ".work", ".click", ".tk", ".ml"]):
                score += 25
                signals.append(SignalItem(
                    name="High-Risk Top-Level Domain in Link",
                    severity="high",
                    description="Link points to a generic TLD commonly associated with throwaway phishing kits.",
                    evidence=u
                ))
            else:
                score += 15
                signals.append(SignalItem(
                    name="Embedded External Action Link",
                    severity="medium",
                    description="Unsolicited message prompts user to click an external link.",
                    evidence=u
                ))

    # Evaluate pattern categories
    all_pattern_groups = [
        (CREDENTIAL_PATTERNS, 35),
        (URGENCY_PATTERNS, 25),
        (FINANCIAL_LURE_PATTERNS, 25),
        (IMPERSONATION_PATTERNS, 15)
    ]

    for patterns, weight in all_pattern_groups:
        for regex, name, severity, desc in patterns:
            match = re.search(regex, text_lower)
            if match:
                score += weight
                matched_text = match.group(0)
                signals.append(SignalItem(
                    name=name,
                    severity=severity,
                    description=desc,
                    evidence=matched_text
                ))
                break  # Don't double count within same pattern category

    # Bound score between 0 and 100
    risk_score = min(score, 100)
    
    # Generate action steps based on findings
    actions = [
        "Do not click any embedded links or call back telephone numbers provided inside the message.",
        "Never share an OTP, Netbanking password, UPI PIN, or identity documents through chat."
    ]
    if any(s.severity in ("critical", "high") for s in signals):
        actions.append("Verify your real account status by independently opening your official banking application or website.")
        actions.append("Report this number/sender directly in your messaging app and to cybercrime authorities (e.g. 1930 / cybercrime.gov.in in India).")

    unknowns = [
        "Cannot verify the true identity of the sender without carrier-level telecom routing inspection.",
        "Cannot determine whether your phone number was obtained from a public data breach or random dialer."
    ]

    return risk_score, signals, observations, actions, unknowns


async def analyze_message(req: MessageAnalysisRequest) -> AnalysisResponse:
    """Analyzes a suspicious text/message with rule engine and Gemma 4 AI synthesis."""
    text = req.text.strip()
    channel = req.channel or "other"

    # 1. Comprehensive Rule-Based Heuristic Analysis
    risk_score, signals, observations, actions, unknowns, claim, summary = run_comprehensive_rule_engine(
        text, channel=channel
    )
    ai_analysis = None
    model_used = "deterministic-rule-engine"

    # 2. Enhance with Gemma 4 if active in AI_PROVIDER mode
    if AI_PROVIDER == "ollama":
        try:
            formatted_prompt = MESSAGE_ANALYSIS_PROMPT.format(channel=channel, text=text)
            ai_result = await ollama_client.generate_json(formatted_prompt)

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
                if ai_result.get("unknowns") and isinstance(ai_result["unknowns"], list):
                    for unk in ai_result["unknowns"]:
                        if unk not in unknowns:
                            unknowns.append(unk)
                if ai_result.get("actions") and isinstance(ai_result["actions"], list):
                    for act in ai_result["actions"]:
                        if act not in actions:
                            actions.insert(0, act)
                if ai_result.get("warning_signs") and isinstance(ai_result["warning_signs"], list):
                    for ws in ai_result["warning_signs"]:
                        if isinstance(ws, dict) and ws.get("name"):
                            if not any(s.name.lower() == ws["name"].lower() for s in signals):
                                signals.append(SignalItem(
                                    name=ws["name"],
                                    severity=ws.get("severity", "medium"),
                                    description=ws.get("description", "Identified by Gemma 4 forensic analysis."),
                                    evidence=ws.get("evidence")
                                ))
                                risk_score = min(risk_score + 10, 100)
        except Exception:
            # Fallback cleanly to rules without crashing
            pass


    # Ensure risk score matches signals if rules found critical flags
    if any(s.severity == "critical" for s in signals):
        risk_score = max(risk_score, 75)
    elif any(s.severity == "high" for s in signals):
        risk_score = max(risk_score, 50)
    elif len(signals) == 0:
        risk_score = min(risk_score, 15)
        claim = "No active scam signals or manipulation patterns were identified in the submitted text."
        summary = "No prominent phishing or social engineering patterns detected."

    risk_level = calculate_risk_level(risk_score)
    title = f"{risk_level.capitalize()} Risk Message Detected" if risk_score >= 50 else ("Moderate Caution Warranted" if risk_score >= 25 else "Low Risk Content")

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
        metadata={"channel": channel, "char_count": len(text), "url_count": len(extract_urls_from_text(text))},
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
