"""Data Source Service - enriches page-section-to-playbook/agent mappings with live YAML metadata."""

from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from .playbook_service import PlaybookService


class DataSourceService:

    def __init__(self):
        settings = get_settings()
        self._mapping = self._load_mapping(
            settings.domain_path / "mappings" / "data_source_mapping.yaml"
        )
        self._playbook_index = self._build_playbook_index()
        self._agent_index = self._build_agent_index(settings.domain_path / "agents")

    def get_data_sources(self, page_section: str) -> dict[str, Any]:
        section = self._mapping.get("page_sections", {}).get(page_section)
        if not section:
            return {"section": page_section, "label": page_section, "sources": []}

        enriched_sources = [
            self._enrich_source(source)
            for source in section.get("sources", [])
        ]
        return {
            "section": page_section,
            "label": section.get("label", page_section),
            "sources": enriched_sources,
        }

    def list_all_sources(self) -> dict[str, Any]:
        sections = {}
        for key in self._mapping.get("page_sections", {}):
            sections[key] = self.get_data_sources(key)
        return {"sections": sections}

    def _enrich_source(self, source: dict[str, Any]) -> dict[str, Any]:
        result = {**source}

        pb_id = source.get("playbook_id")
        if pb_id and pb_id in self._playbook_index:
            pb = self._playbook_index[pb_id]
            inputs = (
                pb.get("validation_inputs", {}).get("mandatory", [])
                or pb.get("required_inputs", {}).get("mandatory", [])
            )
            result["playbook"] = {
                "playbook_id": pb_id,
                "name": pb.get("framework_name", ""),
                "objective": pb.get("primary_objective", ""),
                "frequency": pb.get("frequency", ""),
                "category": pb.get("playbook_category", ""),
                "trigger_conditions": pb.get("trigger_conditions", {}),
                "inputs": inputs or [],
                "outputs": pb.get("expected_outputs", {}).get("primary_artifact", {}),
                "validation_checks": pb.get("validation_checks", {}),
            }

        agent_id = source.get("agent_id")
        if agent_id and agent_id in self._agent_index:
            agent = self._agent_index[agent_id]
            result["agent"] = {
                "agent_id": agent_id,
                "purpose": agent.get("purpose", ""),
                "team": agent.get("team", ""),
                "core_functions": agent.get("core_functions", []),
            }

        return result

    @staticmethod
    def _load_mapping(path: Path) -> dict[str, Any]:
        if not path.exists():
            return {}
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    @staticmethod
    def _build_playbook_index() -> dict[str, dict[str, Any]]:
        svc = PlaybookService()
        index: dict[str, dict[str, Any]] = {}
        for pb in svc.list_playbooks():
            pb_id = pb.get("playbook_id") or pb.get("_id")
            if pb_id:
                index[pb_id] = pb
        return index

    @staticmethod
    def _build_agent_index(agents_root: Path) -> dict[str, dict[str, Any]]:
        index: dict[str, dict[str, Any]] = {}
        if not agents_root.exists():
            return index
        for yaml_file in agents_root.rglob("*_agent.yaml"):
            if "agents" not in yaml_file.parent.name:
                continue
            try:
                with open(yaml_file, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                if data and data.get("agent_id"):
                    index[data["agent_id"]] = data
            except Exception:
                pass
        return index


_data_source_service: Optional[DataSourceService] = None


def get_data_source_service() -> DataSourceService:
    global _data_source_service
    if _data_source_service is None:
        _data_source_service = DataSourceService()
    return _data_source_service
