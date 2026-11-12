// Chunk-1 triage: keyword fallback proposal -> deterministic priority -> reply.
// Grok (lib/grok.ts) and lib/checks.ts plug in at the marked TODOs.
import { getStore, findTenantByPhone, unitContext, saveStore } from "./store";
import { prioritise } from "./priority";
import { runChecks, TRADE_FOR_ISSUE } from "./checks";
import type { Asset, IssueCategory, Job, Proposal, Tenant } from "./types";


export function keywordProposal(text: string, rooms: string[] = []): Proposal {
  const t = text.toLowerCase();
  let issue: IssueCategory = "other";
  if (/smell (of )?gas|gas (smell|leak)|rotten egg/.test(t)) issue = "gas_smell";
  else if (/spark|burning smell|exposed wire|electric shock/.test(t)) issue = "electrical_danger";
  else if (/no hot water|hot water (is ?n.t|not|won.t)|tap stuck|shut the (hot )?water/.test(t)) issue = "no_hot_water";
  else if (/no heating|heating (is ?n.t|not|won.t)|radiators? (are |is )?cold|boiler/.test(t)) issue = "no_heating";
  else if (/blocked toilet|toilet.*block|blockage|pan connector/.test(t)) issue = "blocked_toilet";
  else if (/shower (cable|hose|handle).*(leak|damaged)|leaking.*shower (cable|hose)/.test(t)) issue = "shower_leak";
  else if (/leak|flood|burst|pouring/.test(t)) issue = "water_leak";
  else if (/hard to turn|fiddling with the keys|front door lock/.test(t)) issue = "door_lock";
  else if (/break.?in|won.t lock|lock (is )?broken/.test(t)) issue = "insecure_entry";
  else if (/floor/.test(t)) issue = "floor_damage";
  const roomFromText = rooms.find((r) => t.includes(r.toLowerCase()));
  const room = roomFromText
    ?? (issue === "floor_damage" || issue === "door_lock" ? "hallway"
      : issue === "blocked_toilet" || issue === "shower_leak" ? "bathroom"
      : "unspecified");
  const hazardType = issue === "no_hot_water" || issue === "no_heating" ? "excess_cold" : issue === "gas_smell" ? "fire_and_explosions" : issue === "floor_damage" ? "falls_on_level_surfaces" : "none";
  return { issue, room, trade: TRADE_FOR_ISSUE[issue], hazardType, summary: text.slice(0, 200), by: "fallback" };
}

export interface InboundResult { reply: string; job?: Job }

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export async function handleInbound(input: { from: string; body: string; channel: "whatsapp" | "sim"; now?: Date }): Promise<InboundResult> {
  const store = getStore();
  const now = input.now ?? new Date();
  const tenant = findTenantByPhone(store, input.from);
  if (!tenant) return { reply: "We can't match this number to a tenancy. Please contact your letting agency directly." };
  const ctx = unitContext(store, tenant.unitId);
  if (!ctx.building || !ctx.unit) return { reply: "Unit record missing." };

  // Reply "1".."9" books from the saved offer (session keyed by phone hash, never the raw number).
  const pick = input.body.trim().match(/^([1-9])$/);
  const session = store.sessions[tenant.phoneHash];
  if (pick && session) return bookFromOffer(Number(pick[1]), session, tenant, ctx.boiler, input.channel, now);

  const proposal = keywordProposal(input.body, ctx.unit.rooms); // TODO chunk: Grok proposal with this as fallback
  const priority = prioritise({ issue: proposal.issue, building: ctx.building, tenant, boiler: ctx.boiler, works: ctx.works, now });
  const checks = runChecks({ store, tenant, proposal, priority, boiler: ctx.boiler });
  const job: Job = {
    id: "j-" + now.getTime().toString(36), unitId: tenant.unitId, createdAt: now.toISOString(), lastAgencyReplyAt: now.toISOString(),
    status: priority.destination === "gas_emergency" ? "emergency_instructed" : priority.destination === "refer_developer" ? "referred" : priority.destination === "question" ? "awaiting_info" : "open",
    proposal, priority, checks: checks.rows, overrides: [],
    messages: [{ at: now.toISOString(), direction: "in", body: input.body, channel: input.channel }],
  };
  delete store.sessions[tenant.phoneHash]; // a new report replaces any older open offer

  const red = checks.rows.filter((r) => r.status === "red");
  const why = priority.firedRules.map((r) => r.label).join("; ");
  let reply: string;
  if (priority.destination === "gas_emergency")
    reply = "⚠️ If you smell gas: open windows, don't use switches or flames, turn off gas at the meter if safe, and call the National Gas Emergency Service now on 0800 111 999. We will not book a visit by message for this. Your agency has been alerted (P1).";
  else if (priority.destination === "refer_developer")
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}). Your building is under developer warranty, so we've referred it to the developer rather than send an emergency contractor. A property manager can override. Why: ${why}.`;
  else if (priority.destination === "question")
    reply = "Thanks. We couldn't classify this yet. Which room is it in, and what exactly isn't working?";
  else if (red.length) {
    job.status = "awaiting_info";
    reply = `Logged as ${priority.priority}. Before we can book we need to check: ${red.map((r) => r.detail).join("; ")}. A property manager will follow up.`;
  } else {
    const op = checks.operator!;
    const slots = op.slots.filter((s) => !s.booked).slice(0, 3);
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}, ${proposal.room}). Why: ${why}.\n` +
      `Checks: ${checks.rows.length}/${checks.rows.length} green ✅\n${op.name} can come:\n${slots.map((s, n) => `${n + 1}) ${fmt(s.start)}`).join("\n")}\nReply 1–${slots.length} to book.`;
    job.status = "slots_offered";
    job.operatorId = op.id;
    job.offeredSlotIds = slots.map((s) => s.id);
    store.sessions[tenant.phoneHash] = { jobId: job.id, offeredSlotIds: job.offeredSlotIds };
  }
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  store.jobs.push(job);
  saveStore();
  return { reply, job };
}

function bookFromOffer(n: number, session: { jobId: string; offeredSlotIds: string[] }, tenant: Tenant, boiler: Asset | undefined, channel: "whatsapp" | "sim", now: Date): InboundResult {
  const store = getStore();
  const job = store.jobs.find((j) => j.id === session.jobId);
  const slotId = session.offeredSlotIds[n - 1];
  if (!job || !slotId) return { reply: `Please reply with a number between 1 and ${session.offeredSlotIds.length}.`, job };
  job.messages.push({ at: now.toISOString(), direction: "in", body: String(n), channel });
  const re = runChecks({ store, tenant, proposal: job.proposal, priority: job.priority, boiler, slotId });
  job.checks = re.rows;
  let reply: string;
  if (re.canBook && re.operator) {
    const slot = re.operator.slots.find((s) => s.id === slotId)!;
    slot.booked = true;
    slot.jobId = job.id;
    job.status = "booked";
    job.slotId = slotId;
    job.operatorId = re.operator.id;
    job.lastAgencyReplyAt = now.toISOString();
    delete store.sessions[tenant.phoneHash];
    reply = `✅ Booked: ${re.operator.name}, ${fmt(slot.start)}. Ref ${job.id}. All ${re.rows.length} checks green.`;
  } else {
    const red = re.rows.filter((r) => r.status === "red").map((r) => r.detail).join("; ");
    reply = `Sorry, we couldn't book that slot: ${red || "booking not allowed"}. Reply with another number.`;
  }
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel });
  saveStore();
  return { reply, job };
}
