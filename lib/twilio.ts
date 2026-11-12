// Twilio signature check and TwiML helper. The auth token is never logged.

import { createHmac, timingSafeEqual } from "crypto";

export function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function twimlMessage(body: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(body)}</Message></Response>`;
}

/** Public webhook URL Twilio signed: APP_BASE_URL (or APP_URL) + path, unless already a full webhook URL. */
export function webhookUrl() {
  const base = (process.env.APP_BASE_URL || process.env.APP_URL || "").trim().replace(/\/$/, "");
  if (!base) return "";
  if (/\/api\/twilio\/webhook\/?$/.test(base)) return base.replace(/\/$/, "");
  return `${base}/api/twilio/webhook`;
}

export function skipSignature() {
  return process.env.TWILIO_SKIP_SIGNATURE === "1";
}

/**
 * X-Twilio-Signature: HMAC-SHA1 of the full URL plus sorted POST fields
 * (key immediately followed by value), Base64-encoded, with the auth token.
 */
export function validTwilioSignature(opts: {
  url: string;
  params: Record<string, string>;
  signature: string | null;
  token: string;
}) {
  if (!opts.url || !opts.token || !opts.signature) return false;
  const data = opts.url + Object.keys(opts.params).sort().map((k) => k + opts.params[k]).join("");
  const expected = createHmac("sha1", opts.token).update(data, "utf8").digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(opts.signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function formParams(raw: string) {
  const params: Record<string, string> = {};
  const q = new URLSearchParams(raw);
  for (const [k, v] of q.entries()) params[k] = v;
  return params;
}
