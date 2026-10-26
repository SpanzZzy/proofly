"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Download,
  Printer,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Cpu,
} from "lucide-react";
import { AnalysisResponse } from "@/lib/types";
import { useToast } from "@/components/Toast";

interface ClaimVsEvidenceProps {
  response: AnalysisResponse;
  onReset?: () => void;
}

export default function ClaimVsEvidence({ response, onReset }: ClaimVsEvidenceProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [expandedSignals, setExpandedSignals] = useState<Record<number, boolean>>({});
  const [unknownsExpanded, setUnknownsExpanded] = useState(true);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [riskPopoverOpen, setRiskPopoverOpen] = useState(false);
  const { showToast } = useToast();

  const toggleSignal = (idx: number) => {
    setExpandedSignals((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getRiskBadge = (score: number, level: string) => {
    if (score >= 70 || level === "critical") {
      return {
        bg: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/60",
        pill: "bg-red-500",
        label: "CRITICAL RISK",
        desc: "Immediate threat detected. High probability of phishing, credential theft, or fraud.",
      };
    } else if (score >= 50 || level === "high") {
      return {
        bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
        pill: "bg-amber-500",
        label: "HIGH CAUTION",
        desc: "Severe red flags observed. Independent out-of-band verification is strongly advised.",
      };
    } else if (score >= 25 || level === "medium") {
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/60",
        pill: "bg-yellow-500",
        label: "MODERATE RISK",
        desc: "Suspicious characteristics present. Do not proceed without verifying authenticity.",
      };
    }
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60",
      pill: "bg-emerald-500",
      label: "LOW RISK / VERIFIED",
      desc: "No major deceptive signatures detected. Always follow standard security precautions.",
    };
  };

  const badge = getRiskBadge(response.risk_score, response.risk_level);

  const handleCopy = () => {
    const textToCopy = `PROOFLY FORENSIC REPORT: ${response.title}
Risk Score: ${response.risk_score}/100 (${response.risk_level.toUpperCase()})
Model: ${response.model_used}

THE CLAIM:
${response.claim}

WHAT WE OBSERVED:
${response.observations.map((o) => `• ${o}`).join("\n")}

WARNING SIGNS:
${response.signals.map((s) => `• [${s.severity.toUpperCase()}] ${s.name}: ${s.description}`).join("\n")}

YOUR NEXT MOVE:
${response.actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}

WHAT WE CANNOT VERIFY:
${response.unknowns.map((u) => `• ${u}`).join("\n")}

Disclaimer: ${response.disclaimer}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Forensic report summary copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `proofly-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("JSON report downloaded successfully!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSpeechToggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Speech synthesis is not supported on this browser.", "error");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      showToast("Audio readout paused.", "info");
      return;
    }

    const narration = `Proofly Forensic Result. ${response.title}. Risk assessment: ${response.risk_score} out of 100. ${response.summary}. The claim: ${response.claim}. Top recommended action: ${response.actions[0] || "Consult an official authority."}`;
    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    showToast("Starting audio speech readout...", "info");
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-xl overflow-hidden text-left animate-slide-up-overlay print-area transition-colors">
      {/* Top Banner / Headline */}
      <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-[#353742] bg-zinc-50/50 dark:bg-[#191B21]/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3 relative">
            {/* Risk Badge with Popover Trigger */}
            <button
              onClick={() => setRiskPopoverOpen(!riskPopoverOpen)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} transition-all hover:scale-105 cursor-pointer`}
              title="Click to view risk scoring criteria"
              aria-label={`Risk score ${response.risk_score} out of 100. ${badge.label}`}
            >
              <span className={`w-2 h-2 rounded-full ${badge.pill}`} />
              <span>{badge.label}</span>
              <span className="font-mono ml-1">({response.risk_score}/100)</span>
              <Info className="w-3 h-3 ml-1 opacity-70" />
            </button>

            {/* Risk Popover */}
            {riskPopoverOpen && (
              <div className="absolute top-9 left-0 z-30 w-72 p-3.5 rounded-2xl bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] shadow-2xl text-xs space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-[#F5F5F7]">
                  <span>Scoring Scale</span>
                  <button
                    onClick={() => setRiskPopoverOpen(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-[#F5F5F7]"
                    aria-label="Close popover"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-zinc-600 dark:text-[#A9ACB8] leading-normal">{badge.desc}</p>
                <div className="pt-2 border-t border-zinc-100 dark:border-[#353742] space-y-1 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400">0–24: Low Risk</span>
                    <span className="text-yellow-600 dark:text-yellow-400">25–49: Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600 dark:text-amber-400">50–69: High Caution</span>
                    <span className="text-red-600 dark:text-red-400">70–100: Critical</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setMethodologyModalOpen(true)}
              className="text-xs text-zinc-500 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] font-medium hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zinc-100/80 dark:bg-[#22242C] border border-zinc-200/80 dark:border-[#353742] transition-colors"
              title="Click to view local model inspection architecture"
            >
              <Cpu className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              <span>{response.model_used}</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2 no-print">
            <button
              onClick={handleSpeechToggle}
              className={`p-2 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                speaking
                  ? "bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] border-black dark:border-[#F5F5F7] scale-105"
                  : "bg-white dark:bg-[#22242C] text-zinc-700 dark:text-[#A9ACB8] border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932]"
              }`}
              title={speaking ? "Stop Speech Readout" : "Listen to Audio Summary"}
              aria-label="Speech Readout"
            >
              {speaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
              title="Copy Summary to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
              title="Download JSON Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer"
              title="Print-Friendly Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-[#F5F5F7]">
          {response.title}
        </h2>

        <p className="mt-2 text-sm md:text-base text-zinc-600 dark:text-[#A9ACB8] leading-relaxed font-normal">
          {response.summary}
        </p>
      </div>

      {/* Main Evidence Workspace */}
      <div className="p-6 md:p-8 space-y-8">
        {/* 1. THE CLAIM */}
        <div className="bg-zinc-50 dark:bg-[#22242C] rounded-2xl p-5 border border-zinc-200/80 dark:border-[#353742] transition-colors">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-zinc-500 dark:text-[#A9ACB8] uppercase mb-2">
            <FileText className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
            <span>The Claim</span>
          </div>
          <p className="text-base text-zinc-900 dark:text-[#F5F5F7] font-medium leading-relaxed">
            &ldquo;{response.claim}&rdquo;
          </p>
          <div className="mt-2 text-xs text-zinc-500 dark:text-[#A9ACB8]">
            What the submitted content wants the recipient or viewer to believe without external verification.
          </div>
        </div>

        {/* 2-Column: WHAT WE OBSERVED vs WARNING SIGNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* WHAT WE OBSERVED */}
          <div className="bg-white dark:bg-[#22242C] rounded-2xl p-5 border border-zinc-200 dark:border-[#353742] shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-zinc-700 dark:text-[#F5F5F7] uppercase mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>What We Observed</span>
              </div>
              <ul className="space-y-2.5 text-sm text-zinc-700 dark:text-[#A9ACB8]">
                {response.observations.length > 0 ? (
                  response.observations.map((obs, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-2 flex-shrink-0" />
                      <span>{obs}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-400 dark:text-zinc-500 text-xs italic">No specific artifacts recorded.</li>
                )}
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#353742] text-[11px] text-zinc-400 dark:text-zinc-500">
              Directly verifiable technical or structural facts present in the submission.
            </div>
          </div>

          {/* WARNING SIGNS ACCORDION */}
          <div className="bg-white dark:bg-[#22242C] rounded-2xl p-5 border border-zinc-200 dark:border-[#353742] shadow-sm flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-zinc-700 dark:text-[#F5F5F7] uppercase">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Warning Signs ({response.signals.length})</span>
                </div>
                {response.signals.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const allOpen = response.signals.every((_, i) => expandedSignals[i]);
                      const nextState: Record<number, boolean> = {};
                      response.signals.forEach((_, i) => {
                        nextState[i] = !allOpen;
                      });
                      setExpandedSignals(nextState);
                    }}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-black dark:text-[#A9ACB8] dark:hover:text-[#F5F5F7] transition-colors"
                  >
                    {response.signals.every((_, i) => expandedSignals[i]) ? "Collapse All" : "Expand All"}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {response.signals.length > 0 ? (
                  response.signals.map((sig, idx) => {
                    const isOpen = expandedSignals[idx] ?? true; // Default expanded for visibility
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border bg-zinc-50 dark:bg-[#191B21] border-zinc-200/80 dark:border-[#353742] text-xs transition-colors overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSignal(idx)}
                          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-[#22242C] transition-colors cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7]">{sig.name}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                sig.severity === "critical"
                                  ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                                  : sig.severity === "high"
                                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400"
                                  : "bg-zinc-200 dark:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8]"
                              }`}
                            >
                              {sig.severity}
                            </span>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 border-t border-zinc-200/50 dark:border-[#353742]/60 animate-fade-in-up">
                            <p className="text-zinc-600 dark:text-[#A9ACB8] leading-normal">{sig.description}</p>
                            {sig.evidence && (
                              <div className="mt-2 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#22242C] p-2 rounded-lg border border-zinc-100 dark:border-[#353742] break-all">
                                <strong>Evidence observed:</strong> {sig.evidence}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
                    No deceptive signatures or social-engineering warning signs detected.
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#353742] text-[11px] text-zinc-400 dark:text-zinc-500">
              Heuristic patterns correlated with fraud, phishing, and manipulation vectors.
            </div>
          </div>
        </div>

        {/* 3. YOUR NEXT MOVE (Action Roadmap) */}
        <div className="bg-zinc-900 dark:bg-[#101115] text-white rounded-2xl p-6 shadow-md border border-zinc-800 dark:border-[#353742]">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-zinc-400 uppercase mb-4">
            <ListOrdered className="w-4 h-4 text-emerald-400" />
            <span>Your Next Move — Verification Roadmap</span>
          </div>

          <div className="space-y-3 text-sm">
            {response.actions.map((act, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-zinc-800/80 dark:bg-[#191B21] p-3.5 rounded-xl border border-zinc-700/60 dark:border-[#353742]"
              >
                <span className="w-5 h-5 rounded-full bg-zinc-700 dark:bg-[#272932] text-zinc-200 dark:text-[#F5F5F7] text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-zinc-200 dark:text-[#F5F5F7] leading-snug">{act}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-zinc-400 dark:text-[#A9ACB8] italic">
            Always verify claims out-of-band through officially established websites or published telephone lines.
          </p>
        </div>

        {/* 4. WHAT WE CANNOT VERIFY (Unknowns & Limitations Accordion) */}
        <div className="bg-zinc-50 dark:bg-[#22242C] rounded-2xl border border-zinc-200 dark:border-[#353742] text-xs text-zinc-600 dark:text-[#A9ACB8] overflow-hidden">
          <button
            type="button"
            onClick={() => setUnknownsExpanded(!unknownsExpanded)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-100/60 dark:hover:bg-[#272932]/60 transition-colors cursor-pointer"
            aria-expanded={unknownsExpanded}
          >
            <div className="flex items-center space-x-2 font-bold tracking-wider text-zinc-700 dark:text-[#F5F5F7] uppercase">
              <HelpCircle className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <span>What We Cannot Verify — Technical Limitations ({response.unknowns.length})</span>
            </div>
            {unknownsExpanded ? (
              <ChevronUp className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            )}
          </button>
          {unknownsExpanded && (
            <div className="px-5 pb-5 pt-1 border-t border-zinc-200/50 dark:border-[#353742]/50 animate-fade-in-up">
              <ul className="space-y-1.5 list-disc list-inside">
                {response.unknowns.map((unk, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {unk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Disclaimer & Metadata Footer */}
        <div className="pt-4 border-t border-zinc-100 dark:border-[#353742] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 gap-2">
          <div>{response.disclaimer}</div>
          <div className="font-mono text-[11px]">
            Analyzed: {new Date(response.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {onReset && (
          <div className="flex justify-center pt-2 no-print">
            <button
              onClick={onReset}
              className="px-6 py-2.5 rounded-full bg-zinc-100 dark:bg-[#22242C] hover:bg-zinc-200 dark:hover:bg-[#272932] text-zinc-900 dark:text-[#F5F5F7] text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              Inspect Another Claim
            </button>
          </div>
        )}
      </div>

      {/* Forensic Methodology Dialog Modal */}
      {methodologyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-overlay">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMethodologyModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#191B21] rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-[#353742] z-10 animate-slide-up-overlay text-left">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#353742]">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-zinc-800 dark:text-[#F5F5F7]" />
                <h3 className="text-lg font-bold text-black dark:text-[#F5F5F7]">
                  Forensic Architecture &amp; Methodology
                </h3>
              </div>
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-black dark:hover:text-[#F5F5F7] hover:bg-zinc-100 dark:hover:bg-[#272932] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-zinc-600 dark:text-[#A9ACB8]">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-[#F5F5F7] mb-1">
                  1. Deterministic Heuristic Core
                </h4>
                <p>
                  High-speed Python analyzers parse raw string structure, Punycode Unicode conversions, IP address hosts, UserInfo (@) credentials, and suspicious top-level domains before invoking AI inference.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-[#F5F5F7] mb-1">
                  2. Local Gemma 4 Semantic Reasoner
                </h4>
                <p>
                  Running offline on Ollama (<code className="font-mono text-zinc-800 dark:text-zinc-200">gemma4:e2b</code>). Analyzes conversational urgency, coercion tactics, brand impersonation, and fraudulent promises with strict Pydantic JSON schema guarantees.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 dark:text-[#F5F5F7] mb-1">
                  3. Zero-Fetch Security (No Outbound SSRF)
                </h4>
                <p>
                  Proofly never initiates HTTP/TCP handshakes to inspected target links or domains, completely mitigating tracking pixels and server-side request forgery risks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-[11px] font-mono">
                <div>Model: {response.model_used}</div>
                <div>Risk Score: {response.risk_score} / 100 ({response.risk_level.toUpperCase()})</div>
                <div>Inference Engine: Ollama Local MLX / Metal</div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-[#353742] flex justify-end">
              <button
                onClick={() => setMethodologyModalOpen(false)}
                className="px-5 py-2 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
