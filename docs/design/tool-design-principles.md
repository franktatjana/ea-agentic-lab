# Tool Design Principles for AI Agents

**Version:** 1.0
**Date:** 2026-01-22
**Status:** Production Ready

---

## Core Philosophy

> "Quality over quantity. More tools don't automatically improve outcomes."

Tools should be **thoughtful, high-impact affordances** rather than direct API wrappers. Each tool must be designed from the agent's perspective, not the system's.

---

## Architecture Analysis: Current State

### What We Have

| Component | Current Design | Tool Principles Alignment |
|-----------|----------------|--------------------------|
| **Strategic Playbooks** | PB_xxx holistic analysis | Good - consolidated, high-impact |
| **Operational Playbooks** | OP_xxx event-driven procedures | Good - clear triggers, discrete outputs |
| **Decision Logic Language** | JSONPath + operators | Needs improvement - complex syntax |
| **InfoHub Access** | Direct file paths | Needs improvement - not agent-friendly |
| **Error Handling** | skip/stop/escalate | Needs improvement - not actionable |
| **Output Contracts** | Structured YAML/Markdown | Good - semantic fields |

### Gaps Identified

1. **Parameter Naming**: Some playbook parameters use ambiguous names
2. **Response Format Control**: No way for agents to request concise vs. detailed
3. **Error Messages**: Opaque conditions without actionable guidance
4. **Context Efficiency**: Full artifacts loaded when summaries would suffice
5. **Tool Consolidation**: Some operations fragmented across multiple playbooks

---

## 1. Tool Selection and Scope

### Principle: Consolidation Over Proliferation

**Problem Pattern:**
```yaml
# BAD: Three separate tools for related operations
- read_risk_register
- add_risk_to_register
- update_risk_severity

# GOOD: One consolidated tool
- manage_risks:
    operations: [read, add, update, archive]
    response_format: summary | full
```

### Recommended Tool Consolidation

| Instead Of | Consolidate To | Rationale |
|------------|----------------|-----------|
| `read_stakeholders` + `get_champion` + `find_blocker` | `get_stakeholder_context` | Returns all relationship info at once |
| `get_health_score` + `get_risks` + `get_actions` | `get_node_overview` | Single call for account context |
| `search_decisions` + `get_decision_detail` | `query_decisions` | Returns relevant entries with detail level control |

### Implementation: Node Context Tool

```yaml
# tools/node_context_tool.yaml
tool_id: "get_node_context"
name: "Get Node Context"
description: |
  Retrieves comprehensive context for a node including health score,
  active risks, pending actions, and recent decisions. Use this as
  your first step when starting work on any node-related task.

parameters:
  - name: realm_id
    type: string
    required: true
    description: "The realm identifier (e.g., 'ACME')"

  - name: node_id
    type: string
    required: true
    description: "The node identifier (e.g., 'SECURITY_CONSOLIDATION')"

  - name: detail_level
    type: enum
    required: false
    default: standard
    options: [summary, standard, full]
    description: |
      - summary: Health score + counts only (~200 tokens)
      - standard: Key details for each category (~1500 tokens)
      - full: Complete artifacts (~5000 tokens)

  - name: include_sections
    type: array
    required: false
    default: [health, risks, actions]
    options: [health, risks, actions, decisions, stakeholders, opportunities]
    description: "Sections to include in response"

  - name: time_horizon
    type: enum
    required: false
    default: recent
    options: [recent, month, quarter, all]
    description: "How far back to include items (recent = 14 days)"

returns:
  type: object
  properties:
    overview:
      type: object
      description: "Node name, status, last updated"
    health_score:
      type: object
      description: "Overall score, component scores, trend"
    risks:
      type: array
      description: "Active risks matching criteria"
    actions:
      type: array
      description: "Pending actions matching criteria"
    decisions:
      type: array
      description: "Recent decisions if included"
    stakeholders:
      type: array
      description: "Key stakeholders if included"
    token_count:
      type: integer
      description: "Estimated tokens in response"
```

