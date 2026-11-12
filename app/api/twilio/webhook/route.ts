import { NextResponse } from "next/server";
import { handleInbound } from "@/lib/triage";
import { formParams, skipSignature, twimlMessage, validTwilioSignature, webhookUrl } from "@/lib/twilio";

export const dynamic = "force-dynamic";

function twiml(body: string, status = 200) {
  return new NextResponse(twimlMessage(body), {
    status,
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const params = formParams(raw);
  const token = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
  if (!skipSignature()) {
    const ok = validTwilioSignature({
      url: webhookUrl(),
      params,
      signature: req.headers.get("x-twilio-signature"),
      token,
    });
    if (!ok) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const from = params.From || "";
  const body = params.Body ?? "";
  const numMedia = Number(params.NumMedia || "0");
  const mediaUrl = numMedia > 0 && params.MediaUrl0 ? params.MediaUrl0 : undefined;

  const r = await handleInbound({
    from,
    body,
    channel: "whatsapp",
    mediaUrl,
  });
  return twiml(r.reply);
}
