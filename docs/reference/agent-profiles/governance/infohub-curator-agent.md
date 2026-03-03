---
title: "InfoHub Curator Agent"
description: "Digital twin for extract decisions, process meeting notes"
category: "reference"
keywords: ["infohub_curator_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# InfoHub Curator Agent

The InfoHub Curator Agent is the digital twin of the InfoHub Curator role. It operates as a single agent with 2 runbooks covering extract decisions and process meeting notes. The InfoHub Curator Agent maintains both External and Internal InfoHubs as the single source of truth for engagement artifacts. It detects semantic conflicts, tracks artifact lifecycle states, enforces naming conventions, validates link integrity, and surfaces stale or orphaned content. The curator organizes content but never creates, interprets, or deletes it without approval.

Its operating principle: single source of truth.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `infohub-curator-agent` |
| **Role** | InfoHub Curator (Governance) |
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

The agent does not create primary content (agent responsibility) (handoff to Leadership), make business decisions (handoff to Leadership), interpret content meaning (handoff to Leadership), delete without approval (handoff to Leadership), modify source content (handoff to Leadership), prioritize business value (account team domain) (handoff to Leadership), or govern the Global Knowledge Vault (Knowledge Vault Curator's domain) (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| All Agents | Content to organize |
| Decision Registrar Agent | Decisions for linking |
| Meeting Notes Agent | Meeting artifacts |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `infohub-curator-curation-rules.yaml` | Freshness, Consistency, Linking | Infohub curator curation rules |
| `infohub-curator-infohub-structure.yaml` | Realms, Naming Conventions | Infohub curator infohub structure |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/infohub-curator-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/infohub_curator_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/infohub_curator_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 6 CAF prompts across 2 domains |
