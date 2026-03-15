# EA Agentic Lab - Implementation Status

**Last Updated:** 2026-03-13
**Status:** Domain model defined, 149 playbooks authored, 40 agent definitions across 13 roles, web application functional with 28 pages covering dashboard, canvas, agents, blueprints, orchestration, and presentation views

---

## Overview

The EA Agentic Lab is a multi-agent governance system for strategic account management. The domain model, agent definitions, playbook library, and supporting documentation form the foundation. An iOS application and Python backend are scaffolded. The system is in the "domain complete, runtime emerging" phase.

---

## Component Status

### 1. Domain Model

The domain layer (`domain/`) contains all business logic definitions: agents, playbooks, catalogs, config, and mappings. No runtime code, purely declarative YAML and templates.

| Component | Count | Location | Status |
|-----------|-------|----------|--------|
| Playbook YAMLs | 149 | `domain/playbooks/{team}/` | Authored |
| Agent configs | 40 | `domain/agents/{team}/agents/` | Configured |
| Personality specs | 40 | `domain/agents/{team}/personalities/` | Configured |
| Skill definitions | 8 | `domain/agents/{team}/skills/` | Authored |
| Task prompt files | 17 | `domain/agents/{team}/prompts/tasks.yaml` | Authored |
| Templates | 8 | `domain/playbooks/templates/` | Authored |
| Canvas specs | 8 | `domain/playbooks/canvas/specs/` | Authored |
| Operational playbooks | 8 | `domain/playbooks/operational/` | Authored |
| Catalogs | 5 | `domain/catalogs/` | Authored |

### 2. Agents (40 definitions, 13 roles)

All agents have YAML configuration, personality specifications with anti-hallucination controls, and task prompts (CAF format). None have runtime implementations yet. Taxonomy defined in [DDR-021](../decisions/DDR_021_agent_taxonomy.md).

**Leadership (2 roles, 2 agents):**

| Agent | Team | Tasks |
|-------|------|-------|
| Senior Manager Agent | `leadership/` | 10+ |
| PM Agent | `product_managers/` | 10+ |

**Sales (4 roles, 4 agents):**

| Agent | Team | Tasks |
|-------|------|-------|
| AE Agent | `account_executives/` | 20+ |
| VE Agent | `value_engineering/` | 25+ |
| Partner Agent | `partners/` | 10+ |
| Hyperscaler Account Manager Agent | `hyperscaler_account_managers/` | 10+ |

**Architecture (3 roles, 16 agents):**

| Agent | Type | Tasks |
|-------|------|-------|
| SA Agent | Role (router) | 35+ |
| SA Discovery Agent | Co-located sub-agent | - |
| SA Technical Risk Agent | Co-located sub-agent | - |
| SA Decision Capture Agent | Co-located sub-agent | - |
| SA CSP Agent | Co-located sub-agent | - |
| SA Best Practices Agent | Co-located sub-agent | - |
| SA Journey Agent | Co-located sub-agent | - |
| RFP Agent | External sub-agent | 10+ |
| POC Agent | External sub-agent | 20+ |
| Specialist Engagement Agent | External sub-agent | 10+ |
| Security Specialist | Domain sub-agent | 12 playbooks |
| Observability Specialist | Domain sub-agent | 10 playbooks |
| Search Specialist | Domain sub-agent | 10 playbooks |
| InfoSec Agent | Standalone role (peer to SA) | 10+ |
| CA Agent | Role | 18+ |
| Retrospective Agent | CA sub-agent | - |

**Intelligence (2 roles, 6 agents):**

| Agent | Type | Tasks |
|-------|------|-------|
| CI Agent | Role | 10+ |
| Account Intelligence Agent | Sub-agent | - |
| Industry Intelligence Agent | Sub-agent | - |
| Market News Agent | Sub-agent | - |
| Tech Signal Scanner | Sub-agent | - |
| Tech Signal Analyzer | Sub-agent | - |

