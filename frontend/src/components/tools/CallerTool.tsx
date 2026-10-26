"use client";

import React, { useState } from "react";
import { Phone, Sparkles, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { analyzePhone } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface CallerToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

const COUNTRIES = [
  { code: "IN", name: "India (+91)", prefix: "+91" },
  { code: "US", name: "United States (+1)", prefix: "+1" },
  { code: "GB", name: "United Kingdom (+44)", prefix: "+44" },
  { code: "AE", name: "UAE (+971)", prefix: "+971" },
  { code: "SG", name: "Singapore (+65)", prefix: "+65" },
  { code: "AU", name: "Australia (+61)", prefix: "+61" },
  { code: "CA", name: "Canada (+1)", prefix: "+1" },
];

export default function CallerTool({ onSuccess }: CallerToolProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [claimedOrg, setClaimedOrg] = useState("");
  const [callDescription, setCallDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await analyzePhone({
        phoneNumber,
        countryCode,
        claimedOrg: claimedOrg || undefined,
        callDescription: callDescription || undefined,
      });
      onSuccess(res, `${phoneNumber} ${claimedOrg ? `(${claimedOrg})` : ""}`);
    } catch (err: any) {
      setError(err.message || "Failed to inspect phone number. Ensure local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: any) => {
    setPhoneNumber(ex.data.phoneNumber || "");
    setCountryCode(ex.data.countryCode || "IN");
    setClaimedOrg(ex.data.claimedOrg || "");
    setCallDescription(ex.data.callDescription || "");
    setError(null);
    if (ex.predefinedResult) {
      onSuccess(ex.predefinedResult, `${ex.data.phoneNumber} ${ex.data.claimedOrg ? `(${ex.data.claimedOrg})` : ""}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
            <Phone className="w-5 h-5 text-zinc-800 dark:text-[#A9ACB8]" />
            <span>Caller Intelligence &amp; Digital Arrest Check</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] text-[10px] font-bold uppercase tracking-wider">
            E.164 Forensics
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
          Parses phone number formatting, carrier metadata, and detects high-impact telephone fraud like Digital Arrests, fake police, and AnyDesk scams.
        </p>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.phone.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => loadExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-[#22242C] hover:bg-zinc-100 dark:hover:bg-[#272932] border border-zinc-200 dark:border-[#353742] text-zinc-700 dark:text-[#F5F5F7] transition-all hover:scale-[1.01]"
            >
              <span className="font-medium">{ex.title}</span>
              <span className="ml-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">({ex.badge})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="country-select" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
              Region / Country
            </label>
            <select
              id="country-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-[#191B21] dark:text-[#F5F5F7]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="phone-number" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
              Phone Number
            </label>
            <input
              id="phone-number"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +91 98200 12345 or 022 4589 1000"
              className="w-full px-3.5 py-3 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500 font-mono"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="claimed-org" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
            Claimed Identity or Organization (Optional)
          </label>
          <input
            id="claimed-org"
            type="text"
            value={claimedOrg}
            onChange={(e) => setClaimedOrg(e.target.value)}
            placeholder="e.g. CBI, Mumbai Cyber Police, HDFC Bank Manager, FedEx Customs"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="call-transcript" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
            Call Conversation Summary or Transcript (Highly Recommended)
          </label>
          <textarea
            id="call-transcript"
            rows={4}
            value={callDescription}
            onChange={(e) => setCallDescription(e.target.value)}
            placeholder="Describe what the caller said: Did they threaten arrest? Ask to install AnyDesk? Demand immediate video call or money transfer?"
            className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
          />
        </div>

        {/* Spoofing limitation disclaimer */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-600 dark:text-[#A9ACB8] flex items-start space-x-2.5 transition-colors">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-800 dark:text-[#F5F5F7]">Caller ID Limitation:</strong> Phone numbers are frequently spoofed via international VoIP gateways. A valid format never proves caller legitimacy without analyzing conversational behavior.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {phoneNumber.trim() || claimedOrg.trim() || callDescription.trim() ? (
            <button
              type="button"
              onClick={() => {
                setPhoneNumber("");
                setClaimedOrg("");
                setCallDescription("");
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-red-600 dark:text-[#A9ACB8] dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Reset Fields
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Telecom Patterns...</span>
              </>
            ) : (
              <>
                <span>Inspect Caller</span>
                <Phone className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
