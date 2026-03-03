export interface NodePresentationData {
  node_id: string;
  realm_id: string;
  realm_name: string;
  name: string;
  purpose: string;
  status: string;
  operating_mode: string;
  archetype: string;
  domain: string;
  track: string;
  created: string;

  commercial: {
    opportunity_arr: string;
    probability: number;
    stage: string;
    target_close: string;
  };

  health: {
    score: number;
    previous: number;
    trend: string;
    status: string;
    components: Array<{
      name: string;
      score: number;
      weight: number;
      status: string;
    }>;
    alerts: Array<{
      severity: string;
      message: string;
    }>;
  };

  business_case: {
    projected_savings: string;
    roi: string;
    payback_months: number;
    drivers: string[];
  };

  stakeholders: Array<{
    name: string;
    title: string;
    stance: string;
    influence: string;
    role: string;
  }>;

  risks: Array<{
    title: string;
    severity: string;
    category: string;
    owner: string;
    status: string;
  }>;

  actions: {
    total: number;
    completed: number;
    overdue: number;
    items: Array<{
      title: string;
      owner: string;
      due: string;
      priority: string;
      status: string;
    }>;
  };

  competitive: Array<{
    competitor: string;
    threat_level: string;
    status: string;
    differentiation: string;
  }>;

  blueprint: {
    phase: string;
    milestones: Array<{
      name: string;
      status: string;
      date?: string;
    }>;
    playbooks_active: number;
    playbooks_total: number;
    checklist_done: number;
    checklist_total: number;
  };

  next_steps: Array<{
    action: string;
    owner: string;
    due: string;
  }>;
}

