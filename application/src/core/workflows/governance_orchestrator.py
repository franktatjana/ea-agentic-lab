"""
Governance Orchestrator - Cross-functional workflow coordination

Orchestrates multi-agent governance workflows ensuring:
- Sequential dependencies are respected
- Parallel execution where independent
- Human escalation at decision points
- Audit trail for compliance
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from pathlib import Path
import json


class WorkflowStatus(Enum):
    """Workflow execution states."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    AWAITING_HUMAN = "awaiting_human"
    COMPLETED = "completed"
    FAILED = "failed"
    ESCALATED = "escalated"


class StepType(Enum):
    """Types of workflow steps."""
    AGENT_TASK = "agent_task"
    PLAYBOOK_EXECUTION = "playbook_execution"
    HUMAN_DECISION = "human_decision"
    PARALLEL_GATE = "parallel_gate"
    CONDITIONAL = "conditional"


@dataclass
class WorkflowStep:
    """Individual step in a governance workflow."""
    step_id: str
    step_type: StepType
    agent_id: Optional[str] = None
    playbook_id: Optional[str] = None
    description: str = ""
    dependencies: List[str] = field(default_factory=list)
    escalation_threshold: Optional[str] = None
    timeout_minutes: int = 60
    status: WorkflowStatus = WorkflowStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


@dataclass
class GovernanceWorkflow:
    """
    Defines a multi-step governance workflow.

    Workflows coordinate multiple agents and playbooks to execute
    governance processes like steering committee preparation,
    risk review, or account plan updates.
    """
    workflow_id: str
    name: str
    description: str
    trigger_conditions: Dict[str, Any]
    steps: List[WorkflowStep]
    created_at: datetime = field(default_factory=datetime.utcnow)
    status: WorkflowStatus = WorkflowStatus.PENDING
    context: Dict[str, Any] = field(default_factory=dict)


class GovernanceOrchestrator:
    """
    Orchestrates execution of governance workflows.

    Responsibilities:
    - Determine step execution order based on dependencies
    - Coordinate parallel execution of independent steps
    - Handle human-in-the-loop escalations
    - Maintain audit trail for compliance
    """

    def __init__(self, output_dir: Path):
        """
        Initialize orchestrator.

        Args:
            output_dir: Directory for workflow execution logs
        """
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.active_workflows: Dict[str, GovernanceWorkflow] = {}
        self.step_handlers: Dict[StepType, Callable] = {}

    def register_handler(self, step_type: StepType, handler: Callable):
        """Register a handler function for a step type."""
        self.step_handlers[step_type] = handler

    def start_workflow(
        self,
        workflow: GovernanceWorkflow,
        context: Dict[str, Any]
    ) -> str:
        """
        Start executing a governance workflow.

        Args:
            workflow: Workflow definition to execute
            context: InfoHub context for execution

        Returns:
            Workflow execution ID
        """
        execution_id = f"{workflow.workflow_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        workflow.context = context
        workflow.status = WorkflowStatus.IN_PROGRESS
        self.active_workflows[execution_id] = workflow

        # Log workflow start
        self._log_event(execution_id, "workflow_started", {
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "step_count": len(workflow.steps)
        })

        return execution_id

    def get_ready_steps(self, execution_id: str) -> List[WorkflowStep]:
        """
        Get steps that are ready to execute (dependencies satisfied).

        Args:
            execution_id: Active workflow execution ID

        Returns:
            List of steps ready for execution
        """
        workflow = self.active_workflows.get(execution_id)
        if not workflow:
            return []

        completed_step_ids = {
            step.step_id for step in workflow.steps
            if step.status == WorkflowStatus.COMPLETED
        }

        ready_steps = []
        for step in workflow.steps:
            if step.status != WorkflowStatus.PENDING:
                continue
            if all(dep in completed_step_ids for dep in step.dependencies):
                ready_steps.append(step)

        return ready_steps

    def execute_step(
        self,
        execution_id: str,
        step_id: str
    ) -> Dict[str, Any]:
        """
        Execute a single workflow step.

        Args:
            execution_id: Active workflow execution ID
            step_id: Step to execute

        Returns:
            Step execution result
        """
        workflow = self.active_workflows.get(execution_id)
        if not workflow:
            raise ValueError(f"Unknown workflow execution: {execution_id}")

        step = next((s for s in workflow.steps if s.step_id == step_id), None)
        if not step:
            raise ValueError(f"Unknown step: {step_id}")

        step.status = WorkflowStatus.IN_PROGRESS
        step.started_at = datetime.utcnow()

        self._log_event(execution_id, "step_started", {
            "step_id": step_id,
            "step_type": step.step_type.value
        })

        handler = self.step_handlers.get(step.step_type)
        if not handler:
            step.status = WorkflowStatus.FAILED
            step.result = {"error": f"No handler for step type: {step.step_type}"}
            return step.result

        try:
            result = handler(step, workflow.context)
            step.result = result
            step.completed_at = datetime.utcnow()

            # Check if escalation needed
            if result.get("requires_escalation"):
                step.status = WorkflowStatus.ESCALATED
                self._log_event(execution_id, "step_escalated", {
                    "step_id": step_id,
                    "reason": result.get("escalation_reason")
                })
            elif result.get("awaiting_human"):
                step.status = WorkflowStatus.AWAITING_HUMAN
            else:
                step.status = WorkflowStatus.COMPLETED
                self._log_event(execution_id, "step_completed", {
                    "step_id": step_id,
                    "duration_seconds": (step.completed_at - step.started_at).total_seconds()
                })

            return result

        except Exception as e:
            step.status = WorkflowStatus.FAILED
            step.result = {"error": str(e)}
            self._log_event(execution_id, "step_failed", {
                "step_id": step_id,
                "error": str(e)
            })
            return step.result

    def get_workflow_status(self, execution_id: str) -> Dict[str, Any]:
        """Get current status of a workflow execution."""
        workflow = self.active_workflows.get(execution_id)
        if not workflow:
            return {"error": "Unknown workflow"}

        step_statuses = {
            step.step_id: {
                "status": step.status.value,
                "type": step.step_type.value,
                "started_at": step.started_at.isoformat() if step.started_at else None,
                "completed_at": step.completed_at.isoformat() if step.completed_at else None
            }
            for step in workflow.steps
        }

        return {
            "execution_id": execution_id,
            "workflow_id": workflow.workflow_id,
            "status": workflow.status.value,
            "steps": step_statuses,
            "ready_steps": [s.step_id for s in self.get_ready_steps(execution_id)]
        }

    def _log_event(self, execution_id: str, event_type: str, data: Dict[str, Any]):
        """Log workflow event for audit trail."""
        log_file = self.output_dir / f"{execution_id}_audit.jsonl"
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            **data
        }
        with open(log_file, 'a') as f:
            f.write(json.dumps(event) + '\n')


