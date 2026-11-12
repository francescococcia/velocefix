import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { opsFeed } from "@/lib/ops";
import { grokOpsAnswer } from "@/lib/grok";

export const dynamic = "force-dynamic";

// shortcut: one counter per server instance, reset on cold start; move to a shared store if this outlives the demo
const LIMIT_PER_MINUTE = 20;
let windowStart = 0;
let count = 0;

type Feed = ReturnType<typeof opsFeed>;
type FeedJob = Feed["jobs"][number];

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function line(j: FeedJob) {
  const bits = [`${j.priority} ${j.issue.replace(/_/g, " ")}`, `${j.buildingName ?? "unknown building"}, ${j.unitLabel ?? "unknown unit"}`];
  if (j.status === "completed") bits.push("completed");
  else if (j.bookedSlot) bits.push(`booked ${when(j.bookedSlot.start)} with ${j.bookedSlot.operatorName ?? "a contractor"}`);
  else bits.push(j.sla.overdue ? `overdue since ${when(j.sla.dueAt)}` : `due ${when(j.sla.dueAt)}`);
  return `• ${bits.join(" — ")} (${j.id})`;
}

/** Answer from the feed without a model. Used when Grok is not connected or fails. */
function computed(question: string, feed: Feed) {
  const q = question.toLowerCase();
  const names = [...new Set(feed.jobs.map((j) => j.buildingName).filter((n): n is string => Boolean(n)))];
  const building = names.find((n) => q.includes(n.toLowerCase().split(" ")[0]!));
  const pool = building ? feed.jobs.filter((j) => j.buildingName === building) : feed.jobs;
  const open = pool.filter((j) => j.status !== "completed");
  const where = building ? ` at ${building}` : "";
  const list = (title: string, jobs: FeedJob[], none: string) =>
    jobs.length === 0 ? none : [`${title} (${jobs.length}):`, ...jobs.slice(0, 6).map(line), ...(jobs.length > 6 ? [`and ${jobs.length - 6} more`] : [])].join("\n");

  if (/overdue|late|breach/.test(q)) return list(`Overdue${where}`, open.filter((j) => j.sla.overdue), `Nothing is overdue${where}.`);
  if (/\bp1\b/.test(q)) return list(`Open P1${where}`, open.filter((j) => j.priority === "P1"), `No open P1 jobs${where}.`);
  if (/urgent|high|priority|\bp2\b/.test(q)) return list(`High priority (P1 and P2)${where}`, open.filter((j) => j.priority <= "P2"), `No open P1 or P2 jobs${where}.`);
  if (/book|visit|appointment|slot/.test(q)) return list(`Booked${where}`, open.filter((j) => j.bookedSlot), `Nothing is booked${where}.`);
  if (/complet|done|finished|closed/.test(q)) return list(`Completed${where}`, pool.filter((j) => j.status === "completed"), `Nothing completed${where} yet.`);
  if (building) return list(`Open jobs at ${building}`, open, `No open jobs at ${building}.`);
  const n = (f: (j: FeedJob) => unknown) => open.filter(f).length;
  return `${open.length} open job${open.length === 1 ? "" : "s"}: ${n((j) => j.sla.overdue)} overdue, ${n((j) => j.priority <= "P2")} high priority, ${n((j) => j.bookedSlot)} booked. ${pool.length - open.length} completed.`;
}

export async function POST(req: Request) {
  let question = "";
  try {
    const body = (await req.json()) as { question?: unknown };
    if (typeof body?.question === "string") question = body.question.trim();
  } catch {
    // fall through to the 400 below
  }
  if (!question || question.length > 300) {
    return NextResponse.json({ error: "Ask a question of up to 300 characters." }, { status: 400 });
  }

  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    count = 0;
  }
  if (++count > LIMIT_PER_MINUTE) {
    return NextResponse.json({ error: "Too many questions in a minute. Try again shortly." }, { status: 429 });
  }

  const feed = opsFeed(getStore(), {});
  const grok = await grokOpsAnswer(question, feed);
  if (grok) return NextResponse.json({ answer: grok.answer, by: "grok", model: grok.model });
  return NextResponse.json({ answer: computed(question, feed), by: "fallback" });
}
