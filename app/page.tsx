import { plainSource } from "@/components/plain";
import { getStore } from "@/lib/store";
import { dueAt } from "@/lib/priority";
import { PriorityBadge } from "@/components/PriorityBadge";
import { CortileLive } from "@/components/CortileLive";
import { cortileGasCertCheck, loadCortileDemo } from "@/lib/cortile";
import { isGasWork } from "@/lib/checks";
import { TimeSavedLine, TimeSavedWeekTile } from "@/components/TimeSaved";
import { VerifiedHistory } from "@/components/VerifiedHistory";
import { SatisfactionTile } from "@/components/SatisfactionTile";
import { RatingBadge } from "@/components/RatingBadge";
import { CountUp, FadeIn } from "@/components/Motion";
import { summariseRatings } from "@/lib/rating";
import Link from "next/link";
import { loadMapData } from "@/lib/mapData";
import { PortfolioMapClient } from "@/components/PortfolioMapClient";
import { JourneyStrip } from "@/components/Journey";
import { WorkQueue, type WorkFilter, type WorkItem } from "@/components/WorkQueue";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildingKind(type?: string) {
  if (type === "period") return "Period house";
  if (type === "new_build") return "New build";
  return null;
}

// Chat thread in an expanded job: tenant on the left, Velo on the right, system notes centred.
const note = "self-center rounded-xl bg-surface px-3 py-1 text-center text-xs ring-1 ring-line";
const fromTenant = "max-w-[88%] self-start rounded-2xl rounded-bl-md bg-surface px-3 py-2 shadow-sm ring-1 ring-line";
const fromVelo = "max-w-[92%] self-end rounded-2xl rounded-br-md bg-brand-tint px-3 py-2 ring-1 ring-brand-soft";
const who = "text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const chip = "rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide";
const short: Intl.DateTimeFormatOptions = { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };
const mark = (status: string) => (status === "green" ? "🟢" : status === "amber" ? "🟠" : "🔴");

