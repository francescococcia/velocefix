import "./globals.css";
import type { Metadata } from "next";
import { APP } from "@/config/app";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: APP.name, description: APP.tagline };
export const preferredRegion = "lhr1";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="relative flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
        <footer className="relative z-10 border-t border-line bg-surface/80 px-4 py-3 text-center text-xs text-muted">
          Demo data: the buildings, people, certificates and slots shown are fictional or synthetic. Clocks are agency policy (private lets), not Awaab&apos;s Law.
        </footer>
      </body>
    </html>
  );
}
