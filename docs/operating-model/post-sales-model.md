---
order: 3
---

# Post-Sales Governance Model

**Archetype:** `post_sales_governance`
**Version:** 1.0
**Date:** 2026-01-23
**Status:** Active

---

## Purpose

C-Level Governance encompasses all activities **after deal closure**, focused on delivering outcomes: implementation quality, customer success, and long-term growth. This domain governs post-sales execution including onboarding, adoption, support, services delivery, and customer advocacy.

---

## Scope Boundaries

### In Scope

- Customer onboarding and engagement
- Solution adoption tracking and enablement
- Account team post-sales activities
- Professional Services coordination
- Support and DSE engagement
- Customer advocacy and references
- Health monitoring and intervention

### Out of Scope

- Pre-contract sales activities (see B-Level Pre-Sales)
- Strategic account steering (see A-Level Governance)
- Deal negotiation and closure (see B-Level Pre-Sales)
- Renewal negotiation (see D-Level Renewal, if defined)

### Handoff Points

| From | To | Trigger |
|------|-----|---------|
| B-Level | C-Level | Contract signature |
| C-Level | A-Level | Escalation to steering committee |
| C-Level | B-Level | Expansion opportunity identified |
| C-Level | D-Level | Renewal cycle begins (90 days out) |

---

## Entity Model

```text
Archetype: post_sales_governance
│
├── Reference Blueprints (C01-C07)
│   │   Reusable compositions for post-sales functions
│   │
│   ├── C01_customer_engagement
│   ├── C02_customer_success_operating_model
│   ├── C03_account_team_postsales
│   ├── C04_customer_knowledge_hub
│   ├── C05_services_coordination
│   ├── C06_support_dse_engagement
│   └── C07_customer_advocacy
│
├── Blueprint Instance (per Realm/Node)
│   │   e.g., ACME/IMPLEMENTATION/blueprint.yaml
│   │
│   └── Selected Reference Blueprints + customer-specific customizations
│
├── Playbooks (executed within each Reference Blueprint)
│   │   Small operational units (~15-30 min)
│   │
│   └── PB_401, PB_167, PB_168, etc.
│
└── Assets (outputs stored in InfoHub)
        e.g., adoption_tracker.yaml, health_score.yaml, support_log.yaml

Engagement Track = Policy overlay (Economy/Premium/Fast Track/POC)
    Controls: cadence, mandatory assets, validation strictness, automation depth
```

---

[image: Blueprint-Playbook Hierarchy - how blueprints compose playbooks and produce assets]

## Blueprint vs Playbook: Definition

**Blueprint** = Governance framework defining how teams, stages, and data connect. Establishes the structure, roles, cadences, and required assets for a domain. Blueprints are **compositional** (they specify which playbooks and assets are required) and **auditable** (gap scans validate compliance).

**Playbook** = Actionable workflow for a specific recurring situation. Provides clear, repeatable steps that can be monitored and partially automated by agents. Playbooks are **executable** (they have inputs, steps, outputs) and **atomic** (~15-30 min execution).

**Relationship:** Blueprints contain playbooks. One blueprint may reference multiple playbooks. Playbooks can be shared across blueprints.

---

## Reference Blueprints

### C01: Customer Engagement

**ID:** `C01_customer_engagement`

**Intent:** Define how customers are continuously engaged and cared for throughout the post-sales lifecycle, establishing communication cadences, touchpoint standards, and relationship health monitoring.

**Triggers/Signals:**

- `contract_signed` - Deal closed, customer onboarding begins
- `engagement_gap` - No customer touchpoint in defined period
- `sentiment_negative` - Negative feedback detected
- `milestone_reached` - Key adoption milestone achieved

**Required Assets:**

- `engagement/customer_profile.yaml` - Customer context and preferences
- `engagement/touchpoint_log.yaml` - Interaction history
- `engagement/engagement_plan.yaml` - Planned touchpoints and owners
- `engagement/sentiment_tracker.yaml` - Customer sentiment over time

