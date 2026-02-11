---
order: 1
---

# Strategic Account Governance Model

**Archetype:** `strategic_account_governance`
**Version:** 1.0
**Date:** 2026-01-23
**Status:** Active

---

## Purpose

A-Level Governance defines cross-functional, long-term steering mechanisms for strategic accounts. It governs how accounts are led over time: who decides what, how risks and value are tracked, and how governance applies across all sales and delivery phases.

This archetype sits at the **Realm level** (company-wide) rather than Node level (individual engagements).

---

## Entity Model

```text
Archetype: strategic_account_governance
│
├── Reference Blueprints (A01-A07)
│   │   Reusable compositions for governance functions
│   │
│   ├── A01_governance_structure
│   ├── A02_executive_sponsor_program
│   ├── A03_account_plan_evolution
│   ├── A04_internal_infohub
│   ├── A05_risk_management
│   ├── A06_decision_tracking
│   └── A07_value_engineering
│
├── Blueprint Instance (per Realm)
│   │   e.g., ACME/governance/blueprint.yaml
│   │
│   └── Selected Reference Blueprints + customizations
│
├── Playbooks (executed within each Reference Blueprint)
│   │   Small operational units (~15-30 min)
│   │
│   └── PB_102, PB_401, PB_971, etc.
│
└── Assets (outputs stored in InfoHub)
        e.g., stakeholder_map.yaml, risk_register.yaml, decision_log.yaml

Engagement Track = Policy overlay (Economy/Premium/Fast Track/POC)
    Controls: cadence, mandatory assets, validation strictness
```

---

## Reference Blueprints

### A01: Governance Structure

**ID:** `A01_governance_structure`

**Intent:** Establish a coordination structure that aligns internal stakeholders around key milestones, activities, and decisions to ensure synchronized collaboration and consistent execution.

**Required Assets:**

- `governance/steering_committee.yaml` - Committee membership, roles, authority levels
- `governance/governance_calendar.yaml` - Meeting cadences, review cycles
- `governance/escalation_matrix.yaml` - Escalation paths by severity
- `governance/raci_matrix.yaml` - Responsibility assignments

**Core Playbooks:**

- PB_102: Map stakeholders and influence
- PB_103: Define governance cadence
- PB_104: Establish escalation paths
- PB_105: Create RACI matrix

**Cadences:**

- Steering committee: Monthly
- Governance review: Quarterly
- Escalation review: As-needed (within 24h for critical)

**Checklists:**

- `CHK_GOV_001`: Steering committee defined with >= 1 executive sponsor
- `CHK_GOV_002`: Escalation matrix covers all severity levels
- `CHK_GOV_003`: RACI has no unassigned critical activities

---

### A02: Executive Sponsor Program

**ID:** `A02_executive_sponsor_program`

**Intent:** Translate the Executive Sponsor Program into consistent field execution through AI-supported workflows, ensuring no-gap implementation and sustained executive engagement.

**Required Assets:**

- `governance/exec_sponsor_profile.yaml` - Sponsor details, engagement history
- `governance/exec_touchpoint_log.yaml` - Interaction tracking
- `governance/exec_briefing_deck.md` - Current status briefing
- `canvases/value_stakeholders_canvas.md` - Visual stakeholder view

**Core Playbooks:**

- PB_106: Onboard executive sponsor
- PB_107: Prepare executive briefing
- PB_108: Track sponsor engagement
- PB_109: Escalate sponsor disengagement

**Cadences:**

- Sponsor touchpoint: Bi-weekly minimum
- Executive briefing: Monthly
- Engagement health check: Weekly (automated)

**Checklists:**

- `CHK_EXEC_001`: Executive sponsor identified and confirmed
- `CHK_EXEC_002`: Last touchpoint within 14 days
- `CHK_EXEC_003`: Briefing deck updated within 30 days
- `CHK_EXEC_004`: No sponsor disengagement signal > 30 days

---

### A03: Account Plan Evolution

**ID:** `A03_account_plan_evolution`

**Intent:** Transform static account plans into dynamic, connected assets including Mutual Action Plans (MAPs), enabling automated updates across InfoHubs and aligning future planning with ongoing execution.

**Required Assets:**

- `planning/account_plan.yaml` - Master account plan
- `planning/mutual_action_plan.yaml` - MAP with milestones
- `planning/success_criteria.yaml` - Measurable outcomes
- `canvases/execution_map_canvas.md` - Visual execution view

**Core Playbooks:**

- PB_110: Initialize account plan
- PB_111: Sync MAP milestones
- PB_112: Update success criteria
- PB_113: Generate executive summary

**Cadences:**

- MAP sync: Weekly
- Account plan review: Monthly
- Success criteria validation: Quarterly

**Checklists:**

- `CHK_PLAN_001`: Account plan exists and is < 90 days old
- `CHK_PLAN_002`: MAP has >= 3 defined milestones
- `CHK_PLAN_003`: Success criteria are measurable (has metrics)
- `CHK_PLAN_004`: No overdue MAP milestones > 14 days

---

### A04: Internal InfoHub

**ID:** `A04_internal_infohub`

**Intent:** Provide a centralized knowledge layer consolidating account context, decisions, assets, and planning inputs to enable faster onboarding, best practice adoption, and knowledge sharing.

**Required Assets:**

- `internal-infohub/realm_profile.yaml` - Account context and metadata
- `internal-infohub/knowledge_index.yaml` - Asset inventory
- `internal-infohub/onboarding_checklist.yaml` - New team member guide
- `canvases/context_canvas.md` - Visual context summary

**Core Playbooks:**

- PB_114: Initialize InfoHub structure
- PB_115: Index existing assets
- PB_116: Generate onboarding pack
- PB_117: Audit InfoHub completeness

**Cadences:**

