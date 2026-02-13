---
date: 2025-09-15
type: external_meeting
meeting_type: discovery
attendees:
  - name: Thomas Richter
    role: VP Data & Analytics
    company: ACME Corp
  - name: Dr. Sarah Chen
    role: Head of Engineering
    company: ACME Corp
  - name: Alex Thompson
    role: Account Executive
    company: "Vendor"
  - name: Maria Santos
    role: Solutions Architect
    company: "Vendor"
tags:
  - client/ACME_CORP
  - person/thomas_richter
  - person/sarah_chen
  - tech/tableau
  - tech/power-bi
  - stage/discovery
  - domain/analytics
---

# ACME Corp Discovery Call - Data Analytics Consolidation

## Summary

Initial discovery call with ACME leadership to understand their data analytics consolidation initiative. Thomas Richter (VP Data & Analytics) is the executive sponsor and primary driver. He described a fragmented analytics landscape causing productivity loss and excessive licensing costs. Dr. Sarah Chen (Head of Engineering) attended as a supporting stakeholder given the existing platform relationship.

## Key Business Drivers

1. **Tool Sprawl** - Running 4 separate analytics platforms (Tableau, Power BI, Python/Jupyter, Crystal Reports), $475K annual spend
2. **Productivity Loss** - Analytics team spends 40% of time context-switching between tools
3. **Data Silos** - Each tool has its own data connections, no unified view
4. **Self-Service Gap** - 45 dashboard requests per month backlog, business users can't self-serve
5. **Legacy Retirement** - Crystal Reports reaching end-of-life, must migrate

## Current Environment

- **Primary BI**: Tableau Server (200 users, 200+ dashboards, $180K/yr)
- **Secondary BI**: Power BI Premium (120 users, $95K/yr)
- **Data Engineering**: Custom Python/Jupyter notebooks (30 users, $50K/yr)
- **Legacy**: Crystal Reports (50 users, $45K/yr)
- **Data Warehouse**: AWS Redshift
- **Streaming**: Kafka
- **Data Lake**: S3
- **ETL**: Apache Airflow (batch, 4-hour refresh)
- **Team**: 25 data analysts, 8 data engineers

Thomas described the situation clearly: "We're drowning in tools. My team spends more time switching between platforms than actually analyzing data. I need one platform that does it all."

## Technical Requirements Discussed

Thomas outlined these must-haves:
- Unified dashboarding + data engineering in one platform
- Real-time data ingestion (Kafka streaming, not 4-hour batch)
- Self-service analytics for non-technical business users
- Native AWS integration (Redshift, S3)
- Tableau dashboard migration path
- Sub-5-second dashboard load times

## Budget & Timeline

- **Budget**: $500K approved for FY2026 analytics modernization
- **Decision Timeline**: Q1 2026
- **Deployment Target**: H1 2026
- **Approach**: POC-first evaluation

## Competitive Landscape

- Tableau is incumbent but relationship is weakening (cost frustration)
- Power BI retained only because of M365 bundle
- No active competitive evaluations (we are first)
- Thomas mentioned he's aware of Databricks and Snowflake but hasn't engaged them

## Decision

**DECISION**: Thomas will proceed with a 5-week POC after technical deep-dive. He wants to see:
1. Real-time data ingestion from Redshift + Kafka + S3
2. Self-service dashboarding demonstration
3. Tableau migration path assessment
4. Performance benchmarks on 100M+ row datasets

## Actions

- [ ] Maria: Schedule technical deep-dive for early October
- [ ] Alex: Prepare TCO analysis vs. current $475K spend
- [ ] Maria: Provision POC environment
- [ ] Thomas: Provide sample Tableau dashboards for migration assessment

## Risks Identified

- **Single champion**: Thomas is the only executive driving this; Dr. Chen is supportive but analytics isn't her primary focus
- **Migration complexity**: 200+ Tableau dashboards need assessment
- **User adoption**: 350 users on established tools

## Next Steps

Technical deep-dive scheduled for October 8th with Thomas and Lars Becker (Analytics Team Lead).
