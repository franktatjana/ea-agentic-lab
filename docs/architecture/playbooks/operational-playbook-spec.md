---
order: 2
---

# Operational Playbook Specification

**Version:** 1.0
**Date:** 2026-01-14
**Status:** Draft

---

## Overview

Operational playbooks are event-driven, tactical procedures that respond to signals, thresholds, or events. Unlike strategic assessment playbooks (which provide holistic synthesis), operational playbooks produce discrete artifacts or actions.

---

## Playbook Categories

| Category | Purpose | Execution | Value |
|----------|---------|-----------|-------|
| **Strategic Assessment** | Governance choreography | End-to-end, holistic | Synthesis for humans |
| **Operational** | Event response | Partial, repeatable | Discrete artifacts |

### Strategic Assessment Playbooks (Existing)

Keep unchanged. These are blueprint-like governance tools:

- PB_001: Three Horizons Analysis
- PB_101: TOGAF ADM
- PB_201: SWOT Analysis
- PB_301: Value Engineering
- PB_401: Customer Health Score
- PB_701: Porter's Five Forces

**Characteristics:**
- Serve humans first, agents second
- Value is end-to-end closure
- Require holistic synthesis
- Updateable based on context changes (customer or internal)

### Operational Playbooks (New)

Event-driven tactical procedures:

**Characteristics:**
- Triggered by events, signals, or thresholds
- Can run partially or repeatedly
- Produce clear artifacts or actions
- No holistic synthesis required
- Machine-executable

---

## Governance Rules (MUST NOT Violate)

Operational playbooks are validated by the Playbook Curator Agent against these rules:

### CAT-001: No Micro-Playbook Decomposition
Strategic playbooks (PB_xxx) must remain holistic. Do NOT split SWOT into 4 playbooks.

### CAT-002: No Governance-Tactical Mixing
Each step must be EITHER governance (analysis/judgment) OR tactical (automation).

**Violation Pattern:**
```yaml
# BAD: Mixing analysis and write in same playbook
steps:
  - action: "analyze"   # Governance: requires judgment
  - action: "write"     # Tactical: automation
```

**Correct Pattern:**
```yaml
# GOOD: Tactical only - read pre-computed data, notify, log
steps:
  - action: "read"      # Read existing analysis
  - action: "compute"   # Deterministic calculation
  - action: "notify"    # Send notification
  - action: "write"     # Log to operational folder
```

### CAT-003: No Direct Strategic Artifact Updates

**Allowed Destinations (Operational):**
- `{realm}/{node}/internal-infohub/actions/`
- `{realm}/{node}/internal-infohub/risks/`
- `{realm}/{node}/meetings/`
- `{realm}/{node}/external-infohub/decisions/`
- `{realm}/{node}/internal-infohub/governance/alerts/`
- `notification_queue`

**Forbidden Destinations (Strategic - only PB_xxx may write):**
- `{realm}/{node}/internal-infohub/frameworks/`
- `{realm}/{node}/internal-infohub/governance/health_score.yaml`
- `{realm}/{node}/external-infohub/value/`
- `{realm}/{node}/external-infohub/architecture/`

### CAT-004: Single Decision Authority

Each decision type has exactly ONE authoritative playbook:

| Decision Type | Authority | Other Playbooks |
|---------------|-----------|-----------------|
| Risk severity | OP_RSK_001 | Pass raw signals only |
| Action priority | OP_ACT_001 | Pass raw requests only |
| Escalation target | OP_ESC_001 | Trigger only |
| Health score | PB_401 | Read-only |

**Violation Example:**
```yaml
# BAD: OP_MTG_001 deciding risk severity
outputs:
  - name: "risks"
    type: "decision"  # WRONG - only OP_RSK_001 decides severity
```

**Correct Example:**
```yaml
# GOOD: OP_MTG_001 extracts signals, OP_RSK_001 classifies
outputs:
  - name: "risk_signals"
    type: "artifact"  # Raw signals, not decisions
```

---

## Operational Playbook Schema

