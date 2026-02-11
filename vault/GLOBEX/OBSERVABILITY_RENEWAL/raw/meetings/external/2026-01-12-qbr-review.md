---
date: 2026-01-12
type: external_meeting
meeting_type: qbr
attendees:
  - name: Robert Martinez
    role: VP Operations
    company: Globex Industries
  - name: Emily Watson
    role: IT Director
    company: Globex Industries
  - name: Amy Chen
    role: Customer Success Manager
    company: "TechVendor Inc"
  - name: Kevin O'Brien
    role: Solutions Architect
    company: "TechVendor Inc"
tags:
  - client/GLOBEX
  - person/robert_martinez
  - person/emily_watson
  - signal/health_decline
  - signal/usage_drop
  - competitor/observabilityvendora
  - stage/renewal
---

# Globex Industries Q4 QBR - Observability Platform

## Summary

Difficult QBR meeting. Usage has declined 30% over the past quarter, and the customer expressed frustration with recent support experiences. Robert Martinez (VP Ops) was notably distant and disengaged. Emily Watson (IT Director) carried most of the conversation but seemed defensive.

## Usage Review

| Metric | Q3 2025 | Q4 2025 | Change |
|--------|---------|---------|--------|
| Daily Active Users | 45 | 32 | -29% |
| Dashboards Created | 12 | 3 | -75% |
| Alerts Configured | 156 | 142 | -9% |
| API Calls | 2.1M | 1.4M | -33% |
| Data Ingestion | 200GB/day | 180GB/day | -10% |

Emily explained the decline: "We had some organizational changes. The team that was most active with the platform moved to a different project."

When pressed, she admitted: "We're also evaluating whether we need this level of observability tooling given our current workload."

## Support Issues Discussed

Robert brought up several support escalations:
1. **P1 Ticket #45892** - 6-hour resolution for cluster performance issue
2. **P2 Ticket #46234** - Dashboard loading times degraded for 2 weeks
3. **Documentation complaint** - "Your docs are outdated for the latest version"

Robert: "I shouldn't have to escalate to get basic support. We're paying enterprise rates but getting startup-level service."

**RISK**: Customer satisfaction has dropped significantly. Need immediate support escalation review.

## Competitive Signal

Emily mentioned they've been "looking at alternatives for some of our use cases."

When Kevin asked for specifics, she said: "ObservabilityVendorA has been reaching out. Their APM story is more complete, and some of our developers are pushing for it."

Robert added: "We're not making any decisions until renewal, but we need to see improvement."

**RISK**: Active competitive evaluation with ObservabilityVendorA. Renewal in April.

## Champion Departure Impact

Learned that Michael Torres (previous champion, Sr. Platform Engineer) left Globex in November. He was the primary power user and advocate.

Emily: "Michael knew the platform inside out. Since he left, we've struggled to maintain the same level of adoption."

**RISK**: Champion departure has created knowledge gap and reduced advocacy.

## Renewal Discussion

Amy brought up the April renewal:
- Current ARR: $180K
- Contract term: 2 years
- Auto-renew clause: 60-day notice required

Robert's response: "Let's not talk about renewal until we see some improvements. Right now, I can't justify the spend to my CFO."

Emily softened slightly: "We want to make this work, but we need a path forward. Maybe a reduced scope would make sense?"

**RISK**: Potential downsell or churn. Customer questioning value.

## Value Delivered (Attempted)

Kevin presented value metrics:
- MTTR reduction: 40% (Q1-Q2 2025)
- Incidents detected proactively: 23
- Estimated downtime prevented: 12 hours

Robert was dismissive: "That was when Michael was running things. What's the value been lately?"

Kevin couldn't provide Q3-Q4 metrics since usage dropped.

## Actions

- [ ] Amy: Schedule support review call with Support Manager by Jan 15
- [ ] Kevin: Create health check report and optimization recommendations by Jan 17
- [ ] Kevin: Prepare competitive comparison vs ObservabilityVendorA by Jan 19
- [ ] Emily: Provide list of top 5 pain points by Jan 14

## Risks Identified

- **Champion gap** - No internal advocate since Michael Torres left
- **Support perception** - Customer feels service quality has declined
- **Competitive threat** - ObservabilityVendorA actively pursuing, developers interested
- **Value erosion** - Recent value delivered unclear due to usage drop
- **Budget pressure** - CFO scrutiny on all IT spend
- **Renewal risk** - April renewal at serious risk of downsell or churn

## Sentiment Assessment

| Stakeholder | Sentiment | Trend |
|-------------|-----------|-------|
| Robert Martinez | Negative | Declining |
| Emily Watson | Neutral/Negative | Declining |
| Development Team | Unknown | Leaning to ObservabilityVendorA |

## Next Steps

Emergency health check session scheduled for January 19th. Need to show concrete value and address support issues before renewal discussions.
