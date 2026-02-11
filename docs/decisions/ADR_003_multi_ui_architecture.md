# ADR-003: Multi-UI Architecture Strategy

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Architecture Decision Record

## Context

The platform serves multiple user personas with different needs, contexts, and device preferences. A Solutions Architect working at a desk needs a full-featured web application with search, editing, and deep navigation. An Account Executive checking health scores between meetings needs a quick mobile glance. An internal developer validating playbook schemas needs a lightweight tool, not a production UI.

No single UI technology optimally serves all three scenarios. The question is whether to build one universal UI or purpose-built interfaces for each context.

## Decision

Adopt a three-UI strategy where each interface serves a distinct use case, all backed by a shared FastAPI REST API.

| UI | Technology | Purpose | Audience |
|---|---|---|---|
| Web application | Next.js + React | Primary operational cockpit: dashboards, playbook management, orchestration, documentation browser | SA, AE, CA, leadership |
| Mobile companion | iOS SwiftUI | Read-only monitoring: health scores, risk alerts, action summaries, home screen widgets | AE, leadership (on the go) |
| Playbook validator | Streamlit (planned) | Internal tooling: schema validation, consistency checks, playbook linting | Developers, playbook authors |

The shared backend (`application/src/api/`) is the single integration point. All UIs consume the same API endpoints, ensuring data consistency across platforms.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Single responsive web app | One codebase, simpler deployment | Mobile web lacks native features (widgets, push notifications, offline), Streamlit validation needs don't fit a production UI | Compromises each experience |
| React Native for mobile | Shared JS codebase with web | Still needs separate UI design, native module overhead, no home screen widgets without native code | SwiftUI provides better iOS integration |
| Progressive Web App (PWA) | No app store, works everywhere | No home screen widgets, limited push notification support on iOS, no native feel | iOS widget support is critical for glanceable monitoring |

## Consequences

**Positive:**
- Each UI is optimized for its context and audience
- Shared API ensures consistent data across all interfaces
- Independent deployment: frontend, mobile, and validator can ship at different cadences
- Native iOS features (widgets, push notifications) available without compromise

**Negative:**
- Three codebases to maintain (TypeScript, Swift, Python/Streamlit)
- API changes must be backwards-compatible or coordinated across all clients
- Higher initial development investment

**Risks:**
- API contract drift between clients. Mitigated by TypeScript types on the frontend and Pydantic schemas on the backend defining the shared contract.
- Feature parity expectations. Mitigated by clearly scoping each UI's purpose: the web app is full-featured, mobile is read-only monitoring, Streamlit is internal validation only.

## Related Decisions

- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): primary web UI
- [ADR-004: FastAPI Backend](ADR_004_fastapi_backend.md): shared API layer
- [ADR-001: Streamlit Playbook Viewer](ADR_001_streamlit_playbook_viewer.md): internal validation tool

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | Three-UI strategy established at project inception |
| 2026-02-11 | Documented | Retroactive documentation of architectural decision |
