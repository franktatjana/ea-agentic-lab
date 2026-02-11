# Terminology Model v3.0

## Classification Model

Engagements are classified across three independent dimensions. The combination of all three determines the blueprint, playbooks, and resources for each engagement.

```text
Engagement = Archetype × Domain × Track

Archetype (engagement pattern, domain-agnostic)
│   e.g., "Competitive Displacement", "Greenfield Adoption"
│
├── Domain (specialist area, orthogonal)
│   e.g., Security, Search, Observability, Multi-Domain
│
└── Track (service tier, orthogonal)
    e.g., POC, Economy, Premium, Fast Track
```

```text
Archetype × Domain → Reference Blueprint selection
│   e.g., Competitive Displacement × Security → A02_competitive
│
└── + Track → Blueprint Instance (scoped per Realm/Node)
    │   e.g., ACME/SEC_CONSOL/blueprint.yaml
    │
    └── Playbooks (executed)
            e.g., PB_102, PB_201, PB_701, PB_SEC_001
```

## Glossary

| Term | Definition | Location | Example |
|------|------------|----------|---------|
| **Vault** | Top-level curated asset store organized by realm and node, containing raw inputs, external infohub, internal infohub, and global knowledge base | [vault/](../../vault/) | `vault/ACME_CORP/`, `vault/knowledge/` |
| **Knowledge Base** | Best practices, patterns, and validated insights organized by domain. Populated by field experience, deal outcomes, and external intelligence | [vault/knowledge/](../../vault/knowledge/) | `vault/knowledge/security/`, `vault/knowledge/observability/` |
| **External InfoHub** | Customer-shareable engagement artifacts organized by Realm and Node. Every playbook output intended for the customer lands here with full provenance | `vault/{realm}/{node}/external-infohub/` | `vault/ACME_CORP/SECURITY_CONSOLIDATION/external-infohub/` |
| **Archetype** | Engagement pattern classified by signals, independent of technology domain | [archetypes.yaml](../../domain/catalogs/archetypes.yaml) | `competitive_displacement`, `greenfield_adoption` |
| **Domain** | Specialist area that determines which playbooks, checklists, and agents are involved. Orthogonal to Archetype | [archetypes.yaml](../../domain/catalogs/archetypes.yaml) (domains section) | `security`, `search`, `observability` |
| **Reference Blueprint** | Reusable composition of playbooks/assets for an Archetype + Domain combination. Multiple variants per Archetype (A01-A06) | [blueprints/reference/](../../domain/blueprints/reference/) | `competitive_displacement/A02_competitive.yaml` |
| **Blueprint Instance** | Node-specific instance created from Reference Blueprint, customized for engagement | `vault/{realm}/{node}/blueprint.yaml` | `vault/ACME_CORP/SECURITY_CONSOLIDATION/blueprint.yaml` |
| **Playbook** | Small, atomic operational scenario with inputs, steps, outputs (~15-30 min execution) | [strategy/](../../domain/playbooks/strategy/) (strategic), [specialists/](../../domain/playbooks/specialists/) (domain), [operational/](../../domain/playbooks/operational/) (tactical) | `PB_201_swot_analysis.yaml`, `PB_SEC_001_technical_validation.yaml` |
| **Engagement Track** | Policy overlay defining scope, cadence, SA allocation. Orthogonal to Archetype and Domain | [engagement_tracks.yaml](../../domain/mappings/engagement_tracks.yaml) | `economy`, `premium`, `fast_track`, `poc` |
| **Best Practice** | Validated, peer-reviewed insight extracted from deal outcomes and field experience. Stored in Knowledge Base, surfaced contextually during playbook execution | [vault/knowledge/](../../vault/knowledge/) | `BP_SEC_001` (MITRE ATT&CK positioning) |
| **Asset** | Instance output produced by playbook execution with provenance. Customer-facing assets go to external-infohub/, vendor-only to internal-infohub/ | `vault/{realm}/{node}/external-infohub/` or `internal-infohub/` | `vault/ACME_CORP/SECURITY_CONSOLIDATION/external-infohub/decisions/` |
| **Template** | Governed library item (canvas template, schema, prompt) | [canvas/templates/](../../domain/playbooks/canvas/templates/) (HTML), [canvas/specs/](../../domain/playbooks/canvas/specs/) (YAML), [playbook templates/](../../domain/playbooks/templates/) | `context_canvas.html`, `poc_success_plan_template.yaml` |
| **Checklist** | Machine-readable evaluation criteria with weighted scoring | [specialists/checklists/](../../domain/playbooks/specialists/) (domain evaluation), [config/checklists/](../../domain/config/checklists/) (operational) | `security_evaluation_checklist.yaml`, `blueprint_checklists.yaml` |
| **Gap Scan** | Compliance check comparing Blueprint Instance against Reference Blueprint requirements | Output: `vault/{realm}/{node}/internal-infohub/governance/gap_report.yaml` | PB_971 output |

