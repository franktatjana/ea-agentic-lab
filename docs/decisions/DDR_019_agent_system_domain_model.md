# DDR-019: Agent System Domain Model

**Status:** ACCEPTED
**Date:** 2026-03-02
**Version:** 3.0
**Category:** Domain Decision Record
**Extends:** DDR-016 (skill architecture), DDR-018 (agent definition alignment)
**Supersedes:** DDR-019 v2.0 (collapsed Skills into Runbooks)

---

## Context

The ea-agentic-lab framework has grown to 33 agent definitions, 50+ playbooks, and 425+ prompts. As the system scaled, several conceptual ambiguities surfaced:

| Problem | Evidence |
|---------|----------|
| Agent identity unclear | "Delivery Agent" conflates a human role, a team of capabilities, and a single definition file |
| Profiles vs definitions mismatch | 32 agent profiles, 33 definitions, different groupings, no clear relationship |
| Playbook ownership model overloaded | Playbooks serve as both agent-level scenario guides AND cross-role orchestration units |
| Skills/flows/prompts hierarchy incomplete | DDR-016 introduced skills between prompts and playbooks, but the compositional model above skills was undefined |
| Extensibility path unclear | No documented pattern for adding new roles (AI Ethics, InfoSec expansion) without restructuring |
| Artificial sub-agent layer | Flows in definitions behave as fixed prompt sequences (runbooks), not as autonomous agents with independent decision-making |
| Skills collapsed into Runbooks (v2.0) | v2.0 merged two distinct concepts: a Skill (what an agent can do) and a Runbook (how to handle a scenario). This removed composability: the same skill should be callable from multiple runbooks |
| Tools not in hierarchy | Tools (connectors to external systems) were mentioned as agent properties but not as a named layer in the composition model |
| No domain knowledge layer | Agents had no formal requirement for domain theory/reference material, leading to LLM hallucination risk |
| No quality gates in sub-agents | Guardrails existed at parent orchestrator and in legacy skill files but not in sub-agent definitions |

The framework needed a domain model that defines what each concept is, how layers compose, when structural complexity is warranted, and how the system extends.

---

## Decision

Adopt a compositional model with distinct building-block layers, agent-owned layers, and organizational layers. The central concept is **Role as Agent (digital twin)**: each human role maps 1:1 to an agent in the system. Each agent is **atomic and self-contained**: it carries its own domain knowledge, skills, tools, guardrails, and runbooks.

### Building Blocks (Reusable, No Ownership)

```text
Prompt  →  Atomic instruction. Reusable across skills, runbooks, and agents.
Tool    →  Connector to an external system. Reusable across agents.
```

### Agent-Owned Layers

```text
Skill     →  What the agent can do. A capability that uses prompts + tools.
              Reusable across runbooks. Example: "Analyze deal health."
Runbook   →  How to handle a scenario. Sequences skills (or prompts) into
              a multi-step process. Example: "Deal went stale" scenario.
Knowledge →  Domain theory and reference material the agent reasons against.
              Prevents hallucination by grounding output in verified facts.
Guardrails→  Quality gates: input validation, output checks, signal validation
              rules. What the agent rejects, what it must verify.
```

### Organizational Layers

The default hierarchy has the role operating as a single agent. When warranted, the holonic extension adds sub-agents.

```text
Default:
  Role (Agent) →  Digital twin. Owns skills + runbooks + tools + knowledge + guardrails.
  Playbook     →  Deal stage scenario. Orchestrates runbooks from across roles.
  Blueprint    →  Deal execution scenario. Composes playbooks.

Holonic extension (when warranted):
  Sub-Agent    →  Atomic, self-contained worker within a role.
                  Owns its own skills + runbooks + tools + knowledge + guardrails.
  Role (Agent) →  Holonic agent. Team of sub-agents.
  Playbook     →  Deal stage scenario. Orchestrates runbooks across roles.
  Blueprint    →  Deal execution scenario. Composes playbooks.
```

The system follows a holonic architecture (Koestler, 1967). A holon is a stable, coherent structure that is simultaneously a whole and a part of a larger whole. Each role agent is a holon: complete in itself, yet a component within larger playbooks and blueprints. When a role's complexity warrants it, the agent decomposes into sub-agents, each a holon with its own skills, runbooks, tools, knowledge, and guardrails.

### Key Design Decisions

**1. Role = Agent (digital twin).**

Each human role in the organization (AE, Delivery Manager, SA) maps 1:1 to an agent in the system. The human and the agent are two views of the same entity: the profile describes the role from the human perspective, the definition describes it from the system perspective. When someone says "the AE," they mean both the person and the agent, depending on context.

**2. Default: single agent with skills and runbooks.**

Most roles operate as one agent with multiple skills and runbooks. The agent selects which runbook to activate based on incoming signals, then executes the appropriate skill/prompt sequence. This is the simplest honest representation of the system's current behavior.

**3. Skills are not Runbooks.**

A skill is what the agent can do (a capability). A runbook is how the agent handles a specific scenario (a process). Skills are reusable across runbooks. "Deal Health Analysis" as a skill gets called from the "stale deal" runbook, the "QBR prep" runbook, and the "pipeline review" runbook. Collapsing them removes composability. v2.0 of this decision made that mistake, v3.0 corrects it.

**4. Conditional sub-agents (holonic decomposition).**

Sub-agents are warranted only when capabilities within a role require genuinely different tools, different guardrails, autonomous decision-making (choosing which runbook to execute based on context), or separate state. If all flows share the same tools, guardrails, and knowledge base, they are runbooks of a single agent, not sub-agents.

