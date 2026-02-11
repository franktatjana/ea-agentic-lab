---
order: 4
---

# Context Engineering

**Version:** 1.0
**Date:** 2026-01-22
**Status:** Production Ready

---

## Core Principles

Context is a **precious, finite resource**. Every token depletes the model's capacity for long-range reasoning.

| Principle | Implementation |
|-----------|----------------|
| **Minimal viable tokens** | Smallest set of high-signal tokens that maximize desired outcome |
| **Progressive disclosure** | Load lightweight IDs first, fetch details on demand |
| **Context rot awareness** | Performance degrades as context fills; track freshness |
| **Structured external memory** | Persistent notes outside context window |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTEXT ENGINEERING STACK                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ Context Budget  │    │  Scratchpad     │    │  Freshness      │         │
│  │ Manager         │    │  (Working Mem)  │    │  Tracker        │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     AGENT CONTEXT WINDOW                         │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │       │
│  │  │ System   │  │ InfoHub  │  │ Tool     │  │ Working  │        │       │
│  │  │ Prompt   │  │ Context  │  │ Results  │  │ Memory   │        │       │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │       │
│  │       ↑              ↑              ↑              ↑            │       │
│  │       │              │              │              │            │       │
│  │  ┌────┴────────────────────────────────────────────┴────┐      │       │
│  │  │              Context Priority Rules                   │      │       │
│  │  │  1. Critical risks  2. P0 actions  3. Recent decisions│      │       │
│  │  └──────────────────────────────────────────────────────┘      │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                         INFOHUB                                  │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │       │
│  │  │ Artifacts│  │ Agent    │  │ Patterns │  │ Archives │        │       │
│  │  │          │  │ Work     │  │          │  │          │        │       │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Agent Scratchpads

### Purpose

External working memory for intermediate reasoning. Enables long-horizon task coherence without consuming context window.

### Storage Structure

```
{realm}/{node}/internal-infohub/agent_work/
├── scratchpad_sa_2026-01-22_discovery.yaml
├── scratchpad_ae_2026-01-22_account_planning.yaml
└── archived/
    └── scratchpad_sa_2026-01-15_poc_prep.yaml
```

### Scratchpad Schema

```yaml
session:
  session_id: "uuid"
  agent_id: "sa_agent"
  task_type: "analysis | playbook_execution | meeting_prep"
  status: "active | completed | abandoned"

working_notes:
  - timestamp: "ISO 8601"
    note_type: "observation | hypothesis | question | conclusion"
    content: "Note content"
    confidence: 0.0-1.0
    evidence_refs: []
    resolved: false

open_questions:
  - question_id: "q_001"
    question: "Question text"
    blocking: true/false
    answered_at: null
    answer: null

interim_conclusions:
  - conclusion_id: "c_001"
    conclusion: "Conclusion statement"
    confidence: 0.85
    supporting_evidence: []
    contradicting_evidence: []
    status: "tentative | confirmed | revised"

context_loaded:
  total_tokens_loaded: 4850
  budget_remaining: 10150
  artifacts: []
```

### Benefits

| Benefit | Description |
|---------|-------------|
| **Reasoning persistence** | Capture thought evolution across multi-step tasks |
| **Confidence tracking** | Explicit uncertainty quantification |
| **Evidence linking** | Every conclusion traces to sources |
| **Context efficiency** | Full reasoning available without loading into context |

### Usage Example

See: [Example Scratchpad](../../../vault/ACME_CORP/SECURITY_CONSOLIDATION/internal-infohub/agent_work/scratchpad_sa_2026-01-22_displacement_analysis.yaml)

---

## 2. Context Budgets

### Per-Agent Token Limits

Each agent has a maximum context budget with priority allocations:

| Agent | Max Tokens | Top Priorities |
|-------|------------|----------------|
| SA Agent | 15,000 | Technical architecture, deployment, risks |
| AE Agent | 12,000 | Opportunities, stakeholders, commercial |
| CA Agent | 12,000 | Adoption journey, health, success plan |
| VE Agent | 10,000 | Value hypothesis, ROI, outcomes |
| CI Agent | 8,000 | Competitive landscape, tech signals |
| Governance | 8,000 | Health scores, risks, escalations |

