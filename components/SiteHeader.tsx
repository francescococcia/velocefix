"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { APP } from "@/config/app";
import { MotionButton } from "./Motion";
import { motion, useReducedMotion } from "framer-motion";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span whileHover={reduce ? undefined : { y: -1 }} className="inline-block">
      <Link href={href} className="underline underline-offset-2 min-h-11 inline-flex items-center">
        {children}
      </Link>
    </motion.span>
  );
}

export function SiteHeader() {
  return (
    <header className="relative z-10 bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-2xl" aria-hidden>
          🔧
        </span>
        <div className="min-w-0">
          <Link href="/" className="text-xl font-bold">
            {APP.name}
          </Link>
          <p className="text-xs text-slate-300">{APP.tagline}</p>
        </div>
        <div className="ml-auto w-full sm:w-auto text-left sm:text-right text-xs text-slate-300">
          <div>
            <b className="text-white">{APP.mascot.name}</b> says: “{APP.mascot.line}”
          </div>
          <nav className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/sim">Sim WhatsApp</NavLink>
          </nav>
        </div>
      </div>
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
      className={`min-h-11 w-full rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </MotionButton>
  );
}
