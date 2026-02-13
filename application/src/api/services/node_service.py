"""Node Service: create new nodes with composed blueprints."""

import re
import shutil
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from ..models.schemas import CreateNodeRequest, CreateNodeResponse
from .composition_service import get_composition_service
from .yaml_loader import get_yaml_loader

NODE_ID_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]{2,49}$")

INTERNAL_INFOHUB_DIRS = [
    "context",
    "risks",
    "stakeholders",
    "competitive",
    "governance",
    "frameworks",
    "actions",
    "value",
    "journey",
    "market_intelligence",
    "decisions",
    "agent_work",
    "opportunities",
]

EXTERNAL_INFOHUB_DIRS = [
    "context",
    "decisions",
    "architecture",
    "value",
]


class NodeService:

    def __init__(self):
        settings = get_settings()
        self.vault_path = settings.vault_path
        self._loader = get_yaml_loader()
        self._composer = get_composition_service()

    def create_node(
        self, realm_id: str, request: CreateNodeRequest
    ) -> tuple[Optional[CreateNodeResponse], int, str]:
        """Create a new node with composed blueprint.

        Returns (response, status_code, message).
        On success: (CreateNodeResponse, 201, "ok")
        On failure: (None, error_code, error_message)
        """
        # Path safety
        if ".." in realm_id or "/" in realm_id:
            return None, 400, "Invalid realm_id"
        if not NODE_ID_PATTERN.match(request.node_id):
            return None, 422, "node_id must be SCREAMING_SNAKE_CASE (3-50 chars, start with letter)"

        # Verify realm exists
        realm_dir = self._loader._resolve_realm_dir(realm_id)
        if not realm_dir.exists():
            return None, 404, f"Realm '{realm_id}' not found"

        # Check node doesn't already exist
        node_dir = realm_dir / request.node_id
        if node_dir.exists():
            return None, 409, f"Node '{request.node_id}' already exists in realm '{realm_id}'"

        # Compose blueprint
        result = self._composer.compose(
            archetype=request.archetype,
            domain=request.domain,
            track=request.track,
            variant=request.variant,
        )
        if "error" in result:
            return None, 400, result["error"]

        blueprint = result["blueprint"]
        warnings = result.get("warnings", [])
        summary = result.get("summary", {})

        # Transform composed blueprint to instance format
        instance_blueprint = self._to_instance_blueprint(blueprint, request)

        # Build node profile
        node_profile = self._build_node_profile(realm_id, request)

        # Scaffold directory tree and write files
        try:
            self._scaffold_node(node_dir, node_profile, instance_blueprint)
        except Exception as e:
            # Rollback: remove directory if we created it
            if node_dir.exists():
                shutil.rmtree(node_dir, ignore_errors=True)
            return None, 500, f"Failed to create node: {e}"

        # Rebuild realm-id map so new node is immediately discoverable
        self._loader._build_realm_id_map()

        return CreateNodeResponse(
            node_id=request.node_id,
            realm_id=realm_id,
            name=request.name,
            status="active",
            blueprint_summary=summary,
            warnings=warnings,
        ), 201, "ok"

    def _to_instance_blueprint(
        self, composed: dict[str, Any], request: CreateNodeRequest
    ) -> dict[str, Any]:
        """Transform a composed reference blueprint into a node instance blueprint."""
        now = datetime.now(timezone.utc).isoformat()

        # Set all playbook statuses to "pending"
        for section_key in ("all_tracks", request.track):
            section = composed.get("playbooks", {}).get(section_key, {})
            for group in ("required", "optional"):
                for pb in section.get(group, []):
                    pb["status"] = "pending"

        composed["metadata"]["reference_blueprint"] = composed.get("blueprint_id")
        composed["metadata"]["created"] = now
        composed["metadata"]["instance_of"] = "node_blueprint"

        composed["changelog"] = [
            {
                "timestamp": now,
                "action": "blueprint_instantiated",
                "description": f"Blueprint composed from {request.archetype} x {request.domain} x {request.track}",
            }
        ]

        return composed

    def _build_node_profile(
        self, realm_id: str, request: CreateNodeRequest
    ) -> dict[str, Any]:
        """Build node_profile.yaml content."""
        today = date.today().isoformat()
        profile: dict[str, Any] = {
            "node_id": request.node_id,
            "realm_id": realm_id,
            "name": request.name,
            "status": "active",
            "operating_mode": request.operating_mode.value,
            "created": today,
            "blueprint": {
                "archetype": request.archetype,
                "domain": request.domain,
                "track": request.track,
            },
            "last_updated": today,
            "updated_by": "node_service",
        }

        if request.purpose:
            profile["purpose"] = request.purpose
        if request.target_completion:
            profile["target_completion"] = request.target_completion.isoformat()

        # Commercial section (only if any values provided)
        commercial: dict[str, Any] = {}
        if request.opportunity_arr is not None:
            commercial["opportunity_arr"] = request.opportunity_arr
        if request.probability is not None:
            commercial["probability"] = request.probability
        if request.stage:
            commercial["stage"] = request.stage
        if commercial:
            profile["commercial"] = commercial

        return profile

    def _scaffold_node(
        self,
        node_dir: Path,
        node_profile: dict[str, Any],
        blueprint: dict[str, Any],
    ) -> None:
        """Create directory tree and write YAML files."""
        # External infohub
        for sub in EXTERNAL_INFOHUB_DIRS:
            (node_dir / "external-infohub" / sub).mkdir(parents=True, exist_ok=True)

        # Internal infohub
        for sub in INTERNAL_INFOHUB_DIRS:
            (node_dir / "internal-infohub" / sub).mkdir(parents=True, exist_ok=True)

        # Raw vault
        (node_dir / "raw" / "meetings" / "external").mkdir(parents=True, exist_ok=True)
        (node_dir / "raw" / "meetings" / "internal").mkdir(parents=True, exist_ok=True)
        (node_dir / "raw" / "daily-ops").mkdir(parents=True, exist_ok=True)

        # Write node_profile.yaml
        self._write_yaml(
            node_dir / "node_profile.yaml",
            node_profile,
            f"# {node_profile['name']} - Node Profile\n",
        )

        # Write blueprint.yaml
        self._write_yaml(
            node_dir / "blueprint.yaml",
            blueprint,
            f"# {node_profile['name']} - Blueprint Instance\n",
        )

    def _write_yaml(self, path: Path, data: dict, header: str = "") -> None:
        with open(path, "w", encoding="utf-8") as f:
            if header:
                f.write(header)
            yaml.dump(data, f, default_flow_style=False, sort_keys=False, allow_unicode=True)


# Singleton
_node_service: Optional[NodeService] = None


def get_node_service() -> NodeService:
    global _node_service
    if _node_service is None:
        _node_service = NodeService()
    return _node_service
