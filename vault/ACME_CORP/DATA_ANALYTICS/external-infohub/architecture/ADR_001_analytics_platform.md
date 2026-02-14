# ADR-001: Analytics Platform Architecture

**Status:** Superseded (deal lost)
**Date:** 2025-10-12
**Decision Maker:** Thomas Richter (VP Data & Analytics)

---

## Context

ACME Corporation operates 4 separate analytics tools (Tableau, Power BI, Python/Jupyter, Crystal Reports) serving 350 users. The fragmented landscape results in:
- $475K annual licensing cost
- Data silos across departments
- 4-hour data latency for batch reports
- 45 pending dashboard requests per month

## Decision

Consolidate analytics onto a unified platform providing:
1. Self-service dashboarding for business users
2. Real-time data pipeline processing
3. Centralized data catalog and governance
4. Native AWS integration (Redshift, S3, Kafka)

## Architecture

```
Data Sources              Platform                   Users
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Redshift    │────>│                  │────>│ Business     │
│  (warehouse) │     │  Unified         │     │ Users (300)  │
├─────────────┤     │  Analytics       │     ├──────────────┤
│  Kafka       │────>│  Platform        │────>│ Analysts     │
│  (streaming) │     │                  │     │ (25)         │
├─────────────┤     │  - Dashboards    │     ├──────────────┤
│  S3          │────>│  - Pipelines     │────>│ Engineers    │
│  (data lake) │     │  - Catalog       │     │ (8)          │
├─────────────┤     │  - Search        │     └──────────────┘
│  PostgreSQL  │────>│                  │
│  (operational)│    └──────────────────┘
└─────────────┘
```

## Consequences

**Positive:**
- 35% TCO reduction ($165K annual savings)
- Real-time data pipeline (4 hours to < 30 seconds)
- Self-service reduces dashboard request backlog by 60%
- Unified governance and data catalog

**Negative:**
- Migration effort for 200+ Tableau dashboards (75% auto, 25% manual)
- Team retraining required (estimated 2 weeks)
- 3-month transition period with parallel systems

## Status Update

**2026-01-10:** This ADR is superseded. The customer selected DataForge Lakehouse Platform under new CDO Anna Bergmann. The technical architecture was validated during POC but the deal was lost due to stakeholder change.
