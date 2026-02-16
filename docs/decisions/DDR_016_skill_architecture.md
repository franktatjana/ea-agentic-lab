# DDR-016: Skill Architecture

**Status:** ACCEPTED
**Date:** 2026-02-16
**Category:** Domain Decision Record
**Extends:** DDR-003 (domain specialist agents)

---

## Context

ea-agentic-lab has 28 agents with capabilities defined in `tasks.yaml` (CAF prompts) and `processing:` steps in agent configs. These capabilities are locked inside individual agents with no mechanism for cross-agent reuse, discovery, or composition.

A gap analysis revealed concrete duplication and visibility problems:

| Problem | Evidence |
|---------|----------|
| Duplicated capabilities | `extract_decisions` exists in both `governance/tasks.yaml` and `solution_architects/tasks.yaml` |
| Cross-team collisions | `risk_identification` appears verbatim in `delivery/` and `partners/` |
| Name collisions | `value_realization`, `customer_success_plan`, `customer_journey` overlap between SA and CA |
| Scattered meeting support | `meeting_support` sections exist in governance, SA, and PM agents |
| No formal skill interface | PB_201 (SWOT) has 8 contributing agents with no defined contribution contract |
| Invisible capabilities | Contributor agents like `specialist_agent` own zero playbooks, making their capabilities undiscoverable |

The agent-lab project establishes "skills" as a best practice: named, composable workflows sitting between atomic prompts and abstract capabilities. This decision introduces a skills layer to ea-agentic-lab.

---

## Decision

Introduce skills as agent-scoped YAML files with a catalog for cross-agent discovery, creating a three-layer capability hierarchy.

### Three-Layer Hierarchy

```text
Prompts (tasks.yaml)  →  Atomic CAF prompts, single-turn, context/action/format
        ↓
Skills (skills/)      →  Multi-step workflows with formal I/O, composable across agents
        ↓
Playbooks (playbooks/) →  Orchestrated processes, trigger-driven, cross-functional
```

### Skills Are Agent-Scoped

Skills live inside agent team directories (`domain/agents/{team}/skills/`), not in a central location. This preserves the bounded-context principle established in DDR-003. Each agent owns its skills, and the skill catalog provides cross-agent discovery without breaking ownership boundaries.

### Skill Schema

Each skill file defines:

- **Identity**: skill_id (SK_{PREFIX}_{NNN}), name, owner, category
- **Workflow**: ordered steps with optional prompt_ref links to tasks.yaml
- **Inputs/Outputs**: typed, named, with format and description
- **Quality criteria**: assertions that must hold for output to be valid
- **Guardrails**: constraints on behavior during execution
- **Imports**: skill IDs from other agents for cross-agent composition

### Skill Catalog

`domain/catalogs/skill_catalog.yaml` indexes all skills following the same pattern as `signal_catalog.yaml`. The catalog provides:

- Skill definitions with owner, team, category, path
- Consumer mapping (which agents use which skills)
- Dependency tracking (depends_on, imported_by)
- Skill flows (named sequences showing composition chains)

### Cross-Agent Composition

Skills can import other skills across team boundaries. The importing skill declares the dependency in its `imports` field, and the agent config lists it under `skills.imports`. This creates a formal contract between agents.

Example: SK_SA_002 (Decision Capture) imports SK_GOV_002 (Extract Decisions). The SA agent owns the technical decision framing, while governance owns the raw decision extraction.

---

## Alternatives Considered

### Central skills directory (`domain/skills/`)

All skills in one directory, independent of agents.

- Pro: Simple discovery, no catalog needed
- Con: Breaks bounded context, unclear ownership, skills drift from agents
- Rejected: Violates the agent-scoped design principle from DDR-003

### No skills layer (wait and extract later)

Continue with tasks.yaml and playbooks only, extract skills when patterns stabilize.

- Pro: No new files or concepts
- Con: Duplication already present and growing, contributor agents remain invisible
- Rejected: The duplication problem exists today, waiting compounds it

### Merge into tasks.yaml

Add output schemas and composition to the existing tasks.yaml format.

- Pro: No new file type
- Con: tasks.yaml has no output schema, no composition mechanism, and is already large (800+ lines in some teams)
- Rejected: Overloads tasks.yaml beyond its design purpose

---

## Consequences

### Positive

- **Composability**: Skills can be imported across agents with formal contracts
- **Deduplication**: Shared capabilities (decision extraction, meeting processing) defined once, imported where needed
- **Visibility**: Contributor agents gain discoverable skills even without owning playbooks
- **Discovery**: Skill catalog enables finding capabilities by category, tag, or consumer
- **Formal I/O**: Skills define typed inputs and outputs, enabling validation and testing

### Negative

- **Catalog maintenance**: New skills must be registered in the catalog (same overhead as signal catalog)
- **Agent count**: Does not increase, but adds a fourth file type to the agent directory

### Risks

- **Over-extraction**: Creating skills for capabilities that are not actually reused. Mitigated by starting with 3 agents and expanding only when duplication is confirmed
- **Schema drift**: Skill files diverging from template. Mitigated by the skill template and future validation

---

## Proof of Concept

Seven skills implemented across three teams to validate the architecture:

| Skill ID | Name | Team | Cross-Agent |
|----------|------|------|-------------|
| SK_ACI_001 | Company Research | account_intelligence | - |
| SK_ACI_002 | Organigram Building | account_intelligence | - |
| SK_ACI_003 | Opportunity Identification | account_intelligence | - |
| SK_GOV_001 | Process Meeting Notes | governance | - |
| SK_GOV_002 | Extract Decisions | governance | Imported by SK_SA_002 |
| SK_SA_001 | Technical Discovery | solution_architects | - |
| SK_SA_002 | Decision Capture | solution_architects | Imports SK_GOV_002 |

---

## Related Decisions

- **DDR-003**: Domain specialist agents (bounded context principle this decision extends)
- **DDR-008**: Global Knowledge Vault (knowledge capture that skills formalize)
- **DDR-015**: Curator agent specialization (governance pattern this decision follows)

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-16 | ACCEPTED | Skills architecture with 7 proof-of-concept skills across 3 teams |
