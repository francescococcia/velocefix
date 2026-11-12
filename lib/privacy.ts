import { createHash } from "crypto";

/** Normalise "whatsapp:+44 7700 900101" -> "+447700900101". */
export function normalisePhone(raw: string): string {
  const s = raw.replace(/^whatsapp:/i, "").replace(/[^\d+]/g, "");
  if (s.startsWith("00")) return "+" + s.slice(2);
  if (s.startsWith("0")) return "+44" + s.slice(1);
  return s.startsWith("+") ? s : "+" + s;
}

/**
 * sha256 of the E.164 number. Honest limit: an unsalted phone hash can be
 * brute-forced; a production build should use an HMAC with a server secret.
 * The raw number is never stored or logged.
 */
export function hashPhone(raw: string): string {
  return createHash("sha256").update(normalisePhone(raw)).digest("hex");
}

/** Log line with no PII: ids and flags only. */
export function safeLog(event: string, data: Record<string, string | number | boolean | undefined>) {
  console.log(JSON.stringify({ event, ...data }));
}
