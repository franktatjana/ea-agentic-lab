---
title: "Vault Architecture"
order: 2
description: "Three-vault knowledge separation model: structure, schema, directory layout, naming conventions, and access patterns"
category: "architecture"
keywords: ["vault", "infohub", "knowledge", "three-vault", "security", "naming", "schema"]
last_updated: "2026-03-12"
---

# Vault Architecture

Enterprise engagements produce knowledge at different levels of sensitivity and audience. A single container for all content creates a security risk: sharing competitive intelligence with a customer, or failing to share solution documentation they should have. The three-vault model solves this by structurally separating content by audience, using directory boundaries rather than metadata tags. If content is in the wrong directory, it is in the wrong vault.

This document defines the structure: what the vaults are, what lives where, how they are named, and how agents and humans access them. For how knowledge moves through these vaults over time, see [Knowledge Lifecycle](./knowledge-lifecycle.md). For day-to-day usage, see the [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md). For the decision rationale, see [DDR-001](../../decisions/DDR_001_three_vault_knowledge_architecture.md).

## Three-Vault Model

The system organizes knowledge into three vaults, each with a distinct audience, access rules, content standards, and lifecycle. The separation is structural (directory-based), not metadata-based, ensuring the security boundary cannot be bypassed by a missed tag.

```text
vault/
├── {REALM}/                          # Customer/account container
│   ├── realm_profile.yaml            # Account-level strategic data
│   ├── intelligence/                 # Realm-level intelligence (cross-node)
│   │   ├── technology_scout/          # Technology radar from job posting analysis
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

## Vault 1: Customer InfoHub (External)

The engagement's lasting artifact, handed to the customer as their solution knowledge base. Content here is either collected from existing assets or created specifically for this customer. This vault lives beyond the engagement: the customer keeps it for adoption, optimization, and expansion.

**Contains:** Solution architecture and design decisions (ADRs), use case documentation and learning paths, POC guidelines, plans, and success criteria, customer journey maps and engagement history, value delivery summaries and success metrics, professional services assets.

**Does NOT contain:** Commercial information (pricing, deal terms, discounts), intermediary decisions (internal deliberations before a final decision), competitive intelligence or vendor strategy, internal meeting notes, agent scratchpads, vendor-internal risk assessments.

**Owner:** Solutions Architect (pre-sales), Customer Success Manager (post-sales).

### Directory Structure

The following directories make up the External InfoHub. Each has a designated owner agent responsible for maintaining its content.

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

The operational workspace for the account team. Contains everything needed to execute the engagement, including content too sensitive or candid to share with the customer. This vault is active during the engagement and archives when the engagement closes or the account transitions.

**Contains:** Competitive intelligence and positioning, deal reviews and internal decision-making, internal meeting notes and candid risk assessments, pricing strategy and financial analysis, stakeholder mapping with internal notes on motivations and biases, agent work products and scratchpads, health scores and governance metrics, risk registers and escalation histories, internal frameworks (SWOT, Three Horizons, Value Engineering outputs).

**Does NOT contain:** Anonymized patterns (those belong in the Global Knowledge Vault), customer-identifiable best practices (anonymize first, then move to Global).

**Owner:** Account Executive (pre-sales), Customer Success Manager (post-sales).

### Directory Structure

The following directories make up the Internal Account Hub. Each has a designated owner agent responsible for maintaining its content.

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

Institutional memory that makes every future engagement better. Content here is anonymized and cross-account, representing patterns learned across all engagements. This vault is permanent: it grows with every engagement and feeds back into blueprints, playbooks, and evaluation criteria.

**Contains:** Anonymized best practices validated through real engagements, winning engagement patterns (what works for specific archetypes), evolved evaluation criteria refined by outcomes, tribal knowledge captured from experienced team members, cross-domain learnings, win/loss correlation data.

**Does NOT contain:** Customer-identifiable information, account-specific details, commercial terms from specific deals.

**Owner:** Dual contributor model. Humans and agents both contribute knowledge items. The **Knowledge Vault Curator** agent governs Vault 3, validating proposals, enforcing schema compliance, and managing the confidence lifecycle. Humans retain final approval authority; nothing enters the vault without human review.

### Directory Structure

The Global Knowledge Vault is organized by the type of knowledge rather than by account. The `.proposals/` directory serves as the review queue for agent-proposed items awaiting human approval.

```text
vault/knowledge/
├── operations/                        # How the team works
│   ├── engagement-management/         # Process and methodology
│   ├── stakeholder-handling/          # Relationship practices
│   └── delivery-execution/            # Delivery and execution patterns
├── content/                           # How team works with customer
│   ├── security/                      # Security domain practices
│   ├── observability/                 # Observability domain practices
│   ├── search/                        # Search domain practices
│   ├── platform/                      # Platform domain practices
│   └── general/                       # Cross-domain content practices
├── external/                          # Outside knowledge sources
│   ├── industry/                      # Analyst reports, standards
│   └── research/                      # Published research, benchmarks
├── assets/                            # Reusable deliverables
│   ├── templates/                     # Document templates
│   └── references/                    # Reference materials
└── .proposals/                        # Agent-proposed items (review queue)
```

### Knowledge Item Schema

Each item in the Global Knowledge Vault is a YAML file with structured frontmatter followed by markdown content. The frontmatter fields are: `id`, `title`, `type`, `category`, `domain`, `archetype`, `phase`, `relevance`, `tags`, `confidence`, and `source`. These fields enable machine-queryable filtering at runtime, so agents can retrieve relevant knowledge by domain and archetype without reading every file.

### Confidence Levels

Items in the Global Knowledge Vault progress through a defined confidence lifecycle as they accumulate evidence and review.

| Level | Meaning |
|-------|---------|
| `proposed` | Agent-generated, awaiting human review |
| `reviewed` | Human-reviewed and approved |
| `validated` | Proven through multiple engagements |

### Knowledge Vault Curator

The Knowledge Vault Curator is the dedicated governance agent for Vault 3. Its responsibilities are distinct from the InfoHub Curator, which governs Vaults 1 and 2 (artifact lifecycle, semantic integrity, staleness detection). The Knowledge Vault Curator focuses exclusively on institutional knowledge quality, with the following responsibilities:

- Validate agent-proposed items in `.proposals/` for schema compliance, anonymization completeness, and relevance metadata accuracy
- Manage the confidence progression from `proposed` to `reviewed` to `validated`
- Detect duplicate or conflicting knowledge items across domains
- Flag knowledge items that lack sufficient engagement evidence

See [DDR-015: Curator Agent Specialization](../../decisions/DDR_015_curator_agent_specialization.md) for the decision rationale behind splitting InfoHub and Knowledge Vault governance.

## Raw Ingestion Zone

The `raw/` directory within each node is not a vault. It is an ingestion zone for unprocessed inputs. Meeting notes, field observations, and daily status updates land here before agents process them into structured artifacts in the appropriate vault.

Raw content is never shared with customers and never promoted directly to any vault. Agents read from `raw/`, extract structured data, and write outputs to the correct vault based on playbook `vault_routing` metadata.

| Directory | Content | Processing Agent |
|-----------|---------|-----------------|
| `raw/meetings/external/` | Customer meeting recordings and notes | Meeting Notes Agent |
| `raw/meetings/internal/` | Internal team meetings, deal reviews | Meeting Notes Agent |
| `raw/daily-ops/` | Field notes, status updates, ad-hoc observations | Various |

## Realm and Node Hierarchy

The vault uses a two-level hierarchy to organize engagement knowledge. Every piece of account-specific knowledge belongs to exactly one Realm and one Node. Understanding this hierarchy is essential for creating new vault structures and for agents to locate artifacts by path.

### Realm

A **Realm** is the top-level container for all knowledge about a customer. It holds account-level data (strategic profile, relationship history, commercial summary) and cross-node intelligence (technology signal maps, market analysis). Multiple engagements with the same customer all live under the same Realm.

- **Location:** `vault/{REALM}/`
- **ID format:** `UPPERCASE_SNAKE_CASE` (e.g., `ACME_CORP`, `GLOBEX`)
- **Key files:** `realm_profile.yaml`, `intelligence/`

### Node

A **Node** represents a single engagement, opportunity, or initiative within a Realm. Each Node contains its own blueprint instance, three-vault structure (External InfoHub, Internal InfoHub, raw zone), and lifecycle. Multiple Nodes can exist within a single Realm.

- **Location:** `vault/{REALM}/{NODE}/`
- **ID format:** `UPPERCASE_SNAKE_CASE` (e.g., `SECURITY_CONSOLIDATION`, `OBSERVABILITY_RENEWAL`)
- **Key files:** `node_profile.yaml`, `blueprint.yaml`, `external-infohub/`, `internal-infohub/`, `raw/`

## Naming Conventions

Consistent naming ensures both humans and agents can locate and process artifacts reliably. These conventions apply across all vaults and must be followed for agent tooling to function correctly.

| Element | Convention | Example |
|---------|-----------|---------|
| Realm ID | `UPPERCASE_SNAKE_CASE` | `ACME_CORP` |
| Node ID | `UPPERCASE_SNAKE_CASE` | `SECURITY_CONSOLIDATION` |
| Directories | `lowercase-kebab-case` | `external-infohub/`, `risk-history/` |
| Markdown files | `lowercase-kebab-case.md` | `solution-architecture.md` |
| YAML data files | `lowercase-kebab-case.yaml` | `risk-register.yaml` |
| Meeting notes | `YYYY-MM-DD-descriptor.md` | `2026-01-23-kickoff.md` |
| Playbook outputs | `PB_{number}_{name}_YYYYMMDD.md` | `PB_STR_004_swot_20260116.md` |
| Agent scratchpads | `scratchpad_{agent}_{date}_{topic}.yaml` | `scratchpad_sa_2026-01-22_analysis.yaml` |
| Risk IDs | `UPPERCASE_SNAKE_CASE` | `CISO_BIAS`, `TIMELINE_CRITICAL` |
| Decision IDs | `DEC_{NNN}` | `DEC_047` |
| Action IDs | `ACT_{NNN}` | `ACT_123` |

## Security Boundaries

The three-vault model enforces security through structural separation, not metadata tags. The key principle: if content is in the wrong directory, it is in the wrong vault. Metadata-based access control can be bypassed by a missed tag; directory-based separation cannot.

### Boundary Rules

The following rules must be respected at all times. They are enforced by playbook `vault_routing` metadata and validated by the InfoHub Curator agent.

- External InfoHub content is **never** derived from Internal InfoHub content
- Internal InfoHub content is **never** shared with customers without explicit sanitization
- Global Knowledge Vault content is **always** anonymized before storage
- Raw inputs are **never** promoted directly to any vault without agent processing

### Content Misclassification Mitigation

Playbook `vault_routing` metadata enforces correct placement by declaring output destinations explicitly and auditability. The InfoHub Curator agent validates naming conventions and detects orphaned or misplaced artifacts in Vaults 1 and 2. PB_ADM_004 (gap scan) validates that all required artifacts exist in the correct vault for the engagement's blueprint.

## Agent Knowledge Access

Agents declare knowledge as scope (domains and archetypes) combined with reference file paths. The platform provides a Q&A service that retrieves and synthesizes relevant knowledge contextually during workflow execution, similar to a corporate RAG system.

Each agent definition declares what it reasons about, not when to load specific files. The platform uses the agent's scope and the current workflow step context to formulate retrieval queries against the reference corpus.

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

See [DDR-022](../../decisions/DDR_022_knowledge_qa_service_evolution.md) for the full decision record on the Q&A service.

## Vault Mapping Summary

The following table summarizes the top-level vault locations and their contents in the repository.

| Vault | Location | Contents |
|-------|----------|----------|
| External InfoHub | `vault/{realm}/{node}/external-infohub/` | Architecture, decisions, value, journey |
| Internal InfoHub | `vault/{realm}/{node}/internal-infohub/` | Stakeholders, competitive, risks, frameworks |
| Raw Inputs | `vault/{realm}/{node}/raw/` | Meeting notes, daily ops, field data |
| Realm Intelligence | `vault/{realm}/intelligence/` | Tech signal maps, market analysis (realm-level) |
| Global Knowledge Vault | `vault/knowledge/` | Anonymized best practices |

## Related Documentation

- [Knowledge Lifecycle](./knowledge-lifecycle.md): How knowledge moves through the vault system
- [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md): Practitioner usage guide
- [DDR-001: Three-Vault Knowledge Architecture](../../decisions/DDR_001_three_vault_knowledge_architecture.md): Decision rationale
- [DDR-015: Curator Agent Specialization](../../decisions/DDR_015_curator_agent_specialization.md): Governance model
- [DDR-022: Knowledge Q&A Service](../../decisions/DDR_022_knowledge_qa_service_evolution.md): Retrieval model
- [External InfoHub Reference](../../reference/external-infohub-reference.md): Customer hub reference
- [Internal InfoHub Reference](../../reference/internal-infohub-reference.md): Internal hub reference
- [Core Entities](core-entities.md): Realm/Node hierarchy definitions
