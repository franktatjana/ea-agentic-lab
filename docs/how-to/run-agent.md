# How to Run an Agent

Step-by-step guide for running agents in the EA Agentic Lab.

## Agent Overview

The system includes 24 agents in three categories:

| Category | Count | Purpose |
|----------|-------|---------|
| Strategic Agents | 15 | Exercise judgment, apply frameworks |
| Governance Agents | 8 | Enforce process, maintain artifacts |
| Orchestration Agent | 1 | Coordinate multi-agent workflows |

## Currently Implemented Agents

| Agent | Script | Status |
|-------|--------|--------|
| SA Agent | `run_sa_agent.py` | Implemented |
| CA Agent | `run_ca_agent.py` | Implemented |

Other agents are configured but await implementation.

## Running the SA Agent

The Solutions Architect Agent processes technical intelligence from meeting notes and daily operations.

### What It Does

- Extracts technical signals (decisions, risks, architecture)
- Identifies stakeholders and technologies
- Generates account technical profiles
- Creates risk register entries
- Triggers escalations for critical issues

### Basic Usage

```bash
cd ea-agentic-lab
source application/venv/bin/activate

# Run for all realms
python application/scripts/run_sa_agent.py

# Run for specific realm
python application/scripts/run_sa_agent.py --realm ACME_CORP

# Run with verbose output
python application/scripts/run_sa_agent.py --verbose
```

### Expected Outputs

```
vault/infohub/{realm}/MAIN/
├── context/
│   └── account_profile.md      # Technical summary
├── risks/
│   └── risk_register.yaml      # Detected risks
├── decisions/
│   └── decision_log.yaml       # Technical decisions
└── _Dashboard.md               # Overview
```

### Signal Types Detected

| Signal | Example Trigger |
|--------|-----------------|
| Technical Decision | "DECISION: Use centralized agent with Fleet" |
| Architecture Risk | "concerned about migration complexity" |
| Technology Mention | Tags: tech/platform, tech/competitor |
| Stakeholder | Tags: person/jennifer_liu |
| Competitive | Tags: competitor/legacysiem |

## Running the CA Agent

The Customer Architect Agent monitors customer health and adoption.

### What It Does

- Tracks adoption signals and health indicators
- Detects churn risk signals
- Monitors customer satisfaction
- Identifies expansion opportunities
- Generates health assessments

### Basic Usage

```bash
# Run for all realms
python application/scripts/run_ca_agent.py

# Run for specific realm
python application/scripts/run_ca_agent.py --realm GLOBEX

# Run health check only
python application/scripts/run_ca_agent.py --health-only
```

### Expected Outputs

```
vault/infohub/{realm}/MAIN/
├── governance/
│   └── health_score.yaml       # Health assessment
├── journey/
│   └── adoption_status.yaml    # Adoption tracking
└── risks/
    └── risk_register.yaml      # Churn/health risks
```

### Signal Types Detected

| Signal | Example Trigger |
|--------|-----------------|
| Usage Decline | "30% decline in active users" |
| Champion Loss | "Michael Torres left the company" |
| Satisfaction Drop | "frustrated", "disappointed" |
| Competitive Threat | "evaluating ObservabilityVendorA" |
| Budget Concern | "CFO questioning spend" |

## Agent Configuration

### Agent YAML Structure

Agents are configured in `domain/agents/{team}/agents/{agent}.yaml`:

```yaml
agent:
  name: SA Agent
  version: "2.0"
  type: strategic
  team: solution_architects

capabilities:
  - technical_analysis
  - risk_detection
  - architecture_review

signal_detection:
  patterns:
    - pattern: "DECISION:"
      type: decision
      priority: high

    - pattern: "(risk|concern|worried|blocking)"
      type: risk
      priority: medium

escalation:
  triggers:
    - condition: "risk.severity == 'critical'"
      target: senior_manager

output:
  formats:
    - markdown
    - yaml
  destinations:
    - infohub
```

