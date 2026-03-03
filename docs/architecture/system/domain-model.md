---
order: 2
---

# Agent System Domain Model

**Version:** 3.0
**Date:** 2026-03-02
**Status:** Design Reference
**Depends on:** [Core Entities](core-entities.md)
**Decision Record:** [DDR-019](../../decisions/DDR_019_agent_system_domain_model.md)

---

## Overview

The agent system uses a compositional model where each layer is independently evolvable: changing a prompt doesn't require changing a skill, adding a skill doesn't require changing a runbook, adding a runbook doesn't require changing a role. This separation enables the system to grow and adapt without cascading rewrites.

The central concept is the **Role as Agent**: each human role in the organization (AE, Delivery Manager, Solution Architect) has a digital twin in the system. Each agent is **atomic and self-contained**: it carries its own domain knowledge, skills, tools, guardrails, and runbooks. The human sets intent and retains accountability, the agent coordinates execution through its capabilities.

The system follows a **holonic architecture** (Koestler, 1967). A holon is a stable, coherent structure that is simultaneously a whole and a part of a larger whole. Each role agent is a holon: complete in itself (owns skills, runbooks, tools, knowledge, guardrails), yet also a component within larger playbooks and blueprints. When a role's complexity warrants it, the agent can decompose into sub-agents, each a holon in its own right, creating a recursive structure at any depth needed.

Playbooks orchestrate agent contributions across roles. Blueprints orchestrate playbooks into deal execution scenarios.

---

## Layer Hierarchy

The model separates building blocks (reusable, no ownership) from agent-owned layers and organizational layers. Most roles operate as a single agent. When warranted, the holonic extension adds sub-agents.

```text
Building Blocks:
  Prompt       →  Atomic, reusable instruction
  Tool         →  Connector to an external system

Agent-Owned:
  Skill        →  What the agent can do (capability, uses prompts + tools)
  Runbook      →  How to handle a scenario (sequences skills into a process)
  Knowledge    →  Domain theory and reference material
  Guardrails   →  Quality gates (input validation, output checks)

Organizational (default):
  Role (Agent) →  Digital twin (owns skills + runbooks + tools + knowledge + guardrails)
  Playbook     →  Deal stage scenario, orchestrates runbooks across roles
  Blueprint    →  Deal execution scenario, composes playbooks

Organizational (holonic extension):
  Sub-Agent    →  Atomic, self-contained worker (own skills + runbooks + tools + knowledge + guardrails)
  Role (Agent) →  Holonic agent, team of sub-agents
  Playbook     →  Deal stage scenario, orchestrates runbooks across roles
  Blueprint    →  Deal execution scenario, composes playbooks
```

