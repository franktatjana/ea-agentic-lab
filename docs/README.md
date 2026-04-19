# Documentation

Technical documentation for the EA Agentic Lab, organized by reader intent. Whether you need to understand how the system is designed, why a decision was made, who does what, or how to perform a task, the structure below guides you to the right place.

## Find What You Need

| I want to... | Start here |
|---|---|
| Follow a guided reading order (spine) | [START_HERE.md](START_HERE.md) |
| Get oriented as a new team member | [overview/executive-summary.md](overview/executive-summary.md) → [HANDBOOK.md](HANDBOOK.md) → [Understanding the System](guides/understanding-the-system.md) |
| Find YAML and vault paths in the repo | [reference/repository-paths.md](reference/repository-paths.md) |
| See what the system does for my role (AE, SA, CSM) | [End-to-End Walkthrough by Role](guides/end-to-end-walkthrough.md) |
| Understand how a specific agent works | [Agent Profiles Index](reference/agent-profiles/index.md) |
| Apply a specific workflow (POC, CSP, RFP, value engineering) | [Guides for Practitioners](guides/for-practitioners/) |
| Run the system locally or build a new agent | [Guides for Developers](guides/for-developers/) |
| Look up a playbook, signal, framework, or skill | [Reference](reference/) |
| Understand why something was designed a certain way | [Decisions](decisions/README.md) |
| See the domain model (agents, skills, runbooks, knowledge) | [Domain Model v3.0](architecture/system/domain-model.md) |

---

## Directory Structure

```text
docs/
├── START_HERE.md              # Spine: practitioner / developer / architecture tracks
├── overview/                  # Executive summary (in-app readable)
├── operating-model/           # Who does what, when?
├── architecture/              # How is it designed?
│   ├── agents/                #   Agent system design
│   ├── playbooks/             #   Playbook framework and specs
│   └── system/                #   Core entities, schemas, principles
├── guides/                    # How do I do X?
│   ├── for-practitioners/     #   Adoption, success plans, best practices
│   └── for-developers/        #   Run agents, create playbooks, demos
├── reference/                 # Look it up
├── decisions/                 # Why was this decided?
├── planning/                  # Where are we?
│   └── archive/               #   Historical audits and completed work
├── HANDBOOK.md                # Practitioner handbook (roles, vaults, workflows)
├── DOCUMENTATION_PRINCIPLES.md # Writing standards for this project
└── llms.txt                   # LLM-readable project summary
```

---

## Operating Model

Defines who is responsible for what, during which phase of an engagement. Covers the full lifecycle from pre-sales through post-sales, including RACI assignments and account profiling. Start here to understand the business context before exploring technical design.

| Document | Description |
|----------|-------------|
| [strategic-accounts.md](operating-model/strategic-accounts.md) | Strategic account engagement model |
| [pre-sales-model.md](operating-model/pre-sales-model.md) | Pre-sales phase governance |
| [post-sales-model.md](operating-model/post-sales-model.md) | Post-sales phase governance |
| [raci-model.md](operating-model/raci-model.md) | RACI assignments across teams and playbooks |
| [realm-profiles.md](operating-model/realm-profiles.md) | How to create account/realm profiles |

---

## Architecture

The system implements 196 agent definitions across 25 teams for strategic account management. Role agents exercise judgment and make recommendations; sub-agents handle specialized tasks under their parent role; 10 governance agents enforce process quality automatically. The taxonomy is defined in DDR-021. These documents describe the design.

### Agents

| Document | Description |
|----------|-------------|
| [agent-architecture.md](architecture/agents/agent-architecture.md) | Agent categories, structure, diagrams, collaboration model |
| [agent-responsibilities.md](architecture/agents/agent-responsibilities.md) | Detailed responsibilities and boundaries per agent |
| [agent-scenarios.md](architecture/agents/agent-scenarios.md) | End-to-end scenarios showing signal flow |
| [agent-handover-diagram.md](architecture/agents/agent-handover-diagram.md) | Handover flows between agents |
| [curator-agents.md](architecture/agents/curator-agents.md) | Governance agent specifications |
| [orchestration-agent.md](architecture/agents/orchestration-agent.md) | Orchestration agent specification |

