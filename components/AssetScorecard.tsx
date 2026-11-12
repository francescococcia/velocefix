import type { ReactNode } from "react";
import Link from "next/link";
import { CORTILE_DOCS, formatLondonDate } from "@/lib/cortile";
import { POSTCODES_IO } from "@/lib/areaPrices";
import { ASSET_DEMO, type AssetView } from "@/lib/assetView";
import { AreaPrices } from "./AreaPrices";
import { SatisfactionCard } from "./SatisfactionTile";
import { CountUp, FadeIn } from "./Motion";

function gbp(n: number, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

function hours(n: number) {
  if (n < 48) return `${n.toFixed(1)} h`;
  return `${(n / 24).toFixed(1)} days`;
}

function Source({ children, href = CORTILE_DOCS }: { children: ReactNode; href?: string }) {
  return (
    <span className="text-xs text-slate-500">
      —{" "}
      <a className="underline" href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    </span>
  );
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="vf-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function counts(record?: Record<string, number>) {
  if (!record) return null;
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${n} ${k.replaceAll("_", " ")}`)
    .join(" · ");
}

function otherDemo(id: string) {
  if (id === ASSET_DEMO.gorseId) return { id: ASSET_DEMO.juniperId, name: ASSET_DEMO.juniperName };
  if (id === ASSET_DEMO.juniperId) return { id: ASSET_DEMO.gorseId, name: ASSET_DEMO.gorseName };
  return null;
}

export function AssetScorecard({ view, compare }: { view: AssetView; compare?: string }) {
  const peer = otherDemo(view.id);

  if (!view.ok) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <h1 className="text-2xl font-semibold">Asset view · Cortile {view.id}</h1>
        <p className="mt-2 text-sm text-amber-800">
          {view.reason === "missing_key"
            ? "Cortile live data unavailable (no API key configured)."
            : view.reason === "bad_id"
              ? "That is not a Cortile building id."
              : "Cortile live data unavailable"}
        </p>
        <p className="mt-3 text-sm">
          <Link className="underline" href="/">
            Back to dashboard
          </Link>
        </p>
      </section>
    );
  }

  const occ = view.occupancy;
  const sc = view.serviceCharge;
  const tickets = view.tickets;
  const comp = view.compliance;
  const vf = view.veloceFix;
  const tenure = view.development?.tenureModel?.replaceAll("_", " ");

  return (
    <FadeIn className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-strong">Asset view · investor / asset manager</p>
          <h1 className="text-2xl font-semibold">{view.name}</h1>
          <p className="text-sm text-slate-600">
            {[
              view.development?.name,
              view.city,
              view.development?.region,
              tenure,
              view.builtYear != null ? `built ${view.builtYear}` : null,
              view.completedYear != null ? `completed ${view.completedYear}` : null,
              view.heating,
              view.epcBandMedian ? `EPC ${view.epcBandMedian}` : null,
              view.storeys != null ? `${view.storeys} storeys` : null,
              view.unitCount != null ? `${view.unitCount} units` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="text-xs text-slate-500">
            Cortile {view.id}
            {view.development?.id ? ` · ${view.development.id}` : ""}
            {view.development?.developer ? ` · developer ${view.development.developer}` : ""}
            {view.fetchedAt ? ` · fetched ${formatLondonDate(view.fetchedAt)} Europe/London` : ""}
            <Source>Cortile {view.id}</Source>
          </p>
        </div>
        <div className="text-sm space-x-3">
          <Link className="underline" href="/">
            Dashboard
          </Link>
          {peer && !compare && (
            <Link className="underline" href={`/buildings/${view.id}?compare=${peer.id}`}>
              Compare with {peer.name}
            </Link>
          )}
          {compare && (
            <Link className="underline" href={`/buildings/${view.id}`}>
              Single building
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile label="Occupancy">
          <p className="text-2xl font-semibold tabular-nums">
            {occ?.percent != null ? <CountUp value={occ.percent} decimals={1} suffix="%" /> : "—"}
          </p>
          <p className="text-sm text-slate-600">
            {occ ? `${occ.occupied} occupied · ${occ.vacant} vacant${occ.other ? ` · ${occ.other} other` : ""} of ${occ.total} units` : "No unit records"}
          </p>
          {view.unitTenures && <p className="mt-1 text-sm text-slate-600">Tenure: {counts(view.unitTenures)}</p>}
          {view.unitTypes && <p className="text-sm text-slate-600">Type: {counts(view.unitTypes)}</p>}
          <p className="mt-1">
            <Source>Cortile units on {view.id} ({occ?.total ?? 0} records)</Source>
          </p>
        </Tile>

        <Tile label="Income and service charge">
          {view.leaseCount ? (
            <>
              <p className="text-2xl font-semibold tabular-nums">
                {view.groundRentGbpPerYear != null ? gbp(view.groundRentGbpPerYear, 0) : "—"}
                <span className="text-sm font-normal text-slate-500"> / year ground rent</span>
              </p>
              <p className="text-sm text-slate-600">
                Sum of ground_rent_gbp_per_year on {view.leaseCount} long leases
                {view.ownerOccupierCount != null ? ` · ${view.ownerOccupierCount} marked owner-occupier` : ""}. Market
                rent is not a Cortile field.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">{view.noLeasesReason ?? "No long-lease records. Market rent is not a Cortile field."}</p>
          )}
          {sc && (
            <div className="mt-2 text-sm text-slate-700">
              <p>
                Service charge year ending {formatLondonDate(sc.yearEnd)} ({sc.status.replaceAll("_", " ")}): budget{" "}
                {gbp(sc.budgetGbp)} · actual {sc.actualGbp != null ? gbp(sc.actualGbp) : "—"}
              </p>
              {sc.repairsId && (
                <p>
                  Of which repairs: budget {gbp(sc.repairsBudgetGbp ?? 0)} · actual{" "}
                  {sc.repairsActualGbp != null ? gbp(sc.repairsActualGbp) : "—"}{" "}
                  <Source>Cortile {sc.repairsId}</Source>
                </p>
              )}
              <p className="text-xs text-slate-500">This is budget vs spend, not rental income.</p>
            </div>
          )}
          <p className="mt-1">
            {view.leaseCount ? <Source>Cortile leases on {view.id} ({view.leaseCount} records)</Source> : null}
            {sc ? <Source>Cortile service charges, year ending {sc.yearEnd} ({sc.lineCount} lines, e.g. {sc.recordIds[0]})</Source> : null}
          </p>
        </Tile>

        <Tile label="Arrears">
          {view.leaseCount ? (
            <>
              <p className="text-2xl font-semibold tabular-nums">{view.arrearsGbp != null ? gbp(view.arrearsGbp) : "—"}</p>
              <p className="text-sm text-slate-600">
                Sum of arrears_gbp on {view.leaseCount} leases
                {view.leasesWithArrears != null ? ` · ${view.leasesWithArrears} with arrears above zero` : ""}. Cortile
                records this as service-charge arrears (dataset as of 12 Nov 2026).
              </p>
              <Source>Cortile leases on {view.id}</Source>
            </>
          ) : (
            <p className="text-sm text-slate-600">No lease arrears fields — {view.noLeasesReason ?? "no long-lease records for this building."}</p>
          )}
        </Tile>

        <Tile label="Repair tickets">
          <p className="text-2xl font-semibold tabular-nums">{tickets?.total ?? 0}</p>
          <p className="text-sm text-slate-600">{tickets ? counts(tickets.byStatus) : "No tickets"}</p>
          {tickets?.medianHoursToContractor != null ? (
            <p className="mt-1 text-sm text-slate-700">
              Median time to first contractor update: {hours(tickets.medianHoursToContractor)} (n={tickets.contractorSampleN} of {tickets.total})
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">No contractor updates on the fetched tickets, so time to contractor is not shown.</p>
          )}
          {tickets?.medianHoursToManagerReply != null && (
            <p className="text-sm text-slate-600">
              Median time to first manager reply (Cortile first_response_at): {hours(tickets.medianHoursToManagerReply)} (n={tickets.managerReplyN})
            </p>
          )}
          <p className="text-xs text-slate-500">{tickets?.withContractor ?? 0} tickets have a contractor assigned.</p>
          <Source>Cortile tickets on {view.id}{tickets?.contractorTicketIds.length ? ` · first contractor update on e.g. ${tickets.contractorTicketIds[0]}` : ""}</Source>
        </Tile>

        {view.satisfaction && <SatisfactionCard summary={view.satisfaction} />}

        <Tile label="VeloceFix jobs">
          <p className="text-2xl font-semibold tabular-nums">{vf?.total ?? 0}</p>
          <p className="text-sm text-slate-600">
            {vf && vf.total > 0 ? `${counts(vf.byStatus)} · ${vf.ids.join(", ")}` : "No VeloceFix jobs for this building in the in-memory store."}
          </p>
          {vf?.completedMedianHours != null ? (
            <p className="mt-1 text-sm text-slate-700">
              Median created → completion: {hours(vf.completedMedianHours)} (n={vf.completedN})
            </p>
          ) : vf && vf.total > 0 ? (
            <p className="mt-1 text-sm text-slate-600">No completion records yet, so time to contractor is not computed from VeloceFix jobs.</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">— VeloceFix in-memory store (resets on a cold start)</p>
        </Tile>

        <Tile label="Compliance">
          <p className="text-2xl font-semibold tabular-nums">
            {comp ? `${comp.byStatus.overdue ?? 0} overdue · ${comp.byStatus.due_soon ?? 0} due soon` : "—"}
          </p>
          <p className="text-sm text-slate-600">{comp ? `${comp.total} items · ${counts(comp.byStatus)}` : "No compliance records"}</p>
          {comp && (comp.overdue.length > 0 || comp.dueSoon.length > 0) && (
            <ul className="mt-2 text-sm text-slate-700">
              {comp.overdue.map((c) => (
                <li key={c.id}>
                  Overdue: {c.label} (due {formatLondonDate(c.nextDueOn)}) <Source>Cortile {c.id}</Source>
                </li>
              ))}
              {comp.dueSoon.map((c) => (
                <li key={c.id}>
                  Due soon: {c.label} (due {formatLondonDate(c.nextDueOn)}) <Source>Cortile {c.id}</Source>
                </li>
              ))}
            </ul>
          )}
        </Tile>
      </div>

      <section className="vf-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Area</p>
        {view.area?.postcodeDistrict ? (
          <>
            <p className="mt-1 text-2xl font-semibold">{view.area.postcodeDistrict}</p>
            <p className="text-sm text-slate-600">
              Postcode district
              {view.area.outcode?.adminDistricts.length
                ? ` · local authority ${view.area.outcode.adminDistricts.join(", ")}`
                : " · local authority unavailable"}
              {view.area.outcode?.country ? ` · ${view.area.outcode.country}` : ""}
            </p>
            <p className="text-xs text-slate-500">
              {view.area.districtSource}
              {view.area.outcode ? (
                <Source href={POSTCODES_IO}>postcodes.io outcodes/{view.area.outcode.outcode}</Source>
              ) : (
                <span className="text-xs text-slate-500"> — postcodes.io lookup failed</span>
              )}
            </p>
            <p className="mt-1 text-xs text-slate-500">{view.area.syntheticPostcodeNote}</p>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <AreaPrices district={view.area.postcodeDistrict} />
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-slate-600">No postcode district on the Cortile development record.</p>
        )}
      </section>
    </FadeIn>
  );
}
