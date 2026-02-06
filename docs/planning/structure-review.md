# Project Structure Review

**Last Updated:** 2026-01-21

---

## Current Architecture

### Agent Categories

| Category | Count | Purpose |
|----------|-------|---------|
| Strategic Agents | 18 | Customer-facing work execution |
| Governance Agents | 7 | Entropy reduction, quality maintenance |
| Orchestration Agent | 1 | Meta-layer process management |
| **Total** | **26** | |

### InfoHub Structure

```
infohub/
└── {realm}/                          # Account (e.g., ACME)
    ├── realm_profile.yaml            # Account-level data
    └── {node}/                       # Engagement (e.g., SECURITY_CONSOLIDATION)
        ├── node_profile.yaml         # Node-level data
        ├── meetings/                 # Meeting notes
        ├── decisions/                # Decision log
        ├── risks/                    # Risk register
        ├── actions/                  # Action tracker
        ├── architecture/             # Architecture docs
        ├── commercial/               # Commercial data
        ├── competitive/              # Competitive intel
        ├── value/                    # Value engineering
        ├── security/                 # Security docs
        └── governance/               # Governance data
```

### Core Module Structure

```
core/
├── orchestration/                    # NEW: Meta-layer
│   ├── orchestration_agent.py        # Main orchestrator
│   ├── process_parser.py             # Free-form → structured
│   ├── conflict_detector.py          # Conflict analysis
│   ├── agent_factory.py              # Agent generation
│   ├── playbook_generator.py         # Playbook generation
│   ├── version_controller.py         # Versioning
│   └── audit_logger.py               # Audit trail
├── agent_framework/
│   └── base_agent.py
├── playbook_engine/
└── workflows/
```

---

## Documentation Coverage

| Document | Location | Status |
|----------|----------|--------|
| Agent Responsibilities | [agent-responsibilities.md](agent-responsibilities.md) | ✓ Complete |
| Agent Handover Diagrams | [agent-handover-diagram.md](../agents/agent-handover-diagram.md) | ✓ Complete |
| Agent Quick Reference | [agent-quick-reference.md](../reference/agent-quick-reference.md) | ✓ Complete |
| Orchestration Architecture | [orchestration-agent.md](../agents/orchestration-agent.md) | ✓ Complete |
| Process Schema | [process-schema.md](../design/process-schema.md) | ✓ Complete |
| Conflict Rules | [conflict-rules.md](../design/conflict-rules.md) | ✓ Complete |
| Playbook Gap Analysis | [playbook-gap-analysis.md](playbook-gap-analysis.md) | ✓ Complete |

---

## Current Structure Issues (Resolved/Pending)

### 1. Root Level Clutter - RESOLVED

Planning docs moved to `docs/`

### 2. Orchestration Layer - NEW

```
core/orchestration/                   # NEW: Process management meta-layer
process_registry/                     # NEW: Process definitions & versions
├── processes/
├── versions/
├── conflicts/
└── audit/
```

### 3. Team Structure - CURRENT

```
teams/
├── account_executives/        ✓ AE Agent
├── competitive_intelligence/  ✓ CI Agent
├── customer_architects/       ✓ CA Agent
├── delivery/                  ✓ Delivery Agent
├── governance/                ✓ 7 governance agents
├── infosec/                   ✓ InfoSec Agent
├── leadership/                ✓ Senior Manager Agent
├── partners/                  ✓ Partner Agent
├── poc/                       ✓ POC Agent
├── product_managers/          ✓ PM Agent
├── professional_services/     ✓ PS Agent
├── retrospective/             ✓ Retrospective Agent (NEW)
├── rfp/                       ✓ RFP Agent
├── solution_architects/       ✓ SA Agent
├── specialists/               ✓ Specialist Agent
├── support/                   ✓ Support Agent
├── tech_signal_map/           ✓ Tech Signal Agents (NEW)
└── value_engineering/         ✓ VE Agent
```

---

## Current Structure

```
ea-agentic-lab/
├── README.md
├── CHANGELOG.md
├── app.py                          # Main application
├── requirements.txt
│
├── backend/                        # Backend services
│
├── config/                         # Global configuration
│
├── core/                           # Core engine code
│   ├── orchestration/              # Meta-layer process management
│   ├── playbook_engine/
│   ├── workflows/
│   ├── agent_framework/
│   └── tools/
│
├── EAAgenticLab/                   # Package module
│
├── teams/                          # All agent definitions (18 teams)
│   ├── account_executives/
│   ├── competitive_intelligence/
│   ├── customer_architects/
│   ├── delivery/
│   ├── governance/                 # 7 governance agents
│   ├── infosec/
│   ├── leadership/
│   ├── partners/
│   ├── poc/
│   ├── product_managers/
│   ├── professional_services/
│   ├── retrospective/              # NEW
│   ├── rfp/
│   ├── solution_architects/
│   ├── specialists/
│   ├── support/
│   ├── tech_signal_map/            # NEW
│   └── value_engineering/
│
├── playbooks/
│
├── process_registry/               # Process definitions & versions
│
├── infohub/                        # InfoHub data storage
│
├── knowledge/                      # Knowledge base
│
├── docs/
│   ├── architecture/               # System design docs
│   └── playbooks/                  # Playbook documentation
│
├── examples/
│   └── infohub/                    # Example InfoHub (ACME_CORP)
│
├── tests/
│
└── runs/                           # Execution outputs
```

---

# Missing Roles Analysis

## Governance Model Blueprint Coverage

