"use client";

import React, { useState, useRef } from "react";
import { Mail, Upload, Sparkles, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { analyzeEmail } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface EmailToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

export default function EmailTool({ onSuccess }: EmailToolProps) {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [rawHeaders, setRawHeaders] = useState("");
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState(false);
  const [emlFile, setEmlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !emlFile && !sender.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (sender) formData.append("sender", sender);
      if (subject) formData.append("subject", subject);
      if (text) formData.append("text", text);
      if (rawHeaders) formData.append("raw_headers", rawHeaders);
      if (emlFile) formData.append("eml_file", emlFile);

      const res = await analyzeEmail(formData);
      onSuccess(res, subject || sender || (emlFile ? emlFile.name : "Email Inspection"));
    } catch (err: any) {
      setError(err.message || "Failed to analyze email. Ensure local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (data: any) => {
    setSender(data.sender || "");
    setSubject(data.subject || "");
    setText(data.text || "");
    setRawHeaders(data.headers || "");
    setShowAdvancedHeaders(Boolean(data.headers));
    setEmlFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEmlFile(file);
      setText(""); // Eml file will be parsed by backend
      setError(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
            <Mail className="w-5 h-5 text-zinc-800 dark:text-[#A9ACB8]" />
            <span>Email Forensics Lab</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] text-[10px] font-bold uppercase tracking-wider">
            MIME &amp; Headers
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
          Analyzes sender domain mismatches, SPF/DKIM authentication, Business Email Compromise (BEC), and malicious attachments.
        </p>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.email.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadExample(ex.data)}
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
        {/* File Upload or Manual Inputs */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-[#F5F5F7]">
                {emlFile ? `Loaded: ${emlFile.name}` : "Upload .eml message file (Optional)"}
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Safe offline parser extracts raw headers, MIME parts, and attachments without execution.
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {emlFile && (
              <button
                type="button"
                onClick={() => {
                  setEmlFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:underline px-2 py-1"
              >
                Clear File
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".eml,message/rfc822"
              onChange={handleFileChange}
              className="hidden"
              id="eml-upload-input"
            />
            <label
              htmlFor="eml-upload-input"
              className="px-4 py-2 rounded-full bg-white dark:bg-[#191B21] border border-zinc-300 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932] text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] cursor-pointer shadow-sm transition-all"
            >
              {emlFile ? "Replace .eml" : "Browse .eml"}
            </label>
          </div>
        </div>

        {!emlFile && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email-sender" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
                  Sender Address (From)
                </label>
                <input
                  id="email-sender"
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder='e.g. "PayPal Billing" <billing@custom-domain.xyz>'
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500 font-mono"
                />
              </div>

              <div>
                <label htmlFor="email-subject" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
                  Subject Line
                </label>
                <input
                  id="email-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Urgent: Overdue payment remittance instructions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-body" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
                Email Body Text
              </label>
              <textarea
                id="email-body"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the body of the suspicious email here..."
                className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
                className="text-xs font-semibold text-zinc-600 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] flex items-center space-x-1"
              >
                <span>{showAdvancedHeaders ? "Hide Raw MIME Headers" : "+ Add Raw Email Headers (SPF, DKIM, Reply-To)"}</span>
                {showAdvancedHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedHeaders && (
                <div className="mt-2 animate-fade-in-up">
                  <textarea
                    rows={4}
                    value={rawHeaders}
                    onChange={(e) => setRawHeaders(e.target.value)}
                    placeholder="Paste email headers (Authentication-Results, Received-SPF, Return-Path, Reply-To)..."
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Headers pasted manually are labeled unauthenticated unless cryptographically signed.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {sender.trim() || subject.trim() || text.trim() || rawHeaders.trim() ? (
            <button
              type="button"
              onClick={() => {
                setSender("");
                setSubject("");
                setText("");
                setRawHeaders("");
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-red-600 dark:text-[#A9ACB8] dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Reset Fields
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={loading || (!text.trim() && !emlFile && !sender.trim())}
            className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dissecting Email MIME...</span>
              </>
            ) : (
              <>
                <span>Perform Forensics</span>
                <Mail className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
