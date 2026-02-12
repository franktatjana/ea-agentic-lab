# Product Requirements Document (PRD)

*All examples, companies, scenarios, and data in this project are hypothetical. Names, characters, and organizations are fictional. Any resemblance to actual persons, companies, or events is purely coincidental.*

**Product:** EA Agentic Lab
**Version:** 1.2
**Date:** 2026-01-23
**Status:** Living Document

---

## 1. Executive Summary

EA Agentic Lab is a multi-agent governance platform that enforces structured account management for complex enterprise engagements. It combines AI-assisted agents with playbook-driven execution to ensure consistent, auditable governance.

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
| **Knowledge Curator** | Content governance | Artifact quality, semantic integrity, gap detection |

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

**Capability:** 24 specialized agents operating in coordinated layers.

| Feature | Description | Priority |
|---------|-------------|----------|
| Agent Registry | Centralized agent definitions with capabilities, thresholds, boundaries | Critical |
| Signal Routing | Event-driven communication between agents | Critical |
| Handover Protocol | Structured handoff with context preservation | Critical |
| Escalation Hierarchy | Automated escalation based on authority levels | High |
| Agent Monitoring | Health, activity, and performance tracking | Medium |

### 4.2 Playbook Engine

**Capability:** Execute strategic frameworks and operational procedures.

| Feature | Description | Priority |
|---------|-------------|----------|
| Playbook Loader | Schema validation, YAML parsing | Critical |
| Decision Logic Language (DLL) | Machine-executable conditions | Critical |
| Threshold Manager | Configurable business parameters | Critical |
| Evidence Validator | Citation requirement enforcement | High |
| Playbook Executor | End-to-end orchestration | Critical |
| Run Tracing | Execution history and audit trail | High |

### 4.3 InfoHub (Knowledge Repository)

**Capability:** Structured storage for all engagement artifacts.

| Feature | Description | Priority |
|---------|-------------|----------|
| Realm/Node Hierarchy | Company → Initiative structure | Critical |
| Artifact Storage | Decisions, risks, actions, meetings, architecture | Critical |
| Versioning | Artifact history and change tracking | High |
| Promotion Workflow | Draft → Review → Published lifecycle | High |
| Cross-Node Queries | Realm-level aggregation | Medium |

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
| Signal Catalog | Producer/consumer definitions | Critical |
| Agent Catalog | Centralized agent registry | High |
| Operating Mode Rules | Mode → Playbook applicability matrix | High |

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
- Mobile offline mode
- Multi-language support

---

## 7. Dependencies

| Dependency | Description | Risk |
|------------|-------------|------|
| LLM Provider | Claude/GPT for agent reasoning | High - core functionality |
| YAML Parser | ruamel.yaml for artifact I/O | Low - stable library |
| Schema Validation | jsonschema for validation | Low - stable library |
| FastAPI | Backend API framework | Low - stable framework |

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

- [ ] 5+ strategic playbooks production-ready
- [ ] 3+ governance agents operational
- [ ] 1 realm with 3+ nodes fully populated
- [ ] Canvas framework rendering all 8 types
- [ ] Gap analysis detecting missing artifacts
- [ ] Mobile companion app for read access (planned)
- [ ] 90%+ test pass rate

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

### Governance

| Term | Definition | Example |
|------|------------|---------|
| **Checklist** | Machine-readable validation rules with assertions, severity, auto-fix. | `CHK_PRE_001`, `CHK_NODE_003` |
| **Gap Scan** | Compliance check comparing Blueprint Instance against Reference Blueprint. | PB_971 output |
| **Signal** | Event emitted by agents to trigger downstream actions. | `SIG_ART_001` (artifact created) |
| **Agent** | AI-assisted actor with defined capabilities, boundaries, thresholds. | `sa_agent`, `risk_radar_agent` |
| **Provenance** | Metadata tracking artifact origin (who, when, from what source). | `created_by: PB_201`, `source_run: run_123` |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-23 | - | Initial PRD |
| 1.1 | 2026-01-23 | - | Added glossary with corrected terminology (Blueprint vs Bundle) |
| 1.2 | 2026-01-23 | - | Terminology Model v2: Archetype → Reference Blueprint → Blueprint Instance hierarchy |
