---
date: 2026-01-08
type: external_meeting
meeting_type: discovery
attendees:
  - name: Sarah Chen
    role: CTO
    company: ACME Corp
  - name: Marcus Weber
    role: VP Engineering
    company: ACME Corp
  - name: Tom Rodriguez
    role: Solutions Architect
    company: "TechVendor Inc"
  - name: Lisa Park
    role: Account Executive
    company: "TechVendor Inc"
tags:
  - client/ACME_CORP
  - person/sarah_chen
  - person/marcus_weber
  - tech/legacysiem
  - tech/data-platform
  - competitor/legacysiem
  - stage/discovery
---

# ACME Corp Discovery Call - Security Consolidation Initiative

## Summary

Initial discovery call with ACME Corp leadership to understand their security consolidation initiative. They are currently running LegacySIEM for SIEM but facing significant cost and scalability challenges. Sarah Chen (CTO) is the executive sponsor, Marcus Weber (VP Engineering) is the technical champion.

## Key Business Drivers

1. **Cost Reduction** - Current LegacySIEM deployment costs $1.2M/year and is projected to grow 40% with data volume increases
2. **Consolidation** - Running 4 separate security tools, want to reduce to 2
3. **Cloud Migration** - Moving from on-prem to AWS, need cloud-native security
4. **Compliance** - SOC2 Type 2 audit coming in Q3, need better audit trails

## Current Environment

- **SIEM**: LegacySIEM Enterprise (on-prem), 500GB/day ingestion
- **EDR**: SecurityVendorA Falcon
- **Vulnerability**: Qualys
- **Cloud Security**: Prisma Cloud (evaluating)
- **Team**: 8 security analysts, 3 security engineers

Marcus mentioned they've been evaluating alternatives for 6 months. They looked at CloudSIEM but found it too Azure-centric. They also evaluated LegacySIEM3 but performance wasn't acceptable.

## Technical Requirements Discussed

Sarah emphasized these must-haves:
- Sub-second search on 90 days of hot data
- Native AWS integration
- MITRE ATT&CK mapping out of the box
- Custom detection rule authoring
- API-first architecture for automation

Marcus raised concerns about migration complexity: "Our biggest fear is the migration. We have 200+ LegacySIEM dashboards and 150 detection rules. How do we migrate without losing visibility?"

## Decision

**DECISION**: ACME will proceed with a 4-week technical evaluation starting January 20th. They want to see:
1. Migration path demo
2. Detection rule parity analysis
3. Cost modeling for 3-year projection
4. Reference call with similar-sized customer

Sarah confirmed budget is approved for FY26 if evaluation is successful. Target close is end of Q1.

## Competitive Landscape

- LegacySIEM incumbent, relationship is strained due to aggressive pricing
- CloudSIEM was evaluated and rejected
- No other active evaluations currently
- NetworkSecVendor reached out but ACME hasn't responded

## Actions

- [ ] Tom: Prepare migration assessment framework by Jan 10
- [ ] Tom: Schedule reference call with FinServ customer (similar size) by Jan 12
- [ ] Lisa: Send 3-year cost projection model by Jan 11
- [ ] Marcus: Provide export of current LegacySIEM rules for analysis by Jan 15

## Risks Identified

- **Migration complexity** is the primary technical blocker - need to address proactively
- **Timeline pressure** - Q3 audit means they need to be operational by June
- **LegacySIEM counter-offer** likely - they'll try to retain with discounting

## Next Steps

Technical deep-dive scheduled for January 15th with Marcus's team.
