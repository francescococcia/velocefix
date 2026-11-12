// Deterministic fact checks. Booking is allowed only when every row is green
// AND the priority engine allows auto-booking. No free text is read here.
import { SRC } from "./sources";
import type { Asset, CheckRow, IssueCategory, Operator, PriorityResult, Proposal, StoreData, Tenant, Trade } from "./types";

export const TRADE_FOR_ISSUE: Record<IssueCategory, Trade> = {
  no_hot_water: "plumbing_heating", no_heating: "plumbing_heating", water_leak: "plumbing_heating",
  gas_smell: "plumbing_heating", electrical_danger: "electrical", insecure_entry: "locksmith",
  floor_damage: "flooring_general", other: "flooring_general",
};

const S11_PART: Partial<Record<IssueCategory, string>> = {
  no_hot_water: "s.11(1)(c): installations for space heating and heating water",
  no_heating: "s.11(1)(c): installations for space heating and heating water",
  gas_smell: "s.11(1)(b): installations for the supply of gas",
  water_leak: "s.11(1)(b): installations for the supply of water and sanitation",
  electrical_danger: "s.11(1)(b): installations for the supply of electricity",
  floor_damage: "s.11(1)(a): structure and exterior",
  insecure_entry: "s.11(1)(a): structure and exterior (doors, windows)",
};

export function isGasWork(issue: IssueCategory, boiler?: Asset) {
  if (issue === "gas_smell") return true;
  return (issue === "no_hot_water" || issue === "no_heating") && (boiler?.fuel ?? "gas") === "gas";
}

export interface CheckInput {
  store: StoreData;
  tenant?: Tenant;
  proposal: Proposal;
  priority: PriorityResult;
  boiler?: Asset;
  slotId?: string; // when booking a specific slot
}

export interface CheckResult {
  rows: CheckRow[];
  allGreen: boolean;
  canBook: boolean;
  operator?: Operator;
}

export function runChecks(i: CheckInput): CheckResult {
  const rows: CheckRow[] = [];
  const agency = { source: "Agency tenancy record (example data)" };

  // 1. Tenant matched by hashed phone
  rows.push(i.tenant
    ? { id: "UNIT_MATCH", label: "Tenant matched to unit", status: "green", detail: `Hashed number matches unit ${i.tenant.unitId}`, ...agency }
    : { id: "UNIT_MATCH", label: "Tenant matched to unit", status: "red", detail: "Number not on any tenancy", ...agency });

  // 2. Responsibility under s.11
  const part = S11_PART[i.proposal.issue];
  rows.push(part
    ? { id: "RESPONSIBILITY", label: "Landlord responsible (s.11 LTA 1985)", status: "green",
        detail: part + (i.priority.destination === "refer_developer" ? " — routed to developer warranty" : ""), source: SRC.s11.source, sourceUrl: SRC.s11.url }
    : { id: "RESPONSIBILITY", label: "Landlord responsible (s.11 LTA 1985)", status: "red",
        detail: "Not clearly a s.11 repair — need more detail", source: SRC.s11.source, sourceUrl: SRC.s11.url });

  // 3. Right trade (code decides the trade from the issue; Grok's guess is only compared)
  const trade = TRADE_FOR_ISSUE[i.proposal.issue];
  const operator = i.store.operators.find((o) => o.trade === trade);
  const mismatch = i.proposal.trade !== trade ? ` (proposal said ${i.proposal.trade}; code uses ${trade})` : "";
  rows.push({ id: "TRADE_MATCH", label: "Right trade on the approved list", status: operator ? "green" : "red",
    detail: operator ? `${operator.name} — ${trade}${mismatch}` : `No approved ${trade} contractor${mismatch}`, source: "Agency approved-contractor list (example data)" });

  // 4. Gas Safe for gas work
  if (isGasWork(i.proposal.issue, i.boiler)) {
    const ok = !!operator?.gasSafeRegNo && operator?.gasSafeVerified === true;
    rows.push({ id: "GAS_SAFE", label: "Gas Safe registered engineer", status: ok ? "green" : "red",
      detail: ok ? `Reg ${operator!.gasSafeRegNo} (${operator!.gasSafeRegNoLabel ?? "seeded"})` : "Contractor has no verified Gas Safe registration",
      source: SRC.gasSafe.source, sourceUrl: SRC.gasSafe.url });
  } else {
    rows.push({ id: "GAS_SAFE", label: "Gas Safe registered engineer", status: "green", detail: "Not gas work", source: SRC.gasSafe.source, sourceUrl: SRC.gasSafe.url });
  }

  // 5. Slot free
  const free = (operator?.slots ?? []).filter((s) => !s.booked);
  const slotOk = i.slotId ? free.some((s) => s.id === i.slotId) : free.length > 0;
  rows.push({ id: "SLOT_AVAILABLE", label: "Slot free", status: slotOk ? "green" : "red",
    detail: i.slotId ? (slotOk ? `Slot ${i.slotId} is free` : `Slot ${i.slotId} was taken`) : `${free.length} free slot(s)`,
    source: "Contractor diary (seeded example slots)" });

  const allGreen = rows.every((r) => r.status === "green");
  return { rows, allGreen, canBook: allGreen && i.priority.autoBookAllowed, operator };
}
