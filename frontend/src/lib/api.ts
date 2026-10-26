import { AnalysisResponse, HealthStatus } from "./types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: "degraded",
      version: "1.0.0",
      engine: "Proofly Local Engine",
      ollama_connected: false,
      ollama_model: "gemma4:e2b",
      active_model_found: false,
    };
  }
}

export async function analyzeMessage(text: string, channel: string = "other"): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, channel }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function analyzeUrl(url: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function analyzeEmail(formData: FormData): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/email`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function analyzePhone(params: {
  phoneNumber: string;
  countryCode?: string;
  claimedOrg?: string;
  callDescription?: string;
}): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: params.phoneNumber,
      country_code: params.countryCode || "IN",
      claimed_org: params.claimedOrg || null,
      call_description: params.callDescription || null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function analyzePayment(formData: FormData): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/payment`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}

export async function analyzeImage(formData: FormData): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/analyze/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `Server error (${res.status})`);
  }
  return res.json();
}
