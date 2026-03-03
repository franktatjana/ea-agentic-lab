"""Generate golden-standard agent definition YAML from source files.

Reads an agent's config, personality, prompts, skills, and references
to produce a definition YAML aligned with Oracle Agent Spec 26.1.0.

Usage:
    python generate_definition.py <agent_dir>
    python generate_definition.py --all
    python generate_definition.py --batch 1|2|3|4
"""

import argparse
import re
import sys
from pathlib import Path
from collections import OrderedDict

import yaml


# ---------------------------------------------------------------------------
# YAML helpers: preserve key order and use block strings
# ---------------------------------------------------------------------------

class _OrderedDumper(yaml.SafeDumper):
    pass

def _dict_representer(dumper, data):
    return dumper.represent_mapping("tag:yaml.org,2002:map", data.items())

def _str_representer(dumper, data):
    if "\n" in data:
        return dumper.represent_scalar("tag:yaml.org,2002:str", data, style="|")
    return dumper.represent_scalar("tag:yaml.org,2002:str", data)

_OrderedDumper.add_representer(OrderedDict, _dict_representer)
_OrderedDumper.add_representer(dict, _dict_representer)
_OrderedDumper.add_representer(str, _str_representer)


DISCLAIMER_HEADER = """\
# ============================================================
# DISCLAIMER — NO LIABILITY — READ BEFORE USE
# ============================================================
#
# THIS AGENT DEFINITION IS PROVIDED "AS IS" FOR REFERENCE AND
# SHOWCASE PURPOSES ONLY. IT IS NOT A PRODUCTION-READY
# CONFIGURATION. NO WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
# INCLUDING BUT NOT LIMITED TO FITNESS FOR A PARTICULAR PURPOSE
# OR NON-INFRINGEMENT, IS GIVEN.
#
# THE AUTHORS AND CONTRIBUTORS ASSUME NO LIABILITY FOR ANY
# DAMAGE, LOSS, OR UNINTENDED BEHAVIOR ARISING FROM THE USE,
# MODIFICATION, OR DEPLOYMENT OF THIS DEFINITION.
#
# YOU MUST REVIEW, VALIDATE, AND ADAPT THIS FILE BEFORE ANY
# OPERATIONAL USE. USE AT YOUR OWN RISK.
#
# LICENSE: CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/
# ============================================================
"""

# Base path for agent directories
AGENTS_BASE = Path(__file__).resolve().parent.parent

# Temperature defaults by category
TEMP_MAP = {
    "sales": 0.6,
    "delivery": 0.5,
    "governance": 0.4,
    "intelligence": 0.5,
    "specialist": 0.5,
    "default": 0.5,
}


# ---------------------------------------------------------------------------
# Source file discovery
# ---------------------------------------------------------------------------

class AgentSources:
    """Discover and load all source files for an agent."""

    def __init__(self, agent_dir: Path, overrides: dict | None = None):
        self.agent_dir = agent_dir
        self.overrides = overrides or {}
        self.config = None
        self.personality = None
        self.tasks = None
        self.skills = []
        self.references = []
        self.spec_md = None
        self._load()

    def _load(self):
        # Agent config YAML
        configs = list((self.agent_dir / "agents").glob("*_agent.yaml")) if (self.agent_dir / "agents").is_dir() else []
        if configs:
            self.config = yaml.safe_load(configs[0].read_text(encoding="utf-8"))

        # Personality YAML
        personalities = list((self.agent_dir / "personalities").glob("*_personality.yaml")) if (self.agent_dir / "personalities").is_dir() else []
        if personalities:
            self.personality = yaml.safe_load(personalities[0].read_text(encoding="utf-8"))

        # Prompts/tasks.yaml
        tasks_path = self.agent_dir / "prompts" / "tasks.yaml"
        if tasks_path.is_file():
            self.tasks = yaml.safe_load(tasks_path.read_text(encoding="utf-8"))

        # Skills
        skills_dir = self.agent_dir / "skills"
        if skills_dir.is_dir():
            for sf in sorted(skills_dir.glob("*.yaml")):
                data = yaml.safe_load(sf.read_text(encoding="utf-8"))
                if data:
                    self.skills.append(data)

        # References
        refs_dir = self.agent_dir / "references"
        if refs_dir.is_dir():
            self.references = sorted(refs_dir.glob("*.yaml")) + sorted(refs_dir.glob("*.md"))

        # Spec .md
        md_files = sorted(self.agent_dir.glob("*-agent.md"))
        if md_files:
            self.spec_md = md_files[0].read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# Definition builder
# ---------------------------------------------------------------------------

