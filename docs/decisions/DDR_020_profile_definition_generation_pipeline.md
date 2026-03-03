# DDR-020: Profile and Definition Generation Pipeline

**Status:** ACCEPTED
**Date:** 2026-03-01
**Category:** Domain Decision Record
**Extends:** DDR-018 (agent definition alignment), DDR-019 (agent system domain model)

---

## Context

DDR-018 established that every agent needs a human-readable spec alongside its YAML configuration. DDR-019 defined the domain model where each agent is a digital twin of a human role, with profiles as the human view and definitions as the system view. Two problems remained:

| Problem | Evidence |
|---------|----------|
| Definition generator produced inaccurate handoffs | `_build_boundaries()` used `escalation_to` from config (e.g. "PM Director") for every boundary, ignoring `with_other_agents` from personality which has actual agent-to-agent relationships |
| Definition generator produced generic escalation triggers | Every agent got identical "{priority} requiring attention" triggers regardless of role |
| No profile generator existed | 32 profiles were hand-scaffolded with inconsistent structure, diverged from source YAML |
| Profile/definition misalignment | Profiles described different content than definitions because they read different sources |

The source of truth for each agent is: personality YAML + tasks.yaml + agent config YAML + references/. Both definitions and profiles must derive from these files, not from manual authoring.

---

## Decision

Build a two-generator pipeline where definitions and profiles are both derived from the same source files. Fix the definition generator's handoff logic, then create a profile generator that reads corrected definitions plus source files.

### Part 1: Definition Generator Fixes

Four fixes to `generate_definition.py` ensure definitions accurately represent agent relationships:

**1a. Boundaries read `with_other_agents.defer_to` from personality.**

Previous: every boundary item got `(handoff to {escalation_to})` where `escalation_to` was always the agent's human manager (e.g., "PM Director"). Fixed: boundaries that mention another agent's domain (e.g., "SA Agent's domain") now route to that agent by matching `defer_to` entries from personality.

**1b. Escalation triggers use role-appropriate language.**

Previous: generic `"{priority} requiring attention (to {escalation_to})"` for every agent. Fixed: domain-specific triggers from `defer_to` (e.g., "Technical implementation feasibility (to SA Agent)") plus a human escalation trigger derived from the agent's top priority.

**1c. New `handoffs` field in definitions.**

Added `x-ea-agent.handoffs` capturing the full collaboration model from `with_other_agents`: `defer_to`, `provide_to`, `receives_from`, and `human_escalation`. This gives profiles structured data to render handoff tables from.

**1d. Quality section handles `before_output` variant.**

Senior Manager uses `quality_checks.before_output` instead of the flat `quality_checks` list. The generator now handles both patterns.

### Part 2: Profile Generator

New script `generate_profile.py` reads corrected definitions, personality, and config to produce profile markdown for every agent. Profiles follow the DDR-019 digital twin framing: each profile is the human view of the role.

Input sources per agent:
- Definition YAML: runbooks (flows), prompt counts, tools, knowledge references, operating modes
- Personality YAML: values, tone, decision authority (if present), `with_other_agents` (handoffs)
- Agent config YAML: purpose, playbooks owned, `escalation_to` (human escalation)

### Part 3: Quality Decisions

Six quality decisions shaped the profile output:

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Profiles derive from definitions as primary source | Definitions are the golden standard (DDR-018). Personality and config enrich but don't override. |
| D2 | Operating modes use condensed third-person descriptions | Raw `additional_instructions` from definitions are imperative and verbose. Standardized 2-3 sentence descriptions read better in a profile document. |
| D3 | Agent labels use proper acronyms (SA, AE, PM) | Naive `title()` produces "Sa Agent" instead of "SA Agent". ACRONYM_MAP handles common patterns. |
| D4 | Handoff tables differentiate defer_to from provide_to | defer_to = "this agent needs something from another" (Trigger / Receiving Agent / Context Passed). provide_to = "this agent shares output with another". Inbound uses 2-column table since we have no separate action data. |
| D5 | Pilot agents (AE, CI, VE) included in profile registry | Their definitions were hand-crafted outside the generator but are structurally valid. Excluding them from profiles would leave gaps. |
| D6 | Knowledge base strips verbose prefixes | "Performing tasks related to signal detection" becomes "Signal detection" in the Loaded By column. |

### Profile Structure

Every profile follows this section order:

```
# {Agent Name}
{Intro: digital twin framing, runbook count, operating principle}

## Identity          (table: ID, Role, Mode, Runbooks, Prompts, Modes, Knowledge)
## Runbooks          (per runbook: heading, description, step table)
## Decision Authority (leadership agents only, from personality)
## Scope Boundaries  (from personality what_i_do_not_do)
## Handoffs          (outbound: defer_to/provide_to; inbound: receives_from)
## Operating Modes   (condensed descriptions)
## Knowledge Base    (from definition references)
## Output Artifacts  (from definition assets, if non-default)
## Source Files      (table: definition, config, personality, tasks paths)
```

Sections are conditionally included: Decision Authority only for leadership agents, Inbound Handoffs only for agents with `receives_from`, Output Artifacts only when non-default assets exist.

---

## Alternatives Considered

### Manual profile maintenance

