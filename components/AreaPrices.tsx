"use client";

import { useEffect, useState } from "react";
import type { AreaPrices as AreaPricesData } from "@/lib/areaPrices";

const LAND_REGISTRY_SOURCE = "Land Registry Price Paid (OGL)";
const LAND_REGISTRY_SPARQL = "https://landregistry.data.gov.uk/landregistry/query";

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function formatDay(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" });
}

export function AreaPrices({ district }: { district: string }) {
  const [data, setData] = useState<AreaPricesData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setFailed(false);
    fetch(`/api/area/prices?district=${encodeURIComponent(district)}`)
      .then(async (res) => {
        const body = (await res.json()) as AreaPricesData;
        if (cancelled) return;
        if (!body.available) setFailed(true);
        setData(body);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [district]);

  if (!data && !failed) {
    return <p className="text-sm text-slate-500">Looking up sale prices for {district}…</p>;
  }
  if (failed || !data?.available || data.medianGbp == null) {
    return <p className="text-sm text-slate-600">Area prices unavailable</p>;
  }

  return (
    <div className="text-sm">
      <p className="text-2xl font-semibold tabular-nums">{gbp(data.medianGbp)}</p>
      <p className="text-slate-600">
        Median sale price in postcode district {data.outcode}
        {data.saleCount != null ? ` · ${data.saleCount.toLocaleString("en-GB")} sales` : ""}
        {data.from && data.to ? ` · ${formatDay(data.from)}–${formatDay(data.to)}` : " · last 24 months"}
        {data.latestSaleOn ? ` · latest recorded ${formatDay(data.latestSaleOn)}` : ""}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Source:{" "}
        <a className="underline" href={data.queryUrl ?? LAND_REGISTRY_SPARQL} target="_blank" rel="noreferrer">
          {data.source ?? LAND_REGISTRY_SOURCE}
        </a>
      </p>
    </div>
  );
}
