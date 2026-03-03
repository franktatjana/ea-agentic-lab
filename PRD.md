# Product Requirements Document (PRD)

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

**Product:** EA Agentic Lab
**Version:** 1.3
**Date:** 2026-02-28
**Status:** Living Document

---

## 1. Executive Summary

EA Agentic Lab is a multi-agent governance platform that enforces structured account management for complex enterprise engagements. It combines 33 AI-assisted agents with playbook-driven execution across 96 playbooks to ensure consistent, auditable governance. Knowledge is organized in a three-vault architecture, separating customer-facing, vendor-internal, and cross-account institutional knowledge. A web dashboard (Next.js) and iOS companion app provide the user interface for practitioners, managers, and platform administrators.

---

## 2. Target Users

### Primary Users

| Persona | Role | Needs |
|---------|------|-------|
| **Solution Architect (SA)** | Technical lead on accounts | Architecture decisions, technical risk tracking, POC execution |
| **Account Executive (AE)** | Commercial owner | Deal progression, stakeholder management, value articulation |
| **Customer Success Manager (CSM)** | Post-sales owner | Adoption tracking, health scoring, renewal preparation |

### Secondary Users

| Persona | Role | Needs |
|---------|------|-------|
| **Senior Manager** | Oversight & coaching | Portfolio visibility, escalation resolution, resource allocation |
| **Project Manager (PM)** | Execution coordination | Risk register, action tracking, meeting governance |
| **Support/Delivery** | Implementation | Technical context, customer history, handover documentation |

### Platform Users

| Persona | Role | Needs |
|---------|------|-------|
| **Platform Admin** | System configuration | Agent tuning, playbook curation, threshold management |
| **InfoHub Curator** | InfoHub governance | InfoHub artifact quality, semantic integrity, lifecycle |
| **Knowledge Vault Curator** | Knowledge Vault governance | Anonymization, proposal validation, knowledge-playbook alignment |

---

## 3. Goals & Success Metrics

### Business Goals

| Goal | Metric | Target |
|------|--------|--------|
| Reduce governance entropy | Info capture rate from meetings | >90% decisions/actions captured |
| Improve risk visibility | Average risk detection time | <24 hours from signal |
| Increase playbook adoption | Playbooks executed per engagement | >3 strategic playbooks |
| Accelerate onboarding | Time to productive on new account | <2 days with InfoHub |

### Technical Goals

| Goal | Metric | Target |
|------|--------|--------|
| Execution reliability | Playbook success rate | >95% |
| Data quality | Validation pass rate | >90% |
| System performance | Canvas render time | <2 seconds |
| Coverage | Gap analysis score | >80% per node |

---

## 4. Core Capabilities

### 4.1 Multi-Agent Orchestration

**Capability:** 33 specialized agents operating in three coordinated layers across 20 team directories.

| Layer | Agents | Purpose |
|-------|--------|---------|
| Strategic | 18 | Account management, architecture, deal execution, delivery, leadership |
| Governance | 10 | Process enforcement, artifact management, signal routing, quality control |
| Intelligence | 5 | Company research, industry analysis, tech scanning, market news |

| Feature | Description | Priority |
|---------|-------------|----------|
| Agent Registry | Centralized agent definitions with capabilities, thresholds, boundaries | Critical |
| Signal Routing | Event-driven communication between agents via 53 signals across 12 categories | Critical |
| Handover Protocol | Structured handoff with context preservation | Critical |
| Escalation Hierarchy | Automated escalation based on authority levels | High |
| Agent Monitoring | Health, activity, and performance tracking | Medium |
| Agent Personalities | Per-agent personality YAML configs with tone, style, constraints | High |
| Task Prompts | CAF-format (Context, Action, Format) task definitions per team | High |

### 4.2 Playbook Engine

**Capability:** Execute strategic frameworks and operational procedures. Currently 88 strategic playbooks across 12 team domains and 8 operational playbooks for event-driven procedures.

