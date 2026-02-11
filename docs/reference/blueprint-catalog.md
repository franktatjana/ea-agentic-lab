---
title: "Blueprint Catalog"
description: "Reference catalog of all archetypes, engagement tracks, domains, and blueprint composition"
category: "reference"
keywords: ["blueprint", "archetype", "track", "domain", "catalog", "engagement"]
last_updated: "2026-02-10"
---

# Blueprint Catalog

Blueprints define what playbooks, canvases, and validation rules apply to a specific engagement. Every Node in the vault has a blueprint instance that governs its execution. This catalog is the reference for all archetypes, tracks, and domains that compose a blueprint.

For how blueprints are created and instantiated, see the [Blueprints README](../../domain/blueprints/README.md). For playbook details, see the [Playbook Catalog](playbook-catalog.md).

## Composition Formula

An engagement is classified along three independent dimensions. The combination determines which playbooks are required, optional, or blocked, and what governance policies apply.

```text
Engagement = Archetype × Domain × Track

Archetype (engagement pattern, domain-agnostic)
│   e.g., "Competitive Displacement", "Greenfield Adoption"
│
├── Domain (specialist area, orthogonal)
│   e.g., Security, Search, Observability
│
└── Track (service tier, orthogonal)
    e.g., POC, Economy, Premium, Fast Track
```

**Archetype** determines the engagement pattern: which playbooks are needed and in what sequence. **Domain** adds specialist expertise and domain-specific playbooks. **Track** controls resource allocation, SLA, and governance depth based on deal size and urgency.

## Archetype Catalog

Eight archetypes cover the full range of enterprise engagement patterns. Each archetype defines signals for automatic classification, one or more reference blueprint variants, and typical duration and complexity.

### Competitive Displacement

Replacing an incumbent vendor. These engagements require strong competitive positioning and a clear displacement strategy to overcome switching costs and organizational inertia.

| Attribute | Value |
|-----------|-------|
| **Complexity** | High |
| **Duration** | ~12 weeks |
| **Signals** | `competitor_displacement`, `migration_timeline`, `multi_vendor_incumbent` |
| **Track constraints** | None (all tracks) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_basic | Standard Displacement | Single vendor replacement | PB_102, PB_201, PB_301 |
| A02_competitive | Competitive Displacement | Multi-vendor consolidation with competitive analysis | PB_102, PB_201, PB_701, PB_301 |

**Reference blueprint available:** [A02_competitive.yaml](../../domain/blueprints/reference/competitive_displacement/A02_competitive.yaml)

---

### Greenfield Adoption

New capability where no incumbent exists. Lower competitive pressure but requires building the business case from scratch and proving value without a displacement narrative.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Medium |
| **Duration** | ~8 weeks |
| **Signals** | `no_incumbent`, `new_capability`, `greenfield_initiative` |
| **Track constraints** | None (all tracks) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_basic | Standard Adoption | Standard new deployment | PB_102, PB_201 |
| A02_enterprise | Enterprise Adoption | Multi-team, multi-environment deployment | PB_102, PB_201, PB_001, PB_301, PB_401 |

---

### Platform Consolidation

Merging multiple tools into a unified platform. The most complex archetype, requiring executive sponsorship, cross-team coordination, and a comprehensive governance approach.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Very High |
| **Duration** | ~16 weeks |
| **Signals** | `platform_play`, `executive_sponsor`, `budget_consolidation`, `multi_tool_incumbent` |
| **Track constraints** | **Minimum track: Premium** |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_unified | Unified Platform | Single platform for multiple use cases | PB_102, PB_201, PB_701, PB_301, PB_001, PB_401 |

---

### Compliance-Driven

Implementation driven by regulatory deadline or audit finding. These engagements have hard external deadlines and risk-averse stakeholders who prioritize compliance over feature richness.

| Attribute | Value |
|-----------|-------|
| **Complexity** | High |
| **Duration** | ~10 weeks |
| **Signals** | `regulatory_deadline`, `audit_finding`, `risk_averse_culture` |
| **Track constraints** | None (all tracks) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_audit_response | Audit Response | Addressing specific audit findings | PB_102, PB_202, PB_201 |
| A02_regulatory | Regulatory Compliance | Meeting regulatory requirements | PB_102, PB_202, PB_201, PB_301 |

---

### Technical Evaluation

POC or validation with a decision pending. Fast-moving, technically focused engagements with a hard time limit. The goal is a clear go/no-go decision.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Low |
| **Duration** | ~4 weeks (hard limit) |
| **Signals** | `technical_evaluation`, `short_timeline`, `limited_stakeholders` |
| **Track constraints** | **Track override: POC** (forces POC track regardless of deal size) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_technical | Technical POC | Feature and capability validation | PB_101 |
| A02_comparative | Comparative POC | Side-by-side evaluation vs competitor | PB_101, PB_701 |

