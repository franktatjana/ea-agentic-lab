---
title: "RFP Agent"
description: "Digital twin for bid decisions, response strategy, orchestration"
category: "reference"
keywords: ["rfp_agent", "rfp", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# RFP Agent

The RFP Agent is the digital twin of the RFP role. It operates as a single agent with 5 runbooks covering bid decisions, response strategy, orchestration, quality, and post submission. The RFP agent orchestrates the full lifecycle of RFP responses, from initial analysis and bid/no-bid decisions through cross-functional response coordination to submission. It applies a weighted scoring framework to ensure the team pursues winnable deals, develops differentiated win themes, and delivers compliant, compelling responses on deadline. The agent prioritizes winning the right deals over winning every deal.

Its operating principle: win the right deals, not every deal.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `rfp-agent` |
| **Role** | RFP (Deal Execution) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 14 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Bid Decisions

Analyze RFP requirements and scoring criteria. Then formal bid/no-bid recommendation, and finally map RFP requirements to our capabilities.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `analyze_rfp` | Analyze RFP requirements and scoring criteria |
| 2 | `bid_no_bid_assessment` | Formal bid/no-bid recommendation |
| 3 | `requirement_compliance_matrix` | Map RFP requirements to our capabilities |


### Response Strategy

Create differentiated positioning for RFP response. Then create compelling executive summary, and finally draft response to specific RFP section.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `develop_win_themes` | Create differentiated positioning for RFP response |
| 2 | `draft_executive_summary` | Create compelling executive summary |
| 3 | `draft_response_section` | Draft response to specific RFP section |


### Orchestration

Plan RFP response with assignments and timeline. Then prepare RFP kickoff meeting agenda, and finally track RFP response progress and risks.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `create_response_plan` | Plan RFP response with assignments and timeline |
| 2 | `kickoff_meeting_prep` | Prepare RFP kickoff meeting agenda |
| 3 | `progress_tracking` | Track RFP response progress and risks |


### Quality

Review response for requirement compliance. Then review response for quality and impact, and finally final checklist before RFP submission.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `compliance_review` | Review response for requirement compliance |
| 2 | `quality_review` | Review response for quality and impact |
| 3 | `pre_submission_checklist` | Final checklist before RFP submission |


### Post Submission

Document successful RFP submission, then analyze RFP outcome for learnings.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `submission_confirmation` | Document successful RFP submission |
| 2 | `win_loss_analysis` | Analyze RFP outcome for learnings |


## Scope Boundaries

The agent does not make final bid decisions (escalate to leadership) (handoff to Leadership), write technical architecture responses (SA Agent's domain) (handoff to SA Agent), provide security compliance details (InfoSec Agent's domain) (handoff to Infosec Agent), set pricing or discounts (AE Agent's domain) (handoff to AE Agent), commit to product roadmap items (PM Agent's domain) (handoff to PM Agent), or fabricate capabilities we don't have (handoff to Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Technical architecture responses needed | SA Agent | Requirement details for technical architecture responses |
| Security and compliance sections needed | Infosec Agent | Requirement details for security and compliance sections |
| Commercial terms and pricing needed | AE Agent | Requirement details for commercial terms and pricing |
| Roadmap commitments needed | PM Agent | Requirement details for roadmap commitments |
| RFP context, deadlines, evaluation criteria | All Agents | Analysis results and recommendations |
| Competitive positioning insights | AE Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `bid-assessment-framework.yaml` | Criteria, Thresholds | Bid assessment framework |
| `signal-detection.yaml` | Bid Quality Signals, Deadline Signals, Competitive Signals | Signal detection |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/rfp/rfp-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/rfp/agents/rfp_agent.yaml` | Agent configuration |
| `domain/agents/rfp/personalities/rfp_personality.yaml` | Behavioral specification |
| `domain/agents/rfp/prompts/tasks.yaml` | 14 CAF prompts across 5 domains |
