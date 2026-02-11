# External InfoHub Template

This template provides the starter structure for the customer-facing External InfoHub. When creating a new engagement node, copy this directory structure to `vault/{REALM}/{NODE}/external-infohub/` and populate the files as the engagement progresses.

## Directory Structure

Create the following directories and starter files:

```text
external-infohub/
├── overview.md                # Engagement summary (populate first)
├── context/
│   ├── business-context.md    # Business drivers and objectives
│   ├── technical-context.md   # Current environment, constraints
│   └── stakeholder-map.yaml   # Customer-facing stakeholder profiles
├── architecture/
│   ├── solution-architecture.md
│   └── adrs/                  # Architecture Decision Records
├── decisions/
│   └── decision-log.yaml      # Customer-appropriate decisions
├── opportunities/
│   ├── requirements.yaml      # Captured requirements
│   └── poc-results.md         # POC outcomes (if applicable)
├── journey/
│   ├── engagement-timeline.md # Key milestones and dates
│   ├── meeting-summaries/     # External meeting summaries
│   └── training/              # Training materials
└── value/
    ├── value-tracker.yaml     # Value hypotheses and realization
    └── success-metrics.yaml   # Measurable outcomes
```

## Overview Template

Start with `overview.md` as the entry point for the customer:

```markdown
# {Node Name} - Engagement Overview

## Engagement Summary

| Attribute | Value |
|-----------|-------|
| **Realm** | {REALM_ID} |
| **Node** | {NODE_ID} |
| **Archetype** | {archetype_name} |
| **Domain** | {domain} |
| **Start Date** | {YYYY-MM-DD} |
| **Status** | Active |

## Objectives

{2-3 sentences describing what the engagement aims to achieve.}

## Navigation

- [Business Context](context/business-context.md)
- [Solution Architecture](architecture/solution-architecture.md)
- [Value Tracker](value/value-tracker.yaml)
```

## Content Rules

All content in this hub must be appropriate for customer consumption.

**Allowed:** solution docs, ADRs, POC results, training materials, value metrics, meeting summaries
**Forbidden:** pricing, competitive intel, internal notes, agent scratchpads, vendor strategy

See [External InfoHub Reference](../../../docs/reference/external-infohub-reference.md) for detailed content rules.

## Agent Ownership

| Directory | Owner Agent |
|-----------|-------------|
| `context/` | RFP Agent |
| `architecture/` | SA Agent |
| `decisions/` | Decision Registrar |
| `opportunities/` | AE Agent |
| `journey/` | Delivery, PS, POC Agents |
| `value/` | VE Agent |
