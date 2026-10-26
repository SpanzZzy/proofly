"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { analyzeMessage } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface MessageToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

export default function MessageTool({ onSuccess }: MessageToolProps) {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("sms");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeMessage(text, channel);
      onSuccess(res, text.slice(0, 80));
    } catch (err: any) {
      setError(err.message || "Failed to analyze message. Ensure local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: any) => {
    setText(ex.data.text);
    setChannel(ex.data.channel || "sms");
    setError(null);
    if (ex.predefinedResult) {
      onSuccess(ex.predefinedResult, ex.data.text.slice(0, 80));
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <div>
          <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-zinc-800 dark:text-[#A9ACB8]" />
            <span>Message Scam Detector</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
            Detects artificial urgency, OTP requests, banking mimicry, and fake job tasks in SMS or WhatsApp chats.
          </p>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-[#22242C] p-1 rounded-full text-xs font-medium self-start sm:self-auto border border-zinc-200/60 dark:border-[#353742]">
          {["sms", "whatsapp", "telegram", "social"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={`px-3 py-1 rounded-full capitalize transition-all ${
                channel === c
                  ? "bg-white dark:bg-[#191B21] text-black dark:text-[#F5F5F7] shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.message.map((ex) => (
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
          <label htmlFor="message-text" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-2">
            Paste Message Text or Chat Transcript
          </label>
          <textarea
            id="message-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp message, or direct message here..."
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500 transition-all"
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {text.trim() ? (
            <button
              type="button"
              onClick={() => {
                setText("");
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-red-600 dark:text-[#A9ACB8] dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Clear Text
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Forensic Engine Running...</span>
              </>
            ) : (
              <>
                <span>Analyze Message</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