### Truncation Rules

When context exceeds budget:

```yaml
# Always keep (never truncate)
always_keep:
  - active_critical_risks
  - pending_p0_actions
  - current_session_context
  - active_escalations

# Priority order for remaining context
priority_order:
  1. active_risks (keep 10, severity high/critical)
  2. pending_actions (keep 15, P0/P1 or overdue)
  3. recent_decisions (keep 10, < 30 days)
  4. stakeholders (keep 10, high influence)
  5. meeting_notes (keep 5, < 14 days)
```

### Summarization Before Drop

```yaml
# Compress rather than drop when possible
summarize_before_drop:
  - category: meeting_notes
    threshold: 5
    format: "3-line digest per meeting"

  - category: decisions
    threshold: 10
    format: "decision_id, title, date, status only"
```

---

## 3. Data Freshness Tracking

### Freshness Metadata

Every artifact should include:

```yaml
metadata:
  created_at: "2026-01-15T10:00:00Z"
  last_updated: "2026-01-22T14:30:00Z"
  last_verified: "2026-01-22T14:30:00Z"
  data_age_days: 7
  freshness_status: "current"  # current | verify | stale
  next_refresh_due: "2026-01-29"
  verified_by: "sa_agent"
```

### Freshness Thresholds by Category

| Category | Current | Verify | Stale |
|----------|---------|--------|-------|
| Health scores | < 1 day | 1-3 days | > 7 days |
| Risks | < 7 days | 7-14 days | > 30 days |
| Actions | < 3 days | 3-7 days | > 14 days |
| Decisions | < 30 days | 30-90 days | > 365 days |
| Stakeholders | < 30 days | 30-90 days | > 180 days |
| Tech signal map | < 30 days | 30-60 days | > 90 days |
| Meeting notes | < 7 days | 7-30 days | > 90 days |

### Agent Behavior on Freshness

| Status | Agent Behavior |
|--------|----------------|
| **Current** | Use directly |
| **Verify** | Flag for human review before critical decisions |
| **Stale** | Do not use without refresh; suggest update |

---

## 4. Hierarchical Summarization

### Four Levels

| Level | Name | Token Budget | Use When |
|-------|------|--------------|----------|
| 1 | Full Detail | Unlimited | Deep analysis, playbook execution |
| 2 | Standard Summary | ~500/artifact | Regular agent context |
| 3 | Digest | ~50/artifact | Context overflow, listings |
| 4 | Count Only | ~10/category | Dashboard, high-level overview |

### Auto-Level Selection

```yaml
# Automatic selection based on remaining budget
rules:
  - condition: "remaining_budget > 80%"
    default_level: "level_2_standard"

  - condition: "remaining_budget > 50%"
    default_level: "level_2_standard"
    downgrade_old_to: "level_3_digest"

  - condition: "remaining_budget > 20%"
    default_level: "level_3_digest"
    critical_items: "level_2_standard"

  - condition: "remaining_budget <= 20%"
    default_level: "level_4_count"
    critical_items: "level_3_digest"
```

---

## 5. Tool Result Handling

### Compression After Execution

| Tool Type | Keep in Context | Full Results |
|-----------|-----------------|--------------|
| Search | Top 5 with snippets | Reference to full results |
| File read | Relevant sections only | Reference to file path |
| Playbook | Summary + key outputs | Reference to execution log |
| API call | Parsed response summary | Reference to response cache |

### Result Caching

```yaml
caching:
  enabled: true
  duration: "1 hour"
  key: "tool_type + inputs_hash"
  invalidation:
    - explicit request
    - source data changed
    - duration exceeded
```

---

## 6. Compaction Strategies

### When to Compact

Compaction summarizes conversation contents when approaching context limits, then continues with compressed summary.

