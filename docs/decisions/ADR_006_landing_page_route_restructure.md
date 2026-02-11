# ADR-006: Landing Page and Route Restructuring

**Status:** ACCEPTED
**Date:** 2026-02-10
**Category:** Architecture Decision Record

## Context

The web application opened directly onto a data dashboard at `/` showing realm cards and metrics. New users or stakeholders visiting the application had no context about what EA Agentic Lab is, what problems it solves, or how the conceptual framework works. The executive summary, README, and PRD contained this information but only as markdown files in the repository, not visible within the application itself.

The question was whether to add an explanatory landing page and where to place it in the routing hierarchy.

## Decision

Replace the home route (`/`) with a static landing page that explains the EA Agentic Lab conceptual framework. Move the existing data dashboard to `/dashboard` as a dedicated route with its own sidebar navigation entry.

**Landing page content** is derived from `EXECUTIVE_SUMMARY.md` and structured into visual sections: hero, problem statement, three pillars, six-step lifecycle, personas, key metrics, differentiators, and navigation CTAs to the dashboard and documentation.

**Route changes:**

| Route | Before | After |
|---|---|---|
| `/` | Data dashboard (realm cards) | Landing page (framework overview) |
| `/dashboard` | Did not exist | Data dashboard (realm cards, tiles/list toggle) |

**Sidebar navigation** updated from 4 items to 5: Home, Dashboard, Playbooks, Orchestration, Documentation.

**Landing page is a server component** (no `"use client"`, no API calls). All content is static, which means it renders instantly and can be statically generated.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Add `/about` route, keep dashboard at `/` | No breaking change to existing bookmarks | Users still land on data without context, "about" pages are rarely visited | Doesn't solve the onboarding problem |
| Modal/overlay on first visit | Keeps dashboard as home, shows intro once | Dismissed and forgotten, annoying on repeat visits, no way to revisit | Poor UX for stakeholder demos |
| Fetch content from docs API | Single source of truth with markdown docs | Adds API dependency to the home page, harder to control visual layout | Static content renders faster and has better visual control |

## Consequences

**Positive:**
- First-time visitors understand what the system is before seeing data
- Landing page serves as a stakeholder demo entry point
- Dashboard gets a dedicated route and a tiles/list view toggle
- Landing page is a server component with zero client-side JavaScript

**Negative:**
- Existing bookmarks to `/` now show the landing page instead of the dashboard
- One extra click to reach the dashboard from the landing page

## Related Decisions

- [ADR-002: Next.js Web Application](ADR_002_nextjs_web_application.md): the application this restructures
- [ADR-005: Documentation Browser](ADR_005_documentation_browser.md): documentation CTA on the landing page links here

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-10 | ACCEPTED | Landing page added, dashboard moved to /dashboard |
