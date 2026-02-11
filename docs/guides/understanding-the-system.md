---
title: "Understanding the System"
order: 1
description: "Deep-dive into why each component exists, how they work together, and what happens in practice through real scenario walkthroughs"
category: "guide"
keywords: ["system-concepts", "agents", "playbooks", "vault", "infohub", "scenarios"]
last_updated: "2026-02-10"
---

# Understanding the System

This guide explains why each part of the EA Agentic Lab exists, what problem it solves, and how the parts connect in practice. The [User Handbook](../HANDBOOK.md) covers how to use the system day-to-day. This guide covers why the system works the way it does.

---

## The Problem This System Solves

Enterprise engagements generate enormous amounts of knowledge: meeting notes, architecture decisions, risk assessments, stakeholder insights, competitive intelligence, value metrics. Without structure, this knowledge scatters across email threads, personal notes, and slide decks. When a team member leaves or an account transitions, the knowledge leaves with them.

Three specific failures repeat across organizations:

- **Knowledge loss at transitions**: pre-sales hands off to post-sales with a slide deck and a 30-minute call. Months of context disappear
- **Inconsistent execution**: experienced team members run proven frameworks intuitively. Junior members guess or skip steps entirely
- **Reactive governance**: risks surface after they materialize. Actions slip because nobody tracks them systematically

The EA Agentic Lab addresses each failure with a specific component: the Vault captures and organizes knowledge structurally, Playbooks encode expertise as repeatable process, and Agents provide continuous monitoring with predictable escalation.

---

## Components

### Engagement Classification

**Why it exists**: without classification, every engagement gets the same treatment. A competitive displacement deal requires different playbooks, agents, and governance than a greenfield adoption. Classification ensures the system adapts to the engagement, not the other way around.

Three independent dimensions combine to describe any engagement:

- **Archetype** defines the motion: what kind of deal is this? A competitive displacement requires battlecards and incumbent analysis. A renewal requires health scoring and value proof. Each archetype activates different playbooks
- **Domain** defines the technical area: security, search, observability, or platform. Domain determines which specialist playbooks and evaluation checklists apply
- **Track** defines the service tier: POC, economy, premium, or fast track. Track sets SLAs, mandatory artifacts, and governance cadence

**When it matters**: classification happens once at engagement creation and can be updated if the engagement evolves (a greenfield deal may become competitive when an incumbent appears).

**Use case**: an AE creates a new engagement for a manufacturing company evaluating security. They classify it as competitive displacement / security / premium track. The system automatically selects the security consolidation blueprint, activates competitive analysis playbooks, and sets premium-track SLAs for response times.

### Blueprints

**Why they exist**: classification tells the system what kind of engagement this is. Blueprints tell it how to govern that engagement. Without blueprints, someone would need to manually decide which playbooks to run, which agents to activate, and what success criteria apply for every engagement.

A blueprint defines:

- Which playbooks are available for this engagement type
- Which agents are active and their decision authority
- What escalation hierarchies apply
- What operating cadence to follow (meeting frequency, reporting rhythm)
- What success criteria define "done"

**When it matters**: blueprints are selected automatically based on classification. Most users never interact with blueprints directly; they experience the governance structure that blueprints define.

**Use case**: a security consolidation blueprint enables stakeholder mapping playbooks, competitive analysis playbooks, and POC execution playbooks. It activates the CI Agent alongside the standard AE and SA agents. It sets weekly cadence calls instead of the standard biweekly.

### Playbooks

**Why they exist**: experienced consultants carry frameworks in their heads, applying SWOT analysis, stakeholder mapping, and value engineering intuitively. Playbooks capture that expertise as executable process so every team member, regardless of experience, applies proven frameworks consistently. They also make execution measurable: you can track which frameworks were applied, when, and what they produced.

Playbooks come in two categories:

