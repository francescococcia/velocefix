import { NextResponse } from "next/server";
import { handleInbound } from "@/lib/triage";
import { resetStore } from "@/lib/store";
import { resetAuthorized, resetDenied } from "@/lib/resetAuth";

export const dynamic = "force-dynamic";

// Fictional Ofcom drama numbers matching the seeded tenant hashes (example data).
const SIM_TENANTS = [
  { phone: "+447700900101", label: "Tenant A — Albion Terrace Flat 2 (old house, vulnerable flag)" },
  { phone: "+447700900102", label: "Tenant B — Albion Terrace Flat 1 (old house)" },
  { phone: "+447700900201", label: "Tenant C — Riverside Wharf 4.03 (new build, warranty)" },
  { phone: "+447700900422", label: "Tenant (Dwelly case 002) — Flat 3, 15 Willowdale Road (blocked toilet)" },
  { phone: "+447700900758", label: "Tenant (Dwelly case 037) — Flat 14, 44 Lamplight Quay (shower hose)" },
  { phone: "+447700900246", label: "Tenant (Dwelly case 022) — Flat 23, 155 Willowdale Road (front door lock)" },
  { phone: "+447700900103", label: "Tenant (Cortile tkt_000096 demo replay) — Gorse House unit 103 (heating)" },
  { phone: "+447700900999", label: "Unknown number" },
];

export async function GET() {
  return NextResponse.json({ tenants: SIM_TENANTS });
}

export async function POST(req: Request) {
  const { from, body, mediaUrl, reset, resetToken } = (await req.json()) as {
    from?: string; body?: string; mediaUrl?: string; reset?: boolean; resetToken?: string;
  };
  if (reset) {
    if (!resetAuthorized(req, resetToken)) return NextResponse.json(resetDenied(), { status: 401 });
    resetStore();
    return NextResponse.json({ reply: "Demo data reset to seed." });
  }
  if (!from || (!(body ?? "").trim() && !mediaUrl)) return NextResponse.json({ error: "from and a message or photo required" }, { status: 400 });
  const r = await handleInbound({ from, body: body ?? "", channel: "sim", mediaUrl });
  return NextResponse.json({ reply: r.reply, priority: r.job?.priority, proposal: r.job?.proposal, checks: r.job?.checks ?? [], status: r.job?.status });
}
