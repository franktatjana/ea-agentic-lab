"""
YAML Loader Service for EA Agentic Lab API
Reads InfoHub YAML files and returns structured data
"""
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

import yaml

from ..config import get_settings
from ..models.schemas import (
    Action,
    ActionSummary,
    ActionTracker,
    Decision,
    DecisionLog,
    DecisionSummary,
    HealthAlert,
    HealthAlerts,
    HealthComponent,
    HealthComponents,
    HealthScore,
    HealthScoreData,
    HealthThresholds,
    BlueprintClassification,
    Node,
    NodeSummary,
    Realm,
    Risk,
    RiskRegister,
    RiskSummary,
    UserPreferences,
    UserProfile,
    NotificationPreferences,
)


class YAMLLoader:
    """Service for loading InfoHub YAML files"""

    def __init__(self):
        self.settings = get_settings()
        self.vault_path = self.settings.vault_path
        self.user_profiles_path = self.settings.user_profiles_path
        self._realm_id_to_dir: dict[str, str] = {}
        self._build_realm_id_map()

    def _build_realm_id_map(self) -> None:
        """Build mapping from realm_id (YAML) to directory name on disk."""
        if not self.vault_path.exists():
            return
        for realm_dir in self.vault_path.iterdir():
            if realm_dir.is_dir() and not realm_dir.name.startswith(".") and realm_dir.name != "knowledge":
                profile = self._load_yaml(realm_dir / "realm_profile.yaml")
                yaml_id = profile.get("realm_id", realm_dir.name) if profile else realm_dir.name
                self._realm_id_to_dir[yaml_id] = realm_dir.name
                self._realm_id_to_dir[realm_dir.name] = realm_dir.name

    def _resolve_realm_dir(self, realm_id: str) -> Path:
        """Resolve a realm_id to its actual vault directory path."""
        dir_name = self._realm_id_to_dir.get(realm_id, realm_id)
        return self.vault_path / dir_name

    def _load_yaml(self, path: Path) -> Optional[dict[str, Any]]:
        """Load a YAML file and return its contents"""
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"Error loading YAML from {path}: {e}")
            return None

    def _save_yaml(self, path: Path, data: dict[str, Any]) -> bool:
        """Save data to a YAML file"""
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
            return True
        except Exception as e:
            print(f"Error saving YAML to {path}: {e}")
            return False

    # ==========================================================================
    # REALMS
    # ==========================================================================

    def list_realms(self) -> list[Realm]:
        """List all realms in the InfoHub"""
        realms = []
        if not self.vault_path.exists():
            return realms

        for realm_dir in sorted(self.vault_path.iterdir()):
            if realm_dir.is_dir() and not realm_dir.name.startswith(".") and realm_dir.name != "knowledge":
                realm_profile = self._load_yaml(realm_dir / "realm_profile.yaml")
                if realm_profile:
                    classification = realm_profile.get("classification", {})
                    company = realm_profile.get("company_profile", realm_profile.get("company_info", {}))
                    nodes = [
                        d.name
                        for d in realm_dir.iterdir()
                        if d.is_dir()
                        and not d.name.startswith(".")
                        and (d / "node_profile.yaml").exists()
                    ]
                    realms.append(
                        Realm(
                            realm_id=realm_dir.name,
                            name=realm_profile.get("realm_name", realm_profile.get("name", realm_dir.name)),
                            type=realm_profile.get("type"),
                            industry=classification.get("industry", company.get("industry")),
                            region=classification.get("region", realm_profile.get("region")),
                            tier=classification.get("tier", realm_profile.get("tier")),
                            nodes=nodes,
                        )
                    )
                else:
                    # Create realm from directory structure if no profile exists
                    nodes = [
                        d.name
                        for d in realm_dir.iterdir()
                        if d.is_dir()
                        and not d.name.startswith(".")
                        and (d / "node_profile.yaml").exists()
                    ]
                    if nodes:
                        realms.append(
                            Realm(
                                realm_id=realm_dir.name,
                                name=realm_dir.name,
                                nodes=nodes,
                            )
                        )
        return realms

    def get_realm(self, realm_id: str) -> Optional[Realm]:
        """Get a specific realm"""
        realm_dir = self._resolve_realm_dir(realm_id)
        if not realm_dir.exists():
            return None

        realm_profile = self._load_yaml(realm_dir / "realm_profile.yaml")
        nodes = [
            d.name
            for d in realm_dir.iterdir()
            if d.is_dir()
            and not d.name.startswith(".")
            and (d / "node_profile.yaml").exists()
        ]

        if realm_profile:
            classification = realm_profile.get("classification", {})
            company = realm_profile.get("company_profile", realm_profile.get("company_info", {}))
            return Realm(
                realm_id=realm_id,
                name=realm_profile.get("realm_name", realm_profile.get("name", realm_id)),
                type=realm_profile.get("type"),
                industry=classification.get("industry", company.get("industry")),
                region=classification.get("region", realm_profile.get("region")),
                tier=classification.get("tier", realm_profile.get("tier")),
                nodes=nodes,
            )
        return Realm(realm_id=realm_id, name=realm_id, nodes=nodes)

    # ==========================================================================
    # NODES
    # ==========================================================================

    def list_nodes(self, realm_id: str) -> list[NodeSummary]:
        """List all nodes in a realm with summary data"""
        nodes = []
        realm_dir = self._resolve_realm_dir(realm_id)

        if not realm_dir.exists():
            return nodes

        for node_dir in realm_dir.iterdir():
            if node_dir.is_dir() and not node_dir.name.startswith("."):
                node_profile_path = node_dir / "node_profile.yaml"
                if node_profile_path.exists():
                    try:
                        node = self.get_node(realm_id, node_dir.name)
                        if node:
                            health = self.get_health_score(realm_id, node_dir.name)
                            risks = self.get_risk_register(realm_id, node_dir.name)
                            actions = self.get_action_tracker(realm_id, node_dir.name)

                            nodes.append(
                                NodeSummary(
                                    node_id=node.node_id,
                                    realm_id=node.realm_id,
                                    name=node.name,
                                    status=node.status,
                                    operating_mode=node.operating_mode,
                                    health_score=(
                                        health.health_score.current if health else None
                                    ),
                                    critical_risks=(
                                        risks.summary.critical if risks else None
                                    ),
                                    overdue_actions=(
                                        actions.summary.overdue if actions else None
                                    ),
                                )
                            )
                    except Exception as e:
                        logger.warning(f"Skipping node {node_dir.name}: {e}")
        return nodes

    def get_node(self, realm_id: str, node_id: str) -> Optional[Node]:
        """Get a specific node profile"""
        node_path = self._resolve_realm_dir(realm_id) / node_id / "node_profile.yaml"
        data = self._load_yaml(node_path)

        if not data:
            return None

        bp = data.get("blueprint")
        blueprint_cls = None
        if bp and isinstance(bp, dict):
            blueprint_cls = BlueprintClassification(
                archetype=bp.get("archetype"),
                domain=bp.get("domain"),
                track=bp.get("track"),
                reference_blueprint=bp.get("reference_blueprint"),
            )

        return Node(
            node_id=data.get("node_id", node_id),
            realm_id=data.get("realm_id", realm_id),
            name=data.get("name", node_id),
            purpose=data.get("purpose"),
            status=data.get("status", "active"),
            operating_mode=data.get("operating_mode", "pre_sales"),
            created=data.get("created"),
            target_completion=data.get("target_completion"),
            blueprint=blueprint_cls,
            commercial=data.get("commercial"),
            stakeholders=data.get("stakeholders"),
            enabled_playbooks=data.get("enabled_playbooks"),
            thresholds=data.get("thresholds"),
            competitive=data.get("competitive"),
            relationships=data.get("relationships"),
            last_updated=data.get("last_updated"),
            updated_by=data.get("updated_by"),
        )

    # ==========================================================================
    # HEALTH SCORE
    # ==========================================================================

    def get_health_score(self, realm_id: str, node_id: str) -> Optional[HealthScore]:
        """Get health score for a node"""
        health_path = (
            self._resolve_realm_dir(realm_id) / node_id / "internal-infohub" / "governance" / "health_score.yaml"
        )
        data = self._load_yaml(health_path)

        if not data:
            return None

        # Parse health score data
        hs_data = data.get("health_score", {})
        health_score_data = HealthScoreData(
            current=hs_data.get("current", 0),
            previous=hs_data.get("previous"),
            change=hs_data.get("change"),
            trend=hs_data.get("trend", "stable"),
            status=hs_data.get("status", "at_risk"),
            thresholds=(
                HealthThresholds(**hs_data.get("thresholds", {}))
                if hs_data.get("thresholds")
                else None
            ),
        )

        # Parse components
        comp_data = data.get("components", {})
        components = None
        if comp_data:
            components = HealthComponents(
                product_adoption=(
                    HealthComponent(**comp_data["product_adoption"])
                    if comp_data.get("product_adoption")
                    else None
                ),
                engagement=(
                    HealthComponent(**comp_data["engagement"])
                    if comp_data.get("engagement")
                    else None
                ),
                relationship=(
                    HealthComponent(**comp_data["relationship"])
                    if comp_data.get("relationship")
                    else None
                ),
                commercial=(
                    HealthComponent(**comp_data["commercial"])
                    if comp_data.get("commercial")
                    else None
                ),
                risk_profile=(
                    HealthComponent(**comp_data["risk_profile"])
                    if comp_data.get("risk_profile")
                    else None
                ),
            )

        # Parse alerts
        alerts_data = data.get("alerts", {})
        alerts = HealthAlerts(
            active=[
                HealthAlert(**alert) for alert in alerts_data.get("active", [])
            ]
        )

        return HealthScore(
            account_id=data.get("account_id"),
            node_id=f"{realm_id}/{node_id}",
            last_updated=data.get("last_updated"),
            updated_by=data.get("updated_by"),
            health_score=health_score_data,
            components=components,
            history=data.get("history"),
            improvement_plan=data.get("improvement_plan"),
            alerts=alerts,
        )

    # ==========================================================================
    # RISKS
    # ==========================================================================

    def get_risk_register(self, realm_id: str, node_id: str) -> Optional[RiskRegister]:
        """Get risk register for a node"""
        risk_path = (
            self._resolve_realm_dir(realm_id) / node_id / "internal-infohub" / "risks" / "risk_register.yaml"
        )
        data = self._load_yaml(risk_path)

        if not data:
            return None

        # Parse risks
        risks = []
        for risk_data in data.get("risks", []):
            risks.append(
                Risk(
                    risk_id=risk_data.get("risk_id", ""),
                    title=risk_data.get("title", ""),
                    description=risk_data.get("description"),
                    source=risk_data.get("source"),
                    source_date=risk_data.get("source_date"),
                    category=risk_data.get("category", "technical"),
                    severity=risk_data.get("severity", "medium"),
                    probability=risk_data.get("probability"),
                    impact=risk_data.get("impact"),
                    owner=risk_data.get("owner"),
                    status=risk_data.get("status", "open"),
                    escalation_status=risk_data.get("escalation_status"),
                    previous_severity=risk_data.get("previous_severity"),
                    mitigation=risk_data.get("mitigation"),
                    key_quote=risk_data.get("key_quote"),
                    review_date=risk_data.get("review_date"),
                )
            )

        # Parse summary
        summary_data = data.get("summary", {})
        summary = RiskSummary(
            total=summary_data.get("total", len(risks)),
            critical=summary_data.get("critical", 0),
            high=summary_data.get("high", 0),
            medium=summary_data.get("medium", 0),
            low=summary_data.get("low", 0),
            open=summary_data.get("open", 0),
            mitigated=summary_data.get("mitigated", 0),
            closed=summary_data.get("closed", 0),
        )

        return RiskRegister(
            account_id=data.get("account_id"),
            node_id=f"{realm_id}/{node_id}",
            last_updated=data.get("last_updated"),
            updated_by=data.get("updated_by"),
            summary=summary,
            risks=risks,
            escalation=data.get("escalation"),
        )

    # ==========================================================================
    # ACTIONS
    # ==========================================================================

    def get_action_tracker(
        self, realm_id: str, node_id: str
    ) -> Optional[ActionTracker]:
        """Get action tracker for a node"""
        action_path = (
            self._resolve_realm_dir(realm_id) / node_id / "internal-infohub" / "actions" / "action_tracker.yaml"
        )
        data = self._load_yaml(action_path)

        if not data:
            return None

        # Parse actions
        actions = []
        for action_data in data.get("actions", []):
            actions.append(
                Action(
                    action_id=action_data.get("action_id", ""),
                    title=action_data.get("title", ""),
                    description=action_data.get("description"),
                    owner=action_data.get("owner", ""),
                    due_date=action_data.get("due_date"),
                    priority=action_data.get("priority", "medium"),
                    status=action_data.get("status", "not_started"),
                    source=action_data.get("source"),
                    source_type=action_data.get("source_type"),
                    linked_risks=action_data.get("linked_risks"),
                    linked_decisions=action_data.get("linked_decisions"),
                    dependencies=action_data.get("dependencies"),
                    blockers=action_data.get("blockers"),
                    progress_notes=action_data.get("progress_notes"),
                    notes=action_data.get("notes"),
                    completed_date=action_data.get("completed_date"),
                    outcome=action_data.get("outcome"),
                )
            )

        # Parse summary
        summary_data = data.get("summary", {})
        summary = ActionSummary(
            total_actions=summary_data.get("total_actions", len(actions)),
            critical=summary_data.get("critical", 0),
            high=summary_data.get("high", 0),
            medium=summary_data.get("medium", 0),
            completed=summary_data.get("completed", 0),
            in_progress=summary_data.get("in_progress", 0),
            not_started=summary_data.get("not_started", 0),
            overdue=summary_data.get("overdue", 0),
            status=summary_data.get("status"),
        )

        return ActionTracker(
            account_id=data.get("account_id"),
            node_id=f"{realm_id}/{node_id}",
            last_updated=data.get("last_updated"),
            updated_by=data.get("updated_by"),
            summary=summary,
            actions=actions,
        )

    # ==========================================================================
    # DECISIONS
    # ==========================================================================

    def get_decision_log(self, realm_id: str, node_id: str) -> Optional[DecisionLog]:
        """Get decision log for a node"""
        decision_path = (
            self._resolve_realm_dir(realm_id) / node_id / "internal-infohub" / "decisions" / "decision_log.yaml"
        )
        data = self._load_yaml(decision_path)

        if not data:
            return None

        # Parse decisions
        decisions = []
        for dec_data in data.get("decisions", []):
            decisions.append(
                Decision(
                    decision_id=dec_data.get("decision_id", ""),
                    date=dec_data.get("date"),
                    title=dec_data.get("title", ""),
                    description=dec_data.get("description"),
                    context=dec_data.get("context"),
                    source=dec_data.get("source"),
                    decision_maker=dec_data.get("decision_maker"),
                    stakeholders=dec_data.get("stakeholders"),
                    category=dec_data.get("category", "technical"),
                    status=dec_data.get("status", "approved"),
                    rationale=dec_data.get("rationale"),
                    implications=dec_data.get("implications"),
                    next_actions=dec_data.get("next_actions"),
                    linked_risks=dec_data.get("linked_risks"),
                    superseded_by=dec_data.get("superseded_by"),
                    note=dec_data.get("note"),
                )
            )

        # Parse summary
        summary_data = data.get("summary", {})
        summary = DecisionSummary(
            total=summary_data.get("total", len(decisions)),
            pending=summary_data.get("pending", 0),
            approved=summary_data.get("approved", 0),
            implemented=summary_data.get("implemented", 0),
        )

        return DecisionLog(
            account_id=data.get("account_id"),
            node_id=f"{realm_id}/{node_id}",
            last_updated=data.get("last_updated"),
            updated_by=data.get("updated_by"),
            summary=summary,
            decisions=decisions,
            pending_customer=data.get("pending_customer"),
        )

    # ==========================================================================
    # BLUEPRINT, STAKEHOLDERS, VALUE
    # ==========================================================================

    def get_blueprint(self, realm_id: str, node_id: str) -> Optional[dict]:
        """Get blueprint for a node"""
        path = self._resolve_realm_dir(realm_id) / node_id / "blueprint.yaml"
        return self._load_yaml(path)

    def get_stakeholder_map(self, realm_id: str, node_id: str) -> Optional[dict]:
        """Get stakeholder map for a node"""
        path = (
            self._resolve_realm_dir(realm_id) / node_id
            / "internal-infohub" / "context" / "stakeholder_map.yaml"
        )
        return self._load_yaml(path)

    def get_value_tracker(self, realm_id: str, node_id: str) -> Optional[dict]:
        """Get value tracker for a node"""
        path = (
            self._resolve_realm_dir(realm_id) / node_id
            / "internal-infohub" / "value" / "value_tracker.yaml"
        )
        return self._load_yaml(path)

    def get_realm_profile(self, realm_id: str) -> Optional[dict]:
        """Get full realm profile data"""
        path = self._resolve_realm_dir(realm_id) / "realm_profile.yaml"
        return self._load_yaml(path)

    # ==========================================================================
    # USER PROFILES
    # ==========================================================================

    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile"""
        profile_path = self.user_profiles_path / f"{user_id}.yaml"
        data = self._load_yaml(profile_path)

        if not data:
            return None

        prefs_data = data.get("preferences", {})
        notif_data = data.get("notifications", {})

        return UserProfile(
            user_id=data.get("user_id", user_id),
            email=data.get("email", ""),
            display_name=data.get("display_name", ""),
            role=data.get("role", "solution_architect"),
            preferences=UserPreferences(
                output_format=prefs_data.get("output_format", "text_memo"),
                notification_frequency=prefs_data.get(
                    "notification_frequency", "daily_digest"
                ),
                detail_level=prefs_data.get("detail_level", "standard"),
                dark_mode_enabled=prefs_data.get("dark_mode", False),
                voice_enabled=prefs_data.get("voice_enabled", False),
                voice_speed=prefs_data.get("voice_speed", 1.0),
                language=prefs_data.get("language", "en"),
                timezone=prefs_data.get("timezone", "UTC"),
            ),
            notifications=NotificationPreferences(
                health_alerts=notif_data.get("health_alerts", True),
                health_threshold=notif_data.get("health_threshold", 60),
                risk_alerts=notif_data.get("risk_alerts", True),
                risk_severities=notif_data.get("risk_severities", ["critical", "high"]),
                action_reminders=notif_data.get("action_reminders", True),
                action_priorities=notif_data.get("action_priorities", ["critical", "high"]),
                signal_categories=notif_data.get(
                    "signal_categories", ["health", "governance"]
                ),
            ),
            followed_agents=data.get("followed_agents", []),
            followed_nodes=data.get("followed_nodes", []),
            notification_token=data.get("notification_token"),
            last_seen=data.get("last_seen"),
            created_at=data.get("created_at"),
        )

    def save_user_profile(self, profile: UserProfile) -> bool:
        """Save user profile to YAML"""
        profile_path = self.user_profiles_path / f"{profile.user_id}.yaml"

        data = {
            "user_id": profile.user_id,
            "email": profile.email,
            "display_name": profile.display_name,
            "role": profile.role.value if hasattr(profile.role, "value") else profile.role,
            "preferences": {
                "output_format": profile.preferences.output_format.value,
                "notification_frequency": profile.preferences.notification_frequency.value,
                "detail_level": profile.preferences.detail_level.value,
                "dark_mode": profile.preferences.dark_mode_enabled,
                "voice_enabled": profile.preferences.voice_enabled,
                "voice_speed": profile.preferences.voice_speed,
                "language": profile.preferences.language,
                "timezone": profile.preferences.timezone,
            },
            "notifications": {
                "health_alerts": profile.notifications.health_alerts,
                "health_threshold": profile.notifications.health_threshold,
                "risk_alerts": profile.notifications.risk_alerts,
                "risk_severities": [
                    s.value if hasattr(s, "value") else s
                    for s in profile.notifications.risk_severities
                ],
                "action_reminders": profile.notifications.action_reminders,
                "action_priorities": [
                    p.value if hasattr(p, "value") else p
                    for p in profile.notifications.action_priorities
                ],
                "signal_categories": [
                    c.value if hasattr(c, "value") else c
                    for c in profile.notifications.signal_categories
                ],
            },
            "followed_agents": profile.followed_agents,
            "followed_nodes": profile.followed_nodes,
            "notification_token": profile.notification_token,
            "last_seen": (
                profile.last_seen.isoformat() if profile.last_seen else None
            ),
            "created_at": (
                profile.created_at.isoformat() if profile.created_at else None
            ),
        }

        return self._save_yaml(profile_path, data)


# Singleton instance
yaml_loader = YAMLLoader()


def get_yaml_loader() -> YAMLLoader:
    """Get YAML loader instance"""
    return yaml_loader
