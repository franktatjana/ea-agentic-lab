---
order: 2
---

# Agent Responsibilities, Scope & Handover Matrix

**Version:** 1.0
**Date:** 2026-01-16
**Status:** Authoritative Reference

---

## Overview

This document defines the complete responsibility matrix for all agents, including:
- Core responsibilities and task scope
- Decision authority boundaries
- Handover triggers and receiving agents
- Escalation paths and SLAs

---

## Agent Categories

| Category | Purpose | Count |
|----------|---------|-------|
| **Leadership** | Strategic oversight, product alignment | 2 |
| **Sales** | Commercial strategy, competitive intel, value, partners | 4 |
| **Architecture** | Solution design, customer architecture, domain expertise | 3 |
| **Deal Execution** | RFP orchestration, POC validation, security clearance | 3 |
| **Delivery** | Implementation handoff, services | 2 |
| **Intelligence** | Gather and analyze external data | 5 |
| **Governance** | Reduce entropy, maintain quality | 11 |
| **Orchestration** | Meta-layer process management | 1 |

---

## Communication Model

> **All agents communicate via signals, not shared notes/records.**

See [curator-agents.md](curator-agents.md) for signal specification.

---

## Functional Agents (14 + 14 sub-agents)

Agents are organized into 5 categories: Leadership (2), Sales (4), Architecture (3), Deal Execution (3), and Delivery (2). AE Agent and SA Agent are routing orchestrators with 8 and 6 sub-agents respectively. Sub-agent responsibilities are documented immediately after their parent agent. Each agent is documented below with its scope, handover triggers, and escalation paths.

### 1. AE Agent (Account Executive)

