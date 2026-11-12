import "./globals.css";
import type { Metadata } from "next";
import { APP } from "@/config/app";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: APP.name, description: APP.tagline };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen font-sans">
        <SiteHeader />
        <div className="bg-amber-100 text-amber-900 text-xs text-center py-1">Example data: fictional buildings, tenants, certificates and slots, plus labelled Dwelly partner cases (synthetic) and Cortile live records when a key is set (synthetic, event only). Clocks are agency policy (private lets), not Awaab&apos;s Law.</div>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
