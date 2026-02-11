---
order: 2
---

# Pre-Sales Governance Model

**Archetype:** `pre_sales_governance`
**Version:** 1.0
**Date:** 2026-01-23
**Status:** Active

---

## Purpose

B-Level Governance defines all activities **before contract signature**: focused on winning the deal through solution sharing, expert orchestration, and value demonstration. This domain governs pre-sales execution across discovery, qualification, POC, proposal, and negotiation phases.

---

[image: Pre-Sales Handoff Flow - how opportunities move from A-Level through B-Level to C-Level with triggers]

## Scope Boundaries

### In Scope

- Deal qualification and progression
- Solution positioning and demonstration
- POC planning and execution
- RFP response coordination
- Specialist and partner engagement
- Competitive positioning
- Proposal development
- Contract negotiation support

### Out of Scope

- Post-signature delivery (see C-Level Implementation)
- Ongoing customer success (see D-Level Post-Sales)
- Strategic account steering (see A-Level Governance)
- Renewal activities (see D-Level Post-Sales)

### Handoff Points

| From | To | Trigger |
|------|-----|---------|
| A-Level | B-Level | New opportunity identified |
| B-Level | C-Level | Contract signature |
| B-Level | A-Level | Deal lost or deferred |

---

## Entity Model

```text
Archetype: pre_sales_governance
│
├── Reference Blueprints (B01-B10, B06 reserved)
│   │   Reusable compositions for pre-sales functions
│   │
│   ├── B01_sales_process
│   ├── B02_rfp_team_deployment
│   ├── B03_specialists_engagement
│   ├── B04_competitive_intelligence
│   ├── B05_product_engineering_engagement
│   ├── B06_reserved (intentionally unused)
│   ├── B07_poc_success
│   ├── B08_partner_engagement
│   ├── B09_sa_playbook
│   └── B10_services_engagement
│
├── Blueprint Instance (per Realm/Node)
│   │   e.g., ACME/SECURITY_DEAL/blueprint.yaml
│   │
│   └── Selected Reference Blueprints + deal-specific customizations
│
├── Playbooks (executed within each Reference Blueprint)
│   │   Small operational units (~15-30 min)
│   │
│   └── PB_201, PB_301, PB_701, etc.
│
└── Assets (outputs stored in InfoHub)
        e.g., proposal.yaml, poc_plan.yaml, competitive_analysis.yaml

Engagement Track = Policy overlay (Economy/Premium/Fast Track/POC)
    Controls: cadence, mandatory assets, validation strictness, automation depth
```

---

## Reference Blueprints

### B01: Sales Process

**ID:** `B01_sales_process`

**Intent:** Operationalize the sales process through modular, automatable micro-processes that preserve defined stages, steps, tools, actors, and resources while enabling AI-driven orchestration, automation, and health monitoring.

**Triggers/Signals:**

- `opportunity_created` - New opportunity in CRM
- `stage_progression` - Deal moves to next stage
- `deal_review_scheduled` - Upcoming deal review
- `health_score_declining` - Deal health deteriorating

**Required Assets:**

- `sales/opportunity_profile.yaml` - Deal metadata and stage
- `sales/deal_health_score.yaml` - Current health metrics
- `sales/stage_checklist.yaml` - Stage-specific requirements
- `governance/deal_review_log.yaml` - Review history

**Core Playbooks:**

- PB_201: Conduct SWOT analysis
- PB_130: Qualify opportunity
- PB_131: Progress deal stage
- PB_132: Prepare deal review
- PB_133: Monitor deal health

**Stakeholders:**

- Internal: AE (owner), SA, Sales Manager, SLT (for strategic deals)
- External: Economic Buyer, Champion, Technical Evaluator

**Checklists:**

- `CHK_SALES_001`: Opportunity has identified economic buyer
- `CHK_SALES_002`: Deal stage matches completed activities
- `CHK_SALES_003`: Health score calculated within 7 days
- `CHK_SALES_004`: Deal review completed per stage requirements

---

### B02: RFP Team Deployment

**ID:** `B02_rfp_team_deployment`

**Intent:** Translate the specialized RFP Team engagement process into micro-blocks and a scalable knowledge base, enabling consistent activation, efficient RFP execution, and information reuse.

**Triggers/Signals:**

- `rfp_received` - Customer issues RFP
- `rfp_deadline_approaching` - Response deadline < 14 days
- `rfp_complexity_high` - RFP requires specialist team

**Required Assets:**

- `rfp/rfp_intake.yaml` - RFP metadata and requirements
- `rfp/response_plan.yaml` - Response timeline and assignments
- `rfp/answer_library.yaml` - Reusable response content
- `rfp/customization_log.yaml` - Deal-specific customizations

