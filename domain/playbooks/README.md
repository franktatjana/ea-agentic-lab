# Playbooks

Playbooks are actionable, repeatable workflows that agents execute for recurring situations. They encode best practices from management consulting frameworks, sales methodologies, and technical governance into automatable steps.

## Key Principles

[image: Playbook Relationships - how strategic, operational, and canvas playbooks work together]

- **Team Ownership**: Each playbook belongs to exactly one team - no shared ownership
- **Runtime Loading**: Playbooks are loaded at runtime, enabling updates without redeployment
- **Personalization**: Users can customize playbooks via overrides (see [Personalization Spec](../docs/architecture/system/playbook-personalization-spec.md))
- **RACI Clarity**: Every playbook defines clear accountability

---

## Browse by Agent Role

Each foldable section groups playbooks by the team that owns and executes them. The count reflects strategic playbooks only; operational micro-playbooks are listed separately.

<details>
<summary><strong>Solution Architects</strong> (16 playbooks)</summary>

Technical architecture, qualification, discovery, and post-sales technical engagement.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_SA_001 | TOGAF ADM | technical_execution | R: SA, A: SA Lead |
| PB_SA_002 | Sizing Estimation | technical_execution | R: SA, A: SA Lead |
| PB_SA_003 | Solution Description | content_generation | R: SA, A: SA Lead |
| PB_SA_004 | Situation Diagnostic | discovery_investigation | R: SA, A: SA |
| PB_SA_005 | TECHDRIVE | pursuit_sales_support | R: SA, A: SA Lead |
| PB_SA_006 | Technical Demo Preparation | pursuit_sales_support | R: SA, A: SA Lead |
| PB_SA_007 | Customer Journey Mapping | discovery_investigation | R: SA, A: SA Lead |
| PB_SA_008 | InfoHub Health Review | technical_execution | R: SA, A: SA Lead |
| PB_SA_009 | Technical Value Narrative | content_generation | R: SA, A: SA Lead |
| PB_SA_010 | Architecture Communication Plan | content_generation | R: SA, A: SA Lead |
| PB_SA_011 | Value Stream Mapping | discovery_investigation | R: SA, A: SA Lead |
| PB_SA_012 | Technical Evaluation Execution | technical_execution | R: SA, A: SA Lead |
| PB_SA_013 | SA Engagement Qualification | pursuit_sales_support | R: SA, A: SA Lead |
| PB_SA_014 | Technical Discovery | discovery_investigation | R: SA, A: SA Lead |
| PB_SA_015 | Solution Fit Assessment | discovery_investigation | R: SA, A: SA Lead |
| PB_SA_016 | Office Hours with Enterprise Clients | relationship_governance | R: SA, A: SA Lead |

</details>

<details>
<summary><strong>Account Executives</strong> (6 playbooks)</summary>

Sales qualification, planning, pipeline management, and review.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_AE_001 | Retrospective | discovery_investigation | R: AE, A: Sales Mgmt |
| PB_AE_002 | Account Planning | pursuit_sales_support | R: AE, A: AE |
| PB_AE_003 | Sales QBR | pursuit_sales_support | R: AE, A: Sales Mgmt |
| PB_AE_004 | Opportunity Consult | deal_review | R: AE, A: AE |
| PB_AE_005 | Pipeline Generation Review | pipeline_management | R: AE, A: Sales Mgmt |
| PB_AE_006 | MEDDPICC | pursuit_sales_support | R: AE, A: AE |

</details>

<details>
<summary><strong>Customer Architects</strong> (12 playbooks)</summary>

Customer health, success planning, adoption, and relationship governance.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_CA_001 | Customer QBR | relationship_governance | R: CA, A: CA Lead |
| PB_CA_002 | Track Support Case | relationship_governance | R: CA, A: CA Lead |
| PB_CA_003 | Escalate Support Issue | relationship_governance | R: CA, A: CA Lead |
| PB_CA_004 | Review Support Health | relationship_governance | R: CA, A: CA Lead |
| PB_CA_005 | Cadence Calls | relationship_governance | R: CA, A: CA |
| PB_CA_006 | Health Triage | relationship_governance | R: CA, A: CA Lead |
| PB_CA_007 | Customer Health Score | relationship_governance | R: CA, A: CA Lead |
| PB_CA_008 | Customer Success Plan | relationship_governance | R: CA, A: CA |
| PB_CA_009 | Customer Journey VoC | relationship_governance | R: CA, A: CA |
| PB_CA_010 | Customer Guidelines | relationship_governance | R: CA, A: CA |
| PB_CA_011 | Training Plans | relationship_governance | R: CA, A: CA |
| PB_CA_012 | Adoption Guidance | relationship_governance | R: CA, A: CA |

