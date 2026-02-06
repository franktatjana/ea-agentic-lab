# CI Agent Context Template

Use this template to inject account-specific context into the CI Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  industry: "{industry}"

opportunity:
  name: "{opportunity_name}"
  stage: "{stage}"
  value: "{value}"
  competitive_status: "{NO_COMPETITION|LIGHT|ACTIVE_EVALUATION|BAKE_OFF}"
```

## Known Competitors in Account

```yaml
competitors:
  - name: "{competitor_name}"
    products: ["{product_1}", "{product_2}"]
    presence: "{INCUMBENT|EVALUATING|MENTIONED}"
    threat_level: "{HIGH|MEDIUM|LOW}"
    last_signal_date: "{date}"
```

## Competitive Signals

```yaml
signals:
  - date: "{date}"
    source: "{meeting|email|rfp|market}"
    competitor: "{competitor_name}"
    signal_type: "{MENTION|COMPARISON|PREFERENCE|THREAT}"
    content: "{signal_content}"
    severity: "{HIGH|MEDIUM|LOW}"
```

## Customer Technology Context

```yaml
technology:
  current_stack:
    - "{technology_1}"
    - "{technology_2}"

  competitor_products_used:
    - product: "{competitor_product}"
      status: "{ACTIVE|REPLACING|EVALUATING}"
```

## Active Battlecard Context

```yaml
battlecards:
  - competitor: "{competitor_name}"
    version: "{version}"
    key_differentiators:
      - "{differentiator_1}"
      - "{differentiator_2}"
    common_objections:
      - "{objection_1}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Analyze meeting notes for competitive signals"
- "Assess competitive threat level for this opportunity"
- "Prepare competitive positioning for customer presentation"
- "Identify relevant battlecard content for upcoming discussion"
