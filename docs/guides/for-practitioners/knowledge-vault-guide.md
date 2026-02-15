---
title: "Knowledge Vault Guide"
order: 1
description: "Practitioner guide for using the three-vault knowledge system day-to-day"
category: "guide"
keywords: ["vault", "knowledge", "infohub", "practitioner", "guide", "how-to"]
last_updated: "2026-02-10"
---

# Knowledge Vault Guide

This guide explains how to use the EA Agentic Lab's knowledge vault system in your daily work. It covers where to store content, how to name files, when to create or archive artifacts, and how to find what you need. If you need to understand the architecture behind the vault, see [Knowledge Vault Architecture](../../architecture/system/knowledge-vault-architecture.md).

## Where to Store What

The vault uses a three-part separation based on audience. Choosing the right vault is the most important decision you make when creating content, because it determines who can see it.

### Decision Tree

Use this decision tree to determine the correct vault for any piece of content.

```text
Is this content appropriate for the customer to see?
├── YES → External InfoHub (vault/{realm}/{node}/external-infohub/)
│         Solution docs, ADRs, value metrics, training materials
│
└── NO → Is this content specific to one account?
    ├── YES → Internal InfoHub (vault/{realm}/{node}/internal-infohub/)
    │         Risks, competitive intel, internal notes, agent work
    │
    └── NO → Is this an anonymized pattern or best practice?
        ├── YES → Global Knowledge Vault (vault/knowledge/)
        │         Lessons learned, winning patterns, evolved criteria
        │
        └── NO → Raw Ingestion Zone (vault/{realm}/{node}/raw/)
                  Unprocessed meeting notes, field observations
```

### Quick Reference

| Content Type | Vault | Path Pattern |
|-------------|-------|-------------|
| Solution architecture | External | `external-infohub/architecture/` |
| ADRs (customer-facing) | External | `external-infohub/architecture/adrs/` |
| POC results | External | `external-infohub/opportunities/` |
| Value tracker | External | `external-infohub/value/` |
| Training materials | External | `external-infohub/journey/training/` |
| Risk register | Internal | `internal-infohub/risks/` |
| Competitive battlecards | Internal | `internal-infohub/competitive/battlecards/` |
| Market intelligence digests | Internal | `internal-infohub/market_intelligence/` |
| Stakeholder profiles | Internal | `internal-infohub/stakeholders/` |
| SWOT analysis output | Internal | `internal-infohub/frameworks/swot/` |
| Health score | Internal | `internal-infohub/governance/` |
| Action tracker | Internal | `internal-infohub/actions/` |
| Agent scratchpads | Internal | `internal-infohub/agent_work/{agent_id}/` |
| Meeting notes (raw) | Raw | `raw/meetings/external/` or `raw/meetings/internal/` |
| Field notes | Raw | `raw/daily-ops/` |
| Best practices | Global | `vault/knowledge/best_practices/{domain}/` |

## Naming Conventions

Consistent naming is critical for both human navigation and agent processing. These conventions apply across all vaults.

### File and Directory Names

| Element | Convention | Example |
|---------|-----------|---------|
| Directories | `lowercase-kebab-case` | `external-infohub/`, `risk-history/` |
| Markdown files | `lowercase-kebab-case.md` | `solution-architecture.md` |
| YAML data files | `lowercase-kebab-case.yaml` | `risk-register.yaml` |
| Meeting notes | `YYYY-MM-DD-descriptor.md` | `2026-01-23-kickoff.md` |
| Playbook outputs | `PB_{number}_{name}_YYYYMMDD.md` | `PB_201_swot_20260116.md` |

### ID Formats

All structured artifacts use consistent ID formats so agents can query and link them.

| Artifact | Format | Example |
|----------|--------|---------|
| Risk | `RISK_{NNN}` or `UPPERCASE_DESCRIPTOR` | `RISK_012`, `CISO_BIAS` |
| Decision | `DEC_{NNN}` | `DEC_047` |
| Action | `ACT_{NNN}` | `ACT_123` |
| Meeting | `MTG_YYYY_MM_DD_NNN` | `MTG_2026_01_23_001` |
| Playbook | `PB_{NNN}` | `PB_201` |
| Signal | `SIG_{CATEGORY}_{NNN}` | `SIG_COMP_001` |

### Realm and Node IDs

Realms and Nodes use `UPPERCASE_SNAKE_CASE` to clearly distinguish them from regular directories.

- Realm: `ACME_CORP`, `GLOBEX`, `INITECH`
- Node: `SECURITY_CONSOLIDATION`, `OBSERVABILITY_RENEWAL`

## Creating a New Realm

A Realm represents a customer or account. Create one when you begin working with a new customer.

1. Create the realm directory: `vault/{REALM_ID}/`
2. Create `realm_profile.yaml` with account-level metadata (name, industry, tier, ARR, key contacts)
3. Create `intelligence/` for account-level signals (tech signal maps, market news)

```text
vault/NEW_CUSTOMER/
├── realm_profile.yaml
└── intelligence/
    ├── tech_signal_map/
    └── market_news/
```

## Creating a New Node

A Node represents a single engagement or initiative within a Realm. Create one when a new opportunity, POC, or initiative begins.

1. Create the node directory: `vault/{REALM}/{NODE_ID}/`
2. Create `node_profile.yaml` with initiative metadata
3. Create `blueprint.yaml` by selecting an archetype and track (see [Blueprint Catalog](../../reference/blueprint-catalog.md))
4. Initialize the three-vault structure from the template

