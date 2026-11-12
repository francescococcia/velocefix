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
} as const;