export default async function Dashboard() {
  const s = getStore();
  const now = Date.now();
  const [cortile, mapData] = await Promise.all([loadCortileDemo(), loadMapData()]);
  const gorseGas = cortile.buildings.find((b) => b.id === "bld_0006")?.gasSafety;
  const cortileCert = cortileGasCertCheck(gorseGas);

  const isOverdue = (j: Job) =>
    j.status !== "completed" && j.priority.clock.hours > 0 && dueAt(j.createdAt, j.priority.clock.hours).getTime() < now;
  const isHigh = (j: Job) => j.priority.priority <= "P2";
  const byUrgency = (a: Job, b: Job) =>
    Number(a.status === "completed") - Number(b.status === "completed") ||
    Number(isOverdue(b)) - Number(isOverdue(a)) ||
    a.priority.priority.localeCompare(b.priority.priority);
  const jobs = [...s.jobs].sort(byUrgency);
  const live = jobs.filter((j) => j.status !== "completed");
  const attention = live.filter((j) => j.status !== "booked");
  const stats: { label: string; value: number; tone: string; show: WorkFilter }[] = [
    { label: "Open jobs", value: live.length, tone: "text-slate-900", show: "open" },
    { label: "Overdue", value: live.filter(isOverdue).length, tone: "text-red-600", show: "overdue" },
    { label: "High priority", value: live.filter(isHigh).length, tone: "text-orange-600", show: "urgent" },
    { label: "Booked", value: live.filter((j) => j.status === "booked").length, tone: "text-green-700", show: "booked" },
    { label: "Completed", value: jobs.length - live.length, tone: "text-brand", show: "completed" },
  ];
  const where = (j: Job) => {
    const unit = s.units.find((u) => u.id === j.unitId);
    return { unit, building: s.buildings.find((b) => b.id === unit?.buildingId) };
  };
  const statusText = (j: Job) => {
    const due = dueAt(j.createdAt, j.priority.clock.hours);
    if (j.status === "completed") return { text: "Completed", cls: "text-brand" };
    if (j.status === "booked") return { text: "Booked", cls: "text-green-700" };
    if (isOverdue(j)) return { text: `Overdue ${Math.round((now - due.getTime()) / 86400000)} days`, cls: "text-red-600" };
    return { text: `Due ${due.toLocaleString("en-GB", short)}`, cls: "text-slate-500" };
  };

  const items: WorkItem[] = jobs.map((j) => {
    const { unit, building } = where(j);
    const due = dueAt(j.createdAt, j.priority.clock.hours);
    const overdue = isOverdue(j);
    const dwelly = !!(j.source?.startsWith("Dwelly") || unit?.source?.startsWith("Dwelly"));
    const history = s.works.filter((w) => w.unitId === j.unitId);
    const boiler =
      s.assets.find((a) => a.unitId === j.unitId && a.type === "boiler") ??
      s.assets.find((a) => a.buildingId === unit?.buildingId && a.type === "boiler" && !a.unitId);
    const gasCert = cortileCert && isGasWork(j.proposal.issue, boiler) ? cortileCert : undefined;
    const rows = [...j.checks, ...(gasCert && !j.checks.some((x) => x.id === gasCert.id) ? [gasCert] : [])];
    const op = s.operators.find((o) => o.id === j.operatorId);
    const slot = op?.slots.find((x) => x.id === j.slotId);
    const photo = j.messages.find((m) => m.mediaUrl)?.mediaUrl;
    const st = statusText(j);
    const tags: WorkFilter[] = [
      j.status === "completed" ? "completed" : "open",
      ...(overdue ? (["overdue"] as const) : []),
      ...(j.status !== "completed" && isHigh(j) ? (["urgent"] as const) : []),
      ...(j.status === "booked" ? (["booked"] as const) : []),
    ];
    return {
      id: j.id,
      tags,
      head: (
        <>
          <PriorityBadge p={j.priority.priority} />
          <span className="font-medium">{j.proposal.issue.replace(/_/g, " ")}</span>
          <span className="text-slate-500">· {building?.name} · {unit?.label}</span>
          {dwelly && <span className={`${chip} bg-sky-100 text-sky-800`}>Dwelly</span>}
          {j.source?.startsWith("Cortile") && <span className={`${chip} bg-brand-soft text-brand-strong`}>Cortile demo replay</span>}
          {j.proposal.by === "grok" && <span className={`${chip} bg-violet-100 text-violet-800`}>Proposed by Grok</span>}
          {j.proposal.by === "fallback" && <span className={`${chip} bg-slate-200 text-slate-700`}>Keyword fallback</span>}
          <RatingBadge job={j} />
          <span className={`ml-auto text-xs font-semibold ${st.cls}`}>{st.text}</span>
        </>
      ),
      body: (
        <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl bg-canvas p-3 text-xs ring-1 ring-line sm:p-4">
          <p className={`${note} ${overdue ? "font-semibold text-red-600" : "text-slate-600"}`}>
            {j.status === "completed" && j.completion
              ? `Completed ${new Date(j.completion.at).toLocaleString("en-GB", short)}`
              : overdue
                ? `OVERDUE by ${Math.round((now - due.getTime()) / 86400000)} days`
                : `Due ${due.toLocaleString("en-GB", short)}`}
            {" "}· {j.priority.clock.label} · {j.proposal.room}
            {j.lastAgencyReplyAt === null ? " · no agency reply yet" : ""}
          </p>
          {j.messages.map((m, i) => (
            <FadeIn key={`${m.at}-${i}`} delay={i * 0.05} className={m.direction === "in" ? fromTenant : fromVelo}>
              <p className={who}>
                {m.direction === "in" ? "Tenant" : "Velo"} · {new Date(m.at).toLocaleString("en-GB", short)} · {m.channel}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{m.body}</p>
            </FadeIn>
          ))}
          {photo && (
            <div className={fromTenant}>
              <p className="flex items-center gap-2">
                {/^data:image\//i.test(photo) || /^https:\/\//i.test(photo) ? (
                  <a href={photo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-brand-strong">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="" className="h-14 w-14 rounded object-cover ring-1 ring-slate-200" />
                    <span className="underline">tenant photo</span>
                  </a>
                ) : (
                  <span className="text-slate-500">Photo reference (not downloaded): {photo}</span>
                )}
                {j.photoObservation ? <span className="text-slate-600">· {j.photoObservation}</span> : null}
              </p>
            </div>
          )}
          {rows.length > 0 && (
            <FadeIn delay={0.1} className={fromVelo}>
              <h3 className={who}>Velo · fact checks</h3>
              <ul className="mt-1 grid gap-0.5">
                {rows.map((c) => (
                  <li key={c.id}>
                    {mark(c.status)} {c.label}: <span className="text-slate-600">{c.detail}</span>{" "}
                    <span className="text-slate-500">— {c.sourceUrl ? <a className="underline" href={c.sourceUrl} target="_blank" rel="noreferrer">{plainSource(c.source)}</a> : plainSource(c.source)}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          )}
          <FadeIn delay={0.16} className={fromVelo}>
            <h3 className={who}>Velo · why {j.priority.priority}?</h3>
            <ul className="ml-4 mt-1 list-disc">
              {j.priority.firedRules.map((r) => (
                <li key={r.id} className="mt-0.5">
                  {r.label} → {r.effect}{" "}
                  <span className="text-slate-500">[{r.kind}] {r.sourceUrl ? <a className="underline" href={r.sourceUrl} target="_blank" rel="noreferrer">{plainSource(r.source)}</a> : plainSource(r.source)}</span>
                  {r.quote && <blockquote className="mt-0.5 border-l-2 border-sky-200 pl-2 italic text-slate-600">“{r.quote}”</blockquote>}
                </li>
              ))}
              {gasCert && (
                <li className="mt-0.5">
                  {gasCert.detail}{" "}
                  <span className="text-slate-500">[partner-data] {gasCert.sourceUrl ? <a className="underline" href={gasCert.sourceUrl} target="_blank" rel="noreferrer">{gasCert.source}</a> : gasCert.source}</span>
                </li>
              )}
            </ul>
            {j.proposal.by === "grok" && (
              <p className="mt-1 text-xs text-slate-500">
                Proposed by Grok{j.proposal.model ? ` (${j.proposal.model})` : ""}{j.proposal.confidence != null ? ` · confidence ${Math.round(j.proposal.confidence * 100)}%` : ""}. Proposal only — priority and checks are decided by code.
                {j.proposal.followUpQuestion ? ` Follow-up: ${j.proposal.followUpQuestion}` : ""}
              </p>
            )}
            {j.proposal.by === "fallback" && <p className="mt-1 text-xs text-slate-500">Keyword fallback — Grok was not used for this proposal. Priority and checks are decided by code.</p>}
            {dwelly && <p className="mt-1 text-xs text-slate-500">Synthetic Dwelly hackathon case; ZZ postcode; original thread was not WhatsApp.</p>}
          </FadeIn>
          {j.status === "booked" && slot && (
            <p className={`${note} flex flex-wrap items-center justify-center gap-2 font-semibold text-green-700`}>
              <span>✅ Booked: {op?.name}, {new Date(slot.start).toLocaleString("en-GB", short)}</span>
              <Link href={`/jobs/${j.id}/complete`} className="text-brand-strong underline">Complete job</Link>
            </p>
          )}
          {j.status === "completed" && (
            <p className={note}><Link href={`/jobs/${j.id}/complete`} className="text-brand-strong underline">View completion record</Link></p>
          )}
          <div className={note}>
            <TimeSavedLine job={j} now={new Date(now)} />
          </div>
          {history.length > 0 && (
            <div className="mt-1">
              <h3 className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Unit history ({history.length})</h3>
              <ul className="mt-1 space-y-1">
                {history.map((w) => (
                  <VerifiedHistory key={w.id} work={w} />
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-6">
      <div className="vf-dash-bg" aria-hidden />
      <JourneyStrip />
      <section className="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2 xl:grid-cols-3">
          {stats.map((k, i) => (
            <FadeIn key={k.label} delay={i * 0.04}>
              <a href={`#show-${k.show}`} className="vf-glass block p-3 focus-visible:outline-2 focus-visible:outline-brand">
                <p className={`text-3xl font-bold tabular-nums ${k.tone}`}><CountUp value={k.value} /></p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
              </a>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.1} className="vf-glass p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Needs attention ({attention.length})</h2>
          {attention.length === 0 && <p className="mt-1 text-sm text-slate-500">Nothing waiting on the desk.</p>}
          <ul className="mt-1 divide-y divide-line">
            {attention.map((j) => {
              const { unit, building } = where(j);
              const st = statusText(j);
              return (
                <li key={j.id}>
                  <a href={`#job-${j.id}`} className="flex min-h-11 flex-wrap items-center gap-2 rounded py-1.5 text-sm hover:bg-brand-tint">
                    <PriorityBadge p={j.priority.priority} />
                    <span className="font-medium">{j.proposal.issue.replace(/_/g, " ")}</span>
                    <span className="text-slate-500">· {building?.name} · {unit?.label}</span>
                    <span className={`ml-auto text-xs font-semibold ${st.cls}`}>{st.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </FadeIn>
      </section>
      <WorkQueue items={items} />
      <PortfolioMapClient data={mapData} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn>
          <TimeSavedWeekTile jobs={s.jobs} now={new Date(now)} />
        </FadeIn>
        <FadeIn delay={0.06}>
          <SatisfactionTile summary={summariseRatings(s.jobs)} />
        </FadeIn>
      </div>
      <FadeIn delay={0.1}>
        <CortileLive data={cortile} />
      </FadeIn>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buildings</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {s.buildings.map((b) => {
            const units = s.units.filter((u) => u.buildingId === b.id);
            const mine = jobs.filter((j) => units.some((u) => u.id === j.unitId));
            const boilers = s.assets.filter((a) => a.buildingId === b.id && a.type === "boiler");
            return (
              <FadeIn key={b.id} className="vf-glass p-4">
                <h3 className="font-semibold">{b.name}</h3>
                {b.label && <span className={`${chip} bg-sky-100 text-sky-800`}>{b.label}</span>}
                <p className="mt-1 text-sm text-slate-600">
                  {[buildingKind(b.type), b.yearBuilt ? `built ${b.yearBuilt}` : null, `${b.tenure} let`, b.area, b.warrantyUntil ? `warranty to ${b.warrantyUntil}` : null].filter(Boolean).join(" · ")}
                </p>
                <ul className="mt-2 text-xs text-slate-600">
                  {boilers.map((a) => (
                    <li key={a.id}>Boiler {a.make}, {new Date().getFullYear() - a.yearInstalled}y old · Gas Safe due {a.gasSafeNextDue}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs ({mine.length})</p>
                {mine.length === 0 && <p className="text-sm text-slate-500">No jobs.</p>}
                <ul className="mt-1 grid gap-1">
                  {mine.map((j) => (
                    <li key={j.id}>
                      <a href={`#job-${j.id}`} className="flex min-h-9 items-center gap-2 rounded text-sm hover:bg-brand-tint">
                        <PriorityBadge p={j.priority.priority} />
                        <span className="truncate">{j.proposal.issue.replace(/_/g, " ")}</span>
                        <span className={`ml-auto shrink-0 text-xs ${statusText(j).cls}`}>{j.status}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {b.id.startsWith("bld_") && (
                  <p className="mt-2 text-sm">
                    <Link className="font-medium text-brand-strong underline" href={`/buildings/${b.id}`}>Asset view</Link>
                  </p>
                )}
              </FadeIn>
            );
          })}
        </div>
      </section>
    </div>
  );
}
