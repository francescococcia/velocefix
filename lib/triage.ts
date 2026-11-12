// Keyword fallback or Grok proposal -> deterministic priority -> checks -> reply.
// Grok never overrides the priority engine or the fact checks.
import { getStore, findTenantByPhone, unitContext, saveStore } from "./store";
import { prioritise } from "./priority";
import { runChecks, TRADE_FOR_ISSUE } from "./checks";
import { grokIntent, grokPhotoObservation, grokProposal, hazardForIssue } from "./grok";
import type { Asset, IssueCategory, Job, Operator, Proposal, RatingScore, StoreData, Tenant } from "./types";
import { rememberInboundPhone } from "./phones";
import {
  applyTenantRating,
  findPendingRatingJob,
  parseRatingText,
  qualityPrompt,
  thanksBody,
} from "./rating";
import { getConversation, setConversation } from "./conversation";
import {
  demoBuildingLine,
  isBookAgainText,
  isCancelText,
  isCoText,
  isDangerText,
  isMajorLeakText,
  isRescheduleText,
  keywordIntent,
  matchUnitFromText,
  minorKind,
  nextFreeSlots,
  parseSlotHint,
  selfHelpSteps,
  shortBuildingName,
  shortUnitLabel,
  type Intent,
  type SlotHint,
} from "./intent";
import { hashPhone, normalisePhone } from "./privacy";

export function keywordProposal(text: string, rooms: string[] = []): Proposal {
  const t = text.toLowerCase();
  let issue: IssueCategory = "other";
  if (/smell (of )?gas|gas (smell|leak)|rotten egg/.test(t) || isCoText(t)) issue = "gas_smell";
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
  return { issue, room, trade: TRADE_FOR_ISSUE[issue], hazardType: hazardForIssue(issue), summary: text.slice(0, 200), by: "fallback" };
}

export interface InboundResult { reply: string; job?: Job }

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function inboundMsg(input: { body: string; channel: "whatsapp" | "sim"; mediaUrl?: string }, now: Date) {
  return {
    at: now.toISOString(),
    direction: "in" as const,
    body: input.body,
    channel: input.channel,
    ...(input.mediaUrl ? { hasMedia: true as const, mediaUrl: input.mediaUrl } : {}),
  };
}

function awaitingJob(store: StoreData, unitId: string): Job | undefined {
  const open = [...store.jobs].reverse().find((j) => j.unitId === unitId && j.status === "slots_offered");
  if (open) return open;
  const booked = [...store.jobs].reverse().find((j) => j.unitId === unitId && j.status === "booked");
  if (booked) return booked;
  // Fallback: latest real repair on this unit that is not finished (offer may have been superseded)
  return [...store.jobs].reverse().find(
    (j) => j.unitId === unitId && j.proposal?.issue && j.proposal.issue !== "other" && j.status !== "completed" && !j.selfHelpOffered,
  );
}

function selfHelpJob(store: StoreData, unitId: string, convJobId?: string): Job | undefined {
  if (convJobId) {
    const j = store.jobs.find((x) => x.id === convJobId && x.selfHelpOffered && x.status !== "completed");
    if (j) return j;
  }
  return [...store.jobs].reverse().find((j) => j.unitId === unitId && j.selfHelpOffered && (j.status === "open" || j.status === "awaiting_info"));
}

function skipIds(job: Job) {
  return [...new Set([...(job.offeredSlotIds ?? []), ...(job.skippedSlotIds ?? [])])];
}

function offerReply(op: Operator, slots: { start: string }[], hint?: SlotHint, honoured?: boolean) {
  const lines = slots.map((s, n) => `${n + 1}) ${fmt(s.start)}`);
  const hintLine = hint?.label && !honoured
    ? `I don't have a ${hint.label} visit on this calendar, so here are the next times I do have:\n`
    : hint?.label && honoured
      ? `Here are the next ${hint.label} times ${op.name} can come:\n`
      : `Here are the next times ${op.name} can come:\n`;
  return `${hintLine}${lines.join("\n")}\nReply 1-3 to book.`;
}

function applyOffer(store: StoreData, job: Job, tenant: Tenant, op: Operator, slots: { id: string }[], now: Date) {
  const prev = job.offeredSlotIds ?? [];
  job.skippedSlotIds = [...new Set([...(job.skippedSlotIds ?? []), ...prev])];
  job.operatorId = op.id;
  job.offeredSlotIds = slots.map((s) => s.id);
  job.status = "slots_offered";
  job.lastAgencyReplyAt = now.toISOString();
  store.sessions[tenant.phoneHash] = { jobId: job.id, offeredSlotIds: job.offeredSlotIds };
}

