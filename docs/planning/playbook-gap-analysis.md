# Playbook Gap Analysis - User-Requested vs. Implemented

**Date:** 2026-01-14 (Updated)
**Last Review:** 2026-01-11

---

## Summary

**Requested:** 25 frameworks across 4 agent types
**Implemented:** 6 playbooks (2 match user list, 4 additional value-add)
**Gap:** 23 user-requested frameworks not yet created

**Recent Changes:**

- InfoHub restructured from `{client_id}` to `{realm}/{node}` hierarchy
- Playbook paths updated to use `infohub/{realm}/{node}/` pattern
- Exec Sponsor and Transformation roles clarified as functions, not separate agents

---

## AE / Account Strategy Agent

**Agent Mission:** Where to sell, what to sell, when, and to whom

| Framework | Status | Notes |
|-----------|--------|-------|
| **Three Horizons of Growth** | **IMPLEMENTED** | PB_001 - Complete |
| Ansoff Matrix | **MISSING** | In priority queue (PB_002) |
| BCG Growth-Share Matrix | **MISSING** | In priority queue (PB_003) |
| Porter's Generic Strategies | **MISSING** | Not in queue |
| Value Proposition Canvas | **MISSING** | Not in queue |
| Elements of Value Pyramid | **MISSING** | Not in queue (cataloged as PB_301 Value Pyramid) |
| Power Curve | **MISSING** | Not in queue or catalog |
| Blue Ocean Strategy | **MISSING** | In catalog (PB_005) but not implemented |

**Created:** 1/8
**Gap:** 7 frameworks

---

## SA / Architecture & Decision Agent

**Agent Mission:** Make decisions, document trade-offs, manage risks

| Framework | Status | Notes |
|-----------|--------|-------|
| **SWOT Analysis** | **IMPLEMENTED** | PB_201 - Complete (cross-functional) |
| PESTLE Analysis | **MISSING** | In catalog (PB_202) but not implemented |
| Decision Tree Analysis | **MISSING** | Not in catalog |
| Risk Heat Map | **MISSING** | Similar to PB_211 Risk Matrix (queued) |
| 7S Framework | **MISSING** | In catalog (PB_813 McKinsey 7S) but not implemented |
| Pace-Layered Application Strategy | **MISSING** | Not in catalog |
| Cost-Benefit Analysis | **MISSING** | Covered partially in PB_301 Value Engineering |

**Additional Created (not on user list):**

- PB_101 TOGAF ADR - Architecture Decision Records

**Created:** 1/7 (plus 1 additional)
**Gap:** 6 frameworks

---

## Exec Sponsor / Stakeholder Functions

**Status:** NOT a separate agent - **Function of AE Agent**

Per current 8-agent architecture, executive sponsor activities are performed by the AE Agent as part of stakeholder management responsibilities.

| Framework | Status | Notes |
|-----------|--------|-------|
| Stakeholder Mapping (Power-Interest Grid) | **MISSING** | Assign to AE Agent |
| Influence Model | **MISSING** | Assign to AE Agent |
| RACI Matrix | **MISSING** | Assign to AE Agent |
| McKinsey 5 Frames of Performance | **MISSING** | Assign to AE Agent |
| Results Delivery Framework | **MISSING** | Assign to AE Agent |

**Created:** 0/5
**Gap:** 5 frameworks (to be implemented as AE Agent playbooks)

---

## Transformation / Governance Functions

**Status:** NOT a separate agent - **Function of Delivery Agent**

Per current 8-agent architecture, transformation governance activities are performed by the Delivery Agent.

| Framework | Status | Notes |
|-----------|--------|-------|
| Kotter's 8-Step Change Model | **MISSING** | In catalog (PB_812), assign to Delivery Agent |
| Three Lines of Defense | **MISSING** | Assign to Delivery Agent |
| Operating Model Canvas | **MISSING** | Assign to Delivery Agent |
| OKR Framework | **MISSING** | Assign to Delivery Agent |
| Transformation Office Model | **MISSING** | Assign to Delivery Agent |

**Created:** 0/5
**Gap:** 5 frameworks (to be implemented as Delivery Agent playbooks)

---

## Additional Playbooks Created (Not on User List)

These provide value but weren't explicitly requested:

1. **PB_301 Value Engineering** (AE Agent)
   - Business case development with ROI calculation
   - Includes cost-benefit analysis elements
   - Updated to use `{realm}/{node}` paths

2. **PB_701 Porter's Five Forces** (CI Agent)
   - Competitive dynamics analysis
   - User mentioned "Porter's Generic Strategies" but not Five Forces

3. **PB_101 TOGAF ADR** (SA Agent)
   - Architecture decision records
   - Critical for SA Agent but not on user's SA list

4. **PB_401 Customer Health Score** (CA Agent)
   - Retention risk monitoring
   - Not on user list but valuable for customer success

---

## InfoHub Structure Update

