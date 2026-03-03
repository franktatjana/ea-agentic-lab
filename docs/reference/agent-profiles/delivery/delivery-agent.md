---
title: "Delivery Agent"
description: "Digital twin for project health, blocker management, handoff"
category: "reference"
keywords: ["delivery_agent", "delivery", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Delivery Agent

The Delivery Agent is the digital twin of the Delivery role. It operates as a single agent with 4 runbooks covering project health, blocker management, handoff, and risk issue. The Delivery Agent tracks delivery progress from Jira, status reports, and customer escalations, then flags risks and generates health summaries for account teams. It bridges the gap between delivery execution and account awareness, ensuring that project blockers, milestone slips, and go-live risks are visible to the broader team before they become surprises.

Its operating principle: accurate delivery status prevents surprises.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `delivery-agent` |
| **Role** | Delivery (Delivery) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 12 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 0 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Project Health

Generate concise project status for account team. Then assess readiness for production go-live, and finally generate weekly delivery report for stakeholders.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `status_summary` | Generate concise project status for account team |
| 2 | `go_live_readiness` | Assess readiness for production go-live |
| 3 | `weekly_report` | Generate weekly delivery report for stakeholders |


### Blocker Management

Analyze blocker impact and resolution path. Then prepare escalation brief for leadership, and finally track and report on project dependencies.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `blocker_analysis` | Analyze blocker impact and resolution path |
| 2 | `escalation_brief` | Prepare escalation brief for leadership |
| 3 | `dependency_tracker` | Track and report on project dependencies |


### Handoff

Prepare handoff documentation for support team. Then brief account team on delivery outcomes, and finally document transition between project phases.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `support_handoff` | Prepare handoff documentation for support team |
| 2 | `account_team_brief` | Brief account team on delivery outcomes |
| 3 | `phase_transition` | Document transition between project phases |


### Risk Issue

Identify risks from project status and signals. Then triage and prioritize open issues, and finally assess customer impact of delivery issue.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `risk_identification` | Identify risks from project status and signals |
| 2 | `issue_triage` | Triage and prioritize open issues |
| 3 | `customer_impact` | Assess customer impact of delivery issue |


## Scope Boundaries

The agent does not manage delivery execution (handoff to Delivery Manager), assign delivery tasks (handoff to Delivery Manager), or make scope decisions (handoff to Delivery Manager).


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
| Status Note | `{account}-status-note.md` | Status note |
| Delivery Risk Alerts | `{account}-delivery-risk-alerts.md` | Delivery risk alerts |
| Health Summaries | `{account}-health-summaries.md` | Health summaries |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/delivery/delivery-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/delivery/agents/delivery_agent.yaml` | Agent configuration |
| `domain/agents/delivery/personalities/delivery_personality.yaml` | Behavioral specification |
| `domain/agents/delivery/prompts/tasks.yaml` | 12 CAF prompts across 4 domains |