function releaseSlot(store: StoreData, job: Job) {
  if (!job.slotId || !job.operatorId) return;
  const op = store.operators.find((o) => o.id === job.operatorId);
  const slot = op?.slots.find((s) => s.id === job.slotId);
  if (slot) {
    slot.booked = false;
    delete slot.jobId;
  }
  job.slotId = undefined;
}

function ensureGuestTenant(store: StoreData, rawFrom: string, unitId: string): Tenant {
  const n = normalisePhone(rawFrom);
  const phoneHash = /^\+\d{7,15}$/.test(n) ? hashPhone(n) : hashPhone("unlisted:" + rawFrom.trim().toLowerCase());
  const existing = store.tenants.find((t) => t.phoneHash === phoneHash);
  if (existing) {
    existing.unitId = unitId;
    return existing;
  }
  const tenant: Tenant = {
    id: "t-unlisted-" + phoneHash.slice(0, 12),
    unitId,
    displayName: "Unlisted sender (demo)",
    phoneHash,
    vulnerableOccupant: false,
  };
  store.tenants.push(tenant);
  return tenant;
}

async function classify(text: string, hasOpenOffer: boolean, offeredSummary?: string): Promise<Intent> {
  const trimmed = text.trim();
  if (/^([1-9])$/.test(trimmed) || isBookAgainText(trimmed)) return keywordIntent(trimmed, { hasOpenOffer });
  const fromGrok = await grokIntent(trimmed || "(photo only)", { hasOpenOffer, offeredSummary });
  if (fromGrok) return fromGrok.intent;
  return keywordIntent(trimmed, { hasOpenOffer });
}

export async function handleInbound(input: {
  from: string;
  body: string;
  channel: "whatsapp" | "sim";
  now?: Date;
  mediaUrl?: string;
  mediaContentType?: string;
}): Promise<InboundResult> {
  const store = getStore();
  const now = input.now ?? new Date();
  const body = input.body ?? "";
  const mediaUrl = isAttachableMedia(input.mediaUrl, input.mediaContentType) ? input.mediaUrl : undefined;
  const conv = getConversation(input.from);
  rememberInboundPhone(input.from);

  if (conv.awaitingUnit) {
    const match = matchUnitFromText(body, store);
    if (match && match.ok) {
      const tenant = ensureGuestTenant(store, input.from, match.unit.id);
      const pendingBody = conv.pendingBody || body;
      const pendingMedia = conv.pendingMediaUrl ?? mediaUrl;
      setConversation(input.from, { guestTenantId: tenant.id });
      saveStore();
      const r = await handleKnown({ from: input.from, body: pendingBody, channel: input.channel, now, mediaUrl: pendingMedia }, store, tenant);
      return { reply: `Thanks — I've matched you to ${shortBuildingName(match.building)}, ${shortUnitLabel(match.unit)}.\n\n${r.reply}`, job: r.job };
    }
    if (match && !match.ok && "needFlat" in match) {
      const flats = store.units.filter((u) => u.buildingId === match.needFlat.id).map((u) => shortUnitLabel(u));
      return { reply: `Which flat at ${shortBuildingName(match.needFlat)}? I can match: ${flats.join(", ") || "no demo flats listed"}.` };
    }
    if (match && !match.ok && "unknown" in match) {
      return { reply: `I don't have a demo unit at ${match.unknown} yet. I can match: ${demoBuildingLine(store)}.` };
    }
    return { reply: `Sorry, I still need the building and flat. I can match: ${demoBuildingLine(store)}.` };
  }

  let tenant = findTenantByPhone(store, input.from);
  if (!tenant) {
    const match = matchUnitFromText(body, store);
    if (match && match.ok) {
      tenant = ensureGuestTenant(store, input.from, match.unit.id);
      setConversation(input.from, { guestTenantId: tenant.id });
      saveStore();
      const leftover = body.replace(new RegExp(shortBuildingName(match.building), "i"), "").trim();
      const nextBody = leftover.length > 8 ? leftover : "";
      if (!nextBody && !mediaUrl) {
        return { reply: `Thanks — I've matched you to ${shortBuildingName(match.building)}, ${shortUnitLabel(match.unit)}. What's the problem, and which room is it in?` };
      }
      return handleKnown({ from: input.from, body: nextBody || body, channel: input.channel, now, mediaUrl }, store, tenant);
    }
    setConversation(input.from, {
      awaitingUnit: true,
      pendingBody: body || undefined,
      pendingMediaUrl: mediaUrl,
      pendingMediaType: input.mediaContentType,
    });
    return {
      reply: `I don't recognise this number yet, so I need a quick check before I log a repair. Which building and flat are you in? For this demo I can match: ${demoBuildingLine(store)}.`,
    };
  }

  return handleKnown({ from: input.from, body, channel: input.channel, now, mediaUrl }, store, tenant);
}

