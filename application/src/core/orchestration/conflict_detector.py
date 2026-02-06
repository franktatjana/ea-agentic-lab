"""
Conflict Detector

Analyzes processes to identify contradictions, overlaps, gaps, and
potential issues before they cause runtime problems.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple


class ConflictSeverity(Enum):
    CRITICAL = "critical"  # System halt potential
    HIGH = "high"          # Contradiction
    MEDIUM = "medium"      # Ambiguity
    LOW = "low"            # Inefficiency
    INFO = "info"          # Gap or suggestion


class ConflictType(Enum):
    TRIGGER_COLLISION = "trigger_collision"
    OUTPUT_CONTRADICTION = "output_contradiction"
    CIRCULAR_DEPENDENCY = "circular_dependency"
    OWNERSHIP_OVERLAP = "ownership_overlap"
    RESOURCE_CONTENTION = "resource_contention"
    GAP_DETECTION = "gap_detection"
    DEADLINE_CONFLICT = "deadline_conflict"
    REDUNDANT_PROCESS = "redundant_process"


@dataclass
class Conflict:
    """Represents a detected conflict"""
    conflict_id: str
    conflict_type: ConflictType
    severity: ConflictSeverity
    processes: List[str]
    description: str
    details: Dict = field(default_factory=dict)
    suggested_resolutions: List[Dict] = field(default_factory=list)
    blocking: bool = False


@dataclass
class ConflictReport:
    """Full conflict analysis report"""
    conflicts: List[Conflict] = field(default_factory=list)
    gaps: List[Dict] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)

    def has_critical(self) -> bool:
        return any(c.severity == ConflictSeverity.CRITICAL for c in self.conflicts)

    def has_high(self) -> bool:
        return any(c.severity == ConflictSeverity.HIGH for c in self.conflicts)

    def has_blocking(self) -> bool:
        return any(c.blocking for c in self.conflicts)

    def to_list(self) -> List[Dict]:
        return [
            {
                "id": c.conflict_id,
                "type": c.conflict_type.value,
                "severity": c.severity.value,
                "processes": c.processes,
                "description": c.description,
                "blocking": c.blocking,
                "resolutions": c.suggested_resolutions
            }
            for c in self.conflicts
        ]

    def summary(self) -> Dict:
        return {
            "total": len(self.conflicts),
            "critical": len([c for c in self.conflicts if c.severity == ConflictSeverity.CRITICAL]),
            "high": len([c for c in self.conflicts if c.severity == ConflictSeverity.HIGH]),
            "medium": len([c for c in self.conflicts if c.severity == ConflictSeverity.MEDIUM]),
            "low": len([c for c in self.conflicts if c.severity == ConflictSeverity.LOW]),
            "info": len([c for c in self.conflicts if c.severity == ConflictSeverity.INFO]),
            "gaps": len(self.gaps),
            "blocking": self.has_blocking()
        }


class ConflictDetector:
    """
    Detects conflicts between processes.

    Checks for:
    - Trigger collisions (same event, conflicting actions)
    - Output contradictions (incompatible outputs)
    - Circular dependencies (A triggers B, B triggers A)
    - Ownership overlaps (multiple owners for same artifact)
    - Resource contention (competing for limited resources)
    - Gaps (unhandled events)
    - Deadline conflicts (impossible timelines)
    - Redundant processes (duplicates)
    """

    # Known events that should have handlers
    KNOWN_EVENTS = [
        "rfp_received",
        "deal_stage_changed",
        "meeting_completed",
        "stakeholder_added",
        "competitor_identified",
        "health_score_changed",
        "contract_signed",
        "churn_risk_detected",
        "partner_referral",
    ]

    def __init__(self, orchestrator: Any = None):
        self.orchestrator = orchestrator
        self.conflict_counter = 0

    def analyze(
        self,
        new_process: Dict,
        existing_processes: List[Dict]
    ) -> ConflictReport:
        """
        Analyze a new process against existing processes.

        Args:
            new_process: The new process definition to check
            existing_processes: List of existing process definitions

        Returns:
            ConflictReport with all detected issues
        """
        report = ConflictReport()

        for existing in existing_processes:
            # Skip comparing to self
            if existing.get("process_id") == new_process.get("process_id"):
                continue

            # Check each conflict type
            self._check_trigger_collision(new_process, existing, report)
            self._check_output_contradiction(new_process, existing, report)
            self._check_ownership_overlap(new_process, existing, report)
            self._check_redundancy(new_process, existing, report)

        # Check for circular dependencies with all processes
        all_processes = existing_processes + [new_process]
        self._check_circular_dependencies(all_processes, report)

        # Check deadline feasibility
        self._check_deadline_feasibility(new_process, report)

        return report

    def full_analysis(self, processes: List[Dict]) -> ConflictReport:
        """
        Perform full conflict analysis on all processes.

        Args:
            processes: All process definitions

        Returns:
            Complete ConflictReport
        """
        report = ConflictReport()

        # Pairwise comparisons
        for i, proc_a in enumerate(processes):
            for proc_b in processes[i+1:]:
                self._check_trigger_collision(proc_a, proc_b, report)
                self._check_output_contradiction(proc_a, proc_b, report)
                self._check_ownership_overlap(proc_a, proc_b, report)
                self._check_redundancy(proc_a, proc_b, report)
                self._check_resource_contention(proc_a, proc_b, report)

        # Graph-based checks
        self._check_circular_dependencies(processes, report)

        # Gap analysis
        self._check_event_coverage(processes, report)

        return report

    def find_gaps(self, processes: List[Dict]) -> List[Dict]:
        """Find unhandled events and missing process coverage"""
        report = ConflictReport()
        self._check_event_coverage(processes, report)
        return report.gaps

    def _generate_conflict_id(self) -> str:
        self.conflict_counter += 1
        return f"CONF_{self.conflict_counter:03d}"

    def _check_trigger_collision(
        self,
        proc_a: Dict,
        proc_b: Dict,
        report: ConflictReport
    ):
        """Check if two processes have conflicting triggers"""
        trigger_a = proc_a.get("trigger", {})
        trigger_b = proc_b.get("trigger", {})

        event_a = trigger_a.get("event")
        event_b = trigger_b.get("event")

        if event_a != event_b:
            return

        # Same event - check if conditions overlap
        conditions_a = trigger_a.get("conditions", [])
        conditions_b = trigger_b.get("conditions", [])

        if self._conditions_overlap(conditions_a, conditions_b):
            # Check if outputs conflict
            outputs_a = self._get_outputs(proc_a)
            outputs_b = self._get_outputs(proc_b)

            if self._outputs_conflict(outputs_a, outputs_b):
                report.conflicts.append(Conflict(
                    conflict_id=self._generate_conflict_id(),
                    conflict_type=ConflictType.TRIGGER_COLLISION,
                    severity=ConflictSeverity.HIGH,
                    processes=[proc_a.get("process_id"), proc_b.get("process_id")],
                    description=f"Both processes fire on '{event_a}' with potentially conflicting outputs",
                    details={
                        "event": event_a,
                        "outputs_a": outputs_a,
                        "outputs_b": outputs_b
                    },
                    suggested_resolutions=[
                        {"option": "prioritize", "description": "Define priority order"},
                        {"option": "merge", "description": "Combine into single process"},
                        {"option": "condition", "description": "Add mutual exclusion conditions"}
                    ]
                ))

    def _check_output_contradiction(
        self,
        proc_a: Dict,
        proc_b: Dict,
        report: ConflictReport
    ):
        """Check if processes produce contradictory outputs"""
        outputs_a = self._get_outputs(proc_a)
        outputs_b = self._get_outputs(proc_b)

        for out_a in outputs_a:
            for out_b in outputs_b:
                if out_a.get("artifact") == out_b.get("artifact"):
                    # Same artifact - check for value contradiction
                    if self._values_contradict(out_a, out_b):
                        report.conflicts.append(Conflict(
                            conflict_id=self._generate_conflict_id(),
                            conflict_type=ConflictType.OUTPUT_CONTRADICTION,
                            severity=ConflictSeverity.HIGH,
                            processes=[proc_a.get("process_id"), proc_b.get("process_id")],
                            description=f"Both processes write to '{out_a.get('artifact')}' with conflicting values",
                            details={
                                "artifact": out_a.get("artifact"),
                                "value_a": out_a.get("value"),
                                "value_b": out_b.get("value")
                            },
                            suggested_resolutions=[
                                {"option": "sequence", "description": "Define execution order"},
                                {"option": "separate", "description": "Use different output artifacts"},
                                {"option": "merge", "description": "Combine output logic"}
                            ]
                        ))

    def _check_ownership_overlap(
        self,
        proc_a: Dict,
        proc_b: Dict,
        report: ConflictReport
    ):
        """Check for ownership conflicts"""
        owner_a = proc_a.get("ownership", {}).get("primary_owner", {}).get("agent")
        owner_b = proc_b.get("ownership", {}).get("primary_owner", {}).get("agent")

        if owner_a == owner_b:
            return  # Same owner is fine

        # Different owners - check if they produce same primary output
        primary_a = proc_a.get("outputs", {}).get("primary", {}).get("artifact")
        primary_b = proc_b.get("outputs", {}).get("primary", {}).get("artifact")

        if primary_a and primary_a == primary_b:
            report.conflicts.append(Conflict(
                conflict_id=self._generate_conflict_id(),
                conflict_type=ConflictType.OWNERSHIP_OVERLAP,
                severity=ConflictSeverity.MEDIUM,
                processes=[proc_a.get("process_id"), proc_b.get("process_id")],
                description=f"Different owners ({owner_a}, {owner_b}) for same output '{primary_a}'",
                details={
                    "artifact": primary_a,
                    "owner_a": owner_a,
                    "owner_b": owner_b
                },
                suggested_resolutions=[
                    {"option": "single_owner", "description": "Assign to one agent"},
                    {"option": "split", "description": "Different aspects to different owners"},
                    {"option": "collaborate", "description": "One owns, other contributes"}
                ]
            ))

    def _check_circular_dependencies(
        self,
        processes: List[Dict],
        report: ConflictReport
    ):
        """Check for circular dependency chains"""
        # Build dependency graph
        graph = {}
        for proc in processes:
            proc_id = proc.get("process_id")
            graph[proc_id] = []

            # Add triggered processes
            triggers = proc.get("outputs", {}).get("triggers", [])
            if proc.get("relationships"):
                triggers.extend(proc.get("relationships", {}).get("triggers", []))

            for trigger in triggers:
                if isinstance(trigger, dict):
                    target = trigger.get("process")
                else:
                    target = trigger
                if target:
                    graph[proc_id].append(target)

        # Detect cycles using DFS
        cycles = self._find_cycles(graph)

        for cycle in cycles:
            report.conflicts.append(Conflict(
                conflict_id=self._generate_conflict_id(),
                conflict_type=ConflictType.CIRCULAR_DEPENDENCY,
                severity=ConflictSeverity.CRITICAL,
                processes=cycle,
                description=f"Circular dependency: {' -> '.join(cycle)}",
                blocking=True,
                suggested_resolutions=[
                    {"option": "termination", "description": "Add termination condition"},
                    {"option": "merge", "description": "Combine circular processes"},
                    {"option": "break", "description": "Remove one trigger link"}
                ]
            ))

    def _check_resource_contention(
        self,
        proc_a: Dict,
        proc_b: Dict,
        report: ConflictReport
    ):
        """Check for resource contention"""
        # Extract resource requirements from steps
        resources_a = self._extract_resources(proc_a)
        resources_b = self._extract_resources(proc_b)

        # Check for overlapping limited resources
        for res_a in resources_a:
            for res_b in resources_b:
                if res_a.get("type") == res_b.get("type") and res_a.get("id") == res_b.get("id"):
                    report.conflicts.append(Conflict(
                        conflict_id=self._generate_conflict_id(),
                        conflict_type=ConflictType.RESOURCE_CONTENTION,
                        severity=ConflictSeverity.MEDIUM,
                        processes=[proc_a.get("process_id"), proc_b.get("process_id")],
                        description=f"Both processes require resource: {res_a.get('id')}",
                        suggested_resolutions=[
                            {"option": "queue", "description": "First come, first served"},
                            {"option": "priority", "description": "Higher priority wins"}
                        ]
                    ))

    def _check_event_coverage(
        self,
        processes: List[Dict],
        report: ConflictReport
    ):
        """Check for unhandled events"""
        handled_events = set()

        for proc in processes:
            event = proc.get("trigger", {}).get("event")
            if event:
                handled_events.add(event)

        for known_event in self.KNOWN_EVENTS:
            if known_event not in handled_events:
                report.gaps.append({
                    "event": known_event,
                    "description": f"No process handles '{known_event}'",
                    "suggested_action": f"Create process for {known_event}"
                })

    def _check_deadline_feasibility(
        self,
        process: Dict,
        report: ConflictReport
    ):
        """Check if process deadlines are achievable"""
        constraints = process.get("constraints", {})
        total_deadline = constraints.get("deadline", {}).get("duration")

        if not total_deadline:
            return

        # Sum step deadlines
        steps = process.get("steps", [])
        step_durations = []

        for step in steps:
            step_deadline = step.get("deadline", {}).get("duration")
            if step_deadline:
                step_durations.append(self._parse_duration(step_deadline))

        total_duration = self._parse_duration(total_deadline)
        sum_steps = sum(step_durations)

        if sum_steps > total_duration:
            report.conflicts.append(Conflict(
                conflict_id=self._generate_conflict_id(),
                conflict_type=ConflictType.DEADLINE_CONFLICT,
                severity=ConflictSeverity.LOW,
                processes=[process.get("process_id")],
                description=f"Step deadlines ({sum_steps}h) exceed process deadline ({total_duration}h)",
                suggested_resolutions=[
                    {"option": "parallel", "description": "Run steps in parallel"},
                    {"option": "extend", "description": "Extend process deadline"}
                ]
            ))

    def _check_redundancy(
        self,
        proc_a: Dict,
        proc_b: Dict,
        report: ConflictReport
    ):
        """Check for redundant/duplicate processes"""
        similarity = self._calculate_similarity(proc_a, proc_b)

        if similarity > 0.8:
            report.conflicts.append(Conflict(
                conflict_id=self._generate_conflict_id(),
                conflict_type=ConflictType.REDUNDANT_PROCESS,
                severity=ConflictSeverity.LOW,
                processes=[proc_a.get("process_id"), proc_b.get("process_id")],
                description=f"Processes are {int(similarity*100)}% similar",
                details={"similarity": similarity},
                suggested_resolutions=[
                    {"option": "merge", "description": "Combine into one process"},
                    {"option": "differentiate", "description": "Make purposes distinct"}
                ]
            ))

    # Helper methods

    def _conditions_overlap(self, cond_a: List, cond_b: List) -> bool:
        """Check if conditions overlap (both could be true)"""
        if not cond_a or not cond_b:
            return True  # No conditions means always triggers

        # Simplified: if any condition matches, consider overlapping
        for a in cond_a:
            for b in cond_b:
                if a.get("field") == b.get("field"):
                    return True
        return False

    def _get_outputs(self, process: Dict) -> List[Dict]:
        """Extract all outputs from a process"""
        outputs = []

        # Primary output
        primary = process.get("outputs", {}).get("primary")
        if primary:
            outputs.append(primary)

        # Step outputs
        for step in process.get("steps", []):
            step_outputs = step.get("outputs", [])
            outputs.extend(step_outputs)

        return outputs

    def _outputs_conflict(self, outputs_a: List, outputs_b: List) -> bool:
        """Check if two output sets could conflict"""
        artifacts_a = {o.get("artifact") for o in outputs_a}
        artifacts_b = {o.get("artifact") for o in outputs_b}
        return bool(artifacts_a & artifacts_b)

    def _values_contradict(self, out_a: Dict, out_b: Dict) -> bool:
        """Check if two outputs have contradictory values"""
        val_a = out_a.get("value")
        val_b = out_b.get("value")

        if val_a is None or val_b is None:
            return False  # Can't determine

        # Boolean contradiction
        if isinstance(val_a, bool) and isinstance(val_b, bool):
            return val_a != val_b

        # Status contradiction
        contradictions = [
            ({"approved", "proceed"}, {"rejected", "blocked", "stopped"}),
            ({"active", "open"}, {"closed", "archived"}),
        ]

        for set_a, set_b in contradictions:
            if val_a in set_a and val_b in set_b:
                return True
            if val_a in set_b and val_b in set_a:
                return True

        return False

    def _find_cycles(self, graph: Dict[str, List[str]]) -> List[List[str]]:
        """Find all cycles in dependency graph"""
        cycles = []
        visited = set()
        stack = set()

        def dfs(node: str, path: List[str]):
            if node in stack:
                # Found cycle
                cycle_start = path.index(node)
                cycles.append(path[cycle_start:] + [node])
                return

            if node in visited:
                return

            visited.add(node)
            stack.add(node)
            path.append(node)

            for neighbor in graph.get(node, []):
                if neighbor in graph:  # Only visit known nodes
                    dfs(neighbor, path.copy())

            stack.remove(node)

        for node in graph:
            if node not in visited:
                dfs(node, [])

        return cycles

    def _extract_resources(self, process: Dict) -> List[Dict]:
        """Extract resource requirements from process"""
        resources = []

        for step in process.get("steps", []):
            action = step.get("action", "")
            params = step.get("params", {})

            if "schedule" in action:
                resources.append({
                    "type": "meeting_slot",
                    "id": params.get("time") or params.get("slot")
                })

        return resources

    def _parse_duration(self, duration_str: str) -> float:
        """Parse duration string to hours"""
        if not duration_str:
            return 0

        import re
        match = re.search(r"(\d+)\s*(day|hour|week|minute)s?", duration_str.lower())
        if match:
            value = int(match.group(1))
            unit = match.group(2)

            if unit == "minute":
                return value / 60
            elif unit == "hour":
                return value
            elif unit == "day":
                return value * 8  # 8 working hours
            elif unit == "week":
                return value * 40

        return 0

    def _calculate_similarity(self, proc_a: Dict, proc_b: Dict) -> float:
        """Calculate similarity score between two processes (0-1)"""
        scores = []

        # Trigger similarity
        if proc_a.get("trigger", {}).get("event") == proc_b.get("trigger", {}).get("event"):
            scores.append(1.0)
        else:
            scores.append(0.0)

        # Owner similarity
        owner_a = proc_a.get("ownership", {}).get("primary_owner", {}).get("agent")
        owner_b = proc_b.get("ownership", {}).get("primary_owner", {}).get("agent")
        if owner_a == owner_b:
            scores.append(1.0)
        else:
            scores.append(0.0)

        # Output similarity
        outputs_a = {o.get("artifact") for o in self._get_outputs(proc_a)}
        outputs_b = {o.get("artifact") for o in self._get_outputs(proc_b)}
        if outputs_a and outputs_b:
            intersection = len(outputs_a & outputs_b)
            union = len(outputs_a | outputs_b)
            scores.append(intersection / union if union > 0 else 0)
        else:
            scores.append(0.5)

        return sum(scores) / len(scores) if scores else 0
