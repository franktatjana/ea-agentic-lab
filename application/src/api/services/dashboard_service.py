"""
Dashboard Service for EA Agentic Lab API
Aggregates portfolio-level metrics across all realms and nodes.
"""
from pathlib import Path
from typing import Any, Optional
from functools import lru_cache

import yaml

from ..config import get_settings
from .yaml_loader import get_yaml_loader


class DashboardService:

    def __init__(self):
        self._loader = get_yaml_loader()
        self.vault_path = self._loader.vault_path

    def get_summary(self) -> dict[str, Any]:
        realms = self._loader.list_realms()
        all_nodes: list[dict[str, Any]] = []
        attention: list[dict[str, Any]] = []

        for realm in realms:
            realm_dir = self._loader._resolve_realm_dir(realm.realm_id)
            for node_id in realm.nodes:
                node_data = self._enrich_node(realm.realm_id, realm.name, node_id, realm_dir / node_id)
                if node_data:
                    all_nodes.append(node_data)
                    attention.extend(self._check_attention(node_data))

        active_nodes = [n for n in all_nodes if n["status"] == "active"]
        health_scores = [n["health_score"] for n in all_nodes if n["health_score"] is not None]
        avg_health = round(sum(health_scores) / len(health_scores)) if health_scores else None
        declining = sum(1 for n in all_nodes if n.get("health_trend") == "declining")

        total_arr = sum(n.get("opportunity_arr") or 0 for n in active_nodes)
        weighted = sum(
            (n.get("opportunity_arr") or 0) * (n.get("probability") or 0) / 100
            for n in active_nodes
        )
        total_critical = sum(n.get("critical_risks") or 0 for n in all_nodes)
        total_overdue = sum(n.get("overdue_actions") or 0 for n in all_nodes)
        total_pending_decisions = sum(n.get("pending_decisions") or 0 for n in all_nodes)

        health_trend = "stable"
        if declining > len(health_scores) / 2 and len(health_scores) > 0:
            health_trend = "declining"
        elif declining == 0 and len(health_scores) > 0:
            health_trend = "improving"

        attention.sort(key=lambda x: {"critical": 0, "warning": 1, "info": 2}.get(x.get("severity", "info"), 3))

        return {
            "portfolio": {
                "total_realms": len(realms),
                "total_nodes": len(all_nodes),
                "active_nodes": len(active_nodes),
                "avg_health": avg_health,
                "health_trend": health_trend,
                "total_critical_risks": total_critical,
                "total_overdue_actions": total_overdue,
                "total_pending_decisions": total_pending_decisions,
                "total_pipeline_arr": total_arr,
                "weighted_pipeline": round(weighted),
            },
            "attention_items": attention[:10],
            "nodes": all_nodes,
        }

    def _enrich_node(self, realm_id: str, realm_name: str, node_id: str, node_path: Path) -> Optional[dict[str, Any]]:
        profile = self._load_yaml(node_path / "node_profile.yaml")
        if not profile:
            return None

        health_data = self._load_yaml(
            node_path / "internal-infohub" / "governance" / "health_score.yaml"
        )
        hs = health_data.get("health_score", {}) if health_data else {}

        risk_data = self._load_yaml(
            node_path / "internal-infohub" / "risks" / "risk_register.yaml"
        )
        risk_summary = risk_data.get("summary", {}) if risk_data else {}

        action_data = self._load_yaml(
            node_path / "internal-infohub" / "actions" / "action_tracker.yaml"
        )
        action_summary = action_data.get("summary", {}) if action_data else {}

        decision_data = self._load_yaml(
            node_path / "internal-infohub" / "decisions" / "decision_log.yaml"
        )
        pending_customer = decision_data.get("pending_customer", []) if decision_data else []
        decision_summary = decision_data.get("summary", {}) if decision_data else {}

        overview_data = self._load_yaml(
            node_path / "internal-infohub" / "context" / "node_overview.yaml"
        )
        timeline = overview_data.get("timeline", {}) if overview_data else {}
        milestones = timeline.get("key_milestones", [])

        next_milestone = None
        next_milestone_date = None
        for m in milestones:
            if m.get("status") in ("pending", "planned"):
                next_milestone = m.get("milestone", "")
                next_milestone_date = m.get("date", "")
                break

        commercial = profile.get("commercial", {})

        blocking_decisions = [d for d in pending_customer if d.get("blocking")]

        return {
            "realm_id": realm_id,
            "realm_name": realm_name,
            "node_id": node_id,
            "node_name": profile.get("name", node_id),
            "status": profile.get("status", "active"),
            "operating_mode": profile.get("operating_mode", ""),
            "health_score": hs.get("current"),
            "health_previous": hs.get("previous"),
            "health_trend": hs.get("trend", "stable"),
            "health_status": hs.get("status", ""),
            "critical_risks": risk_summary.get("critical", 0),
            "high_risks": risk_summary.get("high", 0),
            "total_risks": risk_summary.get("total", 0),
            "overdue_actions": action_summary.get("overdue", 0),
            "total_actions": action_summary.get("total_actions", 0),
            "completed_actions": action_summary.get("completed", 0),
            "pending_decisions": len(pending_customer),
            "blocking_decisions": len(blocking_decisions),
            "total_decisions": decision_summary.get("total", 0),
            "opportunity_arr": commercial.get("opportunity_arr"),
            "probability": commercial.get("probability"),
            "stage": commercial.get("stage", ""),
            "next_milestone": next_milestone or commercial.get("next_milestone", ""),
            "next_milestone_date": next_milestone_date or commercial.get("next_milestone_date", ""),
            "target_completion": profile.get("target_completion", ""),
            "archetype": profile.get("blueprint", {}).get("archetype", ""),
            "domain": profile.get("blueprint", {}).get("domain", ""),
        }

    def _check_attention(self, node: dict[str, Any]) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        base = {
            "realm_id": node["realm_id"],
            "realm_name": node["realm_name"],
            "node_id": node["node_id"],
            "node_name": node["node_name"],
        }

        if node.get("health_trend") == "declining" and (node.get("health_score") or 100) < 70:
            items.append({
                **base,
                "type": "health_declining",
                "severity": "critical",
                "message": f"Health {node['health_score']} and declining",
                "detail": f"Down from {node.get('health_previous', '?')}",
            })
        elif node.get("health_trend") == "declining":
            items.append({
                **base,
                "type": "health_declining",
                "severity": "warning",
                "message": f"Health trending down ({node.get('health_score', '?')})",
                "detail": f"Was {node.get('health_previous', '?')}",
            })

        if (node.get("critical_risks") or 0) > 0 and (node.get("total_risks") or 0) > 0:
            items.append({
                **base,
                "type": "critical_risks",
                "severity": "critical",
                "message": f"{node['critical_risks']} critical risk{'s' if node['critical_risks'] > 1 else ''}",
                "detail": f"{node.get('total_risks', 0)} total risks",
            })

        if (node.get("overdue_actions") or 0) > 0:
            items.append({
                **base,
                "type": "overdue_actions",
                "severity": "warning",
                "message": f"{node['overdue_actions']} overdue action{'s' if node['overdue_actions'] > 1 else ''}",
                "detail": f"{node.get('total_actions', 0)} total actions",
            })

        if (node.get("blocking_decisions") or 0) > 0:
            items.append({
                **base,
                "type": "blocking_decisions",
                "severity": "critical",
                "message": f"{node['blocking_decisions']} blocking decision{'s' if node['blocking_decisions'] > 1 else ''} pending",
                "detail": "Customer action required",
            })

        return items

    def _load_yaml(self, path: Path) -> Optional[dict[str, Any]]:
        if not path.is_file():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception:
            return None


@lru_cache
def get_dashboard_service() -> DashboardService:
    return DashboardService()
