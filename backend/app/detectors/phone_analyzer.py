"""Caller Intelligence Module: Phone number validation, carrier/region metadata, and scam call transcript forensics."""

import re
from typing import List, Tuple, Dict, Any, Optional
import phonenumbers
from phonenumbers import geocoder, carrier, PhoneNumberType

from app.config import AI_PROVIDER
from app.schemas import AnalysisResponse, SignalItem, PhoneAnalysisRequest
from app.utils.helpers import get_iso_timestamp, calculate_risk_level
from app.ai.ollama_client import ollama_client
from app.ai.prompts import PHONE_CALL_PROMPT
from app.detectors.rule_engine import run_comprehensive_rule_engine


SCAM_CALL_TACTICS = [
    # 1. Digital Arrest / Law Enforcement Intimidation Scam
    (
        r"\b(digital arrest|cbi|police officer|cyber crime cell|mumbai police|delhi police|narcotics|customs department|arrest warrant|stay on video call|do not disconnect|skype interrogation)\b",
        "Digital Arrest / Fake Law Enforcement Intimidation",
        "critical",
        "High-threat coercion tactic where fraudsters impersonate police/CBI on video calls and falsely claim the victim's identity is linked to money laundering or drug parcels."
    ),
    # 2. Remote Access Trojan Lure
    (
        r"\b(anydesk|teamviewer|rustdesk|quicksupport|screen share|install this app|apk file|grant permission)\b",
        "Remote Desktop Screen-Control Request",
        "critical",
        "Solicitation to install screen-sharing software allowing criminals to view banking screens and intercept 2FA codes."
    ),
    # 3. Impersonation of Bank Manager / Card KYC
    (
        r"\b(bank manager|credit card blocked|card upgrade|reward points expire|kyc update|verify pan card|account unfreeze)\b",
        "Bank Staff / Account Executive Impersonation",
        "high",
        "Caller poses as financial institution staff to obtain sensitive card verification data."
    ),
    # 4. Immediate OTP / UPI PIN Solicitations
    (
        r"\b(share otp|enter upi pin|approve request|send pin|tell me the 6 digit code)\b",
        "Real-Time Authentication Credential Extraction",
        "critical",
        "Caller pressures victim to verbally disclose OTP or enter UPI PIN to 'receive' money."
    ),
    # 5. Customs / Contraband Parcel Lure
    (
        r"\b(parcel seized|illegal goods|drugs found|customs fee|fedex parcel|passport detained)\b",
        "Bogus Customs / Contraband Extortion Lure",
        "high",
        "Fictitious claim that a parcel sent in victim's name contained illicit substances."
    ),
    # 6. Part-time Job / YouTube Like / Telegram Investment
    (
        r"\b(telegram group|like youtube videos|earn 2000 per task|crypto trading|guaranteed daily payout)\b",
        "Task-Based Investment Recruitment Fraud",
        "high",
        "Lures user into depositing initial sums for illusory commissions."
    )
]

NUMBER_TYPE_NAMES = {
    PhoneNumberType.FIXED_LINE: "Fixed Line (Landline)",
    PhoneNumberType.MOBILE: "Mobile",
    PhoneNumberType.FIXED_LINE_OR_MOBILE: "Fixed Line or Mobile",
    PhoneNumberType.TOLL_FREE: "Toll Free",
    PhoneNumberType.PREMIUM_RATE: "Premium Rate (High Tariff)",
    PhoneNumberType.SHARED_COST: "Shared Cost",
    PhoneNumberType.VOIP: "VoIP (Voice over IP / Virtual)",
    PhoneNumberType.PERSONAL_NUMBER: "Personal Number",
    PhoneNumberType.PAGER: "Pager",
    PhoneNumberType.UAN: "Universal Access Number",
    PhoneNumberType.VOICEMAIL: "Voicemail",
    PhoneNumberType.UNKNOWN: "Unknown Number Type"
}


