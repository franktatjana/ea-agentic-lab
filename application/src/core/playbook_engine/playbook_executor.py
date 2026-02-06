"""
Playbook Executor - Orchestrates end-to-end playbook execution

This is the central coordinator of the playbook engine, implementing
a 7-step execution pipeline:

    1. Load Playbook     - Parse YAML, validate schema
    2. Load Thresholds   - Get config-driven business parameters
    3. Validate Inputs   - Check required data exists (TODO)
    4. Evaluate Rules    - Run DLL conditions against InfoHub context
    5. Generate Outputs  - Create decision/risk artifacts from fired rules
    6. Validate Evidence - Ensure all claims have citations
    7. Write Outputs     - Persist artifacts and execution trace

Integration Points:
    - Reads from: domain/playbooks/executable/*.yaml, application/settings/playbook_thresholds.yaml
    - Writes to: data/runs/{run_id}/ (metadata.yaml, trace.json, report.md, outputs/)
    - Used by: Agent implementations, Streamlit UI (app.py)

Design Decisions:
    - Each run gets a unique directory for full traceability
    - Execution trace captures every step for debugging
    - Mock outputs used in POC (see _generate_mock_outputs) - replace for production
    - Evidence validation blocks execution if claims lack citations (no hallucinations)
"""

from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime
import json
import yaml

from .playbook_loader import PlaybookLoader
from .dll_evaluator import DLLEvaluator
from .threshold_manager import ThresholdManager
from .evidence_validator import EvidenceValidator


