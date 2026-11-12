# How we work tonight

Control room for Francesco Coccia, solo, Grok Bot Real Estate Hackathon London. Written 20:06 Europe/London, 12 Nov 2026. Feature freeze **~22:10**, code freeze **23:00**, Top 5 demos **23:30**. Official submit: https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/submit (Track 4, `asset-management`).

This file is the traffic-control doc. Product spec: `knowledge/idea.md`. Cards and paste-ready agent prompts: `knowledge/tasks.md`. Pitch: `knowledge/pitch.md`.

## The control room

**This Grok Bot chat** (the conversation Francesco is in with the project bot) is the control room. It is the only place that:

- picks the next cards and which lane gets them
- pastes or refreshes the agent prompts
- records a product decision in `knowledge/decisions.md`
- says when to merge, deploy, or stop a lane
- talks to Francesco about trade-offs (Twilio vs `/sim`, name, which sponsor to skip)

Do **not** let a coding agent invent a new product direction, add a sponsor, or change the track. If something is unclear, it writes a question in the card note and stops.

Francesco's own machine is the build box (project path in memory: `C:\Users\Francesco\Desktop\GitHub\hackathon\grok-bot-real-estate`). The box at `/workspace/hackathon/grok-bot-real-estate` is the knowledge and planning copy; keep them in the same git repo once the GitHub remote exists, or copy knowledge files across if they have drifted.

## Lanes (who does what)

Lanes do not share files. See `knowledge/tasks.md` for the exact globs.

| Lane | Who | Owns | First cards |
| --- | --- | --- | --- |
| **INFRA** | Francesco or the first available agent | `package.json`, root Next.js shell, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `README.md` after 21:40 | **DEP1 first** — live Vercel URL |
| **DATA** | Claude Code or Codex | `data/**`, `lib/types.ts`, `lib/store.ts`, `lib/checks.ts`, `lib/rules.ts`, `lib/priority.ts` | DB1 → AG1 → **DB3** (old house + new build) → **PRI1** (priority engine) |
| **API** | Cursor cloud agent | `lib/twilio.ts`, `lib/triage.ts`, `lib/xai.ts`, `lib/parallel.ts`, `lib/privacy.ts`, `app/api/**` | TW1 → AG2 → API2 (`/api/ops` for Grok Bot) |
| **UI** | Cursor local | `app/dashboard/**`, `app/jobs/**`, `app/sim/**`, `app/buildings/**`, `app/units/**`, `app/ops/**`, `components/**` | UI1 (`/sim`) → UI2 (desk + completion) → **UI4** (building dashboard) |
| **Control** | this bot chat | `knowledge/**` (except do not fight a lane mid-card), pitch, flow, decisions | research, prompts, honesty, demo rehearsal notes |

Optional later cards (only if the standout path is up): UI3 ops-assistant panel, SEC1, PAR1, DATA2, DOC1.

## Pull, test, commit, push

Every cycle, in this order:

1. **Always `git pull --rebase` (or pull then rebase) first.** Do not start a card on a stale branch. If rebase conflicts touch another lane's files, stop and tell the control room; do not "fix" their code.
2. Do **one card** from `knowledge/tasks.md`. Tick it when done. Write a one-line note for the next agent (what landed, what is blocked).
3. **Run tests before committing** once a test or fixture script exists (PRI1's fixture, any `npm test` / lint the card added). If the repo still has no tests, say so in the commit body and do not invent a flaky suite. This updates the earlier AGENTS.md line "don't run tests unless the card says so": tonight, if tests exist, run them before commit.
4. **Commit as Francesco Coccia** (`git config user.name "Francesco Coccia"`, his email on this machine). Message: `CARDID: short description` (e.g. `PRI1: add deterministic P1–P4 engine`). One card per commit. No `--no-verify` unless the control room says so.
5. **No secrets.** Never commit `.env`, API keys, Twilio tokens, WhatsApp numbers in seed data, or photos of real tenants. `.gitignore` already ignores `.env*` except `.env.example`. If a secret might have landed, stop and tell the control room; do not push it "to fix later."
6. **`git push`** the card branch or `main` as agreed. Then **stop**. Do not start the next card in the same agent turn unless the control room explicitly queues it.

Default branch: `main`, unless Francesco already opened a `dev` branch — then all lanes branch from `dev` and open short-lived branches named `card/PRI1` etc. Prefer one `main` tonight if we are solo and moving fast, with pull-before-push discipline.

## 30–45 minute cycles

Work in short loops, not a three-hour branch.

- **0–5 min:** pull, read the card, confirm file globs.
- **Next 20–30 min:** build the card. If it will blow the 20-minute "one card" rule in `AGENTS.md`, split the card rather than silently expanding it.
- **Last 5–10 min:** tests/fixtures, commit, push, one-line note, announce in the control room: "PRI1 pushed, fixture is green, UI4 can start."

Suggested wall-clock (Europe/London):

| Cycle | Aim |
| --- | --- |
| now–20:30 | DEP1 live; env; Twilio join started |
| 20:30–21:15 | Parallel: DATA (DB1+AG1+start DB3), API (TW1+AG2), UI (UI1+UI2) |
| 21:15–21:30 | Merge, webhook, one WhatsApp or `/sim` smoke |
| 21:30–22:10 | Standout: DB3, PRI1, UI4, then API2 + Grok Bot "which P1s are overdue?" **Feature freeze ~22:10** |
| 22:10–22:40 | Video, README honesty, submission draft |
| 22:40–22:50 | Submit Track 4 |
| 23:00 | Code freeze |

## Merge and deploy check

After each pushed card, or at least at the end of every cycle:

1. Pull on the deploy branch.
2. Confirm Vercel is building the latest commit (or trigger a deploy).
3. Hit `/api/health` (once TW1 exists) and the pages you actually need (`/sim`, `/dashboard`, `/buildings/...`).
4. If the build is red, the lane that just pushed owns the fix; nobody else "helps" by editing their files.
5. Twilio webhook must point at the **current** Vercel URL. If the URL changes, update the sandbox hook before the next WhatsApp test.
6. Never deploy a commit that contains `.env` or seed PII.

## Where reports and decisions go

| What | Where |
| --- | --- |
| Official event facts, judges, sponsors, **Mateo / organiser notes** | `knowledge/event.md` |
| Track briefs | `knowledge/tracks.md` |
| Locked product spec, names, priority engine, Ares notes | `knowledge/idea.md` |
| Cards, lanes, paste-ready prompts, keys (names only) | `knowledge/tasks.md` |
| 2-min script, Grok Bot beat | `knowledge/pitch.md` |
| This working agreement | `knowledge/flow.md` |
| Timestamped decisions (locks, sponsor skips, name pick) | `knowledge/decisions.md` |
| Past-hackathon rules | `knowledge/lessons.md` |
| Earlier research (do not treat scores as live work) | `knowledge/ideas-research.md` |
| Env key *names* | `.env.example` (values only in local/Vercel env) |
| One-line notes between agents | the card tick in `tasks.md`, or a single paragraph in `decisions.md` if it is a product call |

If Francesco picks **VeloceFix**, log it in `decisions.md` and then rename the working title in `idea.md`, `pitch.md`, and the live app chrome together — not in one lane's leftover typography.

## Folder map (every file now, plus what the cards will add)

Inventory of `/workspace/hackathon/grok-bot-real-estate` at 20:06 Europe/London. There is **no application code yet** beyond the repo skeleton; Next.js files appear once DEP1 starts.

### Already in the folder

| Path | What it's for |
| --- | --- |
| `README.md` | Public front page of the repo; keep status, stack, and honesty in sync after DOC1. |
| `LICENSE` | MIT, Copyright 2026 Francesco Coccia. |
| `AGENTS.md` | One-card rule for coding agents; points here for pull / test / commit. |
| `.gitignore` | Ignores `node_modules`, `.env*`, `.next`, `.vercel`; keeps `.env.example`. |
| `.env.example` | Key *names* only: `APP_URL`, `XAI_*`, `TWILIO_*`, optional `PARALLEL_*` / `CORTILE_*`. |
| `.cursor/rules/one-task.mdc` | Cursor rule: one card, stop, don't touch another lane. |
| `knowledge/event.md` | Official event facts, sponsors, judges, organiser contacts (including Mateo). |
| `knowledge/tracks.md` | The five track briefs and winning-demo lines. |
| `knowledge/idea.md` | Locked SlotRight / VeloceFix spec. |
| `knowledge/tasks.md` | Cards, lanes, prompts, timeline. |
| `knowledge/pitch.md` | 2-minute script and Grok Bot beat. |
| `knowledge/flow.md` | This file. |
| `knowledge/decisions.md` | Time-stamped decisions. |
| `knowledge/lessons.md` | Past-hackathon rules we are applying. |
| `knowledge/ideas-research.md` | Background research; do not reopen scoring. |

### To be created by the cards (do not invent extra trees)

| Path | Lane / card | What it's for |
| --- | --- | --- |
| `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` | INFRA / DEP1 | Live Next.js app on Vercel. |
| `data/seed.json`, `data/README.md` | DATA / DB1+DB3 | Two buildings (old house + new build), assets, certs, jobs; no raw phone numbers. |
| `data/cortile-map.ts`, `data/raw/` | DATA / DATA2 only if Cortile arrived | Optional map; otherwise skip. |
| `lib/types.ts`, `lib/store.ts` | DATA / DB1 | Types and load/save. |
| `lib/checks.ts`, `lib/rules.ts` | DATA / AG1 | Deterministic fact checks. |
| `lib/priority.ts` | DATA / PRI1 | P1–P4 engine + WHY + override helper. |
| `lib/twilio.ts` | API / TW1 | Signature, inbound parse, media fetch, send. |
| `lib/xai.ts`, `lib/triage.ts` | API / AG2 | Grok proposal only, then calls checks + priority. |
| `lib/parallel.ts` | API / PAR1 | Optional cited Gas Safe lookup. |
| `lib/privacy.ts` | API / SEC1 | Hash WhatsApp numbers; no PII in logs. |
| `app/api/health/route.ts`, `app/api/twilio/webhook/route.ts`, `app/api/sim/route.ts` | API / TW1 | Health + inbound + simulated thread API. |
| `app/api/ops/route.ts` | API / API2 | No-PII summary for Grok Bot ("which P1s are overdue?"). |
| `app/sim/page.tsx`, `components/thread.tsx` | UI / UI1 | Labelled simulated WhatsApp. |
| `app/dashboard/page.tsx`, `app/jobs/[id]/page.tsx`, `app/jobs/[id]/complete/page.tsx`, `components/checks.tsx`, `components/clocks.tsx` | UI / UI2 | Agency desk, completion, draft notice. |
| `app/buildings/page.tsx`, `app/buildings/[id]/page.tsx`, `app/units/[id]/page.tsx`, `components/priority-why.tsx`, `components/building-record.tsx` | UI / UI4 | Standout interactive record. |
| `components/ops-assistant.tsx` | UI / UI3 | Dashboard fallback if the real Grok Bot plugin is late. |
| `components/role-banner.tsx` | UI / SEC1 | Honest `?role=` banner, not full IAM. |
| `public/` | as needed | Tonight's demo assets; no secrets. |

The zip at `/workspace/hackathon/grok-bot-real-estate.zip` (if still present beside the folder) is an earlier snapshot, not the live project tree.
