"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "overdue", label: "Overdue" },
  { id: "urgent", label: "High priority" },
  { id: "booked", label: "Booked" },
  { id: "completed", label: "Completed" },
] as const;

export type WorkFilter = (typeof FILTERS)[number]["id"];

export interface WorkItem {
  id: string;
  tags: WorkFilter[];
  head: ReactNode;
  body: ReactNode;
}

/**
 * One list of every job, filterable and expandable. Driven by the URL hash so
 * server-rendered links can control it: #show-<filter> picks a filter,
 * #job-<id> opens that job.
 */
export function WorkQueue({ items }: { items: WorkItem[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<WorkFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      const smooth: ScrollBehavior = reduce ? "auto" : "smooth";
      if (h.startsWith("show-")) {
        const f = FILTERS.find((x) => x.id === h.slice(5));
        if (!f) return;
        setFilter(f.id);
        setOpenId(null);
        document.getElementById("work")?.scrollIntoView({ behavior: smooth });
      } else if (h.startsWith("job-")) {
        setFilter("all");
        setOpenId(h.slice(4));
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ behavior: smooth, block: "center" }));
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [reduce]);

  const shown = items.filter((i) => filter === "all" || i.tags.includes(filter));
  const count = (f: WorkFilter) => (f === "all" ? items.length : items.filter((i) => i.tags.includes(f)).length);

  return (
    <section id="work" className="vf-glass scroll-mt-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-lg font-semibold">Work queue</h2>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter jobs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`relative min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${
                filter === f.id ? "text-white" : "text-slate-700 hover:bg-brand-tint"
              }`}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="work-filter-pill"
                  className="absolute inset-0 rounded-full bg-brand"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">
                {f.label} <span className="tabular-nums opacity-70">{count(f.id)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500">Click a job to see its fact checks, why it got that priority, and the unit history.</p>

      {shown.length === 0 && <p className="mt-3 text-sm text-slate-500">No jobs in this view.</p>}
      <ul className="mt-2 grid gap-2">
        <AnimatePresence initial={false}>
          {shown.map((item) => {
            const open = openId === item.id;
            return (
              <motion.li
                key={item.id}
                id={`job-${item.id}`}
                layout={reduce ? false : "position"}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reduce ? 0 : 0.22 }}
                className={`scroll-mt-28 rounded-xl border bg-white/70 ${open ? "border-brand shadow-md" : "border-slate-200"}`}
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`job-body-${item.id}`}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex min-h-12 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-brand-tint focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">{item.head}</span>
                  <motion.span aria-hidden animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="shrink-0 text-slate-500">
                    ▾
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`job-body-${item.id}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200 px-3 py-3">{item.body}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </section>
  );
}