**Delivery (2 roles, 2 agents):**

| Agent | Team | Tasks |
|-------|------|-------|
| Delivery Agent | `delivery/` | 10+ |
| PS Agent | `professional_services/` | 10+ |

**Note:** The Support Agent was dissolved (2026-02). Its support-to-account bridge function is now handled by SIG_SUP_* signals in the signal catalog, consumed by the CA Agent via skill SK_CA_001 (Support Intelligence Triage). DSE coordination moved to PS Agent.

**Governance Agents (10, system infrastructure):**

| Agent | Trigger | Purpose |
|-------|---------|---------|
| Meeting Notes Agent | `meeting_ended` | Extract decisions/actions/risks |
| Task Shepherd Agent | `action_created` | Action validation and linkage |
| Decision Registrar Agent | `decision_mentioned` | Decision lifecycle tracking |
| Risk Radar Agent | Various | Risk detection and classification |
| Nudger Agent | Daily / overdue | Reminder and escalation enforcement |
| Reporter Agent | Friday 5pm | Weekly digest generation |
| Signal Matcher Agent | Signal detected | Route signal to correct agent |
| Playbook Curator Agent | `playbook_modified` | Playbook validation and governance |
| InfoHub Curator Agent | `artifact_created/updated` | Semantic integrity, InfoHub lifecycle |
| Knowledge Vault Curator Agent | `knowledge_proposal_received` | Vault 3 governance, proposal validation |

### 3. Playbooks (149 authored)

Playbooks are organized by team ownership using the `PB_PREFIX_NNN` ID scheme. Each follows a standardized YAML schema with metadata, vault routing, trigger conditions, required inputs, key questions, decision logic, expected outputs, stop conditions, and validation checks. All playbooks include `vault_routing` metadata aligned to the three-vault knowledge architecture.

| Team | Count | Key Playbooks |
|------|-------|---------------|
| Strategy | 6 | Three Horizons, Ansoff, BCG, SWOT, PESTLE, Stakeholder Mapping |
| Solution Architects | 5 | TOGAF ADM, Sizing Estimation, Solution Description, Five Whys, TECHDRIVE |
| Customer Architects | 12 | Health Score, Success Plan, Journey VoC, Guidelines, Training, Adoption, Cadence Calls, Health Triage, Track/Escalate/Review Support |
| Specialists: Security | 12 | Technical validation, RFx, solution scoping, use cases, migration, POC, battlecard |
| Specialists: Search | 10 | Validation, RFx, schema design, relevance tuning, vector search, RAG |
| Specialists: Observability | 10 | Discovery, demo, validation, SLO/SLI, APM, platform architecture |
| Account Executives | 5 | Retrospective, Account Planning, Sales QBR, Opportunity Consult, MEDDPICC |
| Account Intelligence | 3 | Initial Research, Org Mapping, Periodic Refresh |
| Industry Intelligence | 2 | Industry Deep Dive, Trend Analysis |
| Technology Scout | 2 | Tech Landscape Scan, Vendor Analysis |
| Value Engineering | 7 | Value Engineering, Hypothesis, Calculation, Workshop, Proof, Realization, Amplification |
| RFP | 5 | RFP Processing, Bid Decision, Response Strategy, Quality Review, Post Submission |
| InfoSec | 2 | Security Questionnaire, Compliance Gap Assessment |
| Delivery | 7 | Implementation Kickoff, Go-Live Readiness, Risk Review, Post-Implementation Review, Engage DSE, Security Stage Adoption, Tech Trend Response |
| Partners | 3 | Partner Engagement Health, Dependency Tracking, Joint Account Planning |
| Product Managers | 3 | Feature Gap Analysis, Roadmap Alignment, Feature Request Pattern |
| Management | 2 | Deal Escalation Review, Forecast Commit Approval |
| Governance | 7 | Nudge Effectiveness, Action Audit, Decision Digest, Risk Review, Signal Quality, InfoHub Freshness, Vault Structure |
| Competitive Intelligence | 1 | Five Forces |
| POC | 1 | POC Success Plan |
| Admins | 4 | Render canvas, canvas gap analysis, validate playbook, blueprint gap scan |
| Operational | 8 | Risk registration, action creation/completion, escalation, health alerts, meeting notes, commercial fields, tech signals |

