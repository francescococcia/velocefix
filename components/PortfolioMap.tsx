"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import L from "leaflet";
import type { MapBuilding, MapData } from "@/lib/mapData";
import { AreaPrices } from "./AreaPrices";
import { CountUp } from "./Motion";
import "leaflet/dist/leaflet.css";

type HealthFilter = "any" | "red" | "amber" | "green";
type PanelTab = "timeline" | "compliance" | "area";

function matches(b: MapBuilding, f: { city: string; health: HealthFilter }) {
  if (f.city !== "any" && (b.city ?? "") !== f.city) return false;
  return f.health === "any" || healthOf(b) === f.health;
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
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
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
        active ? "text-white" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      {active && (
        <motion.span
          layoutId={reduce ? undefined : `vf-pill-${group}`}
          className="absolute inset-0 rounded-full bg-slate-900 shadow"
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center">{children}</span>
    </button>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600" aria-label="About map positions" title={text}>
        i
      </button>
      <span className="pointer-events-none absolute left-0 top-7 z-[1100] hidden w-64 rounded-lg bg-slate-900/95 p-2 text-[11px] leading-snug text-slate-100 shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

/** Plain-words reason for a building's colour class. Same inputs as healthOf. */
function reasonOf(b: MapBuilding) {
  const bits: string[] = [];
  if (b.overdueCompliance > 0) bits.push(`${b.overdueCompliance} compliance check${b.overdueCompliance === 1 ? "" : "s"} overdue`);
  if (b.jobs.some((j) => j.priority === "P1" && j.status !== "completed" && j.status !== "referred")) bits.push("open P1 repair");
  if ((b.dueSoonCompliance ?? 0) > 0) bits.push(`${b.dueSoonCompliance} compliance due soon`);
  if (b.openTickets > 0) bits.push(`${b.openTickets} open ticket${b.openTickets === 1 ? "" : "s"}`);
  return bits.length ? bits.join(", ") : "nothing open, compliance in date";
}

// Answers are computed from the records on the map, not generated text.
const QUESTIONS: { q: string; a: (bs: MapBuilding[]) => string[] }[] = [
  {
    q: "What is overdue?",
    a: (bs) =>
      bs.flatMap((b) =>
        b.compliance
          .filter((c) => c.status === "overdue")
          .map((c) => `${b.name}: ${c.label}${c.nextDueOn ? `, was due ${formatWhen(c.nextDueOn)}` : ""}`),
      ),
  },
  {
    q: "What is open?",
    a: (bs) =>
      bs.flatMap((b) => [
        ...b.tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").map((t) => `${b.name}: ${t.title} (ticket)`),
        ...b.jobs.filter((j) => j.status !== "completed").map((j) => `${b.name}: ${j.issue} (${[j.priority, j.status].filter(Boolean).join(", ")})`),
      ]),
  },
  {
    q: "Where are repairs slowest?",
    a: (bs) =>
      bs
        .filter((b) => b.medianContractorHours != null)
        .sort((x, y) => (y.medianContractorHours ?? 0) - (x.medianContractorHours ?? 0))
        .map((b) => `${b.name}: median ${hoursLabel(b.medianContractorHours ?? 0)} from report to contractor`),
  },
];

const HEALTH_ORDER = ["red", "amber", "green"] as const;

export default function PortfolioMap({ data }: { data: MapData }) {
  const reduce = useReducedMotion();
  const [city, setCity] = useState("any");
  const [health, setHealth] = useState<HealthFilter>("any");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<PanelTab>("timeline");
  const [asked, setAsked] = useState<number | null>(null);

  const cities = useMemo(() => [...new Set(data.buildings.map((b) => b.city).filter(Boolean))] as string[], [data.buildings]);
  const visible = data.buildings.filter((b) => matches(b, { city, health }));
  const selected = data.buildings.find((b) => b.id === selectedId) ?? null;
  const countOf = (h: (typeof HEALTH_ORDER)[number]) => data.buildings.filter((b) => healthOf(b) === h).length;

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
  }, [city, health, selectedId, data.buildings]);

  const card = "rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm";

  if (data.unavailable && data.buildings.length === 0) {
    return (
      <section className={card}>
        <h2 className="text-lg font-semibold">Portfolio map</h2>
        <p className="mt-1 text-sm text-amber-800">
          {data.reason === "missing_key"
            ? "Cortile key is not set on this server (CORTILE_API_KEY), so the map has no building locations. Add it to .env.local to see the map here."
            : "Cortile live data unavailable, so the map has no building locations."}
        </p>
      </section>
    );
  }

  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 280, damping: 28 };
  const units = data.buildings.reduce((n, b) => n + (b.unitCount || 0), 0);
  const answers = asked != null ? QUESTIONS[asked]!.a(data.buildings) : [];

  return (
    <section className={card}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Portfolio map</h2>
        <span className="text-xs text-slate-500">{visible.length} of {data.buildings.length} buildings</span>
        <InfoTip text="Pins sit at the postcodes.io outcode centroid for each development postcode district. Cortile building coordinates are not used — they are unreliable (synthetic, and often disagree with the recorded district)." />
        <div className="ml-auto flex max-w-full flex-wrap gap-1 rounded-full bg-slate-100 p-1">
          <Pill group="health" active={health === "any"} onClick={() => setHealth("any")}>All</Pill>
          {HEALTH_ORDER.map((h) => (
            <Pill group="health" key={h} active={health === h} onClick={() => setHealth(h)}>
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: HEALTH[h].fill }} />
              {HEALTH[h].label} {countOf(h)}
            </Pill>
          ))}
          {cities.length > 1 && <span className="mx-1 w-px self-stretch bg-slate-300" />}
          {cities.length > 1 && <Pill group="city" active={city === "any"} onClick={() => setCity("any")}>All cities</Pill>}
          {cities.length > 1 && cities.map((c) => (
            <Pill group="city" key={c} active={city === c} onClick={() => setCity(c)}>{c}</Pill>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[3fr_2fr]">
        <div className="relative h-72 overflow-hidden rounded-xl ring-1 ring-slate-200 sm:h-[26rem]">
          <MapContainer center={[53.4, -1.8]} zoom={6} className="h-full w-full z-0 vf-map" scrollWheelZoom={false} zoomControl={false}>
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
                    <div className="font-semibold">{b.name} · {HEALTH[healthOf(b)].label}</div>
                    <div>{reasonOf(b)}</div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
          {visible.length === 0 && (
            <p className="absolute inset-0 z-[800] flex items-center justify-center bg-white/60 text-sm text-slate-700">No buildings match these filters.</p>
          )}
        </div>

        <div className="overflow-y-auto rounded-xl bg-white p-3 ring-1 ring-slate-200 lg:h-[26rem]">
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -16 }}
                transition={spring}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: HEALTH[healthOf(selected)].fill }} />
                      {HEALTH[healthOf(selected)].label}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">{selected.name}</h3>
                    <p className="text-xs text-slate-600">{selected.city} · {selected.postcodeDistrict} · Cortile {selected.id}</p>
                    <p className="mt-1 text-xs text-slate-700">Why this colour: {reasonOf(selected)}.</p>
                  </div>
                  <button type="button" className="min-h-11 shrink-0 rounded-full px-3 text-sm text-slate-600 hover:bg-slate-100" onClick={() => setSelectedId(null)}>
                    ← All buildings
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Chip
                    label="Occupancy"
                    value={selected.occupancyPercent != null ? <CountUp value={selected.occupancyPercent} decimals={1} suffix="%" /> : "—"}
                  />
                  <Chip label="Units" value={selected.unitCount || "—"} />
                  <Chip label="Open tickets" value={selected.openTickets} />
                  <Chip label="Compliance" value={`${selected.overdueCompliance} overdue · ${selected.dueSoonCompliance ?? 0} due soon`} />
                  <Chip
                    label="Median to contractor"
                    value={selected.medianContractorHours != null ? hoursLabel(selected.medianContractorHours) : "—"}
                  />
                  <Chip
                    label="Tenant satisfaction"
                    value={
                      selected.satisfaction && selected.satisfaction.n > 0 && selected.satisfaction.csatPercent != null
                        ? `CSAT ${Math.round(selected.satisfaction.csatPercent)}% (n=${selected.satisfaction.n})`
                        : "No ratings yet"
                    }
                  />
                </div>

                <div className="mt-3">
                  <div className="flex rounded-full bg-slate-100 p-1 text-xs font-medium">
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
                </div>

                <Link
                  href={`/buildings/${selected.id}`}
                  className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow hover:bg-teal-800"
                >
                  Open asset view
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 16 }}
                transition={spring}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recap</p>
                <p className="mt-1 text-sm text-slate-800">
                  {data.buildings.length} building{data.buildings.length === 1 ? "" : "s"} on the map, {units} units.{" "}
                  {countOf("red")} need attention, {countOf("amber")} to watch, {countOf("green")} on track.
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUESTIONS.map((x, i) => (
                    <button
                      key={x.q}
                      type="button"
                      aria-pressed={asked === i}
                      onClick={() => setAsked(asked === i ? null : i)}
                      className={`min-h-9 rounded-full px-3 text-xs font-medium ring-1 ${asked === i ? "bg-teal-700 text-white ring-teal-700" : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"}`}
                    >
                      {x.q}
                    </button>
                  ))}
                </div>
                {asked != null && (
                  <motion.ul
                    key={asked}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-sm text-slate-800"
                    aria-live="polite"
                  >
                    {answers.length === 0 && <li>Nothing right now.</li>}
                    {answers.slice(0, 8).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                    {answers.length > 8 && <li className="text-xs text-slate-500">and {answers.length - 8} more</li>}
                  </motion.ul>
                )}

                <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Buildings</p>
                <ul className="mt-1 grid gap-2">
                  {visible.map((b) => {
                    const h = healthOf(b);
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(b.id)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-left hover:border-teal-600 hover:bg-slate-50"
                          style={{ borderLeft: `4px solid ${HEALTH[h].fill}` }}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{b.name}</span>
                            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-slate-600">{HEALTH[h].label}</span>
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-600">
                            {[b.city, b.unitCount ? `${b.unitCount} units` : null, b.occupancyPercent != null ? `${b.occupancyPercent.toFixed(1)}% occupied` : null].filter(Boolean).join(" · ")}
                          </span>
                          <span className="block text-xs text-slate-700">{reasonOf(b)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {data.omitted.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    Not on the map (no postcode district in Cortile, so no location is invented): {data.omitted.map((o) => o.name).join(", ")}.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
