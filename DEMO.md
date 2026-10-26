# Proofly Live Hackathon Demonstration Guide

**Event**: Hacktoberfest Hack Day Pune, October 26, 2026  
**Tagline**: "Trust, but verify."  
**Stack**: Next.js 16, FastAPI, Ollama (`gemma4:e2b`), Tailwind CSS

---

## 1. Quick Startup Commands

### Terminal 1: Ollama Model
Verify that your local Ollama daemon is running with Gemma 4:
```bash
ollama run gemma4:e2b "Proofly active"
```

### Terminal 2: FastAPI Backend Engine
From the repository root:
```bash
source .venv/bin/activate
uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
Test health: `curl http://127.0.0.1:8000/api/health`

### Terminal 3: Next.js Frontend
```bash
cd frontend
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 2. Six Demonstration Scenarios (1-Click Testable)

Every module on the Proofly interface features **1-click example scenario buttons** for rapid evaluation:

### Scenario 1: Bank KYC & Account Block Threat (Messages Tab)
- Click **"Bank KYC & Account Block Threat"**
- Click **Analyze Message**
- **Outcome**: Critical Risk rating. The engine identifies artificial urgency, shortened URL camouflage (`bit.ly/sbi-kyc-verify`), and direct OTP solicitation. The verification roadmap instructs never to share OTPs and to check official banking portals directly.

### Scenario 2: Punycode IDN Homograph Exploit (Websites Tab)
- Click **"Punycode Homograph Mimic"** (`https://xn--pple-43d.com/login/auth-session`)
- Click **Inspect URL**
- **Outcome**: Critical Risk. Proofly detects internationalized domain spoofing where Cyrillic letters mimic a trusted brand. The Zero-Fetch guarantee confirms the URL was never requested over the network.

### Scenario 3: CEO Wire Fraud & Reply-To Mismatch (Emails Tab)
- Click **"CEO Impersonation & Wire Redirection"**
- Click **Perform Forensics**
- **Outcome**: Critical Risk. Shows sender domain divergence where visible display name says `@globaltech-holdings.com` but replies route to `executive-vault@offshore-pay.xyz`. Flags SPF/DKIM authentication failures.

### Scenario 4: Digital Arrest & CBI Extortion Call (Calls Tab)
- Click **"Digital Arrest / CBI Narcotics Threat"**
- Click **Inspect Caller**
- **Outcome**: Critical Risk. Parses the phone number metadata for Maharashtra, India, and identifies the trademark "Digital Arrest" coercion tactic. Highlights the critical limitation: caller ID is easily spoofed.

### Scenario 5: UPI Transfer Status Ambiguity (Payments Tab)
- Click **"UPI Transfer - Pending vs Completed"**
- Click **Verify Payment Proof**
- **Outcome**: Evaluates payment screenshot for ambiguous "Processing" or "Pending" indicators, alerting users that money was not yet credited.

### Scenario 6: 90% Discount Luxury Goods Ad (Images Tab)
- Click **"90% Discount Luxury Goods Ad"**
- Click **Examine Image Claim**
- **Outcome**: Detects high-risk urgency timers, unrealistic discounts, and credential harvesting patterns.
