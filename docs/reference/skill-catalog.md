# Skill Catalog Reference

Skills are named, composable workflows that sit between atomic prompts (tasks.yaml) and orchestrated playbooks. Each skill is owned by an agent and lives in that agent's team directory. The skill catalog provides cross-agent discovery without breaking ownership boundaries.

- Canonical source: `domain/catalogs/skill_catalog.yaml`
- Template: `domain/agents/_templates/skill_template.yaml`
- Architecture decision: [DDR-016](../decisions/DDR_016_skill_architecture.md)

---

## Skills by Category

### Intelligence Gathering

Skills for researching and collecting information from external sources.

| Skill ID | Name | Owner | Team |
|----------|------|-------|------|
| SK_ACI_001 | Company Research | aci_agent | account_intelligence |
| SK_ACI_002 | Organigram Building | aci_agent | account_intelligence |

### Intelligence Analysis

Skills for analyzing collected intelligence and identifying opportunities.

| Skill ID | Name | Owner | Team |
|----------|------|-------|------|
| SK_ACI_003 | Opportunity Identification | aci_agent | account_intelligence |

### Meeting Processing

Skills for extracting structured data from meetings.

| Skill ID | Name | Owner | Team |
|----------|------|-------|------|
| SK_GOV_001 | Process Meeting Notes | meeting_notes_agent | governance |

### Decision Management

Skills for capturing, registering, and tracking decisions. This category spans two teams, demonstrating cross-agent composition.

| Skill ID | Name | Owner | Team | Imports |
|----------|------|-------|------|---------|
| SK_GOV_002 | Extract Decisions | decision_registrar_agent | governance | - |
| SK_SA_002 | Decision Capture | sa_agent | solution_architects | SK_GOV_002 |

### Technical Assessment

Skills for technical discovery and architecture evaluation.

| Skill ID | Name | Owner | Team |
|----------|------|-------|------|
| SK_SA_001 | Technical Discovery | sa_agent | solution_architects |

---

## Skill Flows

Skill flows are named sequences showing how skills compose across agents.

### Intelligence to Strategy

Intelligence gathering feeds account strategy through a three-skill pipeline.

```text
SK_ACI_001 (Company Research)
    ↓ company_profile
SK_ACI_002 (Organigram Building)
    ↓ organigram
SK_ACI_003 (Opportunity Identification)
    ↓ opportunity_map
```

Feeds playbooks: PB_ACI_001, PB_ACI_002, PB_602

### Meeting to Decisions

Meeting processing to decision capture and registration, crossing team boundaries.

```text
SK_GOV_001 (Process Meeting Notes)       [governance]
    ↓ extracted_decisions
SK_GOV_002 (Extract Decisions)           [governance]
    ↓ registered_decision
SK_SA_002  (Decision Capture)            [solution_architects]
    ↓ technical_decisions + ADRs
```

SK_SA_002 imports SK_GOV_002 to demonstrate cross-agent composition: governance owns the raw extraction, SA adds technical framing.

---

## Cross-Agent Import Conventions

When a skill imports from another agent:

1. The skill file declares `imports: ["SK_GOV_002"]`
2. The agent config lists the import under `skills.imports` with `from` and `usage`
3. The catalog marks the relationship with `imports` and `imported_by` fields

The importing agent depends on the output contract of the imported skill. If the imported skill's output schema changes, all importers must be reviewed.

---

## How to Add a New Skill

### Step 1: Create the skill file

Copy `domain/agents/_templates/skill_template.yaml` to `domain/agents/{team}/skills/{skill_name}.yaml`. Fill in:

- `skill_id`: Use the team prefix convention (SK_{PREFIX}_{NNN})
- `workflow`: Define ordered steps, linking to prompts where applicable
- `inputs/outputs`: Type and describe all data flowing in and out
- `quality_criteria`: What must be true for the output to be valid
- `guardrails`: Constraints on behavior

### Step 2: Update agent config

Add a `skills.owned` entry to the agent's YAML config:

```yaml
skills:
  owned:
    - skill_id: "SK_XX_001"
      path: "skills/skill_name.yaml"
```

If the skill imports from another agent, add `skills.imports`:

```yaml
skills:
  imports:
    - skill_id: "SK_GOV_002"
      from: "governance"
      usage: "What this import provides"
```

### Step 3: Register in catalog

Add the skill to `domain/catalogs/skill_catalog.yaml` under the `skills:` section with owner, team, category, path, and consumers.

### Step 4: Update this reference

Add the skill to the appropriate category table above.

---

## Relationship to Tasks and Playbooks

```text
tasks.yaml          Single-turn CAF prompts. Atomic, stateless.
                    A skill may reference tasks via prompt_ref.

skills/             Multi-step workflows with typed I/O.
                    Composable across agents via imports.
                    Owned by a single agent.

playbooks/          Orchestrated processes with triggers,
                    contributors, and escalation paths.
                    A playbook may invoke skills from multiple agents.
```

Skills formalize what tasks.yaml describes informally. A task is a prompt template; a skill is an executable workflow that may use one or more prompts across its steps.

---

## ID Scheme

| Prefix | Team | Example |
|--------|------|---------|
| SK_ACI | Account Intelligence | SK_ACI_001 |
| SK_GOV | Governance | SK_GOV_001 |
| SK_SA | Solution Architects | SK_SA_001 |
| SK_II | Industry Intelligence | (future) |
| SK_TSCT | Technology Scout | (future) |
| SK_AE | Account Executives | (future) |
| SK_VE | Value Engineering | (future) |
| SK_CA | Customer Architects | (future) |

---

## Related Documentation

- [Signal Catalog](signal-catalog.md) - Signal definitions (same catalog pattern)
- [Playbook Catalog](playbook-catalog.md) - Playbook definitions
- [Agent Architecture](../architecture/agents/agent-architecture.md) - Agent design overview
- [DDR-016](../decisions/DDR_016_skill_architecture.md) - Architecture decision
