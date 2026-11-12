import { NextResponse } from "next/server";
import { fetchLandRegistryMedian, normaliseOutcode } from "@/lib/areaPrices";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const district = new URL(req.url).searchParams.get("district") ?? "";
  if (!normaliseOutcode(district)) {
    return NextResponse.json({ available: false, outcode: district, error: "invalid_district" }, { status: 400 });
  }
  const prices = await fetchLandRegistryMedian(district);
  return NextResponse.json(prices);
}
