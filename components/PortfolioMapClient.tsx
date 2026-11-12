"use client";

import nextDynamic from "next/dynamic";
import type { MapData } from "@/lib/mapData";

const PortfolioMap = nextDynamic(() => import("./PortfolioMap"), {
  ssr: false,
  loading: () => (
    <section className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-sm text-slate-500 sm:h-[30rem]">
      Loading portfolio map…
    </section>
  ),
});

export function PortfolioMapClient({ data }: { data: MapData }) {
  return <PortfolioMap data={data} />;
}