```yaml
compaction:
  triggers:
    - condition: "context_usage > 80%"
      action: "tool_result_clearing"
    - condition: "context_usage > 90%"
      action: "conversation_compaction"
    - condition: "task_completed"
      action: "archive_to_scratchpad"

  # What to PRESERVE during compaction
  preserve:
    high_priority:
      - "Architectural decisions made"
      - "Unresolved issues and blockers"
      - "Current task state and next steps"
      - "Key evidence cited in conclusions"
    medium_priority:
      - "Summary of analysis performed"
      - "Confidence levels stated"
      - "Open questions remaining"
    low_priority:
      - "Exploration paths tried"
      - "Intermediate reasoning steps"

  # What to DISCARD
  discard:
    - "Redundant tool outputs (keep references only)"
    - "Exploratory queries that led nowhere"
    - "Verbose raw data (keep summaries)"
    - "Repeated context from earlier messages"
```

### Tool Result Clearing

A lightweight compaction form - remove raw tool results from deep message history:

```yaml
tool_result_clearing:
  description: "Remove verbose tool outputs while keeping summaries"

  # Keep recent results, clear older ones
  retention:
    recent_messages: 10  # Keep full results for last 10 messages
    older_messages: "summary_only"  # Replace with summaries

  # What to keep vs. clear
  result_handling:
    file_reads:
      keep: "File path + relevant excerpt (max 500 chars)"
      clear: "Full file contents"
    search_results:
      keep: "Top 3 results with snippets"
      clear: "Full result list"
    api_responses:
      keep: "Parsed key values"
      clear: "Raw JSON response"
    playbook_outputs:
      keep: "Summary + final artifacts"
      clear: "Intermediate step outputs"
```

### Conversation Compaction

Full conversation summarization for long-horizon tasks:

```yaml
conversation_compaction:
  trigger: "context_usage > 90%"

  output_format: |
    ## Compacted Session Summary

    ### Task Context
    - Original goal: {goal}
    - Current status: {status}
    - Progress: {percentage}%

    ### Key Decisions Made
    {decisions_list}

    ### Unresolved Issues
    {issues_list}

    ### Current State
    - Working on: {current_task}
    - Next steps: {next_steps}
    - Blockers: {blockers}

    ### Evidence Summary
    {key_evidence_with_refs}

  # Quality balance
  optimization:
    recall_target: 0.95  # Capture 95% of relevant info
    precision_target: 0.80  # Allow 20% compression loss
```

---

## 7. Sub-Agent Architectures

### When to Use Sub-Agents

Specialized sub-agents handle focused tasks with clean context windows, returning condensed summaries to the main agent.

```yaml
sub_agent_pattern:
  use_when:
    - "Task requires deep exploration of narrow topic"
    - "Main context window is constrained"
    - "Multiple parallel investigations needed"
    - "Clear separation of concerns improves reliability"

  avoid_when:
    - "Task is simple and quick"
    - "Context sharing is critical"
    - "Overhead outweighs benefit"
```

### Sub-Agent Contract

```yaml
sub_agent_contract:
  input:
    task_description: "Focused task to accomplish"
    context_provided: "Minimal necessary context"
    output_format: "Expected output structure"
    token_budget: 8000  # Sub-agent has smaller budget

  output:
    summary: "1000-2000 token condensed summary"
    key_findings: []
    recommendations: []
    confidence: 0.0-1.0
    artifacts_created: []  # References, not full content

  constraints:
    max_tokens_returned: 2000
    must_include:
      - "Answer to specific question"
      - "Confidence level"
      - "Key evidence references"
```

### EA Agentic Lab Sub-Agent Mappings

| Main Agent | Sub-Agent Use Case | Returns |
|------------|-------------------|---------|
| SA Agent | Deep technical analysis of specific component | Architecture summary + risks |
| AE Agent | Stakeholder research for specific person | Profile + engagement recommendation |
| VE Agent | Industry benchmark research | Benchmark data + comparison |
| CI Agent | Competitor deep-dive | Competitive position summary |

