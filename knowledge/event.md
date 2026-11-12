# Grok Bot Real Estate Hackathon London — event facts

Scraped 12 Nov 2026, about 18:48 Europe/London (UTC+0). Facts below are from official sources only. Anything not found is marked **TBC**. Conflicts are called out in the Conflicts section, not silently resolved.

All times are **Europe/London**. On 12 Nov 2026 London is UTC+0, so these clock times match UTC.

## Event

- **Name:** Grok Bot Real Estate Hackathon London
- **Date:** Thursday 12 November 2026, 18:00–00:00 (closes Friday 13 November 00:00)
- **Venue:** V7, 60 Margaret Street, London W1W 8TF
- **Host / co-organisers:** Francisco Terpolilli (EU Ambassador · SpaceXSI); Mateo Luca-Lion (Founder · Whitebox_ · Tavio)
- **Calendar:** SpaceXSI for London, England (Luma calendar slug `spacexai-london`)
- **Capacity:** places limited to 60–80; admission was by application. Luma (as of scrape): 97 going, sold out, waitlist active. Luma notice: entry is now first come, first served until capacity; arrive early. Luma QR code required at the door.
- **Format:** in person. Solo or teams of up to 5 (teams can also form at kick-off).
- **Theme:** build AI agents for real estate's most document-heavy workflows. Problem statements developed with Ares' Real Estate team. Luma: "Ares Management's involvement is limited to providing problem statements and judges."

## Schedule (Europe/London)

Agreed by Luma and the official site:

| Time | What |
| --- | --- |
| 18:00 | Doors open and networking @ V7 |
| 18:15 | Kick-off (site: Kick-off & tracks) |
| 18:30 | **Hacking begins** |
| 19:30 | Dinner (hacking continues) |
| 22:30 | 30-minute warning |
| 23:00 | **Code freeze and video submissions** via the submission portal |
| 23:30 | **Top 5 live demos, 2 minutes each** |
| 23:40 | Final judging and awards |
| 00:00 | Close |

- **Hacking start:** 18:30 Europe/London, Thu 12 Nov 2026
- **Code freeze:** 23:00 Europe/London, Thu 12 Nov 2026
- **Submission deadline:** 23:00 Europe/London, same moment as code freeze. One submission per team; you can resubmit until 23:00; each update replaces the entry (no duplicates).
- **Submission form:** https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/submit
- **Demo slot length:** 2-minute video at freeze; Top 5 also present live for 2 minutes each
- **Finalist demo time:** 23:30 Europe/London, Thu 12 Nov 2026
- **Awards:** 23:40 Europe/London

The judge portal flags a submission as "after freeze" if `updated_at` or `created_at` is after `2026-11-12T23:00:00Z` (23:00 Europe/London).

**Conflict — demo time in submit.js:** the submission confirmation script says "Demos are at 22:20." Official Luma and site agendas both say **23:30**. Treat 23:30 as the official time unless organisers say otherwise tonight. See Conflicts.

## Rules

