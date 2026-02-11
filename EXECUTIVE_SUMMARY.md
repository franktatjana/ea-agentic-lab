# EA Agentic Lab: Executive Summary

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

Enterprise pre-sales and post-sales engagements fail not because teams lack talent, but because they lack structure. Discovery calls miss critical questions. POC results live in someone's head. Competitive positioning changes between deals with no institutional memory. When an SA leaves, their account knowledge leaves with them.

EA Agentic Lab solves this by combining pattern recognition for engagement types, reusable blueprints that encode best practices, and AI agents that enforce discipline without slowing teams down.

[image: Three Pillars - people + agents, customers + blueprints, knowledge + vault]

**Three conceptual pillars:**

1. People (Specialists, AEs, SAs, CAs) paired with AI agents, each with role-specific, customizable playbooks and checklists. 

2. Customers are classified into archetypes: each gets a blueprint, which is filled in with corresponding specialized strategic and operational playbooks. 

3. Knowledge captured automatically in two places: internal vault (anonymized best practices + digitized tribal knowledge) and customer InfoHub (shareable solution know-how). 

## Who This Is For

- **Account Executives** get deal governance, stakeholder tracking, competitive intelligence, and executive-ready canvases so they can focus on relationships and strategy
- **Solutions Architects** get structured playbooks for technical discovery, architecture assessment, and POC execution, with every finding captured permanently
- **Domain Specialists** (Security, Search, Observability) get evaluation checklists that evolve from deal outcomes, deep technical playbooks, and cross-domain learning that imports proven patterns from other specialties
- **Customer Success Managers** get health scoring, risk monitoring, and renewal tracking across their portfolio, with alerts before problems become urgent
- **Sales Leadership** gets cross-engagement visibility without manual status reports, showing which deals are at risk and which patterns win
- **Product Managers** get field feedback aggregated across engagements, surfacing feature requests, competitive gaps, and roadmap alignment signals
- **Competitive Intelligence** gets structured win/loss data, competitor positioning patterns, and displacement playbook effectiveness across all deals

## What Makes This Different

**Data is machine-readable first, human-readable on demand.** Agents validate, gap-scan, and cross-reference everything. Canvases render structured one-page visuals for stakeholders when needed.

**Each team and role can use a default agent or personalize it** for their accounts, domains, and engagement patterns. The system adapts to how each person works, not the other way around.

**Every engagement produces a customer-facing knowledge repository.** The InfoHub captures every artifact, decision, risk, and action item with full provenance. Knowledge sharing is not a side effect, it is the primary output.

**Governance is proactive, not passive.** Agents continuously scan for gaps, flag overdue actions, and nudge before problems surface. A smoke detector, not a fire report.

**Engagement classification drives automation.** Signal matching determines the archetype, domain, and service tier, then automatically selects the right blueprint, playbooks, evaluation criteria, and success measures.

**The system learns from every engagement.** Win/loss correlation adjusts evaluation criteria. Best practices surface automatically in future engagements. Over time, the system discovers which patterns, questions, and sequences drive the best outcomes.

## How It Works

[image: System Pipeline - the 6-step engagement lifecycle as a visual journey]

1. **Classify** the engagement across three dimensions: what kind (competitive displacement, greenfield, consolidation, compliance, evaluation, renewal, expansion, strategic), which domain (security, search, observability), and which service tier (POC, economy, premium, fast track)
2. **Select a blueprint** that defines exactly which playbooks to run, which specialists to involve, and what success looks like
3. **Execute playbooks** that encode domain expertise as process: strategic playbooks apply proven frameworks, specialist playbooks bring deep domain evaluation, operational playbooks handle meeting notes, action tracking, and health monitoring
4. **Render canvases** that turn structured data into visual one-page artifacts for stakeholder communication
5. **Store everything in the Vault**, the system's institutional memory: a Knowledge Base of validated best practices and an InfoHub of customer engagement artifacts
6. **Learn from outcomes**, feeding deal results back into evaluation criteria so every future engagement benefits from the ones before it

Agents operate within human-defined constraints. They have agency within their scope, but humans make the decisions. The system enforces discipline, it does not replace judgment.

## See It In Action

The [vault](vault/) includes three fictional customers (ACME_CORP, GLOBEX, INITECH) with raw meeting notes, daily operations logs, and structured outputs. The [ACME engagement](vault/ACME_CORP/SECURITY_CONSOLIDATION/) shows the full three-vault structure: customer-facing InfoHub, internal account hub, and raw source data.

---

## Deep Dive

| Topic | Link |
|-------|------|
| User handbook | [Handbook](docs/HANDBOOK.md) |
| Terminology and concepts | [Terminology Model](docs/reference/TERMINOLOGY_MODEL.md) |
| Engagement classification | [Archetypes catalog](domain/catalogs/archetypes.yaml), [Engagement tracks](domain/mappings/engagement_tracks.yaml) |
| Blueprints | [Reference blueprints](domain/blueprints/), [Schema and hierarchy](domain/blueprints/README.md) |
| Agents | [Agent catalog](domain/catalogs/agent_catalog.yaml), [Architecture](docs/architecture/agents/agent-architecture.md), [Responsibilities](docs/architecture/agents/agent-responsibilities.md) |
| Playbooks | [Playbook library](domain/playbooks/), [Catalog](docs/reference/playbook-catalog.md) |
| Canvases | [Canvas specs](domain/playbooks/canvas/specs/), [Canvas framework](docs/architecture/playbooks/canvas-framework.md) |
| Evaluation criteria | [Security](domain/playbooks/specialists/security/checklists/), [Search](domain/playbooks/specialists/search/checklists/), [Observability](domain/playbooks/specialists/observability/checklists/) |
| Knowledge architecture | [Vault](vault/), [Knowledge Base](vault/knowledge/), [ACME External InfoHub](vault/ACME_CORP/SECURITY_CONSOLIDATION/external-infohub/) |
| Learning system | [Checklist learning](docs/architecture/system/checklist-learning-system.md), [Knowledge sharing](docs/architecture/system/knowledge-collection-sharing-spec.md) |
| Operating model | [RACI model](docs/operating-model/raci-model.md), [Account operating model](docs/operating-model/) |
| Sample data | [Three fictional customers](vault/) (ACME_CORP, GLOBEX, INITECH), [ACME engagement](vault/ACME_CORP/SECURITY_CONSOLIDATION/) |
