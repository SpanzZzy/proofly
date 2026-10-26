"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Upload, Sparkles, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { analyzeImage } from "@/lib/api";
import { AnalysisResponse } from "@/lib/types";
import { EXAMPLES } from "@/lib/examples";

interface ImageToolProps {
  onSuccess: (res: AnalysisResponse, query: string) => void;
}

export default function ImageTool({ onSuccess }: ImageToolProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [contextDescription, setContextDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imageFile) {
      setError("Please select or upload an image to inspect.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      if (contextDescription) formData.append("context_description", contextDescription);

      const res = await analyzeImage(formData);
      onSuccess(res, `Image Evidence: ${imageFile.name}`);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image evidence. Ensure local backend is running.");
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

  // Generate synthetic sample graphic on canvas for 1-click test
  const createSampleAdImage = (headline: string, discount: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 500, 500);
    grad.addColorStop(0, "#09090b");
    grad.addColorStop(1, "#27272a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 500, 500);

    // Badge
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(30, 30, 160, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("EXCLUSIVE FLASH SALE", 40, 53);

    // Headline
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(headline, 30, 120);

    // Discount callout
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(discount, 30, 190);

    // Fake countdown timer box
    ctx.fillStyle = "#18181b";
    ctx.fillRect(30, 230, 440, 70);
    ctx.strokeStyle = "#3f3f46";
    ctx.strokeRect(30, 230, 440, 70);
    ctx.fillStyle = "#f87171";
    ctx.font = "14px monospace";
    ctx.fillText("OFFER EXPIRES IN: 00:09:42 · ONLY 2 LEFT", 50, 270);

    // Fake official seal
    ctx.fillStyle = "#38bdf8";
    ctx.font = "12px sans-serif";
    ctx.fillText("✓ 100% Authorized Distributor Guarantee · Official Certified Seal", 30, 340);

    // Bogus order button
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30, 380, 240, 50);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("BUY NOW AT ₹4,999", 55, 412);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "sample_scam_advertisement.png", { type: "image/png" });
        setImageFile(file);
        setImagePreview(canvas.toDataURL("image/png"));
      }
    });
  };

  const loadExample = (ex: any) => {
    setContextDescription(ex.data.context);
    createSampleAdImage("Apple iPhone 16 Pro Max", "90% OFF TODAY");
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-[#191B21] rounded-3xl border border-zinc-200/90 dark:border-[#353742] shadow-sm p-6 sm:p-8 text-left transition-colors">
      <div className="pb-6 border-b border-zinc-100 dark:border-[#353742]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-zinc-800 dark:text-[#F5F5F7]" />
            <span>Image Evidence Inspector</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#272932] text-zinc-700 dark:text-[#A9ACB8] text-[10px] font-bold uppercase tracking-wider">
            Visual Forensics
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-[#A9ACB8] mt-1">
          Forensically examines scam advertisements, fake notices, social media claims, and counterfeit certificates using Gemma 4 Vision.
        </p>
      </div>

      {/* Examples Row */}
      <div className="my-5">
        <div className="text-[11px] font-semibold text-zinc-400 dark:text-[#A9ACB8] uppercase tracking-wider mb-2 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-zinc-500 dark:text-[#A9ACB8]" />
          <span>Try 1-Click Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.image.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-[#22242C] hover:bg-zinc-100 dark:hover:bg-[#272932] border border-zinc-200 dark:border-[#353742] text-zinc-700 dark:text-[#F5F5F7] transition-all hover:scale-[1.01]"
            >
              <span className="font-medium">{ex.title}</span>
              <span className="ml-1.5 text-[10px] text-zinc-400 dark:text-[#A9ACB8]">({ex.badge})</span>
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
                <img src={imagePreview} alt="Uploaded Image Evidence" className="max-h-56 w-auto object-contain" />
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
              <Upload className="w-8 h-8 text-zinc-400 dark:text-[#A9ACB8] mb-2" />
              <div className="text-sm font-semibold text-zinc-700 dark:text-[#F5F5F7]">
                Upload Media, Scam Ad, or Notice (PNG, JPEG, WebP)
              </div>
              <p className="text-xs text-zinc-400 dark:text-[#A9ACB8] mt-1 max-w-sm">
                Max 10MB. Evaluated locally with Gemma 4 Vision.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="image-file-input"
              />
              <label
                htmlFor="image-file-input"
                className="mt-4 px-5 py-2.5 rounded-full bg-black dark:bg-[#F5F5F7] hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-[#111115] text-xs font-semibold cursor-pointer shadow-sm transition-all"
              >
                Browse Image File
              </label>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="image-context" className="block text-xs font-semibold text-zinc-700 dark:text-[#F5F5F7] mb-1.5">
            Context or Where This Image Was Encountered (Optional)
          </label>
          <input
            id="image-context"
            type="text"
            value={contextDescription}
            onChange={(e) => setContextDescription(e.target.value)}
            placeholder="e.g. Sponsored Facebook ad, WhatsApp group forward, unsolicited message"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-900 dark:text-[#F5F5F7] placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-400"
          />
        </div>

        {/* Deepfake / Forensic Limitation Notice */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#22242C] border border-zinc-200 dark:border-[#353742] text-xs text-zinc-600 dark:text-[#A9ACB8] flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-zinc-500 dark:text-[#A9ACB8] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-800 dark:text-[#F5F5F7]">Analytical Boundary:</strong> Proofly evaluates visible text claims, brand heraldry, and deceptive tactics. We do not promise 100% automated deepfake pixel detection without raw sensor forensics.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {imageFile || contextDescription ? (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                setContextDescription("");
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
                <span>Forensic Vision Evaluating...</span>
              </>
            ) : (
              <>
                <span>Inspect Visual Evidence</span>
                <ImageIcon className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