**Core Playbooks:**

- PB_134: Intake RFP request
- PB_135: Assess RFP complexity
- PB_136: Activate RFP team
- PB_137: Build response plan
- PB_138: Review and submit response

**Stakeholders:**

- Internal: RFP Team Lead, Subject Matter Experts, SA, AE
- External: Procurement, Technical Evaluators

**Checklists:**

- `CHK_RFP_001`: RFP intake complete with all sections identified
- `CHK_RFP_002`: Response plan has assigned owners for all sections
- `CHK_RFP_003`: Customization level documented (standard/modified/custom)
- `CHK_RFP_004`: Response reviewed by SA before submission

---

### B03: Specialists Engagement

**ID:** `B03_specialists_engagement`

**Intent:** Define when and how specialists contribute across the account lifecycle, enabling coordinated execution, reducing ad-hoc involvement, and streamlining discovery, POV, RFP, and PM engagement phases.

**Triggers/Signals:**

- `specialist_request` - Field team requests specialist
- `deal_complexity_threshold` - Deal size/complexity exceeds threshold
- `technical_depth_required` - Deep technical evaluation needed
- `poc_initiated` - POC requires specialist support

**Required Assets:**

- `specialists/engagement_request.yaml` - Request details and justification
- `specialists/engagement_plan.yaml` - Scope, timeline, deliverables
- `specialists/engagement_log.yaml` - Activity tracking
- `specialists/handoff_notes.yaml` - Knowledge transfer documentation

**Core Playbooks:**

- PB_139: Request specialist engagement
- PB_140: Scope specialist involvement
- PB_141: Execute specialist activities
- PB_142: Complete specialist handoff

**Stakeholders:**

- Internal: Requesting AE/SA, Specialist (Security/Observability/Search), Specialist Manager
- External: Customer Technical Team

**Checklists:**

- `CHK_SPEC_001`: Engagement request has clear scope and success criteria
- `CHK_SPEC_002`: Specialist assigned within SLA (24h Premium, 72h Economy)
- `CHK_SPEC_003`: Engagement plan approved by specialist manager
- `CHK_SPEC_004`: Handoff notes completed before engagement close

---

### B04: Competitive Intelligence

**ID:** `B04_competitive_intelligence`

**Intent:** Provide a documented flow for integrating competitive insights into account plans, enabling field teams to operationalize CI through account plans and InfoHubs.

**Triggers/Signals:**

- `competitor_identified` - Competitor detected in deal
- `competitive_loss` - Deal lost to competitor
- `ci_update_available` - New competitive intelligence published
- `battlecard_stale` - Battlecard > 90 days old

**Required Assets:**

- `competitive/competitor_profile.yaml` - Competitor details per deal
- `competitive/battlecard.yaml` - Competitive positioning guidance
- `competitive/win_loss_analysis.yaml` - Historical outcomes
- `canvases/competitive_canvas.md` - Visual competitive view

**Core Playbooks:**

- PB_701: Conduct competitive analysis
- PB_143: Update competitor profile
- PB_144: Apply battlecard positioning
- PB_145: Document win/loss learnings

**Stakeholders:**

- Internal: AE, SA, CI Team, Product Marketing
- External: None (internal intelligence only)

**Checklists:**

- `CHK_CI_001`: Competitor identified for all competitive deals
- `CHK_CI_002`: Battlecard applied and referenced in strategy
- `CHK_CI_003`: Win/loss analysis completed within 14 days of outcome
- `CHK_CI_004`: CI insights integrated into account plan

---

### B05: Product & Engineering Engagement

**ID:** `B05_product_engineering_engagement`

**Intent:** Provide a structured interface for orchestrating interactions with Product Managers and Engineering on roadmap alignment, feature delivery progress, and Customer Advisory Board (CAB) engagement.

**Triggers/Signals:**

- `feature_gap_identified` - Customer requires unreleased feature
- `roadmap_alignment_needed` - Strategic deal requires roadmap discussion
- `cab_nomination` - Customer nominated for CAB
- `escalation_to_engineering` - Technical blocker requires engineering

**Required Assets:**

- `product/feature_request_log.yaml` - Requested features and status
- `product/roadmap_alignment.yaml` - Roadmap commitments for deal
- `product/cab_engagement.yaml` - CAB participation tracking
- `product/engineering_escalation.yaml` - Escalation history

**Core Playbooks:**

- PB_146: Log feature request
- PB_147: Request roadmap alignment
- PB_148: Nominate for CAB
- PB_149: Escalate to engineering

**Stakeholders:**

