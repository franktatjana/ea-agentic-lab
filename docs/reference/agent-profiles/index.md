---
title: "Agent Profiles"
description: "Index of all agents organized by human role hierarchy"
category: "reference"
keywords: ["agent", "profile", "index", "catalog", "taxonomy"]
last_updated: "2026-03-01"
---

# Agent Profiles

The EA Agentic Lab has 33 agent definitions organized under 12 human roles. Each role is a digital twin of a real job function. Some roles operate as a single agent, others decompose into sub-agents when the process requires different tools, guardrails, or autonomy (per DDR-019 holonic criteria). Profiles represent roles. Definitions represent agents.

For design rationale, see [DDR-021: Agent Taxonomy](../../decisions/DDR_021_agent_taxonomy.md). For architecture details, see [Agent Architecture](../../architecture/agents/agent-architecture.md).

---

## Sales (4 roles, 4 agents)

Sales roles drive commercial strategy, competitive positioning, value quantification, and partner alignment.

| Role | Agent | Purpose | Escalates To |
|------|-------|---------|--------------|
| Account Executive | [AE Agent](sales/ae-agent.md) | Commercial clarity and forecast stability | Senior Manager |
| Competitive Intelligence | [CI Agent](sales/ci-agent.md) | Competitive awareness and positioning | Senior Manager |
| Value Engineer | [VE Agent](sales/ve-agent.md) | Business value quantification and tracking | Senior Manager |
| Partner Manager | [Partner Agent](sales/partner-agent.md) | Partner ecosystem alignment | Senior Manager |

---

## Architecture (2 roles, 9 agents)

Architecture roles maintain technical integrity across engagements. The Solution Architect decomposes into 7 sub-agents for deal execution processes and domain specialist work.

### Solution Architect

| Agent | Type | Purpose |
|-------|------|---------|
| [SA Agent](architecture/sa-agent.md) | Role | Technical integrity and risk visibility |
| [POC Agent](deal-execution/poc-agent.md) | Sub-agent | Proof of concept execution and conversion |
| [RFP Agent](deal-execution/rfp-agent.md) | Sub-agent | RFP bid strategy and response orchestration |
| [InfoSec Agent](deal-execution/infosec-agent.md) | Sub-agent | Security and compliance enablement |
| [Specialist Engagement Agent](architecture/specialist-agent.md) | Sub-agent | Domain expertise routing and coordination |
| [Security Specialist](specialists/security-specialist-agent.md) | Sub-agent | SIEM, threat detection, MITRE ATT&CK |
| [Observability Specialist](specialists/observability-specialist-agent.md) | Sub-agent | APM, SLO/SLI, distributed tracing |
| [Search Specialist](specialists/search-specialist-agent.md) | Sub-agent | Relevance tuning, vector search, RAG |

### Customer Architect

| Agent | Type | Purpose |
|-------|------|---------|
| [CA Agent](architecture/ca-agent.md) | Role | Customer-side architecture tracking |
| [Retrospective Agent](meta/retrospective-agent.md) | Sub-agent | Lessons learned from completed deals |

---

## Intelligence (1 role, 5 agents)

Intelligence analysis serves the entire account team. One composite role covers account-level, industry-level, market-level, and technology-level research. Each agent handles a different scope with different data sources and cadences.

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

| Category | Roles | Agents | Sub-agents |
|----------|-------|--------|------------|
| Sales | 4 | 4 | 0 |
| Architecture | 2 | 2 | 7 |
| Intelligence | 1 | 0 | 5 |
| Leadership | 2 | 2 | 0 |
| Delivery | 2 | 2 | 0 |
| Governance | 0 | 0 | 10 |
| **Total** | **11** | **10** | **22** |

11 roles + 1 system function = 12 categories. 10 role agents + 22 sub-agents + 1 system function (10 agents) = 33 definitions total. Orchestration Agent exists as a [legacy meta-agent](meta/orchestration-agent.md) outside the taxonomy.

---

## Related Documentation

- [DDR-021: Agent Taxonomy](../../decisions/DDR_021_agent_taxonomy.md): Classification rationale
- [DDR-019: Agent System Domain Model](../../decisions/DDR_019_agent_system_domain_model.md): Holonic architecture
- [Agent Architecture](../../architecture/agents/agent-architecture.md): Design and collaboration model
- [Agent Handover Diagram](../../architecture/agents/agent-handover-diagram.md): Visual handover flows
