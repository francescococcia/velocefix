# Ideas research — trust stamp + automated information gathering

Researched 12 Nov 2026, about 19:00–19:20 Europe/London. Francesco's conversation with one person (huge volumes of data to verify, a "verified stamp" so nobody re-checks, and a judge saying a big pain is calling and gathering information) is treated as a **hypothesis**, not a fact. Findings below are cited. Anything not found is **TBC**.

Lessons from past hackathons (also saved in `knowledge/lessons.md`) were applied when scoring: one product and one user type; test the premise against real behaviour; if a track describes a winning demo, build that first; go deep on 1–2 sponsor techs, not 3+; make "why Grok Bot" visible; real data tonight beats example data; max ~3 integrations, each with a fallback; too many features hurt a 2-minute demo; show the agent proposing and deterministic code verifying, on screen, with live data; open the pitch on a named user's problem; say the privacy design out loud; honesty pass on synthetic data; meet users where they already are (email/chat).

Official advertised criteria (no published weights): relevance to a real estate problem; quality of execution; effective use of Grok Bot and Cursor; traceable data; practical usefulness. Track-specific "how it's judged" and winning-demo lines are in `tracks.md`. The judge-portal `config.js` six-criterion "old rubric" is treated as a conflict (see `event.md`); ideas are still scored /100 against it, harshly, because that file is what the public scoring code currently contains.

Build constraint: solo, MVP by **22:10 Europe/London**, official freeze **23:00**, 2-minute video and possible live demo.

---

## 1. How data verification is done today

### The actual job (acquisitions, lending, valuation)

A seller or borrower rent roll is a **claim**, not evidence. Diligence has to establish what the building **does** earn, and which differences vs the roll will last.

Julian R. Sterling's worked example (illustrative, but the method is standard): reconcile **every line** of the vendor rent roll to the signed lease, any side letter, and twelve months of bank receipts; split differences into permanent and temporary; capitalise the permanent ones at the yield and deduct temporary ones at present value. On an illustrative office quoted at 40,000,000 on a 2,400,000 rent roll, five findings cut the price by 1,340,870 (3.35%). The safer rule on a large multi-let is to test every tenant above a set share of income and every lease that expires, breaks or reviews in the first two years. Common mistakes he flags: capitalising the whole day-one shortfall, treating heads of terms as a lease, reading only the leases and missing side letters, and counting service charge as rent. Source: https://julianrsterling.com/articles/how-to-audit-a-rent-roll-in-due-diligence/

A practical five-step audit used in closing practice: (1) unit count and occupancy vs physical/occupancy records and deposits; (2) lease terms vs executed agreements; (3) rent collected vs ledger; (4) documented increases and renewals; (5) deposits, concessions and arrears. Source documents requested from the seller or manager: executed leases, T-12 bank statements or property ledger, current tenant estoppels or contacts, notices to vacate, amendments, concession agreements, security-deposit register. Source: https://rea.co/rent-roll-auditing-verify-accuracy-before-closing/

Institutional checklists go further: tie the rent roll to estoppels, the estoppels to bank deposits, and the deposits to the T-12 ("rent roll tie-out chain"). Analyst-owned items include rent roll vs lease comparison, vacancy and credit loss, percentage rent, trailing monthly rent rolls. Source: https://morainecre.com/templates/files/moraine-cre-due-diligence-checklist.pdf

UK commercial acquisitions typically allow **four to eight weeks** for due diligence (longer for complex assets). The solicitor reviews title, raises Commercial Property Standard Enquiries (CPSE), and reviews leases, licences, rent deposits and side agreements. Income is verified by cross-checking the rent roll against actual leases, payment history, three years of service-charge accounts, and tenant covenant strength. Marketing particulars are "a starting point, not a fact." Source: https://www.legaldocuments.co.uk/commercial-property-law/due-diligence-in-commercial-property-investments/

