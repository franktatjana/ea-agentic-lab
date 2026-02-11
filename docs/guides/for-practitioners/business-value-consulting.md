---
order: 8
---

# Business Value Consulting Adoption

Adopted from industry enterprise SA best practices for value-based selling and business value consulting methodologies.

## Why Adopt This?

| Problem | BVC Solution |
|---------|--------------|
| Technical-only positioning | Quantified business outcomes |
| Difficulty justifying price | ROI, TCO, Cost of Inaction metrics |
| No executive engagement | C-level value conversations |
| Value claims without proof | Measurable outcomes framework |
| Renewal risk | Documented value delivered |

## Framework Components

### 1. Value Drivers (Adapt to Platform)

| Industry Driver | Platform Equivalent | Focus |
|--------------|-------------------|-------|
| Operational Efficiency | **Operational Efficiency** | Tool consolidation, reduced TCO, unified platform |
| Accelerated Delivery | **Faster Insights** | Reduced MTTR, faster search, real-time analytics |
| Security & Compliance | **Security & Compliance** | Threat detection, compliance reporting, audit trails |
| Cloud Transformation | **Digital Transformation** | Cloud-native observability, modernization enablement |

### 2. Value Quantification Types

```yaml
value_types:
  hard_savings:
    definition: "Directly measurable cost reductions"
    examples:
      - "Tool consolidation: Replacing 5 tools with platform"
      - "Infrastructure savings: Reduced storage costs"
      - "License reduction: Fewer point solutions"
    measurement: "$ saved per year"

  soft_savings:
    definition: "Productivity and efficiency gains"
    examples:
      - "Time saved: Hours per analyst per week"
      - "Faster resolution: Reduced MTTR"
      - "Automation: Manual tasks eliminated"
    measurement: "Hours saved × loaded cost"

  risk_avoidance:
    definition: "Cost of incidents prevented"
    examples:
      - "Breach prevention: Average breach cost avoided"
      - "Downtime prevention: Revenue protected"
      - "Compliance: Fines avoided"
    measurement: "Probability × Impact"

  revenue_enablement:
    definition: "Business outcomes enabled"
    examples:
      - "Faster time to market"
      - "New capabilities enabled"
      - "Customer experience improvement"
    measurement: "Revenue impact"
```

### 3. Core Calculations

```yaml
calculations:
  roi:
    formula: "(Total Benefits - Total Costs) / Total Costs × 100"
    components:
      benefits:
        - "Hard savings (Year 1-3)"
        - "Soft savings (Year 1-3)"
        - "Risk avoidance value"
      costs:
        - "Platform licensing"
        - "Implementation (PS, internal)"
        - "Training and enablement"
        - "Ongoing operations"
    presentation: "X% ROI over 3 years"

  tco:
    formula: "Sum of all costs over evaluation period"
    components:
      - "Licensing costs"
      - "Infrastructure costs"
      - "Personnel costs"
      - "Training costs"
      - "Opportunity costs"
    comparison: "Platform TCO vs Current State TCO"

  payback_period:
    formula: "Total Investment / Annual Benefit"
    presentation: "Payback in X months"

  cost_of_inaction:
    formula: "Current inefficiency × Time × Growth factor"
    components:
      - "Current tool costs continuing"
      - "Productivity loss continuing"
      - "Risk exposure continuing"
      - "Competitive disadvantage"
    presentation: "Doing nothing costs $X over 3 years"
```

[image: Workshop Timeline - pre-workshop through current state, future state, and roadmap sessions]

## Value Stream Discovery

### Discovery Levels

| Level | Duration | Depth | Use Case |
|-------|----------|-------|----------|
| **Conversational** | 30 min | Surface | Initial qualification |
| **Day in the Life** | 2-4 hours | Workflow | Use case understanding |
| **Focused Session** | Half day | Process | Specific pain points |
| **Comprehensive Workshop** | 1-2 days | Full analysis | Strategic accounts |

### Workshop Structure

```yaml
value_stream_workshop:
  pre_workshop:
    duration: "1-2 weeks before"
    activities:
      - "Identify key stakeholders"
      - "Send pre-read materials"
      - "Gather current metrics if available"
      - "Define workshop objectives"

  current_state:
    duration: "Half day"
    activities:
      - "Map current workflows"
      - "Identify all tools and handoffs"
      - "Capture pain points"
      - "Measure current metrics"
    outputs:
      - "Current state value stream map"
      - "Tool inventory"
      - "Pain point list with impact"
      - "Baseline metrics"

  future_state:
    duration: "Half day"
    activities:
      - "Design target architecture"
      - "Identify improvement opportunities"
      - "Quantify potential benefits"
      - "Define success metrics"
    outputs:
      - "Future state value stream map"
      - "Improvement opportunities"
      - "Benefit estimates"
      - "Target metrics"

  roadmap:
    duration: "2-4 hours"
    activities:
      - "Prioritize initiatives"
      - "Define phases"
      - "Assign ownership"
      - "Set timeline"
    outputs:
      - "Transformation roadmap"
      - "Phase definitions"
      - "Quick wins identified"
      - "Executive summary"
```

