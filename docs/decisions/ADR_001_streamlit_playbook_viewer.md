# ADR-001: Streamlit Viewer for Playbook Visualization and Validation

**Status:** SUPERSEDED
**Date:** 2026-02-09
**Category:** Architecture Decision Record
**Superseded by:** [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md)

## Context

The project has grown to 80+ YAML playbooks and markdown files that define the agentic framework. YAML is the right format for machine consumption (agents parse and execute playbooks), but it fails as a human review format at this scale. The project owner and colleagues need to read, validate, and eventually test playbook content without learning YAML syntax or scrolling through hundreds of lines per file.

The core tension: structured YAML is the single source of truth for machines, but humans need a different lens to process the same information. Any solution must avoid creating a second source of truth that drifts from the YAML.

## Decision

Introduce a Streamlit-based viewer application that reads YAML playbooks at runtime and renders them in a human-friendly format. The viewer lives in `tools/viewer/` and is a thin, read-only layer over the existing YAML files.

**Three views, phased:**

1. **Catalog view** (phase 1): all playbooks as cards with vault routing, triggers, agent roles
2. **Detail view** (phase 1): single playbook rendered as structured sections (not raw YAML)
3. **Validator view** (phase 2): automated consistency checks (missing fields, orphaned cross-references, vault routing gaps)
4. **Scenario walkthrough** (phase 3, future): test decision logic with sample inputs

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Static site generator (MkDocs, Docusaurus) | Browsable, deployable, familiar | Requires build step, YAML-to-MD conversion creates drift risk, heavy for internal use | Build step adds friction, conversion layer creates second source of truth |
| Jupyter notebooks | Interactive, good for exploration | Per-file exploration, no catalog view, not shareable as a browsable app | Doesn't solve the "browse 80+ files" problem |
| Custom React/Next.js app | Rich UI, deployable | Heavy framework for internal tooling, build pipeline, overkill | Over-engineered for the need |
| Render YAML to markdown (CI pipeline) | No runtime dependency | Generated markdown is a second source of truth, drifts, review friction remains | Violates single-source-of-truth constraint |
| Read raw YAML (status quo) | No new tooling | Doesn't scale beyond 10-20 files, colleagues won't do it | The problem we're solving |

## Consequences

**Positive:**
- YAML remains single source of truth, no duplication
- Zero build step: `streamlit run app.py` reads live files
- Colleagues can browse and validate without YAML literacy
- Validator view catches inconsistencies automatically
- Streamlit can be shared via Streamlit Cloud or local network

**Negative:**
- Adds a Python dependency to the project (Streamlit, PyYAML)
- UI maintenance: if YAML schema changes significantly, viewer rendering may need updates
- Not a production application, just internal tooling

**Risks mitigated:**
- Schema-agnostic rendering where possible (render any YAML structure as nested sections)
- Only add specific rendering for known patterns (vault_routing, decision_logic, trigger_conditions)

## Implementation

```
ea-agentic-lab/
├── domain/playbooks/    ← source of truth (unchanged)
├── tools/
│   └── viewer/
│       ├── app.py
│       └── requirements.txt
```

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): viewer must show vault routing per playbook
- Playbook YAML schema (implicit convention, no formal spec): viewer renders sections common across playbooks (metadata, trigger_conditions, required_inputs, key_questions, decision_logic, expected_outputs, stop_conditions, validation_checks)

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-09 | PROPOSED | YAML playbook count reached 80+, human review no longer feasible in raw format |
| 2026-02-09 | ACCEPTED | Streamlit chosen over static site generators and React alternatives |
| 2026-02-11 | SUPERSEDED | Replaced by ADR-002: Next.js Web Application as the primary UI |
