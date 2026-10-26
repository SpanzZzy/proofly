"use client";

import React from "react";
import { X, Trash2, Clock, ArrowRight } from "lucide-react";
import { HistoryItem } from "@/lib/types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in-overlay">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#191B21] h-full shadow-2xl flex flex-col z-10 animate-fade-in-up border-l border-zinc-200 dark:border-[#353742] transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-[#353742] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black dark:text-[#F5F5F7] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-zinc-700 dark:text-[#F5F5F7]" />
              <span>Investigation History</span>
            </h3>
            <p className="text-xs text-zinc-400 dark:text-[#A9ACB8] mt-0.5">Stored 100% locally in your browser storage.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-[#272932] text-zinc-500 dark:text-[#A9ACB8]"
            aria-label="Close History"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-[#A9ACB8] text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No recent investigations recorded.</p>
              <p className="text-[11px] mt-1">Inspections you perform will appear here for reference.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#22242C] hover:bg-zinc-100 dark:hover:bg-[#272932] border border-zinc-200/80 dark:border-[#353742] cursor-pointer transition-all hover:scale-[1.01] text-left group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 dark:text-[#F5F5F7] capitalize flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                    <span>{item.tool}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.risk_score >= 50
                        ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50"
                        : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
                    }`}
                  >
                    Risk {item.risk_score}/100
                  </span>
                </div>
                <div className="text-xs font-medium text-black dark:text-[#F5F5F7] line-clamp-1">{item.title}</div>
                <div className="text-[11px] text-zinc-500 dark:text-[#A9ACB8] truncate mt-0.5 font-mono">{item.query}</div>
                <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-[#353742] flex items-center justify-between text-[10px] text-zinc-400 dark:text-[#A9ACB8]">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <span className="text-black dark:text-[#F5F5F7] font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                    View <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-[#353742] bg-zinc-50 dark:bg-[#22242C] flex items-center justify-between">
            <button
              onClick={onClear}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <span className="text-[11px] text-zinc-400 dark:text-[#A9ACB8]">{history.length} record(s)</span>
          </div>
        )}
      </div>
    </div>
  );
}