### 4. Knowledge Architecture

The three-vault model separates knowledge by audience and sensitivity (see [DDR-001](../decisions/DDR_001_three_vault_knowledge_architecture.md)):

| Vault | Scope | Audience | Content Examples |
|-------|-------|----------|-----------------|
| Customer InfoHub | Per account | Shareable with customer | Architecture docs, ADRs, POC plans, training |
| Internal Account Hub | Per account | Vendor-only | Competitive intel, deal reviews, pricing, risk assessments |
| Global Knowledge Vault | Cross-account | Vendor-only, anonymized | Best practices, winning patterns, tribal knowledge |

All playbooks include `vault_routing` metadata specifying primary vault, rationale, and secondary outputs.

### 5. Application

| Component | Location | Technology | Status |
|-----------|----------|------------|--------|
| Web frontend | `application/frontend/` | Next.js 16, React 19, Tailwind CSS 4, Shadcn | Functional |
| Backend API | `application/src/api/` | Python 3.12+, FastAPI, PyYAML | Functional |
| iOS app | `application/` | Swift | Scaffolded |

**Backend services (8):**

| Service | Purpose | Status |
|---------|---------|--------|
| `yaml_loader.py` | Core vault YAML reader, realm/node/health/risk/action loading | Functional |
| `vault_service.py` | InfoHub access (external + internal), blueprint mutations | Functional |
| `canvas_service.py` | Canvas spec + vault data assembly, 5 canvas-type assemblers | Functional |
| `dashboard_service.py` | Portfolio aggregation across all realms/nodes | Functional |
| `node_service.py` | Node creation with blueprint composition | Functional |
| `stance_service.py` | Stakeholder stance proposals and approval workflow | Functional |
| `knowledge_service.py` | Knowledge vault CRUD and proposals | Functional |
| `docs_service.py` | Documentation tree and content serving | Functional |

**Frontend pages (28):**

| Page | Route | Key features |
|------|-------|-------------|
| Landing | `/` | Framework overview, pillars, lifecycle, personas |
| About | `/about` | System overview and navigation |
| Dashboard | `/dashboard` | Portfolio metrics (6 cards), attention items, per-realm node rows |
| Realm detail | `/realms/[id]` | Profile tabs, node list, competitive landscape, growth strategy |
| Node detail | `/realms/[id]/nodes/[id]` | Overview, Blueprint, Health, Risks, Stakeholders, canvas viewer |
| Agents list | `/agents` | All agent profiles overview |
| Agent definitions | `/agents/definitions` | YAML-sourced agent definition browser |
| Agent profiles | `/agents/profiles` | Agent profile cards by functional area |
| Playbooks | `/playbooks` | Catalog with filters, detail view |
| Blueprints | `/blueprints` | Blueprint catalog overview |
| Blueprint archetypes | `/blueprints/archetypes` | Archetype browser |
| Blueprint reference | `/blueprints/reference` | Reference blueprint compositions |
| Blueprint view | `/blueprints/view` | Blueprint detail viewer |
| Canvas | `/canvas` | Canvas spec viewer |
| Knowledge | `/knowledge` | Knowledge vault with stats, proposals |
| Orchestration | `/orchestration` | Process orchestration viewer |
| Documentation | `/docs` | Markdown browser with sidebar tree |
| Present: blueprints | `/present/blueprints` | Blueprint presentation view |
| Present: canvas | `/present/canvas` | Canvas presentation view |
| Present: knowledge | `/present/knowledge` | Knowledge presentation view |
| Present: node | `/present/node` | Node summary presentation view |
| Present: orchestration | `/present/orchestration` | Orchestration presentation view |
| Present: pitch | `/present/pitch` | Account pitch deck |
| Present: portfolio | `/present/portfolio` | Portfolio presentation view |
| Present: QBR | `/present/qbr` | Quarterly business review deck |
| Present: realm | `/present/realm` | Realm summary presentation view |

