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

## Knowledge Q&A Service

Agents declare knowledge as scope (domains and archetypes) combined with reference file paths. The platform provides a Q&A service that retrieves and synthesizes relevant knowledge contextually during workflow execution, similar to a corporate RAG system.

Each agent definition declares what it reasons about, not when to load specific files. The platform uses the agent's scope and the current workflow step context to formulate retrieval queries against the reference corpus.

### Retrieval Modes

The knowledge enricher (`platform/knowledge/knowledge_enricher.py`) supports three retrieval modes, each building on the previous:

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Metadata match** | Agent scope + step context | Match domain tags and descriptions to find relevant references. Baseline mode, always available |
| **Q&A retrieval** | Step intent + agent scope | Platform formulates step-specific questions, retrieves and synthesizes answers from reference corpus. Returns contextual knowledge, not raw files |
| **Proactive push** | Engagement context changes | Platform monitors engagement signals and surfaces relevant knowledge before the agent requests it. Subscription-based delivery |

### Agent Knowledge Declaration

```yaml
knowledge:
  scope:
    domains: [signal-detection, risk-assessment]
    archetypes: [enterprise, regulated-industries]
  references:
    - path: references/signal-detection.yaml
      description: "Commercial risk keywords, severity indicators"
    - path: references/risk-classification.yaml
      description: "Severity definitions and escalation criteria"
```

The `scope.domains` field tells the platform which knowledge domains this agent reasons within. The `scope.archetypes` field narrows retrieval to customer contexts the agent applies to. References provide the corpus, with `description` serving as the search index entry.

See [DDR-022](../../decisions/DDR_022_knowledge_qa_service_evolution.md) for the full decision record.

## Current Repo Mapping

| Vault | Location | Contents |
|-------|----------|----------|
| External InfoHub | `vault/{realm}/{node}/external-infohub/` | Architecture, decisions, value, journey |
| Internal InfoHub | `vault/{realm}/{node}/internal-infohub/` | Stakeholders, competitive, risks, frameworks |
| Raw Inputs | `vault/{realm}/{node}/raw/` | Meeting notes, daily ops, field data |
| Intelligence | `vault/{realm}/intelligence/` | Tech signal maps, market analysis (realm-level) |
| Global Knowledge Vault | `vault/knowledge/` | Anonymized best practices |
