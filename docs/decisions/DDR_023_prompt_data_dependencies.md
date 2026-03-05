# DDR-023: Prompt Data Dependencies

**Status:** ACCEPTED
**Date:** 2026-03-05
**Version:** 1.0
**Category:** Domain Decision Record
**Extends:** DDR-019 (domain model, prompt layer), DDR-022 (knowledge scope evolution)

---

## Context

Prompts declare input parameters (typed variables like `account_name`, `current_stage`) and output format, but not which data sources they consume. The agent implicitly discovers tool dependencies from the prompt text ("Review all communications and CRM data for..."), leaving the platform unable to optimize execution.

| Problem | Evidence |
|---------|----------|
| No pre-fetch optimization | Platform cannot parallelize tool calls because it does not know what data a prompt needs until the agent starts reasoning |
| No missing-data detection | SIG_CRITICAL_DATA_MISSING fires during execution, not before. The platform could catch this earlier if it knew the prompt's data contract |
| Implicit tool dependencies | The same prompt text might reference "CRM data" and "stakeholder map" but there is no structured declaration linking these to specific tools |
| No per-prompt priority | Agent-level error_handling classifies tools globally (critical vs enrichment), but a tool might be critical for one prompt and enrichment for another |
| Audit gap | When a prompt produces inaccurate output, there is no formal record of what data sources it was supposed to consume |

The framework already made a similar evolution with knowledge: DDR-022 moved from implicit `load_when` triggers to explicit scope declarations. Prompt data dependencies follow the same pattern, making contracts explicit at the declaration layer.

---

## Decision

Add `requires_data` to prompt_registry entries in agent definition YAML. Each entry declares which tool data sources the prompt needs, what fields it consumes, and whether each source is critical or enrichment for that specific prompt.

### 1. Format

```yaml
prompt_registry:
  ae-diagnose-stalled-deal:
    description: Understand why a deal has stopped progressing
    source: prompts/tasks.yaml#deal_diagnosis.diagnose_stalled_deal
    inputs:
    - title: current_stage
      type: string
    - title: days_in_stage
      type: integer
    outputs:
    - title: stall_diagnosis
      type: object
    requires_data:
    - source: read-crm-data
      fields: [stage_history, activity_log, next_steps]
      priority: critical
    - source: read-communications
      fields: [touchpoints_since_stage_entry]
      priority: critical
    - source: read-infohub
      fields: [stakeholder_map, risk_flags]
      priority: enrichment
```

### 2. Field definitions

- `source`: References a tool `id` from the same agent's `tools:` block. Creates a validatable link between prompt and tool.
- `fields`: Array of strings naming the conceptual data elements the prompt needs from that source. These are documentation-level names, not API response paths. They tell the platform and human reviewers what the prompt actually consumes.
- `priority`: Either `critical` or `enrichment`. Overrides agent-level error_handling classification for this specific prompt. A tool classified as enrichment globally can be critical for a prompt that cannot function without it.

### 3. Placement rationale

`requires_data` lives in the `prompt_registry` (definition YAML), not in `tasks.yaml`. Prompts in tasks.yaml are reusable building blocks (DDR-019), deliberately tool-agnostic. The same prompt text could be used by different agents with different tool sets. The prompt_registry is the contract layer that already carries typed inputs and outputs, making it the natural home for data source declarations.

### 4. Backward compatibility

Prompts without `requires_data` continue working. Pure reasoning prompts that operate entirely on provided inputs (no tool data needed) omit the field. The platform falls back to agent-directed tool selection when requires_data is absent.

### 5. Platform usage

The platform uses `requires_data` for:
- **Pre-fetch**: Call all declared sources in parallel before prompt execution
- **Missing data detection**: Check critical sources before running the prompt, emit SIG_CRITICAL_DATA_MISSING if unavailable
- **Degraded execution**: If enrichment sources fail, proceed with available data and flag affected sections
- **Audit trail**: Log which sources were consulted for each prompt execution

---

## Alternatives Considered

**A. Add to tasks.yaml.** Rejected: breaks prompt reusability. Tool dependencies are agent-specific, not prompt-generic. The same prompt text ("Review CRM data") might map to `read-crm-data` in one agent and `read-account-data` in another.

**B. Derive from workflow_shorthand tools.** Rejected: workflow steps declare tools at the execution level (which tools are available), not what the prompt needs. A step might have 4 tools available but the prompt only needs 2.

**C. Auto-infer from prompt text.** Rejected: fragile and not auditable. Parsing "Review all communications" to infer `read-communications` works for simple cases but fails for nuanced references and produces no formal contract.

---

## Consequences

### What Changes

- prompt_registry entries across 47 agent definitions gain `requires_data` declarations
- Domain model: Prompt layer properties updated to include data dependencies
- Tool design principles: new section on prompt-level data contracts
- Frontend: prompt flyout shows data dependencies with priority badges
- Backend: resolve_prompt includes requires_data in response

### What Stays the Same

- tasks.yaml files unchanged (prompt text layer remains tool-agnostic)
- workflow_shorthand format unchanged (execution layer stays as-is)
- Agent-level error_handling unchanged (global classification still valid)
- Tool declarations unchanged

---

## Reference

- Domain model: [Domain Model](../architecture/system/domain-model.md) Section 4.0 (Prompt)
- Tool design: [Tool Design Principles](../architecture/system/tool-design-principles.md)
- Knowledge precedent: [DDR-022](DDR_022_knowledge_qa_service_evolution.md) (scope-based declarations)
- Error handling: [Error Handling Checklist](../architecture/system/error-handling-checklist.md)

---

## Decision Participants

Designed through analysis of 1556 prompt_registry entries across 47 agent definitions, identifying the gap between declared inputs and actual data consumption patterns.
