---
title: "Decisions"
order: 5
---

# Decision Records

This directory captures significant decisions with their context, alternatives considered, and consequences. Decision records serve two purposes: they explain to future readers why something was done a certain way, and they prevent revisiting the same decision without new information.

Not every choice needs a decision record. The threshold is: would a new team member ask "why did we do it this way?" If yes, document it. If the answer is obvious from the code or spec itself, skip the record.

## Two Types of Decisions

The project separates decisions into two categories because they have different scopes, audiences, and change frequencies.

### Domain Decision Records (DDR)

Domain decision records define the conceptual model: how the business domain works, what entities exist, how knowledge flows, what boundaries separate concerns. These decisions are independent of technology. If you replaced every tool in the stack, domain decisions would still hold.

**Examples:** three-vault knowledge architecture, blueprint hierarchy and realm classification, agent role boundaries and responsibilities, engagement lifecycle stages.

**Prefix:** `DDR_NNN_short_name.md`

**When to create:** When defining or changing how the business model is structured. These decisions typically have a companion specification document in `docs/architecture/system/` that describes the "what" in detail, while the DDR captures the "why" and "what else was considered."

### Architecture Decision Records (ADR)

Architecture decision records cover technical implementation choices: what tools, formats, frameworks, and patterns are used to build the system. These decisions could change if better tooling emerges, without affecting the domain model.

**Examples:** Streamlit for playbook viewer, YAML for playbook format, file structure conventions, CI/CD pipeline choices.

**Prefix:** `ADR_NNN_short_name.md`

**When to create:** When choosing a technology, tool, format, or implementation pattern where alternatives exist and the choice has lasting consequences.

### What Does NOT Need a Decision Record

Feature additions and capability expansions are tracked in their own artifacts. Creating a new playbook, adding a new agent, or defining a new canvas does not need a separate DDR or ADR. The playbook YAML, agent catalog entry, or canvas spec IS the artifact. Wrapping it in a decision record would be redundant.

| Artifact type | Tracked in | Decision record needed? |
|---|---|---|
| New playbook | Playbook YAML file + playbook catalog | No |
| New agent | Agent catalog | No |
| New canvas | Canvas spec YAML | No |
| New vault or knowledge boundary | DDR + specification in `docs/architecture/system/` | Yes (DDR) |
| New tool or framework | ADR | Yes (ADR) |
| Schema or format change | ADR | Yes (ADR) |

## Structure of a Decision Record

Every decision record follows the same structure, regardless of type. This format is adapted from Michael Nygard's ADR template and extended with an alternatives comparison table.

```markdown
# {PREFIX}-{NNN}: {Decision Title}

**Status:** PROPOSED | ACCEPTED | SUPERSEDED | DEPRECATED
**Date:** YYYY-MM-DD
**Category:** Domain Decision Record | Architecture Decision Record
**Specification:** {link to detailed spec if one exists}
**Supersedes:** {link to previous decision if applicable}

## Context
What situation or problem triggered this decision? What forces are at play?

## Decision
What was decided? State it clearly in 1-3 paragraphs.

## Alternatives Considered
| Alternative | Pros | Cons | Reason rejected |

## Consequences
Positive, negative, and risks. Be honest about trade-offs.

## Related Decisions
Links to other DDRs or ADRs that interact with this one.

## Status History
| Date | Status | Note |
|---|---|---|
| YYYY-MM-DD | PROPOSED | {what triggered this decision} |
| YYYY-MM-DD | ACCEPTED | {who confirmed, any conditions} |
```

### Status Definitions

| Status | Meaning |
|---|---|
| PROPOSED | Under discussion, not yet agreed |
| ACCEPTED | Decision made and agreed upon |
| SUPERSEDED | Replaced by a newer decision (link to successor) |
| DEPRECATED | No longer relevant, context changed |

Git history captures file-level changes. The Status History section captures *why* the status changed, which git diffs don't convey. Keep entries brief.

## Current Decisions

### Domain Decision Records

| ID | Title | Status |
|---|---|---|
| [DDR-001](DDR_001_three_vault_knowledge_architecture.md) | Three-Vault Knowledge Architecture | ACCEPTED |
| [DDR-002](DDR_002_canvas_framework.md) | Canvas Framework for Strategic Artifacts | ACCEPTED |
| [DDR-003](DDR_003_domain_specialist_agents.md) | Domain Specialist Agent Pattern | ACCEPTED |
| [DDR-004](DDR_004_tech_signal_intelligence.md) | Technology Signal Intelligence System | ACCEPTED |
| [DDR-005](DDR_005_signal_based_action_completion.md) | Signal-Based Action Completion | ACCEPTED |
| [DDR-006](DDR_006_infohub_shared_screen_test.md) | InfoHub Shared Screen Test | ACCEPTED |
| [DDR-007](DDR_007_blueprint_instance_engagement_plan.md) | Blueprint Instance as Engagement Plan | ACCEPTED |
| [DDR-008](DDR_008_knowledge_vault_learning_system.md) | Knowledge Vault Learning System | ACCEPTED |
| [DDR-009](DDR_009_stakeholder_stance_classification.md) | Stakeholder Stance Classification | ACCEPTED |
| [DDR-010](DDR_010_reports_and_canvas_rendering.md) | Reports System with Canvas Rendering | ACCEPTED |

### Architecture Decision Records

| ID | Title | Status |
|---|---|---|
| [ADR-001](ADR_001_streamlit_playbook_viewer.md) | Streamlit Playbook Viewer | SUPERSEDED |
| [ADR-002](ADR_002_nextjs_web_application.md) | Next.js Web Application | ACCEPTED |
| [ADR-003](ADR_003_multi_ui_architecture.md) | Multi-UI Architecture Strategy | ACCEPTED |
| [ADR-004](ADR_004_fastapi_backend.md) | FastAPI Backend Architecture | ACCEPTED |
| [ADR-005](ADR_005_documentation_browser.md) | Integrated Documentation Browser | ACCEPTED |
| [ADR-006](ADR_006_landing_page_route_restructure.md) | Landing Page and Route Restructuring | ACCEPTED |
| [ADR-007](ADR_007_interactive_framework_map.md) | Interactive Framework Map | DEFERRED |
