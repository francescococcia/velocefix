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

export function ratingRequestBody(jobId: string, issue?: string) {
  const what = issue ? ` (${issue.replaceAll("_", " ")})` : "";
  return [
    `How did we do on your recent repair${what}, ref ${jobId}?`,
    "Please reply with two scores from 1 (poor) to 5 (excellent):",
    "1) Speed of the repair",
    "2) Quality of the fix",
    "For example: 5 4",
    "You can also send the two numbers in two messages (speed first, then quality).",
  ].join("\n");
}

export type WhatsAppSendResult = { ok: true } | { ok: false; error: string };

/**
 * Send one WhatsApp message via the Twilio Messages API.
 * Never logs the auth token, destination, or message body.
 */
export async function sendWhatsApp(to: string, body: string): Promise<WhatsAppSendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
  const token = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
  const fromRaw = process.env.TWILIO_WHATSAPP_FROM?.trim() ?? "";
  if (!sid || !token || !fromRaw) {
    return { ok: false, error: "Twilio is not configured, so the WhatsApp message was not sent." };
  }
  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const fromAddr = fromRaw.startsWith("whatsapp:") ? fromRaw : `whatsapp:${fromRaw}`;
  let res: Response;
  try {
    res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toAddr, From: fromAddr, Body: body }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { ok: false, error: "Twilio could not be reached, so the WhatsApp message was not sent." };
  }
  if (res.ok) return { ok: true };
  // Do not include Twilio's raw body (may repeat destination). Keep a short reason.
  const status = res.status;
  if (status === 401 || status === 403) return { ok: false, error: "Twilio rejected the credentials, so the WhatsApp message was not sent." };
  return { ok: false, error: `Twilio did not accept the message (HTTP ${status}). It was not sent.` };
}
