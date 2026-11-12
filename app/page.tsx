import { getStore } from "@/lib/store";
import { dueAt } from "@/lib/priority";
import { PriorityBadge } from "@/components/PriorityBadge";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const s = getStore();
  const now = Date.now();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Agency desk — portfolio</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {s.buildings.map((b) => {
          const units = s.units.filter((u) => u.buildingId === b.id);
          const jobs = s.jobs.filter((j) => units.some((u) => u.id === j.unitId));
          const boilers = s.assets.filter((a) => a.buildingId === b.id && a.type === "boiler");
          return (
            <section key={b.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold">{b.name}</h2>
              <p className="text-sm text-slate-600">{b.type === "period" ? "Period house" : "New build"} · built {b.yearBuilt} · {b.tenure} let · {b.area}{b.warrantyUntil ? ` · warranty to ${b.warrantyUntil}` : ""}</p>
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
                  return (
                    <li key={j.id} className="py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <PriorityBadge p={j.priority.priority} />
                        <span className="font-medium">{j.proposal.issue.replace(/_/g, " ")}</span>
                        <span className="text-slate-500">· {unit?.label} · {j.proposal.room}</span>
                        <span className="ml-auto text-xs">{j.status}</span>
                      </div>
                      <div className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                        {overdue ? `OVERDUE by ${Math.round((now - due.getTime()) / 86400000)} days` : `Due ${due.toLocaleString("en-GB", { timeZone: "Europe/London" })}`} · {j.priority.clock.label}
                        {j.lastAgencyReplyAt === null ? " · no agency reply yet" : ""}
                      </div>
                      <details className="text-xs mt-1">
                        <summary className="cursor-pointer text-slate-600">Why {j.priority.priority}?</summary>
                        <ul className="ml-4 list-disc">
                          {j.priority.firedRules.map((r) => (
                            <li key={r.id}>{r.label} → {r.effect} <span className="text-slate-500">[{r.kind}] {r.sourceUrl ? <a className="underline" href={r.sourceUrl} target="_blank">{r.source}</a> : r.source}</span></li>
                          ))}
                        </ul>
                      </details>
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
