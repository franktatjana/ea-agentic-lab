"""
Governance Orchestrator Demo

Demonstrates the orchestrator running a steering committee preparation workflow
with simulated agent handlers. Shows dependency resolution, step execution,
and audit trail generation.
"""

import sys
from pathlib import Path
from datetime import datetime
import json

APPLICATION_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(APPLICATION_ROOT / "src"))

from core.workflows.governance_orchestrator import (
    GovernanceOrchestrator,
    GovernanceWorkflow,
    WorkflowStep,
    WorkflowStatus,
    StepType,
    STEERING_COMMITTEE_PREP
)


def create_mock_handlers():
    """Create simulated handlers for each step type."""

    def agent_task_handler(step, context):
        """Simulate agent task execution."""
        print(f"    [AGENT] {step.agent_id} executing: {step.description}")

        # Simulate different outputs based on agent
        if step.agent_id == "sa_agent":
            return {
                "status": "success",
                "risks_found": 3,
                "high_severity": 1,
                "output": f"Gathered {3} risks from InfoHub for {context.get('realm_id', 'unknown')}/{context.get('node_id', 'unknown')}"
            }
        elif step.agent_id == "ae_agent":
            return {
                "status": "success",
                "decisions_pending": 2,
                "output": "Extracted pending decisions: budget approval, timeline extension"
            }
        else:
            return {"status": "success", "output": "Task completed"}

    def playbook_handler(step, context):
        """Simulate playbook execution."""
        print(f"    [PLAYBOOK] Executing {step.playbook_id}: {step.description}")

        if step.playbook_id == "PB_401":
            return {
                "status": "success",
                "health_score": 72,
                "trend": "stable",
                "output": "Customer health score: 72/100 (stable)"
            }
        elif step.playbook_id == "PB_201":
            return {
                "status": "success",
                "output": "SWOT analysis complete - 4 strengths, 2 weaknesses, 3 opportunities, 2 threats"
            }
        else:
            return {"status": "success", "output": f"Playbook {step.playbook_id} executed"}

    def human_decision_handler(step, context):
        """Simulate human decision point."""
        print(f"    [HUMAN] Decision required: {step.description}")
        print(f"           Escalation to: {step.escalation_threshold or 'standard review'}")

        # In demo, auto-approve
        return {
            "status": "success",
            "awaiting_human": False,  # Auto-approved for demo
            "decision": "approved",
            "output": "Agenda approved by stakeholder (simulated)"
        }

    def parallel_gate_handler(step, context):
        """Handle parallel gate (just passes through)."""
        print(f"    [GATE] Parallel gate reached: {step.description}")
        return {"status": "success", "output": "All parallel tasks completed"}

    return {
        StepType.AGENT_TASK: agent_task_handler,
        StepType.PLAYBOOK_EXECUTION: playbook_handler,
        StepType.HUMAN_DECISION: human_decision_handler,
        StepType.PARALLEL_GATE: parallel_gate_handler
    }


