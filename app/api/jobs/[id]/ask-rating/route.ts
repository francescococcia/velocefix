import { NextResponse } from "next/server";
import { askTenantToRate } from "@/lib/rating";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await askTenantToRate(id);
  const isJson = (req.headers.get("content-type") || "").includes("application/json");

  if ("error" in result && result.error) {
    if (!isJson) {
      return NextResponse.redirect(
        new URL(`/jobs/${id}/complete?error=${encodeURIComponent(result.error)}`, req.url),
        303,
      );
    }
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (!isJson) return NextResponse.redirect(new URL(`/jobs/${id}/complete?asked=1`, req.url), 303);
  return NextResponse.json({
    ok: true,
    jobId: result.job?.id,
    sent: result.sent,
    sendError: result.sendError,
    body: result.body,
  });
}
