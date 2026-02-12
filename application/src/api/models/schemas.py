"""
Pydantic models for EA Agentic Lab API
Based on InfoHub YAML schemas
"""
from datetime import date, datetime
from enum import Enum
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# ==============================================================================
# ENUMS
# ==============================================================================


class NodeStatus(str, Enum):
    planning = "planning"
    active = "active"
    on_hold = "on_hold"
    completed = "completed"
    cancelled = "cancelled"


class OperatingMode(str, Enum):
    pre_sales = "pre_sales"
    implementation = "implementation"
    post_sales = "post_sales"
    renewal = "renewal"


class Severity(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"
    closed = "closed"


class Probability(str, Enum):
    unlikely = "unlikely"
    possible = "possible"
    likely = "likely"
    certain = "certain"


class RiskStatus(str, Enum):
    open = "open"
    mitigated = "mitigated"
    closed = "closed"


class RiskCategory(str, Enum):
    stakeholder = "stakeholder"
    delivery = "delivery"
    competitive = "competitive"
    technical = "technical"
    commercial = "commercial"
    governance = "governance"
    resource = "resource"
    timeline = "timeline"
    adoption = "adoption"


class Priority(str, Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    low = "low"


class ActionStatus(str, Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"
    superseded = "superseded"
    completed_late = "completed_late"


class DecisionStatus(str, Enum):
    pending_approval = "pending_approval"
    approved = "approved"
    implemented = "implemented"
    rejected = "rejected"
    superseded = "superseded"


class DecisionCategory(str, Enum):
    strategic = "strategic"
    technical = "technical"
    commercial = "commercial"
    stakeholder = "stakeholder"
    competitive = "competitive"
    resource = "resource"
    process = "process"
    customer = "customer"


class HealthStatus(str, Enum):
    healthy = "healthy"
    at_risk = "at_risk"
    critical = "critical"


class Trend(str, Enum):
    improving = "improving"
    stable = "stable"
    declining = "declining"


class SignalCategory(str, Enum):
    lifecycle = "lifecycle"
    artifact = "artifact"
    stakeholder = "stakeholder"
    commercial = "commercial"
    health = "health"
    governance = "governance"
    playbook = "playbook"
    custom = "custom"


class OutputFormat(str, Enum):
    text_memo = "text_memo"
    voice_summary = "voice_summary"
    both = "both"


class NotificationFrequency(str, Enum):
    realtime = "realtime"
    hourly_digest = "hourly_digest"
    daily_digest = "daily_digest"
    weekly_digest = "weekly_digest"
    off = "off"


class DetailLevel(str, Enum):
    brief = "brief"
    standard = "standard"
    comprehensive = "comprehensive"


class UserRole(str, Enum):
    account_executive = "account_executive"
    solution_architect = "solution_architect"
    customer_architect = "customer_architect"
    manager = "manager"
    admin = "admin"


# ==============================================================================
# NODE MODELS
# ==============================================================================


class Stance(str, Enum):
    champion = "champion"
    supporter = "supporter"
    neutral = "neutral"
    blocker = "blocker"


class Stakeholder(BaseModel):
    name: str
    title: str
    department: Optional[str] = None
    influence: Optional[str] = None
    relationship: Optional[str] = None
    decision_role: Optional[str] = None
    linkedin_url: Optional[str] = None
    stance: Optional[Stance] = None


class StanceProposal(BaseModel):
    proposal_id: str
    stakeholder_id: str
    stakeholder_name: str
    current_stance: Optional[str] = None
    proposed_stance: Literal["champion", "supporter", "neutral", "blocker"]
    reason: str
    proposed_by: str
    proposed_date: str
    source: str = ""


class StanceProposalCreate(BaseModel):
    stakeholder_id: str
    proposed_stance: Literal["champion", "supporter", "neutral", "blocker"]
    reason: str
    proposed_by: str
    source: str = ""


class StanceProposalAction(BaseModel):
    notes: Optional[str] = None
    reason: Optional[str] = None


class Commercial(BaseModel):
    opportunity_arr: Optional[int] = Field(None, alias="opportunity_arr")
    probability: Optional[int] = None
    stage: Optional[str] = None
    next_milestone: Optional[str] = None
    next_milestone_date: Optional[date] = None

    class Config:
        populate_by_name = True


class Competitor(BaseModel):
    vendor: str
    product: Optional[str] = None
    contract_end: Optional[date] = None
    annual_spend: Optional[float] = None
    pain_points: Optional[list[str]] = None


class CompetitiveContext(BaseModel):
    incumbents: Optional[list[Competitor]] = None
    threats: Optional[list[dict[str, Any]]] = None


class RelatedNode(BaseModel):
    """Related node reference"""
    node_id: str
    relationship: Optional[str] = None
    notes: Optional[str] = None


class NodeRelationships(BaseModel):
    depends_on: Optional[list[str]] = None
    related_to: Optional[list[RelatedNode]] = None
    parent_node: Optional[str] = None


class NodeThresholds(BaseModel):
    minimum_arr: Optional[int] = None
    health_score_warning: Optional[int] = None
    health_score_critical: Optional[int] = None
    escalation_days: Optional[int] = None


class EnabledPlaybooks(BaseModel):
    strategic: Optional[list[str]] = None
    operational: Optional[list[str]] = None


class BlueprintClassification(BaseModel):
    archetype: Optional[str] = None
    domain: Optional[str] = None
    track: Optional[str] = None
    reference_blueprint: Optional[str] = None


class Node(BaseModel):
    """Node profile model"""

    node_id: str
    realm_id: str
    name: str
    purpose: Optional[str] = None
    status: NodeStatus = NodeStatus.active
    operating_mode: OperatingMode = OperatingMode.pre_sales
    created: Optional[date] = None
    target_completion: Optional[date] = None
    blueprint: Optional[BlueprintClassification] = None
    commercial: Optional[Commercial] = None
    stakeholders: Optional[dict[str, Any]] = None
    enabled_playbooks: Optional[EnabledPlaybooks] = None
    thresholds: Optional[NodeThresholds] = None
    competitive: Optional[CompetitiveContext] = None
    relationships: Optional[NodeRelationships] = None
    last_updated: Optional[datetime] = None
    updated_by: Optional[str] = None

    class Config:
        populate_by_name = True


class NodeSummary(BaseModel):
    """Lightweight node summary for list views"""

    node_id: str
    realm_id: str
    name: str
    status: NodeStatus
    operating_mode: OperatingMode
    health_score: Optional[int] = None
    critical_risks: Optional[int] = None
    overdue_actions: Optional[int] = None


class Realm(BaseModel):
    """Realm profile model"""

    realm_id: str
    name: str
    type: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None
    tier: Optional[str] = None
    nodes: Optional[list[str]] = None


# ==============================================================================
# HEALTH SCORE MODELS
# ==============================================================================


class HealthThresholds(BaseModel):
    healthy: int = 80
    at_risk: int = 60
    critical: int = 40


class HealthMetric(BaseModel):
    metric: str = Field(..., alias="name")
    value: Any
    target: Optional[Any] = None
    score: Optional[int] = None
    note: Optional[str] = None
    unit: Optional[str] = None

    class Config:
        populate_by_name = True


class HealthComponent(BaseModel):
    score: int
    weight: float
    weighted_contribution: Optional[float] = None
    status: Optional[str] = None
    metrics: Optional[list[HealthMetric]] = None
    trend: Optional[str] = None
    notes: Optional[str] = None
    risks: Optional[list[str]] = None


class HealthComponents(BaseModel):
    product_adoption: Optional[HealthComponent] = None
    engagement: Optional[HealthComponent] = None
    relationship: Optional[HealthComponent] = None
    commercial: Optional[HealthComponent] = None
    risk_profile: Optional[HealthComponent] = None


class HealthScoreData(BaseModel):
    current: int
    previous: Optional[int] = None
    change: Optional[int] = None
    trend: Trend = Trend.stable
    status: HealthStatus = HealthStatus.at_risk
    thresholds: Optional[HealthThresholds] = None


class HealthAlert(BaseModel):
    alert: str
    severity: str
    triggered: Optional[datetime] = None
    evidence: Optional[str] = None


class HealthAlerts(BaseModel):
    active: list[HealthAlert] = []


class HealthHistoryEntry(BaseModel):
    date: date
    score: int
    note: Optional[str] = None


class ImprovementAction(BaseModel):
    component: str
    action: str
    impact: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[date] = None


class ImprovementPlan(BaseModel):
    target_score: Optional[int] = None
    target_date: Optional[date] = None
    priority_actions: Optional[list[ImprovementAction]] = None


class HealthScore(BaseModel):
    """Health score model"""

    account_id: Optional[str] = None
    node_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    updated_by: Optional[str] = None
    health_score: HealthScoreData
    components: Optional[HealthComponents] = None
    history: Optional[list[HealthHistoryEntry]] = None
    improvement_plan: Optional[ImprovementPlan] = None
    alerts: HealthAlerts = HealthAlerts()

    class Config:
        populate_by_name = True


# ==============================================================================
# RISK MODELS
# ==============================================================================


class MitigationAction(BaseModel):
    action: str
    owner: Optional[str] = None
    due_date: Optional[date] = None


class Mitigation(BaseModel):
    strategy: Optional[str] = None
    actions: Optional[list[str | MitigationAction]] = None
    progress: Optional[int] = None


class Risk(BaseModel):
    """Risk model"""

    risk_id: str
    title: str
    description: Optional[str] = None
    source: Optional[str] = None
    source_date: Optional[date] = None
    category: RiskCategory = RiskCategory.technical
    severity: Severity = Severity.medium
    probability: Optional[str] = None
    impact: Optional[str] = None
    owner: Optional[str] = None
    status: RiskStatus = RiskStatus.open
    escalation_status: Optional[str] = None
    previous_severity: Optional[Severity] = None
    mitigation: Optional[Mitigation] = None
    key_quote: Optional[str] = None
    review_date: Optional[date] = None
    closed_date: Optional[date] = None
    closed_reason: Optional[str] = None

    class Config:
        populate_by_name = True


class RiskSummary(BaseModel):
    total: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    open: int = 0
    mitigated: int = 0
    closed: int = 0


class RiskRegister(BaseModel):
    """Risk register model"""

    account_id: Optional[str] = None
    node_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    updated_by: Optional[str] = None
    summary: RiskSummary = RiskSummary()
    risks: list[Risk] = []
    escalation: Optional[dict[str, Any]] = None

    class Config:
        populate_by_name = True


# ==============================================================================
# ACTION MODELS
# ==============================================================================


class ProgressNote(BaseModel):
    date: date
    status: Optional[str] = None
    note: Optional[str] = None


class Action(BaseModel):
    """Action model"""

    action_id: str
    title: str
    description: Optional[str] = None
    owner: str
    due_date: date
    priority: Priority = Priority.medium
    status: ActionStatus = ActionStatus.not_started
    source: Optional[str] = None
    source_type: Optional[str] = None
    linked_risks: Optional[list[str]] = None
    linked_decisions: Optional[list[str]] = None
    dependencies: Optional[list[str]] = None
    blockers: Optional[list[str]] = None
    progress_notes: Optional[list[ProgressNote]] = None
    notes: Optional[str] = None
    completed_date: Optional[date] = None
    outcome: Optional[str] = None

    class Config:
        populate_by_name = True


class ActionSummary(BaseModel):
    total_actions: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    completed: int = 0
    in_progress: int = 0
    not_started: int = 0
    overdue: int = 0
    status: Optional[str] = None


class ActionTracker(BaseModel):
    """Action tracker model"""

    account_id: Optional[str] = None
    node_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    updated_by: Optional[str] = None
    summary: ActionSummary = ActionSummary()
    actions: list[Action] = []

    class Config:
        populate_by_name = True


# ==============================================================================
# DECISION MODELS
# ==============================================================================


class NextAction(BaseModel):
    action: str
    owner: Optional[str] = None
    due_date: Optional[date] = None


class Decision(BaseModel):
    """Decision model"""

    decision_id: str
    date: date
    title: str
    description: Optional[str] = None
    context: Optional[str] = None
    source: Optional[str] = None
    decision_maker: Optional[str] = None
    stakeholders: Optional[list[str]] = None
    category: DecisionCategory = DecisionCategory.technical
    status: DecisionStatus = DecisionStatus.approved
    rationale: Optional[str] = None
    implications: Optional[list[str]] = None
    next_actions: Optional[list[NextAction]] = None
    linked_risks: Optional[list[str]] = None
    superseded_by: Optional[str] = None
    note: Optional[str] = None

    class Config:
        populate_by_name = True


class DecisionSummary(BaseModel):
    total: int = 0
    pending: int = 0
    approved: int = 0
    implemented: int = 0


class DecisionLog(BaseModel):
    """Decision log model"""

    account_id: Optional[str] = None
    node_id: Optional[str] = None
    last_updated: Optional[datetime] = None
    updated_by: Optional[str] = None
    summary: DecisionSummary = DecisionSummary()
    decisions: list[Decision] = []
    pending_customer: Optional[list[dict[str, Any]]] = None

    class Config:
        populate_by_name = True


# ==============================================================================
# SIGNAL MODELS
# ==============================================================================


class Signal(BaseModel):
    """Signal model"""

    signal_id: str
    name: str
    category: SignalCategory
    version: int = 1
    description: Optional[str] = None
    producer: str
    payload: dict[str, Any] = {}
    emitted_at: datetime
    realm_id: str
    node_id: str


# ==============================================================================
# USER PROFILE MODELS
# ==============================================================================


class NotificationPreferences(BaseModel):
    health_alerts: bool = True
    health_threshold: int = 60
    risk_alerts: bool = True
    risk_severities: list[Severity] = [Severity.critical, Severity.high]
    action_reminders: bool = True
    action_priorities: list[Priority] = [Priority.critical, Priority.high]
    signal_categories: list[SignalCategory] = [
        SignalCategory.health,
        SignalCategory.governance,
    ]
    quiet_hours_enabled: bool = False
    quiet_hours_start: Optional[str] = "22:00"
    quiet_hours_end: Optional[str] = "08:00"


class UserPreferences(BaseModel):
    output_format: OutputFormat = OutputFormat.text_memo
    notification_frequency: NotificationFrequency = NotificationFrequency.daily_digest
    detail_level: DetailLevel = DetailLevel.standard
    dark_mode_enabled: bool = False
    voice_enabled: bool = False
    voice_speed: float = 1.0
    language: str = "en"
    timezone: str = "UTC"


class UserProfile(BaseModel):
    """User profile model"""

    user_id: str
    email: str
    display_name: str
    role: UserRole = UserRole.solution_architect
    preferences: UserPreferences = UserPreferences()
    notifications: NotificationPreferences = NotificationPreferences()
    followed_agents: list[str] = []
    followed_nodes: list[str] = []
    notification_token: Optional[str] = None
    last_seen: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class UserProfileUpdate(BaseModel):
    """Update user profile request"""

    display_name: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    notifications: Optional[NotificationPreferences] = None
    followed_agents: Optional[list[str]] = None
    followed_nodes: Optional[list[str]] = None


# ==============================================================================
# AUTH MODELS
# ==============================================================================


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


# ==============================================================================
# WIDGET MODELS
# ==============================================================================


class WidgetHealthData(BaseModel):
    """Optimized data for health score widget"""

    node_id: str
    node_name: str
    score: int
    previous_score: int
    trend: Trend
    status: HealthStatus
    top_risk: Optional[str] = None


class WidgetActionData(BaseModel):
    """Optimized data for action count widget"""

    node_id: str
    node_name: str
    critical_count: int
    high_count: int
    medium_count: int
    overdue_count: int
    completed_count: int
    total_count: int


class WidgetRiskData(BaseModel):
    """Optimized data for risk alert widget"""

    node_id: str
    node_name: str
    critical_count: int
    high_count: int
    top_risks: list[dict[str, Any]]
    escalation_status: Optional[str] = None


# ==============================================================================
# SUMMARY MODELS
# ==============================================================================


class DailySummary(BaseModel):
    """Daily summary for a node"""

    node_id: str
    node_name: str
    date: date
    format: OutputFormat
    detail_level: DetailLevel
    text_content: str
    audio_url: Optional[str] = None


class DashboardSummary(BaseModel):
    """Aggregated dashboard summary"""

    date: date
    nodes_count: int
    total_health_score: int
    critical_risks: int
    overdue_actions: int
    text_content: str
    audio_url: Optional[str] = None
