# PM Agent Context Template

Use this template to inject account-specific context into the PM Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  arr: "{current_arr}"
  industry: "{industry}"
  products_used:
    - "{product_1}"
    - "{product_2}"
```

## Active Feature Requests

```yaml
feature_requests:
  - id: "{request_id}"
    description: "{feature_description}"
    customer_priority: "{MUST_HAVE|SHOULD_HAVE|NICE_TO_HAVE}"
    roadmap_status: "{AVAILABLE|PLANNED|UNDER_CONSIDERATION|NOT_PLANNED}"
    planned_release: "{version_or_quarter}"
    deal_impact: "{BLOCKING|INFLUENCING|NONE}"
```

## Known Roadmap Dependencies

```yaml
dependencies:
  - feature: "{feature_name}"
    customer_need_date: "{date}"
    roadmap_date: "{date}"
    gap: "{positive_or_negative_days}"
    mitigation: "{workaround_if_any}"
```

## Customer Requirements

```yaml
requirements:
  - requirement: "{requirement_description}"
    source: "{meeting|email|rfp}"
    date: "{date}"
    status: "{MATCHED|PARTIAL|GAP}"
    platform_capability: "{existing_capability}"
```

## Product-Related Risks

```yaml
risks:
  - id: "{risk_id}"
    description: "{risk_description}"
    severity: "{HIGH|MEDIUM|LOW}"
    type: "{FEATURE_GAP|TIMELINE_MISMATCH|CAPABILITY_LIMIT}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Analyze customer requirements against current roadmap"
- "Assess feature gap impact on expansion opportunity"
- "Generate feasibility report for requested capabilities"
- "Identify workarounds for timeline mismatches"
