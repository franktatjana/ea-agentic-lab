# Global Knowledge Vault

The Knowledge Vault is the system's institutional memory, a human-curated knowledge base that grows with every engagement. Agents pull relevant knowledge at runtime to make better decisions, without their personalities, prompts, or playbooks being auto-modified.

The static layer (agent personality + playbooks) stays stable and human-controlled. The dynamic layer (this vault) grows over time. Agents receive relevant knowledge as enriched context at runtime.

## Directory Structure

```text
vault/knowledge/
├── operations/                        # How the team works
│   ├── engagement-management/         # Process and methodology
│   ├── stakeholder-handling/          # Relationship practices
│   └── delivery-execution/            # Delivery and execution patterns
│
├── content/                           # How team works with customer
│   ├── security/                      # Security domain practices
│   ├── observability/                 # Observability domain practices
│   ├── search/                        # Search domain practices
│   ├── platform/                      # Platform domain practices
│   └── general/                       # Cross-domain content practices
│
├── external/                          # Outside knowledge sources
│   ├── industry/                      # Analyst reports, standards
│   └── research/                      # Published research, benchmarks
│
├── assets/                            # Reusable deliverables
│   ├── templates/                     # Document templates
│   └── references/                    # Reference materials, calculators
│
└── .proposals/                        # Agent-proposed items (review queue)
    └── {proposal_id}.yaml            # Pending human review
```

## Knowledge Item Schema

Each item is a YAML file with frontmatter for machine-queryable filtering plus markdown content.

```yaml
---
id: "KV_001"
title: "Short descriptive title"
type: best_practice              # best_practice | lesson_learned | pattern | research | asset
category: content                # operations | content | external | asset
domain: security                 # security | observability | search | platform | general
archetype: consolidation         # matches blueprint archetypes, or "all"
phase: pre_sales                 # pre_sales | implementation | post_sales | all
relevance:                       # which agent roles benefit
  - solution_architect
  - account_executive
tags: ["tag1", "tag2"]
confidence: validated            # proposed | reviewed | validated
source:
  type: engagement               # engagement | expert | research | analyst_report
  origin: "Description of source"
  author: "Author name"
created: "2026-01-15"
updated: "2026-02-01"
---

Markdown content here...
```

## How Knowledge Enters the Vault

Two ingestion paths, both human-curated:

1. **Manual entry**: Humans add items directly through the Knowledge Vault UI (create, edit, tag)
2. **Agent proposals**: Agents extract candidate knowledge from engagements, write to `.proposals/`, humans review and approve before it enters the main vault

## How Agents Consume Knowledge

Pre-loaded context injection: before an agent processes inputs, the PlaybookExecutor fetches relevant items (matched by domain, archetype, phase) and injects them into the agent's input context. Agents receive richer context without any code changes.

## Confidence Levels

| Level | Meaning |
|-------|---------|
| `proposed` | Agent-generated, awaiting human review |
| `reviewed` | Human-reviewed and approved |
| `validated` | Proven through multiple engagements |

## Distinction from InfoHub

| Aspect | Knowledge Vault | InfoHub |
|--------|----------------|---------|
| **Scope** | Global, cross-account, anonymized | Account-specific |
| **Content** | Best practices, patterns, lessons | Operational data |
| **Updates** | Human-curated additions | Continuous agent updates |
| **Audience** | All agents across all engagements | Agents working on specific node |

## Related Documentation

- [Knowledge Vault Architecture](../../docs/architecture/system/knowledge-vault-architecture.md)
- [DDR-001: Three-Vault Knowledge Architecture](../../docs/decisions/DDR_001_three_vault_knowledge_architecture.md)
