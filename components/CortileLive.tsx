import type { ReactNode } from "react";
import Link from "next/link";
import {
  CORTILE_DEMO,
  CORTILE_DOCS,
  cortileGasCertCheck,
  formatLondonDate,
  gasSafetyTone,
  type CortileBuildingView,
  type CortileDemoData,
} from "@/lib/cortile";

function statusMark(status: "green" | "amber" | "red") {
  if (status === "green") return "🟢";
  if (status === "amber") return "🟠";
  return "🔴";
}

function BuildingCard({
  b,
  extra,
}: {
  b: CortileBuildingView;
  extra?: ReactNode;
}) {
  if (!b.ok) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <h3 className="text-lg font-semibold">Cortile {b.id}</h3>
        <p className="mt-2 text-sm text-amber-800">Cortile live data unavailable</p>
      </section>
    );
  }

  const kind = b.kind === "period" ? "Period building" : b.kind === "new_build" ? "New build" : null;
  const facts = [
    kind,
    b.builtYear != null ? `built ${b.builtYear}` : null,
    b.heating,
    b.unitCount != null ? `${b.unitCount} units` : null,
    b.city,
  ].filter(Boolean);
  const gas = b.gasSafety;
  const tone = gasSafetyTone(gas?.status);
  const cert = cortileGasCertCheck(gas);

  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <div className="flex items-start gap-2">
        <h3 className="text-lg font-semibold">{b.name}</h3>
        <span className="mt-1 shrink-0 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
          Cortile live
        </span>
      </div>
      <p className="text-xs text-slate-500">Cortile {b.id}</p>
      <p className="mt-1 text-sm">
        <Link className="text-sm font-medium text-teal-800 underline" href={`/buildings/${b.id}`}>
          Asset view
        </Link>
      </p>
      <p className="mt-1 text-sm text-slate-600">{facts.join(" · ")}</p>
      {gas && (
        <div className="mt-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compliance</p>
          <p>
            {tone !== "none" ? `${statusMark(tone)} ` : ""}
            {gas.label}
            {gas.status === "due_soon" && gas.nextDueOn
              ? ` — due soon ${formatLondonDate(gas.nextDueOn)}`
              : gas.status === "in_date" && gas.nextDueOn
                ? ` — in date (due ${formatLondonDate(gas.nextDueOn)})`
                : gas.status === "overdue" && gas.nextDueOn
                  ? ` — overdue (due ${formatLondonDate(gas.nextDueOn)})`
                  : ""}
            {" "}
            <span className="text-slate-400">
              — <a className="underline" href={CORTILE_DOCS} target="_blank" rel="noreferrer">Cortile {gas.id}</a>
            </span>
          </p>
          {cert && (
            <p className="mt-1 text-xs text-slate-600">
              WHY: {cert.detail} — {cert.source}
            </p>
          )}
        </div>
      )}
      {extra}
    </section>
  );
}

export function CortileLive({ data }: { data: CortileDemoData }) {
  const gorse = data.buildings.find((b) => b.id === CORTILE_DEMO.gorseId) ?? { id: CORTILE_DEMO.gorseId, ok: false };
  const juniper = data.buildings.find((b) => b.id === CORTILE_DEMO.juniperId) ?? { id: CORTILE_DEMO.juniperId, ok: false };
  const contractor = data.contractor;
  const ticket = data.ticket;

  const gorseExtra = gorse.ok ? (
    <>
      {contractor && (
        <div className="mt-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contractor</p>
          <p>
            {contractor.name}
            {contractor.accredited ? " · accredited" : " · not marked accredited"}
            {contractor.insuranceExpiresOn
              ? ` · insurance expires ${formatLondonDate(contractor.insuranceExpiresOn)}`
              : ""}
            {" "}
            <span className="text-slate-400">
              — <a className="underline" href={CORTILE_DOCS} target="_blank" rel="noreferrer">Cortile {contractor.id}</a>
            </span>
          </p>
        </div>
      )}
      {ticket && (
        <div className="mt-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Past ticket</p>
          <p>
            {ticket.title}
            {ticket.channel ? ` · ${ticket.channel}` : ""}
            {ticket.unitNumber ? ` · unit ${ticket.unitNumber}` : ""}
            {ticket.unitId ? ` (${ticket.unitId})` : ""}
            {ticket.status ? ` · ${ticket.status}` : ""}
            {ticket.reportedAt ? ` · ${formatLondonDate(ticket.reportedAt)}` : ""}
            {" "}
            <span className="text-slate-400">
              — <a className="underline" href={CORTILE_DOCS} target="_blank" rel="noreferrer">Cortile {ticket.id}</a>
            </span>
          </p>
        </div>
      )}
    </>
  ) : null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Cortile live</h2>
        <p className="text-xs text-slate-500">
          Synthetic UK block-management records from the{" "}
          <a className="underline" href={CORTILE_DOCS} target="_blank" rel="noreferrer">Cortile hackathon API</a>
          , fetched at request time. Event-only; names and addresses are synthetic.
          {data.unavailable ? " " : data.fetchedAt ? ` Last fetched ${formatLondonDate(data.fetchedAt)} Europe/London.` : ""}
        </p>
        {data.unavailable && (
          <p className="mt-1 text-sm text-amber-800">Cortile live data unavailable</p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BuildingCard b={gorse} extra={gorseExtra} />
        <BuildingCard b={juniper} />
      </div>
    </section>
  );
}
