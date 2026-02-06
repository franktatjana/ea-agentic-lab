"""
Tests for Governance Orchestrator

Validates:
- Workflow initialization and step management
- Dependency resolution
- Step execution with mock handlers
- Audit trail generation
"""

import pytest
from pathlib import Path
from datetime import datetime
import json
import tempfile
import shutil

import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from core.workflows.governance_orchestrator import (
    GovernanceOrchestrator,
    GovernanceWorkflow,
    WorkflowStep,
    WorkflowStatus,
    StepType,
    STEERING_COMMITTEE_PREP,
    RISK_REVIEW_WORKFLOW
)


@pytest.fixture
def temp_output_dir():
    """Create temporary directory for test outputs."""
    temp_dir = Path(tempfile.mkdtemp())
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def orchestrator(temp_output_dir):
    """Create orchestrator instance with temp output dir."""
    return GovernanceOrchestrator(temp_output_dir)


@pytest.fixture
def simple_workflow():
    """Create a simple test workflow."""
    return GovernanceWorkflow(
        workflow_id="TEST_001",
        name="Test Workflow",
        description="Simple test workflow for validation",
        trigger_conditions={"manual": True},
        steps=[
            WorkflowStep(
                step_id="step_1",
                step_type=StepType.AGENT_TASK,
                agent_id="sa_agent",
                description="First step - no dependencies"
            ),
            WorkflowStep(
                step_id="step_2",
                step_type=StepType.AGENT_TASK,
                agent_id="ae_agent",
                description="Second step - no dependencies"
            ),
            WorkflowStep(
                step_id="step_3",
                step_type=StepType.PLAYBOOK_EXECUTION,
                playbook_id="PB_201",
                description="Third step - depends on 1 and 2",
                dependencies=["step_1", "step_2"]
            ),
            WorkflowStep(
                step_id="step_4",
                step_type=StepType.HUMAN_DECISION,
                description="Final approval",
                dependencies=["step_3"]
            )
        ]
    )


@pytest.fixture
def mock_context():
    """Mock InfoHub context for testing."""
    return {
        "client_id": "TEST_CLIENT",
        "account": {
            "name": "Test Account",
            "arr": 2500000,
            "tier": "strategic"
        },
        "risks": [
            {"id": "R001", "severity": "high", "description": "Test risk"}
        ],
        "decisions": []
    }


class TestWorkflowInitialization:
    """Test workflow creation and initialization."""

    def test_start_workflow_creates_execution_id(self, orchestrator, simple_workflow, mock_context):
        """Starting workflow should create unique execution ID."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        assert execution_id is not None
        assert "TEST_001" in execution_id
        assert execution_id in orchestrator.active_workflows

    def test_workflow_status_set_to_in_progress(self, orchestrator, simple_workflow, mock_context):
        """Starting workflow should set status to in_progress."""
        orchestrator.start_workflow(simple_workflow, mock_context)

        assert simple_workflow.status == WorkflowStatus.IN_PROGRESS

    def test_context_attached_to_workflow(self, orchestrator, simple_workflow, mock_context):
        """Context should be attached to workflow on start."""
        orchestrator.start_workflow(simple_workflow, mock_context)

        assert simple_workflow.context == mock_context


class TestDependencyResolution:
    """Test step dependency management."""

    def test_steps_without_dependencies_ready_immediately(self, orchestrator, simple_workflow, mock_context):
        """Steps without dependencies should be ready at start."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)
        ready_steps = orchestrator.get_ready_steps(execution_id)

        ready_ids = [s.step_id for s in ready_steps]
        assert "step_1" in ready_ids
        assert "step_2" in ready_ids
        assert "step_3" not in ready_ids  # Has dependencies
        assert "step_4" not in ready_ids  # Has dependencies

    def test_dependent_step_not_ready_until_dependencies_complete(self, orchestrator, simple_workflow, mock_context):
        """Steps with dependencies should wait for completion."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        # Mock handler that marks step complete
        def mock_handler(step, context):
            return {"status": "success"}

        orchestrator.register_handler(StepType.AGENT_TASK, mock_handler)

        # Complete step_1
        orchestrator.execute_step(execution_id, "step_1")

        # step_3 still not ready (needs step_2)
        ready_steps = orchestrator.get_ready_steps(execution_id)
        ready_ids = [s.step_id for s in ready_steps]
        assert "step_3" not in ready_ids

    def test_dependent_step_ready_after_all_dependencies(self, orchestrator, simple_workflow, mock_context):
        """Steps should become ready when all dependencies complete."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        def mock_handler(step, context):
            return {"status": "success"}

        orchestrator.register_handler(StepType.AGENT_TASK, mock_handler)

        # Complete both step_1 and step_2
        orchestrator.execute_step(execution_id, "step_1")
        orchestrator.execute_step(execution_id, "step_2")

        # Now step_3 should be ready
        ready_steps = orchestrator.get_ready_steps(execution_id)
        ready_ids = [s.step_id for s in ready_steps]
        assert "step_3" in ready_ids