**Mission:** Commercial clarity and pipeline management

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Deal management, forecast, commercial risk |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/commercial/` |
| **Decision Authority** | Deals ≤ $500K, standard terms |

**Responsibilities:**
- Monitor CRM stage progression and detect anomalies
- Identify commercial risks (budget, timeline, competition)
- Generate meeting briefs from communications
- Maintain forecast accuracy (variance < 15%)
- Coordinate executive sponsor activities (function)

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Technical questions arise | SA Agent | Customer asks architecture/integration questions |
| RFP received | RFP Agent | Formal RFP document uploaded |
| POC requested | POC Agent | Customer requests proof-of-concept |
| Deal > $500K | Senior Manager | Needs go/no-go decision |
| Forecast variance > 15% | Senior Manager | Escalation required |
| Competitor identified | CI Agent | Competitive situation detected |
| Security questionnaire | InfoSec Agent | Security requirements received |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| Meeting Notes | Commercial risks | Add to risk tracker |
| CI Agent | Competitive intel | Adjust strategy |
| POC Agent | POC results | Drive to close |
| RFP Agent | Bid recommendation | Execute or escalate |

#### AE Sub-Agents (8)

The AE Agent is a routing orchestrator. All domain work is delegated to these sub-agents, each owning its own tools, flows, and prompt registry. See `domain/agents/account_executives/` for definition files.

**1.1 AE Deal Diagnosis Agent** (`ae-deal-diagnosis-agent`, parent: `ae-agent`)

Scores deal health (RED/YELLOW/GREEN) from engagement signals, diagnoses stall causes, extracts loss learnings, identifies resurrection candidates, and manages close plans.

| Handover | Target | Condition |
|----------|--------|-----------|
| Portfolio-level metrics | ae-pipeline-mgmt-agent | Request spans pipeline, not single deal |
| Meeting materials needed | ae-meeting-prep-agent | Prep or post-call summary requested |
| Hygiene check | ae-opportunity-hygiene-agent | Scheduled check, not ad-hoc diagnosis |

**1.2 AE Pipeline Management Agent** (`ae-pipeline-mgmt-agent`, parent: `ae-agent`)

Forecast accuracy analysis, pipeline coverage assessment, next-best-action prioritization, territory planning, and account tiering.

| Handover | Target | Condition |
|----------|--------|-----------|
| Individual deal diagnosis | ae-deal-diagnosis-agent | Single deal, not portfolio |
| Forecast variance > 15% | Senior Manager | Escalation required |

**1.3 AE Stakeholder Intelligence Agent** (`ae-stakeholder-agent`, parent: `ae-agent`)

Relationship mapping, champion health scoring, executive briefing preparation, multi-threading strategy, and stakeholder sentiment tracking.

| Handover | Target | Condition |
|----------|--------|-----------|
| Champion gone dark 21+ days | Senior Manager | Escalation |
| Competitive stakeholder moves | ae-signal-detection-agent | Competitive signal detected |

**1.4 AE Signal Detection Agent** (`ae-signal-detection-agent`, parent: `ae-agent`)

Budget signals, competitive threat detection, expansion opportunity identification, and commercial signal scoring from communications and CRM data.

| Handover | Target | Condition |
|----------|--------|-----------|
| Competitive threat at deal level | CI Agent | Deeper competitive analysis needed |
| Budget signal confirmed | ae-deal-diagnosis-agent | Deal health reassessment |

**1.5 AE Qualification Agent** (`ae-qualification-agent`, parent: `ae-agent`)

MEDDPICC assessment, deal readiness scoring, qualification gap analysis, and evidence-based scorecard generation.

| Handover | Target | Condition |
|----------|--------|-----------|
| Technical criteria gaps | SA Agent | Architecture fit assessment needed |
| Economic buyer unidentified | ae-stakeholder-agent | Stakeholder mapping required |

**1.6 AE Meeting Preparation Agent** (`ae-meeting-prep-agent`, parent: `ae-agent`)

Call briefs, QBR materials, post-call summaries, discovery preparation with structured questions, and objection handling frameworks.

| Handover | Target | Condition |
|----------|--------|-----------|
| Technical meeting prep | SA Agent | Architecture review meeting |
| Meeting notes captured | Meeting Notes Agent | Post-meeting processing |

**1.7 AE Opportunity Hygiene Agent** (`ae-opportunity-hygiene-agent`, parent: `ae-agent`)

Weekly CRM hygiene checks, stale deal alerts, paper process tracking (procurement, legal, security), and compliance checklists.

| Handover | Target | Condition |
|----------|--------|-----------|
| Stale deal detected | ae-deal-diagnosis-agent | Deal needs health assessment |
| Security review stalled | InfoSec Agent | Security clearance blocked |

**1.8 AE Pipeline Generation Agent** (`ae-pipeline-gen-agent`, parent: `ae-agent`)

Prospecting research, ICP-matched targeting, outreach strategy, SDR coordination, and pipeline generation tracking.

| Handover | Target | Condition |
|----------|--------|-----------|
| Target account identified | ACI Agent | Account intelligence research |
| Partner co-sell opportunity | Partner Agent | Partner leverage potential |

---

### 2. SA Agent (Solution Architect)

**Mission:** Technical integrity and architecture validation

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Technical design, risk, decisions |
| **InfoHub Path** | `{realm}/{node}/external-infohub/architecture/` |
| **Decision Authority** | Technical design within approved patterns |

**Responsibilities:**
- Detect technical risks from all sources
- Validate InfoHub technical completeness
- Maintain architecture decision records (ADRs)
- Derive risks from architectural decisions
- Coordinate with specialists when needed

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Domain expertise needed | Specialist Agent | Vertical/use-case specialist required |
| Security review needed | InfoSec Agent | Security implications detected |
| Customer arch changes | CA Agent | Customer-side architecture shifts |
| High-severity tech risk | Senior Manager | Risk score ≥ HIGH |
| Product gap identified | PM Agent | Feature request or gap |
| POC technical design | POC Agent | POC technical architecture handoff |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| AE Agent | Technical questions | Provide design guidance |
| RFP Agent | Technical RFP sections | Draft responses |
| POC Agent | Technical blockers | Resolve or escalate |
| Meeting Notes | Technical decisions | Log in ADR |

#### SA Sub-Agents (6)

The SA Agent is a routing orchestrator. All domain work is delegated to these sub-agents, each owning its own tools, flows, and prompt registry. See `domain/agents/solution_architects/` for definition files.

**2.1 SA Discovery Agent** (`sa-discovery-agent`, parent: `sa-agent`)

Structured discovery sessions, requirement elicitation, gap analysis against customer needs, and discovery summary generation.

| Handover | Target | Condition |
|----------|--------|-----------|
| Risk identified during discovery | sa-risk-agent | Technical risk needs assessment |
| Decision point surfaced | sa-decision-capture-agent | Architecture decision needed |
| Best practice applicable | sa-best-practices-agent | Pattern recommendation needed |

**2.2 SA Risk Agent** (`sa-risk-agent`, parent: `sa-agent`)

Technical risk identification, risk scoring (severity/likelihood), mitigation planning, and risk register maintenance.

| Handover | Target | Condition |
|----------|--------|-----------|
| Risk severity HIGH | Senior Manager | Escalation required |
| Risk affects journey | sa-journey-agent | Customer journey impact |
| Risk requires decision | sa-decision-capture-agent | Architecture trade-off needed |

**2.3 SA Decision Capture Agent** (`sa-decision-capture-agent`, parent: `sa-agent`)

Architecture decision records (ADRs), trade-off analysis, decision rationale documentation, and decision log maintenance.

| Handover | Target | Condition |
|----------|--------|-----------|
| Decision affects CSP evaluation | sa-csp-agent | Platform comparison impact |
| Decision creates new risk | sa-risk-agent | Risk register update needed |

**2.4 SA CSP Agent** (`sa-csp-agent`, parent: `sa-agent`)

Cloud service provider evaluation, platform comparison, CSP-specific architecture guidance, and multi-cloud strategy assessment.

| Handover | Target | Condition |
|----------|--------|-----------|
| CSP decision finalized | sa-decision-capture-agent | ADR creation needed |
| CSP gap identified | sa-best-practices-agent | Pattern recommendation |

**2.5 SA Best Practices Agent** (`sa-best-practices-agent`, parent: `sa-agent`)

Architecture pattern recommendations, best practice retrieval from knowledge vault, practice gap analysis, and pattern applicability assessment.

| Handover | Target | Condition |
|----------|--------|-----------|
| Practice gap in customer journey | sa-journey-agent | Journey stage needs improvement |
| Practice requires risk assessment | sa-risk-agent | Pattern has trade-offs |

**2.6 SA Journey Agent** (`sa-journey-agent`, parent: `sa-agent`)

Customer journey mapping, journey stage tracking, stakeholder journey analysis, and engagement progression monitoring.

| Handover | Target | Condition |
|----------|--------|-----------|
| Journey stage blocked | sa-risk-agent | Blocker needs risk assessment |
| Journey milestone reached | sa-discovery-agent | Next discovery phase |

---

### 3. CA Agent (Customer Architect)

**Mission:** Customer architecture tracking and mismatch detection

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Customer-side architecture, integration |
| **InfoHub Path** | `{realm}/{node}/external-infohub/context/customer_architecture/` |
| **Decision Authority** | Customer integration recommendations |

**Responsibilities:**
- Track customer infrastructure changes
- Detect design shifts and integration risks
- Sync architecture context between customer and platform
- Monitor customer technology adoption patterns
- Triage support intelligence signals via SK_CA_001 (support team bridge)

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Design mismatch critical | SA Agent | Platform design doesn't fit customer |
| Integration risk HIGH | SA Agent | Integration blocker detected |
| Customer health drop | Senior Manager | Health score < 50 |
| Support architecture issue | SA Agent | SIG_SUP_002 classified as architecture gap |
| Support relationship risk | AE Agent | SIG_SUP_003 classified as relationship risk |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| SA Agent | Platform architecture | Map to customer env |
| Support Team | SIG_SUP_* signals | Triage via SK_CA_001 |
| Delivery Agent | Implementation status | Track adoption |

---

### 4. CI Agent (Competitive Intelligence)

**Mission:** Competitive awareness and risk identification

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Competitive landscape, market intel |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/competitive/` |
| **Decision Authority** | Competitive positioning recommendations |

