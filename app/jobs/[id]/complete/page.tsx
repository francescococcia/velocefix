import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { WORK_DONE } from "@/lib/complete";
import { VerifiedHistory } from "@/components/VerifiedHistory";
import { PriorityBadge } from "@/components/PriorityBadge";
import { RatingBadge } from "@/components/RatingBadge";
import { FadeIn, MotionButton } from "@/components/Motion";
import { ratingRequestBody } from "@/lib/twilio";

export const dynamic = "force-dynamic";

const field = "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500 aria-[invalid=true]:border-red-600";
const label = "mb-1 block text-sm font-semibold text-slate-800";
const legend = "text-base font-semibold text-slate-900";
const optional = <span className="font-normal text-slate-600"> (optional)</span>;
// A real radio inside each label keeps arrow-key and screen-reader behaviour; the label is the tap target.
const choice =
  "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium text-slate-800 hover:bg-brand-tint has-[:checked]:border-brand has-[:checked]:bg-brand-tint has-[:checked]:font-semibold has-[:checked]:text-brand-strong has-[:checked]:ring-1 has-[:checked]:ring-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";
const when: Intl.DateTimeFormatOptions = { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" };

export default async function CompleteJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; asked?: string }>;
}) {
  const { id } = await params;
  const { error, asked } = await searchParams;
  const s = getStore();
  const job = s.jobs.find((j) => j.id === id);
  if (!job) notFound();
  const unit = s.units.find((u) => u.id === job.unitId);
  const building = unit ? s.buildings.find((b) => b.id === unit.buildingId) : undefined;
  const op = job.operatorId ? s.operators.find((o) => o.id === job.operatorId) : undefined;
  const slot = op?.slots.find((x) => x.id === job.slotId);
  const work = s.works.find((w) => w.id === `w-complete-${job.id}`);
  const notice = s.notices.find((n) => n.jobId === job.id);
  const done = job.status === "completed" && work && notice;
  // The route sends back one message; point it at the field it is about.
  const bad = error?.startsWith("Root cause") ? "cause" : error?.startsWith("Operator name") ? "operatorName" : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm"><Link href="/" className="inline-flex min-h-11 items-center underline">← Dashboard</Link></p>
      <h1 className="text-2xl font-semibold">{done ? "Completion record" : "Complete job"}</h1>

      <div className="grid gap-4 lg:grid-cols-[17rem_1fr] lg:items-start">
        <section className="vf-card p-4 text-sm lg:sticky lg:top-4" aria-label="Job">
          <p className="flex flex-wrap items-center gap-2">
            <PriorityBadge p={job.priority.priority} />
            <span className="text-base font-semibold text-slate-900">{job.proposal.issue.replace(/_/g, " ")}</span>
          </p>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="text-xs text-slate-600">Where</dt>
              <dd className="text-slate-900">{building?.name} · {unit?.label}</dd>
            </div>
            {op && (
              <div>
                <dt className="text-xs text-slate-600">Assigned</dt>
                <dd className="text-slate-900">{op.name}</dd>
              </div>
            )}
            {slot && (
              <div>
                <dt className="text-xs text-slate-600">Visit</dt>
                <dd className="text-slate-900">{new Date(slot.start).toLocaleString("en-GB", when)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-600">Reference</dt>
              <dd className="text-slate-900">{job.id} · {job.status.replace(/_/g, " ")}</dd>
            </div>
          </dl>
          <div className="mt-2"><RatingBadge job={job} /></div>
        </section>

        <div className="min-w-0 space-y-4">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">
              {error}{bad ? " The field is marked below." : ""}
            </p>
          )}

          {done && work && notice ? (
            <FadeIn className="space-y-4">
              <section aria-labelledby="record-title">
                <h2 id="record-title" className="text-lg font-semibold">Verified history</h2>
                <ul><VerifiedHistory work={work} /></ul>
              </section>
              <div className="grid gap-4 md:grid-cols-2 md:items-start">
                <section className="vf-card space-y-3 p-4">
                  <h2 className="text-lg font-semibold">Tenant notice</h2>
                  <p className="text-sm text-amber-900">Draft only. The agency must approve send. This is never sent automatically.</p>
                  <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-900 ring-1 ring-slate-200">{notice.body}</p>
                  <button type="button" disabled className="min-h-11 w-full cursor-not-allowed rounded-lg bg-slate-300 px-4 py-3 text-base font-semibold text-slate-600">
                    Draft, agency approves send
                  </button>
                </section>
                <section className="vf-card space-y-3 p-4">
                  <h2 className="text-lg font-semibold">Tenant satisfaction</h2>
                  {job.rating ? (
                    <p className="text-sm text-slate-700">
                      Rated speed {job.rating.speed}/5 and fix quality {job.rating.quality}/5.
                    </p>
                  ) : (
                    <>
                      {asked && (
                        <p className="rounded-lg bg-brand-tint p-3 text-sm text-brand-strong">
                          Rating request prepared{job.ratingAsk?.sent ? " and sent on WhatsApp." : "."}
                          {job.ratingAsk?.sendError ? ` ${job.ratingAsk.sendError}` : ""}
                          {" "}The tenant can reply in WhatsApp or Sim with two scores, for example 5 4.
                        </p>
                      )}
                      {job.ratingAsk && !asked && (
                        <p className="text-sm text-slate-600">
                          Last asked {job.ratingAsk.sent ? "and sent on WhatsApp" : "— WhatsApp not sent"}
                          {job.ratingAsk.sendError ? `: ${job.ratingAsk.sendError}` : "."}
                          {job.ratingAsk.pending ? " Waiting for the tenant to reply." : ""}
                        </p>
                      )}
                      <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-900 ring-1 ring-slate-200">{ratingRequestBody(job.id, job.proposal.issue)}</p>
                      <form action={`/api/jobs/${job.id}/ask-rating`} method="post">
                        <MotionButton type="submit" className="min-h-11 w-full rounded-lg bg-brand px-4 py-3 text-base font-semibold text-white">
                          {job.ratingAsk?.pending ? "Ask tenant to rate again" : "Ask tenant to rate"}
                        </MotionButton>
                      </form>
                      <p className="text-xs text-slate-600">This message is only sent when you press the button. It is never sent automatically on completion.</p>
                    </>
                  )}
                </section>
              </div>
            </FadeIn>
          ) : job.status !== "booked" ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Only a booked job can be completed from this form. Current status: {job.status}.</p>
          ) : (
            <form action={`/api/jobs/${job.id}/complete`} method="post" className="vf-card space-y-5 p-4">
              <fieldset className="space-y-3">
                <legend className={legend}>What was done</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {WORK_DONE.map((w, i) => (
                    <label key={w.id} className={choice}>
                      <input type="radio" name="workDone" value={w.id} defaultChecked={i === 0} required className="sr-only" />
                      {w.label}
                    </label>
                  ))}
                </div>
                <div>
                  <label className={label} htmlFor="workNote">Short note{optional}</label>
                  <textarea id="workNote" name="workNote" rows={2} className={field} />
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t border-slate-200 pt-4">
                <legend className={legend}>Cause and parts</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="cause">Root cause</label>
                    <textarea
                      id="cause"
                      name="cause"
                      required
                      rows={2}
                      className={field}
                      placeholder="What caused the fault?"
                      aria-invalid={bad === "cause" || undefined}
                      autoFocus={bad === "cause"}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="parts">Parts replaced{optional}</label>
                    <input id="parts" name="parts" className={field} placeholder="e.g. thermostat, or none" />
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t border-slate-200 pt-4">
                <legend className={legend}>Follow-up and safety</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div role="radiogroup" aria-labelledby="follow-label">
                    <p id="follow-label" className={label}>Follow-up needed</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={choice}>
                        <input type="radio" name="followUpNeeded" value="no" defaultChecked className="sr-only" /> No
                      </label>
                      <label className={choice}>
                        <input type="radio" name="followUpNeeded" value="yes" className="sr-only" /> Yes
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor="followUp">Follow-up note<span className="font-normal text-slate-600"> (if yes)</span></label>
                    <input id="followUp" name="followUp" className={field} />
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="safetyObservation">Safety observation{optional}</label>
                  <textarea id="safetyObservation" name="safetyObservation" rows={2} className={field} />
                </div>
                <div>
                  <label className={label} htmlFor="photoUrl">Photo link{optional}<span className="font-normal text-slate-600"> — reference only, not downloaded</span></label>
                  <input id="photoUrl" name="photoUrl" type="url" className={field} placeholder="https://" />
                </div>
              </fieldset>

              <fieldset className="space-y-3 border-t border-slate-200 pt-4">
                <legend className={legend}>Signed off by</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="operatorName">Operator name</label>
                    <input
                      id="operatorName"
                      name="operatorName"
                      required
                      className={field}
                      defaultValue={op?.name ?? ""}
                      aria-invalid={bad === "operatorName" || undefined}
                      autoFocus={bad === "operatorName"}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor="operatorTrade">Trade</label>
                    <select id="operatorTrade" name="operatorTrade" className={`${field} min-h-11`} defaultValue={op?.trade ?? job.proposal.trade}>
                      <option value="plumbing_heating">Plumbing / heating</option>
                      <option value="electrical">Electrical</option>
                      <option value="flooring_general">Flooring / general</option>
                      <option value="locksmith">Locksmith</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <div className="border-t border-slate-200 pt-4">
                <MotionButton type="submit" className="min-h-12 w-full rounded-lg bg-brand px-4 py-3 text-base font-semibold text-white hover:bg-brand-strong">Save verified record</MotionButton>
                <p className="mt-2 text-xs text-slate-600">Saves to the unit history and drafts the tenant notice. Nothing is sent automatically.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
