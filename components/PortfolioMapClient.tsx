"use client";

import nextDynamic from "next/dynamic";
import type { MapData } from "@/lib/mapData";

const PortfolioMap = nextDynamic(() => import("./PortfolioMap"), {
  ssr: false,
  loading: () => (
    <section className="rounded-lg bg-white p-4 shadow">
      <h2 className="text-lg font-semibold">Portfolio map</h2>
      <p className="mt-2 text-sm text-slate-500">Loading map…</p>
    </section>
  ),
});

export function PortfolioMapClient({ data }: { data: MapData }) {
  return <PortfolioMap data={data} />;
}