---

## Archetypes

Archetypes define engagement patterns independent of technology domain. The same archetype applies whether the domain is security, search, or observability.

### 1. Competitive Displacement

**Signals:** `competitor_displacement`, `migration_timeline`, `multi_vendor_incumbent`
**Reference Blueprints:** A01_basic, A02_competitive

### 2. Greenfield Adoption

**Signals:** `no_incumbent`, `new_capability`, `greenfield_initiative`
**Reference Blueprints:** A01_basic, A02_enterprise

### 3. Platform Consolidation

**Signals:** `platform_play`, `executive_sponsor`, `budget_consolidation`, `multi_tool_incumbent`
**Reference Blueprints:** A01_unified
**Minimum Track:** Premium

### 4. Compliance-Driven

**Signals:** `regulatory_deadline`, `audit_finding`, `risk_averse_culture`
**Reference Blueprints:** A01_audit_response, A02_regulatory

### 5. Technical Evaluation

**Signals:** `technical_evaluation`, `short_timeline`, `limited_stakeholders`
**Reference Blueprints:** A01_technical, A02_comparative
**Track:** POC only

### 6. Retention / Renewal

**Signals:** `renewal_approaching`, `health_score_declining`, `champion_departed`
**Reference Blueprints:** A01_health_recovery, A02_champion_rebuild

### 7. Expansion

**Signals:** `adoption_success`, `new_use_case_identified`, `budget_cycle`
**Reference Blueprints:** A01_use_case, A02_enterprise

### 8. Strategic Account

**Signals:** `tier_1_account`, `multi_node`, `executive_relationship`
**Reference Blueprints:** A01_strategic
**Minimum Track:** Premium

---

## Domains

Domains are orthogonal to archetypes. Each domain contributes specialist playbooks, evaluation checklists, and a specialist agent. Adding a new domain does not require new archetypes.

| Domain | Specialist Agent | Playbook Prefix | Checklist |
|--------|-----------------|-----------------|-----------|
| Security | security_specialist | PB_SEC | security_evaluation_checklist |
| Search | search_specialist | PB_SRCH | search_evaluation_checklist |
| Observability | observability_specialist | PB_OBS | observability_evaluation_checklist |
| Multi-Domain | (multiple) | (multiple) | (combined) |

---

## Engagement Tracks

Tracks control scope, cadence, and resource allocation. They apply across all archetype and domain combinations.

| Track | Scope | Canvas Depth | SA Allocation |
|-------|-------|--------------|---------------|
| **POC** | Tightly scoped | Minimal | Shared |
| **Economy** | Template-based | Template-based | Pooled |
| **Premium** | Full custom | Full custom | Dedicated |
| **Fast Track** | Accelerated | Accelerated | Dedicated |

---

## Validation

Gap Scan (PB_971) checks:

1. Blueprint exists for Node
2. Blueprint references valid Reference Blueprint
3. All required playbooks for Archetype + Domain executed
4. Engagement Track constraints met
5. Asset provenance complete