class DefinitionBuilder:
    """Build a definition YAML dict from agent sources."""

    def __init__(self, src: AgentSources):
        self.src = src
        self.agent_prefix = self._derive_prefix()

    def _derive_prefix(self) -> str:
        """Derive short prefix from agent_id (e.g. ci_agent -> ci)."""
        aid = (self.src.config or {}).get("agent_id", "")
        return aid.replace("_agent", "").replace("_", "-")

    def _derive_id(self) -> str:
        """Derive definition id from agent_id (e.g. ci_agent -> ci-agent)."""
        aid = (self.src.config or {}).get("agent_id", "")
        return aid.replace("_", "-")

    def _derive_name(self) -> str:
        if self.src.personality and self.src.personality.get("name"):
            return self.src.personality["name"]
        return self._derive_id().replace("-", " ").title()

    def _derive_category_temp(self) -> float:
        cat = (self.src.config or {}).get("category", "default")
        if cat in TEMP_MAP:
            return TEMP_MAP[cat]
        for key, val in TEMP_MAP.items():
            if key in cat:
                return val
        return TEMP_MAP["default"]

    def _derive_description(self) -> str:
        """Extract description from spec .md Purpose section or config."""
        if self.src.spec_md:
            lines = self.src.spec_md.split("\n")
            in_purpose = False
            desc_lines = []
            for line in lines:
                if line.strip().startswith("## Purpose"):
                    in_purpose = True
                    continue
                if in_purpose:
                    if line.strip().startswith("##") or line.strip().startswith("---"):
                        break
                    if line.strip():
                        desc_lines.append(line.strip())
            if desc_lines:
                return " ".join(desc_lines)
        purpose = (self.src.config or {}).get("purpose", "")
        return purpose or "TODO: Add description"

    def _derive_tags(self) -> list:
        tags = []
        team = (self.src.config or {}).get("team", "")
        category = (self.src.config or {}).get("category", "")
        if team:
            tags.append(team.replace("_", "-"))
        if category and category != team:
            tags.append(category.replace("_", "-"))
        # Add tags from core functions
        core = (self.src.config or {}).get("core_functions", [])
        for fn in core[:3]:
            tag = fn.lower().strip()
            for prefix in ("tracks ", "detects ", "flags ", "monitors ", "pushes ", "generates ", "analyzes "):
                tag = tag.replace(prefix, "")
            tag = re.sub(r"[^a-z0-9-]", "-", tag).strip("-")[:30]
            if tag and tag not in tags:
                tags.append(tag)
        return tags

    def _build_system_prompt(self) -> str:
        """Synthesize system prompt from personality fields."""
        p = self.src.personality
        if not p:
            return "TODO: Synthesize system_prompt from config and spec"

        name = p.get("name", self._derive_name())
        role = p.get("role", "")

        what_i_do = p.get("scope", {}).get("what_i_do", [])
        what_i_do_not_do = p.get("scope", {}).get("what_i_do_not_do", [])
        hallucination = p.get("hallucination_prevention", [])
        tone = p.get("tone", "")
        values = p.get("values", [])

        lines = [f"You are a {name}. Your job is to {(self.src.config or {}).get('purpose', role).lower()}."]
        lines.append("")

        if what_i_do:
            lines.append("You MUST:")
            for item in what_i_do:
                lines.append(f"- {item}")
            lines.append("")

        if what_i_do_not_do:
            lines.append("You MUST NOT:")
            for item in what_i_do_not_do:
                lines.append(f"- {item}")
            lines.append("")

        # Domain-specific knowledge from personality
        signal_keys = [k for k in p if k.startswith("signal_") or k.endswith("_detection")]
        for sk in signal_keys:
            sig = p[sk]
            if isinstance(sig, dict):
                for sub_key, sub_val in sig.items():
                    if isinstance(sub_val, dict):
                        for level, keywords in sub_val.items():
                            if isinstance(keywords, list):
                                lines.append(f"{sub_key.replace('_', ' ').title()} ({level}): {', '.join(str(k) for k in keywords)}.")
                    elif isinstance(sub_val, list):
                        lines.append(f"{sub_key.replace('_', ' ').title()}: {', '.join(str(k) for k in sub_val)}.")
                lines.append("")

        if hallucination:
            lines.append("When uncertain: state what evidence is missing, provide preliminary")
            lines.append("analysis based on available information, and flag for human review.")
            lines.append("")

        if tone:
            lines.append(f"Tone: {tone}.")
            lines.append("")

        lines.append("Output format: markdown with evidence-based structure. Use tables for")
        lines.append("structured comparisons. Bold key findings. Quote sources verbatim.")

        return "\n".join(lines) + "\n"

    def _build_inputs(self) -> list:
        """Build typed inputs from config."""
        config_inputs = (self.src.config or {}).get("inputs", [])
        inputs = []
        for inp in config_inputs:
            if isinstance(inp, str):
                title = re.sub(r"[^a-z0-9_]", "_", inp.lower().strip()).strip("_")
                inputs.append({"title": title, "type": "string", "description": inp})
            elif isinstance(inp, dict):
                inputs.append(inp)

        # Standard inputs
        if not any(i.get("title") == "task_type" for i in inputs):
            inputs.append({"title": "task_type", "type": "string", "description": "Which task to perform"})
        if not any(i.get("title") == "personality" for i in inputs):
            inputs.append({"title": "personality", "type": "string", "description": "Personality variant to use", "default": "default"})
        if not any(i.get("title") == "output_format" for i in inputs):
            inputs.append({"title": "output_format", "type": "string", "description": "Response format", "default": "markdown"})
        return inputs

    def _build_outputs(self) -> list:
        config_outputs = (self.src.config or {}).get("outputs", [])
        outputs = []
        for out in config_outputs:
            if isinstance(out, str):
                title = re.sub(r"[^a-z0-9_]", "_", out.lower().strip()).strip("_")
                outputs.append({"title": title, "type": "object", "description": out})
            elif isinstance(out, dict):
                outputs.append(out)

        if not outputs:
            outputs.append({"title": "result", "type": "object", "description": "Agent output"})
        return outputs

    def _build_tools(self) -> list:
        """Build 3-4 ClientTool entries from config mechanics."""
        mechanics = (self.src.config or {}).get("mechanics", [])
        tools = []

        # Derive read tool
        read_inputs = [inp for inp in (self.src.config or {}).get("inputs", []) if isinstance(inp, str)]
        tools.append({
            "component_type": "ClientTool",
            "id": f"read-{self.agent_prefix}-data",
            "name": f"Read {self._derive_name().split()[0]} Data",
            "description": f"Access data sources: {', '.join(read_inputs[:3]) if read_inputs else 'domain data'}",
            "requires_confirmation": False,
            "inputs": [{"title": "query", "type": "string"}],
            "outputs": [{"title": "data", "type": "object"}],
            "x-ea-agent": {"risk": "low"},
        })

        # Derive write tool
        write_outputs = [out for out in (self.src.config or {}).get("outputs", []) if isinstance(out, str)]
        tools.append({
            "component_type": "ClientTool",
            "id": f"write-{self.agent_prefix}-artifact",
            "name": f"Write {self._derive_name().split()[0]} Artifact",
            "description": f"Save artifacts: {', '.join(write_outputs[:3]) if write_outputs else 'analysis output'}",
            "requires_confirmation": True,
            "inputs": [{"title": "artifact", "type": "object"}, {"title": "destination_path", "type": "string"}],
            "outputs": [{"title": "status", "type": "string"}],
            "x-ea-agent": {"risk": "medium"},
        })

        # Ask-user tool
        tools.append({
            "component_type": "ClientTool",
            "id": "ask-user",
            "name": "Ask User",
            "description": "Request clarification or additional input from the user",
            "requires_confirmation": False,
            "inputs": [{"title": "question", "type": "string"}],
            "outputs": [{"title": "answer", "type": "string"}],
            "x-ea-agent": {"risk": "low"},
        })

        return tools

    def _build_specialized_agents(self) -> list:
        """Build 2 personality variants."""
        agent_id = self._derive_id()
        name = self._derive_name()
        purpose = (self.src.config or {}).get("purpose", "")

        return [
            {
                "component_type": "SpecializedAgent",
                "id": f"{agent_id}-proactive",
                "name": f"{name} (Proactive)",
                "description": f"Proactive mode: scans for signals and surfaces insights without prompting",
                "agent": {"$component_ref": agent_id},
                "agent_specialization_parameters": {
                    "additional_instructions": (
                        f"Focus on proactive detection and early warning. Scan sources\n"
                        f"continuously for relevant signals. Surface insights before being\n"
                        f"asked. Prioritize timeliness over depth. Keep outputs concise and\n"
                        f"action-oriented. Flag anything that needs immediate attention.\n"
                    ),
                    "human_in_the_loop": True,
                },
            },
            {
                "component_type": "SpecializedAgent",
                "id": f"{agent_id}-analytical",
                "name": f"{name} (Analytical)",
                "description": f"Analytical mode: deep analysis with comprehensive evidence and patterns",
                "agent": {"$component_ref": agent_id},
                "agent_specialization_parameters": {
                    "additional_instructions": (
                        f"Focus on depth and pattern recognition. Provide comprehensive\n"
                        f"analysis with full evidence trails. Synthesize across multiple\n"
                        f"data points. Prioritize accuracy and defensibility over speed.\n"
                        f"Include confidence levels and caveats where appropriate.\n"
                    ),
                    "human_in_the_loop": True,
                },
            },
        ]

    def _build_flows(self) -> list:
        """Build flows from skills (Tier 1) or prompt sections (Tier 2/3)."""
        flows = []
        skill_flow_ids = set()

        if self.src.skills:
            # Tier 1: 1 skill = 1 flow
            for skill in self.src.skills:
                flow = self._skill_to_flow(skill)
                if flow:
                    flows.append(flow)
                    skill_flow_ids.add(flow["id"])

        if self.src.tasks:
            # Add task-based flows (skip sections already covered by skills)
            for section_name, section_data in self.src.tasks.items():
                if not isinstance(section_data, dict):
                    continue
                flow_id = section_name.replace("_", "-")
                if flow_id not in skill_flow_ids:
                    flow = self._prompt_section_to_flow(section_name, section_data)
                    if flow:
                        flows.append(flow)

        return flows

    def _skill_to_flow(self, skill: dict) -> dict | None:
        """Convert a skill YAML to a Flow entry."""
        skill_id = skill.get("id", skill.get("skill_id", ""))
        name = skill.get("name", "")
        desc = skill.get("description", "")

        flow_id = re.sub(r"[^a-z0-9-]", "-", name.lower()).strip("-") if name else skill_id.lower().replace("_", "-")

        workflow = skill.get("workflow", {})
        steps_data = workflow.get("steps", []) if isinstance(workflow, dict) else []

        steps = []
        for i, step in enumerate(steps_data, 1):
            step_name = step.get("name", f"step-{i}")
            prompt_key = f"{self.agent_prefix}-{re.sub(r'[^a-z0-9-]', '-', step_name.lower()).strip('-')}"
            steps.append({
                "step": i,
                "prompt": prompt_key,
                "input": ", ".join(step.get("inputs", ["context"])),
                "description": step.get("description", step_name),
            })

        # Derive inputs/outputs from skill
        skill_inputs = skill.get("inputs", skill.get("input_schema", {}))
        skill_outputs = skill.get("outputs", skill.get("output_schema", {}))

        flow_inputs = []
        if isinstance(skill_inputs, dict):
            for k, v in skill_inputs.items():
                flow_inputs.append({"title": k, "type": v.get("type", "string") if isinstance(v, dict) else "string"})
        elif isinstance(skill_inputs, list):
            flow_inputs = skill_inputs

        flow_outputs = []
        if isinstance(skill_outputs, dict):
            for k, v in skill_outputs.items():
                flow_outputs.append({"title": k, "type": v.get("type", "object") if isinstance(v, dict) else "object"})
        elif isinstance(skill_outputs, list):
            flow_outputs = skill_outputs

        if not flow_inputs:
            flow_inputs = [{"title": "context", "type": "object"}]
        if not flow_outputs:
            flow_outputs = [{"title": "result", "type": "object"}]

        return {
            "component_type": "Flow",
            "id": flow_id,
            "name": name or flow_id.replace("-", " ").title(),
            "description": desc or f"Flow for {name}",
            "inputs": flow_inputs,
            "outputs": flow_outputs,
            "x-ea-agent": {"workflow_shorthand": steps if steps else [
                {"step": 1, "prompt": f"{self.agent_prefix}-{flow_id}-analyze", "input": "context", "description": "Analyze input"},
                {"step": 2, "prompt": f"{self.agent_prefix}-{flow_id}-synthesize", "input": "analysis", "description": "Synthesize findings"},
                {"step": 3, "prompt": f"{self.agent_prefix}-{flow_id}-output", "input": "synthesis", "description": "Generate output"},
            ]},
        }

    def _prompt_section_to_flow(self, section_name: str, section_data: dict) -> dict | None:
        """Convert a tasks.yaml section into a Flow entry."""
        flow_id = section_name.replace("_", "-")
        prompts = {k: v for k, v in section_data.items() if isinstance(v, dict) and "prompt" in v}

        if not prompts:
            return None

        steps = []
        all_inputs = set()
        for i, (prompt_name, prompt_data) in enumerate(prompts.items(), 1):
            prompt_key = f"{self.agent_prefix}-{prompt_name.replace('_', '-')}"
            prompt_text = prompt_data.get("prompt", "")
            # Extract template variables from prompt text
            variables = re.findall(r"\{(\w+)\}", prompt_text)
            input_vars = ", ".join(variables[:4]) if variables else "context"
            all_inputs.update(variables)

            steps.append({
                "step": i,
                "prompt": prompt_key,
                "input": input_vars,
                "description": prompt_data.get("description", prompt_data.get("name", prompt_name.replace("_", " "))),
            })

        # Build flow inputs from collected variables
        flow_inputs = []
        for var in sorted(all_inputs):
            flow_inputs.append({"title": var, "type": "string"})
        if not flow_inputs:
            flow_inputs = [{"title": "context", "type": "object"}]

        flow_outputs = [{"title": f"{flow_id.replace('-', '_')}_result", "type": "object"}]

        return {
            "component_type": "Flow",
            "id": flow_id,
            "name": section_name.replace("_", " ").title(),
            "description": f"Flow for {section_name.replace('_', ' ')} tasks.",
            "inputs": flow_inputs[:8],  # Cap at 8 inputs
            "outputs": flow_outputs,
            "x-ea-agent": {"workflow_shorthand": steps},
        }

    def _build_prompt_registry(self, flows: list | None = None) -> dict:
        """Build prompt_registry from tasks.yaml sections + skill-derived flow steps."""
        registry = {}

        # From tasks.yaml
        if self.src.tasks:
            for section_name, section_data in self.src.tasks.items():
                if not isinstance(section_data, dict):
                    continue
                for prompt_name, prompt_data in section_data.items():
                    if not isinstance(prompt_data, dict) or "prompt" not in prompt_data:
                        continue

                    key = f"{self.agent_prefix}-{prompt_name.replace('_', '-')}"
                    prompt_text = prompt_data.get("prompt", "")
                    variables = re.findall(r"\{(\w+)\}", prompt_text)

                    entry = {
                        "description": prompt_data.get("description", prompt_data.get("name", "")),
                        "source": f"prompts/tasks.yaml#{section_name}.{prompt_name}",
                        "inputs": [{"title": v, "type": "string"} for v in sorted(set(variables))[:6]],
                        "outputs": [{"title": f"{prompt_name.replace('_', '-')}_result", "type": "object"}],
                    }
                    registry[key] = entry

        # Fill in any flow step prompts not already in registry (from skills)
        if flows:
            for flow in flows:
                wf = flow.get("x-ea-agent", {}).get("workflow_shorthand", [])
                for step in wf:
                    prompt_key = step.get("prompt", "")
                    if prompt_key and prompt_key not in registry:
                        registry[prompt_key] = {
                            "description": step.get("description", ""),
                            "source": f"skills/{flow['id']}#step-{step.get('step', 0)}",
                            "inputs": [{"title": v.strip(), "type": "string"} for v in step.get("input", "context").split(",")],
                            "outputs": [{"title": "result", "type": "object"}],
                        }

        return registry

    def _build_guardrails(self) -> dict:
        p = self.src.personality or {}
        hallucination = p.get("hallucination_prevention", [])

        input_guards = []
        output_guards = []
        for rule in hallucination:
            rule_str = str(rule)
            if "NEVER" in rule_str.upper():
                output_guards.append(rule_str.lstrip("- "))
            else:
                output_guards.append(rule_str.lstrip("- "))

        if not input_guards:
            input_guards = [f"Reject requests without source content or evidence base"]

        return {
            "input": input_guards,
            "output": output_guards if output_guards else ["Always include evidence for claims"],
            "resource": [{"max_tool_calls": 30}],
        }

    def _build_boundaries(self) -> list:
        p = self.src.personality or {}
        what_not = p.get("scope", {}).get("what_i_do_not_do", [])
        defer_to = p.get("with_other_agents", {}).get("defer_to", {})
        escalation = (self.src.config or {}).get("escalation_to", "Leadership")

        # Build lookup: agent short name -> display name
        agent_lookup = {}
        for agent_id in defer_to:
            short = agent_id.replace("_agent", "").replace("_", " ")
            display = agent_id.replace("_", " ").title().replace(" Agent", " Agent")
            agent_lookup[short] = display

        boundaries = []
        for item in what_not:
            # Strip leading "Does not " / "Do not " variations
            clean = re.sub(r"^(does\s+not\s+|do\s+not\s+)", "", item, flags=re.IGNORECASE).strip()

            # Try to match boundary text to a specific agent from defer_to
            target = escalation
            item_lower = item.lower()
            for short_name, display_name in agent_lookup.items():
                if short_name in item_lower:
                    target = display_name
                    break

            boundaries.append(f"Does not {clean[0].lower() + clean[1:]} (handoff to {target})")
        return boundaries if boundaries else [f"Does not operate outside defined scope (handoff to {escalation})"]

    def _build_permissions(self) -> list:
        p = self.src.personality or {}
        permissions = p.get("scope", {}).get("what_i_do", [])
        if not permissions:
            # Fallback to core_functions from config
            permissions = (self.src.config or {}).get("core_functions", [])
        return permissions if permissions else ["Operate within defined scope"]

    def _build_escalation_triggers(self) -> list:
        escalation = (self.src.config or {}).get("escalation_to", "Leadership")
        p = self.src.personality or {}
        defer_to = p.get("with_other_agents", {}).get("defer_to", {})
        triggers = []

        # Agent-to-agent escalation from defer_to relationships
        for agent_id, reason in defer_to.items():
            display = agent_id.replace("_", " ").title().replace(" Agent", " Agent")
            triggers.append(f"{reason} (to {display})")

        # Human escalation for the top priority exceeding agent authority
        priorities = p.get("priorities", {})
        if isinstance(priorities, dict):
            first = priorities.get(1, "")
            if first:
                triggers.append(f"Critical {first.lower()} exceeding agent authority (to {escalation})")

        if not triggers:
            triggers.append(f"Critical issue detected (to {escalation})")
            triggers.append("Information uncertainty requiring human verification")
        return triggers

    def _build_handoffs(self) -> dict:
        """Build agent-to-agent handoff structure from personality with_other_agents."""
        p = self.src.personality or {}
        collaboration = p.get("with_other_agents", {})
        escalation = (self.src.config or {}).get("escalation_to", "Leadership")

        handoffs = {"human_escalation": escalation}

        if "defer_to" in collaboration:
            handoffs["defer_to"] = collaboration["defer_to"]
        if "provide_to" in collaboration:
            handoffs["provide_to"] = collaboration["provide_to"]
        if "receives_from" in collaboration:
            handoffs["receives_from"] = collaboration["receives_from"]

        return handoffs

    def _build_memory(self) -> dict:
        return {
            "conversation": "Current analysis session state",
            "working": [
                "Signals detected during current session",
                "Evidence gathered from scanned content",
                "Interim analysis results",
            ],
            "persistent": [
                "Historical patterns and trends",
                "Previous analysis outcomes",
                "Known domain context",
            ],
            "shared": [
                "Analysis results shared with collaborating agents via InfoHub",
            ],
        }

    def _build_context(self) -> dict:
        p = self.src.personality or {}
        priorities = p.get("priorities", {})
        priority_list = []
        if isinstance(priorities, dict):
            for i in sorted(priorities.keys()):
                priority_list.append(str(priorities[i]))

        return {
            "strategy": "Evidence-first, prioritize signals with highest severity",
            "token_budget": 8000,
            "reserve_for_references": 1500,
            "priority_order": [
                "System prompt with identity and constraints",
                "Current task context and inputs",
                "Working memory (signals, evidence gathered)",
            ] + priority_list[:3] + [
                "Reference materials (if available)",
            ],
            "include": [
                "Source evidence and quotes",
                "Current account or domain context",
            ],
            "exclude": [
                "Generic advice without evidence",
                "Content outside agent scope",
            ],
        }

    def _build_knowledge(self) -> dict:
        refs = []
        for ref_path in self.src.references:
            rel = ref_path.relative_to(self.src.agent_dir)
            try:
                content = yaml.safe_load(ref_path.read_text(encoding="utf-8"))
                desc = ""
                if isinstance(content, dict):
                    keys = list(content.keys())[:3]
                    desc = ", ".join(k.replace("_", " ").title() for k in keys)
            except Exception:
                desc = ref_path.stem.replace("-", " ").replace("_", " ").title()

            refs.append({
                "path": str(rel),
                "description": desc or ref_path.stem.replace("-", " ").title(),
                "load_when": f"Performing tasks related to {ref_path.stem.replace('-', ' ').replace('_', ' ')}",
            })
        return {"references": refs}

    def _build_assets(self) -> list:
        config_outputs = (self.src.config or {}).get("outputs", [])
        assets = []
        for out in config_outputs:
            if isinstance(out, str):
                slug = re.sub(r"[^a-z0-9-]", "-", out.lower().strip()).strip("-")
                assets.append({
                    "name": slug,
                    "filename": f"{{account}}-{slug}.md",
                    "description": out,
                })
        return assets if assets else [{"name": "analysis", "filename": "{account}-analysis.md", "description": "Analysis output"}]

    def _build_quality(self) -> list | dict:
        p = self.src.personality or {}
        checks = p.get("quality_checks", {})
        if isinstance(checks, dict):
            # Handle before_output variant (Senior Manager pattern)
            before = checks.get("before_output", [])
            if before:
                return {"before_output": before}
            # Handle flat list inside dict
            flat = [v for v in checks.values() if isinstance(v, str)]
            if flat:
                return flat
        if isinstance(checks, list) and checks:
            return checks
        return ["All claims supported by evidence", "No assumed dynamics", "Sources cited"]

    def build(self) -> dict:
        """Build the complete definition dict."""
        agent_id = self._derive_id()
        name = self._derive_name()

        flows = self._build_flows()
        flow_ids = [f["id"] for f in flows]

        definition = OrderedDict()
        definition["agentspec_version"] = "26.1.0"
        definition["component_type"] = "Agent"
        definition["id"] = agent_id
        definition["name"] = name
        definition["description"] = self._derive_description()

        definition["metadata"] = {
            "definition_version": "0.1.0",
            "disclaimer": (
                "This agent specification is a reference design for educational and "
                "demonstration purposes. It is not a production system. All examples, "
                "case studies, and scenarios are fictional."
            ),
            "tags": self._derive_tags(),
            "responsibility": (self.src.config or {}).get("purpose", "TODO: Add responsibility"),
        }

        definition["system_prompt"] = self._build_system_prompt()
        definition["human_in_the_loop"] = True

        definition["llm_configuration"] = {
            "model_id": None,
            "default_generation_parameters": {
                "temperature": self._derive_category_temp(),
                "max_tokens": 4096,
            },
        }

        definition["inputs"] = self._build_inputs()
        definition["outputs"] = self._build_outputs()
        definition["tools"] = self._build_tools()
        definition["toolboxes"] = []
        definition["specialized_agents"] = self._build_specialized_agents()
        definition["flows"] = flows

        definition["a2a"] = {
            "agent_url": None,
            "connection_config": None,
            "agent_card": {
                "protocol_version": "0.1",
                "capabilities": flow_ids,
                "input_modes": ["text/plain", "application/json"],
                "output_modes": ["application/yaml", "application/json", "text/markdown", "text/plain"],
            },
        }

        definition["x-ea-agent"] = OrderedDict()
        definition["x-ea-agent"]["fallback_model"] = None
        definition["x-ea-agent"]["prompt_registry"] = self._build_prompt_registry(flows)

        definition["x-ea-agent"]["validation"] = {
            "required_dimensions": [
                {"name": "context", "description": "What account, project, or domain is being analyzed?"},
                {"name": "source_data", "description": "What source content or data is being processed?"},
            ],
            "on_incomplete": (
                "State what's missing, provide a preliminary analysis based on "
                "available information, and flag gaps for human review. Do not "
                "generate a full analysis from incomplete input."
            ),
        }

        definition["x-ea-agent"]["output_constraints"] = {
            "evidence_requirement": "All claims must cite source evidence",
            "total_word_limit": 350,
            "hard_rule": "No claim without source evidence",
        }

        definition["x-ea-agent"]["guardrails"] = self._build_guardrails()
        definition["x-ea-agent"]["boundaries"] = self._build_boundaries()
        definition["x-ea-agent"]["permissions"] = self._build_permissions()
        definition["x-ea-agent"]["escalation_triggers"] = self._build_escalation_triggers()
        definition["x-ea-agent"]["handoffs"] = self._build_handoffs()

        definition["x-ea-agent"]["human_in_the_loop_conditions"] = [
            "Review required before publishing analysis externally",
            "Approval needed for strategic recommendations",
            "Flag outputs based on indirect or incomplete signals",
        ]

        definition["x-ea-agent"]["memory"] = self._build_memory()
        definition["x-ea-agent"]["context"] = self._build_context()
        definition["x-ea-agent"]["knowledge"] = self._build_knowledge()
        definition["x-ea-agent"]["assets"] = self._build_assets()
        definition["x-ea-agent"]["quality"] = self._build_quality()

        return definition