| Feature | Description | Priority |
|---------|-------------|----------|
| Playbook Loader | Schema validation, YAML parsing | Critical |
| Decision Logic Language (DLL) | Machine-executable conditions | Critical |
| Threshold Manager | Configurable business parameters | Critical |
| Evidence Validator | Citation requirement enforcement | High |
| Playbook Executor | End-to-end orchestration | Critical |
| Run Tracing | Execution history and audit trail | High |

### 4.3 Three-Vault Knowledge Architecture

**Capability:** Knowledge separated into three vaults with distinct audience, access rules, and lifecycle. Each vault is machine-readable YAML, enabling agents to validate, gap-scan, and cross-reference data automatically.

| Vault | Scope | Audience | Content |
|-------|-------|----------|---------|
| **Customer InfoHub** | Per account, shareable | Customer + internal teams | Solution architecture, ADRs, POC plans, learning paths |
| **Internal Account Hub** | Per account, vendor-only | Vendor team only | Competitive intelligence, risk assessments, stakeholder mapping, meeting notes |
| **Global Knowledge Vault** | Cross-account, anonymized | All engagements | Best practices, winning patterns, evolved evaluation criteria, lessons learned |

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into the global vault.

| Feature | Description | Priority |
|---------|-------------|----------|
| Realm/Node Hierarchy | Company → Initiative structure with per-node vault separation | Critical |
| Artifact Storage | Decisions, risks, actions, meetings, architecture per vault | Critical |
| Vault Separation | Customer-facing, vendor-internal, and global knowledge isolation | Critical |
| Versioning | Artifact history and change tracking | High |
| Promotion Workflow | Draft → Review → Published lifecycle | High |
| Cross-Node Queries | Realm-level aggregation across vaults | Medium |
| Anonymization Pipeline | Account → Global vault contribution with PII removal | Medium |

### 4.4 Canvas Framework

**Capability:** Visual one-page artifacts for human consumption.

| Feature | Description | Priority |
|---------|-------------|----------|
| Canvas Registry | 8 canvas types with specs and templates | Critical |
| Dual Output | Markdown (git) + HTML (humans) | Critical |
| Gap Analysis | Missing, incomplete, stale detection | Critical |
| Event-Driven Refresh | Auto-render on data changes | High |
| Canvas Lifecycle | Draft → Published → Stale → Archived | High |

### 4.5 Checklist & Validation

**Capability:** Automated quality control and gap detection.

| Feature | Description | Priority |
|---------|-------------|----------|
| Playbook Checklists | Pre/post execution validation | Critical |
| Blueprint Checklists | Cross-cutting governance rules | High |
| Staleness Detection | Artifact age monitoring | Critical |
| Contradiction Detection | Conflicting values across artifacts | Medium |
| Auto-Fix Recommendations | Suggested playbooks for gaps | High |

### 4.6 Configuration Layer

**Capability:** Centralized, overridable system configuration.

| Feature | Description | Priority |
|---------|-------------|----------|
| Path Variables | Decouple playbooks from hardcoded paths | Critical |
| Threshold Overrides | Blueprint → Realm → Node cascade | Critical |
| Signal Catalog | 53 signals across 12 categories with producer/consumer definitions | Critical |
| Agent Catalog | 33 agents across 20 team directories, centralized registry | High |
| Operating Mode Rules | Mode → Playbook applicability matrix | High |

### 4.7 User Interface

**Capability:** Multi-platform access for practitioners, managers, and administrators.

| Feature | Description | Priority |
|---------|-------------|----------|
| Web Dashboard | Next.js 16 application with 17 pages: portfolio dashboard, realm/node explorer, canvas library, playbook catalog, agent profiles, blueprint browser, knowledge vault, docs | Critical |
| iOS Companion App | SwiftUI native app (iOS 17+) for mobile read access: dashboard, nodes, actions, risks, signals | Medium |
| Demo UI | Streamlit application for rapid prototyping and demos | Low |
| Realm Explorer | Multi-tab detail views: overview, scenario, stakeholders, competitive, growth, industry, organigram, vendors, opportunities | Critical |
| Canvas Rendering | Visual one-page artifact rendering from YAML data with filter tabs and catalog API | Critical |
| Node Creation | Dialog-based node creation with archetype and track selection | High |