class PlaybookExecutor:
    """Orchestrates playbook execution from trigger to output artifacts."""

    def __init__(
        self,
        playbooks_dir: Path,
        thresholds_config: Path,
        runs_dir: Path
    ):
        """
        Initialize executor with configuration paths.

        Args:
            playbooks_dir: Directory containing playbook YAML files
            thresholds_config: Path to playbook_thresholds.yaml
            runs_dir: Directory where run outputs are written
        """
        self.playbooks_dir = playbooks_dir
        self.runs_dir = runs_dir

        # Initialize the four core components of the playbook engine:
        # - Loader: YAML parsing and schema validation
        # - DLL Evaluator: Decision Logic Language condition evaluation
        # - Threshold Manager: Config-driven business parameters (ARR minimums, etc.)
        # - Evidence Validator: Citation requirement enforcement (anti-hallucination)
        self.loader = PlaybookLoader()
        self.dll_evaluator = DLLEvaluator()
        self.threshold_manager = ThresholdManager(thresholds_config)
        self.evidence_validator = EvidenceValidator()

    def execute(
        self,
        playbook_id: str,
        context: Dict[str, Any],
        client_id: str = None
    ) -> Dict[str, Any]:
        """
        Execute playbook against context and generate outputs.

        Args:
            playbook_id: Playbook identifier (e.g., 'PB_201')
            context: InfoHub data context
            client_id: Client identifier (extracted from context if not provided)

        Returns:
            Execution result with run_id, status, outputs, etc.
        """
        # Extract client_id if not provided
        if not client_id:
            client_id = context.get('client_id', 'unknown')

        # Generate run ID
        run_id = self._generate_run_id(playbook_id, client_id)
        run_dir = self.runs_dir / run_id
        run_dir.mkdir(parents=True, exist_ok=True)

        # Initialize execution trace
        trace = {
            'run_id': run_id,
            'execution_steps': [],
            'execution_summary': {}
        }
        start_time = datetime.utcnow()

        try:
            # Step 1: Load playbook
            self._log_step(trace, 'load_playbook', 'started')
            playbook_path = self._find_playbook(playbook_id)
            playbook = self.loader.load(playbook_path)
            self._log_step(trace, 'load_playbook', 'success', {
                'playbook_path': str(playbook_path),
                'schema_validation': 'passed'
            })

            # Step 2: Load thresholds
            self._log_step(trace, 'load_thresholds', 'started')
            thresholds_used = self.threshold_manager.get_all_for_playbook(playbook_id)
            self._log_step(trace, 'load_thresholds', 'success', {
                'thresholds_count': len(thresholds_used)
            })

            # Step 3: Validate inputs (minimal check for POC)
            self._log_step(trace, 'validate_inputs', 'started')
            # TODO: Implement input validation
            self._log_step(trace, 'validate_inputs', 'success', {
                'note': 'Input validation not yet implemented'
            })

            # Step 4: Evaluate decision logic
            self._log_step(trace, 'evaluate_decision_logic', 'started')
            fired_rules = self._evaluate_rules(playbook, context, playbook_id, trace)
            self._log_step(trace, 'evaluate_decision_logic', 'success', {
                'rules_evaluated': len(playbook.get('decision_logic', {}).get('rules', [])),
                'rules_fired': len(fired_rules),
                'fired_rule_ids': [r['rule_id'] for r in fired_rules]
            })

            # Step 5: Generate outputs (mock for POC)
            self._log_step(trace, 'generate_outputs', 'started')
            outputs = self._generate_mock_outputs(playbook, fired_rules, client_id, run_id)
            self._log_step(trace, 'generate_outputs', 'success', {
                'outputs_created': len(outputs)
            })

            # Step 6: Validate evidence
            self._log_step(trace, 'validate_evidence', 'started')
            validation_errors = []
            for output in outputs:
                errors = self.evidence_validator.validate(output['content'])
                if errors:
                    validation_errors.extend(errors)

            if validation_errors:
                self._log_step(trace, 'validate_evidence', 'failed', {
                    'validation_errors': validation_errors
                })
                raise ValueError(f"Evidence validation failed: {validation_errors}")
            else:
                self._log_step(trace, 'validate_evidence', 'success', {
                    'validation_errors': 0
                })

            # Step 7: Write outputs
            self._log_step(trace, 'write_outputs', 'started')
            self._write_outputs(run_dir, outputs)
            self._log_step(trace, 'write_outputs', 'success', {
                'files_written': len(outputs)
            })

            # Finalize execution
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()

            trace['execution_summary'] = {
                'start_time': start_time.isoformat() + 'Z',
                'end_time': end_time.isoformat() + 'Z',
                'duration_seconds': round(duration, 2),
                'status': 'completed',
                'total_steps': len(trace['execution_steps']),
                'successful_steps': sum(1 for s in trace['execution_steps'] if s['status'] == 'success'),
                'failed_steps': 0
            }

            # Write metadata
            metadata = self._generate_metadata(
                run_id, playbook_id, playbook, client_id,
                thresholds_used, outputs, trace, 'completed'
            )
            self._write_yaml(run_dir / 'metadata.yaml', metadata)

            # Write trace
            self._write_json(run_dir / 'trace.json', trace)

            # Write report
            report = self._generate_report(run_id, playbook, client_id, fired_rules, outputs, trace)
            self._write_markdown(run_dir / 'report.md', report)

            return {
                'run_id': run_id,
                'status': 'completed',
                'run_dir': str(run_dir),
                'outputs': outputs,
                'fired_rules': fired_rules,
                'duration_seconds': duration
            }

        except Exception as e:
            # Log failure
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()

            self._log_step(trace, 'execution_failed', 'failed', {
                'error_type': type(e).__name__,
                'error_message': str(e)
            })

            trace['execution_summary'] = {
                'start_time': start_time.isoformat() + 'Z',
                'end_time': end_time.isoformat() + 'Z',
                'duration_seconds': round(duration, 2),
                'status': 'failed',
                'error': str(e)
            }

            # Write error trace
            self._write_json(run_dir / 'trace.json', trace)

            # Write error log
            self._write_text(run_dir / 'error.log', str(e))

            raise

    def _generate_run_id(self, playbook_id: str, client_id: str) -> str:
        """Generate deterministic run ID."""
        timestamp = datetime.utcnow().strftime('%Y-%m-%d_%H%M%S')
        return f"{timestamp}_{playbook_id}_{client_id}"

    def _find_playbook(self, playbook_id: str) -> Path:
        """Find playbook file by ID."""
        # Search in executable/ and validation/ subdirectories
        for subdir in ['executable', 'validation']:
            pattern = f"*{playbook_id}*.yaml"
            matches = list((self.playbooks_dir / subdir).glob(pattern))
            if matches:
                return matches[0]

        raise FileNotFoundError(f"Playbook {playbook_id} not found in {self.playbooks_dir}")

    def _evaluate_rules(
        self,
        playbook: Dict[str, Any],
        context: Dict[str, Any],
        playbook_id: str,
        trace: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Evaluate decision logic rules against context.

        This is where the DLL (Decision Logic Language) conditions from the playbook
        are evaluated against the actual InfoHub data. Each rule's condition is:
        1. Extracted from the playbook YAML
        2. Threshold placeholders substituted (e.g., ${thresholds.min_arr} -> 500000)
        3. Evaluated against context using JSONPath + comparison operators

        Rules that evaluate to TRUE are "fired" and will generate outputs.
        """
        fired_rules = []

        # Extract rules from playbook's decision_logic section
        rules = playbook.get('decision_logic', {}).get('rules', [])
        for rule in rules:
            rule_id = rule.get('id', 'unknown')
            condition = rule.get('condition', '')

            # Substitute thresholds
            condition_substituted = self.threshold_manager.substitute_condition(
                condition, playbook_id
            )

            # Evaluate condition
            try:
                result = self.dll_evaluator.evaluate(condition_substituted, context)

                if result:
                    fired_rules.append({
                        'rule_id': rule_id,
                        'condition': condition,
                        'condition_substituted': condition_substituted,
                        'result': True,
                        'severity': rule.get('severity', 'MEDIUM'),
                        'output_type': rule.get('output_type', 'Decision'),
                        'decision': rule.get('decision', {}),
                        'creates': rule.get('creates', [])
                    })
            except Exception as e:
                # Log evaluation error but continue
                trace['execution_steps'].append({
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'step': f'evaluate_rule_{rule_id}',
                    'status': 'error',
                    'details': {
                        'error': str(e),
                        'condition': condition
                    }
                })

        return fired_rules

    def _generate_mock_outputs(
        self,
        playbook: Dict[str, Any],
        fired_rules: List[Dict[str, Any]],
        client_id: str,
        run_id: str
    ) -> List[Dict[str, Any]]:
        """
        Generate mock outputs for fired rules (POC implementation).

        IMPORTANT: This is a placeholder for the POC. In production, this method
        should be replaced with actual output generation that:
        1. Uses LLM to generate real analysis content
        2. Pulls real evidence from InfoHub artifacts
        3. Creates properly formatted markdown documents

        Currently creates mock Decision and Risk objects with fake evidence
        to allow end-to-end testing of the execution pipeline.
        """
        outputs = []

        for rule in fired_rules:
            # Helper to check if object type exists in creates (handles both strings and dicts)
            def creates_object_type(creates_list, obj_type):
                for item in creates_list:
                    if isinstance(item, dict) and item.get('object_type') == obj_type:
                        return True
                    elif isinstance(item, str) and item == obj_type:
                        return True
                return False

            creates = rule.get('creates', [])

            # Create decision object if rule creates it
            if creates_object_type(creates, 'Decision'):
                outputs.append({
                    'type': 'decision',
                    'path': f"outputs/decisions/{rule['rule_id']}_{client_id}.md",
                    'content': {
                        'decisions': [{
                            'title': rule['decision'].get('title', 'Untitled Decision'),
                            'evidence': [
                                {
                                    'source_artifact': 'InfoHub/test/mock.md',
                                    'date': '2026-01-12',
                                    'excerpt': 'Mock evidence for integration test',
                                    'confidence': 'HIGH'
                                }
                            ]
                        }]
                    }
                })

            # Create risk object if rule creates it
            if creates_object_type(creates, 'Risk'):
                outputs.append({
                    'type': 'risk',
                    'path': f"outputs/risks/{rule['rule_id']}_{client_id}.md",
                    'content': {
                        'risks': [{
                            'description': rule['decision'].get('context', 'Untitled Risk'),
                            'evidence': [
                                {
                                    'source_artifact': 'InfoHub/test/mock.md',
                                    'date': '2026-01-12',
                                    'excerpt': 'Mock evidence for integration test',
                                    'confidence': 'HIGH'
                                }
                            ]
                        }]
                    }
                })

        return outputs

    def _generate_metadata(
        self,
        run_id: str,
        playbook_id: str,
        playbook: Dict[str, Any],
        client_id: str,
        thresholds_used: Dict[str, Any],
        outputs: List[Dict[str, Any]],
        trace: Dict[str, Any],
        status: str
    ) -> Dict[str, Any]:
        """Generate metadata.yaml content."""
        return {
            'run_id': run_id,
            'playbook_id': playbook_id,
            'playbook_name': playbook.get('framework_name', 'Unknown'),
            'playbook_version': playbook.get('version', '0.0'),
            'client_id': client_id,
            'agent_role': playbook.get('intended_agent_role', 'Unknown'),
            'execution_timestamp': trace['execution_summary'].get('start_time', ''),
            'execution_duration_seconds': trace['execution_summary'].get('duration_seconds', 0),
            'thresholds_used': thresholds_used,
            'outputs_generated': [
                {
                    'type': o['type'],
                    'path': o['path'],
                    'status': 'created'
                }
                for o in outputs
            ],
            'status': status,
            'errors': [],
            'warnings': []
        }

    def _generate_report(
        self,
        run_id: str,
        playbook: Dict[str, Any],
        client_id: str,
        fired_rules: List[Dict[str, Any]],
        outputs: List[Dict[str, Any]],
        trace: Dict[str, Any]
    ) -> str:
        """Generate report.md content."""
        lines = [
            f"# Playbook Run Report",
            f"",
            f"**Run ID:** {run_id}",
            f"**Playbook:** {playbook.get('framework_name', 'Unknown')} ({playbook.get('version', '0.0')})",
            f"**Client:** {client_id}",
            f"**Agent:** {playbook.get('intended_agent_role', 'Unknown')}",
            f"**Executed:** {trace['execution_summary'].get('start_time', 'Unknown')}",
            f"**Duration:** {trace['execution_summary'].get('duration_seconds', 0)} seconds",
            f"**Status:** {'✅' if trace['execution_summary'].get('status') == 'completed' else '❌'} {trace['execution_summary'].get('status', 'Unknown').capitalize()}",
            f"",
            f"---",
            f"",
            f"## Decision Logic Evaluation",
            f"",
            f"**Rules Evaluated:** {len(playbook.get('decision_logic', {}).get('rules', []))}",
            f"**Rules Fired:** {len(fired_rules)}",
            f""
        ]

        if fired_rules:
            for rule in fired_rules:
                # Extract object types from creates (handles both strings and dicts)
                creates_list = rule.get('creates', [])
                creates_display = ', '.join(
                    item.get('object_type', str(item)) if isinstance(item, dict) else str(item)
                    for item in creates_list
                )
                lines.extend([
                    f"### Rule: {rule['rule_id']}",
                    f"- **Condition:** `{rule['condition']}`",
                    f"- **Result:** ✅ TRUE",
                    f"- **Severity:** {rule.get('severity', 'MEDIUM')}",
                    f"- **Creates:** {creates_display}",
                    f""
                ])
        else:
            lines.append("No rules fired.")

        lines.extend([
            f"",
            f"---",
            f"",
            f"## Outputs Generated",
            f""
        ])

        if outputs:
            for output in outputs:
                lines.append(f"- **{output['type'].capitalize()}:** [{output['path']}]({output['path']})")
        else:
            lines.append("No outputs generated.")

        lines.extend([
            f"",
            f"---",
            f"",
            f"## Trace",
            f"",
            f"Full execution trace available in [trace.json](trace.json)"
        ])

        return '\n'.join(lines)

    def _write_outputs(self, run_dir: Path, outputs: List[Dict[str, Any]]):
        """Write output files to disk."""
        for output in outputs:
            output_path = run_dir / output['path']
            output_path.parent.mkdir(parents=True, exist_ok=True)

            # Mock content for now (would be real markdown in production)
            content = f"# {output['type'].capitalize()} Output\n\n"
            content += f"Mock output for integration test\n\n"
            content += f"Content: {output['content']}\n"

            output_path.write_text(content)

    def _write_yaml(self, path: Path, data: Dict[str, Any]):
        """Write YAML file."""
        with open(path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)

    def _write_json(self, path: Path, data: Dict[str, Any]):
        """Write JSON file."""
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)

    def _write_markdown(self, path: Path, content: str):
        """Write markdown file."""
        path.write_text(content)

    def _write_text(self, path: Path, content: str):
        """Write text file."""
        path.write_text(content)

    def _log_step(
        self,
        trace: Dict[str, Any],
        step: str,
        status: str,
        details: Dict[str, Any] = None
    ):
        """Log execution step to trace."""
        trace['execution_steps'].append({
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'step': step,
            'status': status,
            'details': details or {}
        })
