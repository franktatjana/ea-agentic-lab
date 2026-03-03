export interface RealmPresentationData {
  realm_id: string;
  name: string;
  tier: string;
  industry: string;
  region: string;

  metrics: {
    total_nodes: number;
    avg_health: number;
    critical_risks: number;
    overdue_actions: number;
  };

  company: {
    legal_name: string;
    founded: number;
    headquarters: string;
    employees: number;
    revenue: string;
    stock_symbol?: string;
    public_private: string;
    description: string;
  };

  financials: {
    total_arr: string;
    yoy_growth: string;
    contract_end: string;
    days_to_renewal: number;
    products: Array<{ name: string; arr: string; deployed: string }>;
    penetration: number;
    tam: string;
  };

  business_lines: Array<{
    name: string;
    revenue_contribution: string;
    growth_rate: string;
    focus_areas: string[];
  }>;

  nodes: Array<{
    name: string;
    status: string;
    mode: string;
    health: number;
    arr: string;
  }>;

  strategic_initiatives: Array<{
    name: string;
    status: string;
    timeframe: string;
    relevance: string;
  }>;

  opportunities: {
    total_potential: string;
    items: Array<{
      name: string;
      type: string;
      potential: string;
      confidence: "high" | "medium" | "low";
      department: string;
    }>;
  };

  competitors: Array<{
    name: string;
    threat_level: string;
    status: string;
    our_differentiation: string;
  }>;

  stakeholders: Array<{
    name: string;
    title: string;
    relationship: string;
    influence: string;
    role: string;
  }>;

  growth: {
    current_penetration: string;
    total_whitespace: string;
    items: Array<{
      area: string;
      potential: string;
      fit: "HIGH" | "MEDIUM" | "LOW";
      timeline: string;
    }>;
  };

  vendor_landscape: Array<{
    category: string;
    dominant: string;
    our_position: string;
    trend: string;
  }>;

  activities: {
    priorities: Array<{
      priority: string;
      status: string;
      owner: string;
      due: string;
    }>;
    next_30_days: Array<{ action: string; owner: string }>;
  };

  health: {
    score: number;
    trend: string;
    nps: number;
    sentiment: string;
    risks: Array<{ risk: string; likelihood: string; impact: string }>;
  };
}

