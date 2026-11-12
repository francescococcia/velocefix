import type { SatisfactionSummary } from "@/lib/rating";
import { CountUp } from "./Motion";

function Figures({
  n,
  avgSpeed,
  avgQuality,
  csatPercent,
  example,
}: SatisfactionSummary & { example?: boolean }) {
  if (n === 0) return null;
  return (
    <>
      <p className={`text-2xl font-semibold tabular-nums ${example ? "text-slate-600" : ""}`}>
        <CountUp value={avgSpeed ?? 0} decimals={1} suffix=" / 5" />
        <span className="mx-1 text-slate-400 font-normal">·</span>
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
        {" "}(n={n}{example ? ", example data" : ""})
      </p>
    </>
  );
}

export function SatisfactionTile({ summary }: { summary: SatisfactionSummary }) {
  const live = summary.n > 0;
  return (
    <section className="rounded-lg bg-white p-4 shadow">
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
      {summary.exampleN > 0 && (
        <div className="mt-2 rounded border border-dashed border-slate-300 bg-slate-50 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Example data</p>
          <Figures
            n={summary.exampleN}
            avgSpeed={summary.exampleAvgSpeed}
            avgQuality={summary.exampleAvgQuality}
            csatPercent={summary.exampleCsatPercent}
            exampleN={0}
            exampleAvgSpeed={null}
            exampleAvgQuality={null}
            exampleCsatPercent={null}
            example
          />
        </div>
      )}
    </section>
  );
}

export function SatisfactionCard({ summary }: { summary: SatisfactionSummary }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow">
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
        {summary.exampleN > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Plus {summary.exampleN} example-data rating{summary.exampleN === 1 ? "" : "s"}
            {summary.exampleAvgSpeed != null && summary.exampleAvgQuality != null
              ? ` (avg ${summary.exampleAvgSpeed.toFixed(1)} / ${summary.exampleAvgQuality.toFixed(1)})`
              : ""}
            , not included in the live score.
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">— VeloceFix tenant ratings</p>
      </div>
    </section>
  );
}
