"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HeroPreview from "@/components/HeroPreview";
import ToolTabs from "@/components/ToolTabs";
import MessageTool from "@/components/tools/MessageTool";
import WebsiteTool from "@/components/tools/WebsiteTool";
import EmailTool from "@/components/tools/EmailTool";
import CallerTool from "@/components/tools/CallerTool";
import PaymentTool from "@/components/tools/PaymentTool";
import ImageTool from "@/components/tools/ImageTool";
import ClaimVsEvidence from "@/components/ClaimVsEvidence";
import HistoryDrawer from "@/components/HistoryDrawer";
import HowItWorks from "@/components/HowItWorks";
import PrivacySection from "@/components/PrivacySection";
import OpenSourceSection from "@/components/OpenSourceSection";
import Footer from "@/components/Footer";
import { ToolType, AnalysisResponse, HistoryItem } from "@/lib/types";
import { useToast } from "@/components/Toast";

const HISTORY_STORAGE_KEY = "proofly_investigation_history_v1";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ToolType>("message");
  const [currentResult, setCurrentResult] = useState<AnalysisResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const { showToast } = useToast();

  // Load opt-in local history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveToHistory = (tool: ToolType, query: string, res: AnalysisResponse) => {
    const newItem: HistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tool,
      query,
      title: res.title,
      risk_score: res.risk_score,
      risk_level: res.risk_level,
      timestamp: new Date().toISOString(),
      response: res,
    };

    const updated = [newItem, ...history.filter((h) => h.query !== query)].slice(0, 25);
    setHistory(updated);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    showToast("Investigation history cleared successfully.", "info");
  };

  const handleAnalysisSuccess = (res: AnalysisResponse, querySummary: string) => {
    setCurrentResult(res);
    saveToHistory(activeTab, querySummary, res);
    showToast("Analysis complete. Review forensic findings below.", "success");
    // Smooth scroll down to result workspace
    setTimeout(() => {
      const element = document.getElementById("evidence-workspace");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.tool);
    setCurrentResult(item.response);
    showToast(`Restored investigation: ${item.title}`, "info");
    setTimeout(() => {
      const element = document.getElementById("evidence-workspace");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const scrollToTools = () => {
    const element = document.getElementById("tools-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#101115] text-[#111111] dark:text-[#F5F5F7] transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Stellar Hero Section */}
        <Hero onVerifyClick={scrollToTools} onHowItWorksClick={scrollToHowItWorks} />

        {/* Cinematic Hero Preview with Idle Auto-Cycling */}
        <HeroPreview
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            scrollToTools();
          }}
        />

        {/* Six Interactive Investigation Tools Section */}
        <section id="tools-section" className="py-20 px-6 max-w-5xl mx-auto scroll-mt-24">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-[#A9ACB8]">
              Interactive Forensics Engine
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-normal tracking-tight text-black dark:text-[#F5F5F7]">
              Examine any digital claim.
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-[#A9ACB8] font-normal max-w-xl mx-auto">
              Select an investigation mode below to inspect suspicious messages, URLs, emails, phone calls, or payment slips.
            </p>
          </div>

          {/* 6 Tabs Switcher */}
          <ToolTabs
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              // Do not reset currentResult if user wants to compare, or reset if desired
            }}
          />

          {/* Tool Input Form */}
          <div className="mb-14">
            {activeTab === "message" && <MessageTool onSuccess={handleAnalysisSuccess} />}
            {activeTab === "website" && <WebsiteTool onSuccess={handleAnalysisSuccess} />}
            {activeTab === "email" && <EmailTool onSuccess={handleAnalysisSuccess} />}
            {activeTab === "phone" && <CallerTool onSuccess={handleAnalysisSuccess} />}
            {activeTab === "payment" && <PaymentTool onSuccess={handleAnalysisSuccess} />}
            {activeTab === "image" && <ImageTool onSuccess={handleAnalysisSuccess} />}
          </div>

          {/* Signature Feature: CLAIM VS EVIDENCE Workspace */}
          {currentResult && (
            <div id="evidence-workspace" className="pt-6 scroll-mt-24">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-[#F5F5F7] bg-zinc-100 dark:bg-[#22242C] px-3 py-1 rounded-full border border-zinc-200 dark:border-[#353742]">
                  Forensic Dissection Results
                </span>
              </div>
              <ClaimVsEvidence
                response={currentResult}
                onReset={() => setCurrentResult(null)}
              />
            </div>
          )}
        </section>

        {/* How It Works Editorial Section */}
        <HowItWorks />

        {/* Privacy First Section */}
        <PrivacySection />

        {/* Open Source & Gemma 4 Section */}
        <OpenSourceSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={clearHistory}
      />
    </div>
  );
}
