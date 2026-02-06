# EA Agentic Lab: User Handbook

This handbook is for the people who use the system daily: Account Executives, Solutions Architects, Domain Specialists, Customer Success Managers, and Sales Leadership. It explains how to work with the platform, what agents do for you, and where to find what you need. If you haven't read the [Executive Summary](../EXECUTIVE_SUMMARY.md), start there for the big picture.

---

## How the System Thinks

Every customer engagement follows the same logic: classify it, select the right blueprint, execute playbooks, and capture everything. Understanding these four concepts makes the rest of the handbook click.

**Engagement Classification** determines what kind of deal this is. Three independent dimensions combine to describe any engagement:

- **Archetype** defines the motion: competitive displacement, greenfield adoption, consolidation, compliance, evaluation, renewal, expansion, or strategic partnership. See the [archetypes catalog](../domain/catalogs/archetypes.yaml) for definitions
- **Domain** defines the technical area: security, search, observability, or platform. Each domain has its own specialist playbooks and evaluation checklists
- **Track** defines the service tier: POC, economy, premium, or fast track. Each track sets different SLAs, cadences, and mandatory artifacts. See [engagement tracks](../domain/mappings/engagement_tracks.yaml) for details

**Blueprints** are the governance templates that define which playbooks to run, which agents to involve, and what success looks like for a given classification. The system selects blueprints automatically based on classification. Browse the [reference blueprints](../domain/blueprints/) to see what's available.

**Playbooks** are the executable workflows that encode domain expertise as process. Strategic playbooks apply proven consulting frameworks (SWOT, Three Horizons, Value Engineering). Operational playbooks handle events (meeting notes, risk registration, action tracking). Specialist playbooks bring deep domain evaluation. See the [playbook catalog](reference/playbook-catalog.md) for the full library.

**The Vault** is institutional memory, split into two parts. The [Knowledge Base](../vault/knowledge/) holds validated best practices organized by domain. The [InfoHub](../vault/infohub/) holds customer engagement artifacts organized by Realm (company) and Node (initiative). Everything agents produce ends up here.

For the full terminology, see the [Terminology Model](reference/TERMINOLOGY_MODEL.md).

---

## Your Role in the System

Each role interacts with different agents and playbooks. The system adapts to how you work, and you can personalize your agent team for your accounts and domains.

### Account Executives

Your agents handle deal governance, stakeholder tracking, and competitive intelligence. The AE Agent monitors deal health, flags risks early, and produces executive-ready canvases for stakeholder communication.

**Your key workflows:**
- Classify new engagements and let the system select the right blueprint
- Review health scores and risk alerts across your portfolio
- Use [Value Engineering playbooks](guides/business-value-consulting.md) to build quantified business cases
- Track stakeholder relationships and competitive positioning
- Review canvases before stakeholder meetings

**Governance you own:** [Strategic account governance](account-governance/strategic-account-governance-model.md) covers long-term account stewardship, including executive sponsorship, account planning, and value engineering.

### Solutions Architects

Your agents handle technical discovery, architecture assessment, and POC execution. The SA Agent monitors technical risks, tracks architecture decisions, and ensures nothing falls through the cracks between meetings.

**Your key workflows:**
- Run [technical discovery playbooks](guides/sa-best-practices.md) for structured evaluation
- Execute POCs with clear success criteria using the [POC Success Plan](guides/poc-success-plan.md)
- Produce Architecture Decision Records for every significant technical choice
- Capture meeting outcomes so decisions and actions are tracked automatically
- Collaborate with Domain Specialists on evaluation checklists

**Governance you own:** [Pre-sales governance](account-governance/pre-sales-governance-model.md) covers deal execution from discovery through contract.

### Domain Specialists (Security, Search, Observability)

Your agents bring deep technical evaluation with domain-specific checklists that evolve from deal outcomes. Specialist playbooks define what "good" looks like for your domain.

