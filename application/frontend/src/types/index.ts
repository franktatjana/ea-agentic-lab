export interface Realm {
  realm_id: string;
  name: string;
  type?: string;
  industry?: string;
  region?: string;
  tier?: string;
  nodes: string[];
}

export interface NodeSummary {
  node_id: string;
  realm_id: string;
  name: string;
  status?: string;
  operating_mode?: string;
  health_score?: number;
  critical_risks?: number;
  overdue_actions?: number;
}

export interface CreateNodeRequest {
  node_id: string;
  name: string;
  purpose?: string;
  archetype: string;
  domain: string;
  track: string;
  variant?: string;
  operating_mode?: string;
  target_completion?: string;
  opportunity_arr?: number;
  probability?: number;
  stage?: string;
}

export interface CreateNodeResponse {
  node_id: string;
  realm_id: string;
  name: string;
  status: string;
  blueprint_summary: Record<string, unknown>;
  warnings: string[];
}

export interface BlueprintClassification {
  archetype?: string;
  domain?: string;
  track?: string;
  reference_blueprint?: string;
}

export interface Node {
  node_id: string;
  realm_id: string;
  name: string;
  purpose?: string;
  status?: string;
  operating_mode?: string;
  created?: string;
  target_completion?: string;
  blueprint?: BlueprintClassification;
  commercial?: Record<string, unknown>;
  stakeholders?: Record<string, unknown>[];
  enabled_playbooks?: Record<string, unknown>;
  thresholds?: Record<string, unknown>;
  competitive?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
  last_updated?: string;
  updated_by?: string;
}

export interface HealthScoreData {
  current: number;
  previous?: number;
  change?: number;
  trend: string;
  status: string;
}

export interface HealthComponent {
  score: number;
  weight: number;
  status?: string;
  metrics?: Record<string, unknown>;
}

export interface HealthScore {
  account_id?: string;
  node_id: string;
  health_score: HealthScoreData;
  components?: Record<string, HealthComponent>;
  history?: Record<string, unknown>[];
  improvement_plan?: Record<string, unknown>;
  alerts?: { active: HealthAlert[] };
}

export interface HealthAlert {
  alert: string;
  severity: string;
  triggered?: string;
  action?: string;
  evidence?: string;
}

export interface Risk {
  risk_id: string;
  title: string;
  description?: string;
  category: string;
  severity: string;
  probability?: string;
  impact?: string;
  owner?: string;
  status: string;
  mitigation?: Record<string, unknown>;
}

export interface RiskRegister {
  node_id: string;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  risks: Risk[];
}

export interface Action {
  action_id: string;
  title: string;
  description?: string;
  owner: string;
  due_date?: string;
  priority: string;
  status: string;
  linked_risks?: string[];
  progress_notes?: string[];
}

export interface ActionTracker {
  node_id: string;
  summary: {
    total_actions: number;
    critical: number;
    high: number;
    medium: number;
    completed: number;
    overdue: number;
  };
  actions: Action[];
}

/** Single node in the docs directory tree (file or folder with nested children) */
export interface DocTreeEntry {
  name: string;                    // Filename or directory name
  path: string;                    // Relative path from docs/ root, used as API identifier
  type: "file" | "directory";
  title?: string;                  // Human-readable title extracted from frontmatter or H1
  order?: number | null;           // Sort order from frontmatter (null = alphabetical fallback)
  children?: DocTreeEntry[];       // Nested entries (only for directories)
}

/** Response from GET /api/v1/docs/{path} containing raw markdown */
export interface DocContent {
  path: string;                    // Echoed back from request
  content: string;                 // Raw markdown content
}

export interface PlaybookInput {
  artifact?: string;
  use?: string;
}

export interface PlaybookOutput {
  primary_artifact?: {
    path?: string;
    vault_type?: string;
    format?: string;
    sections?: string[];
  };
  decision_objects?: Record<string, unknown>;
  risk_objects?: Record<string, unknown>;
  initiative_objects?: Record<string, unknown>;
  notifications?: Array<Record<string, unknown>>;
}

// Knowledge Vault
export interface KnowledgeSource {
  type: string;
  origin: string;
  author: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  type: string;
  category: string;
  domain: string;
  archetype: string;
  phase: string;
  relevance: string[];
  tags: string[];
  confidence: string;
  source: KnowledgeSource;
  content: string;
  created: string;
  updated: string;
}

export interface KnowledgeProposal extends KnowledgeItem {
  proposed_by: string;
  proposed_from: { realm: string; node: string; run_id: string };
  proposal_status: string;
  proposal_date: string;
  reviewer_notes: string;
}

export interface KnowledgeStats {
  total_items: number;
  by_category: Record<string, number>;
  by_domain: Record<string, number>;
  by_confidence: Record<string, number>;
  by_type: Record<string, number>;
  pending_proposals: number;
}

