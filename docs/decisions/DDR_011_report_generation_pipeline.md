# DDR-011: Report Generation Pipeline

**Status:** PROPOSED
**Date:** 2026-02-13
**Category:** Domain Decision Record
**Extends:** [DDR-010: Reports System with Canvas Rendering](DDR_010_reports_and_canvas_rendering.md)

## Context

DDR-010 established "reports" as the umbrella concept for read-only assembled views of vault data. Two report types are implemented: canvases (node-level strategic artifacts rendered in the browser) and the portfolio dashboard (aggregated metrics). Both are interactive, on-demand views that live in the web application.

The system has no way to generate distributable report artifacts: no PDF export, no markdown digests, no scheduled summaries delivered to Slack or email. The Reporter Agent is configured with personality specs and task prompts but has no runtime. Meanwhile, the dashboard service and canvas service already assemble the structured data that reports would consume.

Three report generation needs have surfaced:

1. **Canvas export**: stakeholders need to share canvas views outside the web app (PDF, slide deck, or standalone HTML)
2. **Periodic digests**: weekly or per-milestone summaries of portfolio health, risk changes, action progress, and decision status
3. **Node-level summaries**: on-demand briefing documents for a single engagement (combining health, risks, decisions, stakeholder stance, and canvas highlights into one artifact)

## Decision

Report generation is a separate pipeline that consumes existing services, not a replacement for them. Generators read from the dashboard and canvas APIs, apply templates, and produce markdown or HTML artifacts. The Reporter Agent, when given a runtime, becomes one consumer of this pipeline.

### Architecture

```
Dashboard Service ──┐
                    ├──> Report Generator ──> Markdown / HTML artifact
Canvas Service   ───┘         │
                              ├──> File output (vault or export dir)
                              └──> Delivery (future: Slack, email)
```

### Report Types

| Type | Scope | Trigger | Template | Consumer |
|------|-------|---------|----------|----------|
| Canvas export | Single canvas, single node | On demand (user clicks export) | Per canvas type (mirrors canvas spec layout) | Stakeholders, external sharing |
| Weekly digest | Portfolio-wide | Scheduled (weekly) or manual | Fixed: health summary, risk delta, action progress, decisions made | Leadership, account team |
| Node briefing | Single node, all dimensions | On demand or stage transition | Fixed: engagement context, health, top risks, open decisions, stakeholder map | Meeting prep, handoff |

### Design Principles

1. **Generators consume APIs, not vault files directly.** The dashboard and canvas services are the single source of truth for aggregated data. Report generators call these services rather than re-reading YAML from disk. This prevents the logic drift identified in DDR-010 Open Question 3.

2. **Templates are markdown with variable interpolation.** Report templates live in `domain/reports/templates/` as markdown files with `{{variable}}` placeholders. No complex templating engine. For HTML output, markdown is converted post-generation.

3. **Reports are artifacts, not views.** Unlike the dashboard and canvas viewer (interactive, always-current), generated reports are point-in-time snapshots. Each report includes a generation timestamp and data version.

4. **Canvas export reuses canvas assemblers.** The same `canvas_service.get_canvas_data()` output feeds both the frontend renderer and the export generator. The export generator applies a print-friendly template instead of React components.

### Implementation Phases

**Phase 1: Canvas export (markdown)**
- Backend endpoint: `GET /nodes/{realm}/{node}/canvas/{canvas_id}/export?format=md`
- Reads assembled canvas JSON from existing canvas service
- Applies per-canvas-type markdown template
- Returns markdown string (frontend offers as download)

**Phase 2: Node briefing**
- Backend endpoint: `GET /nodes/{realm}/{node}/briefing`
- Calls dashboard service for node-level data, canvas service for active canvases
- Applies node briefing template
- Returns markdown

**Phase 3: Weekly digest**
- Backend endpoint: `GET /reports/digest?period=weekly`
- Calls dashboard summary endpoint
- Computes deltas against previous digest (requires storing last digest metadata)
- Applies digest template
- Returns markdown
- Future: Reporter Agent runtime calls this endpoint and delivers to Slack/email

### File Structure

```
domain/reports/
  templates/
    canvas_export/
      context_canvas.md
      decision_canvas.md
      ...
    node_briefing.md
    weekly_digest.md
application/src/api/
  services/
    report_service.py          # Template loading, variable interpolation, output generation
  routers/
    reports.py                 # Export and generation endpoints
```

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Frontend-only PDF (browser print) | No backend changes, works today | Poor formatting control, no template system, no scheduled generation | Acceptable as interim for canvas export, but not sufficient for digests or briefings |
| Dedicated reporting tool (Jasper, BIRT) | Rich formatting, scheduling built in | Heavy dependency, YAML data does not fit report engine models | Over-engineering for structured YAML data |
| LLM-generated reports | Natural language summaries, adaptive | Adds LLM dependency for read-only views, hallucination risk on numbers, cost per generation | Better suited for the Reporter Agent's future narrative layer, not the data pipeline itself |
| Reporter Agent generates everything | Single owner for all reports | Agent runtime does not exist yet, blocks all report generation on agent infrastructure | Agent should consume the report pipeline, not be the pipeline |

## Consequences

**Positive:**
- Canvas stakeholders can share artifacts outside the web app
- Leadership gets periodic visibility without logging into the platform
- Node briefings standardize meeting prep and handoff documentation
- Reporter Agent gets a clear integration point when runtime is built

**Negative:**
- New service and templates to maintain
- Template-per-canvas-type creates N templates to keep in sync with canvas specs

**Risks:**
- Template drift: if canvas specs add new sections, export templates may not include them. Mitigated by having the export generator log warnings for unmapped sections.

## Relationship to Reporter Agent

The Reporter Agent (configured in `domain/agents/governance/`) is designed to produce weekly narrative digests with contextual analysis. This DDR separates the concern:

- **Report generation pipeline** (this DDR): structured data assembly + template rendering. Deterministic, no LLM required.
- **Reporter Agent**: narrative layer on top. Calls the report pipeline for data, adds LLM-generated analysis, insight highlights, and natural language summaries. Requires agent runtime.

The pipeline works without the agent. The agent enhances the pipeline output when available.

## Related Decisions

- [DDR-010: Reports System with Canvas Rendering](DDR_010_reports_and_canvas_rendering.md): Established reports umbrella, canvas assemblers, and dashboard service
- [DDR-002: Canvas Framework](DDR_002_canvas_framework.md): Defined canvas specs that export templates must mirror
- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Vault data that feeds all reports

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-13 | PROPOSED | Report generation pipeline designed, pending implementation |
