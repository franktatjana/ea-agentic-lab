---
title: "Knowledge Vault Architecture"
order: 2
description: "Three-vault knowledge separation model with security boundaries, data flows, and artifact routing"
category: "architecture"
keywords: ["vault", "infohub", "knowledge", "three-vault", "security", "data-flow"]
last_updated: "2026-02-10"
---

# Knowledge Vault Architecture

Enterprise engagements produce knowledge at different levels of sensitivity and audience. A single container for all content creates a security risk: sharing competitive intelligence with a customer, or failing to share solution documentation they should have. The three-vault model solves this by structurally separating content by audience.

This document defines the architecture. For day-to-day usage, see the [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md). For the decision rationale, see [DDR-001](../../decisions/DDR_001_three_vault_knowledge_architecture.md).

## Three-Vault Model

The system organizes knowledge into three vaults, each with distinct audience, access rules, content standards, and lifecycle. The separation is structural (directory-based), not metadata-based, ensuring that the security boundary cannot be bypassed by a missed tag.

```text
vault/
├── {REALM}/                          # Customer/account container
│   ├── realm_profile.yaml            # Account-level strategic data
│   ├── intelligence/                 # Realm-level intelligence (cross-node)
│   │   ├── tech_signal_map/          # Technology radar from job posting analysis
│   │   └── market_news/              # MNA Agent realm-level news digests
│   │
│   └── {NODE}/                       # Individual initiative/opportunity
│       ├── node_profile.yaml
│       ├── blueprint.yaml
│       │
│       ├── raw/                      # Ingestion zone (unprocessed inputs)
│       │   ├── meetings/
│       │   │   ├── external/         # Customer meeting notes
│       │   │   └── internal/         # Internal team notes
│       │   └── daily-ops/            # Field notes, status updates
│       │
│       ├── external-infohub/         # VAULT 1: Customer-shareable
│       │   ├── context/
│       │   ├── architecture/
│       │   ├── decisions/
│       │   ├── opportunities/
│       │   ├── journey/
│       │   └── value/
│       │
│       └── internal-infohub/         # VAULT 2: Vendor-only
│           ├── risks/
│           ├── stakeholders/
│           ├── competitive/
│           ├── market_intelligence/  # MNA Agent node-level news digests
│           ├── governance/
│           ├── frameworks/
│           ├── actions/
│           └── agent_work/
│
└── knowledge/                        # VAULT 3: Global knowledge (cross-account)
    ├── best_practices/
    ├── lessons_learned/
    └── patterns/
```

## Vault 1: Customer InfoHub

The engagement's lasting artifact, handed to the customer as their solution knowledge base. Content here is either collected from existing assets or created specifically for this customer.

### Contains

Customer-facing content that demonstrates value and supports adoption. This includes solution architecture and design decisions (ADRs), use case documentation and learning paths, POC guidelines, plans, and success criteria, customer journey maps and engagement history, value delivery summaries and success metrics, and professional services assets.

### Does NOT Contain

- Commercial information (pricing, deal terms, discounts)
- Intermediary decisions (internal deliberations before a final decision)
- Competitive intelligence or vendor strategy
- Internal meeting notes or agent scratchpads
- Vendor-internal risk assessments

### Lifecycle

Lives beyond the engagement. The customer keeps this as their solution knowledge base. Updated during post-sales for adoption, optimization, and expansion.

### Ownership

Solutions Architect (pre-sales), Customer Success Manager (post-sales).

### Directory Structure

| Directory | Content | Owner Agent |
|-----------|---------|-------------|
| `context/` | Business and technical context, stakeholder map, engagement history | RFP Agent |
| `architecture/` | ADRs, solution design artifacts | SA Agent |
| `decisions/` | Decision outcomes and logic (customer-appropriate) | Decision Registrar |
| `opportunities/` | Initiatives, POCs, discovery findings, requirements | AE Agent |
| `journey/` | Customer journey maps, touchpoints | Delivery, PS, POC Agents |
| `value/` | Value tracker, ROI analysis, adoption metrics | VE Agent |

See [External InfoHub Reference](../../reference/external-infohub-reference.md) for detailed content rules and governance.

## Vault 2: Internal Account Hub

