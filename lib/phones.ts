// In-memory last-seen destination for outbound WhatsApp. Never written to the store or disk.

import { hashPhone, normalisePhone } from "./privacy";

const g = globalThis as unknown as { __velocefixLastPhone?: Map<string, string> };

function map() {
  if (!g.__velocefixLastPhone) g.__velocefixLastPhone = new Map();
  return g.__velocefixLastPhone;
}

/** Remember a number we already received on inbound (hash key only in the map key). */
export function rememberInboundPhone(rawFrom: string) {
  const n = normalisePhone(rawFrom);
  if (!/^\+\d{7,15}$/.test(n)) return;
  map().set(hashPhone(n), n);
}

/** Look up a destination for this phone hash, or for the tenant's unit via DEMO_PHONE_MAP. */
export function outboundNumberFor(opts: { phoneHash?: string; unitId?: string }): string | undefined {
  if (opts.phoneHash) {
    const hit = map().get(opts.phoneHash);
    if (hit) return hit;
  }
  const raw = process.env.DEMO_PHONE_MAP || "";
  for (const pair of raw.split(",")) {
    const [phone, unitId] = pair.split("=").map((s) => s?.trim());
    if (!phone || !unitId) continue;
    if (opts.unitId && unitId === opts.unitId) return normalisePhone(phone);
    if (opts.phoneHash && hashPhone(phone) === opts.phoneHash) return normalisePhone(phone);
  }
  return undefined;
}
