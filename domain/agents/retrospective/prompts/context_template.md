# Retrospective Agent Context Template
# Inject deal-specific context into task prompts

```yaml
deal_context:
  account_name: "{account_name}"
  opportunity_name: "{opportunity_name}"
  outcome: "{WON|LOST|NO_DECISION}"

  financials:
    arr: "{amount}"
    discount: "{percentage}"

  timeline:
    created_date: "{date}"
    close_date: "{date}"
    sales_cycle_days: "{number}"

team:
  ae: "{name}"
  sa: "{name}"
  specialists: ["{names}"]

competitive_context:
  competitors: ["{competitor_names}"]
  winner: "{competitor_name if loss}"

deal_history:
  key_events:
    - date: "{date}"
      event: "{event_description}"
      impact: "{positive|negative|neutral}"

  stakeholders:
    - name: "{name}"
      title: "{title}"
      role: "{champion|evaluator|blocker|decision_maker}"
      sentiment: "{supportive|neutral|negative}"

  pov_results:
    conducted: "{YES|NO}"
    outcome: "{SUCCESS|PARTIAL|FAILURE}"
    notes: "{summary}"

  communications_summary: |
    {Key themes from communications}

loss_details:
  loss_reason_crm: "{CRM loss reason}"
  competitor: "{competitor name}"
  customer_feedback: |
    {Direct customer feedback if available}

pattern_context:
  similar_retrospectives:
    - retro_id: "{id}"
      account: "{account}"
      outcome: "{outcome}"
      key_learnings: ["{learnings}"]

  known_patterns:
    - pattern: "{pattern description}"
      frequency: "{number of occurrences}"
      recommendations: ["{existing recommendations}"]
```
