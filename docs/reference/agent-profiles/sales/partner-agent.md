---
title: "Partner Agent"
description: "Digital twin for partner health, coordination, partner risk"
category: "reference"
keywords: ["partner_agent", "partners", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Partner Agent

The Partner Agent is the digital twin of the Partner role. It operates as a single agent with 4 runbooks covering partner health, coordination, partner risk, and reporting. The Partner Agent tracks partner involvement in accounts, flags partner-related risks (misalignment, delays, conflicts), and monitors partner deliverables against commitments. It links partner work to account plans and provides visibility on dependencies that could affect deal execution or delivery timelines. The agent ensures that partner coordination gaps do not become account surprises.

Its operating principle: clear partner dependency visibility prevents delays.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `partner-agent` |
| **Role** | Partner (Sales) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 12 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 0 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Partner Health

Assess health of partner engagement in account. Then track status of partner dependencies, and finally review partner performance over period.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `engagement_health` | Assess health of partner engagement in account |
| 2 | `dependency_status` | Track status of partner dependencies |
| 3 | `partner_performance` | Review partner performance over period |


### Coordination

Prepare for joint planning with partner. Then coordinate handoff to/from partner, and finally prepare for partner communication sync.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `joint_planning` | Prepare for joint planning with partner |
| 2 | `handoff_coordination` | Coordinate handoff to/from partner |
| 3 | `communication_sync` | Prepare for partner communication sync |


### Partner Risk

Identify partner-related risks. Then plan resolution for partner issue, and finally prepare partner escalation.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `risk_identification` | Identify partner-related risks |
| 2 | `issue_resolution` | Plan resolution for partner issue |
| 3 | `escalation_prep` | Prepare partner escalation |


### Reporting

Prepare partner update for account team. Then update partner scorecard metrics, and finally develop joint success story with partner.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `account_team_update` | Prepare partner update for account team |
| 2 | `partner_scorecard` | Update partner scorecard metrics |
| 3 | `joint_success_story` | Develop joint success story with partner |


## Scope Boundaries

The agent does not manage partner relationships directly (handoff to Partner Manager), make partner commitments (handoff to Partner Manager), or assess partner technical capabilities (handoff to Partner Manager).


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
| Alignment Note | `{account}-alignment-note.md` | Alignment note |
| Partner Risk Alerts | `{account}-partner-risk-alerts.md` | Partner risk alerts |
| Dependency Tracking | `{account}-dependency-tracking.md` | Dependency tracking |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/partners/partner-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/partners/agents/partner_agent.yaml` | Agent configuration |
| `domain/agents/partners/personalities/partner_personality.yaml` | Behavioral specification |
| `domain/agents/partners/prompts/tasks.yaml` | 12 CAF prompts across 4 domains |