```yaml
# Operational Playbook v1.0
playbook_id: "OP_XXX"
version: "1.0"
category: "operational"

# Metadata
metadata:
  name: "Human-readable name"
  description: "What this playbook does"
  owner_agent: "agent_id"           # Primary responsible agent
  participating_agents: []           # Supporting agents

# Trigger Definition
trigger:
  type: "event|signal|threshold|scheduled|manual"
  source: "Where the trigger originates"
  condition: "DLL condition that activates this playbook"

# Preconditions (must be true before execution)
preconditions:
  - condition: "DLL expression"
    error_message: "What to show if not met"

# Steps (sequential execution)
steps:
  - step_id: "step_1"
    name: "Step name"
    agent: "responsible_agent_id"
    action: "What the agent does"
    inputs:
      - name: "input_name"
        source: "jsonpath or literal"
    outputs:
      - name: "output_name"
        type: "artifact|decision|action|notification"
        destination: "where it goes"
    on_failure: "skip|stop|escalate"

# Outputs (what this playbook produces)
outputs:
  - output_id: "out_1"
    type: "artifact|decision|action|notification"
    format: "yaml|markdown|json"
    destination: "infohub path or channel"

# Escalation
escalation:
  condition: "When to escalate"
  target: "agent or human"
  message_template: "What to communicate"

# Completion
completion:
  success_criteria: "DLL expression"
  artifacts_required: []
  notification: "Who to notify on completion"
```

---

## Trigger Types

### 1. Event Triggers

React to discrete events:

```yaml
trigger:
  type: "event"
  source: "meeting_notes_agent"
  condition: "EVENT_TYPE == 'new_risk_identified'"
```

**Examples:**
- New risk identified in meeting
- Decision made requiring documentation
- Action item created
- Stakeholder change detected

### 2. Signal Triggers

React to patterns or indicators:

```yaml
trigger:
  type: "signal"
  source: "risk_radar_agent"
  condition: "$.signals.competitive_threat.strength > 0.7"
```

**Examples:**
- Competitive activity detected
- Sentiment shift in communications
- Engagement pattern change
- Budget signal (increase/decrease)

### 3. Threshold Triggers

React when metrics cross boundaries:

```yaml
trigger:
  type: "threshold"
  source: "health_score"
  condition: "$.governance.health_score.overall < 60"
```

**Examples:**
- Health score drops below threshold
- Risk count exceeds limit
- Overdue actions exceed threshold
- Value realization gap detected

### 4. Scheduled Triggers

Time-based execution:

```yaml
trigger:
  type: "scheduled"
  source: "cron"
  condition: "schedule == 'weekly_monday'"
```

**Examples:**
- Weekly digest generation
- Monthly QBR prep
- Quarterly business review
- Renewal countdown milestones

### 5. Manual Triggers

Human-initiated:

```yaml
trigger:
  type: "manual"
  source: "user"
  condition: "MANUAL_TRIGGER == true"
```

**Examples:**
- Ad-hoc report request
- Escalation investigation
- Deep-dive analysis request

---

## Step Actions

### Read Actions
```yaml
action: "read"
inputs:
  - name: "source"
    source: "$.infohub.risks.risk_register"
```

### Analyze Actions
```yaml
action: "analyze"
inputs:
  - name: "data"
    source: "$.context.meeting_notes"
  - name: "criteria"
    source: "$.playbook.analysis_criteria"
```

### Write Actions
```yaml
action: "write"
inputs:
  - name: "content"
    source: "$.steps.step_1.output"
  - name: "destination"
    source: "$.infohub.risks.risk_register"
```

### Notify Actions
```yaml
action: "notify"
inputs:
  - name: "recipient"
    source: "$.stakeholders.risk_owner"
  - name: "message"
    source: "$.templates.risk_notification"
```

### Escalate Actions
```yaml
action: "escalate"
inputs:
  - name: "target"
    source: "senior_manager_agent"
  - name: "context"
    source: "$.escalation.context"
```

---

## Output Types

### Artifact
Creates or updates a document:
```yaml
outputs:
  - output_id: "risk_entry"
    type: "artifact"
    format: "yaml"
    destination: "{realm}/{node}/internal-infohub/risks/risk_register.yaml"
```

### Decision
Records a decision:
```yaml
outputs:
  - output_id: "decision_record"
    type: "decision"
    format: "yaml"
    destination: "{realm}/{node}/external-infohub/decisions/decision_log.yaml"
```

### Action
Creates an action item:
```yaml
outputs:
  - output_id: "action_item"
    type: "action"
    format: "yaml"
    destination: "{realm}/{node}/internal-infohub/actions/action_tracker.yaml"
```

### Notification
Sends a notification:
```yaml
outputs:
  - output_id: "alert"
    type: "notification"
    format: "markdown"
    destination: "slack://channel_id"
```

---

## Failure Handling

Following our [tool design principles](../system/tool-design-principles.md), all error handling must be **actionable** - providing specific guidance rather than opaque error codes.

### Error Response Schema

All failures must produce actionable error messages:

```yaml
error_response:
  error_code: "string"                    # Machine-readable code
  error_type: "string"                    # Category of error
  message: "Human-readable description"   # What went wrong
  reason: "Why this error occurred"       # Root cause
  suggestions:                            # Actionable next steps
    - "First thing to try"
    - "Second thing to try"
    - "When to escalate"
  context:                                # Relevant state
    parameter_received: "what was passed"
    expected: "what was expected"
    current_state: "relevant system state"
  documentation_ref: "link to docs"       # Where to learn more
```

### Skip (with Warning)
Continue to next step but notify agent:
```yaml
on_failure:
  action: "skip"
  emit_signal: "SIG_PLAYBOOK_STEP_SKIPPED"
  agent_notification: |
    Step '{step_name}' was skipped due to: {error_reason}

    This may affect completeness of your analysis.
    Missing data: {missing_data_description}

    Suggestions:
    1. Continue with available data - results may be partial
    2. Manually gather the missing information
    3. Re-run after resolving the underlying issue
```

### Stop (with Guidance)
Halt playbook execution with actionable guidance:
```yaml
on_failure:
  action: "stop"
  error_response:
    error_code: "PRECONDITION_FAILED"
    message: "Cannot proceed - required data missing"
    reason: "{specific_missing_requirement}"
    suggestions:
      - "Verify the node has been properly initialized"
      - "Check if required artifacts exist using 'get_node_context'"
      - "Create missing artifacts before re-running this playbook"
    context:
      required: "{what_was_required}"
      available: "{what_was_found}"
      missing: "{what_is_missing}"
```

### Escalate (with Context)
Escalate and continue or stop:
```yaml
on_failure:
  action: "escalate"
  escalation:
    target: "senior_manager_agent"
    message_template: |
      Step {step_id} failed in playbook {playbook_id}

      Error: {error_message}
      Impact: {impact_description}

      Context:
      - Node: {realm_id}/{node_id}
      - Step was trying to: {step_description}
      - Data available: {data_summary}

      Recommended actions:
      1. {recommendation_1}
      2. {recommendation_2}
    include_trace: true
    continue_after: false  # or true to continue after escalation
```

### Retry (with Backoff)
Retry the operation with exponential backoff:
```yaml
on_failure:
  action: "retry"
  max_attempts: 3
  backoff:
    initial_delay_ms: 1000
    multiplier: 2
    max_delay_ms: 10000
  on_final_failure: "escalate"
  retry_message: |
    Attempt {attempt} of {max_attempts} failed.
    Retrying in {delay_ms}ms...

    If this keeps failing, possible causes:
    1. {possible_cause_1}
    2. {possible_cause_2}
```

### Truncation Guidance

When results exceed limits, guide the agent to narrow the query:

```yaml
truncation_handling:
  max_items: 50
  on_truncate:
    action: "return_with_guidance"
    response:
      items_returned: "{actual_count}"
      total_available: "{total_count}"
      truncated: true
      guidance: |
        Showing first {actual_count} of {total_count} items.

        To narrow results:
        - Add severity_filter: ['critical', 'high'] to focus on urgent items
        - Add category_filter: ['{suggested_category}'] for specific types
        - Add date_filter: 'last_7d' for recent items only

        Avoid requesting all items unless absolutely necessary.
```

---

## Naming Convention

**Format:** `OP_[CATEGORY]_[NUMBER]_[action].yaml`

**Categories:**
- `RSK` - Risk management
- `ACT` - Action management
- `DEC` - Decision management
- `MTG` - Meeting processing
- `REP` - Reporting
- `ESC` - Escalation
- `VAL` - Value tracking
- `HLT` - Health monitoring

**Examples:**
- `OP_RSK_001_register_new_risk.yaml`
- `OP_ACT_001_create_action_item.yaml`
- `OP_MTG_001_process_meeting_notes.yaml`
- `OP_ESC_001_escalate_blocked_action.yaml`

---

## Relationship to Strategic Playbooks

```
Strategic Assessment Playbook
         │
         │ may trigger
         ▼
Operational Playbook(s)
         │
         │ produces
         ▼
    Artifacts
```

**Example Flow:**
1. PB_201 (SWOT) identifies a critical threat
2. Triggers OP_RSK_001 (Register New Risk)
3. OP_RSK_001 creates risk entry in risk_register.yaml
4. Threshold breach triggers OP_ESC_001 (Escalate)
5. OP_ESC_001 notifies Senior Manager

---

## Implementation Notes

1. **Operational playbooks run in the existing engine** - Same DLL evaluator, evidence validator
2. **Steps are atomic** - Each step succeeds or fails independently
3. **Outputs are deterministic** - Same inputs → same outputs
4. **Agents have defined roles** - owner_agent is accountable, participating_agents support
5. **Escalation is explicit** - Clear paths, never silent failure