```text
┌─────────────────────────────────────────────────────────────────────┐
│  BLUEPRINT                                                          │
│  Deal execution scenario. Composes playbooks.                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  PLAYBOOK                                                     │  │
│  │  Cross-role orchestration. Composes agent runbooks.            │  │
│  │  Has: owner, domain, trust tier.                              │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │  ROLE (Agent) or SUB-AGENT                             │   │  │
│  │  │  Atomic, self-contained. Owns everything below.        │   │  │
│  │  ├────────────────────────────────────────────────────────┤   │  │
│  │  │  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐ │   │  │
│  │  │  │  KNOWLEDGE   │  │  GUARD-  │  │  SKILL           │ │   │  │
│  │  │  │  Domain      │  │  RAILS   │  │  Capability that │ │   │  │
│  │  │  │  theory,     │  │  Quality │  │  uses prompts +  │ │   │  │
│  │  │  │  references  │  │  gates   │  │  tools           │ │   │  │
│  │  │  └──────────────┘  └──────────┘  └──────────────────┘ │   │  │
│  │  │                                                        │   │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │   │  │
│  │  │  │  RUNBOOK                                        │   │   │  │
│  │  │  │  Scenario process. Sequences skills.            │   │   │  │
│  │  │  ├─────────────────────────────────────────────────┤   │   │  │
│  │  │  │  ┌────────────────┐   ┌──────────────────────┐  │   │   │  │
│  │  │  │  │  PROMPT         │   │  TOOL                │  │   │   │  │
│  │  │  │  │  Atomic         │   │  Connector to        │  │   │   │  │
│  │  │  │  │  instruction    │   │  external system     │  │   │   │  │
│  │  │  │  └────────────────┘   └──────────────────────┘  │   │   │  │
│  │  │  └─────────────────────────────────────────────────┘   │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Layer Definitions

### Prompt

The smallest composable unit. A single instruction that produces a specific output from a specific input. Prompts are reusable across skills, runbooks, and agents.

**Properties:**

- Input parameters (typed)
- Output format
- Context requirements

**Example:** `triage_escalation` takes escalation context, produces a triage assessment with decision and response plan.

---

### Tool

A connector to an external system. Tools define how agents access information and perform actions outside their own reasoning. Each tool declares its inputs, outputs, risk level, and whether it requires human confirmation.

**Properties:**

- Connector type (read, write, ask)
- Input/output schema
- Risk level (low, medium, high)
- Confirmation requirement (true/false)

**Example:** `read-crm-data` accesses CRM fields and opportunity data. `write-risk-alert` saves a deal-level risk alert to InfoHub (requires confirmation).

**Design principle:** Tools are reusable across agents. The same `read-crm-data` tool can appear in Deal Diagnosis, Pipeline Management, and Meeting Preparation agents. Each agent declares which tools it uses, but the tool definition is shared.

---

### Skill

What the agent can do. A skill is a reusable capability that combines a prompt with the tools needed to execute it. Skills are the agent's capability catalog, independent of any specific scenario.

A skill is reusable across runbooks. "Analyze deal health" as a skill gets called from the "stale deal" runbook, the "QBR prep" runbook, and the "pipeline review" runbook.

**Properties:**

- Capability name and description
- Prompt reference (which instruction to execute)
- Tools used (which connectors are needed)
- Input/output schema
- Guardrails specific to this capability

**Example:**

```yaml
skill: analyze_deal_health
  description: Score deal health from engagement signals, risks, and positive indicators
  prompt: ae-analyze-deal-health
  tools: [read-crm-data, read-communications]
  inputs: [account_context, opportunity_name, time_period]
  outputs: [deal_health_assessment]
```

**Design principle:** Skills are not runbooks. A skill is a single capability (what the agent can do). A runbook is a scenario process (how the agent handles a situation by sequencing skills). Collapsing them removes composability.

---

### Runbook

How to handle a scenario. A runbook sequences skills (or prompts) into a multi-step process for a specific situation. Runbooks define the data flow between steps: one step's output becomes the next step's input.

**Properties:**

- Scenario name and description
- Ordered steps (each step references a skill or prompt)
- Data flow between steps
- Expected output

**Example:**

```yaml
runbook: escalation_handling
  description: Triage, resolve, and learn from incoming escalations
  steps:
    - step: 1
      skill: triage_escalation
      input: source_agent, account_name, escalation_type, urgency_level
      output: triage_assessment
    - step: 2
      skill: resolve_escalation
      input: triage_assessment, issue_summary, options
      output: resolution_record
    - step: 3
      skill: pattern_recognition
      input: resolution_record, historical_escalations
      output: pattern_analysis
```

**Design principle:** Skills are reusable across runbooks. The same `triage_escalation` skill can appear in `escalation_handling`, `critical_incident_response`, and `weekly_escalation_review` runbooks, wired to different subsequent steps.

---

### Knowledge

Domain theory and reference material the agent reasons against. Knowledge prevents hallucination by grounding output in verified facts, frameworks, and classification rules rather than relying on the LLM's general training data.

**Properties:**

- Reference path (file location)
- Description (what this knowledge covers)
- Load condition (when to inject into context)

**Example:**

```yaml
knowledge:
  references:
    - path: references/signal-detection.yaml
      description: Commercial risk keywords, severity indicators, relationship health signals
      load_when: Analyzing deal signals from communications or CRM data
    - path: references/risk-classification.yaml
      description: Severity definitions (HIGH/MEDIUM/LOW) and escalation criteria
      load_when: Classifying deal risks or recommending escalation
```

**Design principle:** Every agent and sub-agent must declare its knowledge references. An agent without domain knowledge is an LLM guessing. Knowledge is loaded at reasoning time, not baked into prompts, so it can be updated independently.

---

### Guardrails

Quality gates that define what the agent rejects, what it must verify, and what output standards it enforces. Guardrails prevent the agent from acting on insufficient evidence or producing unvalidated output.

**Properties:**

- Input validation (what the agent rejects before processing)
- Output checks (what the agent verifies before returning results)
- Signal validation (what evidence is required before acting)
- Resource limits (max tool calls, max reasoning steps)

**Example:**

```yaml
guardrails:
  input:
    - Reject deal analysis without account context or signal source
    - Stop and clarify if stakeholder names are not verifiable in source content
  output:
    - Always include risk severity classification with evidence
    - Every action item has owner and due date
    - No assumed stakeholder sentiments or motivations
    - All commercial values include currency units
  resource:
    - max_tool_calls: 30
