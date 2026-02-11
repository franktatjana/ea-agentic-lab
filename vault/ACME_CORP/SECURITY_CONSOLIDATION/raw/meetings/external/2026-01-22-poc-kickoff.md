---
date: 2026-01-22
type: external_meeting
meeting_type: poc_kickoff
attendees:
  - name: Sarah Chen
    role: CTO
    company: ACME Corp
  - name: Marcus Weber
    role: VP Engineering
    company: ACME Corp
  - name: Jennifer Liu
    role: Security Engineering Lead
    company: ACME Corp
  - name: Tom Rodriguez
    role: Solutions Architect
    company: "TechVendor Inc"
  - name: Lisa Park
    role: Account Executive
    company: "TechVendor Inc"
  - name: Mike Santos
    role: POC Lead
    company: "TechVendor Inc"
tags:
  - client/ACME_CORP
  - person/sarah_chen
  - person/marcus_weber
  - person/jennifer_liu
  - tech/data-platform
  - tech/security-solution
  - stage/poc
---

# ACME Corp POC Kickoff - Security Consolidation

## Summary

Official POC kickoff with executive sponsor present. Agreed on success criteria, timeline, and resource commitments. Sarah Chen confirmed this is a strategic initiative with board visibility.

## POC Success Criteria

### Must-Have (Go/No-Go)

| Criteria | Metric | Target |
|----------|--------|--------|
| Search Performance | P95 query latency | < 3 seconds on 90-day data |
| Detection Parity | Rules converted | > 90% of current LegacySIEM rules |
| Data Ingestion | Throughput | Handle 500GB/day sustained |
| Uptime | Availability | 99.9% during POC |

### Should-Have (Strong Preference)

| Criteria | Metric | Target |
|----------|--------|--------|
| Dashboard Migration | Dashboards recreated | > 80% functional parity |
| Alert Accuracy | False positive rate | < current LegacySIEM baseline |
| User Adoption | Analyst feedback | Positive from majority |

## Timeline Agreed

- **Week 1 (Jan 22-26)**: Environment setup, data ingestion begins
- **Week 2 (Jan 29 - Feb 2)**: Detection rule migration, analyst access
- **Week 3 (Feb 5-9)**: Dashboard migration, workflow testing
- **Week 4 (Feb 12-16)**: Parallel operation, success criteria validation

**DECISION**: POC completion target is February 16th. Go/no-go decision meeting scheduled for February 19th.

## Resource Commitments

**ACME Commits:**
- Jennifer Liu: 50% time allocation for 4 weeks
- David Kim: Full-time POC resource
- Access to production data (anonymized PII)
- AWS environment for cloud deployment

**TechVendor Inc Commits:**
- Mike Santos: Dedicated POC lead
- Tom Rodriguez: Architecture guidance (20%)
- Rachel Foster: Detection engineering support
- 24/7 Slack channel support

Sarah emphasized: "I need this to succeed. Our SOC2 audit is in July, and we need to be fully operational on the new platform by June 1st."

## Commercial Discussion

Lisa presented the commercial framework:
- 3-year enterprise agreement
- Estimated $650K/year (vs. $1.2M current LegacySIEM spend)
- 45% cost savings projected
- Professional services for migration included

Marcus asked about payment terms. Lisa confirmed quarterly payment option available.

**DECISION**: If POC successful, ACME will sign by February 28th to allow migration timeline for June go-live.

## Risk Discussion

Sarah raised timeline risk: "What if the POC takes longer? We can't slip the June date."

Mike explained the mitigation plan:
- Phased go-live (Security first, then observability)
- Parallel operation period built in
- Rollback plan documented

**RISK**: June deadline is hard due to SOC2 audit. No flexibility on timeline.

## Governance

Weekly status calls every Tuesday at 2pm PT:
- ACME: Marcus, Jennifer
- TechVendor Inc: Mike, Tom

Executive checkpoint at Week 2 midpoint with Sarah.

## Actions

- [ ] Mike: Deploy POC environment by Jan 23 EOD
- [ ] Jennifer: Provide data access credentials by Jan 23
- [ ] Tom: Complete architecture design document by Jan 24
- [ ] Lisa: Send SOW for professional services by Jan 24
- [ ] Marcus: Confirm AWS budget allocation by Jan 23

## Risks Identified

- **Hard deadline** - June 1st is non-negotiable due to SOC2
- **Data sensitivity** - Need to handle PII carefully during migration
- **Analyst availability** - David is also working on another project

## Next Steps

Mike will send daily progress updates. First status call Tuesday Jan 28th.
