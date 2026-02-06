"""
Orchestration Agent

The meta-layer that manages the agent ecosystem. Transforms human-described
processes into agents and playbooks while ensuring system consistency.

Usage:
    orchestrator = OrchestrationAgent()
    result = orchestrator.process_input(
        "When we receive an RFP, the SA should analyze it within 5 days"
    )
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml

from .process_parser import ProcessParser
from .conflict_detector import ConflictDetector
from .agent_factory import AgentFactory
from .playbook_generator import PlaybookGenerator
from .version_controller import VersionController
from .audit_logger import AuditLogger


class ProcessStatus(Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


@dataclass
class ProcessResult:
    """Result of processing a human input"""
    success: bool
    process_id: Optional[str] = None
    process_definition: Optional[Dict] = None
    conflicts: List[Dict] = field(default_factory=list)
    gaps: List[Dict] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    agents_created: List[str] = field(default_factory=list)
    playbooks_created: List[str] = field(default_factory=list)
    requires_human_decision: bool = False
    blocking_conflicts: bool = False
    message: str = ""


class OrchestrationAgent:
    """
    Main orchestration agent that coordinates all meta-level operations.

    Responsibilities:
    - Accept free-form process descriptions from humans
    - Parse into normalized process definitions
    - Detect conflicts with existing processes
    - Generate agents and playbooks
    - Manage versions and audit trail
    """

    def __init__(self, registry_path: Optional[Path] = None):
        """
        Initialize the Orchestration Agent.

        Args:
            registry_path: Path to process registry. Defaults to project root.
        """
        if registry_path is None:
            registry_path = Path(__file__).parent.parent.parent / "process_registry"

        self.registry_path = registry_path
        self.parser = ProcessParser()
        self.conflict_detector = ConflictDetector(self)
        self.agent_factory = AgentFactory()
        self.playbook_generator = PlaybookGenerator()
        self.version_controller = VersionController(registry_path)
        self.audit_logger = AuditLogger(registry_path / "audit")

    def process_input(
        self,
        human_input: str,
        input_format: str = "auto",
        actor: str = "human:ceo"
    ) -> ProcessResult:
        """
        Process a human-provided process description.

        Args:
            human_input: Free-form process description (text, YAML, etc.)
            input_format: Format hint ("auto", "text", "yaml", "table")
            actor: Who is making this request

        Returns:
            ProcessResult with outcome and any conflicts/suggestions
        """
        # Log the incoming request
        self.audit_logger.log_event(
            event_type="process_input_received",
            actor=actor,
            details={"input_preview": human_input[:200], "format": input_format}
        )

        # Step 1: Parse input to normalized process
        try:
            process_def = self.parser.parse(human_input, input_format)
        except Exception as e:
            return ProcessResult(
                success=False,
                message=f"Failed to parse input: {str(e)}",
                suggestions=["Try rephrasing the process description",
                            "Ensure trigger event is clear",
                            "Specify who owns the process"]
            )

        # Step 2: Check for conflicts
        existing_processes = self.get_all_processes()
        conflict_report = self.conflict_detector.analyze(process_def, existing_processes)

        # Step 3: Check for blocking conflicts
        if conflict_report.has_critical():
            return ProcessResult(
                success=False,
                process_definition=process_def,
                conflicts=conflict_report.to_list(),
                blocking_conflicts=True,
                requires_human_decision=True,
                message="Critical conflicts detected. Must resolve before proceeding."
            )

        # Step 4: If high-severity conflicts, require human decision
        if conflict_report.has_high():
            return ProcessResult(
                success=True,  # Parsed successfully
                process_id=process_def.get("process_id"),
                process_definition=process_def,
                conflicts=conflict_report.to_list(),
                requires_human_decision=True,
                message="Conflicts detected. Human decision required."
            )

        # Step 5: Create process (no blocking conflicts)
        return self._create_process(process_def, actor, conflict_report)

    def _create_process(
        self,
        process_def: Dict,
        actor: str,
        conflict_report: Any
    ) -> ProcessResult:
        """Create the process, agents, and playbooks"""

        process_id = process_def.get("process_id")
        agents_created = []
        playbooks_created = []

        # Check if new agents are needed
        for step in process_def.get("steps", []):
            owner = step.get("owner")
            if not self.agent_factory.agent_exists(owner):
                new_agent = self.agent_factory.create_agent(owner, process_def)
                agents_created.append(new_agent)

        # Generate playbooks for the process
        playbooks = self.playbook_generator.generate(process_def)
        playbooks_created.extend(playbooks)

        # Save process to registry
        self.version_controller.save_process(process_def, actor)

        # Log creation
        self.audit_logger.log_event(
            event_type="process_created",
            actor=actor,
            entity=process_id,
            details={
                "agents_created": agents_created,
                "playbooks_created": playbooks_created
            }
        )

        return ProcessResult(
            success=True,
            process_id=process_id,
            process_definition=process_def,
            conflicts=conflict_report.to_list() if conflict_report else [],
            gaps=conflict_report.gaps if conflict_report else [],
            agents_created=agents_created,
            playbooks_created=playbooks_created,
            message=f"Process {process_id} created successfully."
        )

    def resolve_conflict(
        self,
        conflict_id: str,
        resolution: str,
        actor: str = "human:ceo"
    ) -> ProcessResult:
        """
        Apply human decision to resolve a conflict.

        Args:
            conflict_id: ID of the conflict to resolve
            resolution: Chosen resolution option
            actor: Who is making the decision
        """
        # Log the resolution
        self.audit_logger.log_event(
            event_type="conflict_resolved",
            actor=actor,
            entity=conflict_id,
            details={"resolution": resolution}
        )

        # Apply the resolution
        # (Implementation depends on resolution type)

        return ProcessResult(
            success=True,
            message=f"Conflict {conflict_id} resolved with: {resolution}"
        )

    def get_all_processes(self, status: Optional[ProcessStatus] = None) -> List[Dict]:
        """Get all processes from registry, optionally filtered by status"""
        processes = []
        process_dir = self.registry_path / "processes"

        if not process_dir.exists():
            return processes

        for yaml_file in process_dir.glob("*.yaml"):
            try:
                with open(yaml_file, 'r') as f:
                    proc = yaml.safe_load(f)
                    if status is None or proc.get("status") == status.value:
                        processes.append(proc)
            except Exception:
                continue

        return processes

    def get_process(self, process_id: str) -> Optional[Dict]:
        """Get a specific process by ID"""
        process_file = self.registry_path / "processes" / f"{process_id}.yaml"
        if process_file.exists():
            with open(process_file, 'r') as f:
                return yaml.safe_load(f)
        return None

    def rollback_process(
        self,
        process_id: str,
        version: int,
        actor: str = "human:ceo"
    ) -> ProcessResult:
        """Rollback a process to a previous version"""
        result = self.version_controller.rollback(process_id, version)

        self.audit_logger.log_event(
            event_type="process_rollback",
            actor=actor,
            entity=process_id,
            details={"rolled_back_to_version": version}
        )

        return ProcessResult(
            success=result,
            process_id=process_id,
            message=f"Process {process_id} rolled back to version {version}"
        )

    def generate_conflict_report(self) -> Dict:
        """Generate a full conflict report for all processes"""
        processes = self.get_all_processes(ProcessStatus.ACTIVE)
        return self.conflict_detector.full_analysis(processes)

    def suggest_gaps(self) -> List[Dict]:
        """Identify gaps in process coverage"""
        processes = self.get_all_processes(ProcessStatus.ACTIVE)
        return self.conflict_detector.find_gaps(processes)
