# Specialist Agent Context Template

Use this template to inject account-specific context into the Specialist Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  industry: "{industry}"

engagement:
  type: "{RFP|POC|ARCHITECTURE_REVIEW|SIZING|DEEP_DIVE}"
  products_involved:
    - "{product_1}"
    - "{product_2}"
  complexity: "{STANDARD|COMPLEX|HIGHLY_COMPLEX}"
```

## Specialist Request

```yaml
request:
  requester: "{sa_name}"
  request_date: "{date}"
  domain: "{SIEM|APM|ML|OBSERVABILITY|SEARCH|SECURITY}"
  urgency: "{CRITICAL|HIGH|STANDARD}"

  scope:
    description: "{what_specialist_help_is_needed}"
    deliverables:
      - "{deliverable_1}"
      - "{deliverable_2}"
    timeline: "{expected_completion}"
```

## Technical Context

```yaml
technical:
  use_case: "{use_case_description}"

  scale:
    data_volume: "{volume}"
    users: {count}
    regions: {count}

  requirements:
    - "{requirement_1}"
    - "{requirement_2}"

  constraints:
    - "{constraint_1}"
```

## SA Assessment

```yaml
sa_context:
  why_specialist_needed: "{reason}"
  attempted_solutions: "{what_sa_tried}"
  specific_questions:
    - "{question_1}"
    - "{question_2}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Evaluate specialist engagement request for prioritization"
- "Identify which specialist domain is needed"
- "Assess complexity and estimate specialist effort"
- "Prepare specialist briefing packet"
