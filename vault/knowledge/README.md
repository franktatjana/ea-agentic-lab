# Knowledge Base

The Knowledge Base contains reusable reference material, best practices, and aggregated learnings that are **not account-specific**. This is separate from InfoHub, which stores account/client-specific operational data.

## Purpose

The Knowledge Base provides:

- **Best practices** - Standardized approaches for solution areas
- **Lessons learned** - Aggregated insights from retrospectives
- **Patterns** - Identified patterns across accounts
- **Templates** - Reusable starting points for artifacts

## Directory Structure

```text
knowledge/
├── best_practices/           # Standardized best practice documentation
│   ├── security/             # Security Analytics, SIEM, Threat Detection
│   ├── observability/        # APM, Logging, Metrics, Tracing
│   ├── search/               # Enterprise Search, RAG, Vector Search
│   └── platform/             # Cross-cutting platform best practices
│
├── lessons_learned/          # Aggregated retrospective insights
│   └── quarterly/            # Quarterly summaries
│
├── patterns/                 # Identified patterns across accounts
│   ├── success_patterns/     # What works well
│   ├── risk_patterns/        # Common risk indicators
│   └── competitive_patterns/ # Competitive displacement patterns
│
└── templates/                # Reusable templates (symlink to playbooks/templates)
```

## Distinction from InfoHub

| Aspect | Knowledge Base | InfoHub |
|--------|----------------|---------|
| **Scope** | Global, cross-account | Account-specific |
| **Content** | Reference material | Operational data |
| **Updates** | Periodic (quarterly) | Continuous |
| **Examples** | Best practices, patterns | Risks, decisions, meetings |

## Agent Interactions

### Reading from Knowledge Base

Agents read Knowledge Base to:

- Apply best practices during solution design
- Check for known patterns when assessing risks
- Use templates for artifact creation
- Reference lessons learned for similar situations

### Writing to Knowledge Base

Agents write to Knowledge Base to:

- Aggregate lessons from retrospectives
- Document newly identified patterns
- Update best practices based on field experience

## Related Documentation

- [InfoHub](../infohub/README.md) - Account-specific operational data
- [Best Practices Library](best_practices/README.md) - Detailed best practice structure
