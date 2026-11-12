import type { SatisfactionSummary } from "@/lib/rating";
import { CountUp } from "./Motion";

function Figures({
  n,
  avgSpeed,
  avgQuality,
  csatPercent,
}: SatisfactionSummary) {
  if (n === 0) return null;
  return (
    <>
      <p className="text-2xl font-semibold tabular-nums">
        <CountUp value={avgSpeed ?? 0} decimals={1} suffix=" / 5" />
        <span className="mx-1 text-slate-500 font-normal">·</span>
        <CountUp value={avgQuality ?? 0} decimals={1} suffix=" / 5" />
      </p>
      <p className="text-sm text-slate-600">
        Avg speed · avg fix quality
        {csatPercent != null ? (
          <>
            {" "}
            · CSAT <CountUp value={csatPercent} decimals={0} suffix="%" className="font-semibold tabular-nums" />
          </>
        ) : null}
        {" "}(n={n})
      </p>
    </>
  );
}

// Seeded ratings stay out of the live score (lib/rating.ts); say so in one quiet line.
function SeededNote({ summary }: { summary: SatisfactionSummary }) {
  if (summary.exampleN === 0) return null;
  return (
    <p className="mt-1 text-xs text-slate-500">
      Plus {summary.exampleN} seeded rating{summary.exampleN === 1 ? "" : "s"}
      {summary.exampleAvgSpeed != null && summary.exampleAvgQuality != null
        ? ` (avg ${summary.exampleAvgSpeed.toFixed(1)} / ${summary.exampleAvgQuality.toFixed(1)})`
        : ""}
      , not included in the live score.
    </p>
  );
}

export function SatisfactionTile({ summary }: { summary: SatisfactionSummary }) {
  const live = summary.n > 0;
  return (
    <section className="vf-glass p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tenant satisfaction</h2>
      {live ? (
        <Figures {...summary} />
      ) : (
        <p className="mt-1 text-2xl font-semibold">No ratings yet</p>
      )}
      <p className="mt-1 text-xs text-slate-500">
        CSAT is the share of ratings whose average of speed and quality is 4 or 5. Scores come from tenants after the
        agency asks them to rate a completed job.
      </p>
      <SeededNote summary={summary} />
    </section>
  );
}

export function SatisfactionCard({ summary }: { summary: SatisfactionSummary }) {
  return (
    <section className="vf-glass p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tenant satisfaction</p>
      <div className="mt-1">
        {summary.n > 0 ? (
          <Figures {...summary} />
        ) : (
          <p className="text-2xl font-semibold">No ratings yet</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          VeloceFix jobs for this building. CSAT = share averaging 4 or 5 on speed and quality.
        </p>
        <SeededNote summary={summary} />
        <p className="mt-1 text-xs text-slate-500">— VeloceFix tenant ratings</p>
      </div>
    </section>
  );
}
