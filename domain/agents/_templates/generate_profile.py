"""Generate agent profile markdown from definition YAML + source files.

Reads an agent's definition (golden standard), personality, and config
to produce a profile markdown aligned with DDR-019 domain model.

Usage:
    python generate_profile.py <agent_dir>
    python generate_profile.py --all

Decisions (documented per CLAUDE.md requirements):
    D1: Profiles derive from definitions (golden standard), enriched by
        personality (values, decision_authority) and config (category, team).
    D2: Operating modes use condensed third-person text, not raw instruction
        dumps from definition additional_instructions. All agents get the same
        two modes from the definition generator, so standardized descriptions
        ensure consistency.
    D3: Agent labels use proper acronyms (SA, AE, PM) via ACRONYM_MAP rather
        than naive title-casing (Sa, Ae, Pm).
    D4: Outbound handoffs differentiate defer_to (agent needs help) from
        provide_to (agent shares output). Inbound uses 2-column table since
        we have no separate "action" data.
    D5: Pilot agents (AE, CI, VE) included in profile registry even though
        their definitions were hand-crafted outside the standard pipeline.
    D6: Knowledge base "Loaded By" strips the verbose "Performing tasks
        related to" prefix and maps to readable runbook references.
"""

import argparse
import re
import sys
from pathlib import Path

import yaml


AGENTS_BASE = Path(__file__).resolve().parent.parent
PROFILES_BASE = AGENTS_BASE.parent.parent / "docs" / "reference" / "agent-profiles"

# Proper casing for common acronyms in agent labels
ACRONYM_MAP = {
    "sa": "SA", "ae": "AE", "pm": "PM", "ci": "CI", "ve": "VE",
    "poc": "POC", "rfp": "RFP", "ii": "II", "aci": "ACI", "mna": "MNA",
    "ps": "PS", "ebr": "EBR", "cab": "CAB",
}

# Condensed operating mode descriptions (third-person, 2-3 sentences)
CONDENSED_MODES = {
    "Proactive": (
        "scans for signals and surfaces insights without prompting. "
        "Prioritizes timeliness over depth. Keeps outputs concise "
        "and action-oriented."
    ),
    "Analytical": (
        "provides deep analysis with comprehensive evidence trails. "
        "Synthesizes across multiple data points. Prioritizes accuracy "
        "and defensibility over speed."
    ),
}

TEAM_TO_PROFILE_DIR = {
    "account-executive": "sales",
    "account-executives": "sales",
    "account-intelligence": "intelligence",
    "competitive-intelligence": "sales",
    "customer-architects": "architecture",
    "delivery": "delivery",
    "governance": "governance",
    "industry-intelligence": "intelligence",
    "infosec": "deal-execution",
    "leadership": "leadership",
    "market-news-analysis": "intelligence",
    "partners": "sales",
    "poc": "deal-execution",
    "product-managers": "leadership",
    "professional-services": "delivery",
    "retrospective": "meta",
    "rfp": "deal-execution",
    "solution-architects": "architecture",
    "specialists": "architecture",
    "technology-scout": "intelligence",
    "value-engineering": "sales",
}

ID_PROFILE_DIR_OVERRIDE = {
    "observability-specialist-agent": "specialists",
    "search-specialist-agent": "specialists",
    "security-specialist-agent": "specialists",
    "signal-matcher-agent": "governance",
}

