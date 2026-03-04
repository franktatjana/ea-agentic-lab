---
title: "Solution Architect Agent"
description: "Near-pure router orchestrator for technical integrity, risk visibility, and architecture decisions"
category: "reference"
keywords: ["sa_agent", "solution-architects", "agent", "profile", "digital_twin", "orchestrator"]
last_updated: "2026-03-04"
---


# Solution Architect Agent

The Solution Architect Agent is the digital twin of the Solution Architect role. It operates as a near-pure router orchestrator: keeping 3 operational runbooks (meeting support, InfoHub validation, specialist engagement) and routing all domain work to 9 sub-agents that own their domains end-to-end. Six co-located sub-agents handle discovery, risk, decisions, CSP, best practices, and journey mapping. Three external sub-agents handle POC lifecycle, RFP response, and specialist engagement. The SA Agent coordinates with the InfoSec Agent as a peer (separate role, separate person). It monitors technical signals across accounts, aggregates cross-domain insights, and surfaces risks before they escalate.

Its operating principle: accuracy over speed, verify before asserting.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `sa-agent` |
| **Role** | Solution Architect (Architecture) |
| **Type** | Near-Pure Router Orchestrator |
| **Mode** | Human-paired |
| **Runbooks** | 3 (direct) + 6 routed to co-located sub-agents |
| **Prompts** | 44 |
| **Sub-agents** | 9 (6 co-located + 3 external) |
| **Peer Agents** | InfoSec Agent (separate role) |
| **Skills** | 6 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 12 |


## Sub-agents

The SA orchestrator routes domain work to 9 sub-agents. Six are co-located in the `solution_architects/` directory, owning SA-domain runbooks. Three live in separate directories per DDR-021.

### Co-located Sub-agents

| Sub-agent | Agent ID | Purpose | Definition |
|-----------|----------|---------|------------|
| SA Discovery Agent | `sa-discovery-agent` | Technical discovery lifecycle, business outcomes, current state, requirements | `sa-discovery-definition.yaml` |
| SA Technical Risk Agent | `sa-risk-agent` | Architecture health, performance, capacity planning, integration risk | `sa-risk-definition.yaml` |
| SA Decision Capture Agent | `sa-decision-capture-agent` | Decision extraction, architecture impact, ADR generation | `sa-decision-capture-definition.yaml` |
| SA CSP Agent | `sa-csp-agent` | Customer Success Plan lifecycle from initiation through CA handoff | `sa-csp-definition.yaml` |
| SA Best Practices Agent | `sa-best-practices-agent` | Best practices knowledge base creation, maintenance, gap analysis | `sa-best-practices-definition.yaml` |
| SA Journey Agent | `sa-journey-agent` | Customer journey mapping, touchpoint documentation, CA handoff | `sa-journey-definition.yaml` |

### External Sub-agents

| Sub-agent | Agent ID | Purpose | Definition |
|-----------|----------|---------|------------|
| POC Agent | `poc-agent` | POC lifecycle, qualification, execution, conversion | `domain/agents/poc/poc-agent-definition.yaml` |
| RFP Agent | `rfp-agent` | Bid strategy, compliance matrix, response orchestration | `domain/agents/rfp/rfp-agent-definition.yaml` |
| Specialist Agent | `specialist-agent` | Domain expert routing (security, observability, search) | `domain/agents/specialists/specialist-agent-definition.yaml` |

### Peer Agent

| Agent | Agent ID | Relationship | Definition |
|-------|----------|-------------|------------|
| InfoSec Agent | `infosec-agent` | Peer (separate role, separate person) | `domain/agents/infosec/infosec-agent-definition.yaml` |


## Routing Rules

The orchestrator evaluates incoming signals and routes to sub-agents or peer agents. Only meeting support, InfoHub validation, and specialist engagement are handled directly.

| Signal | Routes To | Context Forwarded |
|--------|-----------|-------------------|
| Technical discovery, business outcomes mapping | SA Discovery Agent | Account context, meeting date, known context |
| Architecture reviews, risk assessments, capacity | SA Risk Agent | Account context, risk details |
| Decision capture, ADR generation | SA Decision Capture Agent | Meeting notes, architecture summary |
| Customer success plan lifecycle | SA CSP Agent | Account context, opportunity details |
| Best practices creation, maintenance, gaps | SA Best Practices Agent | Topic, solution area |
| Customer journey mapping, handoff | SA Journey Agent | Account context, CA name |
| POC lifecycle (qualification, execution, conversion) | POC Agent | Opportunity details, success criteria |
| RFP received or bid decision needed | RFP Agent | RFP document, deadline, criteria |
| Domain-specific technical depth needed | Specialist Agent | Domain area, technical signals |
| Security questionnaires, compliance gaps | InfoSec Agent (peer) | Security context, questionnaire source |


## Autonomy

The SA orchestrator uses reactive routing to connect signals across sub-agents and peers automatically.

**Reactive Routing Rules:**

