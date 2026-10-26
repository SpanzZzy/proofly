# Contributing to Proofly

We welcome contributions to Proofly! Whether you are expanding phishing heuristics, adding regional telecom rules, improving multimodal prompts, or refining the frontend user experience, your help is appreciated.

## Getting Started

1. **Fork and Clone** the repository.
2. Set up the Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```
3. Set up the Next.js frontend:
   ```bash
   cd frontend
   npm install
   ```

## Development Guidelines

- **Privacy First**: Never introduce cloud dependencies or external third-party telemetry calls for primary inference. Proofly must remain fully functional offline.
- **SSRF Defense**: The URL analyzer must never issue outbound HTTP requests to user-submitted domains.
- **Claim vs Evidence**: Any new detector must produce output conforming to the 5-part `AnalysisResponse` schema (The Claim, What We Observed, Warning Signs, What We Cannot Verify, Your Next Move).
- **Testing**: Run pytest before opening a pull request:
   ```bash
   source .venv/bin/activate
   PYTHONPATH=backend pytest backend/tests/ -v
   ```
- **Frontend Code Quality**:
   ```bash
   cd frontend
   npm run build
   ```

## Code of Conduct

Be welcoming, inclusive, and respectful of all contributors. Proofly is dedicated to empowering everyday citizens and businesses against cyber fraud.
