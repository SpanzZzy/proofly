"""Pydantic schemas for Proofly API requests and responses."""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


RiskLevel = Literal["low", "medium", "high", "critical"]
SeverityLevel = Literal["low", "medium", "high", "critical", "info"]


class SignalItem(BaseModel):
    name: str = Field(..., description="Short name of the signal/warning sign")
    severity: SeverityLevel = Field("medium", description="Severity level of the warning sign")
    description: str = Field(..., description="Detailed explanation of the suspicious signal")
    evidence: Optional[str] = Field(None, description="Exact substring or observation supporting this signal")


class AnalysisResponse(BaseModel):
    title: str = Field(..., description="Descriptive headline of the analysis result")
    risk_score: int = Field(..., ge=0, le=100, description="Risk indicator from 0 (very low) to 100 (extreme danger)")
    risk_level: RiskLevel = Field(..., description="Risk categorization")
    summary: str = Field(..., description="Executive summary of the investigation")
    
    # Signature Feature: CLAIM VS EVIDENCE
    claim: str = Field(..., description="THE CLAIM: What the submitted content wants the recipient to believe")
    observations: List[str] = Field(default_factory=list, description="WHAT WE OBSERVED: Directly visible facts in the submission")
    signals: List[SignalItem] = Field(default_factory=list, description="WARNING SIGNS: Specific suspicious indicators detected")
    unknowns: List[str] = Field(default_factory=list, description="WHAT WE CANNOT VERIFY: Technical limitations and missing context")
    actions: List[str] = Field(default_factory=list, description="YOUR NEXT MOVE: Safe, independent verification checklist")
    
    disclaimer: str = Field(
        default="This is an automated risk assessment designed for preliminary screening. It is not legal proof or a substitute for independent verification through official institutions.",
        description="Legal and analytical disclaimer"
    )
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Structured technical metadata extracted during analysis")
    ai_analysis: Optional[str] = Field(None, description="Contextual reasoning synthesized by Gemma 4")
    model_used: str = Field("gemma4:e2b", description="AI model or engine utilized")
    timestamp: str = Field(..., description="ISO 8601 timestamp of analysis")


# Request Models

class MessageAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Message text from SMS, WhatsApp, social media, or chats")
    channel: Optional[str] = Field("other", description="Communication channel: sms, whatsapp, telegram, email, social, other")


class UrlAnalysisRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=4096, description="URL or domain string to inspect statically")


class EmailAnalysisRequest(BaseModel):
    text: Optional[str] = Field(None, description="Email body text or full raw email content")
    sender: Optional[str] = Field(None, description="Sender display name and/or address")
    subject: Optional[str] = Field(None, description="Subject line of the email")
    raw_headers: Optional[str] = Field(None, description="Raw MIME headers if available")


class PhoneAnalysisRequest(BaseModel):
    phone_number: str = Field(..., min_length=3, max_length=30, description="Phone number string to parse and check")
    country_code: Optional[str] = Field("IN", description="Two-letter ISO country code for default region (default 'IN')")
    claimed_org: Optional[str] = Field(None, description="Organization or identity the caller claimed to represent")
    call_description: Optional[str] = Field(None, max_length=10000, description="Description or transcript of the call conversation")


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    engine: str = "Proofly Hybrid Security Engine"
    ai_provider: str = "rules"
    ollama_connected: bool
    ollama_model: str
    active_model_found: bool



class ModelsResponse(BaseModel):
    default_model: str
    available_models: List[str]
    ollama_status: str