**Responsibilities:**
- Detect competitor mentions in all content
- Surface competitive risks proactively
- Enrich risk and decision logs with competitive context
- Maintain competitive battle cards

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Competitor in RFP | RFP Agent | Competitive RFP situation |
| Competitor in POC | POC Agent | Competitive POC evaluation |
| Strategic threat | Senior Manager | Major competitive risk |
| Pricing pressure | AE Agent | Competitive pricing detected |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| AE Agent | Competitor mention | Research and brief |
| RFP Agent | RFP competitor list | Provide battle cards |
| Meeting Notes | Competitive signals | Add to intel |

---

### 5. VE Agent (Value Engineering)

**Mission:** Quantify and prove business value

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Business case, ROI, value realization |
| **InfoHub Path** | `{realm}/{node}/external-infohub/value/` |
| **Decision Authority** | Value hypothesis definition |

**Lifecycle Phases:**
1. **Discovery** → Understand current state, pain points
2. **Hypothesis** → Define value drivers, build initial case
3. **Proof** → Validate during POC, collect evidence
4. **Realization** → Track post-deployment value
5. **Amplification** → Document for case studies, renewals

**Handover Triggers:**

| Trigger | Receiving Agent | Condition | Phase Transition |
|---------|-----------------|-----------|------------------|
| Initial engagement | SA Agent | Technical validation needed | Discovery → Hypothesis |
| POC start | POC Agent | Value hypothesis for POC criteria | Hypothesis → Proof |
| POC complete | AE Agent | Business case for negotiation | Proof → Realization |
| Deployment complete | CA Agent | Realization tracking | Realization ongoing |
| Value not materializing | Senior Manager | Value hypothesis failed | Escalation |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| AE Agent | Business context | Build hypothesis |
| POC Agent | POC metrics | Validate proof |
| CA Agent | Adoption metrics | Track realization |

---

### 6. Senior Manager Agent

