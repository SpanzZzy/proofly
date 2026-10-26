# Proofly Privacy & Data Sovereignty Policy

**Effective Date**: October 26, 2026 (Hacktoberfest Hack Day Pune)  
**Core Promise**: "Trust, but verify." Zero cloud leakage, zero telemetry, 100% local processing.

---

## 1. Zero Cloud Transmission for Primary Inference

Proofly is engineered ground-up for complete user data sovereignty:
- **Local AI Execution**: All natural language, heuristic evaluation, and multimodal image inspection requests are sent exclusively to your local machine via `http://127.0.0.1:11434` (Ollama running `gemma4:e2b`).
- **No Third-Party AI APIs**: Proofly never transmits your emails, SMS messages, phone numbers, or payment screenshots to OpenAI, Google Cloud, Anthropic, AWS, or any remote AI provider.
- **Offline Capable**: Once dependencies and the Gemma 4 model weights are locally installed, Proofly functions completely without an active internet connection.

---

## 2. Zero-SSRF URL Inspection Architecture

When inspecting suspicious links, websites, or shortened URLs:
- **Static Pattern Parsing**: Proofly executes static structural analysis (checking for Punycode homographs, IP address hosts, UserInfo `@` deceptions, and known phishing path structures).
- **Zero Inbound/Outbound HTTP Requests**: Proofly NEVER makes an HTTP fetch, ping, or DNS lookup to untrusted submitted URLs. This eliminates the risk of Server-Side Request Forgery (SSRF), token beaconing, or notifying scammers that their lure was examined.

---

## 3. Investigation History & Local Storage

- **Client-Side Only**: Your investigation history is stored strictly in your browser's `localStorage` (`proofly_history_v1`).
- **No Remote Database**: There is no remote database, user analytics tracking, or session recording.
- **Instant Purge**: You can purge all stored investigations at any time with a single click using the "Clear History" button in the Investigation History drawer.

---

## 4. Open-Source Verification

Every line of code responsible for handling, parsing, and scoring submitted evidence is open source under the MIT License and inspectable in the `backend/` and `frontend/` directories.

---

## 5. Temporary Cloudflare Quick Tunnel / Hosted Showcase Privacy Notice

During the hackathon public showcase, online AI inference requests submitted through the hosted platform are processed directly by the developer's local hardware (Apple Silicon Mac running Gemma 4 on Ollama) via an encrypted, authenticated Cloudflare Quick Tunnel:
- **No Third-Party AI Services**: Requests do not pass through commercial cloud AI APIs.
- **Zero Evidence Logging**: The local AI gateway explicitly suppresses body payload logging. User messages, screenshots, and call transcripts are processed purely in volatile RAM and immediately discarded.
- **Hardened Model Access**: The tunnel terminates at an authenticated local proxy listening exclusively on `127.0.0.1:8765` with timing-safe bearer token validation. All Ollama administrative endpoints (e.g. model downloads, deletions) are hard-blocked.

