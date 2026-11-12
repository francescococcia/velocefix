# Locked idea — repair-to-booking agent

**Locked:** 19:41 Europe/London, Thu 12 Nov 2026. Track 4. One buyer: the letting-agency property manager. Tenant WhatsApp and the operator completion form are lightweight touchpoints, not separate products.

Working title until Francesco confirms: **SlotRight**. **Recommended name: VeloceFix** (see the name shortlist below).

## Name suggestions

Earlier shortlist: SlotRight, FixGate, ReplyNow. New shortlist in the style of "VeloceFix" — fun, but instantly readable as *fast, trustworthy repairs*. Quick clash check on 12 Nov 2026 (web + Companies House hits only; not a trademark search). Flag anything obvious; absence of a hit is not clearance to incorporate.

| Name | Why it works | Obvious clash? |
| --- | --- | --- |
| **VeloceFix** (recommended) | Italian *veloce* = fast, plus Fix. Matches Francesco's example tone. | **No UK proptech or repair company found** under this exact name. Flag only a similar-sounding South African IT firm, **Velocity Fix** (web design / IT, not UK property): e.g. velocityfix.co.za. |
| **VeloceSlot** | Same "fast" root, leans into same-thread booking. | No UK company or repair brand found under this exact name. |
| **SubitoFix** | *Subito* = immediately. Very clear to Italian speakers; some UK judges may need a beat. | No UK company found under this exact name. |
| **LestoFix** | *Lesto* = quick. Fun, a little more obscure than Veloce/Subito. | No UK company found under this exact name. |
| **AndiamoFix** | *Andiamo* = let's go. Energetic, slightly less literal. | No UK company found under this exact name. |
| **SwiftSlot** | Plain English: fast booking of the right slot. | No UK company found under this exact name. |
| **SlotSure** | Trust / "sure it's right" more than speed. | No UK company found. Flag a generic app-preview page using the same string, not a UK repair firm. |
| **ProntoSlot** | *Pronto* = ready / quick, plus the slot. | **No exact ProntoSlot company found**, but **do not use ProntoFix**: [prontofix.uk](https://prontofix.uk/) is a live UK emergency plumber and electrician service. Too close. |

**Do not use** (clear clashes): **ProntoFix** (UK emergency trades, above); **PrestoFix** / PRESTOFIX LIMITED, Companies House 10619681; **RapidoFix** / RAPIDOFIX LTD, Companies House 16645461, Birmingham, specialised construction, incorporated 12 Aug 2025, https://find-and-update.company-information.service.gov.uk/company/16645461; **VeriFix** / VERIFIX LIMITED, Companies House 11575879.

**Recommendation: VeloceFix.** It is the one Francesco already reached for, it says "fast fix" in one glance once you hear *veloce*, and the quick search found no UK property or repair firm with that exact name. If a judge might not get the Italian, say it once: "VeloceFix — fast, but only when the facts check out." Runner-up if we want plain English: **SwiftSlot**.

### Mascot (3 concepts)

Use one small character on the dashboard and in the Grok Bot "Repairs desk" intro. The mascot is a skin, not a substitute for showing the real Grok Bot product (see pitch.md).

1. **Velo** (recommended if the product is VeloceFix) — a little wrench with a racing stripe and a calm face, not a hyperactive cartoon. Line: *"Fast is good. Right is better."*
2. **Tick** — a small robot whose face is a green check, one arm a spanner. Line: *"I don't book it until the facts check out."*
3. **Pip** — a shy pipe-and-spanner character who points at the source URL. Line: *"If I can't cite it, I won't dispatch it."*

## Plain-English recap

Letting agencies often log a tenant's repair and then go quiet: Francesco waited days for a reply about a stuck hot-water tap, and weeks for any answer about a broken floor, even after photos went in. A chatbot that only looks at the message cannot tell whether this is an emergency in an old house in winter or a known niggle on a new-build still under warranty, and it cannot safely book a trade. VeloceFix (working title SlotRight) is a desk for the agency property manager: the tenant WhatsApps a photo, Grok proposes what is wrong, deterministic code checks the building record and cited UK rules, sets a transparent priority, and — only if every fact is green — offers a contractor slot in the same conversation. When the operator finishes the job, a short form writes a verified history and drafts a tenant update that is not sent automatically.

## One-liner

A letting-agency desk that takes a tenant WhatsApp (photos included), verifies the facts against the building record and cited UK rules, offers a contractor slot in the same conversation, and writes a verified unit history when the operator completes the job.

## Named user and the problem

**Buyer / named user:** Priya, property manager at a UK letting agency (the only customer we sell to).

**The problem (Francesco's real experience as a tenant in an old house — tell it as the agency's failure):**

- A **broken floor**: photos went in through the agency portal; **no answer for weeks**.
- A **sink hot-water tap stuck open**: the household had to shut off the hot water; the agency replied **days later only to ask for availability**.

Existing portals log the issue and delay the only question that matters (a slot). ChatGPT-on-a-photo cannot check s.11 responsibility, tenure, or whether the plumber is Gas Safe. We do not claim "triage does not exist" (Fixflo Aidenn already triages). We claim: **verify, then book in the same thread, then close the loop into a cited unit history.**

## Track choice: Track 4 · Operations, inspections, energy

**Id:** `asset-management`  
**Title:** Asset and property management  
**Official summary:** "Help teams run, inspect and audit properties with less manual reporting."

From the official brief (`knowledge/tracks.md`):

- **What to build** includes: "A property-management copilot over tenant requests, maintenance and arrears."
- **How it's judged:** "Quality of the structured record. Actions a property manager would take. Time saved per property."
- **Winning demo (official):** "Walk a property or replay a tour: photos, notes and discussion become a structured record a manager can act on, with a prioritised action list."

We submit **Track 4**, not Open. This is the copilot-over-tenant-requests bullet, not a leftover idea. If a judge asks why we didn't walk the building (the winning-demo script), the answer is: the structured record and the action list here are the booked job and the operator completion history, grounded in two real repairs. Do not flinch into Track 5.

## The scenario (what the demo tells)

Priya's agency manages two private buildings: an **old/period house** (Francesco's stories) and a **new-build flat still under warranty**. A tenant in the old house WhatsApps a photo of the stuck hot-water tap ("we've shut the water off"). Grok (xAI) proposes issue, room, hazard, responsibility, and trade. A **deterministic priority engine** (code, not the model) scores it **P1**: it is winter, the boiler is 14 years old, the unit record flags a vulnerable occupant (agency policy flag — see below), and there is no hot water. The WHY panel lists every rule that fired, with its source. Deterministic fact checks still have to go green before a slot is offered. Because this is a **private** let, the response clock is an **agency policy** clock, not Awaab's Law. WhatsApp offers tonight/tomorrow slots; the tenant replies 1, 2 or 3.

