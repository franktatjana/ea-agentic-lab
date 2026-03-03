---
title: "Knowledge Vault Curator Agent"
description: "Digital twin for extract decisions, process meeting notes"
category: "reference"
keywords: ["knowledge_vault_curator_agent", "governance", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Knowledge Vault Curator Agent

The Knowledge Vault Curator Agent is the digital twin of the Knowledge Vault Curator role. It operates as a single agent with 2 runbooks covering extract decisions and process meeting notes. The Knowledge Vault Curator Agent validates, organizes, and maintains the Global Knowledge Vault (Vault 3), which stores anonymized institutional knowledge extracted from engagements. It enforces anonymization as a non-negotiable requirement, detects duplicates and contradictions, tracks knowledge consumption across playbook executions, and prepares proposals for human review. The curator facilitates but never dictates: humans own the vault and make all approval decisions.

Its operating principle: humans own the vault.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `knowledge-vault-curator-agent` |
| **Role** | Knowledge Vault Curator (Governance) |
| **Mode** | Human-paired |
| **Runbooks** | 2 |
| **Prompts** | 6 |
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


## Scope Boundaries

The agent does not create knowledge content (agents and humans author) (handoff to Leadership), approve or reject proposals (humans decide) (handoff to Leadership), modify item content substance (handoff to Leadership), auto-promote confidence without human review (handoff to Leadership), govern InfoHub artifacts (InfoHub Curator's domain) (handoff to Leadership), execute playbooks or inject knowledge at runtime (handoff to Leadership), or extract knowledge from raw inputs (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| All Agents | Knowledge proposals via .proposals/ |
| Infohub Curator Agent | Engagement learnings when engagements close |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `knowledge-vault-curator-vault-structure.yaml` | Managed Paths, Item Schema | Knowledge vault curator vault structure |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/governance/knowledge-vault-curator-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/governance/agents/knowledge_vault_curator_agent.yaml` | Agent configuration |
| `domain/agents/governance/personalities/knowledge_vault_curator_personality.yaml` | Behavioral specification |
| `domain/agents/governance/prompts/tasks.yaml` | 6 CAF prompts across 2 domains |
