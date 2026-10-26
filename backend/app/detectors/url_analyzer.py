"""Website / URL Inspector: Static heuristic analysis with strict SSRF prevention."""

import re
import ipaddress
from urllib.parse import urlparse, unquote
from typing import List, Tuple, Dict, Any

from app.config import AI_PROVIDER
from app.schemas import AnalysisResponse, SignalItem, UrlAnalysisRequest
from app.utils.helpers import get_iso_timestamp, calculate_risk_level
from app.ai.ollama_client import ollama_client
from app.ai.prompts import URL_EXPLANATION_PROMPT


SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "ow.ly",
    "buff.ly", "goo.gl", "rebrand.ly", "bl.ink", "tiny.cc", "s.id"
}

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "buzz", "club", "work", "rest", "gq", "tk",
    "ml", "cf", "ga", "country", "stream", "cam", "fit", "surf", "casa",
    "monster", "lat", "date", "racing", "vip", "icu", "cyou", "shop"
}

TARGETED_BRANDS = [
    "paypal", "google", "microsoft", "apple", "netflix", "amazon", "facebook",
    "instagram", "whatsapp", "sbi", "hdfc", "icici", "axis", "paytm", "phonepe",
    "chase", "wellsfargo", "bankofamerica", "coinbase", "binance", "metamask",
    "usps", "fedex", "dhl", "ups", "indiapost"
]

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "verification", "secure", "security", "account",
    "update", "banking", "wallet", "recovery", "support", "billing", "confirm",
    "suspended", "unlock", "portal", "authorise", "authorize", "kyc", "pan"
]

SUSPICIOUS_EXTENSIONS = [
    ".exe", ".scr", ".bat", ".cmd", ".msi", ".vbs", ".ps1", ".jar", ".apk", ".iso"
]


def run_deterministic_url_rules(raw_input: str) -> Tuple[int, List[SignalItem], List[str], List[str], List[str], Dict[str, Any]]:
    """Performs 100% offline static heuristic analysis on a URL or domain string.
    GUARANTEE: NEVER makes network requests to the target URL (SSRF impossible by design).
    """
    score = 0
    signals: List[SignalItem] = []
    observations: List[str] = []
    actions: List[str] = [
        "Do not click this link or submit any passwords, phone numbers, or credit card details.",
        "To reach a legitimate organization, open a fresh browser window and manually type their known official address."
    ]
    unknowns: List[str] = [
        "Proofly deliberately does not send HTTP requests to this URL to prevent telemetry tracking, malware triggers, and SSRF exploits.",
        "Live page status, SSL certificate identity validation, and DNS resolution require active network connection."
    ]

    # Normalize input
    cleaned = raw_input.strip()
    if not cleaned.startswith(("http://", "https://")):
        # If bare domain or URL without scheme
        target_url = "http://" + cleaned
    else:
        target_url = cleaned

    try:
        parsed = urlparse(target_url)
    except Exception as e:
        return 80, [SignalItem(
            name="Malformed URL Structure",
            severity="high",
            description=f"URL string failed standard parsing: {str(e)}",
            evidence=raw_input
        )], ["Unable to parse URL."], actions, unknowns, {"raw": raw_input}

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    path = parsed.path
    query = parsed.query

    # Host and port separation
    hostname = parsed.hostname or ""
    port = parsed.port

    metadata: Dict[str, Any] = {
        "input": raw_input,
        "scheme": scheme,
        "hostname": hostname,
        "port": port,
        "path": path,
        "is_https": scheme == "https"
    }

    observations.append(f"Parsed hostname: {hostname or 'None detected'}")
    if scheme == "https":
        observations.append("Protocol: HTTPS (Note: HTTPS provides encryption, NOT proof of website legitimacy).")
    elif scheme == "http":
        score += 15
        signals.append(SignalItem(
            name="Insecure Plaintext HTTP Protocol",
            severity="medium",
            description="Uses unencrypted HTTP. Modern authentic financial and login portals mandate HTTPS.",
            evidence=target_url
        ))

    # 1. Misleading '@' symbol (UserInfo attack e.g. https://google.com@evil-site.com)
    if "@" in netloc or "@" in raw_input:
        score += 45
        signals.append(SignalItem(
            name="Credential / UserInfo Deception Pattern ('@' symbol)",
            severity="critical",
            description="Browsers treat text before '@' as authentication credentials and actually navigate to the domain after '@'. This is a classic phishing camouflage tactic.",
            evidence=raw_input
        ))

    # 2. IP Address as Hostname
    if hostname:
        is_ip = False
        try:
            ipaddress.ip_address(hostname)
            is_ip = True
        except ValueError:
            pass

        if is_ip:
            score += 40
            signals.append(SignalItem(
                name="Direct IP Address Host",
                severity="high",
                description="The destination specifies a raw IP address instead of a registered domain name. Legitimate public services almost universally use domain names.",
                evidence=hostname
            ))

    # 3. Punycode / IDN Homograph Attack (xn--)
    if "xn--" in hostname:
        score += 40
        signals.append(SignalItem(
            name="Punycode / Internationalized Homograph Attack",
            severity="critical",
            description="Uses Punycode ('xn--') encoding, which allows attackers to use Cyrillic or Greek characters that look visually identical to Latin letters to mimic trusted brands.",
            evidence=hostname
        ))

    # 4. URL Shortener Service
    if hostname in SHORTENER_DOMAINS:
        score += 25
        signals.append(SignalItem(
            name="URL Shortening Service Mask",
            severity="medium",
            description="The URL uses a public shortening redirector to hide the actual final destination server.",
            evidence=hostname
        ))

    # 5. Non-Standard Port
    if port and port not in (80, 443, 8080):
        score += 25
        signals.append(SignalItem(
            name=f"Non-Standard Port (:{port})",
            severity="medium",
            description=f"Specifies connection over unusual port {port}, commonly seen on testing servers or rogue hosts.",
            evidence=f":{port}"
        ))

    # 6. Excessive Subdomain Depth
    subdomain_parts = [p for p in hostname.split(".") if p]
    if len(subdomain_parts) >= 4:
        score += 20
        signals.append(SignalItem(
            name="Excessive Subdomain Stacking",
            severity="medium",
            description=f"Hostname contains {len(subdomain_parts)} domain levels. Phishers frequently stack trusted brand names as subdomains (e.g. sbi.co.in.attacker-host.com).",
            evidence=hostname
        ))

    # 7. High-Risk TLD
    tld = subdomain_parts[-1] if subdomain_parts else ""
    if tld in SUSPICIOUS_TLDS:
        score += 25
        signals.append(SignalItem(
            name=f"High-Risk Top-Level Domain (.{tld})",
            severity="high",
            description=f"Uses the generic TLD '.{tld}', which has high statistical correlation with malicious campaigns due to cheap or disposable registration.",
            evidence=f".{tld}"
        ))

    # 8. Brand Impersonation in Non-Official Domain
    matched_brands = [b for b in TARGETED_BRANDS if b in hostname]
    matched_keywords = [k for k in SUSPICIOUS_KEYWORDS if k in hostname or k in path.lower()]

    if matched_brands:
        for brand in matched_brands:
            # Check if brand is not the actual apex domain (e.g., paypal-secure-login.xyz)
            # A genuine apex domain would be brand.com or brand.co.in
            if not (hostname == f"{brand}.com" or hostname.endswith(f".{brand}.com") or hostname == f"{brand}.co.in" or hostname.endswith(f".{brand}.co.in")):
                score += 35
                signals.append(SignalItem(
                    name=f"Targeted Brand Mimicry ({brand.upper()})",
                    severity="critical",
                    description=f"The domain incorporates the brand name '{brand}' in an unofficial host configuration, attempting to trick visitors into trusting an imposter site.",
                    evidence=hostname
                ))

    # 9. Suspicious Security/Verification Keywords in URL
    if matched_keywords and matched_brands:
        score += 20
        signals.append(SignalItem(
            name="Phishing Keyword Combination",
            severity="high",
            description=f"Combines institutional brand keywords with security action terms: {', '.join(matched_keywords[:3])}.",
            evidence=", ".join(matched_keywords)
        ))

    # 10. Dangerous Executable or Script File Extension in Path
    for ext in SUSPICIOUS_EXTENSIONS:
        if path.lower().endswith(ext):
            score += 50
            signals.append(SignalItem(
                name=f"Direct Executable File Download ({ext})",
                severity="critical",
                description=f"Link points directly to an executable binary or installation package ({ext}) which could execute arbitrary code upon download.",
                evidence=path
            ))
            break

    # 11. Excessive Length (> 100 characters)
    if len(raw_input) > 100:
        score += 10
        observations.append(f"URL is unusually long ({len(raw_input)} characters).")

    risk_score = min(score, 100)
    return risk_score, signals, observations, actions, unknowns, metadata