**Core Playbooks:**

- PB_167: Onboard new customer
- PB_168: Conduct customer check-in
- PB_169: Address engagement gap
- PB_170: Celebrate milestone

**Stakeholders:**

- Internal: CSM (owner), AE, SA, Support
- External: Customer Champion, Executive Sponsor, Technical Lead

**Checklists:**

- `CHK_ENG_001`: Customer profile complete within 7 days of signature
- `CHK_ENG_002`: Engagement plan defined with monthly touchpoints minimum
- `CHK_ENG_003`: No engagement gap > 30 days (Premium: 14 days)
- `CHK_ENG_004`: Sentiment tracked and updated monthly

---

### C02: Customer Success Operating Model

**ID:** `C02_customer_success_operating_model`

**Intent:** Define the Customer Advocate (CA) engagement model for driving solution adoption and customer success, establishing internal processes, success metrics, and intervention triggers.

**Note:** This blueprint governs the **internal operating model** for customer success. For customer-facing knowledge sharing, see C04.

**Triggers/Signals:**

- `customer_assigned` - Customer assigned to CA
- `adoption_stalled` - Adoption metrics plateauing
- `health_score_declining` - Health score drops below threshold
- `success_plan_due` - Quarterly success plan review

**Required Assets:**

- `success/success_plan.yaml` - Customer success objectives and timeline
- `success/adoption_metrics.yaml` - Usage and adoption tracking
- `success/intervention_log.yaml` - Corrective actions taken
- `governance/health_score.yaml` - Current health score

**Core Playbooks:**

- PB_171: Create success plan
- PB_172: Review adoption metrics
- PB_401: Calculate health score
- PB_173: Trigger success intervention
- PB_174: Conduct quarterly business review

**Stakeholders:**

- Internal: CA/CSM (owner), AE, SA, Services, Support
- External: Customer Champion, Business Owner

**Checklists:**

- `CHK_CS_001`: Success plan created within 30 days of signature
- `CHK_CS_002`: Adoption metrics tracked weekly
- `CHK_CS_003`: Health score calculated and current (< 7 days stale)
- `CHK_CS_004`: QBR conducted quarterly for Premium accounts

---

### C03: Account Team Post-Sales Activities

**ID:** `C03_account_team_postsales`

**Intent:** Detail account team responsibilities and activities after deal closure to ensure long-term account health, defining handoffs, ongoing responsibilities, and coordination protocols.

**Triggers/Signals:**

- `deal_closed` - Contract signed, post-sales begins
- `handoff_required` - Pre-sales to post-sales transition
- `account_review_due` - Periodic account health review
- `expansion_signal` - Growth opportunity identified

**Required Assets:**

- `account/postsales_handoff.yaml` - Pre-sales to post-sales context transfer
- `account/account_health_report.yaml` - Ongoing health summary
- `account/team_responsibilities.yaml` - RACI for post-sales activities
- `account/expansion_tracker.yaml` - Growth opportunities

**Core Playbooks:**

- PB_175: Execute post-sales handoff
- PB_176: Conduct account health review
- PB_177: Identify expansion opportunity
- PB_178: Coordinate account team sync

**Stakeholders:**

- Internal: AE (owner), CSM, SA, Services Lead
- External: Customer Sponsor, Procurement (for expansions)

**Checklists:**

- `CHK_ACCT_001`: Post-sales handoff completed within 7 days
- `CHK_ACCT_002`: Account health review conducted monthly
- `CHK_ACCT_003`: Team responsibilities documented and acknowledged
- `CHK_ACCT_004`: Expansion opportunities logged and tracked

---

### C04: Customer Knowledge Hub

**ID:** `C04_customer_knowledge_hub`

**Intent:** Provide an external-facing InfoHub model for customers, enabling tailored knowledge sharing to support solution adoption, centralize use cases, architecture decisions, and design a structured, living workspace.

