# Internal InfoHub Template

This template provides the starter structure for the vendor-internal InfoHub. When creating a new engagement node, copy this directory structure to `vault/{REALM}/{NODE}/internal-infohub/` and initialize the YAML data files.

## Directory Structure

Create the following directories and starter files:

```text
internal-infohub/
├── risks/
│   ├── risk-register.yaml     # Active risk register (initialize empty)
│   └── risk-history/          # Historical risk snapshots
├── stakeholders/
│   ├── stakeholder-profiles.yaml  # Profiles with internal notes
│   └── power-map.md              # Influence and decision dynamics
├── competitive/
│   ├── competitive-landscape.md   # Market positioning
│   ├── battlecards/               # Competitor-specific battlecards
│   └── displacement-strategy.md   # Strategy (if applicable)
├── governance/
│   ├── health-score.yaml          # Current health metrics
│   ├── operating-cadence.md       # Meeting rhythm and checkpoints
│   └── escalation-history/        # Escalation records
├── frameworks/
│   ├── swot/                      # SWOT analysis outputs
│   ├── three-horizons/            # Three Horizons outputs
│   ├── value-engineering/         # Value Engineering outputs
│   └── pestle/                    # PESTLE analysis outputs
├── actions/
│   ├── action-tracker.yaml        # Active actions (initialize empty)
│   └── completed/                 # Completed action archive
├── decisions/
│   └── internal-decision-log.yaml # Decisions with full internal context
└── agent_work/                    # Agent scratchpads (per-agent dirs)
```

## Starter Data Files

Initialize these YAML files with empty structures so agents can begin writing immediately.

### risk-register.yaml

```yaml
# Risk Register - {NODE_ID}
# Maintained by: Risk Radar Agent
risks: []
last_updated: "{YYYY-MM-DD}"
```

### action-tracker.yaml

```yaml
# Action Tracker - {NODE_ID}
# Maintained by: Task Shepherd Agent
actions: []
last_updated: "{YYYY-MM-DD}"
```

### health-score.yaml

```yaml
# Health Score - {NODE_ID}
# Maintained by: Governance Agents
overall_score: null
status: "pending_initial_assessment"
dimensions:
  technical: null
  commercial: null
  relationship: null
  adoption: null
last_calculated: null
```

### internal-decision-log.yaml

```yaml
# Internal Decision Log - {NODE_ID}
# Maintained by: Decision Registrar Agent
decisions: []
last_updated: "{YYYY-MM-DD}"
```

## Content Rules

All content in this hub is vendor-internal and must never be shared with the customer.

**Allowed:** competitive intel, candid risks, internal notes, pricing strategy, agent scratchpads, governance metrics
**Forbidden in this hub:** customer-facing docs (use External InfoHub), anonymized patterns (use Global Knowledge Vault)

See [Internal InfoHub Reference](../../../docs/reference/internal-infohub-reference.md) for detailed content rules.

## Agent Ownership

| Directory | Owner Agent |
|-----------|-------------|
| `risks/` | Risk Radar |
| `stakeholders/` | AE Agent |
| `competitive/` | CI Agent |
| `governance/` | Governance Agents |
| `frameworks/` | Strategic Playbooks |
| `actions/` | Task Shepherd, Nudger |
| `decisions/` | Decision Registrar |
| `agent_work/` | All Agents |
