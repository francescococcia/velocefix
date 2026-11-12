"use client";
import { useEffect, useState } from "react";
import { FadeIn, MotionButton } from "@/components/Motion";

type Check = { id: string; label: string; status: "green" | "red"; detail: string };
type Msg = { dir: "in" | "out"; text: string; meta?: string; checks?: Check[] };
const QUICK = [
  "No hot water, the tap is stuck so we shut the water off",
  "I can smell gas in the kitchen",
  "The hallway floor is broken",
];
const RATE = ["5 4", "4 4", "3 5"];

export default function Sim() {
  const [tenants, setTenants] = useState<{ phone: string; label: string }[]>([]);
  const [from, setFrom] = useState("+447700900101");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => { fetch("/api/sim").then((r) => r.json()).then((d) => setTenants(d.tenants)); }, []);

  async function fileToDataUrl(file: File) {
    if (!file.type.startsWith("image/")) return { error: "Please choose a photo." };
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 800 / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { error: "Could not read that photo." };
    ctx.drawImage(bmp, 0, 0, w, h);
    let quality = 0.85;
    let url = canvas.toDataURL("image/jpeg", quality);
    const max = Math.round(1.5 * 1024 * 1024);
    while (url.length > max && quality > 0.4) {
      quality -= 0.15;
      url = canvas.toDataURL("image/jpeg", quality);
    }
    if (url.length > max) return { error: "That photo is still too large after shrinking (max about 1.5MB)." };
    return { url };
  }

  async function send(body: string, mediaUrl?: string) {
    if (!body.trim() && !mediaUrl) return;
    setMsgs((m) => [...m, { dir: "in", text: body || "(tenant photo)", meta: mediaUrl ? "tenant photo attached" : undefined }]);
    setText(""); setBusy(true);
    const r = await fetch("/api/sim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ from, body, mediaUrl }) });
    const d = await r.json();
    setBusy(false);
    setMsgs((m) => [...m, { dir: "out", text: d.reply ?? d.error, meta: d.priority ? `${d.priority.priority} · ${d.status} · proposal by ${d.proposal?.by}` : undefined, checks: d.checks }]);
  }

  async function reset() {
    const r = await fetch("/api/sim", { method: "POST", headers: { "content-type": "application/json", "x-reset-token": resetToken }, body: JSON.stringify({ reset: true, resetToken }) });
    const d = await r.json();
    if (!r.ok) { setResetMsg(d.error ?? "Reset denied"); return; }
    setResetMsg("Demo data reset to seed.");
    setMsgs([]);
  }

  return (
    <FadeIn className="max-w-xl mx-auto">
      <div className="hidden border border-amber-200 bg-amber-50 text-amber-900 text-sm font-semibold text-center rounded-xl p-2 mb-3">Simulated WhatsApp — Twilio sandbox unavailable</div>
      <div className="flex flex-wrap gap-2 mb-2">
        <select className="min-h-11 min-w-0 border border-slate-300 bg-surface rounded-lg p-1 text-sm flex-1" value={from} onChange={(e) => { setFrom(e.target.value); setMsgs([]); }}>
          {tenants.map((t) => <option key={t.phone} value={t.phone}>{t.label}</option>)}
        </select>
        <input className="hidden min-h-11 border border-slate-300 bg-surface rounded-lg p-1 text-xs w-36" type="password" value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Reset token" autoComplete="off" />
        <button onClick={reset} className="hidden min-h-11 text-xs border border-slate-300 bg-surface rounded-lg px-2">Reset demo data</button>
      </div>
      {resetMsg && <p className="text-xs text-slate-600 mb-2">{resetMsg}</p>}
      <div className="bg-[#efeae2] rounded-xl border border-line p-3 h-[420px] overflow-y-auto space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg p-2 text-sm whitespace-pre-wrap shadow ${m.dir === "in" ? "ml-auto bg-[#dcf8c6]" : "bg-white"}`}>
            {m.text}
            {m.checks && m.checks.length > 0 && (
              <ul className="mt-1 border-t pt-1 text-xs">
                {m.checks.map((c) => <li key={c.id}>{c.status === "green" ? "🟢" : "🔴"} {c.label}: <span className="text-slate-600">{c.detail}</span></li>)}
              </ul>
            )}
            {m.meta && <div className="text-[11px] text-slate-500 mt-1">{m.meta}</div>}
          </div>
        ))}
        {busy && <div className="text-xs text-slate-600">typing…</div>}
      </div>
      <p className="text-xs text-slate-600 mt-2">If the agency has asked you to rate a completed job, reply with two scores (speed then quality), for example 5 4, or send them as two messages.</p>
      <div className="flex flex-wrap gap-1 my-2">
        {QUICK.map((q) => <MotionButton type="button" key={q} onClick={() => send(q)} className="min-h-11 text-xs bg-surface border border-slate-300 rounded-lg px-2 py-1">{q}</MotionButton>)}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {RATE.map((q) => <MotionButton type="button" key={q} onClick={() => send(q)} className="min-h-11 text-xs bg-brand-tint border border-brand-soft rounded-lg px-2 py-1">Rate {q}</MotionButton>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex flex-wrap gap-2">
        <input className="flex-1 min-w-0 min-h-11 border border-slate-300 bg-surface rounded-lg p-2 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a repair or rating, e.g. 5 4" />
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-300 bg-surface px-3 text-xs font-medium">
          {photoBusy ? "Shrinking…" : photoName ? photoName : "Add photo"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setPhotoBusy(true);
              const out = await fileToDataUrl(file);
              setPhotoBusy(false);
              if ("error" in out && out.error) { setResetMsg(out.error); return; }
              if ("url" in out && out.url) {
                setPhotoName(file.name);
                await send(text, out.url);
                setPhotoName("");
              }
            }}
          />
        </label>
        <MotionButton type="submit" className="min-h-11 bg-brand text-white rounded-lg px-4 text-sm font-semibold">Send</MotionButton>
      </form>
    </FadeIn>
  );
}
