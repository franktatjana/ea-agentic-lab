---
title: "Orchestration Patterns"
description: "Five canonical agentic orchestration patterns and how they map to the ea-agentic-lab domain model"
category: "architecture"
keywords: ["orchestration", "prompt-chaining", "routing", "parallelization", "orchestrator-workers", "evaluator-optimizer"]
last_updated: "2026-04-06"
---

# Orchestration Patterns

Multi-agent systems use a small set of recurring coordination patterns. The literature converges on five canonical patterns (Anthropic Building Effective Agents, 2024; LangChain multi-agent architectures). Each pattern solves a different coordination problem. Most production systems combine several patterns rather than committing to one.

This document names the five patterns, explains when each applies, and maps each to the ea-agentic-lab domain model so that readers can trace from theory to implementation.

For the domain model itself, see [Domain Model](domain-model.md). For process-level orchestration across roles, see [Process Orchestration Overview](process-orchestration-overview.md). For the design-time orchestration agent, see [Orchestration Agent Architecture](../agents/orchestration-agent.md).

---

## Pattern Summary

| Pattern | Core idea | ea-agentic-lab realization |
|---------|-----------|----------------------------|
| Prompt Chaining | Sequential steps, output feeds next input | Runbooks (skill sequences within an agent) |
| Routing | Classify input, dispatch to specialist | Orchestrator system prompts with routing rules |
| Parallelization | Independent tasks run concurrently, results aggregated | Process steps with no dependencies (design-level) |
| Orchestrator-Workers | Decompose task, delegate to workers, collect results | Holonic decomposition (parent orchestrator + sub-agents) |
| Evaluator-Optimizer | Generate, evaluate, iterate until quality threshold met | Guardrails + trust tiers + Knowledge Curators |

---

## 1. Prompt Chaining

Sequential calls where the output of one step becomes the input of the next.

**When to use.** The task can be clearly divided into linear steps where each step depends on the previous result. Adding validation or transformation between steps improves reliability.

**In the domain model.** Prompt chaining maps to **Runbooks**. A runbook sequences skills into a multi-step process. Each skill uses prompts and tools to produce a specific output, and that output feeds the next skill in the chain.

```text
Runbook: technical_risk_assessment
  Step 1  assess_architecture     → architecture_analysis
  Step 2  evaluate_dependencies   → dependency_report (uses architecture_analysis)
  Step 3  classify_risk_level     → risk_classification (uses dependency_report)
  Step 4  generate_mitigation     → mitigation_plan (uses risk_classification)
```

**Where implemented.** Every agent definition contains `flows:` sections that sequence skills. The VE agent's 27 runbook prompts (`domain/agents/value_engineering/prompts/tasks.yaml`) are the reference implementation, each prompt structured as a numbered STEP chain with named deliverables per step.

**Related docs.** [Domain Model: Runbook layer](domain-model.md), [Runbook Design Principles](../playbooks/runbook-design-principles.md)

---

## 2. Routing

Classification of the input and dispatch to a specialized handler.

**When to use.** Different types of requests require different tools, knowledge, or prompts. A single entry point classifies the request and forwards it to the right specialist, avoiding a monolithic agent that tries to handle everything.

**In the domain model.** Routing maps to the **Runtime Orchestrator Pattern**. When a role decomposes into sub-agents, the parent agent becomes a routing orchestrator. Its system prompt contains explicit routing rules that map task types to sub-agents.

```text
AE Orchestrator routing rules (excerpt):
  deal health / diagnosis      → Deal Diagnosis Agent
  pipeline status / forecast   → Pipeline Management Agent
  stakeholder / org chart      → Stakeholder Intelligence Agent
  competitive / market signal  → Signal Detection Agent
  qualification / MEDDPICC     → Qualification Agent
```

**Where implemented.** The AE Agent definition (`domain/agents/account_executives/ae-agent-definition.yaml`, lines 27-92) contains the reference routing implementation with rules for 9 sub-agents. The SA and VE orchestrators follow the same pattern.

**Related docs.** [Domain Model: Runtime Orchestrator Pattern](domain-model.md), [Orchestration Agent Architecture](../agents/orchestration-agent.md)

---

## 3. Parallelization

Multiple independent tasks execute simultaneously, results are aggregated.

**When to use.** Tasks do not depend on each other and speed or breadth matters. Common variants: sectioning (splitting input into independent chunks processed in parallel) and voting (running the same task multiple times for consensus).

**In the domain model.** Parallelization maps to **Process steps with no dependencies**. The process orchestration layer explicitly supports concurrent execution: "Steps can run sequentially (step 2 depends on step 1) or in parallel (steps 2 and 3 run concurrently after step 1)."

```text
PROC-2024-041: RFP Technical & Commercial Analysis
  Step 1  SA Agent: technical requirements analysis     ─┐
  Step 2  AE Agent: commercial fit assessment            ├─ parallel
  Step 3  CI Agent: competitive positioning              ─┘
  Step 4  Consolidation: merge into unified brief        ← sequential (waits for 1-3)
```

**Where implemented.** The four registered processes in [Process Orchestration Overview](process-orchestration-overview.md) define parallel steps at the process level. At the agent level, the `trigger_agent` output type and reactive routing enable concurrent sub-agent activation when conditions are met independently. However, agent definition YAMLs do not yet declare an explicit `execution_mode: parallel` field, so parallelization remains a design-level concept rather than a runtime specification.

**Related docs.** [Process Orchestration Overview](process-orchestration-overview.md), [Process Schema](process-schema.md)

---

