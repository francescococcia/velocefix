// Cited sources used by the priority engine and checks. Keep URLs here.
export const SRC = {
  s11: { source: "Landlord and Tenant Act 1985, s.11", url: "https://www.legislation.gov.uk/ukpga/1985/70/section/11" },
  govRepairs: { source: "GOV.UK — Private renting: repairs", url: "https://www.gov.uk/private-renting/repairs" },
  shelterHeating: {
    source: "Shelter Legal — heating, hot water and power problems (reasonable time can depend on season)",
    url: "https://england.shelter.org.uk/professional_resources/legal/housing_conditions/responsibility_for_repairs/heating_hot_water_and_power_problems",
  },
  gasEmergency: { source: "National Gas — emergency contacts (0800 111 999)", url: "https://www.nationalgas.com/emergency-contacts" },
  gasSafe: { source: "HSE — check an engineer is Gas Safe registered", url: "https://www.hse.gov.uk/gas/gas-safe-register-check.htm" },
  landlordSafety: { source: "GOV.UK — landlord's safety responsibilities (annual gas check)", url: "https://www.gov.uk/private-renting/your-landlords-safety-responsibilities" },
  eicr: { source: "Electrical Safety Standards in the Private Rented Sector (England) Regs 2020", url: "https://www.legislation.gov.uk/uksi/2020/312" },
  hhsrs: {
    source: "GOV.UK — HHSRS tenant guide (hazard labels only; no HHSRS score computed)",
    url: "https://www.gov.uk/government/publications/housing-health-and-safety-rating-system-hhsrs-tenant-guide/tenant-guide-to-the-housing-health-and-safety-rating-system-hhsrs",
  },
  awaab: {
    source: "Awaab's Law guidance — social rented sector only",
    url: "https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector",
  },
  agency: { source: "Agency repair policy (example, set in config/app.ts and lib/priority.ts)" },
  dwelly: { source: "Dwelly partner data (synthetic letting-agency cases, hackathon pack)" },
  dwelly002: { source: "Dwelly case 002", sourceRef: "Real Estate Agency Synthetic/002/index.md" },
  dwelly037: { source: "Dwelly case 037", sourceRef: "Real Estate Agency Synthetic/037/index.md" },
  dwelly022: { source: "Dwelly case 022", sourceRef: "Real Estate Agency Synthetic/022/index.md" },
  cortile: { source: "Cortile hackathon API (synthetic, event only)", url: "https://hackathon.cortile.com/" },
} as const;