```text
vault/{REALM}/{NODE}/
├── node_profile.yaml
├── blueprint.yaml
├── raw/
│   ├── meetings/
│   │   ├── external/
│   │   └── internal/
│   └── daily-ops/
├── external-infohub/
│   ├── overview.md
│   ├── context/
│   ├── architecture/
│   ├── decisions/
│   ├── opportunities/
│   ├── journey/
│   └── value/
└── internal-infohub/
    ├── risks/
    ├── stakeholders/
    ├── competitive/
    ├── market_intelligence/
    ├── governance/
    ├── frameworks/
    ├── actions/
    ├── decisions/
    └── agent_work/
```

Use the templates in `vault/_templates/node/` for the starter structure.

## Common Workflows

### Storing Meeting Notes

Meeting notes begin in the raw ingestion zone and are processed by the Meeting Notes Agent into structured artifacts.

1. Place the raw notes in `raw/meetings/external/` (customer meetings) or `raw/meetings/internal/` (team meetings)
2. Name the file: `YYYY-MM-DD-{descriptor}.md` (e.g., `2026-01-23-kickoff.md`)
3. The Meeting Notes Agent processes the raw input and extracts decisions, actions, and risks
4. Extracted items are routed to the correct vault by the governance agents

### Filing a Decision

Decisions are captured by the Decision Registrar agent and stored in the appropriate vault based on audience.

- Customer-appropriate decisions (what was decided and why) go to `external-infohub/decisions/`
- Full internal decisions (with candid context, alternatives, and internal rationale) go to `internal-infohub/decisions/`

Each decision requires: `decision_id`, `description`, `status`, `owner`, `date`, `context/rationale`.

### Updating the Risk Register

The Risk Radar agent maintains the risk register, but practitioners can also contribute directly.

1. Add or update risks in `internal-infohub/risks/risk-register.yaml`
2. Required fields: `risk_id`, `title`, `severity` (critical/high/medium/low), `status` (open/mitigated/closed), `owner`, `review_date`
3. Link risks to decisions and actions by ID
4. The Risk Radar agent validates completeness on each update

### Recording Framework Analysis

When a strategic playbook (SWOT, Three Horizons, Value Engineering, PESTLE) completes, its output goes to the internal hub.

1. Store outputs in `internal-infohub/frameworks/{framework}/`
2. Name the file with the playbook ID and date: `PB_201_swot_20260116.md`
3. The framework output is vendor-internal; any customer-appropriate summary goes separately to the external hub

## Finding and Retrieving Artifacts

### By Path

The vault is organized by function, so the directory structure itself serves as navigation. Use the [InfoHub paths reference](../../architecture/agents/agent-quick-reference.md) to find the right directory.

### By ID

All structured artifacts (risks, decisions, actions) have unique IDs. Search for an ID to find its record across the vault.

### By Agent

Each vault directory has a designated owner agent. To find a specific type of content, look in the directory owned by the relevant agent. See the ownership tables in the [External InfoHub Reference](../../reference/external-infohub-reference.md) and [Internal InfoHub Reference](../../reference/internal-infohub-reference.md).

## Global Knowledge Vault Curation

The Global Knowledge Vault (`vault/knowledge/`) uses a dual contributor model: both humans and agents contribute knowledge items. The **Knowledge Vault Curator** agent governs this vault, validating proposals and enforcing quality standards.

### How Items Enter the Vault

Two ingestion paths, both requiring human approval:

1. **Manual entry**: Practitioners add items directly through the Knowledge Vault UI (`/knowledge`), providing structured YAML frontmatter and markdown content
2. **Agent proposals**: Agents identify reusable patterns during engagements and emit `knowledge_proposal` signals. Proposed items land in `.proposals/` where the Knowledge Vault Curator validates schema compliance, anonymization completeness, and relevance metadata. Humans then review and approve via the UI

### Knowledge Vault Curator Responsibilities

The Knowledge Vault Curator is the dedicated governance agent for Vault 3. It handles proposal validation (schema, anonymization, relevance), confidence lifecycle management (`proposed` to `reviewed` to `validated`), duplicate and conflict detection across domains, and staleness monitoring of existing knowledge items.

This is distinct from the **InfoHub Curator**, which governs Vaults 1 and 2 (artifact lifecycle, semantic integrity, naming conventions). See [DDR-015: Curator Agent Specialization](../../decisions/DDR_015_curator_agent_specialization.md) for the decision rationale.

## Archival Rules

Content does not stay in the vault forever. These rules govern when artifacts are reviewed, deprecated, or archived.

### Staleness Thresholds

| Content Type | Stale After | Action |
|-------------|------------|--------|
| Meeting notes | 90 days | Auto-deprecate |
| Competitive intelligence | 60 days | Review for accuracy |
| Risk register entries | 7 days without update | Nudger reminder |
| Health scores | 7 days without update | Flag for review |
| Actions | 7 days unchanged | Nudger check-in |
| Decisions | Never auto-deprecate | Manual only (audit trail) |
| Architecture docs | 90 days | SA review |
| Agent scratchpads | 30 days after engagement close | Clear |

### Lifecycle States

All artifacts follow this lifecycle: **Active -> Stale -> Deprecated -> Archived**

- **Active**: current and maintained
- **Stale**: no update within the threshold period; flagged for review
- **Deprecated**: superseded by newer content; kept for reference
- **Archived**: engagement closed; content preserved but not actively maintained

## Related Documentation

- [Knowledge Vault Architecture](../../architecture/system/knowledge-vault-architecture.md): Design and security model
- [External InfoHub Reference](../../reference/external-infohub-reference.md): Customer hub reference
- [Internal InfoHub Reference](../../reference/internal-infohub-reference.md): Internal hub reference
- [Blueprint Catalog](../../reference/blueprint-catalog.md): Archetype and track reference
- [Documentation Principles](../../DOCUMENTATION_PRINCIPLES.md): Writing standards
