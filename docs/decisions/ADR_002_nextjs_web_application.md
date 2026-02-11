# ADR-002: Next.js Web Application for Primary UI

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Architecture Decision Record
**Supersedes:** [ADR-001](ADR_001_streamlit_playbook_viewer.md) (partially, see below)

## Context

The platform grew beyond playbook viewing into a full operational cockpit: realm/node browsing, health score dashboards, risk registers, action trackers, playbook editing, orchestration analysis, and documentation browsing. Streamlit (chosen in ADR-001 for read-only playbook viewing) does not support multi-page applications with shared state, rich client-side interactivity, or custom component layouts at this scale.

The team needs a production-grade web application that serves as the primary interface for practitioners, account executives, and solution architects. The application must support real-time data from a backend API, deep linking to specific realms/nodes, and extensibility for future features like agent monitoring and canvas rendering.

## Decision

Build the primary web application using Next.js (App Router) with React, TypeScript, and Tailwind CSS. The application lives in `application/frontend/` and communicates with a FastAPI backend via REST API.

**Key technology choices:**
- Next.js 16 with App Router for file-based routing and server-side rendering capability
- React 19 for the component model
- TypeScript for type safety across the API boundary
- Tailwind CSS 4 with shadcn/ui for consistent, maintainable UI components
- TanStack React Query for data fetching and caching
- CodeMirror for YAML editing (playbook editor)

**Relationship to ADR-001:** Streamlit remains valid as a lightweight internal tool for playbook validation and schema checking (`tools/viewer/`). The Next.js application replaces the "catalog view" and "detail view" from ADR-001's scope. The Streamlit validator view (ADR-001 phase 2) remains a separate internal tool.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Streamlit (extend ADR-001) | Already chosen, Python-native, fast prototyping | No App Router, limited layout control, poor for multi-page apps, no client-side state management | Cannot scale to full operational cockpit |
| Remix | Full-stack React, good data loading patterns | Smaller ecosystem than Next.js, less familiar to team | Next.js has broader community and component library support |
| SvelteKit | Excellent performance, less boilerplate | Smaller ecosystem, team unfamiliar | Risk of slower development velocity |
| Django + HTMX | Python-native, server-rendered | Limited client-side interactivity, no component ecosystem | Cannot support rich dashboards and real-time updates |

## Consequences

**Positive:**
- Full control over layout, routing, and component architecture
- shadcn/ui provides accessible, well-tested components out of the box
- TypeScript catches API contract mismatches at build time
- Deep linking to specific realms, nodes, playbooks, and docs via URL
- Extensible for future features (canvas rendering, agent monitoring, real-time events)

**Negative:**
- Adds Node.js to the project stack (previously Python-only)
- Frontend build step required (`next build`)
- Separate deployment from the Python backend
- Two language ecosystems to maintain (Python + TypeScript)

**Risks:**
- Feature scope creep in the frontend. Mitigated by keeping the backend as the single source of truth for all data.
- Divergence between Streamlit viewer and Next.js app. Mitigated by limiting Streamlit to validation-only scope.

## Related Decisions

- [ADR-001: Streamlit Playbook Viewer](ADR_001_streamlit_playbook_viewer.md): partially superseded, Streamlit retains validator scope only
- [ADR-003: Multi-UI Architecture Strategy](ADR_003_multi_ui_architecture.md): documents the relationship between all three UI implementations
- [ADR-004: FastAPI Backend](ADR_004_fastapi_backend.md): the API layer this application consumes

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | Initial implementation in first commit, Next.js chosen for full operational cockpit |
| 2026-02-11 | Documented | Retroactive documentation of decision made at project inception |
