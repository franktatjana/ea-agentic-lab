---
title: "Agent Profiles"
description: "Index of all agent profile cards with quick-reference summary"
category: "reference"
keywords: ["agent", "profile", "index", "catalog"]
last_updated: "2026-02-11"
---

# Agent Profiles

Each agent in the EA Agentic Lab has a dedicated profile page documenting its identity, responsibilities, playbook ownership, handoff relationships, escalation rules, and personality traits. These profiles are the single source of truth for understanding what each agent does and how it interacts with the rest of the system.

For a condensed overview, see the [Agent Quick Reference](../../architecture/agents/agent-quick-reference.md). For architecture and design rationale, see [Agent Architecture](../../architecture/agents/agent-architecture.md).

## Leadership Agents (2)

Leadership agents provide strategic oversight across the agent ecosystem. They resolve escalations, approve major pursuits, and ensure product roadmap alignment with customer needs.

| Agent | Purpose | Escalates To |
|-------|---------|--------------|
| [Senior Manager](leadership/senior-manager-agent.md) | Strategic oversight, coaching, escalation resolution | VP/C-Level (deals >$2M) |
| [Product Manager (PM)](leadership/pm-agent.md) | Product roadmap and customer alignment | PM Director (strategic feature) |

## Sales Agents (4)

Sales agents drive commercial strategy, competitive positioning, value quantification, and partner ecosystem alignment to maintain pipeline health and forecast integrity.

| Agent | Purpose | Escalates To |
|-------|---------|--------------|
| [Account Executive (AE)](sales/ae-agent.md) | Commercial clarity and forecast stability | Senior Manager (>$500K, variance >15%) |
| [Competitive Intelligence (CI)](sales/ci-agent.md) | Competitive awareness and positioning | Senior Manager (strategic threat) |
| [Value Engineering (VE)](sales/ve-agent.md) | Business value quantification and tracking | Senior Manager (value hypothesis failing) |
| [Partner](sales/partner-agent.md) | Partner ecosystem alignment | Senior Manager (dependency risk) |

## Architecture Agents (3)

Architecture agents maintain technical integrity across engagements, handling solution design, customer-side architecture tracking, and domain expertise routing.

| Agent | Purpose | Escalates To |
|-------|---------|--------------|
| [Solution Architect (SA)](architecture/sa-agent.md) | Technical integrity and risk visibility | Senior Manager (HIGH risk) |
| [Customer Architect (CA)](architecture/ca-agent.md) | Customer-side architecture tracking | Senior Manager (health <50) |
| [Specialist](architecture/specialist-agent.md) | Domain expertise engagement | SA Lead (validation) |

## Deal Execution Agents (3)

Deal execution agents handle the structured processes that convert opportunities into wins, from RFP response orchestration through security clearance.

| Agent | Purpose | Escalates To |
|-------|---------|--------------|
| [RFP](deal-execution/rfp-agent.md) | RFP bid strategy and response orchestration | Senior Manager (score 45-55) |
| [POC](deal-execution/poc-agent.md) | POC execution and conversion | Senior Manager (blocker >48h) |
| [InfoSec](deal-execution/infosec-agent.md) | Security and compliance enablement | Senior Manager (blocker, no workaround) |

## Delivery Agents (3)

Delivery agents bridge what was sold with what gets implemented, coordinating handoffs, professional services, and support operations.

| Agent | Purpose | Escalates To |
|-------|---------|--------------|
| [Delivery](delivery/delivery-agent.md) | Sales-to-delivery continuity | Senior Manager (HIGH impl risk) |
| [Professional Services (PS)](delivery/ps-agent.md) | Pre-sales to post-sales delivery bridge | Senior Manager (scope issues) |
| [Support](delivery/support-agent.md) | Support operations and account health signals | Senior Manager (critical on strategic account) |

## Domain Specialists (3)

Domain specialists provide deep technical expertise in specific technology areas. They are activated by the Specialist agent or directly by SA/POC agents when domain-specific validation is needed.