### Playbooks

| Document | Description |
|----------|-------------|
| [playbook-system.md](architecture/playbooks/playbook-system.md) | Playbook structure, design principles, execution model, authoring guide, and operational spec |
| [playbook-execution-specification.md](architecture/playbooks/playbook-execution-specification.md) | How playbooks are executed at runtime |
| [canvas-framework.md](architecture/playbooks/canvas-framework.md) | Visual canvas artifact specifications |
| [playbook-model-validation.md](architecture/playbooks/playbook-model-validation.md) | Validation rules for playbook YAML |

### System Design

Core data models, schemas, and design principles that underpin the entire platform. These are cross-cutting concerns referenced by both agents and playbooks.

| Document | Description |
|----------|-------------|
| [core-entities.md](architecture/system/core-entities.md) | Realm/Node hierarchy and entity definitions |
| [vault-architecture.md](architecture/system/vault-architecture.md) | Three-vault knowledge separation model: structure, security boundaries, data flows, and naming |
| [process-orchestration-overview.md](architecture/system/process-orchestration-overview.md) | Why processes exist, the four registered processes, orchestration pipeline |
| [orchestration-patterns.md](architecture/system/orchestration-patterns.md) | Five canonical agentic orchestration patterns mapped to the domain model: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer |
| [process-schema.md](architecture/system/process-schema.md) | Normalized process schema definitions |
| [conflict-rules.md](architecture/system/conflict-rules.md) | Conflict taxonomy, detection rules, severity levels |
| [connector-architecture.md](architecture/system/connector-architecture.md) | Data source connectors: CRM, Calendar, Slack, Email, Docs, Sheets |
| [output-contract.md](architecture/system/output-contract.md) | Output format contracts |
| [data-directory-guide.md](architecture/system/data-directory-guide.md) | Runtime data directory structure |
| [prompt-engineering-principles.md](architecture/system/prompt-engineering-principles.md) | Prompting techniques for agent quality |
| [context-engineering.md](architecture/system/context-engineering.md) | Context budgets and freshness management |
| [tool-design-principles.md](architecture/system/tool-design-principles.md) | Tool design for AI agents |
| [playbook-personalization-spec.md](architecture/system/playbook-personalization-spec.md) | Override and customization system |
| [knowledge-lifecycle.md](architecture/system/knowledge-lifecycle.md) | Knowledge collection and sharing rules |
| [checklist-learning-system.md](architecture/system/checklist-learning-system.md) | Checklist-based learning system design |

---

## Guides

Practical guidance split by audience. Practitioner guides help adoption leads, SAs, and CAs apply the system in their work. Developer guides provide step-by-step instructions for running and extending the platform.

### For Practitioners

| Guide | Description |
|-------|-------------|
| [sa-best-practices.md](guides/for-practitioners/sa-best-practices.md) | Solution Architect best practices |
| [customer-success-playbooks.md](guides/for-practitioners/customer-success-playbooks.md) | Customer success playbook guide |
| [customer-success-plan.md](guides/for-practitioners/customer-success-plan.md) | Customer success plan creation |
| [customer-journey-voc.md](guides/for-practitioners/customer-journey-voc.md) | Voice of Customer journey mapping |
| [poc-success-plan.md](guides/for-practitioners/poc-success-plan.md) | POC/POV success planning |
| [business-value-consulting.md](guides/for-practitioners/business-value-consulting.md) | Business value consulting approach |
| [knowledge-vault-guide.md](guides/for-practitioners/knowledge-vault-guide.md) | Knowledge vault day-to-day usage |
| [external-infohub-lifecycle.md](guides/for-practitioners/external-infohub-lifecycle.md) | External InfoHub content lifecycle and management |
| [internal-infohub-lifecycle.md](guides/for-practitioners/internal-infohub-lifecycle.md) | Internal InfoHub content lifecycle and management |

### For Developers

| Tutorial | Description |
|----------|-------------|
| [run-demo.md](guides/for-developers/run-demo.md) | Set up and run demo scenarios |
| [run-agent.md](guides/for-developers/run-agent.md) | Execute SA, CA, and other agents |
| [run-playbook.md](guides/for-developers/run-playbook.md) | Execute strategic and operational playbooks |
| [create-agent.md](guides/for-developers/create-agent.md) | Build a new agent from scratch |

