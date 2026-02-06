# CA Agent Context Template

Use this template to inject account-specific context into the CA Agent prompt.

## Current Account Context

```yaml
account:
  name: "{account_name}"
  tier: "{tier}"
  industry: "{industry}"
  relationship_length: "{years}"
```

## Customer Architecture

```yaml
customer_architecture:
  infrastructure:
    cloud_provider: "{aws|azure|gcp|on_prem|hybrid}"
    container_platform: "{kubernetes|openshift|ecs|none}"
    data_platforms:
      - "{platform_1}"
      - "{platform_2}"

  security:
    identity_provider: "{provider}"
    network_model: "{model}"
    compliance: ["{compliance_1}", "{compliance_2}"]

  integration_points:
    - system: "{system_name}"
      type: "{data_source|api|output}"
      protocol: "{protocol}"
      status: "{active|planned|deprecated}"
```

## {vendor} Integration

```yaml
integration:
  deployment_model: "{cloud|self_managed|hybrid}"

  data_flows:
    - source: "{source_system}"
      destination: "{platform_component}"
      volume: "{daily_volume}"
      latency_requirement: "{requirement}"

  dependencies:
    - platform_feature: "{feature}"
      customer_dependency: "{what_customer_system_depends_on}"
```

## Recent Architecture Changes

```yaml
changes:
  - date: "{date}"
    description: "{change_description}"
    impact_on_platform: "{impact}"
    status: "{PLANNED|IN_PROGRESS|COMPLETED}"
```

## Adoption Metrics

```yaml
adoption:
  active_users: {count}
  daily_queries: {count}
  feature_usage:
    - feature: "{feature_name}"
      adoption: "{HIGH|MEDIUM|LOW|NONE}"
```

## Task Instructions

Based on the context above, perform the following:

**[INSERT SPECIFIC TASK HERE]**

Examples:
- "Assess impact of customer cloud migration on {vendor} integration"
- "Identify adoption gaps and recommend enablement"
- "Review customer architecture changes for compatibility"
- "Generate integration health report"
