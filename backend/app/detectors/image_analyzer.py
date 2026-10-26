"""Image Evidence Inspector: Visual forensics for scam advertisements, fake notices, and impersonation media."""

import base64
import io
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image

from app.config import AI_PROVIDER
from app.schemas import AnalysisResponse, SignalItem
from app.utils.helpers import get_iso_timestamp, calculate_risk_level
from app.ai.ollama_client import ollama_client
from app.ai.prompts import IMAGE_EVIDENCE_PROMPT
from app.detectors.payment_analyzer import inspect_image_basic
from app.detectors.rule_engine import run_comprehensive_rule_engine


async def analyze_image(
    image_bytes: Optional[bytes] = None,
    context_description: Optional[str] = None
) -> AnalysisResponse:
    """Forensically inspects media, scam ads, counterfeit notices, and suspect images using Gemma 4 Vision."""
    b64_image = None
    img_meta: Dict[str, Any] = {}
    observations: List[str] = []

    if image_bytes:
        img_meta, err = inspect_image_basic(image_bytes)
        if err:
            return AnalysisResponse(
                title="Corrupted Image File",
                risk_score=85,
                risk_level="critical",
                summary="The submitted file could not be decoded as a valid image format.",
                claim="Image evidence submission",
                observations=["File is corrupted or in an unsupported format."],
                signals=[SignalItem(
                    name="Unreadable Image",
                    severity="high",
                    description=err
                )],
                unknowns=["Cannot perform forensic visual inspection."],
                actions=["Upload a standard PNG, JPEG, or WebP file."],
                metadata={},
                timestamp=get_iso_timestamp()
            )

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        observations.append(f"Visual file: {img_meta['width']}x{img_meta['height']} pixels ({img_meta['format']}).")
        observations.append(f"Aspect ratio: {img_meta['aspect_ratio']}, File size: {round(img_meta['bytes_size'] / 1024, 1)} KB.")
    else:
        observations.append("Visual evidence assessment based on user-provided claim description (No image file attached).")

    if context_description:
        observations.append(f"User-provided context: {context_description}")

    signals: List[SignalItem] = []
    actions: List[str] = [
        "Do not make purchasing, investment, or identity decisions based on unverified digital images or certificates.",
        "Perform a reverse image search on major search engines to check if the image has been recycled across known scam campaigns.",
        "Verify any organizational seal, award, or government notice directly through the entity's verified .gov or official top-level portal."
    ]
    unknowns: List[str] = [
        "Forensic limitation: Without raw EXIF camera metadata and original RAW sensors, pixel editing and AI generation cannot be 100% conclusively certified.",
        "Cannot verify legal validity of displayed seals or signatures from a compressed image."
    ]

    claim = "The submitted visual material presents claims or announcements intended to establish credibility or elicit action."
    summary = "Visual evidence inspection complete. Review observed signals and contextual limitations."
    ai_analysis = None
    model_used = "deterministic-rule-engine"
    risk_score = 30

    # Rule-based inspection of user-provided context
    if context_description and context_description.strip():
        c_score, c_signals, c_obs, c_actions, _, c_claim, c_summary = run_comprehensive_rule_engine(
            context_description, channel="image"
        )
        for s in c_signals:
            signals.append(s)
        for obs in c_obs:
            observations.append(obs)
        for act in c_actions:
            if act not in actions:
                actions.append(act)
        risk_score = max(risk_score, c_score)
        claim = c_claim
        summary = c_summary

    # Gemma 4 Vision Inference if AI_PROVIDER is ollama and image is uploaded
    if AI_PROVIDER == "ollama" and b64_image:
        try:
            context_prompt = f"{IMAGE_EVIDENCE_PROMPT}\n\nContext provided by user: {context_description or 'None'}"
            ai_result = await ollama_client.generate_json(
                prompt=context_prompt,
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
                                description=ws.get("description", "Identified by Gemma 4 forensic vision."),
                                evidence=ws.get("evidence")
                            ))
                if ai_result.get("actions") and isinstance(ai_result["actions"], list):
                    for act in ai_result["actions"]:
                        if act not in actions:
                            actions.insert(0, act)
                if ai_result.get("unknowns") and isinstance(ai_result["unknowns"], list):
                    for unk in ai_result["unknowns"]:
                        if unk not in unknowns:
                            unknowns.append(unk)
        except Exception:
            pass


    # Score calculation
    if any(s.severity == "critical" for s in signals):
        risk_score = 80
    elif any(s.severity == "high" for s in signals):
        risk_score = 65
    elif len(signals) > 0:
        risk_score = 45
    else:
        risk_score = 25

    risk_level = calculate_risk_level(risk_score)
    title = f"{risk_level.capitalize()} Risk Visual Content" if risk_score >= 50 else "Visual Evidence Inspected (Exercise Due Diligence)"

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
            "context": context_description
        },
        ai_analysis=ai_analysis,
        model_used=model_used,
        timestamp=get_iso_timestamp()
    )
