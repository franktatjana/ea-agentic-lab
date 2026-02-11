---
date: 2026-01-15
type: external_meeting
meeting_type: technical
attendees:
  - name: Marcus Weber
    role: VP Engineering
    company: ACME Corp
  - name: Jennifer Liu
    role: Security Engineering Lead
    company: ACME Corp
  - name: David Kim
    role: Senior Security Analyst
    company: ACME Corp
  - name: Tom Rodriguez
    role: Solutions Architect
    company: "TechVendor Inc"
  - name: Rachel Foster
    role: Security Specialist
    company: "TechVendor Inc"
tags:
  - client/ACME_CORP
  - person/marcus_weber
  - person/jennifer_liu
  - person/david_kim
  - tech/data-platform
  - tech/dashboards
  - tech/agent
  - tech/legacysiem
  - tech/aws
  - tech/kafka
---

# ACME Corp Technical Deep Dive - Architecture Review

## Summary

Technical deep-dive session with ACME security engineering team. Reviewed their current architecture, discussed our Security solution architecture, and mapped out a migration approach. Jennifer Liu emerged as a strong technical champion - she has prior platform experience from a previous role.

## Current Architecture Review

Jennifer walked us through their stack:

```
Data Sources → Kafka → LegacySIEM Indexers (3x) → LegacySIEM Search Heads (2x)
                ↓
            S3 Archive (cold storage)
```

**Pain Points Identified:**
1. Search performance degrades significantly beyond 7 days
2. Kafka to LegacySIEM connector is fragile, requires manual intervention weekly
3. No correlation between security events and infrastructure metrics
4. Dashboard load times average 45 seconds for complex queries

## Proposed Architecture

Tom presented the recommended architecture:

```
Data Sources → Agent (Fleet-managed) → Search Cluster (AWS)
                                              ↓
                                       Dashboards + Security Solution
```

**Key Design Decisions:**

**DECISION**: Use the agent with Fleet for centralized management instead of legacy forwarders. Jennifer agreed this simplifies operations significantly.

**DECISION**: Deploy on AWS using our cloud offering rather than self-managed. Marcus confirmed cloud-first preference aligns with company direction.

**DECISION**: Implement hot-warm-cold architecture with ILM for cost optimization. 30 days hot, 60 days warm, 1 year cold on S3.

## Migration Approach

Rachel outlined the phased migration:

**Phase 1 (Weeks 1-2)**: Parallel ingestion
- Deploy agent alongside existing LegacySIEM forwarders
- Begin dual-writing to both platforms
- No changes to analyst workflows

**Phase 2 (Weeks 3-4)**: Detection rule migration
- Automated conversion of LegacySIEM SPL to query language
- Manual review of complex rules
- Target: 80% automated conversion

**Phase 3 (Weeks 5-6)**: Dashboard migration
- Dashboard recreation
- Analyst training
- Parallel operation validation

**Phase 4 (Weeks 7-8)**: Cutover
- Primary traffic to new platform
- LegacySIEM in read-only mode
- Decommission after 30-day validation

## Technical Concerns Raised

David asked about detection rule coverage: "We have some really custom LegacySIEM rules for our trading platform. Can the platform handle the same logic?"

Tom demonstrated query language capabilities and showed how their most complex rule could be replicated. David seemed satisfied but wants to see it work with their actual data.

Jennifer raised data retention concern: "Our compliance requires 7 years of searchable data. How does that work with your architecture?"

**DECISION**: Implement searchable snapshots for cold tier, enabling 7-year retention with on-demand search capability. Cost estimate requested.

## Integration Requirements

- **AWS CloudTrail** - Native integration available
- **SecurityVendorA** - Bidirectional integration via API
- **IdentityVendor** - Native integration for identity events
- **Custom apps** - Will need custom integrations for 3 internal apps

Jennifer noted: "The custom app integration is critical. Our trading platform generates 100GB/day of security events."

## Actions

- [ ] Tom: Provide searchable snapshot cost model by Jan 17
- [ ] Tom: Create query language conversion examples for top 10 LegacySIEM rules by Jan 18
- [ ] Rachel: Prepare POC environment with AWS integration by Jan 20
- [ ] Jennifer: Export sample data set (1 week) for POC by Jan 18
- [ ] David: Document top 20 detection rules for conversion testing by Jan 17

## Risks Identified

- **Custom app integration** - 100GB/day trading platform data needs custom work
- **query language learning curve** - Team is LegacySIEM SPL proficient, will need training
- **Timeline aggressive** - 8-week migration may be optimistic given complexity

## Next Steps

POC kickoff scheduled for January 20th. Success criteria to be finalized by January 18th.