- **Strategic playbooks** operationalize consulting frameworks. SWOT analysis, Three Horizons, Value Engineering, Stakeholder Mapping (Mendelow's Matrix), Porter's Five Forces, and others become structured procedures that agents execute on triggers
- **Operational playbooks** handle recurring events. Meeting notes processing, risk registration, action tracking, health scoring, and escalation follow predictable workflows

Each playbook follows a consistent pattern:

1. **Trigger**: what condition activates this playbook (event, schedule, threshold, or manual request)
2. **Inputs**: what data the playbook needs (from the InfoHub or from the user)
3. **Procedure**: what steps the agent executes
4. **Outputs**: what artifacts the playbook produces and where they're stored
5. **Review**: whether a human must approve before the output is committed

**When it matters**: playbooks execute continuously throughout an engagement. Some trigger on events (a new risk triggers SWOT analysis). Some run on schedule (health scoring runs monthly). Some are manual (an AE requests a Three Horizons analysis before an account planning session).

**Use case**: a customer mentions budget pressure in an email. The AE Agent detects the commercial risk signal and triggers PB_201 (SWOT Analysis). The playbook analyzes strengths (existing relationship, proven platform), weaknesses (pricing perception), opportunities (consolidation value), and threats (budget cuts, competitive alternatives). The output lands in the Internal InfoHub under `frameworks/`, and the AE receives a structured summary with recommended actions.

### The Vault (Three-Vault Knowledge Model)

**Why it exists**: enterprise engagements produce knowledge at different sensitivity levels. Competitive intelligence about an incumbent cannot be shared with the customer. Architecture decisions must be shared. Anonymized patterns from past deals should be reusable across all future engagements. A single container would either leak sensitive content or lock away shareable content.

The three-vault model enforces separation structurally through directory boundaries, not through metadata tags that can be misconfigured.

**Vault 1: External InfoHub** contains everything the customer can see. Solution architecture, ADRs, discovery findings, POC plans, value metrics, journey documentation. When the engagement ends, the customer keeps this as their solution knowledge base. See the [External InfoHub Reference](../reference/external-infohub-reference.md) for content rules.

**Vault 2: Internal InfoHub** contains everything the vendor needs but the customer must not see. Stakeholder mapping with internal notes on motivations and biases, competitive intelligence, candid risk assessments, pricing strategy, health scores, governance metrics, agent work products. This is where agents do their thinking.

**Vault 3: Global Knowledge Vault** contains anonymized, reusable knowledge harvested from completed engagements. Best practices, winning patterns, risk indicators, competitive displacement patterns. This vault grows with every engagement and makes future engagements smarter.

**Security boundary**: External InfoHub content is never derived from Internal InfoHub content. Internal content is never shared without explicit sanitization. Global Knowledge content is always anonymized before storage.

**When it matters**: every time an agent writes an artifact, it writes to a specific vault based on the playbook's `vault_routing` metadata. This is not a choice the agent makes at runtime; it's declared in advance and auditable.

**Use case**: after a meeting with a customer stakeholder, the Meeting Notes Agent processes the notes. Customer-visible decisions go to `external-infohub/decisions/`. Internal observations about stakeholder sentiment go to `internal-infohub/stakeholders/`. The agent never crosses the boundary. Six months later, when the engagement closes, anonymized patterns from this engagement flow to the Global Knowledge Vault to help future teams.

### Agents

**Why they exist**: playbooks define what to do. Agents decide when and execute it. Without agents, a human would need to monitor every signal, trigger every playbook, route every artifact, and chase every overdue action manually. Agents provide continuous monitoring with predictable behavior.

The system has three agent categories:

**Strategic agents (15)** handle customer-facing work. The AE Agent manages deal governance, the SA Agent maintains technical integrity, the CA Agent tracks customer architecture changes, the CI Agent produces competitive intelligence, and the VE Agent builds value cases. Each strategic agent has defined decision authority: the AE Agent can make decisions on deals up to $500K with standard terms. Beyond that, it escalates to the Senior Manager Agent.

**Governance agents (8)** reduce entropy. The Meeting Notes Agent extracts structured artifacts from meeting notes. The Task Shepherd validates every action has an owner, due date, and done criteria. The Nudger follows up on overdue actions with a predictable escalation timeline (Day +1 reminder, Day +3 escalation to manager, Day +5 escalation to governance lead). The Risk Radar tracks risk state transitions with defined SLAs (Identified to Assessed within 24 hours, Assessed to Mitigating within 48 hours).

**The Orchestration Agent (1)** is the meta-layer that transforms process descriptions into agents and playbooks.

**How agents communicate**: agents communicate through signals, not shared databases. A signal includes the sending agent, receiving agent, priority, context (realm/node/trigger), and payload. This makes cross-agent coordination explicit and auditable.

**When it matters**: agents work continuously in the background. You interact with their outputs (alerts, summaries, canvases) rather than directing them step by step. When an agent needs a human decision, it surfaces an actionable prompt with context and quick-action options.

**Use case**: the SA Agent detects a performance issue from meeting notes ("search latency increased from 200ms to 3 seconds"). It classifies this as a HIGH severity risk, creates a risk register entry, drafts an Architecture Decision Record, and creates an action item for capacity analysis with a 48-hour SLA. It sends a signal to the Specialist Agent for domain expertise and notifies the AE Agent about potential health impact. The SA receives a prompt with extracted facts and options: Accept & Start, Request Specialist, Escalate, or Need More Context. One meeting sentence triggers a coordinated response across three agents.

### Canvases

**Why they exist**: the InfoHub accumulates structured data (decisions, risks, stakeholders, value metrics), but data alone is not communication. Canvases transform InfoHub data into one-page visual artifacts designed for specific audiences: executive sponsors, technical evaluators, customer success teams.

The key difference from reports: canvases auto-render from live InfoHub data. When a decision is updated or a new risk is registered, the affected canvases re-render automatically. They are always current, never manually maintained.

Eight canvas types exist:

- **Context Canvas**: engagement boundaries, background, and scope (first canvas created for every node)
- **Decision Canvas**: five key decisions and open questions
- **Value & Stakeholders**: stakeholder landscape with value propositions
- **Architecture Communication**: components, integrations, quality requirements
- **Execution Map**: milestones, success criteria, workstreams
- **Risk & Governance**: top-tier risks, RACI, operating cadence
- **Problem-Solution Fit**: validates problem/solution alignment
- **Architecture Decision**: documents technical and architectural choices

**When it matters**: before a stakeholder meeting, an AE pulls the Value & Stakeholders canvas for a current snapshot. Before a technical review, the SA pulls the Architecture Communication canvas. Neither needs to build a slide deck; the canvas is ready.

**Use case**: an AE is preparing for a quarterly executive business review. They pull the Context Canvas (engagement overview), the Value & Stakeholders Canvas (stakeholder map and value delivered), and the Risk & Governance Canvas (active risks and governance cadence). All three canvases reflect the latest InfoHub data, including a risk that was registered yesterday and a value metric that was updated this morning.

### Realm and Node Hierarchy

**Why it exists**: a single customer may have multiple active engagements: a security consolidation, an observability rollout, and a search modernization. Each engagement has its own lifecycle, stakeholders, risks, and governance. Without structural separation, artifacts from one initiative bleed into another.

- **Realm** represents a customer or organization. It holds account-level configuration and cross-node intelligence
- **Node** represents a single initiative within a Realm. Each node has its own InfoHub, enabled playbooks, active agents, and governance lifecycle

**Critical design rule**: all playbooks execute at Node level, never at Realm level. A playbook reads from `{realm}/{node}/*` and writes to `{realm}/{node}/*`. It never reasons across nodes. Realm-level views (portfolio dashboards, cross-node risk patterns) are read-only aggregations for leadership reporting.

**Why node-level execution matters**:

- **Isolation**: each initiative has independent governance. A risk in the security engagement does not contaminate the observability engagement's risk register
- **Accountability**: single owner per node. No ambiguity about who is responsible
- **Scalability**: nodes are added or removed independently as the customer's initiatives evolve

---

## How Components Connect: Scenario Walkthroughs

### Scenario 1: A deal starts slipping

An AE receives an email from a customer: "Our CFO has called for a budget review of all IT investments. The decision timeline is moving from Q1 to TBD."

Here is what happens:

1. The **AE Agent** detects keywords (budget review, decision delayed, TBD) and the CFO involvement signal. It classifies this as a DEAL_SLIP_RISK pattern
2. The agent updates the **Internal InfoHub**: risk register gets a new entry (commercial category, churn indicator flagged), forecast notes are updated with low confidence on close date, the CFO is added to the stakeholder map as HIGH influence
3. The AE receives an **actionable prompt**: "Deal slip risk detected. CFO budget review in progress. Recommended actions: update CRM, engage executive sponsor, prepare value justification, schedule review call"
4. The **VE Agent** is automatically triggered to develop a CFO-focused ROI analysis
5. The **Senior Manager Agent** is notified because the deal is above $1M
6. The **SA Agent** pauses technical workstreams pending commercial clarity

One email triggered coordinated action across four agents. No manual status updates. No Slack messages asking "did anyone see that email?"

### Scenario 2: A meeting generates governance artifacts

After a customer meeting, notes are submitted to the system.

1. The **Meeting Notes Agent** extracts structured content: two decisions made, three actions assigned, one risk identified, and one open question
2. **In parallel**, four governance agents process the output:
   - The **Task Shepherd** validates each action has a single owner, due date, and done criteria. It flags one action missing a due date and notifies the owner to fix it within 24 hours
   - The **Decision Registrar** logs both decisions with decision ID, maker, context, and timestamp
   - The **Risk Radar** classifies the risk with severity and likelihood, linked to existing dependencies
   - The **Nudger** creates tracking entries and schedules reminders for each action
3. Each meeting attendee receives a **tailored notification**: their assigned actions, risks relevant to them, and questions they need to answer
4. All artifacts land in the correct **InfoHub vault**: decisions in external (customer-visible), risk in internal (vendor-only), actions in internal governance

One meeting submission triggers the complete governance pipeline. Decisions are searchable, risks are tracked, follow-through is automated.

### Scenario 3: An overdue action escalates

An action item was due January 10. Here is the escalation timeline:

- **Day -1**: Nudger sends a reminder. No response
- **Day 0**: Due-day reminder. No response
- **Day +1**: Overdue notice. No response
- **Day +3**: Second overdue notice, marked urgent. No response
- **Day +5**: Escalation criteria met (5+ days overdue, owner unresponsive after two nudges, action blocking a customer commitment)

The **Senior Manager Agent** receives the escalation with full context: what's overdue, when it was due, what it blocks, the history of nudges, and any patterns (this owner has three other overdue items).

The manager discovers the owner is on medical leave. They click Reassign, select a colleague, and the system updates ownership, resets the due date, notifies the new owner with full context, and informs dependent teams of the timeline change.

Predictable escalation with defined timelines. No action falls through the cracks because a person was unavailable.

### Scenario 4: A feature gap affects a deal

During a meeting, the customer states: "We need 10+ data source correlation with sub-second alerting. Is that on the roadmap?"

1. The **PM Agent** detects the feature gap signal (keywords: roadmap, must-have, capability). It checks the product roadmap: multi-source correlation is planned for Q3, but sub-second alerting is not planned
2. InfoHub updates: feature request logged (must-have priority, significant gap severity), risk register entry created (high severity, with mitigation options), decision log entry queued (decide: accept gap, propose workaround, or escalate)
3. The **SA Agent** is notified to design an interim architecture or workaround
4. The **AE Agent** is notified to prepare customer messaging about the gap
5. The **Decision Registrar** sets a review deadline for the workaround decision

The gap is visible across product and field teams within minutes. The SA is already designing before the AE has to deliver the message.

---

## Related Documentation

- [User Handbook](../HANDBOOK.md): day-to-day usage guide for all roles
- [Agent Responsibilities](../architecture/agents/agent-responsibilities.md): full agent matrix with decision authority and handover triggers
- [Agent Scenarios](../architecture/agents/agent-scenarios.md): detailed signal-level scenario walkthroughs
- [Knowledge Vault Architecture](../architecture/system/knowledge-vault-architecture.md): three-vault model, data flows, security boundaries
- [Playbook Framework](../architecture/playbooks/playbook-framework.md): how consulting frameworks become executable playbooks
- [Canvas Framework](../architecture/playbooks/canvas-framework.md): visual artifact types and rendering pipeline
- [Core Entities](../architecture/system/core-entities.md): Blueprint, Realm, Node definitions and relationships
- [External InfoHub Reference](../reference/external-infohub-reference.md): content rules for the customer-facing hub
