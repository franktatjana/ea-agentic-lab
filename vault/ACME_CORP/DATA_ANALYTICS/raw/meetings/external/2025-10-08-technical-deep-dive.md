---
date: 2025-10-08
type: external_meeting
meeting_type: technical_evaluation
attendees:
  - name: Thomas Richter
    role: VP Data & Analytics
    company: ACME Corp
  - name: Lars Becker
    role: Analytics Team Lead
    company: ACME Corp
  - name: Maria Santos
    role: Solutions Architect
    company: "Vendor"
tags:
  - client/ACME_CORP
  - person/thomas_richter
  - person/lars_becker
  - tech/redshift
  - tech/kafka
  - stage/evaluation
  - domain/analytics
---

# ACME Corp Technical Deep-Dive - Analytics Platform

## Summary

Detailed technical session reviewing ACME's current analytics architecture and validating platform fit. Lars Becker (Analytics Team Lead) attended and provided operational perspective. Architecture alignment confirmed across all data sources.

## Current Architecture Review

Lars walked through the current environment:
- **Redshift**: 15TB data warehouse, 200+ tables, primary analytics source
- **Kafka**: 12 topics, ~50K events/sec, used for operational metrics
- **S3**: 40TB data lake, Parquet + JSON formats, growing 20% QoQ
- **Airflow**: 85 DAGs, 4-hour batch refresh cycle, fragile pipelines

Lars: "Our biggest pain is the 4-hour data latency. By the time our dashboards refresh, the data is already stale for operational decisions."

## Platform Architecture Fit

Maria demonstrated:
1. **Redshift connector**: Native integration, query pushdown, tested at 15TB scale
2. **Kafka integration**: Real-time streaming ingestion, sub-10-second latency
3. **S3 crawling**: Schema-on-read for data lake, auto-discovery
4. **Dashboard performance**: Sub-3-second load on 100M+ rows in demo

Thomas was visibly impressed: "This is exactly what I've been looking for. One platform to replace the mess we have."

Lars was more cautious but positive: "The Kafka integration is exactly what we need. But I want to see it work with our specific Avro schemas."

## POC Scope Definition

Agreed on 5 use cases for the POC:

1. **Executive Dashboard** - C-suite KPI dashboard from Redshift (replaces Tableau)
2. **Real-Time Pipeline** - Manufacturing metrics via Kafka (new capability)
3. **Self-Service BI** - Marketing team ad-hoc analysis (replaces Power BI)
4. **Tableau Migration** - 10 representative dashboards auto-converted
5. **Data Engineering** - Pipeline orchestration replacing 5 Airflow DAGs

## Migration Assessment

Maria's initial analysis of Tableau migration:
- 200+ dashboards reviewed via metadata export
- ~150 (75%) use standard chart types, auto-convertible
- ~50 (25%) use custom extensions, require manual rebuild
- Estimated migration effort: 4 weeks with 2 resources

Thomas: "75% auto-conversion is acceptable. The 50 complex ones we can phase."

## Actions

- [ ] Maria: Finalize POC environment with Redshift connector by Oct 30
- [ ] Lars: Provide Kafka schema samples and test data
- [ ] Thomas: Approve POC timeline and success criteria
- [ ] Maria: Prepare detailed migration assessment for 50 complex dashboards

## Next Steps

POC kickoff targeted for November 12th. Thomas to formally approve scope and success criteria by October 15th.
