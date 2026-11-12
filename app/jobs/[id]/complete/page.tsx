import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { WORK_DONE } from "@/lib/complete";
import { VerifiedHistory } from "@/components/VerifiedHistory";
import { PriorityBadge } from "@/components/PriorityBadge";

export const dynamic = "force-dynamic";

const field = "block w-full rounded-lg border border-slate-300 bg-white p-3 text-base";
const label = "block text-sm font-semibold text-slate-700 mb-1";

export default async function CompleteJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const s = getStore();
  const job = s.jobs.find((j) => j.id === id);
  if (!job) notFound();
  const unit = s.units.find((u) => u.id === job.unitId);
  const building = unit ? s.buildings.find((b) => b.id === unit.buildingId) : undefined;
  const op = job.operatorId ? s.operators.find((o) => o.id === job.operatorId) : undefined;
  const work = s.works.find((w) => w.id === `w-complete-${job.id}`);
  const notice = s.notices.find((n) => n.jobId === job.id);
  const done = job.status === "completed" && work && notice;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-sm"><Link href="/" className="underline">← Dashboard</Link></p>
      <h1 className="text-2xl font-semibold">Complete job</h1>
      <section className="rounded-lg bg-white p-4 shadow text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge p={job.priority.priority} />
          <span className="font-medium">{job.proposal.issue.replace(/_/g, " ")}</span>
          <span className="text-slate-500">· {building?.name} · {unit?.label}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Ref {job.id} · {job.status}{op ? ` · assigned ${op.name}` : ""}</p>
      </section>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      {done && work && notice ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Verified history</h2>
          <ul><VerifiedHistory work={work} /></ul>
          <section className="rounded-lg bg-white p-4 shadow space-y-3">
            <h2 className="text-lg font-semibold">Tenant notice</h2>
            <p className="text-xs text-amber-800">Draft only. The agency must approve send. This is never sent automatically.</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">{notice.body}</pre>
            <button type="button" disabled className="w-full rounded-lg bg-slate-300 px-4 py-3 text-base font-semibold text-slate-600 cursor-not-allowed">
              Draft, agency approves send
            </button>
          </section>
        </div>
      ) : job.status !== "booked" ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Only a booked job can be completed from this form. Current status: {job.status}.</p>
      ) : (
        <form action={`/api/jobs/${job.id}/complete`} method="post" className="space-y-4 rounded-lg bg-white p-4 shadow">
          <div>
            <label className={label} htmlFor="workDone">Work done</label>
            <select id="workDone" name="workDone" required defaultValue="repaired" className={field}>
              {WORK_DONE.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
            <textarea name="workNote" rows={2} placeholder="Short note (optional)" className={`${field} mt-2`} />
          </div>
          <div>
            <label className={label} htmlFor="parts">Parts replaced</label>
            <input id="parts" name="parts" className={field} placeholder="e.g. thermostat, or none" />
          </div>
          <div>
            <label className={label} htmlFor="cause">Root cause</label>
            <textarea id="cause" name="cause" required rows={2} className={field} placeholder="What caused the fault?" />
          </div>
          <fieldset>
            <legend className={label}>Follow-up needed</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 p-3 text-base">
                <input type="radio" name="followUpNeeded" value="no" defaultChecked className="h-5 w-5" /> No
              </label>
              <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 p-3 text-base">
                <input type="radio" name="followUpNeeded" value="yes" className="h-5 w-5" /> Yes
              </label>
            </div>
            <input name="followUp" className={`${field} mt-2`} placeholder="Follow-up note (if yes)" />
          </fieldset>
          <div>
            <label className={label} htmlFor="safetyObservation">Safety observation</label>
            <textarea id="safetyObservation" name="safetyObservation" rows={2} className={field} placeholder="Optional" />
          </div>
          <div>
            <label className={label} htmlFor="photoUrl">Photo URL (optional, reference only — not downloaded)</label>
            <input id="photoUrl" name="photoUrl" type="url" className={field} placeholder="https://" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="operatorName">Operator name</label>
              <input id="operatorName" name="operatorName" required className={field} defaultValue={op?.name ?? ""} />
            </div>
            <div>
              <label className={label} htmlFor="operatorTrade">Trade</label>
              <select id="operatorTrade" name="operatorTrade" className={field} defaultValue={op?.trade ?? job.proposal.trade}>
                <option value="plumbing_heating">Plumbing / heating</option>
                <option value="electrical">Electrical</option>
                <option value="flooring_general">Flooring / general</option>
                <option value="locksmith">Locksmith</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full rounded-lg bg-teal-700 px-4 py-3 text-base font-semibold text-white">Save verified record</button>
        </form>
      )}
    </div>
  );
}
