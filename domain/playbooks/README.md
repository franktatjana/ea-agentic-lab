# Playbooks

Playbooks are actionable, repeatable workflows that agents execute for recurring situations. They encode best practices from management consulting frameworks, sales methodologies, and technical governance into automatable steps.

## Key Principles

[image: Playbook Relationships - how strategic, operational, and canvas playbooks work together]

- **Team Ownership**: Each playbook belongs to exactly one team - no shared ownership
- **Runtime Loading**: Playbooks are loaded at runtime, enabling updates without redeployment
- **Personalization**: Users can customize playbooks via overrides (see [Personalization Spec](../docs/architecture/system/playbook-personalization-spec.md))
- **RACI Clarity**: Every playbook defines clear accountability

---

## Directory Structure

```text
playbooks/
├── strategy/                # Management consulting frameworks (6)
├── solution_architects/     # Technical architecture playbooks (5)
├── account_executives/      # Sales and account management (5)
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

## Playbook Catalog by Team

### Strategy (`strategy/`)

Management consulting frameworks for strategic analysis.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_STR_001 | Three Horizons | McKinsey | R: Strategy, A: Management |
| PB_STR_002 | Ansoff Matrix | Ansoff | R: Strategy, A: Management |
| PB_STR_003 | BCG Matrix | BCG | R: Strategy, A: Management |
| PB_STR_201 | SWOT Analysis | SWOT | R: Strategy, A: SA |
| PB_STR_202 | PESTLE Analysis | PESTLE | R: Strategy, A: SA |
| PB_STR_203 | Stakeholder Mapping | Stakeholder Analysis | R: Strategy, A: AE |

### Solution Architects (`solution_architects/`)

Technical architecture and qualification playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_SA_101 | TOGAF ADM | TOGAF | R: SA, A: SA Lead |
| PB_SA_102 | Sizing Estimation | Capacity Planning | R: SA, A: SA Lead |
| PB_SA_104 | Solution Description | Solution Design | R: SA, A: SA Lead |
| PB_SA_105 | Five Whys Analysis | Root Cause | R: SA, A: SA |
| PB_SA_802 | TECHDRIVE | Technical Qualification | R: SA, A: SA Lead |

### Account Executives (`account_executives/`)

Sales qualification, planning, and review playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_AE_601 | Retrospective | Win/Loss Analysis | R: AE, A: Sales Mgmt |
| PB_AE_602 | Account Planning | Account Strategy | R: AE, A: AE |
| PB_AE_603 | Sales QBR | Sales Performance Review | R: AE, A: Sales Mgmt |
| PB_AE_604 | Opportunity Consult | Opportunity Analysis | R: AE, A: AE |
| PB_AE_801 | MEDDPICC | Sales Qualification | R: AE, A: AE |

### Customer Architects (`customer_architects/`)

Customer health, success, and journey management.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_CA_174 | Customer QBR | Customer Business Review | R: CA, A: CA Lead |
| PB_CA_401 | Customer Health Score | Health Metrics | R: CA, A: CA Lead |
| PB_CA_402 | Customer Success Plan | CSP | R: CA, A: CA |
| PB_CA_403 | Customer Journey VoC | Journey Mapping | R: CA, A: CA |
| PB_CA_187 | Track Support Case | Support-to-Account Intelligence | R: CA, A: CA Lead |
| PB_CA_188 | Escalate Support Issue | Escalation Management | R: CA, A: CA Lead |
| PB_CA_190 | Review Support Health | Support Health Analysis | R: CA, A: CA Lead |
| PB_CA_202 | Cadence Calls | Meeting Rhythm | R: CA, A: CA |
| PB_CA_301 | Health Triage | Risk Response | R: CA, A: CA Lead |
| PB_CA_404 | Customer Guidelines | Best Practice Guidelines | R: CA, A: CA |
| PB_CA_405 | Training Plans | Enablement Planning | R: CA, A: CA |
| PB_CA_406 | Adoption Guidance | Adoption Framework | R: CA, A: CA |

### Competitive Intelligence (`competitive_intelligence/`)

Competitive analysis and market positioning.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_CI_701 | Five Forces | Porter | R: CI, A: CI Lead |

### Value Engineering (`value_engineering/`)

ROI, TCO, and business case development.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_VE_301 | Value Engineering | ROI/TCO | R: VE, A: VE Lead |
| PB_VE_302 | Value Hypothesis | Quantified Value | R: VE, A: VE Lead |
| PB_VE_303 | Value Calculation | Financial Modelling | R: VE, A: VE Lead |
| PB_VE_304 | Value Stream Workshop | Current/Future State | R: VE, A: VE Lead |
| PB_VE_305 | Value Proof | POV Metric Tracking | R: VE, A: VE Lead |
| PB_VE_306 | Value Realization | Post-Sale Tracking | R: VE, A: VE Lead |
| PB_VE_307 | Value Amplification | Renewal/Expansion | R: VE, A: VE Lead |

### Proof of Concept (`proof_of_concept/`)

POC planning and execution.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_POC_501 | POC Success Plan | POC Governance | R: POC Team, A: SA |

### RFP Response (`rfp_response/`)

RFP processing and response management.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_RFP_901 | RFP Processing | RFP Response | R: RFP Team, A: AE |
| PB_RFP_902 | Bid Decision | Bid/No-Bid Framework | R: RFP Team, A: Sales Mgmt |
| PB_RFP_903 | Response Strategy | Win Themes | R: RFP Team, A: AE |
| PB_RFP_904 | Quality Review | Pre-Submission QA | R: RFP Team, A: RFP Lead |
| PB_RFP_905 | Post Submission | Win/Loss Analysis | R: RFP Team, A: AE |

### Delivery (`delivery/`)

Implementation and technical delivery playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_DEL_001 | Implementation Kickoff | Implementation Governance | R: Delivery, A: Delivery Mgr |
| PB_DEL_002 | Go-Live Readiness Assessment | Readiness Validation | R: Delivery, A: Delivery Mgr |
| PB_DEL_003 | Implementation Risk Review | Delivery Risk Management | R: Delivery, A: Delivery Mgr |
| PB_DEL_004 | Post-Implementation Review | Lessons Learned | R: Delivery, A: Delivery Mgr |
| PB_DEL_189 | Engage DSE | DSE Coordination | R: PS, A: PS Lead |
| PB_DEL_101 | Security Stage Adoption | Adoption Framework | R: Delivery, A: CA |
| PB_DEL_902 | Tech Trend Response | Trend Analysis | R: Delivery, A: SA |

### Product Managers (`product_managers/`)

Product roadmap alignment and feature gap analysis playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_PM_001 | Feature Gap Analysis | Product Gap Assessment | R: PM, A: PM Director |
| PB_PM_002 | Roadmap Alignment | Dependency Mapping | R: PM, A: PM Director |
| PB_PM_003 | Feature Request Pattern | Cross-Account Aggregation | R: PM, A: PM Director |

### Partners (`partners/`)

Partner engagement and coordination playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_PTR_001 | Partner Engagement Health | Partner Assessment | R: Partner, A: Partner Mgr |
| PB_PTR_002 | Partner Dependency Tracking | Dependency Management | R: Partner, A: Partner Mgr |
| PB_PTR_003 | Joint Account Planning | Joint Planning | R: Partner, A: Partner Mgr |

### Admins (`admins/`)

System utilities and governance playbooks.

| ID | Name | Purpose | RACI |
|----|------|---------|------|
| PB_ADM_951 | Render Canvas | Generate visual canvases | R: System, A: Admin |
| PB_ADM_952 | Canvas Gap Analysis | Identify canvas gaps | R: System, A: Admin |
| PB_ADM_970 | Validate Playbook | Playbook QA | R: System, A: Admin |
| PB_ADM_971 | Blueprint Gap Scan | Blueprint completeness | R: System, A: Admin |

### Specialists (`specialists/`)

Domain-specific technical playbooks organized by specialty area. Each subdirectory contains playbooks tailored to a specialist agent's domain, covering validation, discovery, POC, and response workflows.

| Subdirectory | Count | Scope |
|-------------|-------|-------|
| `security/` | 12 | SIEM/SOAR validation, security questionnaires, migration planning, competitive battlecards |
| `search/` | 10 | Schema design, relevance tuning, vector search, RAG system design |
| `observability/` | 10 | SLO/SLI definition, APM implementation, alerting strategy, platform architecture |

### Account Intelligence (`account_intelligence/`)

Account research, org mapping, and periodic refresh playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_ACI_001 | Initial Account Research | Account Intelligence | R: ACI, A: AE |
| PB_ACI_002 | Org Mapping | Organizational Analysis | R: ACI, A: AE |
| PB_ACI_003 | Periodic Refresh | Account Maintenance | R: ACI, A: AE |

### Industry Intelligence (`industry_intelligence/`)

Industry deep dives and trend analysis playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_II_001 | Industry Deep Dive | Industry Analysis | R: II, A: Strategy |
| PB_II_002 | Trend Analysis | Trend Detection | R: II, A: Strategy |

### Technology Scout (`technology_scout/`)

Technology landscape scanning and vendor analysis.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_TSCT_001 | Tech Landscape Scan | Technology Radar | R: Tech Scout, A: SA Lead |
| PB_TSCT_002 | Vendor Analysis | Vendor Assessment | R: Tech Scout, A: SA Lead |

### Management (`management/`)

Deal escalation and forecast governance playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_MGT_001 | Deal Escalation Review | Escalation Governance | R: Senior Mgr, A: VP Sales |
| PB_MGT_002 | Forecast Commit Approval | Forecast Governance | R: Senior Mgr, A: VP Sales |

### Governance (`governance/`)

Periodic review cycles for system-level governance agents.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_GOV_001 | Nudge Effectiveness Review | Nudge Governance | R: Nudger, A: System Admin |
| PB_GOV_002 | Weekly Action Audit | Action Governance | R: Task Shepherd, A: System Admin |
| PB_GOV_003 | Weekly Decision Digest | Decision Governance | R: Decision Registrar, A: System Admin |
| PB_GOV_004 | Weekly Risk Review | Risk Governance | R: Risk Radar, A: System Admin |
| PB_GOV_005 | Signal Quality Review | Signal Governance | R: Signal Matcher, A: System Admin |
| PB_GOV_006 | InfoHub Freshness Audit | Knowledge Governance | R: InfoHub Curator, A: System Admin |
| PB_GOV_007 | Vault Structure Review | Knowledge Governance | R: Vault Curator, A: System Admin |

### InfoSec (`infosec/`)

Security questionnaire processing and compliance assessment.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_ISEC_001 | Security Questionnaire | Security Compliance | R: InfoSec, A: SA Lead |
| PB_ISEC_002 | Compliance Gap Assessment | Compliance Analysis | R: InfoSec, A: SA Lead |

---

## Operational Playbooks (`operational/`)

Micro-playbooks for routine, event-driven operations.

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

- ~~RFP Agent~~: resolved with PB_RFP_901-905 (2026-03-06)
- ~~InfoSec Agent~~: resolved with PB_ISEC_001-002 (2026-03-06)
- ~~VE Agent~~: expanded from 1 to 7 with PB_VE_301-307 (2026-03-06)
- ~~Senior Manager Agent~~: resolved with PB_MGT_001-002 (2026-03-06)
- ~~Governance Agents~~: resolved with PB_GOV_001-007 (2026-03-06)
- ~~Product Manager Agent~~: resolved with PB_PM_001-003 (2026-02-27)
- ~~Partner Agent~~: resolved with PB_PTR_001-003 (2026-02-27)
- ~~Delivery Agent~~: resolved with PB_DEL_001-004 (2026-02-27)
- ~~Support Agent~~: dissolved (2026-02). Support intelligence handled via SIG_SUP_* signals consumed by CA Agent's SK_CA_001 skill. PB_CA_187-190 (Blueprint C06) authored and owned by CA Agent (signal consumer) and PS Agent (DSE coordination).

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
| 3.0 | 2026-03-06 | Playbook ID migration (PB_PREFIX_NNN), added 20 new playbooks (RFP, InfoSec, VE, Management, Governance), intended_agent_role on all files, OP_ top-level fields | Tatjana Frank |
| 2.3 | 2026-02-27 | Added PB_PM_001-003 (PM Agent), PB_PTR_001-003 (Partner Agent), OP_COM_001, RACI on all playbooks, all agent gaps resolved | Tatjana Frank |
| 2.2 | 2026-02-27 | Added PB_CA_187-190 (C06), PB_DEL_001-004 (Delivery), vault_routing on all playbooks, Delivery gap resolved | Tatjana Frank |
| 2.1 | 2026-02-11 | Added specialists catalog, documented agent role coverage gaps | Tatjana Frank |
| 2.0 | 2026-02-03 | Reorganized by team ownership, added RACI | |
| 1.0 | 2026-01-01 | Initial structure | |
