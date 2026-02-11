"""Playbook Service for reading/writing playbook YAML files"""

import re
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings


def _extract_pb_id(stem: str) -> str:
    """Derive a unique playbook ID from a filename stem.

    Standard files: PB_101_togaf -> PB_101
    Specialist files: PB_SEC_001_technical -> PB_SEC_001
    """
    parts = stem.split("_")
    if len(parts) >= 3 and not parts[1].isdigit():
        return f"{parts[0]}_{parts[1]}_{parts[2]}"
    if len(parts) >= 2:
        return f"{parts[0]}_{parts[1]}"
    return stem


class PlaybookService:
    """Service for managing playbook YAML files"""

    def __init__(self):
        settings = get_settings()
        self.playbook_root = settings.domain_path / "playbooks"

    def list_playbooks(
        self,
        role: Optional[str] = None,
        status: Optional[str] = None,
        team: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """List all playbooks with optional filters"""
        playbooks = []
        if not self.playbook_root.exists():
            return playbooks

        for yaml_file in sorted(self.playbook_root.rglob("PB_*.yaml")):
            if any(skip in yaml_file.parts for skip in ("templates", "backup", "old")):
                continue
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    if not data:
                        continue
                    data["_id"] = _extract_pb_id(yaml_file.stem)
                    data["_filename"] = yaml_file.name
                    data["_team"] = yaml_file.parent.name
                    data["_path"] = str(yaml_file.relative_to(self.playbook_root))
                    if not data.get("intended_agent_role"):
                        raci_role = (data.get("raci") or {}).get("responsible", {}).get("role", "")
                        if raci_role:
                            data["intended_agent_role"] = raci_role.replace("_", " ").title()
                    playbooks.append(data)
            except Exception:
                pass

        if role:
            role_lower = role.lower()
            playbooks = [
                p for p in playbooks
                if role_lower in p.get("intended_agent_role", "").lower()
            ]
        if status:
            playbooks = [p for p in playbooks if p.get("status") == status]
        if team:
            playbooks = [p for p in playbooks if p.get("_team") == team]
        if search:
            q = search.lower()
            playbooks = [
                p for p in playbooks
                if q in p.get("framework_name", "").lower()
                or q in p.get("_id", "").lower()
                or q in p.get("primary_objective", "").lower()
            ]

        return playbooks

    def _resolve_path(self, team: str, filename: str) -> Optional[Path]:
        """Resolve playbook path, handling nested directories like specialists/security/"""
        if ".." in team or ".." in filename or "/" in team or "/" in filename:
            return None

        path = self.playbook_root / team / filename
        resolved = path.resolve()
        if not resolved.is_relative_to(self.playbook_root.resolve()):
            return None
        if resolved.exists() and resolved.is_file():
            return resolved

        for candidate in self.playbook_root.rglob(filename):
            if candidate.parent.name == team:
                candidate_resolved = candidate.resolve()
                if candidate_resolved.is_relative_to(self.playbook_root.resolve()):
                    return candidate_resolved
        return None

    def get_playbook(self, team: str, filename: str) -> Optional[dict[str, Any]]:
        """Get a single playbook parsed"""
        path = self._resolve_path(team, filename)
        if not path:
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
            if data:
                data["_id"] = _extract_pb_id(path.stem)
                data["_filename"] = filename
                data["_team"] = team
                data["_path"] = f"{team}/{filename}"
                if not data.get("intended_agent_role"):
                    raci_role = (data.get("raci") or {}).get("responsible", {}).get("role", "")
                    if raci_role:
                        data["intended_agent_role"] = raci_role.replace("_", " ").title()
            return data
        except Exception:
            return None

    def read_raw(self, team: str, filename: str) -> Optional[str]:
        """Read raw YAML content for editing"""
        path = self._resolve_path(team, filename)
        if not path:
            return None
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def save_raw(self, team: str, filename: str, content: str) -> tuple[bool, str]:
        """Validate and save raw YAML content"""
        try:
            yaml.safe_load(content)
        except yaml.YAMLError as e:
            return False, f"Invalid YAML: {e}"

        path = self._resolve_path(team, filename)
        if not path:
            return False, "File not found"
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            return True, ""
        except OSError as e:
            return False, f"Write error: {e}"

    def update_fields(self, team: str, filename: str, updates: dict[str, Any]) -> tuple[bool, str]:
        """Update specific fields using format-preserving regex edits"""
        raw = self.read_raw(team, filename)
        if raw is None:
            return False, "File not found"

        for key, value in updates.items():
            if isinstance(value, list):
                raw = self._replace_list_block(raw, key, value)
            else:
                raw = self._replace_scalar(raw, key, str(value))

        return self.save_raw(team, filename, raw)

    @staticmethod
    def _replace_scalar(content: str, key: str, new_value: str) -> str:
        pattern = rf'^({key}:\s*)(".*?"|\'.*?\'|[^\n]+)$'
        escaped = new_value.replace("\\", "\\\\").replace('"', '\\"')
        return re.sub(pattern, rf'\1"{escaped}"', content, count=1, flags=re.MULTILINE)

    @staticmethod
    def _replace_list_block(content: str, key: str, items: list[str]) -> str:
        if not items:
            return content
        pattern = rf'^({key}:\s*\n)((?:[ \t]+-[^\n]*\n?)*)'
        yaml_lines = "".join(f'  - "{item}"\n' for item in items)
        return re.sub(pattern, rf'\g<1>{yaml_lines}', content, count=1, flags=re.MULTILINE)


playbook_service = PlaybookService()


def get_playbook_service() -> PlaybookService:
    return playbook_service