**Canvas rendering (DDR-010):** 5 canvas assemblers implemented (context, decision, risk governance, value/stakeholders, architecture decision) with generic fallback. Frontend format-dispatch renderer handles 10+ section formats.

### 6. Documentation

Reorganized (2026-02-10) into reader-intent structure. 149 markdown files total.

| Section | Path | Purpose |
|---------|------|---------|
| Architecture | `docs/architecture/` | System design: agents, playbooks, system design (signal catalog moved here 2026-03-13) |
| Operating Model | `docs/operating-model/` | RACI, engagement phases, realm profiles |
| Decisions | `docs/decisions/` | 25 DDR + 7 ADR = 32 decision records |
| Guides | `docs/guides/` | 16 files: 3 top-level, 9 practitioner, 4 developer |
| Reference | `docs/reference/` | Catalogs, agent profiles, terminology |
| Planning | `docs/planning/` | Gap analyses, status tracking (gitignored) |

**Decision records (32):**

| ID | Title | Type | Status |
|----|-------|------|--------|
| DDR-001 | Three-Vault Knowledge Architecture | Domain | ACCEPTED |
| DDR-002 | Canvas Framework | Domain | ACCEPTED |
| DDR-003 | Domain Specialist Agents | Domain | ACCEPTED |
| DDR-004 | Tech Signal Intelligence | Domain | ACCEPTED |
| DDR-005 | Signal-Based Action Completion | Domain | ACCEPTED |
| DDR-006 | InfoHub Shared Screen Test | Domain | ACCEPTED |
| DDR-007 | Blueprint Instance Engagement Plan | Domain | ACCEPTED |
| DDR-008 | Knowledge Vault Learning System | Domain | ACCEPTED |
| DDR-009 | Stakeholder Stance Classification | Domain | ACCEPTED |
| DDR-010 | Reports and Canvas Rendering | Domain | ACCEPTED |
| DDR-011 | Report Generation Pipeline | Domain | ACCEPTED |
| DDR-012 | Playbook Metadata Standardization | Domain | ACCEPTED |
| DDR-013 | Knowledge Capture Strategy | Domain | ACCEPTED |
| DDR-014 | Knowledge to Playbook Feedback | Domain | ACCEPTED |
| DDR-015 | Curator Agent Specialization | Domain | ACCEPTED |
| DDR-016 | Skill Architecture | Domain | ACCEPTED |
| DDR-017 | Support Agent Dissolution | Domain | ACCEPTED |
| DDR-018 | Agent Definition Alignment | Domain | ACCEPTED |
| DDR-019 | Agent System Domain Model v3.0 | Domain | ACCEPTED |
| DDR-020 | Profile Definition Generation Pipeline | Domain | ACCEPTED |
| DDR-021 | Agent Taxonomy | Domain | ACCEPTED |
| DDR-022 | Knowledge QA Service Evolution | Domain | ACCEPTED |
| DDR-023 | Prompt Data Dependencies | Domain | ACCEPTED |
| DDR-024 | Runtime Binding Architecture | Domain | ACCEPTED |
| DDR-025 | Methodology Reference Architecture | Domain | ACCEPTED |
| ADR-001 | Streamlit Playbook Viewer | Architecture | SUPERSEDED |
| ADR-002 | Next.js Web Application | Architecture | ACCEPTED |
| ADR-003 | Multi-UI Architecture | Architecture | ACCEPTED |
| ADR-004 | FastAPI Backend | Architecture | ACCEPTED |
| ADR-005 | Documentation Browser | Architecture | ACCEPTED |
| ADR-006 | Landing Page Route Restructure | Architecture | ACCEPTED |
| ADR-007 | Interactive Framework Map | Architecture | DEFERRED |

