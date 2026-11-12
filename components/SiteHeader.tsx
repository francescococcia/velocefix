"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP } from "@/config/app";
import { MotionButton } from "./Motion";
import { motion, useReducedMotion } from "framer-motion";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const path = usePathname();
  const active = href === "/" ? path === "/" : path.startsWith(href);
  return (
    <motion.span whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.96 }} className="inline-block">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium transition-colors hover:bg-brand-tint hover:text-brand-strong ${active ? "bg-brand-soft text-brand-strong" : "text-ink"}`}
      >
        {children}
      </Link>
    </motion.span>
  );
}

export function SiteHeader() {
  return (
    <header className="relative z-20 bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="vf-logo flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-xl" aria-hidden>
          🔧
        </span>
        <div className="min-w-0">
          <Link href="/" className="text-xl font-bold text-ink">
            {APP.name}
          </Link>
          <p className="text-xs text-muted">{APP.tagline}</p>
        </div>
        <div className="ml-auto w-full sm:w-auto text-left sm:text-right text-xs text-muted">
          <div>
            <b className="text-ink">{APP.mascot.name}</b> says: “{APP.mascot.line}”
          </div>
          <nav className="-mx-3 mt-1 flex flex-wrap gap-x-1 sm:mx-0 sm:justify-end">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/journey">How it works</NavLink>
            <NavLink href="/sim">Sim WhatsApp</NavLink>
          </nav>
        </div>
      </div>
      <div className="vf-accent-line" aria-hidden />
    </header>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: ComponentProps<typeof MotionButton>) {
  return (
    <MotionButton
      className={`min-h-11 w-full rounded-lg bg-brand px-4 py-3 text-base font-semibold text-white disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </MotionButton>
  );
}