</details>

<details>
<summary><strong>Strategy</strong> (6 playbooks)</summary>

Management consulting frameworks for strategic analysis.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_STR_001 | Three Horizons | strategic_frameworks | R: Strategy, A: Management |
| PB_STR_002 | Ansoff Matrix | strategic_frameworks | R: Strategy, A: Management |
| PB_STR_003 | BCG Matrix | strategic_frameworks | R: Strategy, A: Management |
| PB_STR_004 | SWOT Analysis | strategic_frameworks | R: Strategy, A: SA |
| PB_STR_005 | PESTLE Analysis | strategic_frameworks | R: Strategy, A: SA |
| PB_STR_006 | Stakeholder Mapping | strategic_frameworks | R: Strategy, A: AE |

</details>

<details>
<summary><strong>Value Engineering</strong> (7 playbooks)</summary>

ROI, TCO, business case development, and value lifecycle tracking.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_VE_001 | Value Engineering | discovery_investigation | R: VE, A: VE Lead |
| PB_VE_002 | Value Hypothesis | discovery_investigation | R: VE, A: VE Lead |
| PB_VE_003 | Value Calculation | discovery_investigation | R: VE, A: VE Lead |
| PB_VE_004 | Value Stream Workshop | discovery_investigation | R: VE, A: VE Lead |
| PB_VE_005 | Value Proof | technical_execution | R: VE, A: VE Lead |
| PB_VE_006 | Value Realization | customer_lifecycle | R: VE, A: VE Lead |
| PB_VE_007 | Value Amplification | customer_lifecycle | R: VE, A: VE Lead |

</details>

<details>
<summary><strong>Delivery</strong> (7 playbooks)</summary>

Implementation, go-live readiness, and post-implementation review.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_DEL_001 | Implementation Kickoff | delivery_execution | R: Delivery, A: Delivery Mgr |
| PB_DEL_002 | Go-Live Readiness Assessment | delivery_execution | R: Delivery, A: Delivery Mgr |
| PB_DEL_003 | Implementation Risk Review | delivery_execution | R: Delivery, A: Delivery Mgr |
| PB_DEL_004 | Post-Implementation Review | delivery_execution | R: Delivery, A: Delivery Mgr |
| PB_DEL_005 | Security Stage Adoption | relationship_governance | R: Delivery, A: CA |
| PB_DEL_006 | Engage DSE | relationship_governance | R: PS, A: PS Lead |
| PB_DEL_007 | Tech Trend Response | system_governance | R: Delivery, A: SA |

</details>

<details>
<summary><strong>RFP Response</strong> (5 playbooks)</summary>

RFP processing, bid decisions, and response management.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_RFP_001 | RFP Processing | pursuit_sales_support | R: RFP Team, A: AE |
| PB_RFP_002 | Bid Decision | pursuit_sales_support | R: RFP Team, A: Sales Mgmt |
| PB_RFP_003 | Response Strategy | pursuit_sales_support | R: RFP Team, A: AE |
| PB_RFP_004 | Quality Review | pursuit_sales_support | R: RFP Team, A: RFP Lead |
| PB_RFP_005 | Post Submission | pursuit_sales_support | R: RFP Team, A: AE |

</details>

<details>
<summary><strong>Specialists</strong> (32 playbooks)</summary>

Domain-specific technical playbooks organized by specialty area.

| Subdirectory | Count | Scope |
|-------------|-------|-------|
| `security/` | 12 | SIEM/SOAR validation, security questionnaires, migration planning, competitive battlecards |
| `search/` | 10 | Schema design, relevance tuning, vector search, RAG system design |
| `observability/` | 10 | SLO/SLI definition, APM implementation, alerting strategy, platform architecture |

</details>

<details>
<summary><strong>Competitive Intelligence</strong> (1 playbook)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_CI_001 | Five Forces | discovery_investigation | R: CI, A: CI Lead |

</details>

<details>
<summary><strong>Account Intelligence</strong> (3 playbooks)</summary>

