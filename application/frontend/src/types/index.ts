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
    p0_critical: number;
    p1_high: number;
    p2_medium: number;
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
}
