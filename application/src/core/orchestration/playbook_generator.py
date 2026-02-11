"""
Playbook Generator

Transforms process definitions into executable playbooks.
Generates YAML playbook files following the established schema.
"""

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml


class PlaybookGenerator:
    """
    Generates playbooks from process definitions.

    Transforms process steps into:
    - Trigger conditions
    - Required inputs
    - Key questions
    - Decision logic
    - Expected outputs
    - Stop conditions
    """

    def __init__(self, playbooks_path: Optional[Path] = None):
        """
        Initialize the Playbook Generator.

        Args:
            playbooks_path: Path to playbooks directory
        """
        if playbooks_path is None:
            playbooks_path = Path(__file__).parent.parent.parent / "playbooks"
        self.playbooks_path = playbooks_path
        self.playbook_counter = 900  # Start from PB_900 for auto-generated

    def generate(self, process_def: Dict) -> List[str]:
        """
        Generate playbooks from a process definition.

        Args:
            process_def: Normalized process definition

        Returns:
            List of created playbook IDs
        """
        playbooks_created = []

        # Generate main playbook for the process
        playbook = self._generate_playbook(process_def)
        playbook_id = self._save_playbook(playbook)
        playbooks_created.append(playbook_id)

        return playbooks_created

    def _generate_playbook(self, process_def: Dict) -> Dict:
        """Generate a playbook from process definition"""
        self.playbook_counter += 1
        playbook_id = f"PB_{self.playbook_counter}"

        # Extract owner
        owner = process_def.get("ownership", {}).get("primary_owner", {}).get("agent", "Unknown Agent")

        # Extract collaborators
        collaborators = process_def.get("ownership", {}).get("collaborators", [])
        secondary_agents = [c.get("agent") for c in collaborators if c.get("agent")]

        # Build trigger conditions
        trigger = process_def.get("trigger", {})
        trigger_conditions = self._build_trigger_conditions(trigger)

        # Build required inputs
        required_inputs = self._build_required_inputs(process_def)

        # Build key questions
        key_questions = self._build_key_questions(process_def)

        # Build decision logic
        decision_logic = self._build_decision_logic(process_def)

        # Build expected outputs
        expected_outputs = self._build_expected_outputs(process_def)

        # Build stop conditions
        stop_conditions = self._build_stop_conditions(process_def)

        playbook = {
            # Metadata
            "framework_name": process_def.get("name", "Auto-generated Process"),
            "framework_source": "Orchestration Agent (auto-generated)",
            "intended_agent_role": owner,
            "secondary_agents": secondary_agents,
            "primary_objective": process_def.get("description", "Execute process steps"),
            "playbook_id": playbook_id,
            "generated_from_process": process_def.get("process_id"),
            "when_not_to_use": [
                "Process preconditions not met",
                "Manual override requested",
                "Conflicting process already running"
            ],

            # Trigger
            "trigger_conditions": trigger_conditions,

            # Inputs
            "required_inputs": required_inputs,

            # Questions
            "key_questions": key_questions,

            # Logic
            "decision_logic": decision_logic,

            # Outputs
            "expected_outputs": expected_outputs,

            # Stop conditions
            "stop_conditions": stop_conditions,

            # Validation
            "validation_checks": self._build_validation_checks(process_def),

            # Metadata
            "estimated_execution_time": self._estimate_execution_time(process_def),
            "frequency": "On-demand (triggered by event)",
            "human_review_required": True,
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
            "version": "1.0",
            "status": "pending_validation"
        }

        return playbook

    def _build_trigger_conditions(self, trigger: Dict) -> Dict:
        """Build trigger conditions section"""
        event = trigger.get("event", "manual_trigger")
        conditions = trigger.get("conditions", [])

        automatic = [f"Event: {event}"]
        conditional = []

        for cond in conditions:
            field = cond.get("field", "field")
            operator = cond.get("operator", "==")
            value = cond.get("value", "value")
            conditional.append(f"IF {field} {operator} {value} THEN trigger")

        return {
            "automatic": automatic,
            "manual": ["Human requests execution"],
            "conditional": conditional if conditional else ["No additional conditions"]
        }

    def _build_required_inputs(self, process_def: Dict) -> Dict:
        """Build required inputs section"""
        mandatory = []
        optional = []

        for step in process_def.get("steps", []):
            for inp in step.get("inputs", []):
                if isinstance(inp, dict):
                    artifact = inp.get("artifact", "input")
                    source = inp.get("source", "")
                    entry = {"artifact": f"{{realm}}/{{node}}/{artifact}"}
                    if inp.get("optional"):
                        optional.append(entry)
                    else:
                        mandatory.append(entry)

        if not mandatory:
            mandatory.append({"artifact": "{realm}/{node}/overview.md"})

        return {
            "mandatory": mandatory,
            "optional": optional,
            "minimum_data_threshold": [
                "Process context available",
                "Required artifacts accessible"
            ]
        }

    def _build_key_questions(self, process_def: Dict) -> Dict:
        """Build key questions section"""
        questions = {
            "context_gathering": [
                "What is the current state of the engagement?",
                "Who are the key stakeholders involved?",
                "What are the success criteria?"
            ],
            "execution_planning": [
                "What resources are needed?",
                "What is the timeline?",
                "What are potential blockers?"
            ]
        }

        # Add step-specific questions
        for step in process_def.get("steps", []):
            step_name = step.get("name", "step")
            action = step.get("action", "execute")

            if action == "analyze_document":
                questions["analysis"] = [
                    f"What are the key findings from {step_name}?",
                    "Are there any concerns or red flags?",
                    "What recommendations emerge?"
                ]
            elif action == "create_artifact":
                questions["creation"] = [
                    f"What should {step_name} include?",
                    "Who is the audience?",
                    "What format is required?"
                ]

        return questions

    def _build_decision_logic(self, process_def: Dict) -> Dict:
        """Build decision logic section"""
        rules = []

        # Generate rules from steps
        for i, step in enumerate(process_def.get("steps", [])):
            condition = step.get("condition")
            step_name = step.get("name", f"Step {i+1}")

            if condition:
                # Conditional step
                rules.append({
                    "condition": self._format_condition(condition),
                    "output_type": "Decision",
                    "decision": f"""
CREATE Decision:
  title: "Execute {step_name}"
  context: "Condition met for step execution"
  decision: "Proceed with {step_name}"
  actions:
    - "{step.get('action', 'execute')}"
"""
                })

        # Add default completion rule
        rules.append({
            "condition": "all_steps_completed == true",
            "output_type": "Decision",
            "decision": """
CREATE Decision:
  title: "Process completed successfully"
  context: "All steps executed"
  decision: "Mark process as complete"
  actions:
    - "Generate completion notification"
    - "Update status to completed"
"""
        })

        return {"rules": rules}

    def _build_expected_outputs(self, process_def: Dict) -> Dict:
        """Build expected outputs section"""
        outputs = process_def.get("outputs", {})
        primary = outputs.get("primary", {})

        primary_artifact = {
            "path": primary.get("path", "{realm}/{node}/outputs/process_output.md"),
            "format": "markdown",
            "sections": [
                "executive_summary",
                "process_results",
                "recommendations",
                "next_steps"
            ]
        }

        # Decision objects
        decision_objects = {
            "path": "{realm}/{node}/external-infohub/decisions/",
            "create_if": ["Process requires decision", "Escalation needed"],
            "template": "ADR format"
        }

        # Risk objects
        risk_objects = {
            "path": "{realm}/{node}/internal-infohub/risks/",
            "create_if": ["Risk identified during execution", "Blocker encountered"],
            "template": "Risk with mitigation plan"
        }

        return {
            "primary_artifact": primary_artifact,
            "decision_objects": decision_objects,
            "risk_objects": risk_objects,
            "notifications": [
                {
                    "recipient": "Process Owner",
                    "condition": "always",
                    "message": "Process {process_id} completed for {node}"
                }
            ]
        }

    def _build_stop_conditions(self, process_def: Dict) -> Dict:
        """Build stop conditions section"""
        return {
            "escalate_to_human": [
                {
                    "condition": "required_input_missing",
                    "reason": "Cannot proceed without required data",
                    "action": "Request missing input from human"
                },
                {
                    "condition": "ambiguous_decision_point",
                    "reason": "Multiple valid paths, human judgment needed",
                    "action": "Present options to human for selection"
                },
                {
                    "condition": "deadline_exceeded",
                    "reason": "Process took longer than allowed",
                    "action": "Escalate to process owner"
                }
            ],
            "insufficient_data": [
                "Required artifacts not found",
                "Context information incomplete"
            ],
            "ambiguity_signals": [
                "Conflicting requirements detected",
                "Multiple interpretations possible"
            ],
            "human_judgment_required": [
                "Strategic decisions",
                "Exception handling",
                "Conflict resolution"
            ]
        }

    def _build_validation_checks(self, process_def: Dict) -> Dict:
        """Build validation checks section"""
        return {
            "pre_execution": [
                "realm exists in InfoHub",
                "node exists in InfoHub",
                "Required inputs available"
            ],
            "post_execution": [
                "All expected outputs created",
                "No errors in execution log",
                "Notifications sent successfully"
            ],
            "output_quality": [
                "No placeholder values in outputs",
                "All sections completed",
                "Format validated"
            ]
        }

    def _format_condition(self, condition: Any) -> str:
        """Format condition for playbook"""
        if isinstance(condition, str):
            return condition
        elif isinstance(condition, dict):
            field = condition.get("field", "field")
            operator = condition.get("operator", "==")
            value = condition.get("value", "value")
            return f"{field} {operator} {value}"
        return "true"

    def _estimate_execution_time(self, process_def: Dict) -> str:
        """Estimate execution time based on steps"""
        num_steps = len(process_def.get("steps", []))

        if num_steps <= 2:
            return "2-5 minutes (agent)"
        elif num_steps <= 5:
            return "5-10 minutes (agent)"
        else:
            return "10-20 minutes (agent)"

    def _save_playbook(self, playbook: Dict) -> str:
        """Save playbook to file"""
        playbook_id = playbook.get("playbook_id", "PB_XXX")
        framework_name = playbook.get("framework_name", "process").lower().replace(" ", "_")

        # Ensure directory exists
        output_dir = self.playbooks_path / "executable"
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate filename
        filename = f"{playbook_id}_{framework_name}.yaml"
        filepath = output_dir / filename

        # Write playbook
        with open(filepath, 'w') as f:
            # Add header comment
            f.write("# PLAYBOOK: Auto-generated from Process Definition\n")
            f.write("# Generated by: Orchestration Agent\n")
            f.write(f"# Generated at: {datetime.utcnow().isoformat()}Z\n")
            f.write("# Status: pending_validation (requires human review)\n\n")

            yaml.dump(playbook, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

        return playbook_id