function isAttachableMedia(url?: string, contentType?: string) {
  if (!url) return false;
  if (contentType && !contentType.toLowerCase().startsWith("image/")) return false;
  return /^(data:image\/|https:\/\/)/i.test(url);
}

async function handleKnown(
  input: { from: string; body: string; channel: "whatsapp" | "sim"; now: Date; mediaUrl?: string },
  store: StoreData,
  tenant: Tenant,
): Promise<InboundResult> {
  const now = input.now;
  const body = input.body ?? "";
  const ctx = unitContext(store, tenant.unitId);
  if (!ctx.building || !ctx.unit) return { reply: "Unit record missing." };
  const conv = getConversation(input.from);
  const visionP = input.mediaUrl ? grokPhotoObservation(input.mediaUrl) : Promise.resolve(undefined);

  const ratingReply = takeRatingReply(store.jobs, tenant, body, input.channel, now);
  if (ratingReply) {
    if (ratingReply.job && input.mediaUrl) attachPhoto(ratingReply.job, input.mediaUrl, await visionP);
    return ratingReply;
  }

  const open = awaitingJob(store, tenant.unitId);
  const pick = body.trim().match(/^([1-9])$/);
  const session = store.sessions[tenant.phoneHash];
  if (pick && session) return bookFromOffer(Number(pick[1]), session, tenant, ctx.boiler, input.channel, now);

  const offeredSummary = open
    ? `${open.status}${open.offeredSlotIds?.length ? `, ${open.offeredSlotIds.length} slots offered` : ""}`
    : undefined;
  let intent = await classify(body, Boolean(open) || Boolean(conv.selfHelpJobId), offeredSummary);
  if (isDangerText(body) || isCoText(body) || (open && isMajorLeakText(body))) intent = "new_repair";
  if (open && isCancelText(body)) intent = "cancel";
  if (open && isRescheduleText(body) && !isDangerText(body) && !isCoText(body)) intent = "reschedule";
  if (isBookAgainText(body) && selfHelpJob(store, tenant.unitId, conv.selfHelpJobId)) intent = "pick_slot";

  if (intent === "cancel" && open) {
    return cancelJob(store, open, tenant, input, now);
  }

  if ((intent === "reschedule" || isRescheduleText(body)) && open && !isDangerText(body) && !isCoText(body)) {
    return rescheduleJob(store, open, tenant, input, now, parseSlotHint(body, now));
  }
  if (!open && isRescheduleText(body) && !looksLikeRepairText(body)) {
    const reply = "I can't see a visit waiting for you right now, so there's nothing to move. Tell me what needs fixing and I'll find times.";
    return { reply };
  }

  if (intent === "pick_slot" && isBookAgainText(body)) {
    const job = selfHelpJob(store, tenant.unitId, conv.selfHelpJobId);
    if (job) return offerOnJob(store, job, tenant, ctx.boiler, input, now, undefined, "Okay, I'll get someone out.");
  }

  if (intent === "question" && open) {
    const op = store.operators.find((o) => o.id === open.operatorId);
    const slots = (open.offeredSlotIds ?? []).map((id) => op?.slots.find((s) => s.id === id)).filter(Boolean);
    const reply = slots.length
      ? `Your ${open.proposal.issue.replaceAll("_", " ")} is still logged as ${open.priority.priority} (${open.status}). The times I have for you:\n${slots.map((s, n) => `${n + 1}) ${fmt(s!.start)}`).join("\n")}\nReply 1-3 to book, or tell me a better day.`
      : `Your ${open.proposal.issue.replaceAll("_", " ")} is still logged as ${open.priority.priority}. Tell me if you'd like to reschedule or cancel.`;
    open.messages.push(inboundMsg(input, now), { at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
    if (input.mediaUrl) attachPhoto(open, input.mediaUrl, await visionP);
    saveStore();
    return { reply, job: open };
  }

  const kind = minorKind(body);
  const skipSelfHelp =
    !kind ||
    isDangerText(body) ||
    isCoText(body) ||
    isMajorLeakText(body) ||
    (tenant.vulnerableOccupant && /no heating|heating (is ?n.t|not|won.t)|radiators? (are |is )?cold/.test(body.toLowerCase()));

  if (intent === "minor_fix" && kind && !skipSelfHelp) {
    return logSelfHelp(store, tenant, ctx, input, now, kind, visionP);
  }

  return logNewRepair(store, tenant, ctx, input, now, visionP);
}

async function rescheduleJob(
  store: StoreData,
  job: Job,
  tenant: Tenant,
  input: { body: string; channel: "whatsapp" | "sim"; mediaUrl?: string },
  now: Date,
  hint: SlotHint | undefined,
): Promise<InboundResult> {
  job.messages.push(inboundMsg(input, now));
  if (job.status === "booked") releaseSlot(store, job);
  const op = store.operators.find((o) => o.id === job.operatorId)
    ?? store.operators.find((o) => o.trade === TRADE_FOR_ISSUE[job.proposal.issue]);
  if (!op) {
    const reply = "I can't see a contractor calendar for this job, so I haven't booked a new time. Your agency will rearrange from the desk.";
    job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
    saveStore();
    return { reply, job };
  }
  const found = nextFreeSlots(op, skipIds(job), hint, 3, now);
  if (found.slots.length === 0) {
    job.status = "open";
    delete store.sessions[tenant.phoneHash];
    const reply = "I don't have any further free slots on this contractor's calendar. I've left the job open so your agency can rearrange from the desk.";
    job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
    job.lastAgencyReplyAt = now.toISOString();
    saveStore();
    return { reply, job };
  }
  applyOffer(store, job, tenant, op, found.slots, now);
  const reply = `No problem — I won't create a new job. ${offerReply(op, found.slots, hint, found.honoured)}`;
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  saveStore();
  return { reply, job };
}

function cancelJob(
  store: StoreData,
  job: Job,
  tenant: Tenant,
  input: { body: string; channel: "whatsapp" | "sim"; mediaUrl?: string },
  now: Date,
): InboundResult {
  job.messages.push(inboundMsg(input, now));
  if (job.status === "booked") releaseSlot(store, job);
  job.status = "open";
  job.offeredSlotIds = [];
  job.lastAgencyReplyAt = now.toISOString();
  delete store.sessions[tenant.phoneHash];
  const leakNote = job.proposal.issue === "water_leak" || job.proposal.issue === "shower_leak"
    ? " If water is still leaking, turn off the isolation valve if you can."
    : "";
  const reply = `Okay, I've cancelled the offer for this job (ref ${job.id}). Your agency can rearrange from the desk.${leakNote}`;
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  saveStore();
  return { reply, job };
}

async function offerOnJob(
  store: StoreData,
  job: Job,
  tenant: Tenant,
  boiler: Asset | undefined,
  input: { body: string; channel: "whatsapp" | "sim"; mediaUrl?: string },
  now: Date,
  hint: SlotHint | undefined,
  preface: string,
): Promise<InboundResult> {
  job.messages.push(inboundMsg(input, now));
  const checks = runChecks({ store, tenant, proposal: job.proposal, priority: job.priority, boiler });
  if (job.selfHelpOffered) {
    for (const row of checks.rows) {
      if (row.id === "RESPONSIBILITY" && row.status === "red") {
        row.status = "green";
        row.detail = "Tenant asked for a visit after self-help, on a landlord fixture or installation.";
      }
    }
  }
  job.checks = checks.rows;
  const op = store.operators.find((o) => o.trade === job.proposal.trade) ?? checks.operator
    ?? store.operators.find((o) => o.trade === TRADE_FOR_ISSUE[job.proposal.issue]);
  const blocking = checks.rows.filter((r) => r.status === "red" && r.id !== "SLOT_AVAILABLE");
  if (!op || blocking.length) {
    const red = blocking.map((r) => r.detail).join("; ") || (op ? "" : `No approved ${job.proposal.trade} contractor on the demo list`);
    job.status = "awaiting_info";
    const reply = op
      ? `I can log a visit, but I need a manager to check: ${red}.`
      : `I don't have an approved ${job.proposal.trade.replaceAll("_", " ")} contractor on this demo calendar. Your agency will follow up.`;
    job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
    saveStore();
    return { reply, job };
  }
  const found = nextFreeSlots(op, skipIds(job), hint, 3, now);
  if (found.slots.length === 0) {
    const reply = "I don't have a free slot on this calendar just now. Your agency will follow up.";
    job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
    saveStore();
    return { reply, job };
  }
  applyOffer(store, job, tenant, op, found.slots, now);
  const reply = `${preface}\n${offerReply(op, found.slots, hint, found.honoured)}`;
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  saveStore();
  return { reply, job };
}

async function logSelfHelp(
  store: StoreData,
  tenant: Tenant,
  ctx: ReturnType<typeof unitContext>,
  input: { from: string; body: string; channel: "whatsapp" | "sim"; mediaUrl?: string },
  now: Date,
  kind: NonNullable<ReturnType<typeof minorKind>>,
  visionP: Promise<string | undefined>,
): Promise<InboundResult> {
  const rooms = ctx.unit?.rooms ?? [];
  const trade = kind === "tripped_fuse" || kind === "smoke_chirp" ? "electrical" : "plumbing_heating";
  const proposal: Proposal = {
    issue: "other",
    room: rooms.find((r) => input.body.toLowerCase().includes(r.toLowerCase())) ?? "unspecified",
    trade,
    hazardType: "none",
    summary: input.body.slice(0, 200) || kind.replaceAll("_", " "),
    by: "fallback",
  };
  const priority = {
    priority: "P4" as const,
    firedRules: [{
      id: "SELF_HELP_OFFERED",
      label: "Self-help offered for a minor problem",
      effect: "P4, no visit until the tenant replies BOOK",
      kind: "agency-policy" as const,
      source: "Agency policy (example data)",
    }],
    clock: { hours: 720, label: "P4: 720h (agency policy)", basis: "agency-policy" as const },
    destination: "book" as const,
    autoBookAllowed: false,
  };
  const checks = runChecks({ store, tenant, proposal, priority, boiler: ctx.boiler });
  const job: Job = {
    id: "j-" + now.getTime().toString(36),
    unitId: tenant.unitId,
    createdAt: now.toISOString(),
    lastAgencyReplyAt: now.toISOString(),
    status: "open",
    proposal,
    priority,
    checks: checks.rows,
    overrides: [],
    messages: [inboundMsg(input, now)],
    selfHelpOffered: true,
  };
  const reply = selfHelpSteps(kind);
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  attachPhoto(job, input.mediaUrl, await visionP);
  store.jobs.push(job);
  const conv = getConversation(input.from);
  setConversation(input.from, { ...conv, awaitingUnit: false, selfHelpJobId: job.id, pendingBody: undefined, pendingMediaUrl: undefined });
  saveStore();
  return { reply, job };
}

async function logNewRepair(
  store: StoreData,
  tenant: Tenant,
  ctx: ReturnType<typeof unitContext>,
  input: { body: string; channel: "whatsapp" | "sim"; mediaUrl?: string },
  now: Date,
  visionP: Promise<string | undefined>,
): Promise<InboundResult> {
  const body = input.body;
  const proposal = (await grokProposal(body, ctx.unit?.rooms ?? [])) ?? keywordProposal(body, ctx.unit?.rooms ?? []);
  let priority = prioritise({ issue: proposal.issue, building: ctx.building!, tenant, boiler: ctx.boiler, works: ctx.works, now });
  if (isCoText(body) && proposal.issue === "gas_smell") {
    priority = {
      ...priority,
      destination: "gas_emergency",
      priority: "P1",
      firedRules: [
        ...priority.firedRules,
        { id: "CO_ALARM", label: "Carbon monoxide alarm", effect: "P1, call 999 or 0800 111 999, no self-help", kind: "safety", source: "National Gas Emergency Service" },
      ],
    };
  }
  const checks = runChecks({ store, tenant, proposal, priority, boiler: ctx.boiler });
  const job: Job = {
    id: "j-" + now.getTime().toString(36),
    unitId: tenant.unitId,
    createdAt: now.toISOString(),
    lastAgencyReplyAt: now.toISOString(),
    status: priority.destination === "gas_emergency" ? "emergency_instructed" : priority.destination === "refer_developer" ? "referred" : priority.destination === "question" ? "awaiting_info" : "open",
    proposal,
    priority,
    checks: checks.rows,
    overrides: [],
    messages: [inboundMsg(input, now)],
  };
  delete store.sessions[tenant.phoneHash];

  const red = checks.rows.filter((r) => r.status === "red");
  const why = priority.firedRules.map((r) => r.label).join("; ");
  let reply: string;
  if (priority.destination === "gas_emergency") {
    reply = isCoText(body)
      ? "If a carbon monoxide alarm is sounding, get fresh air now and call 999 or the National Gas Emergency Service on 0800 111 999. Don't use gas appliances. We will not book a visit by message for this. Your agency has been alerted (P1)."
      : "⚠️ If you smell gas: open windows, don't use switches or flames, turn off gas at the meter if safe, and call the National Gas Emergency Service now on 0800 111 999. We will not book a visit by message for this. Your agency has been alerted (P1).";
  } else if (priority.destination === "refer_developer") {
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}). Your building is under developer warranty, so we've referred it to the developer rather than send an emergency contractor. A property manager can override. Why: ${why}.`;
  } else if (priority.destination === "question") {
    reply = "Thanks. We couldn't classify this yet. Which room is it in, and what exactly isn't working?";
  } else if (red.length) {
    job.status = "awaiting_info";
    reply = `Logged as ${priority.priority}. Before we can book we need to check: ${red.map((r) => r.detail).join("; ")}. A property manager will follow up.`;
  } else {
    const op = checks.operator!;
    const slots = nextFreeSlots(op, [], undefined, 3, now).slots;
    reply = `Logged as ${priority.priority} (${proposal.issue.replace(/_/g, " ")}, ${proposal.room}). Why: ${why}.\n` +
      `Checks: ${checks.rows.length}/${checks.rows.length} green ✅\n${offerReply(op, slots)}`;
    if (isMajorLeakText(body)) {
      reply = `Logged as P1 (water leak). If water is pouring, turn off the isolation valve or the mains stopcock if you can, and keep clear of electrics.\n${offerReply(op, slots)}`;
      job.priority = { ...job.priority, priority: "P1" };
    }
    job.status = "slots_offered";
    job.operatorId = op.id;
    job.offeredSlotIds = slots.map((s) => s.id);
    store.sessions[tenant.phoneHash] = { jobId: job.id, offeredSlotIds: job.offeredSlotIds };
  }
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel: input.channel });
  attachPhoto(job, input.mediaUrl, await visionP);
  store.jobs.push(job);
  saveStore();
  return { reply, job };
}

