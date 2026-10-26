# Third-Party Notices & Attribution

Proofly is developed for **Hacktoberfest Hack Day Pune (October 26, 2026)**.

## Third-Party Open Source Notices

Portions of this software incorporate concepts and baseline heuristics licensed under the MIT License:
- **License**: MIT License
- **Attribution**: Cybersecurity screening heuristics and detection pattern architectures.

### Original Proofly Functionality:
1. **Python-Based Gemma 4 Local Inference Engine**: Native async client interfacing with local Ollama MLX runner on Apple Silicon.
2. **Email Forensics Module**: Full MIME multipart parsing, From vs Reply-To/Return-Path mismatch detection, SPF/DKIM/DMARC analysis, and attachment threat flagging.
3. **Caller Intelligence Module**: Telephone number normalization using Google's `phonenumbers` library, telecom metadata, and detection of high-impact conversational tactics (Digital Arrests, fake police, AnyDesk remote-access lures).
4. **Payment Proof Lab**: Vision-based inspection of UPI screenshots, UTR extraction, status ambiguity checks, and explicit bank balance reconciliation principles.
5. **Image Evidence Inspector**: Visual forensic analysis of scam ads, false discount claims, and counterfeit documents.
6. **Claim vs Evidence Signature Workspace**: 5-part evidence breakdown separating "The Claim", "What We Observed", "Warning Signs", "What We Cannot Verify", and "Your Next Move".
7. **Original Stellar-Inspired Minimalist SaaS UI**: Clean black-and-white editorial aesthetic, custom globals.css animations, audio speech readouts, local export reports, and zero-telemetry architecture.

---

## Open-Source Libraries Used

### Backend Dependencies:
- **FastAPI**: Licensed under the MIT License. Copyright (c) Sebastián Ramírez.
- **Uvicorn**: Licensed under the BSD 3-Clause License. Copyright (c) Encode OSS Ltd.
- **Pydantic**: Licensed under the MIT License. Copyright (c) Samuel Colvin.
- **Ollama Python SDK**: Licensed under the MIT License. Copyright (c) Ollama.
- **Pillow (PIL)**: Licensed under the HPND License. Copyright (c) Jeffrey A. Clark (Alex) and contributors.
- **Phonenumbers**: Licensed under the Apache License 2.0. Copyright (c) The Android Open Source Project.
- **HTTPX**: Licensed under the BSD 3-Clause License. Copyright (c) Encode OSS Ltd.
- **Pytest**: Licensed under the MIT License. Copyright (c) Holger Krekel and pytest-dev team.

### Frontend Dependencies:
- **Next.js**: Licensed under the MIT License. Copyright (c) Vercel, Inc.
- **React**: Licensed under the MIT License. Copyright (c) Meta Platforms, Inc.
- **Tailwind CSS**: Licensed under the MIT License. Copyright (c) Tailwind Labs, Inc.
- **Lucide React**: Licensed under the ISC License. Copyright (c) Lucide Contributors.
- **Canvas Confetti**: Licensed under the ISC License. Copyright (c) Kiril Vatev.
