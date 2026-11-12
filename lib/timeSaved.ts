// Compare the agency's old path with VeloceFix for a job. Figures are estimates.
// Old-path dates come from config/app.ts anchors; VeloceFix times from the store.
// No assumed industry averages and no cited studies.

import { APP } from "@/config/app";
import type { Job } from "./types";

export type TimeSavedAnchor = {
  kind: "still_open" | "report_to_booking";
  reportedAt: string;
  bookedAt?: string;
  source: string;
};

export interface TimeSavedComparison {
  jobId: string;
  estimate: true;
  oldMs?: number;
  oldKind?: "still_open" | "report_to_booking";
  oldSource?: string;
  velocefixMs?: number;
  velocefixKind?: "offer" | "booking";
  velocefixAt?: string;
  savedMs?: number;
  inWeek: boolean;
}

const anchors = APP.timeSaved.anchors as Record<string, TimeSavedAnchor>;

function msBetween(from: string, to: string) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return undefined;
  return b - a;
}

function reportAt(job: Job) {
  const firstIn = job.messages.find((m) => m.direction === "in");
  return firstIn?.at ?? job.createdAt;
}

/** First offer or booking timestamp actually present on the job in the store. */
export function velocefixStop(job: Job): { at: string; kind: "offer" | "booking" } | undefined {
  // completed jobs keep their booking time, or the weekly tile drops to 0 when a job is closed
  if (job.status === "booked" || job.status === "completed") {
    const bookedMsg = [...job.messages].reverse().find(
      (m) => m.direction === "out" && (/✅\s*Booked/i.test(m.body) || /Booked:/i.test(m.body)),
    );
    const at = bookedMsg?.at ?? job.lastAgencyReplyAt ?? undefined;
    if (at) return { at, kind: "booking" };
  }
  if (job.status === "slots_offered" || (job.offeredSlotIds && job.offeredSlotIds.length > 0)) {
    const offerMsg = job.messages.find(
      (m) => m.direction === "out" && /Reply 1/i.test(m.body),
    );
    const at = offerMsg?.at ?? (job.status === "slots_offered" ? job.lastAgencyReplyAt : undefined) ?? undefined;
    if (at) return { at, kind: "offer" };
  }
  return undefined;
}

export function compareTimeSaved(job: Job, now = new Date()): TimeSavedComparison {
  const anchor = anchors[job.id];
  const out: TimeSavedComparison = { jobId: job.id, estimate: true, inWeek: false };

  if (anchor?.kind === "still_open") {
    out.oldMs = msBetween(anchor.reportedAt, now.toISOString());
    out.oldKind = "still_open";
    out.oldSource = anchor.source;
  } else if (anchor?.kind === "report_to_booking" && anchor.bookedAt) {
    out.oldMs = msBetween(anchor.reportedAt, anchor.bookedAt);
    out.oldKind = "report_to_booking";
    out.oldSource = anchor.source;
  }

  const stop = velocefixStop(job);
  if (stop) {
    out.velocefixMs = msBetween(reportAt(job), stop.at);
    out.velocefixKind = stop.kind;
    out.velocefixAt = stop.at;
    const weekMs = APP.timeSaved.week.hours * 3600_000;
    out.inWeek = now.getTime() - new Date(stop.at).getTime() <= weekMs && now.getTime() - new Date(stop.at).getTime() >= 0;
  }

  if (out.oldMs != null && out.velocefixMs != null && out.oldMs >= out.velocefixMs) {
    out.savedMs = out.oldMs - out.velocefixMs;
  }
  return out;
}

export function timeSavedThisWeek(jobs: Job[], now = new Date()) {
  const rows = jobs.map((j) => compareTimeSaved(j, now)).filter((c) => c.inWeek && c.savedMs != null);
  return {
    savedMs: rows.reduce((sum, c) => sum + (c.savedMs ?? 0), 0),
    jobCount: rows.length,
    estimate: true as const,
    windowHours: APP.timeSaved.week.hours,
  };
}

/** Human duration: seconds / minutes when short, then hours, then days. */
export function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return sec === 1 ? "1 second" : `${sec} seconds`;
  const min = Math.round(ms / 60_000);
  if (min < 60) return min === 1 ? "1 minute" : `${min} minutes`;
  const hours = Math.floor(ms / 3_600_000);
  const remMin = Math.round((ms - hours * 3_600_000) / 60_000);
  if (hours < 48) {
    if (remMin === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
    return `${hours} hour${hours === 1 ? "" : "s"} ${remMin} minute${remMin === 1 ? "" : "s"}`;
  }
  const days = Math.floor(ms / 86_400_000);
  const remH = Math.round((ms - days * 86_400_000) / 3_600_000);
  if (remH === 0) return days === 1 ? "1 day" : `${days} days`;
  return `${days} day${days === 1 ? "" : "s"} ${remH} hour${remH === 1 ? "" : "s"}`;
}

export function timeSavedLine(c: TimeSavedComparison) {
  const bits: string[] = [];
  if (c.oldMs != null && c.oldKind === "still_open") {
    bits.push(`old path still open after ${formatDuration(c.oldMs)}`);
  } else if (c.oldMs != null && c.oldKind === "report_to_booking") {
    bits.push(`old path ${formatDuration(c.oldMs)}, report to booking`);
  } else {
    bits.push("old path: no case dates in config");
  }
  if (c.velocefixMs != null) {
    bits.push(`VeloceFix ${c.velocefixKind} in ${formatDuration(c.velocefixMs)}`);
  } else {
    bits.push("VeloceFix: no offer or booking yet");
  }
  if (c.savedMs != null) bits.push(`saved ${formatDuration(c.savedMs)}`);
  return bits.join(". ");
}