function attachPhoto(job: Job, mediaUrl?: string, observation?: string) {
  if (mediaUrl) {
    const lastIn = [...job.messages].reverse().find((m) => m.direction === "in");
    if (lastIn) {
      lastIn.hasMedia = true;
      lastIn.mediaUrl = lastIn.mediaUrl ?? mediaUrl;
    }
  }
  if (observation) job.photoObservation = observation;
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
    if (job.slotId && job.slotId !== slotId) releaseSlot(store, job);
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

function takeRatingReply(
  jobs: Job[],
  tenant: Tenant,
  body: string,
  channel: "whatsapp" | "sim",
  now: Date,
): InboundResult | undefined {
  const job = findPendingRatingJob(jobs, tenant.unitId);
  if (!job) return undefined;
  const parsed = parseRatingText(body);
  if (!parsed) return undefined;

  job.messages.push({ at: now.toISOString(), direction: "in", body, channel });

  let speed: RatingScore | undefined;
  let quality: RatingScore | undefined;
  if ("speed" in parsed) {
    speed = parsed.speed;
    quality = parsed.quality;
  } else if (job.ratingAsk?.partialSpeed) {
    speed = job.ratingAsk.partialSpeed;
    quality = parsed.score;
  } else {
    job.ratingAsk = { ...(job.ratingAsk ?? { requestedAt: now.toISOString(), pending: true }), pending: true, partialSpeed: parsed.score };
    const reply = qualityPrompt();
    job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel });
    saveStore();
    return { reply, job };
  }

  const rating = applyTenantRating(job, { speed, quality, channel }, now);
  const reply = thanksBody(rating);
  job.messages.push({ at: now.toISOString(), direction: "out", body: reply, channel });
  saveStore();
  return { reply, job };
}

function looksLikeRepairText(t: string) {
  return /leak|boiler|heat|hot water|tap|toilet|lock|door|window|mould|damp|electric|socket|light|fuse|shower|sink|drain|roof|gas|smell|broken|not working|stopped/.test(t.toLowerCase());
}