# Pre-defined governance workflow templates

STEERING_COMMITTEE_PREP = GovernanceWorkflow(
    workflow_id="WF_001_steering_prep",
    name="Steering Committee Preparation",
    description="Prepare materials for monthly steering committee review",
    trigger_conditions={
        "schedule": "25 days since last governance review",
        "manual": True
    },
    steps=[
        WorkflowStep(
            step_id="gather_risks",
            step_type=StepType.AGENT_TASK,
            agent_id="sa_agent",
            description="Gather and categorize open risks from InfoHub"
        ),
        WorkflowStep(
            step_id="gather_decisions",
            step_type=StepType.AGENT_TASK,
            agent_id="ae_agent",
            description="Extract pending decisions requiring committee input"
        ),
        WorkflowStep(
            step_id="run_health_score",
            step_type=StepType.PLAYBOOK_EXECUTION,
            playbook_id="PB_401",
            description="Execute customer health score playbook",
            dependencies=["gather_risks"]
        ),
        WorkflowStep(
            step_id="compile_agenda",
            step_type=StepType.AGENT_TASK,
            agent_id="ae_agent",
            description="Compile agenda from gathered inputs",
            dependencies=["gather_risks", "gather_decisions", "run_health_score"]
        ),
        WorkflowStep(
            step_id="review_agenda",
            step_type=StepType.HUMAN_DECISION,
            description="Human review and approval of agenda",
            dependencies=["compile_agenda"],
            escalation_threshold="exec_sponsor"
        )
    ]
)

RISK_REVIEW_WORKFLOW = GovernanceWorkflow(
    workflow_id="WF_002_risk_review",
    name="Cross-functional Risk Review",
    description="Systematic review of account risks across all functions",
    trigger_conditions={
        "threshold": "critical_risk_count > 3",
        "schedule": "monthly",
        "manual": True
    },
    steps=[
        WorkflowStep(
            step_id="technical_risks",
            step_type=StepType.PLAYBOOK_EXECUTION,
            playbook_id="PB_211",
            agent_id="sa_agent",
            description="Assess technical and architecture risks"
        ),
        WorkflowStep(
            step_id="commercial_risks",
            step_type=StepType.AGENT_TASK,
            agent_id="ae_agent",
            description="Assess commercial and forecast risks"
        ),
        WorkflowStep(
            step_id="delivery_risks",
            step_type=StepType.AGENT_TASK,
            agent_id="delivery_agent",
            description="Assess delivery and timeline risks"
        ),
        WorkflowStep(
            step_id="consolidate",
            step_type=StepType.PARALLEL_GATE,
            description="Wait for all risk assessments",
            dependencies=["technical_risks", "commercial_risks", "delivery_risks"]
        ),
        WorkflowStep(
            step_id="prioritize",
            step_type=StepType.PLAYBOOK_EXECUTION,
            playbook_id="PB_201",
            description="Run SWOT analysis on consolidated risks",
            dependencies=["consolidate"]
        ),
        WorkflowStep(
            step_id="mitigation_review",
            step_type=StepType.HUMAN_DECISION,
            description="Leadership review of mitigation plans",
            dependencies=["prioritize"],
            escalation_threshold="sales_leadership"
        )
    ]
)