- POC risk detected during execution triggers Specialist Agent engagement
- Successful POC completion triggers SA CSP Agent for plan initiation
- RFP technical depth triggers Specialist Agent for domain content
- RFP security requirements route to InfoSec Agent (peer)
- Compliance blocker detected triggers SA Risk Agent for architecture assessment
- Specialist engagement completion triggers SA Decision Capture Agent
- POC scope change triggers SA Risk Agent for reassessment
- Qualifying discovery triggers SA CSP Agent for plan initiation
- Domain-specific HIGH risks trigger Specialist Agent engagement

**Cascade Limits:** Maximum depth 3, maximum 4 agents per chain, circuit breaker on repeated triggers.


## Runbooks (Direct)

The SA orchestrator keeps 3 operational runbooks. All other runbooks are owned by the co-located and external sub-agents.


### Specialist Engagement

Determine if specialist involvement is needed, then prepare formal specialist request.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `specialist_need_assessment` | Determine if specialist involvement is needed |
| 2 | `specialist_request` | Prepare formal specialist request |


### Infohub Validation

Check if account InfoHub is complete and current, then identify stale content needing update.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `completeness_check` | Check if account InfoHub is complete and current |
| 2 | `staleness_report` | Identify stale content needing update |


### Meeting Support

Prepare for technical customer meeting, extract insights from meeting, and prepare for sizing discussions.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `technical_prep` | Prepare for technical customer meeting |
| 2 | `technical_debrief` | Extract technical insights from meeting |
| 3 | `sizing_session` | Prepare for sizing/capacity discussion |


## Scope Boundaries

The agent does not make technical decisions on behalf of humans (handoff to PM/Leadership), recommend specific architectures without human review (handoff to PM/Leadership), promise features or capabilities not documented (handoff to PM/Leadership), invent information not present in source content (handoff to PM/Leadership), override human decisions or assessments (handoff to PM/Leadership), handle commercial/sales activities (AE Agent's domain) (handoff to AE Agent), track delivery progress (Delivery Agent's domain) (handoff to Delivery Agent), or monitor competitive intelligence (CI Agent's domain) (handoff to PM/Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Commercial decisions, customer relationship health needed | AE Agent | Requirement details for commercial decisions, customer relationship health |
| Roadmap questions, feature feasibility needed | PM Agent | Requirement details for roadmap questions, feature feasibility |
| Implementation status, delivery risks needed | Delivery Agent | Requirement details for implementation status, delivery risks |
| Technical context for their domain | All Agents | Analysis results and recommendations |
| Technical risk impact on commercial outcomes | AE Agent | Analysis results and recommendations |
| Customer technical requirements | PM Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on 12 reference knowledge files that encode domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `infohub-validation.yaml` | Completeness Checks, Staleness Thresholds | Infohub validation |
| `signal-detection.yaml` | Technical Risks, Technical Decisions, Architecture Patterns | Signal detection |
| `specialist-triggers.yaml` | When To Flag, Domains | Specialist triggers |
| `glossary-and-resources.md` | Glossary And Resources | Glossary and resources |
| `architecture-patterns.yaml` | Deployment models, data architecture, integration approaches, scaling | Architecture reviews |
| `technical-risk-framework.yaml` | Severity classification, escalation triggers, composite scoring, trending | Risk classification |
| `discovery-methodology.yaml` | Discovery dimensions, question frameworks, red flags, synthesis | Technical discovery |
| `integration-patterns.yaml` | Common patterns, anti-patterns, complexity indicators, data flows | Integration assessment |
| `capacity-planning.yaml` | Sizing methodologies, performance baselines, growth modeling | Capacity planning |
| `migration-patterns.yaml` | Migration strategies, risk factors, rollback planning, phased approaches | Migration scenarios |
| `adr-framework.yaml` | ADR template, significance criteria, impact classification | Decision capture |
| `best-practices-framework.yaml` | Template structure, quality criteria, update triggers, gap methodology | Best practices |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Risk Notes | `{account}-risk-notes.md` | Risk notes |
| Technical Decision Logs | `{account}-technical-decision-logs.md` | Technical decision logs |
| Architecture Impact Assessments | `{account}-architecture-impact-assessments.md` | Architecture impact assessments |
| Client Technical Profiles | `{account}-client-technical-profiles.md` | Client technical profiles |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/solution_architects/sa-agent-definition.yaml` | System view: near-pure router with 9 sub-agents, routing rules, autonomy |
| `domain/agents/solution_architects/agents/sa_agent.yaml` | Agent configuration |
| `domain/agents/solution_architects/personalities/sa_personality.yaml` | Behavioral specification |
| `domain/agents/solution_architects/prompts/tasks.yaml` | 44 CAF prompts across 9 domains |
| `domain/agents/solution_architects/skills/` | 6 skill definitions |
| `domain/agents/solution_architects/references/` | 12 knowledge reference files |
| `domain/agents/solution_architects/sa-*-definition.yaml` | 6 co-located sub-agent definitions |
