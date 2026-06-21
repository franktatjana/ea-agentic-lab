# EA Agentic Lab

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

EA Agentic Lab is an **AI-assisted governance platform** for managing complex enterprise accounts. It combines multi-agent orchestration with structured playbook execution to enforce governance discipline without replacing human judgment.

**Core Philosophy:** *Humans decide. The system enforces discipline.*

---

## The Problem

Enterprise account management suffers from:

1. **Governance Entropy** - Critical information scattered across emails, meetings, and memories
2. **Inconsistent Execution** - Best practices exist but aren't systematically applied
3. **Reactive Risk Management** - Risks surface too late in the engagement lifecycle
4. **Knowledge Loss** - Expertise leaves with people, not documented in systems

---

## The Solution

[image: Three-Layer Architecture - agents, playbooks, and knowledge working together]

A structured governance system with three layers:

### 1. Multi-Agent Architecture (196 Agents)

| Layer | Purpose |
|-------|---------|
| Role Agents | Apply judgment, use frameworks, make recommendations |
| Sub-Agents | Specialized functions within orchestrator roles (AE, SA, CI, VE, CA, and more) |
| Specialists | 11 domain specialist teams (security, observability, DevOps, cloud, data, and more) |
| Governance | Enforce process, maintain artifacts, reduce entropy (10 system agents) |
| Intelligence | Signal processing, market news analysis, trend detection (5 agents) |

### 2. Playbook Engine

| Type | Count | Purpose |
|------|-------|---------|
| Strategic Playbooks | 65 | Framework operationalization across 12 team domains |
| Operational Playbooks | 7 | Event-driven procedures (risk registration, action creation) |
| Canvas Specs | 8 | Visual artifact rendering (decision, risk, value, architecture) |

### 3. Three-Vault Knowledge Architecture

Knowledge is separated into three vaults, each with distinct audience, access rules, and lifecycle:

- **Customer InfoHub** (per account, shareable) - Solution architecture, ADRs, POC plans, learning paths. Content the customer keeps beyond the engagement.
- **Internal Account Hub** (per account, vendor-only) - Competitive intelligence, risk assessments, stakeholder mapping, deal reviews, meeting notes, daily ops. Raw inputs from meetings and field notes feed into this hub as foundation for structured analysis.
- **Global Knowledge Vault** (cross-account, anonymized) - Best practices, winning patterns, evolved evaluation criteria, lessons learned. Grows with every engagement through anonymized contribution from account-level knowledge.

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into the global vault. Each vault is machine-readable YAML, enabling agents to validate, gap-scan, and cross-reference data automatically.

---

## Key Differentiators

Three design choices separate this system from traditional account management tooling. Each creates compounding value the longer the system is used.

**Documents for machines, artifacts for humans.** Everything is stored as structured, machine-readable YAML with schema validation. Canvases, reports, and dashboards are rendered from that data on demand. This inverts the traditional approach where humans write documents that machines cannot parse. When data is machine-readable first, agents can validate it, gap-scan it, cross-reference it, and render it into any format a stakeholder needs.

**Personalizable AI agent teams.** The 196 agents are not a monolithic system. Each Account Executive gets their own agent team configured for their accounts, domains, and engagement patterns. One AE running three security deals and a search expansion gets a team weighted toward security and search specialists with competitive displacement playbooks loaded. Another AE managing strategic renewals gets retention-focused agents with health monitoring and champion mapping. The agent team adapts to how each person works, not the other way around.

**Customer-facing knowledge as a deliverable.** When the system works on a customer engagement, it does not just track internal notes. It creates a structured Customer InfoHub for that customer, organized by initiative, with every architecture decision, POC plan, and learning path captured with full provenance. This means the engagement itself produces a curated knowledge repository that can be shared with the customer, handed off to a new team member, or audited years later. Knowledge sharing is not a side effect, it is the primary output.

**Proactive governance, not passive dashboards.** Traditional tools show you a dashboard and wait for you to check it. This system's governance agents continuously scan for gaps, flag overdue actions, detect stale artifacts, and nudge before problems become visible. The difference is between a smoke detector and a fire report.

**Classification-driven automation.** Recognizing "this is a Competitive Displacement × Security × Premium" is not just a label. It automatically selects the right blueprint, loads the right playbooks, assigns the right evaluation criteria, and defines what success looks like. Adding a new domain does not require rebuilding the system, just new specialist playbooks and checklists. The engagement patterns stay the same.

**A self-learning system.** Most tools are static: they do the same thing on day one and day one thousand. This system gets measurably smarter with every engagement. Win/loss correlation adjusts checklist weights. Field feedback reshapes evaluation criteria. Best practices surface automatically in future engagements. The hundredth deal benefits from the ninety-nine before it. Over time, the system will learn which playbook sequences produce the best outcomes for each archetype, which discovery questions correlate with deal success, and which risk patterns predict churn, continuously refining its recommendations without manual tuning.

---

## Technology Stack

- **Runtime:** Python 3.11+
- **Data Format:** YAML with JSON Schema validation
- **API:** FastAPI (backend)
- **UI:** Next.js 16 with shadcn/ui (web application)
- **Testing:** pytest

---

## Running Locally

Both services start together with one script from the repo root. The backend serves the API on port 8000, the frontend on port 3000, and Ctrl+C stops both.

```bash
./dev.sh
```

First run needs dependencies: install the backend with `application/venv/bin/python -m pip install -r application/requirements.txt`, and the frontend with `npm install` inside `application/frontend`.

To run the services separately:

```bash
# Backend (from application/)
DEBUG=true ./venv/bin/python -m uvicorn src.api.main:app --reload --port 8000

# Frontend (from application/frontend/)
npm run dev
```

---

## Current Status

| Metric | Value |
|--------|-------|
| Agents Defined | 196 |
| Strategic Playbooks | 65 |
| Operational Playbooks | 7 |
| Canvas Types | 8 |
| Blueprint Templates | 3 |
| Sample Realms | 3 (ACME_CORP, GLOBEX, INITECH) |

**Phase:** Domain model and web application complete. Frontend provides portfolio dashboard with aggregated metrics and attention items, realm/node explorer with multi-tab detail views (overview, scenario, stakeholders, competitive intelligence, growth), canvas rendering for strategic artifacts (context, decision, risk governance, value/stakeholders, architecture decision), canvas library with catalog API and filter tabs, playbook catalog with summary cards and role browsing, agent profiles, blueprint overview with coverage metrics, knowledge vault with article detail and agent intelligence, node creation dialog, about page, and documentation browser. Backend API serves realms, nodes, canvases, canvas catalog, dashboard summary, playbooks, blueprints, knowledge vault CRUD, and docs. Ready for execution engine and agent runtime implementation.

---

## Quick Links

- [Executive Summary](docs/overview/executive-summary.md) - One-page overview (also linked from [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) at repo root for discoverability)
- [User Handbook](docs/HANDBOOK.md) - Role-based guide for AEs, SAs, CSMs
- [Product Requirements](PRD.md) - Goals, capabilities, glossary
- [Documentation Principles](docs/DOCUMENTATION_PRINCIPLES.md) - Writing for humans AND machines
- [Architecture Docs](docs/architecture/agents/agent-architecture.md) - System design
- [Decision Records](docs/decisions/README.md) - Domain and architecture decisions
- [llms.txt](llms.txt) - LLM-friendly project overview
