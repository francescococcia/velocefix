import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";
import { resetAuthorized, resetDenied } from "@/lib/resetAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!resetAuthorized(req, new URL(req.url).searchParams.get("token"))) {
    return NextResponse.json(resetDenied(), { status: 401 });
  }
  resetStore();
  return NextResponse.json({ reply: "Demo data reset to seed." });
}
