# Process Definition Schema

**Version:** 1.0
**Date:** 2026-01-16

---

## Overview

This document defines the normalized schema that the Orchestration Agent uses internally. Human input can be in any format - the Process Parser converts it to this schema.

---

## Input Formats (Human Side)

The Orchestration Agent accepts process descriptions in any format:

### Format 1: Natural Language

```text
When we receive an RFP, the SA should analyze technical requirements
and create an architecture proposal within 5 days. If there's a
security section, InfoSec needs to review it first.
```

### Format 2: Bullet Points

```text
RFP Analysis Process:
- Trigger: New RFP received
- Owner: SA
- Steps:
  1. Extract technical requirements
  2. If security section exists → InfoSec review
  3. Create architecture proposal
- Deadline: 5 business days
- Output: Architecture proposal document
```

### Format 3: Tabular (Excel-like)

| Step | Action | Owner | Condition | Output | Deadline |
|------|--------|-------|-----------|--------|----------|
| 1 | Analyze requirements | SA | RFP received | Requirements list | 1 day |
| 2 | Security review | InfoSec | Has security section | Security signoff | 2 days |
| 3 | Create proposal | SA | Requirements + signoff | Architecture doc | 2 days |

### Format 4: YAML (Structured)

```yaml
name: RFP Analysis
trigger: new_rfp
owner: SA
steps:
  - analyze_requirements
  - security_review (if: has_security)
  - create_proposal
deadline: 5d
```

---

## Normalized Process Schema (System Side)

All inputs are parsed into this canonical format:

```yaml
# ==============================================================================
# PROCESS DEFINITION
# ==============================================================================

# Unique identifier (auto-generated or human-assigned)
process_id: "PROC_001"

# Human-readable name
name: "RFP Technical Analysis"

# Detailed description of what this process achieves
description: |
  Analyzes incoming RFPs for technical requirements and produces
  an architecture proposal. Includes security review when applicable.

# Version tracking
version: 1
created_at: "2026-01-16T10:00:00Z"
created_by: "human:ceo"
updated_at: "2026-01-16T10:00:00Z"
updated_by: "orchestration_agent"

# Status lifecycle
status: "active"  # draft | pending_approval | active | deprecated | archived

# ==============================================================================
# TRIGGER
# ==============================================================================

trigger:
  # Primary event that starts this process
  event: "rfp_received"

  # Additional conditions that must be true
  conditions:
    - field: "rfp.type"
      operator: "in"
      value: ["technical", "full"]

  # Optional: Only trigger for specific contexts
  scope:
    realm: "*"           # All accounts, or specific realm
    node: "*"            # All nodes, or specific node
    tier: ["enterprise", "strategic"]  # Account tiers

# ==============================================================================
# OWNERSHIP
# ==============================================================================

ownership:
  # Primary owner - accountable for outcome
  primary_owner:
    agent: "SA Agent"
    role: "executor"

  # Secondary participants
  collaborators:
    - agent: "InfoSec Agent"
      role: "reviewer"
      condition: "rfp.has_security_section == true"

    - agent: "AE Agent"
      role: "informed"
      condition: "always"

  # Escalation path if process stalls
  escalation:
    - level: 1
      to: "SA Lead"
      after: "3 days"
    - level: 2
      to: "Delivery Manager"
      after: "5 days"

# ==============================================================================
# STEPS
# ==============================================================================

steps:
  - step_id: "S1"
    name: "Extract Requirements"
    description: "Parse RFP and extract technical requirements"
    owner: "SA Agent"
    action: "analyze_document"

    inputs:
      - artifact: "rfp_document"
        source: "trigger.payload"

    outputs:
      - artifact: "requirements_list"
        path: "infohub/{realm}/{node}/rfp/requirements.yaml"
        format: "yaml"

    deadline:
      duration: "1 day"
      from: "trigger_time"

    success_criteria:
      - "requirements_list contains at least 3 items"
      - "all sections of RFP covered"

  - step_id: "S2"
    name: "Security Review"
    description: "InfoSec reviews security-related requirements"
    owner: "InfoSec Agent"
    action: "security_review"

    # Conditional execution
    condition:
      field: "rfp.has_security_section"
      operator: "=="
      value: true

    inputs:
      - artifact: "requirements_list"
        source: "S1.output"
      - artifact: "security_section"
        source: "rfp_document.security"

    outputs:
      - artifact: "security_signoff"
        path: "infohub/{realm}/{node}/rfp/security_review.md"
        format: "markdown"

    deadline:
      duration: "2 days"
      from: "S1.completed"

    success_criteria:
      - "security_signoff.status in ['approved', 'approved_with_conditions']"

  - step_id: "S3"
    name: "Create Architecture Proposal"
    description: "Develop architecture proposal based on requirements"
    owner: "SA Agent"
    action: "create_proposal"

    # Wait for dependencies
    depends_on:
      - step: "S1"
        required: true
      - step: "S2"
        required: false  # Only if S2 executed

    inputs:
      - artifact: "requirements_list"
        source: "S1.output"
      - artifact: "security_signoff"
        source: "S2.output"
        optional: true

    outputs:
      - artifact: "architecture_proposal"
        path: "infohub/{realm}/{node}/architecture/proposal_{date}.md"
        format: "markdown"
        sections:
          - executive_summary
          - technical_architecture
          - security_considerations
          - implementation_approach
          - timeline
          - risks

    deadline:
      duration: "2 days"
      from: "S1.completed"  # Can run in parallel with S2

    success_criteria:
      - "architecture_proposal exists"
      - "all required sections present"

# ==============================================================================
# OUTPUTS
# ==============================================================================

outputs:
  # Primary deliverable
  primary:
    artifact: "architecture_proposal"
    path: "infohub/{realm}/{node}/architecture/"

  # Secondary artifacts
  secondary:
    - artifact: "requirements_list"
      path: "infohub/{realm}/{node}/rfp/"
    - artifact: "security_signoff"
      path: "infohub/{realm}/{node}/rfp/"
      condition: "S2.executed"

  # Notifications
  notifications:
    - recipient: "AE Agent"
      event: "process_completed"
      message: "Architecture proposal ready for {node}"

    - recipient: "human:ceo"
      event: "deadline_missed"
      message: "RFP analysis for {node} is overdue"

# ==============================================================================
# CONSTRAINTS
# ==============================================================================

constraints:
  # Total process deadline
  deadline:
    duration: "5 business days"
    from: "trigger_time"
    action_on_breach: "escalate"

  # Resource constraints
  resources:
    max_parallel_executions: 5
    priority: "high"

  # Quality gates
  quality_gates:
    - gate: "requirements_complete"
      after_step: "S1"
      check: "requirements_list.count >= 3"
      action_on_fail: "pause"

    - gate: "security_approved"
      after_step: "S2"
      check: "security_signoff.status == 'approved'"
      action_on_fail: "escalate"

# ==============================================================================
# RELATIONSHIPS
# ==============================================================================

relationships:
  # Processes this one depends on
  depends_on: []

  # Processes that depend on this one's output
  triggers:
    - process: "PROC_005_proposal_review"
      condition: "output.architecture_proposal exists"

  # Related processes (informational)
  related:
    - "PROC_003_deal_qualification"
    - "PROC_007_competitive_analysis"

  # Conflicts with (detected by conflict detector)
  conflicts_with: []  # Populated by orchestration agent

# ==============================================================================
# METADATA
# ==============================================================================

metadata:
  # Source of this process definition
  source:
    format: "natural_language"
    original_text: |
      When we receive an RFP, the SA should analyze technical requirements
      and create an architecture proposal within 5 days...

  # Tags for categorization
  tags:
    - "presales"
    - "rfp"
    - "architecture"

  # Metrics tracking
  metrics:
    average_duration: null  # Populated after executions
    success_rate: null
    execution_count: 0

  # Audit trail reference
  audit_ref: "audit/2026-01-16.jsonl#PROC_001"
```

---

## Schema Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `process_id` | string | Unique identifier (PROC_XXX format) |
| `name` | string | Human-readable process name |
| `trigger.event` | string | Event that starts the process |
| `ownership.primary_owner.agent` | string | Agent accountable for outcome |
| `steps` | array | Ordered list of process steps |
| `outputs.primary` | object | Main deliverable of the process |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Detailed explanation |
| `trigger.conditions` | array | Additional trigger conditions |
| `ownership.collaborators` | array | Other agents involved |
| `constraints` | object | Deadlines, quality gates |
| `relationships` | object | Links to other processes |

### Step Fields

| Field | Type | Description |
|-------|------|-------------|
| `step_id` | string | Unique within process (S1, S2...) |
| `name` | string | Step name |
| `owner` | string | Agent executing this step |
| `action` | string | Action type or playbook reference |
| `inputs` | array | Required inputs |
| `outputs` | array | Produced artifacts |
| `condition` | object | Optional execution condition |
| `depends_on` | array | Steps that must complete first |
| `deadline` | object | Time constraint |