# ---------------------------------------------------------------------------
# YAML output with header comments
# ---------------------------------------------------------------------------

def render_yaml(definition: dict, agent_dir: Path) -> str:
    """Render definition dict to YAML string with disclaimer and header."""
    agent_id = definition.get("id", "unknown")
    name = definition.get("name", "Unknown Agent")

    # Derive source files for header comment
    config_files = list((agent_dir / "agents").glob("*_agent.yaml")) if (agent_dir / "agents").is_dir() else []
    personality_files = list((agent_dir / "personalities").glob("*_personality.yaml")) if (agent_dir / "personalities").is_dir() else []
    md_files = list(agent_dir.glob("*-agent.md"))

    sources = []
    if md_files:
        sources.append(md_files[0].name)
    if personality_files:
        sources.append(personality_files[0].name)
    if config_files:
        sources.append(config_files[0].name)

    header = (
        f"# {name} — Portable Agent Definition\n"
        f"# Aligned with Oracle Agent Spec 26.1.0\n"
        f"#\n"
        f"# Standard fields follow Agent Spec component model.\n"
        f"# EA-Agentic-Lab extensions use the x-ea-agent namespace.\n"
        f"#\n"
        f"# Derived from {', '.join(sources)} (sources of truth).\n"
    )

    zone1_comment = (
        "\n# ============================================================\n"
        "# AGENT SPEC STANDARD ZONE\n"
        "# ============================================================\n\n"
    )

    zone2_comment = (
        "\n# ============================================================\n"
        "# EA-AGENTIC-LAB EXTENSIONS (x-ea-agent namespace)\n"
        "# ============================================================\n\n"
    )

    # Split definition into zone 1 and zone 2
    zone1_keys = [
        "agentspec_version", "component_type", "id", "name", "description",
        "metadata", "system_prompt", "human_in_the_loop", "llm_configuration",
        "inputs", "outputs", "tools", "toolboxes", "specialized_agents", "flows", "a2a",
    ]

    zone1 = OrderedDict()
    zone2 = OrderedDict()
    for k, v in definition.items():
        if k in zone1_keys:
            zone1[k] = v
        else:
            zone2[k] = v

    zone1_yaml = yaml.dump(zone1, Dumper=_OrderedDumper, default_flow_style=False, allow_unicode=True, width=100, sort_keys=False)
    zone2_yaml = yaml.dump(zone2, Dumper=_OrderedDumper, default_flow_style=False, allow_unicode=True, width=100, sort_keys=False)

    return DISCLAIMER_HEADER + "\n" + header + zone1_comment + zone1_yaml + zone2_comment + zone2_yaml