def parse_phone_metadata(raw_number: str, default_country: str = "IN") -> Dict[str, Any]:
    """Uses Google's phonenumbers library to inspect numbering-plan validity and metadata."""
    res = {
        "is_valid": False,
        "is_possible": False,
        "e164": raw_number,
        "international": raw_number,
        "national": raw_number,
        "country_code": "",
        "region_name": "Unknown",
        "carrier_name": "Unknown Carrier",
        "number_type": "Unknown",
        "is_voip": False,
        "is_premium": False,
        "error": None
    }

    try:
        parsed = phonenumbers.parse(raw_number, default_country)
        res["is_possible"] = phonenumbers.is_possible_number(parsed)
        res["is_valid"] = phonenumbers.is_valid_number(parsed)
        res["e164"] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        res["international"] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
        res["national"] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.NATIONAL)
        res["country_code"] = str(parsed.country_code)

        # Region & Carrier
        res["region_name"] = geocoder.description_for_number(parsed, "en") or "Unspecified Geographic Region"
        res["carrier_name"] = carrier.name_for_number(parsed, "en") or "Unspecified Carrier"

        # Number Type
        ntype = phonenumbers.number_type(parsed)
        res["number_type"] = NUMBER_TYPE_NAMES.get(ntype, "Other")
        res["is_voip"] = ntype == PhoneNumberType.VOIP
        res["is_premium"] = ntype == PhoneNumberType.PREMIUM_RATE

    except phonenumbers.NumberParseException as e:
        res["error"] = str(e)

    return res


def run_deterministic_phone_rules(
    meta: Dict[str, Any],
    claimed_org: Optional[str],
    call_desc: Optional[str]
) -> Tuple[int, List[SignalItem], List[str], List[str], List[str]]:
    """Runs deterministic checks on phone number metadata and transcript."""
    score = 0
    signals: List[SignalItem] = []
    observations: List[str] = []
    actions: List[str] = [
        "Never disclose one-time passwords (OTP), banking passwords, or identity documents over the phone.",
        "Official government agencies and law enforcement NEVER conduct 'digital arrests' or interrogate suspects over WhatsApp/Skype video."
    ]
    unknowns: List[str] = [
        "CRITICAL TELECOM LIMITATION: Caller ID (CLI) is routinely spoofed via international VoIP gateways. A valid or local number never proves the caller's true identity.",
        "A valid phone number only indicates proper telecommunications plan formatting, NOT caller trustworthiness or active account ownership."
    ]

    # Phone Metadata Observations
    observations.append(f"Format: {meta['international']} (Standard: {meta['e164']})")
    observations.append(f"Number Plan Status: {'Valid Number' if meta['is_valid'] else ('Possible Number' if meta['is_possible'] else 'Invalid Format')}")
    observations.append(f"Identified Region: {meta['region_name']}")
    observations.append(f"Detected Line Type: {meta['number_type']}")

    if claimed_org:
        observations.append(f"Caller Asserted Identity: {claimed_org}")

    # Number Type Risk
    if meta.get("is_premium"):
        score += 30
        signals.append(SignalItem(
            name="Premium-Rate Telephone Number",
            severity="high",
            description="Number is categorized as premium-rate, which incurs exorbitant per-minute charges upon calling back.",
            evidence=meta["e164"]
        ))
        actions.insert(0, "Do NOT call this number back; doing so may result in unexpected telecom charges.")

    if meta.get("is_voip"):
        observations.append("VoIP line: Frequently used by call centers and internet dialers.")

    # Check Call Description
    has_description = bool(call_desc and call_desc.strip())
    desc_lower = (call_desc or "").lower()

    if not has_description:
        # User only submitted a phone number!
        # Prompt requirement: If user only supplies a phone number, return metadata and explicitly state
        # that scam status cannot be determined from formatting alone!
        unknowns.insert(0, "SCAM STATUS CANNOT BE DETERMINED FROM PHONE NUMBER FORMAT ALONE. Please provide the caller's statements or call transcript to evaluate fraudulent behavior.")
        return 0, signals, observations, actions, unknowns

    # Evaluate Call Description Tactics
    for pattern, name, severity, desc in SCAM_CALL_TACTICS:
        match = re.search(pattern, desc_lower)
        if match:
            matched_phrase = match.group(0)
            weight = 50 if severity == "critical" else 25
            score += weight
            signals.append(SignalItem(
                name=name,
                severity=severity,
                description=desc,
                evidence=matched_phrase
            ))

    # Pressure or payment in transcript
    if "immediately" in desc_lower or "pay now" in desc_lower or "transfer" in desc_lower:
        score += 20
        signals.append(SignalItem(
            name="Financial Urgency Pressure",
            severity="high",
            description="Caller applied pressure for immediate funds transfer or compliance without opportunity to consult trusted third parties.",
            evidence="Immediate payment pressure in transcript"
        ))

    risk_score = min(score, 100)
    return risk_score, signals, observations, actions, unknowns


