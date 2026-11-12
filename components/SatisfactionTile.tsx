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

// Live ratings headline the tile; with none yet, the seeded ones do, captioned as seeded.
function shown(s: SatisfactionSummary): SatisfactionSummary | null {
  if (s.n > 0) return s;
  if (s.exampleN === 0) return null;
  return { ...s, n: s.exampleN, avgSpeed: s.exampleAvgSpeed, avgQuality: s.exampleAvgQuality, csatPercent: s.exampleCsatPercent };
}

// Seeded ratings stay out of the live score (lib/rating.ts); say so in one quiet line.
function SeededNote({ summary }: { summary: SatisfactionSummary }) {
  if (summary.exampleN === 0) return null;
  if (summary.n === 0) return <p className="mt-1 text-xs text-slate-500">From seeded demo ratings. No live tenant ratings yet.</p>;
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
  return (
    <section className="vf-glass p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tenant satisfaction</h2>
      {shown(summary) ? (
        <Figures {...shown(summary)!} />
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
        {shown(summary) ? (
          <Figures {...shown(summary)!} />
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