- Internal: SA, AE, Product Manager, Engineering Lead
- External: Customer Technical Lead, Executive Sponsor (for CAB)

**Checklists:**

- `CHK_PROD_001`: Feature requests logged with customer impact
- `CHK_PROD_002`: Roadmap commitments have PM approval
- `CHK_PROD_003`: CAB nominations include executive sponsor
- `CHK_PROD_004`: Engineering escalations have defined resolution timeline

---

### B06: Reserved

**ID:** `B06_reserved`

**Intent:** Intentionally reserved for future use. This ID gap is preserved to maintain backward compatibility with existing references.

**Note:** Do not assign new content to B06 without coordinating migration of any existing references.

---

### B07: POC Success

**ID:** `B07_poc_success`

**Intent:** Provide a practical operational framework ("POC-in-a-box") defining clear roles, responsibilities, and automated workflows for POC delivery, consolidating best practices, success criteria, setup guidelines, and engagement checkpoints.

**Triggers/Signals:**

- `poc_requested` - Customer requests POC
- `poc_approved` - POC approved by sales leadership
- `poc_checkpoint_due` - Scheduled POC review approaching
- `poc_completion_near` - POC end date within 7 days

**Required Assets:**

- `poc/poc_plan.yaml` - Scope, timeline, success criteria
- `poc/poc_environment.yaml` - Technical setup details
- `poc/poc_checkpoint_log.yaml` - Progress tracking
- `poc/poc_results.yaml` - Outcomes and recommendations
- `canvases/problem_solution_canvas.md` - Visual POC summary

**Core Playbooks:**

- PB_150: Scope POC engagement
- PB_151: Setup POC environment
- PB_152: Execute POC checkpoint
- PB_153: Complete POC evaluation
- PB_154: Document POC results

**Stakeholders:**

- Internal: SA (owner), AE, Specialist, POC Support
- External: Technical Evaluator, Champion, IT/Ops Team

**Checklists:**

- `CHK_POC_001`: POC plan has measurable success criteria
- `CHK_POC_002`: Environment setup validated before customer access
- `CHK_POC_003`: Checkpoints completed on schedule
- `CHK_POC_004`: Results documented within 3 days of completion
- `CHK_POC_005`: Go/no-go recommendation recorded

---

### B08: Partner Engagement

**ID:** `B08_partner_engagement`

**Intent:** Provide a targeted operational guide for managing partner relationships, including engagement triggers, health monitoring, data boundary management, and joint planning for upsell/cross-sell scenarios with AI-driven feedback loops.

**Triggers/Signals:**

- `partner_opportunity` - Deal involves partner
- `partner_health_declining` - Partner engagement metrics dropping
- `joint_planning_due` - Quarterly joint planning approaching
- `data_boundary_review` - Sensitive data handling review needed

**Required Assets:**

- `partners/partner_profile.yaml` - Partner details and history
- `partners/engagement_plan.yaml` - Joint activities and responsibilities
- `partners/partner_scorecard.yaml` - Performance metrics
- `partners/data_boundary_agreement.yaml` - Information sharing rules

**Core Playbooks:**

- PB_155: Activate partner engagement
- PB_156: Update partner scorecard
- PB_157: Conduct joint planning
- PB_158: Review data boundaries

**Stakeholders:**

- Internal: AE, Partner Manager, SA
- External: Partner Account Manager, Partner Technical Team

**Checklists:**

- `CHK_PARTNER_001`: Partner profile complete for engaged partners
- `CHK_PARTNER_002`: Data boundaries documented and acknowledged
- `CHK_PARTNER_003`: Scorecard updated within 30 days
- `CHK_PARTNER_004`: Joint planning completed quarterly

---

### B09: SA Playbook

**ID:** `B09_sa_playbook`

**Intent:** Provide a comprehensive operational guideline for Solution Architects, codifying real-world best practices and reusable assets across the full account lifecycle, including proposals, reference architectures, deployment blueprints, diagramming standards, and sizing estimations.

**Triggers/Signals:**

- `sa_assigned` - SA assigned to opportunity
- `architecture_review_needed` - Technical architecture required
- `proposal_development` - Proposal in progress
- `sizing_request` - Customer requests sizing estimate

**Required Assets:**

- `architecture/reference_architecture.yaml` - Applicable reference architectures
- `architecture/deployment_blueprint.yaml` - Deployment specifications
- `architecture/sizing_estimate.yaml` - Resource sizing calculations
- `proposals/proposal_draft.yaml` - Proposal content and structure
- `canvases/architecture_decision_canvas.md` - Visual architecture view

**Core Playbooks:**

