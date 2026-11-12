"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import L from "leaflet";
import type { MapBuilding, MapData } from "@/lib/mapData";
import type { Priority } from "@/lib/types";
import { AreaPrices } from "./AreaPrices";
import { CountUp } from "./Motion";
import "leaflet/dist/leaflet.css";

type TicketFilter = "any" | "open" | "closed";
type OverdueFilter = "any" | "overdue";
type PriorityFilter = "any" | Priority;
type PanelTab = "timeline" | "compliance" | "area";

function matches(b: MapBuilding, f: { city: string; tickets: TicketFilter; overdue: OverdueFilter; priority: PriorityFilter }) {
  if (f.city !== "any" && (b.city ?? "") !== f.city) return false;
  if (f.tickets === "open" && b.openTickets === 0) return false;
  if (f.tickets === "closed" && b.closedTickets === 0) return false;
  if (f.overdue === "overdue" && b.overdueCompliance === 0) return false;
  if (f.priority !== "any" && !b.priorities.includes(f.priority)) return false;
  return true;
}

export function healthOf(b: MapBuilding): "red" | "amber" | "green" {
  const openP1 = b.jobs.some((j) => j.priority === "P1" && j.status !== "completed" && j.status !== "referred");
  if (b.overdueCompliance > 0 || openP1) return "red";
  if ((b.dueSoonCompliance ?? 0) > 0 || b.openTickets > 0) return "amber";
  return "green";
}

const HEALTH = {
  red: { fill: "#ef4444", label: "Needs attention" },
  amber: { fill: "#f59e0b", label: "Watch" },
  green: { fill: "#14b8a6", label: "On track" },
} as const;

function pinSize(unitCount: number) {
  return Math.round(28 + Math.min(18, Math.max(0, unitCount) * 0.35));
}

function pinIcon(b: MapBuilding, selected: boolean, reduce: boolean) {
  const health = healthOf(b);
  const color = HEALTH[health].fill;
  const size = pinSize(b.unitCount || 20) + (selected ? 6 : 0);
  const pulse = reduce ? "" : "vf-pin-ring";
  const html = `<span class="vf-pin-wrap" style="width:${size}px;height:${size}px">
    <span class="${pulse}" style="background:${color}"></span>
    <span class="vf-pin-core" style="background:${color};width:${Math.round(size * 0.46)}px;height:${Math.round(size * 0.46)}px"></span>
  </span>`;
  return L.divIcon({
    className: "vf-pin",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
  });
}

function Fit({ buildings, locked }: { buildings: MapBuilding[]; locked: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (locked || buildings.length === 0) return;
    map.invalidateSize();
    if (buildings.length === 1) {
      map.fitBounds([[buildings[0]!.lat, buildings[0]!.lng]], { maxZoom: 10, padding: [48, 48] });
      return;
    }
    const lats = buildings.map((b) => b.lat);
    const lngs = buildings.map((b) => b.lng);
    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [56, 56], maxZoom: 8 },
    );
    const t = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [56, 56], maxZoom: 8 },
      );
    }, 400);
    return () => clearTimeout(t);
  }, [buildings, map, locked]);
  return null;
}

function FlyTo({ building, reduce }: { building: MapBuilding | null; reduce: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!building) return;
    map.flyTo([building.lat, building.lng], Math.max(map.getZoom(), 11), {
      duration: reduce ? 0 : 0.85,
      easeLinearity: 0.2,
    });
  }, [building, map, reduce]);
  return null;
}

