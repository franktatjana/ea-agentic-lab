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
  description?: string;
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

export interface DomainCoverage {
  domain: string;
  count: number;
  categories: Record<string, number>;
}

export interface RecentKnowledgeItem {
  id: string;
  title: string;
  domain: string;
  type: string;
  confidence: string;
  category: string;
  created: string;
}

export interface KnowledgeActivity {
  total_items: number;
  by_confidence: Record<string, number>;
  by_category: Record<string, number>;
  by_domain: Record<string, number>;
  by_type: Record<string, number>;
  by_source_type: Record<string, number>;
  domain_coverage: DomainCoverage[];
  pending_proposals: number;
  rejected_proposals: number;
  recent_items: RecentKnowledgeItem[];
  vault_maturity: string;
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
  playbook_category?: string;
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
  validation_inputs?: {
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
  realm_name: string;
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

export interface HandoffEdge {
  from_id: string;
  from_name: string;
  to_id: string;
  to_name: string;
  direction: "defer_to" | "provide_to";
  trigger: string;
  context_passed: string;
  receiver_action: string;
  scope: string;
  phase: "Pre-Sales" | "Post-Sales" | "Governance";
}

// Orchestration
export interface ProcessSummary {
  process_id: string;
  name: string;
  description: string;
  status: string;
  trigger_event: string;
  owner_agent: string;
  owner_agent_id: string;
  step_count: number;
  agent_count: number;
  agent_ids: string[];
  playbook_refs: string[];
  deadline: string | null;
  tags: string[];
  version: number;
  created_at: string;
}

export interface ProcessStep {
  step_id: string;
  name: string;
  owner: string;
  action: string;
  playbook_ref?: string;
  description?: string;
  condition?: Record<string, unknown>;
  depends_on?: string[];
  outputs?: Array<{ artifact: string }>;
  deadline?: { duration: string };
}

export interface ProcessConflict {
  type: string;
  severity: string;
  processes: string[];
  description: string;
  resolution: string;
}

export interface ProcessGap {
  severity: string;
  description: string;
}

export interface ProcessAgentRole {
  agent_id: string;
  agent_name: string;
  role: string;
}

export interface ProcessAnalysis {
  process: ProcessSummary;
  steps: ProcessStep[];
  conflicts: ProcessConflict[];
  gaps: ProcessGap[];
  artifacts: {
    agents: ProcessAgentRole[];
    playbooks: string[];
  };
}

export interface ProcessRegistryStats {
  total: number;
  by_status: Record<string, number>;
  conflict_count: number;
}

export interface TraceabilityRow {
  process_id: string;
  process_name: string;
  step_id: string;
  step_name: string;
  agent_id: string;
  playbook_ref: string | null;
  action: string;
  has_condition: boolean;
  depends_on: string[];
}

// Data Source Panel
export interface DataSourcePlaybook {
  playbook_id: string;
  name: string;
  objective: string;
  frequency: string;
  category: string;
  trigger_conditions: {
    automatic?: Array<Record<string, unknown> | string>;
    manual?: string[];
  };
  inputs: Array<Record<string, string> | string>;
  outputs: Record<string, unknown>;
  validation_checks: {
    pre_execution?: string[];
    post_execution?: string[];
    output_quality?: string[];
  };
}

export interface DataSourceAgent {
  agent_id: string;
  purpose: string;
  team: string;
  core_functions: string[];
}

export interface DataSourceEntry {
  playbook_id?: string;
  agent_id?: string;
  source_type?: string;
  description?: string;
  section_label?: string;
  playbook?: DataSourcePlaybook;
  agent?: DataSourceAgent;
}

export interface DataSourceResponse {
  section: string;
  label: string;
  sources: DataSourceEntry[];
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

// Agent Definitions
export interface AgentProfileSubAgent {
  name: string;
  id?: string;
  purpose: string;
}

export interface QualificationDimension {
  letter: string;
  name: string;
  description: string;
  supported_by: string | null;
}

export interface QualificationFramework {
  name: string;
  owner?: string;
  note?: string;
  dimensions: QualificationDimension[];
}

export interface ContributingAgent {
  agent: string;
  provides: string;
}

export interface ActivityDomain {
  domain: string;
  why: string;
  agent: string;
  contributing_agents?: ContributingAgent[];
  activities: string[];
  cadence: string;
}

export interface ActivityMap {
  purpose: string;
  domains: ActivityDomain[];
  playbook_participation?: string;
}

export interface ChallengeItem {
  text: string;
  solved_by?: string;
  category?: string;
  specific_overhead?: string[];
}

export interface OverheadItem {
  text: string;
  automated_by?: string;
}

export interface StakeholderItem {
  role: string;
  connected_via?: string;
}

export type ChallengeEntry = string | ChallengeItem;
export type OverheadEntry = string | OverheadItem;
export type StakeholderEntry = string | StakeholderItem;

export interface StakeholderLandscape {
  customer_side?: StakeholderEntry[];
  internal_team?: StakeholderEntry[];
}

export interface ProfilePlaybookEntry {
  playbook: string;
  scope: string;
  team?: string;
  file?: string;
}

export interface ProfilePlaybookRaci {
  context?: string;
  responsible?: ProfilePlaybookEntry[];
  accountable?: ProfilePlaybookEntry[];
  consulted?: ProfilePlaybookEntry[];
  informed?: ProfilePlaybookEntry[];
}

export interface PublicResource {
  title: string;
  url: string;
  context?: string;
}

export interface WithThisAgentDomain {
  domain: string;
  agent?: string;
  items: string[];
}

export interface AgentKnowledgeReference {
  path: string;
  description: string;
  content?: Record<string, unknown>;
}

export interface AgentKnowledge {
  scope?: {
    domains?: string[];
    archetypes?: string[];
  };
  references?: AgentKnowledgeReference[];
}

export interface AgentProfile {
  why?: string;
  human_matters_summary?: string;
  goals_summary?: string;
  goals?: string[];
  role_context: string;
  challenges: ChallengeEntry[];
  administrative_overhead: OverheadEntry[];
  capabilities: string[];
  with_this_agent?: WithThisAgentDomain[];
  key_metrics?: string[];
  key_responsibilities?: string[];
  qualification_framework?: QualificationFramework;
  stakeholder_landscape?: StakeholderLandscape;
  public_resources?: PublicResource[];
  activity_map?: ActivityMap;
  playbook_raci?: ProfilePlaybookRaci;
  sub_agents?: AgentProfileSubAgent[];
  challenge_group_framing?: Record<string, string>;
  role_tab_intro?: string;
}

export interface AgentDefinitionSummary {
  id: string;
  name: string;
  description: string;
  agentspec_version: string;
  metadata: Record<string, unknown>;
  file_path: string;
  flow_count: number;
  tool_count: number;
  prompt_count: number;
  category: string;
  tags: string[];
  human_in_the_loop: boolean;
  capabilities: string[];
  sub_agents: AgentProfileSubAgent[];
  escalation_target: string;
  has_profile: boolean;
  role_context: string;
  goals_summary: string;
  goals: string[];
  why: string;
  human_matters_summary: string;
  knowledge_ref_count: number;
}

export interface AgentDefinitionFlow {
  id: string;
  name: string;
  description?: string;
  "x-ea-agent"?: {
    workflow_shorthand?: Array<Record<string, unknown>>;
  };
}

export interface AgentDefinitionTool {
  id: string;
  name: string;
  type?: string;
  description?: string;
}

export interface AgentDefinition {
  agentspec_version: string;
  component_type: string;
  id: string;
  name: string;
  description: string;
  metadata: Record<string, unknown>;
  system_prompt: string;
  human_in_the_loop: boolean;
  llm_configuration: Record<string, unknown>;
  inputs: Array<Record<string, unknown>>;
  outputs: Array<Record<string, unknown>>;
  tools: AgentDefinitionTool[];
  specialized_agents: Array<Record<string, unknown>>;
  flows: AgentDefinitionFlow[];
  a2a?: Record<string, unknown>;
  "x-ea-agent"?: Record<string, unknown>;
  _category?: string;
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
