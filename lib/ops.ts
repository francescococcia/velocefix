// No-PII repairs-desk feed. Never includes phone numbers, hashes, or tenant names.

import { dueAt } from "./priority";
import type { Job, StoreData } from "./types";

export function opsJob(store: StoreData, job: Job, now = new Date()) {
  const unit = store.units.find((u) => u.id === job.unitId);
  const building = unit ? store.buildings.find((b) => b.id === unit.buildingId) : undefined;
  const op = job.operatorId ? store.operators.find((o) => o.id === job.operatorId) : undefined;
  const slot = op && job.slotId ? op.slots.find((s) => s.id === job.slotId) : undefined;
  const due = dueAt(job.createdAt, job.priority.clock.hours);
  const overdue = job.status !== "completed" && job.priority.clock.hours > 0 && due.getTime() < now.getTime();
  const sources = [
    ...job.priority.firedRules.map((r) => r.source),
    ...job.checks.map((c) => c.source),
    job.source,
  ].filter((s, i, a): s is string => Boolean(s) && a.indexOf(s) === i);

  return {
    id: job.id,
    buildingName: building?.name ?? null,
    unitLabel: unit?.label ?? null,
    priority: job.priority.priority,
    status: job.status,
    sla: {
      dueAt: due.toISOString(),
      overdue,
      hours: job.priority.clock.hours,
      label: job.priority.clock.label,
      basis: job.priority.clock.basis,
    },
    bookedSlot: slot
      ? { start: slot.start, end: slot.end, operatorName: op?.name ?? null, trade: op?.trade ?? null }
      : null,
    checks: job.checks.map((c) => ({ id: c.id, label: c.label, status: c.status })),
    sources,
  };
}

export function opsFeed(store: StoreData, opts: { priority?: string; overdue?: boolean }, now = new Date()) {
  let jobs = store.jobs.map((j) => opsJob(store, j, now));
  if (opts.priority) jobs = jobs.filter((j) => j.priority === opts.priority);
  if (opts.overdue) jobs = jobs.filter((j) => j.sla.overdue);
  return {
    meta: {
      label: "VeloceFix repairs desk — no PII",
      asOf: now.toISOString(),
      filters: { priority: opts.priority ?? null, overdue: opts.overdue ?? false },
    },
    jobs,
  };
}
