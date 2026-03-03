---
title: "Industry Intelligence Agent"
description: "Digital twin for industry analysis, regulatory, trends"
category: "reference"
keywords: ["ii_agent", "industry-intelligence", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Industry Intelligence Agent

The Industry Intelligence Agent is the digital twin of the Industry Intelligence role. It operates as a single agent with 3 runbooks covering industry analysis, regulatory, and trends. The Industry Intelligence Analyst operates at the sector level, analyzing market dynamics, competitive landscapes, and regulatory environments that shape customer industries. It produces structured industry profiles, tracks trends by maturity stage, and monitors regulatory changes with compliance deadlines. This sector-level context helps engagement teams understand the forces affecting their customers and identify where vendor capabilities align with industry-wide shifts.

Its operating principle: context over isolated facts.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ii-agent` |
| **Role** | Industry Intelligence (Intelligence Analysis) |
| **Mode** | Human-paired |
| **Runbooks** | 3 |
| **Prompts** | 6 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 1 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Industry Analysis

Comprehensive industry structure and dynamics analysis, then compare company positioning against industry benchmarks.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `industry_deep_dive` | Comprehensive industry structure and dynamics analysis |
| 2 | `sector_comparison` | Compare company positioning against industry benchmarks |


### Regulatory

Scan for regulations affecting the customer's industry, then assess impact of a specific regulatory change on engagement.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `regulatory_scan` | Scan for regulations affecting the customer's industry |
| 2 | `regulatory_impact_assessment` | Assess impact of a specific regulatory change on engagement |


### Trends

Identify and classify industry trends, then deep analysis of a specific trend's impact on engagement.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `trend_identification` | Identify and classify industry trends |
| 2 | `trend_impact_analysis` | Deep analysis of a specific trend's impact on engagement |


## Scope Boundaries

The agent does not research individual company structure (that's Account Intelligence Agent's job) (handoff to Leadership), monitor daily news feeds (that's MNA Agent's job) (handoff to Leadership), analyze competitor-specific positioning (that's CI Agent's job) (handoff to Leadership), scan technology adoption at company level (that's Technology Scout's job) (handoff to Leadership), make commercial or pricing recommendations (that's AE Agent's job) (handoff to Leadership), generate customer-facing content (handoff to Leadership), access paid full-text analyst reports without authorization (handoff to Leadership), or predict regulatory outcomes or lobby positions (handoff to Leadership).


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
| `domain/agents/industry_intelligence/ii-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/industry_intelligence/agents/ii_agent.yaml` | Agent configuration |
| `domain/agents/industry_intelligence/personalities/ii_personality.yaml` | Behavioral specification |
| `domain/agents/industry_intelligence/prompts/tasks.yaml` | 6 CAF prompts across 3 domains |
