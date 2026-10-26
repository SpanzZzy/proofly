"""
Proofly Authenticated AI Gateway for Local Ollama Gemma 4 Inference.

Runs on macOS listening strictly on 127.0.0.1:8765.
Proxies only permitted inference endpoints to local Ollama (127.0.0.1:11434).
Secured with timing-safe bearer token authentication.
Blocks all model management endpoints (pull, delete, create, copy, push).
"""

import os
import sys
import time
import secrets
import asyncio
import logging
from typing import Optional
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
import httpx

# Configure minimal privacy-first logging (ZERO user evidence or payload logging)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [GATEWAY] %(message)s"
)
logger = logging.getLogger("proofly.gateway")

# Configuration
OLLAMA_TARGET_URL = os.getenv("OLLAMA_TARGET_URL", "http://localhost:11434").rstrip("/")
GATEWAY_PORT = int(os.getenv("OLLAMA_GATEWAY_PORT", "8765"))
GATEWAY_HOST = "127.0.0.1"  # STRICT: never bind to 0.0.0.0

# Gateway Token Configuration
EXPECTED_TOKEN = os.getenv("OLLAMA_GATEWAY_TOKEN", "").strip()
if not EXPECTED_TOKEN:
    # Auto-generate a secure 32-byte hex token if none provided in environment
    EXPECTED_TOKEN = secrets.token_hex(32)
    os.environ["OLLAMA_GATEWAY_TOKEN"] = EXPECTED_TOKEN
    logger.info("No OLLAMA_GATEWAY_TOKEN provided in environment.")
    logger.info("Generated one-time secure gateway token: %s", EXPECTED_TOKEN)

# Constraints
MAX_PAYLOAD_SIZE = int(os.getenv("GATEWAY_MAX_PAYLOAD_BYTES", str(10 * 1024 * 1024)))  # 10 MB limit
FORWARD_TIMEOUT = float(os.getenv("GATEWAY_FORWARD_TIMEOUT", "120.0"))  # 120s for local neural inference
MAX_CONCURRENCY = int(os.getenv("GATEWAY_CONCURRENCY", "2"))  # Protect Mac CPU/Metal from saturation
inference_semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

# Permitted endpoints: strictly allow read-only tags and inference generation
ALLOWED_METHODS_AND_PATHS = {
    ("GET", "/api/tags"),
    ("POST", "/api/generate"),
    ("POST", "/api/chat"),
    ("GET", "/api/version"),
    ("GET", "/health"),
}

app = FastAPI(
    title="Proofly Authenticated Ollama AI Gateway",
    description="Minimal, hardened local proxy for Gemma 4 inference through Cloudflare Quick Tunnel",
    version="1.0.0",
    docs_url=None,  # Disable public OpenAPI documentation on gateway
    redoc_url=None
)


