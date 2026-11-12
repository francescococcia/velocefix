// Keyword intent, slot-time hints, unit matching, and safe self-help copy.
// Grok may propose an intent; this file is the fallback and the safety override.

import type { Building, Operator, Slot, StoreData, Unit } from "./types";

export const INTENTS = [
  "new_repair",
  "pick_slot",
  "reschedule",
  "cancel",
  "rating",
  "question",
  "minor_fix",
  "other",
] as const;

export type Intent = (typeof INTENTS)[number];

export type SlotHint = {
  days?: number[];
  weekend?: boolean;
  evening?: boolean;
  morning?: boolean;
  afternoon?: boolean;
  label?: string;
};

const DAY_NAME: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

export function isDangerText(t: string) {
  const s = t.toLowerCase();
  return (
    /smell (of )?gas|gas (smell|leak)|rotten egg/.test(s) ||
    /carbon monoxide|\bco alarm\b|\bco detector\b/.test(s) ||
    /spark|burning smell|exposed wire|electric shock|electrics? spark/.test(s) ||
    /pouring|gushing|burst pipe|flooding|flood\b|water (coming|running) through|ceiling .{0,20}(collapse|coming down)/.test(s)
  );
}

export function isMajorLeakText(t: string) {
  return /pouring|gushing|burst pipe|flooding|flood\b|water (coming|running) through|ceiling .{0,20}(collapse|coming down)/.test(t.toLowerCase());
}

export function isCoText(t: string) {
  return /carbon monoxide|\bco alarm\b|\bco detector\b/.test(t.toLowerCase());
}

export type MinorKind =
  | "dripping_tap"
  | "tripped_fuse"
  | "bleed_radiator"
  | "boiler_pressure"
  | "blocked_sink"
  | "smoke_chirp";

export function minorKind(t: string): MinorKind | undefined {
  const s = t.toLowerCase();
  if (isDangerText(s)) return undefined;
  if (/drip(ping)? tap|tap .{0,20}drip|tap .{0,12}(won'?t|will not) stop/.test(s)) return "dripping_tap";
  if (/tripped (fuse|rcd|breaker)|fuse (has )?tripped|rcd (has )?tripped|trip switch/.test(s)) return "tripped_fuse";
  if (/bleed(ing)? (the )?radiator|radiator .{0,20}bleed|radiator .{0,20}(cold at the top|air)/.test(s)) return "bleed_radiator";
  if (/boiler pressure|pressure .{0,12}(low|dropped|gone)|filling loop/.test(s)) return "boiler_pressure";
  if (/blocked sink|sink .{0,20}(block|clog|backing up)|plunger/.test(s)) return "blocked_sink";
  if (/smoke alarm .{0,20}(chirp|beep|battery)|alarm (is )?chirp|chirp(ing)? .{0,20}(alarm|battery)/.test(s)) return "smoke_chirp";
  return undefined;
}

export function parseSlotHint(text: string, now = new Date()): SlotHint | undefined {
  const s = text.toLowerCase();
  const hint: SlotHint = {};
  const days: number[] = [];
  if (/\bweekend\b|saturday|sunday|\bsat\b|\bsun\b/.test(s)) {
    hint.weekend = true;
    days.push(6, 0);
    hint.label = "weekend";
  }
  if (/\bevening\b|after work|after 5|after 17/.test(s)) {
    hint.evening = true;
    hint.label = hint.label ? `${hint.label}, evening` : "evening";
  }
  if (/\bmorning\b/.test(s)) {
    hint.morning = true;
    hint.label = hint.label ? `${hint.label}, morning` : "morning";
  }
  if (/\bafternoon\b/.test(s)) {
    hint.afternoon = true;
    hint.label = hint.label ? `${hint.label}, afternoon` : "afternoon";
  }
  if (/\btomorrow\b/.test(s)) {
    const d = (londonWeekday(now.toISOString()) + 1) % 7;
    days.push(d);
    hint.label = hint.label ? `${hint.label}, tomorrow` : "tomorrow";
  }
  if (/\btoday\b/.test(s)) {
    days.push(londonWeekday(now.toISOString()));
    hint.label = hint.label ? `${hint.label}, today` : "today";
  }
  for (const [name, n] of Object.entries(DAY_NAME)) {
    if (name.length < 3) continue;
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(s) && !days.includes(n)) {
      days.push(n);
      hint.label = hint.label ? `${hint.label}, ${name}` : name;
    }
  }
  if (days.length) hint.days = [...new Set(days)];
  if (!hint.days && !hint.weekend && !hint.evening && !hint.morning && !hint.afternoon) return undefined;
  return hint;
}

export function isRescheduleText(t: string) {
  const s = t.toLowerCase();
  return (
    /can'?t do (those |these |that |the )?days?|can'?t make (those |these |that )?/.test(s) ||
    /not available|another time|different (day|time|slot)|reschedule|re-?arrange/.test(s) ||
    /\b(later|weekend|evening|tomorrow|morning|afternoon)\b/.test(s) ||
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tues|wed|thurs|fri|sat|sun)\b/.test(s)
  );
}

