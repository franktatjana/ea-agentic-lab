export interface PortfolioPresentationData {
  title: string;
  date: string;
  owner: string;

  metrics: {
    total_realms: number;
    total_nodes: number;
    active_nodes: number;
    avg_health: number;
    health_trend: string;
    critical_risks: number;
    overdue_actions: number;
    pipeline_arr: string;
    weighted_pipeline: string;
  };

  attention_items: Array<{
    type: string;
    realm: string;
    node: string;
    message: string;
    detail: string;
    severity: string;
  }>;

  realms: Array<{
    name: string;
    tier: string;
    nodes: number;
    avg_health: number;
    health_trend: string;
    total_arr: string;
    critical_risks: number;
  }>;

  pipeline: Array<{
    node: string;
    realm: string;
    arr: string;
    probability: number;
    stage: string;
    target_close: string;
  }>;

  risk_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    top_risks: Array<{
      risk: string;
      realm: string;
      severity: string;
    }>;
  };

  highlights: Array<{
    type: "win" | "risk" | "milestone";
    text: string;
  }>;
}

export const PORTFOLIO_SAMPLE_DATA: PortfolioPresentationData = {
  title: "Portfolio Executive Briefing",
  date: "2026-02-28",
  owner: "James Park",

  metrics: {
    total_realms: 3,
    total_nodes: 4,
    active_nodes: 4,
    avg_health: 65,
    health_trend: "stable",
    critical_risks: 2,
    overdue_actions: 4,
    pipeline_arr: "$1.95M",
    weighted_pipeline: "$1.26M",
  },

  attention_items: [
    { type: "health_declining", realm: "GLOBEX", node: "Security Platform Renewal", message: "Health declining", detail: "Score dropped from 52 to 38", severity: "critical" },
    { type: "critical_risks", realm: "GLOBEX", node: "Security Platform Renewal", message: "2 critical risks", detail: "Renewal at risk, competitor evaluation active", severity: "critical" },
    { type: "overdue_actions", realm: "ACME_CORP", node: "Security Consolidation", message: "1 overdue action", detail: "ROI presentation to VP IT delayed", severity: "high" },
    { type: "blocking_decisions", realm: "INITECH", node: "Security Platform POC", message: "POC decision pending", detail: "Technical evaluation awaiting CTO review", severity: "medium" },
  ],

  realms: [
    { name: "ACME Corporation", tier: "STRATEGIC", nodes: 2, avg_health: 80, health_trend: "improving", total_arr: "$3.5M", critical_risks: 0 },
    { name: "Globex International", tier: "GROWTH", nodes: 1, avg_health: 38, health_trend: "declining", total_arr: "$420K", critical_risks: 2 },
    { name: "Initech Solutions", tier: "PROSPECT", nodes: 1, avg_health: 62, health_trend: "improving", total_arr: "$0", critical_risks: 0 },
  ],

  pipeline: [
    { node: "Security Consolidation Ph2", realm: "ACME_CORP", arr: "$800K", probability: 65, stage: "Technical Evaluation", target_close: "2026-06-30" },
    { node: "Observability Expansion", realm: "ACME_CORP", arr: "$500K", probability: 80, stage: "Implementation", target_close: "2026-06-30" },
    { node: "Security Renewal", realm: "GLOBEX", arr: "$420K", probability: 45, stage: "Renewal", target_close: "2026-03-15" },
    { node: "Security POC", realm: "INITECH", arr: "$150K", probability: 50, stage: "Evaluation", target_close: "2026-04-30" },
  ],

  risk_summary: {
    critical: 2,
    high: 3,
    medium: 5,
    low: 4,
    top_risks: [
      { risk: "GLOBEX renewal at risk, usage declined 30%", realm: "GLOBEX", severity: "critical" },
      { risk: "GLOBEX CTO relationship cooling", realm: "GLOBEX", severity: "critical" },
      { risk: "ACME budget approval delayed by procurement", realm: "ACME_CORP", severity: "high" },
      { risk: "INITECH POC evaluation timeline uncertain", realm: "INITECH", severity: "high" },
      { risk: "ACME new CDO may shift priorities", realm: "ACME_CORP", severity: "high" },
    ],
  },

  highlights: [
    { type: "win", text: "ACME Security Consolidation health improved 72 → 78" },
    { type: "win", text: "ACME Observability pilot plants exceeding MTTR targets" },
    { type: "milestone", text: "INITECH POC entering final evaluation phase" },
    { type: "risk", text: "GLOBEX renewal 79 days out, churn probability rising" },
    { type: "risk", text: "Pipeline coverage below 3x benchmark" },
  ],
};