def verify_bearer_token(request: Request) -> bool:
    """Verifies the Authorization Bearer token using constant-time comparison."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header:
        return False

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return False

    provided_token = parts[1].strip()
    return secrets.compare_digest(provided_token, EXPECTED_TOKEN)


@app.middleware("http")
async def security_and_privacy_middleware(request: Request, call_next):
    """
    Enforces payload size limits, endpoint whitelisting, authentication,
    and privacy-preserving minimal logging.
    """
    start_time = time.time()
    method = request.method.upper()
    path = request.url.path.rstrip("/")
    if not path:
        path = "/"

    # 1. Self-health check (accessible for gateway heartbeat verification)
    if path == "/health" and method == "GET":
        return JSONResponse({
            "status": "ok",
            "service": "proofly-ai-gateway",
            "model_configured": "gemma4:e2b",
            "authenticated": verify_bearer_token(request)
        })

    # 2. Strict Endpoint Whitelist Check
    if (method, path) not in ALLOWED_METHODS_AND_PATHS:
        logger.warning("Blocked forbidden endpoint attempt: %s %s", method, path)
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": "Forbidden: Model management and arbitrary endpoints are blocked by security policy."
            }
        )

    # 3. Timing-Safe Authentication Check
    if not verify_bearer_token(request):
        logger.warning("Unauthorized access attempt on: %s %s", method, path)
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized: Missing or invalid Bearer gateway token."},
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 4. Payload Size Enforcement
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_PAYLOAD_SIZE:
        logger.warning("Rejected oversized payload: %s bytes", content_length)
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"error": f"Payload exceeds {MAX_PAYLOAD_SIZE // (1024 * 1024)}MB size limit."}
        )

    # Execute downstream request
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 1)

    # Minimal privacy log: logs path, status, and latency. ZERO user prompts/evidence recorded.
    logger.info("%s %s -> %s (%sms)", method, path, response.status_code, duration_ms)
    return response


@app.get("/api/tags")
async def proxy_tags():
    """Proxies model tags check to local Ollama."""
    try:
        async with httpx.AsyncClient(timeout=5.0, trust_env=False) as client:
            res = await client.get(
                f"{OLLAMA_TARGET_URL}/api/tags",
                headers={"Host": "localhost"}
            )
            return Response(
                content=res.content,
                status_code=res.status_code,
                headers={"Content-Type": res.headers.get("Content-Type", "application/json")}
            )
    except Exception as e:
        logger.error("Local Ollama connection failed: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Local Ollama daemon unreachable on Mac (localhost:11434)."}
        )


@app.get("/api/version")
async def proxy_version():
    """Proxies version check to local Ollama."""
    try:
        async with httpx.AsyncClient(timeout=5.0, trust_env=False) as client:
            res = await client.get(
                f"{OLLAMA_TARGET_URL}/api/version",
                headers={"Host": "localhost"}
            )
            return Response(
                content=res.content,
                status_code=res.status_code,
                headers={"Content-Type": res.headers.get("Content-Type", "application/json")}
            )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "Local Ollama daemon unreachable."}
        )


@app.post("/api/generate")
async def proxy_generate(request: Request):
    """
    Proxies generation requests to local Ollama under concurrency semaphore.
    Transparently supports model alias 'gemma4' -> 'gemma4:e2b'.
    """
    raw_body = await request.body()
    if len(raw_body) > MAX_PAYLOAD_SIZE:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"error": "Request body exceeds maximum size limit."}
        )

    # Map generic model name if specified
    try:
        import json
        body_json = json.loads(raw_body)
        if body_json.get("model") == "gemma4":
            body_json["model"] = "gemma4:e2b"
            forward_body = json.dumps(body_json).encode("utf-8")
        else:
            forward_body = raw_body
    except Exception:
        forward_body = raw_body

    # Acquire semaphore to prevent saturating local Mac resources
    try:
        async with inference_semaphore:
            async with httpx.AsyncClient(timeout=FORWARD_TIMEOUT, trust_env=False) as client:
                res = await client.post(
                    f"{OLLAMA_TARGET_URL}/api/generate",
                    content=forward_body,
                    headers={"Host": "localhost", "Content-Type": "application/json"}
                )
                return Response(
                    content=res.content,
                    status_code=res.status_code,
                    headers={"Content-Type": res.headers.get("Content-Type", "application/json")}
                )
    except httpx.TimeoutException:
        logger.warning("Local Ollama inference timed out after %ss", FORWARD_TIMEOUT)
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={"error": f"Local inference timed out after {FORWARD_TIMEOUT}s."}
        )
    except Exception as e:
        logger.error("Inference proxy error: %s", e)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": f"Failed to communicate with local Ollama: {str(e)}"}
        )


@app.post("/api/chat")
async def proxy_chat(request: Request):
    """Proxies conversational requests to local Ollama."""
    raw_body = await request.body()
    if len(raw_body) > MAX_PAYLOAD_SIZE:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"error": "Request body exceeds maximum size limit."}
        )

    try:
        async with inference_semaphore:
            async with httpx.AsyncClient(timeout=FORWARD_TIMEOUT, trust_env=False) as client:
                res = await client.post(
                    f"{OLLAMA_TARGET_URL}/api/chat",
                    content=raw_body,
                    headers={"Host": "localhost", "Content-Type": "application/json"}
                )
                return Response(
                    content=res.content,
                    status_code=res.status_code,
                    headers={"Content-Type": res.headers.get("Content-Type", "application/json")}
                )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": f"Chat proxy error: {str(e)}"}
        )


if __name__ == "__main__":
    import uvicorn
    print("=" * 65)
    print("🚀 PROOFLY AUTHENTICATED AI GATEWAY")
    print("=" * 65)
    print(f"• Listening on:        http://{GATEWAY_HOST}:{GATEWAY_PORT} (Localhost ONLY)")
    print(f"• Forwarding target:   {OLLAMA_TARGET_URL}")
    print(f"• Active Model:        gemma4:e2b")
    print(f"• Gateway Bearer Token: {EXPECTED_TOKEN}")
    print("=" * 65)
    print("To expose via Cloudflare Quick Tunnel (Free, no account needed):")
    print(f"  cloudflared tunnel --url http://{GATEWAY_HOST}:{GATEWAY_PORT}")
    print("=" * 65)
    uvicorn.run(app, host=GATEWAY_HOST, port=GATEWAY_PORT, log_level="info")
