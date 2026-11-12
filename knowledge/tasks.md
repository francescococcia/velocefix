# Tasks — SlotRight / repair-to-booking (locked 19:41)

Code freeze **23:00** Europe/London. Feature freeze **~22:10**. Work in parallel lanes that **do not share files**. Take one card, finish it, tick it, one-line note, commit with the card id, push, stop. If a card is bigger than 20 minutes, split it.

## Setup checklist (Francesco, now)

- [ ] Public GitHub repo + this folder pushed; Vercel hooked to the repo
- [ ] Live URL in the first 20–30 minutes (DEP1)
- [ ] Keys in Vercel/local `.env` only — never in chat or git (see accounts below)
- [ ] Twilio WhatsApp sandbox activated in the **legacy** Console; phone sent `join <code>` to **+1 415 523 8886**; webhook pointed at `https://<app>/api/twilio/webhook` once DEP1 is live ([docs](https://www.twilio.com/docs/whatsapp/sandbox))
- [ ] Send a WhatsApp ping after join so the **24-hour window** is open before the demo
- [ ] Optional by 20:00: Parallel key; Cortile JSON if it maps cleanly — otherwise skip
- [ ] Create a Grok Bot "Repairs desk" (ops assistant) pointing at the live `/api/ops` or URL
- [ ] Submit at https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/submit **before 22:50** (track `asset-management` / Track 4). Official demos 23:30, not 22:20.

## Accounts and keys Francesco must have (names only)

- GitHub account (public repo)
- Vercel account (project + env)
- Twilio Account SID, Auth Token, WhatsApp sandbox join code, sandbox sender (`whatsapp:+14155238886`)
- xAI API key
- Grok Bot app login (ops assistant)
- Cursor (local + cloud agent access to the repo)
- Parallel API key (optional, depth)
- Cortile claim/login from Discord (optional, depth)
- **Not required tonight:** MSCI, Dwelly, V7, Cognee, Supabase, Meta WhatsApp Business (sandbox only)

## Lanes (do not touch another lane's files)

| Lane | Owner (suggested) | File globs |
| --- | --- | --- |
| **INFRA** | whoever starts first, then done | `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `README.md` (until 21:40) |
| **DATA** | Claude Code / Codex | `data/**`, `lib/types.ts`, `lib/store.ts`, `lib/checks.ts`, `lib/rules.ts`, `lib/priority.ts` |
| **API** | Cursor cloud agent | `lib/twilio.ts`, `lib/triage.ts`, `lib/xai.ts`, `lib/parallel.ts`, `app/api/**` |
| **UI** | Cursor local | `app/dashboard/**`, `app/jobs/**`, `app/sim/**`, `app/ops/**`, `components/**` (not `app/api`) |

`app/api/ops/route.ts` is **API lane**. The dashboard only fetches it.

## Critical path (must be demoable without Parallel, Cortile, or live Grok Bot plugin)

**DEP1 → DB1 → AG1 + TW1 → UI1 → UI2** then smoke WhatsApp or `/sim`. **Standout path (do once the core books a slot):** DB3 → PRI1 → UI4. Everything else (Parallel, Cortile, Grok Bot plugin polish) only if that path is up by ~21:30.

---

## Cards

### DEP1 — Empty Next.js app live on Vercel
- Lane: INFRA
- Files: `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `.gitignore`, `.env.example` (already started)
- Done when: public URL opens logged-out with a placeholder title (working name SlotRight). `/api/health` can wait for TW1.
- Critical: **yes — do this first, before other lanes assume a URL**

### DB1 — Seed and store
- Lane: DATA
- Files: `data/seed.json`, `lib/types.ts`, `lib/store.ts`
- Done when: one private old house, two jobs (overdue floor preloaded; empty slot for the tap), one Gas Safe plumber, four slots, load/save helpers with no UI. Types should already allow later fields (building type, assets, warranty) so DB3 can extend without a rewrite.
- Critical: yes

### AG1 — Deterministic checks
- Lane: DATA
- Files: `lib/checks.ts`, `lib/rules.ts`
- Done when: a fixture job returns verified/unverified rows for unit, s.11, tenure-correct urgency (policy clock on private; Awaab only if social), trade vs `gasSafeLicence`, slot free. Booking allowed only if all green. Citations are URLs or legislation refs in the row, not vibes.
- Critical: yes

### TW1 — Twilio webhook + send + media
- Lane: API
- Files: `lib/twilio.ts`, `app/api/twilio/webhook/route.ts`, `app/api/health/route.ts`
- Done when: POST form-urlencoded inbound validates signature (or soft-fails in dev), reads `Body` / `From` / `MediaUrl0`, replies with TwiML or REST inside the 24h window, `/api/health` returns 200. No triage logic in this card — stub "got it" if AG2 isn't merged yet.
- Critical: yes

### AG2 — Grok triage brain (proposal only)
- Lane: API
- Files: `lib/xai.ts`, `lib/triage.ts`
- Done when: given a message + optional photo URL + store snapshot, Grok returns a structured proposal; `lib/checks.ts` is applied; the function returns WhatsApp text (slots or a question). No booking if any check is red. Keyword fallback if `XAI_API_KEY` is missing.
- Critical: yes

### UI1 — Simulated WhatsApp + wiring to triage
- Lane: UI
- Files: `app/sim/page.tsx`, `components/thread.tsx`
- Done when: `/sim` is clearly labelled **"Simulated WhatsApp — Twilio sandbox unavailable"**, sends into the same triage function/API, shows checks and slot picks (reply 1/2/3). This is the on-stage fallback and a way to develop without a phone.
- Critical: yes

### UI2 — Agency dashboard + completion form + draft notice
- Lane: UI (after UI1 is up, or in parallel if files stay under `app/dashboard` and `app/jobs` only)
- Files: `app/dashboard/page.tsx`, `app/jobs/[id]/page.tsx`, `app/jobs/[id]/complete/page.tsx`, `components/checks.tsx`, `components/clocks.tsx`
- Done when: dashboard lists both jobs, overdue floor is obvious, policy clocks are labelled, completion form (photo, cause, parts, fixed, follow-up) writes history, tenant update is a **draft** with Send disabled.
- Critical: yes

### API2 — Public ops summary for Grok Bot
- Lane: API
- Files: `app/api/ops/route.ts`
- Done when: `GET /api/ops` returns a no-secret JSON summary (job counts, overdue titles, pending approvals). No phone numbers, no tokens.
- Critical: no (do after 21:20 if core works)

### UI3 — Dashboard ops assistant
- Lane: UI
- Files: `components/ops-assistant.tsx`, `app/dashboard/page.tsx` (append only, don't rewrite UI2's layout)
- Done when: Priya can ask "what's overdue?" and get an answer from `/api/ops` + xAI, labelled as the ops assistant. If this fights UI2, stop and use a tiny `/ops` page instead.
- Critical: no

### PAR1 — Parallel cited check (time-box 20 min)
- Lane: API
- Files: `lib/parallel.ts` only (AG1/AG2 should already accept an optional `liveLookups` hook)
- Done when: one live cited Gas Safe or official-page check **or** the card is abandoned and the seed licence is used, with an honesty string in the check row.
- Critical: no

### DATA2 — Map Cortile if suitable (time-box 15 min)
- Lane: DATA
- Files: `data/cortile-map.ts`, maybe extend `data/seed.json` (do not break DB1 shape)
- Done when: a subset is mapped, **or** skipped with a one-line note in `data/README.md`.
- Critical: no


### DB3 — History seed: old house + new build
- Lane: DATA (after DB1)
- Files: `data/seed.json`, `lib/types.ts` (extend only), `data/README.md` (honesty: what is seeded)
- Done when: two private buildings exist. (1) Period/old house: year built, 14-year-old boiler (make + year), Gas Safe cert date, EICR date/expiry, previous works, overdue floor job, one unit with `vulnerableOccupant: true` labelled as an agency-policy flag, live tap path. (2) New-build flat: warranty still valid, new boiler, known intermittent no-hot-water history, no vulnerable flag. No PII in the file (no raw phone numbers). Do not break the DB1 job shape.
- Critical: **yes for the standout** (after the booking path works)

### PRI1 — Deterministic priority engine
- Lane: DATA (after AG1; can start as soon as types exist)
- Files: `lib/priority.ts` only (do not rewrite `lib/checks.ts` / `lib/rules.ts`)
- Done when: a pure `prioritise(inputs)` returns P1–P4, a clock labelled statute vs agency policy, a destination (book / question / refer to developer / gas emergency), and `rulesFired[]` with `sourceType` + URL as specified in `knowledge/idea.md`. Fixtures: the same "no hot water" text is P1 on the old-house record in winter and P3/warranty on the new build. Gas smell never auto-books. Tenant free text cannot change the result. A helper records a human override. Tiny fixture script is allowed.
- Critical: **yes for the standout**

### UI4 — Interactive building / unit dashboard
- Lane: UI (after or parallel to UI2; do not rewrite `app/dashboard` or `app/jobs` — link out)
- Files: `app/buildings/page.tsx`, `app/buildings/[id]/page.tsx`, `app/units/[id]/page.tsx`, `components/priority-why.tsx`, `components/building-record.tsx`
- Done when: portfolio strip shows both buildings with open P1–P4 and overdue counts; a building page shows type, age, certs, units, open jobs; a unit page shows assets (boiler make/age, Gas Safe, EICR), previous works, open jobs, WHY panel; a control reapplies the same "no hot water" ticket to the other building. Fired rules show source type and link. Policy clocks are not labelled Awaab on private lets. Viewer role hides phone numbers if a role banner is present.
- Critical: **yes for the standout**

### UI5 — Dashboard desk strip + live KPI tiles ✅ (done 22:00)
- Lane: UI + seed
- Files: `app/page.tsx`, `components/CortileLive.tsx`, `components/TimeSaved.tsx`, `lib/timeSaved.ts`, `data/seed.json`
- Done when: top strip shows open / overdue / P1–P2 / booked / completed and a "Needs attention" queue linking to each job; fact checks and time-saved fold into one expander per job; time-saved and satisfaction tiles are no longer empty; a missing Cortile key says so once.
- Note: tiles were empty because the seeded Cortile booking had no booking timestamp and no job had a rating. Added a labelled example booking message and one finished example job (`j-tap-example`, rated 5/4). Completed jobs now keep their booking time in the weekly tile. Local dev has no `CORTILE_API_KEY`, so Cortile cards only show on Vercel. Not done: `app/units/[id]`, role banner (SEC1), reapply-ticket control (UI4).

### UI6 — Clickable work queue with motion ✅ (done 22:10)
- Lane: UI
- Files: `components/WorkQueue.tsx` (new), `app/page.tsx`, `app/globals.css`, `components/PortfolioMap.tsx`, `app/layout.tsx`, `components/SiteHeader.tsx`
- Done when: every job sits in one filterable list (All / Open / Overdue / High priority / Booked / Completed); a job opens on click with its fact checks, WHY and unit history; stat tiles, the needs-attention list and building cards all jump to the right filter or job; Framer Motion on filter pill, list and expand, off under reduced motion.
- Note: the list is driven by the URL hash (`#show-overdue`, `#job-<id>`), so server-rendered links control it with no shared state. Also fixed the fixed gradient layer painting over the header, example-data banner and the map's fallback panel. Map and Cortile cards still need `CORTILE_API_KEY` in `.env.local` on a dev machine.

### UI8 — Compact portfolio map with recap panel ✅ (done 22:25)
- Lane: UI
- Files: `components/PortfolioMap.tsx`, `components/PortfolioMapClient.tsx`
- Done when: the map is a card inside the page (not full-bleed, about 26rem tall) with the building panel beside it instead of on top of it; buildings are classed by colour (needs attention / watch / on track) with counts, a filter and a plain "why this colour" line; the panel opens on a recap with three question buttons answered from the records (what is overdue, what is open, where repairs are slowest) and a clickable building list.
- Note: the ticket / compliance / priority pill groups were replaced by the one colour filter. Checked locally with sample buildings only, because the real map needs `CORTILE_API_KEY`. Not done: 3D view (needs MapLibre GL in place of Leaflet — split into its own card), and the phone-width zoom-out seen on live before this card.

### UI11 — Same report, different building ✅ (done 23:22)
- Lane: UI
- Files: `components/TicketCompare.tsx` (new), `app/page.tsx`
- Done when: a dashboard section runs one report (no hot water, no heating, water leak, blocked toilet, gas smell) through `prioritise()` for each building's own record and shows priority, clock, what happens next and the rules that fired, side by side. Preview only; nothing is logged or booked.
- Note: this is the spec's "how the same ticket would score elsewhere". "No hot water" shows P1 on Albion Terrace and P3 refer-to-developer on Riverside Wharf. Only buildings with a type and a boiler on record appear, so Gorse House and the Dwelly book are not in it. Still not built: in-app Grok ops assistant, Complete job form redesign, unit page, override control, role banner.

### SEC1 — Identity hash, no-PII logs, role banner (time-box 15 min)
- Lane: API for hashing/logging helpers (`lib/privacy.ts` + do not weaken `/api/ops`); UI may add a `?role=` banner in `components/role-banner.tsx` only
- Files: `lib/privacy.ts`, `components/role-banner.tsx`
- Done when: WhatsApp `From` is hashed before store/logs; `/api/ops` still has no PII; a visible role banner (`agency` / `operator` / `viewer`) exists. Not full IAM. Skip leftover polish if UI4 is not done.
- Critical: no

### DOC1 — README honesty + pitch notes
- Lane: INFRA (after 21:40)
- Files: `README.md`, `knowledge/pitch.md`
- Done when: README says what is real vs seeded vs simulated; pitch.md has the 2-min script from `idea.md`.
- Critical: yes for submission, not for the first live URL

---

## Ready-to-paste prompts for three parallel agents

Start **DEP1 yourself or with the first agent**, get the URL, then launch these three. Paste the live URL and this repo path into each prompt. Tell each agent its lane files and to stop after one card if it starts to sprawl.

### 1) Cursor local — UI lane

```
You are the UI lane for SlotRight (UK letting-agency repair-to-booking app). Repo is this project. Read knowledge/idea.md and the UI cards in knowledge/tasks.md.

Take UI1 first, then UI2, then UI4 (building/unit dashboard — the standout). Do not edit data/, lib/checks.ts, lib/rules.ts, lib/priority.ts, lib/twilio.ts, lib/triage.ts, lib/xai.ts, or app/api/**.

UI1: build app/sim/page.tsx and components/thread.tsx. The page must be labelled "Simulated WhatsApp — Twilio sandbox unavailable". It posts to /api/sim or calls a agreed client helper that the API lane will expose; if the API isn't ready, mock the check rows and slot list in the shape from lib/types.ts (read only) so we can style it, and leave a TODO to swap in the real endpoint.

UI2: app/dashboard/page.tsx lists jobs (include an overdue floor job and a booked tap job when data exists). Policy clocks must be labelled "agency policy" not "Awaab's Law" for private lets. app/jobs/[id]/complete/page.tsx is a short operator form: photo, cause, parts, fixed yes/no, follow-up needed. After submit, show a drafted tenant message with Send disabled.

UI4: app/buildings/page.tsx, app/buildings/[id]/page.tsx, app/units/[id]/page.tsx, components/priority-why.tsx, components/building-record.tsx. Two buildings (old house + new build). Unit page shows type/age, boiler make/age, Gas Safe and EICR dates, previous works, open jobs, and the priority WHY panel (source type + URL). Include a control that reapplies the same 'no hot water' ticket to the other building. Do not rewrite UI2's dashboard — link to buildings from it if a single line is enough. Policy clocks must not say Awaab on private lets.

Commit per card id (UI1, UI2, UI4), push, and stop after UI4. Don't run tests unless a card says so.
```

### 2) Cursor cloud agent — API / Twilio lane

```
You are the API lane for SlotRight. Read knowledge/idea.md and cards TW1, AG2, API2 in knowledge/tasks.md.

Do not edit data/seed.json, lib/store.ts, lib/types.ts, lib/checks.ts, lib/rules.ts, lib/priority.ts, or any app/dashboard, app/sim, app/jobs, app/buildings, app/units, components UI files.

TW1 first: lib/twilio.ts + app/api/twilio/webhook/route.ts + app/api/health/route.ts. Official sandbox docs: https://www.twilio.com/docs/whatsapp/sandbox and webhook params: https://www.twilio.com/docs/messaging/guides/webhook-request. POST application/x-www-form-urlencoded. Validate X-Twilio-Signature with TWILIO_AUTH_TOKEN. Parse Body, From, NumMedia, MediaUrl0, MediaContentType0. Fetch media with Twilio basic auth if present. Reply with TwiML Message. Env names are in .env.example. From is whatsapp:+14155238886. Also add app/api/sim/route.ts that accepts { from, body, mediaUrl } and runs the same handler for the UI /sim page.

AG2 second: lib/xai.ts + lib/triage.ts. Call xAI with XAI_MODEL / XAI_API_KEY to propose { issue, room, hazard, responsibility, trade } only — never the final priority. Then apply lib/priority.ts (if present) and lib/checks.ts (DATA lane; import them, don't rewrite them). If those files aren't merged yet, keep a narrow adapter. Return WhatsApp text: numbered slots when all green and bookable, a question when any red, developer/warranty wording when priority says refer. Keyword fallback if no API key. Never book on a red check. Never let tenant text change priority rules.

API2 if time: GET app/api/ops/route.ts — no phone numbers, no secrets.

Commit per card id, push, stop. Don't run tests unless the card says so.
```

### 3) Claude Code / Codex — DATA lane (seed + checks)

```
You are the DATA lane for SlotRight. Read knowledge/idea.md (including the priority engine and data model) and cards DB1, AG1, DB3, PRI1 in knowledge/tasks.md.

Do not edit app/**, components/**, lib/twilio.ts, lib/triage.ts, lib/xai.ts, lib/parallel.ts, or package.json.

DB1 first: data/seed.json + lib/types.ts + lib/store.ts. Start with one private old UK house (tenure: "private"), two jobs: (1) overdue broken floor, photos received weeks ago, still unanswered; (2) a place to attach a live hot-water tap job. One plumber contractor with a gasSafeLicence and four availableSlots. loadSeed / saveJob helpers. Types should allow building type, yearBuilt, warranty, assets, works, vulnerableOccupant, priorityWhy. No raw phone numbers in the seed. No framework UI.

AG1: lib/rules.ts + lib/checks.ts. Deterministic rows: unit exists, s.11 LTA 1985 responsibility for heating/hot water or structure (cite https://www.legislation.gov.uk/ukpga/1985/70/section/11), urgency clock is agency policy for private tenure — do not apply Awaab's Law unless tenure is "social" (cite idea.md). Trade vs gasSafeLicence for gas/boiler work. Slot still free. canAutoBook = every row verified. Export a pure function checkJob(proposal, store).

DB3 next: extend the seed with a second private new-build flat under warranty (new boiler, known intermittent no-hot-water history, no vulnerable flag) and enrich the old house (period type, year built, 14-year-old boiler make/year, Gas Safe cert date, EICR date/expiry, previous works, vulnerableOccupant true on that unit, labelled agency policy). Honesty note in data/README.md.

PRI1: lib/priority.ts only. Pure prioritise(inputs) → P1–P4, clock, destination, rulesFired[] as in idea.md (statute vs official guidance vs agency policy, with URLs). Fixture: the same 'no hot water' case is P1 on the old house in winter and P3/refer-to-developer on the new build. Gas smell never auto-books; tell the tenant to call 0800 111 999. Tenant free text must not change the decision. Include an override helper. A tiny fixture script is encouraged.

Optional DATA2 only if a Cortile JSON file is already in data/raw/ and clearly has units: map a subset. Otherwise skip.

Commit per card id (DB1, AG1, DB3, PRI1), push, stop after PRI1.
```

---

## Timeline (Europe/London)

| Time | What |
| --- | --- |
| 19:45–20:10 | DEP1 live; env on Vercel; Twilio join + webhook as soon as URL exists |
| 20:10–21:00 | Three lanes in parallel: DATA (DB1+AG1), API (TW1+AG2), UI (UI1+UI2) |
| 21:00–21:20 | Merge, point webhook, one real WhatsApp ping; if it fails, confirm `/sim` |
| 21:20–22:10 | Standout path if not done: DB3 + PRI1 + UI4 (old house vs new build WHY). Then API2/UI3 Grok Bot, SEC1, PAR1 if key is ready. **No new features after 22:10** |
| 22:10–22:40 | Backup 60–90s video on the live URL; README honesty; submission draft |
| 22:40–22:50 | Submit on the official form (Track 4). Screenshot confirmation |
| 23:00 | Code freeze. Demos 23:30 |

## Note for the next agent

Idea is locked (D, WhatsApp tenant channel, Grok Bot for the PM). Standout is the two-building dashboard + deterministic priority WHY (see idea.md). Start DEP1 if the URL is not live. Then dispatch the three prompts above. After the core books a slot, finish DB3, PRI1, UI4 before adding sponsor extras. Do not reopen scoring or switch tracks.
