"""
Audit Logger

Immutable audit trail for all orchestration activities.
Logs events in append-only JSONL format for compliance and debugging.
"""

from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import hashlib


@dataclass
class AuditEvent:
    """Represents an audit event"""
    timestamp: str
    event_type: str
    actor: str
    entity: Optional[str]
    entity_type: Optional[str]
    details: Dict
    conflicts_detected: List[Dict]
    resolution: Optional[str]
    checksum: str = ""

    def __post_init__(self):
        if not self.checksum:
            self.checksum = self._compute_checksum()

    def _compute_checksum(self) -> str:
        """Compute checksum for integrity verification"""
        data = f"{self.timestamp}|{self.event_type}|{self.actor}|{self.entity}|{json.dumps(self.details, sort_keys=True)}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]


class AuditLogger:
    """
    Immutable audit trail for orchestration events.

    Features:
    - Append-only logging (JSONL format)
    - Integrity checksums
    - Daily log rotation
    - Query capabilities
    - Export for compliance
    """

    # Event types
    EVENT_TYPES = {
        "process_input_received": "Human provided process description",
        "process_created": "New process created",
        "process_updated": "Process modified",
        "process_deleted": "Process removed",
        "process_rollback": "Process rolled back to previous version",
        "conflict_detected": "Conflict identified between processes",
        "conflict_resolved": "Conflict resolution applied",
        "agent_created": "New agent created",
        "agent_modified": "Agent configuration changed",
        "playbook_generated": "Playbook auto-generated",
        "playbook_validated": "Playbook passed validation",
        "human_decision_requested": "Escalated to human for decision",
        "human_decision_received": "Human provided decision",
        "gap_detected": "Gap in process coverage identified",
        "suggestion_generated": "System generated improvement suggestion",
    }

    def __init__(self, audit_path: Path):
        """
        Initialize the Audit Logger.

        Args:
            audit_path: Path to audit log directory
        """
        self.audit_path = audit_path
        self.audit_path.mkdir(parents=True, exist_ok=True)

    def log_event(
        self,
        event_type: str,
        actor: str,
        entity: Optional[str] = None,
        entity_type: Optional[str] = None,
        details: Optional[Dict] = None,
        conflicts: Optional[List[Dict]] = None,
        resolution: Optional[str] = None
    ) -> str:
        """
        Log an audit event.

        Args:
            event_type: Type of event (from EVENT_TYPES)
            actor: Who performed the action (human:username or agent_name)
            entity: ID of affected entity (process_id, agent_id, etc.)
            entity_type: Type of entity (process, agent, playbook)
            details: Additional event details
            conflicts: Any conflicts detected
            resolution: Resolution if applicable

        Returns:
            Event ID (timestamp-based)
        """
        timestamp = datetime.utcnow().isoformat() + "Z"

        event = AuditEvent(
            timestamp=timestamp,
            event_type=event_type,
            actor=actor,
            entity=entity,
            entity_type=entity_type,
            details=details or {},
            conflicts_detected=conflicts or [],
            resolution=resolution
        )

        # Get today's log file
        log_file = self._get_log_file()

        # Append to log (JSONL format)
        with open(log_file, 'a') as f:
            f.write(json.dumps(asdict(event)) + "\n")

        return f"{timestamp}#{event.checksum}"

    def query_events(
        self,
        event_type: Optional[str] = None,
        actor: Optional[str] = None,
        entity: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """
        Query audit events with filters.

        Args:
            event_type: Filter by event type
            actor: Filter by actor
            entity: Filter by entity ID
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            limit: Maximum results

        Returns:
            List of matching events
        """
        results = []

        # Determine which log files to search
        log_files = self._get_log_files_in_range(start_date, end_date)

        for log_file in log_files:
            if not log_file.exists():
                continue

            with open(log_file, 'r') as f:
                for line in f:
                    try:
                        event = json.loads(line.strip())

                        # Apply filters
                        if event_type and event.get("event_type") != event_type:
                            continue
                        if actor and event.get("actor") != actor:
                            continue
                        if entity and event.get("entity") != entity:
                            continue

                        results.append(event)

                        if len(results) >= limit:
                            return results

                    except json.JSONDecodeError:
                        continue

        return results

    def get_entity_history(
        self,
        entity: str,
        entity_type: Optional[str] = None
    ) -> List[Dict]:
        """
        Get complete audit history for an entity.

        Args:
            entity: Entity ID
            entity_type: Optional entity type filter

        Returns:
            List of events affecting this entity
        """
        return self.query_events(entity=entity, limit=1000)

    def get_actor_activity(
        self,
        actor: str,
        days: int = 7
    ) -> List[Dict]:
        """
        Get recent activity for an actor.

        Args:
            actor: Actor identifier
            days: Number of days to look back

        Returns:
            List of events by this actor
        """
        from datetime import timedelta

        start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
        return self.query_events(actor=actor, start_date=start_date)

    def get_conflicts_report(
        self,
        days: int = 30
    ) -> Dict:
        """
        Generate conflict report from audit logs.

        Args:
            days: Number of days to analyze

        Returns:
            Conflict summary report
        """
        from datetime import timedelta

        start_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")

        conflict_events = self.query_events(
            event_type="conflict_detected",
            start_date=start_date,
            limit=1000
        )

        resolution_events = self.query_events(
            event_type="conflict_resolved",
            start_date=start_date,
            limit=1000
        )

        # Build report
        report = {
            "period": f"Last {days} days",
            "total_conflicts": len(conflict_events),
            "resolved_conflicts": len(resolution_events),
            "pending_conflicts": len(conflict_events) - len(resolution_events),
            "by_severity": {},
            "by_type": {},
            "resolution_time_avg": None,
            "details": conflict_events[:10]  # Include recent details
        }

        # Aggregate by severity and type
        for event in conflict_events:
            for conflict in event.get("conflicts_detected", []):
                severity = conflict.get("severity", "unknown")
                ctype = conflict.get("type", "unknown")

                report["by_severity"][severity] = report["by_severity"].get(severity, 0) + 1
                report["by_type"][ctype] = report["by_type"].get(ctype, 0) + 1

        return report

    def verify_integrity(self, log_file: Optional[Path] = None) -> Dict:
        """
        Verify integrity of audit log.

        Args:
            log_file: Specific file to verify (or today's log)

        Returns:
            Verification results
        """
        if log_file is None:
            log_file = self._get_log_file()

        results = {
            "file": str(log_file),
            "total_events": 0,
            "valid_events": 0,
            "invalid_events": 0,
            "errors": []
        }

        if not log_file.exists():
            results["errors"].append("Log file not found")
            return results

        with open(log_file, 'r') as f:
            for i, line in enumerate(f, 1):
                results["total_events"] += 1
                try:
                    event = json.loads(line.strip())

                    # Verify checksum
                    stored_checksum = event.get("checksum", "")
                    audit_event = AuditEvent(
                        timestamp=event.get("timestamp", ""),
                        event_type=event.get("event_type", ""),
                        actor=event.get("actor", ""),
                        entity=event.get("entity"),
                        entity_type=event.get("entity_type"),
                        details=event.get("details", {}),
                        conflicts_detected=event.get("conflicts_detected", []),
                        resolution=event.get("resolution")
                    )

                    if audit_event.checksum == stored_checksum:
                        results["valid_events"] += 1
                    else:
                        results["invalid_events"] += 1
                        results["errors"].append(f"Line {i}: Checksum mismatch")

                except json.JSONDecodeError as e:
                    results["invalid_events"] += 1
                    results["errors"].append(f"Line {i}: JSON parse error - {str(e)}")

        return results

    def export_for_compliance(
        self,
        output_path: Path,
        start_date: str,
        end_date: str
    ):
        """
        Export audit logs for compliance/review.

        Args:
            output_path: Where to write export
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
        """
        events = self.query_events(
            start_date=start_date,
            end_date=end_date,
            limit=10000
        )

        export = {
            "export_timestamp": datetime.utcnow().isoformat() + "Z",
            "period": {"start": start_date, "end": end_date},
            "total_events": len(events),
            "events": events
        }

        with open(output_path, 'w') as f:
            json.dump(export, f, indent=2)

    def _get_log_file(self, date: Optional[str] = None) -> Path:
        """Get log file path for a date"""
        if date is None:
            date = datetime.utcnow().strftime("%Y-%m-%d")
        return self.audit_path / f"{date}.jsonl"

    def _get_log_files_in_range(
        self,
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> List[Path]:
        """Get all log files in date range"""
        if start_date is None and end_date is None:
            # Return all log files
            return sorted(self.audit_path.glob("*.jsonl"), reverse=True)

        # Parse dates and get files in range
        files = []
        for log_file in self.audit_path.glob("*.jsonl"):
            file_date = log_file.stem  # YYYY-MM-DD

            if start_date and file_date < start_date:
                continue
            if end_date and file_date > end_date:
                continue

            files.append(log_file)

        return sorted(files, reverse=True)


# Convenience function for quick logging
def log_orchestration_event(
    event_type: str,
    actor: str,
    **kwargs
) -> str:
    """Quick logging function using default audit path"""
    default_path = Path(__file__).parent.parent.parent / "process_registry" / "audit"
    logger = AuditLogger(default_path)
    return logger.log_event(event_type, actor, **kwargs)
