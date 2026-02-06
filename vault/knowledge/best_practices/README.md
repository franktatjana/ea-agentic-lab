# Best Practices Library

This directory contains standardized best practice documentation for SA use.

## Structure

```text
best_practices/
├── security/           # Security Analytics, SIEM, Threat Detection
├── observability/      # APM, Logging, Metrics, Tracing
├── search/             # Enterprise Search, RAG, Vector Search
└── platform/           # Cross-cutting platform best practices
```

## Template

All best practices follow the standard template: `playbooks/templates/best_practice_template.yaml`

## Best Practice Document Structure

Each best practice document includes 4 key sections:

### 1. Customer Value

- **Why it matters**: Business outcomes, ROI indicators, pain points addressed
- **Target personas**: Who benefits and their specific value messages
- **Customer quotes**: Real-world validation

### 2. Best Practice Details

- **Implementation overview**: Phases, activities, duration
- **Documentation links**: Links to official docs (never replicate content)
- **Configuration highlights**: Key settings with doc references
- **Prerequisites**: What's needed before starting

### 3. Demo & Preparation Resources

- **Demo videos**: URLs, duration, audience type
- **Demo environments**: How to access, what to show
- **Presentation decks**: Location and audience
- **Meeting prep checklist**: What to do before customer meetings

### 4. Customer Q&A

- **Frequently asked**: Common questions with answers
- **Technical deep-dive**: Complex questions with escalation triggers
- **Competitive questions**: How to position vs competitors
- **Objection handling**: Common objections with responses
- **Questions to ask**: Discovery and qualification questions

## Creating a New Best Practice

1. Copy template: `playbooks/templates/best_practice_template.yaml`
2. Place in appropriate solution area directory
3. Fill in all sections following the guidelines
4. Link to documentation - do not replicate content
5. Verify all links are valid
6. Add to the index below

## Best Practices Index

### Security

| Best Practice | Status | Last Updated | Author |
|--------------|--------|--------------|--------|
| (none yet) | - | - | - |

### Observability

| Best Practice | Status | Last Updated | Author |
|--------------|--------|--------------|--------|
| (none yet) | - | - | - |

### Search

| Best Practice | Status | Last Updated | Author |
|--------------|--------|--------------|--------|
| (none yet) | - | - | - |

### Platform

| Best Practice | Status | Last Updated | Author |
|--------------|--------|--------------|--------|
| (none yet) | - | - | - |

## SA Agent Tasks

Use these SA Agent tasks for best practice work:

- `create_best_practice` - Create new best practice documentation
- `meeting_prep_from_best_practice` - Prepare for meeting using best practice
- `generate_qa_content` - Create/update Q&A section
- `update_best_practice` - Refresh existing best practice
- `best_practice_gap_analysis` - Identify missing best practices

## Quality Standards

- All links must be verified working
- Demo videos must be current (check last_verified date)
- Q&As should be updated based on recent customer interactions
- Review quarterly for accuracy