# ---------------------------------------------------------------------------
# Agent discovery
# ---------------------------------------------------------------------------

# Map: (batch, agent_dir_relative, optional sub-path for nested agents)
AGENT_REGISTRY = [
    # Batch 1: Skills-ready
    (1, "account_intelligence", None),
    (1, "customer_architects", None),
    (1, "solution_architects", None),
    # Batch 2: Governance
    (2, "governance", "risk_radar"),
    (2, "governance", "meeting_notes"),
    (2, "governance", "decision_registrar"),
    (2, "governance", "task_shepherd"),
    (2, "governance", "nudger"),
    (2, "governance", "reporter"),
    (2, "governance", "playbook_curator"),
    (2, "governance", "infohub_curator"),
    (2, "governance", "knowledge_vault_curator"),
    (2, "governance", "signal_matcher"),
    # Batch 3: Prompts-ready
    (3, "delivery", None),
    (3, "industry_intelligence", None),
    (3, "infosec", None),
    (3, "leadership", None),
    (3, "market_news_analysis", None),
    (3, "partners", None),
    (3, "poc", None),
    (3, "product_managers", None),
    (3, "professional_services", None),
    (3, "retrospective", None),
    (3, "rfp", None),
    # Batch 4: Config-only
    (4, "specialists", None),
    (4, "specialists/observability", None),
    (4, "specialists/search", None),
    (4, "specialists/security", None),
    (4, "technology_scout", "scanner"),
    (4, "technology_scout", "analyzer"),
]


