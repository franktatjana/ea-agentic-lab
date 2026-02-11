# ADR-007: Interactive Framework Map (Deferred)

**Status:** DEFERRED
**Date:** 2026-02-11
**Category:** Architecture Decision Record

## Context

The landing page needed a visual overview of how the EA Agentic Lab framework fits together: three pillars, concept nodes, and the six-step lifecycle. An interactive ReactFlow-based map was built with mind-map expand/collapse behavior (click to reveal children, click again to collapse) combined with navigation (ExternalLink icon to visit detail pages).

The implementation went through several iterations:

1. Static map showing all nodes at once, navigation on click
2. Click events not reaching custom nodes due to ReactFlow's `elementsSelectable={false}` intercepting DOM events
3. `onNodeClick` callback on ReactFlow (works reliably)
4. Mind-map expand/collapse with `data-nav` attribute detection to split expand vs. navigate clicks

## Decision

**Remove the Framework Map from the landing page.** The map duplicated navigation already available through the sidebar and page links without adding enough value to justify the interaction complexity. Each iteration surfaced new event-handling constraints in ReactFlow that made the UX brittle.

**Preserve the component code** in `src/components/framework-map.tsx` and `src/components/framework-map-wrapper.tsx` for potential future use.

## Lessons Learned

- ReactFlow's event system intercepts DOM events before they reach custom node internals. Use `onNodeClick` on the `<ReactFlow>` component, not `onClick` on elements inside custom nodes
- To distinguish click targets within a node, use `data-*` attributes and `event.target.closest("[data-*]")` in the `onNodeClick` handler
- ReactFlow's `hidden` property on nodes/edges is the cleanest way to implement expand/collapse (no need to filter arrays)
- `useReactFlow().fitView({ duration: 300 })` provides smooth viewport animation after visibility changes, but must be called from a component rendered inside `<ReactFlow>`

## Revisit When

- The application has enough distinct routes that sidebar navigation becomes insufficient
- A dedicated `/framework` or `/overview` page is needed for onboarding or presentations
- A simpler visualization library (e.g. plain SVG or CSS-based tree) could replace ReactFlow for this use case