### 4.8 Intelligence Layer

**Capability:** Five specialized agents that gather, analyze, and surface external intelligence to inform engagement strategy. Intelligence feeds into the signal catalog and enriches playbook execution context.

| Feature | Description | Priority |
|---------|-------------|----------|
| Account Company Intelligence | Company research, organigram analysis, business line mapping, opportunity identification | High |
| Industry Intelligence | Sector analysis, regulatory landscape monitoring, market trend detection | High |
| Tech Signal Scanner | Job posting analysis, tech blog monitoring, technology announcement tracking | Medium |
| Tech Signal Analyzer | Technology trend analysis, vendor landscape mapping, radar generation | Medium |
| Market News Analysis | Lightweight news monitoring, feed signal generation for downstream agents | Medium |

---

## 5. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Playbook execution time | <30 seconds for strategic playbooks |
| Canvas render time | <2 seconds |
| API response time | <500ms for read operations |
| Concurrent users | 50+ per deployment |

### Reliability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% |
| Data durability | No artifact loss |
| Idempotency | Playbook re-runs produce same output |
| Recovery | <1 hour from failure |

### Security

| Requirement | Target |
|-------------|--------|
| Authentication | SSO integration (OAuth 2.0) |
| Authorization | Role-based access control |
| Audit logging | All agent actions logged |
| Data encryption | At rest and in transit |

### Scalability

| Requirement | Target |
|-------------|--------|
| Realms | 100+ per deployment |
| Nodes per Realm | 50+ |
| Concurrent playbook executions | 10+ |
| Historical runs | 1 year retention |

---

## 6. Out of Scope (v1.0)

- Real-time collaboration on artifacts
- Custom playbook authoring UI
- Third-party CRM integration
- iOS offline mode (online-only read access is in scope)
- Multi-language support

---

## 7. Technology Stack & Dependencies

### Runtime & Backend

| Component | Technology | Risk |
|-----------|------------|------|
| Runtime | Python 3.12+ | Low |
| API Framework | FastAPI with Pydantic | Low |
| Data Format | YAML with JSON Schema validation (PyYAML) | Low |
| LLM Provider | Claude for agent reasoning | High, core functionality |
| Testing | pytest (8 test modules) | Low |

### Frontend

| Component | Technology | Risk |
|-----------|------------|------|
| Web Dashboard | Next.js 16, React 19, TypeScript | Low |
| UI Components | Tailwind CSS, shadcn/ui (Radix) | Low |
| Data Fetching | TanStack React Query | Low |

### Mobile

| Component | Technology | Risk |
|-----------|------------|------|
| iOS App | Swift 5.9+, SwiftUI, iOS 17+ | Low |

### Storage

| Component | Technology | Risk |
|-----------|------------|------|
| Data Storage | File-based YAML (no database) | Medium, scale limits |
| Knowledge Architecture | Three-vault separation per realm | Low |

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| LLM hallucination | Wrong recommendations | Medium | Evidence validation, human-in-loop |
| Schema drift | Broken playbooks | Medium | Schema versioning, migration tooling |
| Adoption resistance | Low usage | Medium | Start with high-value playbooks, prove ROI |
| Performance at scale | Slow execution | Low | Caching, async processing |

---

## 9. Success Criteria (v1.0 Launch)

- [x] 5+ strategic playbooks production-ready (88 defined)
- [ ] 3+ governance agents operational (10 defined, runtime pending)
- [x] 1 realm with 3+ nodes fully populated (3 realms, 4 nodes)
- [x] Canvas framework rendering all 8 types
- [ ] Gap analysis detecting missing artifacts (framework exists, not fully active)
- [x] Mobile companion app for read access (iOS app built)
- [ ] 90%+ test pass rate (8 test modules, execution engine pending)