**Mission:** Strategic oversight, escalation resolution, resource allocation

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Decisions > $500K, escalations, resources |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/governance/leadership/` |
| **Decision Authority** | Go/no-go > $500K, resource conflicts, exceptions |

**Decision Authority Matrix:**

| Decision Type | Authority | Escalate To |
|---------------|-----------|-------------|
| Deals ≤ $500K | Delegate to AE | - |
| Deals $500K - $2M | Senior Manager | - |
| Deals > $2M | Senior Manager | VP/C-level |
| Standard terms | Delegate to AE | - |
| Non-standard terms | Senior Manager | Legal |
| Resource conflicts | Senior Manager | - |
| Technical design | Delegate to SA | - |
| Strategic features | Senior Manager | Product |

**Receives Escalations From:**

| Source Agent | Escalation Type | SLA |
|--------------|-----------------|-----|
| AE Agent | Forecast variance > 15%, deal > $500K | 4 hours |
| SA Agent | HIGH severity tech risk | 4 hours |
| RFP Agent | Borderline bid decision (45-55 score) | 24 hours |
| POC Agent | Scope change, timeline extension | 24 hours |
| InfoSec Agent | Security blocker, no workaround | 4 hours |
| Risk Radar | CRITICAL severity risk | Immediate |
| VE Agent | Value hypothesis failure | 24 hours |

---

### 7. RFP Agent

**Mission:** RFP strategy, bid/no-bid decisions, response orchestration

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | RFP analysis, response coordination |
| **InfoHub Path** | `{realm}/{node}/external-infohub/context/rfp/` |
| **Decision Authority** | Bid recommendation (final approval by Senior Manager if borderline) |

**Bid Decision Thresholds:**

| Score | Decision | Action |
|-------|----------|--------|
| ≥ 70 | BID | Proceed with full response |
| 50-69 | CONDITIONAL | Bid if strategic_fit ≥ 80 |
| 45-55 | ESCALATE | Senior Manager decision |
| < 50 | NO-BID | Document rationale |

**Team Orchestration:**

| Role | Agent | Responsibility |
|------|-------|----------------|
| RFP Lead | RFP Agent | Strategy, exec summary, final review |
| Technical Lead | SA Agent | Technical responses, architecture |
| Commercial Lead | AE Agent | Pricing, terms, commercial leverage |
| Security Lead | InfoSec Agent | Security questionnaire, compliance |
| Competitive Lead | CI Agent | Positioning, landmine detection |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Technical sections | SA Agent | Technical response drafting |
| Security sections | InfoSec Agent | Security questionnaire |
| Competitor analysis | CI Agent | Competitive positioning needed |
| Pricing strategy | AE Agent | Commercial terms drafting |
| Borderline decision | Senior Manager | Score 45-55 |
| RFP won | POC Agent or AE Agent | Transition to next phase |

---

### 8. POC Agent

**Mission:** POC execution from qualification through decision

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | POC design, execution, success criteria |
| **InfoHub Path** | `{realm}/{node}/external-infohub/journey/poc/` |
| **Decision Authority** | POC qualification, success criteria |

**Qualification Criteria:**

| Category | Go Criteria | No-Go Signals |
|----------|-------------|---------------|
| Budget | Confirmed budget | No budget allocated |
| Timeline | Decision < 90 days | Undefined timeline |
| Evaluator | Technical evaluator identified | POC to learn, not decide |
| Success | Criteria agreed | Vague success definition |
| Commitment | Customer time/resources committed | No real data access |

**POC Outcomes:**

| Outcome | Next Step | Receiving Agent |
|---------|-----------|-----------------|
| Clear Win | Commercial negotiation | AE Agent |
| Conditional Win | Gap remediation | SA Agent |
| Technical Win, No Decision | Escalate to sponsor | Senior Manager |
| Loss (any type) | Loss analysis | AE Agent + CI Agent |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Technical design needed | SA Agent | POC architecture |
| Value criteria needed | VE Agent | Business case metrics |
| Technical blocker > 48h | Senior Manager | Escalation |
| Scope change requested | Senior Manager | Approval needed |
| POC complete - win | AE Agent | Drive to close |
| POC complete - loss | CI Agent | Competitive analysis |

---

### 9. InfoSec Agent

**Mission:** Security enablement and compliance validation

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Security questionnaires, compliance |
| **InfoHub Path** | `{realm}/{node}/external-infohub/architecture/security/` |
| **Decision Authority** | Gap classification, workaround approval |

**Gap Classification:**

| Classification | Definition | Action |
|----------------|------------|--------|
| **Blocker** | No workaround exists | Escalate immediately |
| **Workaround** | Compensating control available | Document, get sign-off |
| **Roadmap** | Capability planned | Provide timeline |
| **Compliant** | Meets requirement | Provide evidence |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Blocker identified | Senior Manager | No workaround, deal at risk |
| Product gap | PM Agent | Feature request for roadmap |
| RFP security section | RFP Agent | Completed questionnaire |
| Compliance sign-off | AE Agent | Deal can proceed |

---

### 10. Delivery Agent

**Mission:** Implementation continuity and delivery risk detection

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Post-sale handoff, implementation tracking |
| **InfoHub Path** | `{realm}/{node}/external-infohub/journey/delivery/` |
| **Decision Authority** | Implementation approach recommendations |

**Responsibilities:**
- Manage sales-to-delivery handoff
- Track implementation against commitments
- Detect delivery risks early
- Maintain continuity between teams

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Contract signed | PS Agent | Implementation planning |
| Implementation risk HIGH | Senior Manager | Escalation |
| Go-live complete | CA Agent | Transition to adoption |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| AE Agent | Signed contract | Initiate delivery |
| POC Agent | POC learnings | Apply to implementation |
| VE Agent | Value commitments | Track realization |

---

### 11. PS Agent (Professional Services)

**Mission:** Bridge pre-sales promises with post-sales delivery

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Services scoping, delivery coordination |
| **InfoHub Path** | `{realm}/{node}/external-infohub/journey/services/` |
| **Decision Authority** | Services scope, resource allocation |

**Engagement Phases:**

| Phase | Activities | Handover To |
|-------|------------|-------------|
| Pre-Sales (B10) | Scoping, SOW, resource planning | Delivery Agent |
| Post-Sales (C05) | Implementation, training, handoff | CA Agent |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| SOW signed | Delivery Agent | Implementation start |
| Technical escalation | SA Agent | Architecture issue |
| Training complete | CA Agent | Adoption tracking |
| Implementation complete | CA Agent | Transition to post-sales |

---

### 12. Partner Agent

**Mission:** Partner ecosystem coordination

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Partner engagement, dependency tracking |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/governance/partners/` |
| **Decision Authority** | Partner engagement recommendations |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Partner referral received | AE Agent | New opportunity |
| Partner technical issue | SA Agent | Integration problem |
| Partner risk identified | Senior Manager | Dependency risk |
| Partner SOW needed | PS Agent | Partner services |

