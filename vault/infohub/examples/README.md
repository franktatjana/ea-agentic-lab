# Examples

This directory contains example data demonstrating how the EA Agentic Lab structures work in practice.

## ACME Account Example

The `infohub/ACME/` directory contains a complete example of a strategic account InfoHub:

```text
examples/infohub/ACME/
├── realm_profile.yaml                    # Account-level profile
│
└── SECURITY_CONSOLIDATION/               # Opportunity/Node level
    ├── node_profile.yaml                 # Node profile
    ├── README.md                         # Node overview
    │
    ├── actions/
    │   └── action_tracker.yaml           # Action items tracking
    │
    ├── decisions/
    │   └── decision_log.yaml             # Decision records
    │
    ├── risks/
    │   └── risk_register.yaml            # Risk register
    │
    ├── stakeholders/
    │   ├── sarah_chen.yaml               # CTO profile
    │   └── klaus_hoffman.yaml            # CISO profile
    │
    ├── governance/
    │   ├── operating_cadence.yaml        # Meeting cadence
    │   └── health_score.yaml             # Account health metrics
    │
    └── value/
        └── value_tracker.yaml            # Value tracking
```

## Example Files

### Realm Profile (`realm_profile.yaml`)

Account-level information:

- Account name, industry, tier
- Executive sponsors
- Strategic themes
- Annual revenue target

### Node Profile (`node_profile.yaml`)

Opportunity-level information:

- Opportunity name and stage
- Key stakeholders
- Timeline and milestones
- Success criteria

### Stakeholder Profiles

Individual stakeholder files contain:

- Contact information
- Role and influence
- Communication preferences
- Engagement history
- Sentiment tracking

### Decision Log

Tracks decisions with:

- Decision ID and date
- Context and rationale
- Alternatives considered
- Owner and stakeholders
- Status and follow-up

### Risk Register

Tracks risks with:

- Risk ID and description
- Likelihood and impact
- Owner and mitigation
- Status and review dates

### Action Tracker

Tracks action items with:

- Action ID and description
- Owner and due date
- Status and dependencies
- Related decisions/risks

### Health Score

Tracks account health:

- Overall health score
- Component scores (engagement, technical, commercial)
- Trend indicators
- Alert thresholds

### Value Tracker

Tracks value realization:

- Value hypotheses
- Baseline and target metrics
- Realized value
- Evidence and validation

## Using Examples

### Copy for New Account

```bash
cp -r examples/infohub/ACME infohub/NEW_ACCOUNT
```

Then update:

1. `realm_profile.yaml` with account details
2. Create node directories for opportunities
3. Add stakeholder profiles
4. Initialize risk register and action tracker

### Testing Playbooks

Use example data to test playbook execution:

```python
from core.playbook_engine import PlaybookExecutor

executor = PlaybookExecutor()
result = executor.execute(
    playbook="playbooks/executable/PB_401_customer_health_score.yaml",
    context_path="examples/infohub/ACME/SECURITY_CONSOLIDATION/"
)
```

### Agent Testing

Use example data as context for agent testing:

```python
from core.orchestration import AgentFactory

factory = AgentFactory()
sa_agent = factory.create("teams/solution_architects/agents/sa_agent.yaml")

result = sa_agent.process(
    task="architecture_health_check",
    context_path="examples/infohub/ACME/SECURITY_CONSOLIDATION/"
)
```

## Adding Examples

When adding new examples:

1. Follow the existing directory structure
2. Use realistic but fictional data
3. Include all required fields per templates
4. Add a README.md explaining the scenario
5. Update this README with the new example

## Related Documentation

- [InfoHub README](../infohub/README.md) - InfoHub structure
- [Core Entities](../docs/core-entities.md) - Realm/Node definitions
- [Templates](../playbooks/templates/) - Template files
