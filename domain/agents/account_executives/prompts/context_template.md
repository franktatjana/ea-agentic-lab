# AE Agent Context Template

Use this template to inject account-specific context into the AE Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"  # Strategic, Enterprise, Commercial
  arr: "{current_arr}"
  industry: "{industry}"
  region: "{region}"

opportunity:
  name: "{opportunity_name}"
  stage: "{current_stage}"
  value: "{opportunity_value}"
  close_date: "{expected_close_date}"
  days_in_stage: {days_in_stage}
```

## Key Stakeholders

```yaml
stakeholders:
  - name: "{stakeholder_name}"
    role: "{role}"
    influence: "{HIGH|MEDIUM|LOW}"
    sentiment: "{CHAMPION|SUPPORTER|NEUTRAL|SKEPTIC|BLOCKER}"
    last_contact: "{date}"
```

## Recent Commercial Signals

```yaml
signals:
  - date: "{signal_date}"
    source: "{email|meeting|slack|crm}"
    content: "{signal_content}"
    severity: "{HIGH|MEDIUM|LOW}"
```

## Active Risks

```yaml
risks:
  - id: "{risk_id}"
    description: "{risk_description}"
    severity: "{HIGH|MEDIUM|LOW}"
    status: "{OPEN|MITIGATING|MITIGATED}"
    owner: "{owner_name}"
```

## Pending Actions

```yaml
actions:
  - description: "{action_description}"
    owner: "{owner_name}"
    due_date: "{due_date}"
    status: "{PENDING|IN_PROGRESS|BLOCKED}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Analyze the attached meeting notes for commercial signals"
- "Generate a meeting brief for tomorrow's call with {stakeholder}"
- "Assess pipeline health and identify risks"
- "Create a forecast update based on recent signals"