---

### 13. PM Agent (Product Manager)

**Mission:** Product roadmap alignment with customer needs

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Feature requests, roadmap alignment |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/governance/product/` |
| **Decision Authority** | Feature request prioritization |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Feature committed | AE Agent | Roadmap commitment for deal |
| Technical feasibility | SA Agent | Design validation |
| Strategic feature | Senior Manager | High-impact request |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| SA Agent | Feature gap | Assess roadmap |
| InfoSec Agent | Security gap | Assess roadmap |
| RFP Agent | Product requirements | Validate capability |

---

### 14. Specialist Agent

**Mission:** Domain expertise coordination

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Specialist engagement orchestration |
| **InfoHub Path** | `{realm}/{node}/internal-infohub/specialists/` |
| **Decision Authority** | Specialist assignment |

**Specialist Types:**
- Vertical specialists (Finance, Healthcare, etc.)
- Use-case specialists (Security, Observability, etc.)
- Technology specialists (Cloud, Kubernetes, etc.)

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Specialist engaged | SA Agent | Technical validation |
| Domain insight | AE Agent | Commercial leverage |
| Best practice | CA Agent | Implementation guidance |

---

## Governance Agents (11)

[image: Governance Processing Chain - Meeting Notes triggering parallel processing by Task Shepherd, Decision Registrar, and Risk Radar]

### 1. Meeting Notes Agent

**Mission:** Decision-grade meeting notes from messy input

| Trigger | `meeting_ended`, `notes_uploaded`, `transcript_available` |
|---------|-------|
| **Output Path** | `{realm}/{node}/meetings/` |
| **Quality Gate** | Max 12 lines, all actions have owner |

**Handover:**
- → Task Shepherd Agent (actions)
- → Decision Registrar Agent (decisions)
- → Risk Radar Agent (risks)
- → Nudger Agent (if critical blockers)

---

### 2. Task Shepherd Agent

**Mission:** Action validation and enrichment

| Trigger | `action_created`, `meeting_note_published`, `decision_made` |
|---------|-------|
| **Output Path** | `{realm}/{node}/internal-infohub/actions/` |
| **Quality Gate** | Single owner, due date, done criteria |

**Validation Failure Handling:**
- Notify action owner with specific failure reason
- Owner has 24 hours to fix
- If not fixed → Nudger Agent escalation

---

### 3. Decision Registrar Agent

**Mission:** Decision capture and lifecycle tracking

| Trigger | `decision_mentioned`, `meeting_note_published` |
|---------|-------|
| **Output Path** | `{realm}/{node}/external-infohub/decisions/` |
| **Quality Gate** | All required fields, lifecycle state |

**Conflict Resolution:**
- If conflicting decisions detected → flag both
- Notify decision owners
- Escalate to Senior Manager if unresolved in 48 hours

---

### 4. Nudger Agent

**Mission:** Follow-through enforcement

| Trigger | Daily 9am & 2pm, `action_due_approaching`, `action_overdue` |
|---------|-------|
| **Output Path** | `{realm}/{node}/internal-infohub/governance/nudges/` |
| **Quality Gate** | Max 1 reminder per action per day |

**Escalation Chain:**
1. Overdue > 2 days → Owner's manager
2. Overdue > 5 days → Governance lead
3. Blocked > 3 days → Senior Manager Agent

---

### 5. Risk Radar Agent

**Mission:** Early risk surfacing and visibility

| Trigger | `meeting_note_published`, `decision_made`, `health_score_dropped` |
|---------|-------|
| **Output Path** | `{realm}/{node}/internal-infohub/risks/` |
| **Quality Gate** | All risks have owner, severity, review date |

**Risk State Transitions:**

| Transition | Approver | SLA |
|------------|----------|-----|
| Identified → Assessed | Risk owner | 24 hours |
| Assessed → Mitigating | Risk owner | 48 hours |
| Mitigating → Mitigated | Risk owner + Senior Manager | On mitigation complete |
| Any → Materialized | Automatic | Immediate |

---

### 6. Reporter Agent

**Mission:** Chaos to 10-line summary

| Trigger | Friday 5pm (weekly), Monday 8am (preview) |
|---------|-------|
| **Output Path** | `{realm}/{node}/internal-infohub/governance/reports/` |
| **Quality Gate** | 10 lines max, all claims sourced |

**Report Distribution:**
- Weekly digest → Account team + Leadership
- Critical alerts → Immediate to Senior Manager

---

### 7. Playbook Curator Agent

**Mission:** Playbook governance and lifecycle

| Trigger | `playbook_created`, `playbook_modified`, `on_change` |
|---------|-------|
| **Output Path** | `governance/playbook_validations/` |
| **Quality Gate** | No CRITICAL violations |

**Responsibilities:**
- Existence Validation: Check required playbooks exist
- Structure Alignment: Validate playbook structure matches schema
- Blueprint Correspondence: Ensure playbooks map to blueprints (A01-A06, B01-B10, C01-C07)
- Boundary Validation: Verify playbooks don't cross category boundaries
- Threshold Validation: Check thresholds are correct, suggest updates
- Framework Suggestions: Identify missing frameworks, suggest new playbooks

**Does NOT:**
- Execute playbooks
- Modify playbook content (only flags issues)
- Manage InfoHub artifacts (that's InfoHub Curator)
- Manage the Global Knowledge Vault (that's Knowledge Vault Curator)

---

### 8. InfoHub Curator Agent

**Mission:** Govern semantic integrity and lifecycle of InfoHub artifacts (Vaults 1 & 2)

| Trigger | `artifact_created`, `artifact_updated`, scheduled staleness checks |
|---------|-------|
| **Output Path** | `governance/` (semantic_conflicts.yaml, staleness_report.yaml, deprecation_log.yaml) |
| **Quality Gate** | No unresolved semantic conflicts |

**Responsibilities:**
- Semantic Integrity: Ensure knowledge artifacts are consistent and non-contradictory
- Lifecycle Management: Track artifact state (active → stale → deprecated → archived)
- Deprecation Tagging: Tag knowledge as deprecated when superseded
- Conflict Detection: Raise issues when semantic conflicts detected
- Staleness Detection: Flag artifacts not updated within expected cadence

**Reads From:**
- `{realm}/{node}/external-infohub/` and `{realm}/{node}/internal-infohub/` - all subdirectories (architecture, decisions, risks, etc.)

**CAN Write:**
- Deprecation tags
- Semantic conflict issues
- Lifecycle state changes
- Staleness flags

**Does NOT Write:**
- Meeting notes (Meeting Notes Agent writes)
- Daily notes
- Actions (Task Shepherd writes)
- Raw content of any kind

**Deprecation Rules:**

| Artifact Type | Auto-Deprecate After | Manual Deprecation |
|---------------|---------------------|-------------------|
| Meeting Notes | 90 days (staleness) | Owner or Curator |
| Decisions | Never (audit trail) | Only supersede |
| Risks | When mitigated + 30 days | Risk owner |
| Actions | When completed + 30 days | Task owner |
| Architecture Docs | When superseded | SA Agent |
| Competitive Intel | 60 days (market changes) | CI Agent |

**Handover:**
- Emits `semantic_conflict` signal → Owning agents notified
- Emits `staleness_detected` signal → Owning agent
- Emits `artifact_deprecated` signal → All agents

---

### 9. Knowledge Vault Curator Agent

**Mission:** Govern the Global Knowledge Vault (Vault 3), ensuring anonymized cross-account learnings are valid, non-duplicative, and aligned with playbook evolution.

| Trigger | `knowledge_contributed`, `playbook_feedback_received`, scheduled quality audits |
|---------|-------|
| **Output Path** | `governance/knowledge_vault/` |
| **Quality Gate** | No PII leakage, no duplicate patterns |

**Responsibilities:**
- Anonymization validation: verify all contributed knowledge has PII removed
- Deduplication: detect and merge overlapping patterns across accounts
- Quality scoring: rate contributed learnings by evidence strength and reusability
- Playbook alignment: connect validated patterns to relevant playbooks (DDR-014)
- Lifecycle management: archive superseded patterns, promote validated ones

**Handover:**
- Emits `knowledge_validated` → Playbook Curator (pattern ready for playbook integration)
- Emits `anonymization_failed` → Contributing agent (PII detected, needs rework)
- Emits `pattern_superseded` → All consuming agents

---

### 10. Signal Matcher Agent

**Mission:** Route incoming signals to the correct consuming agent based on signal type, severity, and context.

| Trigger | Any signal emitted by any agent |
|---------|-------|
| **Output Path** | `governance/signal_routing/` |
| **Quality Gate** | No unrouted signals, no duplicate deliveries |

**Responsibilities:**
- Signal classification: match incoming signals to registered consumers
- Priority routing: ensure HIGH/CRITICAL signals reach targets within SLA
- Dead letter handling: flag signals with no registered consumer
- Delivery confirmation: track signal acknowledgment from receiving agents

**Handover:**
- Routes signals to their registered consumers per signal catalog
- Emits `signal_unroutable` → Orchestration Agent (no consumer registered)

---

### 11. Observability Specialist Agent

**Mission:** Monitor agent health, performance metrics, and system-level observability across the agent ecosystem.

| Trigger | Scheduled health checks, `agent_error`, `performance_threshold_exceeded` |
|---------|-------|
| **Output Path** | `governance/observability/` |
| **Quality Gate** | All agents reporting health within SLA |

**Responsibilities:**
- Agent health monitoring: track heartbeat, error rates, response times
- Performance trending: detect degradation patterns before they become failures
- Capacity signaling: flag agents approaching resource or rate limits
- Incident correlation: connect failures across agents to identify systemic issues

**Handover:**
- Emits `agent_unhealthy` → Senior Manager (agent degradation detected)
- Emits `performance_alert` → Owning agent (self-correction opportunity)
- Emits `incident_detected` → Risk Radar Agent (systemic risk)

---

## Orchestration Agent (1)

**Mission:** Transform human processes into agents and playbooks

| Trigger | Human process description submitted |
|---------|-------|
| **Output Path** | `process_registry/` |
| **Decision Authority** | Process parsing, conflict detection |

**Components:**
- Process Parser
- Conflict Detector
- Agent Factory
- Playbook Generator
- Version Controller
- Audit Logger

**Conflict Escalation:**
- CRITICAL conflicts → Block, require human resolution
- HIGH conflicts → Flag, request human decision
- MEDIUM/LOW → Auto-suggest resolution

---

## Intelligence Agents (5)

### 1. Tech Signal Scanner Agent

**Mission:** Detect technology adoption signals from job postings

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Job posting scanning, technology extraction |
| **Output Path** | `{realm}/intelligence/technology_scout/` |
| **Decision Authority** | Technology classification, ring assignment |

**Responsibilities:**
- Scan job postings from configured sources (LinkedIn, Indeed, company careers)
- Extract technology mentions and classify by quadrant
- Detect competitor tool adoption
- Emit `SIG_TECH_004` (job_scan_completed) on completion

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Scan completed | Tech Signal Analyzer Agent | Always |

---

### 2. Tech Signal Analyzer Agent

**Mission:** Generate technology radar and trend analysis

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Technology trend analysis, radar generation |
| **Output Path** | `{realm}/intelligence/technology_scout/` |
| **Decision Authority** | Ring placement, trend classification |

**Responsibilities:**
- Process scan results into technology radar
- Detect ring changes and significant trends
- Identify competitive technology adoption
- Emit `SIG_TECH_001` (map updated), `SIG_TECH_002` (new tech), `SIG_TECH_003` (trending)

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Competitor tech detected | CI Agent | `is_competitor == true` |
| Strategic tech shift | SA Agent | Ring change on Adopt/Hold |
| Sales opportunity from tech | AE Agent | Alignment with our offerings |

---

### 3. Market News Analysis Agent (MNA)

**Mission:** Monitor and analyze market news at realm and node levels

| Attribute | Value |
|-----------|-------|
| **Primary Scope** | Company news, industry trends, solution-domain intelligence |
| **Realm Output** | `{realm}/intelligence/market_news/realm_digest.yaml` |
| **Node Output** | `{realm}/{node}/internal-infohub/market_intelligence/news_digest.yaml` |
| **Decision Authority** | News classification, relevance scoring, urgency assessment |

**Responsibilities:**
- Scan public news sources for realm-associated companies
- Detect industry and solution-domain news relevant to active nodes
- Classify news as realm-level (company) or node-level (industry + solution)
- Score relevance and urgency against active engagement context
- Generate weekly digests at both realm and node levels
- Update `realm_profile.yaml#recent_news` with high-impact items

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| High-impact news detected | AE Agent | `relevance_score >= 0.8` |
| Competitive news detected | CI Agent | Competitor in active node |
| Risk-bearing news | Risk Radar Agent | News implies deal risk |
| Technical trend shift | SA Agent | Technology or market shift |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| Orchestration Agent | `SIG_LC_001` (node_created) | Initialize node news monitoring |
| CI Agent | Competitive context | Refine competitor keyword scanning |