**Previous:** `infohub/{client_id}/`
**Current:** `infohub/{realm}/{node}/`

Example:

```text
infohub/
└── ACME/                              # Realm (company/account)
    ├── realm_profile.yaml             # Account-level data
    └── SECURITY_CONSOLIDATION/        # Node (opportunity/engagement)
        ├── node_profile.yaml          # Engagement-specific data
        ├── meetings/
        ├── frameworks/                # Playbook outputs
        ├── actions/
        ├── decisions/
        ├── risks/
        ├── stakeholders/
        ├── architecture/
        ├── governance/
        └── value/
```

All playbooks updated to reference `{realm}/{node}` in paths.

---

## Gap Summary by Priority

### High Priority (User Explicitly Requested)

**AE Agent (7 missing):**

1. Ansoff Matrix - Growth strategy selection
2. BCG Growth-Share Matrix - Portfolio prioritization
3. Porter's Generic Strategies - Cost vs. differentiation
4. Value Proposition Canvas - Executive value framing
5. Elements of Value Pyramid - C-level stakeholder value
6. Power Curve - Where customer generates profit
7. Blue Ocean Strategy - Move beyond commodity competition

**SA Agent (6 missing):**

1. PESTLE Analysis - Regulatory/environmental context
2. Decision Tree Analysis - Decision log foundation
3. Risk Heat Map - Automated risk register
4. 7S Framework - Why architecture fails (org issues)
5. Pace-Layered Application Strategy - Change velocity
6. Cost-Benefit Analysis - Architecture alternatives in financial terms

**AE Agent - Exec Sponsor Functions (5 missing):**

1. Stakeholder Mapping (Power-Interest Grid)
2. Influence Model
3. RACI Matrix
4. McKinsey 5 Frames of Performance
5. Results Delivery Framework

**Delivery Agent - Transformation Functions (5 missing):**

1. Kotter's 8-Step Change Model
2. Three Lines of Defense
3. Operating Model Canvas
4. OKR Framework
5. Transformation Office Model

---

## Recommended Action Plan

### Phase 1: Complete User-Requested AE/SA Frameworks (Priority)

Create the 13 missing frameworks for AE and SA agents (agents already exist):

**Week 1:**

1. PB_002 Ansoff Matrix
2. PB_003 BCG Growth-Share Matrix
3. PB_202 PESTLE Analysis
4. PB_211 Risk Heat Map

**Week 2:**
5. PB_XXX Porter's Generic Strategies
6. PB_XXX Value Proposition Canvas
7. PB_XXX Elements of Value Pyramid
8. PB_813 McKinsey 7S Framework

**Week 3:**
9. PB_XXX Decision Tree Analysis
10. PB_XXX Pace-Layered Application Strategy
11. PB_XXX Power Curve
12. PB_005 Blue Ocean Strategy
13. PB_XXX Cost-Benefit Analysis (if not covered by PB_301)

### Phase 2: Stakeholder & Transformation Frameworks

**AE Agent - Exec Sponsor Functions:**

- Implement 5 stakeholder-focused frameworks as AE Agent playbooks
- No new agent required

**Delivery Agent - Transformation Functions:**

- Implement 5 transformation-focused frameworks as Delivery Agent playbooks
- No new agent required

### Phase 3: Expand to Full Catalog (60+ frameworks)

Continue with remaining frameworks from `docs/reference/framework-catalog.md`.

---

## Architecture Clarifications

### Agent Roles (8-Agent System)

| Role | Agent | Notes |
|------|-------|-------|
| Account Strategy | AE Agent | Owns commercial strategy |
| Executive Sponsor | AE Agent (function) | NOT separate agent |
| Solution Architecture | SA Agent | Owns technical decisions |
| Competitive Intelligence | CI Agent | Owns market analysis |
| Customer Success | CA Agent | Owns health monitoring |
| Transformation Governance | Delivery Agent (function) | NOT separate agent |
| Domain Expertise | Specialist Agent | Contributes to all |
| Product Alignment | PM Agent | Contributes to roadmap |

### Path Patterns in Playbooks

All playbooks now use:

- Input paths: `infohub/{realm}/{node}/[category]/`
- Output paths: `infohub/{realm}/{node}/[category]/`
- Variables: `{realm}`, `{node}` instead of `{client_id}`

---

## Current Status

**Implemented from User List:** 2/25 (8%)

- Three Horizons of Growth
- SWOT Analysis

**Implemented Additional Value-Add:** 4

- Value Engineering (PB_301)
- Porter's Five Forces (PB_701)
- TOGAF ADR (PB_101)
- Customer Health Score (PB_401)

**Total Playbooks:** 6
**User-Requested Gap:** 23 frameworks

---

**Recommendation:** Proceed with Phase 1 to complete the 13 AE/SA frameworks explicitly requested, then address Exec Sponsor (AE function) and Transformation (Delivery function) playbooks.
