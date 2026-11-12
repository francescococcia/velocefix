// Live area lookups. No API keys. Cached in memory. Fail soft.

export const POSTCODES_IO = "https://postcodes.io";
export const LAND_REGISTRY_SPARQL = "https://landregistry.data.gov.uk/landregistry/query";
export const LAND_REGISTRY_SOURCE = "Land Registry Price Paid (OGL)";

const OUTCODE_RE = /^[A-Z]{1,2}\d{1,2}[A-Z]?$/i;
const OUTCODE_TTL_MS = 60 * 60_000;
const PRICE_TTL_MS = 60 * 60_000;
const OUTCODE_TIMEOUT_MS = 4000;
const PRICE_TIMEOUT_MS = 20_000;

type CacheEntry = { at: number; data: unknown };
const g = globalThis as unknown as { __velocefixAreaCache?: Map<string, CacheEntry> };

function cacheMap() {
  if (!g.__velocefixAreaCache) g.__velocefixAreaCache = new Map();
  return g.__velocefixAreaCache;
}

function cacheGet<T>(key: string, ttl: number): T | undefined {
  const hit = cacheMap().get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.data as T;
  return undefined;
}

function cacheSet(key: string, data: unknown) {
  cacheMap().set(key, { at: Date.now(), data });
}

export function normaliseOutcode(raw: string): string | null {
  const v = raw.trim().toUpperCase();
  return OUTCODE_RE.test(v) ? v : null;
}

export interface OutcodeArea {
  outcode: string;
  adminDistricts: string[];
  country?: string;
  latitude?: number;
  longitude?: number;
  source: "postcodes.io";
}

export interface AreaPrices {
  available: boolean;
  outcode: string;
  medianGbp?: number;
  saleCount?: number;
  from?: string;
  to?: string;
  latestSaleOn?: string;
  source?: typeof LAND_REGISTRY_SOURCE;
  queryUrl?: string;
}

export async function fetchOutcodeArea(outcode: string): Promise<OutcodeArea | null> {
  const oc = normaliseOutcode(outcode);
  if (!oc) return null;
  const key = `outcode:v2:${oc}`;
  const cached = cacheGet<OutcodeArea | null>(key, OUTCODE_TTL_MS);
  if (cached !== undefined) return cached;

  let res: Response;
  try {
    res = await fetch(`${POSTCODES_IO}/outcodes/${encodeURIComponent(oc)}`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(OUTCODE_TIMEOUT_MS),
    });
  } catch {
    cacheSet(key, null);
    return null;
  }
  if (!res.ok) {
    cacheSet(key, null);
    return null;
  }
  let body: {
    status?: number;
    result?: { outcode?: string; admin_district?: string[]; country?: string[]; latitude?: number; longitude?: number };
  };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    cacheSet(key, null);
    return null;
  }
  const r = body.result;
  if (!r) {
    cacheSet(key, null);
    return null;
  }
  const districts = Array.isArray(r.admin_district) ? r.admin_district.filter(Boolean) : [];
  const country = Array.isArray(r.country) ? r.country[0] : undefined;
  const lat = typeof r.latitude === "number" ? r.latitude : undefined;
  const lon = typeof r.longitude === "number" ? r.longitude : undefined;
  const out: OutcodeArea = {
    outcode: r.outcode ?? oc,
    adminDistricts: districts,
    country,
    latitude: lat,
    longitude: lon,
    source: "postcodes.io",
  };
  cacheSet(key, out);
  return out;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export async function fetchLandRegistryMedian(outcode: string): Promise<AreaPrices> {
  const oc = normaliseOutcode(outcode);
  const unavailable = (code: string): AreaPrices => ({ available: false, outcode: code });
  if (!oc) return unavailable(outcode);

  const key = `lrppi:${oc}`;
  const cached = cacheGet<AreaPrices>(key, PRICE_TTL_MS);
  if (cached) return cached;

  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 2);
  const fromIso = isoDate(from);
  const toIso = isoDate(to);
  // Prefix + space so M4 does not match M40. SPARQL has no MEDIAN — we compute it.
  const prefix = `${oc} `;
  const query = `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX lrppi: <http://landregistry.data.gov.uk/def/ppi/>
PREFIX lrcommon: <http://landregistry.data.gov.uk/def/common/>
SELECT ?price ?date
WHERE {
  ?trans lrppi:pricePaid ?price ;
         lrppi:transactionDate ?date ;
         lrppi:propertyAddress ?addr .
  ?addr lrcommon:postcode ?pc .
  FILTER(STRSTARTS(UCASE(STR(?pc)), "${prefix}"))
  FILTER(?date >= "${fromIso}"^^xsd:date && ?date <= "${toIso}"^^xsd:date)
}
`.trim();

  let res: Response;
  try {
    res = await fetch(LAND_REGISTRY_SPARQL, {
      method: "POST",
      headers: {
        accept: "application/sparql-results+json",
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "VeloceFix-hackathon/0.1 (area view; OGL Price Paid)",
      },
      body: new URLSearchParams({ query }),
      cache: "no-store",
      signal: AbortSignal.timeout(PRICE_TIMEOUT_MS),
    });
  } catch {
    const miss = unavailable(oc);
    // Do not cache failures for long — skip cache so a retry can succeed.
    return miss;
  }
  if (!res.ok) return unavailable(oc);

  let body: { results?: { bindings?: Array<{ price?: { value?: string }; date?: { value?: string } }> } };
  try {
    body = (await res.json()) as typeof body;
  } catch {
    return unavailable(oc);
  }
  const bindings = body.results?.bindings ?? [];
  const prices: number[] = [];
  const dates: string[] = [];
  for (const b of bindings) {
    const price = Number(b.price?.value);
    const date = (b.date?.value ?? "").slice(0, 10);
    if (Number.isFinite(price) && date) {
      prices.push(price);
      dates.push(date);
    }
  }
  if (prices.length === 0) return unavailable(oc);

  const out: AreaPrices = {
    available: true,
    outcode: oc,
    medianGbp: median(prices),
    saleCount: prices.length,
    from: fromIso,
    to: toIso,
    latestSaleOn: dates.reduce((a, b) => (a > b ? a : b)),
    source: LAND_REGISTRY_SOURCE,
    queryUrl: LAND_REGISTRY_SPARQL,
  };
  cacheSet(key, out);
  return out;
}
