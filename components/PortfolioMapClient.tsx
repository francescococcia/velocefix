"use client";

import nextDynamic from "next/dynamic";
import type { MapData } from "@/lib/mapData";

const PortfolioMap = nextDynamic(() => import("./PortfolioMap"), {
  ssr: false,
  loading: () => (
    <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2">
      <div className="flex h-[55vh] min-h-[22rem] items-center justify-center bg-slate-950 text-sm text-white/70 sm:h-[70vh]">
        Loading portfolio map…
      </div>
    </section>
  ),
});

export function PortfolioMapClient({ data }: { data: MapData }) {
  return <PortfolioMap data={data} />;
}