async def analyze_url(req: UrlAnalysisRequest) -> AnalysisResponse:
    """Inspects a URL or domain without initiating outbound network connections."""
    raw_url = req.url.strip()

    # 1. Deterministic Rule Analysis (Zero-Network SSRF-Safe)
    risk_score, signals, observations, actions, unknowns, metadata = run_deterministic_url_rules(raw_url)

    claim = f"The URL claims to direct visitors to {metadata.get('hostname') or 'the specified web service'}."
    summary = f"Detected {len(signals)} technical risk indicators in this URL."
    ai_analysis = None
    model_used = "deterministic-rule-engine"

    # 2. Gemma 4 Explainer (if AI_PROVIDER is ollama)
    if AI_PROVIDER == "ollama":
        try:
            signals_text = "\n".join([f"- {s.name} ({s.severity}): {s.description}" for s in signals]) if signals else "None detected."
            prompt = URL_EXPLANATION_PROMPT.format(url=raw_url, signals=signals_text)
            ai_result = await ollama_client.generate_json(prompt)

            if ai_result:
                model_used = "gemma4:e2b"
                if ai_result.get("claim"):
                    claim = ai_result["claim"]
                if ai_result.get("reasoning"):
                    ai_analysis = ai_result["reasoning"]
                    summary = ai_result["reasoning"]
                if ai_result.get("actions") and isinstance(ai_result["actions"], list):
                    for act in ai_result["actions"]:
                        if act not in actions:
                            actions.insert(0, act)
                if ai_result.get("observations") and isinstance(ai_result["observations"], list):
                    for obs in ai_result["observations"]:
                        if obs not in observations:
                            observations.append(obs)
        except Exception:
            pass


    if len(signals) == 0:
        risk_score = 5
        claim = f"The domain {metadata.get('hostname')} does not show common deceptive phishing patterns in static analysis."
        summary = "No obvious deceptive URL mechanics or structural red flags detected."
        title = "Clean Static URL Structure"
    else:
        risk_level = calculate_risk_level(risk_score)
        title = f"{risk_level.capitalize()} Risk URL Structure Detected"

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
        metadata=metadata,
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
