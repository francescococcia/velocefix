import { NextResponse } from "next/server";
import { APP } from "@/config/app";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({ ok: true, app: APP.name, at: new Date().toISOString() });
}
