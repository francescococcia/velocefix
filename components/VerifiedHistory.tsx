import { formatLondon, workDoneLabel } from "@/lib/complete";
import type { Work } from "@/lib/types";

export function VerifiedHistory({ work }: { work: Work }) {
  if (!work.verified) {
    return (
      <li className="mt-0.5">
        {work.date} · {work.summary}{" "}
        <span className="text-slate-500">[{work.source}]</span>
        {work.quote && <blockquote className="mt-0.5 border-l-2 border-sky-200 pl-2 text-slate-600 italic">“{work.quote}”</blockquote>}
      </li>
    );
  }
  return (
    <li className="mt-2 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Verified history</span>
        <span className="font-semibold">{workDoneLabel(work.workDone ?? "")}</span>
        {work.completedAt && <span className="text-xs text-slate-500">{formatLondon(work.completedAt)} Europe/London</span>}
      </div>
      <dl className="mt-2 grid gap-1 text-xs text-slate-700">
        {work.workNote && <div><dt className="inline font-semibold">Note: </dt><dd className="inline">{work.workNote}</dd></div>}
        {work.parts && <div><dt className="inline font-semibold">Parts replaced: </dt><dd className="inline">{work.parts}</dd></div>}
        {work.cause && <div><dt className="inline font-semibold">Root cause: </dt><dd className="inline">{work.cause}</dd></div>}
        <div><dt className="inline font-semibold">Follow-up: </dt><dd className="inline">{work.followUpNeeded ? `Yes${work.followUp ? ` — ${work.followUp}` : ""}` : "No"}</dd></div>
        {work.safetyObservation && <div><dt className="inline font-semibold">Safety observation: </dt><dd className="inline">{work.safetyObservation}</dd></div>}
        {work.photoUrl && <div><dt className="inline font-semibold">Photo (reference, not downloaded): </dt><dd className="inline break-all">{work.photoUrl}</dd></div>}
        {work.operatorName && <div><dt className="inline font-semibold">Operator: </dt><dd className="inline">{work.operatorName}{work.operatorTrade ? ` · ${work.operatorTrade.replace(/_/g, " ")}` : ""}</dd></div>}
      </dl>
      <p className="mt-2 text-[11px] text-slate-500">{work.source}</p>
    </li>
  );
}