**5. Every agent carries domain knowledge.**

An agent without domain knowledge is an LLM with a prompt, prone to hallucination. Every agent (and sub-agent) must declare its knowledge references: the domain theory, frameworks, classification rules, and thresholds it reasons against. Knowledge is loaded at reasoning time, not baked into prompts.

**6. Every agent has guardrails (quality gates).**

Guardrails are not optional. Every agent must define input validation (what it rejects), output checks (what it verifies before returning), and signal validation rules (what evidence it requires before acting). This applies equally to sub-agents, not just parent orchestrators.

**7. Runbooks are agent-owned, playbooks are orchestration-only.**

Runbooks live inside agents and define how the agent handles specific scenarios. Playbooks live outside agents and define which runbooks from which roles contribute to a deal stage. Agents evolve their capabilities independently, playbooks evolve their choreography independently.

**8. Playbooks have trust tiers, not agents.**

Trust level (autonomous / review-before-publish / human-decides) is a property of the scenario, not the agent. The same agent might produce a weekly status summary autonomously but require human review for an escalation brief. Trust is encoded per playbook.

**9. Composition rules prevent layer-skipping.**

Blueprints reference playbooks, never agents directly. Playbooks reference runbooks, never prompts directly. This constraint keeps each layer's interface clean and prevents hidden dependencies.

**10. Learning targets the lowest possible layer.**

When Knowledge Curators detect patterns from outcomes in InfoHub, they suggest changes at the most specific layer that addresses the issue. A prompt reword is cheaper than a new skill, which is cheaper than a new runbook, which is cheaper than a new agent. Changes propagate upward naturally.

### Terminology Mapping

| Domain Model | Current Codebase | Location |
|---|---|---|
| Prompt | Prompt registry entry / tasks.yaml | `prompts/tasks.yaml` |
| Tool | Tool definitions in agent spec | `tools:` section in definition YAML |
| Skill | Skill YAML | `skills/` directory per agent |
| Runbook | Flow with workflow_shorthand | `flows:` section in definition YAML |
| Knowledge | Reference YAML | `references/` directory per agent |
| Guardrails | Guardrails block | `x-ea-agent.guardrails` in definition YAML |
| Sub-Agent | Sub-agent definition file | e.g. `ae-deal-diagnosis-definition.yaml` |
| Role (Agent) | Agent definition file | e.g. `ae-agent-definition.yaml` |
| Playbook | Playbook YAML | `domain/playbooks/` |
| Blueprint | Node enabled_playbooks | Node configuration |

### Relationship to DDR-016 (Skill Architecture)

DDR-016 introduced a three-layer hierarchy: Prompts → Skills → Playbooks. v2.0 of this decision collapsed Skills into Runbooks, which was incorrect. Skills and Runbooks serve different purposes:

- **Skill** = what the agent can do (a capability that uses prompts + tools)
- **Runbook** = how the agent handles a scenario (a process that sequences skills)

v3.0 restores Skills as a distinct layer and adds Runbooks alongside them. A Skill is reusable across runbooks. A Runbook is a scenario-specific composition. The skill catalog from DDR-016 remains valid as the agent's capability inventory.

---

## Consequences

### What Changes from v2.0

- **Skills restored as distinct layer.** Skills are the agent's capability catalog (what it can do), separate from runbooks (how it handles scenarios). The v2.0 collapse is reversed.
- **Tool recognized as named layer.** Tools are connectors to external systems, declared per agent, reusable across the system.
- **Knowledge is mandatory.** Every agent and sub-agent must declare domain knowledge references. An agent without knowledge is an LLM guessing.
- **Guardrails are mandatory.** Every agent and sub-agent must define input validation, output checks, and signal validation rules. Not just the parent orchestrator.
- **Sub-agents are atomic and self-contained.** Each sub-agent carries its own skills, runbooks, tools, knowledge, and guardrails. It is independently deployable and loosely coupled.

### What Stays from v2.0

- Agent definitions are understood as **role specifications**
- Flows within definitions are understood as **runbooks**
- Sub-agents are introduced only when concrete criteria are met
- "Role Profiles" = human view, "Agent Definitions" = system view
- Playbooks are **cross-role orchestration units**
- The holonic concept is the theoretical foundation for recursive agent composition

### What Stays from v1.0

- File structure: `domain/agents/{team}/` directories unchanged
- Agent definition YAML format (Oracle Agent Spec 26.1.0 alignment from DDR-018)
- Playbook YAML files and their location
- CAF prompt format in tasks.yaml
- InfoHub structure and Knowledge Curator role

### Extensibility Pattern

Adding a new human role follows a documented pattern:

1. Create the role agent with skills (capabilities) and runbooks (scenario processes)
2. Define domain knowledge references (theory, frameworks, classification rules)
3. Define guardrails (input validation, output checks, signal validation)
4. Reuse existing prompts and tools where possible
5. Create new playbooks that compose the new role's runbooks with existing roles
6. Update blueprints to include new playbooks
7. Assess holonic decomposition: only introduce sub-agents when the criteria are met, not preemptively

The new role benefits immediately from existing infrastructure (InfoHub, governance agents, knowledge curators) without changes to other roles.

---

## Reference

Full domain model specification: [Agent System Domain Model](../architecture/system/domain-model.md)

---

## Decision Participants

Domain model designed through iterative refinement, challenging assumptions around agent sharing, playbook ownership, role-agent relationships, sub-agent justification, and compositional boundaries.
