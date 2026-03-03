---
title: "Market News Agent"
description: "Digital twin for realm news, node news, digests"
category: "reference"
keywords: ["mna_agent", "market-news-analysis", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Market News Agent

The Market News Agent is the digital twin of the Market News role. It operates as a single agent with 4 runbooks covering realm news, node news, digests, and impact. The Market News Analyst continuously scans public news sources for company, industry, and solution-domain developments relevant to active engagements. It classifies news items as realm-level (company-wide) or node-level (industry/solution-specific), scores them for relevance and urgency, and generates structured digests with actionable insights. High-impact developments trigger immediate signals to downstream agents, while routine intelligence is aggregated into weekly digests.

Its operating principle: accuracy over speed.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `mna-agent` |
| **Role** | Market News (Intelligence Gathering) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 10 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Realm News

Scan news sources for realm-associated company developments. Then track progress of known company strategic initiatives, and finally detect leadership changes at realm companies.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `company_news_scan` | Scan news sources for realm-associated company developments |
| 2 | `strategic_initiative_tracking` | Track progress of known company strategic initiatives |
| 3 | `leadership_monitoring` | Detect leadership changes at realm companies |


### Node News

Scan industry and solution news relevant to a specific node. Then focused scan on competitors active in a node, and finally scan for regulatory changes affecting node's solution domain.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `solution_domain_scan` | Scan industry and solution news relevant to a specific node |
| 2 | `competitor_news_scan` | Focused scan on competitors active in a node |
| 3 | `regulatory_impact_scan` | Scan for regulatory changes affecting node's solution domain |


### Digests

Generate weekly news digest for a realm, then generate weekly solution-domain digest for a node.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `weekly_realm_digest` | Generate weekly news digest for a realm |
| 2 | `weekly_node_digest` | Generate weekly solution-domain digest for a node |


### Impact

Assess impact of specific news item on engagement, then analyze emerging patterns across multiple news items.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `news_impact_assessment` | Assess impact of specific news item on engagement |
| 2 | `trend_pattern_analysis` | Analyze emerging patterns across multiple news items |


## Scope Boundaries

The agent does not create competitive strategy (that's CI Agent's job) (handoff to Leadership), modify risk registers directly (that's Risk Radar's job) (handoff to Leadership), make commercial recommendations (that's AE Agent's job) (handoff to Leadership), analyze job postings for tech signals (that's Technology Scout Scanner's job) (handoff to Leadership), research company structure or org charts (that's Account Intelligence Agent's job) (handoff to Leadership), conduct industry-level analysis (that's Industry Intelligence Agent's job) (handoff to Leadership), generate customer-facing content (handoff to Leadership), access paid/subscription-only full reports without authorization (handoff to Leadership), or speculate beyond what public sources support (handoff to Leadership).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal_keywords.yaml` | Company Signals, Industry Signals, Solution Signals | Signal keywords |
| `signal_patterns.yaml` | Patterns | Signal patterns |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Artifacts | `{account}-artifacts.md` | artifacts |
| Signals | `{account}-signals.md` | signals |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/market_news_analysis/mna-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/market_news_analysis/agents/mna_agent.yaml` | Agent configuration |
| `domain/agents/market_news_analysis/personalities/mna_personality.yaml` | Behavioral specification |
| `domain/agents/market_news_analysis/prompts/tasks.yaml` | 10 CAF prompts across 4 domains |
