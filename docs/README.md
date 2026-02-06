# Documentation

Technical documentation for the EA Agentic Lab.

## Overview

The EA Agentic Lab implements a **24-agent governance system** for strategic account management:

- **15 Strategic Agents** - Exercise judgment, apply frameworks, make recommendations
- **8 Governance Agents** - Enforce process, maintain artifacts, reduce entropy
- **1 Orchestration Agent** - Meta-layer process management

## Directory Structure

```text
docs/
├── agents/                   # Agent documentation
├── playbooks/                # Playbook system
├── design/                   # System design principles
├── account-governance/       # Strategic account model
├── reference/                # Catalogs & quick refs
├── guides/                   # How-to guides
├── how-to/                   # Step-by-step tutorials
└── planning/                # Dev notes & status
```

---

## Agents

Documentation about the 24-agent system.

| Document | Description |
|----------|-------------|
| [agent-architecture.md](agents/agent-architecture.md) | Agent overview, categories, structure |
| [agent-responsibilities.md](agents/agent-responsibilities.md) | Detailed responsibilities and boundaries |
| [agent-scenarios.md](agents/agent-scenarios.md) | End-to-end scenarios showing signal flow |
| [agent-handover-diagram.md](agents/agent-handover-diagram.md) | Handover flows between agents |
| [agent-architecture-diagrams.md](agents/agent-architecture-diagrams.md) | Visual diagrams of interactions |
| [curator-agents.md](agents/curator-agents.md) | Governance agent specifications |
| [orchestration-agent.md](agents/orchestration-agent.md) | Orchestration agent specification |

---

## Playbooks

Playbook framework and specifications.

| Document | Description |
|----------|-------------|
| [playbook-framework.md](playbooks/playbook-framework.md) | Playbook structure and design principles |
| [playbook-execution-specification.md](playbooks/playbook-execution-specification.md) | How playbooks are executed |
| [operational-playbook-spec.md](playbooks/operational-playbook-spec.md) | Operational (micro) playbook spec |
| [playbook-creation-guide.md](playbooks/playbook-creation-guide.md) | How to create new playbooks |
| [canvas-framework.md](playbooks/canvas-framework.md) | Visual canvas artifacts |
| [playbook-architecture-fix.md](playbooks/playbook-architecture-fix.md) | Architecture improvements |
| [playbook-model-validation.md](playbooks/playbook-model-validation.md) | Validation rules for YAML |

---

## Design

System design principles and data models.

| Document | Description |
|----------|-------------|
| [core-entities.md](design/core-entities.md) | Realm/Node hierarchy and entities |
| [process-schema.md](design/process-schema.md) | Process schema definitions |
| [conflict-rules.md](design/conflict-rules.md) | Rules for resolving conflicts |
| [output-contract.md](design/output-contract.md) | Output format contracts |
| [data-directory-guide.md](design/data-directory-guide.md) | Runtime data directory structure |
| [prompt-engineering-principles.md](design/prompt-engineering-principles.md) | Prompting techniques |
| [context-engineering.md](design/context-engineering.md) | Context budgets and freshness |
| [tool-design-principles.md](design/tool-design-principles.md) | Tool design for AI agents |

---

## Account Governance

Strategic account engagement and governance model.

| Document | Description |
|----------|-------------|
| [strategic-account-engagement-model.md](account-governance/strategic-account-engagement-model.md) | Overall governance strategy |
| [realm-profile-guide.md](account-governance/realm-profile-guide.md) | Creating account/realm profiles |
| [pre-sales-governance-model.md](account-governance/pre-sales-governance-model.md) | Pre-sales phase governance |
| [post-sales-governance-model.md](account-governance/post-sales-governance-model.md) | Post-sales phase governance |

---

## Reference

Static catalogs and quick-reference materials.

| Document | Description |
|----------|-------------|
| [agent-quick-reference.md](reference/agent-quick-reference.md) | Quick reference for all 24 agents |
| [playbook-catalog.md](reference/playbook-catalog.md) | Catalog of all playbooks |
| [signal-catalog.md](reference/signal-catalog.md) | Signal definitions and routing |
| [framework-catalog.md](reference/framework-catalog.md) | Strategic frameworks (SWOT, BCG, etc.) |
| [tech-signal-map.md](reference/tech-signal-map.md) | Technology signal intelligence |

---

## Guides

How-to guides for common tasks.

*(Guides will be added here)*

---

## How-To

Step-by-step tutorials.

| Tutorial | Description |
|----------|-------------|
| [Run a Demo](how-to/run-demo.md) | Set up and run demo scenarios |
| [Run an Agent](how-to/run-agent.md) | Execute SA, CA, and other agents |
| [Run a Playbook](how-to/run-playbook.md) | Execute strategic and operational playbooks |
| [Create an Agent](how-to/create-agent.md) | Build a new agent from scratch |

---

## Planning

Development notes, status tracking, and gap analyses. See [planning/](planning/).

---

## Getting Started

1. **Understand Agents**: [agent-architecture.md](agents/agent-architecture.md)
2. **Review Governance**: [strategic-account-engagement-model.md](account-governance/strategic-account-engagement-model.md)
3. **See Scenarios**: [agent-scenarios.md](agents/agent-scenarios.md)
4. **Explore Playbooks**: [playbook-framework.md](playbooks/playbook-framework.md)
5. **Quick Lookup**: [agent-quick-reference.md](reference/agent-quick-reference.md)
