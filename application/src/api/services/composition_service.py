"""Deterministic Blueprint Composition Service

Composes blueprints by layering: Archetype base playbooks + Track policy + Domain specialists.
No LLM needed, pure rule-based assembly from existing catalogs.
"""

from datetime import date
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from .blueprint_service import get_blueprint_service
from .playbook_service import get_playbook_service


class CompositionService:

    def __init__(self):
        settings = get_settings()
        self.domain_path = settings.domain_path
        self.vault_path = settings.vault_path
        self._bp_svc = get_blueprint_service()
        self._pb_svc = get_playbook_service()

    def get_playbook_index(self) -> dict[str, dict[str, str]]:
        """Build index: playbook_id -> {name, team, category, objective}"""
        playbooks = self._pb_svc.list_playbooks()
        index: dict[str, dict[str, str]] = {}
        for pb in playbooks:
            pb_id = pb.get("_id", "")
            steck = pb.get("steckbrief") or {}
            name = (
                pb.get("framework_name")
                or pb.get("name")
                or steck.get("name", "")
                or pb_id
            )
            team = pb.get("_team", "")
            category = steck.get("category", team)
            objective = (
                pb.get("primary_objective", "")
                or steck.get("one_liner", "")
            )
            if pb_id:
                index[pb_id] = {
                    "name": name,
                    "team": team,
                    "category": category,
                    "objective": objective,
                }
        return index

    def compose(
        self,
        archetype: str,
        domain: str,
        track: str,
        variant: Optional[str] = None,
    ) -> dict[str, Any]:
        """
        Deterministically compose a blueprint from archetype + domain + track.

        Returns a dict with:
          - composed blueprint structure (playbooks, canvases, checklists, timeline)
          - metadata about what was selected and why
          - validation warnings
        """
        warnings: list[str] = []
        pb_index = self.get_playbook_index()

        archetypes_data = self._bp_svc.get_archetypes()
        tracks_data = self._bp_svc.get_engagement_tracks()

        arch_def = (archetypes_data.get("archetypes") or {}).get(archetype)
        if not arch_def:
            return {"error": f"Unknown archetype: {archetype}"}

        track_def = (tracks_data.get("tracks") or {}).get(track)
        if not track_def:
            return {"error": f"Unknown track: {track}"}

        domains_data = archetypes_data.get("domains") or {}
        domain_def = domains_data.get(domain)
        if not domain_def:
            return {"error": f"Unknown domain: {domain}"}

        # Check track constraints
        track_order = {"poc": 0, "economy": 1, "fast_track": 2, "premium": 3}
        min_track = arch_def.get("minimum_track")
        if min_track and track_order.get(track, 0) < track_order.get(min_track, 0):
            warnings.append(f"Track '{track}' is below minimum '{min_track}' for this archetype")

        track_override = arch_def.get("track_override")
        if track_override and track != track_override:
            warnings.append(f"Archetype forces track '{track_override}', but '{track}' was selected")

        # Pick reference blueprint variant
        ref_bps = arch_def.get("reference_blueprints", [])
        selected_variant = None
        if variant:
            selected_variant = next((v for v in ref_bps if v["id"] == variant), None)
            if not selected_variant:
                warnings.append(f"Variant '{variant}' not found, using first available")
        if not selected_variant and ref_bps:
            selected_variant = ref_bps[-1]  # default to most comprehensive

        # 1. Start with archetype base playbooks
        base_pb_ids: list[str] = []
        if selected_variant:
            base_pb_ids = list(selected_variant.get("playbooks", []))

        # 2. Apply track policy
        track_policy = track_def.get("playbook_policy", {})
        track_required = track_policy.get("required", [])
        track_blocked = track_policy.get("blocked", [])
        max_playbooks = track_policy.get("max_playbooks", "unlimited")

        for pb_id in track_required:
            if pb_id not in base_pb_ids:
                base_pb_ids.append(pb_id)

        blocked_set = set(track_blocked)
        required_pbs = [pb for pb in base_pb_ids if pb not in blocked_set]
        blocked_pbs = [pb for pb in base_pb_ids if pb in blocked_set]

        if blocked_pbs:
            warnings.append(f"Track '{track}' blocks: {', '.join(blocked_pbs)}")

        # 3. Enforce max_playbooks
        if max_playbooks != "unlimited" and isinstance(max_playbooks, int):
            if len(required_pbs) > max_playbooks:
                warnings.append(
                    f"Track allows max {max_playbooks} playbooks, "
                    f"composition has {len(required_pbs)}. Trimmed to limit."
                )
                required_pbs = required_pbs[:max_playbooks]

        # 4. Domain specialist playbooks (optional)
        domain_prefix = domain_def.get("playbook_prefix")
        domain_playbooks: list[str] = []
        if domain_prefix:
            domain_playbooks = sorted(
                pb_id for pb_id in pb_index if pb_id.startswith(domain_prefix)
            )

        # 5. Validate all playbook IDs exist
        all_referenced = required_pbs + domain_playbooks
        for pb_id in all_referenced:
            if pb_id not in pb_index:
                warnings.append(f"Playbook '{pb_id}' not found in library")

        # 6. Canvas assembly from track policy
        canvas_policy = track_def.get("canvas_policy", {})
        canvas_required = canvas_policy.get("required", [])
        if canvas_required == "all":
            canvas_required = [
                "context_canvas", "decision_canvas", "value_stakeholders_canvas",
                "risk_governance_canvas", "architecture_decision_canvas",
            ]

        # 7. Checklist assembly
        checklists = self._bp_svc.get_checklist_definitions()
        discovery_checks = [
            rid for rid, rule in checklists.items()
            if "stakeholder" in rule.get("name", "").lower()
            or "canvas" in rule.get("name", "").lower()
        ][:5]
        impl_checks = [
            rid for rid, rule in checklists.items()
            if "risk" in rule.get("name", "").lower()
            or "implementation" in rule.get("name", "").lower()
        ][:5]

        # 8. Timeline
        duration = arch_def.get("typical_duration_weeks", 8)
        if isinstance(duration, int):
            discovery_weeks = max(1, duration // 4)
            impl_weeks = max(1, duration // 2)
            stab_weeks = max(1, duration - discovery_weeks - impl_weeks)
        else:
            discovery_weeks = 4
            impl_weeks = 8
            stab_weeks = 4

        # 9. Governance from track
        governance = track_def.get("governance", {})
        sla = track_def.get("sla", {})

        # Build enriched playbook entries
        def enrich(pb_id: str, seq: int, phase: str = "discovery") -> dict:
            info = pb_index.get(pb_id, {})
            return {
                "playbook_id": pb_id,
                "name": info.get("name", pb_id),
                "phase": phase,
                "sequence": seq,
            }

        required_entries = [enrich(pb, i + 1) for i, pb in enumerate(required_pbs)]
        optional_entries = [enrich(pb, i + 1) for i, pb in enumerate(domain_playbooks)]

        # Compose the blueprint structure
        blueprint_id = f"{selected_variant['id']}_{domain}" if selected_variant else f"A01_{domain}"

        composed = {
            "version": "1.0",
            "archetype": archetype,
            "blueprint_id": blueprint_id,
            "metadata": {
                "name": f"{arch_def['name']} - {domain_def['name']}",
                "description": f"{arch_def['description']} with {domain_def['name']} domain focus",
                "owner": "sa_team",
                "last_updated": date.today().isoformat(),
            },
            "classification": {
                "archetype": archetype,
                "domain": domain,
                "track": track,
                "variant": selected_variant["id"] if selected_variant else None,
            },
            "playbooks": {
                "all_tracks": {
                    "required": required_entries,
                },
                track: {
                    "required": [],
                    "optional": optional_entries,
                    "blocked": list(blocked_set),
                },
            },
            "canvases": {
                track: {
                    "required": canvas_required,
                    "template_only": canvas_policy.get("template_only", False),
                    "custom_allowed": canvas_policy.get("custom_allowed", False),
                },
            },
            "checklists": {
                "discovery_complete": discovery_checks,
                "implementation_ready": impl_checks,
            },
            "timeline": {
                "discovery_weeks": discovery_weeks,
                "implementation_weeks": impl_weeks,
                "stabilization_weeks": stab_weeks,
            },
            "governance": {
                **governance,
                "sla": sla,
            },
        }

        # Pre-selected IDs for the picker
        selected_ids = set(required_pbs + domain_playbooks)

        return {
            "blueprint": composed,
            "warnings": warnings,
            "summary": {
                "required_playbooks": len(required_pbs),
                "optional_domain_playbooks": len(domain_playbooks),
                "blocked_playbooks": len(blocked_pbs),
                "canvases": len(canvas_required),
                "total_weeks": discovery_weeks + impl_weeks + stab_weeks,
            },
            "playbook_index": pb_index,
            "selected_playbook_ids": sorted(selected_ids),
            "blocked_playbook_ids": sorted(blocked_set),
        }

    def save_blueprint(
        self,
        blueprint: dict[str, Any],
        archetype: str,
        blueprint_id: str,
    ) -> tuple[bool, str]:
        """Save composed blueprint as a reference blueprint YAML file."""
        if ".." in archetype or "/" in archetype or ".." in blueprint_id or "/" in blueprint_id:
            return False, "Invalid path characters"

        target_dir = self.domain_path / "blueprints" / "reference" / archetype
        target_dir.mkdir(parents=True, exist_ok=True)

        target_file = target_dir / f"{blueprint_id}.yaml"
        if target_file.exists():
            return False, f"Blueprint '{blueprint_id}' already exists for archetype '{archetype}'"

        with open(target_file, "w", encoding="utf-8") as f:
            f.write(f"# Blueprint: {blueprint.get('metadata', {}).get('name', blueprint_id)}\n")
            f.write(f"# Composed on {date.today().isoformat()}\n")
            yaml.dump(blueprint, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

        return True, str(target_file.relative_to(self.domain_path))


composition_service = CompositionService()


def get_composition_service() -> CompositionService:
    return composition_service