### 7. Supporting Configuration

| Component | Location | Purpose |
|-----------|----------|---------|
| Checklists | `domain/config/checklists/` | Blueprint, canvas, playbook checklists |
| Catalogs | `domain/catalogs/` | Agent catalog, signal catalog, tech signal map, archetypes, tool design |
| Mappings | `domain/mappings/` | Agent role mapping, engagement tracks |
| Prompts | `domain/prompts/` | Context engineering, prompt engineering configs |

---

## Repository Structure

```text
ea-agentic-lab/
├── application/                  # Application (Streamlit UI + Swift iOS + Python backend)
├── data/                         # Runtime data
├── domain/
│   ├── agents/                   # 40 definitions across 13 roles
│   │   └── {team}/
│   │       ├── agents/           # Agent config YAML
│   │       ├── personalities/    # Personality specs
│   │       └── prompts/          # Task prompts (CAF format)
│   ├── playbooks/
│   │   ├── {team}/               # 91 playbook YAMLs by team
│   │   ├── operational/          # 6 micro-playbooks
│   │   ├── canvas/               # 8 canvas specs + registry
│   │   └── templates/            # 8 reusable templates
│   ├── catalogs/                 # Agent, signal, tech signal catalogs
│   ├── config/                   # Checklists, thresholds, connectors
│   ├── mappings/                 # Role and engagement mappings
│   └── prompts/                  # Context and prompt engineering
├── docs/
│   ├── architecture/             # Agents, playbooks, system design
│   ├── operating-model/          # RACI, engagement phases
│   ├── decisions/                # DDR and ADR records
│   ├── guides/                   # Practitioner and developer guides
│   ├── reference/                # Catalogs and quick-reference
│   └── planning/                 # Status, gaps, reviews
└── vault/                        # Knowledge vaults (runtime)
```

---

## What's Built vs What's Next

### Built (domain layer)

- 149 playbook definitions covering strategy, technical, customer success, specialist, operational, delivery, product management, partner, and admin workflows
- 40 agent definitions with personality specs, anti-hallucination controls, and 200+ task prompts across 13 roles
- Three-vault knowledge architecture with vault routing on all playbooks
- 32 decision records (25 DDR + 7 ADR)
- 8 canvas specifications for visual artifacts
- Operating model with RACI assignments across all teams
- Documentation restructured by reader intent (149 files, guides with screenshots)

### Runtime layer (separate project)

The runtime will be a separate project that consumes ea-agentic-lab as a playbook library. This repo stays as the domain specification and browsing tool. The `application/` directory serves as a librarian and demo for exploring the domain model, not as the production runtime.

**Runtime scope (separate repo, TBD):**

- Playbook execution engine (load YAML, run steps, generate outputs)
- Agent runtime (LLM integration, tool calling, signal processing)
- Trigger system (event-driven playbook activation)
- Vault routing enforcement (runtime validation that outputs go to the correct vault)
- Multi-agent orchestration (cross-agent workflows)
- Report generation pipeline (LLM-synthesized reports from vault data, see DDR-010 future scope)
- Canvas export (PDF/slide generation from rendered canvases)

**Terminology consideration:** The buyer/deployer of the system is the "Owner" (a software vendor managing enterprise accounts). The `{vendor}` placeholder in playbooks represents the Owner. Nodes are the Owner's customers. Formal glossary to be added when the runtime project is created.

### Data ownership gaps

Identified during dashboard implementation (documented in DDR-010 Open Questions):

