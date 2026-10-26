"use client";

import React from "react";
import { MessageSquare, Link2, Mail, Phone, Receipt, Image as ImageIcon } from "lucide-react";
import { ToolType } from "@/lib/types";

interface ToolTabsProps {
  activeTab: ToolType;
  onTabChange: (tab: ToolType) => void;
}

const TABS: { id: ToolType; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: "message", label: "Messages", icon: MessageSquare },
  { id: "website", label: "Websites", icon: Link2 },
  { id: "email", label: "Emails", icon: Mail, badge: "New" },
  { id: "phone", label: "Calls", icon: Phone, badge: "New" },
  { id: "payment", label: "Payments", icon: Receipt },
  { id: "image", label: "Images", icon: ImageIcon },
];

export default function ToolTabs({ activeTab, onTabChange }: ToolTabsProps) {
  return (
    <div className="flex justify-center mb-8">
      {/* Desktop Container: Horizontal pills */}
      <div className="hidden sm:inline-flex items-center bg-zinc-100 dark:bg-[#191B21] p-1.5 rounded-full border border-zinc-200/80 dark:border-[#353742] shadow-inner transition-colors">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-[#22242C] text-black dark:text-[#F5F5F7] shadow-sm font-semibold"
                  : "text-zinc-600 dark:text-[#A9ACB8] hover:text-black dark:hover:text-[#F5F5F7] hover:bg-zinc-200/50 dark:hover:bg-[#272932]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-black dark:text-[#F5F5F7]" : "text-zinc-500 dark:text-[#A9ACB8]"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? "bg-zinc-100 dark:bg-[#191B21] text-zinc-800 dark:text-[#F5F5F7]"
                      : "bg-zinc-200 dark:bg-[#272932] text-zinc-600 dark:text-[#A9ACB8]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Grid: 3 columns */}
      <div className="grid grid-cols-3 gap-2 sm:hidden w-full max-w-sm px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl text-xs font-medium border transition-all ${
                isActive
                  ? "bg-black dark:bg-[#F5F5F7] text-white dark:text-[#111115] border-black dark:border-[#F5F5F7] shadow-md font-semibold"
                  : "bg-zinc-50 dark:bg-[#191B21] text-zinc-600 dark:text-[#A9ACB8] border-zinc-200 dark:border-[#353742] hover:bg-zinc-100 dark:hover:bg-[#272932]"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
