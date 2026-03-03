export interface KnowledgePresentationData {
  title: string;
  date: string;

  stats: {
    total_items: number;
    validated: number;
    reviewed: number;
    proposed: number;
    pending_review: number;
  };

  maturity: string;

  domain_coverage: Array<{
    domain: string;
    count: number;
    color: string;
  }>;

  by_type: Array<{
    type: string;
    count: number;
  }>;

  by_category: Array<{
    category: string;
    count: number;
  }>;

  by_source: Array<{
    source: string;
    count: number;
  }>;

  recent_items: Array<{
    title: string;
    type: string;
    category: string;
    confidence: string;
    domain: string;
    created: string;
  }>;

  highlights: Array<{
    title: string;
    type: string;
    domain: string;
    summary: string;
  }>;

  gaps: string[];
}

export const KNOWLEDGE_SAMPLE_DATA: KnowledgePresentationData = {
  title: "Knowledge Vault Review",
  date: "2026-02-28",

  stats: {
    total_items: 87,
    validated: 34,
    reviewed: 28,
    proposed: 25,
    pending_review: 12,
  },

  maturity: "Growing",

  domain_coverage: [
    { domain: "Security", count: 32, color: "rose" },
    { domain: "Observability", count: 22, color: "sky" },
    { domain: "General", count: 18, color: "slate" },
    { domain: "Platform", count: 10, color: "emerald" },
    { domain: "Search", count: 5, color: "amber" },
  ],

  by_type: [
    { type: "Best Practice", count: 28 },
    { type: "Lesson Learned", count: 22 },
    { type: "Pattern", count: 18 },
    { type: "Research", count: 12 },
    { type: "Asset", count: 7 },
  ],

  by_category: [
    { category: "Operations", count: 35 },
    { category: "Content", count: 24 },
    { category: "External", count: 18 },
    { category: "Asset", count: 10 },
  ],

  by_source: [
    { source: "Engagement", count: 38 },
    { source: "Expert Input", count: 22 },
    { source: "Research", count: 17 },
    { source: "Analyst Report", count: 10 },
  ],

  recent_items: [
    { title: "SIEM Migration Runbook", type: "Asset", category: "Operations", confidence: "Validated", domain: "Security", created: "2026-02-25" },
    { title: "Champion Departure Recovery Pattern", type: "Pattern", category: "Operations", confidence: "Validated", domain: "General", created: "2026-02-22" },
    { title: "OT Security Integration Best Practices", type: "Best Practice", category: "Content", confidence: "Reviewed", domain: "Security", created: "2026-02-20" },
    { title: "Datadog Displacement Win Themes", type: "Lesson Learned", category: "External", confidence: "Validated", domain: "Observability", created: "2026-02-18" },
    { title: "EU Cyber Resilience Act Compliance Guide", type: "Research", category: "External", confidence: "Reviewed", domain: "Security", created: "2026-02-15" },
    { title: "Factory 4.0 Observability Architecture", type: "Best Practice", category: "Content", confidence: "Proposed", domain: "Observability", created: "2026-02-12" },
  ],

  highlights: [
    { title: "SIEM Migration Runbook", type: "Asset", domain: "Security", summary: "Step-by-step migration playbook from legacy SIEM to unified platform, proven across 4 customer deployments with 60% average TCO reduction" },
    { title: "Champion Departure Recovery Pattern", type: "Pattern", domain: "General", summary: "Structured approach for identifying and developing new champions when a key sponsor leaves, including stakeholder mapping and re-engagement timeline" },
    { title: "Datadog Displacement Win Themes", type: "Lesson Learned", domain: "Observability", summary: "Key differentiation messaging and technical proof points that won against Datadog in 3 competitive evaluations" },
  ],

  gaps: [
    "Search domain has only 5 items, needs best practices and competitive intelligence",
    "No validated patterns for multi-cloud observability deployments",
    "Platform domain lacks integration architecture templates",
    "No analyst report coverage for 2026 market landscape",
    "Missing retention/renewal playbook knowledge assets",
  ],
};