### Pre-Sales (B-Level) - Agent Coverage

| Blueprint | Description | Agent | Status |
|-----------|-------------|-------|--------|
| B01 | AI-driven Sales Process | AE Agent | ✓ Covered |
| B02 | RFP Team Deployment | RFP Agent | ✓ Covered |
| B03 | Specialists Engagement | Specialist Agent | ✓ Covered |
| B04 | Competitive Intelligence | CI Agent | ✓ Covered |
| B05 | PM/Engineering Engagement | PM Agent | ✓ Covered |
| B07 | POC Success | POC Agent | ✓ Covered |
| B08 | Partner Engagement | Partner Agent | ✓ Covered |
| B09 | SA Playbook | SA Agent | ✓ Covered |
| B10 | Services Engagement (Pre) | **MISSING** | ✗ Need PS Agent |

### Post-Sales (C-Level) - Agent Coverage

| Blueprint | Description | Agent | Status |
|-----------|-------------|-------|--------|
| C01 | Customer Engagement | **MISSING** | ✗ Need Customer Engagement Agent |
| C02 | Customer Success | CA Agent (partial) | ⚠ Partially covered |
| C03 | Account Team Post-Sales | **MISSING** | ✗ Need Post-Sales Coordinator |
| C04 | Solution Adoption Success | CA Agent | ⚠ Partially covered |
| C05 | Services Engagement (Post) | **MISSING** | ✗ Need PS Agent |
| C06 | Support/DSE Engagement | **MISSING** | ✗ Need Support Agent |
| C07 | Customer Advocacy | **MISSING** | ✗ Need Advocacy Agent |

### Governance (A-Level) - Agent Coverage

| Blueprint | Description | Agent | Status |
|-----------|-------------|-------|--------|
| A01 | Strategic Account Governance | Governance Agents | ✓ Covered |
| A02 | Executive Sponsor Program | **MISSING** | ✗ Need Exec Sponsor Agent |
| A03 | Account Plan Evolution | AE Agent (partial) | ⚠ Partially covered |
| A04 | Internal InfoHub | Governance Agents | ✓ Covered |
| A05 | Decision Tracking | Decision Registrar | ✓ Covered |
| A06 | Value Engineering | **MISSING** | ✗ Need Value Engineering Agent |

## Agent Coverage Summary

### Strategic Agents (18) - COMPLETE

| Agent | Blueprint | Status |
|-------|-----------|--------|
| AE Agent | B01 | ✓ Documented |
| SA Agent | B09 | ✓ Documented |
| CA Agent | C02, C04 | ✓ Documented |
| CI Agent | B04 | ✓ Documented |
| VE Agent | A06 | ✓ Documented |
| Senior Manager | A01 | ✓ Documented |
| RFP Agent | B02 | ✓ Documented |
| POC Agent | B07 | ✓ Documented |
| InfoSec Agent | B09 | ✓ Documented |
| Delivery Agent | C03 | ✓ Documented |
| PS Agent | B10, C05 | ✓ Documented |
| Support Agent | C06 | ✓ Documented |
| Partner Agent | B08 | ✓ Documented |
| PM Agent | B05 | ✓ Documented |
| Specialist Agent | B03 | ✓ Documented |
| Retrospective Agent | - | ✓ NEW |
| Tech Signal Analyzer | - | ✓ NEW |
| Tech Signal Scanner | - | ✓ NEW |

### Governance Agents (7) - COMPLETE

| Agent | Purpose | Status |
|-------|---------|--------|
| Meeting Notes Agent | Decision-grade notes | ✓ Documented |
| Task Shepherd Agent | Action validation | ✓ Documented |
| Decision Registrar | Decision lifecycle | ✓ Documented |
| Nudger Agent | Follow-through enforcement | ✓ Documented |
| Risk Radar Agent | Risk surfacing | ✓ Documented |
| Reporter Agent | Executive summaries | ✓ Documented |
| Playbook Curator | Playbook governance | ✓ Documented |

### Orchestration Agent (1) - COMPLETE

| Component | Purpose | Status |
|-----------|---------|--------|
| Process Parser | Free-form → structured | ✓ Implemented |
| Conflict Detector | Conflict analysis | ✓ Implemented |
| Agent Factory | Agent generation | ✓ Implemented |
| Playbook Generator | Playbook generation | ✓ Implemented |
| Version Controller | Versioning | ✓ Implemented |
| Audit Logger | Audit trail | ✓ Implemented |

### Functions (Not Separate Agents)

| Function | Performed By | Notes |
|----------|--------------|-------|
| Executive Sponsor | AE Agent | Stakeholder management function |
| Transformation Governance | Delivery Agent | Governance function |
| Post-Sales Coordinator | Delivery Agent + CA Agent | Shared responsibility |
| Customer Advocacy | CA Agent + AE Agent | Shared responsibility |

### Blueprint Coverage

| Blueprint | Covered By | Status |
|-----------|------------|--------|
| A01 Strategic Governance | Governance Agents | ✓ |
| A02 Exec Sponsor Program | AE Agent (function) | ✓ |
| A03 Account Plan | AE + Governance | ✓ |
| A04 Internal InfoHub | All Governance | ✓ |
| A05 Decision Tracking | Decision Registrar | ✓ |
| A06 Value Engineering | VE Agent | ✓ |
| B01-B10 Pre-Sales | Strategic Agents | ✓ |
| C01-C07 Post-Sales | Strategic + Governance | ✓ |
