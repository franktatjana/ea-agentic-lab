---
title: "Signal Matcher Agent"
description: "Digital twin for extract decisions, process meeting notes"
category: "reference"
keywords: ["signal_matcher_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Signal Matcher Agent

The Signal Matcher Agent is the digital twin of the Signal Matcher role. It operates as a single agent with 2 runbooks covering extract decisions and process meeting notes. The Signal Matcher Agent reads signals from natural work artifacts (meeting notes, daily ops, POC updates, decisions) and correlates them to open actions. Instead of asking sellers to remember what to click, it detects completion evidence automatically. Humans validate completions, they do not administrate them. This is the bridge between "work happened" and "the tracker reflects it.".


## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `signal-matcher-agent` |
| **Role** | Signal Matcher (Entropy Reduction) |
| **Mode** | Human-paired |
| **Runbooks** | 2 |
| **Prompts** | 6 |
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


## Scope Boundaries

The agent does not operate outside defined scope (handoff to Leadership).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal-matcher-confidence-scoring.yaml` | Factors, Thresholds | Signal matcher confidence scoring |
| `signal-matcher-signal-sources.yaml` | Lookback, Sources, Match Criteria | Signal matcher signal sources |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Notifications | `{account}-notifications.md` | notifications |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/signal-matcher-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/signal_matcher_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/signal_matcher_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 6 CAF prompts across 2 domains |
