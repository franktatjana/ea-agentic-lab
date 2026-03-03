---
title: "Professional Services Agent"
description: "Digital twin for presales scoping, project execution, scope management"
category: "reference"
keywords: ["ps_agent", "professional-services", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Professional Services Agent

The Professional Services Agent is the digital twin of the Professional Services role. It operates as a single agent with 5 runbooks covering presales scoping, project execution, scope management, handoff, and lessons learned. The PS agent ensures that what gets sold is deliverable and what gets delivered matches what was sold. It covers both pre-sales scoping (validating SOWs, estimating effort, flagging delivery risks) and post-sales execution (tracking milestones, managing scope changes, coordinating handoffs). By engaging early in the sales process, it prevents the costly pattern of over-promising and under-delivering.

Its operating principle: what we sell must be deliverable.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ps-agent` |
| **Role** | Professional Services (Delivery) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 12 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 3 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Presales Scoping

Assess and scope PS engagement during pre-sales. Then review SOW against delivery reality, and finally evaluate delivery risk for deal review.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `scope_engagement` | Assess and scope PS engagement during pre-sales |
| 2 | `validate_sow` | Review SOW against delivery reality |
| 3 | `assess_delivery_risk` | Evaluate delivery risk for deal review |


### Project Execution

Prepare for project kickoff meeting. Then generate weekly project status update, and finally track detailed project progress against plan.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `kickoff_prep` | Prepare for project kickoff meeting |
| 2 | `weekly_status_update` | Generate weekly project status update |
| 3 | `track_progress` | Track detailed project progress against plan |


### Scope Management

Handle scope change request, then identify and escalate scope creep.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `process_change_request` | Handle scope change request |
| 2 | `flag_scope_creep` | Identify and escalate scope creep |


### Handoff

Document handoff from sales to delivery, then document handoff from delivery to support/CS.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `sales_to_delivery_handoff` | Document handoff from sales to delivery |
| 2 | `delivery_to_operations_handoff` | Document handoff from delivery to support/CS |


### Lessons Learned

Document project lessons learned, then facilitate project retrospective.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `capture_lessons_learned` | Document project lessons learned |
| 2 | `project_retrospective` | Facilitate project retrospective |


## Scope Boundaries

The agent does not make commercial commitments (AE Agent's domain) (handoff to AE Agent), design technical architecture (SA Agent's domain) (handoff to SA Agent), commit to product features (PM Agent's domain) (handoff to Leadership), execute technical implementation directly (handoff to Leadership), approve out-of-scope work without change order (handoff to Leadership), or underestimate effort to win deals (handoff to Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Technical architecture decisions needed | SA Agent | Requirement details for technical architecture decisions |
| Commercial negotiations needed | AE Agent | Requirement details for commercial negotiations |
| Execution management needed | Delivery Agent | Requirement details for execution management |
| Feasibility assessment, effort estimates | AE Agent | Analysis results and recommendations |
| Implementation constraints | SA Agent | Analysis results and recommendations |
| Handoff documentation, delivery completion context | Ca Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `change-request-process.yaml` | Detection, Classification, Handling | Change request process |
| `scoping-framework.yaml` | Effort Estimation, Scope Boundaries | Scoping framework |
| `signal-detection.yaml` | Scope Risk Signals, Delivery Health Signals, Handoff Signals | Signal detection |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/professional_services/ps-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/professional_services/agents/ps_agent.yaml` | Agent configuration |
| `domain/agents/professional_services/personalities/ps_personality.yaml` | Behavioral specification |
| `domain/agents/professional_services/prompts/tasks.yaml` | 12 CAF prompts across 5 domains |