---

## 2. Parameter Design Best Practices

### Unambiguous Naming

| Ambiguous | Clear | Reason |
|-----------|-------|--------|
| `user` | `user_id` | Explicit that we need the ID, not name |
| `account` | `realm_id` | Matches our domain model |
| `date` | `due_date` or `created_after` | Specifies which date |
| `status` | `risk_status` or `action_status` | Avoids ambiguity |
| `priority` | `action_priority` | Context-specific |

### Response Format Control

Every tool that returns data should support detail level:

```yaml
# Standard parameter for all data-returning tools
- name: detail_level
  type: enum
  default: standard
  options:
    - summary      # IDs, names, status only
    - standard     # Key fields, truncated descriptions
    - full         # Complete artifact
  description: |
    Controls response verbosity. Use 'summary' for listings,
    'standard' for working context, 'full' for deep analysis.
```

### Sensible Defaults

```yaml
# Pagination with sensible defaults
- name: limit
  type: integer
  default: 10
  max: 50
  description: "Maximum items to return (default: 10, max: 50)"

# Filtering with reasonable defaults
- name: severity_filter
  type: array
  default: [critical, high, medium]
  description: "Risk severities to include (excludes 'low' by default)"

# Date ranges with relative defaults
- name: since
  type: string
  default: "14d"  # 14 days ago
  description: "Include items from this time (e.g., '14d', '1m', '2026-01-01')"
```

---

## 3. Output Formatting Guidelines

### Prioritize Semantic Meaning

**Before (System-Oriented):**
```json
{
  "risk_id": "RSK_2026_01_001",
  "severity": 3,
  "probability": 2,
  "created": "2026-01-22T10:30:00Z",
  "owner_id": "usr_sa_001"
}
```

**After (Agent-Oriented):**
```json
{
  "risk_id": "RSK_2026_01_001",
  "title": "Competitive displacement by LegacySIEM",
  "severity": "high",
  "severity_label": "High - Requires immediate attention",
  "probability": "likely",
  "impact_description": "$720K ARR at risk if not mitigated",
  "created": "2026-01-22",
  "created_relative": "today",
  "owner": "SA Agent (you)",
  "owner_id": "usr_sa_001",
  "action_required": "Create mitigation plan by 2026-01-29"
}
```

### Human-Readable Labels Rule

Every output must include human-readable versions of:
- IDs (include title/name alongside)
- Enum values (include label)
- Timestamps (include relative time)
- Numeric scores (include interpretation)

```yaml
# Output formatting standard
output_formatting:
  identifiers:
    rule: "Always include human-readable title alongside ID"
    example:
      bad: { "stakeholder_id": "stk_001" }
      good: { "stakeholder_id": "stk_001", "stakeholder_name": "Sarah Chen (CTO)" }

  enums:
    rule: "Include both value and label"
    example:
      bad: { "severity": 3 }
      good: { "severity": "high", "severity_label": "High - Requires immediate attention" }

  timestamps:
    rule: "Include both absolute and relative"
    example:
      bad: { "due": "2026-01-29T00:00:00Z" }
      good: { "due": "2026-01-29", "due_relative": "in 7 days", "overdue": false }

  scores:
    rule: "Include interpretation"
    example:
      bad: { "health_score": 65 }
      good: { "health_score": 65, "health_status": "yellow", "interpretation": "At risk - needs attention" }
```

### Context Truncation With Reference

When truncating large outputs:

```yaml
# Include reference to full content
truncation_pattern:
  description_truncated: "First 200 characters..."
  full_content_ref: "infohub/ACME/SECURITY/risks/RSK_001.yaml"
  full_content_hint: "Use 'read_artifact' tool to get full content if needed"
```

---

## 4. Error Handling Patterns

### Actionable Error Messages

**Before (Opaque):**
```
Error: Condition evaluation failed
Code: DLL_EVAL_001
```

