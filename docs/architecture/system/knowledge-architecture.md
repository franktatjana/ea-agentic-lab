---
order: 3
---

# Knowledge Architecture: Three-Vault Model

*All examples, companies, scenarios, and data in this project are hypothetical.*

The system produces and organizes knowledge in three distinct vaults, separated by audience and scope. Each vault has different access rules, content standards, and lifecycle.

## 1. Customer InfoHub (per account, shareable)

The engagement's lasting artifact. What you hand to the customer.

**Contains:** Solution architecture, architecture decision records (ADRs), use case documentation, learning paths, POC guidelines and plans, external meeting summaries, value delivered, professional services assets. Content is either collected from existing assets or created specifically for this customer.

**Does NOT contain:** Commercial information (pricing, deal terms, discounts), intermediary decisions (internal deliberations before a final decision), competitive intelligence, vendor strategy, internal meeting notes, agent scratchpads.

**Lifecycle:** Lives beyond the engagement. The customer keeps this as their solution knowledge base. Updated during post-sales for adoption, optimization, and expansion.

**Owner:** Solutions Architect (pre-sales), Customer Success Manager (post-sales).

## 2. Internal Account Hub (per account, vendor-only)

What the account team needs to execute. The operational workspace.

**Contains:** Competitive intelligence, deal reviews, internal meeting notes, candid risk assessments, pricing strategy, stakeholder mapping with internal notes, agent work products, governance health scores, escalation history.

**Does NOT contain:** Anonymized patterns (those belong in the Global Vault). Content here is account-specific and identifiable.

**Lifecycle:** Active during engagement. Archives when the engagement closes or the account transitions. Key learnings flow to the Global Vault after anonymization.

**Owner:** Account Executive (pre-sales), Customer Success Manager (post-sales).

## 3. Global Knowledge Vault (cross-account, vendor-only)

What the company learns. Institutional memory that makes every future engagement better.

**Contains:** Anonymized best practices, winning engagement patterns, evolved evaluation criteria, tribal knowledge captured from experienced team members, cross-domain learnings, win/loss correlation data.

**Does NOT contain:** Customer-identifiable information, account-specific details, commercial terms from specific deals.

**Lifecycle:** Permanent. Grows with every engagement. Feeds back into blueprints, playbooks, and evaluation criteria.

**Owner:** Curator agents (automated), validated by domain specialists.

## Data Flow

[image: Knowledge Data Flow - engagement data flowing into three vaults with audience-based separation]

```
Engagement
    ├──→ Customer InfoHub     (solution knowledge → customer keeps)
    └──→ Internal Account Hub (operational knowledge → vendor keeps)
                └──→ Global Knowledge Vault (anonymized patterns → company learns)
```

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into company-level knowledge. The Customer InfoHub is a separate output stream, never derived from internal content.

## Current Repo Mapping

| Vault | Location | Contents |
|-------|----------|----------|
| External InfoHub | `vault/{realm}/{node}/external-infohub/` | Architecture, decisions, value, journey |
| Internal InfoHub | `vault/{realm}/{node}/internal-infohub/` | Stakeholders, competitive, risks, frameworks |
| Raw Inputs | `vault/{realm}/{node}/raw/` | Meeting notes, daily ops, field data |
| Intelligence | `vault/{realm}/intelligence/` | Tech signal maps, market analysis (realm-level) |
| Global Knowledge Vault | `vault/knowledge/` | Anonymized best practices |