# Registry: (batch, rel_path, sub_agent)
# Batch 0 = pilots (definitions exist but were hand-crafted)
AGENT_REGISTRY = [
    # Batch 0: Pilots
    (0, "account_executives", None),
    (0, "competitive_intelligence", None),
    (0, "value_engineering", None),
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


# ---------------------------------------------------------------------------
# Source loading
# ---------------------------------------------------------------------------

class ProfileSources:
    """Load definition YAML + personality + config for profile generation."""

    def __init__(self, definition_path: Path, agent_dir: Path,
                 sub_agent: str | None = None):
        self.definition_path = definition_path
        self.agent_dir = agent_dir
        self.sub_agent = sub_agent
        self.definition = {}
        self.personality = {}
        self.config = {}
        self.tasks = {}
        self._load()

    def _load(self):
        if self.definition_path.is_file():
            self.definition = yaml.safe_load(
                self.definition_path.read_text(encoding="utf-8")
            ) or {}

        if self.sub_agent and self.agent_dir.name in ("governance", "technology_scout"):
            self._load_sub_agent_sources()
        else:
            self._load_standard_sources()

    def _load_standard_sources(self):
        agents_dir = self.agent_dir / "agents"
        if agents_dir.is_dir():
            for f in agents_dir.glob("*_agent.yaml"):
                self.config = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
                break

        pers_dir = self.agent_dir / "personalities"
        if pers_dir.is_dir():
            for f in pers_dir.glob("*_personality.yaml"):
                self.personality = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
                break

        tasks_path = self.agent_dir / "prompts" / "tasks.yaml"
        if tasks_path.is_file():
            self.tasks = yaml.safe_load(tasks_path.read_text(encoding="utf-8")) or {}

    def _load_sub_agent_sources(self):
        sa = self.sub_agent
        prefix = sa
        if self.agent_dir.name == "technology_scout":
            prefix = f"tech_signal_{sa}"

        config_file = self.agent_dir / "agents" / f"{prefix}_agent.yaml"
        if config_file.is_file():
            self.config = yaml.safe_load(config_file.read_text(encoding="utf-8")) or {}

        pers_file = self.agent_dir / "personalities" / f"{prefix}_personality.yaml"
        if pers_file.is_file():
            self.personality = yaml.safe_load(pers_file.read_text(encoding="utf-8")) or {}

        tasks_path = self.agent_dir / "prompts" / "tasks.yaml"
        if tasks_path.is_file():
            all_tasks = yaml.safe_load(tasks_path.read_text(encoding="utf-8")) or {}
            section_map = {"scanner": "scanning", "analyzer": "analysis"}
            section = section_map.get(sa, sa)
            if section in all_tasks:
                self.tasks = {section: all_tasks[section]}
            else:
                for key in all_tasks:
                    if sa in key or sa.replace("_", "") in key.replace("_", ""):
                        self.tasks = {key: all_tasks[key]}
                        break


# ---------------------------------------------------------------------------
# Profile builder
# ---------------------------------------------------------------------------

class ProfileBuilder:
    """Build profile markdown from definition + personality + config."""

    def __init__(self, src: ProfileSources):
        self.src = src
        self.d = src.definition
        self.p = src.personality
        self.c = src.config
        self.ext = self.d.get("x-ea-agent", {})

    def build(self) -> str:
        sections = []
        sections.append(self._frontmatter())
        sections.append(self._heading_and_intro())
        sections.append(self._identity_table())
        sections.append(self._runbooks_section())

        da = self._decision_authority()
        if da:
            sections.append(da)

        sections.append(self._scope_boundaries())

        handoffs = self._handoffs_section()
        if handoffs:
            sections.append(handoffs)

        sections.append(self._operating_modes())
        sections.append(self._knowledge_base())

        artifacts = self._output_artifacts()
        if artifacts:
            sections.append(artifacts)

        sections.append(self._source_files())

        return "\n".join(s for s in sections if s)

    # -- Helpers --

    def _agent_id(self) -> str:
        return self.d.get("id", "unknown-agent")

    def _agent_name(self) -> str:
        return self.d.get("name", "Unknown Agent")

    def _role_name(self) -> str:
        """Human role name stripped from agent name."""
        return self._agent_name().replace(" Agent", "").strip()

    def _flows(self) -> list:
        return self.d.get("flows", [])

    def _prompt_count(self) -> int:
        return len(self.ext.get("prompt_registry", {}))

    def _ref_count(self) -> int:
        refs = self.ext.get("knowledge", {}).get("references", [])
        return len(refs)

    def _team_tag(self) -> str:
        tags = self.d.get("metadata", {}).get("tags", [])
        return tags[0] if tags else ""

    def _role_label(self) -> str:
        name = self._agent_name()
        team = self._team_tag()
        category = self.c.get("category", team)
        cat_label = category.replace("-", " ").replace("_", " ").title()
        role_name = name.replace(" Agent", "").strip()
        return f"{role_name} ({cat_label})"

    def _operating_principle(self) -> str:
        values = self.p.get("values", [])
        if isinstance(values, list) and values:
            return str(values[0]).rstrip(".")
        philosophy = self.c.get("philosophy", {})
        if isinstance(philosophy, dict) and philosophy.get("primary"):
            return philosophy["primary"].rstrip(".")
        return ""

    def _runbook_names_list(self) -> list[str]:
        return [f.get("name", "") for f in self._flows() if f.get("name")]

    @staticmethod
    def _format_agent_label(agent_id: str) -> str:
        """Format agent_id into display label with proper acronyms (D3)."""
        if agent_id == "all_agents":
            return "All Agents"
        words = agent_id.replace("_", " ").split()
        result = []
        for w in words:
            if w.lower() in ACRONYM_MAP:
                result.append(ACRONYM_MAP[w.lower()])
            else:
                result.append(w.capitalize())
        label = " ".join(result)
        if "Agent" not in label:
            label += " Agent"
        return label

    # -- Sections --

    def _frontmatter(self) -> str:
        agent_id = self._agent_id()
        name = self._agent_name()
        desc = self.d.get("description", "")
        short_desc = self._short_description(desc)
        team = self._team_tag()
        config_id = self.c.get("agent_id", agent_id.replace("-", "_"))
        keywords = [config_id, team, "agent", "profile", "digital_twin"]
        kw_str = "[" + ", ".join(f'"{k}"' for k in keywords) + "]"

        return (
            f"---\n"
            f'title: "{name}"\n'
            f'description: "{short_desc}"\n'
            f'category: "reference"\n'
            f"keywords: {kw_str}\n"
            f'last_updated: "2026-03-01"\n'
            f"---\n"
        )

    def _short_description(self, desc: str) -> str:
        runbook_names = self._runbook_names_list()
        if runbook_names:
            items = [n.lower() for n in runbook_names[:3]]
            return f"Digital twin for {', '.join(items)}"
        if desc and len(desc) > 20:
            first_sentence = desc.split(".")[0].strip()
            if len(first_sentence) < 120:
                return first_sentence
        return "Digital twin agent"

    def _heading_and_intro(self) -> str:
        name = self._agent_name()
        role_name = name.replace(" Agent", "").strip()
        flows = self._flows()
        n_runbooks = len(flows)
        desc = self.d.get("description", "")

        runbook_names = self._runbook_names_list()
        runbook_list_str = ""
        if runbook_names:
            if len(runbook_names) <= 2:
                runbook_list_str = " and ".join(n.lower() for n in runbook_names)
            else:
                runbook_list_str = (
                    ", ".join(n.lower() for n in runbook_names[:-1])
                    + ", and " + runbook_names[-1].lower()
                )

        intro = (
            f"The {name} is the digital twin of the {role_name} role. "
            f"It operates as a single agent with {n_runbooks} runbooks"
        )
        if runbook_list_str:
            intro += f" covering {runbook_list_str}"
        intro += ". "

        if desc:
            clean_desc = desc.strip().rstrip(".")
            intro += clean_desc + "."

        principle = self._operating_principle()
        principle_line = ""
        if principle:
            principle_line = f"\nIts operating principle: {principle.lower().rstrip('.')}."

        return f"\n# {name}\n\n{intro}\n{principle_line}\n"

    def _identity_table(self) -> str:
        agent_id = self._agent_id()
        role = self._role_label()
        n_runbooks = len(self._flows())
        n_prompts = self._prompt_count()
        n_refs = self._ref_count()

        specialized = self.d.get("specialized_agents", [])
        modes = []
        for sa in specialized:
            sa_name = sa.get("name", "")
            m = re.search(r"\((\w+)\)", sa_name)
            if m:
                modes.append(m.group(1))
        modes_str = ", ".join(modes) if modes else "Standard"

        rows = [
            "## Identity\n",
            "| Attribute | Value |",
            "|-----------|-------|",
            f"| **Agent ID** | `{agent_id}` |",
            f"| **Role** | {role} |",
            "| **Mode** | Human-paired |",
            f"| **Runbooks** | {n_runbooks} |",
            f"| **Prompts** | {n_prompts} |",
            f"| **Operating Modes** | {modes_str} |",
            f"| **Knowledge References** | {n_refs} |",
        ]
        return "\n".join(rows) + "\n"

    def _runbooks_section(self) -> str:
        flows = self._flows()
        if not flows:
            return "\n## Runbooks\n\nNo runbooks defined.\n"

        lines = [
            "\n## Runbooks\n",
            "Each runbook is a scenario process that sequences prompts "
            "into a multi-step workflow. The agent selects the appropriate "
            "runbook based on the incoming trigger, then executes its prompt "
            "sequence with data flowing between steps.\n",
        ]

        for flow in flows:
            lines.append(self._single_runbook(flow))

        return "\n".join(lines)

    def _single_runbook(self, flow: dict) -> str:
        name = flow.get("name", "Unnamed")
        steps = flow.get("x-ea-agent", {}).get("workflow_shorthand", [])

        desc = self._synthesize_runbook_description(flow, steps)

        lines = [f"\n### {name}\n", f"{desc}\n"]

        if steps:
            agent_prefix = self._agent_id().replace("-agent", "")
            lines.append("| Step | Prompt | What It Does |")
            lines.append("|------|--------|-------------|")
            for step in steps:
                step_num = step.get("step", "")
                prompt_key = step.get("prompt", "")
                if prompt_key.startswith(agent_prefix + "-"):
                    prompt_short = prompt_key[len(agent_prefix) + 1:]
                else:
                    prompt_short = prompt_key
                prompt_short = prompt_short.replace("-", "_")
                step_desc = step.get("description", "")
                lines.append(f"| {step_num} | `{prompt_short}` | {step_desc} |")

        lines.append("")
        return "\n".join(lines)

    def _synthesize_runbook_description(self, flow: dict, steps: list) -> str:
        flow_desc = flow.get("description", "")
        if flow_desc and "Flow for" not in flow_desc and len(flow_desc) > 30:
            return flow_desc

        if not steps:
            return flow_desc or "Processes incoming requests."

        descs = [s.get("description", "") for s in steps if s.get("description")]
        if len(descs) == 1:
            return descs[0] + "."
        elif len(descs) == 2:
            d2 = descs[1][0].lower() + descs[1][1:]
            return f"{descs[0]}, then {d2}."
        else:
            first = descs[0]
            middle = ", then ".join(
                d[0].lower() + d[1:] for d in descs[1:-1]
            )
            last = descs[-1][0].lower() + descs[-1][1:]
            return f"{first}. Then {middle}, and finally {last}."

    def _decision_authority(self) -> str:
        da = self.p.get("decision_authority", {})
        if not da or not isinstance(da, dict):
            return ""

        owns = da.get("owns", [])
        approves = da.get("approves", [])
        advises = da.get("advises", [])

        if not owns and not approves and not advises:
            return ""

        lines = [
            "\n## Decision Authority\n",
            "The agent operates at three authority levels. These boundaries "
            "prevent both bottlenecks (over-escalation) and risk (under-escalation).\n",
            "| Level | Scope |",
            "|-------|-------|",
        ]

        if owns:
            lines.append(f"| **Owns** | {', '.join(str(o) for o in owns)} |")
        if approves:
            lines.append(f"| **Approves** | {', '.join(str(a) for a in approves)} |")
        if advises:
            lines.append(f"| **Advises** | {', '.join(str(a) for a in advises)} |")

        escalates_to = da.get("escalates_to", [])
        if not escalates_to:
            escalates_to = self.c.get("decision_authority", {}).get("escalates_to", [])
        if escalates_to:
            items = ", ".join(str(e) for e in escalates_to)
            lines.append(f"\n**Escalates upward when:** {items}.")

        lines.append("")
        return "\n".join(lines)

    @staticmethod
    def _fix_agent_casing(text: str) -> str:
        """Fix naive title-cased agent names in text (e.g., Sa Agent -> SA Agent)."""
        for short, proper in ACRONYM_MAP.items():
            pattern = re.compile(
                r'\b' + short.capitalize() + r'\b(?=\s+Agent|\s+agent)',
                re.IGNORECASE
            )
            text = pattern.sub(proper, text)
        return text

    def _scope_boundaries(self) -> str:
        boundaries = self.ext.get("boundaries", [])
        if not boundaries:
            return "\n## Scope Boundaries\n\nOperates within defined role scope.\n"

        items = []
        for b in boundaries:
            clean = re.sub(r"^Does not\s+", "", str(b)).strip()
            clean = self._fix_agent_casing(clean)
            items.append(clean)

        prose = "The agent does not " + ", ".join(
            items[:-1]) + ", or " + items[-1] if len(items) > 1 else (
            "The agent does not " + items[0]
        )
        prose = prose.rstrip(".") + "."

        return f"\n## Scope Boundaries\n\n{prose}\n"

    def _handoffs_section(self) -> str:
        """Build handoffs section (D4)."""
        handoffs = self.ext.get("handoffs", {})
        if not handoffs:
            return ""

        defer_to = handoffs.get("defer_to", {})
        provide_to = handoffs.get("provide_to", {})
        receives_from = handoffs.get("receives_from", {})

        has_outbound = defer_to or provide_to
        has_inbound = receives_from

        if not has_outbound and not has_inbound:
            return ""

        lines = []

        if has_outbound and has_inbound:
            lines.append("\n## Handoffs\n")
            lines.append("### Outbound (this agent to others)\n")
            lines.extend(self._outbound_table(defer_to, provide_to))
            lines.append("")
            lines.append("### Inbound (others to this agent)\n")
            lines.extend(self._inbound_table(receives_from))
        elif has_outbound:
            lines.append("\n## Handoffs\n")
            lines.append("### Outbound (this agent to others)\n")
            lines.extend(self._outbound_table(defer_to, provide_to))
        elif has_inbound:
            lines.append("\n## Inbound Handoffs\n")
            lines.append(
                "Other agents route relevant signals to this agent "
                "for processing.\n"
            )
            lines.extend(self._inbound_table(receives_from))

        lines.append("")
        return "\n".join(lines)

    def _outbound_table(self, defer_to: dict, provide_to: dict) -> list:
        """Outbound handoffs with distinct columns (D4).

        defer_to = agent requests help (trigger: needs X)
        provide_to = agent shares output (trigger: produces X)
        """
        lines = [
            "| Trigger | Receiving Agent | Context Passed |",
            "|---------|-----------------|----------------|",
        ]
        for agent_id, reason in defer_to.items():
            label = self._format_agent_label(agent_id)
            lines.append(
                f"| {reason} needed | {label} | "
                f"Requirement details for {reason.lower()} |"
            )
        for agent_id, reason in provide_to.items():
            label = self._format_agent_label(agent_id)
            lines.append(
                f"| {reason} | {label} | "
                f"Analysis results and recommendations |"
            )
        return lines

    def _inbound_table(self, receives_from: dict) -> list:
        """Inbound handoffs as 2-column table (D4)."""
        lines = [
            "| Source Agent | Trigger |",
            "|-------------|---------|",
        ]
        for agent_id, reason in receives_from.items():
            label = self._format_agent_label(agent_id)
            lines.append(f"| {label} | {reason} |")
        return lines

    def _operating_modes(self) -> str:
        """Condensed third-person operating mode descriptions (D2)."""
        specialized = self.d.get("specialized_agents", [])
        if not specialized:
            return (
                "\n## Operating Modes\n\n"
                "Standard mode with evidence-based analysis.\n"
            )

        lines = [
            "\n## Operating Modes\n",
            "Two specialized modes adjust behavior without changing "
            "the underlying runbooks or prompts.\n",
        ]

        for sa in specialized:
            sa_name = sa.get("name", "")
            m = re.search(r"\((\w+)\)", sa_name)
            mode_name = m.group(1) if m else sa_name

            if mode_name in CONDENSED_MODES:
                mode_desc = CONDENSED_MODES[mode_name]
            else:
                extra = sa.get("agent_specialization_parameters", {}).get(
                    "additional_instructions", ""
                ).strip()
                mode_desc = (extra if extra else sa.get("description", ""))
                mode_desc = mode_desc.replace("\n", " ").strip()

            lines.append(f"**{mode_name} Mode** {mode_desc}\n")

        return "\n".join(lines)

    def _knowledge_base(self) -> str:
        """Knowledge base with readable Loaded By column (D6)."""
        refs = self.ext.get("knowledge", {}).get("references", [])
        if not refs:
            return "\n## Knowledge Base\n\nNo dedicated knowledge references.\n"

        lines = [
            "\n## Knowledge Base\n",
            "The agent draws on reference knowledge that encodes "
            "domain expertise and decision patterns.\n",
            "| Reference | Content | Loaded By |",
            "|-----------|---------|-----------|",
        ]

        for ref in refs:
            path = ref.get("path", "")
            filename = Path(path).name if path else "unknown"
            desc = ref.get("description", "")
            load = ref.get("load_when", "All runbooks")
            # Strip verbose prefix, make readable
            load = re.sub(
                r"^Performing tasks related to\s+",
                "", load, flags=re.IGNORECASE
            )
            if load and load[0].islower():
                load = load[0].upper() + load[1:]
            if not load:
                load = "All runbooks"
            # Convert filename-style to readable
            load = load.replace("-", " ").replace("_", " ")
            if load.endswith(" yaml") or load.endswith(".yaml"):
                load = "Relevant runbooks"
            lines.append(f"| `{filename}` | {desc} | {load} |")

        lines.append("")
        return "\n".join(lines)

    def _output_artifacts(self) -> str:
        assets = self.ext.get("assets", [])
        if not assets:
            return ""
        # Skip default generic artifact
        if len(assets) == 1 and assets[0].get("name", "") == "analysis":
            return ""

        lines = [
            "\n## Output Artifacts\n",
            "The agent produces artifact types stored per account "
            "in the Node's InfoHub.\n",
            "| Artifact | Format | Purpose |",
            "|----------|--------|---------|",
        ]

        for asset in assets:
            name = asset.get("name", "").replace("-", " ").title()
            filename = asset.get("filename", "")
            desc = asset.get("description", "")
            lines.append(f"| {name} | `{filename}` | {desc} |")

        lines.append("")
        return "\n".join(lines)

    def _source_files(self) -> str:
        agent_dir = self.src.agent_dir
        rel = agent_dir.relative_to(AGENTS_BASE.parent.parent)

        sa = self.src.sub_agent
        if sa:
            if agent_dir.name == "technology_scout":
                prefix = f"tech_signal_{sa}"
            else:
                prefix = sa
            def_name = self._agent_id() + "-definition.yaml"
            config_name = f"{prefix}_agent.yaml"
            pers_name = f"{prefix}_personality.yaml"
        else:
            def_name = self._agent_id() + "-definition.yaml"
            config_path = agent_dir / "agents"
            config_name = ""
            if config_path.is_dir():
                for f in config_path.glob("*_agent.yaml"):
                    config_name = f.name
                    break
            pers_path = agent_dir / "personalities"
            pers_name = ""
            if pers_path.is_dir():
                for f in pers_path.glob("*_personality.yaml"):
                    pers_name = f.name
                    break

        n_prompts = self._prompt_count()
        n_runbooks = len(self._flows())
        tasks_desc = f"{n_prompts} CAF prompts across {n_runbooks} domains"

        lines = [
            "\n## Source Files\n",
            "| File | Purpose |",
            "|------|---------|",
            f"| `{rel}/{def_name}` | System view: runbooks, tools, prompts, guardrails |",
        ]
        if config_name:
            lines.append(
                f"| `{rel}/agents/{config_name}` | Agent configuration |"
            )
        if pers_name:
            lines.append(
                f"| `{rel}/personalities/{pers_name}` | Behavioral specification |"
            )

        tasks_file = agent_dir / "prompts" / "tasks.yaml"
        if tasks_file.is_file():
            lines.append(
                f"| `{rel}/prompts/tasks.yaml` | {tasks_desc} |"
            )

        lines.append("")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Profile directory resolution
# ---------------------------------------------------------------------------

def resolve_profile_dir(agent_id: str, team_tag: str) -> Path:
    if agent_id in ID_PROFILE_DIR_OVERRIDE:
        return PROFILES_BASE / ID_PROFILE_DIR_OVERRIDE[agent_id]
    tag = team_tag.replace("_", "-")
    subdir = TEAM_TO_PROFILE_DIR.get(tag, "meta")
    return PROFILES_BASE / subdir


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

def find_definition_path(agent_dir: Path, sub_agent: str | None,
                         rel_path: str) -> Path | None:
    if sub_agent and rel_path in ("governance", "technology_scout"):
        prefix = sub_agent
        if rel_path == "technology_scout":
            prefix = f"tech-signal-{sub_agent}"
        pattern = f"{prefix}-agent-definition.yaml"
        candidate = agent_dir / pattern
        if candidate.is_file():
            return candidate
        for f in agent_dir.glob("*-definition.yaml"):
            if prefix.replace("_", "-") in f.name:
                return f
        return None

    for f in agent_dir.glob("*-definition.yaml"):
        return f
    return None


def generate_single(agent_dir: Path, sub_agent: str | None = None,
                    rel_path: str = "") -> Path | None:
    def_path = find_definition_path(agent_dir, sub_agent, rel_path)
    if not def_path:
        print(f"  No definition found in {agent_dir}", file=sys.stderr)
        return None

    src = ProfileSources(def_path, agent_dir, sub_agent)
    builder = ProfileBuilder(src)
    content = builder.build()

    agent_id = src.definition.get("id", "unknown")
    tags = src.definition.get("metadata", {}).get("tags", [])
    team_tag = tags[0] if tags else ""

    profile_dir = resolve_profile_dir(agent_id, team_tag)
    profile_dir.mkdir(parents=True, exist_ok=True)

    output_path = profile_dir / f"{agent_id}.md"
    output_path.write_text(content, encoding="utf-8")
    return output_path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate agent profile markdown files"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("agent_dir", nargs="?", help="Path to agent directory")
    group.add_argument("--all", action="store_true", help="Generate all profiles")
    args = parser.parse_args()

    if args.agent_dir:
        agent_dir = Path(args.agent_dir).resolve()
        if not agent_dir.is_dir():
            print(f"Error: {agent_dir} is not a directory", file=sys.stderr)
            sys.exit(1)
        out = generate_single(agent_dir)
        if out:
            print(f"Generated: {out}")
        return

    generated = []
    errors = []
    for _batch, rel_path, sub_agent in AGENT_REGISTRY:
        if "/" in rel_path:
            agent_dir = AGENTS_BASE / rel_path
        else:
            agent_dir = AGENTS_BASE / rel_path
        try:
            out = generate_single(
                agent_dir, sub_agent,
                rel_path.split("/")[0] if "/" not in rel_path else rel_path
            )
            if out:
                generated.append(str(out))
                print(f"Generated: {out.name}")
            else:
                errors.append(f"{rel_path}/{sub_agent or ''}: no definition")
        except Exception as e:
            errors.append(f"{rel_path}/{sub_agent or ''}: {e}")
            print(f"ERROR {rel_path}/{sub_agent or ''}: {e}", file=sys.stderr)

    print(f"\nGenerated: {len(generated)}, Errors: {len(errors)}")
    if errors:
        for err in errors:
            print(f"  {err}", file=sys.stderr)


if __name__ == "__main__":
    main()