The operational workspace for the account team. Contains everything needed to execute the engagement, including content too sensitive or candid to share with the customer.

### Contains

Vendor-internal content supporting deal execution and governance. This includes competitive intelligence and positioning, deal reviews and internal decision-making, internal meeting notes and candid risk assessments, pricing strategy and financial analysis, stakeholder mapping with internal notes on motivations and biases, agent work products and scratchpads, health scores and governance metrics, risk registers and escalation histories, and internal frameworks (SWOT, Three Horizons, Value Engineering outputs).

### Does NOT Contain

- Anonymized patterns (those belong in the Global Knowledge Vault)
- Customer-identifiable best practices (anonymize first, then move to Global)

### Lifecycle

Active during engagement. Archives when the engagement closes or the account transitions. Key learnings flow to the Global Knowledge Vault after anonymization.

### Ownership

Account Executive (pre-sales), Customer Success Manager (post-sales).

### Directory Structure

| Directory | Content | Owner Agent |
|-----------|---------|-------------|
| `risks/` | Risk register, risk history | Risk Radar |
| `stakeholders/` | Individual stakeholder profiles with internal notes | AE Agent |
| `competitive/` | Competitive context, incumbent analysis | CI Agent |
| `market_intelligence/` | Node-level market and competitive news digests | MNA Agent |
| `governance/` | Health scores, operating cadence, alerts | Governance Agents |
| `frameworks/` | SWOT, Three Horizons, Value Engineering outputs | Strategic Playbooks |
| `actions/` | Action tracker, blocked items | Task Shepherd, Nudger |
| `agent_work/` | Scratchpads, in-progress analysis | All Agents |

See [Internal InfoHub Reference](../../reference/internal-infohub-reference.md) for detailed content rules and governance.

## Vault 3: Global Knowledge Vault

Institutional memory that makes every future engagement better. Content here is anonymized and cross-account, representing patterns learned across all engagements.

### Contains

Anonymized, reusable knowledge harvested from completed engagements. This includes best practices validated through real engagements, winning engagement patterns (what works for specific archetypes), evolved evaluation criteria refined by outcomes, tribal knowledge captured from experienced team members, cross-domain learnings, and win/loss correlation data.

### Does NOT Contain

- Customer-identifiable information
- Account-specific details
- Commercial terms from specific deals

### Lifecycle

Permanent. Grows with every engagement. Feeds back into blueprints, playbooks, and evaluation criteria.

### Ownership

Curator agents (automated extraction and anonymization), validated by domain specialists.

### Directory Structure

| Directory | Content |
|-----------|---------|
| `best_practices/{domain}/` | Validated best practices by domain (security, observability, search, platform) |
| `lessons_learned/` | Aggregated retrospective insights |
| `patterns/success_patterns/` | Anonymized success patterns |
| `patterns/risk_patterns/` | Common risk indicators |
| `patterns/competitive_patterns/` | Displacement patterns |

## Raw Ingestion Zone

The `raw/` directory within each node is not a vault, it is an ingestion zone for unprocessed inputs. Meeting notes, field observations, and daily status updates land here before agents process them into structured artifacts in the appropriate vault.

Raw content is never shared with customers and never promoted directly. Agents read from `raw/`, extract structured data, and write outputs to the correct vault based on playbook `vault_routing` metadata.

| Directory | Content | Processing Agent |
|-----------|---------|-----------------|
| `raw/meetings/external/` | Customer meeting recordings and notes | Meeting Notes Agent |
| `raw/meetings/internal/` | Internal team meetings, deal reviews | Meeting Notes Agent |
| `raw/daily-ops/` | Field notes, status updates, ad-hoc observations | Various |

## Realm and Node Hierarchy

The vault uses a two-level hierarchy to organize engagement knowledge. A Realm represents a customer or account, and a Node represents an individual initiative or opportunity within that account.

### Realm

A Realm is the top-level container for all knowledge about a customer. It holds account-level data (strategic profile, relationship history, commercial summary) and cross-node intelligence (technology signal maps, market analysis).

**Location:** `vault/{REALM}/`
**ID format:** `UPPERCASE_SNAKE_CASE` (e.g., `ACME_CORP`, `GLOBEX`)
**Key files:** `realm_profile.yaml`, `intelligence/`

