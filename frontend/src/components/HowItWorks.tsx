"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Isolate Untrusted Evidence",
      description:
        "Submit suspicious SMS messages, URLs, email headers, call transcripts, or payment receipts. All submissions are automatically encapsulated in strict untrusted data blocks to prevent prompt injection or script execution.",
    },
    {
      step: "02",
      title: "Hybrid Heuristic & Gemma 4 Forensics",
      description:
        "Deterministic Python heuristics detect technical signatures (Punycode homoglyphs, IP hosts, domain mismatches, dangerous extensions) while local Gemma 4 dissects psychological urgency, coercion, and deceptive promises.",
    },
    {
      step: "03",
      title: "Actionable Claim vs Evidence Roadmap",
      description:
        "Proofly synthesizes what was claimed versus what was factually observed, highlights critical unknowns, and generates a concrete, independent verification checklist you can execute out-of-band before you act.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100 dark:border-[#353742] transition-colors">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-[#A9ACB8]">
          Forensic Methodology
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-[#F5F5F7]">
          How Proofly verifies digital claims.
        </h2>
        <p className="mt-4 text-base text-zinc-600 dark:text-[#A9ACB8] font-normal">
          A disciplined, zero-trust architecture combining deterministic cybersecurity rules with local Gemma 4 intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-zinc-50 dark:bg-[#191B21] border border-zinc-200/80 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="font-mono text-2xl font-bold text-zinc-300 dark:text-zinc-600 mb-6">{s.step}</div>
              <h3 className="text-lg font-bold text-black dark:text-[#F5F5F7] tracking-tight mb-3">{s.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-[#A9ACB8] leading-relaxed font-normal">{s.description}</p>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-200/60 dark:border-[#353742] flex items-center text-xs font-semibold text-zinc-800 dark:text-[#F5F5F7]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
              <span>Independent &amp; Objective</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
