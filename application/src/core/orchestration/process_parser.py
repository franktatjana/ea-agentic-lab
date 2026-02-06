"""
Process Parser

Converts free-form human input into normalized process definitions.
Supports multiple input formats: natural language, YAML, tables, bullet points.
"""

import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
import yaml


class ProcessParser:
    """
    Parses human-provided process descriptions into normalized schema.

    Supports:
    - Natural language text
    - Structured YAML/JSON
    - Bullet points / checklists
    - Tabular data (CSV-like)
    """

    # Known event patterns
    EVENT_PATTERNS = {
        r"when\s+(?:we\s+)?(?:receive|get)\s+(?:a|an)\s+(\w+)": "_{}_received",
        r"after\s+(?:a|an)?\s*(\w+)\s+(?:is\s+)?completed?": "_{}_completed",
        r"if\s+(\w+)\s+(?:score|value)\s*[<>=]+\s*\d+": "_{}_threshold",
        r"when\s+(\w+)\s+(?:stage|status)\s+(?:changes?|updated?)": "_{}_changed",
        r"(?:new|incoming)\s+(\w+)": "_{}_received",
    }

    # Known agent patterns
    AGENT_PATTERNS = {
        r"\b(sa|solution\s+architect)\b": "SA Agent",
        r"\b(ae|account\s+executive)\b": "AE Agent",
        r"\b(ca|customer\s+(?:success|advocate))\b": "CA Agent",
        r"\b(ci|competitive\s+intelligence)\b": "CI Agent",
        r"\b(infosec|security)\b": "InfoSec Agent",
        r"\b(delivery)\b": "Delivery Agent",
        r"\b(partner)\b": "Partner Agent",
        r"\b(pm|product\s+manager)\b": "PM Agent",
    }

    # Deadline patterns
    DEADLINE_PATTERNS = {
        r"within\s+(\d+)\s+(day|hour|week)s?": lambda m: f"{m.group(1)} {m.group(2)}s",
        r"(\d+)\s+(day|hour|week)s?\s+(?:deadline|limit)": lambda m: f"{m.group(1)} {m.group(2)}s",
        r"by\s+end\s+of\s+(\w+)": lambda m: f"end of {m.group(1)}",
    }

    def __init__(self):
        self.process_counter = 0

    def parse(self, human_input: str, input_format: str = "auto") -> Dict:
        """
        Parse human input into normalized process definition.

        Args:
            human_input: Raw input from human
            input_format: "auto", "text", "yaml", "table"

        Returns:
            Normalized process definition dict
        """
        if input_format == "auto":
            input_format = self._detect_format(human_input)

        if input_format == "yaml":
            return self._parse_yaml(human_input)
        elif input_format == "table":
            return self._parse_table(human_input)
        else:
            return self._parse_text(human_input)

    def _detect_format(self, text: str) -> str:
        """Auto-detect input format"""
        text = text.strip()

        # Check for YAML
        if text.startswith("---") or ":" in text.split("\n")[0]:
            try:
                yaml.safe_load(text)
                return "yaml"
            except yaml.YAMLError:
                pass

        # Check for table (pipe-separated)
        if "|" in text and text.count("|") >= 4:
            return "table"

        return "text"

    def _parse_yaml(self, yaml_text: str) -> Dict:
        """Parse YAML input into process definition"""
        data = yaml.safe_load(yaml_text)

        # If already in normalized format, validate and return
        if "process_id" in data and "trigger" in data:
            return self._normalize(data)

        # Otherwise, convert from simple format
        return self._convert_simple_yaml(data)

    def _convert_simple_yaml(self, data: Dict) -> Dict:
        """Convert simple YAML format to normalized schema"""
        process_id = data.get("id", self._generate_id())

        trigger_event = data.get("trigger", "manual_trigger")
        if isinstance(trigger_event, dict):
            trigger = trigger_event
        else:
            trigger = {"event": trigger_event, "conditions": []}

        owner = data.get("owner", "Unknown Agent")
        if owner not in [p for p in self.AGENT_PATTERNS.values()]:
            owner = self._extract_agent(owner) or owner

        steps = []
        for i, step in enumerate(data.get("steps", [])):
            if isinstance(step, str):
                steps.append({
                    "step_id": f"S{i+1}",
                    "name": step,
                    "owner": owner,
                    "action": self._action_from_name(step)
                })
            elif isinstance(step, dict):
                steps.append({
                    "step_id": step.get("id", f"S{i+1}"),
                    "name": step.get("name", f"Step {i+1}"),
                    "owner": step.get("owner", owner),
                    "action": step.get("action", "execute"),
                    "condition": step.get("condition"),
                    "inputs": step.get("inputs", []),
                    "outputs": step.get("outputs", [])
                })

        return self._normalize({
            "process_id": process_id,
            "name": data.get("name", f"Process {process_id}"),
            "description": data.get("description", ""),
            "trigger": trigger,
            "ownership": {
                "primary_owner": {"agent": owner, "role": "executor"}
            },
            "steps": steps,
            "constraints": {
                "deadline": {"duration": data.get("deadline", "5 days")}
            },
            "metadata": {
                "source": {"format": "yaml", "original_text": str(data)}
            }
        })

    def _parse_table(self, table_text: str) -> Dict:
        """Parse table-formatted input"""
        lines = [l.strip() for l in table_text.strip().split("\n") if l.strip()]

        # Parse header
        header = [h.strip().lower() for h in lines[0].split("|") if h.strip()]

        # Skip separator line if present
        start_row = 2 if lines[1].replace("-", "").replace("|", "").strip() == "" else 1

        steps = []
        for i, line in enumerate(lines[start_row:]):
            cols = [c.strip() for c in line.split("|") if c.strip()]
            step = {"step_id": f"S{i+1}"}

            for j, col in enumerate(cols):
                if j < len(header):
                    key = header[j]
                    if key in ["step", "action", "name"]:
                        step["name"] = col
                    elif key == "owner":
                        step["owner"] = self._extract_agent(col) or col
                    elif key in ["condition", "if"]:
                        step["condition"] = col
                    elif key == "output":
                        step["outputs"] = [{"artifact": col}]
                    elif key in ["deadline", "due"]:
                        step["deadline"] = {"duration": col}

            steps.append(step)

        # Infer trigger and owner from first step
        first_owner = steps[0].get("owner", "Unknown Agent") if steps else "Unknown Agent"

        return self._normalize({
            "process_id": self._generate_id(),
            "name": "Process from table",
            "trigger": {"event": "manual_trigger"},
            "ownership": {"primary_owner": {"agent": first_owner}},
            "steps": steps,
            "metadata": {"source": {"format": "table"}}
        })

    def _parse_text(self, text: str) -> Dict:
        """Parse natural language text into process definition"""
        text_lower = text.lower()

        # Extract trigger event
        trigger_event, trigger_conditions = self._extract_trigger(text_lower)

        # Extract owner
        owner = self._extract_agent(text_lower)

        # Extract steps
        steps = self._extract_steps(text)

        # Extract deadline
        deadline = self._extract_deadline(text_lower)

        # Extract outputs (look for "create", "produce", "generate")
        outputs = self._extract_outputs(text_lower)

        # Build collaborators if mentioned
        collaborators = self._extract_collaborators(text_lower, owner)

        return self._normalize({
            "process_id": self._generate_id(),
            "name": self._generate_name(text),
            "description": text,
            "trigger": {
                "event": trigger_event,
                "conditions": trigger_conditions
            },
            "ownership": {
                "primary_owner": {"agent": owner or "Unknown Agent", "role": "executor"},
                "collaborators": collaborators
            },
            "steps": steps,
            "outputs": {
                "primary": outputs[0] if outputs else {"artifact": "process_output"}
            },
            "constraints": {
                "deadline": {"duration": deadline or "5 days"}
            },
            "metadata": {
                "source": {"format": "natural_language", "original_text": text}
            }
        })

    def _extract_trigger(self, text: str) -> Tuple[str, List]:
        """Extract trigger event from text"""
        for pattern, event_template in self.EVENT_PATTERNS.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entity = match.group(1).replace(" ", "_")
                event = event_template.format(entity).strip("_")
                return event, []

        # Default to manual trigger
        return "manual_trigger", []

    def _extract_agent(self, text: str) -> Optional[str]:
        """Extract agent/owner from text"""
        for pattern, agent_name in self.AGENT_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                return agent_name
        return None

    def _extract_deadline(self, text: str) -> Optional[str]:
        """Extract deadline from text"""
        for pattern, formatter in self.DEADLINE_PATTERNS.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return formatter(match)
        return None

    def _extract_steps(self, text: str) -> List[Dict]:
        """Extract process steps from text"""
        steps = []

        # Look for numbered steps (1. 2. 3. or 1) 2) 3))
        numbered = re.findall(r"(?:^|\n)\s*\d+[.\)]\s*(.+?)(?=\n\s*\d+[.\)]|\n\n|$)", text, re.MULTILINE)
        if numbered:
            for i, step_text in enumerate(numbered):
                steps.append({
                    "step_id": f"S{i+1}",
                    "name": step_text.strip()[:100],
                    "action": self._action_from_name(step_text)
                })
            return steps

        # Look for bullet points
        bullets = re.findall(r"(?:^|\n)\s*[-*]\s*(.+?)(?=\n\s*[-*]|\n\n|$)", text, re.MULTILINE)
        if bullets:
            for i, step_text in enumerate(bullets):
                steps.append({
                    "step_id": f"S{i+1}",
                    "name": step_text.strip()[:100],
                    "action": self._action_from_name(step_text)
                })
            return steps

        # Fall back to sentence-based extraction
        sentences = re.split(r"[.!?]", text)
        action_words = ["should", "must", "will", "need to", "has to"]

        for i, sentence in enumerate(sentences):
            if any(word in sentence.lower() for word in action_words):
                steps.append({
                    "step_id": f"S{i+1}",
                    "name": sentence.strip()[:100],
                    "action": self._action_from_name(sentence)
                })

        return steps if steps else [{
            "step_id": "S1",
            "name": "Execute process",
            "action": "execute"
        }]

    def _extract_outputs(self, text: str) -> List[Dict]:
        """Extract output artifacts from text"""
        outputs = []
        output_patterns = [
            r"create\s+(?:a|an)?\s*(\w+(?:\s+\w+)?)",
            r"produce\s+(?:a|an)?\s*(\w+(?:\s+\w+)?)",
            r"generate\s+(?:a|an)?\s*(\w+(?:\s+\w+)?)",
            r"output:\s*(\w+(?:\s+\w+)?)",
        ]

        for pattern in output_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                outputs.append({"artifact": match.strip().replace(" ", "_")})

        return outputs

    def _extract_collaborators(self, text: str, primary_owner: Optional[str]) -> List[Dict]:
        """Extract collaborating agents"""
        collaborators = []

        for pattern, agent_name in self.AGENT_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                if agent_name != primary_owner:
                    # Check for conditional involvement
                    if "if" in text.lower():
                        collaborators.append({
                            "agent": agent_name,
                            "role": "reviewer",
                            "condition": "conditional"
                        })
                    else:
                        collaborators.append({
                            "agent": agent_name,
                            "role": "contributor"
                        })

        return collaborators

    def _action_from_name(self, name: str) -> str:
        """Infer action type from step name"""
        name_lower = name.lower()

        if any(w in name_lower for w in ["analyze", "review", "assess"]):
            return "analyze_document"
        if any(w in name_lower for w in ["create", "write", "draft", "generate"]):
            return "create_artifact"
        if any(w in name_lower for w in ["send", "notify", "inform"]):
            return "send_notification"
        if any(w in name_lower for w in ["schedule", "book", "arrange"]):
            return "schedule_meeting"
        if any(w in name_lower for w in ["escalate", "raise"]):
            return "escalate"

        return "execute"

    def _generate_id(self) -> str:
        """Generate unique process ID"""
        self.process_counter += 1
        return f"PROC_{self.process_counter:03d}"

    def _generate_name(self, text: str) -> str:
        """Generate process name from text"""
        # Take first meaningful part of text
        words = text.split()[:6]
        name = " ".join(words)
        if len(name) > 50:
            name = name[:47] + "..."
        return name.title()

    def _normalize(self, process_def: Dict) -> Dict:
        """Ensure process definition has all required fields"""
        now = datetime.utcnow().isoformat() + "Z"

        defaults = {
            "version": 1,
            "created_at": now,
            "created_by": "process_parser",
            "updated_at": now,
            "updated_by": "process_parser",
            "status": "draft",
            "relationships": {
                "depends_on": [],
                "triggers": [],
                "related": [],
                "conflicts_with": []
            }
        }

        for key, value in defaults.items():
            if key not in process_def:
                process_def[key] = value

        return process_def
