# EA Agentic Lab: User Handbook

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

This handbook is for the people who use the system daily: Account Executives, Solutions Architects, Domain Specialists, Customer Success Managers, and Sales Leadership. It explains how to work with the platform, what agents do for you, and where to find what you need. If you haven't read the [Executive Summary](../EXECUTIVE_SUMMARY.md), start there for the big picture. For a deeper understanding of why each component exists and how they connect through real scenarios, see [Understanding the System](guides/understanding-the-system.md). To walk through a complete engagement from your role's perspective, see the [End-to-End Walkthrough](guides/end-to-end-walkthrough.md).

---

## How the System Thinks

[image: Core Concepts Chain - classification, blueprints, playbooks, and vault connected]

Every customer engagement follows the same logic: classify it, select the right blueprint, execute playbooks, and capture everything. Understanding these four concepts makes the rest of the handbook click.

**Engagement Classification** determines what kind of deal this is, so the system adapts its governance to the engagement rather than applying a one-size-fits-all approach. Three independent dimensions combine to describe any engagement:

- **Archetype** defines the motion: competitive displacement, greenfield adoption, consolidation, compliance, evaluation, renewal, expansion, or strategic partnership. Each archetype activates different playbooks and agent behaviors. See the [archetypes catalog](../domain/catalogs/archetypes.yaml) for definitions
- **Domain** defines the technical area: security, search, observability, or platform. Each domain has its own specialist playbooks and evaluation checklists
- **Track** defines the service tier: POC, economy, premium, or fast track. Each track sets different SLAs, cadences, and mandatory artifacts. See [engagement tracks](../domain/mappings/engagement_tracks.yaml) for details

**Blueprints** are the governance templates that define which playbooks to run, which agents to involve, and what success looks like for a given classification. Without blueprints, someone would need to manually decide the right playbooks, agents, and cadence for every engagement. The system selects blueprints automatically based on classification. Browse the [reference blueprints](../domain/blueprints/) to see what's available.

**Playbooks** encode domain expertise as repeatable process so that every team member, regardless of experience, applies proven frameworks consistently. Strategic playbooks apply consulting frameworks (SWOT, Three Horizons, Value Engineering). Operational playbooks handle events (meeting notes, risk registration, action tracking). Specialist playbooks bring deep domain evaluation. Each playbook follows a trigger, input, execute, output, review pattern. See the [playbook catalog](reference/playbook-catalog.md) for the full library.

[image: Three-Vault Knowledge Model - knowledge separated by audience and sensitivity]

**The Vault** is institutional memory organized in three layers, separated by audience and sensitivity. The separation is structural (directory-based), not tag-based, which means security boundaries are enforced by design.

- **External InfoHub**: customer-shareable artifacts, including solution architecture, ADRs, POC plans, and value metrics. The customer keeps this as their solution knowledge base when the engagement ends. See the [External InfoHub Reference](reference/external-infohub-reference.md)
- **Internal InfoHub**: vendor-only intelligence, including stakeholder mapping with internal observations, competitive intelligence, candid risk assessments, health scores, and agent work products. This is where agents do their analysis
- **Global Knowledge Vault**: anonymized, reusable patterns harvested from completed engagements. Best practices, winning patterns, and risk indicators that make every future engagement smarter