- PB_101: Design solution architecture
- PB_159: Select reference architecture
- PB_160: Calculate sizing estimate
- PB_161: Develop proposal content
- PB_162: Conduct SA deal review

**Stakeholders:**

- Internal: SA (owner), AE, SA Manager, Specialist
- External: Customer Architect, Technical Evaluator

**Checklists:**

- `CHK_SA_001`: Reference architecture selected and justified
- `CHK_SA_002`: Sizing estimate documented with assumptions
- `CHK_SA_003`: Proposal reviewed by SA manager (Premium deals)
- `CHK_SA_004`: Architecture decision canvas rendered

---

### B10: Services Engagement

**ID:** `B10_services_engagement`

**Intent:** Align Professional Services contribution with pre-sales workflows, detailing touchpoints for delivery/migration planning, POC involvement, and proposal input, with automation for engagement triggers, templates, and proactive gap/risk identification.

**Triggers/Signals:**

- `services_required` - Deal requires PS involvement
- `migration_complexity_high` - Complex migration identified
- `services_proposal_needed` - PS scoping for proposal
- `delivery_risk_identified` - Potential delivery risk detected

**Required Assets:**

- `services/services_engagement.yaml` - PS involvement details
- `services/migration_assessment.yaml` - Migration complexity analysis
- `services/services_proposal.yaml` - PS scope and pricing
- `services/delivery_risk_register.yaml` - Pre-identified delivery risks

**Core Playbooks:**

- PB_163: Request services engagement
- PB_164: Assess migration complexity
- PB_165: Develop services proposal
- PB_166: Identify delivery risks

**Stakeholders:**

- Internal: AE, SA, Services Delivery Manager, Services Sales
- External: Customer Project Manager, Technical Lead

**Checklists:**

- `CHK_SVC_001`: Services engagement triggered for qualifying deals
- `CHK_SVC_002`: Migration assessment completed for migration deals
- `CHK_SVC_003`: Services proposal aligned with license proposal
- `CHK_SVC_004`: Delivery risks documented and shared with customer

---

## Engagement Track Overlay

How pre-sales requirements change by service tier:

### Mandatory Assets by Track

| Asset | POC | Economy | Premium | Fast Track |
|-------|-----|---------|---------|------------|
| Opportunity profile | Basic | Standard | Comprehensive | Standard |
| Deal health score | - | Monthly | Weekly | Daily |
| Competitive analysis | - | Template | Custom | Template |
| POC plan | Required | - | Required | Required |
| Reference architecture | Basic | Standard | Custom | Standard |
| Services assessment | - | Optional | Required | Required |

### Cadence/Checkpoints by Track

| Activity | POC | Economy | Premium | Fast Track |
|----------|-----|---------|---------|------------|
| Deal review | End only | Monthly | Bi-weekly | Weekly |
| Health score update | - | Monthly | Weekly | Daily |
| POC checkpoint | Weekly | - | 2x/week | Daily |
| Specialist sync | As-needed | Weekly | 2x/week | Daily |
| Gap scan (PB_971) | End only | Monthly | Weekly | Daily |

### Validation Strictness by Track

| Check Type | POC | Economy | Premium | Fast Track |
|------------|-----|---------|---------|------------|
| Asset completeness | Minimal | Warn | Error | Error |
| Checklist pass rate | 50% | 70% | 90% | 95% |
| Staleness threshold | 14 days | 7 days | 3 days | 1 day |
| Automation depth | Manual | Semi-auto | Full auto | Full auto |
| Approval requirements | SA only | SA + Manager | SA + Director | SA + Manager |

### Automation Depth by Track

| Capability | POC | Economy | Premium | Fast Track |
|------------|-----|---------|---------|------------|
| Health score calculation | Manual | Scheduled | Real-time | Real-time |
| Stage progression alerts | - | Weekly digest | Immediate | Immediate |
| Risk detection | Manual | Rule-based | AI-assisted | AI-assisted |
| Specialist matching | Manual | Suggested | Auto-assigned | Auto-assigned |
| Document generation | Templates | Templates | AI-drafted | AI-drafted |

---

## Gap Scan Integration

PB_971 (Blueprint Gap Scan) validates this archetype by checking:

1. **Blueprint exists** for Node at `{realm}/{node}/blueprint.yaml`
2. **Required Reference Blueprints** instantiated per Engagement Track
3. **Mandatory assets** present and not stale
4. **Checklists passing** at required severity level
5. **Stage-appropriate activities** completed

Gap scan output: `{realm}/{node}/gap_report.yaml`

---

## Provenance

```yaml
created_by: "system"
created_at: "2026-01-23"
source: "pre-sales-governance-model-v1"
archetype_level: "B"
scope: "pre_contract"
```
