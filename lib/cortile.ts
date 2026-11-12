// Server-side Cortile hackathon API client. Read-only, event-only data.
// The key stays in process.env.CORTILE_API_KEY and is never logged or returned.

import type { BuildingType, CheckRow, CheckStatus } from "./types";
import { SRC } from "./sources";
import { safeLog } from "./privacy";

export const CORTILE_DOCS = "https://hackathon.cortile.com/";
const DEFAULT_BASE = "https://hackathon.cortile.com";
const TIMEOUT_MS = 10_000;
const USER_AGENT = "VeloceFix/0.1 (+https://velocefix.vercel.app)";
const CACHE_TTL_MS = 60_000;

/** Record ids we fetch live for the dashboard demo pair. */
export const CORTILE_DEMO = {
  gorseId: "bld_0006",
  juniperId: "bld_0119",
  gorseGasId: "cmp_00066",
  juniperGasId: "cmp_01185",
  contractorId: "con_0052",
  ticketId: "tkt_000096",
  ticketUnitId: "unt_00164",
} as const;

export type CortileUnavailableReason = "missing_key" | "unavailable";

export type CortileComplianceStatus = "in_date" | "due_soon" | "overdue" | "no_record";

export interface CortileGasSafety {
  id: string;
  label: string;
  status: CortileComplianceStatus;
  lastCompletedOn: string | null;
  nextDueOn: string;
  lastOutcome: string | null;
}

export interface CortileBuildingView {
  id: string;
  ok: boolean;
  name?: string;
  city?: string;
  builtYear?: number;
  kind?: BuildingType;
  heating?: string;
  unitCount?: number;
  gasSafety?: CortileGasSafety;
}

export interface CortileContractorView {
  id: string;
  name: string;
  trade: string;
  accredited: boolean;
  insuranceExpiresOn: string | null;
}

export interface CortileTicketView {
  id: string;
  title: string;
  category: string;
  channel: string;
  status: string;
  reportedAt: string;
  unitId: string | null;
  unitNumber?: string;
}

export interface CortileDemoData {
  buildings: CortileBuildingView[];
  contractor?: CortileContractorView;
  ticket?: CortileTicketView;
  fetchedAt?: string;
  unavailable: boolean;
  reason?: CortileUnavailableReason;
}

type CacheEntry = { at: number; data: unknown };
const g = globalThis as unknown as { __velocefixCortileCache?: Map<string, CacheEntry> };

function cacheMap() {
  if (!g.__velocefixCortileCache) g.__velocefixCortileCache = new Map();
  return g.__velocefixCortileCache;
}

export class CortileError extends Error {
  code: CortileUnavailableReason;
  constructor(code: CortileUnavailableReason) {
    super(code === "missing_key" ? "Cortile key missing" : "Cortile live data unavailable");
    this.code = code;
  }
}

function baseUrl() {
  const raw = process.env.CORTILE_API_URL?.trim();
  return (raw && raw.length > 0 ? raw : DEFAULT_BASE).replace(/\/$/, "");
}

export function hasCortileKey() {
  return hasKey();
}

function apiKey() {
  // Trim whitespace, a leading BOM, and accidental wrapping quotes from the Vercel env UI.
  return (process.env.CORTILE_API_KEY ?? "")
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function hasKey() {
  return apiKey().length > 0;
}

/** GET /v1/... and unwrap the `{ data }` envelope. Never logs the key. */
export async function cortileGet<T>(path: string): Promise<T> {
  if (!hasKey()) throw new CortileError("missing_key");
  const hit = cacheMap().get(path);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data as T;

  const url = `${baseUrl()}${path}`;
  const headers = {
    "x-api-key": apiKey(),
    accept: "application/json",
    "user-agent": USER_AGENT,
  };

  let cause: "timeout" | "network" | "http" | "envelope" = "network";
  let status: number | undefined;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      const name = err instanceof Error ? err.name : "";
      cause = name === "TimeoutError" || name === "AbortError" ? "timeout" : "network";
      status = undefined;
      if (attempt < 2) continue;
      break;
    }
    if (!res.ok) {
      cause = "http";
      status = res.status;
      // Retry transient Cloudflare / edge failures, not auth errors.
      if ((res.status === 429 || res.status >= 500) && attempt < 2) continue;
      break;
    }
    try {
      const body = (await res.json()) as { data?: T };
      if (body.data === undefined) {
        cause = "envelope";
        status = res.status;
        break;
      }
      cacheMap().set(path, { at: Date.now(), data: body.data });
      return body.data;
    } catch {
      cause = "envelope";
      status = res.status;
      break;
    }
  }

  safeLog("cortile_unavailable", { path, cause, status, timeoutMs: TIMEOUT_MS });
  throw new CortileError("unavailable");
}

function kindFromYear(year?: number): BuildingType | undefined {
  if (year == null) return undefined;
  if (year >= 2015) return "new_build";
  if (year < 1980) return "period";
  return undefined;
}

function heatingLabel(raw?: string) {
  if (!raw) return undefined;
  const map: Record<string, string> = {
    individual_gas: "individual gas",
    individual_electric: "individual electric",
    communal_gas: "communal gas",
    heat_network: "heat network",
  };
  return map[raw] ?? raw.replaceAll("_", " ");
}

type ApiBuilding = {
  id: string;
  name: string;
  city: string;
  built_year: number;
  heating: string;
  unit_count: number;
};