Raw meeting notes and field data land in **raw/** as unprocessed inputs before agents route them to the appropriate vault. For the full terminology, see the [Terminology Model](reference/TERMINOLOGY_MODEL.md).

---

## Your Role in the System

[image: Role-Agent Map - which agents serve which human roles]

Each role interacts with different agents and playbooks. The system adapts to how you work, and you can personalize your agent team for your accounts and domains.

### Account Executives

Your agents handle deal governance, stakeholder tracking, and competitive intelligence. The AE Agent monitors deal health, flags risks early, and produces executive-ready canvases for stakeholder communication.

**Your key workflows:**
- Classify new engagements and let the system select the right blueprint
- Review health scores and risk alerts across your portfolio
- Use [Value Engineering playbooks](guides/for-practitioners/business-value-consulting.md) to build quantified business cases
- Track stakeholder relationships and competitive positioning
- Review canvases before stakeholder meetings

**Governance you own:** [Strategic account governance](operating-model/strategic-accounts.md) covers long-term account stewardship, including executive sponsorship, account planning, and value engineering.

### Solutions Architects

Your agents handle technical discovery, architecture assessment, and POC execution. The SA Agent monitors technical risks, tracks architecture decisions, and ensures nothing falls through the cracks between meetings.

**Your key workflows:**
- Run [technical discovery playbooks](guides/for-practitioners/sa-best-practices.md) for structured evaluation
- Execute POCs with clear success criteria using the [POC Success Plan](guides/for-practitioners/poc-success-plan.md)
- Produce Architecture Decision Records for every significant technical choice
- Capture meeting outcomes so decisions and actions are tracked automatically
- Collaborate with Domain Specialists on evaluation checklists

**Governance you own:** [Pre-sales governance](operating-model/pre-sales-model.md) covers deal execution from discovery through contract.

### Domain Specialists (Security, Search, Observability)

Your agents bring deep technical evaluation with domain-specific checklists that evolve from deal outcomes. Specialist playbooks define what "good" looks like for your domain.

**Your key workflows:**
- Run domain evaluation checklists: [Security](../domain/playbooks/specialists/security/checklists/), [Search](../domain/playbooks/specialists/search/checklists/), [Observability](../domain/playbooks/specialists/observability/checklists/)
- Contribute to Knowledge Base best practices for your domain
- Cross-pollinate patterns: what worked in security deals may apply to observability

### Customer Success Managers

Your agents handle health scoring, risk monitoring, and renewal tracking. The system alerts you before problems become urgent, not after.

**Your key workflows:**
- Monitor customer health with the [Customer Success Plan framework](guides/for-practitioners/customer-success-plan.md)
- Run [stage adoption playbooks](guides/for-practitioners/customer-success-playbooks.md) to track where customers are in their journey
- Capture Voice of Customer feedback through the [VoC framework](guides/for-practitioners/customer-journey-voc.md)
- Track value realization against the business case built during pre-sales

**Governance you own:** [Post-sales governance](operating-model/post-sales-model.md) covers delivery, adoption, and renewal.

### Sales Leadership

Your view is cross-engagement visibility. The system aggregates health scores, risk patterns, and deal progress across all active engagements, without requiring manual status reports.

**Your key workflows:**
- Review portfolio health dashboards
- Identify at-risk deals through automated risk patterns
- Track which engagement archetypes and playbook sequences produce the best outcomes
- Use the [RACI model](operating-model/raci-model.md) to understand accountability across teams

---

## Working with the System

### Running Playbooks

Playbooks are how you get things done. Every playbook follows a trigger, input, execute, output, review pattern. You can run them through the executor, through an agent, or step through them manually.

Detailed instructions: [How to Run a Playbook](guides/for-developers/run-playbook.md)

### Working with Agents

Agents operate within human-defined constraints. They have agency within their scope, but you make the decisions. Each agent has a personality definition that controls its behavior, thresholds, and escalation rules. You interact with agent outputs (alerts, summaries, canvases, prompts) rather than directing them step by step.

The system has 24 agents in three categories:

- **Strategic agents (15)** handle customer-facing work: deal governance (AE), technical integrity (SA), customer architecture (CA), competitive intelligence (CI), value engineering (VE), and more. Each has defined decision authority, for example the AE Agent handles deals up to $500K autonomously, escalating larger deals to the Senior Manager Agent
- **Governance agents (8)** reduce entropy: Meeting Notes Agent extracts structured artifacts from meeting notes, Task Shepherd validates every action has an owner and due date, Nudger follows up on overdue items with predictable escalation (Day +1 reminder, Day +3 to manager, Day +5 to governance lead), Risk Radar tracks risk state transitions within defined SLAs
- **Orchestration Agent (1)** transforms process descriptions into new agents and playbooks

When an agent needs your input, it surfaces an actionable prompt with context and quick-action options rather than a generic notification. For scenario walkthroughs showing agents in action, see [Understanding the System](guides/understanding-the-system.md#how-components-connect-scenario-walkthroughs).

Detailed instructions: [How to Run an Agent](guides/for-developers/run-agent.md)

### Understanding Canvases

Canvases are one-page visual artifacts rendered from structured InfoHub data. They exist so you never have to build a slide from scratch: the system renders Context Canvases, Decision Canvases, Architecture Communication Canvases, and more from the data that already exists. See the [Canvas framework](architecture/playbooks/canvas-framework.md) for all 8 types.

### Setting Up a New Engagement

1. Create a Realm (company) using the [Realm Profile Guide](operating-model/realm-profiles.md)
2. Create a Node (initiative) within the Realm
3. Classify the engagement: archetype, domain, track
4. The system selects the appropriate blueprint and loads relevant playbooks
5. Start executing, every artifact lands in the InfoHub automatically

### Governance and Accountability

The [RACI model](operating-model/raci-model.md) defines who is Responsible, Accountable, Consulted, and Informed for every activity across all 11 team roles. When in doubt about who owns what, check RACI.

---

## Try It: ACME Demo

The best way to understand the system is to see it in action. The ACME demo customer shows a complete security consolidation deal with real stakeholders, risks, meetings, and framework analyses.

- [ACME Engagement](../vault/ACME_CORP/SECURITY_CONSOLIDATION/) shows the full three-vault engagement structure
- [Run the demo](guides/for-developers/run-demo.md) for a guided walkthrough of three scenarios

---

## Quick Reference

| I want to... | Go to |
|---------------|-------|
| Understand the system at a glance | [Executive Summary](../EXECUTIVE_SUMMARY.md) |
| Understand why each component exists | [Understanding the System](guides/understanding-the-system.md) |
| Walk through a deal from my role's perspective | [End-to-End Walkthrough](guides/end-to-end-walkthrough.md) |
| Look up a term | [Terminology Model](reference/TERMINOLOGY_MODEL.md) |
| Find a playbook | [Playbook Catalog](reference/playbook-catalog.md) |
| Check who owns what | [RACI Model](operating-model/raci-model.md) |
| Set up a new account | [Realm Profile Guide](operating-model/realm-profiles.md) |
| Run a playbook | [How to Run a Playbook](guides/for-developers/run-playbook.md) |
| Run an agent | [How to Run an Agent](guides/for-developers/run-agent.md) |
| See a demo | [Run Demo](guides/for-developers/run-demo.md) |
| Understand External InfoHub content rules | [External InfoHub Reference](reference/external-infohub-reference.md) |
| Understand documentation standards | [Documentation Principles](DOCUMENTATION_PRINCIPLES.md) |
