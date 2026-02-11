# DDR-002: Canvas Framework for Strategic Artifacts

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Domain Decision Record
**Specification:** [canvas-framework.md](../architecture/playbooks/canvas-framework.md)

## Context

Strategic engagements produce complex, multi-dimensional assessments (SWOT, risk governance, architecture decisions, problem-solution fit) that need to be both machine-processable (agents read and update them) and human-consumable (practitioners review and present them). Raw YAML is too dense for human review. Free-form markdown loses structure that agents need.

The Business Model Canvas pattern from the startup world demonstrated that constraining complex analysis into a single-page, structured visual format forces clarity and enables rapid communication. The question was whether to adopt a similar pattern for engagement artifacts.

## Decision

Introduce a Canvas framework: structured YAML specifications that define single-page visual artifacts for strategic analysis. Each canvas type has a registry entry, a spec defining its schema, and rendering rules for display.

**Eight canvas types:**

| Canvas | Purpose | Owner |
|---|---|---|
| Context Canvas | Engagement context at a glance | RFP Agent / SA Agent |
| Decision Canvas | Decision with alternatives and consequences | Decision Registrar |
| Architecture Decision Canvas | ADR in visual format | SA Agent |
| Problem-Solution Fit Canvas | Problem validation and solution mapping | SA Agent |
| Architecture Communication Canvas | Solution architecture summary for stakeholders | SA Agent |
| Value & Stakeholders Canvas | Value proposition mapped to stakeholder concerns | VE Agent |
| Execution Map Canvas | Mutual action plan with workstreams and milestones | CA Agent / SA Agent |
| Risk & Governance Canvas | Risk register with governance overlay | Risk Radar |

Each canvas is defined by a YAML spec in `domain/playbooks/canvas/specs/` and registered in `domain/playbooks/canvas/registry.yaml`. Canvases have lifecycle states (draft, active, archived) and version tracking.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Free-form markdown documents | Flexible, no schema constraints | Agents cannot reliably parse structure, inconsistent across engagements | Loses machine-readability |
| Slide decks (PowerPoint/Google Slides) | Familiar to practitioners | Not version-controlled, not machine-readable, manual creation | Cannot be generated or updated by agents |
| Structured YAML without visual rendering | Machine-readable, simple | Not human-consumable without tooling | Canvas adds the visual constraint that forces clarity |
| JSON Schema documents | Strict validation, widely supported | Verbose, not human-editable, poor for narrative content | YAML is more natural for mixed structured/narrative content |

## Consequences

**Positive:**
- Single-page constraint forces authors (human and agent) to prioritize what matters
- YAML specs are version-controlled and diffable
- Agents can generate, update, and validate canvases programmatically
- Registry provides discoverability and lifecycle management
- Consistent format across all engagements

**Negative:**
- Eight canvas types is a significant upfront design investment
- Schema evolution requires updating specs, registry, and any rendering code
- Practitioners unfamiliar with the canvas metaphor need onboarding

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): canvases are stored in the appropriate vault based on audience
- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): future canvas rendering in the web UI

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | Canvas framework established with 8 types at project inception |
| 2026-02-11 | Documented | Retroactive documentation of domain decision |