---

## Reference

Static lookup materials: catalogs, quick-reference cards, and terminology. These are designed for fast retrieval, not sequential reading.

| Document | Description |
|----------|-------------|
| [agent-quick-reference.md](architecture/agents/agent-quick-reference.md) | Quick reference for all agents |
| [playbook-catalog.md](reference/playbook-catalog.md) | Catalog of all playbooks |
| [signal-catalog.md](architecture/system/signal-catalog.md) | Signal definitions and routing |
| [skill-catalog.md](reference/skill-catalog.md) | Skill definitions: composable workflows, cross-agent imports |
| [framework-catalog.md](reference/framework-catalog.md) | Strategic frameworks (SWOT, BCG, etc.) |
| [tech-signal-map.md](reference/tech-signal-map.md) | Technology signal intelligence |
| [TERMINOLOGY_MODEL.md](reference/TERMINOLOGY_MODEL.md) | Project terminology and definitions |
| [blueprint-catalog.md](reference/blueprint-catalog.md) | Blueprint composition: archetypes, tracks, domains |
| [repository-paths.md](reference/repository-paths.md) | Where `domain/` and `vault/` files live (repo root paths) |
| [external-infohub-reference.md](reference/external-infohub-reference.md) | Customer-facing InfoHub reference |
| [internal-infohub-reference.md](reference/internal-infohub-reference.md) | Vendor-internal InfoHub reference |
| [agent-profiles/](reference/agent-profiles/index.md) | Individual agent profile cards (196 definitions) |

---

## Decisions

Every significant choice, whether domain-level or technical, is documented as a decision record with context, alternatives considered, and consequences. This creates an audit trail and prevents re-litigating settled decisions.

21 Domain Decision Records (DDR) and 7 Architecture Decision Records (ADR) are indexed in [decisions/README.md](decisions/README.md). Selected highlights:

| Record | Type | Status |
|--------|------|--------|
| [DDR-019: Agent System Domain Model](decisions/DDR_019_agent_system_domain_model.md) | Domain | ACCEPTED |
| [DDR-021: Agent Taxonomy](decisions/DDR_021_agent_taxonomy.md) | Domain | ACCEPTED |
| [DDR-001: Three-Vault Knowledge Architecture](decisions/DDR_001_three_vault_knowledge_architecture.md) | Domain | ACCEPTED |
| [DDR-016: Skill Architecture](decisions/DDR_016_skill_architecture.md) | Domain | ACCEPTED |
| [ADR-002: Next.js Web Application](decisions/ADR_002_nextjs_web_application.md) | Architecture | ACCEPTED |
| [ADR-004: FastAPI Backend](decisions/ADR_004_fastapi_backend.md) | Architecture | ACCEPTED |

See [decisions/README.md](decisions/README.md) for the complete index and the DDR vs ADR framework.

---

## Audit

Design audits evaluate the system against established agent design principles, industry patterns, and lessons learned from the [agent-lab](https://github.com/tatjanafrank/agent-lab) knowledge base. Each audit is timestamped and produces prioritized findings with actionable CTAs.

| Audit | Date | Scope |
|-------|------|-------|
| [Agent Design Audit](planning/archive/2025-02-14-agent-design-audit.md) | 2025-02-14 | Agent identity, routing, interfaces, handoffs, context engineering, prompts, testing |

**Knowledge base:** Audit criteria are drawn from the [Agent Systems Handbook](https://github.com/tatjanafrank/agent-lab/blob/main/docs/handbook.md), [Lessons Learned](https://github.com/tatjanafrank/agent-lab/blob/main/docs/lessons-learned.md), and [Bookmarks](https://github.com/tatjanafrank/agent-lab/blob/main/docs/bookmarks.md) in the agent-lab repository.

---

## Planning

Development notes, gap analyses, and implementation status. These track where we are and what remains to be built.

| Document | Description |
|----------|-------------|
| [implementation-status.md](planning/implementation-status.md) | Overall implementation progress |
| [prompt-gap-analysis.md](planning/prompt-gap-analysis.md) | Prompt technique gaps per agent |