Continue hand-authoring profiles independently from definitions.

- Pro: Full editorial control over each profile
- Pro: No tooling investment
- Con: Already proven to diverge (32 profiles showed inconsistent structure)
- Con: Does not scale when definitions change, requires manual sync across 33 agents
- **Rejected**: The misalignment between hand-authored profiles and generated definitions was the original problem. Manual maintenance perpetuates it.

### Single generator producing both artifacts

One script that generates both the definition YAML and the profile markdown in a single pass.

- Pro: Guaranteed consistency, single source parse
- Con: Conflates two audiences (system view vs. human view) in one codepath
- Con: Definition generation already works and is validated, coupling risks breaking it
- **Rejected**: Separate generators with shared source files achieves consistency without coupling. Each generator can evolve independently.

### Profile as Jinja2 template

Use a Jinja2 template file instead of Python string building for profile markdown.

- Pro: Separates presentation from logic
- Pro: Non-developers could modify the template
- Con: Conditional section inclusion (Decision Authority, Inbound Handoffs) requires template logic that approaches the complexity of the Python builder
- Con: Adds a dependency for minimal benefit at current scale (33 agents)
- **Deferred**: If profiles gain more visual complexity or non-developers need to modify structure, extract to Jinja2 templates.

---

## Consequences

### Positive

- Every agent profile is derived from the same source files as its definition
- Profile structure is consistent across all 33 agents (7-8 sections each)
- Handoff tables accurately reflect agent-to-agent relationships from personality YAML
- Regeneration is a single command: `python generate_profile.py --all`
- Quality decisions are documented in the generator code and this DDR
- Pilot agents (AE, CI, VE) are included without requiring them to go through the definition generator

### Negative

- Two generators to maintain (definition + profile), though both are stable
- Operating mode descriptions are hardcoded rather than derived from source, requires manual update if modes change
- Profile generator depends on definition format, format changes require updating both generators

### Risks

- **Generator drift**: If definition format evolves (e.g., Oracle Agent Spec version update), the profile generator must be updated in sync. Mitigated by keeping both generators in the same `_templates/` directory and running them together.
- **Source data quality**: Some profiles inherit quirks from source YAML (e.g., governance agents listing "Extract Decisions" as a runbook name). These are source data issues, not generator bugs, and should be fixed in personality/tasks YAML.

---

## Change Log

Changes implemented across two sessions:

### Session 1: Definition Generator Fixes

| Change | Files Affected |
|--------|---------------|
| Fixed `_build_boundaries()` to use `defer_to` from personality | `generate_definition.py` |
| Fixed `_build_escalation_triggers()` with role-appropriate triggers | `generate_definition.py` |
| Added `_build_handoffs()` for structured collaboration data | `generate_definition.py` |
| Fixed `_build_quality()` to handle `before_output` variant | `generate_definition.py` |
| Regenerated all 33 definitions | `domain/agents/*/**-agent-definition.yaml` |
| Validated all definitions | `validate_definitions.py` (no errors) |

### Session 2: Profile Generator + Quality Fixes

| Change | Files Affected |
|--------|---------------|
| Created `generate_profile.py` | `domain/agents/_templates/generate_profile.py` |
| Fixed PROFILES_BASE path (`domain/docs/` to `docs/`) | `generate_profile.py` |
| Fixed keywords YAML formatting (Python list to YAML list) | `generate_profile.py` |
| Fixed 2-step runbook descriptions (", then" pattern) | `generate_profile.py` |
| Fixed source file paths (missing `domain/` prefix) | `generate_profile.py` |
| Added prompt name prefix stripping | `generate_profile.py` |
| Added default artifact filtering | `generate_profile.py` |
| Added ACRONYM_MAP for agent label casing (D3) | `generate_profile.py` |
| Added CONDENSED_MODES for operating mode text (D2) | `generate_profile.py` |
| Differentiated outbound handoff columns (D4) | `generate_profile.py` |
| Simplified inbound handoffs to 2-column table (D4) | `generate_profile.py` |
| Stripped knowledge base "Loaded By" verbose prefix (D6) | `generate_profile.py` |
| Added boundary text agent casing fix via `_fix_agent_casing()` (D3) | `generate_profile.py` |
| Added pilot agents (AE, CI, VE) to profile registry (D5) | `generate_profile.py` |
| Fixed AE profile directory routing (singular vs. plural tag) | `generate_profile.py` |
| Generated all 33 profiles (30 standard + 3 pilots) | `docs/reference/agent-profiles/**/*.md` |

### Validation Results

- 33 definitions: all valid YAML, all pass structural validation
- 33 profiles: all generated without errors, all have 7-8 sections
- 0 instances of badly-cased agent names (grep confirmed)
- Profile runbook counts match definition flow counts for all agents

---

## Related Decisions

- **DDR-018**: Agent definition alignment (established the definition standard this implements)
- **DDR-019**: Agent system domain model (digital twin framing, runbook terminology, holonic architecture)
- **DDR-016**: Skill architecture (runbooks evolved from skills concept)
- **DDR-003**: Domain specialist agents (bounded context principle governing agent boundaries)

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-03-01 | ACCEPTED | Definition generator fixed, profile generator created, all 33 agents regenerated and validated. |