- **Team size:** solo, or up to 5 people. Teams can form at kick-off. Submission form enforces 1–5 members.
- **Required / expected tech:** official judging criteria include **"Effective use of Grok Bot and Cursor"**. The site headline is "Build it with Grok Bot and Cursor." Every official track brief's recommended stack is: "Grok Bot by SpaceXSI and Cursor to build; Parallel for web research and for reading web pages and documents (Search, Extract and Task APIs, plus an MCP server)." Luma also says participants will build with Grok Bot, Cursor **and V7 Go**. V7 Go is a venue/tech partner, not named in the five advertised criteria.
- **Licence / open source (advertised rules):** no mandatory licence is stated on Luma or the landing page. The submission form requires a **public GitHub repo** and a checkbox: "Our repo is public so judges can read the code." Judges "run an automatic repo analysis on your latest commit." The public judge UI labels a detected `LICENSE` of MIT, Apache-2.0 or AGPL-3.0 as "open source", otherwise "check LICENSE".
- **Licence / open source (portal config conflict):** `/app/lib/config.js` on the official site includes a scored criterion "Is it open source, and could another community run it next week?" That file looks leftover from a 22 October event and does **not** match the landing-page criteria. Confirm tonight. Until then, a public repo plus an MIT licence is the safe path (this skeleton uses MIT, Copyright 2026 Francesco Coccia).
- **MSCI data rules** (only if the team uses MSCI RCA): event use only; no redistribution; no commercial use without a separate MSCI agreement; do not commit MSCI data to the repo or publish it in write-ups or public apps; delete copies after judging and confirm deletion. Accept the agreement in Discord when claiming access, and again on the submission form. Agreement page: `/msci-data-agreement`. Access (MCP or Snowflake) is handed out by the credits bot in `#claim-credits` after Luma check-in, from 18:15.
- **What to bring (Luma):** laptop, charger, Luma QR code. Approved guests were to receive setup steps for Grok Bot, Cursor and V7 Go before the event.
- **Starting-from-scratch / pre-work rule:** **TBC** — not stated on Luma or the site, other than the judge portal showing commit counts "in window" vs "before" (window definition **TBC**).
- **IP / who owns the project:** **TBC** — not stated on the scraped official pages.

## Submission requirements

Submit at **23:00** at https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/submit

Have ready:

1. **Public GitHub repo** (judges read the code; automatic analysis on the latest commit). Confirm the repo is public.
2. **2-minute video demo.** YouTube (unlisted is fine), Loom, Vimeo, Google Drive (set to "Anyone with the link"), Luma, or any public link.
3. Team names, plus an email organisers can use if you win.

Form fields (from the official form and `/app/lib/validate.js`):

- Project name (2–80 characters) and track (one of the five official track ids, or the closest / open track)
- What did you build? / description (20–1200 characters)
- Team name (optional, ≤80)
- Contact email (organisers only)
- Team members: 1–5 people. For each: name, **Cursor email** (required), and a **LinkedIn or X** link (required). GitHub, website and Discord optional.
- Open-source / public repo URL
- Demo video link (required)
- Live demo link (optional)
- MSCI: tick "Our team used MSCI data" only if true, and accept the MSCI Data Use Agreement if so

Answers are saved in the browser while typing. After submit: "Nice work. Judges can see your project now. Head back to the room for demos at 23:30. The Top 5 are announced live." (The confirmation **script** instead says 22:20 — conflict, see above.)

Judges score every video submission; Top 5 present live; 1st / 2nd / 3rd are chosen from those finalists.

## Judging criteria

### Advertised (Luma and official site "Demo Format & Criteria")

No weights or 1–5 scale are published on the landing page or Luma. The five criteria, listed equally, are:

1. Relevance to a real estate problem
2. Quality of execution
3. Effective use of Grok Bot and Cursor
4. Traceable data
5. Practical usefulness

Each track brief also has a "How it's judged" line (see `tracks.md`). Track 5 uses the same criteria as every track.

### Judge-portal scoring mechanics (public JS)

- The judge portal at `/judge` loads criteria from the authenticated `/api/judge/me` endpoint (labels as actually rendered tonight: **TBC** without signing in).
- Public `/app/lib/config.js` (comment: "Six criteria from the landing page, each scored 1–5 → total out of 30") currently lists a **different** set. Each would be scored **1 (needs work) to 5 (exceptional)**, equal weight, total **/30**. Incomplete reviews are excluded from averages / rankings until every criterion is scored.
- That config's six labels are: Technical execution; "Is it open source, and could another community run it next week?"; Use of community context; Better than what leads use today; Real-world usefulness; Demo quality. A comment dates a change to "22 Oct v5". These do **not** match the advertised real-estate criteria. **Treat as a conflict; confirm with organisers.** See Conflicts.

Track-specific judging notes are in `tracks.md` (end-to-end workflow, citations, figure traceability, etc.). They sit on top of the shared criteria, not instead of them.

## Prizes

Official (Luma and site agree on the top-three prizes):

- **1st:** 3 months of Cursor Ultra per team member
- **2nd:** 2 months of Cursor Ultra per team member
- **3rd:** 1 month of Cursor Ultra per team member

