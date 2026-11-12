import fs from "fs";
import path from "path";
import seed from "../data/seed.json";
import type { StoreData, Tenant } from "./types";
import { hashPhone, normalisePhone } from "./privacy";

/**
 * JSON store. In-memory singleton, seeded from data/seed.json.
 * Locally (not Vercel, not tests) it also persists to .data/store.json so a
 * dev-server restart keeps state. On Vercel the filesystem is read-only, so
 * state lives in the memory of one serverless instance: it can reset on a cold
 * start and two instances may disagree. Use POST /api/admin/reset before the
 * demo. That is an honest limitation of the baseline, not a database.
 */
const g = globalThis as unknown as { __slotrightStore?: StoreData };
const FILE = path.join(process.cwd(), ".data", "store.json");

function persistEnabled() {
  return !process.env.VERCEL && process.env.NODE_ENV !== "test" && process.env.STORE_PERSIST !== "0";
}

export function freshSeed(): StoreData {
  return structuredClone(seed) as unknown as StoreData;
}

export function getStore(): StoreData {
  if (!g.__slotrightStore) {
    if (persistEnabled() && fs.existsSync(FILE)) {
      try {
        g.__slotrightStore = JSON.parse(fs.readFileSync(FILE, "utf8")) as StoreData;
      } catch {
        g.__slotrightStore = freshSeed();
      }
    } else {
      g.__slotrightStore = freshSeed();
    }
  }
  return g.__slotrightStore;
}

export function saveStore(): void {
  if (!persistEnabled() || !g.__slotrightStore) return;
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(g.__slotrightStore, null, 2));
  } catch {
    // read-only FS: stay in memory
  }
}

export function resetStore(): StoreData {
  g.__slotrightStore = freshSeed();
  saveStore();
  return g.__slotrightStore;
}

/** Replace the store (tests). */
export function setStore(data: StoreData) {
  g.__slotrightStore = data;
}

/**
 * Optional demo mapping kept in env only (never in git):
 * DEMO_PHONE_MAP="+447xxxxxxxxx=u-old-2,+447yyyyyyyyy=u-new-403"
 * Lets a real sandbox phone act as a seeded tenant.
 */
function demoMap(): Record<string, string> {
  const raw = process.env.DEMO_PHONE_MAP || "";
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [phone, unitId] = pair.split("=").map((s) => s?.trim());
    if (phone && unitId) out[hashPhone(phone)] = unitId;
  }
  return out;
}

export function findTenantByPhone(store: StoreData, rawFrom: string): Tenant | undefined {
  if (!normalisePhone(rawFrom).match(/^\+\d{7,15}$/)) return undefined;
  const h = hashPhone(rawFrom);
  const direct = store.tenants.find((t) => t.phoneHash === h);
  if (direct) return direct;
  const unitId = demoMap()[h];
  return unitId ? store.tenants.find((t) => t.unitId === unitId) : undefined;
}

export function unitContext(store: StoreData, unitId: string) {
  const unit = store.units.find((u) => u.id === unitId);
  const building = unit ? store.buildings.find((b) => b.id === unit.buildingId) : undefined;
  const tenant = store.tenants.find((t) => t.unitId === unitId);
  const assets = store.assets.filter((a) => a.unitId === unitId || (!a.unitId && a.buildingId === unit?.buildingId));
  const boiler = assets.find((a) => a.type === "boiler");
  const works = store.works.filter((w) => w.unitId === unitId);
  return { unit, building, tenant, assets, boiler, works };
}
