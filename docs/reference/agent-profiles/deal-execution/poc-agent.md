---
title: "POC Agent"
description: "Sub-agent of SA for POV qualification, execution, and conversion"
category: "reference"
keywords: ["poc_agent", "poc", "agent", "profile", "digital_twin", "sub-agent"]
last_updated: "2026-03-04"
---


# POC Agent

The POC Agent is the digital twin of the POC role. It operates as a single agent with 7 runbooks covering pov qualification, pov kickoff, pov execution, pov conclusion, pov conversion, pov metrics, and poc success plan. The PoC agent owns the end-to-end lifecycle of proof-of-concept evaluations, from qualification through decision. It treats every POC as a buying process, applying structured criteria to ensure only winnable evaluations consume resources and that each evaluation drives to a clear customer decision.

Its operating principle: poc is a buying process, not a science experiment.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `poc-agent` |
| **Parent Agent** | `sa-agent` (Solution Architect) |
| **Role** | POC (Deal Execution) |
| **Mode** | Human-paired |
| **Runbooks** | 7 |
| **Prompts** | 37 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 4 |
| **Toolbox** | `poc-intelligence` |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Pov Qualification

Recommend appropriate POV type based on opportunity. Then qualify opportunity for POV engagement, then design measurable success criteria with customer, and finally identify and address POV blockers.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `pov_type_recommendation` | Recommend appropriate POV type based on opportunity |
| 2 | `pov_qualification_assessment` | Qualify opportunity for POV engagement |
| 3 | `success_criteria_design` | Design measurable success criteria with customer |
| 4 | `blocker_analysis` | Identify and address POV blockers |


### Pov Kickoff

Prepare for internal team alignment before customer kickoff. Then prepare for customer POV kickoff meeting, and finally create mutual action plan for POV execution.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `internal_kickoff_prep` | Prepare for internal team alignment before customer kickoff |
| 2 | `external_kickoff_prep` | Prepare for customer POV kickoff meeting |
| 3 | `mutual_action_plan` | Create mutual action plan for POV execution |


### Pov Execution

Generate daily POV status update. Then conduct weekly POV retrospective, then conduct POV midpoint review, then assess and respond to scope change request, and finally address identified POV risk.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `daily_status_update` | Generate daily POV status update |
| 2 | `weekly_retrospective` | Conduct weekly POV retrospective |
| 3 | `midpoint_checkpoint` | Conduct POV midpoint review |
| 4 | `scope_change_assessment` | Assess and respond to scope change request |
| 5 | `risk_mitigation` | Address identified POV risk |


### Pov Conclusion

Document POV results and outcomes. Then prepare for and capture customer feedback, then provide clear recommendation based on POV, and finally create POV summary for stakeholder presentation.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `results_documentation` | Document POV results and outcomes |
| 2 | `customer_feedback_session` | Prepare for and capture customer feedback |
| 3 | `go_no_go_recommendation` | Provide clear recommendation based on POV |
| 4 | `pov_summary_presentation` | Create POV summary for stakeholder presentation |


### Pov Conversion

Assess readiness to convert POV to deal. Then prepare POV handoff to AE for commercial, and finally analyze POV loss for learnings.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `conversion_readiness` | Assess readiness to convert POV to deal |
| 2 | `ae_handoff_brief` | Prepare POV handoff to AE for commercial |
| 3 | `loss_analysis` | Analyze POV loss for learnings |


### Pov Metrics

Assess overall POV health, then summary status of all active POVs.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `pov_health_assessment` | Assess overall POV health |
| 2 | `portfolio_status` | Summary status of all active POVs |


### Poc Success Plan

Initialize POC Success Plan for new evaluation. Then document and verify customer commitments, then collaboratively design SMART success criteria, then verify all commitments before POC start, then align internal team before customer kickoff, then launch POC with customer stakeholders, then document daily POC progress, then mid-POC checkpoint with customer, then process scope change request, then escalate critical POC risk or blocker, then compile final POC results, then create presentation for decision makers, then facilitate decision from customer, then process successful POC outcome, then process unsuccessful POC outcome, and finally transfer POC success to Customer Success Plan.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `create_success_plan` | Initialize POC Success Plan for new evaluation |
| 2 | `capture_customer_commitments` | Document and verify customer commitments |
| 3 | `design_success_criteria` | Collaboratively design SMART success criteria |
| 4 | `validate_commitments` | Verify all commitments before POC start |
| 5 | `conduct_internal_kickoff` | Align internal team before customer kickoff |
| 6 | `conduct_customer_kickoff` | Launch POC with customer stakeholders |
| 7 | `track_daily_status` | Document daily POC progress |
| 8 | `conduct_midpoint_review` | Mid-POC checkpoint with customer |
| 9 | `manage_scope_change` | Process scope change request |
| 10 | `escalate_poc_risk` | Escalate critical POC risk or blocker |
| 11 | `document_poc_results` | Compile final POC results |
| 12 | `prepare_decision_presentation` | Create presentation for decision makers |
| 13 | `drive_poc_decision` | Facilitate decision from customer |
| 14 | `handle_poc_win` | Process successful POC outcome |
| 15 | `handle_poc_loss` | Process unsuccessful POC outcome |
| 16 | `transition_to_csp` | Transfer POC success to Customer Success Plan |


## Scope Boundaries

The agent does not execute technical implementation (SA/Specialist domain) (handoff to SA Agent), negotiate commercial terms (AE Agent's domain) (handoff to AE Agent), commit to product features (PM Agent's domain) (handoff to Leadership), extend POC timelines without approval (handoff to Leadership), guarantee outcomes not validated (handoff to Leadership), or skip qualification for 'strategic' requests (handoff to Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Technical execution, architecture decisions needed | SA Agent | Requirement details for technical execution, architecture decisions |
| Commercial discussions, conversion negotiations needed | AE Agent | Requirement details for commercial discussions, conversion negotiations |
| Deep technical implementation needed | Specialist Agent | Requirement details for deep technical implementation |
| POC status, conversion readiness | AE Agent | Analysis results and recommendations |
| Success criteria, technical requirements | SA Agent | Analysis results and recommendations |
| Strategic POC risks | Senior Manager Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `qualification-criteria.yaml` | Go Criteria, No Go Criteria, Conditional Go | Qualification criteria |
| `signal-detection.yaml` | Poc Health Signals, Qualification Signals, Conversion Signals | Signal detection |
| `success-criteria-design.yaml` | Principles, Anti Patterns | Success criteria design |
| `target-metrics.yaml` | Conversion Rate, Avg Duration, Success Criteria Achievement | Target metrics |


## Autonomy

The POC Agent operates under the SA orchestrator with the following autonomy contract.

**Triggers:**

- SA orchestrator dispatches POC lifecycle requests
- CRM webhook fires when POC is requested on an opportunity
- RFP Agent identifies need for proof-of-concept validation

**Outputs:**

- Returns POC status and results to SA orchestrator
- Triggers CSP initiation on SA when POC succeeds (ARR >= $100K)
- Triggers Specialist Agent when technical risk is HIGH
- Alerts SA for no-go decisions and high-risk POCs

**Dependencies:** Specialist Agent (domain expertise), InfoSec Agent (compliance)

**Toolbox:** Exposes `get-poc-status` and `get-poc-results` to peer agents via the `poc-intelligence` toolbox.


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/poc/poc-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails, autonomy |
| `domain/agents/poc/agents/poc_agent.yaml` | Agent configuration |
| `domain/agents/poc/personalities/poc_personality.yaml` | Behavioral specification |
| `domain/agents/poc/prompts/tasks.yaml` | 37 CAF prompts across 7 domains |
