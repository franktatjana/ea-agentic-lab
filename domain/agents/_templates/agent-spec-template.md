# {Agent Name}

> One-sentence responsibility statement. What this agent is accountable for.

**Layer:** Strategic | Governance | Intelligence
**Team:** `{team_directory}`
**Agent ID:** `{agent_id}`

---

## Purpose

2-3 sentences explaining what this agent does and why it exists in the system. Focus on the value it provides to the engagement, not the technical implementation.

---

## Core Functions

- Function 1 (from agent config `core_functions`)
- Function 2
- Function 3
- Function 4

---

## Permissions

What this agent is explicitly allowed to do. Defines the positive scope of authority, the actions, data sources, and capabilities the agent can use.

- Permission 1 (from personality `scope.what_i_do` or definition `x-agentlab.permissions`)
- Permission 2

---

## Boundaries

What this agent must not do. Defines the hard limits on behavior, the actions and domains the agent is excluded from.

- Boundary 1 (from personality `scope.what_i_do_not_do` or definition `x-agentlab.boundaries`)
- Boundary 2, with owner of that responsibility

---

## Skills

| Skill ID | Name | Description |
|----------|------|-------------|
| SK_{PREFIX}_{NNN} | Skill Name | Brief description of what the workflow produces |

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| {agent_name} | What data/signals this agent receives |

### Provides to

| Agent | What |
|-------|------|
| {agent_name} | What data/signals this agent sends |

### Escalates to

{Who and under what conditions}

---

## Guardrails

Key anti-hallucination and safety constraints (from personality `hallucination_prevention`):

- Rule 1
- Rule 2
- Rule 3

When uncertain: {behavior from personality `when_uncertain`}

---

## Quality Criteria

How to evaluate this agent's output (from personality `quality_checks`):

- Criterion 1
- Criterion 2
- Criterion 3

---

## References

Domain knowledge files in `references/`:

| File | Content | Load When |
|------|---------|-----------|
| `glossary-and-resources.md` | Domain terms and external links | On demand |
| `{domain-file}.yaml` | Description | When condition |

---

## Related

- **Config:** `agents/{agent_id}.yaml`
- **Personality:** `personalities/{agent_id}_personality.yaml`
- **Tasks:** `prompts/tasks.yaml`
- **Playbooks owned:** PB_XXX, PB_YYY