export function isCancelText(t: string) {
  const s = t.toLowerCase();
  return /\bcancel\b|call (the )?(visit|job|appointment) off|don'?t (need|want) (a |the )?(visit|booking|appointment)/.test(s);
}

export function isBookAgainText(t: string) {
  return /^\s*book\s*[.!]?\s*$/i.test(t) || /^\s*reply book\s*$/i.test(t);
}

export function keywordIntent(
  text: string,
  ctx: { hasOpenOffer: boolean },
): Intent {
  const t = text.trim();
  const s = t.toLowerCase();
  if (/^([1-9])$/.test(t)) return "pick_slot";
  if (isBookAgainText(t)) return "pick_slot";
  if (isCancelText(s)) return "cancel";
  if (isDangerText(s)) return "new_repair";
  if (minorKind(s)) return "minor_fix";
  if (ctx.hasOpenOffer && isRescheduleText(s) && !looksLikeNewRepair(s)) return "reschedule";
  if (looksLikeNewRepair(s)) return "new_repair";
  if (ctx.hasOpenOffer && /when|what time|which (day|slot)|appointment|the slots?/.test(s)) return "question";
  if (ctx.hasOpenOffer && isRescheduleText(s)) return "reschedule";
  return "other";
}

function looksLikeNewRepair(s: string) {
  return /leak|heating|hot water|boiler|toilet|shower|floor|lock|gas|spark|flood|broken|not working|no power|damp|mould/.test(s);
}

export function londonWeekday(iso: string) {
  const wd = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short" }).format(new Date(iso));
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 } as Record<string, number>)[wd] ?? 0;
}

export function londonHour(iso: string) {
  const h = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).format(new Date(iso));
  return Number(h);
}

export function slotMatchesHint(slot: Slot, hint: SlotHint) {
  const day = londonWeekday(slot.start);
  const hour = londonHour(slot.start);
  if (hint.days && hint.days.length && !hint.days.includes(day)) return false;
  if (hint.weekend && day !== 0 && day !== 6) return false;
  if (hint.evening && hour < 17) return false;
  if (hint.morning && hour >= 12) return false;
  if (hint.afternoon && (hour < 12 || hour >= 17)) return false;
  return true;
}

export function nextFreeSlots(op: Operator, skipIds: string[], hint: SlotHint | undefined, take = 3, now = new Date()) {
  const free = op.slots.filter((s) => !s.booked && !skipIds.includes(s.id) && new Date(s.start).getTime() >= now.getTime() - 60_000);
  const hinted = hint ? free.filter((s) => slotMatchesHint(s, hint)) : free;
  if (hint && hinted.length > 0) return { slots: hinted.slice(0, take), honoured: true as const };
  return { slots: free.slice(0, take), honoured: !hint };
}

export function demoBuildingLine(store: StoreData) {
  const parts = store.buildings.map((b) => {
    const name = shortBuildingName(b);
    const flats = store.units.filter((u) => u.buildingId === b.id).map((u) => shortUnitLabel(u));
    if (flats.length === 0) return null;
    return `${name} (${flats.join(", ")})`;
  }).filter(Boolean);
  return parts.join("; ");
}

export function shortBuildingName(b: Building) {
  return b.name.replace(/\s*\(example\)\s*/gi, "").trim();
}

export function shortUnitLabel(u: Unit) {
  return u.label.split(",")[0]!.trim();
}

