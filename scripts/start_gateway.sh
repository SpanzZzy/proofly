#!/usr/bin/env bash
# ==============================================================================
# Proofly — Start Authenticated Local AI Gateway & Cloudflare Quick Tunnel Guide
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "================================================================="
echo "🛡️  PROOFLY LOCAL AUTHENTICATED AI GATEWAY"
echo "================================================================="

# 1. Check Python virtual environment
if [ -d ".venv" ]; then
    echo "✓ Activating virtual environment (.venv)..."
    source .venv/bin/activate
elif [ -n "$VIRTUAL_ENV" ]; then
    echo "✓ Using active virtual environment: $VIRTUAL_ENV"
else
    echo "⚠️  No .venv found. Attempting system python3..."
fi

# 2. Check local Ollama daemon
echo "• Checking local Ollama daemon on 127.0.0.1:11434..."
if ! curl -s --max-time 2 http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama is not responding on http://127.0.0.1:11434."
    echo "   Please open Ollama.app or run 'ollama serve' in another terminal."
    exit 1
fi
echo "✓ Local Ollama is active."

# 3. Check for Gemma 4 model
echo "• Verifying Gemma 4 model..."
if ! curl -s http://127.0.0.1:11434/api/tags | grep -q "gemma4"; then
    echo "⚠️  'gemma4' model not found in local Ollama."
    echo "   Please run: ollama pull gemma4:e2b"
    exit 1
fi
echo "✓ Gemma 4 model found."

# 4. Gateway Token Management
GATEWAY_ENV_FILE=".env.gateway"
if [ -f "$GATEWAY_ENV_FILE" ]; then
    source "$GATEWAY_ENV_FILE"
fi

if [ -z "$OLLAMA_GATEWAY_TOKEN" ]; then
    # Generate 64-character random hex token
    OLLAMA_GATEWAY_TOKEN=$(openssl rand -hex 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_hex(32))")
    echo "OLLAMA_GATEWAY_TOKEN=\"$OLLAMA_GATEWAY_TOKEN\"" > "$GATEWAY_ENV_FILE"
    echo "✓ Generated new gateway token and saved to $GATEWAY_ENV_FILE"
fi

export OLLAMA_GATEWAY_TOKEN
export OLLAMA_GATEWAY_PORT="8765"
export OLLAMA_TARGET_URL="http://127.0.0.1:11434"

echo ""
echo "================================================================="
echo "🔑 YOUR AUTHENTICATED GATEWAY DETAILS"
echo "================================================================="
echo "Local Gateway URL:  http://127.0.0.1:8765"
echo "Gateway Token:      $OLLAMA_GATEWAY_TOKEN"
echo ""
echo "-----------------------------------------------------------------"
echo "📡 STEP 1: EXPOSE VIA CLOUDFLARE QUICK TUNNEL"
echo "-----------------------------------------------------------------"
echo "In a SEPARATE terminal window on this Mac, run:"
echo ""
echo "   cloudflared tunnel --url http://127.0.0.1:8765"
echo ""
echo "Cloudflare will output a temporary URL like:"
echo "   https://random-words-here.trycloudflare.com"
echo ""
echo "-----------------------------------------------------------------"
echo "⚙️  STEP 2: SET RENDER ENVIRONMENT VARIABLES"
echo "-----------------------------------------------------------------"
echo "In your Render Dashboard (proofly-api-rhvd -> Environment):"
echo ""
echo "   AI_PROVIDER           = ollama"
echo "   OLLAMA_BASE_URL       = https://YOUR-TUNNEL-URL.trycloudflare.com"
echo "   OLLAMA_MODEL          = gemma4"
echo "   OLLAMA_GATEWAY_TOKEN  = $OLLAMA_GATEWAY_TOKEN"
echo ""
echo "-----------------------------------------------------------------"
echo "🔒 STEP 3: TEST AUTHENTICATION BEFORE PUBLIC USE"
echo "-----------------------------------------------------------------"
echo "Test unauthorized access (should return 401):"
echo "   curl -i http://127.0.0.1:8765/api/tags"
echo ""
echo "Test authorized access (should return 200):"
echo "   curl -i -H \"Authorization: Bearer $OLLAMA_GATEWAY_TOKEN\" http://127.0.0.1:8765/api/tags"
echo "================================================================="
echo "🚀 Starting Gateway on http://127.0.0.1:8765 (Press CTRL+C to stop)..."
echo ""

PYTHONPATH=. python3 -m uvicorn gateway.gateway:app --host 127.0.0.1 --port 8765 --no-access-log
