export type ScoreStatus = "green" | "yellow" | "red";

export interface QbrData {
  quarter: string;
  ae_name: string;
  realm_count: number;
  prior_qbr: string;
  next_qbr: string;
  last_updated: string;
  scorecard: {
    revenue: { attainment: number; actual: string; target: string; status: ScoreStatus };
    pipeline: { coverage: number; total: string; status: ScoreStatus };
    forecast: { accuracy: number; detail: string; status: ScoreStatus };
    deal_quality: { avg_meddpicc: number; stalled: number; status: ScoreStatus };
    competitive: { win_rate: number; encounters: number; status: ScoreStatus };
    health: { avg: number; at_risk: number; status: ScoreStatus };
  };
  commitments: Array<{
    action: string;
    owner: string;
    deadline: string;
    status: string;
    outcome: string;
  }>;
  portfolio: Array<{
    realm: string;
    health: number;
    trend: string;
    pipeline: string;
    coverage: string;
    risk: string;
  }>;
  signals: Array<{
    signal: string;
    type: string;
    severity: string;
    owner: string;
    status: string;
  }>;
  readiness: Array<{
    item: string;
    phase: string;
    done: boolean;
  }>;
}

// CY25 Q4 mock data derived from vault accounts (ACME_CORP, GLOBEX, INITECH)
export const QBR_SAMPLE_DATA: QbrData = {
  quarter: "CY25 Q4",
  ae_name: "James Park",
  realm_count: 3,
  prior_qbr: "CY25-Q3-QBR-042",
  next_qbr: "2026-01-15",
  last_updated: "2025-12-18",

  scorecard: {
    revenue: { attainment: 74, actual: "$890K", target: "$1.2M", status: "yellow" },
    pipeline: { coverage: 2.4, total: "$1.55M", status: "yellow" },
    forecast: { accuracy: 82, detail: "Trailing 3Q avg", status: "green" },
    deal_quality: { avg_meddpicc: 16, stalled: 2, status: "yellow" },
    competitive: { win_rate: 50, encounters: 4, status: "yellow" },
    health: { avg: 55, at_risk: 1, status: "yellow" },
  },

  commitments: [
    { action: "Establish exec relationship with new ACME CISO", owner: "James Park", deadline: "2025-11-15", status: "in_progress", outcome: "Introductory call done, follow-up pending" },
    { action: "Run win/loss retrospective on DATA_ANALYTICS", owner: "SA Agent", deadline: "2025-11-30", status: "completed", outcome: "Champion departure identified as root cause" },
    { action: "Develop GLOBEX renewal retention plan", owner: "CA Agent", deadline: "2025-10-31", status: "completed", outcome: "Health triage completed, usage decline flagged" },
    { action: "Update competitive battlecard for key threats", owner: "CI Agent", deadline: "2025-12-15", status: "in_progress", outcome: "2 of 4 competitor cards updated" },
    { action: "Create INITECH expansion roadmap post-POC", owner: "VE Agent", deadline: "2025-12-31", status: "not_started", outcome: "" },
    { action: "Pipeline generation sprint for Q4 gap", owner: "James Park", deadline: "2025-11-01", status: "blocked", outcome: "Marketing campaign delayed, 3 target accounts identified" },
  ],

  portfolio: [
    { realm: "ACME_CORP", health: 68, trend: "declining", pipeline: "$800K", coverage: "1.9x", risk: "New CISO relationship not established" },
    { realm: "GLOBEX", health: 38, trend: "declining", pipeline: "$180K", coverage: "—", risk: "Renewal at risk, usage declined 30%" },
    { realm: "INITECH", health: 62, trend: "improving", pipeline: "$150K", coverage: "N/A", risk: "Prospect, POC in technical evaluation" },
  ],

  signals: [
    { signal: "GLOBEX renewal at risk, 79 days remaining", type: "Account Health", severity: "HIGH", owner: "CA Agent", status: "mitigating" },
    { signal: "DATA_ANALYTICS lost to competitor, pattern emerging", type: "Competitive", severity: "HIGH", owner: "CI Agent", status: "open" },
    { signal: "Pipeline coverage below 3x benchmark", type: "Pipeline Risk", severity: "MEDIUM", owner: "James Park", status: "mitigating" },
    { signal: "2 deals stalled 30+ days without stage movement", type: "Stalled Deal", severity: "MEDIUM", owner: "SA Agent", status: "open" },
    { signal: "ACME expansion whitespace $450K not pursued", type: "Pipeline Risk", severity: "LOW", owner: "James Park", status: "open" },
  ],

  readiness: [
    { item: "Pipeline snapshot current (< 7 days)", phase: "weeks_9_12", done: true },
    { item: "Revenue targets defined for Q4", phase: "weeks_1_4", done: true },
    { item: "MEDDPICC assessments for commit deals", phase: "weeks_9_12", done: true },
    { item: "Health scores updated for all realms", phase: "weeks_5_8", done: true },
    { item: "Competitive encounters documented", phase: "weeks_5_8", done: true },
    { item: "Prior QBR action items status updated", phase: "weeks_5_8", done: true },
    { item: "Win/loss retrospectives captured", phase: "weeks_5_8", done: true },
    { item: "Pre-QBR sync with SA/CA/CI/VE agents", phase: "pre_qbr_sync", done: false },
    { item: "Narrative drafted for key topics", phase: "weeks_9_12", done: false },
  ],
};