---

### 4. ACI Agent (Account Intelligence)

**Mission:** Research companies from public sources, build organigrams, identify business strategy and opportunities

| Attribute | Value |
|-----------|-------|
| **Team** | account_intelligence |
| **Primary Scope** | Company research, organigram management, opportunity identification, business line analysis |
| **Output Path** | `{realm}/intelligence/account_intelligence/` |
| **Decision Authority** | Company profile classification, opportunity scoring |

**Responsibilities:**

- Research companies from public sources and build comprehensive profiles
- Build and maintain organigrams for target accounts
- Identify business strategy, key initiatives, and transformation programs
- Detect opportunities aligned with account context and offerings
- Analyze business lines and organizational structure

**Triggers:**

| Trigger | Condition |
|---------|-----------|
| `realm_created` | New realm initialized |
| `manual_research_requested` | User requests account research |
| `SIG_MNA_002` | High-impact news detected for account |

**Outputs:** `company_profile.yaml`, `organigram.yaml`, `opportunity_map.yaml`

**Signals Emitted:**

| Signal | Name | Condition |
|--------|------|-----------|
| `SIG_ACI_001` | account_intelligence_updated | Company profile refreshed |
| `SIG_ACI_002` | organigram_updated | Organigram changes detected |
| `SIG_ACI_003` | new_opportunity_identified | New opportunity mapped |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Commercial opportunity detected | AE Agent | Opportunity aligned with active deal |
| Competitive signal in profile | CI Agent | Competitor presence in account |
| Industry context needed | II Agent | Account requires sector analysis |
| Technical opportunity identified | SA Agent | Architecture or solution opportunity |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| MNA Agent | `SIG_MNA_002` (high-impact news) | Update company profile |
| Orchestration Agent | `realm_created` | Initialize account research |