The standout beat: the **same words** ("no hot water") on the new-build unit come back **P3 / route to the developer**. The building is under warranty, the boiler is new, there is a known intermittent ticket, no vulnerable-occupant flag. The code does not emergency-dispatch a contractor. Priya can override; the override is logged.

The dashboard then opens the old house: type, age, boiler make/age, Gas Safe and EICR dates, previous works, the overdue **floor** job, and SLA/policy clocks. One beat shows a **blocked** booking (not Gas Safe) becoming a question back. After the tap job, the operator completion form writes verified history; the tenant notice is **drafted, not sent**.

## Architecture

```
Tenant WhatsApp
    → Twilio WhatsApp sandbox (inbound webhook, HTTPS)
    → Next.js route on Vercel  /api/twilio/webhook
    → store message + media
    → Grok (xAI API) proposes triage (issue, room, hazard, responsibility, trade) — proposal only
    → deterministic priority engine (lib/priority.ts) assigns P1–P4 and lists every rule that fired
    → deterministic TypeScript fact checks vs seed/Cortile record + cited rules
    → if all green and bookable: offer numbered slots; tenant picks; job booked
    → if any red: question back; do not offer slots
Agency dashboard (Priya)
    → all units, jobs, SLA/policy clocks, overdue, audit trail
    → Grok Bot ops assistant (see below)
Operator touchpoint
    → /jobs/[id]/complete  (magic link, not a second product)
    → questionnaire writes verified history
    → draft tenant notification, Send disabled
```

**Twilio WhatsApp sandbox (official, do this exactly):**

