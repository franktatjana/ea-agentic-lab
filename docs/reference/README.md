---
title: "Reference"
order: 4
audience: both
summary: "Catalogs, terminology, agent profiles, and repo path locator."
related:
  - ../START_HERE.md
---

# Reference

Static lookup materials for the EA Agentic Lab. Everything here is designed for fast retrieval, not sequential reading. Use these documents when you need to look up a specific agent, playbook, signal, framework, or structural rule.

The distinction between reference and guides: reference answers "what exists and what are the rules," guides answer "how do I do this step by step." The corresponding procedural guides live in [docs/guides/](../guides/).

**Repository layout:** Machine-readable YAML and sample vault data live outside `docs/`. See [Repository path locator](repository-paths.md) for paths relative to the repo root (archetypes, blueprints, `vault/`, etc.).

## Catalogs

Lookup tables that enumerate all instances of a concept. Each catalog is the single source of truth for its domain.

| Document | What it covers |
|----------|---------------|
| [repository-paths.md](repository-paths.md) | Where `domain/` and `vault/` assets live in the clone (paths from repo root) |
| [playbook-catalog.md](playbook-catalog.md) | All playbooks by customer lifecycle stage, with IDs, owners, and descriptions |
| [framework-catalog.md](framework-catalog.md) | Consulting frameworks (McKinsey, BCG, Porter, etc.) mapped to agents and playbooks |
| [blueprint-catalog.md](blueprint-catalog.md) | Blueprint composition: archetypes, engagement tracks, domains, and which playbooks they assemble |
| [signal-catalog.md](../architecture/system/signal-catalog.md) | Signal taxonomy: immutable events that flow between agents, with schemas and routing rules |
| [tech-signal-map.md](tech-signal-map.md) | Technology intelligence patterns: adoption signals, skills gaps, competitive indicators per realm |
| [skill-catalog.md](skill-catalog.md) | Named, composable skill workflows owned by agents, indexed for cross-agent discovery |

## InfoHub Structural Specs

Structural definitions for the two InfoHub knowledge vaults. These define directory layout, agent ownership, content boundaries, and governance rules. For day-to-day content management procedures, see the lifecycle guides in [docs/guides/for-practitioners/](../guides/for-practitioners/).

| Document | What it covers | Lifecycle guide |
|----------|---------------|----------------|
| [external-infohub-reference.md](external-infohub-reference.md) | Customer-facing vault: directory structure, ownership, content rules, exclusions | [external-infohub-lifecycle.md](../guides/for-practitioners/external-infohub-lifecycle.md) |
| [internal-infohub-reference.md](internal-infohub-reference.md) | Vendor-internal vault: directory structure, ownership, content rules, retention | [internal-infohub-lifecycle.md](../guides/for-practitioners/internal-infohub-lifecycle.md) |

## Terminology

| Document | What it covers |
|----------|---------------|
| [TERMINOLOGY_MODEL.md](TERMINOLOGY_MODEL.md) | Classification framework: Engagement = Archetype x Domain x Track. Defines the three dimensions that drive blueprint composition |

## Agent Profiles

40 agent definitions organized by functional area. Each profile documents the agent's identity, responsibilities, playbook ownership, handoff chains, escalation rules, and personality traits.

See [agent-profiles/index.md](agent-profiles/index.md) for the full index.

| Category | Agents | Focus |
|----------|--------|-------|
| [Leadership](agent-profiles/leadership/) | Senior Manager, Product Manager | Strategic oversight, roadmap alignment |
| [Sales](agent-profiles/sales/) | AE, VE, Partner, HAM | Commercial strategy, value quantification, hyperscaler co-sell |
| [Architecture](agent-profiles/architecture/) | SA, CA, Specialist Router | Technical integrity, solution design |
| [InfoSec](agent-profiles/deal-execution/) | InfoSec | Security and compliance enablement |
| [Deal Execution](agent-profiles/deal-execution/) | RFP, POC | Bid management, proof of concept |
| [Intelligence](agent-profiles/intelligence/) | CI, Account Intelligence, Industry Intelligence, Market News, Tech Scout Scanner, Tech Scout Analyzer | External signal scanning, technology maps |
| [Delivery](agent-profiles/delivery/) | Delivery, PS | Implementation, services |
| [Governance](agent-profiles/governance/) | Meeting Notes, Task Shepherd, Decision Registrar, Risk Radar, Nudger, Reporter, Signal Matcher, Playbook Curator, InfoHub Curator, Knowledge Vault Curator | Process enforcement, quality gates |
| [Specialists](agent-profiles/specialists/) | Security, Observability, Search | Domain-specific deep expertise |
| [Meta](agent-profiles/meta/) | Orchestration, Retrospective | System coordination, lessons learned |
