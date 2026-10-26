"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export default function ThemeToggle({ className = "", showLabels = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "dark" ? "dark" : "light") : "light";

  const handleSetTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    // Explicitly toggle .dark class on <html> as well to guarantee instantaneous sync
    if (typeof document !== "undefined") {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`inline-flex items-center p-1 rounded-full bg-zinc-100 dark:bg-[#191B21] border border-zinc-200 dark:border-[#353742] shadow-inner transition-colors ${className}`}
    >
      {/* Light Theme Button */}
      <button
        type="button"
        id="theme-toggle-light"
        onClick={() => handleSetTheme("light")}
        aria-label="Use light theme"
        title="Use light theme"
        aria-pressed={currentTheme === "light"}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
          currentTheme === "light"
            ? "bg-white text-black shadow-sm font-semibold scale-100 border border-zinc-200/80"
            : "text-zinc-500 dark:text-[#A9ACB8] hover:text-black dark:hover:text-white"
        }`}
      >
        <Sun className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
        {showLabels && <span>Light</span>}
      </button>

      {/* Dark Theme Button */}
      <button
        type="button"
        id="theme-toggle-dark"
        onClick={() => handleSetTheme("dark")}
        aria-label="Use dark theme"
        title="Use dark theme"
        aria-pressed={currentTheme === "dark"}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
          currentTheme === "dark"
            ? "bg-[#22242C] text-[#F5F5F7] shadow-sm font-semibold scale-100 border border-[#353742]"
            : "text-zinc-500 dark:text-[#A9ACB8] hover:text-black dark:hover:text-white"
        }`}
      >
        <Moon className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
        {showLabels && <span>Dark</span>}
      </button>
    </div>
  );
}
