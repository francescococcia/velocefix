import { NextResponse } from "next/server";
import { handleInbound } from "@/lib/triage";
import { resetStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Fictional Ofcom drama numbers matching the seeded tenant hashes (example data).
const SIM_TENANTS = [
  { phone: "+447700900101", label: "Tenant A — Albion Terrace Flat 2 (old house, vulnerable flag)" },
  { phone: "+447700900102", label: "Tenant B — Albion Terrace Flat 1 (old house)" },
  { phone: "+447700900201", label: "Tenant C — Riverside Wharf 4.03 (new build, warranty)" },
  { phone: "+447700900999", label: "Unknown number" },
];

export async function GET() {
  return NextResponse.json({ tenants: SIM_TENANTS });
}

export async function POST(req: Request) {
  const { from, body, reset } = (await req.json()) as { from?: string; body?: string; reset?: boolean };
  if (reset) { resetStore(); return NextResponse.json({ reply: "Demo data reset to seed." }); }
  if (!from || !body) return NextResponse.json({ error: "from and body required" }, { status: 400 });
  const r = await handleInbound({ from, body, channel: "sim" });
  return NextResponse.json({ reply: r.reply, priority: r.job?.priority, proposal: r.job?.proposal, checks: r.job?.checks ?? [], status: r.job?.status });
}
