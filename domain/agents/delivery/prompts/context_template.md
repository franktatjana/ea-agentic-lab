# Delivery Agent Context Template

Use this template to inject account-specific context into the Delivery Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"

project:
  name: "{project_name}"
  phase: "{discovery|implementation|go_live|hypercare}"
  start_date: "{date}"
  target_go_live: "{date}"
  health_status: "{GREEN|YELLOW|RED}"
```

## Milestone Tracking

```yaml
milestones:
  - name: "{milestone_name}"
    planned_date: "{date}"
    actual_date: "{date_or_null}"
    status: "{COMPLETE|ON_TRACK|AT_RISK|DELAYED}"
    variance_days: {days}
```

## Current Blockers

```yaml
blockers:
  - id: "{blocker_id}"
    description: "{blocker_description}"
    severity: "{CRITICAL|HIGH|MEDIUM}"
    owner: "{owner_name}"
    blocked_since: "{date}"
    days_blocked: {days}
    resolution_eta: "{date}"
```

## Resource Status

```yaml
resources:
  - role: "{role}"
    name: "{resource_name}"
    allocation: "{percentage}"
    availability: "{AVAILABLE|CONSTRAINED|UNAVAILABLE}"
```

## Recent Status Updates

```yaml
updates:
  - date: "{date}"
    source: "{jira|meeting|email}"
    summary: "{status_summary}"
    health_change: "{IMPROVED|STABLE|DEGRADED}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Generate weekly delivery status summary for account team"
- "Assess go-live readiness and identify remaining risks"
- "Analyze blocker impact on project timeline"
- "Create handoff summary for support team"
