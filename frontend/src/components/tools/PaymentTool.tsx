"use client";

import React, { useState, useRef } from "react";
import { Receipt, Upload, Sparkles, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { analyzePayment } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface PaymentToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

export default function PaymentTool({ onSuccess }: PaymentToolProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [claimedAmount, setClaimedAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imageFile) {
      setError("Please select or upload a payment screenshot.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (claimedAmount) formData.append("claimed_amount", claimedAmount);
      if (currency) formData.append("currency", currency);
      if (notes) formData.append("notes", notes);

      const res = await analyzePayment(formData);
      onSuccess(res, `Payment Proof: ${claimedAmount ? `${currency} ${claimedAmount}` : imageFile.name}`);
    } catch (err: any) {
      setError(err.message || "Failed to analyze payment proof. Ensure local backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate synthetic sample canvas image for 1-click test
  const createSamplePaymentImage = (amount: string, status: string, utr: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, 600);

    // Header bar
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, 400, 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("UPI Payment Confirmation", 24, 42);

    // Status icon & text
    ctx.fillStyle = status === "Completed" ? "#16a34a" : "#d97706";
    ctx.beginPath();
    ctx.arc(200, 160, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(status === "Completed" ? "✓" : "⏳", 200, 168);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`Payment ${status}`, 200, 225);

    // Amount
    ctx.font = "bold 32px sans-serif";
    ctx.fillText(`₹ ${amount}`, 200, 275);

    // Details box
    ctx.textAlign = "left";
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(30, 310, 340, 240);
    ctx.strokeStyle = "#e2e8f0";
    ctx.strokeRect(30, 310, 340, 240);

    ctx.fillStyle = "#64748b";
    ctx.font = "12px sans-serif";
    ctx.fillText("To: merchant@okaxis", 50, 345);
    ctx.fillText("From: buyer@okhdfcbank", 50, 380);
    ctx.fillText("Date: 26 Oct 2026, 11:30 AM", 50, 415);
    ctx.fillText(`UPI Ref / UTR: ${utr || "NOT PROVIDED"}`, 50, 450);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${status.toLowerCase()}_receipt.png`, { type: "image/png" });
        setImageFile(file);
        setImagePreview(canvas.toDataURL("image/png"));
        setClaimedAmount(amount);
      }
    });
  };

  const loadExample = (ex: any) => {
    setClaimedAmount(ex.data.amount);
    setNotes(ex.data.notes);
    if (ex.title.includes("Pending")) {
      createSamplePaymentImage(ex.data.amount, "Pending", "PENDING_AUTH");
    } else {
      createSamplePaymentImage(ex.data.amount, "Completed", "");
    }
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-zinc-800 dark:text-[#A9ACB8]" />
            <span>Payment Proof Lab</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] text-[10px] font-bold uppercase tracking-wider">
            Gemma 4 Vision
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
          Forensically inspects UPI receipts, bank transfer slips, and transaction screenshots for status ambiguity, missing UTRs, and font inconsistencies.
        </p>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.payment.map((ex, i) => (
            <button
              key={i}
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
        {/* Upload dropzone or preview */}
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#22242C] border-2 border-dashed border-zinc-200 dark:border-[#353742] hover:border-zinc-300 dark:hover:border-zinc-500 transition-all text-center">
          {imagePreview ? (
            <div className="flex flex-col items-center">
              <div className="relative max-h-56 rounded-lg overflow-hidden border border-zinc-200 dark:border-[#353742] shadow-sm mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Uploaded Payment Proof" className="max-h-56 w-auto object-contain" />
              </div>
              <div className="text-xs text-zinc-700 dark:text-[#F5F5F7] font-medium">
                {imageFile?.name} ({Math.round((imageFile?.size || 0) / 1024)} KB)
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Remove and choose different image
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <Upload className="w-8 h-8 text-zinc-400 dark:text-zinc-500 mb-2" />
              <div className="text-sm font-semibold text-zinc-700 dark:text-[#F5F5F7]">
                Upload UPI / Bank Screenshot (PNG, JPEG, WebP)
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm">
                Max 10MB. Images are analyzed locally using Gemma 4 Vision.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="payment-file-input"
              />
              <label
                htmlFor="payment-file-input"
                className="mt-4 px-5 py-2.5 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-[#111115] text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                Browse Image File
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="claimed-amount" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
              Claimed Transfer Amount
            </label>
            <input
              id="claimed-amount"
              type="text"
              value={claimedAmount}
              onChange={(e) => setClaimedAmount(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>

          <div>
            <label htmlFor="currency-select" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
              Currency
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
            >
              <option value="INR" className="dark:bg-[#191B21] dark:text-[#F5F5F7]">INR (₹) - Indian Rupee</option>
              <option value="USD" className="dark:bg-[#191B21] dark:text-[#F5F5F7]">USD ($) - US Dollar</option>
              <option value="EUR" className="dark:bg-[#191B21] dark:text-[#F5F5F7]">EUR (€) - Euro</option>
              <option value="GBP" className="dark:bg-[#191B21] dark:text-[#F5F5F7]">GBP (£) - British Pound</option>
              <option value="AED" className="dark:bg-[#191B21] dark:text-[#F5F5F7]">AED (د.إ) - UAE Dirham</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="payment-notes" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
            Transaction Notes / Context (Optional)
          </label>
          <input
            id="payment-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Buyer sent screenshot after purchasing laptop, claims money is on the way"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-500"
          />
        </div>

        {/* Bank Confirmation Principle Disclaimer */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-600 dark:text-[#A9ACB8] flex items-start space-x-2.5 transition-colors">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-800 dark:text-[#F5F5F7]">Cardinal Security Rule:</strong> A screenshot is never proof of received money. Fake payment apps generate spoofed confirmation screens in seconds. Always verify credited funds inside your actual bank app.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {imageFile || claimedAmount || notes ? (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                setClaimedAmount("");
                setNotes("");
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs text-zinc-500 hover:text-red-600 dark:text-[#A9ACB8] dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
            >
              Clear All
            </button>
          ) : <div />}

          <button
            type="submit"
            disabled={loading || !imageFile}
            className="px-6 py-3 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 text-white dark:text-[#111115] text-xs font-semibold shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning Payment Slip...</span>
              </>
            ) : (
              <>
                <span>Verify Payment Proof</span>
                <Receipt className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
