import { APP } from "@/config/app";
import { getStore } from "@/lib/store";
import { compareTimeSaved, timeSavedLine } from "@/lib/timeSaved";
import { JourneyView } from "@/components/Journey";

export const dynamic = "force-dynamic";

const WALKTHROUGH_JOB = "j-cortile-000096";

export default function JourneyPage() {
  const job = getStore().jobs.find((j) => j.id === WALKTHROUGH_JOB);
  const comparison = job ? compareTimeSaved(job) : undefined;
  return (
    <>
      <div className="vf-dash-bg" aria-hidden />
      <JourneyView
        times={{
          estimateLabel: APP.timeSaved.estimateLabel,
          jobId: WALKTHROUGH_JOB,
          line: comparison ? timeSavedLine(comparison) : "old path: no case dates in config. VeloceFix: no offer or booking yet",
          source: comparison?.oldSource,
        }}
      />
    </>
  );
}
