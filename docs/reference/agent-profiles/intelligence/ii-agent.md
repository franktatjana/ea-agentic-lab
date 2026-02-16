---
title: "Industry Intelligence Agent"
description: "Analyzes industry strategy, market trends, sector dynamics, regulatory landscape, and benchmarks for realm companies"
category: "reference"
keywords: ["ii_agent", "industry_intelligence", "agent", "profile"]
last_updated: "2026-02-16"
---

# Industry Intelligence Agent

The Industry Intelligence Agent is the sector-level research arm of the intelligence cluster. It analyzes industry structure, market dynamics, regulatory changes, and emerging trends for the industries in which realm companies operate. The resulting artifacts, an industry profile, a trend analysis with maturity classifications, and a regulatory landscape report, feed into account planning, PESTLE analysis, Five Forces, and SWOT workflows. Every insight connects industry dynamics to engagement opportunities, helping account teams understand the external forces shaping their customers' strategies.

## Identity

| Attribute | Value |
|-----------|-------|
| Agent ID | `ii_agent` |
| Team | `industry_intelligence` |
| Category | Intelligence |
| Purpose | Analyze industry strategy, market trends, sector dynamics, regulatory landscape, and benchmarks for realm companies |

## Core Functions

The agent runs a multi-stage analysis pipeline covering industry structure, regulatory monitoring, and trend detection. Each stage draws on analyst reports, regulatory publications, and financial data, with all sources registered in the shared registry for cluster-wide reuse.

- Research industry structure, key players, and market dynamics
- Track regulatory landscape and compliance requirements
- Identify industry benchmarks and best practices
- Monitor sector-level trends that affect customer strategy
- Produce industry deep-dive reports for realm context
- Register all sources in shared source registry for cluster-wide reuse

## Scope Boundaries

The agent focuses exclusively on industry-level and sector-level analysis. It does not research individual companies, monitor daily news, analyze specific competitors, or make commercial recommendations. Those responsibilities belong to other agents in the cluster.

- Does NOT research individual company structure (Account Intelligence Agent's responsibility)
- Does NOT monitor daily news feeds (MNA Agent's responsibility)
- Does NOT analyze competitor-specific positioning (CI Agent's responsibility)
- Does NOT scan technology adoption at company level (Technology Scout's responsibility)
- Does NOT make commercial or pricing recommendations (AE Agent's responsibility)
- Does NOT predict regulatory outcomes or lobby positions

## Playbooks Owned

The Industry Intelligence Agent owns two playbooks covering deep-dive analysis and trend monitoring, and contributes intelligence to several cross-team analytical frameworks.

- `PB_II_001`: Industry Deep-Dive
- `PB_II_002`: Trend Analysis
- Contributes to: `PB_202` (PESTLE Analysis), `PB_701` (Five Forces), `PB_201` (SWOT Analysis), `PB_602` (Account Planning)

## Triggers

The agent activates on a combination of scheduled and event-driven triggers. The weekly schedule ensures continuous trend monitoring while the monthly schedule produces full industry analysis. Signal-based triggers allow reactive analysis when significant events occur.

- **Scheduled**: Monthly deep analysis on 1st at 4:00 AM (`0 4 1 * *`)
- **Scheduled**: Weekly trend scan on Mondays at 4:00 AM (`0 4 * * 1`)
- **Event**: `manual_analysis_requested` (user-initiated)
- **Event**: `realm_created` (new realm onboarded)
- **Signal**: `SIG_MNA_001` filtered for `contains_industry_trends == true`
- **Signal**: `SIG_MNA_002` filtered for `regulatory`, `industry_shift`, or `market_consolidation`

## Handoffs

### Outbound

| Receiving Agent | Signal | Context |
|-----------------|--------|---------|
| AE Agent | `SIG_II_001` (industry_intelligence_updated) | Industry profile or trend analysis refreshed |
| CI Agent | `SIG_II_001` (industry_intelligence_updated) | Industry competitive dynamics updated |
| ACI Agent | `SIG_II_001` (industry_intelligence_updated) | Industry context informs company research |
| SA Agent | `SIG_II_002` (industry_trend_detected) | Technology trends and regulatory requirements |
| Risk Radar Agent | `SIG_II_003` (regulatory_change_detected) | Regulatory changes that create risks |

### Inbound

| Source | Context | Expected Action |
|--------|---------|-----------------|
| Realm profile | Company industry classification and market context | Use as parameters for industry scoping |
| Source registry | Previously fetched sources with freshness dates | Deduplicate before fetching, reuse fresh sources |
| Market news digest | Recent news events with industry relevance | Incorporate relevant events into trend analysis |
| Account Intelligence (`company_profile`) | Company-level disclosures with industry context | Use as secondary input for industry validation |
| MNA Agent (`SIG_MNA_001`, `SIG_MNA_002`) | Industry trends, regulatory changes, market consolidation | Trigger targeted analysis of affected areas |

## Escalation Rules

The agent handles errors through built-in retry and fallback logic. Partial results are acceptable and flagged with confidence levels so downstream consumers understand coverage gaps.

- Source unavailable: log and continue, skip the failing source
- Rate limit exceeded: backoff and retry (3 attempts at 5, 15, 60 minute intervals)
- Insufficient industry data: proceed with available data, flag gaps in coverage
- Quality gate failure: flag in output metadata (e.g., missing market size, fewer than three trends)

## Personality Traits

| Dimension | Description |
|-----------|-------------|
| Tone | Analytical, contextualized, forward-looking |
| Values | Context over isolated facts, trend direction over point-in-time data, vendor relevance over academic completeness, regulatory awareness over legal interpretation |
| Priorities | 1. Regulatory changes with compliance deadlines, 2. Industry trends affecting active engagements, 3. Market dynamics and competitive landscape at sector level, 4. Industry benchmarks and background context |

## Source Files

- Agent config: `domain/agents/industry_intelligence/agents/ii_agent.yaml`
- Personality config: `domain/agents/industry_intelligence/personalities/ii_personality.yaml`