**After (Actionable):**
```
Error: Cannot evaluate condition '$.risks[?(@.severity=='HIGH')].length > 0'

Reason: The risks array is empty for this node.

Suggestions:
1. Check if risks have been registered for ACME/SECURITY_CONSOLIDATION
2. Run 'get_node_context' to see current node state
3. If this is a new node, risks may not exist yet - this is expected

Context loaded:
- Node: ACME/SECURITY_CONSOLIDATION
- Risk count: 0
- Last risk scan: Never
```

### Error Message Schema

```yaml
# Standard error response format
error_response:
  error_code: "string"
  error_type: "string"
  message: "Human-readable description of what went wrong"
  reason: "Why this error occurred"
  suggestions:
    - "First thing to try"
    - "Second thing to try"
    - "When to escalate"
  context:
    parameter_received: "what was passed"
    expected: "what was expected"
    current_state: "relevant system state"
  documentation_ref: "link to relevant docs"
```

### Steering Behavior on Truncation

When results are truncated, guide the agent:

```yaml
# Response when results are truncated
truncation_response:
  items_returned: 10
  total_available: 47
  truncated: true
  guidance: |
    Showing first 10 of 47 risks. To narrow results:
    - Add severity_filter: ['critical', 'high'] to focus on urgent items
    - Add category_filter: ['competitive'] to focus on specific type
    - Add owner_filter: 'sa_agent' to see only your owned risks

    Avoid requesting all items unless absolutely necessary.
```

---

## 5. Documentation Requirements

### Tool Description as Steering Mechanism

Tool descriptions directly influence agent behavior. Write them from the agent's perspective:

**Before (System Description):**
```yaml
description: "Retrieves risk register entries from InfoHub"
```

**After (Steering Description):**
```yaml
description: |
  Retrieves active risks for a node. Use this tool when you need to:
  - Understand current risk posture before making recommendations
  - Check if a potential risk is already registered
  - Find risks that need your attention as SA Agent

  Returns risks sorted by severity (critical first). By default, excludes
  'resolved' and 'accepted' risks. Include detail_level='summary' when
  listing many risks, 'full' only when deep-diving into specific risks.

  Note: For competitive risks, also check 'get_competitive_context' which
  has additional competitive intelligence not in the risk register.
```

### Implicit Knowledge Made Explicit

Document what specialists know but agents might not:

```yaml
# In operational playbook documentation
implicit_knowledge:
  - term: "P0 action"
    meaning: "Highest priority action, typically blocking customer progress or revenue"
    agent_guidance: "P0 actions should be addressed before any other work"

  - term: "Health score yellow"
    meaning: "Score between 50-70, indicates elevated risk"
    agent_guidance: "Yellow accounts need proactive outreach within 7 days"

  - term: "Champion departure"
    meaning: "Key sponsor leaving the customer organization"
    agent_guidance: "Triggers immediate stakeholder mapping refresh and risk assessment"

  - term: "Tech signal map Hold ring"
    meaning: "Technology the customer is moving away from"
    agent_guidance: "Displacement opportunity if we have competing offering"
```

### Best Practices Reference

Every playbook should reference relevant best practices:

```yaml
# In playbook header
best_practices_ref:
  tool_design: "docs/design/tool-design-principles.md"
  context_engineering: "docs/design/context-engineering.md"
  evidence_standards: "docs/playbooks/playbook-execution-specification.md#evidence"
```

---

## 6. Anti-Patterns to Avoid

### Anti-Pattern 1: Direct API Wrapping

**Bad:**
```yaml
# Wrapping every InfoHub operation as a tool
tools:
  - read_yaml_file
  - write_yaml_file
  - list_directory
  - search_files
```

**Good:**
```yaml
# High-level affordances
tools:
  - get_node_context       # Reads and assembles relevant context
  - register_risk          # Creates risk with proper validation
  - update_action_status   # Updates with audit trail
  - query_decisions        # Searches with filtering
```

