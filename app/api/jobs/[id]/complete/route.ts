import { NextResponse } from "next/server";
import { applyCompletion, parseCompletionInput } from "@/lib/complete";

export const dynamic = "force-dynamic";

async function readInput(req: Request) {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    const body = (await req.json()) as Record<string, unknown>;
    return { fields: body, form: false };
  }
  const fd = await req.formData();
  const fields: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) fields[k] = typeof v === "string" ? v : "";
  return { fields, form: true };
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { fields, form } = await readInput(req);
  const parsed = parseCompletionInput(fields);
  if (typeof parsed === "string") {
    if (form) return NextResponse.redirect(new URL(`/jobs/${id}/complete?error=${encodeURIComponent(parsed)}`, req.url), 303);
    return NextResponse.json({ error: parsed }, { status: 400 });
  }
  const result = applyCompletion(id, parsed);
  if ("error" in result && result.error) {
    if (form) return NextResponse.redirect(new URL(`/jobs/${id}/complete?error=${encodeURIComponent(result.error)}`, req.url), 303);
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (form) return NextResponse.redirect(new URL(`/jobs/${id}/complete`, req.url), 303);
  return NextResponse.json({
    ok: true,
    already: "already" in result && result.already,
    jobId: result.job?.id,
    status: result.job?.status,
    work: result.work,
    notice: result.notice,
  });
}
