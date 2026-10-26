"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, History } from "lucide-react";
import { HealthStatus } from "@/lib/types";
import { fetchHealth } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export default function Navbar({ onOpenHistory, historyCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(() => {});
    const interval = setInterval(() => {
      fetchHealth().then(setHealth).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#101115]/80 backdrop-blur-md border-b border-zinc-100 dark:border-[#353742] transition-colors">
      {/* Interactive Demo Production Banner */}
      <div className="bg-zinc-900 dark:bg-[#16171D] text-zinc-300 dark:text-zinc-400 border-b border-zinc-800 dark:border-[#272932] text-[11px] sm:text-xs py-1.5 px-4 text-center font-normal tracking-tight">
        <span>Interactive Demo — Rule-based detection and sample investigations. </span>
        <button
          onClick={() => {
            const el = document.getElementById("run-locally");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="text-white dark:text-[#F5F5F7] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1 cursor-pointer"
        >
          Run locally for full AI analysis &rarr;
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left Brand */}
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
          <div className="w-8 h-8 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
            ✱
          </div>
          <span className="text-xl font-bold tracking-tight text-black dark:text-[#F5F5F7]">
            proofly<span className="text-zinc-400 dark:text-zinc-600">.</span>
          </span>
          <span className="hidden sm:inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#272932] text-zinc-600 dark:text-[#A9ACB8] border border-zinc-200 dark:border-[#353742]">
            v1.0
          </span>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-600 dark:text-[#A9ACB8]">
          <button
            onClick={() => scrollTo("tools-section")}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors"
          >
            Explore Tools
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("privacy-first")}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors"
          >
            Privacy First
          </button>
          <button
            onClick={() => scrollTo("open-source")}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors"
          >
            Open Source
          </button>
          <button
            onClick={() => scrollTo("run-locally")}
            className="hover:text-black dark:hover:text-[#F5F5F7] transition-colors"
          >
            Run Locally
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Selector (Desktop) */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Local Model Status Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-50 dark:bg-[#191B21] border border-zinc-200 dark:border-[#353742] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.ollama_connected ? "bg-emerald-500 animate-pulse" : "bg-purple-500"
              }`}
            />
            <span className="font-medium text-zinc-700 dark:text-[#A9ACB8]">
              {health?.ollama_connected ? "Gemma 4 Active" : "Rule Engine Active"}
            </span>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-white transition-colors relative"
            title="Local Investigation History"
            aria-label="Investigation History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-black dark:bg-[#F5F5F7] rounded-full" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/SpanzZzy/proofly"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#272932] transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          {/* Start Verifying Button */}
          <button
            onClick={() => scrollTo("tools-section")}
            className="px-4 py-2 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-[#111115] text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Verifying
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-zinc-700 dark:text-[#A9ACB8] hover:bg-zinc-100 dark:hover:bg-[#272932]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-[#353742] bg-white dark:bg-[#191B21] px-6 py-4 space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] text-xs">
            <span className="text-zinc-500 dark:text-[#A9ACB8]">Appearance:</span>
            <ThemeToggle showLabels />
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-[#353742] text-xs">
            <span className="text-zinc-500 dark:text-[#A9ACB8]">Inference Status:</span>
            <span className="font-medium text-zinc-800 dark:text-[#F5F5F7] flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${health?.ollama_connected ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{health?.ollama_connected ? "Gemma 4 (Local)" : "Deterministic Rules"}</span>
            </span>
          </div>

          <button
            onClick={() => scrollTo("tools-section")}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7]"
          >
            Explore Tools
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7]"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("privacy-first")}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7]"
          >
            Privacy First
          </button>
          <button
            onClick={() => scrollTo("open-source")}
            className="block w-full text-left py-2 text-sm font-medium text-zinc-700 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7]"
          >
            Open Source
          </button>

          <div className="pt-2 flex flex-col gap-2 border-t border-zinc-100 dark:border-[#353742]">
            <button
              onClick={() => scrollTo("tools-section")}
              className="w-full py-2.5 rounded-full bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] text-xs font-semibold shadow-sm transition-all"
            >
              Start Verifying
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-1.5 w-full py-2 rounded-full border border-zinc-200 dark:border-[#353742] text-xs font-medium text-zinc-700 dark:text-[#A9ACB8]"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