### Personality Files

Each agent has a personality defining behavior:

`domain/agents/{team}/personalities/{agent}_personality.yaml`

```yaml
personality:
  name: SA Agent
  role: Solutions Architect

  what_i_do:
    - Extract technical intelligence from notes
    - Identify architecture decisions and risks
    - Track technology mentions and dependencies

  what_i_do_not:
    - Make commercial decisions
    - Override human judgment
    - Invent information not in source

  communication_style:
    tone: professional, technical
    format: structured, evidence-based
    length: concise

  anti_hallucination:
    - Never invent client names not in source
    - Always cite source for facts
    - Use qualifiers when uncertain
```

## Running Multiple Agents

### Sequential Execution

```bash
# Run SA first, then CA
python application/scripts/run_sa_agent.py --realm ACME_CORP
python application/scripts/run_ca_agent.py --realm ACME_CORP
```

### Workflow Execution

Use the governance orchestrator for coordinated runs:

```bash
python application/scripts/run_workflow.py \
  --workflow risk_review \
  --realm GLOBEX
```

## Agent Outputs Explained

### Risk Register (risk_register.yaml)

```yaml
risks:
  - id: "RISK-2026-001"
    title: "Migration complexity"
    description: "200+ LegacySIEM dashboards need migration"
    severity: high
    probability: medium
    category: technical
    status: open
    owner: SA Agent
    source: "2026-01-15 Technical Deep Dive"
    mitigation: "Phased migration approach with automation"
    due_date: "2026-02-15"
    created: "2026-01-15"
```

### Decision Log (decision_log.yaml)

```yaml
decisions:
  - id: "DEC-2026-001"
    date: "2026-01-15"
    title: "Use centralized agent with Fleet"
    description: "Centralized agent management for simplified operations"
    decision_maker: "Jennifer Liu"
    status: Approved
    rationale: "Simplifies operations significantly"
    source: "2026-01-15 Technical Deep Dive"
    affected_scope:
      - deployment
      - operations
```

### Health Score (health_score.yaml)

```yaml
health_score:
  overall: 75
  status: YELLOW
  trend: stable

  components:
    usage: 80
    engagement: 70
    support: 75
    sentiment: 72

  alerts: []

  last_updated: "2026-01-22"
  assessed_by: CA Agent
```

## Customizing Agent Behavior

### Adding Signal Patterns

Edit `domain/agents/{team}/agents/{agent}.yaml`:

```yaml
signal_detection:
  patterns:
    # Add new pattern
    - pattern: "(blocked|stuck|impediment)"
      type: blocker
      priority: high
      action: escalate
```

### Adjusting Thresholds

Edit `domain/config/playbook_thresholds.yaml`:

```yaml
sa_agent:
  risk_escalation:
    critical_keywords: ["data loss", "security breach", "outage"]
    escalation_delay_hours: 0

ca_agent:
  health_thresholds:
    red: 40
    yellow: 70
```

## Troubleshooting

### Agent produces no output

1. Check source data exists:
   ```bash
   ls vault/infohub/{realm}/meetings/
   ```

2. Verify YAML frontmatter in notes:
   ```yaml
   ---
   date: 2026-01-15
   tags:
     - client/REALM_NAME
   ---
   ```

3. Check agent logs:
   ```bash
   cat data/{realm}/logs/sa_agent.log
   ```

### Agent misses signals

1. Review signal patterns in agent config
2. Check if content matches expected patterns
3. Try with `--verbose` flag

### Agent hallucinates content

1. Review personality anti-hallucination rules
2. Check that source data is properly tagged
3. Ensure agent is citing sources correctly

## Related Documentation

- [Agent Architecture](../agents/agent-architecture.md)
- [Agent Responsibilities](../agents/agent-responsibilities.md)
- [Agent Quick Reference](../reference/agent-quick-reference.md)