### Key Metrics to Capture

```yaml
metrics:
  operational:
    - name: "Mean Time to Detect (MTTD)"
      current: "{value}"
      target: "{value}"
      improvement: "{percentage}"

    - name: "Mean Time to Resolve (MTTR)"
      current: "{value}"
      target: "{value}"
      improvement: "{percentage}"

    - name: "Query response time"
      current: "{value}"
      target: "{value}"
      improvement: "{percentage}"

  efficiency:
    - name: "Analyst hours on manual tasks"
      current: "{hours/week}"
      target: "{hours/week}"
      savings: "{hours × rate}"

    - name: "Tools managed"
      current: "{count}"
      target: "{count}"
      savings: "{license + ops costs}"

    - name: "Data silos"
      current: "{count}"
      target: "{count}"
      impact: "{correlation time saved}"

  business:
    - name: "Incidents per month"
      current: "{count}"
      target: "{count}"
      impact: "{cost per incident × reduction}"

    - name: "Compliance audit time"
      current: "{hours}"
      target: "{hours}"
      savings: "{hours × rate}"

    - name: "Onboarding time"
      current: "{days}"
      target: "{days}"
      impact: "{productivity gain}"
```

## Agent Integration

### VE Agent Role

The VE Agent owns Business Value Consulting with support from other agents:

| Agent | BVC Role |
|-------|----------|
| **VE Agent** | Primary owner - calculations, modeling, presentations |
| **AE Agent** | Commercial context, deal value, negotiation support |
| **SA Agent** | Technical inputs, architecture savings, performance gains |
| **CA Agent** | Post-sales value tracking, realized value reporting |

[image: Value Stage Flow - discovery through hypothesis, proof, realization, and amplification stages]

### Value Lifecycle

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VALUE LIFECYCLE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DISCOVERY        HYPOTHESIS       PROOF           REALIZATION    AMPLIFY   │
│                                                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌────────┐ │
│  │ Value   │     │ Value   │     │ POV     │     │ Track   │    │ Case   │ │
│  │ Stream  │ ──► │ Model   │ ──► │ Results │ ──► │ Actual  │ ──►│ Study  │ │
│  │ Workshop│     │ Created │     │ Validate│     │ Value   │    │ Publish│ │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘    └────────┘ │
│                                                                              │
│  Owner: VE       Owner: VE       Owner: SA/VE    Owner: CA/VE   Owner: VE  │
│                                                                              │
│  Deliverable:    Deliverable:    Deliverable:    Deliverable:   Deliverable:│
│  Current state   Business case   POV summary     QBR value      Success    │
│  Pain points     ROI model       Metrics proved  report         story      │
│  Baseline        Presentation    Reference       CSP updates    Reference  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Sales Process Integration

### When to Engage VE

| Stage | VE Activity | Trigger |
|-------|-------------|---------|
| Stage 1-2 | Conversational discovery | AE identifies value discussion opportunity |
| Stage 2-3 | Value hypothesis | Technical discovery reveals quantifiable pain |
| Stage 3 | Value model creation | Customer requests business case |
| Stage 3-4 | Executive presentation | CFO/C-level involved in decision |
| Stage 4 | Negotiation support | Price objection or competitive pressure |
| Post-sale | Value tracking | QBR preparation, renewal |

### Qualification Criteria

```yaml
ve_engagement_criteria:
  required:
    - "Opportunity ARR > $100K"
    - "Customer willing to share metrics"
    - "Executive sponsor identified"
    - "Clear business objectives"

  preferred:
    - "Current state metrics available"
    - "Multi-stakeholder engagement"
    - "Competitive evaluation"
    - "Strategic account"

  disqualifiers:
    - "Pure technical evaluation"
    - "No business sponsor"
    - "Customer refuses metric discussion"
    - "Transaction-only relationship"
```

## InfoHub Storage

```text
infohub/{account}/
├── value/
│   ├── value_hypothesis.yaml      # Initial value model
│   ├── value_model.yaml           # Detailed calculations
│   ├── value_stream_map.md        # Current/future state
│   ├── business_case.md           # Executive presentation
│   └── value_tracking.yaml        # Realized value (post-sale)
```

## Implementation Checklist

- [x] Add value driver framework to VE Agent personality (exists in ve_personality.yaml)
- [x] Create VE Agent task prompts for each lifecycle stage (teams/value_engineering/prompts/tasks.yaml)
- [x] Add value stream discovery playbook (tasks.yaml: value_stream_workshop section)
- [x] Create ROI/TCO calculation templates (tasks.yaml: value_calculation section)
- [x] Add value tracking to CSP template (playbooks/templates/customer_success_plan_template.yaml section 8)
- [ ] Configure VE engagement triggers
- [ ] Add value metrics to Reporter dashboards

## Sources

- Industry business value consulting methodologies
- Enterprise value stream discovery practices
- Value-based selling frameworks