### Example: SA Agent with Technical Sub-Agent

```yaml
# Main SA Agent delegates deep analysis
delegation:
  main_agent: "sa_agent"
  sub_agent: "technical_deep_dive"

  task: "Analyze search cluster sizing for ACME"
  context_passed:
    - "ACME deployment: 50 nodes, 10TB data"
    - "Use case: Security analytics"
    - "Question: Is current sizing adequate?"

  # Sub-agent explores extensively but returns summary
  sub_agent_output:
    summary: |
      Current sizing is inadequate for planned growth.
      - Current: 50 nodes, 10TB
      - Projected need: 75 nodes, 25TB (18 months)
      - Key bottleneck: Heap pressure during peak ingest

    recommendations:
      - "Increase heap to 31GB per node"
      - "Add 10 hot nodes before Q3"
      - "Implement ILM for cold tier"

    confidence: 0.85
    evidence_refs:
      - "sizing_calculator_output.yaml"
      - "benchmark_comparison.md"

  # Main agent receives condensed context
  main_agent_receives: 450  # tokens
  sub_agent_explored: 12000  # tokens (not transferred)
```

---

## 8. Cross-Node Learning

### Pattern Storage

```
vault/knowledge/patterns/
├── deployment_patterns.yaml
├── risk_patterns.yaml
└── success_patterns.yaml
```

### Pattern Schema

```yaml
patterns:
  - pattern_id: "pat_001"
    type: "deployment_pattern"
    description: "20+ site deployments need 6-month timeline"
    conditions:
      - "site_count >= 20"
      - "deployment_type == 'distributed'"
    recommendation: "Plan 6-month implementation"
    confidence: 0.85
    evidence_count: 5
    source_nodes: ["anonymized"]
```

### Pattern Application

- Auto-suggest when conditions match
- Confidence threshold: 0.7
- Minimum evidence: 3 nodes

---

## Implementation Checklist

### Configuration

- [x] `config/context_engineering.yaml` - Main configuration
- [x] Context budgets per agent
- [x] Truncation priority rules
- [x] Freshness thresholds
- [ ] Compaction trigger thresholds
- [ ] Sub-agent token budgets

### Templates

- [x] `playbooks/templates/agent_scratchpad_template.yaml`
- [ ] Freshness metadata template (add to existing templates)
- [ ] Pattern sharing template
- [ ] Compaction summary template
- [ ] Sub-agent contract template

### Examples

- [x] Example scratchpad (SA displacement analysis)
- [ ] Example freshness-tagged artifacts
- [ ] Example cross-node pattern
- [ ] Example compacted session summary
- [ ] Example sub-agent delegation

### Integration

- [ ] Playbook executor scratchpad integration
- [ ] Context budget enforcement in agent base class
- [ ] Freshness checker utility
- [ ] Pattern matching service
- [ ] Tool result clearing mechanism
- [ ] Conversation compaction service
- [ ] Sub-agent orchestration framework

---

## Configuration Reference

Main configuration file: [config/context_engineering.yaml](../../../domain/prompts/context_engineering.yaml)

Key sections:
- `context_budgets` - Per-agent token limits
- `truncation_rules` - What to keep/drop
- `freshness_thresholds` - Staleness definitions
- `scratchpad_config` - Working memory settings
- `summarization_levels` - Compression hierarchy
- `tool_results` - Result handling rules
- `compaction` - Conversation compaction settings
- `sub_agents` - Sub-agent delegation config
- `pattern_sharing` - Cross-node learning

---

## Related Documentation

- [Agent Architecture](../agents/agent-architecture.md) - Agent responsibilities
- [Tool Design Principles](tool-design-principles.md) - Tool design for agents
- [Prompt Engineering Principles](prompt-engineering-principles.md) - Prompting techniques
- [InfoHub Structure](core-entities.md) - Data storage
- [Playbook Execution](../playbooks/playbook-execution-specification.md) - Task execution
- [Signal Catalog](../../reference/signal-catalog.md) - Event handling