### Anti-Pattern 2: Ambiguous Tool Names

**Bad:**
```yaml
tools:
  - get_data              # What data?
  - update                # Update what?
  - process               # Process how?
  - handle_request        # What kind of request?
```

**Good:**
```yaml
tools:
  - get_node_health_score
  - update_action_status
  - process_meeting_notes
  - escalate_blocked_action
```

### Anti-Pattern 3: Context Waste

**Bad:**
```yaml
# Returns everything, agent must parse
get_all_risks:
  returns: "Complete risk register with all historical data"
  typical_size: "5000+ tokens"
```

**Good:**
```yaml
# Returns relevant subset with control
query_risks:
  parameters:
    - status: [open]           # Only active
    - severity: [critical, high]  # Only urgent
    - limit: 10                # Bounded
    - detail_level: summary    # Compressed
  typical_size: "500 tokens"
```

### Anti-Pattern 4: Silent Failure

**Bad:**
```yaml
on_failure: "skip"  # Continue silently
```

**Good:**
```yaml
on_failure:
  action: "continue_with_warning"
  emit_signal: "SIG_PLAYBOOK_STEP_SKIPPED"
  log_message: "Step {step_id} skipped: {error_message}"
  agent_notification: |
    Step '{step_name}' was skipped due to: {error_reason}
    This may affect the completeness of your analysis.
    Consider: {remediation_suggestion}
```

---

## Implementation Checklist

### For New Playbooks

- [ ] **Tool Scope**: Does this need to be a separate playbook or can it consolidate with existing?
- [ ] **Parameter Names**: Are all parameters unambiguous?
- [ ] **Detail Levels**: Does output support summary/standard/full?
- [ ] **Output Format**: Are IDs accompanied by human-readable labels?
- [ ] **Error Messages**: Are errors actionable with suggestions?
- [ ] **Description**: Does tool description steer agent behavior?
- [ ] **Implicit Knowledge**: Is domain knowledge made explicit?
- [ ] **Context Efficiency**: Does it respect token budgets?

### For Existing Playbooks

- [ ] Review parameter names against naming conventions
- [ ] Add detail_level parameter to data-returning operations
- [ ] Add human-readable labels to all output objects
- [ ] Rewrite error messages to be actionable
- [ ] Enhance tool descriptions with steering guidance
- [ ] Document implicit knowledge assumptions

### Validation Rules

Add to `config/playbook_validation.yaml`:

```yaml
tool_design_validation:
  # Parameter naming
  - rule: "parameter_names_explicit"
    pattern: "^(user|account|date|status|priority)$"
    action: "warn"
    message: "Consider more explicit name (e.g., 'user_id', 'realm_id', 'due_date')"

  # Output formatting
  - rule: "ids_have_labels"
    check: "All *_id fields have corresponding *_name or *_title"
    action: "error"

  # Error handling
  - rule: "actionable_errors"
    check: "All error responses include 'suggestions' array"
    action: "warn"

  # Documentation
  - rule: "steering_description"
    min_length: 100
    must_include: ["Use this tool when", "Returns"]
    action: "warn"
```

---

## Configuration

Main configuration file: [config/tool_design.yaml](../../config/tool_design.yaml)

Key sections:
- `naming_conventions` - Standard parameter names
- `detail_levels` - Summary/standard/full definitions
- `error_templates` - Actionable error message templates
- `output_formatting` - Human-readable label requirements
- `validation_rules` - Automated validation checks

---

## Related Documentation

- [Context Engineering](context-engineering.md) - Token budgets, freshness tracking
- [Prompt Engineering Principles](prompt-engineering-principles.md) - Prompting techniques (CoT, ReAct, etc.)
- [Playbook Execution Specification](playbook-execution-specification.md) - Execution model
- [Operational Playbook Specification](../playbooks/operational-playbook-spec.md) - Event-driven procedures
- [Output Contract](output-contract.md) - Artifact format standards
