---
title: "Agent Profiles"
description: "Index of all agents organized by human role hierarchy"
category: "reference"
keywords: ["agent", "profile", "index", "catalog", "taxonomy"]
last_updated: "2026-03-01"
---

# Agent Profiles

The EA Agentic Lab has 40 agent definitions organized under 13 human roles. Each role is a digital twin of a real job function. Some roles operate as a single agent, others decompose into sub-agents when the process requires different tools, guardrails, or autonomy (per DDR-019 holonic criteria). Profiles represent roles. Definitions represent agents.

For design rationale, see [DDR-021: Agent Taxonomy](../../decisions/DDR_021_agent_taxonomy.md). For architecture details, see [Agent Architecture](../../architecture/agents/agent-architecture.md).

---

## Sales (4 roles, 4 agents)

Sales roles drive commercial strategy, value quantification, partner alignment, and hyperscaler co-sell execution.

| Role | Agent | Purpose | Escalates To |
|------|-------|---------|--------------|
| Account Executive | [AE Agent](sales/ae-agent.md) | Commercial clarity and forecast stability | Senior Manager |
| Value Engineer | [VE Agent](sales/ve-agent.md) | Business value quantification and tracking | Senior Manager |
| Partner Manager | [Partner Agent](sales/partner-agent.md) | Partner ecosystem alignment | Senior Manager |
| Hyperscaler Account Manager | [HAM Agent](sales/hyperscaler-account-manager-agent.md) | Co-sell motion, marketplace transactions, and hyperscaler field alignment | Partner Manager |

---

## Architecture (3 roles, 16 agents)

Architecture roles maintain technical integrity across engagements. The Solution Architect operates as a near-pure router with 9 sub-agents (6 co-located, 3 external) plus 3 domain specialists (12 sub-agents total). The InfoSec Agent is a standalone peer agent with its own role. The Customer Architect is a separate role with 1 sub-agent.

### Solution Architect

| Agent | Type | Purpose |
|-------|------|---------|
| [SA Agent](architecture/sa-agent.md) | Role | Technical integrity and risk visibility (near-pure router) |
| SA Discovery Agent | Co-located sub-agent | Technical discovery lifecycle |
| SA Technical Risk Agent | Co-located sub-agent | Architecture health, capacity, integration risk |
| SA Decision Capture Agent | Co-located sub-agent | Decision extraction, ADR generation |
| SA CSP Agent | Co-located sub-agent | Customer Success Plan lifecycle |
| SA Best Practices Agent | Co-located sub-agent | Best practices knowledge base |
| SA Journey Agent | Co-located sub-agent | Customer journey mapping and handoff |
| [POC Agent](deal-execution/poc-agent.md) | External sub-agent | Proof of concept execution and conversion |
| [RFP Agent](deal-execution/rfp-agent.md) | External sub-agent | RFP bid strategy and response orchestration. See also: [Executive Guide](../../guides/rfp-agent.md) |
| [Specialist Engagement Agent](architecture/specialist-agent.md) | External sub-agent | Domain expertise routing and coordination |
| [Security Specialist](specialists/security-specialist-agent.md) | Sub-agent | SIEM, threat detection, MITRE ATT&CK |
| [Observability Specialist](specialists/observability-specialist-agent.md) | Sub-agent | APM, SLO/SLI, distributed tracing |
| [Search Specialist](specialists/search-specialist-agent.md) | Sub-agent | Relevance tuning, vector search, RAG |

### InfoSec (standalone role)

| Agent | Type | Purpose |
|-------|------|---------|
| [InfoSec Agent](deal-execution/infosec-agent.md) | Role | Security and compliance enablement (peer to SA) |

### Customer Architect

| Agent | Type | Purpose |
|-------|------|---------|
| [CA Agent](architecture/ca-agent.md) | Role | Customer-side architecture tracking |
| [Retrospective Agent](meta/retrospective-agent.md) | Sub-agent | Lessons learned from completed deals |

---

## Intelligence (2 roles, 6 agents)

Intelligence roles serve the entire account team. Competitive Intelligence is a standalone role focused on positioning and win strategy. The Intelligence Analyst is a composite role covering account-level, industry-level, market-level, and technology-level research.

### Competitive Intelligence

| Role | Agent | Purpose | Escalates To |
|------|-------|---------|--------------|
| Competitive Intelligence | [CI Agent](intelligence/ci-agent.md) | Competitive awareness, positioning, and win strategy | Senior Manager |

### Intelligence Analyst

| Agent | Type | Purpose |
|-------|------|---------|
| [Account Intelligence Agent](intelligence/aci-agent.md) | Sub-agent | Account-level intelligence and signal detection |
| [Industry Intelligence Agent](intelligence/ii-agent.md) | Sub-agent | Industry trend analysis and vertical insights |
| [Market News Agent](intelligence/mna-agent.md) | Sub-agent | Market news monitoring and impact assessment |
| [Tech Scout Scanner](intelligence/tech-signal-scanner-agent.md) | Sub-agent | Technology signal scanning from job postings |
| [Tech Scout Analyzer](intelligence/tech-signal-analyzer-agent.md) | Sub-agent | Technology signal analysis and map generation |