def resolve_agent_dir(rel_path: str, sub_agent: str | None) -> Path:
    """Resolve agent directory, handling governance and specialist sub-agents."""
    base = AGENTS_BASE / rel_path

    if sub_agent and rel_path == "governance":
        # Governance sub-agents share the directory but have individual files
        # The AgentSources will find the right config/personality by sub_agent name
        return base

    if "/" in rel_path:
        # Nested like specialists/observability
        return base

    return base


def find_governance_sources(agent_dir: Path, sub_agent: str) -> AgentSources:
    """Special handling for governance sub-agents that share a directory."""
    src = AgentSources.__new__(AgentSources)
    src.agent_dir = agent_dir
    src.overrides = {}
    src.config = None
    src.personality = None
    src.tasks = None
    src.skills = []
    src.references = []
    src.spec_md = None

    # Find the specific config
    config_file = agent_dir / "agents" / f"{sub_agent}_agent.yaml"
    if config_file.is_file():
        src.config = yaml.safe_load(config_file.read_text(encoding="utf-8"))

    # Find the specific personality
    personality_file = agent_dir / "personalities" / f"{sub_agent}_personality.yaml"
    if personality_file.is_file():
        src.personality = yaml.safe_load(personality_file.read_text(encoding="utf-8"))

    # Shared tasks.yaml
    tasks_path = agent_dir / "prompts" / "tasks.yaml"
    if tasks_path.is_file():
        all_tasks = yaml.safe_load(tasks_path.read_text(encoding="utf-8"))
        # Filter to only the section matching this sub-agent
        if all_tasks and sub_agent in all_tasks:
            src.tasks = {sub_agent: all_tasks[sub_agent]}
        elif all_tasks:
            # Try to find a matching section (some have slightly different names)
            for key in all_tasks:
                if sub_agent.replace("_", "") in key.replace("_", ""):
                    src.tasks = {key: all_tasks[key]}
                    break

    # Shared skills
    skills_dir = agent_dir / "skills"
    if skills_dir.is_dir():
        for sf in sorted(skills_dir.glob("*.yaml")):
            data = yaml.safe_load(sf.read_text(encoding="utf-8"))
            if data:
                src.skills.append(data)

    # Shared + agent-specific references
    refs_dir = agent_dir / "references"
    if refs_dir.is_dir():
        # Filter references that match this sub-agent
        all_refs = sorted(refs_dir.glob("*.yaml")) + sorted(refs_dir.glob("*.md"))
        matching = [r for r in all_refs if sub_agent.replace("_", "-") in r.name]
        if matching:
            src.references = matching
        else:
            # Shared references (glossary, classification, etc.)
            shared = [r for r in all_refs if "glossary" in r.name or "classification" in r.name or "error" in r.name or "output" in r.name]
            src.references = shared[:3]

    # Agent-specific spec .md
    md_name = sub_agent.replace("_", "-") + "-agent.md"
    md_path = agent_dir / md_name
    if md_path.is_file():
        src.spec_md = md_path.read_text(encoding="utf-8")

    return src


