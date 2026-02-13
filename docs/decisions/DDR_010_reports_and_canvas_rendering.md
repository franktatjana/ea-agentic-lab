# DDR-010: Reports System with Canvas Rendering

**Status:** ACCEPTED
**Date:** 2026-02-13
**Category:** Domain Decision Record
**Extends:** [DDR-002: Canvas Framework for Strategic Artifacts](DDR_002_canvas_framework.md)

## Context

DDR-002 established canvases as the domain concept: structured YAML specs that define single-page visual artifacts for strategic analysis. The specs existed in `domain/playbooks/canvas/specs/` with a registry, but no rendering pipeline turned them into visual output. Users could not see canvases in the web application.

Separately, the platform needed portfolio-level visibility: aggregated metrics across all realms and nodes (health scores, pipeline value, risk counts, overdue actions, attention items). This is a reporting concern, not a canvas concern, but both share the same pattern: read structured YAML data, assemble it into a purpose-built view, render it in the frontend.

The question was whether canvases and dashboards should be treated as separate systems, or unified under a single "reports" concept.

## Decision

Canvases are a type of report. Reports is the umbrella concept that covers any read-only, assembled view of vault data rendered for human consumption. Canvases are the node-level, single-page strategic artifact type. Dashboards are the portfolio-level aggregation type.

### Implementation Structure

**Backend: two services, one pattern**

Both services follow the same data flow: read YAML from vault, assemble structured JSON, serve via API.

| Service | Scope | Endpoint | Data Source |
|---|---|---|---|
| `canvas_service.py` | Node-level canvas rendering | `GET /nodes/{realm}/{node}/canvas/{canvas_id}` | Canvas specs + vault YAML |
| `dashboard_service.py` | Portfolio-level aggregation | `GET /dashboard/summary` | All realm/node profiles + governance data |

The canvas service reads canvas specs from `domain/playbooks/canvas/specs/`, resolves the node's vault path, and dispatches to a canvas-type-specific assembler. Five assemblers exist: context, decision, risk governance, value/stakeholders, and architecture decision. A generic fallback handles unrecognized types.

The dashboard service aggregates across all realms and nodes, computing portfolio metrics (total ARR, weighted pipeline, health trends) and surfacing attention items (declining health, critical risks, overdue actions, blocking decisions).

**Frontend: renderer components**

| Component | Purpose |
|---|---|
| `canvas-renderer.tsx` | Format-aware section renderer (narrative, structured, timeline, table, cards) |
| `canvas-viewer.tsx` | Dialog wrapper that fetches canvas data and renders it |
| `dashboard/page.tsx` | Portfolio dashboard with summary cards, node table, attention items |

Canvas rendering uses a format-dispatch pattern: each canvas section declares its format (narrative, structured, two_column, timeline, table, decision_cards, etc.) and the renderer selects the matching visual component.

### Design Principles

1. **Canvases render from specs, not hardcoded layouts.** Adding a new canvas type means adding a YAML spec and optionally an assembler, not new frontend pages.
2. **Reports are read-only views.** They assemble and display vault data but never modify it. Write operations go through dedicated service endpoints.
3. **Canvas is part of reports, not a separate system.** Both share the pattern of YAML-to-structured-JSON-to-visual-component. The distinction is scope (node vs. portfolio), not architecture.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Separate canvas and dashboard systems | Independent development, clear boundaries | Duplicated patterns, no shared mental model for "reports" | Creates artificial separation for the same data flow pattern |
| Single monolithic report service | One service, one router | Mixes node-level and portfolio-level concerns, harder to test | Violates SRP; service would grow too large |
| Client-side rendering from raw YAML | No backend assembly needed | Frontend becomes tightly coupled to YAML structure, no data transformation layer | Breaks the structured-data-first principle from DDR-002 |
| Embedded analytics tool (Metabase, Grafana) | Rich visualization out of the box | External dependency, YAML-based data does not fit SQL/time-series models | Over-engineering for structured YAML data |