---

## Leadership (2 roles, 2 agents)

Leadership roles provide strategic oversight, escalation resolution, and product alignment.

| Role | Agent | Purpose | Escalates To |
|------|-------|---------|--------------|
| Senior Manager | [Senior Manager Agent](leadership/senior-manager-agent.md) | Strategic oversight, coaching, escalation resolution | VP/C-Level |
| Product Manager | [Product Manager Agent](leadership/pm-agent.md) | Product roadmap and customer alignment | PM Director |

---

## Delivery (2 roles, 2 agents)

Delivery roles bridge what was sold with what gets implemented.

| Role | Agent | Purpose | Escalates To |
|------|-------|---------|--------------|
| Delivery Manager | [Delivery Agent](delivery/delivery-agent.md) | Sales-to-delivery continuity | Senior Manager |
| Professional Services | [PS Agent](delivery/ps-agent.md) | Pre-sales to post-sales delivery bridge | Senior Manager |

---

## Governance System (10 agents)

Governance agents are system infrastructure, not human roles. They operate automatically on events and schedules, enforcing process quality across all account activity. No human job title maps to these functions. They are documented collectively.

| Agent | Trigger | Quality Gate |
|-------|---------|--------------|
| [Meeting Notes Agent](governance/meeting-notes-agent.md) | `meeting_ended` | Max 12 lines, all actions have owner + due date |
| [Task Shepherd Agent](governance/task-shepherd-agent.md) | `action_created` | Single owner, calendar due date, done-means defined |
| [Decision Registrar Agent](governance/decision-registrar-agent.md) | `decision_mentioned` | Owner, context, rationale documented |
| [Risk Radar Agent](governance/risk-radar-agent.md) | Various (meeting, decision, health drop) | Severity classified, owner assigned |
| [Nudger Agent](governance/nudger-agent.md) | Daily 9am/2pm, overdue actions | Max 1 reminder per action per day |
| [Reporter Agent](governance/reporter-agent.md) | Friday 5pm weekly | Fits in 10 lines, all claims linked to source |
| [Signal Matcher Agent](governance/signal-matcher-agent.md) | Signal detected | Signal routed to correct agent |
| [Playbook Curator Agent](governance/playbook-curator-agent.md) | `playbook_modified` | No CRITICAL violations |
| [InfoHub Curator Agent](governance/infohub-curator-agent.md) | `artifact_created/updated` | No semantic conflicts |
| [Knowledge Vault Curator Agent](governance/knowledge-vault-curator-agent.md) | `knowledge_proposal_received` | Anonymization verified, no duplicates |

### Governance Chain

```text
Meeting Notes -> Task Shepherd    (actions extracted)
Meeting Notes -> Decision Registrar (decisions extracted)
Meeting Notes -> Risk Radar       (risks identified)
Risk Radar -> Nudger/SM           (escalations)
Nudger -> SM                      (overdue > 5 days)
```

---

## Summary

"Role agents" are top-level agents that map 1:1 to a human role. "Sub-agents / system agents" are either sub-agents decomposed from a role (e.g., SA Discovery, Retrospective) or autonomous system agents with no human role equivalent (governance agents). Intelligence sub-agents have no parent role agent listed in the taxonomy; they operate as a composite function.

| Category | Roles | Role agents | Sub-agents / system agents | Definitions |
|----------|-------|-------------|---------------------------|-------------|
| Sales | 4 | 4 | 0 | 4 |
| Architecture (SA) | 1 | 1 | 12 | 13 |
| InfoSec | 1 | 1 | 0 | 1 |
| Customer Architect | 1 | 1 | 1 | 2 |
| Intelligence | 2 | 1 | 5 | 6 |
| Leadership | 2 | 2 | 0 | 2 |
| Delivery | 2 | 2 | 0 | 2 |
| Governance (system) | 0 | 0 | 10 | 10 |
| **Total** | **13** | **12** | **28** | **40** |

13 roles + 1 system function = 14 categories. 12 role agents + 18 role sub-agents + 10 governance system agents = 40 definitions (+ Orchestration Agent as [legacy meta-agent](meta/orchestration-agent.md) outside the taxonomy).

---

## Related Documentation

- [DDR-021: Agent Taxonomy](../../decisions/DDR_021_agent_taxonomy.md): Classification rationale
- [DDR-019: Agent System Domain Model](../../decisions/DDR_019_agent_system_domain_model.md): Holonic architecture
- [Agent Architecture](../../architecture/agents/agent-architecture.md): Design and collaboration model
- [Agent Handover Diagram](../../architecture/agents/agent-handover-diagram.md): Visual handover flows