type ApiCompliance = {
  id: string;
  type: string;
  label: string;
  status: CortileComplianceStatus;
  last_completed_on: string | null;
  next_due_on: string;
  last_outcome: string | null;
};

type ApiContractor = {
  id: string;
  name: string;
  trade: string;
  accredited: boolean;
  insurance_expires_on: string | null;
};

type ApiTicket = {
  id: string;
  title: string;
  category: string;
  channel: string;
  status: string;
  reported_at: string;
  unit_id: string | null;
};

type ApiUnit = { id: string; unit_number: string };

async function loadBuilding(id: string, preferredGasId?: string): Promise<CortileBuildingView> {
  const [building, compliance] = await Promise.all([
    cortileGet<ApiBuilding>(`/v1/buildings/${id}`),
    cortileGet<ApiCompliance[]>(`/v1/buildings/${id}/compliance?limit=100`),
  ]);
  const rows = Array.isArray(compliance) ? compliance : [];
  const gas =
    (preferredGasId ? rows.find((r) => r.id === preferredGasId) : undefined) ??
    rows.find((r) => r.type === "communal_gas_safety");
  return {
    id: building.id,
    ok: true,
    name: building.name,
    city: building.city,
    builtYear: building.built_year,
    kind: kindFromYear(building.built_year),
    heating: heatingLabel(building.heating),
    unitCount: building.unit_count,
    gasSafety: gas
      ? {
          id: gas.id,
          label: gas.label,
          status: gas.status,
          lastCompletedOn: gas.last_completed_on,
          nextDueOn: gas.next_due_on,
          lastOutcome: gas.last_outcome,
        }
      : undefined,
  };
}

function emptyBuildings(): CortileBuildingView[] {
  return [
    { id: CORTILE_DEMO.gorseId, ok: false },
    { id: CORTILE_DEMO.juniperId, ok: false },
  ];
}

/**
 * Live demo payload for the dashboard. On a missing key or API failure, returns
 * the two building ids with no invented facts so the UI can show
 * "Cortile live data unavailable".
 */
export async function loadCortileDemo(): Promise<CortileDemoData> {
  if (!hasKey()) {
    return { buildings: emptyBuildings(), unavailable: true, reason: "missing_key" };
  }

  const [gorse, juniper, contractor, ticket, unit] = await Promise.allSettled([
    loadBuilding(CORTILE_DEMO.gorseId, CORTILE_DEMO.gorseGasId),
    loadBuilding(CORTILE_DEMO.juniperId, CORTILE_DEMO.juniperGasId),
    cortileGet<ApiContractor>(`/v1/contractors/${CORTILE_DEMO.contractorId}`),
    cortileGet<ApiTicket>(`/v1/tickets/${CORTILE_DEMO.ticketId}`),
    cortileGet<ApiUnit>(`/v1/units/${CORTILE_DEMO.ticketUnitId}`),
  ]);

  const buildings: CortileBuildingView[] = [
    gorse.status === "fulfilled" ? gorse.value : { id: CORTILE_DEMO.gorseId, ok: false },
    juniper.status === "fulfilled" ? juniper.value : { id: CORTILE_DEMO.juniperId, ok: false },
  ];

  const out: CortileDemoData = {
    buildings,
    unavailable: buildings.every((b) => !b.ok),
    fetchedAt: new Date().toISOString(),
  };

  if (out.unavailable) {
    out.reason = "unavailable";
    return out;
  }

  if (contractor.status === "fulfilled") {
    const c = contractor.value;
    out.contractor = {
      id: c.id,
      name: c.name,
      trade: c.trade,
      accredited: c.accredited,
      insuranceExpiresOn: c.insurance_expires_on,
    };
  }

  if (ticket.status === "fulfilled") {
    const t = ticket.value;
    // Unit number only — never pass a lease or leaseholder name through.
    const unitNumber = unit.status === "fulfilled" ? unit.value.unit_number : undefined;
    out.ticket = {
      id: t.id,
      title: t.title,
      category: t.category,
      channel: t.channel,
      status: t.status,
      reportedAt: t.reported_at,
      unitId: t.unit_id,
      unitNumber,
    };
  }

  return out;
}

export function formatLondonDate(iso: string) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const opts: Intl.DateTimeFormatOptions = dateOnly
    ? { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" }
    : { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
  return d.toLocaleString("en-GB", opts);
}

export function gasSafetyTone(status?: CortileComplianceStatus): CheckStatus | "none" {
  if (status === "overdue") return "red";
  if (status === "due_soon") return "amber";
  if (status === "in_date") return "green";
  return "none";
}

/** Check-row citation for communal gas safety, used on the Cortile card and WHY panel. */
export function cortileGasCertCheck(gas?: CortileGasSafety): CheckRow | undefined {
  if (!gas) return undefined;
  const tone = gasSafetyTone(gas.status);
  if (tone === "none") return undefined;
  const due = formatLondonDate(gas.nextDueOn);
  const detail =
    gas.status === "overdue"
      ? `Communal boiler gas safety is overdue (due ${due})`
      : gas.status === "due_soon"
        ? `Communal boiler gas safety is due soon (${due})`
        : `Communal boiler gas safety is in date (due ${due})`;
  return {
    id: "GAS_CERT",
    label: "Communal gas safety",
    status: tone,
    detail,
    source: `Cortile ${gas.id}`,
    sourceUrl: SRC.cortile.url,
  };
}
