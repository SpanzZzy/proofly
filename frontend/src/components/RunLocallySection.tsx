"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, ExternalLink, Cpu, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/Toast";

const STEPS = [
  {
    num: "1",
    title: "Download Ollama & Gemma 4",
    cmd: "ollama pull gemma4:e2b",
    desc: "Install Ollama and pull the Gemma 4 lightweight local model (runs completely offline).",
  },
  {
    num: "2",
    title: "Start FastAPI Security Engine",
    cmd: "python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt && uvicorn app.main:app --app-dir backend --port 8000",
    desc: "Initializes local Python virtual environment and launches the forensic server on port 8000.",
  },
  {
    num: "3",
    title: "Launch Next.js Web Client",
    cmd: "cd frontend && npm install && npm run dev",
    desc: "Starts the Next.js development server at http://localhost:3000 bound to your local backend.",
  },
];

export default function RunLocallySection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const { showToast } = useToast();

  const handleCopy = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    showToast("Command copied to clipboard!", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="run-locally" className="py-20 px-6 max-w-5xl mx-auto scroll-mt-24 border-t border-zinc-100 dark:border-[#353742] transition-colors">
      <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-[#191B21] dark:to-[#101115] rounded-3xl border border-zinc-200/90 dark:border-[#353742] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-zinc-200/30 dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs font-semibold text-zinc-700 dark:text-[#A9ACB8] mb-4">
            <Cpu className="w-3.5 h-3.5 text-zinc-800 dark:text-[#F5F5F7]" />
            <span>100% Offline Data Sovereignty</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-[#F5F5F7]">
            Want the full experience?
          </h2>

          <p className="mt-4 text-base text-zinc-600 dark:text-[#A9ACB8] leading-relaxed">
            Proofly&apos;s online demo uses transparent rule-based detection and sample investigations. Run it locally to explore AI-powered analysis with Ollama and Gemma 4.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://github.com/SpanzZzy/proofly"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setShowFullGuide(!showFullGuide)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-800 dark:text-[#F5F5F7] text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>{showFullGuide ? "Hide Setup Commands" : "Run Locally"}</span>
            </button>
          </div>

          {/* Step-by-Step Command Cards */}
          {showFullGuide && (
            <div className="mt-10 space-y-4 text-left animate-slide-up-overlay">
              {STEPS.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] shadow-sm transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] text-[11px] font-bold flex items-center justify-center">
                        {step.num}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-[#F5F5F7]">
                        {step.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(step.cmd, idx)}
                      className="text-xs text-zinc-500 hover:text-black dark:text-[#A9ACB8] dark:hover:text-[#F5F5F7] font-medium flex items-center space-x-1 cursor-pointer transition-colors"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-[#A9ACB8] mb-2.5">
                    {step.desc}
                  </p>

                  <div className="p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 flex items-center justify-between">
                    <code>{step.cmd}</code>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-center text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gemma 4 runs via Ollama Metal/MLX locally with zero external network calls.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
