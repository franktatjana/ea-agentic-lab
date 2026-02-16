# DDR-004: Technology Signal Intelligence System

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Domain Decision Record
**Specification:** [tech-signal-map.md](../reference/tech-signal-map.md)

## Context

Account teams need to understand a customer's technology landscape before and during engagements. Traditional approaches rely on manual discovery during meetings, RFP responses, or vendor questionnaires. This is slow, incomplete, and often biased by what the customer chooses to share.

Job postings are a publicly available, continuously updated signal of an organization's technology investments, priorities, and gaps. A company hiring 15 Splunk engineers signals SIEM investment. A company posting for "observability platform architect" signals infrastructure modernization. These signals are available months before formal procurement processes begin.

The question was whether to build an automated intelligence system that extracts technology signals from public data or rely on traditional discovery methods.

## Decision

Build a two-agent intelligence pipeline that scans job postings to extract technology signals and produces structured technology signal maps per realm.

**Two intelligence agents:**

| Agent | Role | Trigger | Output |
|---|---|---|---|
| Tech Signal Scanner | Scan job postings from LinkedIn, Indeed, and career pages | Weekly (Sundays 2am), manual | Raw scan data with extracted technologies, roles, and posting metadata |
| Tech Signal Analyzer | Analyze scan results to generate technology signal maps | Weekly (Mondays 6am), on scan complete | Structured signal map with adoption trends, skills gaps, and competitive indicators |

**Output:** Technology signal maps stored at `vault/{REALM}/intelligence/technology_scout/`. These maps feed into realm profiles and inform engagement strategy.

**Signal types extracted:**
- Technology stack adoption (languages, frameworks, platforms, tools)
- Hiring velocity by technology area (acceleration/deceleration)
- Skills gap indicators (roles posted repeatedly, unusual seniority requirements)
- Competitive displacement signals (hiring for competitor technologies)
- Organizational signals (team structure, reporting lines from job descriptions)

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Manual discovery only | No tooling investment, human judgment applied | Slow, incomplete, scales poorly across accounts | Cannot monitor 50+ accounts continuously |
| Commercial intelligence platforms (ZoomInfo, 6sense) | Mature, validated data | Expensive, generic, not customizable for our domain focus | Off-the-shelf tools don't extract technology-specific signals at the depth we need |
| Social media monitoring | Broader signal set | Noisy, low signal-to-noise ratio, privacy concerns | Job postings are structured and publicly intended for consumption |
| Customer self-reported surveys | Direct from source | Low response rates, biased toward what customers want vendors to know | Does not capture unfiltered technology reality |

## Consequences

**Positive:**
- Continuous, automated intelligence gathering across all accounts
- Signals available before formal engagement begins (proactive positioning)
- Structured output feeds directly into realm profiles and engagement strategy
- Competitive displacement signals enable early response to incumbent threats

**Negative:**
- Job posting data can be misleading (aspirational hiring vs actual adoption)
- Data freshness depends on scan frequency (weekly cadence may miss rapid changes)
- Requires ongoing maintenance as job posting platforms change their formats

**Risks:**
- Signal misinterpretation: a job posting for "Splunk engineer" could mean expansion or replacement. Mitigated by the Analyzer agent applying context from realm profile and engagement history.
- Platform access restrictions: LinkedIn and Indeed may limit scraping. Mitigated by designing for multiple data sources and respecting platform terms.

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): signal maps stored in realm-level intelligence directory
- [DDR-003: Domain Specialist Agents](DDR_003_domain_specialist_agents.md): signal maps inform which specialist to activate for an engagement

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | Two-agent intelligence pipeline established at project inception |
| 2026-02-11 | Documented | Retroactive documentation of domain decision |
| 2026-02-16 | EXTENDED | Expanded into Intelligence Cluster: added Account Intelligence Agent (aci_agent), Industry Intelligence Agent (ii_agent), vendor landscape analysis (PB_TSCT_002), shared source registry, and 8 new signals (SIG_ACI_001-003, SIG_TSCT_001-002, SIG_II_001-003). Team renamed from tech_signal_map to technology_scout. |
