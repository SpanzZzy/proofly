"""Shared utility functions for Proofly detectors and engine."""

import re
import html
from datetime import datetime, timezone
from typing import List, Tuple
from urllib.parse import urlparse

# URL extraction regex that avoids matching trailing punctuation
URL_REGEX = re.compile(
    r'(?i)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))'
)


def get_iso_timestamp() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


def calculate_risk_level(score: int) -> str:
    """Map numeric risk score (0-100) to standardized RiskLevel category."""
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 25:
        return "medium"
    return "low"


def extract_urls_from_text(text: str) -> List[str]:
    """Safely extracts all URLs from raw unstructured text."""
    if not text:
        return []
    matches = URL_REGEX.findall(text)
    urls = []
    for match in matches:
        raw_url = match[0] if isinstance(match, tuple) else match
        if not raw_url.startswith(("http://", "https://")):
            raw_url = "http://" + raw_url
        urls.append(raw_url)
    return list(dict.fromkeys(urls))  # deduplicate preserving order


def clean_html_to_text(html_content: str) -> str:
    """Safely strips HTML tags and entities to plain text without executing scripts."""
    if not html_content:
        return ""
    # Strip script and style tags completely
    text = re.sub(r'(?is)<(script|style).*?>.*?(</\1>)', '', html_content)
    # Strip all remaining tags
    text = re.sub(r'<[^<]+?>', ' ', text)
    # Unescape HTML entities
    text = html.unescape(text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text