| Agent | Domain | Playbook Prefix |
|-------|--------|-----------------|
| [Security Specialist](specialists/security-specialist-agent.md) | SIEM, threat detection, MITRE ATT&CK, SOC workflows | `PB_SEC` |
| [Observability Specialist](specialists/observability-specialist-agent.md) | APM, SLO/SLI, distributed tracing, alerting | `PB_OBS` |
| [Search Specialist](specialists/search-specialist-agent.md) | Relevance tuning, vector search, RAG, schema design | `PB_SRCH` |

## Governance Agents (8)

Governance agents enforce process and maintain artifacts. They operate automatically based on events and schedules, reducing entropy and ensuring nothing falls through the cracks.

| Agent | Trigger | Quality Gate |
|-------|---------|--------------|
| [Meeting Notes](governance/meeting-notes-agent.md) | `meeting_ended` | Max 12 lines, all actions have owner + due date |
| [Task Shepherd](governance/task-shepherd-agent.md) | `action_created` | Single owner, calendar due date, done-means defined |
| [Decision Registrar](governance/decision-registrar-agent.md) | `decision_mentioned` | Owner, context, rationale documented |
| [Risk Radar](governance/risk-radar-agent.md) | Various (meeting, decision, health drop) | Severity classified, owner assigned |
| [Nudger](governance/nudger-agent.md) | Daily 9am/2pm, overdue actions | Max 1 reminder per action per day |
| [Reporter](governance/reporter-agent.md) | Friday 5pm weekly | Fits in 10 lines, all claims linked to source |
| [Playbook Curator](governance/playbook-curator-agent.md) | `playbook_modified` | No CRITICAL violations |
| [InfoHub Curator](governance/infohub-curator-agent.md) | `artifact_created/updated` | No semantic conflicts |
| [Knowledge Vault Curator](governance/knowledge-vault-curator-agent.md) | `knowledge_proposal_received` | Anonymization verified, no duplicates |

## Intelligence Agents (2)

Intelligence agents scan external data sources and generate technology signal maps. They operate on schedules and produce structured intelligence for account teams.

| Agent | Purpose | Trigger |
|-------|---------|---------|
| [Tech Signal Scanner](intelligence/tech-signal-scanner-agent.md) | Scan job postings to extract technology signals | Weekly (Sundays 2am), manual |
| [Tech Signal Analyzer](intelligence/tech-signal-analyzer-agent.md) | Analyze scan data to generate technology signal maps | Weekly (Mondays 6am), on scan complete |

## Specialized and Meta Agents (2)

| Agent | Purpose | Trigger |
|-------|---------|---------|
| [Retrospective](meta/retrospective-agent.md) | Extract lessons learned from completed deals | Closed-won (>=100K), closed-lost (>=50K), lost to competitor |
| [Orchestration](meta/orchestration-agent.md) | Meta-layer coordination: process parsing, conflict detection, agent factory, versioning | Process submitted, conflict check |

## Agent Interaction Map

The following shows the primary handoff chains between agents. For the complete handover diagram, see [Agent Handover Diagram](../../architecture/agents/agent-handover-diagram.md).

### Pre-Sales Flow

```text
AE -> RFP        (RFP received)
AE -> POC        (POC requested)
AE -> SA         (technical questions)
AE -> CI         (competitor detected)
AE -> InfoSec    (security questionnaire)
AE -> SM         (deal > $500K)
```

### Post-Sales Flow

```text
AE -> Delivery   (contract signed)
Delivery -> PS   (implementation start)
Delivery -> CA   (go-live complete)
Support -> CA    (pattern detected)
Support -> SM    (critical on strategic account)
```

### Governance Chain

```text
Meeting Notes -> Task Shepherd    (actions extracted)
Meeting Notes -> Decision Registrar (decisions extracted)
Meeting Notes -> Risk Radar       (risks identified)
Risk Radar -> Nudger/SM           (escalations)
Nudger -> SM                      (overdue > 5 days)
```

## Related Documentation

- [Agent Quick Reference](../../architecture/agents/agent-quick-reference.md): Condensed lookup card
- [Agent Architecture](../../architecture/agents/agent-architecture.md): Design and collaboration model
- [Agent Responsibilities](../../architecture/agents/agent-responsibilities.md): Detailed scope and boundaries
- [Agent Handover Diagram](../../architecture/agents/agent-handover-diagram.md): Visual handover flows
