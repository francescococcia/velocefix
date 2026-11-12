import type { Job } from "@/lib/types";

export function RatingBadge({ job }: { job: Job }) {
  if (job.rating) {
    return (
      <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-strong">
        Rated {job.rating.speed}/{job.rating.quality}
      </span>
    );
  }
  if (job.ratingAsk?.pending) {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
        {job.ratingAsk.partialSpeed ? "Quality rating pending" : "Rating asked"}
      </span>
    );
  }
  return null;
}
