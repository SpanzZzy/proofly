"""Comprehensive Rule-Based Scam & Phishing Detection Engine.

Provides deterministic, explainable heuristic analysis without requiring external AI or Ollama.
Covers 8 core fraud & phishing categories:
A. Urgency and Pressure
B. Sensitive Information Requests
C. Financial Fraud
D. Rewards and Prizes
E. Impersonation
F. Phishing Links
G. Threats and Coercion
H. Job and Investment Scams

Includes context awareness (negation, educational discussions) to minimize false positives.
"""

import re
from typing import List, Tuple, Dict, Any, Optional
from app.schemas import SignalItem, SeverityLevel
from app.utils.helpers import extract_urls_from_text


# Category Definitions with weighted patterns: (Regex, Signal Name, Severity, Description, Weight)

# Category A: Urgency and Pressure
URGENCY_PATTERNS = [
    (r"\b(act now|limited time|last chance|respond now|time is running out)\b",
     "Artificial Urgency / Countdown Pressure", "medium",
     "Uses high-pressure wording designed to induce haste and prevent calm, independent verification.", 15),
    (r"\b(immediately|urgent|urgently|within 24 hours|within 12 hours|by tonight|before midnight)\b",
     "Immediate Action Deadline", "high",
     "Imposes an arbitrary, tight time window to force rushed compliance.", 20),
    (r"\b(account.*(blocked|suspended|deactivated|closed|frozen)|final warning|last notice)\b",
     "Service Suspension / Account Termination Warning", "high",
     "Threatens immediate loss of account access or vital services to trigger panic.", 25),
]

# Category B: Sensitive Information Requests
SENSITIVE_INFO_PATTERNS = [
    (r"\b(one[- ]time password|otp|verification code|security code)\b",
     "Direct OTP / Verification Code Solicitation", "critical",
     "Legitimate institutions and payment gateways never request customer OTPs via unverified messages or calls.", 35),
    (r"\b(pin|cvv|netbanking password|atm pin|secret key|seed phrase|banking details|card number|share your credentials)\b",
     "Highly Sensitive Financial / Credential Request", "critical",
     "Directly solicits passwords, PINs, CVVs, or seed phrases that grant total control over funds.", 40),
    (r"\b(share.*otp|enter.*otp|send.*otp|provide.*otp|give.*otp|forward.*otp)\b",
     "Explicit Instruction to Disclose 2FA Credential", "critical",
     "Fraudulent demand commanding the recipient to disclose their two-factor authentication token.", 40),
]

# Category C: Financial Fraud
FINANCIAL_FRAUD_PATTERNS = [
    (r"\b(processing fee|advance payment|registration fee|withdrawal fee|deposit required|handling fee|clearance fee)\b",
     "Advance-Fee Demand / Upfront Payment Lure", "high",
     "Requires the victim to pay an upfront fee before supposedly receiving funds, prizes, or employment.", 30),
    (r"\b(guaranteed returns|investment doubling|double your money|100% safe return|zero risk)\b",
     "Unrealistic High-Yield Financial Guarantee", "high",
     "Promotes mathematically unsustainable or impossible investment guarantees.", 30),
    (r"\b(transfer money|remit payment|send payment|wire transfer)\b",
     "Unsolicited Funds Transfer Request", "medium",
     "Urges recipient to execute an irreversible funds transfer.", 20),
]

# Category D: Rewards and Prizes
REWARDS_PRIZES_PATTERNS = [
    (r"\b(congratulations|you have won|lottery winner|lucky draw|cash prize|jackpot)\b",
     "Unsolicited Lottery / Prize Claim", "high",
     "Notifies recipient of winning a contest, lottery, or drawing they never entered.", 25),
    (r"\b(claim your prize|free gift|reward waiting|cashback offer|exclusive reward|claim reward)\b",
     "Enticing Reward / Cashback Hook", "medium",
     "Offers free gifts or cash incentives to lure user into disclosing personal information or paying verification fees.", 20),
]

