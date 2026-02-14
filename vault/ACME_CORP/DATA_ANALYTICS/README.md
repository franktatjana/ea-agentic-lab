# ACME Corporation - Data Analytics Consolidation

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

## DEAL STATUS: CLOSED LOST

| Field | Value |
|-------|-------|
| **Outcome** | Lost to DataForge |
| **Close Date** | 2026-01-10 |
| **Loss Reason** | Champion departure + new CDO with DataForge preference |
| **ARR Lost** | $420,000 |
| **Duration** | 118 days (Sep 15 - Jan 10) |
| **POC Result** | 85% success criteria met |
| **Health Score at Close** | 32/100 (peak: 72) |

---

**Node:** DATA_ANALYTICS | **Realm:** ACME | **Last Updated:** 2026-01-12

## Deal Summary

ACME sought to consolidate 4 fragmented analytics tools (Tableau, Power BI, Python/Jupyter, Crystal Reports) into a unified analytics platform. The deal progressed strongly through discovery and POC with VP Data & Analytics Thomas Richter as champion. The POC was technically successful (85% criteria met). However, when Thomas resigned on Nov 28, the newly appointed CDO Anna Bergmann selected DataForge based on her 3-year prior experience.

## Quick Links

| Section | Description | Status |
|---------|-------------|--------|
| [Node Profile](node_profile.yaml) | Core node data | Closed Lost |
| [Blueprint](blueprint.yaml) | Blueprint instance | Closed |
| [Risk Register](internal-infohub/risks/risk_register.yaml) | 8 risks (3 materialized) | **3 MATERIALIZED** |
| [Decision Log](internal-infohub/decisions/decision_log.yaml) | 10 decisions | Final |
| [Action Tracker](internal-infohub/actions/action_tracker.yaml) | 14 actions | Closed |
| [Health Score](internal-infohub/governance/health_score.yaml) | 32/100 | **TERMINAL** |
| [Thomas Richter](internal-infohub/stakeholders/thomas_richter.yaml) | Former Champion | **DEPARTED** |
| [Anna Bergmann](internal-infohub/stakeholders/anna_bergmann.yaml) | CDO (Decision Maker) | **SELECTED COMPETITOR** |
| [Value Tracker](internal-infohub/value/value_tracker.yaml) | Value hypotheses | Invalidated |
| [Competitive Context](internal-infohub/competitive/competitive_context.yaml) | DataForge won | Lost |
| [Journey Map](internal-infohub/journey/customer_journey_map.yaml) | Full journey | Closed |

## Health Score Trajectory

```
Score
  80 |
  72 |         ●──●──●──●
  70 |        /
  65 |   ●───/
  60 |
  50 |
  48 |                      ● Thomas departed
  42 |                         ● CDO appointed
  38 |                            ●──●
  32 |                                  ● LOST
     └──────────────────────────────────────
      Sep   Oct   Nov   Dec   Jan
```

## Deal Timeline

| Date | Event | Impact |
|------|-------|--------|
| 2025-09-15 | Discovery call with Thomas Richter | Strong qualification |
| 2025-10-08 | Technical deep-dive | Architecture confirmed |
| 2025-10-15 | POC scope approved | Peak probability (65%) |
| 2025-11-12 | POC kickoff | Strong start |
| 2025-11-28 | **Thomas Richter resigned** | **CRITICAL** |
| 2025-12-01 | Anna Bergmann appointed CDO | DataForge bias |
| 2025-12-18 | POC review (85% met) | Technical success |
| 2026-01-10 | **DEAL LOST** | DataForge selected |

## Why We Lost

**Primary Cause:** Single-threaded champion dependency

Thomas Richter was our only executive champion. When he departed, we had no backup relationship at the decision-making level.

**Contributing Factors:**

| Factor | Description |
|--------|-------------|
| New CDO bias | Anna Bergmann had 3-year DataForge relationship |
| Late engagement | Took 14 days to meet Anna (should have been 48 hours) |
| No CTO coverage | Marcus Weber was only engaged on security node |
| POC insufficient | 85% technical success couldn't overcome relationship bias |

## Key Quotes

> **Thomas Richter:** "We're drowning in tools. My team spends more time switching between platforms than actually analyzing data."

> **Anna Bergmann:** "Your platform is impressive, but I need to move fast and I'm going with what I know."

> **Lars Becker:** "The self-service experience is genuinely better than anything we have today."

## Lessons Learned

1. **Multi-thread every deal** - Never rely on a single champion
2. **48-hour rule** - Engage new decision makers within 48 hours
3. **CTO coverage across all nodes** - Not just the biggest deal
4. **POC excellence is necessary but not sufficient** - Relationships can override results
5. **Monitor for leadership changes** - LinkedIn activity, press releases, org announcements

