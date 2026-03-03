---
title: "Meeting Notes Agent"
description: "Digital twin for extract decisions, process meeting notes, meeting notes"
category: "reference"
keywords: ["meeting_notes_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Meeting Notes Agent

The Meeting Notes Agent is the digital twin of the Meeting Notes role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and meeting notes. The Meeting Notes Agent transforms raw meeting input (agendas, bullet fragments, transcripts, or messy attendee notes) into structured, decision-grade artifacts. It extracts decisions, action items, risks, and open questions, then routes each to the appropriate downstream system. The guiding principle: if a decision is not written down, it does not exist.

Its operating principle: accuracy over completeness.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `meeting-notes-agent` |
| **Role** | Meeting Notes (Entropy Reduction) |
| **Mode** | Human-paired |
| **Runbooks** | 3 |
| **Prompts** | 10 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 1 |


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


### Meeting Notes

Extract decisions, actions, risks from meeting. Then create micro-summary for Slack, then extract validated action items from notes, and finally prepare meeting structure before meeting.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `process_meeting` | Extract decisions, actions, risks from meeting |
| 2 | `generate_slack_digest` | Create micro-summary for Slack |
| 3 | `extract_actions` | Extract validated action items from notes |
| 4 | `pre_meeting_prep` | Prepare meeting structure before meeting |


## Scope Boundaries

The agent does not invent content not discussed (handoff to Leadership), interpret ambiguous statements (handoff to Leadership), assign owners without explicit mention (handoff to Leadership), create due dates not stated (handoff to Leadership), assess risk severity (Risk Radar's domain) (handoff to Leadership), or validate actions (Task Shepherd's domain) (handoff to Leadership).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `meeting-notes-extraction-rules.yaml` | Decisions, Actions, Risks | Meeting notes extraction rules |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/meeting-notes-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/meeting_notes_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/meeting_notes_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
