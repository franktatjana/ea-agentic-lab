# SA Agent Context Template

Use this template to inject account-specific context into the SA Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  industry: "{industry}"
  region: "{region}"

deployment:
  environment: "{cloud|on-prem|hybrid}"
  cluster_count: {count}
  total_nodes: {count}
  data_volume: "{volume_per_day}"
  version: "{platform_version}"
```

## Current Architecture

```yaml
architecture:
  use_cases:
    - "{use_case_1}"
    - "{use_case_2}"

  integrations:
    - name: "{integration_name}"
      type: "{data_source|output|api}"
      status: "{active|planned|deprecated}"

  sizing:
    current_capacity: "{capacity}"
    utilization: "{percentage}"
    growth_projection: "{projection}"
```

## Active Technical Risks

```yaml
risks:
  - id: "{risk_id}"
    category: "{performance|security|integration|capacity}"
    description: "{risk_description}"
    severity: "{HIGH|MEDIUM|LOW}"
    status: "{OPEN|MITIGATING|MITIGATED}"
    owner: "{owner_name}"
```

## Recent Architecture Decisions

```yaml
decisions:
  - id: "{decision_id}"
    description: "{what_was_decided}"
    rationale: "{why}"
    date: "{decision_date}"
    impact: "{architecture_impact}"
```

## Pending Technical Actions

```yaml
actions:
  - description: "{action_description}"
    owner: "{owner_name}"
    due_date: "{due_date}"
    status: "{PENDING|IN_PROGRESS|BLOCKED}"
    blocking: "{what_it_blocks}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Analyze the attached meeting notes for technical signals"
- "Assess architecture readiness for Phase 2 expansion"
- "Review sizing requirements for projected growth"
- "Evaluate integration risks for new data sources"
- "Create ADR for proposed architecture change"