## Meetings

### External
| Date | Attendee | Outcome |
|------|----------|---------|
| [2025-09-15](raw/meetings/external/2025-09-15-discovery-call.md) | Thomas Richter | Strong discovery |
| [2025-10-08](raw/meetings/external/2025-10-08-technical-deep-dive.md) | Thomas + Lars | Architecture fit |
| [2025-11-12](raw/meetings/external/2025-11-12-poc-kickoff.md) | Thomas + Lars | POC started |
| [2025-12-18](raw/meetings/external/2025-12-18-poc-review.md) | Anna + Lars | Strong but non-committal |
| [2026-01-10](raw/meetings/external/2026-01-10-final-decision.md) | Anna + Dr. Chen | **LOST** |

### Internal
| Date | Type | Outcome |
|------|------|---------|
| [2025-09-16](raw/meetings/internal/2025-09-16-deal-review.md) | Deal Review | Qualified, resources approved |
| [2025-11-20](raw/meetings/internal/2025-11-20-deal-review.md) | Deal Review | POC progress, multi-thread gap |
| [2026-01-12](raw/meetings/internal/2026-01-12-loss-review.md) | Loss Review | Lessons captured |

## Framework Analyses

| Date | Framework | Status |
|------|-----------|--------|
| [2025-09-20](internal-infohub/frameworks/PB_001_three_horizons_20250920.md) | Three Horizons | Completed |
| [2025-09-20](internal-infohub/frameworks/PB_201_swot_20250920.md) | SWOT | Completed |

## Stakeholder Map (Final)

| Name | Title | Role | Stance |
|------|-------|------|--------|
| Thomas Richter | VP Data (former) | Champion | **DEPARTED** |
| **Anna Bergmann** | CDO | **Decision Maker** | **BLOCKER** |
| Lars Becker | Analytics Lead | User Buyer | Supporter |
| Dr. Sarah Chen | Head of Eng | Advisor | Neutral |

## Impact on ACME Account

- **Observability**: Unaffected
- **Security Consolidation**: Unaffected (separate decision makers)
- **Analytics**: Lost, revisit in 12-18 months
- **Watch Item**: DataForge expansion into adjacent areas

---

## Node Structure

```text
DATA_ANALYTICS/
├── README.md                              # This file (node summary)
├── node_profile.yaml                      # Node configuration (closed_lost)
├── blueprint.yaml                         # Blueprint instance (closed)
│
├── raw/                                   # Unprocessed inputs
│   ├── meetings/
│   │   ├── external/
│   │   │   ├── 2025-09-15-discovery-call.md
│   │   │   ├── 2025-10-08-technical-deep-dive.md
│   │   │   ├── 2025-11-12-poc-kickoff.md
│   │   │   ├── 2025-12-18-poc-review.md
│   │   │   └── 2026-01-10-final-decision.md
│   │   └── internal/
│   │       ├── 2025-09-16-deal-review.md
│   │       ├── 2025-11-20-deal-review.md
│   │       └── 2026-01-12-loss-review.md
│   └── daily-ops/
│       └── 2025-12-20-poc-status.md
│
├── external-infohub/                      # Customer-shareable outputs
│   └── architecture/
│       └── ADR_001_analytics_platform.md  # Superseded
│
└── internal-infohub/                      # Vendor-only outputs
    ├── context/
    │   ├── node_overview.yaml
    │   ├── stakeholder_map.yaml
    │   └── engagement_history.md
    ├── opportunities/
    │   └── analytics_evaluation/
    │       ├── discovery.yaml
    │       └── success_criteria.yaml
    ├── risks/
    │   ├── risk_register.yaml             # 3 risks materialized
    │   └── risk_history.yaml
    ├── competitive/
    │   └── competitive_context.yaml       # DataForge won
    ├── stakeholders/
    │   ├── thomas_richter.yaml            # Champion (departed)
    │   └── anna_bergmann.yaml             # CDO (selected competitor)
    ├── governance/
    │   ├── health_score.yaml              # 32/100 (terminal)
    │   └── operating_cadence.yaml
    ├── decisions/
    │   └── decision_log.yaml
    ├── actions/
    │   └── action_tracker.yaml
    ├── value/
    │   └── value_tracker.yaml             # Invalidated
    ├── journey/
    │   ├── customer_journey_map.yaml
    │   └── touchpoint_log.yaml
    └── frameworks/
        ├── PB_001_three_horizons_20250920.md
        └── PB_201_swot_20250920.md
```

---
*InfoHub maintained by: SA Agent*
*Deal closed: 2026-01-10*
*Loss review completed: 2026-01-12*
