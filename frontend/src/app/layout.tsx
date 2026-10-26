import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proofly — Trust, but verify.",
  description:
    "The internet can fake anything. Know what to trust. Examine suspicious messages, websites, emails, scam calls, and payment proofs with local Gemma 4 forensics.",
  keywords: [
    "Proofly",
    "scam detector",
    "phishing verification",
    "Gemma 4",
    "Ollama",
    "caller intelligence",
    "payment proof verification",
    "digital arrest scam",
    "cybersecurity",
    "hacktoberfest",
  ],
  authors: [{ name: "Proofly Open Source Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} scroll-smooth antialiased`}>
      <body className="min-h-screen bg-white dark:bg-[#101115] text-[#111111] dark:text-[#F5F5F7] font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
