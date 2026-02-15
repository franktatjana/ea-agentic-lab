# Checklist Learning System Specification

## Overview

Domain evaluation checklists are **living knowledge artifacts** that continuously learn and evolve from three sources:
1. **Cross-specialist learning** - patterns and insights shared across domains
2. **Internal best practices** - win/loss analysis, field feedback, deal outcomes
3. **External intelligence** - industry trends, analyst reports, competitive moves

## Architecture

[image: Learning Loop - checklists connected to cross-specialist, internal, and external learning sources]

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKLIST LEARNING LOOP                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │   Security   │◄──►│    Search    │◄──►│ Observability│     │
│   │  Checklist   │    │  Checklist   │    │  Checklist   │     │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                   │              │
│          └───────────────────┼───────────────────┘              │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │ Learning Engine │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                │
│          ▼                  ▼                  ▼                │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│   │  Internal  │    │  External  │    │   Cross-   │           │
│   │   Sources  │    │   Sources  │    │  Specialist│           │
│   └────────────┘    └────────────┘    └────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Learning Sources

### 1. Cross-Specialist Learning

Checklists learn patterns from sibling specialties:

```yaml
cross_learning:
  security_from_observability:
    - pattern: "SLO-based success criteria"
      source: "OBS_SLO_001"
      adaptation: "SEC_METRICS_NEW: Detection SLO (MTTD target)"

    - pattern: "Three signals correlation"
      source: "OBS_COR_001"
      adaptation: "SEC_COR_NEW: Alert-Log-Network correlation"

  search_from_security:
    - pattern: "Access control granularity"
      source: "SEC_ARCH_002"
      adaptation: "SRCH_SEC_NEW: Document-level security"

    - pattern: "Audit logging requirements"
      source: "SEC_RPT_004"
      adaptation: "SRCH_AUDIT_NEW: Search audit trail"

  observability_from_search:
    - pattern: "Relevance tuning workflow"
      source: "SRCH_REL_006"
      adaptation: "OBS_TUNE_NEW: Alert relevance tuning"

    - pattern: "Query performance benchmarks"
      source: "SRCH_PERF_001"
      adaptation: "OBS_QUERY_NEW: Log query benchmarks"
```

### 2. Internal Best Practices

Learning from deal outcomes and field experience:

```yaml
internal_learning:
  sources:
    - type: "deal_outcomes"
      location: "*/*/external-infohub/outcomes/"
      signals:
        - "win_loss_reason"
        - "technical_differentiators"
        - "competitive_gaps"

    - type: "field_feedback"
      location: "vault/feedback/"
      signals:
        - "missing_criteria"
        - "outdated_criteria"
        - "weight_suggestions"

    - type: "customer_feedback"
      location: "*/*/internal-infohub/governance/feedback/"
      signals:
        - "evaluation_priorities"
        - "decision_factors"
        - "competitor_strengths"

  aggregation:
    frequency: "weekly"
    minimum_signals: 5
    confidence_threshold: 0.7

  actions:
    - type: "weight_adjustment"
      trigger: "criteria correlates with wins (p > 0.8)"
      action: "increase weight by 5%"

    - type: "new_criteria_suggestion"
      trigger: "3+ deals mention missing capability"
      action: "propose new criterion for review"

    - type: "criteria_deprecation"
      trigger: "criteria unused in 10+ evaluations"
      action: "flag for review"
```

### 3. External Intelligence

Learning from industry and competitive landscape:

```yaml
external_learning:
  sources:
    analyst_reports:
      - source: "Gartner Magic Quadrant"
        relevance: ["security", "observability"]
        extraction: "capability_requirements"
        frequency: "on_publish"

      - source: "Forrester Wave"
        relevance: ["security", "search", "observability"]
        extraction: "evaluation_criteria"
        frequency: "on_publish"

      - source: "GigaOm Radar"
        relevance: ["observability", "search"]
        extraction: "key_criteria"
        frequency: "on_publish"

    industry_standards:
      - source: "MITRE ATT&CK"
        relevance: ["security"]
        extraction: "technique_coverage"
        frequency: "quarterly"
        url: "https://attack.mitre.org/"

      - source: "OpenTelemetry"
        relevance: ["observability"]
        extraction: "specification_changes"
        frequency: "monthly"
        url: "https://opensignal.example.io/docs/"

      - source: "OWASP"
        relevance: ["security"]
        extraction: "security_requirements"
        frequency: "on_update"

    competitive_intelligence:
      - source: "competitor_releases"
        method: "changelog_monitoring"
        extraction: "new_capabilities"
        frequency: "weekly"

      - source: "community_discussions"
        platforms: ["reddit", "hackernews", "vendor_forums"]
        extraction: "feature_requests, pain_points"
        frequency: "daily"

      - source: "job_postings"
        method: "skill_trend_analysis"
        extraction: "emerging_technologies"
        frequency: "monthly"

  processing:
    nlp_extraction:
      - "capability requirements"
      - "evaluation criteria"
      - "industry trends"

    relevance_scoring:
      - match to existing criteria
      - novelty detection
      - importance signals
```

## Learning Engine

[image: Criteria Lifecycle - state transitions from proposed through experimental, active, deprecated, to archived]

### Criteria Lifecycle