**Note:** This blueprint governs **customer-facing knowledge delivery**. For internal CA operating model, see C02.

**Triggers/Signals:**

- `customer_onboarded` - Customer ready for knowledge hub
- `content_stale` - Hub content outdated
- `use_case_added` - New use case documented
- `architecture_decision` - Architecture change documented

**Required Assets:**

- `knowledge/customer_hub_config.yaml` - Hub structure and access
- `knowledge/use_case_library.yaml` - Customer-specific use cases
- `knowledge/architecture_decisions.yaml` - Architecture context and rationale
- `knowledge/learning_path.yaml` - Recommended learning sequence

**Core Playbooks:**

- PB_179: Initialize customer knowledge hub
- PB_180: Add use case documentation
- PB_181: Update architecture context
- PB_182: Review hub freshness

**Stakeholders:**

- Internal: CSM (owner), SA, Training/Enablement
- External: Customer Technical Lead, Customer Admin

**Checklists:**

- `CHK_HUB_001`: Knowledge hub initialized within 14 days of onboarding
- `CHK_HUB_002`: At least 3 use cases documented
- `CHK_HUB_003`: Architecture decisions current (< 30 days stale)
- `CHK_HUB_004`: Learning path defined for customer team

---

### C05: Services Coordination

**ID:** `C05_services_coordination`

**Intent:** Surface updates from Professional Services into broader account context via internal InfoHub, supporting regular reporting and structured escalation through the steering committee when needed.

**Triggers/Signals:**

- `services_engaged` - PS engagement active
- `services_milestone` - Delivery milestone reached
- `services_risk` - Delivery risk identified
- `services_complete` - Engagement concluded

**Required Assets:**

- `services/engagement_status.yaml` - Current PS engagement details
- `services/milestone_tracker.yaml` - Delivery milestones and status
- `services/services_risk_register.yaml` - PS-specific risks
- `services/services_report.yaml` - Regular status reporting

**Core Playbooks:**

- PB_183: Sync services status
- PB_184: Report services milestone
- PB_185: Escalate services risk
- PB_186: Complete services engagement

**Stakeholders:**

- Internal: Services Delivery Manager (owner), CSM, AE, SA
- External: Customer Project Manager, Technical Lead

**Checklists:**

- `CHK_SVC_001`: Services status synced weekly
- `CHK_SVC_002`: Milestones updated within 24h of completion
- `CHK_SVC_003`: Risks escalated within SLA (4h critical, 24h high)
- `CHK_SVC_004`: Engagement closure report completed

---

### C06: Support & DSE Engagement

**ID:** `C06_support_dse_engagement`

**Intent:** Define the support engagement model and Designated Support Engineer (DSE) coordination, establishing escalation paths, SLA tracking, and proactive support patterns.

**Triggers/Signals:**

- `support_case_opened` - New support ticket
- `escalation_triggered` - Case escalated
- `dse_assigned` - DSE engagement begins
- `support_health_declining` - Support metrics deteriorating

**Required Assets:**

- `support/support_profile.yaml` - Customer support tier and contacts
- `support/case_log.yaml` - Support case history
- `support/dse_engagement.yaml` - DSE activities and outcomes
- `support/support_health.yaml` - Support metrics and trends

**Core Playbooks:**

- PB_187: Track support case
- PB_188: Escalate support issue
- PB_189: Engage DSE
- PB_190: Review support health

**Stakeholders:**

- Internal: Support Lead (owner), DSE, CSM, SA (for technical escalations)
- External: Customer Support Contact, Technical Lead

**Checklists:**

- `CHK_SUP_001`: Support profile complete with escalation contacts
- `CHK_SUP_002`: Critical cases escalated within 1 hour
- `CHK_SUP_003`: DSE engagement documented with outcomes
- `CHK_SUP_004`: Support health reviewed monthly

---

### C07: Customer Advocacy

**ID:** `C07_customer_advocacy`

**Intent:** Manage customer references, success stories, and advocacy activities, enabling public or anonymized reuse as references in other projects while respecting customer preferences.

