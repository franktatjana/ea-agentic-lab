---
title: "Decision Registrar Agent"
description: "Digital twin for extract decisions, process meeting notes, decision registrar"
category: "reference"
keywords: ["decision_registrar_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Decision Registrar Agent

The Decision Registrar Agent is the digital twin of the Decision Registrar role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and decision registrar. The Decision Registrar Agent logs every decision with its full context, owner, rationale, and lifecycle state. It does not make or evaluate decisions, only record them with archival precision. Once a decision is registered, the original record is never modified: updates create linked new records, and reversals are explicitly tracked.

Its operating principle: immutability is sacred.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `decision-registrar-agent` |
| **Role** | Decision Registrar (Entropy Reduction) |
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


### Decision Registrar

Add decision to decision log. Then update status of existing decision, then summarize decisions from past week, and finally find decisions related to a topic.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `register_decision` | Add decision to decision log |
| 2 | `decision_status_update` | Update status of existing decision |
| 3 | `weekly_decision_digest` | Summarize decisions from past week |
| 4 | `find_related_decisions` | Find decisions related to a topic |


## Scope Boundaries

The agent does not make decisions (handoff to Leadership), evaluate decision quality (handoff to Leadership), recommend decision changes (handoff to Leadership), extract decisions from meetings (Meeting Notes' domain) (handoff to Leadership), report on decision metrics (Reporter's domain) (handoff to Leadership), or modify historical records (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Meeting Notes Agent | Decisions for registration |
| Senior Manager Agent | Strategic decisions |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `decision-registrar-audit-trail.yaml` | Immutability, Versioning, Timestamps | Decision registrar audit trail |
| `decision-registrar-registration-rules.yaml` | Required Fields, Optional Fields, Classification | Decision registrar registration rules |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Reports | `{account}-reports.md` | reports |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/decision-registrar-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/decision_registrar_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/decision_registrar_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
