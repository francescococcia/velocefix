import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { APP } from "@/config/app";

export const metadata: Metadata = { title: APP.name, description: APP.tagline };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen font-sans">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <span className="text-2xl" aria-hidden>🔧</span>
            <div>
              <Link href="/" className="text-xl font-bold">{APP.name}</Link>
              <p className="text-xs text-slate-300">{APP.tagline}</p>
            </div>
            <div className="ml-auto text-right text-xs text-slate-300">
              <div><b className="text-white">{APP.mascot.name}</b> says: “{APP.mascot.line}”</div>
              <nav className="mt-1 space-x-3"><Link href="/" className="underline">Dashboard</Link><Link href="/sim" className="underline">Sim WhatsApp</Link></nav>
            </div>
          </div>
        </header>
        <div className="bg-amber-100 text-amber-900 text-xs text-center py-1">Example data: fictional buildings, tenants, certificates and slots. Clocks are agency policy (private lets), not Awaab&apos;s Law.</div>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
