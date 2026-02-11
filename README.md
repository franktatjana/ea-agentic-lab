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

### 1. Multi-Agent Architecture (24 Agents)

| Layer | Agents | Purpose |
|-------|--------|---------|
| Strategic | 15 | Apply judgment, use frameworks, make recommendations |
| Governance | 8 | Enforce process, maintain artifacts, reduce entropy |
| Orchestration | 1 | Coordinate agents, detect conflicts, manage workflows |

### 2. Playbook Engine

| Type | Count | Purpose |
|------|-------|---------|
| Strategic Playbooks | 17+ | Framework operationalization (SWOT, Three Horizons, TOGAF) |
| Operational Playbooks | 5+ | Event-driven procedures (risk registration, action creation) |
| Canvas Playbooks | 2 | Visual artifact rendering |

### 3. InfoHub (Knowledge Repository)

Structured storage organized by:

- **Realm** = Company (ACME, GlobalTech, FinCorp)
- **Node** = Initiative within a Realm (Security Consolidation, Observability Rollout)

Each Node contains: meetings, decisions, risks, actions, architecture, value tracking, governance.

---

## Key Differentiators

Three design choices separate this system from traditional account management tooling. Each creates compounding value the longer the system is used.

**Documents for machines, artifacts for humans.** Everything is stored as structured, machine-readable YAML with schema validation. Canvases, reports, and dashboards are rendered from that data on demand. This inverts the traditional approach where humans write documents that machines cannot parse. When data is machine-readable first, agents can validate it, gap-scan it, cross-reference it, and render it into any format a stakeholder needs.

**Personalizable AI agent teams.** The 24 agents are not a monolithic system. Each Account Executive gets their own agent team configured for their accounts, domains, and engagement patterns. One AE running three security deals and a search expansion gets a team weighted toward security and search specialists with competitive displacement playbooks loaded. Another AE managing strategic renewals gets retention-focused agents with health monitoring and champion mapping. The agent team adapts to how each person works, not the other way around.

**Customer-facing knowledge as a deliverable.** When the system works on a customer engagement, it does not just track internal notes. It creates a structured InfoHub for that customer, organized by initiative, with every artifact, decision, risk, and action item captured with full provenance. This means the engagement itself produces a curated knowledge repository that can be shared with the customer, handed off to a new team member, or audited years later. Knowledge sharing is not a side effect, it is the primary output.

**Proactive governance, not passive dashboards.** Traditional tools show you a dashboard and wait for you to check it. This system's governance agents continuously scan for gaps, flag overdue actions, detect stale artifacts, and nudge before problems become visible. The difference is between a smoke detector and a fire report.

**Classification-driven automation.** Recognizing "this is a Competitive Displacement × Security × Premium" is not just a label. It automatically selects the right blueprint, loads the right playbooks, assigns the right evaluation criteria, and defines what success looks like. Adding a new domain does not require rebuilding the system, just new specialist playbooks and checklists. The engagement patterns stay the same.

**A self-learning system.** Most tools are static: they do the same thing on day one and day one thousand. This system gets measurably smarter with every engagement. Win/loss correlation adjusts checklist weights. Field feedback reshapes evaluation criteria. Best practices surface automatically in future engagements. The hundredth deal benefits from the ninety-nine before it. Over time, the system will learn which playbook sequences produce the best outcomes for each archetype, which discovery questions correlate with deal success, and which risk patterns predict churn, continuously refining its recommendations without manual tuning.

---

## Technology Stack

- **Runtime:** Python 3.11+
- **Data Format:** YAML with JSON Schema validation
- **API:** FastAPI (backend)
- **UI:** Streamlit (demo), mobile companion app (planned)
- **Testing:** pytest

---

## Current Status

| Metric | Value |
|--------|-------|
| Agents Defined | 24 |
| Strategic Playbooks | 17 |
| Canvas Types | 8 |
| Architecture | Complete |

**Phase:** Vertical slice complete. Ready for execution engine implementation.

---

## Quick Links

- [Executive Summary](EXECUTIVE_SUMMARY.md) - One-page overview
- [User Handbook](docs/HANDBOOK.md) - Role-based guide for AEs, SAs, CSMs
- [Product Requirements](PRD.md) - Goals, capabilities, glossary
- [Documentation Principles](docs/DOCUMENTATION_PRINCIPLES.md) - Writing for humans AND machines
- [Architecture Docs](docs/architecture/agents/agent-architecture.md) - System design
- [llms.txt](llms.txt) - LLM-friendly project overview