## Consequences

**Positive:**
- Canvases defined in DDR-002 are now renderable in the web application
- Portfolio dashboard provides at-a-glance governance visibility across all accounts
- Adding new canvas types requires only a YAML spec and optional assembler, no frontend changes
- Format-dispatch renderer is extensible: new section formats (charts, maps) can be added without touching existing code

**Negative:**
- Canvas assemblers contain domain-specific logic for each canvas type (5 assemblers), increasing maintenance surface
- Dashboard aggregation reads all node profiles on every request (acceptable for current scale, may need caching later)

**Risks:**
- Canvas spec schema evolution must stay synchronized between YAML specs, backend assemblers, and frontend renderers. Mitigated by the generic fallback assembler that handles unknown specs gracefully.

## Open Questions: Data Ownership Gaps

The reports system reads vault YAML written by agents and playbooks. Three data ownership gaps were identified during implementation that affect long-term data freshness.

### 1. Commercial fields in node_profile.yaml have no agent owner

`opportunity_arr`, `probability`, `stage`, `next_milestone`, `next_milestone_date` live in `node_profile.yaml` and are surfaced on the portfolio dashboard. No agent or operational playbook writes to these fields. The AE agent owns pipeline intelligence conceptually, but its configured write targets are `risk_register.yaml` and `action_tracker.yaml`, not `node_profile.yaml`.

**Impact:** Dashboard pipeline metrics ($1.1M total, $609K weighted) rely on manually maintained data. As the system scales, these fields will go stale unless an agent or playbook takes ownership.

**Proposed resolution:** Either extend OP_MTG_001 (meeting notes) to detect commercial signal changes and update node_profile, or create a new operational playbook `OP_COM_001` owned by the AE agent that syncs CRM signals to node_profile.yaml.

### 2. Canvas re-rendering has no trigger loop

Canvas specs define `triggers.on_update` conditions (e.g., "New pain points discovered", "Competitive analysis updated"), but no playbook or agent evaluates these triggers. Canvases render from current vault data on demand (good), but there is no mechanism to notify users that a canvas should be reviewed after underlying data changes.

**Impact:** Low for now, canvases always render fresh data when opened. Becomes relevant when canvases are exported as PDF/slides or cached for distribution, since stale exports would not reflect recent vault changes.

**Proposed resolution:** The admin playbook `PB_ADM_002` (Canvas Gap Analysis) already defines a gap-scan pattern. Extend it to compare canvas section data timestamps against last-rendered timestamps and emit a `SIG_CANVAS_STALE` signal when drift exceeds a threshold.

### 3. Reporter agent and dashboard service duplicate aggregation logic

The reporter_agent produces weekly markdown digests reading the same sources the dashboard service reads (action_tracker, decision_log, risk_register, health_score, value_tracker). Both compute similar aggregates (top risks, overdue actions, health trends) independently.

**Impact:** No functional issue today since both are read-only. Risk is logic drift: if the health trend calculation changes in one place but not the other, the weekly digest and dashboard could disagree.

**Proposed resolution:** When the reporter agent gets a runtime implementation, have it call the dashboard summary endpoint rather than re-reading vault files directly. This makes the dashboard service the single source of truth for portfolio-level aggregation, and the reporter agent becomes a consumer that formats the data for Slack/email delivery.

## Related Decisions

- [DDR-002: Canvas Framework](DDR_002_canvas_framework.md): Defined the canvas concept and 8 canvas types. This decision implements the rendering pipeline.
- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Canvas and dashboard data is sourced from vault YAML files
- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): Frontend rendering target
- [ADR-004: FastAPI Backend](ADR_004_fastapi_backend.md): Backend services that assemble canvas and dashboard data

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-13 | ACCEPTED | Reports system implemented with canvas rendering and portfolio dashboard |
