import { getStore, saveStore } from "./store";
import { outboundNumberFor } from "./phones";
import { ratingRequestBody, sendWhatsApp } from "./twilio";
import type { Job, RatingAsk, RatingScore, TenantRating } from "./types";

export interface SatisfactionSummary {
  n: number;
  avgSpeed: number | null;
  avgQuality: number | null;
  csatPercent: number | null;
  exampleN: number;
  exampleAvgSpeed: number | null;
  exampleAvgQuality: number | null;
  exampleCsatPercent: number | null;
}

function mean(ns: number[]): number | null {
  if (ns.length === 0) return null;
  return ns.reduce((a, b) => a + b, 0) / ns.length;
}

function csat(ratings: TenantRating[]): number | null {
  if (ratings.length === 0) return null;
  const happy = ratings.filter((r) => (r.speed + r.quality) / 2 >= 4).length;
  return (happy / ratings.length) * 100;
}

function avgs(ratings: TenantRating[]) {
  return {
    n: ratings.length,
    avgSpeed: mean(ratings.map((r) => r.speed)),
    avgQuality: mean(ratings.map((r) => r.quality)),
    csatPercent: csat(ratings),
  };
}

/** Live totals use only non-example ratings. Example-data ratings are reported separately. */
export function summariseRatings(jobs: Job[]): SatisfactionSummary {
  const all = jobs.map((j) => j.rating).filter((r): r is TenantRating => Boolean(r));
  const real = all.filter((r) => !r.exampleData);
  const example = all.filter((r) => r.exampleData);
  const live = avgs(real);
  const ex = avgs(example);
  return {
    n: live.n,
    avgSpeed: live.avgSpeed,
    avgQuality: live.avgQuality,
    csatPercent: live.csatPercent,
    exampleN: ex.n,
    exampleAvgSpeed: ex.avgSpeed,
    exampleAvgQuality: ex.avgQuality,
    exampleCsatPercent: ex.csatPercent,
  };
}

export function isScore(n: number): n is RatingScore {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

/**
 * Parse "5 4", "5/4", "5,4", "speed 5 quality 4", or a single digit 1–5.
 * Returns null if the message does not look like a rating (so a new repair can still be logged).
 */
export function parseRatingText(text: string): { speed: RatingScore; quality: RatingScore } | { score: RatingScore } | null {
  const raw = text.trim();
  if (!raw) return null;
  const pair = raw.match(/^\s*([1-5])\s*[\/,|\-]\s*([1-5])\s*$/);
  if (pair) return { speed: Number(pair[1]) as RatingScore, quality: Number(pair[2]) as RatingScore };
  const spaced = raw.match(/^\s*([1-5])\s+([1-5])\s*$/);
  if (spaced) return { speed: Number(spaced[1]) as RatingScore, quality: Number(spaced[2]) as RatingScore };
  const speedQuality = raw.match(/speed\s*[:\-]?\s*([1-5]).*quality\s*[:\-]?\s*([1-5])/i);
  if (speedQuality) return { speed: Number(speedQuality[1]) as RatingScore, quality: Number(speedQuality[2]) as RatingScore };
  const qualitySpeed = raw.match(/quality\s*[:\-]?\s*([1-5]).*speed\s*[:\-]?\s*([1-5])/i);
  if (qualitySpeed) return { speed: Number(qualitySpeed[2]) as RatingScore, quality: Number(qualitySpeed[1]) as RatingScore };
  const one = raw.match(/^\s*([1-5])\s*$/);
  if (one) return { score: Number(one[1]) as RatingScore };
  return null;
}

export function findPendingRatingJob(jobs: Job[], unitId: string): Job | undefined {
  const pending = jobs
    .filter((j) => j.unitId === unitId && j.status === "completed" && j.ratingAsk?.pending && !j.rating)
    .sort((a, b) => (b.ratingAsk?.requestedAt ?? "").localeCompare(a.ratingAsk?.requestedAt ?? ""));
  return pending[0];
}

export function applyTenantRating(
  job: Job,
  rating: Omit<TenantRating, "at">,
  now = new Date(),
): TenantRating {
  const stored: TenantRating = { ...rating, at: now.toISOString() };
  job.rating = stored;
  job.ratingAsk = job.ratingAsk
    ? { ...job.ratingAsk, pending: false, partialSpeed: undefined }
    : { requestedAt: stored.at, pending: false };
  return stored;
}

export function thanksBody(rating: TenantRating) {
  return `Thanks — we've recorded speed ${rating.speed}/5 and fix quality ${rating.quality}/5.`;
}

export function qualityPrompt() {
  return "Thanks. And how would you rate the quality of the fix, from 1 (poor) to 5 (excellent)?";
}

export function ratingNudge() {
  return "If you're rating the completed repair, reply with two scores from 1 to 5 (speed then quality), for example 5 4. If this is a new problem, tell us what's wrong.";
}

export async function askTenantToRate(jobId: string, now = new Date()) {
  const store = getStore();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return { error: "Job not found", status: 404 as const };
  if (job.status !== "completed" || !job.completion) {
    return { error: "Ask for a rating only after the job is completed.", status: 409 as const };
  }
  if (job.rating && !job.rating.exampleData) {
    return { error: "This job already has a tenant rating.", status: 409 as const, job };
  }

  const body = ratingRequestBody(job.id, job.proposal.issue);
  const tenant = store.tenants.find((t) => t.unitId === job.unitId);
  const to = outboundNumberFor({ phoneHash: tenant?.phoneHash, unitId: job.unitId });

  let sent = false;
  let sendError: string | undefined;
  if (!to) {
    sendError = "No WhatsApp number on file for this tenancy. The rating is pending — the tenant can reply in Sim WhatsApp or by inbound WhatsApp after messaging us once.";
  } else {
    const result = await sendWhatsApp(to, body);
    sent = result.ok;
    sendError = result.ok ? undefined : result.error;
  }

  const ask: RatingAsk = {
    requestedAt: now.toISOString(),
    pending: true,
    sent,
    sendError,
    partialSpeed: undefined,
  };
  job.ratingAsk = ask;
  job.messages.push({
    at: ask.requestedAt,
    direction: "out",
    body,
    channel: sent ? "whatsapp" : "portal",
  });
  saveStore();
  return { job, body, sent, sendError };
}
