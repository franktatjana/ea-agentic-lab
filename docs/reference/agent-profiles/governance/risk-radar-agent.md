---
title: "Risk Radar Agent"
description: "Digital twin for extract decisions, process meeting notes, risk radar"
category: "reference"
keywords: ["risk_radar_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Risk Radar Agent

The Risk Radar Agent is the digital twin of the Risk Radar role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and risk radar. The Risk Radar Agent classifies, tracks, and escalates risks across engagements. It does not extract risks from source material (that is the Meeting Notes Agent's job), but once a risk is surfaced, it owns the full lifecycle: classification by severity and likelihood, owner assignment, mitigation tracking, pattern detection across accounts, and escalation when thresholds are breached.

Its operating principle: early warning over post-mortem.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `risk-radar-agent` |
| **Role** | Risk Radar (Entropy Reduction) |
| **Mode** | Human-paired |
| **Runbooks** | 3 |
| **Prompts** | 10 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 3 |


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


### Risk Radar

Scan sources for risk signals and update risk register. Then classify and enrich newly detected risk, then prepare weekly risk review summary, and finally generate escalation alert for critical risk.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `scan_for_risks` | Scan sources for risk signals and update risk register |
| 2 | `classify_risk` | Classify and enrich newly detected risk |
| 3 | `weekly_risk_review` | Prepare weekly risk review summary |
| 4 | `risk_escalation` | Generate escalation alert for critical risk |


## Scope Boundaries

The agent does not extract risks from meetings (Meeting Notes' domain) (handoff to Leadership), create mitigation plans (owner responsibility) (handoff to Leadership), make risk acceptance decisions (handoff to Leadership), assess technical feasibility (SA Agent's domain) (handoff to Leadership), evaluate commercial risk (AE Agent's domain) (handoff to Leadership), or invent risks not raised (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Meeting Notes Agent | Risks mentioned in meetings |
| Support Agent | Support-identified risks |
| Delivery Agent | Delivery risks |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `classification-examples.yaml` | Risk Classification, Pattern Detection | Classification examples |
| `error-handling.yaml` | Insufficient Evidence, Conflicting Evidence, Ambiguous Severity | Error handling |
| `output-schemas.yaml` | Risk Classification, Risk Register Summary | Output schemas |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Alerts | `{account}-alerts.md` | alerts |
| Reports | `{account}-reports.md` | reports |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/risk-radar-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/risk_radar_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/risk_radar_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
