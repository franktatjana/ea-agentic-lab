# ADR-005: Integrated Documentation Browser

**Status:** ACCEPTED
**Date:** 2026-02-11
**Category:** Architecture Decision Record

## Context

The project accumulated 96+ markdown documentation files covering architecture, agents, playbooks, operating models, guides, and reference materials. These files live in `docs/` and are readable on GitHub, but practitioners using the web application had to context-switch to a separate tool or repository browser to access documentation. There was no way to search or navigate docs from within the operational cockpit.

The question was whether to add documentation browsing to the existing Next.js application or deploy a separate documentation site (Docusaurus, GitBook, MkDocs).

## Decision

Add a documentation browser directly into the Next.js web application as a `/docs` route, served by a new FastAPI endpoint that reads markdown files from the `docs/` directory at runtime.

**Implementation:**
- Backend: `GET /api/v1/docs/tree` returns the hierarchical directory structure with titles extracted from YAML frontmatter. `GET /api/v1/docs/{path}` returns raw markdown content.
- Frontend: two-panel layout with a collapsible tree navigator (left) and rendered markdown (right). Search filters the tree by title and path. URL query parameter (`?path=...`) enables deep linking.
- Rendering: `react-markdown` with `remark-gfm` (tables, task lists) and `remark-frontmatter` (strips YAML frontmatter). Tailwind Typography plugin (`@tailwindcss/typography`) provides prose styling.

**No build step, no duplication.** The same markdown files in `docs/` are served directly. Edits to documentation appear immediately without regeneration.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Docusaurus / MkDocs static site | Purpose-built for docs, search, versioning | Separate deployment, build step, separate URL, context-switching for users | Breaks workflow continuity with the operational cockpit |
| GitBook | Polished UI, hosted | External service, vendor dependency, sync overhead with git repo | Adds external dependency for internal docs |
| Link to GitHub | Zero effort | Poor reading experience, no search across files, no tree navigation | Does not solve the discoverability problem |
| Embed docs as static Next.js pages (MDX) | Build-time optimization, fast loads | Requires build step per doc change, import overhead for 96+ files | Runtime file reading is simpler and requires no build |

## Consequences

**Positive:**
- Single-source-of-truth: docs/ directory is both the git-browsable and UI-browsable version
- Zero build step: new or edited markdown files appear immediately
- Search and tree navigation make 96+ files discoverable
- Deep linking via URL enables sharing specific doc pages

**Negative:**
- File reads on every request (mitigated by React Query caching on the frontend)
- Markdown links between docs (relative paths) don't resolve as navigation within the browser yet
- No full-text search (current search matches titles and paths only)

## Related Decisions

- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): the application this feature extends
- [ADR-004: FastAPI Backend](ADR_004_fastapi_backend.md): the API this feature adds endpoints to
- [ADR-001: Streamlit Playbook Viewer](ADR_001_streamlit_playbook_viewer.md): similar pattern of rendering structured files in a browser UI

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-11 | ACCEPTED | Documentation browser added to Next.js application |
