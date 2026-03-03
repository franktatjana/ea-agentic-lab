"""Agent definition service for reading and serving *-definition.yaml files."""

from pathlib import Path
from functools import lru_cache
from typing import Optional

import yaml

from ..config import get_settings


class DefinitionsService:
    """Scans domain/agents/ for *-definition.yaml files and serves parsed content."""

    CATEGORY_MAP = {
        "account_executives": "Sales",
        "competitive_intelligence": "Sales",
        "value_engineering": "Sales",
        "partners": "Sales",
        "account_intelligence": "Intelligence",
        "solution_architects": "Architecture",
        "customer_architects": "Architecture",
        "governance": "Governance",
        "delivery": "Delivery",
        "professional_services": "Delivery",
        "leadership": "Leadership",
        "product_managers": "Specialists",
        "industry_intelligence": "Intelligence",
        "market_news_analysis": "Intelligence",
        "technology_scout": "Intelligence",
        "rfp": "Deal Execution",
        "poc": "Deal Execution",
        "infosec": "Deal Execution",
        "specialists": "Specialists",
        "retrospective": "Operations",
    }

    def __init__(self, agents_path: Path):
        self.agents_path = agents_path

    def _derive_category(self, def_file: Path) -> str:
        rel = def_file.relative_to(self.agents_path)
        top_dir = rel.parts[0] if rel.parts else ""
        return self.CATEGORY_MAP.get(top_dir, "Other")

    def list_definitions(self) -> list[dict]:
        """Return summary list of all agent definitions found."""
        definitions = []
        if not self.agents_path.is_dir():
            return definitions

        for def_file in sorted(self.agents_path.rglob("*-definition.yaml")):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict):
                    continue

                metadata = data.get("metadata", {})
                tags = metadata.get("tags", []) if isinstance(metadata, dict) else []

                ext = data.get("x-ea-agent", {})
                profile = ext.get("profile", {})
                handoffs_data = ext.get("handoffs", {})

                definitions.append({
                    "id": data.get("id", def_file.stem),
                    "name": data.get("name", def_file.stem),
                    "description": data.get("description", ""),
                    "agentspec_version": data.get("agentspec_version", ""),
                    "metadata": metadata,
                    "file_path": str(def_file.relative_to(self.agents_path.parent.parent)),
                    "flow_count": len(data.get("flows", [])),
                    "tool_count": len(data.get("tools", [])),
                    "prompt_count": len(ext.get("prompt_registry", {})),
                    "category": self._derive_category(def_file),
                    "tags": tags,
                    "human_in_the_loop": data.get("human_in_the_loop", False),
                    "capabilities": profile.get("capabilities", []),
                    "sub_agents": profile.get("sub_agents", []),
                    "escalation_target": handoffs_data.get("human_escalation", ""),
                    "has_profile": bool(profile),
                })
            except Exception:
                continue

        return definitions

    def get_definition(self, agent_id: str) -> Optional[dict]:
        """Load full definition by agent ID.

        Searches top-level definitions first, then falls back to
        specialized_agents entries embedded inside parent specs.
        """
        if not self.agents_path.is_dir():
            return None

        for def_file in self.agents_path.rglob("*-definition.yaml"):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict):
                    continue
                if data.get("id") == agent_id:
                    data["_category"] = self._derive_category(def_file)
                    return data
            except Exception:
                continue

        # Fallback: search inside specialized_agents of each definition
        for def_file in self.agents_path.rglob("*-definition.yaml"):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict):
                    continue
                for sa in data.get("specialized_agents", []):
                    if isinstance(sa, dict) and sa.get("id") == agent_id:
                        sa["_category"] = self._derive_category(def_file)
                        sa["_parent_id"] = data.get("id")
                        sa["_parent_name"] = data.get("name")
                        return sa
            except Exception:
                continue

        return None

    def get_raw_yaml(self, agent_id: str) -> Optional[tuple[str, str]]:
        """Return raw YAML text and filename for an agent definition."""
        if not self.agents_path.is_dir():
            return None

        for def_file in self.agents_path.rglob("*-definition.yaml"):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict) or data.get("id") != agent_id:
                    continue
                return def_file.read_text(encoding="utf-8"), def_file.name
            except Exception:
                continue

        return None

    def resolve_prompt(self, agent_id: str, prompt_key: str) -> Optional[dict]:
        """Resolve a prompt_registry entry's source path and return the actual prompt content."""
        if not self.agents_path.is_dir():
            return None

        for def_file in self.agents_path.rglob("*-definition.yaml"):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict) or data.get("id") != agent_id:
                    continue

                registry = data.get("x-ea-agent", {}).get("prompt_registry", {})
                entry = registry.get(prompt_key)
                if not entry or not entry.get("source"):
                    return None

                source = entry["source"]
                file_part, _, fragment = source.partition("#")
                agent_dir = def_file.parent
                source_file = agent_dir / file_part

                if not source_file.is_file():
                    return {"error": f"Source file not found: {file_part}"}

                source_data = yaml.safe_load(source_file.read_text(encoding="utf-8"))
                if not isinstance(source_data, dict):
                    return {"error": "Source file is not a valid YAML mapping"}

                node = source_data
                for key in fragment.split("."):
                    if isinstance(node, dict) and key in node:
                        node = node[key]
                    else:
                        return {"error": f"Path '{fragment}' not found in {file_part}"}

                if isinstance(node, dict):
                    return node
                return {"prompt": str(node)}
            except Exception:
                continue

        return None


@lru_cache
def get_definitions_service() -> DefinitionsService:
    """Factory for dependency injection, cached as singleton."""
    settings = get_settings()
    return DefinitionsService(settings.domain_path / "agents")
