# Error Handling Validation Checklist

**Version:** 1.0
**Date:** 2026-03-05
**Status:** Production Ready
**Companion to:** [Tool Design Principles](tool-design-principles.md) Section 4

Every agent definition must pass this checklist before it ships. The framework provides four failure patterns (stop, skip_with_warning, escalate, retry) documented in the [Playbook System](../playbooks/playbook-system.md). This checklist ensures they are wired consistently into every agent.

---

## Three Layers of Error Handling

Agent error handling operates at three layers. Each layer answers a different question, and all three must be present in every agent definition.

| Layer | Location in YAML | Question It Answers |
|-------|-----------------|---------------------|
| **Tool-level** | `tools[].x-ea-agent.error_responses` | What can go wrong when calling this tool? |
| **Agent-level** | `x-ea-agent.error_handling` | How does this agent behave when tools fail? |
| **Flow-level** | `flows[].x-ea-agent.workflow_shorthand[].on_failure` | What happens to the workflow when a step fails? |

---

## Layer 1: Tool Error Responses

Every read tool must declare its failure modes so the agent knows what to expect and how to react.

### Standard Error Codes per Tool Type

**Vault readers** (`read-infohub`):

```yaml
x-ea-agent:
  risk: low
  error_responses:
  - error_code: SOURCE_UNAVAILABLE
    guidance: Proceed with other data sources, flag output as incomplete
  - error_code: SECTION_NOT_FOUND
    guidance: Section does not exist for this account, skip and note gap
  - error_code: STALE_DATA
    guidance: Data exceeds freshness threshold, flag for human verification
```

**Intelligence readers** (`read-intelligence`):

```yaml
x-ea-agent:
  risk: low
  error_responses:
  - error_code: SOURCE_UNAVAILABLE
    guidance: Skip intelligence enrichment, proceed with core data
  - error_code: SECTION_NOT_FOUND
    guidance: Intelligence section unavailable, note gap in output
  - error_code: STALE_DATA
    guidance: Intelligence may be outdated, flag for refresh
```

**External system readers** (`read-crm-data`):

```yaml
x-ea-agent:
  risk: low
  error_responses:
  - error_code: SOURCE_UNAVAILABLE
    guidance: CRM unavailable, cannot proceed with pipeline data
  - error_code: RECORD_NOT_FOUND
    guidance: Record not found in CRM, verify identifiers with user
```

**Communication readers** (`read-communications`):

```yaml
x-ea-agent:
  risk: low
  error_responses:
  - error_code: SOURCE_UNAVAILABLE
    guidance: Cannot access communications, flag as data gap
  - error_code: NO_RECORDS
    guidance: No communications found for period, expand search or note gap
```

**Market intelligence** (`read-market-intelligence`):

```yaml
x-ea-agent:
  risk: low
  error_responses:
  - error_code: SOURCE_UNAVAILABLE
    guidance: Market intelligence unavailable, skip market enrichment
  - error_code: NO_RESULTS
    guidance: No market data found for criteria, broaden search or note gap
```

### Validation Rule

Every tool with `id` starting with `read-` must have an `error_responses` array with at least `SOURCE_UNAVAILABLE`. Write tools (`write-*`, `save-*`) and `ask-user` do not require error_responses, they are gated by `requires_confirmation: true` or human-in-the-loop.

---

## Layer 2: Agent-Level Error Handling

Every agent must classify its tools as **critical** or **enrichment** and define behavior for each failure class.

### Standard Block

Place between `guardrails:` and `autonomy:` in the `x-ea-agent:` section:

```yaml
error_handling:
  tool_failures:
    critical: [tool-ids-that-must-succeed]
    enrichment: [tool-ids-that-can-fail-gracefully]
  on_critical_failure:
    action: stop
    emit_signal: SIG_CRITICAL_DATA_MISSING
    guidance: Cannot produce reliable output without critical data
  on_enrichment_failure:
    action: continue_with_degradation
    emit_signal: SIG_ENRICHMENT_UNAVAILABLE
    guidance: Proceed with available data, mark affected sections low-confidence
  on_stale_data:
    action: warn_and_continue
    emit_signal: SIG_STALE_DATA_USED
    guidance: Flag freshness concern for human verification
```

### Classification Guide

How to decide whether a tool is critical or enrichment for a given agent:

| Criterion | Critical | Enrichment |
|-----------|----------|------------|
| Agent cannot produce its primary artifact without this data | Yes | No |
| Output quality drops but output is still useful | No | Yes |
| Data provides context/background but not core content | No | Yes |
| Regulatory or compliance dependency | Yes | No |
| Human safety or financial impact if missing | Yes | No |

### Reference Classifications

Current agents use these classifications. New agents should follow the same reasoning pattern.

**CRM data** (`read-crm-data`): Critical for agents that assess pipeline state, opportunity stages, or deal values. Enrichment when agent only uses CRM for background context.

**Communications** (`read-communications`): Critical for agents that extract decisions, touchpoints, or signals from meeting transcripts and messages. Enrichment when agent uses comms only for supplementary context.

**InfoHub** (`read-infohub`): Critical for agents whose primary function is assessing stored data (risk agents, compliance agents). Enrichment for agents that use InfoHub to add depth to analysis derived from other sources.