**Reference blueprint available:** [A02_comparative.yaml](../../domain/blueprints/reference/technical_evaluation/A02_comparative.yaml)

---

### Retention / Renewal

Protecting an existing relationship at risk. These engagements focus on rebuilding trust, re-establishing champion relationships, and demonstrating continued value before renewal.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Medium |
| **Duration** | ~6 weeks |
| **Signals** | `renewal_approaching`, `health_score_declining`, `champion_departed` |
| **Track constraints** | None (all tracks) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_health_recovery | Health Recovery | Address declining health metrics | PB_401, PB_102 |
| A02_champion_rebuild | Champion Rebuild | Re-establish stakeholder relationships | PB_102, PB_401, PB_301 |

**Reference blueprint available:** [A02_champion_rebuild.yaml](../../domain/blueprints/reference/retention_renewal/A02_champion_rebuild.yaml)

---

### Expansion

Growing within an account that already adopted. Leverages existing success to expand into adjacent use cases or additional teams and business units.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Medium |
| **Duration** | ~8 weeks |
| **Signals** | `adoption_success`, `new_use_case_identified`, `budget_cycle` |
| **Track constraints** | None (all tracks) |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_use_case | New Use Case | Expand to adjacent use case | PB_201, PB_001 |
| A02_enterprise | Enterprise Expansion | Scale to additional teams or business units | PB_102, PB_201, PB_001, PB_301 |

---

### Strategic Account

Enterprise-wide, multi-initiative, executive-level engagement. An ongoing governance model for the most important accounts, spanning multiple Nodes and requiring full playbook coverage.

| Attribute | Value |
|-----------|-------|
| **Complexity** | Very High |
| **Duration** | Ongoing |
| **Signals** | `tier_1_account`, `multi_node`, `executive_relationship` |
| **Track constraints** | **Minimum track: Premium** |

**Variants:**

| ID | Name | Description | Playbooks |
|----|------|-------------|-----------|
| A01_strategic | Strategic Account Governance | Full governance for strategic accounts | PB_102, PB_201, PB_701, PB_301, PB_001, PB_401 |

---

## Engagement Tracks

Tracks define the service tier overlay: SLA, resource allocation, playbook limits, and governance depth. Track selection is primarily driven by deal size, with overrides for specific engagement patterns.

### Track Comparison

| Attribute | POC | Economy | Premium | Fast Track |
|-----------|-----|---------|---------|------------|
| **Response SLA** | 48h | 72h | 24h | 4h |
| **Escalation threshold** | 5 days | 7 days | 3 days | 1 day |
| **SA allocation** | Shared | Pooled (5 max) | Dedicated (2 max) | Dedicated (highest priority) |
| **Max playbooks** | 3 | 5 | Unlimited | 8 |
| **Canvas depth** | Minimal, template-only | Template-based | Full custom | Accelerated |
| **Gap scan** | - | Weekly | Daily | Daily |
| **Health check** | - | Monthly | Weekly | - |
| **Duration limit** | 4 weeks | - | - | - |

### Track-Specific Playbook Policies

Each track defines which playbooks are required, optional, or blocked. These policies layer on top of the archetype's playbook list.

| Track | Required Playbooks | Blocked Playbooks |
|-------|-------------------|-------------------|
| **POC** | PB_101 | PB_301, PB_401 |
| **Economy** | PB_102, PB_201 | PB_701 |
| **Premium** | PB_102, PB_201, PB_301, PB_401 | None |
| **Fast Track** | PB_102, PB_201, PB_101 | None |

### Track Selection Rules

Track assignment follows deal size as the primary criterion, with overrides for specific patterns.

| Condition | Track | Notes |
|-----------|-------|-------|
| Deal size < $50K | Economy | Default for smaller deals |
| Deal size $50K-$250K | Premium | Standard enterprise engagement |
| Deal size >= $250K | Premium | Executive sponsor required flag set |
| Timeline <= 4 weeks AND technical evaluation | POC (override) | Forces POC regardless of deal size |
| Timeline <= 6 weeks AND urgency = critical | Fast Track (override) | Accelerated engagement |

### Track Transitions

Tracks can change during an engagement when conditions shift.

| Transition | Triggers | Approval |
|-----------|----------|----------|
| Economy -> Premium | Deal size increased >= $50K, executive sponsor added, complexity increased | Automatic |
| Premium -> Economy | Deal size decreased < $50K, customer request | Senior Manager approval required |

## Domains

Domains represent specialist technology areas applied orthogonally to archetypes. A domain adds domain-specific playbooks, specialist agent involvement, and evaluation checklists. The domain dimension is independent: any archetype can apply to any domain.

