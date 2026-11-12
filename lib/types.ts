// Shared types. DATA lane owns this file; other lanes import only.

export type Tenure = "private" | "social";
export type BuildingType = "period" | "new_build";
export type Priority = "P1" | "P2" | "P3" | "P4";
export type Role = "agency" | "operator" | "viewer";

export type IssueCategory =
  | "no_hot_water"
  | "no_heating"
  | "water_leak"
  | "gas_smell"
  | "electrical_danger"
  | "insecure_entry"
  | "floor_damage"
  | "blocked_toilet"
  | "shower_leak"
  | "door_lock"
  | "other";

export type Trade = "plumbing_heating" | "electrical" | "flooring_general" | "locksmith";

/** Official HHSRS hazard *labels* only — we never compute an HHSRS score. */
export type HazardType =
  | "excess_cold"
  | "water_supply"
  | "damp_and_mould"
  | "fire_and_explosions"
  | "electrical_hazards"
  | "falls_on_level_surfaces"
  | "structural_collapse"
  | "entry_by_intruders"
  | "none";

export interface Building {
  id: string;
  name: string;
  area: string; // rough area only, no full address
  type?: BuildingType; // omitted when the source pack does not give a building type
  yearBuilt?: number;
  tenure: Tenure;
  warrantyUntil?: string; // ISO date
  warrantyProvider?: string;
  description: string;
  exampleData: true;
  label?: string; // honesty label, e.g. "Dwelly partner data (synthetic)"
  source?: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  label: string;
  bedrooms?: number; // omitted when the source pack does not give a count
  rooms: string[];
  source?: string;
}

export interface Tenant {
  id: string;
  unitId: string;
  displayName: string; // pseudonym, example
  phoneHash: string; // sha256 of E.164 number; raw number never stored
  vulnerableOccupant: boolean; // AGENCY-POLICY flag, not a medical record
  vulnerabilityNote?: string;
  source?: string;
}

export interface Asset {
  id: string;
  buildingId: string;
  unitId?: string;
  type: "boiler" | "electrical_installation" | "flooring" | "hot_water_tap";
  make?: string;
  model?: string;
  fuel?: "gas" | "electric";
  yearInstalled: number;
  gasSafeCertDate?: string;
  gasSafeNextDue?: string;
  eicrDate?: string;
  eicrExpiry?: string;
  warrantyUntil?: string;
  notes?: string;
}

export interface Slot {
  id: string;
  start: string; // ISO
  end: string;
  booked: boolean;
  jobId?: string;
}

export interface Operator {
  id: string;
  name: string;
  trade: Trade;
  gasSafeRegNo?: string;
  gasSafeRegNoLabel?: string; // e.g. "example — not a real registration"
  gasSafeVerified?: boolean; // seeded; PAR1 may replace with a live cited lookup
  slots: Slot[];
  source?: string;
}

export interface Work {
  id: string;
  unitId: string;
  assetId?: string;
  date: string;
  trade: Trade;
  category: IssueCategory;
  summary: string;
  intermittent?: boolean;
  source: "seed" | "completed" | "Dwelly case 002" | "Dwelly case 037" | "Dwelly case 022";
  quote?: string;
  sourceRef?: string;
}

export type RuleKind = "agency-policy" | "statute" | "safety" | "partner-data";

export interface FiredRule {
  id: string;
  label: string;
  effect: string;
  kind: RuleKind;
  source: string; // human-readable source
  sourceUrl?: string;
  sourceRef?: string;
  quote?: string; // short exact quote from a cited partner case
}

export type Destination = "book" | "refer_developer" | "gas_emergency" | "question";

export interface PriorityResult {
  priority: Priority;
  firedRules: FiredRule[];
  clock: { hours: number; label: string; basis: "agency-policy" | "statute" };
  destination: Destination;
  autoBookAllowed: boolean;
}

export type CheckStatus = "green" | "amber" | "red";
export interface CheckRow {
  id: "UNIT_MATCH" | "RESPONSIBILITY" | "TRADE_MATCH" | "GAS_SAFE" | "GAS_CERT" | "SLOT_AVAILABLE";
  label: string;
  status: CheckStatus;
  detail: string;
  source: string;
  sourceUrl?: string;
}

export interface Proposal {
  issue: IssueCategory;
  room: string;
  trade: Trade;
  hazardType: HazardType;
  summary: string;
  by: "grok" | "fallback" | "seed";
  model?: string;
  confidence?: number;
  followUpQuestion?: string;
}

export type JobStatus =
  | "open"
  | "awaiting_info"
  | "slots_offered"
  | "booked"
  | "referred"
  | "emergency_instructed"
  | "completed";

export interface Message {
  at: string;
  direction: "in" | "out";
  body: string;
  hasMedia?: boolean;
  mediaUrl?: string; // reference only — never downloaded
  channel: "whatsapp" | "sim" | "portal";
}

export interface Override {
  at: string;
  by: string;
  from: Priority;
  to: Priority;
  reason: string;
}

export interface Completion {
  at: string;
  photoUrl?: string;
  cause: string;
  parts: string;
  fixed: boolean;
  followUp: string;
}

export interface Job {
  id: string;
  unitId: string;
  createdAt: string;
  lastAgencyReplyAt?: string | null;
  status: JobStatus;
  proposal: Proposal;
  priority: PriorityResult;
  checks: CheckRow[];
  operatorId?: string;
  slotId?: string;
  offeredSlotIds?: string[];
  overrides: Override[];
  messages: Message[];
  completion?: Completion;
  exampleData?: boolean;
  source?: string;
  sourceRef?: string;
  quote?: string;
}

export interface NoticeDraft {
  id: string;
  jobId: string;
  createdAt: string;
  body: string;
  sent: false; // drafts are never auto-sent
}

export interface StoreData {
  meta: { label: string; seededAt: string };
  buildings: Building[];
  units: Unit[];
  tenants: Tenant[];
  assets: Asset[];
  operators: Operator[];
  works: Work[];
  jobs: Job[];
  notices: NoticeDraft[];
  sessions: Record<string, { jobId: string; offeredSlotIds: string[] }>; // keyed by phoneHash
}