**Who does it:** acquisitions / underwriting analysts and associates (Ares-style deal teams list due diligence, IC memos and "interaction with counterparties, lenders, … lawyers, consultants and various other advisors" as core work — https://simplify.jobs/p/775750eb-1f67-4f0c-9566-3de660f91b9d/Real-Estate-Equity-Analyst); property managers who produced the roll; outside counsel; valuers; lenders' underwriters; sometimes outsourced abstractors.

### Tenant estoppels and "calling people"

The judge comment that a big pain is **calling and gathering information** matches a real, narrower practice — it is not the whole of verification.

A tenant estoppel certificate asks the tenant to confirm selected lease facts (parties, amendments, dates, rent, deposits, options, defaults, concessions). Buyers and lenders use it to test the rent roll. A landlord-provided certificate is **not** a substitute for reading the lease. Buyers often make delivery of estoppels from major tenants a closing condition. Waiting until the final week can jeopardise financing. Practice: compare estoppels against rent rolls, leases, amendments and receivables. Source: https://www.alexnahailaw.com/commercial-real-estate-estoppel-snda-due-diligence

Florida/US practice notes: start collection at contract execution; leases often require a response in **10–20 days**; typical lender set is anchors plus tenants above a share of occupancy; refusals can be a signal; discrepancies vs the seller rent roll must be resolved before closing. Source: https://www.lintonglobalsolutions.com/glossary/estoppel

Costs found (wide range, not UK-specific): tenant/collection fees often cited at **$100–$500** or more per certificate (https://www.rentecdirect.com/blog/what-is-an-estoppel-certificate/); a Washington State form lists **$250** per estoppel or SNDA (https://des.wa.gov/sites/default/files/2022-06/ESTAndSNDARequest.pdf); one US firm quotes **$725–$1,800** to *draft* a certificate, which is legal drafting, not collection (https://mclaw.io/products/tenant-or-landlord-estoppel-certificate). Time-to-collect is calendar time (weeks), not analyst minutes.

This is mostly **email and form chasing**, not a call-centre product. Phone is used to chase non-responders. A two-sided tenant portal would be a different product (and, per lessons, would likely halve the score).

### Comps verification (valuation)

RICS is explicit: "data on comparable transactions, from any source, should not be taken at face value." Headline £/sq ft is not enough; lease terms, incentives and building quality change the number. "The valuer should therefore verify this information with the appropriate parties and make adjustments." Keep a record of the research. Markets lack transparency; evidence is often out of date, incomplete or inaccurate. Source: RICS, *Comparable evidence in real estate valuation*, section 4.4 — https://www.rics.org/content/dam/ricsglobal/documents/standards/Comparable%20evidence%20in%20real%20estate%20valuation.pdf

The IAAO standard says sales data should be verified by contacting a party to the sale (buyer, seller or other knowledgeable party) when a questionnaire is unclear; the fewer or more atypical the sales, the more confirmation is needed. Source: https://www.iaao.org/wp-content/uploads/Standard_on_Verification_Adjustment_of_Sales.pdf

BIS notes that official commercial property price data are scarce, transactions are few and unrepresentative, records often lack property characteristics, and appraisal-based series can be lagged and smoothed. Source: https://www.bis.org/publications/ifc-report-8-mind-data-gap-commercial-property-prices-policy

This is the strongest professional-body support for "gather information from people," and it is about **confirming comps**, not stamping a whole data room.

### KYC / AML and landlord ownership (especially UK lettings)

HMRC: letting-agent businesses must complete customer due diligence, and must complete ID verification on the **landlord before terms of engagement and before the property is advertised**; on the tenant, at latest before any agreement, once an offer is accepted. Source: https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg2300

For estate agency, opaque legal entities, PIVs/SPVs and missing beneficial owners are higher risk; UK companies file at Companies House; overseas owners of UK land should appear on the Register of Overseas Entities; land-registry checks can help verify ownership. Source: https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg3200

The Guild / Property Ombudsman practice: take reasonable steps to confirm legal ownership (Land Registry title search or deeds). A title register from HM Land Registry is cited at **£3**. Source: https://www.propertywire.com/news/why-establishing-true-ownership-is-important-for-agents/ and https://www.guildofletting.com/blog/y6nkiw678ngk290jkkyx2jz9wnk4zm

This is a real, regulated workflow for **lettings and sales agents** (Dwelly-relevant). It is a weaker fit for an Ares-style CRE IC memo unless the deal question is "who actually owns this and the borrower?"

### Time and cost (label the source type)

Independent-ish or practice sources:

- UK commercial DD window: **4–8 weeks** (legal explainer, not a survey): https://www.legaldocuments.co.uk/commercial-property-law/due-diligence-in-commercial-property-investments/
- Sterling's illustrative price impact: **3.35%** off a £40m quote from five rent-roll findings: https://julianrsterling.com/articles/how-to-audit-a-rent-roll-in-due-diligence/
- Land Registry title: **£3** (trade press, citing agent practice): https://www.propertywire.com/news/why-establishing-true-ownership-is-important-for-agents/

**Vendor-reported** (use in a pitch only if labelled as such; these are marketing numbers):

- Kolena: experienced abstractor **3–8 hours** per 30–50 page commercial lease; 100-lease portfolio at 4 hours = **400 analyst-hours**; outsourced abstraction **$200–$600** per lease; one deployment "2 hours to 17 minutes" (85%). https://www.kolena.com/blog/lease-abstraction-with-ai/
- Artificio: "weeks" during DD for rent-roll processing; an example mid-size firm at 12 hours/property, $125/hour, $300k/year labour before QC. https://artificio.ai/blog/ai-for-commercial-real-estate-management and legal review **$300–$600/hour**. https://artificio.ai/blog/cut-real-estate-due-diligence-costs-with-ai
- LeaseScan (1,000-review "study" on their blog): manual 3–6 hours / $750–$1,250 vs AI 6–11 minutes. https://leasescan.ai/blog/ai-lease-analysis-vs-manual-review
- Constellation Research / Greystone case: **85%** reduction in manual reconciliation time for lease vs rent-roll audit. https://www.constellationr.com/case-study/2024/greystone
- V7 Go marketing: "abstract a lease in minutes instead of an afternoon"; claimed **99.5%** extraction accuracy, **70%** less underwriting prep, **8×** faster property analysis (vendor site, not an independent audit). https://www.v7labs.com/ai-for-real-estate

### Premise check (important)

- "There is a huge amount of data to verify, and roll vs lease vs receipts vs estoppel is painful" — **supported**.
- "A stamp means nobody needs to re-check" — **not how practitioners work**. Valuers and analysts are expected to verify material comparables and keep a record (RICS). A stamp that hides the work will not be trusted. A stamp that **shows the work** (source, time, who signed, open mismatches) can reduce re-work. That is the sellable claim.
- "The problem is also calling and gathering information" — **partly supported**, mainly for estoppel chasing and for confirming comps with parties to the sale. It is not the centre of rent-roll audit (that centre is documents + ledgers). Do not build a general-purpose call bot on the strength of one comment.

---

## 2. Existing products and the real gap

| Product | What it actually is | Gap vs a "trust stamp + gather" tool |
| --- | --- | --- |
| **Cherre** | Unifies and resolves many CRE sources into a property graph / data layer for IT and analytics teams. https://nextautomation.us/blog/cherre-vs-reonomy | Infrastructure, not a deal-file tie-out or a stamp on a memo. |
| **Reonomy** (Altus) | Property, ownership, contact and transaction data for sourcing. Does not read leases, rent rolls or operating statements. https://morainecre.com/resources/alternatives/reonomy-alternatives | A source feed, not diligence verification. |
| **TreppCRE** | Large securitised-CRE database plus sales, lease and tax data; ML-suggested comps and risk analytics. https://www.trepp.com/trepp-cre | Market and loan data. It does not certify *this* deal's rent roll against *these* leases. |
| **Prophia** | AI lease abstracts, "living abstracts," stacking plans; oriented to ongoing portfolio management more than acquisition underwriting. https://morainecre.com/resources/guides/best-lease-abstraction-software-2026 | Extraction + portfolio UI. Not a cross-source stamp or confirmation chase. |
| **MRI Contract Intelligence** (formerly Leverton, acquired 2019) | Enterprise AI abstraction plus expert review; 25+ languages; historically linked to IFRS 16 / ASC 842; fits the MRI ecosystem. https://updates.elysium-cre.com/blog/lease-abstraction-tools-compared | Heavy enterprise; not a lightweight "explain this figure" teammate. |
| **Docsumo** | Reads rent rolls, T-12s, leases, OMs; **ties them out against each other**; exceptions to the underwriter; API into the model. Says the judgment stays with the human. https://www.docsumo.com/solutions/use-cases/cre-underwriting | Closest competitor on tie-out. Does not obviously offer an inspectable IC-memo ledger, a Grok Bot chat, or outbound confirmation gathering. Vendor accuracy claims (99% / 95% STP) are theirs. |
| **Dealpath** | Acquisitions pipeline, workflows, IC memo generation, AI extract from OMs. Diligence = collaborate, share docs, track approvals. https://www.dealpath.com/acquisitions/ | Workflow and pipeline, not figure-level provenance. |
| **Elysium** | Positions as a CRE diligence "data engine": citation to document, page and section, confidence, human sign-off with name and timestamp, amendment reconciliation, lease-to-rent-roll tie-out. https://updates.elysium-cre.com/blog/lease-abstraction-tools-compared | **Narrows the provenance gap.** A hackathon build will not beat this as an enterprise platform. The opening of the pitch cannot be "nobody traces figures." It has to be why *this user, tonight, in this workflow* still loses time (chat-native teammate, UK/public records, confirmation queue, open and forkable, visible agent + deterministic check). |
| **V7 Go** (tonight's venue and a judge) | "Abstract a lease in minutes… each with a citation back to the page." Workflows for leases, rent rolls, OMs, "Operational Due Diligence," dataroom → IC memo. They already sell page-level citations. https://www.v7labs.com/ai-for-real-estate | **Do not demo "we extract leases with citations" as the product.** V7 judges will recognise their own pitch. If V7 is used, use it as the extractor and make *our* product the stamp, the cross-source check, and the confirmation trail. Better tonight: do not spend the demo competing on extraction quality. |

**Honest gap to build into:** tools already extract, and some already cite and tie out. What is still messy in real behaviour is (a) a **human-signed, inspectable status** on each figure in the *memo or roll the committee will read*, (b) fields that cannot be verified from the file and need a **confirmation from a person**, and (c) a teammate that lives in chat/email rather than another enterprise login. A magical "verified — never re-check" badge is not the gap, and would be a liability.

---

## 3. What is known about the judges' companies

Inferences below are from public sites and the official event pages only.

- **Cortile** (judge: Shéa McDevitt). UK AI-powered operating platform for **residential** property management (managing agents, on-site teams, freeholders, residents). Customers manage about **400,000 homes**. Founded 2019 (Ark Residential); official technology partner of The Property Institute. Public pitch: one system for comms, maintenance, compliance, payments; "source of truth"; Golden Thread and Building Safety Act evidence; "document-backed answers"; inspection PDFs into assignable tasks. https://cortile.com/ https://cortile.com/company https://cortile.com/customer-stories — **Likely to value:** a tool a block manager would actually run (compliance, service charge, inspections, chase-and-evidence), with citations and an audit trail — not a US CMBS toy. Cortile already wants to be the source of truth; a competing "stamp" on their core PM workflow is a harder sell than a diligence tool that *uses* their synthetic dataset well.

- **Dwelly** (judge: Kate Liapun). Acquisitions and succession platform for **independent UK lettings agencies**; keeps local brands; "collaborative, transparent due diligence process"; modernises operations after close. Founders Ilya Drozdov, Dan Lifshits, Dmitry Khanukov. They also ran their own London AI hackathon (11 Sep 2026). https://www.dwelly.group/ — **Likely to value:** something a lettings shop or Dwelly's own deal team would pay for (landlord ownership/AML, referencing, case handling on their 50 synthetic cases), explained in agency language, not fund language.

- **Ares Management** (Erik Starck, MD AI and Innovation Technology; Christian des Pallieres, VP Real Estate; Lasen Wanni Arachchige, Analyst). Event: problem statements and judges only, no Ares dataset. Public: Ares Real Estate **$126.4B** AUM, 720+ RE professionals, 4,000+ properties (https://www.ares.com/uk/businesses-and-products/our-businesses/real-estate). London analyst jobs: deal screening, modelling, **IC memos**, due diligence, and heavy interaction with counterparties and advisors (https://simplify.jobs/p/775750eb-1f67-4f0c-9566-3de660f91b9d/Real-Estate-Equity-Analyst). — **Likely to value:** an IC-grade memo or screening pack where every number is defendable in committee, with mismatches priced or at least listed. They will smell a toy.

- **Parallel** (judge: Rowan Aldean). Web infrastructure for agents: Search, Extract (pages and PDFs), Task (cited deep research — they literally list due diligence as a use), Monitor. https://parallel.ai/ — **Likely to value:** live, cited web/PDF pulls visibly used in the demo (Companies House, a brochure, a news report of a sale), not a logo on a slide.

- **V7** (Simon Edwardsson, CTO & Co-founder, judge; Kichelle Comrie-Carson, Solutions Engineer, mentor). Venue; V7 Go is document workflows with page citations for CRE. — **Likely to value:** a serious workflow on messy documents, citations, and (if we use them) depth in V7 Go. They will not reward a worse re-implementation of lease abstraction.

- **Cognee** (Luca Stromann, Product, judge). Open-source agent memory (graphs + vectors) so agents remember across sessions. https://www.cognee.ai/ — **Likely to value:** memory that persists (the same deal's figures stay consistent when you ask again). Easy to skip tonight (extra integration). Only add if the core path already works.

- **MSCI** (Tom Leahy, mentor, Head of EMEA Real Assets Research). RCA: they pitch "validated, transparent" CRE data from original sources; $50 trillion+ deal coverage (as of April 2025 on the product page); comps, owners, loans, funds, market trends. https://www.msci.com/data-and-analytics/real-estate/real-assets-market-data — **Likely to value:** correct, licensed use of RCA (comps or ownership) with lineage, and **no republished data**.

---

## 4. What the partner datasets contain (only what is public)

No dataset was downloaded for this note. File-level schemas inside private Drive or Discord logins are **TBC** until Francesco opens them.

- **Cortile (hackathon).** Official brief only: synthetic data on **~300 developments and 1,000+ buildings**: leases, occupancy, service charges, compliance and maintenance; **JSON plus a read-only API**. Claim in Discord after Luma check-in (`/credits` → Other credits → Cortile). Access details are deliberately not on the public page. The company's *product* is live UK residential PM software; that is not the same as this synthetic dump. Schema, formats, and whether it includes a rent roll suitable for a tie-out: **TBC**.

- **Dwelly (hackathon).** Official brief: **50 synthetic cases built from real letting-agency business cases**, Drive folder titled (public page title) "Dwelly data": https://drive.google.com/drive/folders/1pd48BZ7Bw6UZC5M9A9QikKFYrUFbY9NA. The public folder page does not list files without sign-in. Case types (referencing, arrears, landlord onboarding, etc.): **TBC**. Company context (above) suggests lettings-agency operations or agency-acquisition diligence, not CRE fund IC work.

- **MSCI RCA (hackathon).** Licensed, event-use only; no bulk download, no repo, no public apps, delete after judging (see `/msci-data-agreement`). Official partner card: access via MCP (ten tools — deals, investor rankings, ownership, loans, funds, property detail, comps, company profiles, ~25 years of market trends, glossary) or Snowflake SQL on a shared reader account; claim in `#claim-credits` from 18:15 if checked in. Public MSCI marketing (separate from the hackathon subset) is summarised above. Exact tables in the reader account: **TBC** in Discord.

- **Other official files useful tonight (publicly described):** hand-labelled lease sample (CSV/JSON, labelled by SpaceXSI organisers) — Drive title "Hand-labelled lease sample (organisers)": https://drive.google.com/drive/folders/1LjgXVJQ-U5_oFC3xP19hNcEcdtmCkGuO; 185 sale brochures; legal/lease pack (CUAD/DocLayNet are *not* a lease gold set); official Price Paid, UK HPI, EPC (free sign-in). These are the safest "real or official sample" path if partner logins slip.

---

## 5. Product ideas (3–5), scored harshly

Shared design rules used in every score: one named buyer; no tenant/broker marketplace; at most two sponsor techs in the critical path (Grok Bot + Parallel, or Grok Bot + V7 — not both, and **no live Twilio in the MVP**); voice or inbox automation only as a 20-minute extra with a paste-in / "copy email" fallback; show agent proposal + code check on screen; honesty on synthetic data; say what is stored.

Advertised scores are /10. **Adv /50** is the sum. The **old-rubric /100** is the six 22 Oct criteria (technical execution; open source / could another community run it next week; use of community context; better than what leads use today; real-world usefulness; demo quality) each /10, then scaled `sum * 100/60`.

### Idea 1 — TrustStamp (rent-roll vs lease)

- **One user / buyer:** acquisitions or lending analyst who has to sign off a rent roll before a bid or credit memo (Ares-shaped).
- **Why they'd pay:** roll vs lease vs side letter is still a line-by-line job; Sterling's illustrative 3.35% price swing is the economic reason. They already buy abstraction tools; they would pay for **exceptions + a sign-off trail**, not another parser.
- **Single demo moment:** open a roll; one tenant's rent is red; click it; see the lease clause/page vs the roll; a deterministic diff; stamp stays "mismatch" until a human accepts a correction or queues a confirmation.
- **Track:** Track 2 (winning demo: batch in, structured fields with citations, plus what was caught, missed or invented). Also supports advertised "traceable data."
- **Data:** hand-labelled lease sample + a small rent roll (preload + one row entered tonight). Cortile leases if the JSON actually has them (TBC). Do not need MSCI.
- **Sponsor tech:** Grok Bot (propose fields / explain a mismatch in chat) + Cursor to build. Parallel only if we also pull a Companies House name check (otherwise drop it). Not V7 and Parallel and Twilio.
- **Solo MVP by 22:10:** one property, 5–15 units, upload or preload PDFs + CSV, extraction can be messy if citations and the diff are right, public repo, "synthetic / sample" banner.
- **Harsh advertised scores:** Relevance 8, Execution 8, Grok Bot & Cursor 6 (risk: looks like a generic extractor; "why Grok Bot" is weak unless chat is the UI), Traceable data 9, Practical usefulness 8. **Adv 39/50.**
- **Old rubric /10:** execution 8, open source 8, community context 6, better than today 5 (Docsumo/V7/Elysium already play here), usefulness 8, demo 8. **Old /100: 72.**
- **Top 3 risks:** (1) V7 and Docsumo already sell this story; judges shrug. (2) Chat/Grok Bot is a bolt-on. (3) Extraction quality on real PDFs blows the 2-minute path.
- **3 score-raising changes:** make Grok Bot the place the analyst asks "why is this red?"; show code-check vs model guess side by side; end on a human-signed stamp, not a prettier table.

### Idea 2 — Diligence Chase (estoppel / confirmation orchestrator)

- **One user / buyer:** the same deal lead who has to collect confirmations before closing, not the tenants.
- **Why they'd pay:** estoppels and missing side letters are on the critical path; collection is 10–20 day calendar chasing (https://www.lintonglobalsolutions.com/glossary/estoppel, https://www.alexnahailaw.com/commercial-real-estate-estoppel-snda-due-diligence). Tools like Dealpath track tasks; they do not draft the ask from the mismatch and log the reply against a figure.
- **Single demo moment:** a mismatch with no document source; the agent drafts a confirmation email; a pasted reply lands in the tracker; the figure's status becomes "confirmed by tenant, 12 Nov, source: email," visible in the log. (Track 1 winning demo: follow-ups from email/deal chat into a shared tracker, through to a draft memo, every step logged.)
- **Track:** Track 1.
- **Data:** a tiny synthetic chase pack (three tenants). Dwelly cases only if they are actually chase/referencing cases (TBC).
- **Sponsor tech:** Grok Bot as the deal chat. No live Twilio and no Gmail integration in the MVP (paste or upload the reply). Optional Parallel to fetch a public company address. Voice = 20-minute extra with a scripted fallback, not the demo spine.
- **Solo MVP by 22:10:** feasible only as a **tracker + drafted email + pasted reply**. A real phone agent is not feasible to a reliable demo standard in ~3 hours solo.
- **Harsh advertised scores:** Relevance 7 (real, but one judge comment is not a market), Execution 5, Grok Bot & Cursor 8 (chat-native, meets users in email/chat), Traceable data 6, Practical usefulness 6. **Adv 32/50.**
- **Old rubric /10:** execution 5, open source 7, community context 5, better than today 6, usefulness 6, demo 5 (easy to look fake). **Old /100: 57.**
- **Top 3 risks:** (1) Two-sided temptation (tenant portal) — do not. (2) Live email/Twilio fails or looks canned. (3) Weak "stamp" and weaker document traceability than Track 2/3.
- **3 score-raising changes:** start from a document mismatch, not an empty CRM; log every hand-off like the Track 1 brief; cut voice entirely unless the email path is already filmed.

### Idea 3 — FigureLedger (click-any-figure memo + inspectable stamp) — recommended

- **One user / buyer:** a named European real-estate equity analyst preparing an IC or screening memo (the Ares job description is the persona, not a claim that Ares will buy tonight).
- **Why they'd pay:** the memo is what committee reads; today figures are copied from rolls, models and emails with no link back (this is almost verbatim the Track 3 problem statement). They will not pay to "stop checking." They will pay to **click a number, see the chain, and see what is still open.** That matches RICS's "keep a record of the research" more honestly than a magic badge.
- **Single demo moment (build exactly the Track 3 winning demo):** a one-page memo. Click a rent (or cap rate, or comp). See source document or URL, who added it, when, and the diff if it changed. Status is `verified` / `mismatch` / `unconfirmed`. Optional one button: "draft a confirmation request" for an unconfirmed figure (the gathering hypothesis, without becoming a second product).
- **Track:** **Track 3.** How it's judged: every figure traceable; changes recorded honestly; fast enough for a review meeting.
- **Data:** one deal memo built from the hand-labelled lease sample + a short roll (and/or one sale brochure). Public Price Paid or Companies House via Parallel for one outside figure. MSCI comps only if access is already live and nothing hits the repo (fallback: public source). Cortile if a single building's leases load easily.
- **Sponsor tech (deep, not wide):** **Grok Bot** as the "explain this figure" teammate (this is why the model/teammate exists) + **Parallel** for one live cited web/PDF pull. Cursor is how it was built — mention it, do not make the pitch about the IDE. No Twilio, no Cognee, no V7 unless extraction is blocked and then *swap* Parallel out, do not add a third.
- **Solo MVP by 22:10:** one memo, ~8–12 figures, preload documents, click path + chat "explain this figure" + deterministic source check + human stamp. Public repo, MIT, config for the property, banner on what is sample vs entered tonight. Privacy spoken in the demo: documents stay local/project; no tenant call recording; MSCI not republished.
- **Harsh advertised scores:** Relevance 9, Execution 7 (tight but one page is doable), Grok Bot & Cursor 9, Traceable data 10, Practical usefulness 8. **Adv 43/50.**
- **Old rubric /10:** execution 7, open source 8, community context 7, better than today 7 (Elysium/V7 exist; the honest wedge is memo-native + chat teammate + confirmation status, not "we invented citations"), usefulness 8, demo 9. **Old /100: 77.**
- **Top 3 risks:** (1) Looks like a thin wrapper around V7/Elysium if the pitch opens on extraction. (2) MSCI misuse or a broken login. (3) Memo UI sprawl — more than one property or a full model.
- **3 score-raising changes:** open the pitch with "Anna is in IC in 20 minutes and cannot say where this £180k rent came from"; show agent guess vs code check on one contested figure; sign the stamp in the demo and leave one figure honestly unconfirmed.

### Idea 4 — LandlordStamp (UK lettings ownership / AML check)

- **One user / buyer:** lettings manager at a Dwelly-acquired agency, or Dwelly's own onboarding ops — pick one, not both. Persona: "complete landlord CDD before we advertise."
- **Why they'd pay:** HMRC requires landlord ID checks before engagement and advertising (https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg2300); TPO-style practice is a title search (https://www.propertywire.com/news/why-establishing-true-ownership-is-important-for-agents/).
- **Single demo moment:** a landlord instruction; the agent lists title proprietor vs the person instructing; a Companies House / ROE hit if it's a company; stamp is "matched" or "do not advertise — ownership gap."
- **Track:** Track 5 (or 1 if framed as an onboarding workflow). Weaker fit to the Ares problem statements.
- **Data:** Dwelly 50 cases *if* they contain landlord onboarding (TBC). Companies House API (free). Official CCOD / some Land Registry products need registration and licences — **do not scrape or re-host.** A user-uploaded title PDF is safer tonight.
- **Sponsor tech:** Grok Bot + Parallel (Extract on a public Companies House page). No Twilio.
- **Solo MVP by 22:10:** possible with an uploaded title + a Companies House lookup. Weak if the Drive cases are something else.
- **Harsh advertised scores:** Relevance 7, Execution 5, Grok Bot & Cursor 6, Traceable data 7, Practical usefulness 7 (for Dwelly; low for Ares). **Adv 32/50.**
- **Old rubric /10:** execution 5, open source 6, community context 6, better than today 5, usefulness 7, demo 6. **Old /100: 58.**
- **Top 3 risks:** (1) Licensed land data. (2) Kate loves it and Ares/V7 do not, or the cases are the wrong type. (3) Becomes a generic AML demo (there are many compliance tools).
- **3 score-raising changes:** open one real Dwelly case tonight; user-supplied title only; keep it as "can we take this instruction?" not a full CDD platform.

### Idea 5 — CompConfirm (source a comp, then log a confirmation)

- **One user / buyer:** valuer or acquisitions analyst who has to defend a comparable in a memo.
- **Why they'd pay:** RICS says not to take comps at face value and to verify with the appropriate parties (https://www.rics.org/content/dam/ricsglobal/documents/standards/Comparable%20evidence%20in%20real%20estate%20valuation.pdf); IAAO says contact a party to the sale when needed (https://www.iaao.org/wp-content/uploads/Standard_on_Verification_Adjustment_of_Sales.pdf). MSCI RCA is the sponsor dataset for "ten comparable deals."
- **Single demo moment:** click a comp in the memo; see RCA or a public source; agent lists what is still unverified (incentives, special purchaser); "copy confirmation questions"; a pasted broker reply updates the figure's chain. No live call.
- **Track:** Track 3 (secondary), or 5.
- **Data:** MSCI comps if claimed cleanly; else Parallel + a brochure or Price Paid, honestly labelled as a weaker proxy.
- **Sponsor tech:** Grok Bot + (MSCI *or* Parallel, not both in the critical path).
- **Solo MVP by 22:10:** the confirmation log is doable; "live RCA" is not, until the Discord login works.
- **Harsh advertised scores:** Relevance 8, Execution 6, Grok Bot & Cursor 7, Traceable data 8, Practical usefulness 7. **Adv 36/50.**
- **Old rubric /10:** execution 6, open source 7, community context 7, better than today 6, usefulness 7, demo 6. **Old /100: 65.**
- **Top 3 risks:** (1) MSCI licence. (2) Thin demo if the "broker" is obviously the builder. (3) Two data sponsors and a gather feature — scope creep toward Idea 3 plus extras.
- **3 score-raising changes:** one comp, one source, one confirmation; if MSCI is late, do not fake it; merge this *into* Idea 3 as a single unconfirmed figure rather than a separate app.

---

## 6. Recommendation

**Build Idea 3, FigureLedger, on Track 3.**

It is the only idea that is simultaneously: (a) almost word-for-word the official Track 3 winning demo, (b) an honest version of Francesco's "stamp" (inspectable, not "never re-check"), (c) a place to hang the judge's "gathering" comment as *one* unconfirmed figure and a drafted request, without a two-sided call product, (d) the best "why Grok Bot" story (explain this figure, in chat, with code verifying the chain), and (e) the persona Ares judges already live in (IC memo). Advertised **43/50**, old rubric **77/100** — ahead of the others once lessons are applied (especially the penalties on two-sided products, extra integrations, and competing with V7 on extraction).

Do **not** also ship TrustStamp or Chase as separate products. If documents are late, the same memo can be preloaded. If Parallel or MSCI slips, keep the ledger and one local PDF citation. Cut Twilio. Cut Cognee. Open the pitch on the named analyst and why ChatGPT-on-a-PDF and a vanilla abstract still cannot tell the committee where the number came from.

Fallback if the memo UI is slipping at ~21:00: collapse to Idea 1's table, but still click a figure, still stamp, still chat "explain," and still submit Track 3 if every number is traceable — or Track 2 if the demo is clearly a batch extractor. Decide once, do not split the remaining time.

---

## 7. Questions for Francesco (these would most change the product)

1. **Which judge said "calling and gathering," from which company, and what were they gathering?** Estoppels, missing side letters, broker comps, tenant references, contractor quotes, or resident/compliance evidence? One answer should choose Chase vs CompConfirm vs a single button inside FigureLedger.
2. **Who is the buyer you would actually try to sell this to after tonight?** An Ares-like fund analyst, a UK managing agent (Cortile's customer), or a Dwelly lettings agency / Dwelly's own deal team? One user type only.
3. **Will you stand behind "a stamp so nobody re-checks," or is the claim "every figure is cited, mismatches are listed, and a human signs the stamp"?** The second is what the research supports; the first is a trust problem in the room.
4. **Have you already opened Cortile, Dwelly and the hand-labelled lease folder, and what is actually in the first files?** If Dwelly is tenant-referencing cases and Cortile is service-charge/compliance, that can flip the track. If nothing is open, we should start from the organiser lease sample and not wait on Discord.
5. **Is Grok Bot the primary UI (Discord or the bot chat) or a web app with the bot on the side?** This is the difference between a 9 and a 6 on "effective use of Grok Bot."
6. **Are Parallel and MSCI credentials actually in hand tonight?** If only one is live, we go deep on that one. If MSCI is live, will you accept "no RCA data in git or screenshots that republish rows"?
7. **Is there a real deal, building or memo from conversations tonight we can type into the app (even three figures)?** Real data entered tonight will beat a polished synthetic pack, and we should not invent one.

---

## Sources (selected)

- https://julianrsterling.com/articles/how-to-audit-a-rent-roll-in-due-diligence/
- https://rea.co/rent-roll-auditing-verify-accuracy-before-closing/
- https://morainecre.com/templates/files/moraine-cre-due-diligence-checklist.pdf
- https://www.legaldocuments.co.uk/commercial-property-law/due-diligence-in-commercial-property-investments/
- https://www.alexnahailaw.com/commercial-real-estate-estoppel-snda-due-diligence
- https://www.lintonglobalsolutions.com/glossary/estoppel
- https://www.rentecdirect.com/blog/what-is-an-estoppel-certificate/
- https://www.rics.org/content/dam/ricsglobal/documents/standards/Comparable%20evidence%20in%20real%20estate%20valuation.pdf
- https://www.iaao.org/wp-content/uploads/Standard_on_Verification_Adjustment_of_Sales.pdf
- https://www.bis.org/publications/ifc-report-8-mind-data-gap-commercial-property-prices-policy
- https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg2300
- https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg3200
- https://www.propertywire.com/news/why-establishing-true-ownership-is-important-for-agents/
- https://www.kolena.com/blog/lease-abstraction-with-ai/
- https://www.docsumo.com/solutions/use-cases/cre-underwriting
- https://updates.elysium-cre.com/blog/lease-abstraction-tools-compared
- https://www.dealpath.com/acquisitions/
- https://www.trepp.com/trepp-cre
- https://www.v7labs.com/ai-for-real-estate
- https://cortile.com/ https://cortile.com/company
- https://www.dwelly.group/
- https://www.ares.com/uk/businesses-and-products/our-businesses/real-estate
- https://parallel.ai/
- https://www.cognee.ai/
- https://www.msci.com/data-and-analytics/real-estate/real-assets-market-data
- Official event briefs: `knowledge/event.md`, `knowledge/tracks.md`

---

## 8. Head-to-head (19:17 Europe/London) — FigureLedger vs inspection agent vs maintenance triage

New input from Francesco after talking with a judge: many apartments; a tenant reports a broken boiler; a multi-agent system triages, picks the right contractor, books the appointment; a dashboard across units and services. He knows dispatch/ticketing products exist. His claimed gap: a **bulletproof triage backend** behind those multi-agent systems that **learns** and makes sure the information is **accurate and real** before acting (right property/unit/asset, warranty or landlord responsibility, urgency under UK rules, contractor certified and available, no hallucinated details).

Also in scope: **Idea B, the inspection agent** (Track 4 official winning-demo shape): talk through an inspection, Grok Bot asks follow-ups and tags photos to rooms, outputs a structured record, a to-do list, a coverage map of covered/missing areas, a draft client update (not sent), and a return visit that walks only the open items. No 3D.

The claimed "triage backend does not exist" is treated as a **hypothesis**. Research below.

### 8.1 Existing maintenance products — what their AI actually does

UK / lettings stack:

- **Fixflo / Aidenn** is the closest UK product to Francesco's story, and it already exists. Tenants chat with Aidenn; it asks troubleshooting questions, can analyse photos, then creates a Fixflo issue with a full triage report (work needed, troubleshooting steps, suggested parts, chat/photos). Agents can instruct contractors or request quotes; in emergencies Aidenn "can automatically dispatch" a contractor. Official pages say it can use uploaded **repair policies, asset information**, lockbox codes, emergency contacts, plus EPC, build/fabric and weather. They also say it is "self-improving" / "learns from every repair," and is "trained on more than 75,000 real repairs." Sources: https://www.fixflo.com/solutions/aidenn-ai-repairs-maintenance — what the agent sees: https://help.fixflo.com/support/solutions/articles/61000319590-fixflo-ai-reporting-what-happens-in-fixflo-when-an-issue-is-reported — what the tenant sees: https://help.fixflo.com/support/solutions/articles/61000319589-fixflo-ai-reporting-what-tenants-see-when-they-report-an-issue
- **Arthur Online**: occupier app to report issues with photos; contractor app to accept/reject jobs; quotes; optional Fixflo integration so Fixflo issues land on the Arthur to-do list with an audit trail. This is workflow, not a claimed verification engine. https://www.arthuronline.co.uk/features/workflow-management
- **Plentific**: work-order orchestration and contractor marketplace (quotes, auto-dispatch by availability, contractor onboarding/due diligence, performance KPIs). AI is described as "writing suggestions" to improve request clarity and first-time fix, not as a fact-verification gate. https://www.plentific.com/work-order-management/ https://www.plentific.com/contractor-management/
- **Reapit / Alto**: established UK agency platforms. Repairs often sit in the PMS, with **Fixflo integrations** for the specialist triage layer (Reapit: https://www.fixflo.com/integrations/lettings/reapit — Alto: https://support.altosoftware.co.uk/hc/en-gb/articles/5048144588319-Automate-property-management-interactions-with-Fixflo). They are not, on public pages reviewed tonight, a standalone "verified multi-agent triage backend."
- **Goodlord**: public platform pitch is tenancy, referencing and compliance, not a dedicated AI repairs triage product. https://www.goodlord.com/platform
- **Re-Leased**: UK commercial / mixed portfolio PMS (leases, events, reporting). Maintenance is a normal PMS capability; it is not a headline AI triage engine in the sources checked. Context: https://heyjodie.com/en-gb/guides/best-property-management-software/
- **Cortile** (judge partner, not a ticketing marketplaces): one traceable enquiry → task flow, AI **response suggestions from house rules**, inspection-style **checklists and evidence uploads**, recurring compliance tasks, resident appointment booking. It does not, on the public product page, advertise Gas Safe contractor matching or a verification matrix that blocks auto-dispatch. https://cortile.com/product

US / international (often what "Elise / Latchel / Vendoroo" refers to):

- **AppFolio Realm-X Maintenance Performer**: talks to residents, analyses images, troubleshoots, prioritises emergencies, dispatches the right technician (or Lula network if in-house techs are unavailable). Built into AppFolio only. https://www.appfolio.com/property-manager/maintenance
- **Property Meld / MAX**: conversational intake and diagnosis; vendor routing; MAX On-Call claims it handles the "**40%** of reported emergencies that are not actually emergencies" before an overnight dispatch. Their May 2025 benchmarking PDF is cited as MAX users averaging **1.09 appointments per work order** vs **1.14** with traditional intake (vendor benchmark, not an independent audit). https://propertymeld.com/blog/max-on-call-redefining-maintenance-triage/ https://propertymeld.com/meet-max/ https://propertymeld.com/wp-content/uploads/2025/08/PM25-Industry-Benchmarking-Report-May-FNL.pdf
- **Latchel**: 24/7 intake (call/text/portal), AI-assisted triage plus human experts, vendor dispatch, invoice collection. A managed desk, not just a model. https://kaspen.ai/compare/best-ai-property-management-software
- **Vendoroo / Roo**: diagnoses, selects a vendor from the manager's plain-English rules, and — importantly — **if Roo dispatches the wrong vendor, Vendoroo covers the trip fee**; "when it isn't sure, it asks you first." https://www.vendoroo.ai/guarantee https://www.vendoroo.ai/vendor-selection
- **EliseAI**: conversational AI across leasing, renewals and maintenance for large multifamily; maintenance is a component, not the specialty. Same comparison write-up as above.
- **Lofty**: no solid public source found tonight that Lofty (or an "AppFolio Realm-X Lofty" product) is a distinct maintenance-triage engine. Treat as **TBC** / possible name mix-up with Realm-X.
- **"Mobile Mechanic"**: no well-known UK property-management product under that exact name was found. There are general mobile-mechanic schedulers and tools such as PropDispatch.ai (24/7 AI intake and dispatch). Do not assume a specific competitor without a URL.

**Honest gap:** intake, diagnosis, auto-dispatch, contractor marketplaces, learning-from-jobs, and even a **wrong-trade trip-fee guarantee** already exist (especially Fixflo Aidenn in the UK, Vendoroo in the US). Francesco's claim that "the triage backend behind multi-agent systems does not exist" is **not supported**. What is still weakly productised, and is demo-able, is a **visible deterministic gate**: each fact marked verified/unverified against a source record or a cited UK rule, with auto-dispatch blocked until the gate is green, and questions sent back for anything unverified. That is closer to FigureLedger's "inspectable stamp" than to a new marketplace. Do not open the pitch with "nobody has built triage."

### 8.2 Costs of getting triage wrong (label the source)

- Dispatching the wrong or unqualified vendor is a standard cause of low first-time-fix and double dispatches (trip fees typically cited at **$50–$125** before work, plus emergency premiums). Source is vendor/ops content, not a UK official statistic: https://lula.life/articles/rental-property-maintenance-costs
- A 2025 field-service KPI write-up (citing FieldProMax / PTC) puts average first-time-fix at **76%**, best-in-class **88%,** underperforming below **65%** — i.e. roughly one in four jobs needs a second visit, often because skill, parts or certification were wrong at dispatch (e.g. gas vs non-gas). This is **secondary / vendor-adjacent**, not a property-management census: https://www.triadagency.ai/blog/field-service-first-time-fix-rate-upstream/
- Property Meld's own figures (see above): ~40% of resident-reported "emergencies" are not; 1.09 vs 1.14 appointments per work order.
- A single OxMaint vendor case study claimed **43%** of dispatches had coordination errors (duplicates, wrong trade, missed scope) before their tool, falling to 6%. **n=1, vendor case, treat cautiously**: https://oxmaint.com/industries/property-management/case-study-mixed-use-property-vendor-management
- Vendoroo's guarantee exists because wrong-trade dispatch is common enough to productise a refund: https://www.vendoroo.ai/guarantee

There is enough evidence that **wrong trade / incomplete intake / missing certification** causes repeat visits. There is not a single authoritative UK "cost per wrong boiler dispatch" figure found tonight.

### 8.3 UK rules that make "accurate" checkable

Cite these in the demo. Do **not** apply the social-housing clock to a private let without saying so.

- **Gas Safe (checkable):** a landlord must have gas equipment they supply "safely installed and maintained by a Gas Safe registered engineer" and an annual gas safety check by a registered engineer; the record goes to the tenant before move-in or within 28 days of the check. Official: https://www.gov.uk/private-renting/your-landlords-safety-responsibilities — HSE "Check an engineer": https://www.hse.gov.uk/gas/gas-safe-register-check.htm — register: https://www.gassaferegister.co.uk/ . A boiler job dispatched to a plumber who is not Gas Safe is a legal miss, not just a quality miss. This is the cleanest deterministic check tonight (contractor record, or a live Parallel/HSE lookup if the register page is used carefully and not scraped against terms).
- **Landlord and Tenant Act 1985 s.11 (checkable against tenure + issue type):** implied obligation, generally for short residential tenancies, to keep in repair the structure and exterior, and to keep in repair and proper working order installations for water, gas, electricity, sanitation, space heating and water heating. Official text: https://www.legislation.gov.uk/ukpga/1985/70/section/11 — GOV/MHCLG summary in the 2026 consultation also lists "electrical wiring, gas pipes and boilers, heating and hot water, sinks, baths, toilets, pipes and drains, and the structure and exterior." A boiler is typically a landlord obligation; tenant damage and some leasehold/freehold splits are exclusions (s.11 is consistent with that). https://www.gov.uk/government/consultations/extending-awaabs-law-to-private-rented-tenancies-and-to-licences/extending-awaabs-law-to-private-rented-tenancies-and-to-licences
- **Awaab's Law (social housing only, today):** from **27 October 2025**, social landlords must investigate and make safe **emergency hazards within 24 hours**; significant damp and mould must be investigated within **10 working days**, made safe within **5 working days** of the investigation ending, with a written summary within **3 working days**; further preventative work started (or steps taken) within 5 working days and physically begun within **12 weeks**. Official tenant guidance: https://www.gov.uk/government/publications/awaabs-law-guidance-for-tenants-in-social-housing/awaabs-law-guidance-for-tenants-in-social-housing — landlord guidance: https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector
- **Awaab phase 2, social, from 30 November 2026** (18 days after this event, subject to the regulations laid 13 July 2026): extends significant-hazard clocks to excess cold and heat, falls, structural collapse, fire and explosions, electrical hazards, and hygiene. https://www.gov.uk/government/news/safer-homes-for-4m-tenants-with-quicker-action-on-dangerous-homes
- **Renters' Rights Act 2025 and private rented sector:** the Act takes **powers** (ss. 60–61) to extend Awaab's Law to private tenancies and some licences. As of 12 Nov 2026 those clocks are **not in force** for private lets. A government consultation published 9 October 2026 closes **18 December 2026**; it says existing PRS law requires repairs within a **reasonable time**, not a fixed statutory number of hours, and that the earliest feasible PRS implementation date would be **2027**. https://www.gov.uk/government/consultations/extending-awaabs-law-to-private-rented-tenancies-and-to-licences/extending-awaabs-law-to-private-rented-tenancies-and-to-licences
- **Emergency repair SLAs in the private sector:** no single statutory 24-hour private-let SLA was found. Agencies and housing providers often have **contractual / policy** emergency timescales. In a demo, label the clock as "social Awaab," "agency policy," or "s.11 reasonable time" according to the tenure in the seed data. Do not invent a PRS statute.

Warranty and "who pays" are checkable **only if** the asset or lease record contains them. That depends on the dataset.

### 8.4 Cortile / Dwelly data — what is actually known

Still no file-level schema without opening Drive/Discord. Public facts only:

- **Cortile hackathon dataset (official brief):** synthetic data on ~300 developments and 1,000+ buildings, including **leases, occupancy, service charges, compliance and maintenance**; JSON plus a read-only API. Whether that includes contractor lists, Gas Safe numbers, warranties, asset make/model, or SLAs is **TBC** until the JSON is opened. The company's live product (above) is enquiry/task/compliance evidence, not a published contractor-certification graph.
- **Dwelly:** 50 synthetic **letting-agency business cases**. Maintenance tickets and contractor diaries may or may not be in them (**TBC**). Dwelly is an agency acquirer; repairs in UK lettings usually flow through Fixflo/Arthur/Reapit rather than a custom triage engine.

If neither dataset has contractor certification or asset warranties tonight, **seed a small honest JSON** (one building, a few units, two contractors, one boiler asset) and say so on screen. Do not wait on Discord for C or B if the clock is 19:17.

### 8.5 Can B and C merge?

Yes as a **data model**, no as tonight's **product**. An inspection can write the asset record that later triage verifies against. That is one platform in a company, and two stories in a 2-minute demo. Past-hackathon lesson: two products / two user journeys usually halve the score. If we pick B, preload the asset register and allow one to-do to show "not dispatchable until Gas Safe + responsibility are verified" — a nod, not a second app. If we pick C, preload the asset record "as if from last week's inspection" and do not also walk the building on stage.

### 8.6 Harsh head-to-head scores

Same method as section 5: advertised five criteria /10, sum **/50**; old six-criterion rubric /10 then scaled `sum * 100/60` to **/100**. Lessons applied: official winning demo, one user, 1–2 sponsor techs, no live Twilio, "why Grok Bot" visible, agent proposes + code verifies, honesty on tenure and synthetic data, 22:10 solo feasibility hits **execution**.

| | FigureLedger (Track 3) | B Inspection agent (Track 4) | C Verified triage (Track 4 or Open) |
| --- | --- | --- | --- |
| Relevance | 9 | 8 | 8 |
| Execution (22:10 solo) | 7 | 7 | 5 |
| Grok Bot & Cursor | 9 | 9 | 7 |
| Traceable data | 10 | 8 | 9 |
| Practical usefulness | 8 | 8 | 7 |
| **Advertised /50** | **43** | **40** | **36** |
| Old rubric /10 (exec / OSS / context / better than today / useful / demo) | 7 / 8 / 7 / 7 / 8 / 9 | 7 / 8 / 7 / 6 / 8 / 8 | 5 / 7 / 7 / 5 / 7 / 7 |
| **Old /100** | **77** | **73** | **63** |

**FigureLedger — top 3 risks / 3 fixes** (unchanged in substance): looks like a V7/Elysium wrapper if the pitch opens on extraction; MSCI misuse; memo sprawl. Fixes: open on a named analyst who cannot defend a figure; show agent vs code on one contested number; sign the stamp and leave one figure unconfirmed.

**B Inspection — top 3 risks:** (1) Photo tagging and coverage-map UI eats the clock. (2) Return-visit + unsent client email + to-do list is three features in a 2-minute slot. (3) Cortile already turns inspection evidence into tasks; a generic "AI notes app" will not impress Shéa. **3 fixes:** one property, five rooms, photos taken or preloaded tonight; coverage map is a room checklist, not a floor-plan product; Grok Bot *asks* the missing question ("is the staining on the bathroom ceiling?") and the to-do cites the photo. Cut live email send (already planned). Cut 3D (already planned).

**C Triage — top 3 risks:** (1) Judges who know Fixflo/Vendoroo will reject "this backend does not exist." (2) Multi-agent + live booking + learning + a portfolio dashboard will not be bulletproof by 22:10; a thin clone loses. (3) Applying Awaab 24-hour clocks to a private let is a factual error in front of UK operators. **3 fixes:** pitch the *visible verification gate*, not the marketplace; auto-dispatch only when every check is green; label tenure and the legal source on each urgency row; seed contractors (one Gas Safe, one not) so the wrong-trade block is obvious.

**C sharp MVP (only if C is chosen):** no marketplace, no ML "learning" loop, no Twilio, no real calendar API. Seed 1 building / 4–6 units / 2–3 contractors / 1 boiler asset. Path: tenant message in chat → agent proposes triage (trade, urgency, contractor) → a checklist shows each fact **verified / unverified** against the seed record or a cited rule (unit exists, asset is that boiler, s.11 responsibility, urgency rule with the correct tenure label, contractor Gas Safe yes/no, contractor available in the seed diary) → only an all-green job is marked auto-dispatched (a booked slot in the seed data); any red check becomes a question back to the tenant or a human approval. A simple unit dashboard with the audit trail. Parallel (optional, one live Gas Safe or official-page lookup) *or* a local register table — not both plus V7.

**22:10 feasibility:** FigureLedger and B are both doable if scoped to one memo or one walk. C's verification-gate MVP is doable; C as a "multi-agent learning operating system" is not.

### 8.7 Recommendation

**Lock Idea B, the inspection agent, on Track 4.**

FigureLedger still **wins the raw score** (43/50, 77/100) and remains the right pick if the panel were only Ares, or if FigureLedger is already mid-build — do not context-switch a half-written memo app at 19:17. For a lock made now, B is the one to build:

- It **is** the official Track 4 winning demo ("walk a property or replay a tour: photos, notes and discussion become a structured record a manager can act on, with a prioritised action list").
- Grok Bot is the product (follow-up questions during the walk), which was the weak criterion at a past event when it was invisible.
- It sits in Cortile's world (evidence, checklists, tasks, resident/client reporting) without pretending to replace Fixflo.
- It is shippable by 22:10 as one building, one walk, one coverage checklist, one to-do list, one unsent draft update, and a return-visit list of open items only.
- C's insight (verified facts before acting) is kept as **one to-do status**, not a second product: e.g. "Boiler — cannot auto-dispatch: Gas Safe contractor not yet confirmed." That honours the judge conversation without a two-product demo.

Do **not** pitch C's "bulletproof backend that does not exist." If Francesco insists on C after the questions below, build only the verification-gate MVP in 8.6, on Track 4, and drop multi-agent theatre.

### 8.8 Demo script beats for Idea B (about 2 minutes)

1. **~20s — problem.** Named user (block or lettings manager). "Last month's inspection is 40 photos and a voice note. The boiler was 'probably fine.' We are walking the same rooms again." Why a generic chat app fails: it does not tag evidence to a room or tell you what you missed.
2. **~35s — live walk / replay.** Grok Bot asks one follow-up; a photo is tagged to "Bathroom — ceiling"; a damp/mould risk is flagged as a question, not a diagnosis.
3. **~20s — coverage map.** Room list: done vs not done (e.g. loft unvisited). This is the "I did not miss a wing" moment.
4. **~25s — structured record + to-do.** Actions a manager would take, each cited to a photo or note. One item shows an inspectable check (landlord responsibility under s.11, or "not dispatchable until Gas Safe is verified").
5. **~20s — draft client update, not sent**, plus the **return-visit list** of open items only.
6. **Honesty / privacy (~10s, can be on-screen).** Synthetic or tonight's own photos; no 3D; email is a draft; if Cortile data is used, say it is the synthetic hackathon set.

Sponsor tech: **Grok Bot + Cursor**. Parallel only if there is spare time for one official-page citation (e.g. EPC or Gas Safe). No Twilio.

### 8.9 Questions that still matter (2–3)

1. **Was the judge who talked about boilers and dashboards from Cortile, Dwelly, V7, or somewhere else?** A Cortile or Dwelly judge pulls hard to B or a thin C; an Ares judge pulls back to FigureLedger.
2. **Have you opened the Cortile JSON (and Dwelly cases), and do they actually contain assets, warranties, contractor names or Gas Safe IDs — or only leases / occupancy / service charges?** If the records are not there, we seed a tiny honest file and do not wait.
3. **If you still want C, will you drop the line "this backend does not exist," drop live booking/Twilio/learning, and accept a verification-gate MVP — or do we lock B and only show one "not dispatchable" to-do?**

### Additional sources for section 8

- https://www.fixflo.com/solutions/aidenn-ai-repairs-maintenance
- https://help.fixflo.com/support/solutions/articles/61000319590-fixflo-ai-reporting-what-happens-in-fixflo-when-an-issue-is-reported
- https://www.arthuronline.co.uk/features/workflow-management
- https://www.plentific.com/work-order-management/
- https://www.appfolio.com/property-manager/maintenance
- https://www.vendoroo.ai/guarantee
- https://propertymeld.com/blog/max-on-call-redefining-maintenance-triage/
- https://www.gov.uk/private-renting/your-landlords-safety-responsibilities
- https://www.hse.gov.uk/gas/gas-safe-register-check.htm
- https://www.legislation.gov.uk/ukpga/1985/70/section/11
- https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector
- https://www.gov.uk/government/publications/awaabs-law-guidance-for-tenants-in-social-housing/awaabs-law-guidance-for-tenants-in-social-housing
- https://www.gov.uk/government/consultations/extending-awaabs-law-to-private-rented-tenancies-and-to-licences/extending-awaabs-law-to-private-rented-tenancies-and-to-licences
- https://www.gov.uk/government/news/safer-homes-for-4m-tenants-with-quicker-action-on-dangerous-homes
- https://cortile.com/product

---

## 9. Refined Idea D — "repair-to-booking agent" (19:35 Europe/London)

Francesco's own experience as a UK tenant in an old house (treat as real behaviour, one person's cases, not a market survey):

- **Broken floor:** his brother sent photos through the agency portal and got **no answer for weeks**.
- **Sink hot-water tap stuck open:** they had to shut off the hot water; the agency replied **days later only to ask for availability**.

Proposed flow: tenant reports with photos in chat → Grok Bot triages (issue, room, urgency, responsibility, trade) against the building/unit record and cited rules (s.11 LTA 1985; Awaab's Law **only if the unit is social housing**) → it proposes booking slots **immediately** from the operator's availability → the tenant picks one → an agency dashboard shows all units, SLA clocks and overdue repairs → after the visit, the plumber/operator completes a short guided questionnaire in the dashboard (photo, cause, parts, fixed yes/no, follow-up needed) → that updates the unit's verified history and closes the loop, with a **draft** tenant notification (not sent). Unverified facts **block auto-booking** and become a question back.

### 9.1 Two-sided risk — frame as one buyer

Tenant + operator + agency is **three user types**. Past-hackathon lesson: two-sided products usually halve the score. **Do not** build three apps, three logins, or a contractor marketplace.

**Mandatory framing:** the **buyer is the letting agency / property manager**. The tenant chat and the operator questionnaire are lightweight touchpoints *on the same product* (a public report link and a job-completion form, no separate operator portal, no tenant CRM). The pitch opens on the agent's problem: "We answered a flooding tap three days later only to ask when they were free — and a floor sat in the portal for weeks." Not on "a tenant app plus a plumber app."

If this is built or pitched as three products, apply the two-sided penalty and the advertised total falls to the low 20s. The scores below assume the one-buyer framing is held.

### 9.2 How this differs from Fixflo Aidenn, Plentific and Cortile

- **Fixflo / Aidenn** already does the chat triage, photo analysis, troubleshooting, a job report, and (in emergencies) auto-dispatch to a contractor, after which the *agent* instructs works or requests quotes from Fixflo's next-steps tab (https://www.fixflo.com/solutions/aidenn-ai-repairs-maintenance, https://help.fixflo.com/support/solutions/articles/61000319590-fixflo-ai-reporting-what-happens-in-fixflo-when-an-issue-is-reported). What Francesco actually waited for — **a booking slot in the same conversation, the same day** — is not the Aidenn headline. The wedge is not "we invented triage." It is "do not come back days later only to ask when the tenant is free," plus a completion form that writes a **verified unit history**.
- **Plentific** dispatches and quotes against contractor availability and onboarding (https://www.plentific.com/work-order-management/). It is a marketplace/orchestration layer, not a tenant-facing "pick a slot now" chat with a visible fact gate.
- **Cortile** already lets residents **select appointment slots** for amenities/building services and runs a traceable enquiry-to-task flow (https://cortile.com/product). It does not, on the public product page, advertise a Gas Safe / s.11 verification gate that *blocks* booking, or an operator completion questionnaire that updates a cited unit history. Do not tell a Cortile judge "you have no booking." Tell them "booking is blocked until the fact is verified, and the visit writes the history."

Awaab clocks still apply **only to social housing** (see section 8.3). An old private house uses s.11 "reasonable time" or an **agency policy** clock, labelled as such. Using a 24-hour Awaab badge on Francesco's tenancy would be a factual error.

### 9.3 Track fit

**Track 4** (operations / asset and property management). The official "what to build" list includes "a property-management copilot over tenant requests, maintenance and arrears." Dashboard + less reporting fits the track summary.

It does **not** match the official **winning demo** (walk or replay a tour: photos and notes become a structured record and a prioritised action list). Idea B still owns that script. Submit as Track 4, and be ready for "why didn't you walk the building?" Answer: this is the copilot bullet, grounded in a real tenant-to-agent failure; the completion form is the structured record.

Open track is a fallback only if they want to lean on "a new idea that does not fit," which is weaker — this clearly fits Track 4.

### 9.4 Harsh scores vs FigureLedger and B

Same method: advertised five /10, sum **/50**; old six /10 scaled `* 100/60` to **/100**. Execution is scored for a **solo 22:10** finish (about 2 hours 35 minutes from 19:35).

| | FigureLedger (T3) | B Inspection (T4) | **D Repair-to-booking (T4)** |
| --- | --- | --- | --- |
| Relevance | 9 | 8 | **9** |
| Execution (22:10 solo) | 7 | 7 | **5** |
| Grok Bot & Cursor | 9 | 9 | **8** |
| Traceable data | 10 | 8 | **9** |
| Practical usefulness | 8 | 8 | **8** |
| **Advertised /50** | **43** | **40** | **39** |
| Old /10 (exec / OSS / context / better than today / useful / demo) | 7 / 8 / 7 / 7 / 8 / 9 | 7 / 8 / 7 / 6 / 8 / 8 | **5 / 8 / 7 / 6 / 8 / 7** |
| **Old /100** | **77** | **73** | **68** |

D is the **best of the triage family** (earlier C was 36/50 and 63/100) because the premise is now a real behaviour, not "a backend that does not exist," and the demo moment is sharp (slots now; completion writes history). It still trails FigureLedger clearly, and trails B on execution, official winning-demo fit, and the old rubric. Relevance ties FigureLedger: the floor-and-tap stories are excellent pitch material.

**Top 3 risks**

1. **Three surfaces in 155 minutes.** Tenant chat + slot picker, agency dashboard with SLA clocks, operator questionnaire — one of them will be thin or broken, and the 2-minute demo will wander.
2. **Looks like a Fixflo demo** unless the fact-gate and the "book now, don't email days later" moment are the first things on screen. "Grok Bot triages a boiler" is a crowded sentence.
3. **Scope creep back into a marketplace** (live calendars, SMS to plumbers, payments, Awaab clocks on a private let, "learning"). Any of those can tank accuracy or honesty.

**Top 3 fixes**

1. One buyer, one deploy, **role toggle or a `/job/:id/complete` link** — not three apps. Local JSON, not a new Supabase schema, unless Supabase is already live in the first 20 minutes.
2. Demo only **two jobs**: the stuck hot-water tap (urgent, book today) and the broken floor (overdue, photos sat unanswered). One operator, pre-seeded slots. Show one blocked booking (e.g. trade not Gas Safe, or unit not in the record) and one successful pick.
3. Open the pitch on the **agency's** failure ("we asked for availability three days after they shut the water off"), then show Grok Bot proposing cited triage + slots in one thread, then the completion form updating history. Say the tenant message is a draft / not emailed.

### 9.5 Solo MVP by 22:10

Stack: **Next.js on Vercel**, **local JSON** as the source of truth (Supabase only if it is already connected and seeded by ~19:55; otherwise it is a third integration you do not have time for). **xAI / Grok** for triage proposals only. **Deterministic TypeScript** for: unit exists, room, s.11 responsibility, tenure-correct urgency rule, trade vs contractor certification, slot still free. Unverified ⇒ question, no slot picker. Photos: upload to public `/public` or Vercel blob if easy; otherwise accept a file and store a path. No Twilio, no real SMS, no Parallel unless a single Gas Safe page lookup is already wired. Draft notification rendered on screen, **Send disabled**.

Seed: 1 building ("old house"), 2 units, 1 operator (Gas Safe plumber), 4 slots today/tomorrow, 1 overdue floor job already sitting "unanswered," 1 agency policy clock for the private let (e.g. emergency 24h / routine 5–7 days — **labelled policy, not Awaab**).

**Cards (lanes do not share files)**

- **DEP1 — Deploy empty Next.js to Vercel** (first). Files: app shell, README. Done when the public URL opens logged-out.
- **DB1 — Seed + types** (data lane). Files: `data/seed.json`, `lib/types.ts`, `lib/store.ts`. Done when two units, one contractor, slots, and one overdue floor job load.
- **AG1 — Deterministic checks + Grok proposal** (agent lane). Files: `lib/checks.ts`, `lib/triage.ts`. Done when a fixture message returns verified/unverified rows with rule citations, and booking is blocked if any row is red. Don't run a test suite unless this card says so — a single fixture script is enough.
- **UI1 — Tenant chat + photo + slot pick** (UI lane). Files: `app/report/page.tsx` (and chat components only). Done when a user can submit the tap story, see the gate, pick a green slot, and is asked a question instead when a fact is red.
- **UI2 — Agency dashboard + operator completion + draft notice** (UI lane, **after UI1**, same lane so two agents do not collide). Files: `app/dashboard/page.tsx`, `app/jobs/[id]/complete/page.tsx`. Done when the dashboard lists both jobs with clocks, the overdue floor is visibly late, the operator form (photo, cause, parts, fixed, follow-up) writes history, and a tenant update is shown as a draft.

If 21:20 and UI2 is not started: skip a pretty dashboard, put the job list and the completion form on one `/dashboard` page, and film that. Do not start a learning loop or a second trade.

### 9.6 Demo beats (~2 minutes)

1. **~20s — problem, named user.** "I'm the agent. A tenant in this old house shut off the hot water; we wrote back three days later to ask when they were free. A floor with photos sat in the portal for weeks." Why the existing portal/chat fails: it logs the issue and delays the only question that matters (a slot).
2. **~30s — tap job, live chat.** Photos in; Grok Bot proposes: room, leak/tap, urgent, s.11 heating/hot water, plumber. Checks go green on screen (unit, responsibility, policy clock, contractor cert, slot free). Tenant picks a slot **in the same thread**.
3. **~15s — blocked path (one beat).** Change trade or contractor so Gas Safe/cert fails — booking stays closed, a question comes back. Agent proposes, **code** blocks.
4. **~25s — dashboard.** Both units; tap is booked; floor is overdue (days/weeks). Clocks labelled "agency policy" on this private let.
5. **~20s — completion.** Operator form: photo, cause, parts, fixed, follow-up? History updates. Draft "your tap is fixed" is visible, not sent.
6. **~10s — honesty.** Seeded availability, synthetic or tonight's photos, private tenancy so no Awaab 24-hour statute, notifications are drafts.

### 9.7 Lock or not

**Do not lock D as the default over FigureLedger or B.** Raw scores are still behind (39/50 and 68/100 vs 43/77 and 40/73). Track 4's winning demo remains the inspection walk. Execution risk at 19:35 is the highest of the three.

**Lock D only if** Francesco would rather tell the floor-and-tap story than click a memo figure or walk a building, **and** he accepts: one buyer (the agency), no third app, local JSON, two jobs, policy clocks not Awaab, and the cuts in 9.5. In that case it is a legitimate Track 4 build, and a stronger operational idea than the earlier "multi-agent triage backend."

If FigureLedger or B is already mid-build, do not switch.