| Domain | Specialist Agent | Playbook Prefix | Focus Areas |
|--------|-----------------|-----------------|-------------|
| **Security** | `security_specialist` | `PB_SEC` | SIEM evaluation, threat detection, MITRE ATT&CK, SOC workflows, compliance |
| **Search** | `search_specialist` | `PB_SRCH` | Relevance tuning, vector search, RAG architecture, schema design, query performance |
| **Observability** | `observability_specialist` | `PB_OBS` | APM, SLO/SLI, distributed tracing, alerting strategy, log management |
| **Multi-Domain** | (multiple) | (multiple) | Spans 2+ specialist areas, requires cross-domain coordination |

## Reference Blueprints

Reference blueprints are reusable templates that define the full playbook, canvas, and validation configuration for a specific archetype variant. Three reference blueprints are currently implemented:

| Blueprint | Archetype | Variant | Owner | File |
|-----------|-----------|---------|-------|------|
| Competitive Displacement | `competitive_displacement` | A02_competitive | SA Team | [A02_competitive.yaml](../../domain/blueprints/reference/competitive_displacement/A02_competitive.yaml) |
| Champion Rebuild | `retention_renewal` | A02_champion_rebuild | CA Team | [A02_champion_rebuild.yaml](../../domain/blueprints/reference/retention_renewal/A02_champion_rebuild.yaml) |
| Comparative POC | `technical_evaluation` | A02_comparative | SA Team | [A02_comparative.yaml](../../domain/blueprints/reference/technical_evaluation/A02_comparative.yaml) |

Each reference blueprint specifies playbooks per track (all_tracks, economy, premium, poc), canvases per track, validation checklists, expected signals, success criteria, and timeline.

## Blueprint Instantiation

When a Node is created, a blueprint instance is generated from the reference blueprint and stored in the vault.

1. **Select archetype** based on engagement signals or manual classification
2. **Select domain** if a specialist area applies
3. **Select track** based on deal size or policy overrides
4. **Instantiate** from the matching reference blueprint variant
5. **Customize** for node-specific requirements
6. **Store** at `vault/{realm}/{node}/blueprint.yaml`

PB_971 (gap scan) validates that the blueprint instance is complete: all required playbooks executed, all canvases rendered, and success criteria met.

## Playbook Reference

The following playbooks are referenced across archetypes and tracks. For the complete catalog, see [Playbook Catalog](playbook-catalog.md).

| ID | Name | Owner | Used By |
|----|------|-------|---------|
| PB_001 | Three Horizons | AE Agent | Greenfield A02, Expansion, Platform Consolidation, Strategic Account |
| PB_101 | TOGAF ADM (Architecture) | SA Agent | Technical Evaluation, Fast Track |
| PB_102 | Stakeholder Mapping | AE Agent | All archetypes except Technical Evaluation A01 |
| PB_201 | SWOT Analysis | SA Agent | Most archetypes (discovery phase) |
| PB_202 | PESTLE Analysis | AE Agent | Compliance-Driven, optional for others |
| PB_301 | Value Engineering | AE Agent | Premium track, competitive/compliance/expansion archetypes |
| PB_401 | Customer Health Score | CA Agent | Premium track, retention, expansion, strategic account |
| PB_701 | Competitive Analysis (Five Forces) | CI Agent | Competitive Displacement A02, Technical Evaluation A02, Platform Consolidation, Strategic Account |

## Signal Patterns

Signals drive automatic archetype classification. Each signal has indicators (conditions to evaluate) and a weight (classification confidence contribution).

| Signal | Indicators | Weight |
|--------|-----------|--------|
| `competitor_displacement` | Incumbent vendor exists, migration timeline exists | 0.8 |
| `compliance_driver` | Regulatory requirements present, audit findings exist | 0.9 |
| `platform_play` | 3+ use cases, C-level executive sponsor | 0.7 |
| `health_score_declining` | Health score < 60, declining trend | 0.85 |
| `no_incumbent` | No incumbent vendor, manual or no current tooling | 0.9 |
| `adoption_success` | Health score >= 80, growing usage trend | 0.7 |
| `tier_1_account` | Tier 1 account classification, ARR >= strategic threshold | 0.9 |

## Related Documentation

- [Blueprints README](../../domain/blueprints/README.md): Schema and instantiation process
- [Archetypes Configuration](../../domain/catalogs/archetypes.yaml): Source definitions
- [Engagement Tracks](../../domain/mappings/engagement_tracks.yaml): Track policies
- [Playbook Catalog](playbook-catalog.md): Complete playbook reference
- [Agent Quick Reference](../architecture/agents/agent-quick-reference.md): Agent ownership and handovers
