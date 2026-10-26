"use client";

import React, { useState } from "react";
import { Link2, Search, Sparkles, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { analyzeUrl } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface WebsiteToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

export default function WebsiteTool({ onSuccess }: WebsiteToolProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeUrl(url);
      onSuccess(res, url);
    } catch (err: any) {
      setError(err.message || "Failed to inspect URL. Ensure local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: any) => {
    setUrl(ex.data.url);
    setError(null);
    if (ex.predefinedResult) {
      onSuccess(ex.predefinedResult, ex.data.url);
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
          <Link2 className="w-5 h-5 text-zinc-800 dark:text-[#A9ACB8]" />
          <span>Website &amp; URL Inspector</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
          Detects Punycode IDN homograph attacks, raw IP hosts, UserInfo (@) camouflage, and brand mimicry.
        </p>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.website.map((ex) => (
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
        <div>
          <label htmlFor="url-input" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-2">
            URL or Domain String to Inspect
          </label>
          <div className="relative">
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://xn--pple-43d.com/login or http://192.168.1.50/banking"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all font-mono"
              required
            />
            <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* SSRF & Zero-Fetch Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-600 dark:text-[#A9ACB8] flex items-start space-x-2.5 transition-colors">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-800 dark:text-[#F5F5F7]">Zero-Fetch Guarantee:</strong> Proofly never visits or sends network packets to the inspected URL. Analysis is 100% static to eliminate SSRF exploits and tracking beacons.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {url.trim() ? (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-red-600 dark:text-[#A9ACB8] dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Clear URL
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Inspecting Structure...</span>
              </>
            ) : (
              <>
                <span>Inspect URL</span>
                <Search className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