def find_tech_scout_sources(agent_dir: Path, sub_agent: str) -> AgentSources:
    """Special handling for technology_scout sub-agents."""
    src = AgentSources.__new__(AgentSources)
    src.agent_dir = agent_dir
    src.overrides = {}
    src.config = None
    src.personality = None
    src.tasks = None
    src.skills = []
    src.references = []
    src.spec_md = None

    # Config
    config_file = agent_dir / "agents" / f"tech_signal_{sub_agent}_agent.yaml"
    if config_file.is_file():
        src.config = yaml.safe_load(config_file.read_text(encoding="utf-8"))

    # Personality
    personality_file = agent_dir / "personalities" / f"tech_signal_{sub_agent}_personality.yaml"
    if personality_file.is_file():
        src.personality = yaml.safe_load(personality_file.read_text(encoding="utf-8"))

    # Tasks - split by sub-agent
    tasks_path = agent_dir / "prompts" / "tasks.yaml"
    if tasks_path.is_file():
        all_tasks = yaml.safe_load(tasks_path.read_text(encoding="utf-8"))
        if all_tasks:
            section_map = {"scanner": "scanning", "analyzer": "analysis"}
            section = section_map.get(sub_agent, sub_agent)
            if section in all_tasks:
                src.tasks = {section: all_tasks[section]}
            else:
                # Try partial match
                for key in all_tasks:
                    if sub_agent[:4] in key:
                        src.tasks = {key: all_tasks[key]}
                        break

    # References
    refs_dir = agent_dir / "references"
    if refs_dir.is_dir():
        src.references = sorted(refs_dir.glob("*.yaml")) + sorted(refs_dir.glob("*.md"))

    # Spec .md
    md_name = f"tech-signal-{sub_agent}-agent.md"
    md_path = agent_dir / md_name
    if md_path.is_file():
        src.spec_md = md_path.read_text(encoding="utf-8")

    return src


