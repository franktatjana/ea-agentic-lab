const ABBREVIATIONS = new Set([
  // Roles
  "AE", "SA", "CA", "PM", "VE", "CI", "ACI", "II", "MNA", "PS", "FCTO", "CTO", "AA", "HAM", "ISV",
  // Deal / sales
  "MEDDPICC", "RFP", "POC", "POV", "QBR", "EBR", "ARR", "MRR", "ACV",
  "ROI", "TCO", "SLA", "NPS", "CSAT",
  // Hyperscaler / marketplace
  "ACE", "CPPO", "MACC", "EDP", "CUD", "GCP", "SKU",
  // Technical
  "ADR", "API", "UI", "UX", "CSP", "DR", "BC",
  // Other
  "CRM", "ICP", "KPI", "OKR",
]);

export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w+/g, (w) => {
      const upper = w.toUpperCase();
      return ABBREVIATIONS.has(upper) ? upper : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
}
