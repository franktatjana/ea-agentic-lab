---
order: 4
---

# RACI Model

This document defines responsibility assignment for all activities, decisions, and playbook execution across the EA Agentic Lab agent system. It covers two distinct agent layers: **role agents** (digital twins of human job functions) and **governance system agents** (autonomous infrastructure with no human role equivalent). Readers unfamiliar with the underlying architecture should review [DDR-019 v3.0](../decisions/DDR_019_agent_system_domain_model.md) for the holonic domain model and [DDR-021](../decisions/DDR_021_agent_taxonomy.md) for the agent taxonomy before using this matrix.

---

## How to Read This Model

**RACI definitions** apply throughout this document with a consistent meaning.

| Symbol | Role | Meaning |
|--------|------|---------|
| **R** | Responsible | Executes the work, either agent or human |
| **A** | Accountable | Owns the outcome; one per activity; always human for consequential decisions |
| **C** | Consulted | Provides input before or during execution |
| **I** | Informed | Receives output or update; one-way communication |

**Role agents** map 1:1 to a human job function. The human and the agent are two views of the same entity: the human sets intent and retains accountability, the agent executes and coordinates. In the matrices below, role agent abbreviations represent the agent performing work within that role, not an individual human.

**Governance system agents** operate on events and schedules with no human role equivalent. They are system infrastructure, comparable to CI/CD pipelines or monitoring systems. Their RACI appears in the [Governance Agent Activity Map](#governance-agent-activity-map) section rather than the platform-wide matrix.

The two layers never mix in a single RACI row. Every activity belongs to either the human-role layer or the governance-system layer.

---

## Role Agents

Twelve role agents cover the full engagement lifecycle from pre-sales strategy through post-sales renewal. The table below shows each agent's category and the lifecycle phases where it is the primary contributor. Agents not listed for a phase may still be consulted or informed; the phases listed indicate where the agent carries primary ownership or execution responsibility.

| Role | Agent ID | Category | Primary Lifecycle Phases |
|------|----------|----------|--------------------------|
| Account Executive | `ae-agent` | Sales | Pre-Sales, Post-Sales, Renewal |
| Competitive Intelligence | `ci-agent` | Sales | Pre-Sales |
| Value Engineer | `ve-agent` | Sales | Pre-Sales, Renewal |
| Partner Manager | `partner-agent` | Sales | Pre-Sales |
| Solution Architect | `sa-agent` | Architecture | Pre-Sales, Implementation |
| InfoSec | `infosec-agent` | Architecture | Pre-Sales, Implementation |
| Customer Architect | `ca-agent` | Architecture | Post-Sales, Renewal |
| Intelligence Analyst | (composite: 5 sub-agents) | Intelligence | Pre-Sales, ongoing |
| Senior Manager | `senior-manager-agent` | Leadership | All phases |
| Delivery Manager | `delivery-agent` | Implementation |Implementation, Post-Sales |
| Professional Services | `ps-agent` | Delivery | Implementation, Post-Sales |
| Customer Advocate | `cad-agent` | Sales | Post-Sales, Renewal |

**Intelligence Analyst** is a composite role comprising five sub-agents: Account Intelligence (ACI), Industry Intelligence (II), Market News (MNA), Tech Scout Scanner, and Tech Scout Analyzer. From a RACI perspective they act as a single **Intel** column, as no organization staffs five separate human roles for this function.

---

## Governance System Agents

Governance agents form an automated quality layer that runs across all account activity. No human job title maps to these functions. They activate on events, schedules, or downstream agent output, and they route alerts and escalations to the appropriate role agent when human attention is required. The table below shows each agent's trigger class and primary quality gate.

| Agent | Trigger Type | Primary Responsibility |
|-------|-------------|------------------------|
| Meeting Notes | `event: meeting_ended` | Extract actions, decisions, and risks from meeting transcripts (max 12 lines) |
| Task Shepherd | `event: action_created` | Validate that every action has a single owner, a calendar due date, and a done-means definition |
| Decision Registrar | `event: decision_mentioned` | Document owner, context, and rationale for every decision |
| Risk Radar | `event: meeting, decision, health drop` | Classify severity and assign owner for every identified risk |
| Nudger | `schedule: daily 9am/2pm + overdue` | Send one reminder per action per day; escalate to Senior Manager after 5 overdue days |
| Reporter | `schedule: Friday 5pm weekly` | Produce the weekly summary (max 10 lines, all claims linked to source) |
| Signal Matcher | `event: signal detected` | Route each incoming signal to the correct agent |
| Playbook Curator | `event: playbook_modified` | Validate playbook structure; block publication on CRITICAL violations |
| InfoHub Curator | `event: artifact_created/updated` | Check artifact integrity; reject on semantic conflicts |
| Knowledge Vault Curator | `event: knowledge_proposal_received` | Verify anonymization and deduplication before vault promotion |

---

## Specialist Sub-Agents

Three domain specialists sit under the Solution Architect role. They activate when technical depth exceeds what the SA role agent handles directly, either via parent dispatch from the SA or via Specialist Engagement Agent routing. Each specialist owns its own skills, runbooks, knowledge, and guardrails per DDR-019 v3.0 holonic criteria.

| Specialist | Domain | Parent Agent | Activation Trigger |
|------------|--------|--------------|-------------------|
| Security Specialist | SIEM, threat detection, MITRE ATT&CK | SA Agent | `specialist_request`, `poc_initiated`, `rfp_received` |
| Observability Specialist | APM, SLO/SLI, distributed tracing | SA Agent | `specialist_request`, `technical_depth_required` |

Nine additional specialist domains have been elaborated (big data, cloud solutions, data engineering, database, DevOps, migrations, network, platform, system design), each with its own orchestrator and sub-agents. See [domain/agents/README.md](../../domain/agents/README.md) for the full specialist catalog.

---

## Platform-Wide RACI

The activities below span the full engagement lifecycle. They derive from the pre-sales and post-sales governance models and reflect the primary agent contributions per activity. Columns follow role agent abbreviations: **AE** (Account Executive), **SA** (Solution Architect), **CA** (Customer Architect), **InfoSec**, **CI** (Competitive Intelligence), **VE** (Value Engineer), **Intel** (Intelligence composite), **SrMgr** (Senior Manager), **Delivery** (Delivery Manager + PS).

A role marked **A** is the human role accountable for the outcome. Governance system agents hold **R** for knowledge capture and curation activities (final column group) because those activities have no human-role equivalent.

| Activity | AE | SA | CA | InfoSec | CI | VE | Intel | SrMgr | Delivery |
|----------|----|----|----|---------|----|-----|-------|-------|----------|
| **Pre-Sales** | | | | | | | | | |
| Account qualification | A/R | C | - | - | C | C | C | I | - |
| Discovery and needs assessment | C | A/R | - | C | - | C | C | I | - |
| Technical architecture design | C | A/R | - | C | - | - | I | I | - |
| Solution sizing and estimation | C | A/R | - | - | - | C | - | I | C |
| Stakeholder mapping | A/R | C | - | - | - | C | C | C | - |
| Risk identification | C | A/R | - | C | - | - | I | A | - |
| Competitive positioning | C | C | - | - | A/R | C | I | I | - |
| Value engineering | C | C | - | - | - | A/R | C | I | - |
| POC design and execution | C | A | - | C | - | - | - | I | R |
| RFP response | A | R | - | C | C | C | - | A | C |
| Contract and commercial negotiation | A/R | I | - | - | C | C | - | A | - |
| **Implementation** | | | | | | | | | |
| Implementation planning | C | C | - | C | - | - | - | I | A/R |
| Technical onboarding | C | C | - | C | - | - | - | I | A/R |
| Security and compliance review | I | C | - | A/R | - | - | - | I | C |
| **Post-Sales** | | | | | | | | | |
| Health monitoring | C | C | A/R | - | - | - | I | I | C |
| Expansion and upsell identification | A/R | C | C | - | C | R | I | I | - |
| Renewal planning | A/R | I | C | - | - | R | I | C | - |
| Executive relationship management | A/R | I | C | - | - | - | I | C | - |
| **Governance (all phases)** | | | | | | | | | |
| Knowledge capture and curation | I | I | I | I | I | I | I | I | I |
| Playbook quality validation | I | I | I | I | I | I | I | I | I |

For knowledge capture and curation, the governance system agents (InfoHub Curator, Knowledge Vault Curator, Playbook Curator) hold **R**. The Senior Manager holds **A** for governance outcomes but does not execute the operational mechanics.

---

## Playbook-Specific RACI

The **Responsible** column below reflects the `intended_agent_role` field in each playbook YAML. The **Accountable** column reflects the human role that owns the outcome. Consulted and Informed roles are activity-dependent and defined per playbook step in the individual YAML files.

### Strategy Playbooks (PB_STR_*)

Strategy playbooks apply analytical frameworks to account and market context. All six are owned by role agents in the Sales or Leadership categories, reflecting that strategic framing is a commercial responsibility, not a purely technical one.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Three Horizons | PB_STR_001 | AE Agent | Account Executive |
| Ansoff Matrix | PB_STR_002 | AE Agent | Account Executive |
| BCG Matrix | PB_STR_003 | AE Agent | Account Executive |
| SWOT Analysis | PB_STR_004 | SA Agent | Solution Architect |
| PESTLE Analysis | PB_STR_005 | AE Agent | Account Executive |
| Stakeholder Mapping | PB_STR_006 | Senior Manager Agent | Senior Manager |

### SA Playbooks (PB_SA_*)

SA playbooks govern technical architecture, discovery, qualification, and solution design. The Solution Architect agent is responsible for all of them; for tech trend response the SA agent leads but Delivery contributes to implementation planning.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| TOGAF ADM Architecture Design | PB_SA_001 | SA Agent | Solution Architect |
| Sizing and Estimation | PB_SA_002 | SA Agent | Solution Architect |
| Solution Description | PB_SA_003 | SA Agent | Solution Architect |
| Situation Diagnostic | PB_SA_004 | SA Agent | Solution Architect |
| TECHDRIVE | PB_SA_005 | SA Agent | Solution Architect |
| Technical Demo Preparation | PB_SA_006 | SA Agent | Solution Architect |
| Customer Journey Mapping | PB_SA_007 | SA Agent | Solution Architect |
| InfoHub Health Review | PB_SA_008 | SA Agent | Solution Architect |
| Technical Value Narrative | PB_SA_009 | SA Agent | Solution Architect |
| Architecture Communication Plan | PB_SA_010 | SA Agent | Solution Architect |
| Value Stream Mapping | PB_SA_011 | SA Agent | Solution Architect |
| Technical Evaluation Execution | PB_SA_012 | SA Agent | Solution Architect |
| SA Engagement Qualification | PB_SA_013 | SA Agent | Solution Architect |
| Technical Discovery | PB_SA_014 | SA Agent | Solution Architect |
| Solution Fit Assessment | PB_SA_015 | SA Agent | Solution Architect |
| Tech Trend Response | PB_DEL_007 | SA Agent | Solution Architect |

### CA Playbooks (PB_CA_*)

Customer Architect playbooks govern health monitoring, success planning, adoption guidance, and support triage. The CA agent is responsible for all; AE is consulted or informed on activities with commercial implications.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Customer QBR | PB_CA_001 | CA Agent | Customer Architect |
| Track Support Case | PB_CA_002 | CA Agent | Customer Architect |
| Escalate Support Issue | PB_CA_003 | CA Agent | Customer Architect |
| Review Support Health | PB_CA_004 | CA Agent | Customer Architect |
| Cadence Calls | PB_CA_005 | CA Agent | Customer Architect |
| Health Triage | PB_CA_006 | CA Agent | Customer Architect |
| Customer Health Score | PB_CA_007 | CA Agent | Customer Architect |
| Customer Success Plan | PB_CA_008 | CA Agent | Customer Architect |
| Customer Journey VoC | PB_CA_009 | CA Agent | Customer Architect |
| Customer Guidelines | PB_CA_010 | CA Agent | Customer Architect |
| Training Plans | PB_CA_011 | CA Agent | Customer Architect |
| Adoption Guidance | PB_CA_012 | CA Agent | Customer Architect |

### Value Engineering (PB_VE_*)

Value Engineering playbooks quantify business value, build hypotheses, and track realized outcomes. The VE agent is responsible throughout; SA is consulted on technical validation steps.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Value Engineering | PB_VE_001 | VE Agent | Value Engineer |
| Value Hypothesis | PB_VE_002 | VE Agent | Value Engineer |
| Value Calculation | PB_VE_003 | VE Agent | Value Engineer |
| Value Stream Workshop | PB_VE_004 | VE Agent | Value Engineer |
| Value Proof | PB_VE_005 | VE Agent | Value Engineer |
| Value Realization | PB_VE_006 | VE Agent | Value Engineer |
| Value Amplification | PB_VE_007 | VE Agent | Value Engineer |

### Competitive Intelligence (PB_CI_*)

Competitive Intelligence playbooks analyze market forces and position the offering against alternatives. The CI agent is responsible; AE and SA are informed for positioning decisions.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Five Forces Analysis | PB_CI_001 | CI Agent | Competitive Intelligence |

### Account and Industry Intelligence (PB_ACI_*, PB_II_*)

Account Intelligence and Industry Intelligence playbooks feed context into the broader account team. They are executed by sub-agents of the Intelligence Analyst composite role.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Initial Account Research | PB_ACI_001 | ACI Agent | Intelligence Analyst |
| Org Mapping | PB_ACI_002 | ACI Agent | Intelligence Analyst |
| Periodic Account Refresh | PB_ACI_003 | ACI Agent | Intelligence Analyst |
| Industry Deep Dive | PB_II_001 | II Agent | Intelligence Analyst |
| Industry Trend Analysis | PB_II_002 | II Agent | Intelligence Analyst |

### Technology Signals (PB_TSCT_*)

Tech Scout playbooks scan job postings and public signals to detect technology adoption trends at target accounts. The scanner and analyzer sub-agents divide responsibilities between raw data acquisition and synthesis.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Tech Landscape Scan | PB_TSCT_001 | Tech Scout Scanner Agent | Intelligence Analyst |
| Vendor Analysis | PB_TSCT_002 | Tech Scout Analyzer Agent | Intelligence Analyst |

### Governance (PB_GOV_*)

Governance playbooks are executed by the governance system agents. Human accountability for governance outcomes rests with the Senior Manager, who reviews escalations and periodic reports but does not run the playbooks directly.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Nudge Effectiveness Review | PB_GOV_001 | Nudger Agent | Senior Manager |
| Action Audit | PB_GOV_002 | Task Shepherd Agent | Senior Manager |
| Decision Digest | PB_GOV_003 | Decision Registrar Agent | Senior Manager |
| Risk Review | PB_GOV_004 | Risk Radar Agent | Senior Manager |
| Signal Quality Review | PB_GOV_005 | Signal Matcher Agent | Senior Manager |
| InfoHub Freshness Audit | PB_GOV_006 | InfoHub Curator Agent | Senior Manager |
| Vault Structure Review | PB_GOV_007 | Knowledge Vault Curator Agent | Senior Manager |

### AE Playbooks (PB_AE_*)

Account Executive playbooks govern commercial execution, pipeline management, and deal qualification. The retrospective playbook is assigned to the Retrospective Agent (a CA sub-agent) because it captures lessons from completed engagements, which is a post-sales function.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Deal Retrospective | PB_AE_001 | Retrospective Agent | Customer Architect |
| Account Planning | PB_AE_002 | AE Agent | Account Executive |
| Sales QBR | PB_AE_003 | AE Agent | Account Executive |
| Opportunity Consult | PB_AE_004 | AE Agent | Account Executive |
| Pipeline Generation Review | PB_AE_005 | AE Agent | Account Executive |
| MEDDPICC Qualification | PB_AE_006 | AE Agent | Account Executive |

### RFP (PB_RFP_*)

RFP playbooks govern bid strategy, response coordination, quality review, and post-submission learning. The RFP Agent (an SA sub-agent) is responsible throughout; the AE is accountable for bid decisions because go/no-go is a commercial call.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| RFP Processing | PB_RFP_001 | RFP Agent | Account Executive |
| Bid Decision | PB_RFP_002 | RFP Agent | Senior Manager |
| Response Strategy | PB_RFP_003 | RFP Agent | Account Executive |
| Quality Review | PB_RFP_004 | RFP Agent | Solution Architect |
| Post-Submission Review | PB_RFP_005 | RFP Agent | Account Executive |

### InfoSec Playbooks (PB_ISEC_*)

InfoSec playbooks are executed by the InfoSec Agent, which is a standalone peer agent, not a sub-agent of the SA. The InfoSec Agent owns security and compliance enablement independently.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Security Questionnaire | PB_ISEC_001 | InfoSec Agent | InfoSec |
| Compliance Gap Assessment | PB_ISEC_002 | InfoSec Agent | InfoSec |

### Management Playbooks (PB_MGT_*)

Management playbooks handle escalation review and forecast commit approval. These are the only playbooks where the Senior Manager Agent is Responsible, not just Accountable.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Deal Escalation Review | PB_MGT_001 | Senior Manager Agent | Senior Manager |
| Forecast Commit Approval | PB_MGT_002 | Senior Manager Agent | Senior Manager |

### Delivery Playbooks (PB_DEL_*)

Delivery playbooks span implementation kickoff through post-implementation review. The Delivery Manager Agent is responsible for the implementation lifecycle; security stage adoption draws on specialist input.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Implementation Kickoff | PB_DEL_001 | Delivery Agent | Delivery Manager |
| Go-Live Readiness | PB_DEL_002 | Delivery Agent | Delivery Manager |
| Implementation Risk Review | PB_DEL_003 | Delivery Agent | Delivery Manager |
| Post-Implementation Review | PB_DEL_004 | Delivery Agent | Delivery Manager |
| Security Stage Adoption | PB_DEL_005 | Delivery Agent | Delivery Manager |
| Engage DSE | PB_DEL_006 | Delivery Agent | Delivery Manager |

### POC Playbook (PB_POC_*)

The POC Agent (an SA sub-agent) owns proof-of-concept execution. The SA role is accountable because POC outcomes directly affect technical credibility.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| POC Success Plan | PB_POC_001 | POC Agent | Solution Architect |

### Specialist Playbooks (PB_SEC_*, PB_OBS_*)

Specialist playbooks are executed by the domain specialist sub-agents under the SA role. Each specialist is responsible for its own domain playbooks; the SA is accountable as the parent role owner.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|------------------|-----------------|
| **Security** | | | |
| Technical Validation | PB_SEC_001 | Security Specialist | Solution Architect |
| RFx Response | PB_SEC_002 | Security Specialist | Solution Architect |
| Solution Scoping | PB_SEC_003 | Security Specialist | Solution Architect |
| Use Case Definition | PB_SEC_004 | Security Specialist | Solution Architect |
| Migration Planning | PB_SEC_005 | Security Specialist | Solution Architect |
| Platform Architecture | PB_SEC_006 | Security Specialist | Solution Architect |
| Technical POC | PB_SEC_007 | Security Specialist | Solution Architect |
| Validation Evidence | PB_SEC_008 | Security Specialist | Solution Architect |
| Deep Discovery | PB_SEC_009 | Security Specialist | Solution Architect |
| Custom Demo | PB_SEC_010 | Security Specialist | Solution Architect |
| Security Questionnaire (Specialist) | PB_SEC_011 | Security Specialist | Solution Architect |
| Competitive Battlecard | PB_SEC_012 | Security Specialist | Solution Architect |
| **Observability** | | | |
| Deep Discovery | PB_OBS_001 | Observability Specialist | Solution Architect |
| Custom Demo | PB_OBS_002 | Observability Specialist | Solution Architect |
| Technical Validation | PB_OBS_003 | Observability Specialist | Solution Architect |
| RFx Response | PB_OBS_004 | Observability Specialist | Solution Architect |
| Solution Scoping | PB_OBS_005 | Observability Specialist | Solution Architect |
| SLO/SLI Definition | PB_OBS_006 | Observability Specialist | Solution Architect |
| APM Implementation | PB_OBS_007 | Observability Specialist | Solution Architect |
| Platform Architecture | PB_OBS_008 | Observability Specialist | Solution Architect |
| Technical POC | PB_OBS_009 | Observability Specialist | Solution Architect |
| Alerting Strategy | PB_OBS_010 | Observability Specialist | Solution Architect |

### Partner Playbooks (PB_PTR_*)

Partner playbooks are executed by the Partner Manager Agent. Partner activities involve AE and SA as consulted parties for joint account planning.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Partner Engagement Health | PB_PTR_001 | Partner Agent | Partner Manager |
| Partner Dependency Tracking | PB_PTR_002 | Partner Agent | Partner Manager |
| Joint Account Planning | PB_PTR_003 | Partner Agent | Partner Manager |

### Product Manager Playbooks (PB_PM_*)

Product Manager playbooks align product roadmap with field signals. The PM Agent is responsible; SA and AE are consulted because feature gaps and roadmap commitments affect active deals.

| Playbook | ID | Responsible Agent | Accountable Role |
|----------|----|-------------------|-----------------|
| Feature Gap Analysis | PB_PM_001 | PM Agent | Product Manager |
| Roadmap Alignment | PB_PM_002 | PM Agent | Product Manager |
| Feature Request Pattern | PB_PM_003 | PM Agent | Product Manager |

---

## Governance Agent Activity Map

This table shows which governance agents support which role agents and under what conditions. Governance agents do not appear in the platform-wide RACI matrix above because they operate as system infrastructure: they react to events, enforce quality gates, and route alerts rather than executing business activities directly.

| Governance Agent | Triggers | Supports Role Agents | Output / Action |
|-----------------|----------|---------------------|-----------------|
| Meeting Notes | `meeting_ended` | All roles | Extracts actions, decisions, risks; feeds Task Shepherd, Decision Registrar, Risk Radar |
| Task Shepherd | `action_created` | All roles | Validates action completeness; blocks incomplete items from entering InfoHub |
| Decision Registrar | `decision_mentioned` | All roles | Logs decision with owner and rationale; surfaces to Reporter |
| Risk Radar | Meeting, decision, health drop events | AE, SA, CA, Delivery, SrMgr | Classifies risk severity; assigns owner; escalates HIGH to Senior Manager |
| Nudger | Daily schedule + overdue actions | All roles | Sends one reminder per action per day; escalates to Senior Manager at day 5 |
| Reporter | Friday 5pm schedule | Senior Manager, AE | Weekly summary with sourced claims; no more than 10 lines |
| Signal Matcher | Signal detected (any source) | AE, SA, CA, Intel | Routes signal to the correct role agent for processing |
| Playbook Curator | `playbook_modified` | SA, SrMgr | Validates playbook YAML; blocks on CRITICAL violations; warns on lower severity |
| InfoHub Curator | `artifact_created/updated` | All roles | Validates artifact integrity; rejects on semantic conflict; confirms clean artifacts |
| Knowledge Vault Curator | `knowledge_proposal_received` | InfoHub Curator, Intel | Verifies anonymization and deduplication; promotes approved knowledge to vault |

---

## Autonomy and Escalation

The governance system uses four trigger types to activate agents without human intervention: `parent_dispatch` (orchestrator routes a request to a sub-agent), `event` (an external system webhook fires the agent), `schedule` (a time-based cadence), and `downstream` (a peer sub-agent's output condition fires this agent). Most governance and intelligence sub-agents support two or more trigger types, allowing them to operate independently of any orchestrating role agent.

To prevent runaway cascades when sub-agents trigger each other, the system enforces cascade limits at the orchestrator level: a maximum routing depth of 3 hops, a maximum of 4 distinct agents per cascade chain, and a circuit breaker that stops any chain where the same agent is triggered twice. Governance agents escalate to the Senior Manager when an action is overdue beyond 5 days, when a risk is classified HIGH or CRITICAL, or when a playbook validation produces CRITICAL violations. All other governance output flows automatically to InfoHub without requiring human review.

---

## Version and References

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Date | 2026-03-13 |
| Supersedes | RACI Model v1.0 (2026-02-03) |
| Architecture reference | [DDR-019 v3.0: Agent System Domain Model](../decisions/DDR_019_agent_system_domain_model.md) |
| Taxonomy reference | [DDR-021: Agent Taxonomy](../decisions/DDR_021_agent_taxonomy.md) |
| Agent roster | [Agent Profiles Index](../reference/agent-profiles/index.md) |
| Lifecycle activities | [Pre-Sales Model](pre-sales-model.md), [Post-Sales Model](post-sales-model.md) |
