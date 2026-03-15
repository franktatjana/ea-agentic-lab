---
order: 5
---

# How to Configure an Agent

This guide is for developers adding or adjusting agent behavior in the EA Agentic Lab. Configuration controls which tools the agent can call, what knowledge it draws on, what guardrails constrain its outputs, and what trust tier governs its autonomy. Getting these settings right before running an agent determines whether it behaves predictably.

## Prerequisites

- Working local environment (see [run-demo.md](run-demo.md))
- An existing agent directory under `domain/agents/{team}/`
- Familiarity with YAML syntax
- Understanding of the domain model (see [DDR-019](../../decisions/DDR_019_agent_system_domain_model.md))

---

## What Configuration Controls

Agent configuration is split across two files in `domain/agents/{team}/agents/`:

- **`{agent}_agent.yaml`**: capabilities, tools enabled, signal patterns, escalation rules, output formats
- **`{agent}_personality.yaml`**: behavioral constraints, scope boundaries, anti-hallucination rules, communication style

A third file, `{agent}-definition.yaml`, is the golden standard definition that governs both. Changes made to the agent YAML should stay consistent with the definition.

---

## YAML Definition File Structure

The definition file has these top-level sections:

```yaml
agent:
  name:          # Display name
  version:       # Semantic version string
  type:          # strategic | operational | governance
  team:          # Directory name under domain/agents/

capabilities:    # List of named capabilities this agent provides

inputs:
  required:      # Data sources the agent cannot run without
  optional:      # Data sources it will use if present

outputs:
  artifacts:     # Named output objects (e.g. risk_register)
  formats:       # yaml | markdown

signal_detection:
  patterns:      # Regex patterns, type label, priority

escalation:
  triggers:      # Condition + target agent + SLA hours

playbooks:
  primary:       # Playbook IDs this agent leads
  secondary:     # Playbook IDs this agent participates in

collaborates_with:  # List of agent IDs this agent hands off to or receives from
```

<!-- TODO: expand with working examples showing a complete definition file -->

---

## Common Configuration Scenarios

### Enable a Tool

Tools are declared in the agent's `capabilities` list and referenced in `collaborates_with` for handoff routing. To expose a tool to peer agents, add it to the agent's `toolbox` field in the definition file.

```yaml
# In {agent}_agent.yaml
capabilities:
  - existing_capability
  - new_tool_name     # Add the new capability here
```

Then register the tool in `domain/catalogs/skill_catalog.yaml` if it is a composable skill.

<!-- TODO: expand with working examples showing toolbox and skill_catalog registration -->

### Change the Trust Tier

Trust tier controls how much the agent can do without human review. Tiers are defined per-agent in the definition file under `autonomy.trust_tier`. Valid values are `autonomous`, `review`, and `human-decides`.

```yaml
# In {agent}-definition.yaml
autonomy:
  trust_tier: review    # Change from autonomous -> review to require approval
  description: |
    Outputs require human sign-off before downstream agents act on them.
```

Changing the trust tier also affects which playbooks the agent can lead. Review the playbook definition files for any trust tier assertions that reference this agent.

<!-- TODO: expand with working examples showing trust tier impact on playbook routing -->

### Add a Knowledge Source

Knowledge sources are declared in the agent definition under `knowledge`. Each entry names a file from `domain/knowledge/` and describes what the agent uses it for.

```yaml
# In {agent}-definition.yaml
knowledge:
  - file: domain/knowledge/your-knowledge-file.yaml
    purpose: Provides domain reference data for signal classification
    loaded_by: signal_detection
```

The file itself must exist and conform to the knowledge schema. Without a populated file, the agent references a path that resolves to nothing and falls back to LLM inference, which increases hallucination risk.

<!-- TODO: expand with working examples showing knowledge file schema and loading behavior -->

### Add or Tighten a Guardrail

Guardrails live in the personality file under `anti_hallucination` and `quality_standards`. They are plain-language rules the agent enforces on every output.

```yaml
# In {agent}_personality.yaml
anti_hallucination:
  strict_rules:
    - NEVER claim a capability without a source citation
    - NEVER commit to a roadmap item (PM Agent domain)
    - Add your new rule here

quality_standards:
  - Every recommendation must have an owner
  - Add output contract rules here
```

<!-- TODO: expand with working examples and output contract reference -->

---

## Validation Checklist

After any configuration change, verify the following before running the agent:

- [ ] Changes in `{agent}_agent.yaml` are consistent with `{agent}-definition.yaml`
- [ ] Any new capability is registered in the agent catalog
- [ ] Any new knowledge source file exists and is populated
- [ ] Trust tier change is reflected in dependent playbook definitions
- [ ] Personality guardrails cover the new capability's failure modes

---

## Related Documentation

- [How to Create a New Agent](create-agent.md)
- [How to Run an Agent](run-agent.md)
- [Agent Architecture](../../architecture/agents/agent-architecture.md)
- [DDR-019: Agent System Domain Model](../../decisions/DDR_019_agent_system_domain_model.md)
- [Skill Catalog](../../reference/skill-catalog.md)
