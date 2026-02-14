# DDR-012: Playbook Metadata Standardization

**Status:** ACCEPTED
**Date:** 2026-02-13
**Category:** Domain Decision Record

## Context

The playbook library grew organically across three team traditions, each with its own YAML structure. Strategic playbooks (SA, AE, CA, Admin) used a `steckbrief` block with fields like `mode`, `owner_agent`, `supporting_agents`. Specialist playbooks (Security, Search, Observability) used a `metadata` block with `team_owner`, `category`, `specialty` plus a separate `raci` block. Operational playbooks used a flat structure with `category: "operational"` and a `metadata` sub-block.

This created two problems:

1. **Missing fields**: 57 of 72 playbooks lacked `playbook_mode` (only 15 strategic playbooks had it). Several operational playbooks also lacked `status`. Agents and the frontend could not reliably filter or classify playbooks by execution mode.

2. **Redundant fields**: The steckbrief pattern duplicated root-level fields (`name`, `intended_agent_role`, `secondary_agents`, `status`) into a nested block. Specialist playbooks stored constant values derivable from the file path (`team_owner: "specialists"`, `category: "technical"`). This duplication created drift risk where the root field and nested field could disagree.

## Decision

**Two fields are required at root level in every playbook YAML: `playbook_mode` and `status`.** These are the canonical values. Nested duplicates (e.g., `steckbrief.mode`, `steckbrief.status`) may exist for backward compatibility but are not authoritative.

### playbook_mode

Describes how the playbook executes, not what domain it covers. Six allowed values:

| Mode | Definition | Example playbooks |
|------|-----------|-------------------|
| GENERATIVE | Creates artifacts, plans, documents, proposals | RFx response, solution scoping, three horizons |
| ANALYTICAL | Investigates, profiles, discovers patterns | Deep discovery, competitive analysis, gap scan |
| ASSESSMENT | Evaluates against criteria, validates, scores | Technical validation, security questionnaire |
| OPERATIONAL | Routine procedures, CRUD, process execution | Create action item, meeting prep |
| REACTIVE | Responds to signals, events, threshold breaches | Escalation, health alert response |
| VALIDATION | Validates artifacts against standards | Validate playbook (admin) |

### status

Describes the playbook's lifecycle state. Allowed values: `active`, `production_ready`, `stub`, `pending_validation`, `deprecated`.

**Status was not normalized in this decision.** Some playbooks use `"ACTIVE"`, others `"active"`, others `"production_ready"`. A future pass should align casing and semantics (e.g., decide whether `production_ready` and `active` mean the same thing).

### Redundancy documented, not yet removed

The following redundancies were identified but intentionally left in place to avoid a large-scale breaking change. They should be resolved in a future cleanup pass:

| Redundant field | Canonical equivalent | Affected format |
|----------------|---------------------|----------------|
| `steckbrief.name` | `name` (root) | Strategic |
| `steckbrief.mode` | `playbook_mode` (root) | Strategic |
| `steckbrief.status` | `status` (root) | Strategic |
| `steckbrief.owner_agent` | `intended_agent_role` (root) | Strategic |
| `steckbrief.supporting_agents` | `secondary_agents` (root) | Strategic |
| `metadata.team_owner` | Derivable from file path | Specialist |
| `metadata.category` | Constant `"technical"` for all specialists | Specialist |

### Owner agent naming

Three different field names refer to the same concept across formats: `intended_agent_role` (strategic), `raci.responsible.agent` (specialist), `metadata.owner_agent` (operational). A future decision should canonicalize this to a single root-level field.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|-------------|------|------|-----------------|
| Unify all playbooks into one YAML schema | Eliminates all redundancy, single parser | Massive migration, loses format-specific semantics (steckbrief for strategic overview, raci for specialist governance) | Too disruptive for current stage |
| Derive mode from playbook name/path conventions | No YAML changes needed | Fragile, naming conventions aren't strict enough, requires complex inference | Explicit is better than implicit |
| Add mode only to playbooks that need filtering | Fewer changes | Inconsistent, agents can't reliably assume the field exists | Partial solutions create more complexity |

## Consequences

