"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  onVerifyClick: () => void;
  onHowItWorksClick: () => void;
}

export default function Hero({ onVerifyClick, onHowItWorksClick }: HeroProps) {
  return (
    <section className="px-6 pt-20 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto text-center relative overflow-hidden">
      {/* Decorative subtle ambient backdrop glow adapted for both themes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-zinc-100 to-zinc-50 dark:from-zinc-900/40 dark:to-zinc-800/20 rounded-full blur-3xl -z-10 pointer-events-none opacity-60" />

      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#191B21] border border-zinc-200 dark:border-[#353742] text-xs font-medium text-zinc-800 dark:text-[#F5F5F7] mb-8 animate-fade-in-up delay-200 shadow-sm transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-[#F5F5F7]" />
        <span>Open Source · Private by Design · Gemma 4</span>
      </div>

      {/* Main Editorial Heading */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-normal leading-[1.1] tracking-tight text-black dark:text-[#F5F5F7] max-w-5xl mx-auto animate-fade-in-up delay-300">
        <span>The internet can fake anything.</span>
        <br />
        <span className="bg-gradient-to-r from-black via-zinc-700 to-zinc-400 dark:from-[#F5F5F7] dark:via-zinc-300 dark:to-zinc-500 bg-clip-text text-transparent font-medium">
          Know what to trust.
        </span>
      </h1>

      {/* Subheading */}
      <p className="mt-8 text-lg sm:text-xl text-zinc-600 dark:text-[#A9ACB8] max-w-3xl mx-auto leading-relaxed font-normal animate-fade-in-up delay-400">
        From suspicious messages and websites to fraudulent emails, scam calls, and questionable payment proofs,
        Proofly helps you examine digital claims before you act.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-500">
        <button
          onClick={onVerifyClick}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-[#111115] font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-black/10 dark:shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Verify Something</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onHowItWorksClick}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-100 dark:bg-[#191B21] hover:bg-zinc-200 dark:hover:bg-[#272932] text-zinc-900 dark:text-[#F5F5F7] font-medium text-sm border border-zinc-200 dark:border-[#353742] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          See How It Works
        </button>
      </div>

      {/* Key Guarantees Row */}
      <div className="mt-14 pt-8 border-t border-zinc-100 dark:border-[#353742] flex flex-wrap items-center justify-center gap-8 text-xs text-zinc-500 dark:text-[#A9ACB8] font-medium animate-fade-in-up delay-800">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>100% Local Inference via Ollama</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <span>Zero Server Storage &amp; Zero Telemetry</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
          <span>Zero-SSRF Static Verification</span>
        </div>
      </div>
    </section>
  );
}