export interface PlaybookSteckbrief {
  playbook_id?: string;
  name?: string;
  category?: string;
  mode?: string;
  version?: string;
  status?: string;
  one_liner?: string;
  framework_origin?: string;
  owner_agent?: string;
  supporting_agents?: string[];
  triggers_summary?: string[];
  anti_patterns?: string[];
  key_inputs?: string[];
  key_outputs?: string[];
  key_decisions?: string[];
  complexity?: string;
  estimated_inputs?: number;
  estimated_rules?: number;
  source_file?: string;
  last_updated?: string;
}

export interface PlaybookMetadata {
  category?: string;
  framework?: string;
  team_owner?: string;
  specialty?: string;
  description?: string;
}

export interface PlaybookRaci {
  responsible?: { role?: string; agent?: string };
  accountable?: { role?: string; human_required?: boolean };
  consulted?: Array<{ role?: string }>;
  informed?: Array<{ role?: string }>;
}

export interface Playbook {
  _id: string;
  _filename: string;
  _team: string;
  _path: string;
  framework_name?: string;
  name?: string;
  intended_agent_role?: string;
  secondary_agents?: string[];
  playbook_mode?: string;
  status?: string;
  primary_objective?: string;
  when_not_to_use?: string[];
  notes?: string;
  trigger_conditions?: {
    automatic?: Array<Record<string, unknown> | string>;
    manual?: string[];
    conditional?: string[];
  };
  required_inputs?: {
    mandatory?: Array<PlaybookInput | string>;
    optional?: Array<PlaybookInput | string>;
    minimum_data_threshold?: string[];
  };
  expected_outputs?: PlaybookOutput;
  estimated_execution_time?: string;
  frequency?: string;
  human_review_required?: boolean;
  // Specialist playbook fields
  metadata?: PlaybookMetadata;
  raci?: PlaybookRaci;
  triggers?: Array<Record<string, unknown>>;
  inputs?: {
    required?: Array<Record<string, string>>;
    optional?: Array<Record<string, string>>;
  };
  outputs?: Record<string, unknown>;
  steps?: Array<Record<string, unknown>>;
  discovery_framework?: Record<string, unknown>;
  evaluation_checklist?: Record<string, unknown>;
  // Strategic playbook fields
  steckbrief?: PlaybookSteckbrief;
  framework_source?: string;
  version?: string;
  decision_logic?: Record<string, unknown>;
  vault_routing?: Record<string, unknown>;
}

// Dashboard
export interface DashboardPortfolio {
  total_realms: number;
  total_nodes: number;
  active_nodes: number;
  avg_health: number | null;
  health_trend: string;
  total_critical_risks: number;
  total_overdue_actions: number;
  total_pending_decisions: number;
  total_pipeline_arr: number;
  weighted_pipeline: number;
}

export interface DashboardAttentionItem {
  realm_id: string;
  node_id: string;
  node_name: string;
  type: string;
  severity: string;
  message: string;
  detail: string;
}

export interface DashboardNode {
  realm_id: string;
  realm_name: string;
  node_id: string;
  node_name: string;
  status: string;
  operating_mode: string;
  health_score: number | null;
  health_previous: number | null;
  health_trend: string;
  health_status: string;
  critical_risks: number;
  high_risks: number;
  total_risks: number;
  overdue_actions: number;
  total_actions: number;
  completed_actions: number;
  pending_decisions: number;
  blocking_decisions: number;
  total_decisions: number;
  opportunity_arr: number | null;
  probability: number | null;
  stage: string;
  next_milestone: string;
  next_milestone_date: string;
  target_completion: string;
  archetype: string;
  domain: string;
}

export interface DashboardSummary {
  portfolio: DashboardPortfolio;
  attention_items: DashboardAttentionItem[];
  nodes: DashboardNode[];
}

// Canvas catalog
export interface CanvasCatalogItem {
  canvas_id: string;
  name: string;
  description: string;
  status: string;
  owner: string;
  use_case: string;
  priority: string;
  cadence: string;
  output: string;
  core_canvas: boolean;
  required_by: string[];
  has_spec: boolean;
  has_assembler: boolean;
  sections: string[];
  section_formats: string[];
  section_count: number;
  layout: string;
}

// Canvas rendering
export interface CanvasSection {
  id: string;
  label: string;
  format: string;
  data: Record<string, unknown>;
}

export interface CanvasData {
  canvas_id: string;
  name: string;
  description: string;
  metadata: {
    node_name: string;
    realm_name: string;
    stage: string;
    status: string;
    last_updated: string;
  };
  layout: Record<string, unknown>;
  sections: CanvasSection[];
}
