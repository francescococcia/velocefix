# Pitch — SlotRight (2 minutes)

Tailored so it still works for a mixed panel, and so it has a clean line if Erik Starck (Ares) is in the room. Official live slots and the required video are 2 minutes. Click cues match `knowledge/idea.md`. Times Europe/London.

**One-liner:** A letting-agency desk that verifies a tenant WhatsApp against the building record and cited UK rules, sets a transparent priority, books a slot in the same thread, and writes a verified history when the job is closed.

**Named user:** Priya, property manager. (If speaking to Ares: she is the operator on the asset; the buyer inside Ares is the asset manager overseeing third-party PMs.)

## 2-minute pitch

1. **0:00–0:15 — problem.** "This is Priya's desk. In an old house we manage, a tenant shut the hot water off because a tap was stuck open. The agency wrote back three days later to ask if they were free. A broken floor, with photos, sat in the portal for weeks. The portal logged the ticket. It did not book a visit, and a generic AI chat cannot see the building." *Don't click yet.*

2. **0:15–0:40 — main action, live.** *Francesco's phone (sandbox already joined, 24-hour window open), or `/sim` if WhatsApp is down — say so.* Send the tap photo: "no hot water, we shut the water off." *Cut to the job.* "Grok proposes the issue. The code decides the priority." *Point at the WHY panel.* P1: winter, a 14-year-old boiler, a vulnerable-occupant flag (agency policy), no hot water, s.11 responsibility. Checks green. *Reply `1`.* Slot booked in the same thread.

3. **0:40–0:55 — differentiator.** *Click the new-build unit, or re-run the same sentence against that record.* "Same words: no hot water. This flat is a new build, still under warranty, new boiler, known intermittent issue. The engine returns P3 and refers it to the developer. We do not emergency-dispatch a contractor. If Priya disagrees, she can override — and that is logged."

4. **0:55–1:35 — wow: the building record.** *Optional 10s: a blocked not-Gas-Safe or gas-smell path — the model does not get to book.* *Click the old house.* Type, year, boiler make and age, Gas Safe date, EICR date, previous works, the overdue floor, policy clocks. "Every fired rule has a source. If it is not a statute, we label it agency policy. We do not put Awaab's Law on a private let."

5. **1:30–1:40 — close the loop.** *Completion form.* History writes back. Draft tenant message, **Send disabled**.

6. **1:40–1:55 — Grok Bot (planned 10–15s, not optional).** *Open the real Grok Bot "Repairs desk"* (already signed in). Priya asks: **"Which P1 jobs are overdue?"** It answers from the no-PII `GET /api/ops` feed (e.g. the floor job on the old house). One line: "WhatsApp is the tenant channel. Grok Bot is Priya's ops assistant. We built this in Cursor." If the plugin is not wired, ask the same question in the labelled dashboard copilot, then show the real Grok Bot open on the live URL — do not fake a plugin. (Why this beat, and the two we did not lead with, are in "Showing Grok Bot" below.)

7. **1:55–2:00 — honesty, and the Ares line if Erik is there.** "Two buildings and the slots are seeded. The WhatsApp number is a test sandbox number" *(or: this is a labelled simulated thread)*. "Clocks on these private homes are agency policy. Notifications are drafts." *Ares line:* "When you appoint a third-party PM, this is the record an asset manager should be able to open — cited priorities, certs, plant age, and a history written when the job closed — without replacing the system of record."

## What to click (in order)

1. Phone or `/sim` — send the old-house "no hot water" message.
2. Job / WHY panel — P1 rules and sources.
3. Reply `1` — book the slot.
4. New-build compare control — same ticket, P3 / warranty.
5. (If time) Red Gas Safe or gas-smell row.
6. Old-house building / unit page — assets, certs, history, overdue floor.
7. Completion form — submit, show draft, do not send.
8. **Grok Bot** — ask "Which P1 jobs are overdue?" (planned beat, not optional).

Do not click: Vercel settings, `.env`, Twilio console, raw media URLs, anything with a phone number if a viewer is watching.

## Honesty notes

- Seeded: both buildings, boiler ages, cert dates, warranty, vulnerable-occupant flag, contractor slots, the overdue floor.
- Live: tonight's WhatsApp or the labelled `/sim` thread, Grok's proposal, the TypeScript priority and checks, any job completed in the demo.
- Private tenancies: no Awaab 24-hour clocks.
- HHSRS: we use official hazard *labels*, we do not compute a statutory score.
- Twilio sandbox may show the Twilio logo; say it.
- Send is disabled on close-out messages unless we have explicitly stayed in the 24-hour window and said we sent a sandbox reply.

## Backup video

Record 60–90s against the live URL before 22:10, covering beats 2–4 (P1 book, P3 contrast, building record), the Grok Bot overdue question, and one honesty line. Keep it open if the hall Wi-Fi or the sandbox fails.

## Lines for Erik (use at most one in the close)

See `knowledge/idea.md` § Ares / Erik pitch notes for sources. Preferred close:

"When you appoint a third-party PM, this is the record the asset manager should be able to open: certs, plant age, open SLAs, and a history that was written when the job was closed — without replacing their system of record."

## Showing Grok Bot (pick for the 10–15s beat)

Three honest options, so the criterion is "effective use of **Grok Bot** and Cursor," not only the xAI API behind WhatsApp:

1. **Best — Priya asks the real Grok Bot: "Which P1 jobs are overdue?"** The bot reads `GET /api/ops` (job counts, overdue titles, priorities; no phone numbers). Ten to fifteen seconds, live data, visible product. This is the planned beat at 1:40.
2. **Grok Bot drafts the tenant update** after completion ("Your hot water should be back on; the engineer marked the tap fixed"). Honest, but we already show a draft on the completion screen, and it is easier to confuse with the xAI API. Keep as a fallback if `/api/ops` is late.
3. **Velo / Tick / Pip as the Grok Bot assistant voice** — a mascot persona on the bot. Fine as dressing, weak as the only proof we used Grok Bot. Do not lead with this.

If WhatsApp ate the clock, cut the blocked-path beat and keep this Grok Bot question.
