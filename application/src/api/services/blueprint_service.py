"""Blueprint Service for reading reference blueprints, archetypes, and engagement tracks"""

from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings


class BlueprintService:
    """Service for browsing reference blueprints and domain catalogs"""

    def __init__(self):
        settings = get_settings()
        self.domain_path = settings.domain_path

    def get_archetypes(self) -> dict[str, Any]:
        path = self.domain_path / "catalogs" / "archetypes.yaml"
        if not path.exists():
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def get_engagement_tracks(self) -> dict[str, Any]:
        path = self.domain_path / "mappings" / "engagement_tracks.yaml"
        if not path.exists():
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def list_reference_blueprints(self, archetype: Optional[str] = None) -> list[dict[str, Any]]:
        root = self.domain_path / "blueprints" / "reference"
        if not root.exists():
            return []

        blueprints: list[dict[str, Any]] = []
        for yaml_file in sorted(root.rglob("*.yaml")):
            if any(skip in yaml_file.parts for skip in ("templates", "backup", "old")):
                continue
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                if not data:
                    continue
                data["_archetype_dir"] = yaml_file.parent.name
                data["_filename"] = yaml_file.name
                data["_path"] = str(yaml_file.relative_to(root))
                blueprints.append(data)
            except Exception:
                pass

        if archetype:
            blueprints = [b for b in blueprints if b.get("_archetype_dir") == archetype]

        return blueprints

    def get_reference_blueprint(self, archetype: str, blueprint_id: str) -> Optional[dict[str, Any]]:
        root = self.domain_path / "blueprints" / "reference" / archetype
        if not root.exists():
            return None
        for yaml_file in root.glob("*.yaml"):
            if yaml_file.stem == blueprint_id:
                try:
                    with open(yaml_file, "r", encoding="utf-8") as f:
                        data = yaml.safe_load(f)
                    if data:
                        data["_archetype_dir"] = archetype
                        data["_filename"] = yaml_file.name
                        data["_path"] = f"{archetype}/{yaml_file.name}"
                    return data
                except Exception:
                    return None
        return None

    def get_checklist_definitions(self) -> dict[str, Any]:
        path = self.domain_path / "config" / "checklists" / "blueprint_checklists.yaml"
        if not path.exists():
            return {}
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        lookup: dict[str, Any] = {}
        for section in ("node_level", "realm_level", "blueprint_level", "staleness"):
            for rule in data.get(section, []):
                rule_id = rule.get("rule_id")
                if rule_id:
                    lookup[rule_id] = rule
        return lookup

    def get_reference_blueprint_raw(self, archetype: str, blueprint_id: str) -> Optional[str]:
        root = self.domain_path / "blueprints" / "reference" / archetype
        if not root.exists():
            return None
        for yaml_file in root.glob("*.yaml"):
            if yaml_file.stem == blueprint_id:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    return f.read()
        return None


blueprint_service = BlueprintService()


def get_blueprint_service() -> BlueprintService:
    return blueprint_service