async def analyze_phone(req: PhoneAnalysisRequest) -> AnalysisResponse:
    """Forensic investigation of phone numbers and suspicious call transcripts."""
    raw_number = req.phone_number.strip()
    country_code = req.country_code or "IN"
    claimed_org = req.claimed_org.strip() if req.claimed_org else None
    call_desc = req.call_description.strip() if req.call_description else None

    # 1. Parse Phone Metadata
    meta = parse_phone_metadata(raw_number, country_code)

    # 2. Deterministic Rule Analysis
    risk_score, signals, observations, actions, unknowns = run_deterministic_phone_rules(meta, claimed_org, call_desc)

    # Enhance transcript with comprehensive rule engine
    if call_desc:
        c_score, c_signals, c_obs, c_actions, c_unknowns, _, _ = run_comprehensive_rule_engine(
            call_desc, channel="phone", is_transcript=True
        )
        for s in c_signals:
            if not any(existing.name.lower() == s.name.lower() for existing in signals):
                signals.append(s)
        for obs in c_obs:
            if obs not in observations:
                observations.append(obs)
        for act in c_actions:
            if act not in actions:
                actions.append(act)
        risk_score = min(max(risk_score, c_score), 100)

    # Base Claim
    if claimed_org:
        claim = f"The caller claims to represent {claimed_org} and is contacting the recipient regarding official business."
    elif call_desc:
        claim = "The caller asserts an urgent matter requiring compliance or financial action."
    else:
        claim = f"Telephone number {meta['international']} is registered under {meta['region_name']} numbering plan."

    summary = f"Caller analysis completed with {len(signals)} identified warning signal(s)." if call_desc else "Phone format parsed. Scam status cannot be determined without conversation context."
    ai_analysis = None
    model_used = "deterministic-rule-engine"

    # 3. Gemma 4 AI Analysis if call description is provided and AI_PROVIDER is ollama
    if call_desc and AI_PROVIDER == "ollama":
        try:
            prompt = PHONE_CALL_PROMPT.format(
                phone_number=meta["international"],
                claimed_org=claimed_org or "Unspecified",
                region_info=f"{meta['region_name']} ({meta['number_type']})",
                call_description=call_desc[:2500]
            )
            ai_result = await ollama_client.generate_json(prompt)

            if ai_result:
                model_used = ollama_client.model
                if ai_result.get("claim"):
                    claim = ai_result["claim"]
                if ai_result.get("reasoning"):
                    ai_analysis = ai_result["reasoning"]
                    summary = ai_result["reasoning"]
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
                                risk_score = min(risk_score + 15, 100)
        except Exception:
            pass


    if not call_desc:
        risk_score = 10 if meta["is_valid"] else 20
        risk_level = "low"
        title = "Phone Metadata Inspected (Context Needed)"
        summary = "Number plan valid. Scam status requires call details or conversation transcript."
    else:
        risk_level = calculate_risk_level(risk_score)
        title = f"{risk_level.capitalize()} Risk Scam Call Indicators" if risk_score >= 50 else ("Moderate Suspicion" if risk_score >= 25 else "Low Call Risk")

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
            "phone_number": meta["e164"],
            "international_format": meta["international"],
            "region": meta["region_name"],
            "carrier": meta["carrier_name"],
            "line_type": meta["number_type"],
            "is_valid_format": meta["is_valid"],
            "claimed_organization": claimed_org
        },
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