export const NODE_SAMPLE_DATA: Record<string, NodePresentationData> = {
  SECURITY_CONSOLIDATION: {
    node_id: "SECURITY_CONSOLIDATION",
    realm_id: "ACME_CORP",
    realm_name: "ACME Corporation",
    name: "Security Consolidation Phase 2",
    purpose: "Expand unified security platform from SIEM to full endpoint, cloud, and identity coverage across all ACME plants",
    status: "active",
    operating_mode: "PRE_SALES",
    archetype: "platform_consolidation",
    domain: "security",
    track: "premium",
    created: "2025-09-15",

    commercial: {
      opportunity_arr: "$800K",
      probability: 65,
      stage: "Technical Evaluation",
      target_close: "2026-06-30",
    },

    health: {
      score: 78,
      previous: 72,
      trend: "improving",
      status: "healthy",
      components: [
        { name: "Stakeholder Engagement", score: 85, weight: 0.25, status: "healthy" },
        { name: "Technical Progress", score: 80, weight: 0.25, status: "healthy" },
        { name: "Commercial Momentum", score: 65, weight: 0.20, status: "at-risk" },
        { name: "Risk Profile", score: 75, weight: 0.15, status: "healthy" },
        { name: "Timeline Adherence", score: 82, weight: 0.15, status: "healthy" },
      ],
      alerts: [
        { severity: "medium", message: "Budget approval pending from VP IT Infrastructure" },
        { severity: "low", message: "POC environment setup delayed by 5 days" },
      ],
    },

    business_case: {
      projected_savings: "$1.2M/yr",
      roi: "340%",
      payback_months: 8,
      drivers: [
        "EU Cyber Resilience Act compliance deadline Q3 2026",
        "Industrietechnik acquisition adds 12 plants needing security coverage",
        "60% TCO reduction vs. maintaining fragmented vendor stack",
        "Factory 4.0 initiative requires unified security telemetry",
      ],
    },

    stakeholders: [
      { name: "Klaus Hoffman", title: "CISO", stance: "champion", influence: "HIGH", role: "Technical Decision Maker" },
      { name: "Friedrich Schmidt", title: "VP IT Infrastructure", stance: "neutral", influence: "HIGH", role: "Budget Authority" },
      { name: "Marcus Weber", title: "CTO", stance: "supporter", influence: "HIGH", role: "Executive Sponsor" },
      { name: "Stefan Muller", title: "Security Architect", stance: "champion", influence: "MEDIUM", role: "Technical Evaluator" },
      { name: "Hans Becker", title: "VP Procurement", stance: "blocker", influence: "MEDIUM", role: "Procurement" },
    ],

    risks: [
      { title: "Budget approval delayed by procurement review", severity: "high", category: "Commercial", owner: "Sarah Chen", status: "mitigating" },
      { title: "New CDO may shift security priorities", severity: "medium", category: "Stakeholder", owner: "Sarah Chen", status: "monitoring" },
      { title: "Integration complexity with legacy OT systems", severity: "medium", category: "Technical", owner: "Thomas Mueller", status: "mitigating" },
      { title: "Competitor CrowdStrike expanding relationship", severity: "low", category: "Competitive", owner: "CI Agent", status: "monitoring" },
    ],

    actions: {
      total: 8,
      completed: 5,
      overdue: 1,
      items: [
        { title: "Present ROI analysis to Friedrich Schmidt", owner: "Thomas Mueller", due: "2026-03-10", priority: "high", status: "overdue" },
        { title: "Complete POC environment setup", owner: "Thomas Mueller", due: "2026-03-15", priority: "high", status: "in_progress" },
        { title: "Schedule executive briefing with CTO", owner: "Sarah Chen", due: "2026-03-20", priority: "medium", status: "in_progress" },
      ],
    },

    competitive: [
      { competitor: "CrowdStrike", threat_level: "MEDIUM", status: "Incumbent in endpoint", differentiation: "Unified platform covering SIEM + endpoint + cloud vs. point solution" },
      { competitor: "Palo Alto", threat_level: "LOW", status: "No presence", differentiation: "On-prem support and OT security expertise" },
    ],

    blueprint: {
      phase: "Technical Evaluation",
      milestones: [
        { name: "Discovery Complete", status: "completed", date: "2025-11-15" },
        { name: "Solution Design", status: "completed", date: "2026-01-20" },
        { name: "POC Deployment", status: "in_progress", date: "2026-03-15" },
        { name: "Business Case Approval", status: "upcoming", date: "2026-04-30" },
        { name: "Contract Negotiation", status: "future" },
        { name: "Deployment Start", status: "future" },
      ],
      playbooks_active: 3,
      playbooks_total: 5,
      checklist_done: 14,
      checklist_total: 22,
    },

    next_steps: [
      { action: "Present ROI analysis to VP IT Infrastructure", owner: "Thomas Mueller", due: "2026-03-10" },
      { action: "Complete POC environment with 3 plant coverage", owner: "Thomas Mueller", due: "2026-03-15" },
      { action: "Brief CTO on compliance timeline impact", owner: "Sarah Chen", due: "2026-03-20" },
      { action: "Prepare commercial proposal options", owner: "Sarah Chen", due: "2026-04-01" },
    ],
  },

  OBSERVABILITY_ROLLOUT: {
    node_id: "OBSERVABILITY_ROLLOUT",
    realm_id: "ACME_CORP",
    realm_name: "ACME Corporation",
    name: "Observability Plant Expansion",
    purpose: "Expand observability coverage from 2 pilot plants to all 8 ACME manufacturing facilities",
    status: "active",
    operating_mode: "IMPLEMENTATION",
    archetype: "expansion",
    domain: "observability",
    track: "economy",
    created: "2025-06-01",

    commercial: {
      opportunity_arr: "$500K",
      probability: 80,
      stage: "Implementation",
      target_close: "2026-06-30",
    },

    health: {
      score: 82,
      previous: 80,
      trend: "improving",
      status: "healthy",
      components: [
        { name: "Stakeholder Engagement", score: 78, weight: 0.25, status: "healthy" },
        { name: "Technical Progress", score: 90, weight: 0.25, status: "healthy" },
        { name: "Commercial Momentum", score: 85, weight: 0.20, status: "healthy" },
        { name: "Risk Profile", score: 72, weight: 0.15, status: "at-risk" },
        { name: "Timeline Adherence", score: 80, weight: 0.15, status: "healthy" },
      ],
      alerts: [],
    },

    business_case: {
      projected_savings: "$800K/yr",
      roi: "260%",
      payback_months: 6,
      drivers: [
        "Reduce MTTR by 40% across manufacturing operations",
        "Factory 4.0 requires real-time plant telemetry",
        "SmartSensor acquisition adds 200+ new IoT data sources",
      ],
    },

    stakeholders: [
      { name: "Anna Bergmann", title: "Director, Plant Operations", stance: "champion", influence: "MEDIUM", role: "Business Sponsor" },
      { name: "Marcus Weber", title: "CTO", stance: "supporter", influence: "HIGH", role: "Executive Sponsor" },
      { name: "Julia Schneider", title: "Platform Engineering Lead", stance: "champion", influence: "MEDIUM", role: "Technical Lead" },
    ],

    risks: [
      { title: "Plant 3-5 network infrastructure needs upgrade", severity: "medium", category: "Technical", owner: "Thomas Mueller", status: "mitigating" },
      { title: "Union consultation required for monitoring scope", severity: "low", category: "Organizational", owner: "Anna Bergmann", status: "monitoring" },
    ],

    actions: {
      total: 6,
      completed: 4,
      overdue: 0,
      items: [
        { title: "Deploy agents to Plant 3", owner: "Thomas Mueller", due: "2026-03-20", priority: "high", status: "in_progress" },
        { title: "Finalize dashboard templates for plant managers", owner: "Julia Schneider", due: "2026-03-25", priority: "medium", status: "in_progress" },
      ],
    },

    competitive: [
      { competitor: "Datadog", threat_level: "MEDIUM", status: "Incumbent in 2 plants", differentiation: "On-prem deployment, unified with security, lower per-host cost" },
    ],

    blueprint: {
      phase: "Implementation",
      milestones: [
        { name: "Pilot (2 plants)", status: "completed", date: "2025-09-30" },
        { name: "Plant 3-5 Rollout", status: "in_progress", date: "2026-03-31" },
        { name: "Plant 6-8 Rollout", status: "upcoming", date: "2026-06-30" },
        { name: "Full Coverage Verified", status: "future" },
      ],
      playbooks_active: 2,
      playbooks_total: 3,
      checklist_done: 18,
      checklist_total: 24,
    },

    next_steps: [
      { action: "Complete Plant 3 agent deployment", owner: "Thomas Mueller", due: "2026-03-20" },
      { action: "Deliver ROI report for pilot plants", owner: "Thomas Mueller", due: "2026-03-25" },
      { action: "Schedule Plant 4-5 readiness assessment", owner: "Julia Schneider", due: "2026-04-01" },
    ],
  },
};
