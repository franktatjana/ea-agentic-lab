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
├── strategy/                # Management consulting frameworks
├── solution_architects/     # Technical architecture playbooks
├── account_executives/      # Sales and account management
├── customer_architects/     # Customer success and health
├── competitive_intelligence/
├── value_engineering/
├── proof_of_concept/
├── rfp_response/
├── delivery/
├── specialists/
├── management/
├── infohub/
├── admins/                  # System/utility playbooks
│
├── operational/             # Micro-playbooks for routine operations
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
| PB_001 | Three Horizons | McKinsey | R: Strategy, A: Management |
| PB_002 | Ansoff Matrix | Ansoff | R: Strategy, A: Management |
| PB_003 | BCG Matrix | BCG | R: Strategy, A: Management |
| PB_201 | SWOT Analysis | SWOT | R: Strategy, A: SA |
| PB_202 | PESTLE Analysis | PESTLE | R: Strategy, A: SA |
| PB_203 | Stakeholder Mapping | Stakeholder Analysis | R: Strategy, A: AE |

### Solution Architects (`solution_architects/`)

Technical architecture and qualification playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_101 | TOGAF ADM | TOGAF | R: SA, A: SA Lead |
| PB_105 | Five Whys Analysis | Root Cause | R: SA, A: SA |
| PB_802 | TECHDRIVE | Technical Qualification | R: SA, A: SA Lead |

### Account Executives (`account_executives/`)

Sales qualification, planning, and review playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_601 | Retrospective | Win/Loss Analysis | R: AE, A: Sales Mgmt |
| PB_602 | Account Planning | Account Strategy | R: AE, A: AE |
| PB_801 | MEDDPICC | Sales Qualification | R: AE, A: AE |

### Customer Architects (`customer_architects/`)

Customer health, success, and journey management.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_401 | Customer Health Score | Health Metrics | R: CA, A: CA Lead |
| PB_402 | Customer Success Plan | CSP | R: CA, A: CA |
| PB_403 | Customer Journey VoC | Journey Mapping | R: CA, A: CA |
| PB_CS_202 | Cadence Calls | Meeting Rhythm | R: CA, A: CA |
| PB_CS_301 | Health Triage | Risk Response | R: CA, A: CA Lead |

### Competitive Intelligence (`competitive_intelligence/`)

Competitive analysis and market positioning.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_701 | Five Forces | Porter | R: CI, A: CI Lead |

### Value Engineering (`value_engineering/`)

ROI, TCO, and business case development.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_301 | Value Engineering | ROI/TCO | R: VE, A: VE Lead |

### Proof of Concept (`proof_of_concept/`)

POC planning and execution.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_501 | POC Success Plan | POC Governance | R: POC Team, A: SA |

### RFP Response (`rfp_response/`)

RFP processing and response management.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_901 | RFP Processing | RFP Response | R: RFP Team, A: AE |

### Delivery (`delivery/`)

Implementation and technical delivery playbooks.

| ID | Name | Framework | RACI |
|----|------|-----------|------|
| PB_CS_101 | Security Stage Adoption | Adoption Framework | R: Delivery, A: CA |
| PB_902 | Tech Trend Response | Trend Analysis | R: Delivery, A: SA |

### Admins (`admins/`)

System utilities and governance playbooks.

| ID | Name | Purpose | RACI |
|----|------|---------|------|
| PB_951 | Render Canvas | Generate visual canvases | R: System, A: Admin |
| PB_952 | Canvas Gap Analysis | Identify canvas gaps | R: System, A: Admin |
| PB_970 | Validate Playbook | Playbook QA | R: System, A: Admin |
| PB_971 | Blueprint Gap Scan | Blueprint completeness | R: System, A: Admin |

### Specialists (`specialists/`)

Domain-specific technical playbooks organized by specialty area. Each subdirectory contains playbooks tailored to a specialist agent's domain, covering validation, discovery, POC, and response workflows.

| Subdirectory | Count | Scope |
|-------------|-------|-------|
| `security/` | 12 | SIEM/SOAR validation, security questionnaires, migration planning, competitive battlecards |
| `search/` | 10 | Schema design, relevance tuning, vector search, RAG system design |
| `observability/` | 10 | SLO/SLI definition, APM implementation, alerting strategy, platform architecture |

### Empty (Ready for Future)

- `management/` - Leadership and management playbooks
- `infohub/` - Knowledge curation playbooks

---

## Operational Playbooks (`operational/`)

Micro-playbooks for routine, event-driven operations.

| ID | Name | Trigger | Owner |
|----|------|---------|-------|
| OP_RSK_001 | Register New Risk | risk_identified | Risk Radar Agent |
| OP_ACT_001 | Create Action Item | action_needed | Task Shepherd Agent |
| OP_ESC_001 | Escalate Blocked Action | action_blocked | Nudger Agent |
| OP_HLT_001 | Health Score Alert | health_threshold | CA Agent |
| OP_MTG_001 | Process Meeting Notes | meeting_notes_available | Meeting Notes Agent |
| OP_TECH_001 | Process Technology Scout Update | tech_signal_detected | Tech Signal Agent |

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
| Customer Health | CA | CA Lead | AE, Support | Management |
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

The following agent roles currently have no dedicated playbooks. Existing delivery-related playbooks (PB_CS_101, PB_902) are attributed to SA and CA agents rather than to a dedicated Delivery agent. These gaps should be addressed to ensure every active agent role has at least one playbook.

| Agent Role | Gap | Priority |
|-----------|-----|----------|
| Delivery Agent | No dedicated playbooks, delivery work covered by SA/CA playbooks | High |
| Support Agent | No playbooks for support workflows or escalation handling | High |
| Product Manager Agent | No playbooks for product-oriented workflows | Medium |
| Partner Agent | No playbooks for partner engagement or channel workflows | Medium |

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
| 2.1 | 2026-02-11 | Added specialists catalog, documented agent role coverage gaps | Tatjana Frank |
| 2.0 | 2026-02-03 | Reorganized by team ownership, added RACI | |
| 1.0 | 2026-01-01 | Initial structure | |
