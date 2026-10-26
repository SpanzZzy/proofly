"""Client for communicating with local Ollama instance running Gemma 4."""

import json
import re
import logging
from typing import Optional, List, Dict, Any, Tuple
import httpx

from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT
from app.ai.prompts import SYSTEM_SECURITY_DIRECTIVE

logger = logging.getLogger("proofly.ai")


class OllamaClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = OLLAMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = OLLAMA_TIMEOUT

    async def check_health(self) -> Tuple[bool, List[str]]:
        """Check if local Ollama daemon is reachable and list models."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return True, models
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
        return False, []

    def _extract_json(self, raw_text: str) -> Optional[Dict[str, Any]]:
        """Robustly extracts JSON from an LLM response even if surrounded by thoughts or code fences."""
        if not raw_text:
            return None
            
        clean_text = raw_text.strip()
        
        # Strip thinking tags if model outputs <thought>...</thought>
        clean_text = re.sub(r"<thought>.*?</thought>", "", clean_text, flags=re.DOTALL).strip()
        
        # Try direct parse
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            pass

        # Match ```json ... ``` code fence
        fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean_text, re.DOTALL)
        if fence_match:
            try:
                return json.loads(fence_match.group(1))
            except json.JSONDecodeError:
                pass

        # Match outermost curly braces
        brace_match = re.search(r"(\{.*\})", clean_text, re.DOTALL)
        if brace_match:
            try:
                return json.loads(brace_match.group(1))
            except json.JSONDecodeError:
                pass

        logger.error(f"Failed to extract valid JSON from model response: {raw_text[:200]}...")
        return None

    async def generate_json(
        self,
        prompt: str,
        system: Optional[str] = None,
        images: Optional[List[str]] = None,
        timeout: Optional[float] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Sends an inference request to Ollama with prompt-injection defense.
        Returns parsed JSON dict or None if offline/failed.
        """
        system_prompt = (system or "") + "\n\n" + SYSTEM_SECURITY_DIRECTIVE
        req_timeout = timeout or self.timeout

        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,  # Low temperature for factual, analytical consistency
                "top_p": 0.9,
            }
        }

        if images:
            # images should be a list of base64-encoded strings (JPEG/PNG)
            payload["images"] = images

        try:
            async with httpx.AsyncClient(timeout=req_timeout) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    response_text = data.get("response", "")
                    return self._extract_json(response_text)
                else:
                    logger.warning(f"Ollama returned HTTP {res.status_code}: {res.text[:200]}")
        except httpx.ConnectError:
            logger.info("Ollama is not running. Operating in pure deterministic rule-based mode.")
        except httpx.TimeoutException:
            logger.warning(f"Ollama request timed out after {req_timeout}s.")
        except Exception as e:
            logger.warning(f"Ollama request error: {e}")

        return None


# Global singleton instance
ollama_client = OllamaClient()