```

**Design principle:** Guardrails are mandatory for every agent and sub-agent, not just parent orchestrators. A sub-agent that can produce unvalidated output undermines the entire chain.

---

### Role (Agent)

The digital twin of a human role. Each human position in the organization (AE, Delivery Manager, Solution Architect) maps 1:1 to a role agent in the system. The role agent is atomic and self-contained: it owns skills, runbooks, tools, knowledge, guardrails, and a personality.

The human and the role agent are two views of the same entity: the **profile** describes the role from the human perspective (purpose, accountability, escalation rules), the **definition** describes the agent from the system perspective (skills, runbooks, tools, knowledge, guardrails).

**Properties:**

- Human role served (1:1 mapping)
- Set of skills (capability catalog)
- Set of runbooks (scenario processes)
- Tools (connectors to external systems)
- Knowledge (domain theory and references)
- Guardrails (quality gates)
- Personality (behavioral priorities, communication style)
- Optional: sub-agents (see [Holonic Decomposition](#holonic-decomposition))

**Example (default, no sub-agents):**

```yaml
role: senior_manager
  title: Senior Manager
  skills:
    - triage_escalation
    - evaluate_bid
    - assess_coaching_need
  runbooks:
    - escalation_handling
    - bid_decisions
    - coaching
    - executive_engagement
    - portfolio_oversight
    - resource_allocation
  tools:
    - read_senior_manager_data
    - write_senior_manager_artifact
    - ask_user
  knowledge:
    - references/escalation-criteria.yaml
    - references/bid-thresholds.yaml
  guardrails:
    input:
      - Never approve without sufficient context
    output:
      - Every decision includes rationale and evidence
      - Never commit resources not available
```

**Design principle:** The role agent is the default boundary. Most roles operate as a single agent with multiple skills and runbooks. The agent selects which runbook to activate based on incoming signals. This is the simplest honest representation of the system's behavior.

**Digital twin association:** The role agent is the system's representation of the human role. When someone says "the Senior Manager," they mean both the person and the agent, depending on context. The system sees the agent, the organization sees the human.

---

### Playbook

A deal stage scenario that orchestrates runbooks from across multiple roles. The playbook defines the choreography: which agents contribute, in what order, with what data flow. The playbook has an owner (role), a domain description (what this scenario is and why it matters), and a trust tier.

**Properties:**

- Owner (role)
- Domain description (what, why, who contributes)
- Trust tier (autonomous / review-before-publish / human-decides)
- Steps (references to agent runbooks from any role)
- Boundaries (scenario-level constraints)

**Trust tiers:**

| Tier | Meaning | Example |
|------|---------|---------|
| `autonomous` | Agent outputs go directly to InfoHub | Weekly status summary |
| `review` | Human reviews before output is published | QBR section, escalation brief |
| `human-decides` | Human makes the final call, agents provide analysis | Go/No-Go recommendation |

**Example:**

```yaml
playbook: PB_603_sales_qbr
  owner: ae
  domain: >
    Quarterly Business Review consolidates deal health, competitive
    landscape, value metrics, technical risks, and adoption data
    into a single stakeholder-ready document.
  trust_tier: review
  steps:
    - role: ae
      runbook: qbr_standard_review
      output: deal_summary
    - role: ci
      runbook: competitive_scan_for_qbr
      input: deal_summary
      output: competitive_context
    - role: ve
      runbook: value_summary_for_qbr
      input: deal_summary
      output: value_metrics
    - role: sa
      runbook: tech_eval_for_qbr
      input: deal_summary
      output: technical_risks
    - role: ca
      runbook: adoption_metrics_for_qbr
      output: adoption_data
  boundaries:
    - No forward-looking revenue projections without evidence
    - All competitive claims must be sourced
