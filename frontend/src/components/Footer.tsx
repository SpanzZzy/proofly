"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 dark:border-[#353742] bg-white dark:bg-[#101115] py-12 px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-[#A9ACB8]">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Proofly Home"
        >
          <div className="w-6 h-6 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-105">
            ✱
          </div>
          <span className="font-bold text-black dark:text-[#F5F5F7] text-sm tracking-tight">proofly.</span>
          <span className="text-zinc-400 dark:text-zinc-600">|</span>
          <span className="italic text-zinc-600 dark:text-[#A9ACB8] font-serif">&ldquo;Trust, but verify.&rdquo;</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-600 dark:text-[#A9ACB8] font-medium">
          <button
            onClick={() => document.getElementById("tools-section")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            Explore Tools
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => document.getElementById("privacy-first")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            Privacy First
          </button>
          <button
            onClick={() => document.getElementById("open-source")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors cursor-pointer"
          >
            Open Source
          </button>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400 dark:text-zinc-500">
          <span>MIT License · Hacktoberfest Pune 2026</span>
        </div>
      </div>
    </footer>
  );
}