## 4. Orchestrator-Workers

An orchestrator decomposes the task and delegates to specialized workers, then collects results.

**When to use.** Complex tasks require specialization. The orchestrator understands the full problem but delegates domain-specific work to workers that have the right tools, knowledge, and guardrails for their slice.

**In the domain model.** Orchestrator-Workers maps to **Holonic Decomposition**, the primary structural pattern in the system. A role decomposes into sub-agents when capabilities require different tools, different knowledge domains, different guardrails, or autonomous decision-making. The parent becomes a routing orchestrator, the children become atomic workers.

```text
AE Agent (orchestrator)
  ├── Deal Diagnosis Agent       (tools: CRM, risk models)
  ├── Pipeline Management Agent  (tools: forecast engine)
  ├── Stakeholder Intelligence   (tools: org chart, LinkedIn)
  ├── Signal Detection Agent     (tools: news feeds, competitive intel)
  ├── Qualification Agent        (tools: MEDDPICC framework)
  ├── Meeting Preparation Agent  (tools: calendar, briefing templates)
  ├── Opportunity Hygiene Agent  (tools: CRM validation rules)
  ├── Pipeline Generation Agent  (tools: prospecting databases)
  └── Customer Advocacy Agent    (tools: case study library, NPS)
```

Each sub-agent is self-contained: own skills, runbooks, tools, knowledge, guardrails. The orchestrator never executes domain tasks directly.

**Where implemented.** The AE Agent (`domain/agents/account_executives/ae-agent-definition.yaml`) is the reference implementation with 9 sub-agents, 13 reactive routing rules, and cascade limits. The SA Agent (9 sub-agents + 11 specialist domains) and VE Agent (8 sub-agents) follow the same pattern. Across the system, 196 agent definitions are organized under 25 team directories.

**Related docs.** [Domain Model: Holonic Decomposition](domain-model.md), [Agent Architecture](../agents/agent-architecture.md)

---

## 5. Evaluator-Optimizer

One agent generates output, another evaluates it and requests improvements in a loop until a quality threshold is met.

**When to use.** Iterative quality optimization is required. The generator and evaluator have different objectives or perspectives, and cycling between them produces better results than a single pass.

**In the domain model.** The evaluator-optimizer pattern is not implemented as a single agent pair. Instead, evaluation and optimization are distributed across multiple mechanisms that collectively achieve the same effect.

**Evaluation layer (quality gates):**

- **Guardrails** on every agent and sub-agent: input validation (reject incomplete inputs), output checks (verify deliverable quality), signal validation (confirm data freshness). These act as inline evaluators that gate each step.
- **Trust tiers** on playbooks: autonomous (agent proceeds), review (human checks output), human-decides (human must approve before action). The trust tier determines how much evaluation happens and by whom.

**Optimization layer (learning loop):**

- **Knowledge Curators** analyze execution outcomes stored in the InfoHub, detect patterns (recurring failures, quality drift, methodology gaps), and suggest changes at the lowest possible layer (prompt rewording, knowledge update, guardrail adjustment).
- **Reactive routing** enables conditional re-evaluation: if a sub-agent's output crosses a threshold (e.g., `deal_health.score < 40`), another sub-agent is triggered to reassess, creating an implicit generate-evaluate cycle.

```text
Generation → Guardrails (inline evaluation)
          → Trust Tier (human evaluation gate)
          → InfoHub (outcome storage)
          → Knowledge Curators (pattern analysis)
          → Suggested changes (optimization)
          → Updated prompts/knowledge/guardrails (next cycle improves)
```

**Where implemented.** Guardrails are mandatory in every agent definition YAML (`guardrails:` section). Trust tiers are defined per playbook in [Playbook System](../playbooks/playbook-system.md). The Knowledge Curator agents operate under `domain/agents/knowledge_curators/`. Reactive routing rules are in orchestrator definitions (AE: 13 rules).

**Related docs.** [Domain Model: Evolution and Learning](domain-model.md), [Playbook System: Trust Tiers](../playbooks/playbook-system.md), [Knowledge Lifecycle](knowledge-lifecycle.md)

---

## Pattern Combinations

The five patterns are not mutually exclusive. Most agents in the system combine several.

An AE orchestrator uses **routing** (pattern 2) to dispatch requests to sub-agents. Each sub-agent uses **prompt chaining** (pattern 1) internally through its runbooks. The process layer uses **parallelization** (pattern 3) to run independent agent contributions concurrently. The overall structure is **orchestrator-workers** (pattern 4). And **evaluator-optimizer** (pattern 5) operates continuously through guardrails, trust tiers, and the knowledge curation loop.

The patterns layer naturally:

```text
Blueprint / Process    → Parallelization (independent agent steps)
  └── Orchestrator     → Routing (task type to sub-agent)
       └── Sub-Agent   → Prompt Chaining (runbook skill sequence)
            └── Output → Evaluator-Optimizer (guardrails, trust tiers, curators)
```

---

## References

- Anthropic, "Building Effective Agents" (2024): prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer
- Koestler, A., "The Ghost in the Machine" (1967): holonic architecture
- [Domain Model](domain-model.md): layer hierarchy, holonic decomposition, agent autonomy model
- [Process Orchestration Overview](process-orchestration-overview.md): multi-agent process coordination
- [Orchestration Agent Architecture](../agents/orchestration-agent.md): design-time orchestration
- [Playbook System](../playbooks/playbook-system.md): trust tiers, playbook execution
- [Knowledge Lifecycle](knowledge-lifecycle.md): curation and learning loop
