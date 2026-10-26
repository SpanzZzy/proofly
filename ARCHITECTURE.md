# Proofly System Architecture

Proofly combines deterministic security heuristics with local multimodal AI inference via Gemma 4 running on Ollama.

```
┌────────────────────────────────────────────────────────┐
│               Proofly Next.js Frontend                 │
│      (Interactive Scanners, Dual Theme, Inter UI)      │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Localhost)
┌───────────────────────────▼────────────────────────────┐
│              Proofly FastAPI Backend Engine            │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │ Deterministic Rules   │   │ Gemma 4 Async Client │  │
│  │ (Regex, MIME, Telecom)│   │ (Ollama MLX Runner)  │  │
│  └───────────────────────┘   └──────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ http://127.0.0.1:11434
┌───────────────────────────▼────────────────────────────┐
│               Local Ollama Daemon                      │
│            Model: gemma4:e2b (Local Weights)           │
└────────────────────────────────────────────────────────┘
```

## Core Modules

1. **Message Scanner**: Scans text payloads for phishing urgency, OTP harvesting, and scam templates.
2. **Website Inspector**: Zero-fetch static analyzer evaluating Punycode, raw IPs, and UserInfo tricks.
3. **Email Forensics Lab**: Multipart MIME analyzer checking header divergences, SPF/DKIM flags, and BEC wire fraud patterns.
4. **Caller Intel**: Google `phonenumbers` metadata inspection combined with conversational coercion tactics.
5. **Payment Proof Lab**: Vision-based validation of UPI receipts and bank balance reconciliation.
6. **Image Inspector**: Visual forensics evaluating scam advertisements and credential lures.
