import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { opsFeed } from "@/lib/ops";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const priority = url.searchParams.get("priority") || undefined;
  const overdue = url.searchParams.get("overdue") === "true";
  if (priority && !["P1", "P2", "P3", "P4"].includes(priority)) {
    return NextResponse.json({ error: "priority must be P1, P2, P3 or P4" }, { status: 400 });
  }
  return NextResponse.json(opsFeed(getStore(), { priority, overdue }));
}
