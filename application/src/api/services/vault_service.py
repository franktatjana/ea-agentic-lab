"""
Vault Service for EA Agentic Lab API
Reads unsurfaced vault data: meetings, frameworks, journey, opportunities, agent work, etc.
"""
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from functools import lru_cache

import yaml

from ..config import get_settings
from .yaml_loader import get_yaml_loader


class VaultService:
    """Reads raw and infohub vault data not covered by other services."""

    def __init__(self, vault_path: Path):
        self.vault_path = vault_path
        self._loader = get_yaml_loader()

    def _resolve_node_path(self, realm_id: str, node_id: str) -> Optional[Path]:
        realm_dir = self._loader._resolve_realm_dir(realm_id)
        if not realm_dir.exists():
            return None
        node_path = realm_dir / node_id
        if not node_path.exists():
            return None
        resolved = node_path.resolve()
        if not resolved.is_relative_to(self.vault_path.resolve()):
            return None
        return node_path

    def get_external_infohub(self, realm_id: str, node_id: str) -> Optional[dict[str, Any]]:
        """Customer deliverables only: passes the 'shared screen test'."""
        if ".." in realm_id or "/" in realm_id or ".." in node_id or "/" in node_id:
            return None
        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return None
        hub = node_path / "external-infohub"
        if not hub.is_dir():
            return {}
        overview_md = self._read_text_or_none(hub / "engagement_overview.md")
        return {
            "overview": overview_md,
            "account_team": self._load_yaml(hub / "account_team.yaml"),
            "engagement_timeline": self._load_yaml(hub / "engagement_timeline.yaml"),
            "success_criteria": self._load_yaml(hub / "success_criteria.yaml"),
            "architecture": {
                "adrs": self._load_markdown_dir(hub / "architecture" / "adrs")
                        or self._load_markdown_dir(hub / "architecture"),
            },
        }

    def get_internal_infohub(self, realm_id: str, node_id: str) -> Optional[dict[str, Any]]:
        """Full vendor-internal workspace: analysis, strategy, operations."""
        if ".." in realm_id or "/" in realm_id or ".." in node_id or "/" in node_id:
            return None
        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return None
        hub = node_path / "internal-infohub"
        if not hub.is_dir():
            return {}
        return {
            "context": {
                "node_overview": self._load_yaml(hub / "context" / "node_overview.yaml"),
                "stakeholder_map": self._load_yaml(hub / "context" / "stakeholder_map.yaml"),
                "engagement_history": self._read_text_or_none(hub / "context" / "engagement_history.md"),
            },
            "decisions": self._load_yaml(hub / "decisions" / "decision_log.yaml"),
            "journey": {
                "map": self._load_yaml(hub / "journey" / "customer_journey_map.yaml"),
                "touchpoints": self._load_yaml(hub / "journey" / "touchpoint_log.yaml"),
            },
            "opportunities": self._load_yaml_dir(hub / "opportunities"),
            "value": self._load_yaml(hub / "value" / "value_tracker.yaml"),
            "risks": self._load_yaml(hub / "risks" / "risk_register.yaml"),
            "stakeholders": self._load_yaml_dir(hub / "stakeholders"),
            "competitive": self._load_yaml(hub / "competitive" / "competitive_context.yaml"),
            "governance": {
                "health_score": self._load_yaml(hub / "governance" / "health_score.yaml"),
                "operating_cadence": self._load_yaml(hub / "governance" / "operating_cadence.yaml"),
            },
            "frameworks": self._load_markdown_dir(hub / "frameworks"),
            "actions": self._load_yaml(hub / "actions" / "action_tracker.yaml"),
            "market_intelligence": self._load_yaml(hub / "market_intelligence" / "news_digest.yaml"),
            "agent_work": self._load_yaml_dir(hub / "agent_work"),
        }

    def get_all(self, realm_id: str, node_id: str) -> Optional[dict[str, Any]]:
        if ".." in realm_id or "/" in realm_id or ".." in node_id or "/" in node_id:
            return None
        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return None
        return {
            "meetings": self._load_meetings(node_path),
            "field_notes": self._load_markdown_dir(node_path / "raw" / "daily-ops"),
            "frameworks": self._load_markdown_dir(node_path / "internal-infohub" / "frameworks"),
            "journey": self._load_yaml(node_path / "internal-infohub" / "journey" / "customer_journey_map.yaml"),
            "touchpoints": self._load_yaml(node_path / "internal-infohub" / "journey" / "touchpoint_log.yaml"),
            "opportunities": self._load_yaml_dir(node_path / "internal-infohub" / "opportunities"),
            "agent_work": self._load_yaml_dir(node_path / "internal-infohub" / "agent_work"),
            "market_intelligence": self._load_yaml(node_path / "internal-infohub" / "market_intelligence" / "news_digest.yaml"),
            "operating_cadence": self._load_yaml(node_path / "internal-infohub" / "governance" / "operating_cadence.yaml"),
        }

    def _load_meetings(self, node_path: Path) -> list[dict[str, Any]]:
        meetings: list[dict[str, Any]] = []
        meetings_root = node_path / "raw" / "meetings"
        for meeting_type in ("external", "internal"):
            dir_path = meetings_root / meeting_type
            if not dir_path.is_dir():
                continue
            for md_file in sorted(dir_path.glob("*.md"), reverse=True):
                meetings.append({
                    "filename": md_file.name,
                    "type": meeting_type,
                    "content": self._read_text(md_file),
                })
        meetings.sort(key=lambda m: m["filename"], reverse=True)
        return meetings

    def _load_markdown_dir(self, dir_path: Path) -> list[dict[str, Any]]:
        if not dir_path.is_dir():
            return []
        results = []
        for md_file in sorted(dir_path.glob("*.md"), reverse=True):
            title = md_file.stem.replace("_", " ").replace("-", " ")
            results.append({
                "filename": md_file.name,
                "title": title,
                "content": self._read_text(md_file),
            })
        return results

    def _load_yaml(self, file_path: Path) -> Optional[dict[str, Any]]:
        if not file_path.is_file():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception:
            return None

    def _load_yaml_dir(self, dir_path: Path) -> list[dict[str, Any]]:
        if not dir_path.is_dir():
            return []
        results = []
        for yaml_file in sorted(dir_path.rglob("*.yaml")):
            data = self._load_yaml(yaml_file)
            if data:
                data["_filename"] = yaml_file.name
                data["_relative_path"] = str(yaml_file.relative_to(dir_path))
                results.append(data)
        return results

    def _read_text(self, path: Path) -> str:
        try:
            return path.read_text(encoding="utf-8")
        except Exception:
            return ""

    def _read_text_or_none(self, path: Path) -> Optional[str]:
        if not path.is_file():
            return None
        text = self._read_text(path)
        return text if text else None

    def _save_yaml(self, file_path: Path, data: dict[str, Any]) -> None:
        with open(file_path, "w", encoding="utf-8") as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    def _append_changelog(self, data: dict[str, Any], action: str, details: str) -> dict[str, str]:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": action,
            "details": details,
        }
        if "changelog" not in data:
            data["changelog"] = []
        data["changelog"].append(entry)
        return entry

    def _validate_path_params(self, realm_id: str, node_id: str) -> bool:
        return not (".." in realm_id or "/" in realm_id or ".." in node_id or "/" in node_id)

    def _get_blueprint_path(self, realm_id: str, node_id: str) -> Optional[Path]:
        if not self._validate_path_params(realm_id, node_id):
            return None
        node_path = self._resolve_node_path(realm_id, node_id)
        if not node_path:
            return None
        bp_path = node_path / "blueprint.yaml"
        if not bp_path.is_file():
            return None
        return bp_path

    def update_blueprint_playbook_status(
        self, realm_id: str, node_id: str, playbook_id: str, status: str, notes: Optional[str] = None,
    ) -> tuple[bool, str, Optional[dict]]:
        bp_path = self._get_blueprint_path(realm_id, node_id)
        if not bp_path:
            return False, "Blueprint not found", None

        data = self._load_yaml(bp_path)
        if not data:
            return False, "Failed to read blueprint", None

        playbooks = data.get("playbooks", {})
        found = False
        pb_name = playbook_id
        for section in ("required", "optional"):
            for pb in playbooks.get(section, []):
                if pb.get("playbook_id") == playbook_id:
                    pb["status"] = status
                    if notes is not None:
                        pb["notes"] = notes
                    pb_name = pb.get("name", playbook_id)
                    found = True
                    break
            if found:
                break

        if not found:
            return False, f"Playbook {playbook_id} not found in blueprint", None

        details = f"{playbook_id} ({pb_name}) status changed to {status}"
        if notes:
            details += f", {notes}"
        entry = self._append_changelog(data, "playbook_status_updated", details)
        data["metadata"] = data.get("metadata", {})
        data["metadata"]["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._save_yaml(bp_path, data)
        return True, "ok", entry

    def add_blueprint_playbook(
        self, realm_id: str, node_id: str,
        playbook_id: str, name: str, phase: str, reason: str,
    ) -> tuple[bool, str, Optional[dict]]:
        bp_path = self._get_blueprint_path(realm_id, node_id)
        if not bp_path:
            return False, "Blueprint not found", None

        data = self._load_yaml(bp_path)
        if not data:
            return False, "Failed to read blueprint", None

        playbooks = data.get("playbooks", {})
        for section in ("required", "optional"):
            for pb in playbooks.get(section, []):
                if pb.get("playbook_id") == playbook_id:
                    return False, f"Playbook {playbook_id} already exists in blueprint", None

        required = playbooks.get("required", [])
        max_seq = max((pb.get("sequence", 0) for pb in required), default=0)
        required.append({
            "playbook_id": playbook_id,
            "name": name,
            "phase": phase,
            "sequence": max_seq + 1,
            "status": "pending",
            "notes": f"Added mid-engagement: {reason}",
        })
        playbooks["required"] = required
        data["playbooks"] = playbooks

        entry = self._append_changelog(data, "playbook_added", f"{playbook_id} ({name}) added, reason: {reason}")
        data["metadata"] = data.get("metadata", {})
        data["metadata"]["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._save_yaml(bp_path, data)
        return True, "ok", entry

    def remove_blueprint_playbook(
        self, realm_id: str, node_id: str, playbook_id: str, reason: str,
    ) -> tuple[bool, str, Optional[dict]]:
        bp_path = self._get_blueprint_path(realm_id, node_id)
        if not bp_path:
            return False, "Blueprint not found", None

        data = self._load_yaml(bp_path)
        if not data:
            return False, "Failed to read blueprint", None

        playbooks = data.get("playbooks", {})
        removed = None
        for section in ("required", "optional"):
            items = playbooks.get(section, [])
            for i, pb in enumerate(items):
                if pb.get("playbook_id") == playbook_id:
                    removed = items.pop(i)
                    break
            if removed:
                break

        if not removed:
            return False, f"Playbook {playbook_id} not found in blueprint", None

        blocked = playbooks.get("blocked", [])
        blocked.append({
            "playbook_id": playbook_id,
            "name": removed.get("name", playbook_id),
            "reason": reason,
        })
        playbooks["blocked"] = blocked
        data["playbooks"] = playbooks

        pb_name = removed.get("name", playbook_id)
        entry = self._append_changelog(data, "playbook_removed", f"{playbook_id} ({pb_name}) blocked, reason: {reason}")
        data["metadata"] = data.get("metadata", {})
        data["metadata"]["last_updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        self._save_yaml(bp_path, data)
        return True, "ok", entry

    def get_blueprint_changelog(self, realm_id: str, node_id: str) -> Optional[list[dict[str, str]]]:
        bp_path = self._get_blueprint_path(realm_id, node_id)
        if not bp_path:
            return None
        data = self._load_yaml(bp_path)
        if not data:
            return None
        return data.get("changelog", [])


@lru_cache
def get_vault_service() -> VaultService:
    settings = get_settings()
    return VaultService(settings.vault_path)
