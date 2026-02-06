# InfoHub

The InfoHub is the centralized knowledge layer for the EA Agentic Lab. It provides structured, AI-accessible storage for account intelligence, decisions, risks, and artifacts.

## Purpose

InfoHub replaces fragmented documents with a structured knowledge system that:

- **Enables faster onboarding** - New team members can quickly understand account context
- **Supports AI agents** - Structured data allows agents to access and update knowledge
- **Maintains knowledge continuity** - Information persists across team changes
- **Facilitates best practice adoption** - Patterns can be identified and shared

## Directory Structure

### Node-Level Structure

Each Node (initiative/project) within a Realm has its own InfoHub:

```text
infohub/{realm}/{node}/
├── node_profile.yaml               # Node configuration and status
├── context/
│   ├── node_overview.yaml          # Node background, industry, tier
│   ├── stakeholder_map.yaml        # Key contacts and relationships
│   └── engagement_history.md       # Timeline of key interactions
│
├── decisions/
│   ├── decision_log.yaml           # All decisions with context
│   └── adrs/                       # Architecture Decision Records
│       └── ADR-001_*.md
│
├── risks/
│   ├── risk_register.yaml          # Active risks with status
│   └── risk_history.yaml           # Resolved risks for learning
│
├── architecture/
│   ├── current_state.yaml          # Current deployment architecture
│   ├── target_state.yaml           # Planned architecture
│   └── diagrams/                   # Architecture diagrams
│
├── value/
│   ├── value_hypothesis.yaml       # Pre-sales value model
│   ├── value_model.yaml            # Detailed calculations
│   ├── value_stream_map.md         # Current/future state mapping
│   ├── business_case.md            # Executive presentation
│   └── value_tracking.yaml         # Realized value (post-sale)
│
├── opportunities/
│   └── {opportunity_name}/
│       ├── discovery.yaml          # Discovery findings
│       ├── requirements.yaml       # Customer requirements
│       ├── success_criteria.yaml   # POV success criteria
│       ├── poc_success_plan.yaml   # POC Success Plan (master)
│       ├── commitment_tracker.yaml # Customer commitment status
│       ├── poc_status/             # Daily status updates
│       │   └── status_{date}.yaml
│       ├── poc_results/            # Final POC results
│       │   └── poc_summary.yaml
│       └── checkpoint_notes/       # POC review notes
│           ├── kickoff.md
│           ├── midpoint.md
│           └── conclusion.md
│
├── retrospectives/
│   └── retro_{date}_{outcome}.yaml # Win/loss retrospectives
│
├── csp/
│   └── customer_success_plan.yaml  # Customer Success Plan
│
├── journey/
│   ├── customer_journey_map.yaml   # Master journey map
│   ├── stakeholder_journeys/       # Per-stakeholder views
│   │   ├── executive_journey.yaml
│   │   └── users_journey.yaml
│   └── touchpoint_log.yaml         # Interaction history
│
├── voc/
│   ├── voc_tracker.yaml            # Master VoC tracking
│   ├── surveys/                    # Survey responses
│   │   └── nps_q1_2026.yaml
│   ├── feedback/                   # Qualitative feedback
│   │   └── interview_notes.md
│   └── actions/                    # Closed-loop tracking
│       └── action_log.yaml
│
└── competitive/
    └── competitive_context.yaml    # Competitive intelligence
```

### Note on Knowledge Base

Reusable reference material (best practices, lessons learned, patterns, templates) is stored separately in the **Knowledge Base** (`knowledge/`), not in InfoHub. InfoHub is exclusively for account-specific operational data.

See [Knowledge Base](../knowledge/README.md) for global reference material.

## File Formats

### YAML Files

Used for structured data that agents read/write:

- Node context
- Stakeholder maps
- Risk registers
- Decision logs
- Value tracking

### Markdown Files

Used for narrative content and documentation:

- Architecture Decision Records (ADRs)
- Meeting summaries
- Business cases
- Value stream maps

## Agent Interactions

### Reading from InfoHub

Agents read InfoHub data to:

- Understand Node context before generating outputs
- Check for existing decisions before recommending new ones
- Review risk register when assessing deal health
- Access stakeholder information for meeting prep

### Writing to InfoHub

Agents write to InfoHub to:

- Log new decisions from meetings
- Register identified risks
- Update value tracking metrics
- Store retrospective findings

## Access Patterns

| Agent | Primary Read | Primary Write |
|-------|--------------|---------------|
| AE Agent | context/, opportunities/ | decisions/, risks/ |
| SA Agent | architecture/, decisions/, journey/ | architecture/, decisions/, journey/ |
| CA Agent | csp/, value/, journey/, voc/ | csp/, value/, journey/, voc/ |
| VE Agent | value/, context/ | value/ |
| POC Agent | opportunities/, architecture/, csp/ | opportunities/ (poc_success_plan, poc_status/, poc_results/, checkpoint_notes/) |
| Retrospective Agent | opportunities/, competitive/ | retrospectives/ |
| Risk Radar Agent | risks/ | risks/ |
| Decision Registrar | decisions/ | decisions/ |
| Meeting Notes Agent | All | voc/feedback/, journey/ |

## Best Practices

### Naming Conventions

- Realm directories: `{realm_name}` (lowercase, underscores)
- Node directories: `{node_name}` (lowercase, underscores)
- Date prefixes: `YYYY-MM-DD_` for chronological files
- Outcome suffixes: `_won`, `_lost`, `_active` for status

### Content Guidelines

1. **Keep data structured** - Use YAML for machine-readable content
2. **Avoid duplication** - Link to authoritative sources
3. **Include timestamps** - Track when data was last updated
4. **Maintain history** - Don't delete, archive instead
5. **Use templates** - Ensure consistency with provided templates

## Related Documentation

- [Core Entities](../docs/architecture/core-entities.md) - Realm/Node hierarchy
- [Agent Responsibilities](../docs/architecture/agent-responsibilities.md) - How agents use InfoHub
- [Knowledge Base](../knowledge/README.md) - Best practices, patterns, and reference material
