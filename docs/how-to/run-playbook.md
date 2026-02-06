# How to Run a Playbook

Step-by-step guide for executing playbooks in the EA Agentic Lab.

## What Are Playbooks?

Playbooks operationalize consulting frameworks (McKinsey, BCG, TOGAF, etc.) as executable agent workflows. They transform raw data into structured strategic outputs.

**Two types:**
- **Strategic Playbooks** (PB_xxx): Holistic analysis, end-to-end synthesis
- **Operational Playbooks** (OP_xxx): Event-driven, tactical procedures

## Available Playbooks

### Strategic Playbooks (Production)

| ID | Framework | Agent | Use Case |
|----|-----------|-------|----------|
| PB_001 | Three Horizons | AE Agent | Growth strategy |
| PB_101 | TOGAF ADR | SA Agent | Architecture decisions |
| PB_201 | SWOT Analysis | Cross-functional | Strategic assessment |
| PB_301 | Value Engineering | VE Agent | ROI/business case |
| PB_401 | Customer Health | CA Agent | Retention monitoring |
| PB_701 | Five Forces | CI Agent | Competitive analysis |
| PB_801 | MEDDPICC | AE Agent | Deal qualification |
| PB_802 | TECHDRIVE | SA Agent | Technical qualification |

### Operational Playbooks

| ID | Purpose | Trigger |
|----|---------|---------|
| OP_RSK_001 | Register risk | Risk identified |
| OP_ACT_001 | Create action | Action mentioned |
| OP_ESC_001 | Escalate blocker | Action overdue |
| OP_MTG_001 | Process meeting | Meeting notes added |
| OP_HLT_001 | Health alert | Score drops |

## Running a Playbook

### Method 1: Via Playbook Executor

```bash
python application/scripts/run_playbook.py \
  --playbook PB_201 \
  --realm ACME_CORP \
  --node MAIN
```

### Method 2: Via Agent

Agents automatically trigger playbooks based on context:

```bash
# SA Agent will run TOGAF ADR when it detects architecture decisions
python application/scripts/run_sa_agent.py --realm ACME_CORP

# CA Agent will run Health Score playbook for health assessment
python application/scripts/run_ca_agent.py --realm GLOBEX
```

### Method 3: Manual Trigger

```python
from core.playbook_engine import PlaybookExecutor

executor = PlaybookExecutor()
result = executor.run(
    playbook_id="PB_201",
    realm_id="ACME_CORP",
    node_id="MAIN",
    context={"focus_area": "competitive"}
)
```

## Example: SWOT Analysis (PB_201)

### Step 1: Ensure Input Data Exists

The SWOT playbook requires:
- Meeting notes in `infohub/{realm}/{node}/meetings/`
- Account context in `infohub/{realm}/{node}/context/`

### Step 2: Run the Playbook

```bash
python application/scripts/run_playbook.py \
  --playbook PB_201 \
  --realm ACME_CORP \
  --node MAIN \
  --focus competitive
```

### Step 3: Review Output

The playbook generates:

```
vault/infohub/ACME_CORP/MAIN/frameworks/
└── swot_analysis_2026-01-22.yaml
```

Output structure:
```yaml
framework: SWOT Analysis
generated: 2026-01-22T10:30:00
agent: SA Agent

strengths:
  - title: "Technical champion identified"
    evidence: "Jennifer Liu has prior platform experience"
    source: "2026-01-10 Field Notes"
    impact: high

weaknesses:
  - title: "Migration complexity"
    evidence: "200+ LegacySIEM dashboards to migrate"
    source: "2026-01-15 Technical Deep Dive"
    impact: high

opportunities:
  - title: "Cost reduction driver"
    evidence: "$1.2M current spend, 45% savings potential"
    source: "2026-01-08 Discovery Call"
    impact: high

threats:
  - title: "LegacySIEM counter-offer expected"
    evidence: "Rep offering aggressive discounts"
    source: "2026-01-10 Field Notes"
    impact: medium

recommendations:
  - action: "Accelerate POC timeline"
    rationale: "Preempt LegacySIEM counter-offer"
    priority: high
    owner: SA Agent
```

## Example: Customer Health Score (PB_401)

### Step 1: Check Health Indicators

Required data:
- Usage metrics (if available)
- Support tickets
- Engagement history
- Stakeholder sentiment

### Step 2: Run Health Assessment

```bash
python application/scripts/run_playbook.py \
  --playbook PB_401 \
  --realm GLOBEX \
  --node MAIN
```

### Step 3: Review Health Score

Output in `governance/health_score.yaml`:

```yaml
health_score:
  overall: 35
  status: RED
  trend: declining

  components:
    usage:
      score: 30
      trend: -29%
      notes: "30% decline in active users"

    engagement:
      score: 25
      trend: declining
      notes: "Champion departed, exec disengaged"

    support:
      score: 40
      trend: declining
      notes: "Multiple escalations, SLA misses"

    sentiment:
      score: 35
      trend: declining
      notes: "VP Ops frustrated, competitive evaluation"

  alerts:
    - type: churn_risk
      severity: critical
      message: "Account at serious risk of churn"

    - type: competitive_threat
      severity: high
      message: "Active ObservabilityVendorA evaluation"

  recommendations:
    - action: "Executive escalation"
      owner: Sales Director
      due: immediate

    - action: "Support remediation plan"
      owner: Support Manager
      due: 48 hours
```

## Playbook Customization

### Adjusting Thresholds

Edit `domain/config/playbook_thresholds.yaml`:

```yaml
health_score:
  red_threshold: 40
  yellow_threshold: 70
  green_threshold: 85

risk_assessment:
  critical_threshold: 80
  high_threshold: 60
```

### Adding Custom Logic

Playbooks use Decision Logic Language (DLL):

```yaml
decision_logic:
  rules:
    - condition: "$.health_score < 40"
      action: "flag_churn_risk"
      severity: critical

    - condition: "$.competitor_mentions > 2"
      action: "trigger_competitive_response"
      severity: high
```

## Troubleshooting

### Playbook doesn't run

- Check playbook exists: `ls domain/playbooks/executable/`
- Verify realm/node exist in InfoHub
- Check required inputs are present

### Output is empty or minimal

- Ensure source data has proper tags
- Check agent personalities are configured
- Review playbook validation rules

### Errors in DLL evaluation

- Boolean operators (AND/OR) have known issues
- Use single conditions where possible
- Check JSONPath syntax

## Best Practices

1. **Start with SWOT**: It's the simplest strategic playbook
2. **Check inputs first**: Playbooks need quality input data
3. **Review before acting**: All outputs are recommendations, not directives
4. **Iterate**: Run playbooks as new data comes in
5. **Combine playbooks**: Use Health Score + SWOT for complete picture

## Related Documentation

- [Playbook Framework](../playbooks/playbook-framework.md)
- [Playbook Execution Specification](../playbooks/playbook-execution-specification.md)
- [Playbook Catalog](../reference/playbook-catalog.md)