Account research, org mapping, and periodic refresh.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_ACI_001 | Initial Account Research | discovery_investigation | R: ACI, A: AE |
| PB_ACI_002 | Org Mapping | discovery_investigation | R: ACI, A: AE |
| PB_ACI_003 | Periodic Refresh | monitoring_maintenance | R: ACI, A: AE |

</details>

<details>
<summary><strong>Industry Intelligence</strong> (2 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_II_001 | Industry Deep Dive | discovery_investigation | R: II, A: Strategy |
| PB_II_002 | Trend Analysis | monitoring_maintenance | R: II, A: Strategy |

</details>

<details>
<summary><strong>Technology Scout</strong> (2 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_TSCT_001 | Tech Landscape Scan | intelligence_gathering | R: Tech Scout, A: SA Lead |
| PB_TSCT_002 | Vendor Analysis | intelligence_analysis | R: Tech Scout, A: SA Lead |

</details>

<details>
<summary><strong>Partners</strong> (3 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_PTR_001 | Partner Engagement Health | relationship_governance | R: Partner, A: Partner Mgr |
| PB_PTR_002 | Partner Dependency Tracking | delivery_execution | R: Partner, A: Partner Mgr |
| PB_PTR_003 | Joint Account Planning | pursuit_sales_support | R: Partner, A: Partner Mgr |

</details>

<details>
<summary><strong>Product Managers</strong> (3 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_PM_001 | Feature Gap Analysis | product_management | R: PM, A: PM Director |
| PB_PM_002 | Roadmap Alignment | product_management | R: PM, A: PM Director |
| PB_PM_003 | Feature Request Pattern | product_management | R: PM, A: PM Director |

</details>

<details>
<summary><strong>Management</strong> (2 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_MGT_001 | Deal Escalation Review | pursuit_sales_support | R: Senior Mgr, A: VP Sales |
| PB_MGT_002 | Forecast Commit Approval | pipeline_management | R: Senior Mgr, A: VP Sales |

</details>

<details>
<summary><strong>Governance</strong> (7 playbooks)</summary>

Periodic review cycles for system-level governance agents.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_GOV_001 | Nudge Effectiveness Review | system_governance | R: Nudger, A: System Admin |
| PB_GOV_002 | Weekly Action Audit | system_governance | R: Task Shepherd, A: System Admin |
| PB_GOV_003 | Weekly Decision Digest | system_governance | R: Decision Registrar, A: System Admin |
| PB_GOV_004 | Weekly Risk Review | system_governance | R: Risk Radar, A: System Admin |
| PB_GOV_005 | Signal Quality Review | system_governance | R: Signal Matcher, A: System Admin |
| PB_GOV_006 | InfoHub Freshness Audit | system_governance | R: InfoHub Curator, A: System Admin |
| PB_GOV_007 | Vault Structure Review | system_governance | R: Vault Curator, A: System Admin |

</details>

<details>
<summary><strong>InfoSec</strong> (2 playbooks)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_ISEC_001 | Security Questionnaire | pursuit_sales_support | R: InfoSec, A: SA Lead |
| PB_ISEC_002 | Compliance Gap Assessment | technical_execution | R: InfoSec, A: SA Lead |

</details>

<details>
<summary><strong>Proof of Concept</strong> (1 playbook)</summary>

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_POC_001 | POC Success Plan | content_generation | R: POC Team, A: SA |

</details>

<details>
<summary><strong>Admins</strong> (4 playbooks)</summary>

System utilities and governance playbooks.

| ID | Name | Category | RACI |
|----|------|----------|------|
| PB_ADM_001 | Render Canvas | system_governance | R: System, A: Admin |
| PB_ADM_002 | Canvas Gap Analysis | system_governance | R: System, A: Admin |
| PB_ADM_003 | Validate Playbook | system_governance | R: System, A: Admin |
| PB_ADM_004 | Blueprint Gap Scan | system_governance | R: System, A: Admin |

</details>

---

## Browse by Category

Each category groups playbooks by their functional purpose, regardless of which team owns them. This view helps identify coverage across the engagement lifecycle.

<details>
<summary><strong>relationship_governance</strong> — Customer and partner engagement rhythm (23 playbooks)</summary>

Recurring touchpoints, health tracking, success planning, and relationship management across the customer lifecycle.

| ID | Name | Owner |
|----|------|-------|
| PB_SA_016 | Office Hours with Enterprise Clients | Solution Architects |
| PB_CA_001 | Customer QBR | Customer Architects |
| PB_CA_002 | Track Support Case | Customer Architects |
| PB_CA_003 | Escalate Support Issue | Customer Architects |
| PB_CA_004 | Review Support Health | Customer Architects |
| PB_CA_005 | Cadence Calls | Customer Architects |
| PB_CA_006 | Health Triage | Customer Architects |
| PB_CA_007 | Customer Health Score | Customer Architects |
| PB_CA_008 | Customer Success Plan | Customer Architects |
| PB_CA_009 | Customer Journey VoC | Customer Architects |
| PB_CA_010 | Customer Guidelines | Customer Architects |
| PB_CA_011 | Training Plans | Customer Architects |
| PB_CA_012 | Adoption Guidance | Customer Architects |
| PB_DEL_005 | Security Stage Adoption | Delivery |
| PB_DEL_006 | Engage DSE | Delivery |
| PB_PTR_001 | Partner Engagement Health | Partners |

</details>

<details>
<summary><strong>technical_execution</strong> — Architecture, sizing, validation, and implementation (27 playbooks)</summary>

Technical analysis, platform architecture, POC execution, and compliance validation.

| ID | Name | Owner |
|----|------|-------|
| PB_SA_001 | TOGAF ADM | Solution Architects |
| PB_SA_002 | Sizing Estimation | Solution Architects |
| PB_SA_008 | InfoHub Health Review | Solution Architects |
| PB_SA_012 | Technical Evaluation Execution | Solution Architects |
| PB_VE_005 | Value Proof | Value Engineering |
| PB_ISEC_002 | Compliance Gap Assessment | InfoSec |
| PB_SEC_001 | Technical Validation | Specialists (Security) |
| PB_SEC_003 | Solution Scoping | Specialists (Security) |
| PB_SEC_004 | Use Case Definition | Specialists (Security) |
| PB_SEC_005 | Migration Planning | Specialists (Security) |
| PB_SEC_006 | Platform Architecture | Specialists (Security) |
| PB_SEC_007 | Technical POC | Specialists (Security) |
| PB_SRCH_001 | Technical Validation | Specialists (Search) |
| PB_SRCH_003 | Solution Scoping | Specialists (Search) |
| PB_SRCH_004 | Schema Design | Specialists (Search) |
| PB_SRCH_005 | Relevance Tuning | Specialists (Search) |
| PB_SRCH_006 | Vector Search Architecture | Specialists (Search) |
| PB_SRCH_007 | Technical POC | Specialists (Search) |
| PB_SRCH_008 | RAG System Design | Specialists (Search) |
| PB_OBS_003 | Technical Validation | Specialists (Observability) |
| PB_OBS_005 | Solution Scoping | Specialists (Observability) |
| PB_OBS_006 | SLO/SLI Definition | Specialists (Observability) |
| PB_OBS_007 | APM Implementation | Specialists (Observability) |
| PB_OBS_008 | Platform Architecture | Specialists (Observability) |
| PB_OBS_009 | Technical POC | Specialists (Observability) |
| PB_OBS_010 | Alerting Strategy | Specialists (Observability) |

</details>

<details>
<summary><strong>pursuit_sales_support</strong> — Sales pursuit, qualification, and competitive positioning (15 playbooks)</summary>

Playbooks that support active sales pursuits: qualification, demos, RFP responses, and competitive battlecards.

| ID | Name | Owner |
|----|------|-------|
| PB_SA_005 | TECHDRIVE | Solution Architects |
| PB_SA_006 | Technical Demo Preparation | Solution Architects |
| PB_SA_013 | SA Engagement Qualification | Solution Architects |
| PB_AE_002 | Account Planning | Account Executives |
| PB_AE_003 | Sales QBR | Account Executives |
| PB_AE_006 | MEDDPICC | Account Executives |
| PB_MGT_001 | Deal Escalation Review | Management |
| PB_ISEC_001 | Security Questionnaire | InfoSec |
| PB_RFP_001 | RFP Processing | RFP Response |
| PB_RFP_002 | Bid Decision | RFP Response |
| PB_RFP_003 | Response Strategy | RFP Response |
| PB_RFP_004 | Quality Review | RFP Response |
| PB_RFP_005 | Post Submission | RFP Response |
| PB_SEC_012 | Competitive Battlecard | Specialists (Security) |
| PB_PTR_003 | Joint Account Planning | Partners |

</details>

<details>
<summary><strong>discovery_investigation</strong> — Research, analysis, and discovery (16 playbooks)</summary>

Structured discovery, investigation, and analysis playbooks that produce insights for decision-making.

| ID | Name | Owner |
|----|------|-------|
| PB_SA_004 | Situation Diagnostic | Solution Architects |
| PB_SA_007 | Customer Journey Mapping | Solution Architects |
| PB_SA_011 | Value Stream Mapping | Solution Architects |
| PB_SA_014 | Technical Discovery | Solution Architects |
| PB_SA_015 | Solution Fit Assessment | Solution Architects |
| PB_AE_001 | Retrospective | Account Executives |
| PB_CI_001 | Five Forces | Competitive Intelligence |
| PB_VE_001 | Value Engineering | Value Engineering |
| PB_VE_002 | Value Hypothesis | Value Engineering |
| PB_VE_003 | Value Calculation | Value Engineering |
| PB_VE_004 | Value Stream Workshop | Value Engineering |
| PB_ACI_001 | Initial Account Research | Account Intelligence |
| PB_ACI_002 | Org Mapping | Account Intelligence |
| PB_II_001 | Industry Deep Dive | Industry Intelligence |
| PB_SEC_009 | Deep Discovery | Specialists (Security) |
| PB_SRCH_009 | Deep Discovery | Specialists (Search) |
| PB_OBS_001 | Deep Discovery | Specialists (Observability) |

</details>

<details>
<summary><strong>content_generation</strong> — Documents, narratives, and demo assets (10 playbooks)</summary>

Playbooks that produce customer-facing or internal content: solution descriptions, value narratives, demo scripts, and RFx responses.

| ID | Name | Owner |
|----|------|-------|
| PB_SA_003 | Solution Description | Solution Architects |
| PB_SA_009 | Technical Value Narrative | Solution Architects |
| PB_SA_010 | Architecture Communication Plan | Solution Architects |
| PB_POC_001 | POC Success Plan | Proof of Concept |
| PB_SEC_002 | RFx Response | Specialists (Security) |
| PB_SEC_008 | Validation Evidence | Specialists (Security) |
| PB_SEC_010 | Custom Demo | Specialists (Security) |
| PB_SEC_011 | Security Questionnaire | Specialists (Security) |
| PB_SRCH_002 | RFx Response | Specialists (Search) |
| PB_SRCH_010 | Custom Demo | Specialists (Search) |
| PB_OBS_002 | Custom Demo | Specialists (Observability) |
| PB_OBS_004 | RFx Response | Specialists (Observability) |

</details>

<details>
<summary><strong>strategic_frameworks</strong> — Management consulting frameworks (6 playbooks)</summary>

Classic strategic analysis frameworks applied to account and market analysis.

| ID | Name | Owner |
|----|------|-------|
| PB_STR_001 | Three Horizons | Strategy |
| PB_STR_002 | Ansoff Matrix | Strategy |
| PB_STR_003 | BCG Matrix | Strategy |
| PB_STR_004 | SWOT Analysis | Strategy |
| PB_STR_005 | PESTLE Analysis | Strategy |
| PB_STR_006 | Stakeholder Mapping | Strategy |

</details>

<details>
<summary><strong>system_governance</strong> — Internal system health and governance (19 playbooks)</summary>

Governance agents' periodic reviews, system audits, and operational micro-playbooks.

| ID | Name | Owner |
|----|------|-------|
| PB_GOV_001 | Nudge Effectiveness Review | Governance |
| PB_GOV_002 | Weekly Action Audit | Governance |
| PB_GOV_003 | Weekly Decision Digest | Governance |
| PB_GOV_004 | Weekly Risk Review | Governance |
| PB_GOV_005 | Signal Quality Review | Governance |
| PB_GOV_006 | InfoHub Freshness Audit | Governance |
| PB_GOV_007 | Vault Structure Review | Governance |
| PB_ADM_001 | Render Canvas | Admins |
| PB_ADM_002 | Canvas Gap Analysis | Admins |
| PB_ADM_003 | Validate Playbook | Admins |
| PB_ADM_004 | Blueprint Gap Scan | Admins |
| PB_DEL_007 | Tech Trend Response | Delivery |
| OP_MTG_001 | Process Meeting Notes | Operational |
| OP_RSK_001 | Register New Risk | Operational |
| OP_ACT_001 | Create Action Item | Operational |
| OP_ACT_002 | Complete Action from Signal | Operational |
| OP_ESC_001 | Escalate Blocked Action | Operational |
| OP_HLT_001 | Health Score Alert | Operational |
| OP_TECH_001 | Process Tech Signal Update | Operational |

</details>

<details>
<summary><strong>delivery_execution</strong> — Implementation and delivery governance (5 playbooks)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_DEL_001 | Implementation Kickoff | Delivery |
| PB_DEL_002 | Go-Live Readiness Assessment | Delivery |
| PB_DEL_003 | Implementation Risk Review | Delivery |
| PB_DEL_004 | Post-Implementation Review | Delivery |
| PB_PTR_002 | Partner Dependency Tracking | Partners |

</details>

<details>
<summary><strong>customer_lifecycle</strong> — Post-sale value tracking (2 playbooks)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_VE_006 | Value Realization | Value Engineering |
| PB_VE_007 | Value Amplification | Value Engineering |

</details>

<details>
<summary><strong>product_management</strong> — Feature gaps and roadmap alignment (3 playbooks)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_PM_001 | Feature Gap Analysis | Product Managers |
| PB_PM_002 | Roadmap Alignment | Product Managers |
| PB_PM_003 | Feature Request Pattern | Product Managers |

</details>

<details>
<summary><strong>pipeline_management</strong> — Pipeline health and forecasting (2 playbooks)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_AE_005 | Pipeline Generation Review | Account Executives |
| PB_MGT_002 | Forecast Commit Approval | Management |

</details>

<details>
<summary><strong>deal_review</strong> — Opportunity analysis (1 playbook)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_AE_004 | Opportunity Consult | Account Executives |

</details>

<details>
<summary><strong>monitoring_maintenance</strong> — Ongoing monitoring and refresh (2 playbooks)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_ACI_003 | Periodic Refresh | Account Intelligence |
| PB_II_002 | Trend Analysis | Industry Intelligence |

</details>

<details>
<summary><strong>intelligence_gathering</strong> — Landscape scanning (1 playbook)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_TSCT_001 | Tech Landscape Scan | Technology Scout |

</details>

<details>
<summary><strong>intelligence_analysis</strong> — Vendor and technology assessment (1 playbook)</summary>

| ID | Name | Owner |
|----|------|-------|
| PB_TSCT_002 | Vendor Analysis | Technology Scout |

</details>

---

## Operational Playbooks (`operational/`)

Micro-playbooks for routine, event-driven operations. These are listed under `system_governance` in the category view above.

| ID | Name | Trigger | Owner |
|----|------|---------|-------|
| OP_MTG_001 | Process Meeting Notes | meeting_notes_available | meeting-notes-agent |
| OP_RSK_001 | Register New Risk | risk_identified | risk-radar-agent |
| OP_ACT_001 | Create Action Item | action_needed | task-shepherd-agent |
| OP_ACT_002 | Complete Action from Signal | signal_matches_done_means | task-shepherd-agent |
| OP_ESC_001 | Escalate Blocked Action | action_blocked | nudger-agent |
| OP_HLT_001 | Health Score Alert | health_threshold | risk-radar-agent |
| OP_COM_001 | Update Commercial Fields | deal_stage_change | ae-opportunity-hygiene-agent |
| OP_TECH_001 | Process Tech Signal Update | tech_signal_detected | tech-signal-analyzer-agent |

---

## Directory Structure

```text
playbooks/
├── strategy/                # Management consulting frameworks (6)
├── solution_architects/     # Technical architecture playbooks (16)
├── account_executives/      # Sales and account management (6)
├── customer_architects/     # Customer success and health (12)
├── competitive_intelligence/ # Market positioning (1)
├── value_engineering/       # ROI, TCO, business case (7)
├── proof_of_concept/        # POC governance (1)
├── rfp_response/            # RFP processing and response (5)
├── delivery/                # Implementation and delivery (7)
├── specialists/             # Domain-specific technical (32)
│   ├── security/            # SIEM/SOAR, compliance (12)
│   ├── search/              # Schema, relevance, RAG (10)
│   └── observability/       # SLO/SLI, APM, alerting (10)
├── account_intelligence/    # Account research and org mapping (3)
├── industry_intelligence/   # Industry deep dives and trends (2)
├── technology_scout/        # Tech landscape scanning (2)
├── partners/                # Partner engagement (3)
├── product_managers/        # Feature gaps and roadmap (3)
├── management/              # Deal escalation and forecast (2)
├── governance/              # Periodic governance reviews (7)
├── infosec/                 # Security questionnaires, compliance (2)
├── admins/                  # System/utility playbooks (4)
│
├── operational/             # Event-driven micro-playbooks (8)
├── overrides/               # Personalization layer (future)
│   ├── regions/
│   ├── teams/
│   └── users/
├── canvas/                  # Visual canvas specs and templates
└── templates/               # Reusable artifact templates
```

---

## RACI Model

Every playbook defines accountability using RACI:

| Role | Meaning | In Playbook Context |
|------|---------|---------------------|
| **R** - Responsible | Does the work | Agent/team executing the playbook |
| **A** - Accountable | Final decision maker | Approves outputs, owns quality |
| **C** - Consulted | Provides input | SMEs, stakeholders providing data |
| **I** - Informed | Kept updated | Receives outputs/notifications |

### RACI in Playbook Definition

```yaml
raci:
  responsible:
    role: "solution_architects"
    agent: "sa_agent"
    description: "Executes analysis and generates outputs"

  accountable:
    role: "sa_lead"
    human_required: true
    description: "Reviews and approves final output"
    approval_actions:
      - "approve"
      - "request_revision"
      - "reject"

  consulted:
    - role: "customer_architects"
      on_steps: ["customer_context", "health_assessment"]
    - role: "account_executives"
      on_steps: ["deal_context", "stakeholder_input"]

  informed:
    - role: "management"
      notify_on: ["completion", "escalation"]
    - role: "customer_team"
      notify_on: ["completion"]
```

### Standard RACI Patterns

| Playbook Type | Responsible | Accountable | Consulted | Informed |
|---------------|-------------|-------------|-----------|----------|
| Strategic Analysis | Strategy Team | Management | SA, AE | Leadership |
| Technical Qualification | SA | SA Lead | Specialists | AE |
| Sales Qualification | AE | AE | SA, VE | Sales Mgmt |
| Customer Health | CA | CA Lead | AE, SA | Management |
| Competitive Analysis | CI | CI Lead | SA, Product | AE, Marketing |
| Value Engineering | VE | VE Lead | SA, AE | Management |

---

## Playbook Structure

All playbooks follow a standardized YAML structure:

```yaml
id: "PB_XXX"
name: "Playbook Name"
version: "1.0"
status: "ACTIVE|DRAFT|DEPRECATED"

# Metadata
metadata:
  category: "strategic|operational|utility"
  framework: "Framework name (e.g., SWOT, MEDDPICC)"
  team_owner: "solution_architects"   # Owning team folder
  description: "Brief description of purpose"

# RACI Definition
raci:
  responsible:
    role: "solution_architects"
    agent: "sa_agent"
  accountable:
    role: "sa_lead"
    human_required: true
  consulted:
    - role: "account_executives"
  informed:
    - role: "management"

# Trigger conditions
triggers:
  - event: "opportunity_stage_change"
    conditions:
      - "stage == 'technical_validation'"

# Input requirements
inputs:
  required:
    - name: "customer_id"
      type: "string"
    - name: "opportunity_id"
      type: "string"
  optional:
    - name: "previous_analysis_id"
      type: "reference"

# Execution steps
steps:
  - step_id: "gather_context"
    name: "Gather Context"
    action: "collect_inputs"
    raci_role: "responsible"
    inputs: ["customer_id"]
    outputs: ["customer_context"]

  - step_id: "analyze"
    name: "Perform Analysis"
    action: "execute_framework"
    raci_role: "responsible"
    inputs: ["customer_context"]
    outputs: ["analysis_results"]

  - step_id: "review"
    name: "Review & Approve"
    action: "human_review"
    raci_role: "accountable"
    inputs: ["analysis_results"]
    outputs: ["approved_output"]

# Output contract
outputs:
  format: "markdown"
  storage_path: "{realm}/{node}/internal-infohub/frameworks/{playbook_id}_{date}.md"
  sections:
    - executive_summary
    - detailed_analysis
    - recommendations
    - next_steps
```

---

## Playbook Lifecycle

[image: Playbook Lifecycle - state transitions from draft through testing, review, active, to deprecated]

```text
┌─────────┐    ┌────────────┐    ┌────────┐    ┌────────┐    ┌────────────┐
│  Draft  │ -> │  Testing   │ -> │ Review │ -> │ Active │ -> │ Deprecated │
└─────────┘    └────────────┘    └────────┘    └────────┘    └────────────┘
     │              │                 │             │              │
  Create in    Test with         Team lead     Set status     Archive when
  team folder  sample data       approval      ACTIVE         replaced
```

1. **Draft** → Create in appropriate team folder under `executable/`
2. **Testing** → Test with sample data, validate outputs
3. **Review** → Team lead reviews and approves
4. **Active** → Playbook is live, set `status: "ACTIVE"`
5. **Deprecated** → Set `status: "DEPRECATED"`, document replacement

---

## Creating New Playbooks

1. Identify the owning team (who is Responsible)
2. Create playbook file in `{team}/PB_XXX_name.yaml`
3. Define RACI matrix
4. Define triggers, inputs, steps, outputs
5. Test with sample scenarios
6. Request review from Accountable role
7. Set `status: "ACTIVE"` when approved

---

## Personalization

Users can customize playbooks without modifying base definitions. See [Playbook Personalization Spec](../docs/architecture/system/playbook-personalization-spec.md).

Override priority (highest wins):

1. User overrides (`overrides/users/{user_id}/`)
2. Team overrides (`overrides/teams/{team}/`)
3. Region overrides (`overrides/regions/{region}/`)
4. Base playbook (`{team}/`)

---

## Known Gaps

The following agent roles currently have no dedicated playbooks. These gaps should be addressed to ensure every active agent role has at least one playbook.

All agent roles now have dedicated playbooks. No remaining gaps.

**Resolved gaps:**

- ~~RFP Agent~~: resolved with PB_RFP_001-005 (2026-03-06)
- ~~InfoSec Agent~~: resolved with PB_ISEC_001-002 (2026-03-06)
- ~~VE Agent~~: expanded from 1 to 7 with PB_VE_001-007 (2026-03-06)
- ~~Senior Manager Agent~~: resolved with PB_MGT_001-002 (2026-03-06)
- ~~Governance Agents~~: resolved with PB_GOV_001-007 (2026-03-06)
- ~~Product Manager Agent~~: resolved with PB_PM_001-003 (2026-02-27)
- ~~Partner Agent~~: resolved with PB_PTR_001-003 (2026-02-27)
- ~~Delivery Agent~~: resolved with PB_DEL_001-004 (2026-02-27)
- ~~Support Agent~~: dissolved (2026-02). Support intelligence handled via SIG_SUP_* signals consumed by CA Agent's SK_CA_001 skill. PB_CA_002-004 (Blueprint C06) authored and owned by CA Agent (signal consumer) and PS Agent (DSE coordination).

---

## Related Documentation

- [Playbook Personalization Spec](../docs/architecture/system/playbook-personalization-spec.md) - Customization system
- [Playbook Framework](../docs/architecture/playbooks/playbook-framework.md) - Design principles
- [Playbook Execution Specification](../docs/architecture/playbooks/playbook-execution-specification.md) - Execution details
- [Operational Playbook Spec](../docs/architecture/playbooks/operational-playbook-spec.md) - Micro-playbook format

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------| -------|
| 5.0 | 2026-03-15 | Added PB_SA_016 Office Hours, restructured README with foldable Browse by Agent Role and Browse by Category views, updated SA count from 5 to 16 | Tatjana Frank |
| 4.0 | 2026-03-08 | Sequential numbering per prefix (dropped hundred-block ranges), 47 IDs renumbered, added PB_AE_005 Pipeline Generation Review | Tatjana Frank |
| 3.0 | 2026-03-06 | Playbook ID migration (PB_PREFIX_NNN), added 20 new playbooks (RFP, InfoSec, VE, Management, Governance), intended_agent_role on all files, OP_ top-level fields | Tatjana Frank |
| 2.3 | 2026-02-27 | Added PB_PM_001-003 (PM Agent), PB_PTR_001-003 (Partner Agent), OP_COM_001, RACI on all playbooks, all agent gaps resolved | Tatjana Frank |
| 2.2 | 2026-02-27 | Added PB_CA_002-190 (C06), PB_DEL_001-004 (Delivery), vault_routing on all playbooks, Delivery gap resolved | Tatjana Frank |
| 2.1 | 2026-02-11 | Added specialists catalog, documented agent role coverage gaps | Tatjana Frank |
| 2.0 | 2026-02-03 | Reorganized by team ownership, added RACI | |
| 1.0 | 2026-01-01 | Initial structure | |
