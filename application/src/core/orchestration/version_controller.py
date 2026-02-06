"""
Version Controller

Manages versioning, snapshots, and rollback for processes, agents, and playbooks.
Maintains full history with diff tracking.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import shutil
import yaml


class ChangeType(Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    ROLLBACK = "rollback"


@dataclass
class VersionRecord:
    """Record of a version change"""
    entity_type: str  # process, agent, playbook
    entity_id: str
    version: int
    previous_version: Optional[int]
    change_type: ChangeType
    changed_by: str
    changed_at: str
    change_description: str
    snapshot: Dict
    diff: Optional[Dict] = None


class VersionController:
    """
    Manages versioning for all orchestration entities.

    Features:
    - Full version history
    - Snapshot storage for rollback
    - Diff tracking between versions
    - Audit-ready change logging
    """

    def __init__(self, registry_path: Path):
        """
        Initialize the Version Controller.

        Args:
            registry_path: Path to process registry
        """
        self.registry_path = registry_path
        self.versions_path = registry_path / "versions"
        self.versions_path.mkdir(parents=True, exist_ok=True)

    def save_process(
        self,
        process_def: Dict,
        actor: str,
        description: str = ""
    ) -> int:
        """
        Save a process with version tracking.

        Args:
            process_def: Process definition to save
            actor: Who is making the change
            description: Description of the change

        Returns:
            New version number
        """
        process_id = process_def.get("process_id")
        if not process_id:
            raise ValueError("Process must have process_id")

        # Get current version
        current_version = self._get_current_version("process", process_id)
        new_version = current_version + 1

        # Determine change type
        if current_version == 0:
            change_type = ChangeType.CREATE
            previous_snapshot = None
        else:
            change_type = ChangeType.UPDATE
            previous_snapshot = self._load_version("process", process_id, current_version)

        # Calculate diff
        diff = self._calculate_diff(previous_snapshot, process_def) if previous_snapshot else None

        # Update process metadata
        process_def["version"] = new_version
        process_def["updated_at"] = datetime.utcnow().isoformat() + "Z"
        process_def["updated_by"] = actor

        # Create version record
        record = VersionRecord(
            entity_type="process",
            entity_id=process_id,
            version=new_version,
            previous_version=current_version if current_version > 0 else None,
            change_type=change_type,
            changed_by=actor,
            changed_at=datetime.utcnow().isoformat() + "Z",
            change_description=description or f"Version {new_version}",
            snapshot=process_def,
            diff=diff
        )

        # Save version snapshot
        self._save_version_record(record)

        # Save current process file
        self._save_current("process", process_id, process_def)

        return new_version

    def rollback(
        self,
        entity_type: str,
        entity_id: str,
        target_version: int,
        actor: str = "orchestration_agent"
    ) -> bool:
        """
        Rollback an entity to a previous version.

        Args:
            entity_type: Type of entity (process, agent, playbook)
            entity_id: ID of the entity
            target_version: Version to rollback to
            actor: Who is performing the rollback

        Returns:
            True if successful
        """
        # Load target version
        target_snapshot = self._load_version(entity_type, entity_id, target_version)
        if not target_snapshot:
            return False

        # Get current version
        current_version = self._get_current_version(entity_type, entity_id)
        new_version = current_version + 1

        # Create rollback record
        record = VersionRecord(
            entity_type=entity_type,
            entity_id=entity_id,
            version=new_version,
            previous_version=current_version,
            change_type=ChangeType.ROLLBACK,
            changed_by=actor,
            changed_at=datetime.utcnow().isoformat() + "Z",
            change_description=f"Rollback to version {target_version}",
            snapshot=target_snapshot,
            diff={"rollback_from": current_version, "rollback_to": target_version}
        )

        # Update metadata in snapshot
        target_snapshot["version"] = new_version
        target_snapshot["updated_at"] = datetime.utcnow().isoformat() + "Z"
        target_snapshot["updated_by"] = actor
        target_snapshot["_rollback_from"] = current_version
        target_snapshot["_rollback_to"] = target_version

        # Save version record
        self._save_version_record(record)

        # Save as current
        self._save_current(entity_type, entity_id, target_snapshot)

        return True

    def get_history(
        self,
        entity_type: str,
        entity_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get version history for an entity.

        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            limit: Maximum versions to return

        Returns:
            List of version records (most recent first)
        """
        history = []
        version_dir = self.versions_path / entity_type / entity_id

        if not version_dir.exists():
            return history

        # Get all version files
        version_files = sorted(version_dir.glob("v*.yaml"), reverse=True)

        for vf in version_files[:limit]:
            try:
                with open(vf, 'r') as f:
                    record = yaml.safe_load(f)
                    history.append({
                        "version": record.get("version"),
                        "changed_by": record.get("changed_by"),
                        "changed_at": record.get("changed_at"),
                        "change_type": record.get("change_type"),
                        "description": record.get("change_description")
                    })
            except Exception:
                continue

        return history

    def get_diff(
        self,
        entity_type: str,
        entity_id: str,
        from_version: int,
        to_version: int
    ) -> Dict:
        """
        Get diff between two versions.

        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            from_version: Starting version
            to_version: Ending version

        Returns:
            Diff dictionary
        """
        from_snapshot = self._load_version(entity_type, entity_id, from_version)
        to_snapshot = self._load_version(entity_type, entity_id, to_version)

        if not from_snapshot or not to_snapshot:
            return {"error": "Version not found"}

        return self._calculate_diff(from_snapshot, to_snapshot)

    def _get_current_version(self, entity_type: str, entity_id: str) -> int:
        """Get current version number for an entity"""
        version_dir = self.versions_path / entity_type / entity_id

        if not version_dir.exists():
            return 0

        version_files = list(version_dir.glob("v*.yaml"))
        if not version_files:
            return 0

        # Extract version numbers and find max
        versions = []
        for vf in version_files:
            try:
                v = int(vf.stem.replace("v", ""))
                versions.append(v)
            except ValueError:
                continue

        return max(versions) if versions else 0

    def _load_version(
        self,
        entity_type: str,
        entity_id: str,
        version: int
    ) -> Optional[Dict]:
        """Load a specific version snapshot"""
        version_file = self.versions_path / entity_type / entity_id / f"v{version}.yaml"

        if not version_file.exists():
            return None

        with open(version_file, 'r') as f:
            record = yaml.safe_load(f)
            return record.get("snapshot")

    def _save_version_record(self, record: VersionRecord):
        """Save a version record"""
        version_dir = self.versions_path / record.entity_type / record.entity_id
        version_dir.mkdir(parents=True, exist_ok=True)

        version_file = version_dir / f"v{record.version}.yaml"

        record_dict = {
            "entity_type": record.entity_type,
            "entity_id": record.entity_id,
            "version": record.version,
            "previous_version": record.previous_version,
            "change_type": record.change_type.value,
            "changed_by": record.changed_by,
            "changed_at": record.changed_at,
            "change_description": record.change_description,
            "snapshot": record.snapshot,
            "diff": record.diff
        }

        with open(version_file, 'w') as f:
            yaml.dump(record_dict, f, default_flow_style=False, sort_keys=False)

    def _save_current(self, entity_type: str, entity_id: str, data: Dict):
        """Save as current version in main location"""
        if entity_type == "process":
            current_dir = self.registry_path / "processes"
        elif entity_type == "agent":
            current_dir = self.registry_path.parent / "teams"
        elif entity_type == "playbook":
            current_dir = self.registry_path.parent / "playbooks" / "executable"
        else:
            current_dir = self.registry_path / entity_type

        current_dir.mkdir(parents=True, exist_ok=True)
        current_file = current_dir / f"{entity_id}.yaml"

        with open(current_file, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)

    def _calculate_diff(self, old: Dict, new: Dict) -> Dict:
        """Calculate diff between two snapshots"""
        diff = {
            "added": {},
            "removed": {},
            "modified": {}
        }

        if not old:
            diff["added"] = new
            return diff

        if not new:
            diff["removed"] = old
            return diff

        all_keys = set(old.keys()) | set(new.keys())

        for key in all_keys:
            if key.startswith("_"):  # Skip internal fields
                continue

            old_val = old.get(key)
            new_val = new.get(key)

            if key not in old:
                diff["added"][key] = new_val
            elif key not in new:
                diff["removed"][key] = old_val
            elif old_val != new_val:
                diff["modified"][key] = {
                    "old": old_val,
                    "new": new_val
                }

        return diff

    def export_history(
        self,
        entity_type: str,
        entity_id: str,
        output_path: Path
    ):
        """Export full version history to a file"""
        history = []
        version_dir = self.versions_path / entity_type / entity_id

        if version_dir.exists():
            for vf in sorted(version_dir.glob("v*.yaml")):
                with open(vf, 'r') as f:
                    history.append(yaml.safe_load(f))

        with open(output_path, 'w') as f:
            yaml.dump({"history": history}, f, default_flow_style=False)

    def cleanup_old_versions(
        self,
        entity_type: str,
        entity_id: str,
        keep_versions: int = 10
    ):
        """Remove old versions, keeping only the most recent"""
        version_dir = self.versions_path / entity_type / entity_id

        if not version_dir.exists():
            return

        version_files = sorted(version_dir.glob("v*.yaml"))

        if len(version_files) <= keep_versions:
            return

        # Remove oldest versions
        for vf in version_files[:-keep_versions]:
            vf.unlink()
