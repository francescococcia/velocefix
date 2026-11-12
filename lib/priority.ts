// MINIMAL deterministic priority engine (chunk 1). Grok proposes, code decides.
// Tenant free text is never an input here. Extend per knowledge/idea.md.
import { APP } from "../config/app";
import { SRC } from "./sources";
import type { Asset, Building, FiredRule, IssueCategory, Priority, PriorityResult, Tenant, Work } from "./types";

export interface PriorityInput {
  issue: IssueCategory;
  building: Building;
  tenant?: Pick<Tenant, "vulnerableOccupant">;
  boiler?: Asset;
  works?: Work[];
  now?: Date;
}

const CLOCK: Record<Priority, number> = { P1: 24, P2: 72, P3: 168, P4: 720 };
const lvl = (n: number) => (`P${Math.min(4, Math.max(1, n))}`) as Priority;

export function isWinter(d: Date) {
  const m = d.getUTCMonth() + 1;
  return m >= APP.winterWindow.startMonth || m <= APP.winterWindow.endMonth;
}

export function prioritise(i: PriorityInput): PriorityResult {
  const now = i.now ?? new Date();
  const rules: FiredRule[] = [];
  const add = (r: FiredRule) => rules.push(r);
  let level = 3;
  let destination: PriorityResult["destination"] = "book";

  if (i.issue === "gas_smell") {
    add({ id: "GAS_EMERGENCY", label: "Suspected gas leak", effect: "P1, no auto-book: call 0800 111 999", kind: "safety", source: SRC.gasEmergency.source, sourceUrl: SRC.gasEmergency.url });
    return { priority: "P1", firedRules: rules, clock: { hours: 0, label: "Now: call 0800 111 999", basis: "agency-policy" }, destination: "gas_emergency", autoBookAllowed: false };
  }

  const safety = ["water_leak", "electrical_danger", "insecure_entry"].includes(i.issue);
  if (safety) {
    level = 1;
    add({ id: "P1_TRIGGER", label: `Default P1 trigger: ${i.issue.replace("_", " ")}`, effect: "P1", kind: i.issue === "electrical_danger" ? "safety" : "agency-policy", source: SRC.agency.source });
  }

  const heat = i.issue === "no_hot_water" || i.issue === "no_heating";
  const warranty = !!i.building.warrantyUntil && new Date(i.building.warrantyUntil) > now;

  if (heat) {
    add({ id: "S11_HEATING_HOT_WATER", label: "Landlord must keep heating and hot water installations in repair", effect: "Landlord responsibility", kind: "statute", source: SRC.s11.source, sourceUrl: SRC.s11.url });
    if (warranty) {
      level = 3;
      destination = "refer_developer";
      add({ id: "WARRANTY_DEVELOPER", label: `New build under warranty until ${i.building.warrantyUntil}`, effect: "Cap at P3, refer to developer", kind: "agency-policy", source: SRC.agency.source });
      if ((i.works ?? []).some((w) => w.intermittent && (w.category === "no_hot_water" || w.category === "no_heating")))
        add({ id: "KNOWN_INTERMITTENT", label: "Known intermittent fault already logged with developer", effect: "No escalation", kind: "agency-policy", source: SRC.agency.source });
    } else {
      level = 2;
      if (isWinter(now)) { level = 1; add({ id: "SEASON_WINTER", label: "Winter window (1 Oct – 31 Mar)", effect: "Escalate to P1", kind: "agency-policy", source: SRC.shelterHeating.source, sourceUrl: SRC.shelterHeating.url }); }
      if (i.tenant?.vulnerableOccupant) { level -= 1; add({ id: "VULNERABLE_OCCUPANT", label: "Vulnerable-occupant flag (agency policy, not a medical record)", effect: "Escalate one level", kind: "agency-policy", source: SRC.agency.source }); }
      const age = i.boiler ? now.getUTCFullYear() - i.boiler.yearInstalled : 0;
      if (age >= APP.boilerOldAgeYears) { level -= 1; add({ id: "ASSET_BOILER_AGE", label: `Boiler is ${age} years old`, effect: "Escalate one level", kind: "agency-policy", source: SRC.agency.source }); }
    }
  } else if (i.issue === "blocked_toilet") {
    level = 2;
    add({ id: "S11_SANITARY", label: "Landlord must keep sanitation installations in repair", effect: "Landlord responsibility; urgent amenity", kind: "statute", source: SRC.s11.source, sourceUrl: SRC.s11.url });
    add({ id: "URGENT_AMENITY_CLOCK", label: "Urgent repair clock: 3 days", effect: "P2, 72h agency-policy clock", kind: "agency-policy", source: SRC.agency.source });
  } else if (i.issue === "shower_leak") {
    level = 3;
    add({ id: "S11_SANITARY", label: "Landlord must keep sanitation installations in repair", effect: "Landlord responsibility; routine repair", kind: "statute", source: SRC.s11.source, sourceUrl: SRC.s11.url });
    add({ id: "ROUTINE_CLOCK", label: "Routine repair clock: 7 days", effect: "P3, 168h agency-policy clock", kind: "agency-policy", source: SRC.agency.source });
  } else if (i.issue === "door_lock") {
    level = 3;
    add({ id: "S11_STRUCTURE", label: "Landlord repairs structure and exterior (incl. doors)", effect: "Landlord responsibility; routine repair", kind: "statute", source: SRC.s11.source, sourceUrl: SRC.s11.url });
    add({ id: "ROUTINE_CLOCK", label: "Routine repair clock: 7 days", effect: "P3, 168h agency-policy clock", kind: "agency-policy", source: SRC.agency.source });
  } else if (i.issue === "floor_damage") {
    add({ id: "S11_STRUCTURE", label: "Landlord repairs structure and exterior (incl. floors)", effect: "Landlord responsibility; routine", kind: "statute", source: SRC.s11.source, sourceUrl: SRC.s11.url });
    if (warranty) { destination = "refer_developer"; add({ id: "WARRANTY_DEVELOPER", label: "New build under warranty", effect: "Refer to developer", kind: "agency-policy", source: SRC.agency.source }); }
  } else if (!safety) {
    destination = "question";
  }

  const priority = lvl(level);
  const basis = i.building.tenure === "social" && priority === "P1" ? "statute" : "agency-policy";
  return {
    priority,
    firedRules: rules,
    clock: { hours: CLOCK[priority], label: `${priority}: ${CLOCK[priority]}h (${basis === "statute" ? "Awaab's Law, social housing" : "agency policy"})`, basis },
    destination,
    autoBookAllowed: destination === "book",
  };
}

export function dueAt(createdAt: string, hours: number) {
  return new Date(new Date(createdAt).getTime() + hours * 3600_000);
}