---

## 10. Glossary

### Hierarchy (top to bottom)

| Term | Definition | Example |
|------|------------|---------|
| **Archetype** | Project typology classified by signals. Top of composition hierarchy. | `security_consolidation`, `observability_greenfield` |
| **Reference Blueprint** | Reusable playbook/asset composition for an Archetype. Multiple variants (A01-A06) per Archetype. | `A01_basic.yaml`, `A02_competitive.yaml` |
| **Blueprint Instance** | Node-specific instance created from Reference Blueprint. | `ACME/SEC_CONSOL/blueprint.yaml` |
| **Playbook** | Small, atomic operational scenario (~15-30 min) with inputs, steps, outputs. | `PB_201` (SWOT), `PB_102` (Stakeholder Mapping) |

### Policy Layer (orthogonal)

| Term | Definition | Example |
|------|------------|---------|
| **Engagement Track** | Service tier defining SLA, scope, cadence, mandatory assets. Applies across archetypes. | Economy, Premium, Fast Track, POC |

### Data Model

| Term | Definition | Example |
|------|------------|---------|
| **Realm** | A company or customer organization. Top-level container in InfoHub. | `ACME`, `GLOBALTECH` |
| **Node** | A specific engagement, initiative, or project within a Realm. | `SECURITY_CONSOLIDATION`, `OBSERVABILITY_ROLLOUT` |
| **Asset** | Instance output produced by playbook execution. Immutable once published. | `ACME/SEC_CONSOL/canvases/context.md` |
| **Template** | Governed library item (canvas template, schema). Version-controlled. | `templates/canvas/context_canvas.html` |
| **Canvas** | One-page visual artifact for human consumption. Markdown + HTML output. | Context Canvas, Decision Canvas |

### Knowledge Architecture

| Term | Definition | Example |
|------|------------|---------|
| **Customer InfoHub** | Per-account shareable knowledge vault for customer-facing deliverables. | Solution architecture, ADRs, POC plans |
| **Internal Account Hub** | Per-account vendor-only operational knowledge. | Competitive intelligence, meeting notes, risk assessments |
| **Global Knowledge Vault** | Cross-account anonymized institutional learning repository. | Best practices, winning patterns, lessons learned |
| **Domain** | Specialist area orthogonal to archetype. Determines which specialist agents and playbooks apply. | `security`, `search`, `observability` |

### Governance

| Term | Definition | Example |
|------|------------|---------|
| **Checklist** | Machine-readable validation rules with assertions, severity, auto-fix. | `CHK_PRE_001`, `CHK_NODE_003` |
| **Gap Scan** | Compliance check comparing Blueprint Instance against Reference Blueprint. | PB_971 output |
| **Signal** | Event emitted by agents to trigger downstream actions. 53 signals across 12 categories. | `SIG_ART_001` (artifact created) |
| **Agent** | AI-assisted actor with defined capabilities, boundaries, thresholds. 33 agents in 3 layers. | `sa_agent`, `risk_radar_agent` |
| **Provenance** | Metadata tracking artifact origin (who, when, from what source). | `created_by: PB_201`, `source_run: run_123` |
| **Intelligence Layer** | Signal-processing agents for market, company, and technology intelligence. | ACI, II, Tech Scout, MNA agents |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | - | Initial PRD |
| 1.1 | 2026-01-23 | - | Added glossary with corrected terminology (Blueprint vs Bundle) |
| 1.2 | 2026-01-23 | - | Terminology Model v2: Archetype → Reference Blueprint → Blueprint Instance hierarchy |
| 1.3 | 2026-02-28 | - | Major update to match current implementation: 33 agents (was 24), three-vault knowledge architecture (was single InfoHub), added User Interface section (Next.js + iOS), added Intelligence Layer section, updated tech stack and dependencies, updated success criteria with current progress |
