"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export const JOURNEY_STEPS = [
  { n: 1, id: "step-1", short: "Report", href: "/journey#step-1" },
  { n: 2, id: "step-2", short: "Triage", href: "/journey#step-2" },
  { n: 3, id: "step-3", short: "Book", href: "/journey#step-3" },
  { n: 4, id: "step-4", short: "Complete", href: "/journey#step-4" },
  { n: 5, id: "step-5", short: "Asset view", href: "/journey#step-5" },
] as const;

export function JourneyStrip({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="How it works" className={`vf-glass flex flex-wrap items-center gap-2 px-3 py-2 ${className}`}>
      <Link href="/journey" className="text-sm font-semibold text-slate-900 hover:underline">
        How it works
      </Link>
      <ol className="flex min-w-0 flex-1 flex-wrap gap-1 sm:justify-end">
        {JOURNEY_STEPS.map((s) => (
          <li key={s.n}>
            <Link
              href={s.href}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-canvas px-2.5 text-xs font-medium text-slate-700 ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-brand-tint hover:shadow-sm motion-reduce:transform-none"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
                {s.n}
              </span>
              {s.short}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type JourneyTimes = {
  estimateLabel: string;
  jobId: string;
  line: string;
  source?: string;
};

export function JourneyView({ times }: { times: JourneyTimes }) {
  const reduce = useReducedMotion();
  const sample = "No hot water, the tap is stuck so we shut the water off";
  const card = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { y: 12 }, show: { opacity: 1, y: 0 } };
  const list = {
    hidden: {},
    show: { transition: reduce ? { duration: 0 } : { staggerChildren: 0.08, delayChildren: 0.05 } },
  };

  const steps = [
    {
      id: "step-1",
      n: 1,
      icon: "📱",
      title: "Tenant reports on WhatsApp",
      who: "Tenant + agency",
      saves: "No portal form or phone tag — the report lands on the desk in the same thread.",
      body: "A short message (and an optional photo) opens the job.",
      href: "/sim",
      cta: "Open Sim WhatsApp",
      extra: (
        <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-xs text-slate-600 ring-1 ring-line">
          Sample message: “{sample}”
        </p>
      ),
    },
    {
      id: "step-2",
      n: 2,
      icon: "🔎",
      title: "Velo triages, then shows WHY",
      who: "Agency",
      saves: "Facts and priority are cited on the job, not re-typed.",
      body: "Grok proposes a reading. Five checks and the P1–P4 rules are decided by code. Open the WHY panel on the dashboard job.",
      href: `/#job-${times.jobId}`,
      cta: "See the WHY panel",
    },
    {
      id: "step-3",
      n: 3,
      icon: "📅",
      title: "Tenant books by replying 1–3",
      who: "Tenant + agency",
      saves: `${times.line}${times.source ? ` — ${times.source}` : ""}`,
      body: "The tenant picks a slot in WhatsApp. The agency sees the booking on the dashboard. Time saved is a labelled estimate from this job’s own dates, not a published average.",
      href: `/#job-${times.jobId}`,
      cta: "See the booked job",
    },
    {
      id: "step-4",
      n: 4,
      icon: "✅",
      title: "Operator completes, tenant rates",
      who: "Agency + tenant",
      saves: "A verified history record, not a chat scroll. Ratings go out only after the agency presses “Ask tenant to rate”.",
      body: "The completion form writes what was done. The tenant then rates speed and quality (for example 5 4).",
      href: `/jobs/${times.jobId}/complete`,
      cta: "Open the completion form",
    },
    {
      id: "step-5",
      n: 5,
      icon: "🗺️",
      title: "Investor sees the building",
      who: "Asset manager",
      saves: "Occupancy, compliance, repair speed, CSAT and area prices in one Asset view — not scattered tools.",
      body: "Click the pin on the portfolio map, or open Gorse and compare Juniper.",
      href: "/buildings/bld_0006?compare=bld_0119",
      cta: "Open Asset view",
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">How VeloceFix works</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Five steps from a WhatsApp report to the Asset view. Each card opens the real screen. Time saved is a labelled {times.estimateLabel}.
        </p>
      </header>

      <motion.ol className="grid gap-4" variants={list} initial="hidden" animate="show">
        {steps.map((s) => (
          <motion.li
            key={s.id}
            id={s.id}
            variants={card}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28 }}
            className="vf-glass scroll-mt-28 p-4 sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-xl ring-1 ring-brand-soft" aria-hidden>
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {s.n}</p>
                <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-700">{s.body}</p>
                <p className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{s.who} save time ({times.estimateLabel}):</span> {s.saves}
                </p>
                {s.extra}
                <Link
                  href={s.href}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  {s.cta}
                </Link>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ol>

      <motion.aside
        id="step-grok"
        initial={reduce ? false : { y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28, delay: 0.45 }}
        className="vf-glass p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl" aria-hidden>
            🤖
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">Ask Grok Bot</p>
            <h2 className="text-lg font-semibold text-slate-900">“What&apos;s urgent on the repairs desk?”</h2>
            <p className="mt-1 text-sm text-slate-700">
              Grok Bot reads the no-PII <code className="text-xs">/api/ops</code> feed — job id, building, priority, SLA and checks only. No tenant names or phone numbers.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Agency save time ({times.estimateLabel}):</span> ask the desk instead of scanning tickets.
            </p>
            <Link
              href="/api/ops"
              className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-surface px-4 text-sm font-semibold text-ink hover:bg-canvas"
            >
              Open /api/ops
            </Link>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
