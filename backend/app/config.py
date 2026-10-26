"""Configuration for Proofly backend."""

import os

# Server configuration
HOST = os.getenv("PROOFLY_HOST", "127.0.0.1")
PORT = int(os.getenv("PROOFLY_PORT", "8000"))

# Analysis Mode: 'ollama' (local development with Gemma 4) or 'rules' (production rule engine without AI)
AI_PROVIDER = os.getenv("AI_PROVIDER", "rules" if os.getenv("RENDER") else "ollama").strip().lower()
if AI_PROVIDER not in ("ollama", "rules"):
    AI_PROVIDER = "rules"

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e2b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "45.0"))


# Allowed CORS origins (reads from environment with fallback defaults)
DEFAULT_CORS_ORIGINS = [
    "https://proofly-brown.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]


def get_cors_origins() -> list:
    """Parse CORS_ORIGINS from environment variable with fallback defaults."""
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if not raw:
        return list(DEFAULT_CORS_ORIGINS)

    # Support JSON array format: ["https://proofly-brown.vercel.app"]
    if raw.startswith("[") and raw.endswith("]"):
        try:
            import json
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                origins = [str(o).strip().rstrip("/") for o in parsed if str(o).strip()]
                for default_origin in DEFAULT_CORS_ORIGINS:
                    if default_origin not in origins:
                        origins.append(default_origin)
                return origins
        except Exception:
            pass

    # Support comma-separated format: "https://proofly-brown.vercel.app,http://localhost:3000"
    origins = [item.strip().rstrip("/") for item in raw.split(",") if item.strip()]
    for default_origin in DEFAULT_CORS_ORIGINS:
        if default_origin not in origins:
            origins.append(default_origin)
    return origins


CORS_ORIGINS = get_cors_origins()

# Upload constraints
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
