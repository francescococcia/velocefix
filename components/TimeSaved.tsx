import { APP } from "@/config/app";
import {
  compareTimeSaved,
  formatDuration,
  timeSavedLine,
  timeSavedThisWeek,
  type TimeSavedComparison,
} from "@/lib/timeSaved";
import type { Job } from "@/lib/types";

export function TimeSavedWeekTile({ jobs, now }: { jobs: Job[]; now: Date }) {
  const week = timeSavedThisWeek(jobs, now);
  const label = APP.timeSaved.estimateLabel;
  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Time saved this week ({label})
      </h2>
      <p className="mt-1 text-2xl font-semibold">
        {week.jobCount === 0 ? "0 hours" : formatDuration(week.savedMs)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {week.jobCount === 0
          ? `No VeloceFix offer or booking in the last ${week.windowHours / 24} days. The tile sums realised savings only, once a job has both an old-path date and a VeloceFix offer or booking timestamp.`
          : `From ${week.jobCount} job${week.jobCount === 1 ? "" : "s"} with a VeloceFix offer or booking in the last ${week.windowHours / 24} days.`}
        {" "}Old-path dates are from this job's own records (seed, Dwelly history, or Cortile). Not a published statistic.
      </p>
    </section>
  );
}

export function TimeSavedLine({ job, now }: { job: Job; now: Date }) {
  const c: TimeSavedComparison = compareTimeSaved(job, now);
  const label = APP.timeSaved.estimateLabel;
  return (
    <p className="mt-1 text-xs text-slate-600">
      Time saved ({label}): {timeSavedLine(c)}
      {c.oldSource ? <span className="text-slate-400"> — {c.oldSource}</span> : null}
    </p>
  );
}