def generate_single(agent_dir: Path, sub_agent: str | None = None, rel_path: str = "") -> Path:
    """Generate a single agent definition and return the output path."""

    if sub_agent and rel_path == "governance":
        src = find_governance_sources(agent_dir, sub_agent)
    elif sub_agent and rel_path == "technology_scout":
        src = find_tech_scout_sources(agent_dir, sub_agent)
    else:
        src = AgentSources(agent_dir)

    builder = DefinitionBuilder(src)
    definition = builder.build()

    yaml_content = render_yaml(definition, agent_dir)

    agent_id = definition["id"]
    output_path = agent_dir / f"{agent_id}-definition.yaml"
    output_path.write_text(yaml_content, encoding="utf-8")

    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate agent definition YAML files")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("agent_dir", nargs="?", help="Path to agent directory")
    group.add_argument("--all", action="store_true", help="Generate all definitions")
    group.add_argument("--batch", type=int, choices=[1, 2, 3, 4], help="Generate a specific batch")
    parser.add_argument("--dry-run", action="store_true", help="Print output paths without writing")

    args = parser.parse_args()

    if args.agent_dir:
        agent_dir = Path(args.agent_dir).resolve()
        if not agent_dir.is_dir():
            print(f"Error: {agent_dir} is not a directory", file=sys.stderr)
            sys.exit(1)
        out = generate_single(agent_dir)
        print(f"Generated: {out}")
        return

    entries = AGENT_REGISTRY
    if args.batch:
        entries = [(b, d, s) for b, d, s in entries if b == args.batch]

    generated = []
    errors = []
    for batch, rel_path, sub_agent in entries:
        agent_dir = AGENTS_BASE / rel_path.split("/")[0] if "/" not in rel_path else AGENTS_BASE / rel_path
        try:
            if args.dry_run:
                agent_id = sub_agent or rel_path.split("/")[-1]
                print(f"[Batch {batch}] Would generate: {agent_dir}/{agent_id}-*-definition.yaml")
                continue
            out = generate_single(resolve_agent_dir(rel_path, sub_agent), sub_agent, rel_path.split("/")[0] if "/" not in rel_path else rel_path)
            generated.append(str(out))
            print(f"[Batch {batch}] Generated: {out.name}")
        except Exception as e:
            errors.append(f"[Batch {batch}] {rel_path}/{sub_agent or ''}: {e}")
            print(f"[Batch {batch}] ERROR {rel_path}/{sub_agent or ''}: {e}", file=sys.stderr)

    print(f"\nGenerated: {len(generated)}, Errors: {len(errors)}")
    if errors:
        for err in errors:
            print(f"  {err}", file=sys.stderr)


if __name__ == "__main__":
    main()
