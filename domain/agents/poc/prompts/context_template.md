# POC Agent Context Template
# Inject account-specific context into task prompts

```yaml
account_context:
  account_name: "{account_name}"
  industry: "{industry}"
  tier: "{strategic|enterprise|commercial}"

pov_context:
  pov_type: "{GUIDED|ON-SITE|PAID|LITE}"
  status: "{QUALIFICATION|ACTIVE|COMPLETE}"
  start_date: "{date}"
  end_date: "{date}"
  day_number: "{current_day}"
  total_days: "{total_days}"

opportunity_context:
  opportunity_name: "{opportunity_name}"
  stage: "{stage}"
  arr: "{opportunity_arr}"
  close_date: "{target_close_date}"

success_criteria:
  - criterion: "{criterion_1}"
    measurement: "{how_measured}"
    target: "{target_value}"
    status: "{NOT_STARTED|IN_PROGRESS|MET|NOT_MET}"
    evidence: "{evidence_if_any}"

  - criterion: "{criterion_2}"
    measurement: "{how_measured}"
    target: "{target_value}"
    status: "{status}"

stakeholders:
  technical_evaluator:
    name: "{name}"
    title: "{title}"
    engagement_level: "{HIGH|MEDIUM|LOW}"

  decision_maker:
    name: "{name}"
    title: "{title}"
    last_engagement: "{date}"

  executive_sponsor:
    name: "{name}"
    title: "{title}"

resources:
  vendor_team:
    - name: "{sa_name}"
      role: "SA"
      responsibilities: ["{responsibility}"]

    - name: "{specialist_name}"
      role: "Specialist"
      responsibilities: ["{responsibility}"]

  customer_team:
    - name: "{name}"
      role: "{role}"
      time_commitment: "{hours_per_week}"

risks:
  - risk: "{risk_description}"
    likelihood: "{HIGH|MEDIUM|LOW}"
    impact: "{HIGH|MEDIUM|LOW}"
    mitigation: "{mitigation_plan}"
    status: "{OPEN|MITIGATING|MITIGATED}"

milestones:
  - milestone: "{milestone_description}"
    date: "{target_date}"
    owner: "{owner}"
    status: "{NOT_STARTED|IN_PROGRESS|COMPLETE|AT_RISK}"

competitive_context:
  competitor: "{competitor_name}"
  competitor_pov: "{YES|NO|UNKNOWN}"
  competitive_position: "{AHEAD|BEHIND|EQUAL|UNKNOWN}"
```