**Luma only** (not repeated in the site prizes section): "Every participant gets credits from Parallel and Supabase." Credit **amounts** are **TBC** (not on Luma or the site). The site lists Parallel and Supabase as "Technology & credits partners." Claim other partner access in Discord after Luma check-in from 18:15 (`/credits` or "Claim Grok credits" → Other credits).

## Sponsors and partners — what they offer, plus one feature idea

Feature ideas below are ours, not official briefs.

### Host & co-organiser

- **SpaceXSI / Grok Bot** — host tool. "Your AI teammates take projects from start to end, keep context on how you work and get smarter over time." Links: [skill](https://github.com/adamanz/grok-bot-skill), [templates](https://x.ai/bot/guides/templates-for-grok-bot), [marketplace](https://x.ai/bot/marketplace), [plugins](https://x.ai/bot/marketplace/submit-a-plugin). Contact on site: Francisco Terpolilli. **Idea:** run the chosen workflow (intake → extract → memo, or "explain this figure") as a Grok Bot teammate in Discord/chat, not only as a standalone web app — this is also a judging criterion.
- **Whitebox_ / Tavio** — community partner (Mateo Luca-Lion, Founder). Site links [whitebox-re.com](https://www.whitebox-re.com). No credits or API offer found. **Idea:** n/a as a tech integration; treat as community/host, not a required stack piece.
- **Ares Management** — problem statements and judges only (Luma). No dataset or API offer found on the pages. Judges/mentors on the site: Erik Starck; Christian des Pallieres; Lasen Wanni Arachchige.

### Venue / tech

- **V7 / V7 Go** — venue partner at 60 Margaret Street; build multi-step agents with V7 Go. "Build AI workflows on everything your firm knows. Turn acquisition and asset data into faster investment decisions." Docs, MCP, connectors, workflows, API key. Contact: Simon Edwardsson, CTO & Co-Founder. **Idea:** a V7 Go workflow that abstracts a batch of leases or sale brochures into structured fields, then hands results to the app for citations / a draft memo.
- **Cursor** — "Agents turn ideas into code." CLI, IDE, SDK, rules, MCP, cloud agents. Prizes are Cursor Ultra. **Idea:** use Cursor MCP + cloud agents as the visible build path (and say so in the demo), wired to Parallel / MSCI / Cortile tools.
- **Parallel** — "Web infrastructure for AI to search, extract, monitor, and reason over the world's information." Search, Extract, Task APIs, Python SDK, MCP. Participant credits per Luma (amount **TBC**). Contact: Rowan Aldean, Partnerships & Ecosystem. **Idea:** use Parallel Extract/Search to pull current comps, filings or brochure facts and attach source URLs to every figure.
- **Supabase** — listed as a technology & credits partner; participant credits per Luma (amount **TBC**). No partner modal or API blurb on the site beyond track notes that you can store features/metrics in Supabase/PostGIS. **Idea:** store extracted fields, provenance edges and audit history in Supabase (with citations), and seed from public/synthetic data.
- **Cognee** — "open-source agent memory platform for LLM agents. Build persistent memory across sessions." Docs, MCP, GitHub, examples. Cognee Discord (their server, not the hackathon one): https://discord.com/invite/m63hxKsp4p. Contact: Luca Stromann, Product. **Idea:** persist deal/document memory across agent steps so a later "explain this figure" or follow-up question reuses earlier extractions.

### Data & judge partners

- **Cortile** — synthetic property-management dataset: ~300 developments and 1,000+ buildings with units, leases, occupancy, service charges, compliance and maintenance. JSON plus a read-only API. Claim in Discord after Luma check-in from 18:15: `/credits` or Claim Grok credits → Other credits → Cortile. Access details stay in Discord, not on the page. Judge: Shéa McDevitt. **Idea:** an inspection / arrears / compliance copilot over the Cortile portfolio that always cites the source record.
- **Dwelly** — 50 synthetic cases built from real letting-agency business cases, in Google Drive: https://drive.google.com/drive/folders/1pd48BZ7Bw6UZC5M9A9QikKFYrUFbY9NA. Judge: Kate Liapun. **Idea:** run one of the 50 agency cases end-to-end (intake to action list) and show a letting-manager could use it tomorrow.
- **MSCI Real Capital Analytics (RCA)** — licensed real deal, comp, holdings and counterparty data. Access via MCP (ten RCA tools: deals, investor rankings, ownership, loans, funds, property detail, comps, company profiles, ~25 years of market trends, glossary) or Snowflake SQL on a shared reader account. Claim in `#claim-credits` after accepting the agreement, from 18:15 if checked in on Luma. Do not bulk-download, republish, or put data in the repo. Mentor: Tom Leahy, Head of EMEA Real Assets Research. Message MSCI on Discord: https://discord.com/channels/1568717763625885788/1570071580174843918. **Idea:** an "explain this figure" or screening memo that cites MSCI comps/trends live via MCP, with lineage in the UI and **no MSCI files in git**.

## Judges and mentors

The site heading is "Judges come from our data and judge partners…" All of the following appear in that section. People labelled **Mentor** on the site are marked as such. "What they may reward" is a one-line inference from the public role and partner brief only — not from private conversations.

| Name | Role on the site | Company | What they may reward (from public info only) |
| --- | --- | --- | --- |
| Shéa McDevitt | Judge | Cortile | Practical property-management workflows that use (and cite) portfolio data such as leases, occupancy, service charges, compliance and maintenance. |
| Kate Liapun | Judge | Dwelly | Letting-agency tools that clearly solve one of the real business cases behind Dwelly's 50 synthetic cases. |
| Erik Starck | Managing Director, AI and Innovation Technology | Ares Management | Investment/deal workflows that look usable on a real Ares-style problem, not a toy demo. |
| Christian des Pallieres | Vice President, Real Estate | Ares Management | Real-estate substance: a genuine deal, document or asset problem with a decision at the end. |
| Rowan Aldean | Partnerships & Ecosystem | Parallel Web Systems | Visible, working use of Parallel to search, extract or monitor real web/document sources. |
| Simon Edwardsson | CTO & Co-Founder | V7 | Multi-step document or acquisition workflows on V7 Go that turn messy files into a decision. |
| Luca Stromann | Product | Cognee | Persistent, inspectable agent memory across steps or sessions, not a one-shot prompt. |
| Lasen Wanni Arachchige | Analyst | Ares | Analyst-grade output: figures a reviewer could trust, with sources. |
| Tom Leahy | **Mentor** · Head of EMEA Real Assets Research | MSCI | Correct, licensed use of RCA (comps, deals, trends) with every figure traceable and no republished data. |
| Arnab Ghosh | **Mentor** · Member of Technical Staff | SpaceXSI | Effective use of Grok Bot as a teammate that actually runs the workflow. |
| Kichelle Comrie-Carson | **Mentor** · Solutions Engineer | V7 | A clean, operator-friendly V7 Go / inspection or document workflow a solutions team would ship. |

Luma (stale vs the site) still only names Shéa McDevitt (Cortile) and Kate Liapun (Dwelly), and says more judges would be announced on Monday 9 November. Prefer the site list above.

## Organisers and other contacts (not on the judge / mentor list)

Researched 20:06 Europe/London, 12 Nov 2026, from public pages only. Francesco spoke with Mateo Luca-Lion; **the content of that conversation is not in our sources and is not invented here.** "What they may value" is an inference from public role and writing, labelled as such.

### Mateo Luca-Lion — co-organiser, not a listed judge or mentor

- **On tonight's official judge / mentor list?** **No.** He does not appear in the "Judges come from our data and judge partners…" table on the official site (see the table above). The official pages already list him as a **host / co-organiser**: "Francisco Terpolilli (EU Ambassador · SpaceXSI); Mateo Luca-Lion (Founder · Whitebox_ · Tavio)" — this file, Event section, scraped ~18:48. In a public LinkedIn post dated 5 Nov 2026 he wrote "we're hosting London's biggest real estate hackathon with Ares and Grok Bot," said it had been "a pleasure organizing with Francisco, Lucas, Christian & Erik Starck," and thanked "our judges from Ares, Cortile, Dwelly, V7, cognee & Parallel Web Systems" — i.e. he presents himself as organiser, distinct from the judging panel. https://www.linkedin.com/posts/mateo-luca-lion-446417190_a-few-months-ago-attended-my-first-hack-activity-7524098145828478976-KfK1 Profile: https://www.linkedin.com/in/mateo-luca-lion-446417190/
- **Role and companies (cited; conflicts noted):**
  - **Tavio** — public byline "Mateo Luca-Lion · Tavio" on the company roadmap (10 Sep 2026). Tavio's site: "Applied AI for real estate investors/managers"; helps teams "deploy AI to drive operating & investment value"; customers listed as investment managers, owners and landlords, operators, developers; builds a data platform, agentic workflows "**with your team approving each step**," long-running agents, and role-specific applications. Today they say they are "building AI for procurement workflows and deploying AI inside operating businesses." https://trytavio.ai/ https://trytavio.ai/roadmap
  - **Whitebox_** — founder (already on the official event listing). Public site: "Whitebox: European Real Estate," short interview memos aimed at professionals, plus a members community. https://whitebox-re.com/ In an earlier public LinkedIn post he described it as short memos (under 10 minutes) that capture how practitioners actually think: https://www.linkedin.com/posts/mateo-luca-lion-446417190_whitebox-european-real-estate-activity-7358446527008149505-oMyg
  - **LGL** — LGL's own About page, fetched 12 Nov 2026, still lists "**Mateo Luca-Lion, Investment Manager**": "With previous experience in AI implementation and data strategy projects for Fortune 500 companies, Mateo now oversees our investment function, analysing current projects and new development opportunities." LGL is a London developer ("Developing the SPACES of tomorrow"), 54 Charlotte St. https://www.lgl.co/about **Conflict:** a LinkedIn search-index of his profile lists "Investments — LGL" as ending **Sep 2026**. We did not get a logged-in LinkedIn fetch. Do not silently decide whether he is still at LGL; say the company site still lists him and the LinkedIn index may say otherwise.
  - LinkedIn search-index also lists Founder, Whitebox_ (from Aug 2025) and a "Founder — Stealth" role from Sep 2026. The index attaches what looks like a **different** "Stealth" software company's headcount and funding; **do not treat those company stats as his**. Artefact (AI/data strategy, listed earlier) appears in a stale LinkedIn About line ("Currently working at Artefact as a Data Consultant") that conflicts with later roles — treat the About line as outdated unless re-checked on the live profile.
- **What he'd likely value (inference from public writing, not from Francesco's conversation):** a tool a real operator or asset manager would run, that uses the building's existing record instead of reconstructing it, keeps a professional in the loop on the decision, and is honest about what the model did versus what code decided. Tavio's public pitch stresses team approval of agent steps and "operating & investment value," not a generic chatbot. His roadmap argues that a lot of built-environment waste is information that was already paid for and then lost between teams. **Do not demo a procurement bid-benchmarking tool** — that is close to what Tavio already shows on its own homepage. SlotRight should be framed as tenant-to-verified-slot plus a cited priority, with the PM still able to override. As co-organiser (not a listed judge) he may still watch whether Grok Bot is actually used, but we should not assume he scores the official rubric.



## Data resources (shared)

Partner data first. Claim MSCI RCA and Cortile in Discord after Luma check-in (from 18:15), via `/credits` or Claim Grok credits, then Other credits. Dwelly's 50 cases are in Drive. MSCI and Cortile access details stay in Discord.

- Live listings (v2): 7,251 rows and 2,175 auction results, crawled 24 October 2026 — a snapshot, not a live feed. https://drive.google.com/drive/folders/1iETABcRlxncchFs-gf4m2ip11Nv9tse5 (parent: https://drive.google.com/drive/folders/1fBYAMZmC-W1V9JgRewDnRkiUsvR0GQnJ)
- 185 sale brochures: https://drive.google.com/drive/folders/1SZ4RsM0HTTPIL9hkAW3LCUxr-QOxL5LV
- Bulk downloads + 00-START-HERE map of every Drive folder, including split Land Registry files: https://drive.google.com/drive/folders/1CD6-vfoAwwqf0rUVEVnvp7nMDDpthaMe
- Official open data listed on the site: [Price Paid](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads), [UK HPI](https://www.gov.uk/government/collections/uk-house-price-index-reports) (latest checked download August 2026), [EPC open data](https://get-energy-performance-data.communities.gov.uk/) (free GOV.UK One Login). More sources are in each track brief in `tracks.md`.

## Discord (from official pages)

Hackathon server invite (used for credits, Cortile, MSCI): **https://discord.gg/rad8eCmBnE**

In-server links found on the site (need membership):

- Message Grok Bot: https://discord.com/channels/1568717763625885788/1568718468151386122
- #claim-credits: https://discord.com/channels/1568717763625885788/1568718298550501510
- Message MSCI: https://discord.com/channels/1568717763625885788/1570071580174843918

Cognee partner card Discord (Cognee's own invite, not clearly the hackathon server): https://discord.com/invite/m63hxKsp4p

## Conflicts and TBC

Conflicts:

1. **Live demo clock time:** official agendas (Luma + site) = **23:30**. `submit.js` success copy = **22:20**. Use 23:30 unless organisers override.
2. **Judging criteria:** advertised five real-estate criteria (no weights) vs public judge `config.js` six equally weighted 1–5 criteria that look inherited from 22 Oct and do not match the landing page. Confirm which set judges will use.
3. **Tracks on Luma:** Luma still says "Tracks are revealed at kick-off on the day." The official site now publishes all five tracks (kick-off was 18:15). Prefer the site.
4. **Judges on Luma:** Luma still lists only McDevitt and Liapun + "more on 9 Nov." The site lists the full panel above. Prefer the site.
5. **Participant credits:** Luma promises Parallel and Supabase credits for every participant; the site prizes block only lists Cursor Ultra for the top three (Supabase/Parallel appear as credits partners, amounts unstated).
6. **V7 Go as required tech:** Luma lists Grok Bot, Cursor and V7 Go as build tools; advertised criteria name only Grok Bot and Cursor. V7 Go is clearly a partner tool, not a published required criterion.
7. Unofficial aggregators (e.g. CompeteHub, Manyfold) still show an older 17:30 / 17:45 / 18:00 start and, in one case, 40–60 participants. Official sources agree on **18:00 doors / 18:30 hacking / 60–80 places**. Ignore the aggregators.

TBC:

- Parallel and Supabase credit **amounts**, and how to claim them (likely `#claim-credits`, not spelled out).
- Exact criterion labels and weights the judge portal will use tonight (advertised five vs `config.js` six).
- Whether a specific open-source licence is required (public repo is required; MIT/Apache/AGPL get a positive flag in the judge UI).
- Pre-work / "commits before the window" rule.
- IP ownership of projects.
- Whether mentors also score submissions.
- Any on-stage rule changes after 18:15 kick-off not yet reflected on the pages.

## Sources

- Luma event page: https://luma.com/spacexai-hvld?tk=rie2Pw and https://luma.com/spacexai-hvld
- Luma public API event record (start/end in Europe/London, hosts, description): `https://api.lu.ma/event/get?event_api_id=spacexai-hvld` (event `evt-rOLDfvbXiimu5XA`)
- Official site (root and /hackathon are the same page): https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/ and https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/hackathon
- Track brief dialogs on that page (`#track-knowledge-workflows`, `#track-document-extraction`, `#track-provenance`, `#track-asset-management`, `#track-open-track`) and `/assets/tracks.js?v=5`
- Shared track module: https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/app/lib/tracks.js
- Submission portal: https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/submit plus `/app/submit.js` and `/app/lib/validate.js`
- Judge portal page (public shell only; not signed in): https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/judge plus `/app/judge.js` and `/app/lib/config.js`
- MSCI Data Use Agreement: https://gb-real-estate-hackathon-11-2026.teamdeel.workers.dev/msci-data-agreement