---

## Event Types

Standard events the trigger can listen for:

| Event | Description | Payload |
|-------|-------------|---------|
| `rfp_received` | New RFP document uploaded | `{rfp_document, customer, deadline}` |
| `deal_stage_changed` | Opportunity stage updated | `{deal_id, old_stage, new_stage}` |
| `meeting_completed` | Meeting notes processed | `{meeting_id, attendees, summary}` |
| `stakeholder_added` | New stakeholder identified | `{stakeholder, role, influence}` |
| `competitor_identified` | Competitor detected in deal | `{competitor, deal_id, context}` |
| `health_score_changed` | Customer health updated | `{customer_id, old_score, new_score}` |
| `deadline_approaching` | Deadline within threshold | `{entity_type, entity_id, deadline}` |
| `action_completed` | Action item closed | `{action_id, result}` |
| `risk_identified` | New risk logged | `{risk_id, severity, category}` |
| `custom:{event_name}` | User-defined event | `{...custom_payload}` |

---

## Condition Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equals | `deal.stage == "negotiation"` |
| `!=` | Not equals | `customer.tier != "trial"` |
| `>` | Greater than | `deal.value > 500000` |
| `>=` | Greater or equal | `health_score >= 70` |
| `<` | Less than | `days_to_close < 30` |
| `<=` | Less or equal | `risk.severity <= "medium"` |
| `in` | In list | `customer.industry in ["finance", "healthcare"]` |
| `not_in` | Not in list | `stage not_in ["closed_won", "closed_lost"]` |
| `contains` | String contains | `rfp.text contains "security"` |
| `exists` | Field exists | `customer.executive_sponsor exists` |
| `is_null` | Field is null | `deadline is_null` |

---

## Action Types

| Action | Description | Inputs | Outputs |
|--------|-------------|--------|---------|
| `analyze_document` | Extract information from document | document | structured_data |
| `create_proposal` | Generate proposal document | requirements | proposal_doc |
| `schedule_meeting` | Book meeting with stakeholders | attendees, topic | meeting_invite |
| `send_notification` | Notify human or agent | recipient, message | confirmation |
| `execute_playbook` | Run specific playbook | playbook_id, inputs | playbook_outputs |
| `create_artifact` | Generate document/file | template, data | artifact |
| `update_status` | Modify entity status | entity_id, new_status | confirmation |
| `escalate` | Raise to higher level | issue, to | escalation_record |
| `wait` | Pause for condition | condition, timeout | resume_event |
| `custom:{action}` | User-defined action | varies | varies |

---

## Example: Minimal Process

```yaml
process_id: "PROC_QUICK"
name: "Quick Win Identification"
trigger:
  event: "meeting_completed"
ownership:
  primary_owner:
    agent: "AE Agent"
steps:
  - step_id: "S1"
    name: "Scan for Quick Wins"
    owner: "AE Agent"
    action: "analyze_document"
    inputs:
      - artifact: "meeting_notes"
    outputs:
      - artifact: "quick_wins_list"
outputs:
  primary:
    artifact: "quick_wins_list"
```

---

## Parsing Examples

### Input: Natural Language

```text
"After every customer meeting, the CA should check if there are any
support tickets mentioned and create follow-up actions for unresolved ones."
```

### Output: Normalized Schema

```yaml
process_id: "PROC_AUTO_001"
name: "Meeting Support Ticket Follow-up"
description: "Check for support ticket mentions in meetings and create actions"
trigger:
  event: "meeting_completed"
ownership:
  primary_owner:
    agent: "CA Agent"
steps:
  - step_id: "S1"
    name: "Scan Meeting Notes"
    owner: "CA Agent"
    action: "analyze_document"
    inputs:
      - artifact: "meeting_notes"
    outputs:
      - artifact: "ticket_mentions"

  - step_id: "S2"
    name: "Create Follow-up Actions"
    owner: "CA Agent"
    action: "create_artifact"
    condition:
      field: "ticket_mentions.unresolved_count"
      operator: ">"
      value: 0
    inputs:
      - artifact: "ticket_mentions"
    outputs:
      - artifact: "follow_up_actions"
        path: "infohub/{realm}/{node}/actions/"

outputs:
  primary:
    artifact: "follow_up_actions"
```

---

**Next:** See [conflict-rules.md](conflict-rules.md) for conflict detection logic.
