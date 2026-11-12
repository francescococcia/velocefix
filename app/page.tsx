import { getStore } from "@/lib/store";
import { dueAt } from "@/lib/priority";
import { PriorityBadge } from "@/components/PriorityBadge";
import { CortileLive } from "@/components/CortileLive";
import { cortileGasCertCheck, loadCortileDemo } from "@/lib/cortile";
import { isGasWork } from "@/lib/checks";
import { TimeSavedLine, TimeSavedWeekTile } from "@/components/TimeSaved";
import { VerifiedHistory } from "@/components/VerifiedHistory";
import Link from "next/link";

export const dynamic = "force-dynamic";

function buildingKind(type?: string) {
  if (type === "period") return "Period house";
  if (type === "new_build") return "New build";
  return null;
}

export default async function Dashboard() {
  const s = getStore();
  const now = Date.now();
  const cortile = await loadCortileDemo();
  const gorseGas = cortile.buildings.find((b) => b.id === "bld_0006")?.gasSafety;
  const cortileCert = cortileGasCertCheck(gorseGas);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Agency desk — portfolio</h1>
      <TimeSavedWeekTile jobs={s.jobs} now={new Date(now)} />
      <CortileLive data={cortile} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {s.buildings.map((b) => {
          const units = s.units.filter((u) => u.buildingId === b.id);
          const jobs = s.jobs.filter((j) => units.some((u) => u.id === j.unitId));
          const boilers = s.assets.filter((a) => a.buildingId === b.id && a.type === "boiler");
          const kind = buildingKind(b.type);
          return (
            <section key={b.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-2">
                <h2 className="text-lg font-semibold">{b.name}</h2>
                {b.label && <span className="mt-1 shrink-0 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">{b.label}</span>}
              </div>
              <p className="text-sm text-slate-600">
                {[kind, b.yearBuilt ? `built ${b.yearBuilt}` : null, `${b.tenure} let`, b.area, b.warrantyUntil ? `warranty to ${b.warrantyUntil}` : null].filter(Boolean).join(" · ")}
              </p>
              <ul className="text-xs text-slate-600 mt-2">
                {boilers.map((a) => (
                  <li key={a.id}>Boiler {a.make}, {new Date().getFullYear() - a.yearInstalled}y old · Gas Safe due {a.gasSafeNextDue}</li>
                ))}
              </ul>
              <h3 className="mt-3 text-sm font-semibold">Jobs ({jobs.length})</h3>
              {jobs.length === 0 && <p className="text-sm text-slate-500">No jobs.</p>}
              <ul className="divide-y">
                {jobs.map((j) => {
                  const due = dueAt(j.createdAt, j.priority.clock.hours);
                  const overdue = j.status !== "completed" && j.priority.clock.hours > 0 && due.getTime() < now;
                  const unit = units.find((u) => u.id === j.unitId);
                  const dwelly = !!(j.source?.startsWith("Dwelly") || unit?.source?.startsWith("Dwelly"));
                  const history = s.works.filter((w) => w.unitId === j.unitId);
                  return (
                    <li key={j.id} className="py-2 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge p={j.priority.priority} />
                        <span className="font-medium">{j.proposal.issue.replace(/_/g, " ")}</span>
                        {dwelly && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-800">Dwelly</span>}
                        {j.source?.startsWith("Cortile") && <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">Cortile demo replay</span>}
                        <span className="text-slate-500">· {unit?.label} · {j.proposal.room}</span>
                        {j.proposal.by === "grok" && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800">Proposed by Grok{j.proposal.model ? ` · ${j.proposal.model}` : ""}</span>}
                        {j.proposal.by === "fallback" && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">Keyword fallback</span>}
                        <span className="ml-auto text-xs">{j.status}</span>
                      </div>
                      <div className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                        {overdue ? `OVERDUE by ${Math.round((now - due.getTime()) / 86400000)} days` : `Due ${due.toLocaleString("en-GB", { timeZone: "Europe/London" })}`} · {j.priority.clock.label}
                        {j.lastAgencyReplyAt === null ? " · no agency reply yet" : ""}
                      </div>
                      <TimeSavedLine job={j} now={new Date(now)} />
                      {j.messages.some((m) => m.mediaUrl) && (
                        <p className="text-xs text-slate-500">Photo reference (not downloaded): {j.messages.find((m) => m.mediaUrl)?.mediaUrl}</p>
                      )}
                      {j.status === "booked" && j.slotId && (() => {
                        const op = s.operators.find((o) => o.id === j.operatorId);
                        const slot = op?.slots.find((x) => x.id === j.slotId);
                        return (
                          <div className="text-xs text-green-700 font-semibold flex flex-wrap items-center gap-2">
                            <span>✅ Booked: {op?.name}, {slot && new Date(slot.start).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            <Link href={`/jobs/${j.id}/complete`} className="underline text-teal-800">Complete job</Link>
                          </div>
                        );
                      })()}
                      {j.status === "completed" && (
                        <div className="text-xs"><Link href={`/jobs/${j.id}/complete`} className="underline text-teal-800">View completion record</Link></div>
                      )}
                      {(() => {
                        const boiler = s.assets.find((a) => a.unitId === j.unitId && a.type === "boiler") ?? s.assets.find((a) => a.buildingId === unit?.buildingId && a.type === "boiler" && !a.unitId);
                        const extra = cortileCert && isGasWork(j.proposal.issue, boiler) ? [cortileCert] : [];
                        const rows = [...j.checks, ...extra.filter((c) => !j.checks.some((x) => x.id === c.id))];
                        if (rows.length === 0) return null;
                        const mark = (status: string) => status === "green" ? "🟢" : status === "amber" ? "🟠" : "🔴";
                        return (
                        <ul className="text-xs mt-1 grid gap-0.5">
                          {rows.map((c) => (
                            <li key={c.id}>{mark(c.status)} {c.label}: <span className="text-slate-600">{c.detail}</span> <span className="text-slate-400">— {c.sourceUrl ? <a className="underline" href={c.sourceUrl} target="_blank">{c.source}</a> : c.source}</span></li>
                          ))}
                        </ul>
                        );
                      })()}
                      <details className="text-xs mt-1">
                        <summary className="cursor-pointer text-slate-600">Why {j.priority.priority}?</summary>
                        <ul className="ml-4 list-disc">
                          {j.priority.firedRules.map((r) => (
                            <li key={r.id} className="mt-0.5">
                              {r.label} → {r.effect}{" "}
                              <span className="text-slate-500">[{r.kind}] {r.sourceUrl ? <a className="underline" href={r.sourceUrl} target="_blank">{r.source}</a> : r.source}</span>
                              {r.quote && <blockquote className="mt-0.5 border-l-2 border-sky-200 pl-2 text-slate-600 italic">“{r.quote}”</blockquote>}
                            </li>
                          ))}
                          {cortileCert && isGasWork(j.proposal.issue, s.assets.find((a) => a.unitId === j.unitId && a.type === "boiler") ?? s.assets.find((a) => a.buildingId === unit?.buildingId && a.type === "boiler" && !a.unitId)) && (
                            <li className="mt-0.5">
                              {cortileCert.detail}{" "}
                              <span className="text-slate-500">[partner-data] {cortileCert.sourceUrl ? <a className="underline" href={cortileCert.sourceUrl} target="_blank">{cortileCert.source}</a> : cortileCert.source}</span>
                            </li>
                          )}
                        </ul>
                        {j.proposal.by === "grok" && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Proposed by Grok{j.proposal.model ? ` (${j.proposal.model})` : ""}{j.proposal.confidence != null ? ` · confidence ${Math.round(j.proposal.confidence * 100)}%` : ""}. Proposal only — priority and checks are decided by code.
                            {j.proposal.followUpQuestion ? ` Follow-up: ${j.proposal.followUpQuestion}` : ""}
                          </p>
                        )}
                        {j.proposal.by === "fallback" && <p className="mt-1 text-[11px] text-slate-500">Keyword fallback — Grok was not used for this proposal. Priority and checks are decided by code.</p>}
                        {dwelly && <p className="mt-1 text-[11px] text-slate-500">Synthetic Dwelly hackathon case; ZZ postcode; original thread was not WhatsApp.</p>}
                      </details>
                      {history.length > 0 && (
                        <details className="text-xs mt-1">
                          <summary className="cursor-pointer text-slate-600">Unit history ({history.length})</summary>
                          <ul className="mt-1 space-y-1">
                            {history.map((w) => (
                              <VerifiedHistory key={w.id} work={w} />
                            ))}
                          </ul>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