**Intelligence** (`read-intelligence`): Almost always enrichment. Intelligence data adds market/industry/technology context but agents can produce useful output without it.

### Validation Rule

Every agent's `x-ea-agent` section must contain an `error_handling` block. The `tool_failures.critical` + `tool_failures.enrichment` lists must together cover every `read-*` tool in the agent's `tools:` section. Empty `critical: []` is valid when an agent has no hard data dependencies.

---

## Layer 3: Flow Step on_failure

Every step in `workflow_shorthand` must declare what happens when it fails.

### Allowed Values

| Value | Behavior | Use When |
|-------|----------|----------|
| `stop` | Halt workflow, emit signal, surface to human | Step produces core artifact, downstream steps depend on it |
| `skip_with_warning` | Skip step, emit SIG_STEP_SKIPPED, continue | Step enriches but is not essential to core output |

### Assignment Guide

| Step Type | Default on_failure | Rationale |
|-----------|-------------------|-----------|
| First step (initiation/analysis) | `stop` | Foundation for all subsequent steps |
| Core processing steps | `stop` | Primary artifact depends on these |
| Enrichment/supplementary steps | `skip_with_warning` | Nice-to-have, output usable without them |
| Persist steps (`action: persist`) | `stop` | Do not save incomplete or corrupt data |
| Handoff steps | `stop` | Incomplete handoff creates downstream problems |
| Debrief/review steps | `skip_with_warning` | Output exists, review is supplementary |

### Validation Rule

Every entry in `workflow_shorthand` must have an `on_failure` field set to either `stop` or `skip_with_warning`. No step may omit this field.

---

## Automated Validation Script

Use this script to validate any agent definition file:

```python
import yaml, sys

def validate_error_handling(filepath):
    with open(filepath) as f:
        data = yaml.safe_load(f)

    issues = []
    agent_id = data.get('id', 'unknown')

    # Layer 1: Tool error_responses
    for tool in data.get('tools', []):
        tid = tool.get('id', '')
        if tid.startswith('read-'):
            ea = tool.get('x-ea-agent', {})
            if 'error_responses' not in ea:
                issues.append(f"Tool '{tid}' missing error_responses")
            else:
                codes = [r.get('error_code') for r in ea['error_responses']]
                if 'SOURCE_UNAVAILABLE' not in codes:
                    issues.append(f"Tool '{tid}' missing SOURCE_UNAVAILABLE error code")

    # Layer 2: Agent error_handling
    ext = data.get('x-ea-agent', {})
    if 'error_handling' not in ext:
        issues.append("Missing x-ea-agent.error_handling block")
    else:
        eh = ext['error_handling']
        tf = eh.get('tool_failures', {})
        declared = set(tf.get('critical', []) + tf.get('enrichment', []))
        read_tools = {t['id'] for t in data.get('tools', []) if t.get('id', '').startswith('read-')}
        missing = read_tools - declared
        if missing:
            issues.append(f"Tools not classified as critical or enrichment: {missing}")

    # Layer 3: Flow on_failure
    for flow in data.get('flows', []):
        fid = flow.get('id', '')
        for step in flow.get('x-ea-agent', {}).get('workflow_shorthand', []):
            snum = step.get('step', '?')
            if 'on_failure' not in step:
                issues.append(f"Flow '{fid}' step {snum} missing on_failure")
            elif step['on_failure'] not in ('stop', 'skip_with_warning'):
                issues.append(f"Flow '{fid}' step {snum} invalid on_failure: {step['on_failure']}")

    if issues:
        print(f"FAIL: {agent_id} ({len(issues)} issues)")
        for i in issues:
            print(f"  - {i}")
        return False
    else:
        print(f"PASS: {agent_id}")
        return True

if __name__ == '__main__':
    all_pass = all(validate_error_handling(f) for f in sys.argv[1:])
    sys.exit(0 if all_pass else 1)
```

Usage:

```bash
python validate_error_handling.py domain/agents/**/*-definition.yaml
```

---

## Signals Reference

Agents emit these signals when error handling triggers. Upstream consumers (orchestrators, monitoring) can subscribe to these for operational awareness.

| Signal | Emitted When | Severity |
|--------|-------------|----------|
| `SIG_CRITICAL_DATA_MISSING` | Critical tool fails, workflow stops | HIGH |
| `SIG_ENRICHMENT_UNAVAILABLE` | Enrichment tool fails, workflow continues degraded | MEDIUM |
| `SIG_STALE_DATA_USED` | Data exceeds freshness threshold | LOW |
| `SIG_STEP_SKIPPED` | Flow step skipped via `skip_with_warning` | MEDIUM |

---

## Checklist Summary

Use this as a final review gate for any new or modified agent definition:

- [ ] Every `read-*` tool has `error_responses` with at least `SOURCE_UNAVAILABLE`
- [ ] `x-ea-agent.error_handling` block exists between guardrails and autonomy
- [ ] `tool_failures.critical` + `tool_failures.enrichment` covers all `read-*` tools
- [ ] Critical/enrichment classification matches the agent's actual data dependencies
- [ ] Every `workflow_shorthand` step has `on_failure: stop` or `on_failure: skip_with_warning`
- [ ] Persist steps always use `on_failure: stop`
- [ ] Handoff steps always use `on_failure: stop`
- [ ] File passes YAML validation
- [ ] Automated validation script returns PASS