```

**Design principle:** Playbooks are the coordination layer. No agent needs to understand another agent's domain. The playbook defines what each role contributes and how outputs flow between them. The owning role reviews the assembled result.

---

### Blueprint

A deal execution scenario that composes playbooks. Blueprints define which playbooks are active for a specific type of engagement and in what order they execute across the deal lifecycle.

**Relationship to Core Entities:** In the [Core Entities](core-entities.md) model, the Blueprint is the global governance model. At the Node level, the `enabled_playbooks` configuration determines which playbooks from the Blueprint are active for that specific initiative. The deal execution scenario is this Node-level selection and sequencing.

**Example:**

```yaml
blueprint: enterprise_displacement
  description: >
    Full displacement of an incumbent vendor across a strategic
    account. Requires deep competitive intelligence, value
    quantification, technical risk assessment, and stakeholder
    management throughout a multi-quarter sales cycle.
  playbooks:
    discovery:
      - PB_ACI_001  # Account Research
      - PB_ACI_002  # Org Mapping
    qualification:
      - PB_701      # Competitive Landscape
      - PB_301      # Value Engineering
      - PB_201      # SWOT Analysis
    execution:
      - PB_101      # Architecture Decision Record
      - PB_302      # Stakeholder Mapping
    governance:
      - PB_603      # Sales QBR (recurring)
      - PB_DEL_003  # Implementation Risk Review (recurring)
    close:
      - PB_DEL_001  # Implementation Kickoff
      - PB_DEL_002  # Go-Live Readiness
```

---

## Holonic Decomposition

The system follows a holonic architecture where each agent is both a whole and a part. By default, a role operates as a single agent with skills and runbooks. When a role's complexity crosses specific thresholds, it decomposes into sub-agents, each a holon that is complete in itself (own skills, runbooks, tools, knowledge, guardrails) yet part of the parent role.

This is not automatic or arbitrary. Sub-agents earn the label only when they meet concrete criteria that justify the added structural complexity.

### When Sub-Agents Are Warranted

Sub-agents represent genuine autonomy differences within a role. A role should decompose into sub-agents when its capabilities require:

**Different tools.** A technical evaluation sub-agent that reads architecture docs and runs compatibility checks vs. a risk assessment sub-agent that queries incident databases and reads compliance frameworks. If all capabilities use the same tools, the sub-agent layer is artificial.

**Different knowledge domains.** A deal diagnosis sub-agent that needs signal detection theory and risk classification rules vs. a qualification sub-agent that needs MEDDPICC framework definitions and scoring criteria. If all capabilities reason against the same reference material, they share a knowledge base and don't need separation.

**Different guardrails.** A proactive scanning sub-agent with read-only access vs. an action sub-agent that can write artifacts and send notifications. If all capabilities share the same behavioral boundaries, separate guardrails don't justify separate agents.

**Autonomous decision-making.** A sub-agent that chooses which runbook to execute based on observed context, not just running a fixed sequence. If a "sub-agent" always executes the same steps in the same order, it's a runbook, not an agent.

**Separate state.** A sub-agent that maintains its own working memory independent of the parent, tracking context that other sub-agents don't need. If all capabilities share the same state, one agent with multiple runbooks is simpler and more honest.

### When Sub-Agents Are Not Warranted

If a role's flows share the same tools, the same guardrails, the same knowledge base, and execute fixed prompt sequences without autonomous decision-making, they are runbooks of a single agent. Calling them sub-agents inflates terminology without adding capability.

#### Example: Senior Manager Agent (no sub-agents)

The Senior Manager has 6 runbooks (escalation handling, bid decisions, coaching, executive engagement, portfolio oversight, resource allocation). All 6 share the same 3 tools, the same guardrails, the same knowledge base. Each runbook is a fixed 3-step prompt sequence. The agent selects which runbook to activate, but the runbooks themselves don't make autonomous decisions. This role operates correctly as a single agent.

#### Example: Solution Architect Agent (sub-agents warranted)

The SA role might decompose into sub-agents when:

- A `tech_evaluation` sub-agent needs read access to architecture docs, compatibility databases, and vendor APIs (tools the other sub-agents don't use)
- A `risk_assessment` sub-agent operates under stricter guardrails: must flag all risks, no optimism bias, mandatory human review on HIGH severity
- A `design_review` sub-agent maintains persistent state about reference architectures and patterns across engagements

Each sub-agent has genuinely different capabilities, boundaries, and state requirements, justifying the holonic decomposition.

### Holonic Structure (when warranted)

```yaml
role: solution_architect
  title: Solution Architect
  sub_agents:
    - agent: sa_tech_evaluation
      skills: [evaluate_platform, assess_integration, benchmark_performance]
      tools: [read_architecture_docs, check_compatibility, query_vendor_api]
      knowledge: [references/platform-criteria.yaml, references/integration-patterns.yaml]
      guardrails:
        input: [Reject evaluation without architecture context]
        output: [Never recommend without compatibility verification]
      runbooks:
        - platform_evaluation
        - integration_assessment

    - agent: sa_risk_assessment
      skills: [assess_technical_risk, review_security, analyze_compliance_gap]
      tools: [read_infohub, query_incident_db, read_compliance_framework]
      knowledge: [references/risk-framework.yaml, references/compliance-standards.yaml]
      guardrails:
        input: [Reject risk assessment without system context]
        output: [Must flag all identified risks, no optimism bias, mandatory human review on HIGH]
      runbooks:
        - technical_risk_assessment
        - security_review

    - agent: sa_design_review
      skills: [review_architecture, recommend_patterns, plan_migration]
      tools: [read_reference_architectures, write_architecture_artifact]
      knowledge: [references/reference-architectures.yaml, references/design-patterns.yaml]
      guardrails:
        input: [Reject review without current architecture documentation]
        output: [Must reference established patterns, document all deviations]
      state: [reference_architecture_library, cross_engagement_patterns]
      runbooks:
        - architecture_review
        - migration_planning
