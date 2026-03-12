"""Agent definition service for reading and serving *-definition.yaml files."""

import io
import zipfile
from pathlib import Path
from functools import lru_cache
from typing import Optional

import yaml

from ..config import get_settings


class DefinitionsService:
    """Scans domain/agents/ for *-definition.yaml files and serves parsed content."""

    CATEGORY_MAP = {
        "account_executives": "Sales",
        "competitive_intelligence": "Intelligence",
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
        """Return summary list of all agent definitions found.

        Category assignment follows the parent chain: sub-agents inherit
        their orchestrator's category rather than being bucketed by directory.
        """
        if not self.agents_path.is_dir():
            return []

        # Pass 1: parse all files, record directory-based category and parent_agent
        raw: list[dict] = []
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
                parent_agent = metadata.get("parent_agent") if isinstance(metadata, dict) else None

                raw.append({
                    "id": data.get("id", def_file.stem),
                    "name": data.get("name", def_file.stem),
                    "description": data.get("description", ""),
                    "agentspec_version": data.get("agentspec_version", ""),
                    "metadata": metadata,
                    "file_path": str(def_file.relative_to(self.agents_path.parent.parent)),
                    "flow_count": len(data.get("flows", [])),
                    "tool_count": len(data.get("tools", [])),
                    "prompt_count": len(ext.get("prompt_registry", {})),
                    "_dir_category": self._derive_category(def_file),
                    "_parent_agent": parent_agent,
                    "tags": tags,
                    "human_in_the_loop": data.get("human_in_the_loop", False),
                    "capabilities": profile.get("capabilities", []),
                    "sub_agents": profile.get("sub_agents", []),
                    "escalation_target": handoffs_data.get("human_escalation", ""),
                    "has_profile": bool(profile.get("role_context")),
                    "role_context": profile.get("role_context", ""),
                    "goals_summary": profile.get("goals_summary", ""),
                    "goals": profile.get("goals", []),
                    "why": profile.get("why", ""),
                    "human_matters_summary": profile.get("human_matters_summary", ""),
                    "knowledge_ref_count": len(ext.get("knowledge", {}).get("references", [])),
                })
            except Exception:
                continue

        # Pass 2: resolve category — sub-agents inherit their orchestrator's category
        id_to_category = {r["id"]: r["_dir_category"] for r in raw}
        definitions = []
        for entry in raw:
            parent_id = entry.pop("_parent_agent", None)
            dir_cat = entry.pop("_dir_category")
            if parent_id and parent_id in id_to_category:
                entry["category"] = id_to_category[parent_id]
            else:
                entry["category"] = dir_cat
            definitions.append(entry)

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
                    self._resolve_knowledge_paths(data, def_file.parent)
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
                        self._resolve_knowledge_paths(sa, def_file.parent)
                        return sa
            except Exception:
                continue

        return None

    def _resolve_knowledge_paths(self, data: dict, agent_dir: Path) -> None:
        """Resolve path: references in knowledge.references by loading the YAML content."""
        ext = data.get("x-ea-agent", {})
        knowledge = ext.get("knowledge", {})
        if not isinstance(knowledge, dict):
            return
        refs = knowledge.get("references", [])
        if not isinstance(refs, list):
            return
        for ref in refs:
            if not isinstance(ref, dict):
                continue
            path_val = ref.get("path")
            if not path_val or ref.get("content"):
                continue
            ref_file = agent_dir / path_val
            if ref_file.is_file():
                try:
                    content = yaml.safe_load(ref_file.read_text(encoding="utf-8"))
                    if isinstance(content, dict):
                        ref["content"] = content
                except Exception:
                    pass

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

    def get_bundle(self, agent_id: str) -> Optional[tuple[bytes, str]]:
        """Return a ZIP archive containing the definition and all referenced files."""
        if not self.agents_path.is_dir():
            return None

        for def_file in self.agents_path.rglob("*-definition.yaml"):
            try:
                data = yaml.safe_load(def_file.read_text(encoding="utf-8"))
                if not isinstance(data, dict) or data.get("id") != agent_id:
                    continue
            except Exception:
                continue

            agent_dir = def_file.parent
            files: list[tuple[Path, str]] = [(def_file, def_file.name)]

            # Prompt files from prompt_registry sources (deduplicated)
            registry = data.get("x-ea-agent", {}).get("prompt_registry", {})
            seen_prompts: set[str] = set()
            for entry in registry.values():
                if not isinstance(entry, dict):
                    continue
                source = entry.get("source", "")
                file_part = source.partition("#")[0]
                if file_part and file_part not in seen_prompts:
                    seen_prompts.add(file_part)
                    p = agent_dir / file_part
                    if p.is_file():
                        files.append((p, file_part))

            # Knowledge reference files
            knowledge = data.get("x-ea-agent", {}).get("knowledge", {})
            if isinstance(knowledge, dict):
                for ref in knowledge.get("references", []):
                    if isinstance(ref, dict) and ref.get("path"):
                        p = agent_dir / ref["path"]
                        if p.is_file():
                            files.append((p, ref["path"]))

            # Skills directory
            skills_dir = agent_dir / "skills"
            if skills_dir.is_dir():
                for sf in sorted(skills_dir.iterdir()):
                    if sf.is_file():
                        files.append((sf, str(sf.relative_to(agent_dir))))

            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                for abs_path, arc_name in files:
                    zf.writestr(arc_name, abs_path.read_text(encoding="utf-8"))
            buf.seek(0)
            return buf.getvalue(), f"{agent_id}-bundle.zip"

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

                result = node if isinstance(node, dict) else {"prompt": str(node)}
                if isinstance(result, dict) and entry.get("requires_data"):
                    result["requires_data"] = entry["requires_data"]
                return result
            except Exception:
                continue

        return None


@lru_cache
def get_definitions_service() -> DefinitionsService:
    """Factory for dependency injection, cached as singleton."""
    settings = get_settings()
    return DefinitionsService(settings.domain_path / "agents")