# Category E: Impersonation
IMPERSONATION_PATTERNS = [
    (r"\b(sbi|hdfc|icici|axis bank|state bank|punjab national bank|paytm|phonepe|google pay|gpay|bank verification|kyc update|pan card update|aadhaar.*link|update.*kyc|complete.*kyc|account verification)\b",
     "Institutional Banking / KYC Impersonation", "high",
     "Mimics formal banking compliance requests (KYC/PAN updates) to drive traffic to harvest portals.", 30),
    (r"\b(government notice|police warning|tax department|income tax|rbi|cbi|customs department|trai|courier|fedex|dhl|india post)\b",
     "Official Agency / Institutional Mimicry", "high",
     "Invokes names of tax agencies, law enforcement, or national postal carriers to borrow false authority.", 25),
    (r"\b(customer support|technical support|helpdesk support|it support)\b",
     "Unsolicited Support Representative Impersonation", "medium",
     "Poses as customer care or IT helpdesk without prior user-initiated support tickets.", 15),
]

# Category G: Threats and Coercion
THREATS_COERCION_PATTERNS = [
    (r"\b(digital arrest|arrest warrant|police case|legal action|court summons|fir registered)\b",
     "Severe Legal Coercion / Law Enforcement Threat", "critical",
     "Threatens immediate arrest, court action, or fictitious police cases to terrify the recipient.", 40),
    (r"\b(account freeze|immediate penalty|pay or face consequences|investigation notice)\b",
     "Regulatory Penalty / Asset Freeze Ultimatum", "high",
     "Threatens financial penalties or regulatory freeze if recipient does not immediately comply.", 30),
    (r"\b(stay on video call|do not disconnect|skype interrogation)\b",
     "Forced Isolation / Real-Time Video Detention Tactic", "critical",
     "Hallmark tactic of digital arrest scams where criminals prevent victims from contacting family or lawyers.", 40),
]

# Category H: Job and Investment Scams
JOB_INVESTMENT_PATTERNS = [
    (r"\b(work from home|guaranteed income|guaranteed profit|instant earnings|part[- ]time job vacancy)\b",
     "Work-From-Home / Daily Task Recruitment Lure", "high",
     "Promises high daily returns for minimal effort (e.g. liking videos, rating products, simple data entry).", 25),
    (r"\b(pay to register|earn.*(rs|inr|\$|\€).*per day|like.*video.*earn|telegram task group)\b",
     "Pay-to-Work / Telegram Task Fraud Signal", "high",
     "Directs victims to private chat groups where initial tasks pay small sums before demanding large deposit top-ups.", 30),
    (r"\b(risk[- ]free investment|crypto profit|double your investment)\b",
     "Deceptive Risk-Free Financial Scheme", "high",
     "Claims that a speculative investment is risk-free, violating basic financial reality.", 25),
]

# Negation and Educational / Warning Context Patterns (to reduce false positives)
EDUCATIONAL_CONTEXT_PATTERNS = [
    r"\b(never share|do not share|don't share|never disclose|never give|do not tell)\b.{0,50}\b(otp|pin|password|cvv|credentials|code)\b",
    r"\b(otp|pin|password|cvv)\b.{0,50}\b(should never be shared|is secret|is confidential|do not disclose)\b",
    r"\b(security alert:?|scam alert:?|fraud alert:?|cybersecurity advisory|awareness reminder)\b",
    r"\b(beware of scams|watch out for scams|protect yourself from scams|how to spot scams|tips to prevent fraud)\b",
]


