# Partner Agent Context Template

Use this template to inject account-specific context into the Partner Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  industry: "{industry}"
```

## Partner Engagement

```yaml
partner:
  name: "{partner_name}"
  type: "{SI|ISV|RESELLER|MSP}"
  tier: "{ELITE|PREMIER|STANDARD}"
  relationship_owner: "{partner_manager}"

engagement:
  type: "{JOINT_DELIVERY|RESALE|REFERRAL|CO_SELL}"
  start_date: "{date}"
  health_status: "{GREEN|YELLOW|RED}"
```

## Partner Responsibilities

```yaml
responsibilities:
  partner_scope:
    - "{responsibility_1}"
    - "{responsibility_2}"

  vendor_scope:
    - "{responsibility_1}"
    - "{responsibility_2}"

  joint_activities:
    - "{activity_1}"
```

## Partner Dependencies

```yaml
dependencies:
  - description: "{dependency_description}"
    owner: "{PARTNER|VENDOR|CUSTOMER}"
    status: "{ON_TRACK|AT_RISK|BLOCKED}"
    due_date: "{date}"
    impact_if_missed: "{impact}"
```

## Partner Performance

```yaml
performance:
  commitments_met: "{percentage}"
  open_issues: {count}
  last_sync: "{date}"

  recent_deliverables:
    - deliverable: "{deliverable}"
      status: "{DELIVERED|DELAYED|PENDING}"
      variance_days: {days}
```

## Communication Log

```yaml
communications:
  - date: "{date}"
    type: "{SYNC|ESCALATION|STATUS}"
    summary: "{communication_summary}"
    action_items:
      - "{action_1}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Assess partner engagement health and identify risks"
- "Review partner dependencies for upcoming milestone"
- "Generate partner status update for account team"
- "Evaluate partner alignment with account plan"
