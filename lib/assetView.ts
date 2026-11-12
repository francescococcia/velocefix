// Investor / asset-manager view. Live Cortile + area lookups. No leaseholder names.

import { cortileGet, CortileError, hasCortileKey, type CortileComplianceStatus } from "./cortile";
import { fetchOutcodeArea, type OutcodeArea } from "./areaPrices";
import { getStore } from "./store";
import type { Job } from "./types";

export const ASSET_DEMO = {
  gorseId: "bld_0006",
  juniperId: "bld_0119",
  gorseName: "Gorse House",
  juniperName: "Juniper House",
} as const;

const BUILDING_ID_RE = /^bld_[a-zA-Z0-9]+$/;

export function isCortileBuildingId(id: string): boolean {
  return BUILDING_ID_RE.test(id);
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function hoursBetween(fromIso: string, toIso: string): number | null {
  const a = Date.parse(fromIso);
  const b = Date.parse(toIso);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return (b - a) / 3_600_000;
}

function countBy(rows: Array<string | undefined>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const raw of rows) {
    const k = raw && raw.length > 0 ? raw : "unknown";
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

type ApiBuilding = {
  id: string;
  development_id: string;
  name: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  built_year: number;
  storeys?: number;
  height_m?: number;
  is_higher_risk?: boolean;
  unit_count: number;
  heating?: string;
  construction_type?: string;
  epc_band_median?: string;
};

type ApiDevelopment = {
  id: string;
  name: string;
  city: string;
  region?: string;
  postcode_district?: string;
  tenure_model?: string;
  developer?: string;
  completed_year?: number;
  service_charge_year_end?: string;
};

type ApiUnit = {
  id: string;
  unit_number: string;
  type?: string;
  tenure?: string;
  occupancy?: string;
};

type ApiLease = {
  id: string;
  unit_id: string;
  ground_rent_gbp_per_year?: number | null;
  arrears_gbp?: number | null;
  owner_occupier?: boolean;
};

type ApiCharge = {
  id: string;
  financial_year_end: string;
  status: string;
  category: string;
  budget_gbp: number;
  actual_gbp: number | null;
};

type ApiCompliance = {
  id: string;
  type: string;
  label: string;
  status: CortileComplianceStatus;
  next_due_on: string;
};

type ApiTicket = {
  id: string;
  status: string;
  urgency?: string;
  reported_at: string;
  first_response_at?: string | null;
  resolved_at?: string | null;
  contractor_id?: string | null;
  cost_gbp?: number | null;
};

type ApiTicketDetail = ApiTicket & {
  updates?: Array<{ author_role?: string; created_at?: string }>;
};

export interface AssetServiceChargeYear {
  yearEnd: string;
  status: string;
  budgetGbp: number;
  actualGbp: number | null;
  lineCount: number;
  recordIds: string[];
  repairsBudgetGbp?: number;
  repairsActualGbp?: number | null;
  repairsId?: string;
}

export interface AssetTicketStats {
  total: number;
  byStatus: Record<string, number>;
  withContractor: number;
  medianHoursToContractor: number | null;
  contractorSampleN: number;
  contractorTicketIds: string[];
  medianHoursToManagerReply: number | null;
  managerReplyN: number;
}

export interface VeloceFixJobsSummary {
  total: number;
  byStatus: Record<string, number>;
  ids: string[];
  completedMedianHours: number | null;
  completedN: number;
}

export interface AssetView {
  id: string;
  ok: boolean;
  reason?: "missing_key" | "unavailable" | "bad_id";
  fetchedAt?: string;
  name?: string;
  city?: string;
  builtYear?: number;
  completedYear?: number;
  heating?: string;
  constructionType?: string;
  epcBandMedian?: string;
  storeys?: number;
  isHigherRisk?: boolean;
  unitCount?: number;
  development?: {
    id: string;
    name: string;
    tenureModel?: string;
    developer?: string;
    region?: string;
    postcodeDistrict?: string;
    serviceChargeYearEnd?: string;
  };
  occupancy?: {
    occupied: number;
    vacant: number;
    other: number;
    total: number;
    percent: number | null;
  };
  unitTypes?: Record<string, number>;
  unitTenures?: Record<string, number>;
  unitIds?: string[];
  groundRentGbpPerYear?: number | null;
  arrearsGbp?: number | null;
  leasesWithArrears?: number;
  leaseCount?: number;
  leaseIds?: string[];
  ownerOccupierCount?: number;
  noLeasesReason?: string;
  serviceCharge?: AssetServiceChargeYear | null;
  tickets?: AssetTicketStats;
  compliance?: {
    total: number;
    byStatus: Record<string, number>;
    dueSoon: Array<{ id: string; label: string; nextDueOn: string }>;
    overdue: Array<{ id: string; label: string; nextDueOn: string }>;
  };
  veloceFix?: VeloceFixJobsSummary;
  area?: {
    postcodeDistrict?: string;
    districtSource?: string;
    outcode?: OutcodeArea | null;
    syntheticPostcodeNote?: string;
  };
  // Intentionally omitted: student / university / hotel signal — Cortile has no such fields.
}

function veloceFixJobs(buildingId: string): VeloceFixJobsSummary {
  const store = getStore();
  const unitIds = new Set(store.units.filter((u) => u.buildingId === buildingId).map((u) => u.id));
  const jobs: Job[] = store.jobs.filter((j) => unitIds.has(j.unitId));
  const byStatus = countBy(jobs.map((j) => j.status));
  const completedHours: number[] = [];
  for (const j of jobs) {
    if (j.status !== "completed" || !j.completion?.at) continue;
    const h = hoursBetween(j.createdAt, j.completion.at);
    if (h != null) completedHours.push(h);
  }
  return {
    total: jobs.length,
    byStatus,
    ids: jobs.map((j) => j.id),
    completedMedianHours: completedHours.length ? median(completedHours) : null,
    completedN: completedHours.length,
  };
}

function pickLatestYear(rows: ApiCharge[]): AssetServiceChargeYear | null {
  if (rows.length === 0) return null;
  const years = [...new Set(rows.map((r) => r.financial_year_end))].sort();
  const yearEnd = years[years.length - 1]!;
  const lines = rows.filter((r) => r.financial_year_end === yearEnd);
  const budgetGbp = lines.reduce((s, r) => s + (Number(r.budget_gbp) || 0), 0);
  const actuals = lines.map((r) => r.actual_gbp).filter((n): n is number => n != null && Number.isFinite(Number(n)));
  const actualGbp = actuals.length ? actuals.reduce((s, n) => s + Number(n), 0) : null;
  const repairs = lines.find((r) => r.category === "repairs" || r.category === "repairs_and_maintenance");
  const statuses = [...new Set(lines.map((r) => r.status))];
  return {
    yearEnd,
    status: statuses.length === 1 ? statuses[0]! : statuses.join(", "),
    budgetGbp,
    actualGbp,
    lineCount: lines.length,
    recordIds: lines.map((r) => r.id),
    repairsBudgetGbp: repairs ? Number(repairs.budget_gbp) : undefined,
    repairsActualGbp: repairs && repairs.actual_gbp != null ? Number(repairs.actual_gbp) : null,
    repairsId: repairs?.id,
  };
}

async function ticketStats(list: ApiTicket[]): Promise<AssetTicketStats> {
  const details = await Promise.allSettled(list.map((t) => cortileGet<ApiTicketDetail>(`/v1/tickets/${t.id}`)));
  const contractorHours: number[] = [];
  const contractorTicketIds: string[] = [];
  const managerHours: number[] = [];

  list.forEach((t, i) => {
    const hMgr = t.first_response_at ? hoursBetween(t.reported_at, t.first_response_at) : null;
    if (hMgr != null) managerHours.push(hMgr);
    const detail = details[i];
    const row = detail?.status === "fulfilled" ? detail.value : t;
    const firstContractor = (row as ApiTicketDetail).updates?.find((u) => u.author_role === "contractor" && u.created_at);
    if (firstContractor?.created_at) {
      const h = hoursBetween(t.reported_at, firstContractor.created_at);
      if (h != null) {
        contractorHours.push(h);
        contractorTicketIds.push(t.id);
      }
    }
  });

  return {
    total: list.length,
    byStatus: countBy(list.map((t) => t.status)),
    withContractor: list.filter((t) => t.contractor_id).length,
    medianHoursToContractor: contractorHours.length ? median(contractorHours) : null,
    contractorSampleN: contractorHours.length,
    contractorTicketIds,
    medianHoursToManagerReply: managerHours.length ? median(managerHours) : null,
    managerReplyN: managerHours.length,
  };
}

export async function loadAssetView(id: string): Promise<AssetView> {
  if (!isCortileBuildingId(id)) return { id, ok: false, reason: "bad_id" };
  if (!hasCortileKey()) return { id, ok: false, reason: "missing_key" };

  try {
    const [building, units, leases, charges, compliance, tickets] = await Promise.all([
      cortileGet<ApiBuilding>(`/v1/buildings/${id}`),
      cortileGet<ApiUnit[]>(`/v1/buildings/${id}/units?limit=100`),
      cortileGet<ApiLease[]>(`/v1/buildings/${id}/leases?limit=100`),
      cortileGet<ApiCharge[]>(`/v1/buildings/${id}/service-charges?limit=100`),
      cortileGet<ApiCompliance[]>(`/v1/buildings/${id}/compliance?limit=100`),
      cortileGet<ApiTicket[]>(`/v1/buildings/${id}/tickets?limit=100`),
    ]);

    const unitList = Array.isArray(units) ? units : [];
    const leaseList = Array.isArray(leases) ? leases : [];
    const chargeList = Array.isArray(charges) ? charges : [];
    const complianceList = Array.isArray(compliance) ? compliance : [];
    const ticketList = Array.isArray(tickets) ? tickets : [];

    const occupied = unitList.filter((u) => u.occupancy === "occupied").length;
    const vacant = unitList.filter((u) => u.occupancy === "vacant").length;
    const other = unitList.length - occupied - vacant;
    const totalUnits = unitList.length;

    let development: AssetView["development"];
    let postcodeDistrict: string | undefined;
    let completedYear: number | undefined;
    try {
      const dev = await cortileGet<ApiDevelopment>(`/v1/developments/${building.development_id}`);
      postcodeDistrict = dev.postcode_district?.trim().toUpperCase();
      development = {
        id: dev.id,
        name: dev.name,
        tenureModel: dev.tenure_model,
        developer: dev.developer,
        region: dev.region,
        postcodeDistrict,
        serviceChargeYearEnd: dev.service_charge_year_end,
      };
      completedYear = dev.completed_year;
    } catch {
      development = { id: building.development_id, name: "Development" };
    }

    const unitTenures = countBy(unitList.map((u) => u.tenure));
    const allRented = unitList.length > 0 && unitList.every((u) => u.tenure === "rented");

    let noLeasesReason: string | undefined;
    if (leaseList.length === 0) {
      const tenure = development?.tenureModel ? `tenure_model ${development.tenureModel}` : "no long-lease records";
      noLeasesReason = allRented
        ? `No long-lease records in Cortile for this building (${tenure}; all ${unitList.length} units have tenure rented). Market rent is not a Cortile field. Ground rent and service-charge arrears are only present on long leases.`
        : `No long-lease records in Cortile for this building (${tenure}). Market rent is not a Cortile field.`;
    }

    const groundRent =
      leaseList.length === 0 ? null : leaseList.reduce((s, l) => s + (Number(l.ground_rent_gbp_per_year) || 0), 0);
    const arrears =
      leaseList.length === 0 ? null : leaseList.reduce((s, l) => s + (Number(l.arrears_gbp) || 0), 0);
    const leasesWithArrears = leaseList.filter((l) => Number(l.arrears_gbp) > 0).length;

    const dueSoon = complianceList
      .filter((c) => c.status === "due_soon")
      .map((c) => ({ id: c.id, label: c.label, nextDueOn: c.next_due_on }));
    const overdue = complianceList
      .filter((c) => c.status === "overdue")
      .map((c) => ({ id: c.id, label: c.label, nextDueOn: c.next_due_on }));

    const [ticketsAgg, outcode] = await Promise.all([
      ticketStats(ticketList),
      postcodeDistrict ? fetchOutcodeArea(postcodeDistrict) : Promise.resolve(null),
    ]);

    return {
      id: building.id,
      ok: true,
      fetchedAt: new Date().toISOString(),
      name: building.name,
      city: building.city,
      builtYear: building.built_year,
      completedYear,
      heating: building.heating?.replaceAll("_", " "),
      constructionType: building.construction_type?.replaceAll("_", " "),
      epcBandMedian: building.epc_band_median,
      storeys: building.storeys,
      isHigherRisk: building.is_higher_risk,
      unitCount: building.unit_count,
      development: development
        ? {
            ...development,
          }
        : undefined,
      occupancy: {
        occupied,
        vacant,
        other,
        total: totalUnits,
        percent: totalUnits > 0 ? (occupied / totalUnits) * 100 : null,
      },
      unitTypes: countBy(unitList.map((u) => u.type)),
      unitTenures,
      unitIds: unitList.map((u) => u.id),
      groundRentGbpPerYear: groundRent,
      arrearsGbp: arrears,
      leasesWithArrears,
      leaseCount: leaseList.length,
      leaseIds: leaseList.map((l) => l.id),
      ownerOccupierCount: leaseList.filter((l) => l.owner_occupier).length,
      noLeasesReason,
      serviceCharge: pickLatestYear(chargeList),
      tickets: ticketsAgg,
      compliance: {
        total: complianceList.length,
        byStatus: countBy(complianceList.map((c) => c.status)),
        dueSoon,
        overdue,
      },
      veloceFix: veloceFixJobs(id),
      area: {
        postcodeDistrict,
        districtSource: postcodeDistrict && development?.id ? `Cortile ${development.id} postcode_district` : undefined,
        outcode,
        syntheticPostcodeNote:
          "The full building postcode in Cortile is synthetic and is not in the live postcode directory, so area lookups use the development postcode district.",
      },
    };
  } catch (err) {
    const reason = err instanceof CortileError && err.code === "missing_key" ? "missing_key" : "unavailable";
    return { id, ok: false, reason };
  }
}