---

### 5. II Agent (Industry Intelligence)

**Mission:** Analyze industry strategy, market trends, sector dynamics, regulatory landscape, benchmarks

| Attribute | Value |
|-----------|-------|
| **Team** | industry_intelligence |
| **Primary Scope** | Industry analysis, regulatory monitoring, sector benchmarking, trend detection |
| **Output Path** | `{realm}/intelligence/industry_intelligence/` |
| **Decision Authority** | Industry classification, trend severity, regulatory impact assessment |

**Responsibilities:**

- Analyze industry strategy and sector dynamics for target accounts
- Monitor regulatory landscape and compliance changes
- Perform sector benchmarking against industry peers
- Detect emerging trends and market shifts relevant to engagements
- Generate industry profiles with competitive positioning context

**Triggers:**

| Trigger | Condition |
|---------|-----------|
| `realm_created` | New realm initialized |
| `SIG_MNA_001` | Market news digest published |
| `SIG_MNA_002` | High-impact news detected |
| Weekly schedule | Scheduled weekly industry refresh |

**Outputs:** `industry_profile.yaml`, `trend_analysis.yaml`, `regulatory_landscape.yaml`

**Signals Emitted:**

| Signal | Name | Condition |
|--------|------|-----------|
| `SIG_II_001` | industry_intelligence_updated | Industry profile refreshed |
| `SIG_II_002` | industry_trend_detected | Significant trend identified |
| `SIG_II_003` | regulatory_change_detected | Regulatory change impacting account |