```yaml
criteria_lifecycle:
  stages:
    proposed:
      description: "New criterion suggested by learning system"
      requires: "human_review"
      max_duration: "14 days"

    experimental:
      description: "Being tested in evaluations"
      tracking: "usage and correlation"
      min_evaluations: 10
      max_duration: "90 days"

    active:
      description: "Validated and in production use"
      monitoring: "continuous effectiveness"

    deprecated:
      description: "Phasing out, still available"
      reason_required: true
      sunset_period: "30 days"

    archived:
      description: "No longer used, kept for history"
      searchable: true

  transitions:
    proposed_to_experimental:
      trigger: "human_approval"

    experimental_to_active:
      trigger: "positive_correlation AND min_evaluations"

    active_to_deprecated:
      trigger: "low_usage OR negative_correlation OR obsolete"

    deprecated_to_archived:
      trigger: "sunset_period_complete"
```

### Weight Learning

```yaml
weight_learning:
  model: "bayesian_update"

  prior:
    source: "expert_judgment"
    initial_weights: "from_checklist_definition"

  likelihood:
    signals:
      - name: "win_rate"
        description: "Deals won where criterion was addressed"
        weight: 0.4

      - name: "customer_priority"
        description: "How often customers prioritize this"
        weight: 0.3

      - name: "competitive_diff"
        description: "Does this differentiate from competitors"
        weight: 0.2

      - name: "industry_trend"
        description: "Is this growing in importance"
        weight: 0.1

  update_rules:
    frequency: "monthly"
    minimum_data_points: 20
    max_weight_change: 0.1  # 10% max change per period
    human_review_threshold: 0.15  # Review if > 15% change suggested
```

[image: Bayesian Weight Update - prior beliefs plus likelihood signals producing updated weights]

## Integration Points

### Playbook Integration

```yaml
# In playbook execution
checklist_learning_hooks:
  on_playbook_start:
    - load latest checklist version
    - include experimental criteria (flagged)
    - apply customer-specific weight overrides

  during_execution:
    - track criteria coverage
    - capture criteria effectiveness signals
    - note customer reactions to criteria

  on_playbook_complete:
    - submit coverage report
    - submit effectiveness signals
    - trigger learning update if threshold met
```

### InfoHub Curator Integration

```yaml
# InfoHub Curator Agent responsibilities
curator_tasks:
  external_monitoring:
    - monitor configured external sources
    - extract relevant insights
    - propose checklist updates

  internal_analysis:
    - aggregate deal outcomes
    - analyze coverage patterns
    - identify gaps and trends

  cross_pollination:
    - identify patterns across specialties
    - propose cross-learning adaptations
    - maintain shared criteria library
```

## Governance

### Change Control

```yaml
change_control:
  automatic_changes:
    - weight adjustments within bounds
    - experimental criteria promotion (with data)

  human_required:
    - new criteria addition
    - criteria deprecation
    - major weight changes (>15%)
    - cross-specialty adoptions

  review_cadence:
    weekly: "proposed criteria review"
    monthly: "weight adjustment review"
    quarterly: "full checklist audit"
```

### Audit Trail

```yaml
audit:
  tracked_events:
    - criteria_added
    - criteria_deprecated
    - weight_changed
    - source_added
    - learning_signal_received

  retention: "indefinite"

  reporting:
    - checklist evolution timeline
    - learning source effectiveness
    - criteria lifecycle metrics
```

## Example: Learning Flow

```
1. External Signal Detected
   └─> Gartner MQ mentions "AI-powered threat detection" as key criterion

2. Learning Engine Processing
   └─> Maps to security checklist
   └─> No existing criterion matches
   └─> Creates proposed criterion: SEC_TD_NEW_001

3. Human Review
   └─> Security specialist reviews proposal
   └─> Approves with modifications
   └─> Moves to "experimental" status

4. Field Testing
   └─> Criterion included in next 10 security evaluations
   └─> Track: was it addressed? did it correlate with outcomes?

5. Promotion Decision
   └─> 8/10 deals addressed it
   └─> 6/8 wins mentioned it as differentiator
   └─> Promoted to "active" status

6. Continuous Learning
   └─> Weight adjusted based on ongoing signals
   └─> Cross-learning: Observability adopts similar criterion
```

## Implementation Phases

### Phase 1: Foundation

Build the core infrastructure that makes checklists trackable and measurable. Without lifecycle tracking and signal collection, no learning can happen. This phase establishes the data backbone.

- Implement criteria lifecycle tracking
- Add coverage tracking to playbooks
- Create learning signal schema

### Phase 2: Internal Learning

Connect checklists to real deal outcomes so criteria weights reflect actual field reality. Win/loss data and field feedback are the highest-signal sources for improving evaluation accuracy.

- Connect deal outcomes to checklists
- Implement weight adjustment engine
- Add field feedback collection

### Phase 3: External Learning

Extend learning beyond internal data by monitoring the external landscape. Analyst reports, industry standards, and competitive moves reveal criteria gaps that internal data alone cannot surface.

- Set up external source monitoring
- Implement NLP extraction pipeline
- Add competitive intelligence feeds

### Phase 4: Cross-Learning

Enable checklists to learn from sibling specialties. Security, search, and observability domains share underlying patterns that, when detected and adapted, strengthen all three checklists simultaneously.

- Implement pattern detection across checklists
- Add cross-specialist suggestion engine
- Create shared criteria library
