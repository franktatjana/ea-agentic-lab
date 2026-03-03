---
title: "Playbook Curator Agent"
description: "Digital twin for extract decisions, process meeting notes, playbook curator"
category: "reference"
keywords: ["playbook_curator_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Playbook Curator Agent

The Playbook Curator Agent is the digital twin of the Playbook Curator role. It operates as a single agent with 3 runbooks covering extract decisions, process meeting notes, and playbook curator. The Playbook Curator Agent governs the playbook system itself, treating playbooks as governance code that requires the same rigor as software. It validates new and modified playbooks against governance criteria, tracks usage patterns and effectiveness, detects violations, and recommends retirement or updates. The operating philosophy: playbooks encode institutional knowledge, and unused playbooks are technical debt.

Its operating principle: playbooks encode institutional knowledge.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `playbook-curator-agent` |
| **Role** | Playbook Curator (Governance) |
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


### Playbook Curator

Validate new or modified playbook. Then generate weekly playbook usage report, then scan for playbook governance violations, and finally identify playbooks for retirement.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `validate_playbook` | Validate new or modified playbook |
| 2 | `playbook_usage_report` | Generate weekly playbook usage report |
| 3 | `detect_violations` | Scan for playbook governance violations |
| 4 | `recommend_retirement` | Identify playbooks for retirement |


## Scope Boundaries

The agent does not execute playbooks (agent responsibility) (handoff to Leadership), mandate playbook adoption (handoff to Leadership), modify playbooks without approval (handoff to Leadership), create playbooks from scratch (requires SME input) (handoff to Leadership), override domain agent expertise (handoff to Leadership), or enforce compliance (governance role) (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| Reporter Agent | Playbook usage metrics |
| All Agents | Playbook feedback |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `playbook-curator-lifecycle.yaml` | Stages, Review Cycle | Playbook curator lifecycle |
| `playbook-curator-standards.yaml` | Required Sections, Step Format, Quality Criteria | Playbook curator standards |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/playbook-curator-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/playbook_curator_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/playbook_curator_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 10 CAF prompts across 3 domains |
