---
title: "Account Intelligence Agent"
description: "Digital twin for company research, opportunity identification, organigram building"
category: "reference"
keywords: ["aci_agent", "account-intelligence", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Account Intelligence Agent

The Account Intelligence Agent is the digital twin of the Account Intelligence role. It operates as a single agent with 5 runbooks covering company research, opportunity identification, organigram building, organigram, and opportunities. The Account Intelligence Analyst gathers structured company intelligence from public sources to support engagement planning and opportunity development. It builds organizational hierarchies (organigrams) by business line, tracks strategy evolution from corporate disclosures, and identifies whitespace opportunities by mapping company initiatives to vendor capabilities. All findings are source-attributed and confidence-scored, providing a reliable foundation for downstream commercial and technical analysis.

Its operating principle: accuracy over completeness.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `aci-agent` |
| **Role** | Account Intelligence (Intelligence Analysis) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 15 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 1 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Company Research

Research a company from public sources to build a comprehensive profile covering structure, business lines, strategy, and financials

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `company_research_analyze` | Analyze input |
| 2 | `company_research_synthesize` | Synthesize findings |
| 3 | `company_research_output` | Generate output |


### Opportunity Identification

Identify business opportunities by mapping company strategic initiatives to vendor capabilities and finding unengaged business lines

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `opportunity_identification_analyze` | Analyze input |
| 2 | `opportunity_identification_synthesize` | Synthesize findings |
| 3 | `opportunity_identification_output` | Generate output |


### Organigram Building

Build an organizational hierarchy organized by business lines with leadership mapping, department structure, and decision chains

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `organigram_building_analyze` | Analyze input |
| 2 | `organigram_building_synthesize` | Synthesize findings |
| 3 | `organigram_building_output` | Generate output |


### Organigram

Extract C-suite and senior leadership from public sources, then map leadership to business lines and build department structure.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `leadership_extraction` | Extract C-suite and senior leadership from public sources |
| 2 | `org_hierarchy_mapping` | Map leadership to business lines and build department structure |


### Opportunities

Map company strategy to vendor capabilities and identify opportunities, then identify what has changed since last research cycle.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `opportunity_mapping` | Map company strategy to vendor capabilities and identify opportunities |
| 2 | `refresh_delta` | Identify what has changed since last research cycle |


## Scope Boundaries

The agent does not monitor ongoing news feeds (that's MNA Agent's job) (handoff to Leadership), analyze competitive positioning (that's CI Agent's job) (handoff to Leadership), scan technology adoption signals (that's Technology Scout's job) (handoff to Leadership), analyze industry-level trends (that's Industry Intelligence Agent's job) (handoff to Leadership), make commercial recommendations (that's AE Agent's job) (handoff to Leadership), generate customer-facing content (handoff to Leadership), access internal or confidential company data (handoff to Leadership), or fabricate organizational relationships without source evidence (handoff to Leadership).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `research_sources.yaml` | Primary Sources, Secondary Sources | Research sources |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Signals | `{account}-signals.md` | signals |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/account_intelligence/aci-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/account_intelligence/agents/aci_agent.yaml` | Agent configuration |
| `domain/agents/account_intelligence/personalities/aci_personality.yaml` | Behavioral specification |
| `domain/agents/account_intelligence/prompts/tasks.yaml` | 15 CAF prompts across 5 domains |
