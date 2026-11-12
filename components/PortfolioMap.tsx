"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { MapBuilding, MapData } from "@/lib/mapData";
import type { Priority } from "@/lib/types";
import "leaflet/dist/leaflet.css";

type TicketFilter = "any" | "open" | "closed";
type OverdueFilter = "any" | "overdue";
type PriorityFilter = "any" | Priority;

function matches(b: MapBuilding, f: { city: string; tickets: TicketFilter; overdue: OverdueFilter; priority: PriorityFilter }) {
  if (f.city !== "any" && (b.city ?? "") !== f.city) return false;
  if (f.tickets === "open" && b.openTickets === 0) return false;
  if (f.tickets === "closed" && b.closedTickets === 0) return false;
  if (f.overdue === "overdue" && b.overdueCompliance === 0) return false;
  if (f.priority !== "any" && !b.priorities.includes(f.priority)) return false;
  return true;
}

function markerColor(b: MapBuilding) {
  if (b.overdueCompliance > 0) return "#b91c1c";
  if (b.openTickets > 0) return "#d97706";
  return "#0f766e";
}

function Fit({ buildings }: { buildings: MapBuilding[] }) {
  const map = useMap();
  useEffect(() => {
    if (buildings.length === 0) return;
    if (buildings.length === 1) {
      map.setView([buildings[0]!.lat, buildings[0]!.lng], 10);
      return;
    }
    const lats = buildings.map((b) => b.lat);
    const lngs = buildings.map((b) => b.lng);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [40, 40], maxZoom: 11 },
    );
  }, [buildings, map]);
  return null;
}

function formatWhen(iso?: string | null) {
  if (!iso) return "";
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
}

function timeline(b: MapBuilding) {
  const ev: Array<{ at: string; label: string; source: string }> = [];
  for (const t of b.tickets) {
    if (t.reportedAt) ev.push({ at: t.reportedAt, label: `Ticket reported: ${t.title} (${t.status})`, source: `Cortile ${t.id}` });
    if (t.resolvedAt) ev.push({ at: t.resolvedAt, label: `Ticket ${t.status}: ${t.title}`, source: `Cortile ${t.id}` });
  }
  for (const j of b.jobs) {
    ev.push({ at: j.createdAt, label: `VeloceFix job reported: ${j.issue} (${j.priority ?? ""} ${j.status})`, source: j.id });
    if (j.bookedAt) ev.push({ at: j.bookedAt, label: `VeloceFix job booked: ${j.issue}`, source: j.id });
    if (j.completedAt) ev.push({ at: j.completedAt, label: `VeloceFix job completed: ${j.issue}`, source: j.id });
    if (j.rating) {
      ev.push({
        at: j.completedAt ?? j.createdAt,
        label: `Tenant rating speed ${j.rating.speed}/5, quality ${j.rating.quality}/5${j.rating.exampleData ? " (example data)" : ""}`,
        source: j.id,
      });
    }
  }
  for (const c of b.compliance) {
    if (c.nextDueOn) ev.push({ at: c.nextDueOn, label: `Compliance ${c.status.replaceAll("_", " ")}: ${c.label}`, source: `Cortile ${c.id}` });
  }
  return ev.sort((a, b) => b.at.localeCompare(a.at));
}

const field = "rounded border border-slate-300 bg-white px-2 py-2 text-sm min-h-11";

