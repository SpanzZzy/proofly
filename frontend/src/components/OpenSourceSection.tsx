"use client";

import React from "react";
import { Terminal } from "lucide-react";

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function OpenSourceSection() {
  return (
    <section id="open-source" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100 dark:border-[#353742] transition-colors">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-[#A9ACB8]">
          Transparency &amp; Community
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-black dark:text-[#F5F5F7]">
          Free, transparent, and open source.
        </h2>
        <p className="mt-4 text-base text-zinc-600 dark:text-[#A9ACB8] font-normal">
          Built during Hacktoberfest Hack Day Pune (October 26, 2026). Every detector, rule, and prompt is inspectable and modifiable under the MIT License.
        </p>
      </div>

      <div className="bg-[#F8F8FA] dark:bg-[#191B21] text-[#111111] dark:text-[#F5F5F7] rounded-3xl p-8 md:p-12 border border-zinc-200 dark:border-[#353742] shadow-xl text-left transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs font-mono text-zinc-800 dark:text-[#F5F5F7] mb-4 shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Full Local Stack</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-[#F5F5F7] mb-4">
              Next.js + FastAPI + Gemma 4 via Ollama
            </h3>
            <p className="text-sm text-zinc-600 dark:text-[#A9ACB8] leading-relaxed mb-6 font-normal">
              Proofly pairs Next.js 15 App Router with a high-performance Python FastAPI backend.
              All semantic and multimodal vision calls invoke Ollama&apos;s local MLX Gemma 4 runner, ensuring zero reliance on hosted cloud APIs.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] font-semibold text-xs flex items-center space-x-2 hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-sm"
              >
                <GithubIcon className="w-4 h-4" />
                <span>View on GitHub</span>
              </a>
              <button
                onClick={() => document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth" })}
                className="px-6 py-3 rounded-full bg-white dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-800 dark:text-[#F5F5F7] font-semibold text-xs flex items-center space-x-2 hover:bg-zinc-100 dark:hover:bg-[#272932] transition-all cursor-pointer shadow-sm"
              >
                <span>Launch Scanners</span>
              </button>
            </div>
          </div>

          {/* Quick Terminal Guide */}
          <div className="bg-white dark:bg-[#101115] rounded-2xl p-5 border border-zinc-200 dark:border-[#353742] font-mono text-xs text-zinc-800 dark:text-[#A9ACB8] space-y-3 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#353742] text-zinc-500 dark:text-zinc-400 text-[11px]">
              <span>QUICK LOCAL LAUNCH COMMANDS</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● OFFLINE READY</span>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400"># 1. Start Ollama with Gemma 4</span>
              <div className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">ollama run gemma4:e2b</div>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400"># 2. Launch FastAPI Backend</span>
              <div className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">source .venv/bin/activate &amp;&amp; uvicorn app.main:app --port 8000</div>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400"># 3. Launch Next.js Frontend</span>
              <div className="text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">cd frontend &amp;&amp; npm run dev</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