```

---

## Composition Rules

Each layer composes the layer below it. No layer reaches down more than one level.

```text
Blueprint    ──references──►  Playbooks
Playbook     ──references──►  Agent Runbooks (from across roles)
Role         ──contains───►   Skills + Runbooks (default) or Sub-Agents (holonic)
Sub-Agent    ──contains───►   Skills + Runbooks + Knowledge + Guardrails
Runbook      ──sequences──►   Skills (or Prompts directly)
Skill        ──uses────────►  Prompts + Tools
```

**What this prevents:**

- Blueprints never reference agents directly (always through playbooks)
- Playbooks never contain prompts directly (always through runbooks)
- Agents never know about other agents (playbooks handle coordination)
- Prompts never know what skill or runbook they belong to (fully reusable)
- Skills never know what runbook calls them (fully reusable)

---

## Two Views of the Same Entity

The role-as-agent concept creates two complementary views of the same entity:

| View | Audience | Shows | Location |
|------|----------|-------|----------|
| **Profile** (human view) | Organization, stakeholders | Purpose, capabilities, stakeholders, operational domains, playbook RACI, knowledge frameworks | Role Profiles page |
| **Definition** (system view) | Developers, architects | Skills, runbooks, tools, knowledge references, guardrails, prompts | Agent Definitions page |

This explains why profiles and definitions have different counts. Not every role needs a fully specified definition yet, and some definitions exist for infrastructure functions (governance, knowledge curation) that don't map to a single human role.

---

## Evolution and Learning

The system evolves through a feedback loop mediated by Knowledge Curators. When agents execute runbooks, outcomes are documented in the Node's InfoHub. Knowledge Curators analyze these outcomes and suggest changes at the appropriate layer.

```text
Agent executes runbook
  → Outcome documented in InfoHub
  → Knowledge Curators detect patterns
  → Analysis: what happened, why, across which accounts
  → Suggestions flow to the right layer:

    Prompt-level:    "Reword triage_escalation to capture urgency signals earlier"
    Tool-level:      "Add a new data source connector for vendor API"
    Skill-level:     "Add output validation to deal_health_analysis skill"
    Knowledge-level: "Update risk-classification thresholds based on Q1 outcomes"
    Guardrail-level: "Tighten signal validation: require 2+ sources for HIGH severity"
    Runbook-level:   "Add a step for competitive pricing comparison"
    Agent-level:     "Add a market_research tool to the VE agent"
    Playbook-level:  "Include InfoSec review step in displacement playbooks"
    Blueprint-level: "Add a new compliance playbook for regulated industries"
