"use client";

import React from "react";
import { Lock, EyeOff, HardDrive, WifiOff } from "lucide-react";

export default function PrivacySection() {
  const pillars = [
    {
      icon: HardDrive,
      title: "100% Local Machine Execution",
      description:
        "All AI inference runs directly on your computer using Gemma 4 via Ollama. Submitted evidence never leaves your device or touches proprietary third-party servers.",
    },
    {
      icon: WifiOff,
      title: "Zero-Fetch SSRF Defense",
      description:
        "Proofly's URL inspector uses static syntax parsing and offline heuristic dictionaries. It never queries the submitted website, protecting you from malware and tracking pixels.",
    },
    {
      icon: EyeOff,
      title: "No Data Logging or Storage",
      description:
        "Emails, phone numbers, bank screenshots, and private messages are processed entirely in memory. No temporary images or transcripts are kept on the server filesystem.",
    },
    {
      icon: Lock,
      title: "Strict Untrusted Isolation",
      description:
        "All user-submitted content is quarantined in protected data tags. Even if a phishing message contains adversarial prompts, our prompt-injection defenses neutralize the threat.",
    },
  ];

  return (
    <section id="privacy-first" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100 dark:border-[#353742] transition-colors">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Privacy By Design
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-[#F5F5F7]">
          Your sensitive evidence never leaves your machine.
        </h2>
        <p className="mt-4 text-base text-zinc-600 dark:text-[#A9ACB8] font-normal">
          Cybersecurity tools should protect your privacy, not harvest your data. Proofly is engineered for total local sovereignty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-zinc-50 dark:bg-[#191B21] border border-zinc-200/80 dark:border-[#353742] text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] flex items-center justify-center mb-5 text-black dark:text-[#F5F5F7] shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-black dark:text-[#F5F5F7] mb-2">{p.title}</h3>
                <p className="text-xs text-zinc-600 dark:text-[#A9ACB8] leading-relaxed font-normal">{p.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
