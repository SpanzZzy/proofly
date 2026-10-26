"""Proofly FastAPI Backend Application."""

import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import (
    CORS_ORIGINS,
    OLLAMA_MODEL,
    MAX_IMAGE_SIZE_BYTES,
    ALLOWED_IMAGE_TYPES
)
from app.schemas import (
    HealthResponse,
    ModelsResponse,
    AnalysisResponse,
    MessageAnalysisRequest,
    UrlAnalysisRequest,
    EmailAnalysisRequest,
    PhoneAnalysisRequest,
)
from app.ai.ollama_client import ollama_client
from app.detectors.message_analyzer import analyze_message
from app.detectors.url_analyzer import analyze_url
from app.detectors.email_analyzer import analyze_email
from app.detectors.phone_analyzer import analyze_phone
from app.detectors.payment_analyzer import analyze_payment
from app.detectors.image_analyzer import analyze_image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("proofly")

app = FastAPI(
    title="Proofly Security & Evidence Verification API",
    description="Privacy-first, local-inference digital forensics engine powered by Gemma 4 and deterministic heuristics.",
    version="1.0.0"
)

# CORS configuration strictly bound to local development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
async def get_health():
    """System health check and Ollama connection status."""
    connected, models = await ollama_client.check_health()
    active_model_found = OLLAMA_MODEL in models
    return HealthResponse(
        status="ok",
        version="1.0.0",
        engine="Proofly Hybrid Security Engine",
        ollama_connected=connected,
        ollama_model=OLLAMA_MODEL,
        active_model_found=active_model_found
    )


@app.get("/api/models", response_model=ModelsResponse)
async def get_models():
    """Returns local model status and available Ollama models."""
    connected, models = await ollama_client.check_health()
    return ModelsResponse(
        default_model=OLLAMA_MODEL,
        available_models=models,
        ollama_status="connected" if connected else "offline (rule-based fallback active)"
    )


@app.post("/api/analyze/message", response_model=AnalysisResponse)
async def endpoint_analyze_message(req: MessageAnalysisRequest):
    """Analyzes SMS, WhatsApp, and social chat text for scam and manipulation patterns."""
    try:
        return await analyze_message(req)
    except Exception as e:
        logger.error(f"Error in message analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {str(e)}"
        )


@app.post("/api/analyze/url", response_model=AnalysisResponse)
async def endpoint_analyze_url(req: UrlAnalysisRequest):
    """Performs static heuristic inspection on a URL or domain without initiating outbound network requests."""
    try:
        return await analyze_url(req)
    except Exception as e:
        logger.error(f"Error in URL analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"URL inspection error: {str(e)}"
        )


@app.post("/api/analyze/email", response_model=AnalysisResponse)
async def endpoint_analyze_email(
    text: Optional[str] = Form(None),
    sender: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    raw_headers: Optional[str] = Form(None),
    eml_file: Optional[UploadFile] = File(None)
):
    """Forensic email investigation supporting pasted text, headers, and .eml file uploads."""
    try:
        raw_eml_bytes = None
        if eml_file:
            raw_eml_bytes = await eml_file.read()
            if len(raw_eml_bytes) > MAX_IMAGE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Uploaded .eml file exceeds 10MB limit."
                )

        req = EmailAnalysisRequest(
            text=text,
            sender=sender,
            subject=subject,
            raw_headers=raw_headers
        )
        return await analyze_email(req, raw_eml_bytes=raw_eml_bytes)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in email analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email forensics error: {str(e)}"
        )


@app.post("/api/analyze/phone", response_model=AnalysisResponse)
async def endpoint_analyze_phone(req: PhoneAnalysisRequest):
    """Caller Intelligence: Numbering-plan analysis and scam call transcript forensics."""
    try:
        return await analyze_phone(req)
    except Exception as e:
        logger.error(f"Error in phone analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Caller intelligence error: {str(e)}"
        )


@app.post("/api/analyze/payment", response_model=AnalysisResponse)
async def endpoint_analyze_payment(
    image: UploadFile = File(...),
    claimed_amount: Optional[str] = Form(None),
    currency: Optional[str] = Form("INR"),
    notes: Optional[str] = Form(None)
):
    """Payment Proof Lab: Forensic verification of UPI screenshots, receipts, and bank transfer slips."""
    try:
        content_type = image.content_type or ""
        if content_type.lower() not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Please upload PNG, JPEG, or WebP."
            )

        image_bytes = await image.read()
        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file exceeds 10MB limit."
            )

        return await analyze_payment(
            image_bytes=image_bytes,
            claimed_amount=claimed_amount,
            currency=currency,
            transaction_notes=notes
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in payment analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification error: {str(e)}"
        )


@app.post("/api/analyze/image", response_model=AnalysisResponse)
async def endpoint_analyze_image(
    image: UploadFile = File(...),
    context_description: Optional[str] = Form(None)
):
    """Image Evidence Inspector: Visual forensics for scam advertisements, fake notices, and impersonation media."""
    try:
        content_type = image.content_type or ""
        if content_type.lower() not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type '{content_type}'. Please upload PNG, JPEG, or WebP."
            )

        image_bytes = await image.read()
        if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file exceeds 10MB limit."
            )

        return await analyze_image(
            image_bytes=image_bytes,
            context_description=context_description
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in image evidence inspection: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image forensics error: {str(e)}"
        )
