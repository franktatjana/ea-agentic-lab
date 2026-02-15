# Agent Design Audit

**Date:** 2025-02-14
**Scope:** Agent identity, routing, interfaces, handoffs, context engineering, prompts, testing
**Evaluated against:** [Agent Systems Handbook](https://github.com/tatjanafrank/agent-lab/blob/main/docs/handbook.md), industry frameworks (Anthropic, OpenAI, LangChain, CrewAI, AutoGen)

---

## Knowledge Base

This audit draws on research captured in the agent-lab repository, which serves as the design reference for agent specifications. The following documents informed the evaluation criteria.

- [Agent Systems Handbook](https://github.com/tatjanafrank/agent-lab/blob/main/docs/handbook.md): Core principles, composition patterns, routing topologies, interface layers, handoff design, evaluation guidance
- [Lessons Learned](https://github.com/tatjanafrank/agent-lab/blob/main/docs/lessons-learned.md): Practical dos and don'ts for context engineering, memory, prompts, routing, interfaces, evaluations
- [Bookmarks](https://github.com/tatjanafrank/agent-lab/blob/main/docs/bookmarks.md): Curated sources from Anthropic, OpenAI, LangChain, CrewAI, AutoGen, Google A2A, MCP, AG-UI

---

## Findings Map

A visual summary of where ea-agentic-lab stands across eight dimensions. Each finding links to its detailed section below.

```
                        Strong    Good    Gap    Missing
                        ------    ----    ---    -------
Agent Identity           [====]
Agent Boundaries         [====]
Documentation            [====]
API Contracts (AG-UI)            [===]
Signal Architecture              [===]
Routing & Orchestration                  [==]
Agent-to-Agent Interfaces                [==]
Handoff Contracts                        [==]
Context Assembly                         [==]
Prompt Composability                     [==]
Agent Evaluations                                 [=]
```

---

## 1. Agent Identity and Boundaries

**Verdict: Strong**

The handbook says: "Define by responsibility, not capability." EA Agentic Lab follows this consistently. The SA Agent is accountable for technical integrity and risk visibility, not described as "an agent that reads architecture docs." 32 agents have clear domain ownership across 7 functional categories. The three-file structure (agent config, personality, prompts) separates what the agent does from how it behaves from what it says.

**What works well:**

- Agents named by responsibility (`meeting-notes-agent`, `risk-radar-agent`, not `yaml-parser-agent`)
- Explicit "what this agent must NOT do" in personality specs
- Anti-hallucination controls embedded in personality (never invent client names, `[NEEDS VERIFICATION]` markers)
- Escalation triggers are specific and threshold-based (`>$500K`, security blockers)
- Three-tier escalation hierarchy (Execution → Senior Manager → Executive) is well-defined

**One concern:** The Meeting Notes Agent extracts decisions AND actions AND risks AND stakeholders from meetings. By the handbook's "one job per agent" rule, this is potentially four agents or a skill that composes four prompts. The question is whether extraction is one responsibility (parsing meeting notes) or four (decision tracking, action tracking, risk detection, stakeholder mapping).

---

## 2. Routing and Orchestration

**Verdict: Gap**

This is the most substantive finding. Against the five routing topologies documented in the handbook (supervisor, router, handoffs/swarm, hierarchical manager, group chat), ea-agentic-lab uses an **event-driven / signal-based** pattern that doesn't map cleanly to any of them.

**Current state:** Agents write to a shared InfoHub and emit signals (`SIG_ART_001`, `SIG_RSK_*`). Other agents monitor the InfoHub for changes. Escalation paths are static (always Senior Manager, then Executive). The Orchestration Agent exists in design docs but is not implemented.

**What's missing against handbook patterns:**

- No agent uses LLM reasoning to decide which agent handles the next step (dynamic routing)
- No centralized supervisor coordinates specialist agents
- No peer-to-peer handoffs where agents transfer control directly
- No formal router classifies incoming events before dispatch
- The Senior Manager Agent acts as escalation target, not active coordinator

**What works:** The signal-based pattern is a valid topology with real strengths: loose coupling, no orchestrator bottleneck, agents can be added without rewiring. It's closest to the handbook's Peer Network topology but mediated through shared filesystem state rather than direct messaging.

**Assessment:** The handbook's lesson applies: "Start with static routing; move to dynamic only when the task variation demonstrably requires it." The signal-based approach is effectively static routing (signals map to known handlers). Before adding a full dynamic orchestrator, a lightweight **router agent** that classifies incoming events and dispatches to the right agent would address the immediate coordination gap without over-engineering.

---

## 3. Interfaces

**Verdict: Gap (Agent-to-Agent), Good (Agent-to-User)**

Evaluated against the four interface layers from the handbook:

**Agent-to-Tool (ACI): Partially addressed.** Agents interact with the vault filesystem as their primary "tool." The connector pattern (filesystem, GitHub, Google Drive) provides a clean abstraction. No formal tool schemas or MCP definitions exist. Agent tool access is not explicitly constrained in configuration.

**Agent-to-Agent (A2A): Not formalized.** Agents communicate indirectly via shared InfoHub state. No Agent Cards, no typed handoff contracts, no explicit protocol for what one agent passes to another. The signal system (`SIG_*`) acts as a lightweight event bus but is not formalized as a protocol with schemas.

**Agent-to-User (AG-UI): Well-implemented.** FastAPI endpoints with Pydantic models provide typed contracts for the frontend. Canvas rendering pipeline handles agent-to-human visualization. 14 API routers with documented schemas are solid.

**Typed Data Contracts: Mixed.** Pydantic models validate API boundaries. YAML with JSON Schema validates vault artifacts. But agent-to-agent data flow (what Meeting Notes Agent writes vs. what Risk Radar reads) has no typed contract. It's implicit in the YAML structure that both agents happen to know about.

---

## 4. Handoff Design

**Verdict: Gap**

The handbook says: "Specify what transfers, what format the receiver expects, how acknowledgment works, whether the sender gets results back, and what happens on failure."

Handoffs in ea-agentic-lab happen implicitly through shared filesystem state:

- Meeting Notes Agent writes to `internal-infohub/decisions/`
- Decision Registrar reads from that same directory
- No acknowledgment mechanism exists
- No failure handling if the Decision Registrar misses a file
- No contract defining the expected YAML structure between producer and consumer

The RFP workflow has the most explicit handoff design (Day 1 → Days 2-3 → Draft → Review → Submit), but even there the handoffs are temporal (phase-based), not contractual (typed).

---

## 5. Context Engineering

**Verdict: Foundations Good, Runtime Missing**

The handbook says: "Load just-in-time, not upfront. Keep context informative, yet tight."

**Good foundations:** The three-vault architecture inherently supports context isolation. Agents operate at the Node level, scoping their context to one engagement. Personality specs define what an agent should know, including its playbooks, escalation paths, and domain scope. Dedicated docs exist for context engineering and tool design principles.

**Gap:** There's no visible mechanism for how agents assemble context at runtime. The personality specs define what an agent should know, but the agent framework (`BaseAgent`) doesn't show how the context window is managed, how token budgets are enforced, or how references are loaded just-in-time. With 72 playbooks and extensive vault content, this will become critical as agents move to production.

---

## 6. Prompt Architecture

**Verdict: Gap**

Prompts use the CAF format (Context, Action, Format) with clear purpose and expected output per task. This is a solid foundation.

**Gap:** The handbook says "atomic prompts that compose into skills." The prompts appear to be task-level (one prompt per task), not atomic building blocks that can be recomposed. There is no visible skill composition layer where prompts chain into workflows. The playbook engine handles workflow orchestration, but the connection between playbook steps and prompt execution is not explicit in the codebase.

---

## 7. Testing and Evaluations

**Verdict: Good Infrastructure, Missing Agent Evals**

Integration tests, DLL evaluator tests, and scenario walkthroughs provide solid coverage of the execution engine. Test fixtures use realistic data (ACME, GLOBEX, INITECH).

**Gap:** The handbook's eval guidance says "Start with 20-50 real tasks from actual failures." There are no agent-level evaluations: no golden datasets for agent outputs, no grading logic for whether the SA Agent's SWOT analysis is good, no pass/fail criteria for Meeting Notes extraction quality. Tests validate infrastructure (playbook loading, DLL expressions), not agent intelligence.

---

## 8. Documentation

**Verdict: Strong**

20 decision records, comprehensive architecture docs, role-based handbook, documentation principles, practitioner guides, developer guides. The decision records (DDR/ADR) with context, alternatives, and consequences align with the handbook's three-level documentation guidance (agent-level, system-level, decision-level). The docs README provides clear navigation by reader intent.

---

## Priorities

Ranked by effort-to-value ratio, highest impact first.

### Priority 1: Formalize Vault Artifact Schemas

**Effort:** Low | **Value:** High | **Risk addressed:** Silent contract violations between agents

The vault YAML artifacts are the de facto agent-to-agent interface. When the Meeting Notes Agent writes a decision to `internal-infohub/decisions/`, the Decision Registrar reads it. Today that contract is implicit. Adding YAML schemas (e.g., `schemas/decision.schema.yaml`, `schemas/risk.schema.yaml`) for the artifacts agents read and write prevents silent breakage when one agent changes its output format.

**CTA:**
- [ ] Inventory the 5-10 most common artifact types written by governance agents (decisions, actions, risks, stakeholders, meeting notes)
- [ ] Create a `domain/schemas/` directory with one YAML schema per artifact type
- [ ] Add schema validation to the agent framework's write path (validate before writing to InfoHub)
- [ ] Document each schema's producer agent(s) and consumer agent(s)

### Priority 2: Add a Lightweight Router Agent

**Effort:** Medium | **Value:** High | **Risk addressed:** No centralized visibility into agent coordination

Before building the full Orchestration Agent, add a simple classification-based router that reads incoming signals and dispatches to the right agent. This gives centralized visibility into system activity without the complexity of dynamic LLM-based orchestration. The signal catalog already defines the vocabulary; the router formalizes the dispatch.

**CTA:**
- [ ] Define signal-to-agent mapping as structured YAML (which signals trigger which agents)
- [ ] Implement a router agent that reads new signals from InfoHub, classifies them, and logs the dispatch decision
- [ ] Add routing failure handling: what happens when a signal doesn't match any agent?
- [ ] Instrument the router with basic observability (signal received, agent dispatched, time elapsed)
- [ ] Decide: should the router become the Orchestration Agent's first component, or stay separate?

### Priority 3: Agent-Level Evaluations

**Effort:** Medium | **Value:** High | **Risk addressed:** No way to measure whether agents produce good output

Create golden datasets for 2-3 key agents. Even 10-20 examples per agent would give regression testing for agent quality, not just infrastructure correctness.

**CTA:**
- [ ] Pick 3 agents with the most structured output: Meeting Notes Agent, Risk Radar Agent, SA Agent (SWOT)
- [ ] Create `tests/goldens/{agent_name}/` with 10 input/output pairs per agent
- [ ] Define grading criteria: what makes a good meeting notes extraction? A good risk classification?
- [ ] Add a test that runs agents against goldens and reports pass/fail (code-based grading first, model-based later)
- [ ] Reference: [Anthropic's eval guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

### Priority 4: Explicit Handoff Contracts in Agent Configs

**Effort:** Low | **Value:** Medium | **Risk addressed:** Implicit contracts cause coordination failures

Add `reads:` and `writes:` sections to each agent's YAML config defining what artifacts it consumes and produces, with schema references from Priority 1.

**CTA:**
- [ ] Add `reads:` and `writes:` fields to the agent YAML spec format
- [ ] For each of the 8 governance agents, document: artifact types written, artifact types read, expected schema
- [ ] For the 3 highest-traffic functional agents (SA, AE, CA), do the same
- [ ] Update agent-architecture.md to reflect the new contract fields
- [ ] Validate at startup: warn if an agent reads an artifact type that no other agent writes

### Priority 5: Context Assembly Design

**Effort:** Low | **Value:** Medium | **Risk addressed:** Token budget overruns and context dilution at runtime

Document how each agent's runtime context should be assembled: what gets loaded, in what order, with what token budget. Even if the full implementation is pending, the design doc prevents future mistakes.

**CTA:**
- [ ] For 3 representative agents (one governance, one functional, one intelligence), document: system prompt size, personality size, reference materials loaded, vault artifacts scanned, estimated total tokens
- [ ] Define a context budget per agent tier (governance agents: lean context, functional agents: moderate, intelligence agents: larger for research)
- [ ] Add context assembly rules to [context-engineering.md](architecture/system/context-engineering.md)
- [ ] Reference: [Anthropic's context engineering guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

---

## What's Not a Priority (and Why)

These items appeared during the audit but are correctly deferred for now.

**Full Orchestration Agent:** The design is thorough (conflict detection, agent factory, playbook generator), but the system doesn't yet have the runtime feedback loops that would make dynamic orchestration valuable. Build the router agent first (Priority 2), gain operational experience, then decide how much orchestration intelligence is needed.

**MCP / A2A protocol adoption:** The signal-based architecture is a valid pattern for a file-based system. Protocol layers like MCP and A2A become relevant when agents need to integrate across services or vendors. Current scope is single-system, making protocol overhead premature.

**Database migration:** File-based YAML storage works for the current scale (3 realms, ~10 nodes). Migration to PostgreSQL + S3 is a production readiness concern, not an agent design concern.

---

## Strengths Worth Preserving

These patterns are well-designed and should not be changed.

**Three-vault knowledge architecture:** External InfoHub (customer-facing), Internal InfoHub (vendor-only), Global Knowledge Vault (anonymized cross-account). This is a novel pattern that solves a real problem. The knowledge flow direction (engagements → account → global with anonymization) is sound.

**Blueprint → Instance → Playbook hierarchy:** Reference blueprints define archetype patterns, instances bind to specific nodes, playbooks operationalize them. This allows new engagement types without rebuilding the system.

**Decision Logic Language (DLL):** Conditions as data (YAML), not code. JSONPath + Python operators evaluated against InfoHub. Thresholds centralized in config. Agents can reason about conditions without code changes. This is exactly the kind of declarative approach the handbook recommends.

**Anti-hallucination safeguards:** Personality-embedded controls (never invent client names, `[NEEDS VERIFICATION]` markers, source attribution requirements, verification rules). These are runtime guardrails, not documented rules, which is the right approach per the handbook.

**Signal-based loose coupling:** Agents can be added, removed, or modified without rewiring the system. This is a real architectural advantage over tightly-coupled orchestration patterns.
