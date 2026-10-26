# Proofly

> **"Trust, but verify."**  
> *The internet can fake anything. Know what to trust.*

Proofly is an open-source, privacy-first digital forensics and evidence verification platform built for **Hacktoberfest Hack Day Pune (October 26, 2026)**. It helps citizens and organizations examine suspicious messages, deceptive websites, fraudulent emails, scam calls, and questionable payment proofs before they act.

Proofly pairs deterministic cybersecurity rules with local **Gemma 4** semantic and multimodal vision intelligence running privately via **Ollama**, ensuring **100% offline data sovereignty** with zero reliance on cloud APIs or paid services.
---
## 🌟 Key Highlights

- **Stellar-Inspired Minimalist SaaS UI**: Clean editorial aesthetic, Inter typography, subtle card borders, dual light/dark theme system, and custom CSS animations.
- **Six Functional Investigation Modules**:
  1. 💬 **Message Scam Detector**: SMS, WhatsApp, and chat screening for urgency, OTP solicitation, and fake jobs.
  2. 🔗 **Website / URL Inspector**: Zero-fetch static heuristic analysis for Punycode (`xn--`), raw IP hosts, UserInfo `@` tricks, and brand mimicry.
  3. ✉️ **Email Forensics Lab**: MIME header parsing, From vs Reply-To domain mismatches, SPF/DKIM verification, and BEC wire fraud alerts.
  4. 📞 **Caller Intelligence**: Phone number formatting (E.164) via `phonenumbers`, region metadata, and detection of Digital Arrest and AnyDesk extortion scripts.
  5. 🧾 **Payment Proof Lab**: Vision-based audit of UPI/bank transfer screenshots, status validation, missing 12-digit UTR flags, and bank balance reconciliation rules.
  6. 🖼️ **Image Evidence Inspector**: Visual forensic breakdown of flash discount advertisements, false seals, and suspicious certificates.
- **Signature Feature — Claim vs Evidence Workspace**:
  - **The Claim**: What the submitted content wants you to believe.
  - **What We Observed**: Direct, observable facts visible in the content.
  - **Warning Signs**: Specific suspicious indicators with severity badges and interactive accordions.
  - **What We Cannot Verify**: Explicit unknowns, technical boundaries, and spoofing limitations.
  - **Your Next Move**: Actionable, independent verification checklist.
- **Zero-Fetch SSRF Defense**: URL inspection never visits or sends packets to the target domain.
- **Audio Readout & Export**: Native Web Speech narration, JSON export, and print-ready reports.
- **Local Investigation History**: Private browser storage (`localStorage`) with one-click restore and purge.

---

## 🛠️ Architecture & Tech Stack

```
Frontend: Next.js 16 (App Router), React 19, TypeScript (Strict), Tailwind CSS v4, Lucide Icons
Backend:  Python 3.9+, FastAPI, Uvicorn, Pydantic v2, Pillow, Phonenumbers, Pytest
Modes:    Deterministic Rules Engine (AI_PROVIDER=rules) & Local Gemma 4 AI (AI_PROVIDER=ollama via Ollama)
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed structural diagrams and component workflows.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- macOS or Linux with 16 GB RAM recommended
- [Ollama](https://ollama.com/) installed
- Gemma 4 downloaded (`ollama pull gemma4:e2b`)
- Python 3.9+ and Node.js 18+

### 1. Start Ollama with Gemma 4
```bash
ollama run gemma4:e2b "Proofly active"
```
The Ollama API will be accessible at `http://127.0.0.1:11434`.

### 2. Set Up Python Backend Engine
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
PYTHONPATH=backend pytest backend/tests/ -v
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

### 3. Launch Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📄 License

Licensed under the [MIT License](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for open-source dependencies and notices.
