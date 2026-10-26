"""Payment Proof Lab: Forensic examination of UPI receipts, transfer slips, and payment screenshots."""

import base64
import io
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image

from app.schemas import AnalysisResponse, SignalItem
from app.utils.helpers import get_iso_timestamp, calculate_risk_level
from app.ai.ollama_client import ollama_client
from app.ai.prompts import PAYMENT_VISION_PROMPT


def inspect_image_basic(image_bytes: bytes) -> Tuple[Dict[str, Any], Optional[str]]:
    """Inspects basic PIL image dimensions, format, and aspect ratio."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        aspect_ratio = round(width / height, 2) if height > 0 else 0
        img_format = img.format or "UNKNOWN"
        meta = {
            "width": width,
            "height": height,
            "aspect_ratio": aspect_ratio,
            "format": img_format,
            "bytes_size": len(image_bytes)
        }
        return meta, None
    except Exception as e:
        return {}, f"Invalid image file: {str(e)}"


async def analyze_payment(
    image_bytes: bytes,
    claimed_amount: Optional[str] = None,
    currency: Optional[str] = "INR",
    transaction_notes: Optional[str] = None
) -> AnalysisResponse:
    """Forensic verification of payment confirmation images using Gemma 4 Vision."""
    img_meta, err = inspect_image_basic(image_bytes)
    if err:
        return AnalysisResponse(
            title="Invalid Image Upload",
            risk_score=90,
            risk_level="critical",
            summary="The submitted file could not be parsed as a valid image.",
            claim="Payment proof submission",
            observations=["File is corrupted or in an unsupported format."],
            signals=[SignalItem(
                name="Corrupted Image File",
                severity="high",
                description=err
            )],
            unknowns=["Cannot perform forensic visual inspection."],
            actions=["Upload a standard PNG, JPEG, or WebP screenshot."],
            metadata={},
            timestamp=get_iso_timestamp()
        )

    # Base64 encode for Ollama vision API
    b64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Universal Golden Rules for Payment Proofs
    observations: List[str] = [
        f"Image dimensions: {img_meta['width']}x{img_meta['height']} pixels ({img_meta['format']}).",
        f"File size: {round(img_meta['bytes_size'] / 1024, 1)} KB."
    ]

    signals: List[SignalItem] = []
    actions: List[str] = [
        "DO NOT release goods, services, keys, or transfer items based solely on customer-provided screenshots.",
        "Open your official bank or UPI mobile application independently and verify that funds are credited to your settled account balance.",
        "Check your account statement for the unique 12-digit UPI UTR or bank reference number."
    ]
    unknowns: List[str] = [
        "A digital image is never proof of fund settlement. Fake payment generator applications (e.g. fake Paytm/PhonePe apps) produce pixel-perfect spoofed confirmation screens.",
        "Image inspection cannot verify whether a real banking transaction was initiated, reversed, or held by intermediary clearing houses."
    ]

    extracted_fields = {
        "amount": "Unverified",
        "currency": currency or "INR",
        "status": "Unverified",
        "utr_or_reference": "Unverified",
        "recipient": "Unverified",
        "timestamp": "Unverified"
    }

    claim = f"The screenshot claims a successful payment transfer of {claimed_amount or 'an unstated sum'} to the recipient."
    summary = "Payment proof visual analysis performed. Image evidence requires bank statement reconciliation."
    ai_analysis = None
    model_used = "deterministic-vision-heuristics"
    risk_score = 45  # Baseline caution score for unverified screenshot

    # Call Gemma 4 Multimodal Vision
    try:
        ai_result = await ollama_client.generate_json(
            prompt=PAYMENT_VISION_PROMPT,
            images=[b64_image]
        )

        if ai_result:
            model_used = "gemma4:e2b"
            if ai_result.get("claim"):
                claim = ai_result["claim"]
            if ai_result.get("reasoning"):
                ai_analysis = ai_result["reasoning"]
                summary = ai_result["reasoning"]
            if ai_result.get("observations") and isinstance(ai_result["observations"], list):
                for obs in ai_result["observations"]:
                    observations.append(obs)
            if ai_result.get("warning_signs") and isinstance(ai_result["warning_signs"], list):
                for ws in ai_result["warning_signs"]:
                    if isinstance(ws, dict) and ws.get("name"):
                        signals.append(SignalItem(
                            name=ws["name"],
                            severity=ws.get("severity", "medium"),
                            description=ws.get("description", "Identified by Gemma 4 vision forensics."),
                            evidence=ws.get("evidence")
                        ))
            if ai_result.get("extracted_fields") and isinstance(ai_result["extracted_fields"], dict):
                extracted_fields.update(ai_result["extracted_fields"])
            if ai_result.get("actions") and isinstance(ai_result["actions"], list):
                for act in ai_result["actions"]:
                    if act not in actions:
                        actions.insert(0, act)
    except Exception:
        pass

    # Evaluate extracted status
    status_lower = str(extracted_fields.get("status", "")).lower()
    if "pending" in status_lower or "processing" in status_lower:
        risk_score = max(risk_score, 75)
        signals.insert(0, SignalItem(
            name="Transaction in Pending / Processing State",
            severity="critical",
            description="The screenshot displays 'Pending' or 'Processing' rather than 'Completed'. Pending UPI transactions frequently fail or are canceled after the victim hands over goods.",
            evidence=extracted_fields.get("status")
        ))
    elif "failed" in status_lower:
        risk_score = max(risk_score, 85)
        signals.insert(0, SignalItem(
            name="Payment Marked as Failed in Screenshot",
            severity="critical",
            description="The payment confirmation image shows an explicit failure status.",
            evidence=extracted_fields.get("status")
        ))

    # Evaluate missing reference number / UTR
    utr_val = str(extracted_fields.get("utr_or_reference", "")).lower()
    if utr_val in ("missing", "unspecified", "unverified", "none", ""):
        risk_score = max(risk_score, 60)
        signals.append(SignalItem(
            name="Missing Bank Reference / UTR Number",
            severity="high",
            description="Authentic payment confirmation slips contain a unique 12-digit UPI UTR or bank transaction reference. The absence of this reference is a major red flag.",
            evidence="No UTR found"
        ))

    # Re-calculate risk level
    if any(s.severity == "critical" for s in signals):
        risk_score = max(risk_score, 75)
    elif len(signals) > 0:
        risk_score = max(risk_score, 50)
    else:
        risk_score = 40  # Screenshots always carry inherent verification uncertainty

    risk_level = calculate_risk_level(risk_score)
    title = "High Risk Payment Proof (Do Not Accept)" if risk_score >= 70 else "Unverified Payment Screenshot (Verify Balance)"

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
            "image_properties": img_meta,
            "extracted_fields": extracted_fields,
            "claimed_amount": claimed_amount,
            "currency": currency,
            "notes": transaction_notes
        },
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