**Triggers/Signals:**

- `success_achieved` - Customer achieves significant outcome
- `reference_request` - Sales requests customer reference
- `story_opportunity` - Success story candidate identified
- `advocacy_renewal` - Reference approval expiring

**Required Assets:**

- `advocacy/reference_profile.yaml` - Customer reference details and permissions
- `advocacy/success_stories.yaml` - Documented success stories
- `advocacy/advocacy_log.yaml` - Reference usage history
- `advocacy/permission_tracker.yaml` - Consent and expiration tracking

**Core Playbooks:**

- PB_191: Identify advocacy candidate
- PB_192: Document success story
- PB_193: Process reference request
- PB_194: Renew advocacy permission

**Stakeholders:**

- Internal: Customer Marketing (owner), CSM, AE
- External: Customer Champion, Executive Sponsor, Marketing Contact

**Checklists:**

- `CHK_ADV_001`: Success stories documented for qualifying customers
- `CHK_ADV_002`: Reference permissions current (not expired)
- `CHK_ADV_003`: Reference usage logged with outcome
- `CHK_ADV_004`: Advocacy candidates reviewed quarterly

---

## Engagement Track Overlay

How post-sales requirements change by service tier:

### Mandatory Assets by Track

| Asset | POC | Economy | Premium | Fast Track |
|-------|-----|---------|---------|------------|
| Customer profile | Basic | Standard | Comprehensive | Standard |
| Success plan | - | Template | Custom | Custom |
| Health score | - | Monthly | Weekly | Daily |
| Knowledge hub | - | Optional | Required | Required |
| Services reporting | - | Monthly | Weekly | Daily |
| Support profile | Basic | Standard | Premium SLA | Premium SLA |

### Cadence/Checkpoints by Track

| Activity | POC | Economy | Premium | Fast Track |
|----------|-----|---------|---------|------------|
| Customer check-in | End only | Monthly | Bi-weekly | Weekly |
| Health score update | - | Monthly | Weekly | Daily |
| QBR | - | Semi-annual | Quarterly | Monthly |
| Services sync | - | Bi-weekly | Weekly | Daily |
| Support review | - | Quarterly | Monthly | Weekly |
| Gap scan (PB_971) | End only | Monthly | Weekly | Daily |

### Validation Strictness by Track

| Check Type | POC | Economy | Premium | Fast Track |
|------------|-----|---------|---------|------------|
| Asset completeness | Minimal | Warn | Error | Error |
| Checklist pass rate | 50% | 70% | 90% | 95% |
| Engagement gap max | N/A | 30 days | 14 days | 7 days |
| Staleness threshold | N/A | 14 days | 7 days | 3 days |
| Escalation SLA | N/A | 48h | 24h | 4h |

### Automation Depth by Track

| Capability | POC | Economy | Premium | Fast Track |
|------------|-----|---------|---------|------------|
| Health score calculation | Manual | Scheduled | Real-time | Real-time |
| Engagement gap alerts | - | Weekly digest | Immediate | Immediate |
| Sentiment analysis | - | Manual | AI-assisted | AI-assisted |
| Success intervention | Manual | Rule-based | AI-recommended | AI-recommended |
| Advocacy identification | Manual | Manual | AI-suggested | AI-suggested |

---

## Gap Scan Integration

PB_971 (Blueprint Gap Scan) validates this archetype by checking:

1. **Blueprint exists** for Node at `{realm}/{node}/blueprint.yaml`
2. **Required Reference Blueprints** instantiated per Engagement Track
3. **Mandatory assets** present and not stale
4. **Checklists passing** at required severity level
5. **Cadence compliance** (no overdue touchpoints or reviews)

Gap scan output: `{realm}/{node}/gap_report.yaml`

---

## Provenance

```yaml
created_by: "system"
created_at: "2026-01-23"
source: "post-sales-governance-model-v1"
archetype_level: "C"
scope: "post_contract"
```