**Positive:**
- All 72 playbooks now have `playbook_mode` and `status` (100% coverage)
- Frontend can render mode badges consistently across all playbook formats
- Agents can filter playbooks by execution mode without format-specific logic
- Clear taxonomy of six modes provides shared vocabulary across teams

**Negative:**
- Redundancy between steckbrief/metadata blocks and root fields still exists
- Status values are not yet normalized across formats
- Owner agent naming remains inconsistent

**Risks:**
- If steckbrief fields are edited without updating root fields (or vice versa), values will drift. The frontend currently reads `playbook_mode || steckbrief.mode` as a fallback chain, masking potential inconsistencies.

## Addendum: playbook_category and notes fields

**Date:** 2026-02-13

### playbook_category

Groups playbooks by what they help accomplish. Eight allowed values:

| Category | Description | Example playbooks |
|----------|-------------|-------------------|
| strategic_frameworks | Long-term planning, portfolio strategy, horizon mapping | Three Horizons, BCG Matrix, SWOT |
| discovery_investigation | Deep research, gap analysis, signal detection | Deep Discovery, Five Forces, Retrospective |
| technical_execution | Solution design, architecture, implementation planning | Technical Validation, POC, Solution Scoping |
| pursuit_sales_support | Deal strategy, RFx response, competitive positioning | MEDDPICC, RFx Response, Competitive Battlecard |
| content_generation | Document creation, report assembly, deliverable production | (future) |
| relationship_governance | Health monitoring, stakeholder management, adoption | Customer Health Score, Cadence Calls |
| system_governance | Automation, process enforcement, playbook validation | Validate Playbook, Blueprint Gap Scan, Canvas Rendering |
| knowledge_management | Knowledge capture, lessons learned, reporting | (in progress, no playbooks assigned yet) |

Categories are assigned via `playbook_category` at root level. The frontend catalog uses these for browse-by-category filtering.

### notes field and the "Conceptual Framework vs Why It Matters" distinction

Every playbook should communicate its value proposition to the reader. Two patterns apply depending on whether the playbook operationalizes a named industry framework:

**Pattern 1: Named conceptual framework.** When `framework_source` exists (e.g., "McKinsey & Company", "Sakichi Toyoda", "PTC/Jack Napoli"), the UI displays a "Conceptual Framework" label with the source name and uses `notes` as a description underneath.

**Pattern 2: Process-oriented playbook.** When no `framework_source` exists, the playbook describes an internal process rather than a named methodology. The `notes` field then appears under a "Why It Matters" label, explaining the business value of the process in one sentence.

All 46 playbooks that previously lacked both `framework_source` and `notes` were updated with a `notes` value explaining why the process matters. Examples:

| Playbook | notes |
|----------|-------|
| OP_MTG_001 | "Transforms unstructured meeting notes into structured vault artifacts that agents can act on" |
| PB_SEC_005 | "De-risks SIEM migration by providing a structured transition plan from legacy to modern platform" |
| PB_OBS_010 | "Reduces alert fatigue by designing actionable alerting that teams actually respond to" |
| PB_SRCH_008 | "Bridges the gap between LLM capabilities and enterprise knowledge through structured retrieval design" |

### Frontend rendering rules

The playbook detail view metadata grid applies this logic:

1. If `framework_source` present: show "Conceptual Framework" (col-span-2) with source name bold, `notes` as description below
2. If no `framework_source` but `notes` present: show "Why It Matters" (col-span-2) with notes text
3. If neither present: nothing renders in that slot

## Related Decisions

- [DDR-003: Domain Specialist Agents](DDR_003_domain_specialist_agents.md) established the specialist team structure that led to the specialist YAML format
- [DDR-011: Report Generation Pipeline](DDR_011_report_generation_pipeline.md) references playbook metadata for report routing

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-13 | ACCEPTED | Added `playbook_mode` to all 72 playbooks, documented redundancy for future cleanup |
| 2026-02-13 | UPDATED | Added `playbook_category` taxonomy (8 categories), `notes` field with "Conceptual Framework vs Why It Matters" distinction, updated 46 playbooks with notes |
