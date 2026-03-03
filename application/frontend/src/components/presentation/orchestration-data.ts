export interface OrchestrationPresentationData {
  title: string;

  agent_count: number;
  process_count: number;
  playbook_count: number;

  flows: Array<{
    name: string;
    category: string;
    color: string;
    steps: Array<{
      from: string;
      to: string;
      trigger: string;
    }>;
  }>;

  processes: Array<{
    id: string;
    name: string;
    trigger: string;
    owner: string;
    status: string;
    steps: string[];
    conflicts: number;
    gaps: number;
  }>;

  agent_roles: Array<{
    name: string;
    role: string;
    capabilities: string[];
    category: string;
  }>;

  governance: {
    health_check_frequency: string;
    gap_scan_frequency: string;
    escalation_threshold_days: number;
    review_cadence: string;
  };
}

export const ORCHESTRATION_SAMPLE_DATA: OrchestrationPresentationData = {
  title: "Process Orchestration & Agent Ecosystem",

  agent_count: 33,
  process_count: 4,
  playbook_count: 45,

  flows: [
    {
      name: "Pre-Sales",
      category: "Revenue",
      color: "blue",
      steps: [
        { from: "Account Executive", to: "RFP Analyst", trigger: "RFP/RFI received" },
        { from: "Account Executive", to: "POC Architect", trigger: "POC requested" },
        { from: "Account Executive", to: "Solution Architect", trigger: "Discovery complete" },
        { from: "Solution Architect", to: "Competitive Intel", trigger: "Competitor identified" },
        { from: "Solution Architect", to: "InfoSec Specialist", trigger: "Security requirements" },
        { from: "POC Architect", to: "Sales Manager", trigger: "POC results ready" },
      ],
    },
    {
      name: "Post-Sales",
      category: "Retention",
      color: "teal",
      steps: [
        { from: "Account Executive", to: "Delivery Lead", trigger: "Deal closed" },
        { from: "Delivery Lead", to: "Professional Services", trigger: "Implementation start" },
        { from: "Professional Services", to: "Customer Architect", trigger: "Go-live complete" },
        { from: "Support Engineer", to: "Customer Architect", trigger: "Escalation pattern detected" },
        { from: "Customer Architect", to: "Sales Manager", trigger: "Expansion signal detected" },
      ],
    },
    {
      name: "Governance",
      category: "Operations",
      color: "green",
      steps: [
        { from: "Meeting Notes Agent", to: "Task Shepherd", trigger: "Meeting transcribed" },
        { from: "Meeting Notes Agent", to: "Decision Registrar", trigger: "Decision detected" },
        { from: "Meeting Notes Agent", to: "Risk Radar", trigger: "Risk signal identified" },
        { from: "Risk Radar", to: "Nudger", trigger: "Action overdue" },
        { from: "Nudger", to: "Sales Manager", trigger: "Escalation threshold reached" },
      ],
    },
  ],

  processes: [
    { id: "PROC-2024-041", name: "RFP Technical & Commercial Analysis", trigger: "RFP/RFI document received", owner: "RFP Analyst", status: "active", steps: ["Document parsing", "Technical requirements extraction", "Capability mapping", "Gap analysis", "Commercial modeling", "Response generation"], conflicts: 0, gaps: 0 },
    { id: "PROC-2024-027", name: "Monthly Customer Health Review", trigger: "Monthly cadence (1st Monday)", owner: "Customer Architect", status: "active", steps: ["Usage data collection", "Health score calculation", "Stakeholder sentiment check", "Risk assessment update", "Action plan review", "Executive summary"], conflicts: 1, gaps: 0 },
    { id: "PROC-2024-033", name: "Competitive Threat Response", trigger: "Competitor detected in account", owner: "Competitive Intel", status: "active", steps: ["Signal validation", "Battlecard retrieval", "Stakeholder impact analysis", "Response strategy", "Win theme development", "Team briefing"], conflicts: 0, gaps: 1 },
    { id: "PROC-2024-038", name: "Quarterly Business Review Prep", trigger: "8 weeks before QBR date", owner: "Account Executive", status: "draft", steps: ["Data collection across agents", "Scorecard compilation", "Commitment tracking", "Signal aggregation", "Narrative drafting", "Pre-QBR sync"], conflicts: 2, gaps: 1 },
  ],

  agent_roles: [
    { name: "Solution Architect", role: "Technical design and evaluation leadership", capabilities: ["Discovery", "Solution Design", "POC Management", "Technical Validation"], category: "Pre-Sales" },
    { name: "Customer Architect", role: "Post-sales relationship and health management", capabilities: ["Health Monitoring", "Usage Analysis", "Expansion Planning", "EBR Preparation"], category: "Post-Sales" },
    { name: "Competitive Intel", role: "Competitive analysis and win strategy", capabilities: ["Battlecards", "Win/Loss Analysis", "Market Intelligence", "Displacement Strategy"], category: "Pre-Sales" },
    { name: "Value Engineer", role: "Business case and ROI development", capabilities: ["TCO Analysis", "ROI Modeling", "Business Case", "Value Realization Tracking"], category: "Pre-Sales" },
    { name: "Risk Radar", role: "Risk detection and escalation", capabilities: ["Signal Detection", "Risk Scoring", "Alert Generation", "Escalation Management"], category: "Governance" },
    { name: "Task Shepherd", role: "Action tracking and accountability", capabilities: ["Action Extraction", "Due Date Tracking", "Reminder Generation", "Progress Reporting"], category: "Governance" },
    { name: "Decision Registrar", role: "Decision capture and tracking", capabilities: ["Decision Extraction", "Impact Analysis", "ADR Generation", "Decision History"], category: "Governance" },
    { name: "Meeting Notes Agent", role: "Meeting intelligence and action extraction", capabilities: ["Transcription Analysis", "Action Item Extraction", "Decision Detection", "Stakeholder Sentiment"], category: "Governance" },
  ],

  governance: {
    health_check_frequency: "Weekly",
    gap_scan_frequency: "Bi-weekly",
    escalation_threshold_days: 3,
    review_cadence: "Monthly orchestration review",
  },
};
