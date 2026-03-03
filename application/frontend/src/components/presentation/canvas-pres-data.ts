export interface CanvasPresentationData {
  title: string;
  total_canvases: number;
  core_count: number;
  specialized_count: number;
  active_count: number;
  planned_count: number;

  canvas_types: Array<{
    canvas_id: string;
    name: string;
    description: string;
    status: "active" | "planned";
    owner: string;
    priority: "critical" | "high" | "medium" | "low";
    cadence: string;
    output: string;
    core_canvas: boolean;
    scope: "node" | "portfolio";
    required_by: string[];
    section_count: number;
    formats: string[];
    color: string;
  }>;

  lifecycle: Array<{
    state: string;
    description: string;
    next: string;
    color: string;
  }>;

  stage_mapping: Array<{
    stage: string;
    required: string[];
    recommended: string[];
  }>;

  gap_rules: Array<{
    type: string;
    description: string;
    severity: "high" | "medium" | "low";
  }>;

  pipeline_steps: Array<{
    step: string;
    description: string;
  }>;
}

export const CANVAS_SAMPLE_DATA: CanvasPresentationData = {
  title: "Canvas Library",
  total_canvases: 11,
  core_count: 2,
  specialized_count: 8,
  active_count: 9,
  planned_count: 2,

  canvas_types: [
    {
      canvas_id: "context_canvas",
      name: "Context Canvas",
      description: "Establish engagement boundaries, background, and scope definition",
      status: "active",
      owner: "SA Agent / AE Agent",
      priority: "critical",
      cadence: "Weekly during active engagement",
      output: "Boundaries + assumptions + success definition",
      core_canvas: true,
      scope: "node",
      required_by: ["All nodes", "First canvas generated on node creation"],
      section_count: 7,
      formats: ["narrative", "structured", "two_column", "timeline", "categorized", "list_with_status", "outcome_based"],
      color: "blue",
    },
    {
      canvas_id: "decision_canvas",
      name: "Decision Canvas",
      description: "Track 5 key decisions across all categories plus open questions",
      status: "active",
      owner: "SA Agent / PM Agent",
      priority: "critical",
      cadence: "Daily when decisions pending",
      output: "5 key decisions + open questions + pending approvals",
      core_canvas: true,
      scope: "node",
      required_by: ["All active engagements", "Stage 2+ opportunities"],
      section_count: 5,
      formats: ["decision_cards", "structured", "list_with_status"],
      color: "purple",
    },
    {
      canvas_id: "architecture_decision",
      name: "Architecture Decision Canvas",
      description: "Document key technical and architectural decisions with context, options, and consequences",
      status: "active",
      owner: "SA Agent",
      priority: "high",
      cadence: "On decision creation/update",
      output: "ADR with context, options, and rationale",
      core_canvas: false,
      scope: "node",
      required_by: ["POC with architectural choices", "Implementation with significant technical decisions"],
      section_count: 6,
      formats: ["narrative", "structured", "table"],
      color: "cyan",
    },
    {
      canvas_id: "problem_solution_fit",
      name: "Problem-Solution Fit Canvas",
      description: "Validate customer problem and solution fit during discovery",
      status: "active",
      owner: "SA Agent",
      priority: "high",
      cadence: "Post-discovery, update on new insights",
      output: "Problem validation + solution mapping",
      core_canvas: false,
      scope: "node",
      required_by: ["Stage 2+ opportunities"],
      section_count: 6,
      formats: ["narrative", "structured", "cards"],
      color: "orange",
    },
    {
      canvas_id: "architecture_communication",
      name: "Architecture Communication Canvas",
      description: "Communicate proposed solution architecture to stakeholders",
      status: "active",
      owner: "SA Agent",
      priority: "medium",
      cadence: "Pre-POC, update on architecture changes",
      output: "Solution overview for stakeholder review",
      core_canvas: false,
      scope: "node",
      required_by: ["POC with multi-stakeholder review", "Implementation kickoff"],
      section_count: 5,
      formats: ["narrative", "structured", "two_column"],
      color: "cyan",
    },
    {
      canvas_id: "value_stakeholders",
      name: "Value & Stakeholders Canvas",
      description: "Map stakeholder landscape and value propositions (max 3 hypotheses, max 3 KPIs)",
      status: "active",
      owner: "AE Agent / SA Agent",
      priority: "high",
      cadence: "Weekly during active pursuit",
      output: "Value narrative + target KPIs",
      core_canvas: false,
      scope: "node",
      required_by: ["Stage 2+ opportunities", "Before value engineering engagement"],
      section_count: 5,
      formats: ["structured", "cards", "table"],
      color: "teal",
    },
    {
      canvas_id: "execution_map",
      name: "Execution Map Canvas",
      description: "Mutual Action Plan (MAP) with success criteria and workstreams",
      status: "active",
      owner: "CSM Agent / SA Agent",
      priority: "high",
      cadence: "Weekly during active project",
      output: "Project work plan + success matrix + status tracking",
      core_canvas: false,
      scope: "node",
      required_by: ["Post-sales implementation", "POC execution phase", "Stage 4+ opportunities"],
      section_count: 6,
      formats: ["timeline", "structured", "table", "list_with_status"],
      color: "green",
    },
    {
      canvas_id: "risk_governance",
      name: "Risk & Governance Canvas",
      description: "Risk register with RACI matrix and meeting cadence",
      status: "active",
      owner: "PM Agent / SA Agent",
      priority: "high",
      cadence: "Weekly risk review",
      output: "Risk register + RACI + cadence schedule",
      core_canvas: false,
      scope: "node",
      required_by: ["Active POC or implementation", "Engagements with identified risks"],
      section_count: 4,
      formats: ["table", "structured", "categorized"],
      color: "red",
    },
    {
      canvas_id: "change_management",
      name: "Change Management Landscape",
      description: "Plan organizational change for adoption",
      status: "planned",
      owner: "CA Agent",
      priority: "medium",
      cadence: "Quarterly during adoption phase",
      output: "Change plan + stakeholder readiness",
      core_canvas: false,
      scope: "node",
      required_by: ["Post-sales implementation", "Large-scale rollout"],
      section_count: 5,
      formats: ["structured", "cards", "timeline"],
      color: "yellow",
    },
    {
      canvas_id: "challenge_canvas",
      name: "Challenge Canvas",
      description: "Frame and communicate engagement challenges with barriers and mitigations",
      status: "planned",
      owner: "SA Agent",
      priority: "low",
      cadence: "On challenge identification",
      output: "Challenge framing + mitigation plan",
      core_canvas: false,
      scope: "node",
      required_by: ["Complex engagements with multiple barriers"],
      section_count: 4,
      formats: ["narrative", "structured", "categorized"],
      color: "orange",
    },
    {
      canvas_id: "qbr_tracking",
      name: "QBR Tracking Canvas",
      description: "Continuous tracking between Sales QBR sessions: commitments, portfolio health, readiness",
      status: "active",
      owner: "AE Agent",
      priority: "high",
      cadence: "Weekly throughout quarter",
      output: "QBR scorecard + commitment status + readiness assessment",
      core_canvas: false,
      scope: "portfolio",
      required_by: ["AE with active portfolio (1+ realms)", "Quarter start or prior QBR snapshot frozen"],
      section_count: 5,
      formats: ["structured", "table", "cards", "list_with_status"],
      color: "primary",
    },
  ],

  lifecycle: [
    { state: "Draft", description: "Canvas created but incomplete", next: "Complete", color: "yellow" },
    { state: "Review", description: "Canvas complete, pending human review", next: "Approve", color: "blue" },
    { state: "Published", description: "Canvas approved for sharing", next: "Cadence expired", color: "green" },
    { state: "Stale", description: "Canvas not updated within cadence", next: "Superseded", color: "orange" },
    { state: "Archived", description: "Canvas superseded or no longer relevant", next: "", color: "muted" },
  ],

  stage_mapping: [
    {
      stage: "Discovery",
      required: ["Context Canvas", "Decision Canvas"],
      recommended: ["Problem-Solution Fit Canvas"],
    },
    {
      stage: "Qualification",
      required: ["Context Canvas", "Decision Canvas", "Value & Stakeholders Canvas"],
      recommended: ["Problem-Solution Fit Canvas"],
    },
    {
      stage: "POC / Evaluation",
      required: ["Architecture Decision Canvas", "Execution Map Canvas"],
      recommended: ["Architecture Communication Canvas", "Risk & Governance Canvas"],
    },
    {
      stage: "Implementation",
      required: ["Execution Map Canvas", "Risk & Governance Canvas"],
      recommended: ["Architecture Communication Canvas", "Change Management Landscape"],
    },
    {
      stage: "Post-Sales / Renewal",
      required: ["Context Canvas"],
      recommended: ["QBR Tracking Canvas", "Value & Stakeholders Canvas"],
    },
  ],

  gap_rules: [
    { type: "Missing Canvas", description: "Required canvas does not exist for node", severity: "high" },
    { type: "Incomplete Canvas", description: "Canvas exists but fails validation checks", severity: "medium" },
    { type: "Stale Canvas", description: "Canvas not updated within cadence threshold", severity: "medium" },
    { type: "Orphan Canvas", description: "Canvas exists but source data deleted or changed", severity: "low" },
  ],

  pipeline_steps: [
    { step: "Trigger", description: "Event or schedule activates canvas render" },
    { step: "Load Spec", description: "Read canvas YAML specification from registry" },
    { step: "Gather Data", description: "Resolve source paths from InfoHub vault" },
    { step: "Validate", description: "Run completeness, freshness, and consistency checks" },
    { step: "Render", description: "Output markdown (agents) and HTML (humans)" },
    { step: "Update Index", description: "Register canvas in node inventory" },
  ],
};
