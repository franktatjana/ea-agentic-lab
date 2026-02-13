# External InfoHub Template

This template provides the starter structure for the customer-facing External InfoHub. When creating a new engagement node, copy this directory structure to `vault/{REALM}/{NODE}/external-infohub/` and populate the files as the engagement progresses.

## Directory Structure

Create the following directories and starter files. The four root-level files form the customer's first impression of the engagement and should be populated during Discovery.

```text
external-infohub/
├── engagement_overview.md       # Narrative overview: objective, why now, outcomes (populate first)
├── account_team.yaml            # Named contacts, roles, escalation path
├── engagement_timeline.yaml     # Phases, milestones, upcoming decision points
├── success_criteria.yaml        # Jointly agreed POC/evaluation criteria
├── architecture/
│   ├── solution-architecture.md
│   └── adrs/                    # Architecture Decision Records
├── deliverables/                # Proposals, SOWs, project plans
└── outcomes/
    ├── value-tracker.yaml       # Value hypotheses and realization
    └── success-metrics.yaml     # Measurable outcomes
```

## Root-Level File Templates

### engagement_overview.md

The narrative entry point. Write it so the customer immediately understands what is happening and why.

```markdown
# {Node Name}

## Objective

{2-3 sentences: what the engagement aims to achieve.}

## Why Now

{Business drivers, contract expirations, board mandates, market pressures.}

## What We're Solving

| Challenge | Impact |
|-----------|--------|
| {Problem 1} | {Business consequence} |
| {Problem 2} | {Business consequence} |

## Expected Outcomes

- {Outcome 1 with measurable target}
- {Outcome 2 with measurable target}

## Next Steps

1. {Next milestone with target date}
2. {Following milestone}
```

### account_team.yaml

```yaml
account_team:
  - name: "{Full Name}"
    role: "{Account Executive | Solution Architect | ...}"
    email: "{email}"
    phone: "{phone}"
    responsibility: "{One-line scope description}"

escalation:
  primary: "{Name}"
  executive_sponsor: "{Name, Title (email)}"
```

### engagement_timeline.yaml

```yaml
engagement_summary:
  initiative: "{Node Name}"
  start_date: "YYYY-MM-DD"
  current_phase: "{Phase name}"

phases:
  - phase: "{Phase name}"
    start: "YYYY-MM-DD"
    end: "YYYY-MM-DD"
    status: "completed | in_progress | planned"
    description: "{What happens in this phase}"

key_milestones:
  - date: "YYYY-MM-DD"
    milestone: "{Description}"
    status: "completed | upcoming"
    requires_decision: false
```

### success_criteria.yaml

```yaml
poc_scope:
  duration: "{Duration and dates}"
  environment: "{Environment description}"

technical_criteria:
  - criterion: "{What must be demonstrated}"
    validation_method: "{How it will be verified}"
    owner: "{Person name}"
    status: "pending | met | partially_met | not_met"

business_criteria:
  - criterion: "{Business requirement}"
    validation_method: "{Verification approach}"
    owner: "{Person name}"
    status: "pending"

deal_requirements:
  - "{Non-negotiable requirement}"
```

## Content Rules

All content in this hub must be appropriate for customer consumption.

**Allowed:** solution docs, ADRs, POC results, training materials, value metrics, meeting summaries
**Forbidden:** pricing, competitive intel, internal notes, agent scratchpads, vendor strategy

See [External InfoHub Reference](../../../docs/reference/external-infohub-reference.md) for detailed content rules.

## Agent Ownership

| File / Directory | Owner Agent |
|-----------|-------------|
| `engagement_overview.md` | AE Agent |
| `account_team.yaml` | AE Agent |
| `engagement_timeline.yaml` | AE Agent, CA Agent |
| `success_criteria.yaml` | SA Agent, POC Agent |
| `architecture/` | SA Agent |
| `deliverables/` | AE Agent |
| `outcomes/` | VE Agent |
