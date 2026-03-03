export interface BlueprintsPresentationData {
  title: string;

  archetypes: Array<{
    name: string;
    description: string;
    complexity: string;
    typical_duration: string;
    signals: string[];
    color: string;
  }>;

  domains: Array<{
    name: string;
    description: string;
    focus_areas: string[];
    specialist: string;
  }>;

  tracks: Array<{
    name: string;
    description: string;
    duration_weeks: number;
    sa_allocation: string;
    max_playbooks: number;
    governance: string;
    color: string;
  }>;

  selection_rules: Array<{
    condition: string;
    default_track: string;
    override?: string;
  }>;

  composition_stats: {
    total_blueprints: number;
    total_playbooks: number;
    total_canvases: number;
  };
}

export const BLUEPRINTS_SAMPLE_DATA: BlueprintsPresentationData = {
  title: "Blueprints & Engagement Framework",

  archetypes: [
    { name: "Competitive Displacement", description: "Replace an incumbent vendor with our platform", complexity: "High", typical_duration: "16-24 weeks", signals: ["Incumbent contract expiring", "Dissatisfaction signals", "RFP/RFI issued"], color: "red" },
    { name: "Greenfield Adoption", description: "Net-new deployment where no prior solution exists", complexity: "Medium", typical_duration: "12-16 weeks", signals: ["New budget approved", "Digital transformation initiative", "Compliance mandate"], color: "emerald" },
    { name: "Platform Consolidation", description: "Consolidate multiple point solutions into unified platform", complexity: "High", typical_duration: "20-30 weeks", signals: ["Tool sprawl complaints", "Cost reduction mandate", "Security audit findings"], color: "violet" },
    { name: "Compliance-Driven", description: "Engagement driven by regulatory or compliance requirements", complexity: "Medium", typical_duration: "8-16 weeks", signals: ["Regulatory deadline", "Audit finding", "Board mandate"], color: "amber" },
    { name: "Technical Evaluation", description: "Structured POC or technical assessment", complexity: "Low", typical_duration: "4-8 weeks", signals: ["POC requested", "Technical deep-dive needed", "Proof of value required"], color: "cyan" },
    { name: "Retention & Renewal", description: "Protect and grow existing customer relationship", complexity: "Medium", typical_duration: "8-12 weeks", signals: ["Renewal approaching", "Usage declining", "Champion departure"], color: "orange" },
    { name: "Expansion", description: "Grow footprint within existing customer", complexity: "Low", typical_duration: "6-12 weeks", signals: ["Whitespace identified", "Cross-sell opportunity", "New department interest"], color: "blue" },
    { name: "Strategic Account", description: "Long-term strategic partnership development", complexity: "High", typical_duration: "Ongoing", signals: ["Executive sponsorship", "Multi-year roadmap", "Joint innovation"], color: "pink" },
  ],

  domains: [
    { name: "Security", description: "SIEM, endpoint, cloud security, identity", focus_areas: ["Threat Detection", "Incident Response", "Compliance"], specialist: "Security SA" },
    { name: "Observability", description: "APM, infrastructure monitoring, log analytics", focus_areas: ["MTTR Reduction", "SLO Management", "Cost Optimization"], specialist: "Observability SA" },
    { name: "Search", description: "Enterprise search, knowledge management", focus_areas: ["Relevance Tuning", "RAG/AI Search", "Content Discovery"], specialist: "Search SA" },
    { name: "Platform", description: "Cross-domain platform architecture", focus_areas: ["Data Architecture", "Integration", "Scalability"], specialist: "Platform Architect" },
  ],

  tracks: [
    { name: "POC", description: "Lightweight proof of concept", duration_weeks: 4, sa_allocation: "25%", max_playbooks: 3, governance: "Weekly check-in", color: "slate" },
    { name: "Economy", description: "Standard engagement with balanced resources", duration_weeks: 12, sa_allocation: "50%", max_playbooks: 5, governance: "Bi-weekly review", color: "green" },
    { name: "Premium", description: "High-touch engagement with dedicated resources", duration_weeks: 24, sa_allocation: "75%", max_playbooks: 8, governance: "Weekly review + exec sync", color: "purple" },
    { name: "Fast Track", description: "Accelerated timeline for urgent requirements", duration_weeks: 6, sa_allocation: "100%", max_playbooks: 4, governance: "Daily standup", color: "orange" },
  ],

  selection_rules: [
    { condition: "ARR > $500K and archetype = competitive_displacement", default_track: "Premium" },
    { condition: "ARR > $500K and archetype = platform_consolidation", default_track: "Premium" },
    { condition: "Compliance deadline < 90 days", default_track: "Fast Track", override: "Overrides standard selection" },
    { condition: "POC requested explicitly", default_track: "POC" },
    { condition: "Expansion within existing customer", default_track: "Economy" },
    { condition: "Strategic account tier", default_track: "Premium", override: "Always Premium for strategic" },
  ],

  composition_stats: {
    total_blueprints: 12,
    total_playbooks: 45,
    total_canvases: 10,
  },
};
