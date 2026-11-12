"use client";
import { useEffect, useState } from "react";

type Check = { id: string; label: string; status: "green" | "red"; detail: string };
type Msg = { dir: "in" | "out"; text: string; meta?: string; checks?: Check[] };
const QUICK = [
  "No hot water, the tap is stuck so we shut the water off",
  "I can smell gas in the kitchen",
  "The hallway floor is broken",
];

export default function Sim() {
  const [tenants, setTenants] = useState<{ phone: string; label: string }[]>([]);
  const [from, setFrom] = useState("+447700900101");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => { fetch("/api/sim").then((r) => r.json()).then((d) => setTenants(d.tenants)); }, []);

  async function send(body: string) {
    if (!body.trim()) return;
    setMsgs((m) => [...m, { dir: "in", text: body }]);
    setText(""); setBusy(true);
    const r = await fetch("/api/sim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ from, body }) });
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
    <div className="max-w-xl mx-auto">
      <div className="bg-yellow-300 text-yellow-950 font-semibold text-center rounded p-2 mb-3">Simulated WhatsApp — Twilio sandbox unavailable</div>
      <div className="flex gap-2 mb-2">
        <select className="border rounded p-1 text-sm flex-1" value={from} onChange={(e) => { setFrom(e.target.value); setMsgs([]); }}>
          {tenants.map((t) => <option key={t.phone} value={t.phone}>{t.label}</option>)}
        </select>
        <input className="border rounded p-1 text-xs w-36" type="password" value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Reset token" autoComplete="off" />
        <button onClick={reset} className="text-xs border rounded px-2">Reset demo data</button>
      </div>
      {resetMsg && <p className="text-xs text-slate-600 mb-2">{resetMsg}</p>}
      <div className="bg-[#e5ddd5] rounded p-3 h-[420px] overflow-y-auto space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-lg p-2 text-sm whitespace-pre-wrap shadow ${m.dir === "in" ? "ml-auto bg-[#dcf8c6]" : "bg-white"}`}>
            {m.text}
            {m.checks && m.checks.length > 0 && (
              <ul className="mt-1 border-t pt-1 text-[11px]">
                {m.checks.map((c) => <li key={c.id}>{c.status === "green" ? "🟢" : "🔴"} {c.label}: <span className="text-slate-600">{c.detail}</span></li>)}
              </ul>
            )}
            {m.meta && <div className="text-[10px] text-slate-500 mt-1">{m.meta}</div>}
          </div>
        ))}
        {busy && <div className="text-xs text-slate-600">typing…</div>}
      </div>
      <div className="flex flex-wrap gap-1 my-2">
        {QUICK.map((q) => <button key={q} onClick={() => send(q)} className="text-xs bg-white border rounded px-2 py-1">{q}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
        <input className="flex-1 border rounded p-2 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a repair message…" />
        <button className="bg-green-600 text-white rounded px-4 text-sm">Send</button>
      </form>
    </div>
  );
}