- Docs: https://www.twilio.com/docs/whatsapp/sandbox — activate in the **legacy** Console (Sandbox is not in the new Console). Trial users can also use "Try out WhatsApp."
- Shared sandbox number: **+1 415 523 8886** (`whatsapp:+14155238886`).
- Each tester texts **`join <your-sandbox-code>`** (the code is unique and shown in Console) or scans the Console QR. They must re-join every **3 days**. Messaging a number that has not joined fails with **error 63015**.
- Inbound webhook: set **When a Message Comes in** (Sandbox settings → Sandbox configuration) to `https://<vercel-app>/api/twilio/webhook` (HTTP POST). Twilio sends `application/x-www-form-urlencoded` with `From`, `Body`, `NumMedia`, `MediaUrl0`, `MediaContentType0`, etc. (https://www.twilio.com/docs/messaging/guides/webhook-request). Fetch media with Twilio basic auth. WhatsApp inbound is typically one image per message.
- **24-hour customer service window:** starts when the user messages you (including `join …`). Inside the window you may send free-form text and media, no template. Outside it, sandbox outbound is limited to Twilio's pre-approved templates. **Demo rule:** Francesco (or the judge phone) sends a WhatsApp message first, then we reply. Do not rely on an unsolicited template. (https://www.twilio.com/docs/whatsapp/sandbox, https://help.twilio.com/articles/360017773294)
- Limits: one outbound every 3 seconds; trial accounts have a small included WhatsApp bundle. Sandbox shows the Twilio logo — say that on stage.
- Validate `X-Twilio-Signature` on the webhook.

**Fallback if the sandbox fails** (join expired, webhook not reachable, UK delivery, media fetch): an in-app **simulated WhatsApp-style thread** at `/sim`, labelled **"Simulated WhatsApp — Twilio sandbox unavailable"**. Same API as the webhook. Never pretend a simulated thread is live WhatsApp.

## Grok Bot — keep the judging criterion visible

The advertised criterion is **"Effective use of Grok Bot and Cursor"**, not "we called the xAI API."

- **Cursor:** how the repo is built (local + cloud agents). Mention it once in the pitch; the live URL is the proof.
- **xAI Grok API:** the triage brain behind WhatsApp (proposal only; it does not get to book).
- **Grok Bot the product** (https://github.com/adamanz/grok-bot-skill, https://x.ai/bot/guides/templates-for-grok-bot, https://docs.x.ai/grok-bot/bots): Priya's **ops assistant**. Create a Grok Bot ("Repairs desk") that can read a public, no-secret `GET /api/ops` summary (overdue jobs, pending approvals). On stage, Priya asks Grok Bot "what's overdue on the old house?" If a skill/plugin cannot be wired in time, the **dashboard copilot** uses the same `/api/ops` + xAI, clearly labelled, and we still open the real Grok Bot with the bot instructions and the live URL pasted — honest, not faked. Do not skip this and hope "we used Grok" is enough.

## Sponsors and partners tonight

From `knowledge/event.md`. Depth on **Grok Bot + Cursor** (required) and **one of Parallel or Cortile data**. Do not take on three new integrations plus Twilio without fallbacks.

| Partner | What they offer tonight | We use? | How / why skip |
| --- | --- | --- | --- |
| **Grok Bot by SpaceXSI** | The teammate product; skill, templates, marketplace | **Yes — required** | Ops assistant for Priya (dashboard + real Grok Bot). xAI API is the WhatsApp triage brain. |
| **Cursor** | Build tool; prizes are Cursor Ultra | **Yes — required** | Local UI lane + cloud agent on the webhook/API lane. |
| **Parallel** | Credits (amount TBC); Search / Extract / Task + MCP | **Yes — depth, if the key is in hand by ~20:00** | One cited check: Gas Safe register / official page, or a cited local-trade lookup. Time-box 20 minutes. If the key is late, use the seeded contractor `gasSafeLicence` and show it as a deterministic check, not a fake live lookup. |
| **Cortile** | Synthetic JSON + read-only API: ~300 developments / 1,000+ buildings, leases, occupancy, service charges, **compliance and maintenance**. Claim in Discord after Luma check-in. | **Yes — if the JSON actually has units / maintenance-shaped records, by ~20:00** | Map a subset into our seed (one building, two units). If the schema doesn't fit (no assets, no contractors), **skip without guilt** and use our honest seed of Francesco's house. Do not block the build on Discord. |
| **Supabase** | Participant credits (Luma; amount TBC) | **Skip for v1** | Extra integration on the critical path. Local JSON on Vercel is enough tonight. Revisit after 22:10 only if the app is already solid. |
| **MSCI RCA** | Licensed deal/comp data, MCP or Snowflake; event-use only, no repo | **Skip** | Wrong problem; licence risk. |
| **Dwelly** | 50 synthetic letting-agency cases in Drive | **Skip unless a case is an obvious repair ticket opened in 5 minutes** | We already have two real stories to seed. Don't wait on Drive. |
| **V7 Go** | Multi-step document agents, page citations | **Skip** | Don't compete with the venue on extraction; photos are evidence, not a V7 workflow. |
| **Cognee** | Agent memory, MCP | **Skip** | Fourth integration; no time. |
| **Twilio** | Not a listed sponsor | **Yes, as the tenant channel** | WhatsApp sandbox only. Not a sponsor bounty. |

## In scope (MVP)

- WhatsApp inbound (text + photo) via Twilio sandbox, or the labelled `/sim` fallback
- Grok proposal + deterministic **priority engine** (P1–P4 with a visible WHY) + fact checks (unit exists, room, s.11 responsibility, tenure-correct clock, trade vs contractor certification, slot still free)
- Auto-offer slots only when all checks are green; otherwise a question back. P1 still cannot auto-book a non-Gas-Safe engineer for gas work.
- Tenant picks a slot by replying 1/2/3
- Interactive building/unit dashboard: old house + new-build contrast, assets, certs, history, open jobs, policy clocks
- Agency job list: overdue floor, audit trail, logged human override
- Operator completion questionnaire (photo, cause, parts, fixed, follow-up) writing unit history
- Draft tenant notification, Send disabled
- Grok Bot / ops assistant path as above
- Honesty banners (sandbox, simulated fallback, private let, seeded slots, synthetic or tonight's photos)
- Public repo, MIT, `.env.example`, live Vercel URL

## Out of scope

- A second tenant or contractor "app" or marketplace
- Live SMS, payments, owner approvals, quote comparison
- Applying **Awaab's Law 24-hour / 10-day clocks to a private tenancy** (not in force for PRS; consultation open until 18 Dec 2026 — see `ideas-research.md`)
- ML "learning" loops
- MSCI, Cognee, V7, Supabase on the critical path
- 3D, inspection walk (that's Idea B, not this lock)
- Sending the completion WhatsApp for real unless we are clearly inside the 24-hour window and have time after the core path works

## Data model (seed JSON)

`buildings[]` (id, name, tenure: `private` | `social`, type: `period` | `new_build`, yearBuilt, address, warrantyUntil?)  
`units[]` (id, buildingId, label, tenantWaHash — store a hash for routing, not the raw number in exports; `vulnerableOccupant`: agency-policy flag, default false)  
`assets[]` (id, unitId or buildingId, type, make, yearInstalled, gasSafeCertDate?, eicrDate?, eicrExpiry?, warrantyUntil?, notes)  
`works[]` / job history (id, unitId, date, trade, summary, source: `seed` | `completed_tonight`)  
`contractors[]` (id, name, trade, gasSafeLicence?, availableSlots[])  
`jobs[]` (id, unitId, source, status, priority, priorityWhy[], checks[], slot?, override?, history[])  
`messages[]` (jobId, direction, body, mediaUrl?, at)  
`roles` for the dashboard: `agency` | `operator` | `viewer` (viewer sees no phone numbers or raw WhatsApp).

Seed tonight: **two private buildings** — (1) an old/period house (Francesco's tap + overdue floor, 14-year-old boiler, Gas Safe and EICR dates, vulnerable-occupant flag on that unit, labelled agency policy); (2) a new-build flat under developer warranty, new boiler, a known intermittent no-hot-water ticket, no vulnerable flag. One Gas Safe plumber, four slots. Vulnerability, winter-season window, and P1–P4 clocks are **agency policy** unless a statute is cited on the row.

## Fallbacks

| If this fails | Do this |
| --- | --- |
| Twilio join / webhook / UK delivery / media | `/sim` labelled simulated WhatsApp, same backend |
| xAI down | Rule-based triage from keywords (tap/boiler/floor) + still run deterministic checks |
| Parallel key late or Gas Safe page blocked | Seeded `gasSafeLicence` check only; say so |
| Cortile schema useless or login late | `data/seed.json` only; say so |
| Grok Bot plugin not wired | Dashboard copilot + open the real Grok Bot on the live URL; don't fake a plugin |
| Photo fetch needs auth and breaks | Accept caption-only + a stock or tonight photo already in `/public` |

## Honesty and privacy (say out loud)

- Tenant phone is a **test number** that joined the Twilio sandbox; the WhatsApp thread may show Twilio's logo.
- If we cut to `/sim`, say **"simulated WhatsApp."**
- The house is seeded from Francesco's two stories; availability slots are **seeded**, not a live plumber calendar.
- Tenure is **private**; clocks are **agency policy**, not Awaab's Law.
- Notifications after the job are **drafts, not sent**, unless we explicitly stay inside the 24-hour window and say we sent a sandbox reply.
- Photos: stored on our app for the demo, not posted publicly, not sent to MSCI or a model-training pile. No contractor personal data beyond the seed name and licence.
- The second building (new build), cert dates, boiler age, and the **vulnerable occupant** flag are **seeded** for the contrast. The flag is an **agency-policy** input, not a medical record and not a full HHSRS assessment.
- We map issues to official HHSRS *hazard types* as labels. We do **not** compute a statutory HHSRS score.

## 2-minute demo script (click cues)

1. **0:00–0:15 — problem.** Priya, agency PM. *Don't click yet.* "A tenant in this old house shut the hot water off; we wrote back three days later to ask when they were free. A floor with photos sat in the portal for weeks." A generic AI chat cannot see the building.
2. **0:15–0:40 — live WhatsApp, old house.** *Phone already joined the sandbox, 24h window open.* Send the tap photo + "no hot water, we shut the water off." *Cut to the thread / job.* Grok proposes; the **priority WHY** shows P1 (winter, 14-year boiler, vulnerable-occupant flag, no hot water) with sources. Checks green. *Reply `1` to book.*
3. **0:40–0:55 — the contrast.** *Click the new-build unit (or send the same sentence from that unit's test number /sim).* Same words, **P3**, warranty / developer responsibility, known intermittent issue. No emergency dispatch. "The model proposed; the code decided."
4. **0:55–1:10 — blocked path.** *Click the red Gas Safe row* (or a gas-smell path that must not auto-book). Question back, not a dispatch.
5. **1:10–1:35 — building dashboard.** *Click the old house.* Type, year, boiler make/age, Gas Safe and EICR dates, previous works, overdue floor, policy clocks. *One click* on a fired rule to show its source URL.
6. **1:35–1:50 — close the loop.** *Completion form.* History updates. Draft tenant message, Send disabled. If time: *Grok Bot* — "what's overdue on the old house?"
7. **1:50–2:00 — honesty + Ares line.** Seeded two buildings and slots; private let; clocks are agency policy; sandbox or simulated thread; drafts only. If Erik is in the room: "This is the record an asset manager would want when a third-party PM is running the building — every priority is cited, and the model cannot rewrite the rules."

If WhatsApp dies mid-demo: *click `/sim`*, say the fallback line, run the same beats. Have the backup video on the live URL already open.


## Priority engine (deterministic; Grok proposes, code decides)

Grok may propose a hazard type, room, and a suggested urgency. **It does not set the priority.** `lib/priority.ts` is a pure function: `prioritise(inputs) → { level, clock, destination, rulesFired[] }`. A human override is allowed and **logged** (who, when, from, to, reason). Tenant WhatsApp text is never interpolated into the rule table (see Security).

### Levels

| Level | Meaning | Private-let clock (default) | Source of the clock |
| --- | --- | --- | --- |
| **P1 Emergency** | Immediate safety or habitability risk | Attend / make safe on an **agency policy** clock (seed: same day / 24h). Offer slots only after fact checks are green. Gas smell or suspected gas leak: **do not auto-book** — instruct the tenant to call the Gas Emergency Services on 0800 111 999 and use a Gas Safe engineer. | Clock = **agency policy**. Informed by, but not equal to, statute. Private landlords must repair heating/hot water and installations in a "reasonable time" (s.11 LTA 1985; GOV.UK repairs page). Shelter Legal notes that heating/hot water is often an emergency and that what is reasonable can depend on the time of year (e.g. a boiler repair is more serious in winter): https://england.shelter.org.uk/professional_resources/legal/housing_conditions/responsibility_for_repairs/heating_hot_water_and_power_problems (updated 23 Jun 2026). **Awaab 24-hour emergency duties apply to social housing**, not to these private seed buildings: https://england.shelter.org.uk/housing_advice/repairs/emergency_hazards_council_housing_association |
| **P2 Urgent** | Significant loss of amenity, or a hazard that is serious but not an immediate danger | Agency policy (seed: 48 hours / 3 working days) | **Agency policy.** s.11 "reasonable time" still applies; we do not invent a statutory 48-hour rule. |
| **P3 Routine** | Book in the diary; or route away from emergency dispatch (e.g. new-build under warranty, known intermittent, developer responsibility) | Agency policy (seed: 5–7 working days) or "refer to warranty / developer" | **Agency policy** plus, where relevant, the building's warranty record in the seed (not a statute). |
| **P4 Planned** | Certificates coming due, end-of-life plant, non-urgent improvements, capex | Planned window | Gas Safe annual check and Gas Safe-registered engineers are statutory: https://www.gov.uk/private-renting/your-landlords-safety-responsibilities and https://www.hse.gov.uk/gas/gas-safe-register-check.htm. EICR at least every five years in England: https://www.gov.uk/government/publications/electrical-safety-standards-in-the-private-and-social-rented-sectors-guidance and https://www.legislation.gov.uk/uksi/2020/312. The *planning* of a future boiler replacement is **agency / owner policy**, not a statute. |

If `tenure === "social"`, emergency hazards may use Awaab clocks, labelled as such, with the regulation cited. **Do not put Awaab clocks on the private seed.**

### Inputs (each one appears on the WHY panel if it fired)

| Input | How we use it | Source vs policy |
| --- | --- | --- |
| Hazard type | Map the issue to an official HHSRS-style hazard label (e.g. excess cold, electricity, fire and explosions, damp and mould, structural collapse and falling elements, intruders, water supply). We **do not** calculate a Category 1/2 score. | Hazard list: official tenant guide, updated 16 Sep 2026, 21 types — https://www.gov.uk/government/publications/housing-health-and-safety-rating-system-hhsrs-tenant-guide/tenant-guide-to-the-housing-health-and-safety-rating-system-hhsrs. Housing Act 2004 Part 1 is the enforcement framework. Older operating guidance used 29 hazards; use the current GOV.UK list. |
| Season | No heat or no hot water in **winter** (agency window: 1 Oct–31 Mar, labelled) escalates toward P1 when combined with a working heating/hot-water failure. | **Agency policy**, informed by Shelter Legal on "reasonable time" varying by season (URL above) and HHSRS **excess cold**. Not a statutory date window. |
| Tenant vulnerability | A boolean `vulnerableOccupant` on the unit. If true, a heating/hot-water or electrical hazard is escalated one level (P3→P2, P2→P1) unless already P1. | **Agency policy flag in the seed.** Official HHSRS assesses against a *vulnerable group for that hazard* (often not the actual household), except overcrowding: see the same tenant guide, §6.5. We are not running that assessment and must say so. |
| Property type / age | Period / old house vs new build. Age can escalate (old plant, no warranty) or de-escalate when the building is new and still under developer warranty. | **Agency policy** using the building record. |
| Asset history | Boiler make, year installed (seed: 14-year-old boiler in the old house; new boiler in the new build). Repeated failures on the same asset escalate. A known intermittent ticket on a new appliance, with no new evidence, does not escalate to P1. | **Agency policy** on the asset record. Gas work still requires a Gas Safe engineer (statute, URLs above). |
| Warranty | If `warrantyUntil` is in the future and responsibility is developer / warranty, destination = "refer to developer"; priority caps at P3 unless a P1 safety override fires (gas, electrical danger, active flood, insecure entry). | **Agency policy** plus the seed warranty date. |
| Responsibility | s.11 landlord duties for structure, heating, hot water, gas, electrical installations; tenant-like minor acts stay with the tenant; warranty as above. | s.11 LTA 1985: https://www.legislation.gov.uk/ukpga/1985/70/section/11. GOV.UK: https://www.gov.uk/private-renting/repairs. Fitness for human habitation (s.9A LTA 1985 / Homes (Fitness for Human Habitation) Act 2018) is a duty, not a 24h clock. |
| Repeat / open job | An unanswered older job (the floor) stays visible and can go overdue on its own policy clock; it does not steal the new P1 slot. | **Agency policy.** |

### Default P1 triggers (all must still be fact-checked)

Active escape of water / flood; no heat or no hot water in the winter window; gas smell or suspected leak (plus the 0800 111 999 instruction, no auto-book); electrical danger (burning, exposed live, shock); insecure entry after a break-in (HHSRS "intruders"). Anything not in this list is not P1 unless a logged human override says so.

### WHY row shape (show on screen)

`{ ruleId, fired: true, inputsUsed, effect, sourceType: "statute" | "official_guidance" | "agency_policy", sourceUrl?, sourceNote }`

Example, old-house "no hot water" in November: `S11_HOT_WATER` (statute, s.11) + `SEASON_WINTER` (agency policy, Shelter-informed) + `ASSET_BOILER_AGE` (agency policy, 14-year boiler) + `VULNERABLE_OCCUPANT` (agency policy flag) → **P1**. Same text on the new build: `S11_HOT_WATER` + `WARRANTY_DEVELOPER` + `KNOWN_INTERMITTENT` + no winter+vulnerability escalation → **P3 / refer to developer**.

## Dashboard spec (the standout)

Interactive, not a static screenshot. Two seeded buildings, drill-down to a unit, then to a job.

**Portfolio strip** (Ares-shaped, still one product): two buildings, open P1–P4 counts, overdue jobs, upcoming Gas Safe / EICR dates. No second app.

**Building page:** name; type (period / new build); year built; tenure (private); warranty if any; list of units; shared assets if any; open jobs with priority badges and policy clocks.

**Unit page (all info needed for a trustworthy triage):**

- Occupancy context: vulnerable-occupant flag shown as **agency policy**, not a diagnosis. No raw phone number on the `viewer` role.
- Assets: boiler make, year, age in years; Gas Safe cert date / next due; EICR date / expiry (5-year statutory rhythm in England, cited).
- Previous works and repair history (seeded past jobs + anything completed tonight).
- Open jobs with P1–P4, WHY, fact-check rows, assigned trade, slot, overdue state.
- "How the same ticket would score elsewhere" — a one-click compare that reapplies the engine to the other building's record (the demo contrast).

**Job page:** Grok proposal (clearly labelled proposal), code decision, WHY, checks, override control, WhatsApp or `/sim` thread, completion + draft notice.

If a rule did not fire, do not hide it in a pile of green noise; show the fired rules first, with a "all rules" toggle.

## Security

- **Identity:** inbound WhatsApp `From` is matched to `units.tenantWaHash` (hash the number at write; do not log the raw number). Unknown numbers do not get unit history or other tenants' data; they get a "we can't match this number to a tenancy" reply.
- **PII in logs:** application logs record job id, unit id, direction, and media presence — not names, addresses, or phone numbers. `/api/ops` stays no-secret and no-PII.
- **Photos:** stored privately on the app (not in the public repo, not on `/api/ops`, not posted to a model-training pile). Accessible to `agency` and to the assigned `operator`.
- **Outbound:** no auto-send to anyone except a reply on **that tenant's own thread**, and only inside the 24-hour WhatsApp window. Completion notices stay **drafted, Send disabled**, unless we explicitly send a sandbox reply and say so.
- **Prompt-injection:** tenant text and photo captions are untrusted input to Grok only. The model returns a constrained JSON proposal. `lib/priority.ts` and `lib/checks.ts` do not read free text to change thresholds. A tenant cannot raise or lower priority by writing "this is P1" or "ignore the warranty."
- **Roles:** `agency` (full desk), `operator` (assigned jobs + completion only), `viewer` (portfolio + building record, no PII, no send). Tonight a `?role=` demo switch plus a visible banner is enough; say it is not full IAM.
- **Webhook:** validate `X-Twilio-Signature`. Do not trust spoofed `From` without it.

## Ares / Erik pitch notes (public sources only)

Francesco spoke with Erik; **the content of that conversation is not in our sources** and is not invented here. Everything below is from public pages, or is labelled as our sell inference.

### Who Erik is

- Official Ares bio (fetched 12 Nov 2026): Managing Director, Stockholm. "Mr. Starck is a Managing Director in the **Ares Technology and Engineering Group**. Prior to joining Ares in 2024, Mr. Starck was the Head of the BootstrapLabs Venture Studio for Future of Work." Previously co-founder of Essentor AB, GlocalReach Ltd, Lean Forward AB and Startup Studio Malmö AB; consultant at IKEA and Sony on business development and digital transformation; hosted a YouTube show, Hackernytt, on startups; M.Sc. Software Engineering, Blekinge Tekniska Högskola. https://www.ares.com/us/who-we-are/our-people/erik-starck and https://www.ares.com/se/who-we-are/our-people/erik-starck-806003
- **Title conflict (do not silently resolve):** those official bios say Technology and Engineering Group. This hackathon lists him as "Managing Director, AI and Innovation Technology" (`knowledge/event.md`). Public LinkedIn is https://www.linkedin.com/in/erikstarck/ — the profile itself was not reliably fetchable (LinkedIn often blocks). Search-index snippets give the same "AI and Innovation Technology" title and an About line, "I implement AI to make organisations more human." Treat the About line as **unverified without a logged-in profile view**.
- Earlier public writing: in 2010 he described himself as a professional programmer since 1998, M.Sc. Software Engineering, then in Stockholm — https://www.softwaresweden.com/about-the-blog/. We did not find a recent long interview or talk *by Erik* on real-estate AI; do not invent one.

### What Ares Real Estate owns or operates (cited; conflicts noted)

- Marketing site: Ares Real Estate is a "global investment and operating platform" across the Americas, Europe and Asia-Pacific; **$126.4B** AUM (footnote as-of date **not visible** in the page fetch); **720+** investment and operating professionals; **4,000+** global properties. Thematic sectors include **logistics, multifamily, self-storage and data centres**. "Vertically integrated platform" and in-house operating platforms are part of the public pitch. https://www.ares.com/uk/businesses-and-products/our-businesses/real-estate
- **AUM conflict:** Ares FY2025 10-K: real estate team managed **$113.8B** AUM, 740+ professionals, over 85 vehicles, as of **31 Dec 2025**; portfolio "primarily allocated to industrial, multifamily and adjacent sectors." Logistics is vertically integrated under the **Marq Logistics** brand. A 2 Apr 2026 IR/CoStar release on US XI and EPEP IV (value-add, US and Europe, including multifamily) also uses **~$114B** as of 31 Dec 2025. Do not pick $126.4B or $114B without saying the dates disagree. https://www.sec.gov/Archives/edgar/data/1176948/000162828026011413/ares-20251231.htm — https://ir.ares.com/news/ares-raises-combined-dollar54-billion-for-us-and-europe-value-add-real-estate-strategies/bc103f39-515b-456b-8375-21d00d4a20cc
- **UK residential, appointed third-party managers (strongest local proof):** after an Ares Real Estate Fund acquired a north-Birmingham estate (Handsworth Wood / Browns Green, ~3 miles from the centre), **Addington and AddLiving were appointed as asset and property managers**. Addington describes nine low-rise blocks of **529 privately let apartments** plus a student campus of **665 beds** and a listed hall, c. 450,000 sq ft. https://addingtoncapital.com/addington-and-addliving-appointed-by-ares-management-as-asset-and-property-managers/ A trade write-up dated **27 Oct 2025** covers the same campus (Browns Green and Ham Cam / Hamstead Hall) with a **slightly different student-bed split** (525 beds plus a majority-vacant 135-bed building). Cite both; do not invent a reconciled bed count. https://www.tigerlime.com/2025/10/27/ares-and-addington-acquire-handsworth-wood-pbsa-campus/
- Other UK residential mentions exist in the press (e.g. Kampus BTR in Manchester, historically Ares-backed; later sale talks reported). **Do not claim current ownership** without a confirmation Ares has not given. Ares' own US multifamily *operating-company* brand was **not found** in tonight's search (TBC). Marq is logistics, not residential.

### AI / innovation priorities (firm-level; not Erik quotes)

- Feb 2024: Ares acquired BootstrapLabs to build an AI & Innovation Group that would "build proprietary AI solutions and partner with industry-leading vendors to help drive efficiencies for Ares' portfolio companies, **assets** and certain investment processes and business operations." Official fireside, 15 Oct 2024: https://www.ares.com/us/news-and-insights/perspectives/fireside-chat-ai-innovation
- Nicolai Wadstrom (Co-Head, Venture Capital and AI & Innovation): start with a **foundation**, not speed without structure; go **deep in one area** first (one portfolio company, one investment strategy, one operations area) then scale; focus on **human augmentation, automation, and product/service innovation**; four workstreams — investment portfolio, investment process, investment experience, business operations; apply AI "inside Ares and at the firm's portfolio companies & assets globally." Same fireside URL.
- David Roth (quoted as partner / global head of real estate) at NYU Schack, 26 Mar 2026, CoStar: still "early innings"; a large owner's edge is **using data from its own portfolio, but only if you can access it**; "We're building the tools … to make us better investors, better [real estate] owners … better communicators." https://www.costar.com/article/2048429024/new-edge-for-reits-a-larger-ai-toolbox
- CEO Michael Arougheti (public remarks): AI is being pushed into portfolio companies, front-office decision-making, and non-investment functions — but they are **not displacing systems of record** that are core to workflows. https://www.youtube.com/watch?v=69LrFChaFO0

### How to sell SlotRight to Ares

**Tonight's product user stays Priya (the PM).** The Ares buyer is not a second app. It is the **asset manager who oversees third-party PMs / operating partners** on residential and living assets (the Addington/AddLiving pattern is the proof that this relationship exists in the UK). What that AM cares about, in our framing (inference, not an Ares quote): portfolio repair SLAs, overdue jobs, capex (ageing boilers), compliance evidence (Gas Safe, EICR), tenant retention, NOI leakage from slow or wrong dispatch, and a record that would survive an investor or ESG question.

Sell it as:

1. **Access to operating data** — Roth's point: the advantage only exists if you can see the portfolio. The two-building strip and unit history are a sketch of that access, with every priority cited.
2. **Human augmentation, not an unsupervised agent** — Wadstrom's language. Grok proposes; deterministic code decides; a human override is logged. The model cannot rewrite the rules (prompt-injection).
3. **Do not replace the system of record** — Arougheti. SlotRight sits in the tenant's WhatsApp and on the PM desk, and *writes back* a verified history; it is not a new core ledger.
4. **Go deep on one operations slice** — repairs triage and booking — then roll up for the AM. That matches "deep in one area first."
5. **Be honest about policy vs statute.** An Ares MD with a software-engineering background will notice if we put Awaab clocks on a private let.

Do **not** claim Ares will buy tonight, that we have Ares data, or that we already run Handsworth Wood.

### Three pitch lines for Erik

1. "The same 'no hot water' message is P1 in a 14-year-old house in winter, and P3 on a new build still under warranty — and you can see every rule that fired, with its source."
2. "Grok proposes; TypeScript decides. A tenant cannot talk the model into changing the SLA, and a manager can override only with a logged reason."
3. "When you appoint a third-party PM, this is the record the asset manager should be able to open: certs, plant age, open SLAs, and a history that was written when the job was closed — without replacing their system of record."

### Proof he would want

- Live WHY panel, not a slide; click a rule, see statute vs agency policy vs official guidance.
- The contrast ticket (old house vs new build) computed by the same function.
- A blocked illegal dispatch (not Gas Safe / gas smell).
- An override log.
- Public repo he can skim (`lib/priority.ts` is short and boring on purpose).
- No PII in `/api/ops` or server logs; photos private; roles visible.
- Honesty about seeded buildings, seeded slots, and the sandbox.
- Optionally, Grok Bot answering "what's overdue?" off the no-PII ops feed — technical substance, not a logo.

## Judging criteria (qualitative — no scores)

Advertised five, unweighted. Map each to a concrete moment, then say where we are strongest and how to lift the weakest.

| Criterion | Demo moment | Notes |
| --- | --- | --- |
| **Relevance to a real estate problem** | Open with Francesco's tap and floor, told as Priya's failure; Track 4 copilot-over-tenant-requests. For Ares judges, add the AM-over-PM line and the two-building strip. | This is naturally strong if we stay on one buyer and do not claim triage "doesn't exist." |
| **Quality of execution** | A real (or honestly labelled simulated) WhatsApp book-in-thread; a building page that is actually clickable; no dead buttons; Send disabled on drafts. | This is the risk if Twilio or the UI is rough. Lift: live URL early, `/sim` rehearsed, two buildings finished, one backup video. |
| **Effective use of Grok Bot and Cursor** | Say Cursor once (parallel agents, public repo). Show Grok proposing on the job. **Then open the real Grok Bot ops assistant** (or the labelled dashboard copilot + the real bot with the live URL) for "what's overdue on the old house?" | This is the **weakest** criterion if we only show WhatsApp + the xAI API. WhatsApp hides Grok Bot. Lift: do not skip the ops-assistant beat, even for 10 seconds. |
| **Traceable data** | WHY panel: each fired rule has `sourceType` and a URL. Fact-check rows. Completion writes history. Seed vs tonight clearly labelled. | Can become a *strength* if the WHY is visible. Lift: never show a priority without a source; never mark agency policy as law. |
| **Practical usefulness** | Book a P1 in the same thread; do not emergency-dispatch the warranty ticket; draft the close-out; overdue floor still visible. | Strong if the contrast is live. Lift: one logged override so a PM can see they remain in charge. |

**What we should be best on:** relevance and practical usefulness (a named, real repair problem and a decision a PM — or an AM watching a PM — would actually take). **Traceable data** is the one we can *make* excellent tonight with the priority engine. **Weakest unless we work it:** effective use of Grok Bot and Cursor. **Execution** is only as strong as the live path; the labelled `/sim` fallback is how we protect it.
