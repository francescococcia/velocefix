import { timingSafeEqual } from "crypto";

/** Header `X-Reset-Token`, query `token`, or JSON/form `resetToken` must match RESET_TOKEN. */
export function resetAuthorized(req: Request, bodyToken?: string | null) {
  const expected = process.env.RESET_TOKEN?.trim();
  if (!expected) return false;
  const header = req.headers.get("x-reset-token") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const query = new URL(req.url).searchParams.get("token") || new URL(req.url).searchParams.get("reset_token") || "";
  const provided = (header || query || bodyToken || "").trim();
  if (!provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function resetDenied() {
  return { error: "Reset requires a valid RESET_TOKEN (header X-Reset-Token or query ?token=)." };
}
