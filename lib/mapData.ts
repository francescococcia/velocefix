// Portfolio map points. Markers use postcodes.io outcode centroids, not Cortile lat/lng.

import { cortileGet, hasCortileKey, CORTILE_DEMO } from "./cortile";
import { fetchOutcodeArea } from "./areaPrices";
import { getStore } from "./store";
import type { Job, Priority } from "./types";

export interface MapTicket {
  id: string;
  title: string;
  status: string;
  reportedAt?: string;
  resolvedAt?: string | null;
}

export interface MapCompliance {
  id: string;
  label: string;
  status: string;
  nextDueOn?: string;
}

export interface MapJobEvent {
  id: string;
  issue: string;
  status: string;
  priority?: Priority;
  createdAt: string;
  bookedAt?: string;
  completedAt?: string;
  rating?: { speed: number; quality: number; exampleData?: boolean };
}

export interface MapBuilding {
  id: string;
  name: string;
  city?: string;
  postcodeDistrict?: string;
  lat: number;
  lng: number;
  placementSource: string;
  openTickets: number;
  closedTickets: number;
  overdueCompliance: number;
  priorities: Priority[];
  tickets: MapTicket[];
  compliance: MapCompliance[];
  jobs: MapJobEvent[];
}

export interface MapData {
  buildings: MapBuilding[];
  omitted: Array<{ id: string; name: string; reason: string }>;
  unavailable?: boolean;
  reason?: string;
}

type ApiBuilding = {
  id: string;
  development_id: string;
  name: string;
  city: string;
};

type ApiDevelopment = {
  id: string;
  name: string;
  city?: string;
  postcode_district?: string;
};

type ApiTicket = {
  id: string;
  title: string;
  status: string;
  reported_at?: string;
  resolved_at?: string | null;
};

type ApiCompliance = {
  id: string;
  label: string;
  status: string;
  next_due_on?: string;
};

function isClosed(status: string) {
  return status === "closed" || status === "resolved";
}

function veloceJobsFor(buildingId: string): MapJobEvent[] {
  const store = getStore();
  const unitIds = new Set(store.units.filter((u) => u.buildingId === buildingId).map((u) => u.id));
  return store.jobs.filter((j) => unitIds.has(j.unitId)).map((j) => jobEvent(j));
}

function jobEvent(j: Job): MapJobEvent {
  return {
    id: j.id,
    issue: j.proposal.issue.replaceAll("_", " "),
    status: j.status,
    priority: j.priority.priority,
    createdAt: j.createdAt,
    bookedAt: j.status === "booked" || j.status === "completed" ? (j.lastAgencyReplyAt ?? undefined) : undefined,
    completedAt: j.completion?.at,
    rating: j.rating
      ? { speed: j.rating.speed, quality: j.rating.quality, exampleData: j.rating.exampleData }
      : undefined,
  };
}

function targetIds(): { cortile: string[]; omitted: MapData["omitted"] } {
  const store = getStore();
  const ids = new Set<string>([CORTILE_DEMO.gorseId, CORTILE_DEMO.juniperId]);
  const omitted: MapData["omitted"] = [];
  for (const b of store.buildings) {
    const hasJob = store.jobs.some((j) => {
      const u = store.units.find((x) => x.id === j.unitId);
      return u?.buildingId === b.id;
    });
    if (!hasJob) continue;
    if (b.id.startsWith("bld_")) ids.add(b.id);
    else omitted.push({ id: b.id, name: b.name, reason: "No Cortile postcode district, so it is not plotted (coordinates would be invented)." });
  }
  return { cortile: [...ids], omitted };
}

async function loadOne(id: string): Promise<MapBuilding | { omit: { id: string; name: string; reason: string } }> {
  const building = await cortileGet<ApiBuilding>(`/v1/buildings/${id}`);
  let district: string | undefined;
  let city = building.city;
  try {
    const dev = await cortileGet<ApiDevelopment>(`/v1/developments/${building.development_id}`);
    district = dev.postcode_district?.trim().toUpperCase();
    city = dev.city ?? building.city;
  } catch {
    district = undefined;
  }
  if (!district) {
    return { omit: { id, name: building.name, reason: "No development postcode district in Cortile." } };
  }
  const area = await fetchOutcodeArea(district);
  if (area?.latitude == null || area.longitude == null) {
    return { omit: { id, name: building.name, reason: `postcodes.io had no centroid for ${district}.` } };
  }

  const [ticketRows, complianceRows] = await Promise.all([
    cortileGet<ApiTicket[]>(`/v1/buildings/${id}/tickets?limit=100`).catch(() => [] as ApiTicket[]),
    cortileGet<ApiCompliance[]>(`/v1/buildings/${id}/compliance?limit=100`).catch(() => [] as ApiCompliance[]),
  ]);
  const tickets: MapTicket[] = (Array.isArray(ticketRows) ? ticketRows : []).map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    reportedAt: t.reported_at,
    resolvedAt: t.resolved_at,
  }));
  const compliance: MapCompliance[] = (Array.isArray(complianceRows) ? complianceRows : []).map((c) => ({
    id: c.id,
    label: c.label,
    status: c.status,
    nextDueOn: c.next_due_on,
  }));
  const jobs = veloceJobsFor(id);
  const openTickets = tickets.filter((t) => !isClosed(t.status)).length;
  const closedTickets = tickets.filter((t) => isClosed(t.status)).length;

  return {
    id: building.id,
    name: building.name,
    city,
    postcodeDistrict: district,
    lat: area.latitude,
    lng: area.longitude,
    placementSource: `postcodes.io outcode centroid for ${area.outcode}`,
    openTickets,
    closedTickets,
    overdueCompliance: compliance.filter((c) => c.status === "overdue").length,
    priorities: [...new Set(jobs.map((j) => j.priority).filter((p): p is Priority => Boolean(p)))],
    tickets,
    compliance,
    jobs,
  };
}

export async function loadMapData(): Promise<MapData> {
  const { cortile, omitted } = targetIds();
  if (!hasCortileKey()) {
    return { buildings: [], omitted, unavailable: true, reason: "missing_key" };
  }
  const results = await Promise.allSettled(cortile.map((id) => loadOne(id)));
  const buildings: MapBuilding[] = [];
  const extra = [...omitted];
  let failures = 0;
  for (const r of results) {
    if (r.status !== "fulfilled") {
      failures += 1;
      continue;
    }
    const v = r.value;
    if ("omit" in v) extra.push(v.omit);
    else buildings.push(v);
  }
  if (buildings.length === 0 && failures === cortile.length) {
    const reason = !hasCortileKey() ? "missing_key" : "unavailable";
    return { buildings: [], omitted: extra, unavailable: true, reason };
  }
  return { buildings, omitted: extra };
}