export default function PortfolioMap({ data }: { data: MapData }) {
  const reduce = useReducedMotion();
  const [city, setCity] = useState("any");
  const [tickets, setTickets] = useState<TicketFilter>("any");
  const [overdue, setOverdue] = useState<OverdueFilter>("any");
  const [priority, setPriority] = useState<PriorityFilter>("any");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cities = useMemo(() => [...new Set(data.buildings.map((b) => b.city).filter(Boolean))] as string[], [data.buildings]);
  const visible = data.buildings.filter((b) => matches(b, { city, tickets, overdue, priority }));
  const selected = visible.find((b) => b.id === selectedId) ?? data.buildings.find((b) => b.id === selectedId) ?? null;

  if (data.unavailable && data.buildings.length === 0) {
    return (
      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Portfolio map</h2>
        <p className="mt-2 text-sm text-amber-800">Cortile live data unavailable, so the map has no building locations.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-4 shadow space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Portfolio map</h2>
        <p className="text-xs text-slate-500">
          Markers sit at the postcodes.io outcode centroid for each development postcode district (OpenStreetMap tiles).
          Cortile building coordinates are not used — they are unreliable (synthetic, and often disagree with the recorded district).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="text-xs text-slate-600">
          City
          <select className={`${field} ml-1`} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="any">Any</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Tickets
          <select className={`${field} ml-1`} value={tickets} onChange={(e) => setTickets(e.target.value as TicketFilter)}>
            <option value="any">Any</option>
            <option value="open">Has open</option>
            <option value="closed">Has closed</option>
          </select>
        </label>
        <label className="text-xs text-slate-600">
          Compliance
          <select className={`${field} ml-1`} value={overdue} onChange={(e) => setOverdue(e.target.value as OverdueFilter)}>
            <option value="any">Any</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
        <label className="text-xs text-slate-600">
          VeloceFix priority
          <select className={`${field} ml-1`} value={priority} onChange={(e) => setPriority(e.target.value as PriorityFilter)}>
            <option value="any">Any</option>
            {(["P1", "P2", "P3", "P4"] as Priority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-slate-500">{visible.length} of {data.buildings.length} buildings on the map.</p>
      <div className="relative h-[22rem] sm:h-[28rem] overflow-hidden rounded-lg border border-slate-200">
        {visible.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">No buildings match these filters.</p>
        ) : (
          <MapContainer
            center={[visible[0]!.lat, visible[0]!.lng]}
            zoom={7}
            className="h-full w-full z-0"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Fit buildings={visible} />
            {visible.map((b) => (
              <CircleMarker
                key={b.id}
                center={[b.lat, b.lng]}
                radius={b.id === selectedId ? 12 : 9}
                pathOptions={{ color: markerColor(b), fillColor: markerColor(b), fillOpacity: 0.85, weight: 2 }}
                eventHandlers={{ click: () => setSelectedId(b.id) }}
              >
                <Tooltip>
                  <div className="text-xs">
                    <div className="font-semibold">{b.name}</div>
                    <div>{b.city} · {b.postcodeDistrict}</div>
                    <div>{b.openTickets} open / {b.closedTickets} closed tickets · {b.overdueCompliance} compliance overdue</div>
                    <div className="mt-1 text-[10px] text-slate-600">
                      Placed at the {b.placementSource}. Cortile building coordinates are unreliable and are not used.
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={reduce ? false : { opacity: 0, y: 16, x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 z-[1000] max-h-[60%] overflow-y-auto rounded-t-lg bg-white/95 p-3 shadow-lg backdrop-blur sm:inset-y-2 sm:right-2 sm:left-auto sm:w-80 sm:max-h-[calc(100%-1rem)] sm:rounded-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{selected.name}</h3>
                  <p className="text-xs text-slate-500">{selected.city} · {selected.postcodeDistrict} · Cortile {selected.id}</p>
                </div>
                <button type="button" className="min-h-11 min-w-11 text-sm text-slate-600" onClick={() => setSelectedId(null)} aria-label="Close">
                  Close
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {selected.placementSource}. Cortile coordinates are unreliable and were not used.
              </p>
              <p className="mt-2">
                <Link className="text-sm font-medium text-teal-800 underline" href={`/buildings/${selected.id}`}>
                  Asset view
                </Link>
              </p>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">History</h4>
              {timeline(selected).length === 0 ? (
                <p className="text-sm text-slate-600">No ticket, job or compliance events.</p>
              ) : (
                <ol className="mt-1 space-y-2 border-l border-slate-200 pl-3">
                  {timeline(selected).map((e, i) => (
                    <li key={`${e.source}-${e.at}-${i}`} className="text-sm">
                      <p className="text-slate-800">{e.label}</p>
                      <p className="text-xs text-slate-500">{formatWhen(e.at)} Europe/London · {e.source}</p>
                    </li>
                  ))}
                </ol>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
      {data.omitted.length > 0 && (
        <ul className="text-xs text-slate-500">
          {data.omitted.map((o) => (
            <li key={o.id}>{o.name}: {o.reason}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