### Node

A Node represents a single engagement, opportunity, or initiative within a Realm. Each Node contains its own blueprint instance, three-vault structure, and raw ingestion zone. Multiple Nodes can exist within a single Realm.

**Location:** `vault/{REALM}/{NODE}/`
**ID format:** `UPPERCASE_SNAKE_CASE` (e.g., `SECURITY_CONSOLIDATION`, `OBSERVABILITY_RENEWAL`)
**Key files:** `node_profile.yaml`, `blueprint.yaml`, `external-infohub/`, `internal-infohub/`, `raw/`

## Data Flow

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into company-level knowledge. The Customer InfoHub is a separate output stream, never derived from internal content.

```text
Raw Inputs (meetings, field notes)
    │
    ├──→ External InfoHub     (solution knowledge → customer keeps)
    │
    ├──→ Internal InfoHub     (operational knowledge → vendor keeps)
    │         │
    │         └──→ Global Knowledge Vault (anonymized patterns → company learns)
    │
    └──→ Realm Intelligence   (account-level signals, tech maps)
```

### Playbook Vault Routing

Playbooks declare `vault_routing` metadata that specifies where their outputs are written. This makes output destinations explicit and auditable.

| Playbook | Primary Vault | Secondary Vault |
|----------|---------------|-----------------|
| PB_102 Sizing Estimation | Internal InfoHub | External InfoHub (sanitized summary) |
| PB_103 Technical Validation | External InfoHub | Internal InfoHub (internal notes) |
| PB_104 Solution Description | External InfoHub | Internal InfoHub (architecture notes) |
| PB_404 Customer Guidelines | External InfoHub | - |
| PB_405 Training Plans | External InfoHub | - |
| PB_406 Adoption Guidance | External InfoHub | Internal InfoHub (candid assessment) |

## Security Boundaries

The three-vault model enforces security through structural separation, not metadata tags. The key principle: if content is in the wrong directory, it is in the wrong vault.

### Boundary Rules

- External InfoHub content is **never** derived from Internal InfoHub content
- Internal InfoHub content is **never** shared with customers without explicit sanitization
- Global Knowledge Vault content is **always** anonymized before storage
- Raw inputs are **never** promoted directly to any vault without agent processing

### Content Misclassification Mitigation

Playbook `vault_routing` metadata enforces correct placement. The Knowledge Curator agent validates naming conventions and detects orphaned or misplaced artifacts. PB_971 (gap scan) validates that all required artifacts exist in the correct vault for the engagement's blueprint.

## Naming Conventions

Consistent naming ensures both humans and agents can locate and process artifacts reliably.

| Element | Convention | Example |
|---------|-----------|---------|
| Realm ID | `UPPERCASE_SNAKE_CASE` | `ACME_CORP` |
| Node ID | `UPPERCASE_SNAKE_CASE` | `SECURITY_CONSOLIDATION` |
| File names | `lowercase-kebab-case` or `YYYY-MM-DD-descriptor` | `risk-register.yaml`, `2026-01-23-kickoff.md` |
| Playbook outputs | `PB_{number}_{name}_YYYYMMDD.md` | `PB_201_swot_20260116.md` |
| Agent scratchpads | `scratchpad_{agent}_{date}_{topic}.yaml` | `scratchpad_sa_2026-01-22_analysis.yaml` |
| Risk IDs | `UPPERCASE_SNAKE_CASE` | `CISO_BIAS`, `TIMELINE_CRITICAL` |
| Decision IDs | `DEC_{NNN}` | `DEC_047` |
| Action IDs | `ACT_{NNN}` | `ACT_123` |

## Related Documentation

- [DDR-001: Three-Vault Knowledge Architecture](../../decisions/DDR_001_three_vault_knowledge_architecture.md): Decision rationale
- [Knowledge Architecture](knowledge-architecture.md): Original specification
- [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md): Practitioner usage guide
- [External InfoHub Reference](../../reference/external-infohub-reference.md): Customer hub reference
- [Internal InfoHub Reference](../../reference/internal-infohub-reference.md): Internal hub reference
- [Core Entities](core-entities.md): Realm/Node hierarchy definitions
