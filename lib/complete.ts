import { getStore, saveStore } from "./store";
import type { Completion, Job, NoticeDraft, Trade, Work } from "./types";

export const WORK_DONE = [
  { id: "repaired", label: "Repaired" },
  { id: "replaced_part", label: "Replaced part" },
  { id: "made_safe", label: "Made safe" },
  { id: "no_fault_found", label: "No fault found" },
  { id: "could_not_complete", label: "Could not complete" },
] as const;

export type WorkDoneId = (typeof WORK_DONE)[number]["id"];

export function workDoneLabel(id: string) {
  return WORK_DONE.find((w) => w.id === id)?.label ?? id;
}

export function formatLondon(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function londonDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: "Europe/London" }); // YYYY-MM-DD
}

export interface CompletionInput {
  workDone: string;
  workNote?: string;
  parts?: string;
  cause: string;
  followUpNeeded: boolean;
  followUp?: string;
  safetyObservation?: string;
  photoUrl?: string;
  operatorName: string;
  operatorTrade?: Trade;
}

export function parseCompletionInput(raw: Record<string, unknown>): CompletionInput | string {
  const workDone = String(raw.workDone ?? "").trim();
  const cause = String(raw.cause ?? "").trim();
  const operatorName = String(raw.operatorName ?? "").trim();
  if (!WORK_DONE.some((w) => w.id === workDone)) return "Choose what work was done.";
  if (!cause) return "Root cause is required.";
  if (!operatorName) return "Operator name is required.";
  const followRaw = raw.followUpNeeded;
  const followUpNeeded = followRaw === true || followRaw === "true" || followRaw === "yes" || followRaw === "on";
  const trade = String(raw.operatorTrade ?? "").trim();
  const trades: Trade[] = ["plumbing_heating", "electrical", "flooring_general", "locksmith"];
  return {
    workDone,
    workNote: String(raw.workNote ?? "").trim() || undefined,
    parts: String(raw.parts ?? "").trim() || undefined,
    cause,
    followUpNeeded,
    followUp: String(raw.followUp ?? "").trim() || undefined,
    safetyObservation: String(raw.safetyObservation ?? "").trim() || undefined,
    photoUrl: String(raw.photoUrl ?? "").trim() || undefined,
    operatorName,
    operatorTrade: trades.includes(trade as Trade) ? (trade as Trade) : undefined,
  };
}

function noticeBody(job: Job, c: Completion, unitLabel: string, buildingName: string) {
  const when = formatLondon(c.at);
  const lines = [
    `We're writing about the repair at ${unitLabel}, ${buildingName} (${job.proposal.issue.replace(/_/g, " ")}).`,
    `The engineer (${c.operatorName}) recorded the work as ${c.fixed ? "complete" : "not complete"} on ${when} Europe/London.`,
    `Work done: ${workDoneLabel(c.workDone)}${c.workNote ? ` — ${c.workNote.replace(/[.\s]+$/, "")}` : ""}.`,
    c.parts ? `Parts replaced: ${c.parts.replace(/[.\s]+$/, "")}.` : "",
    `Root cause: ${c.cause.replace(/[.\s]+$/, "")}.`,
    c.followUpNeeded ? `A follow-up visit is needed${c.followUp ? `: ${c.followUp.replace(/[.\s]+$/, "")}.` : "."}` : "No follow-up visit is needed.",
    c.safetyObservation ? `Safety observation: ${c.safetyObservation.replace(/[.\s]+$/, "")}.` : "",
    "This is a draft notice. The agency must approve it before it is sent.",
  ];
  return lines.filter(Boolean).join("\n\n");
}

export function applyCompletion(jobId: string, input: CompletionInput, now = new Date()) {
  const store = getStore();
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return { error: "Job not found", status: 404 as const };
  if (job.status === "completed" && job.completion) {
    const work = store.works.find((w) => w.id === `w-complete-${job.id}`);
    const notice = store.notices.find((n) => n.jobId === job.id);
    return { job, work, notice, already: true as const };
  }
  if (job.status !== "booked") return { error: "Only a booked job can be completed from this form.", status: 409 as const };

  const at = now.toISOString();
  const stamp = `${formatLondon(at)} Europe/London`;
  const source = `Operator completion form, ${input.operatorName}, ${stamp}`;
  const fixed = input.workDone !== "could_not_complete";
  const completion: Completion = {
    at,
    cause: input.cause,
    parts: input.parts ?? "",
    fixed,
    followUp: input.followUpNeeded ? (input.followUp || "Follow-up needed") : "No follow-up needed",
    workDone: input.workDone,
    workNote: input.workNote,
    followUpNeeded: input.followUpNeeded,
    safetyObservation: input.safetyObservation,
    photoUrl: input.photoUrl,
    operatorName: input.operatorName,
    operatorTrade: input.operatorTrade,
  };

  const clause = (s: string) => s.replace(/[.\s]+$/, "");
  const summary = [
    `${workDoneLabel(input.workDone)}${input.workNote ? `: ${clause(input.workNote)}` : ""}`,
    input.parts ? `Parts: ${clause(input.parts)}` : "",
    `Cause: ${clause(input.cause)}`,
    input.followUpNeeded ? `Follow-up needed${input.followUp ? `: ${clause(input.followUp)}` : ""}` : "No follow-up",
  ].filter(Boolean).join(". ") + ".";

  const work: Work = {
    id: `w-complete-${job.id}`,
    unitId: job.unitId,
    date: londonDate(at),
    trade: input.operatorTrade ?? job.proposal.trade,
    category: job.proposal.issue,
    summary,
    source,
    verified: true,
    workDone: input.workDone,
    workNote: input.workNote,
    parts: input.parts,
    cause: input.cause,
    followUpNeeded: input.followUpNeeded,
    followUp: input.followUp,
    safetyObservation: input.safetyObservation,
    photoUrl: input.photoUrl,
    operatorName: input.operatorName,
    operatorTrade: input.operatorTrade,
    completedAt: at,
  };

  const unit = store.units.find((u) => u.id === job.unitId);
  const building = unit ? store.buildings.find((b) => b.id === unit.buildingId) : undefined;
  const notice: NoticeDraft = {
    id: `n-${job.id}`,
    jobId: job.id,
    createdAt: at,
    body: noticeBody(job, completion, unit?.label ?? job.unitId, building?.name ?? "the property"),
    sent: false,
  };

  job.status = "completed";
  job.completion = completion;
  store.works.push(work);
  store.notices.push(notice);
  saveStore();
  return { job, work, notice };
}
