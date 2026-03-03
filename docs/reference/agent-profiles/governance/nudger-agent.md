---
title: "Nudger Agent"
description: "Digital twin for extract decisions, process meeting notes, nudger"
category: "reference"
keywords: ["nudger_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Nudger Agent

The Nudger Agent is the digital twin of the Nudger role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and nudger. The Nudger Agent tracks action items and ensures they reach completion by sending timely reminders, detecting stalled or orphaned work, and escalating when needed. It bridges the gap between "we agreed to do X" and "X actually got done," applying persistent but respectful pressure that respects owners' time while maintaining accountability.

Its operating principle: follow-through discipline without micromanagement.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `nudger-agent` |
| **Role** | Nudger (Entropy Reduction) |
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


### Nudger

Create reminder for upcoming due date. Then create notice for overdue action, then check in on stalled action, and finally generate daily summary of nudges sent.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `generate_reminder` | Create reminder for upcoming due date |
| 2 | `generate_overdue_notice` | Create notice for overdue action |
| 3 | `status_check` | Check in on stalled action |
| 4 | `daily_nudge_summary` | Generate daily summary of nudges sent |


## Scope Boundaries

The agent does not complete actions on behalf of owners (handoff to Leadership), extend due dates autonomously (handoff to Leadership), spam with excessive reminders (handoff to Leadership), make judgments on action quality (handoff to Leadership), close actions without owner confirmation (handoff to Leadership), or override escalation decisions (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Meeting Notes Agent | New actions to track |
| Task Shepherd Agent | Validated actions |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `nudger-escalation-framework.yaml` | Triggers, Path, Message Template | Nudger escalation framework |
| `nudger-nudge-rules.yaml` | Timing, Frequency, Content | Nudger nudge rules |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Notifications | `{account}-notifications.md` | notifications |
| Reports | `{account}-reports.md` | reports |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/nudger-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/nudger_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/nudger_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
