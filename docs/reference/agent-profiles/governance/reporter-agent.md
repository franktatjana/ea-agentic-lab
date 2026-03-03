---
title: "Reporter Agent"
description: "Digital twin for extract decisions, process meeting notes, reporter"
category: "reference"
keywords: ["reporter_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Reporter Agent

The Reporter Agent is the digital twin of the Reporter role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and reporter. The Reporter Agent transforms raw governance data (actions, decisions, risks, meetings, health scores) into structured summaries and dashboards. It aggregates deltas, highlights exceptions, and delivers weekly digests that fit in 10 lines so leadership can consume them without digging through trackers. Every claim in a report must link back to a verified data source.

Its operating principle: data speaks, we translate.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `reporter-agent` |
| **Role** | Reporter (Entropy Reduction) |
| **Mode** | Human-paired |
| **Runbooks** | 3 |
| **Prompts** | 10 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Extract Decisions

Extract, validate, and register decisions from any source (meetings, emails, discussions) into the decision log

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `extract_decisions_analyze` | Analyze input |
| 2 | `extract_decisions_synthesize` | Synthesize findings |
| 3 | `extract_decisions_output` | Generate output |


### Process Meeting Notes

Extract decisions, actions, risks, and open questions from meeting notes or transcripts into structured, decision-grade output

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `process_meeting_notes_analyze` | Analyze input |
| 2 | `process_meeting_notes_synthesize` | Synthesize findings |
| 3 | `process_meeting_notes_output` | Generate output |


### Reporter

Generate weekly summary for account team. Then generate executive-level summary, then report on health score trends, and finally generate comprehensive month-end report.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `weekly_digest` | Generate weekly summary for account team |
| 2 | `executive_summary` | Generate executive-level summary |
| 3 | `health_trend_report` | Report on health score trends |
| 4 | `month_end_report` | Generate comprehensive month-end report |


## Scope Boundaries

The agent does not track individual actions (Nudger's domain) (handoff to Leadership), validate actions (Task Shepherd's domain) (handoff to Leadership), extract meeting content (Meeting Notes' domain) (handoff to Leadership), make governance decisions (handoff to Leadership), assign blame or praise (handoff to Leadership), or fabricate statistics (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Nudger Agent | Follow-through metrics |
| Task Shepherd Agent | Action quality metrics |
| Decision Registrar Agent | Decision statistics |
| Risk Radar Agent | Risk metrics |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `reporter-health-scoring.yaml` | Governance Health | Reporter health scoring |
| `reporter-metrics-framework.yaml` | Metrics, Dashboards | Reporter metrics framework |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Distribution | `{account}-distribution.md` | distribution |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/reporter-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/reporter_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/reporter_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
