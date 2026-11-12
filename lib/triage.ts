// Chunk-1 triage: keyword fallback proposal -> deterministic priority -> reply.
// Grok (lib/grok.ts) and lib/checks.ts plug in at the marked TODOs.
import { getStore, findTenantByPhone, unitContext, saveStore } from "./store";
import { prioritise } from "./priority";
import type { IssueCategory, Job, Proposal, Trade } from "./types";

const TRADE: Record<IssueCategory, Trade> = {
  no_hot_water: "plumbing_heating", no_heating: "plumbing_heating", water_leak: "plumbing_heating",
  gas_smell: "plumbing_heating", electrical_danger: "electrical", insecure_entry: "locksmith",
  floor_damage: "flooring_general", other: "flooring_general",
};

export function keywordProposal(text: string, rooms: string[] = []): Proposal {
  const t = text.toLowerCase();
  let issue: IssueCategory = "other";
  if (/smell (of )?gas|gas (smell|leak)|rotten egg/.test(t)) issue = "gas_smell";
  else if (/spark|burning smell|exposed wire|electric shock/.test(t)) issue = "electrical_danger";
  else if (/no hot water|hot water (is ?n.t|not|won.t)|tap stuck|shut the (hot )?water/.test(t)) issue = "no_hot_water";
  else if (/no heating|heating (is ?n.t|not|won.t)|radiators? (are |is )?cold|boiler/.test(t)) issue = "no_heating";
  else if (/leak|flood|burst|pouring/.test(t)) issue = "water_leak";
  else if (/break.?in|won.t lock|lock (is )?broken/.test(t)) issue = "insecure_entry";
  else if (/floor/.test(t)) issue = "floor_damage";
  const room = rooms.find((r) => t.includes(r.toLowerCase())) ?? (issue === "floor_damage" ? "hallway" : "unspecified");
  const hazardType = issue === "no_hot_water" || issue === "no_heating" ? "excess_cold" : issue === "gas_smell" ? "fire_and_explosions" : issue === "floor_damage" ? "falls_on_level_surfaces" : "none";
  return { issue, room, trade: TRADE[issue], hazardType, summary: text.slice(0, 200), by: "fallback" };
}

export interface InboundResult { reply: string; job?: Job }

export async function handleInbound(input: { from: string; body: string; channel: "whatsapp" | "sim"; now?: Date }): Promise<InboundResult> {
  const store = getStore();
  const now = input.now ?? new Date();
  const tenant = findTenantByPhone(store, input.from);
  if (!tenant) return { reply: "We can't match this number to a tenancy. Please contact your letting agency directly." };
  const ctx = unitContext(store, tenant.unitId);
  if (!ctx.building || !ctx.unit) return { reply: "Unit record missing." };

  const proposal = keywordProposal(input.body, ctx.unit.rooms); // TODO chunk: Grok proposal with this as fallback
  const priority = prioritise({ issue: proposal.issue, building: ctx.building, tenant, boiler: ctx.boiler, works: ctx.works, now });
  const job: Job = {
    id: "j-" + now.getTime().toString(36), unitId: tenant.unitId, createdAt: now.toISOString(), lastAgencyReplyAt: now.toISOString(),
    status: priority.destination === "gas_emergency" ? "emergency_instructed" : priority.destination === "refer_developer" ? "referred" : priority.destination === "question" ? "awaiting_info" : "open",
    proposal, priority, checks: [], overrides: [],
    messages: [{ at: now.toISOString(), direction: "in", body: input.body, channel: input.channel }],
  };

  const why = priority.firedRules.map((r) => r.label).join("; ");
  let reply: string;
  if (priority.destination === "gas_emergency")
    reply = "⚠️ If you smell gas: open windows, don't use switches or flames, turn off gas at the meter if safe, and call the National Gas Emergency Service now on 0800 111 999. We will not book a visit by message for this. Your agency has been alerted (P1).";
  else if (priority.destination === "refer_developer")
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}). Your building is under developer warranty, so we've referred it to the developer rather than send an emergency contractor. A property manager can override. Why: ${why}.`;
  else if (priority.destination === "question")
    reply = `Thanks. We couldn't classify this yet. Which room is it in, and what exactly isn't working?`;
  else {
    const op = store.operators.find((o) => o.trade === proposal.trade);
    const slots = (op?.slots ?? []).filter((s) => !s.booked).slice(0, 3);
    const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}, ${proposal.room}). Why: ${why}.\n` +
      (slots.length ? `${op!.name} can come:\n${slots.map((s, n) => `${n + 1}) ${fmt(s.start)}`).join("\n")}\n(Booking by reply comes in the next chunk.)` : "No free slots yet — the agency will call you.");
    job.operatorId = op?.id;
    job.offeredSlotIds = slots.map((s) => s.id);
  }
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  store.jobs.push(job);
  saveStore();
  return { reply, job };
}