**Your key workflows:**
- Run domain evaluation checklists: [Security](../domain/playbooks/specialists/security/checklists/), [Search](../domain/playbooks/specialists/search/checklists/), [Observability](../domain/playbooks/specialists/observability/checklists/)
- Contribute to Knowledge Base best practices for your domain
- Cross-pollinate patterns: what worked in security deals may apply to observability

### Customer Success Managers

Your agents handle health scoring, risk monitoring, and renewal tracking. The system alerts you before problems become urgent, not after.

**Your key workflows:**
- Monitor customer health with the [Customer Success Plan framework](guides/customer-success-plan.md)
- Run [stage adoption playbooks](guides/customer-success-playbooks.md) to track where customers are in their journey
- Capture Voice of Customer feedback through the [VoC framework](guides/customer-journey-voc.md)
- Track value realization against the business case built during pre-sales

**Governance you own:** [Post-sales governance](account-governance/post-sales-governance-model.md) covers delivery, adoption, and renewal.

### Sales Leadership

Your view is cross-engagement visibility. The system aggregates health scores, risk patterns, and deal progress across all active engagements, without requiring manual status reports.

**Your key workflows:**
- Review portfolio health dashboards
- Identify at-risk deals through automated risk patterns
- Track which engagement archetypes and playbook sequences produce the best outcomes
- Use the [RACI model](governance/raci-model.md) to understand accountability across teams

---

## Working with the System

### Running Playbooks

Playbooks are how you get things done. Every playbook follows a trigger, input, execute, output, review pattern. You can run them through the executor, through an agent, or step through them manually.

Detailed instructions: [How to Run a Playbook](how-to/run-playbook.md)

### Working with Agents

Agents operate within human-defined constraints. They have agency within their scope, but you make the decisions. Each agent has a personality definition that controls its behavior, thresholds, and escalation rules.

Detailed instructions: [How to Run an Agent](how-to/run-agent.md)

### Understanding Canvases

Canvases are one-page visual artifacts rendered from structured InfoHub data. They exist so you never have to build a slide from scratch: the system renders Context Canvases, Decision Canvases, Architecture Communication Canvases, and more from the data that already exists. See the [Canvas framework](playbooks/canvas-framework.md) for all 8 types.

### Setting Up a New Engagement

1. Create a Realm (company) using the [Realm Profile Guide](account-governance/realm-profile-guide.md)
2. Create a Node (initiative) within the Realm
3. Classify the engagement: archetype, domain, track
4. The system selects the appropriate blueprint and loads relevant playbooks
5. Start executing, every artifact lands in the InfoHub automatically

### Governance and Accountability

The [RACI model](governance/raci-model.md) defines who is Responsible, Accountable, Consulted, and Informed for every activity across all 11 team roles. When in doubt about who owns what, check RACI.

---

## Try It: ACME Demo

The best way to understand the system is to see it in action. The ACME demo customer shows a complete security consolidation deal with real stakeholders, risks, meetings, and framework analyses.

- [ACME InfoHub](../vault/infohub/ACME/SECURITY_CONSOLIDATION/) shows the full engagement artifact structure
- [Run the demo](how-to/run-demo.md) for a guided walkthrough of three scenarios

---

## Quick Reference

| I want to... | Go to |
|---------------|-------|
| Understand the system at a glance | [Executive Summary](../EXECUTIVE_SUMMARY.md) |
| Look up a term | [Terminology Model](reference/TERMINOLOGY_MODEL.md) |
| Find a playbook | [Playbook Catalog](reference/playbook-catalog.md) |
| Check who owns what | [RACI Model](governance/raci-model.md) |
| Set up a new account | [Realm Profile Guide](account-governance/realm-profile-guide.md) |
| Run a playbook | [How to Run a Playbook](how-to/run-playbook.md) |
| Run an agent | [How to Run an Agent](how-to/run-agent.md) |
| See a demo | [Run Demo](how-to/run-demo.md) |
| Understand documentation standards | [Documentation Principles](DOCUMENTATION_PRINCIPLES.md) |
