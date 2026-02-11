---
order: 5
---

# Realm Profile Guide

The Realm Profile is the strategic account plan for a customer organization, capturing all account-level intelligence, strategy, and governance configuration.

## What is a Realm?

A **Realm** represents a company or organization that contains multiple Nodes (initiatives, opportunities, projects). It's the account-level container in the EA Agentic Lab hierarchy:

```text
Blueprint (Governance Model)
    └── Realm (Company/Account)
            └── Node (Initiative/Opportunity)
                    └── InfoHub (Artifacts)
```

## Realm Profile Purpose

The Realm Profile serves as:

1. **Strategic Account Plan** - Comprehensive view of the account
2. **Relationship Map** - Key stakeholders and engagement strategy
3. **Growth Strategy** - Whitespace, expansion, and upsell opportunities
4. **Risk Register** - Account-level risks and mitigation
5. **Governance Configuration** - Account-specific governance overrides

## Profile Sections

### 1. Realm Identity & Classification

| Field | Description |
|-------|-------------|
| `realm_id` | Unique identifier (e.g., "ACME") |
| `realm_name` | Full company name |
| `type` | customer, partner, or internal |
| `tier` | strategic, enterprise, commercial, velocity |
| `segment` | Enterprise, mid-market, SMB |
| `region` | AMER, EMEA, APJ |

**Tier Criteria:**

| Tier | ARR Range | Characteristics |
|------|-----------|-----------------|
| Strategic | >$500K | High growth, reference potential, executive engagement |
| Enterprise | $100K-$500K | Established relationship, expansion opportunity |
| Commercial | $25K-$100K | Standard engagement model |
| Velocity | <$25K | Self-service, low-touch |

### 2. Company Profile

Captures business context for better strategic alignment:

- **Company overview** - Size, revenue, industry
- **Business description** - What they do, market position
- **Recent news** - Relevant developments
- **Strategic initiatives** - Their priorities we can align to

### 3. Relationship Overview

Tracks relationship health and history:

- **Relationship status** - New, Growing, Stable, At Risk, Churned
- **Relationship health** - Green, Yellow, Red
- **Customer sentiment** - NPS, survey feedback
- **Relationship history** - How we got here

### 4. Commercial Summary

Financial view of the account:

- **Current ARR** and product breakdown
- **Contract dates** and renewal timeline
- **Financial history** - YoY growth
- **Revenue potential** - TAM and penetration

### 5. Growth Strategy

Actionable growth planning:

- **Account objectives** - Short, medium, long-term goals
- **Growth levers** - Expansion, upsell, cross-sell
- **Whitespace analysis** - Departments, use cases, geographies

### 6. Stakeholder Map

Key relationships to manage:

| Role | What to Capture |
|------|-----------------|
| Executive Sponsor | Priorities, engagement cadence, relationship strength |
| Economic Buyer | Budget authority, procurement process |
| Champions | Internal influence, how we support them |
| Technical Evaluators | Sentiment, technical concerns |
| Detractors | Concerns, mitigation strategies |

### 7. Competitive Landscape

Understand the competitive context:

- **Primary competitors** - Who else is in the account
- **Differentiation** - How we win against each
- **Win/loss history** - Track record in this account
- **Displacement strategy** - How to replace competitors

### 8. SWOT Analysis

Standard SWOT for the account relationship:

- **Strengths** - Where we're strong
- **Weaknesses** - Where we're vulnerable
- **Opportunities** - Where we can grow
- **Threats** - What could go wrong

### 9. Risk Assessment

Account-level risk tracking:

- **Risk categories** - Churn, Competitive, Relationship, Technical, Commercial
- **Churn indicators** - Early warning signals
- **Mitigation plans** - How to address each risk

### 10. Active Nodes

Current initiatives within this Realm:

- Node ID and name
- Status (Planning, Active, On-Hold, Completed)
- Operating mode (Pre-sales, Implementation, Post-sales, Renewal)
- ARR contribution
- Health status

### 11. Governance

Account-specific governance configuration:

- **Operating cadence** - Meeting frequencies
- **Governance overrides** - Account-specific rules
- **Key dates** - QBR, renewal review

### 12. Action Plan

Current priorities and near-term actions:

- **Current priorities** - Focus areas with owners
- **Next 30 days** - Immediate actions
- **Next 90 days** - Near-term plan

### 13. Success Metrics

How we measure account success:

- **Health score** - Overall and components
- **KPIs** - Specific metrics tracked

## Agent Interactions

### AE Agent (Primary Owner)

- Creates and maintains Realm Profile
- Updates commercial, relationship, stakeholder sections
- Owns growth strategy and action plan
- Triggers profile review cadence

### SA Agent

- Contributes to technical sections
- Updates competitive technical positioning
- Maintains SWOT technical elements

### CA Agent (Post-Sales)

- Updates adoption and usage metrics
- Maintains health score
- Contributes to risk assessment

### VE Agent

- Updates value tracking
- Contributes to growth strategy with value justification

## Profile Lifecycle

1. **Creation** - When account reaches tier threshold or becomes strategic
2. **Initial Population** - AE completes key sections within 30 days
3. **Regular Updates** - Monthly review, quarterly deep refresh
4. **QBR Prep** - Update before each Quarterly Business Review
5. **Annual Review** - Comprehensive strategy refresh annually

## Review Cadence

| Tier | Review Frequency | Deep Refresh |
|------|------------------|--------------|
| Strategic | Weekly touch, Monthly review | Quarterly |
| Enterprise | Bi-weekly touch, Monthly review | Quarterly |
| Commercial | Monthly review | Semi-annually |

## Template

The full template is available at: `playbooks/templates/realm_profile_template.yaml`

## Example

See the ACME example: `examples/ACME/realm_profile.yaml`

## Related Documentation

- [Core Entities](../architecture/system/core-entities.md) - Realm/Node definitions
- Account data is organized per-realm under `vault/{realm}/{node}/` with `external-infohub/` and `internal-infohub/` subdirectories
- [AE Agent Tasks](../../domain/agents/account_executives/prompts/tasks.yaml) - Account planning tasks

## Sources

Best practices incorporated from:

- [Strategic Account Planning Guide](https://arpedio.com/account-management/strategic-account-planning/)
- [Account Planning Templates](https://www.demandfarm.com/blog/strategic-account-planning-templates/)
- Industry enterprise account planning methodologies
