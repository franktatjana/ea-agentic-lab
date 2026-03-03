---
title: "Technology Scout Analyzer"
description: "Digital twin for analysis"
category: "reference"
keywords: ["tech_signal_analyzer_agent", "technology-scout", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Technology Scout Analyzer

The Technology Scout Analyzer is the digital twin of the Technology Scout Analyzer role. It operates as a single agent with 1 runbooks covering analysis. The Technology Scout Analyzer is the interpretation half of the Technology Scout team. It takes raw scan data from the Scanner and transforms it into structured technology signal maps. Each technology is assigned to a ring (Adopt, Trial, Assess, Hold) based on evidence thresholds, then tracked for trend direction over 30-day and 90-day periods. The Analyzer also identifies competitor tool mentions, maps technologies to vendor product offerings for skills gap analysis, and produces weekly tech intelligence digests for engagement teams.

Its operating principle: data-driven over opinion-based.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `tech-signal-analyzer-agent` |
| **Role** | Technology Scout Analyzer (Intelligence Analysis) |
| **Mode** | Human-paired |
| **Runbooks** | 1 |
| **Prompts** | 3 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Analysis

Generate technology signal map from scan results. Then build vendor/supplier technology landscape, and finally generate weekly technology intelligence summary.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `tech_map_generation` | Generate technology signal map from scan results |
| 2 | `vendor_landscape_analysis` | Build vendor/supplier technology landscape |
| 3 | `weekly_tech_digest` | Generate weekly technology intelligence summary |


## Scope Boundaries

The agent does not scan or fetch raw data (that's Technology Scout Scanner's job) (handoff to Leadership), research company org structure (that's Account Intelligence Agent's job) (handoff to Leadership), analyze industry-level trends (that's Industry Intelligence Agent's job) (handoff to Leadership), make commercial recommendations (that's AE Agent's job) (handoff to Leadership), create competitive battlecards (that's CI Agent's job) (handoff to Leadership), or directly modify node risk registers (handoff to Leadership).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `analyzer-ring_criteria.yaml` | Ring Assignment, Vendor Landscape | Analyzer ring criteria |
| `scanner-signal_keywords.yaml` | Technology Signals, Vendor Signals, Patterns | Scanner signal keywords |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Signals | `{account}-signals.md` | signals |
| Reports | `{account}-reports.md` | reports |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/technology_scout/tech-signal-analyzer-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/technology_scout/agents/tech_signal_analyzer_agent.yaml` | Agent configuration |
| `domain/agents/technology_scout/personalities/tech_signal_analyzer_personality.yaml` | Behavioral specification |
| `domain/agents/technology_scout/prompts/tasks.yaml` | 3 CAF prompts across 1 domains |
