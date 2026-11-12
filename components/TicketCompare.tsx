"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Priority } from "@/lib/types";
import { PriorityBadge } from "./PriorityBadge";

export interface CompareCell {
  building: string;
  unit: string;
  facts: string;
  priority: Priority;
  clock: string;
  next: string;
  rules: { id: string; label: string; effect: string; kind: string }[];
}

export interface CompareRow {
  issue: string;
  label: string;
  cells: CompareCell[];
}

/** The same report run through the priority engine for each building's record. Preview only: nothing is logged or booked. */
export function TicketCompare({ rows }: { rows: CompareRow[] }) {
  const reduce = useReducedMotion();
  const [issue, setIssue] = useState(rows[0]?.issue);
  const row = rows.find((r) => r.issue === issue) ?? rows[0];
  if (!row) return null;

  return (
    <section className="vf-card p-4">
      <h2 className="text-lg font-semibold">Same report, different building</h2>
      <p className="mt-0.5 text-sm text-slate-600">
        Pick a report. The priority engine runs it against each building&apos;s own record, so you can see which facts change the answer. Preview only: nothing is logged or booked.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Report to compare">
        {rows.map((r) => (
          <button
            key={r.issue}
            type="button"
            aria-pressed={r.issue === row.issue}
            onClick={() => setIssue(r.issue)}
            className={`min-h-10 rounded-full px-3 text-sm font-medium ring-1 transition-colors ${
              r.issue === row.issue ? "bg-brand text-white ring-brand" : "bg-white text-slate-700 ring-slate-300 hover:bg-brand-tint"
            }`}
          >
            “{r.label}”
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {row.cells.map((c, i) => (
          <motion.article
            key={`${row.issue}-${c.building}`}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, delay: reduce ? 0 : i * 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <h3 className="font-semibold text-slate-900">{c.building}</h3>
            <p className="text-xs text-slate-600">{c.unit} · {c.facts}</p>
            <p className="mt-2 flex flex-wrap items-center gap-2">
              <PriorityBadge p={c.priority} />
              <span className="text-sm font-medium text-slate-900">{c.clock}</span>
            </p>
            <p className="mt-1 text-sm text-slate-800">{c.next}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Rules that fired</p>
            <ol className="mt-1 space-y-1.5 text-sm">
              {c.rules.map((r) => (
                <li key={r.id}>
                  <span className="text-slate-900">{r.label}</span>
                  <span className="block text-xs text-slate-600">→ {r.effect} · {r.kind}</span>
                </li>
              ))}
              {c.rules.length === 0 && <li className="text-slate-600">No rule fired, so it stays a routine P3.</li>}
            </ol>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