export const REALM_SAMPLE_DATA: Record<string, RealmPresentationData> = {
  ACME_CORP: {
    realm_id: "ACME_CORP",
    name: "ACME Corporation",
    tier: "STRATEGIC",
    industry: "Industrial Automation",
    region: "EMEA",

    metrics: {
      total_nodes: 2,
      avg_health: 85,
      critical_risks: 0,
      overdue_actions: 1,
    },

    company: {
      legal_name: "ACME Corporation AG",
      founded: 1985,
      headquarters: "Munich, Germany",
      employees: 45000,
      revenue: "€8.2B",
      stock_symbol: "ACM.DE",
      public_private: "PUBLIC",
      description:
        "Global leader in industrial automation and manufacturing equipment, serving automotive, aerospace, and general manufacturing sectors.",
    },

    financials: {
      total_arr: "$3.5M",
      yoy_growth: "67%",
      contract_end: "2027-02-28",
      days_to_renewal: 405,
      products: [
        { name: "Security Platform", arr: "$2.8M", deployed: "2024-03-01" },
        { name: "Observability", arr: "$0.7M", deployed: "2025-06-01" },
      ],
      penetration: 41,
      tam: "$8.5M",
    },

    business_lines: [
      {
        name: "Enterprise Solutions",
        revenue_contribution: "55%",
        growth_rate: "8%",
        focus_areas: ["Factory 4.0", "Smart Manufacturing"],
      },
      {
        name: "Digital Services",
        revenue_contribution: "30%",
        growth_rate: "15%",
        focus_areas: ["Cloud Infrastructure", "IoT Platform"],
      },
      {
        name: "Consulting & Professional Services",
        revenue_contribution: "15%",
        growth_rate: "5%",
        focus_areas: ["Implementation", "Training"],
      },
    ],

    nodes: [
      { name: "Security Consolidation", status: "ACTIVE", mode: "PRE_SALES", health: 88, arr: "$2.8M" },
      { name: "Observability Rollout", status: "ACTIVE", mode: "IMPLEMENTATION", health: 82, arr: "$0.7M" },
    ],

    strategic_initiatives: [
      { name: "Factory 4.0 Digital Transformation", status: "active", timeframe: "2024-2027", relevance: "Core driver for observability and security" },
      { name: "Cloud-First Infrastructure", status: "active", timeframe: "2025-2026", relevance: "AWS primary, Azure growing" },
      { name: "Supply Chain Resilience", status: "planning", timeframe: "2025-2027", relevance: "Log analytics for supply chain visibility" },
      { name: "EU Cyber Resilience Act Compliance", status: "active", timeframe: "2026", relevance: "Strengthens unified security platform case" },
    ],

    opportunities: {
      total_potential: "$5.0M",
      items: [
        { name: "North America Operations", type: "expansion", potential: "$1.5M", confidence: "high", department: "Global IT" },
        { name: "APAC Manufacturing", type: "expansion", potential: "$800K", confidence: "medium", department: "APAC Operations" },
        { name: "Security to EDR Upgrade", type: "cross_sell", potential: "$600K", confidence: "high", department: "InfoSec" },
        { name: "Enterprise Search", type: "new_use_case", potential: "$400K", confidence: "medium", department: "Knowledge Management" },
        { name: "Cloud Security (CSPM)", type: "cross_sell", potential: "$350K", confidence: "medium", department: "Cloud Engineering" },
        { name: "APM Deployment", type: "cross_sell", potential: "$450K", confidence: "low", department: "Platform Engineering" },
      ],
    },

    competitors: [
      { name: "LegacySIEM", threat_level: "LOW", status: "Displaced", our_differentiation: "60% TCO reduction, unified platform" },
      { name: "ObservabilityVendorA", threat_level: "MEDIUM", status: "Displaced", our_differentiation: "On-prem requirement + security integration" },
      { name: "DataForge", threat_level: "CRITICAL", status: "Lost deal", our_differentiation: "New CDO's pre-existing relationship" },
      { name: "CrowdStrike", threat_level: "MEDIUM", status: "Incumbent", our_differentiation: "Broader platform, better pricing" },
    ],

    stakeholders: [
      { name: "Marcus Weber", title: "CTO", relationship: "STRONG", influence: "HIGH", role: "Executive Sponsor" },
      { name: "Klaus Hoffman", title: "CISO", relationship: "STRONG", influence: "HIGH", role: "Champion" },
      { name: "Dr. Petra Richter", title: "CDO", relationship: "NEW", influence: "HIGH", role: "Potential Champion" },
      { name: "Friedrich Schmidt", title: "VP IT Infrastructure", relationship: "DEVELOPING", influence: "MEDIUM", role: "Budget Authority" },
      { name: "Anna Bergmann", title: "Director, Plant Ops", relationship: "MODERATE", influence: "MEDIUM", role: "Champion" },
      { name: "Hans Becker", title: "VP Procurement", relationship: "NEUTRAL", influence: "MEDIUM", role: "Detractor" },
    ],

    growth: {
      current_penetration: "41%",
      total_whitespace: "$5.0M",
      items: [
        { area: "North America (Chicago, Detroit)", potential: "$1.5M", fit: "HIGH", timeline: "2026-2027" },
        { area: "APAC (Shanghai, Singapore)", potential: "$800K", fit: "MEDIUM", timeline: "2027" },
        { area: "R&D Engineering", potential: "$500K", fit: "HIGH", timeline: "2026 Q2" },
        { area: "Supply Chain Operations", potential: "$400K", fit: "MEDIUM", timeline: "2026-2027" },
        { area: "Cloud Security (CSPM)", potential: "$350K", fit: "MEDIUM", timeline: "2026" },
      ],
    },

    vendor_landscape: [
      { category: "Cloud Infrastructure", dominant: "AWS", our_position: "N/A", trend: "Multi-cloud growing" },
      { category: "Security (SIEM)", dominant: "Us (displaced LegacySIEM)", our_position: "Strong", trend: "Consolidating" },
      { category: "Observability", dominant: "Datadog", our_position: "Emerging", trend: "Growing" },
      { category: "Endpoint Security", dominant: "CrowdStrike", our_position: "Not present", trend: "Stable" },
      { category: "Data Analytics", dominant: "DataForge (new)", our_position: "Lost", trend: "Consolidating" },
    ],

    activities: {
      priorities: [
        { priority: "Security Consolidation Phase 2", status: "IN_PROGRESS", owner: "Thomas Mueller", due: "2026-06-30" },
        { priority: "Observability plant expansion", status: "IN_PROGRESS", owner: "Thomas Mueller", due: "2026-03-31" },
        { priority: "CDO relationship development", status: "NOT_STARTED", owner: "Sarah Chen", due: "2026-03-15" },
        { priority: "North America scoping", status: "PLANNING", owner: "Sarah Chen", due: "2026-04-30" },
      ],
      next_30_days: [
        { action: "Schedule introductory meeting with Dr. Petra Richter", owner: "Sarah Chen" },
        { action: "Deliver observability ROI report for plant expansion", owner: "Thomas Mueller" },
        { action: "Prepare North America factory assessment proposal", owner: "Thomas Mueller" },
      ],
    },

    health: {
      score: 85,
      trend: "improving",
      nps: 72,
      sentiment: "PROMOTER",
      risks: [
        { risk: "Key champion Klaus Hoffman may leave", likelihood: "LOW", impact: "HIGH" },
        { risk: "Budget constraints if economic downturn", likelihood: "MEDIUM", impact: "MEDIUM" },
        { risk: "DataForge loss may shift CDO priorities", likelihood: "LOW", impact: "MEDIUM" },
      ],
    },
  },

  GLOBEX: {
    realm_id: "GLOBEX",
    name: "Globex International",
    tier: "GROWTH",
    industry: "Financial Services",
    region: "NA",

    metrics: {
      total_nodes: 1,
      avg_health: 38,
      critical_risks: 2,
      overdue_actions: 3,
    },

    company: {
      legal_name: "Globex International Inc.",
      founded: 2001,
      headquarters: "New York, NY",
      employees: 8500,
      revenue: "$2.1B",
      public_private: "PUBLIC",
      description:
        "Mid-market financial services firm specializing in asset management and trading platforms.",
    },

    financials: {
      total_arr: "$420K",
      yoy_growth: "-5%",
      contract_end: "2026-03-15",
      days_to_renewal: 79,
      products: [
        { name: "Security Platform", arr: "$420K", deployed: "2023-09-01" },
      ],
      penetration: 18,
      tam: "$2.3M",
    },

    business_lines: [
      { name: "Asset Management", revenue_contribution: "60%", growth_rate: "3%", focus_areas: ["Wealth Management", "Institutional"] },
      { name: "Trading Platforms", revenue_contribution: "30%", growth_rate: "8%", focus_areas: ["Algorithmic Trading", "Risk Management"] },
      { name: "Advisory Services", revenue_contribution: "10%", growth_rate: "-2%", focus_areas: ["M&A", "Corporate Finance"] },
    ],

    nodes: [
      { name: "Security Platform Renewal", status: "AT_RISK", mode: "RENEWAL", health: 38, arr: "$420K" },
    ],

    strategic_initiatives: [
      { name: "Cloud Migration", status: "active", timeframe: "2025-2027", relevance: "Security implications for hybrid environment" },
      { name: "AI Trading Platform", status: "planning", timeframe: "2026-2027", relevance: "Observability opportunity for ML pipelines" },
    ],

    opportunities: {
      total_potential: "$1.9M",
      items: [
        { name: "Observability for Trading", type: "cross_sell", potential: "$600K", confidence: "low", department: "Trading Technology" },
        { name: "Cloud Security Expansion", type: "expansion", potential: "$350K", confidence: "medium", department: "Cloud Engineering" },
        { name: "Compliance Monitoring", type: "new_use_case", potential: "$450K", confidence: "medium", department: "Compliance" },
      ],
    },

    competitors: [
      { name: "Splunk", threat_level: "HIGH", status: "Active competitor", our_differentiation: "Lower TCO, unified platform" },
      { name: "Datadog", threat_level: "MEDIUM", status: "Evaluating", our_differentiation: "On-prem support, compliance features" },
    ],

    stakeholders: [
      { name: "Robert Kim", title: "CTO", relationship: "COOLING", influence: "HIGH", role: "Decision Maker" },
      { name: "David Chen", title: "VP Security", relationship: "MODERATE", influence: "MEDIUM", role: "Champion (weakening)" },
      { name: "Lisa Park", title: "VP Engineering", relationship: "NEW", influence: "MEDIUM", role: "Evaluator" },
    ],

    growth: {
      current_penetration: "18%",
      total_whitespace: "$1.9M",
      items: [
        { area: "Trading Platform Observability", potential: "$600K", fit: "MEDIUM", timeline: "2026-2027" },
        { area: "Compliance Monitoring", potential: "$450K", fit: "HIGH", timeline: "2026" },
        { area: "Cloud Security", potential: "$350K", fit: "MEDIUM", timeline: "2026" },
      ],
    },

    vendor_landscape: [
      { category: "Security (SIEM)", dominant: "Us", our_position: "Incumbent (at risk)", trend: "Under review" },
      { category: "Observability", dominant: "Datadog", our_position: "Not present", trend: "Expanding" },
      { category: "Cloud Infrastructure", dominant: "AWS", our_position: "N/A", trend: "Migrating" },
    ],

    activities: {
      priorities: [
        { priority: "Renewal retention plan", status: "IN_PROGRESS", owner: "CA Agent", due: "2026-03-01" },
        { priority: "Usage decline root cause analysis", status: "COMPLETED", owner: "SA Agent", due: "2026-02-15" },
        { priority: "Executive re-engagement", status: "BLOCKED", owner: "James Park", due: "2026-02-28" },
      ],
      next_30_days: [
        { action: "Present usage optimization playbook to David Chen", owner: "SA Agent" },
        { action: "Schedule CTO re-engagement dinner", owner: "James Park" },
        { action: "Deliver renewal proposal with usage-based pricing", owner: "James Park" },
      ],
    },

    health: {
      score: 38,
      trend: "declining",
      nps: 25,
      sentiment: "PASSIVE",
      risks: [
        { risk: "Renewal at risk, usage declined 30%", likelihood: "HIGH", impact: "HIGH" },
        { risk: "CTO relationship cooling", likelihood: "HIGH", impact: "HIGH" },
        { risk: "Competitor evaluation in progress", likelihood: "MEDIUM", impact: "HIGH" },
      ],
    },
  },

  INITECH: {
    realm_id: "INITECH",
    name: "Initech Solutions",
    tier: "PROSPECT",
    industry: "Technology",
    region: "NA",

    metrics: {
      total_nodes: 1,
      avg_health: 62,
      critical_risks: 0,
      overdue_actions: 0,
    },

    company: {
      legal_name: "Initech Solutions Inc.",
      founded: 2012,
      headquarters: "Austin, TX",
      employees: 3200,
      revenue: "$680M",
      public_private: "PRIVATE",
      description:
        "Fast-growing SaaS company providing workforce management and HR technology solutions.",
    },

    financials: {
      total_arr: "$0",
      yoy_growth: "N/A",
      contract_end: "N/A",
      days_to_renewal: 0,
      products: [],
      penetration: 0,
      tam: "$1.8M",
    },

    business_lines: [
      { name: "Workforce Management SaaS", revenue_contribution: "70%", growth_rate: "25%", focus_areas: ["Enterprise HR", "Payroll"] },
      { name: "Talent Analytics", revenue_contribution: "20%", growth_rate: "40%", focus_areas: ["AI/ML", "Predictive Analytics"] },
      { name: "Professional Services", revenue_contribution: "10%", growth_rate: "10%", focus_areas: ["Implementation", "Integration"] },
    ],

    nodes: [
      { name: "Security Platform POC", status: "ACTIVE", mode: "EVALUATION", health: 62, arr: "$150K" },
    ],

    strategic_initiatives: [
      { name: "SOC 2 Type II Certification", status: "active", timeframe: "2026", relevance: "Security platform critical for compliance" },
      { name: "Series D Fundraising", status: "planning", timeframe: "2026 Q2", relevance: "Security posture part of due diligence" },
      { name: "Enterprise Market Push", status: "active", timeframe: "2025-2027", relevance: "Needs enterprise-grade security and observability" },
    ],

    opportunities: {
      total_potential: "$1.8M",
      items: [
        { name: "Security Platform (initial)", type: "new_use_case", potential: "$150K", confidence: "high", department: "Security" },
        { name: "Observability for SaaS Platform", type: "new_use_case", potential: "$500K", confidence: "medium", department: "Platform Engineering" },
        { name: "Cloud Security Posture", type: "cross_sell", potential: "$200K", confidence: "medium", department: "DevOps" },
      ],
    },

    competitors: [
      { name: "Splunk", threat_level: "HIGH", status: "Incumbent (limited)", our_differentiation: "Better pricing, unified platform, cloud-native" },
      { name: "Sumo Logic", threat_level: "MEDIUM", status: "Evaluated", our_differentiation: "Broader security capabilities" },
    ],

    stakeholders: [
      { name: "Rachel Torres", title: "VP Engineering", relationship: "DEVELOPING", influence: "HIGH", role: "Technical Decision Maker" },
      { name: "Mike Johnson", title: "Head of Security", relationship: "DEVELOPING", influence: "MEDIUM", role: "Champion" },
      { name: "Sarah Kim", title: "CTO", relationship: "NEW", influence: "HIGH", role: "Executive Sponsor" },
    ],

    growth: {
      current_penetration: "0%",
      total_whitespace: "$1.8M",
      items: [
        { area: "Security Platform", potential: "$150K", fit: "HIGH", timeline: "2026 Q1" },
        { area: "SaaS Observability", potential: "$500K", fit: "HIGH", timeline: "2026 Q2-Q3" },
        { area: "Cloud Security", potential: "$200K", fit: "MEDIUM", timeline: "2026 Q3" },
      ],
    },

    vendor_landscape: [
      { category: "Security", dominant: "Splunk (limited)", our_position: "POC in progress", trend: "Evaluating" },
      { category: "Observability", dominant: "Datadog", our_position: "Not present", trend: "Stable" },
      { category: "Cloud Infrastructure", dominant: "AWS", our_position: "N/A", trend: "Cloud-native" },
    ],

    activities: {
      priorities: [
        { priority: "Complete POC technical evaluation", status: "IN_PROGRESS", owner: "VE Agent", due: "2026-03-15" },
        { priority: "Build executive relationship with CTO", status: "NOT_STARTED", owner: "James Park", due: "2026-03-31" },
        { priority: "Develop expansion roadmap post-POC", status: "NOT_STARTED", owner: "VE Agent", due: "2026-04-15" },
      ],
      next_30_days: [
        { action: "Deliver POC results presentation to Rachel Torres", owner: "VE Agent" },
        { action: "Schedule CTO intro meeting", owner: "James Park" },
        { action: "Prepare commercial proposal for initial deployment", owner: "James Park" },
      ],
    },

    health: {
      score: 62,
      trend: "improving",
      nps: 0,
      sentiment: "N/A",
      risks: [
        { risk: "POC technical evaluation still in progress", likelihood: "MEDIUM", impact: "HIGH" },
        { risk: "Splunk incumbent relationship", likelihood: "LOW", impact: "MEDIUM" },
      ],
    },
  },
};
