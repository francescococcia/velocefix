# Tracks — Grok Bot Real Estate Hackathon London

Official source: the hackathon site track cards and full brief dialogs, plus the shared module `/app/lib/tracks.js`. Luma still says tracks are revealed at kick-off; the site is the current official brief.

There are **five tracks**, built from problem statements developed with Ares' Real Estate team, including an open track. "Not sure? Pick the closest one, or the open track for your own idea."

**Shared advertised judging criteria** (no published weights): Relevance to a real estate problem; Quality of execution; Effective use of Grok Bot and Cursor; Traceable data; Practical usefulness. See `event.md` for the conflicting six-criterion judge-portal config.

**Recommended stack on every official track brief:** "Grok Bot by SpaceXSI and Cursor to build; Parallel for web research and for reading web pages and documents (Search, Extract and Task APIs, plus an MCP server)."

**Shared data instruction on every brief:** partner data first, then free public data. Claim partner data in Discord (invite https://discord.gg/rad8eCmBnE) after Luma check-in from 18:15: `/credits` or Claim Grok credits → Other credits. Cortile = JSON + read-only API (~300 developments, 1,000+ buildings). Dwelly = 50 synthetic letting-agency cases in Drive (https://drive.google.com/drive/folders/1pd48BZ7Bw6UZC5M9A9QikKFYrUFbY9NA). MSCI RCA = licensed real deal/comp/holdings/counterparty data (use in the project; do not bulk-download, republish, or commit to the repo). Drive map: open `00-START-HERE` in Bulk (https://drive.google.com/drive/folders/1CD6-vfoAwwqf0rUVEVnvp7nMDDpthaMe).

Common public / Drive sources repeated on most briefs (listed once here; track sections add extras):

- Legal and lease documents (CUAD and DocLayNet are general contracts, not a labelled lease set): https://drive.google.com/drive/folders/1SWHm9n2DYXvo2x8DVq8aQH62YggB_V9l
- Official and public leases (Model Commercial Lease templates, Land Registry prescribed clauses): https://drive.google.com/drive/folders/1kWtQ2pAaF7iU44EmE_HNk26C5tBiNTuG — also [Model Commercial Lease](https://www.modelcommerciallease.co.uk/downloads/) and [LR1–LR14](https://www.gov.uk/government/publications/prescribed-clauses-leases/practice-guide-64-prescribed-clauses-leases)
- Hand-labelled lease sample (CSV/JSON, labelled by the SpaceXSI organisers): https://drive.google.com/drive/folders/1LjgXVJQ-U5_oFC3xP19hNcEcdtmCkGuO
- Deal documents and brochures (notes + a few investor PDFs): https://drive.google.com/drive/folders/1Imv8b_ROCcLcOQ0IQPh5JTMQJGcxTMdN
- 185 sale brochures: https://drive.google.com/drive/folders/1SZ4RsM0HTTPIL9hkAW3LCUxr-QOxL5LV
- Bulk deal-document zips (~600 more PDFs): https://drive.google.com/drive/folders/114tM2epiIE1RjxiqfBIIdDAbGqRKmOZo
- Live listings (v2), 7,251 listings and 2,175 auction results, crawled 24 October 2026 (snapshot): https://drive.google.com/drive/folders/1iETABcRlxncchFs-gf4m2ip11Nv9tse5
- HM Land Registry Price Paid (OGL): https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
- Official EPC open data (OGL, free GOV.UK One Login): https://get-energy-performance-data.communities.gov.uk/ — Scotland: https://www.scottishepcregister.org.uk/ — individual certificates: https://www.gov.uk/find-energy-certificate
- OS OpenData / Open UPRN (OGL): https://osdatahub.os.uk/downloads/open/OpenUPRN and https://osdatahub.os.uk/downloads/open
- Companies House free API: https://developer.company-information.service.gov.uk/
- UK House Price Index (OGL), latest checked download August 2026: https://www.gov.uk/government/collections/uk-house-price-index-reports and https://www.gov.uk/government/statistical-data-sets/uk-house-price-index-data-downloads-august-2026--2
- postcodes.io (MIT): https://postcodes.io/
- Generate your own synthetic leases, memos, rent rolls or sensor CSVs if needed (no download)

---

## Track 1 · Workflows & orchestration

**Id:** `knowledge-workflows`  
**Title:** Running knowledge workflows end to end with agents  
**Summary:** Move a real estate workflow from point tools to one agent-run process that every stakeholder can follow.

### The problem

Deals and loans move through intake, analysis, memos and approvals spread across email, spreadsheets and people. Dependencies, decisions and follow-ups get lost between steps.

### Where teams get stuck

- Each step lives in a different tool, so nobody sees the whole workflow.
- Chasing stakeholders for inputs and sign-offs is manual.
- Cycle time and bottlenecks are not measured.

### What to build

- An agent that runs a deal-screening workflow end to end (intake, extraction, summary, draft memo) and logs every step.
- An orchestrator that tracks dependencies, decisions and follow-ups on a transaction and chases the right person.
- A cycle-time tracker that flags where work stalls.

### What a winning demo looks like

Take one acquisition or lending deal. Show dependencies, decisions and follow-ups landing from email and a deal chat into a shared tracker, then through to a draft memo, with every step, owner and decision logged.

### How it's judged

How much of the workflow really runs end to end. Clear logs and hand-offs. Whether a team would use it on the next deal.

### Data (track-specific notes)

Partner data first (MSCI RCA, Dwelly, Cortile), plus v2 listings, deal documents and the 185 sale brochures, and the common public sources above. Track 1 also lists Market source notes and 1,000-row samples (not official EPC/VOA/UK HPI bulk): https://drive.google.com/drive/folders/1Td-OPJye1igkSWo5C7w9e49MsioHBnnm — full files in Bulk, Large Files (split): https://drive.google.com/drive/folders/1POT--Z2Fc2Yx8N7zk0ofgWRP9_GquEYu

### Useful open-source listed on this brief

- leafmap (MIT) — https://github.com/opengeos/leafmap
- OpenAddresses (BSD-3-Clause) — https://github.com/openaddresses/openaddresses
- Overture Maps data — https://github.com/OvertureMaps/data
- Rangekeeper (MPL-2.0), real-estate DCF — https://github.com/daniel-fink/rangekeeper
- RESO tools — https://github.com/RESOStandards/reso-tools
- osdatahub (OGL; free OS Data Hub key for some open products) — https://github.com/OrdnanceSurvey/osdatahub
- OSMnx (MIT) — https://github.com/gboeing/osmnx — "This is OSM data, not a substitute for Parallel."
- city2graph (BSD-3-Clause) — https://github.com/c2g-dev/city2graph — can store the spatial graph in Cognee; it does not replace Cognee
- mgwr (BSD-3-Clause) — https://github.com/pysal/mgwr
- tobler (BSD-3-Clause) — https://github.com/pysal/tobler — site-level figures can be kept in Supabase/PostGIS

---

## Track 2 · Documents

**Id:** `document-extraction`  
**Title:** Extracting structured data from large volumes of leases, memos and rent rolls  
**Summary:** Turn piles of leases, memos and rent rolls into structured, checked data that feeds a decision.

### The problem

Real estate teams receive large volumes of external documents. Parsing is the foundation; the value is in what you build on top: routing, review and decisions.

### Where teams get stuck

- Key terms sit in long PDFs in different formats.
- Teams need to know what the AI caught, missed or invented.
- Extracted data rarely flows into the model or tracker that needs it.

### What to build

- Lease abstraction to structured fields with page-level citations.
- Offering memorandum or rent roll to a proforma.
- An eval harness that scores extraction against a hand-labelled set and shows misses and inventions.
- An inbox-to-database pipeline that classifies and routes incoming documents.

### What a winning demo looks like

A batch of leases, memos or rent rolls goes in. Structured fields come out with citations, plus a clear view of what the model caught, missed or invented, enough that a reviewer can trust it.

### How it's judged

Accuracy on a labelled sample. Citations for every field. What is built on top of the parsing.

### Data (track-specific notes)

Cortile, Dwelly, MSCI RCA, the legal/lease Drive set (use the **hand-labelled lease sample** for eval — CUAD/DocLayNet are not a lease gold set), 185 brochures and Bulk deal-document zips, common official open data, and synthetic documents you generate.

### Useful open-source listed on this brief

- CUAD dataset — https://github.com/The-Atticus-Project/cuad — labelled general contracts, not a lease gold set
- Google Open Buildings — https://sites.research.google/open-buildings/
- Microsoft building footprints (CDLA-Permissive-2.0) — https://github.com/microsoft/GlobalMLBuildingFootprints
- samgeo / segment-geospatial (MIT) — https://github.com/opengeos/segment-geospatial
- IfcOpenShell (LGPL-3.0) — https://github.com/IfcOpenShell/IfcOpenShell — "Use it alongside V7: V7 for leases, memos and rent rolls; IfcOpenShell for BIM and design files, not as a replacement."

---

## Track 3 · Attribution & provenance

**Id:** `provenance`  
**Title:** Tracing every figure back to its source  
**Summary:** Show where every number in an analysis came from, who added it, when, and how it changed.

### The problem

Analyses pass through many hands. When a figure is questioned, nobody can quickly show its source document, author and history.

### Where teams get stuck

- Numbers are copied between models, memos and emails with no link back.
- Assumptions change without a record of who changed them or why.
- Information flowing in and out of the team is not captured.

### What to build

- A provenance ledger linking every number in a model to its source document, author and timestamp.
- An "explain this figure" agent that walks back through the chain.
- An audit and diff view of how an analysis changed over time.

### What a winning demo looks like

Click any figure or assumption in an analysis and see where it came from, when it was added, and how it evolved.

### How it's judged

Every figure traceable. Changes recorded honestly. Fast enough to use in a review meeting.

### Data (track-specific notes)

MSCI RCA, Dwelly, plus Transactions and ownership (README on concatenating split Price Paid parts): https://drive.google.com/drive/folders/1kiM06d04OBT66fAtMK_q_CrMbj9KF-2Q — full yearly files in Bulk, Large Files (split) or official Price Paid. Market folder is notes and samples only. Official Price Paid, EPC, OS OpenData, Companies House. Track module: "Make up the analysis; keep the lineage real." Cortile is also listed on the HTML brief.

### Useful open-source listed on this brief

- Element 84 Earth Search — https://github.com/element84/earth-search — API https://earth-search.aws.element84.com/v1
- Planetary Computer examples (MIT) — https://github.com/microsoft/PlanetaryComputerExamples
- eo-learn (MIT) — https://github.com/sentinel-hub/eo-learn
- Rasterio (BSD) — https://github.com/rasterio/rasterio
- pystac-client (Apache-2.0) — https://github.com/stac-utils/pystac-client
- odc-stac (Apache-2.0) — https://github.com/opendatacube/odc-stac
- pystac (Apache-2.0) — https://github.com/stac-utils/pystac
- eodag (Apache-2.0) — https://github.com/CS-SI/eodag

---

## Track 4 · Operations, inspections, energy

**Id:** `asset-management`  
**Title:** Asset and property management  
**Summary:** Help teams run, inspect and audit properties with less manual reporting.

### The problem

Site tours, audits and day-to-day operations produce notes, photos and readings that rarely become a structured record anyone can act on.

### Where teams get stuck

- Observations from tours get lost.
- Audit reports are written by hand.
- Energy and occupancy data sit in separate systems.

### What to build

- An inspection assistant that turns walkthrough photos and notes into a structured report and action list.
- An energy-anomaly agent combining EPC data with synthetic meter readings.
- A property-management copilot over tenant requests, maintenance and arrears.

### What a winning demo looks like

Walk a property or replay a tour: photos, notes and discussion become a structured record a manager can act on, with a prioritised action list. If you also use meter or EPC readings, show the actions those support.

### How it's judged

Quality of the structured record. Actions a property manager would take. Time saved per property.

### Data (track-specific notes)

Cortile (especially strong here), MSCI RCA, Dwelly, official EPC + Cortile for energy builds, OS OpenData, synthetic sensor CSVs you generate. Energy and sustainability Drive folder (flood layers, sustainability reports and a few EPC PDFs from sale particulars — **not** the official register): https://drive.google.com/drive/folders/14A1-k0NlRhcfAijMhQEYJBRM7YsRbuHk — more sustainability PDFs in Bulk.

### Useful open-source listed on this brief

- Brick Schema (BSD-3-Clause) — https://github.com/BrickSchema/Brick
- RealEstateCore (BSD-3-Clause) — https://github.com/RealEstateCore/rec
- EA survey and LIDAR open data — https://environment.data.gov.uk/survey
- sentinelhub-py (MIT) — https://github.com/sentinel-hub/sentinelhub-py
- 3dfier (GPL-3.0) — https://github.com/tudelft3d/3dfier
- cjio (MIT) — https://github.com/cityjson/cjio
- 3D City Database (Apache-2.0) — https://github.com/3dcitydb/3dcitydb
- City Energy Analyst (MIT) — https://github.com/architecture-building-systems/CityEnergyAnalyst
- physrisk (Apache-2.0) — https://github.com/os-climate/physrisk
- pvlib (BSD-3-Clause) — https://github.com/pvlib/pvlib-python
- CLIMADA (GPL-3.0) — https://github.com/CLIMADA-project/climada_python
- Mapillary Python SDK (MIT; free client token via a free Mapillary developer account) — https://github.com/mapillary/mapillary-python-sdk

---

## Track 5 · Your own idea

**Id:** `open-track`  
**Title:** An open track for new ideas  
**Summary:** A real estate problem that does not fit the other tracks. Build that.

### The problem

Some of the best tools come from people who know a problem first-hand. If yours fits no track, bring it here.

### Where teams get stuck

- Tell the judges who has the problem and what it costs them today.

### What to build

- Anything that solves a real real estate problem.

### What a winning demo looks like

Name the user, show the problem, show your build solving it.

### How it's judged

Same criteria as every track.

### Extra data listed only (or more fully) on this brief

- HM Land Registry Linked Data (OGL): https://landregistry.data.gov.uk/
- OS Open Zoomstack (OGL): https://osdatahub.os.uk/downloads/open/OpenZoomstack
- INSPIRE Index Polygons (official download needs registration): https://www.gov.uk/guidance/inspire-index-polygons-spatial-data
- Companies House bulk data: https://download.companieshouse.gov.uk/en_output.html
- London Datastore (GLA): https://data.london.gov.uk/
- Overture Maps: https://docs.overturemaps.org/getting-data/
- OpenStreetMap Great Britain / Geofabrik (ODbL): https://download.geofabrik.de/europe/great-britain.html
- Environment Agency flood monitoring (OGL): https://environment.data.gov.uk/flood-monitoring/doc/reference
- VOA rating lists — **restricted licence, not OGL**; download only from the official page: https://voaratinglists.blob.core.windows.net/html/rlidata.htm
- CCOD / UK companies that own property — register and accept a licence; not re-uploaded: https://www.gov.uk/guidance/hm-land-registry-uk-companies-that-own-property-in-england-and-wales
- Also the common partner data, listings, Bulk, Market samples, Price Paid, UK HPI, EPC, OS OpenData, Companies House API, postcodes.io

### Useful open-source listed on this brief

- TorchGeo (MIT) — https://github.com/microsoft/torchgeo
- samgeo (MIT) — https://github.com/opengeos/segment-geospatial
- leafmap (MIT) — https://github.com/opengeos/leafmap
- OpenAddresses (BSD-3-Clause) — https://github.com/openaddresses/openaddresses
- Microsoft building footprints (CDLA-Permissive-2.0) — https://github.com/microsoft/GlobalMLBuildingFootprints
- Overture Maps data — https://github.com/OvertureMaps/data
- Google Open Buildings — https://sites.research.google/open-buildings/
- OpenStreetMap GB / Geofabrik (ODbL)
- momepy (BSD-3-Clause) — https://github.com/pysal/momepy — metrics can be stored in Supabase/PostGIS