function MapDismiss({ onDismiss }: { onDismiss: () => void }) {
  useMapEvents({ click: () => onDismiss() });
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

function hoursLabel(n: number) {
  if (n < 48) return `${n.toFixed(1)} h`;
  return `${(n / 24).toFixed(1)} days`;
}

function timeline(b: MapBuilding) {
  const ev: Array<{ at: string; label: string; source: string; tone: "red" | "amber" | "teal" | "slate" }> = [];
  for (const t of b.tickets) {
    const open = t.status !== "closed" && t.status !== "resolved";
    if (t.reportedAt) ev.push({ at: t.reportedAt, label: `Ticket reported: ${t.title}`, source: `Cortile ${t.id}`, tone: open ? "amber" : "slate" });
    if (t.resolvedAt) ev.push({ at: t.resolvedAt, label: `Ticket ${t.status}: ${t.title}`, source: `Cortile ${t.id}`, tone: "teal" });
  }
  for (const j of b.jobs) {
    ev.push({ at: j.createdAt, label: `VeloceFix reported: ${j.issue} (${j.priority ?? ""} ${j.status})`, source: j.id, tone: j.priority === "P1" ? "red" : "amber" });
    if (j.bookedAt) ev.push({ at: j.bookedAt, label: `VeloceFix booked: ${j.issue}`, source: j.id, tone: "teal" });
    if (j.completedAt) ev.push({ at: j.completedAt, label: `VeloceFix completed: ${j.issue}`, source: j.id, tone: "teal" });
    if (j.rating) {
      ev.push({
        at: j.completedAt ?? j.createdAt,
        label: `Rated speed ${j.rating.speed}/5, quality ${j.rating.quality}/5${j.rating.exampleData ? " (example data)" : ""}`,
        source: j.id,
        tone: "slate",
      });
    }
  }
  for (const c of b.compliance) {
    if (c.nextDueOn) {
      ev.push({
        at: c.nextDueOn,
        label: `${c.label} · ${c.status.replaceAll("_", " ")}`,
        source: `Cortile ${c.id}`,
        tone: c.status === "overdue" ? "red" : c.status === "due_soon" ? "amber" : "teal",
      });
    }
  }
  return ev.sort((a, b) => b.at.localeCompare(a.at));
}

const DOT = { red: "bg-red-500", amber: "bg-amber-400", teal: "bg-teal-500", slate: "bg-slate-400" };

function Chip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/50 px-3 py-2 ring-1 ring-white/60">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-base font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
  group,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  group: string;
}) {
  const reduce = useReducedMotion();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-9 overflow-hidden rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "text-slate-900" : "text-slate-200 hover:text-white"
      }`}
    >
      {active && (
        <motion.span
          layoutId={reduce ? undefined : `vf-pill-${group}`}
          className="absolute inset-0 rounded-full bg-white shadow"
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white/80 ring-1 ring-white/25" aria-label="About map positions" title={text}>
        i
      </button>
      <span className="pointer-events-none absolute left-0 top-7 z-[1100] hidden w-64 rounded-lg bg-slate-900/95 p-2 text-[11px] leading-snug text-slate-100 shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

export default function PortfolioMap({ data }: { data: MapData }) {
  const reduce = useReducedMotion();
  const [city, setCity] = useState("any");
  const [tickets, setTickets] = useState<TicketFilter>("any");
  const [overdue, setOverdue] = useState<OverdueFilter>("any");
  const [priority, setPriority] = useState<PriorityFilter>("any");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("timeline");

  const cities = useMemo(() => [...new Set(data.buildings.map((b) => b.city).filter(Boolean))] as string[], [data.buildings]);
  const visible = data.buildings.filter((b) => matches(b, { city, tickets, overdue, priority }));
  const selected = data.buildings.find((b) => b.id === selectedId) ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setTab("timeline");
  }, [selectedId]);

  useEffect(() => {
    if (selectedId && !visible.some((b) => b.id === selectedId)) setSelectedId(null);
  }, [city, tickets, overdue, priority, selectedId, data.buildings]);

  if (data.unavailable && data.buildings.length === 0) {
    return (
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
        <h2 className="text-lg font-semibold">Portfolio map</h2>
        <p className="mt-2 text-sm text-amber-200">Cortile live data unavailable, so the map has no building locations.</p>
      </section>
    );
  }

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 280, damping: 28 };

  return (
    <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
      <div className="relative h-[55vh] min-h-[22rem] overflow-hidden sm:h-[70vh]">
        <MapContainer
          center={[53.4, -1.8]}
          zoom={6}
          className="h-full w-full z-0 vf-map"
          scrollWheelZoom
          zoomControl={false}
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomleft" />
          <Fit buildings={visible} locked={Boolean(selected)} />
          <FlyTo building={selected} reduce={!!reduce} />
          <MapDismiss onDismiss={() => setSelectedId(null)} />
          {visible.map((b) => (
            <Marker
              key={b.id}
              position={[b.lat, b.lng]}
              icon={pinIcon(b, b.id === selectedId, !!reduce)}
              zIndexOffset={b.id === selectedId ? 800 : 0}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedId(b.id);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <div className="text-xs">
                  <div className="font-semibold">{b.name}</div>
                  <div>
                    {b.occupancyPercent != null
                      ? `Occupancy ${b.occupancyPercent.toFixed(1)}%`
                      : "Occupancy not in this record"}
                    {b.unitCount ? ` · ${b.unitCount} units` : ""}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[900] bg-gradient-to-b from-slate-950/70 to-transparent p-3 sm:p-4">
          <div className="pointer-events-auto mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">Agency desk — portfolio</h1>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-white/70">
                {visible.length} of {data.buildings.length} buildings
                <InfoTip text="Pins sit at the postcodes.io outcode centroid for each development postcode district. Cortile building coordinates are not used — they are unreliable (synthetic, and often disagree with the recorded district)." />
              </p>
            </div>
            <div className="flex max-w-full flex-wrap gap-1 rounded-full bg-black/35 p-1 backdrop-blur-md ring-1 ring-white/15">
              <Pill group="city" active={city === "any"} onClick={() => setCity("any")}>All cities</Pill>
              {cities.map((c) => (
                <Pill group="city" key={c} active={city === c} onClick={() => setCity(c)}>{c}</Pill>
              ))}
              <span className="mx-1 w-px self-stretch bg-white/20" />
              <Pill group="tickets" active={tickets === "any"} onClick={() => setTickets("any")}>Any tickets</Pill>
              <Pill group="tickets" active={tickets === "open"} onClick={() => setTickets("open")}>Open</Pill>
              <Pill group="tickets" active={tickets === "closed"} onClick={() => setTickets("closed")}>Closed</Pill>
              <span className="mx-1 w-px self-stretch bg-white/20" />
              <Pill group="comp" active={overdue === "any"} onClick={() => setOverdue("any")}>Any compliance</Pill>
              <Pill group="comp" active={overdue === "overdue"} onClick={() => setOverdue("overdue")}>Overdue</Pill>
              <span className="mx-1 w-px self-stretch bg-white/20" />
              <Pill group="pri" active={priority === "any"} onClick={() => setPriority("any")}>Any P</Pill>
              {(["P1", "P2", "P3", "P4"] as Priority[]).map((p) => (
                <Pill group="pri" key={p} active={priority === p} onClick={() => setPriority(p)}>{p}</Pill>
              ))}
            </div>
          </div>
        </div>

        {visible.length === 0 && (
          <p className="absolute inset-0 z-[800] flex items-center justify-center text-sm text-white/80">No buildings match these filters.</p>
        )}

        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={reduce ? false : { opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 32 }}
              transition={spring}
              className="absolute inset-x-2 bottom-2 z-[1000] max-h-[70%] overflow-y-auto rounded-2xl border border-white/40 bg-white/70 p-4 shadow-2xl backdrop-blur-xl sm:inset-y-20 sm:right-4 sm:left-auto sm:w-[22.5rem] sm:max-h-[calc(100%-6rem)]"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.05 }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{HEALTH[healthOf(selected)].label}</p>
                    <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
                    <p className="text-xs text-slate-600">{selected.city} · {selected.postcodeDistrict} · Cortile {selected.id}</p>
                  </div>
                  <button type="button" className="min-h-11 min-w-11 rounded-full text-lg text-slate-600 hover:bg-white/60" onClick={() => setSelectedId(null)} aria-label="Close">
                    ×
                  </button>
                </div>
              </motion.div>

              <motion.div className="mt-3 grid grid-cols-2 gap-2" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.1 }}>
                <Chip
                  label="Occupancy"
                  value={selected.occupancyPercent != null ? <CountUp value={selected.occupancyPercent} decimals={1} suffix="%" /> : "—"}
                />
                <Chip label="Open tickets" value={selected.openTickets} />
                <Chip label="Compliance" value={`${selected.overdueCompliance} overdue · ${selected.dueSoonCompliance ?? 0} due soon`} />
                <Chip
                  label="Median to contractor"
                  value={selected.medianContractorHours != null ? hoursLabel(selected.medianContractorHours) : "—"}
                />
                <div className="col-span-2">
                  <Chip
                    label="Tenant satisfaction"
                    value={
                      selected.satisfaction && selected.satisfaction.n > 0 && selected.satisfaction.csatPercent != null
                        ? `CSAT ${Math.round(selected.satisfaction.csatPercent)}% (n=${selected.satisfaction.n})`
                        : "No ratings yet"
                    }
                  />
                </div>
              </motion.div>

              <motion.div className="mt-3" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.16 }}>
                <div className="flex rounded-full bg-slate-900/5 p-1 text-xs font-medium">
                  {([
                    ["timeline", "Timeline"],
                    ["compliance", "Compliance"],
                    ["area", "Area price"],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      className={`min-h-9 flex-1 rounded-full px-2 ${tab === id ? "bg-white shadow text-slate-900" : "text-slate-600"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tab === "timeline" && (
                  timeline(selected).length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">No ticket, job or compliance events.</p>
                  ) : (
                    <ol className="mt-3 space-y-2">
                      {timeline(selected).slice(0, 16).map((e, i) => (
                        <li key={`${e.source}-${e.at}-${i}`} className="flex gap-2 text-sm">
                          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[e.tone]}`} />
                          <div>
                            <p className="text-slate-800">{e.label}</p>
                            <p className="text-xs text-slate-500">{formatWhen(e.at)} Europe/London · {e.source}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )
                )}

                {tab === "compliance" && (
                  <ul className="mt-3 space-y-2 text-sm">
                    {selected.compliance.length === 0 && <li className="text-slate-600">No compliance records.</li>}
                    {selected.compliance.map((c) => (
                      <li key={c.id}>
                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${c.status === "overdue" ? "bg-red-500" : c.status === "due_soon" ? "bg-amber-400" : "bg-teal-500"}`} />
                        {c.label} · {c.status.replaceAll("_", " ")}
                        {c.nextDueOn ? ` · due ${formatWhen(c.nextDueOn)}` : ""}
                        <span className="block text-xs text-slate-500">Cortile {c.id}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tab === "area" && (
                  <div className="mt-3">
                    {selected.postcodeDistrict ? (
                      <AreaPrices district={selected.postcodeDistrict} />
                    ) : (
                      <p className="text-sm text-slate-600">No postcode district on this record.</p>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div className="mt-4" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: reduce ? 0 : 0.22 }}>
                <Link
                  href={`/buildings/${selected.id}`}
                  className="flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow hover:bg-teal-800"
                >
                  Open asset view
                </Link>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
      {data.omitted.length > 0 && (
        <p className="mx-auto max-w-6xl px-4 py-2 text-xs text-slate-500">
          Not plotted: {data.omitted.map((o) => `${o.name} (${o.reason})`).join(" · ")}
        </p>
      )}
    </section>
  );
}