```

**Design principle:** Learning targets the lowest possible layer. A prompt fix is cheaper than a skill change, which is cheaper than a runbook change, which is cheaper than a new agent. Curators suggest changes at the most specific level that addresses the pattern.

---

## Mapping to Current Codebase

The codebase implements all layers. This mapping translates between the domain model and file structures.

| Domain Model | Codebase | Location |
|---|---|---|
| Prompt | Prompt registry / tasks.yaml | `{agent}/prompts/tasks.yaml` |
| Tool | Tool definitions in agent spec | `tools:` section in definition YAML |
| Skill | Skill YAML | `{agent}/skills/` directory |
| Runbook | Flow with workflow_shorthand | `flows:` section in definition YAML |
| Knowledge | Reference YAML | `{agent}/references/` directory |
| Guardrails | Guardrails block | `x-ea-agent.guardrails` in definition YAML |
| Sub-Agent | Sub-agent definition file | e.g. `ae-deal-diagnosis-definition.yaml` |
| Role (Agent) | Agent definition file | e.g. `ae-agent-definition.yaml` |
| Playbook | Playbook YAML | `domain/playbooks/` |
| Blueprint | Node enabled_playbooks + Blueprint config | Node configuration |

**Reference implementation: AE Agent.** The Account Executive role serves as the scaffold for all other roles. It demonstrates the full holonic structure: parent orchestrator with 7 atomic sub-agents, each owning its own skills, runbooks, tools, knowledge references, and guardrails. See `domain/agents/account_executives/` for the complete file structure.

---

## Extensibility

Adding a new human role to the system follows a predictable pattern.

### Example: Adding an AI Ethics Officer role

1. **Create the role agent:** Define skills (capabilities) and runbooks (scenario processes)
   - Skills: `detect_bias`, `assess_fairness`, `check_compliance`
   - Runbooks: `bias_assessment`, `fairness_audit`, `compliance_check`

2. **Define domain knowledge:** Create reference files the agent reasons against
   - `references/ethics-frameworks.yaml` (AI ethics principles, bias indicators)
   - `references/compliance-standards.yaml` (regulatory requirements, audit criteria)

3. **Define guardrails:** Quality gates for input validation and output checks
   - Input: reject assessment without system context or training data documentation
   - Output: every finding must include evidence, severity, and remediation path

4. **Reuse existing building blocks:**
   - Reuse prompts: `assess_risk_severity`, `format_report_section`
   - Reuse tools: `read_infohub`, `write_artifact`

5. **Create new building blocks where needed:**
   - New prompts: `detect_bias_indicators`, `map_to_ethics_framework`
   - New skills: `detect_bias`, `assess_fairness`
   - New playbook: `PB_ETH_001` (Ethics Review, composes runbooks from ethics role + risk radar + SA)

6. **Update blueprints:** Add `PB_ETH_001` to relevant deal execution scenarios

7. **Assess holonic decomposition:** If the ethics role later needs sub-agents (e.g., a compliance sub-agent with access to regulatory databases vs. an audit sub-agent with read-only access to production systems), decompose at that point, not preemptively.

The new role immediately benefits from existing knowledge infrastructure (InfoHub, curators, governance agents) without requiring changes to other roles.

---

## Validation Rules

### Role Validation

- Each role maps to exactly one human position
- Role must contain at least one skill and one runbook (or at least one sub-agent if holonic)
- Role must declare knowledge references (domain theory)
- Role must declare guardrails (input/output quality gates)

### Skill Validation

- Each skill references a valid prompt
- Each skill declares which tools it uses
- Skills within an agent must not have overlapping outputs

### Runbook Validation

- Steps must be sequentially numbered
- Each step references a valid skill or prompt
- Data flow must be acyclic (no step depends on a later step's output)
- Expected output must be defined

### Knowledge Validation

- Every agent and sub-agent must declare at least one knowledge reference
- Each reference must specify a load condition (when to inject into context)
- Knowledge files must exist at the declared path

### Guardrails Validation

- Every agent and sub-agent must declare guardrails
- Guardrails must include at least input validation and output checks
- Sub-agent guardrails must not contradict role-level boundaries

### Sub-Agent Validation (holonic roles only)

- Each sub-agent must meet at least one sub-agent criterion (different tools, different knowledge domains, different guardrails, autonomous decisions, or separate state)
- Each sub-agent has at least one skill and one runbook
- Each sub-agent declares its own knowledge references and guardrails
- Tools must be declared (no implicit external access)
- No sub-agent belongs to more than one role

### Playbook Validation

- Owner must reference a valid role
- Trust tier must be one of: autonomous, review, human-decides
- Each step must reference a valid role and runbook
- Boundaries must not contradict referenced agents' guardrails

### Blueprint Validation

- All referenced playbooks must exist
- Playbook stages must reflect a logical deal lifecycle progression

---

**This document defines the compositional model for the agent system. It extends the [Core Entities](core-entities.md) model with internal agent structure, holonic decomposition criteria, and orchestration semantics.**
