# ADR-004: FastAPI Backend Architecture

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Architecture Decision Record

## Context

The platform needs a backend API that serves data from the vault directory (YAML files, markdown documents, realm/node profiles) to multiple frontend clients (Next.js web app, iOS companion, future Streamlit validator). The API must read structured YAML data, transform it into JSON responses, and support filtering, search, and validation without a traditional database. All state lives in the file system (vault/ and domain/ directories).

The backend must be Python-native because the domain logic (playbook parsing, YAML schema validation, tech radar analysis) is written in Python. Adding a non-Python API layer would duplicate this logic.

## Decision

Use FastAPI as the REST API framework, deployed as a standalone service at `application/src/api/`. The API follows a modular router pattern with one router per domain concern.

**Architecture:**
- FastAPI with Pydantic for request/response validation
- Modular routers: nodes, health, risks, actions, decisions, profile, widgets, tech_radar, playbooks, docs
- File-based data access: services read directly from vault/ and domain/ directories
- API versioning via URL prefix (`/api/v1`)
- CORS middleware for cross-origin requests from the Next.js frontend
- Next.js dev server proxies `/api/*` to FastAPI via rewrites

**No database.** The vault directory structure IS the data store. This is intentional: YAML files are the single source of truth, and the API is a read/transform layer over them.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Django REST Framework | Mature, batteries-included, admin panel | Heavier for file-based data, ORM assumes database, slower startup | No database to leverage ORM against |
| Flask + marshmallow | Lightweight, familiar | Less type safety, manual OpenAPI spec, no async | FastAPI provides automatic OpenAPI, async support, and Pydantic integration |
| Express.js (Node) | Same language as frontend | Domain logic is Python, would duplicate playbook parsing | Language mismatch with domain layer |
| GraphQL (Strawberry/Ariadne) | Flexible queries, client-driven fetching | Over-engineered for file-based reads, adds query complexity | REST is simpler for the well-defined resource model |

## Consequences

**Positive:**
- Automatic OpenAPI documentation at `/docs` (Swagger UI) and `/redoc`
- Pydantic models validate responses at runtime, catching schema drift
- Async support for concurrent requests
- Same Python ecosystem as the agent and playbook logic
- Zero database overhead, zero migration complexity

**Negative:**
- File reads on every request (no caching layer yet)
- No built-in user authentication (dev-mode secret key only)
- Single-process deployment without workers handles limited concurrent load

**Risks:**
- Performance under load with file-based reads. Mitigated by Python's `lru_cache` on service factories and the fact that this is an internal tool, not a public API.
- Schema evolution: if YAML structure changes, service parsers break silently. Mitigated by Pydantic validation and future Streamlit validator checks.

## Related Decisions

- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): primary consumer of this API
- [ADR-003: Multi-UI Architecture Strategy](ADR_003_multi_ui_architecture.md): API serves all three UIs
- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): API reads from the three-vault directory structure

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | FastAPI chosen at project inception for Python-native API layer |
| 2026-02-11 | Documented | Retroactive documentation of architectural decision |
