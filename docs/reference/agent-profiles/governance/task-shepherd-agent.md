---
title: "Task Shepherd Agent"
description: "Digital twin for extract decisions, process meeting notes, task shepherd"
category: "reference"
keywords: ["task_shepherd_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Task Shepherd Agent

The Task Shepherd Agent is the digital twin of the Task Shepherd role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and task shepherd. The Task Shepherd Agent validates action items before they enter the governance system. It checks that each action has a specific owner (a real person, not a team or "TBD"), a concrete due date, and clear completion criteria (`done_means`). Actions that fail validation are rejected with constructive feedback. This gate prevents vague commitments from cluttering the action tracker and ensures downstream agents (Nudger, Signal Matcher) have actionable items to work with.

Its operating principle: quality over speed.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `task-shepherd-agent` |
| **Role** | Task Shepherd (Entropy Reduction) |
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


### Task Shepherd

Ensure action meets quality standards. Then audit all actions for hygiene, then identify and merge duplicate actions, and finally infer priority from context.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `validate_action` | Ensure action meets quality standards |
| 2 | `weekly_action_audit` | Audit all actions for hygiene |
| 3 | `merge_duplicate_actions` | Identify and merge duplicate actions |
| 4 | `priority_inference` | Infer priority from context |


## Scope Boundaries

The agent does not extract actions from meetings (Meeting Notes' domain) (handoff to Leadership), send reminders (Nudger's domain) (handoff to Leadership), complete actions on behalf of owners (handoff to Leadership), modify action content (handoff to Leadership), extend due dates autonomously (handoff to Leadership), or prioritize actions (Reporter's domain) (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Meeting Notes Agent | Raw actions for validation |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `task-shepherd-validation-rules.yaml` | Required Fields, Quality Checks, Rejection Criteria | Task shepherd validation rules |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Reports | `{account}-reports.md` | reports |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/task-shepherd-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/task_shepherd_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/task_shepherd_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