def run_workflow_demo(workflow_name: str = "steering"):
    """
    Run the orchestrator demo.

    Args:
        workflow_name: "steering" or "risk" to select workflow
    """
    print("=" * 70)
    print("GOVERNANCE ORCHESTRATOR DEMO")
    print("=" * 70)
    print()

    # Setup
    output_dir = APPLICATION_ROOT.parent / "data" / "runs" / "orchestrator_demo"
    orchestrator = GovernanceOrchestrator(output_dir)

    # Register handlers
    handlers = create_mock_handlers()
    for step_type, handler in handlers.items():
        orchestrator.register_handler(step_type, handler)

    # Create workflow instance (copy template to avoid mutation)
    if workflow_name == "steering":
        template = STEERING_COMMITTEE_PREP
    else:
        from core.workflows.governance_orchestrator import RISK_REVIEW_WORKFLOW
        template = RISK_REVIEW_WORKFLOW

    workflow = GovernanceWorkflow(
        workflow_id=template.workflow_id,
        name=template.name,
        description=template.description,
        trigger_conditions=template.trigger_conditions,
        steps=[
            WorkflowStep(
                step_id=s.step_id,
                step_type=s.step_type,
                agent_id=s.agent_id,
                playbook_id=s.playbook_id,
                description=s.description,
                dependencies=s.dependencies.copy(),
                escalation_threshold=s.escalation_threshold
            )
            for s in template.steps
        ]
    )

    # Mock context (using realm/node structure)
    context = {
        "realm_id": "ACME",
        "node_id": "SECURITY_CONSOLIDATION",
        "node": {
            "name": "Security Platform Consolidation",
            "arr": 800000,
            "tier": "strategic",
            "exec_sponsor": "Klaus Hoffman (CISO)"
        },
        "risks": [
            {"id": "R001", "severity": "high", "description": "Migration timeline at risk"},
            {"id": "R002", "severity": "medium", "description": "Resource availability"},
            {"id": "R003", "severity": "low", "description": "Documentation gaps"}
        ],
        "decisions_pending": [
            {"id": "D001", "topic": "Q2 budget approval"},
            {"id": "D002", "topic": "Timeline extension request"}
        ]
    }

    print(f"Workflow: {workflow.name}")
    print(f"Description: {workflow.description}")
    print(f"Node: {context['node']['name']} (${context['node']['arr']:,} ARR)")
    print()

    # Start workflow
    print("-" * 70)
    print("STARTING WORKFLOW")
    print("-" * 70)
    execution_id = orchestrator.start_workflow(workflow, context)
    print(f"Execution ID: {execution_id}")
    print()

    # Execute workflow until complete
    iteration = 0
    max_iterations = 10  # Safety limit

    while iteration < max_iterations:
        iteration += 1
        ready_steps = orchestrator.get_ready_steps(execution_id)

        if not ready_steps:
            # Check if all steps complete
            all_complete = all(
                s.status in [WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.ESCALATED]
                for s in workflow.steps
            )
            if all_complete:
                print("-" * 70)
                print("WORKFLOW COMPLETE")
                print("-" * 70)
                break
            else:
                print("No steps ready, but workflow not complete. Possible deadlock.")
                break

        print(f"Round {iteration}: {len(ready_steps)} step(s) ready")
        print()

        for step in ready_steps:
            print(f"  Executing: {step.step_id}")
            result = orchestrator.execute_step(execution_id, step.step_id)
            if "output" in result:
                print(f"    Result: {result['output']}")
            print()

    # Final status
    print("-" * 70)
    print("FINAL STATUS")
    print("-" * 70)
    status = orchestrator.get_workflow_status(execution_id)

    for step_id, step_status in status["steps"].items():
        status_icon = {
            "completed": "✓",
            "failed": "✗",
            "escalated": "⚠",
            "pending": "○",
            "in_progress": "◐"
        }.get(step_status["status"], "?")
        print(f"  {status_icon} {step_id}: {step_status['status']}")

    print()

    # Show audit trail location
    audit_file = output_dir / f"{execution_id}_audit.jsonl"
    print(f"Audit trail: {audit_file}")

    # Show sample audit entries
    if audit_file.exists():
        print()
        print("Sample audit entries:")
        with open(audit_file) as f:
            for i, line in enumerate(f):
                if i >= 3:
                    print("  ...")
                    break
                event = json.loads(line)
                print(f"  {event['timestamp']}: {event['event_type']}")

    print()
    print("=" * 70)
    print("DEMO COMPLETE")
    print("=" * 70)

    return execution_id


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run governance orchestrator demo")
    parser.add_argument(
        "--workflow",
        choices=["steering", "risk"],
        default="steering",
        help="Which workflow to run (default: steering)"
    )

    args = parser.parse_args()
    run_workflow_demo(args.workflow)