**Handover Triggers:**

| Trigger | Receiving Agent | Condition |
|---------|-----------------|-----------|
| Commercial implication detected | AE Agent | Industry shift affects deal strategy |
| Competitive landscape change | CI Agent | Industry movement impacts competition |
| Account context enrichment | ACI Agent | Industry data enriches account profile |
| Technical trend identified | SA Agent | Technology trend in sector |
| Risk-bearing regulatory change | Risk Radar Agent | Regulation impacts deal or delivery |

**Receives From:**

| Source Agent | Artifact | Action Required |
|--------------|----------|-----------------|
| MNA Agent | `SIG_MNA_001`, `SIG_MNA_002` | Incorporate news into industry analysis |
| Orchestration Agent | `realm_created` | Initialize industry research |
| ACI Agent | Account context | Align industry analysis to account |

---

[image: Escalation Decision Tree - consolidated escalation paths from all agents to Senior Manager]

## Cross-Agent Communication Protocol

### Message Format

```yaml
message:
  from_agent: "SA Agent"
  to_agent: "POC Agent"
  type: "handover"
  priority: "high"
  context:
    realm: "ACME"
    node: "SECURITY_CONSOLIDATION"
    trigger: "poc_technical_design_needed"
  payload:
    artifact_path: "ACME/SECURITY_CONSOLIDATION/external-infohub/architecture/design_v1.md"
    summary: "Technical architecture ready for POC planning"
  requires_acknowledgment: true
  sla_hours: 24
```

### Acknowledgment SLAs

| Priority | SLA | Escalation |
|----------|-----|------------|
| Critical | 1 hour | Immediate to Senior Manager |
| High | 4 hours | After 4h to Senior Manager |
| Medium | 24 hours | After 24h to Nudger |
| Low | 48 hours | After 48h to Nudger |

---

## Summary: Handover Coverage

| Agent | Outbound Handovers | Inbound Handovers | Status |
|-------|-------------------|-------------------|--------|
| AE Agent | 7 defined | 4 defined | ✓ Complete |
| SA Agent | 6 defined | 4 defined | ✓ Complete |
| CA Agent | 5 defined | 3 defined | ✓ Complete |
| CI Agent | 4 defined | 3 defined | ✓ Complete |
| VE Agent | 5 defined | 3 defined | ✓ Complete |
| Senior Manager | N/A (receives) | 7 defined | ✓ Complete |
| RFP Agent | 6 defined | 3 defined | ✓ Complete |
| POC Agent | 6 defined | 4 defined | ✓ Complete |
| InfoSec Agent | 4 defined | 2 defined | ✓ Complete |
| Delivery Agent | 3 defined | 3 defined | ✓ Complete |
| PS Agent | 4 defined | 2 defined | ✓ Complete |
| Partner Agent | 4 defined | 2 defined | ✓ Complete |
| PM Agent | 3 defined | 3 defined | ✓ Complete |
| Specialist Agent | 3 defined | 1 defined | ✓ Complete |
| Meeting Notes | 4 defined | N/A | ✓ Complete |
| Task Shepherd | 2 defined | 2 defined | ✓ Complete |
| Decision Registrar | 1 defined | 2 defined | ✓ Complete |
| Nudger | 3 defined | 2 defined | ✓ Complete |
| Risk Radar | 2 defined | 3 defined | ✓ Complete |
| Reporter | 1 defined | N/A | ✓ Complete |
| Playbook Curator | 1 defined | 1 defined | ✓ Complete |
| InfoHub Curator | 4 defined | N/A | ✓ Complete |
| Knowledge Vault Curator | 4 defined | 3 defined | ✓ Complete |
| Orchestration | 1 defined | 1 defined | ✓ Complete |
| Tech Signal Scanner | 1 defined | N/A | ✓ Complete |
| Tech Signal Analyzer | 3 defined | 1 defined | ✓ Complete |
| MNA Agent | 4 defined | 2 defined | ✓ Complete |
| ACI Agent | 4 defined | 2 defined | ✓ Complete |
| II Agent | 5 defined | 3 defined | ✓ Complete |

---

**Document Owner:** EA Agentic Lab Architecture Team
**Review Cadence:** Monthly
**Last Updated:** 2026-02-10