class TestStepExecution:
    """Test step execution mechanics."""

    def test_handler_called_with_step_and_context(self, orchestrator, simple_workflow, mock_context):
        """Handler should receive step and context."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        received_step = None
        received_context = None

        def capturing_handler(step, context):
            nonlocal received_step, received_context
            received_step = step
            received_context = context
            return {"status": "success"}

        orchestrator.register_handler(StepType.AGENT_TASK, capturing_handler)
        orchestrator.execute_step(execution_id, "step_1")

        assert received_step.step_id == "step_1"
        assert received_context == mock_context

    def test_step_status_updated_on_success(self, orchestrator, simple_workflow, mock_context):
        """Successful execution should mark step completed."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        def success_handler(step, context):
            return {"status": "success"}

        orchestrator.register_handler(StepType.AGENT_TASK, success_handler)
        orchestrator.execute_step(execution_id, "step_1")

        step = next(s for s in simple_workflow.steps if s.step_id == "step_1")
        assert step.status == WorkflowStatus.COMPLETED

    def test_step_status_updated_on_escalation(self, orchestrator, simple_workflow, mock_context):
        """Escalation response should mark step as escalated."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        def escalation_handler(step, context):
            return {"requires_escalation": True, "escalation_reason": "Threshold exceeded"}

        orchestrator.register_handler(StepType.AGENT_TASK, escalation_handler)
        orchestrator.execute_step(execution_id, "step_1")

        step = next(s for s in simple_workflow.steps if s.step_id == "step_1")
        assert step.status == WorkflowStatus.ESCALATED

    def test_step_status_failed_on_exception(self, orchestrator, simple_workflow, mock_context):
        """Exception in handler should mark step failed."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        def failing_handler(step, context):
            raise ValueError("Something went wrong")

        orchestrator.register_handler(StepType.AGENT_TASK, failing_handler)
        result = orchestrator.execute_step(execution_id, "step_1")

        step = next(s for s in simple_workflow.steps if s.step_id == "step_1")
        assert step.status == WorkflowStatus.FAILED
        assert "error" in result


class TestAuditTrail:
    """Test audit logging functionality."""

    def test_workflow_start_logged(self, orchestrator, simple_workflow, mock_context, temp_output_dir):
        """Starting workflow should create audit log entry."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        log_file = temp_output_dir / f"{execution_id}_audit.jsonl"
        assert log_file.exists()

        with open(log_file) as f:
            events = [json.loads(line) for line in f]

        start_event = next(e for e in events if e["event_type"] == "workflow_started")
        assert start_event["workflow_id"] == "TEST_001"

    def test_step_execution_logged(self, orchestrator, simple_workflow, mock_context, temp_output_dir):
        """Step execution should create audit log entries."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        def mock_handler(step, context):
            return {"status": "success"}

        orchestrator.register_handler(StepType.AGENT_TASK, mock_handler)
        orchestrator.execute_step(execution_id, "step_1")

        log_file = temp_output_dir / f"{execution_id}_audit.jsonl"
        with open(log_file) as f:
            events = [json.loads(line) for line in f]

        event_types = [e["event_type"] for e in events]
        assert "step_started" in event_types
        assert "step_completed" in event_types


class TestWorkflowStatus:
    """Test workflow status retrieval."""

    def test_get_status_returns_step_statuses(self, orchestrator, simple_workflow, mock_context):
        """Status should include all step statuses."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        status = orchestrator.get_workflow_status(execution_id)

        assert "steps" in status
        assert "step_1" in status["steps"]
        assert "step_2" in status["steps"]
        assert "step_3" in status["steps"]
        assert "step_4" in status["steps"]

    def test_get_status_includes_ready_steps(self, orchestrator, simple_workflow, mock_context):
        """Status should list currently ready steps."""
        execution_id = orchestrator.start_workflow(simple_workflow, mock_context)

        status = orchestrator.get_workflow_status(execution_id)

        assert "ready_steps" in status
        assert "step_1" in status["ready_steps"]
        assert "step_2" in status["ready_steps"]


class TestPredefinedWorkflows:
    """Test pre-defined workflow templates."""

    def test_steering_committee_workflow_structure(self):
        """Steering committee workflow should have correct structure."""
        assert STEERING_COMMITTEE_PREP.workflow_id == "WF_001_steering_prep"
        assert len(STEERING_COMMITTEE_PREP.steps) == 5

        step_ids = [s.step_id for s in STEERING_COMMITTEE_PREP.steps]
        assert "gather_risks" in step_ids
        assert "compile_agenda" in step_ids
        assert "review_agenda" in step_ids

    def test_risk_review_workflow_structure(self):
        """Risk review workflow should have correct structure."""
        assert RISK_REVIEW_WORKFLOW.workflow_id == "WF_002_risk_review"
        assert len(RISK_REVIEW_WORKFLOW.steps) == 6

        step_ids = [s.step_id for s in RISK_REVIEW_WORKFLOW.steps]
        assert "technical_risks" in step_ids
        assert "commercial_risks" in step_ids
        assert "consolidate" in step_ids

    def test_steering_committee_can_be_started(self, orchestrator, mock_context):
        """Should be able to start steering committee workflow."""
        # Create a copy to avoid mutating the template
        workflow = GovernanceWorkflow(
            workflow_id=STEERING_COMMITTEE_PREP.workflow_id,
            name=STEERING_COMMITTEE_PREP.name,
            description=STEERING_COMMITTEE_PREP.description,
            trigger_conditions=STEERING_COMMITTEE_PREP.trigger_conditions,
            steps=[
                WorkflowStep(
                    step_id=s.step_id,
                    step_type=s.step_type,
                    agent_id=s.agent_id,
                    playbook_id=s.playbook_id,
                    description=s.description,
                    dependencies=s.dependencies.copy()
                )
                for s in STEERING_COMMITTEE_PREP.steps
            ]
        )

        execution_id = orchestrator.start_workflow(workflow, mock_context)
        assert execution_id is not None

        ready_steps = orchestrator.get_ready_steps(execution_id)
        ready_ids = [s.step_id for s in ready_steps]

        # First two steps have no dependencies
        assert "gather_risks" in ready_ids
        assert "gather_decisions" in ready_ids


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
