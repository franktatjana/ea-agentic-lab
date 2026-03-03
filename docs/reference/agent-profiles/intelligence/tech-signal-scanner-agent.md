---
title: "Technology Scout Scanner"
description: "Digital twin for scanning"
category: "reference"
keywords: ["tech_signal_scanner_agent", "technology-scout", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Technology Scout Scanner

The Technology Scout Scanner is the digital twin of the Technology Scout Scanner role. It operates as a single agent with 1 runbooks covering scanning. The Technology Scout Scanner is the data-gathering half of the Technology Scout team. It scans job postings from realm-associated companies across multiple sources (LinkedIn Jobs, Indeed, company career pages), extracts technology mentions, normalizes them to canonical forms, and deduplicates before passing results to the Analyzer. The scanner also monitors tech blogs, engineering publications, and vendor announcements for technology adoption signals. It produces raw, source-attributed signal data without interpretation.

Its operating principle: completeness over interpretation.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `tech-signal-scanner-agent` |
| **Role** | Technology Scout Scanner (Intelligence Gathering) |
| **Mode** | Human-paired |
| **Runbooks** | 1 |
| **Prompts** | 3 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Scanning

Scan job postings for technology adoption signals. Then scan for vendor partnerships and product announcements, and finally scan engineering blogs and conference talks for technology signals.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `job_posting_scan` | Scan job postings for technology adoption signals |
| 2 | `vendor_announcement_scan` | Scan for vendor partnerships and product announcements |
| 3 | `tech_blog_scan` | Scan engineering blogs and conference talks for technology signals |


## Scope Boundaries

The agent does not analyze or interpret scan results (that's Technology Scout Analyzer's job) (handoff to Leadership), make ring assignments or trend assessments (that's Analyzer's job) (handoff to Leadership), research company structure or strategy (that's Account Intelligence Agent's job) (handoff to Leadership), monitor news feeds (that's MNA Agent's job) (handoff to Leadership), assess competitive positioning (that's CI Agent's job) (handoff to Leadership), generate recommendations or action items (handoff to Leadership), or access systems requiring credentials beyond approved API keys (handoff to Leadership).


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


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/technology_scout/tech-signal-scanner-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/technology_scout/agents/tech_signal_scanner_agent.yaml` | Agent configuration |
| `domain/agents/technology_scout/personalities/tech_signal_scanner_personality.yaml` | Behavioral specification |
| `domain/agents/technology_scout/prompts/tasks.yaml` | 3 CAF prompts across 1 domains |
