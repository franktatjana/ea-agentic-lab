---
title: "Internal InfoHub Lifecycle"
order: 2
description: "Day-to-day guide for managing vendor-internal InfoHub content, from creation to archival"
category: "guide"
keywords: ["internal", "infohub", "lifecycle", "content", "vendor", "archival"]
last_updated: "2026-02-10"
---

# Internal InfoHub Lifecycle

This guide covers the practical day-to-day management of Internal InfoHub content. It explains when content is created, how it is maintained, what quality standards apply, and how archival and knowledge extraction work. For what belongs in the Internal InfoHub and its directory structure, see the [Internal InfoHub Reference](../../reference/internal-infohub-reference.md).

## Content Creation

Internal InfoHub content is created continuously throughout the engagement by agents, playbooks, and practitioners. Most content is structured YAML data maintained by governance agents, with markdown used for narrative context.

### Agent-Driven Creation

Governance agents create and maintain the core operational artifacts automatically. Each agent writes to its designated directory and maintains data integrity.

| Agent | Creates | Directory | Format |
|-------|---------|-----------|--------|
| Risk Radar | Risk register, assessments | `risks/` | YAML |
| Task Shepherd | Action tracker | `actions/` | YAML |
| Decision Registrar | Decision log | `decisions/` | YAML |
| Nudger | Escalation records | `governance/escalation-history/` | YAML |
| Reporter | Weekly digests | `governance/` | Markdown |
| CI Agent | Competitive landscape, battlecards | `competitive/` | Markdown |
| AE Agent | Stakeholder profiles | `stakeholders/` | YAML |

### Playbook-Driven Creation

Strategic playbooks produce framework analysis outputs that land in the Internal InfoHub. These are the analytical work products that inform strategy but are too candid for customer consumption.

| Playbook | Output | Directory |
|----------|--------|-----------|
| PB_201 SWOT Analysis | SWOT output | `frameworks/swot/` |
| PB_001 Three Horizons | Horizons analysis | `frameworks/three-horizons/` |
| PB_301 Value Engineering | Value model (internal) | `frameworks/value-engineering/` |
| PB_202 PESTLE Analysis | PESTLE output | `frameworks/pestle/` |
| PB_701 Competitive Analysis | Competitive positioning | `competitive/` |
| PB_102 Sizing Estimation | Internal sizing notes | `governance/` |

### Manual Contribution

Practitioners can contribute directly to the Internal InfoHub, particularly for stakeholder notes, competitive observations, and field intelligence. Manual contributions must include proper metadata and follow the YAML-first principle for queryable data.

## Vendor-Only Content Rules

The Internal InfoHub exists because some knowledge is essential for execution but inappropriate for customer sharing. These rules define the boundary.

### What Makes Content Vendor-Only

Content is vendor-only when it includes any of the following:

- **Candid assessments**: honest evaluations that could damage the customer relationship if shared (e.g., "CISO is biased toward incumbent")
- **Commercial strategy**: pricing models, discount logic, competitive positioning
- **Internal deliberations**: the reasoning process before a decision, including alternatives rejected
- **Agent analysis**: in-progress work products, hypothesis testing, scratchpad notes
- **Competitive intelligence**: competitor weaknesses, displacement strategies, win/loss patterns
- **Health metrics**: governance scores that reflect vendor-internal assessment of the engagement

### The "Newspaper Test"

If a piece of content would be embarrassing or damaging if the customer saw it, it belongs in the Internal InfoHub. If it would also be embarrassing if your VP saw it, it needs better professional tone, but it still belongs here. Candor is expected; unprofessionalism is not.

## Data Quality Standards

Internal InfoHub data feeds agent decision-making. Poor data quality degrades agent recommendations and governance enforcement.

### Required Fields by Artifact Type

Risks, actions, and decisions must meet minimum field requirements or the Task Shepherd and Risk Radar agents will flag them as incomplete.

**Risks:**
- `risk_id`, `title`, `severity` (critical/high/medium/low), `status` (open/mitigated/closed/accepted), `owner`, `identified_date`, `review_date`

**Actions:**
- `action_id`, `title`, `assignee` (specific person, not "team"), `status` (pending/in_progress/blocked/completed), `due_date` (ISO format), `source` (meeting ID or playbook ID)

**Decisions:**
- `decision_id`, `description`, `status` (proposed/confirmed/implemented/reverted/superseded), `owner`, `date`, `context/rationale`

### Staleness Monitoring

The InfoHub Curator and Nudger agents monitor content freshness. When content exceeds its staleness threshold, the owning agent or practitioner is notified.

| Content Type | Stale After | Monitoring Agent |
|-------------|------------|-----------------|
| Risk register | 7 days without update | Risk Radar, Nudger |
| Health scores | 7 days | InfoHub Curator |
| Action tracker | 7 days unchanged | Nudger |
| Competitive intel | 60 days | InfoHub Curator |
| Framework outputs | 90 days | InfoHub Curator |
| Agent scratchpads | 30 days post-close | InfoHub Curator |
| Stakeholder profiles | 30 days | InfoHub Curator |

## Engagement Close Process

When an engagement closes (won or lost), the Internal InfoHub transitions from active to archived. This process preserves the operational record and extracts reusable knowledge.

### Archival Steps

1. **Final state capture**: ensure the risk register, action tracker, and decision log are current
2. **Close open items**: mark remaining open actions as cancelled or transferred; close open risks
3. **Final health score**: record the closing health score and engagement outcome
4. **Knowledge extraction**: identify learnings worth promoting to the Global Knowledge Vault
5. **Archive marker**: update `node_profile.yaml` with `status: archived` and `closed_date`
6. **Scratchpad cleanup**: agent scratchpads are cleared 30 days after close

### Knowledge Extraction

Key learnings from the Internal InfoHub can be promoted to the Global Knowledge Vault at `vault/knowledge/`. This is the mechanism by which individual engagement experience becomes institutional knowledge.

The extraction process:

1. Identify patterns, best practices, or lessons learned worth preserving
2. Anonymize all customer-identifiable information (names, company details, deal terms)
3. Generalize the learning: convert account-specific insight into reusable guidance
4. Store in the appropriate Global Knowledge Vault directory (`best_practices/`, `lessons_learned/`, `patterns/`)
5. Link back to the archetype and domain for discoverability

The Retrospective Agent automates much of this process for closed deals that meet the retrospective threshold.

## Quality Checklist

Use this checklist for periodic audits of the Internal InfoHub. Governance agents handle routine checks, but manual review catches strategic gaps.

- [ ] Risk register is current (no entries older than review_date without update)
- [ ] All actions have a single owner (not "team" or "TBD") and a calendar due date
- [ ] Health score reflects actual engagement state
- [ ] Competitive intel is current (not older than 60 days)
- [ ] No customer-facing content has been accidentally placed here
- [ ] Framework outputs are linked to the playbook that produced them
- [ ] Agent scratchpads are organized by agent_id
- [ ] All YAML files parse without errors
- [ ] IDs are unique and follow the standard format

## Related Documentation

- [Internal InfoHub Reference](../../reference/internal-infohub-reference.md): What belongs and directory structure
- [Knowledge Vault Guide](knowledge-vault-guide.md): Overall vault usage
- [Knowledge Vault Architecture](../../architecture/system/knowledge-vault-architecture.md): Design and security model
- [Documentation Principles](../../DOCUMENTATION_PRINCIPLES.md): Writing standards
