// Single source of truth for the product name (locked 20:15: VeloceFix, mascot Velo).

export const APP = {
  name: "VeloceFix",
  formerWorkingTitle: "SlotRight",
  tagline: "Verify the facts, then book the fix — in the same WhatsApp thread.",
  mascot: { name: "Velo", line: "Fast is good. Right is better." },
  agencyName: "Example Lettings (demo agency)",
  // Seeded "now" is the real clock; season window is agency policy.
  winterWindow: { startMonth: 10, endMonth: 3 }, // 1 Oct – 31 Mar (agency policy)
  boilerOldAgeYears: 10, // agency policy threshold
  maxSlotsOffered: 3,
  // Time-saved comparison (always labelled "estimate" on screen).
  // Old-path figures are case-specific dates from the seed, Dwelly histories,
  // or Cortile ticket timestamps — not a published average and not a study.
  // VeloceFix figures come from offer/booking timestamps in the store.
  // Jobs with no case-specific old-path dates are left blank; we do not invent one.
  timeSaved: {
    estimateLabel: "estimate",
    week: { hours: 168, tz: "Europe/London" }, // rolling window for the header tile
    anchors: {
      "j-floor": {
        kind: "still_open",
        reportedAt: "2026-10-22T09:12:00Z",
        source: "Seed job j-floor (portal report, still open)",
      },
      "j-dwelly-002": {
        kind: "report_to_booking",
        reportedAt: "2026-08-07T11:48:38Z",
        bookedAt: "2026-08-08T05:08:31Z",
        source: "Dwelly case 002 history, event 001 to event 010 (Visit date selected)",
      },
      "j-dwelly-037": {
        kind: "report_to_booking",
        reportedAt: "2024-03-26T06:23:04Z",
        bookedAt: "2024-04-04T16:32:19Z",
        source: "Dwelly case 037 history, event 001 to event 018 (Visit date confirmed)",
      },
      "j-dwelly-022": {
        kind: "report_to_booking",
        reportedAt: "2024-11-17T13:57:17Z",
        bookedAt: "2024-11-17T15:59:23Z",
        source: "Dwelly case 022 history, event 001 to event 006 (Visit date confirmed)",
      },
      "j-cortile-000096": {
        kind: "report_to_booking",
        reportedAt: "2026-07-20T14:06:44Z",
        bookedAt: "2026-07-21T02:17:22Z",
        source: "Cortile tkt_000096, reported_at to contractor instructed (upd_0000354)",
      },
    },
  },
} as const;
