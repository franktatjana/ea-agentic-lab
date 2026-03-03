---
title: "Customer Architect Agent"
description: "Digital twin for support intelligence triage, adoption, customer architecture"
category: "reference"
keywords: ["ca_agent", "customer-architects", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Customer Architect Agent

The Customer Architect Agent is the digital twin of the Customer Architect role. It operates as a single agent with 9 runbooks covering support intelligence triage, adoption, customer architecture, value realization, customer health, customer success plan, customer journey, voice of customer, and support intelligence. The CA Agent monitors customer architecture changes, detects integration risks, and ensures consistency between customer and vendor designs. It also serves as the bridge between support operations and account strategy, triaging support signals into actionable account-level insights through its SK_CA_001 skill. This dual role combines architecture awareness with customer health ownership.

Its operating principle: early mismatch detection prevents late rework.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ca-agent` |
| **Role** | Customer Architect (Architecture) |
| **Mode** | Human-paired |
| **Runbooks** | 9 |
| **Prompts** | 40 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 0 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Support Intelligence Triage

Receive support signals, enrich with account context, classify root cause, and route appropriate actions to account team

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `support_intelligence_triage_analyze` | Analyze input |
| 2 | `support_intelligence_triage_synthesize` | Synthesize findings |
| 3 | `support_intelligence_triage_output` | Generate output |


### Adoption

Assess customer adoption of {vendor} solution. Then identify what's blocking customer adoption, and finally identify new use case opportunities.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `adoption_health` | Assess customer adoption of {vendor} solution |
| 2 | `adoption_blockers` | Identify what's blocking customer adoption |
| 3 | `use_case_expansion` | Identify new use case opportunities |


### Customer Architecture

Discover and document customer architecture. Then assess impact of customer architecture change, and finally assess health of customer-{vendor} integrations.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `architecture_discovery` | Discover and document customer architecture |
| 2 | `change_impact` | Assess impact of customer architecture change |
| 3 | `integration_health` | Assess health of customer-{vendor} integrations |


### Value Realization

Assess value delivered to customer. Then prepare value content for QBR, and finally develop customer success story content.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `value_delivered` | Assess value delivered to customer |
| 2 | `qbr_preparation` | Prepare value content for QBR |
| 3 | `success_story` | Develop customer success story content |


### Customer Health

Comprehensive customer health review. Then identify early warning signs of trouble, and finally assess readiness for upcoming renewal.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `health_assessment` | Comprehensive customer health review |
| 2 | `early_warning` | Identify early warning signs of trouble |
| 3 | `renewal_readiness` | Assess readiness for upcoming renewal |


### Customer Success Plan

Receive and validate CSP handoff at deal close. Then monthly update of CSP value metrics, then track and update adoption milestones, then comprehensive quarterly CSP review and update, then extract QBR content from CSP, then review and update CSP risk section, and finally plan next adoption phase in CSP.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `accept_csp_handoff` | Receive and validate CSP handoff at deal close |
| 2 | `update_csp_value` | Monthly update of CSP value metrics |
| 3 | `update_csp_milestones` | Track and update adoption milestones |
| 4 | `quarterly_csp_refresh` | Comprehensive quarterly CSP review and update |
| 5 | `csp_qbr_prep` | Extract QBR content from CSP |
| 6 | `csp_risk_update` | Review and update CSP risk section |
| 7 | `csp_expansion_planning` | Plan next adoption phase in CSP |


### Customer Journey

Receive and validate journey map at deal close. Then document customer experience during onboarding, then track customer experience during adoption phase, then assess overall customer journey health, and finally discover and document friction in customer journey.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `accept_journey_handoff` | Receive and validate journey map at deal close |
| 2 | `map_onboarding_journey` | Document customer experience during onboarding |
| 3 | `map_adoption_journey` | Track customer experience during adoption phase |
| 4 | `analyze_journey_health` | Assess overall customer journey health |
| 5 | `identify_journey_friction` | Discover and document friction in customer journey |


### Voice Of Customer

Set up VoC tracking for new customer. Then administer NPS survey and process results, then capture satisfaction after key touchpoints, then document and categorize qualitative feedback, then extract VoC insights from support interactions, then identify VoC signals from customer meetings, then review VoC metrics and identify trends, then follow up on VoC feedback, then compile VoC insights for quarterly review, and finally compile product-related VoC for PM team.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `initiate_voc_tracking` | Set up VoC tracking for new customer |
| 2 | `collect_nps_feedback` | Administer NPS survey and process results |
| 3 | `collect_csat_feedback` | Capture satisfaction after key touchpoints |
| 4 | `capture_qualitative_feedback` | Document and categorize qualitative feedback |
| 5 | `analyze_support_voc` | Extract VoC insights from support interactions |
| 6 | `extract_meeting_voc` | Identify VoC signals from customer meetings |
| 7 | `voc_trend_analysis` | Review VoC metrics and identify trends |
| 8 | `closed_loop_action` | Follow up on VoC feedback |
| 9 | `voc_qbr_content` | Compile VoC insights for quarterly review |
| 10 | `product_feedback_aggregation` | Compile product-related VoC for PM team |


### Support Intelligence

Process incoming support signal and classify for account action. Then analyze quarterly support patterns for QBR preparation, and finally assess how support health affects overall account health.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `triage_support_signal` | Process incoming support signal and classify for account action |
| 2 | `quarterly_support_review` | Analyze quarterly support patterns for QBR preparation |
| 3 | `support_health_assessment` | Assess how support health affects overall account health |


## Scope Boundaries

The agent does not design customer architectures (handoff to SA/PM), make {vendor} architecture decisions (SA Agent's domain) (handoff to SA/PM), or assess {vendor}-side technical risks (SA Agent's domain) (handoff to SA/PM).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

No dedicated knowledge references.


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Arch Design Updates | `{account}-arch-design-updates.md` | Arch design updates |
| Integration Risk Alerts | `{account}-integration-risk-alerts.md` | Integration risk alerts |
| Design Mismatch Reports | `{account}-design-mismatch-reports.md` | Design mismatch reports |
| Support Intelligence Actions | `{account}-support-intelligence-actions.md` | Support intelligence actions |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/customer_architects/ca-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/customer_architects/agents/ca_agent.yaml` | Agent configuration |
| `domain/agents/customer_architects/personalities/ca_personality.yaml` | Behavioral specification |
| `domain/agents/customer_architects/prompts/tasks.yaml` | 40 CAF prompts across 9 domains |
