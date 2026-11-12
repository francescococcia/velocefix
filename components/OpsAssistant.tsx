"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SUGGESTIONS = ["What is overdue?", "Which jobs are high priority?", "What is booked?", "Anything on Gorse House?"];

type Reply = { answer: string; by: "grok" | "fallback"; model?: string };

/** Ask the repairs desk a question. Answers come from the no-PII /api/ops feed, through Grok when it is connected. */
export function OpsAssistant() {
  const reduce = useReducedMotion();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    setAsked(q);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }) });
      const data = (await res.json()) as Reply & { error?: string };
      if (!res.ok) {
        setReply(null);
        setError(data.error ?? "The desk could not answer that.");
      } else {
        setReply(data);
      }
    } catch {
      setReply(null);
      setError("Could not reach the desk. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  return (
    <section className="vf-card p-4" aria-labelledby="ask-desk-title">
      <h2 id="ask-desk-title" className="text-lg font-semibold">Ask the desk</h2>
      <p className="mt-0.5 text-sm text-slate-600">
        Ask about the repairs in plain words. Answers come from the no-PII desk feed (<code className="text-xs">/api/ops</code>): no tenant names or phone numbers.
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex flex-wrap gap-2">
        <label htmlFor="ask-desk-input" className="sr-only">Your question</label>
        <input
          id="ask-desk-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          placeholder="e.g. What is overdue on Albion Terrace?"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={busy || !question.trim()}
          className="min-h-11 rounded-lg bg-brand px-4 font-semibold text-white hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {busy ? "Asking…" : "Ask"}
        </button>
      </form>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested questions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy}
            onClick={() => {
              setQuestion(s);
              void ask(s);
            }}
            className="min-h-11 rounded-full bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-brand-tint disabled:opacity-60"
          >
            {s}
          </button>
        ))}
      </div>
      <div aria-live="polite" className="mt-3">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
        {reply && !error && (
          <motion.div
            key={asked + reply.answer}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200"
          >
            <p className="text-xs font-semibold text-slate-600">
              {reply.by === "grok" ? `Answered by Grok${reply.model ? ` · ${reply.model}` : ""}` : "Grok is not connected on this server — computed from the desk feed"}
            </p>
            <p className="mt-1 text-xs text-slate-600">You asked: {asked}</p>
            <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-900">{reply.answer}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
