export type ToolType = "message" | "website" | "email" | "phone" | "payment" | "image";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface SignalItem {
  name: string;
  severity: "low" | "medium" | "high" | "critical" | "info";
  description: string;
  evidence?: string | null;
}

export interface AnalysisResponse {
  title: string;
  risk_score: number;
  risk_level: RiskLevel;
  summary: string;
  claim: string;
  observations: string[];
  signals: SignalItem[];
  unknowns: string[];
  actions: string[];
  disclaimer: string;
  metadata: Record<string, any>;
  ai_analysis?: string | null;
  model_used: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  engine: string;
  ollama_connected: boolean;
  ollama_model: string;
  active_model_found: boolean;
}

export interface HistoryItem {
  id: string;
  tool: ToolType;
  query: string;
  title: string;
  risk_score: number;
  risk_level: RiskLevel;
  timestamp: string;
  response: AnalysisResponse;
}
