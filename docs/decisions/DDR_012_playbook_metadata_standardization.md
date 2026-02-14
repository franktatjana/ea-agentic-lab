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

## Related Decisions

- [DDR-003: Domain Specialist Agents](DDR_003_domain_specialist_agents.md) established the specialist team structure that led to the specialist YAML format
- [DDR-011: Report Generation Pipeline](DDR_011_report_generation_pipeline.md) references playbook metadata for report routing

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-13 | ACCEPTED | Added `playbook_mode` to all 72 playbooks, documented redundancy for future cleanup |
