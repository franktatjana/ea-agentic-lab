# VE Agent Context Template
# Inject account-specific context into task prompts

```yaml
account_context:
  account_name: "{account_name}"
  industry: "{industry}"
  tier: "{strategic|enterprise|commercial}"

business_context:
  strategic_priorities:
    - "{priority_1}"
    - "{priority_2}"

  challenges:
    - "{challenge_1}"
    - "{challenge_2}"

stakeholders:
  executive_sponsor:
    name: "{name}"
    title: "{title}"
    value_language: "{what_resonates}"

  economic_buyer:
    name: "{name}"
    title: "{title}"
    decision_criteria: "{criteria}"

current_state:
  tools:
    - name: "{tool_name}"
      annual_cost: "{cost}"
      pain_points: ["{pain_1}"]

  baseline_metrics:
    - metric: "{metric_name}"
      value: "{current_value}"
      measurement: "{how_measured}"

  annual_spend: "{total_current_spend}"

value_hypothesis:
  hypotheses:
    - id: "VH-001"
      statement: "{value_hypothesis}"
      baseline: "{baseline_value}"
      target: "{target_value}"
      timeline: "{timeline}"
      confidence: "{HIGH|MEDIUM|LOW}"

opportunity_context:
  opportunity_name: "{opportunity_name}"
  stage: "{stage}"
  arr: "{arr}"
  close_date: "{close_date}"
  use_cases:
    - "{use_case_1}"
    - "{use_case_2}"

value_tracking:
  realized_value:
    - description: "{value_description}"
      amount: "{quantified_value}"
      evidence: "{evidence}"
      validated_by: "{validator}"

  value_at_risk: "{if_not_renewed}"
```