- ~~**Commercial fields in node_profile.yaml have no agent owner.**~~ Resolved: OP_COM_001 (Update Commercial Fields) gives AE Agent ownership of `opportunity_arr`, `probability`, `stage`, `next_milestone` with decision logic for regressions and staleness.
- **Canvas re-rendering has no trigger loop.** Canvas specs define `triggers.on_update` conditions but nothing evaluates them. Canvases render fresh data on demand (acceptable for now), but stale exports would not reflect recent changes. Proposed: extend PB_ADM_002 (Canvas Gap Analysis) with staleness detection.
- **Reporter agent and dashboard service duplicate aggregation logic.** Both read the same vault sources and compute similar aggregates. Proposed: when reporter gets runtime, have it consume the dashboard API endpoint.

### Consistency tasks

- ~~Add `vault_routing` metadata to existing playbooks~~ (done, all playbooks have it)
- ~~Add `raci` section to playbooks missing it~~ (done, all playbooks have it)
- ~~Validate all playbook YAMLs against implicit schema conventions~~ (done, all 106 pass yaml.safe_load)
- ~~Remove legacy files (`domain/agents/solution_architects/agents/_agent.yaml`, `_agent_personality.yaml`)~~ (done, already removed)

---

## Version History

| Date | Milestone |
|------|-----------|
| 2026-01-11 | Playbook framework designed, first 3 playbooks authored |
| 2026-01-15 | 9 core playbooks complete, framework catalog (60+ frameworks) |
| 2026-01-20 | Customer-focused frameworks (journey mapping, VoC, POC success) |
| 2026-01-22 | Context engineering, tool design, prompt engineering principles |
| 2026-02-01 | Agent task prompts expanded to 17 teams (200+ tasks) |
| 2026-02-03 | Specialist sub-teams (security, search, observability) with 32 playbooks |
| 2026-02-03 | Operational playbooks, canvas framework, RACI model |
| 2026-02-09 | Three-vault knowledge architecture (DDR-001), 6 new playbooks with vault_routing |
| 2026-02-09 | Decision documentation framework (DDR + ADR), Streamlit viewer decision (ADR-001) |
| 2026-02-10 | Documentation restructured (architecture/, operating-model/, guides/, decisions/) |
| 2026-02-12 | Competitive intelligence UI, stakeholder interactivity, realm profile tabs |
| 2026-02-13 | Canvas rendering pipeline (5 assemblers, format-dispatch renderer), portfolio dashboard with aggregated metrics, DDR-010 accepted |
| 2026-03-06 | Playbook ID migration to `PB_PREFIX_NNN`, 20 new playbooks (RFP, InfoSec, VE, Management, Governance), DDR-024 runtime binding, `intended_agent_role` on all files, 47 agent definitions with resolver fields |
| 2026-02-27 | QBR playbooks (PB_AE_003, PB_CA_001), Support Agent dissolved into SIG_SUP_* signals + CA Agent skill SK_CA_001 |
| 2026-02-27 | vault_routing added to all 99 playbooks, PB_CA_002-190 (C06 support/DSE) authored, PB_DEL_001-004 (Delivery Agent) authored, Delivery Agent gap resolved |
| 2026-02-27 | QBR playbooks enhanced to v2.0: quarter-long prep cadence, interactive agendas, coaching questions, pipeline review techniques, stakeholder tailoring, customer wins framework |
| 2026-02-27 | RACI added to all playbooks, PM Agent playbooks (PB_PM_001-003), Partner Agent playbooks (PB_PTR_001-003), OP_COM_001 (commercial field ownership), all consistency tasks resolved |
| 2026-03-13 | DDR-021 agent taxonomy accepted: 40 definitions across 13 roles. HAM Agent added (hyperscaler co-sell). CI Agent moved to Intelligence section. Signal Matcher added to governance (10 total). UI fixes: light theme, TOGAF removed, RFP role visibility, guardrails panel. Docs reorganized for findability: intent navigation, guides rewritten, 16 SA/RFP/process-orchestration screenshots wired. Signal Catalog moved to architecture/system. docs_service.py title extraction fixed. docs/planning gitignored. |
