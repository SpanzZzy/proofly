"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Link2, Mail, Phone, Receipt, Image as ImageIcon } from "lucide-react";
import { ToolType } from "@/lib/types";

interface HeroPreviewProps {
  activeTab: ToolType;
  onSelectTab: (tab: ToolType) => void;
}

const TABS: { id: ToolType; label: string; icon: React.ElementType }[] = [
  { id: "message", label: "Messages", icon: MessageSquare },
  { id: "website", label: "Websites", icon: Link2 },
  { id: "email", label: "Emails", icon: Mail },
  { id: "phone", label: "Calls", icon: Phone },
  { id: "payment", label: "Payments", icon: Receipt },
  { id: "image", label: "Images", icon: ImageIcon },
];

export default function HeroPreview({ activeTab, onSelectTab }: HeroPreviewProps) {
  const [currentPreviewTab, setCurrentPreviewTab] = useState<ToolType>(activeTab);
  const [userInteracted, setUserInteracted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with activeTab if changed externally
  useEffect(() => {
    setCurrentPreviewTab(activeTab);
  }, [activeTab]);

  // Auto cycle every 4s while idle
  useEffect(() => {
    if (userInteracted) return;

    timerRef.current = setInterval(() => {
      setCurrentPreviewTab((prev) => {
        const currentIndex = TABS.findIndex((t) => t.id === prev);
        const nextIndex = (currentIndex + 1) % TABS.length;
        return TABS[nextIndex].id;
      });
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userInteracted]);

  const handleTabClick = (tab: ToolType) => {
    setUserInteracted(true);
    setCurrentPreviewTab(tab);
    onSelectTab(tab);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 mb-24 animate-fade-in-up delay-700">
      {/* Visual Container */}
      <div
        onMouseEnter={() => setUserInteracted(true)}
        className="relative rounded-3xl overflow-hidden h-[460px] md:h-[500px] border border-zinc-200 dark:border-[#353742] bg-[#F8F8FA] dark:bg-[#101115] p-6 md:p-10 flex flex-col justify-between shadow-xl transition-all"
      >
        {/* Animated Generative Grid Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-60 dark:opacity-40 -z-10" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-200/50 dark:bg-zinc-900 rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-200/50 dark:bg-zinc-900 rounded-full blur-[100px] opacity-40 -z-10 pointer-events-none" />

        {/* Top Header of Container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-3 text-xs font-mono text-zinc-500 dark:text-zinc-500">proofly-forensics-live-feed</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/90 dark:bg-[#191B21]/90 border border-zinc-200 dark:border-[#353742] px-3 py-1.5 rounded-full text-[11px] text-zinc-700 dark:text-[#A9ACB8] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Demo · Click any mode</span>
          </div>
        </div>

        {/* Center Dynamic Preview Area */}
        <div className="my-auto max-w-3xl mx-auto w-full z-10">
          {/* Card: Messages */}
          {currentPreviewTab === "message" && (
            <div
              onClick={() => handleTabClick("message")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("message");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>SMS Evidence Inspection</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-900/60 text-[11px]">
                  EXAMPLE CASE · RISK 85/100
                </span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-[#F5F5F7] bg-zinc-50 dark:bg-[#22242C] p-3 rounded-lg border border-zinc-100 dark:border-[#353742] font-mono mb-3">
                &ldquo;Dear customer, your SBI Netbanking account is blocked. Click bit.ly/sbi-kyc-verify immediately &amp; share OTP.&rdquo;
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#22242C] border border-zinc-100 dark:border-[#353742]">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">WHAT WE OBSERVED</div>
                  <div className="text-zinc-800 dark:text-[#F5F5F7] font-medium mt-0.5">Shortened URL (bit.ly) masking destination; OTP solicitation.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60">
                  <div className="text-[10px] text-red-600 dark:text-red-400 font-medium">WARNING SIGN</div>
                  <div className="text-red-900 dark:text-red-200 font-medium mt-0.5">Banks never solicit OTPs or link KYC via third-party shorteners.</div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Message Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card: Websites */}
          {currentPreviewTab === "website" && (
            <div
              onClick={() => handleTabClick("website")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("website");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <Link2 className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>Domain &amp; URL Static Forensics</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-900/60 text-[11px]">
                  EXAMPLE CASE · SSRF-SAFE HEURISTICS
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-zinc-50 dark:bg-[#22242C] p-3 rounded-lg border border-zinc-100 dark:border-[#353742] font-mono text-zinc-800 dark:text-[#F5F5F7] mb-3">
                <span className="text-red-500 dark:text-red-400 font-bold">https://xn--pple-43d.com</span>
                <span className="text-zinc-400 dark:text-zinc-500">/secure-login/auth</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#22242C] border border-zinc-100 dark:border-[#353742]">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">DETECTION METHOD</div>
                  <div className="text-zinc-800 dark:text-[#F5F5F7] font-medium mt-0.5">Punycode Homograph: Cyrillic glyphs mimic trusted brand.</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#22242C] border border-zinc-100 dark:border-[#353742]">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">SAFETY PRINCIPLE</div>
                  <div className="text-zinc-800 dark:text-[#F5F5F7] font-medium mt-0.5">HTTPS certificate provides transport encryption, not trust.</div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Website Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card: Emails */}
          {currentPreviewTab === "email" && (
            <div
              onClick={() => handleTabClick("email")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("email");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <Mail className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>Email Forensics &amp; MIME Inspection</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold border border-amber-100 dark:border-amber-900/60 text-[11px]">
                  EXAMPLE CASE · BEC DETECTED
                </span>
              </div>
              <div className="space-y-1.5 text-xs bg-zinc-50 dark:bg-[#22242C] p-3 rounded-lg border border-zinc-100 dark:border-[#353742] mb-3 font-mono">
                <div><span className="text-zinc-400 dark:text-zinc-500">From:</span> &ldquo;CEO David Evans&rdquo; &lt;david.evans@company.com&gt;</div>
                <div><span className="text-red-500 dark:text-red-400 font-bold">Reply-To:</span> executive-vault@offshore-pay.xyz <span className="text-red-600 dark:text-red-400 font-semibold">(MISMATCH)</span></div>
                <div><span className="text-zinc-400 dark:text-zinc-500">Auth-Results:</span> spf=fail; dkim=fail</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 mb-3">
                <strong>Warning:</strong> Display name spoofing paired with divergent Reply-To address indicates Business Email Compromise (BEC).
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Email Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card: Calls */}
          {currentPreviewTab === "phone" && (
            <div
              onClick={() => handleTabClick("phone")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("phone");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <Phone className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>Caller Intelligence &amp; Digital Arrest Check</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-900/60 text-[11px]">
                  EXAMPLE CASE · EXTORTION TACTIC
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono bg-zinc-50 dark:bg-[#22242C] p-3 rounded-lg border border-zinc-100 dark:border-[#353742]">
                <div><span className="text-zinc-400 dark:text-zinc-500">Parsed Number:</span> +91 98200 44123</div>
                <div><span className="text-zinc-400 dark:text-zinc-500">Region:</span> Maharashtra, India</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 mb-3">
                <strong>Tactic Observed:</strong> Caller claimed to be CBI / Mumbai Police demanding Skype &ldquo;digital arrest&rdquo;. Real police NEVER conduct digital arrests on video.
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Call Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card: Payments */}
          {currentPreviewTab === "payment" && (
            <div
              onClick={() => handleTabClick("payment")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("payment");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>Payment Proof Lab · Screenshot Audit</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold border border-amber-100 dark:border-amber-900/60 text-[11px]">
                  EXAMPLE CASE · UNVERIFIED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3 text-center">
                <div className="bg-zinc-50 dark:bg-[#22242C] p-2 rounded border border-zinc-100 dark:border-[#353742]">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">STATUS</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Pending</span>
                </div>
                <div className="bg-zinc-50 dark:bg-[#22242C] p-2 rounded border border-zinc-100 dark:border-[#353742]">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">AMOUNT</span>
                  <span className="font-bold text-zinc-800 dark:text-[#F5F5F7]">₹15,000</span>
                </div>
                <div className="bg-zinc-50 dark:bg-[#22242C] p-2 rounded border border-zinc-100 dark:border-[#353742]">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">UTR REF</span>
                  <span className="font-bold text-red-600 dark:text-red-400">Missing</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-800 dark:text-[#F5F5F7] mb-3">
                <strong>Rule of Thumb:</strong> A screenshot is never proof of receipt. Fake UPI generator apps can spoof balances in seconds. Check your actual bank account.
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Payment Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Card: Images */}
          {currentPreviewTab === "image" && (
            <div
              onClick={() => handleTabClick("image")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTabClick("image");
              }}
              className="bg-white dark:bg-[#191B21] rounded-2xl p-6 shadow-2xl border border-zinc-100 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 cursor-pointer text-left animate-slide-up-overlay transition-all group"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#353742] mb-3 text-xs">
                <span className="font-semibold text-zinc-900 dark:text-[#F5F5F7] flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-zinc-700 dark:text-[#A9ACB8]" />
                  <span>Image Evidence &amp; Ad Verification</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold border border-red-100 dark:border-red-900/60 text-[11px]">
                  EXAMPLE CASE · SCAM AD
                </span>
              </div>
              <div className="text-xs bg-zinc-50 dark:bg-[#22242C] p-3 rounded-lg border border-zinc-100 dark:border-[#353742] mb-3">
                <div className="font-semibold text-zinc-900 dark:text-[#F5F5F7]">&ldquo;Flash Clearance: iPhone 16 Pro at 90% discount. Only 3 units left!&rdquo;</div>
                <div className="text-zinc-500 dark:text-[#A9ACB8] mt-1">Claimed seller: &ldquo;Authorized Apple Distributor Express&rdquo;</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 mb-3">
                <strong>Warning:</strong> Deep discount ads using artificial timers are designed for payment gateway credential theft.
              </div>
              <div className="pt-2 flex justify-end">
                <span className="text-xs font-semibold text-black dark:text-[#F5F5F7] flex items-center group-hover:translate-x-1 transition-transform">
                  Launch Image Scanner with this sample &rarr;
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Mode Switcher */}
        <div className="z-10 flex flex-wrap items-center justify-center gap-1.5 bg-white/90 dark:bg-[#191B21]/90 p-1.5 rounded-full max-w-xl mx-auto border border-zinc-200 dark:border-[#353742] shadow-sm backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPreviewTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-black dark:bg-[#22242C] text-white dark:text-[#F5F5F7] shadow-md scale-105"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#272932]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