def check_educational_context(text_lower: str) -> bool:
    """Checks if the text is discussing security advice, awareness, or cautionary reminders."""
    for pattern in EDUCATIONAL_CONTEXT_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def run_comprehensive_rule_engine(
    text: str,
    channel: str = "other",
    is_transcript: bool = False
) -> Tuple[int, List[SignalItem], List[str], List[str], List[str], str, str]:
    """Runs deep keyword, regex, and contextual heuristic evaluation on text content.

    Returns:
        (risk_score, signals, observations, actions, unknowns, claim, summary)
    """
    cleaned = text.strip()
    text_lower = cleaned.lower()
    score = 0
    signals: List[SignalItem] = []
    observations: List[str] = []

    # 1. Basic structural observations
    char_count = len(cleaned)
    word_count = len(cleaned.split())
    observations.append(f"Content analyzed: {char_count} characters across {word_count} words.")

    # 2. Check for educational or cautionary context
    is_educational = check_educational_context(text_lower)
    if is_educational:
        observations.append("Context analysis: Advisory or security awareness phrasing detected.")

    # 3. Phishing Links inspection (Category F)
    urls = extract_urls_from_text(cleaned)
    if urls:
        observations.append(f"Contains {len(urls)} embedded web address(es): {', '.join(urls[:3])}")
        for url_str in urls:
            url_lower = url_str.lower()
            # Shortener
            if any(s in url_lower for s in ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "tiny.cc"]):
                score += 25
                signals.append(SignalItem(
                    name="Obfuscated / Shortened URL",
                    severity="high",
                    description="Employs a public redirect service that disguises the actual destination hostname.",
                    evidence=url_str
                ))
            # Suspicious generic TLD
            elif any(tld in url_lower for tld in [".xyz", ".top", ".buzz", ".club", ".work", ".click", ".tk", ".ml"]):
                score += 25
                signals.append(SignalItem(
                    name="High-Risk Top-Level Domain in Link",
                    severity="high",
                    description="Link resolves to a cheap generic TLD heavily correlated with disposable phishing infrastructure.",
                    evidence=url_str
                ))
            # Direct IP host
            elif re.search(r"https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}", url_lower):
                score += 35
                signals.append(SignalItem(
                    name="Direct IP Address Host in Link",
                    severity="critical",
                    description="Direct IP destination bypassing domain name resolution, common in short-lived attack servers.",
                    evidence=url_str
                ))
            # Userinfo @
            elif "@" in url_str.split("?")[0]:
                score += 35
                signals.append(SignalItem(
                    name="UserInfo Deception Pattern in Link",
                    severity="critical",
                    description="Uses '@' in URL structure to camouflage the true destination server.",
                    evidence=url_str
                ))
            else:
                score += 10
                signals.append(SignalItem(
                    name="Embedded External Action Link",
                    severity="medium",
                    description="Unsolicited prompt directing the recipient to navigate outside the messaging client.",
                    evidence=url_str
                ))

    # 4. Pattern Category Groups: (pattern_list, category_label)
    category_groups = [
        (URGENCY_PATTERNS, "Urgency & Pressure"),
        (SENSITIVE_INFO_PATTERNS, "Sensitive Information Request"),
        (FINANCIAL_FRAUD_PATTERNS, "Financial Fraud Signal"),
        (REWARDS_PRIZES_PATTERNS, "Rewards & Prizes Lure"),
        (IMPERSONATION_PATTERNS, "Impersonation Indicator"),
        (THREATS_COERCION_PATTERNS, "Threats & Coercion"),
        (JOB_INVESTMENT_PATTERNS, "Job & Investment Fraud"),
    ]

    matched_categories = set()

    for pattern_list, cat_label in category_groups:
        category_score = 0
        for regex, name, severity, desc, weight in pattern_list:
            match = re.search(regex, text_lower)
            if match:
                evidence_text = match.group(0)

                # Contextual override: if the match is an OTP/password mention inside security advice, don't flag as critical
                if is_educational and ("otp" in evidence_text or "password" in evidence_text) and "Direct" in name:
                    observations.append(f"Educational reference identified: '{evidence_text}' is discussed in an advisory context.")
                    continue

                category_score = max(category_score, weight)
                matched_categories.add(cat_label)
                if not any(s.name == name for s in signals):
                    signals.append(SignalItem(
                        name=name,
                        severity=severity,
                        description=desc,
                        evidence=evidence_text
                    ))
        score += category_score


    # 5. Compound Risk Escalation (Combinations of signals multiplying risk)
    has_urgency = "Urgency & Pressure" in matched_categories
    has_credentials = "Sensitive Information Request" in matched_categories
    has_threats = "Threats & Coercion" in matched_categories
    has_impersonation = "Impersonation Indicator" in matched_categories
    has_financial = "Financial Fraud Signal" in matched_categories
    has_links = any("Link" in s.name or "URL" in s.name for s in signals)

    # Compound rule 1: Urgency + Credentials + Link = High Phishing Confidence
    if has_urgency and has_credentials and has_links:
        score = max(score, 85)
        observations.append("Compound pattern detected: Classic Phishing Triad (Urgency + Credential Harvesting + Action Link).")

    # Compound rule 2: Impersonation + Threats/Coercion = Impersonation Extortion / Digital Arrest
    if has_impersonation and has_threats:
        score = max(score, 85)
        observations.append("Compound pattern detected: Authority Impersonation paired with Coercive Threat.")

    # Compound rule 3: Impersonation + Credentials = Bank/Gov Phishing
    if has_impersonation and has_credentials:
        score = max(score, 80)
        observations.append("Compound pattern detected: Institutional Mimicry paired with Credential Solicitation.")

    # Compound rule 4: Financial Lure + Advance Fee = Advance Fee Fraud
    if "Rewards & Prizes Lure" in matched_categories and has_financial:
        score = max(score, 75)
        observations.append("Compound pattern detected: Prize Announcement requiring Upfront Payment.")

    # 6. Educational context risk mitigation
    if is_educational and score > 20:
        score = min(score, 20)
        signals = [s for s in signals if s.severity != "critical"]
        observations.append("Risk score tempered: Language indicates defensive security awareness rather than an active attack.")

    # 7. Bound score between 0 and 100
    risk_score = min(max(score, 0), 100)

    # If absolutely no signals detected:
    if not signals:
        risk_score = min(risk_score, 10)
        claim = "No active scam signals, coercive pressure, or manipulation patterns detected by heuristic rules."
        summary = "No prominent phishing or social engineering patterns detected by available static rules."
        observations.append("No matches found against common fraud, urgency, or credential extraction signatures.")
    else:
        # Formulate claim based on findings
        if has_threats:
            claim = "The sender asserts official authority and threatens legal action, arrest, or service termination unless immediate compliance is given."
        elif has_credentials:
            claim = "The sender claims verification, unblocking, or security procedures require disclosing private OTPs or authentication credentials."
        elif "Rewards & Prizes Lure" in matched_categories or "Job & Investment Fraud" in matched_categories:
            claim = "The communication promises high financial rewards, prizes, or easy task earnings to motivate engagement."
        elif has_impersonation:
            claim = "The message claims to be an official administrative or security notice from a recognized organization."
        else:
            claim = "The sender presents an urgent scenario requesting recipient attention and external link navigation."

        summary = f"Heuristic inspection detected {len(signals)} warning sign(s) across {len(matched_categories)} fraud category(ies)."

    # 8. Standardized safe precautions
    actions: List[str] = [
        "Never share OTPs, UPI PINs, passwords, or personal identity documents through unverified chats or calls.",
        "Do not click embedded links or call back numbers provided directly inside the suspicious message."
    ]

    if has_credentials or has_urgency or has_threats:
        actions.append("Open the official application or website of the claimed institution independently to verify your actual account standing.")
        actions.append("Report the sender to relevant authorities (in India: 1930 / cybercrime.gov.in; or your local national CERT).")

    if has_links:
        actions.append("Examine link destinations carefully; legitimate banks rarely use shortened or generic (.xyz/.top) domains.")

    # 9. Technical limitations & unknowns
    unknowns: List[str] = [
        "Heuristic keyword matching cannot verify true sender telecom routing or inspect carrier-level network origin.",
        "Cannot determine whether recipient has an existing legitimate account with the claimed service provider.",
        "Absence of detected keywords does not prove content is authentic; novel or sophisticated campaigns may avoid known phrases."
    ]

    return risk_score, signals, observations, actions, unknowns, claim, summary


def run_deterministic_message_rules(text: str) -> Tuple[int, List[SignalItem], List[str], List[str], List[str]]:
    """Backward-compatible helper returning (risk_score, signals, observations, actions, unknowns)."""
    score, signals, observations, actions, unknowns, _, _ = run_comprehensive_rule_engine(text)
    return score, signals, observations, actions, unknowns