export function matchUnitFromText(text: string, store: StoreData):
  | { ok: true; unit: Unit; building: Building }
  | { ok: false; needFlat: Building }
  | { ok: false; unknown: string }
  | undefined {
  const s = text.toLowerCase();
  if (/\bjuniper\b/.test(s)) return { ok: false, unknown: "Juniper House" };

  const scored: Array<{ building: Building; unit?: Unit; n: number }> = [];
  for (const b of store.buildings) {
    const name = shortBuildingName(b).toLowerCase();
    const first = name.split(/\s+/)[0] ?? name;
    const hitName = s.includes(name) || (first.length >= 5 && s.includes(first));
    const units = store.units.filter((u) => u.buildingId === b.id);
    if (hitName && units.length === 1) {
      scored.push({ building: b, unit: units[0], n: 3 });
      continue;
    }
    if (hitName) {
      const u = units.find((unit) => unitMentions(s, unit));
      if (u) scored.push({ building: b, unit: u, n: 4 });
      else scored.push({ building: b, n: 2 });
    } else {
      const unique = units.filter((unit) => unitMentions(s, unit) && isDistinctLabel(unit, store));
      for (const u of unique) scored.push({ building: b, unit: u, n: 2 });
    }
  }
  scored.sort((a, b) => b.n - a.n);
  const top = scored[0];
  if (!top) return undefined;
  if (top.unit) return { ok: true, unit: top.unit, building: top.building };
  return { ok: false, needFlat: top.building };
}

function unitMentions(s: string, unit: Unit) {
  const label = shortUnitLabel(unit).toLowerCase();
  if (s.includes(label.toLowerCase())) return true;
  const num = label.match(/(\d+(?:\.\d+)?)/g) ?? [];
  return num.some((n) => new RegExp(`\\b(flat|unit|apt|apartment)?\\s*${n.replace(".", "\\.")}\\b`).test(s));
}

function isDistinctLabel(unit: Unit, store: StoreData) {
  const nums = (shortUnitLabel(unit).match(/(\d+(?:\.\d+)?)/g) ?? []);
  if (nums.length === 0) return false;
  const others = store.units.filter((u) => u.id !== unit.id);
  return nums.some((n) => !others.some((u) => shortUnitLabel(u).includes(n)));
}

export function selfHelpSteps(kind: MinorKind): string {
  const tail = "Still not fixed? Reply BOOK and I will get someone out.";
  switch (kind) {
    case "dripping_tap":
      return [
        "A dripping tap is often something we can try before a visit:",
        "1) Check the tap is turned fully off.",
        "2) Put a bowl underneath so it doesn't waste water.",
        "3) If it keeps dripping, the washer or cartridge usually needs replacing — that's a job for us.",
        tail,
      ].join("\n");
    case "tripped_fuse":
      return [
        "You can try resetting a trip switch safely:",
        "1) Find the consumer unit (fuse box).",
        "2) If a switch is down, push it firmly back up.",
        "3) If it trips again straight away, leave it off and don't keep resetting it.",
        tail,
      ].join("\n");
    case "bleed_radiator":
      return [
        "If a radiator is cold at the top, bleeding it can help:",
        "1) Let the heating cool first.",
        "2) Hold a cloth under the bleed valve and turn it slowly with a radiator key until the hiss stops and a little water appears, then close it.",
        "3) Check the boiler pressure after, and only top up if the manual shows it is low.",
        tail,
      ].join("\n");
    case "boiler_pressure":
      return [
        "Low boiler pressure on a sealed system is often a quick check:",
        "1) Look at the pressure gauge (usually on the front). The marked range is often around 1–1.5 bar when the heating is off.",
        "2) If it is below the green range, use the filling loop as the boiler manual shows, then close the valves.",
        "3) If it will not hold pressure, or you can see a leak, leave it and we will send someone.",
        tail,
      ].join("\n");
    case "blocked_sink":
      return [
        "A blocked sink is often worth a plunger first:",
        "1) Bail out standing water if you can, and remove the stopper.",
        "2) Cover the overflow with a cloth and plunge firmly several times.",
        "3) Follow with hot (not boiling) water. Skip chemical drain cleaners.",
        tail,
      ].join("\n");
    case "smoke_chirp":
      return [
        "A short chirp every 30–60 seconds is often a low battery:",
        "1) If it takes a replaceable 9V battery, fit a new one and press test.",
        "2) If it is a sealed or mains alarm, don't disable it.",
        "3) If it keeps chirping, we will send someone. If the alarm is sounding continuously for smoke or carbon monoxide, get out and call 999.",
        tail,
      ].join("\n");
  }
}