- Asset indexing: Daily (automated)
- Completeness audit: Weekly
- Onboarding pack refresh: Monthly

**Checklists:**

- `CHK_HUB_001`: Realm profile complete (all required fields)
- `CHK_HUB_002`: Knowledge index < 7 days stale
- `CHK_HUB_003`: Context canvas rendered and current
- `CHK_HUB_004`: No orphan assets (assets without provenance)

---

### A05: Risk Management

**ID:** `A05_risk_management`

**Intent:** Surface, track, and escalate account risks (business and technical) through governance and steering channels without adding process overhead.

**Required Assets:**

- `risks/risk_register.yaml` - Active risk inventory
- `risks/risk_history.yaml` - Closed/mitigated risks
- `governance/risk_escalation_log.yaml` - Escalation audit trail
- `canvases/risk_governance_canvas.md` - Visual risk view

**Core Playbooks:**

- PB_118: Register new risk
- PB_119: Assess risk severity
- PB_120: Escalate critical risk
- PB_121: Review risk mitigation
- PB_401: Calculate health score (includes risk weighting)

**Cadences:**

- Risk review: Weekly
- Critical risk escalation: Within 4 hours
- Risk register audit: Monthly

**Checklists:**

- `CHK_RISK_001`: All critical risks have mitigation plans
- `CHK_RISK_002`: No risk > 30 days without review
- `CHK_RISK_003`: Risk register synced with health score
- `CHK_RISK_004`: Escalated risks have resolution timeline

---

### A06: Decision Tracking

**ID:** `A06_decision_tracking`

**Intent:** Capture, contextualize, and reuse strategic and operational decisions across the account lifecycle, enabling AI agents to track decision status, trigger downstream actions, and maintain cross-functional context.

**Required Assets:**

- `decisions/decision_log.yaml` - All decisions with status
- `decisions/decision_impact_map.yaml` - Decision dependencies
- `governance/decision_authority_matrix.yaml` - Who can decide what
- `canvases/decision_canvas.md` - Visual decision summary

**Core Playbooks:**

- PB_122: Record decision
- PB_123: Assess decision impact
- PB_124: Trigger downstream actions
- PB_125: Review superseded decisions

**Cadences:**

- Decision capture: Real-time (from meetings)
- Impact assessment: Within 24 hours
- Decision review: Monthly

**Checklists:**

- `CHK_DEC_001`: All decisions have owner and rationale
- `CHK_DEC_002`: No pending decisions > 14 days
- `CHK_DEC_003`: Superseded decisions linked to successor
- `CHK_DEC_004`: Decision canvas reflects current state

---

### A07: Value Engineering

**ID:** `A07_value_engineering`

**Intent:** Align stakeholders around key milestones, activities, and decisions for value engineering engagements, ensuring consistent cross-functional collaboration and maximizing ROI and business value.

**Required Assets:**

- `value/value_framework.yaml` - Value drivers and metrics
- `value/roi_model.yaml` - ROI calculations
- `value/business_case.yaml` - Approved business case
- `canvases/value_stakeholders_canvas.md` - Visual value view

**Core Playbooks:**

- PB_301: Value engineering assessment
- PB_126: Build ROI model
- PB_127: Validate business case
- PB_128: Track value realization

**Cadences:**

- Value review: Monthly
- ROI validation: Quarterly
- Business case refresh: Semi-annually

**Checklists:**

- `CHK_VAL_001`: Value framework has >= 3 measurable drivers
- `CHK_VAL_002`: ROI model validated by customer
- `CHK_VAL_003`: Business case approved by economic buyer
- `CHK_VAL_004`: Value realization tracked against baseline

---

## Engagement Track Overlay

How governance requirements change by service tier:

### Mandatory Assets by Track

| Asset | POC | Economy | Premium | Fast Track |
|-------|-----|---------|---------|------------|
| Steering committee | - | Optional | Required | Required |
| Executive sponsor profile | - | Optional | Required | Required |
| Account plan | - | Template | Custom | Custom |
| Risk register | Basic | Standard | Comprehensive | Standard |
| Decision log | - | Standard | Comprehensive | Standard |
| Value framework | - | Template | Custom | Template |
| Context canvas | - | Required | Required | Required |

### Cadence by Track

| Activity | POC | Economy | Premium | Fast Track |
|----------|-----|---------|---------|------------|
| Steering committee | - | Quarterly | Monthly | Bi-weekly |
| Executive touchpoint | - | Monthly | Bi-weekly | Weekly |
| Risk review | - | Monthly | Weekly | Daily |
| Decision review | - | Monthly | Weekly | Daily |
| Account plan sync | - | Monthly | Weekly | Daily |
| Gap scan (PB_971) | - | Monthly | Weekly | Daily |

### Validation Strictness by Track

| Check Type | POC | Economy | Premium | Fast Track |
|------------|-----|---------|---------|------------|
| Asset completeness | Skip | Warn | Error | Error |
| Cadence compliance | Skip | Warn | Error | Error |
| Staleness thresholds | 30 days | 14 days | 7 days | 3 days |
| Escalation SLA | - | 72h | 24h | 4h |
| Gap scan pass rate | - | 70% | 90% | 95% |

---

## Gap Scan Integration

PB_971 (Blueprint Gap Scan) validates this archetype by checking:

1. **Blueprint exists** for Realm at `{realm}/governance/blueprint.yaml`
2. **Required Reference Blueprints** instantiated per Engagement Track
3. **Mandatory assets** present and not stale
4. **Cadences met** (no overdue reviews)
5. **Checklists passing** at required severity level

Gap scan output: `{realm}/governance/gap_report.yaml`

---

## Provenance

```yaml
created_by: "system"
created_at: "2026-01-23"
source: "strategic-account-governance-model-v1"
```
