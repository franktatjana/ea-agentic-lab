# Knowledge Collection & Best Practices Sharing Specification

## Overview

A living knowledge system that collects insights from all sources (internal deals, field expertise, external research), validates through peer consensus, and actively delivers relevant knowledge to users when they need it.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KNOWLEDGE ECOSYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   COLLECTION    │  │   CURATION      │  │   DELIVERY      │         │
│  │                 │  │                 │  │                 │         │
│  │ • Deal artifacts│  │ • Extraction    │  │ • Search/Browse │         │
│  │ • Field notes   │─▶│ • Validation    │─▶│ • Context push  │         │
│  │ • External intel│  │ • Enrichment    │  │ • Proactive     │         │
│  │ • Community     │  │ • Classification│  │   alerts        │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│           │                   │                    │                    │
│           └───────────────────┼────────────────────┘                    │
│                               ▼                                          │
│                    ┌─────────────────┐                                  │
│                    │ KNOWLEDGE GRAPH │                                  │
│                    │                 │                                  │
│                    │  Concepts ←→ Artifacts ←→ Outcomes                 │
│                    └─────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Knowledge Sources

### 1. Deal Artifacts (Primary)

```yaml
deal_sources:
  discovery_outputs:
    location: "infohub/{realm}/{node}/discovery/"
    artifacts:
      - type: "discovery_notes"
        extraction: ["pain_points", "requirements", "stakeholder_insights"]
      - type: "technical_assessment"
        extraction: ["architecture_patterns", "integration_challenges"]

  poc_outputs:
    location: "infohub/{realm}/{node}/poc/"
    artifacts:
      - type: "poc_results"
        extraction: ["success_factors", "failure_patterns", "tuning_insights"]
      - type: "performance_benchmarks"
        extraction: ["baseline_comparisons", "optimization_techniques"]

  rfx_outputs:
    location: "infohub/{realm}/{node}/rfx/"
    artifacts:
      - type: "rfx_responses"
        extraction: ["winning_positioning", "objection_handling"]
      - type: "competitive_analysis"
        extraction: ["differentiators", "counter_positioning"]

  outcome_data:
    location: "infohub/{realm}/{node}/outcomes/"
    artifacts:
      - type: "win_loss_analysis"
        extraction: ["decision_factors", "lessons_learned"]
      - type: "customer_feedback"
        extraction: ["value_delivered", "improvement_areas"]
```

### 2. Field Expertise (Tribal Knowledge)

```yaml
field_sources:
  specialist_insights:
    collection_methods:
      - method: "post_engagement_capture"
        trigger: "playbook_completion"
        prompt: "What worked well? What would you do differently?"

      - method: "expertise_interviews"
        trigger: "quarterly"
        prompt: "Structured knowledge extraction from top performers"

      - method: "slack_mining"
        channels: ["#specialists", "#technical-wins", "#lessons-learned"]
        extraction: "automated_insight_detection"

  lessons_learned:
    categories:
      - "Technical approaches that worked"
      - "Common pitfalls to avoid"
      - "Customer objection patterns"
      - "Competitive positioning wins"
      - "Demo techniques that resonated"

  tacit_knowledge:
    capture_methods:
      - "Pair engagement shadowing"
      - "Expert retrospectives"
      - "Success story interviews"
```

### 3. External Intelligence

```yaml
external_sources:
  industry_research:
    sources:
      - name: "Analyst Reports"
        types: ["Gartner", "Forrester", "IDC", "GigaOm"]
        extraction: ["market_trends", "buyer_priorities", "vendor_positioning"]

      - name: "Industry Publications"
        types: ["trade_journals", "tech_blogs", "research_papers"]
        extraction: ["emerging_practices", "technology_trends"]

  competitive_intelligence:
    sources:
      - name: "Competitor Releases"
        monitoring: ["changelogs", "press_releases", "product_docs"]
        extraction: ["new_capabilities", "positioning_changes"]

      - name: "Competitor Content"
        monitoring: ["blogs", "webinars", "case_studies"]
        extraction: ["messaging_patterns", "target_segments"]

      - name: "Review Sites"
        platforms: ["G2", "Gartner Peer Insights", "TrustRadius"]
        extraction: ["competitor_weaknesses", "buyer_priorities"]

  community_insights:
    sources:
      - name: "Technical Communities"
        platforms: ["Reddit", "HackerNews", "StackOverflow", "Discord"]
        extraction: ["pain_points", "feature_requests", "sentiment"]

      - name: "Professional Networks"
        platforms: ["LinkedIn", "Twitter/X", "industry_slack"]
        extraction: ["practitioner_insights", "trend_signals"]

      - name: "Open Source"
        platforms: ["GitHub", "CNCF", "Apache"]
        extraction: ["adoption_patterns", "integration_trends"]
```

## Knowledge Curation

### Extraction Pipeline

```yaml
extraction:
  automatic:
    nlp_extraction:
      - "Key concepts and entities"
      - "Actionable insights"
      - "Success/failure patterns"
      - "Quantitative outcomes"

    classification:
      - "Domain (security/search/observability)"
      - "Type (technique/insight/warning/reference)"
      - "Applicability (industry/segment/use_case)"

    linking:
      - "Related knowledge items"
      - "Source artifacts"
      - "Outcome correlations"

  human_assisted:
    triggers:
      - "High-value extraction detected"
      - "Ambiguous classification"
      - "Contradictory information"

    interface:
      - "Review and refine extractions"
      - "Add context and nuance"
      - "Tag and categorize"
```

### Peer Consensus Validation

```yaml
validation:
  model: "peer_consensus"

  lifecycle:
    draft:
      description: "Initial extraction, not yet validated"
      visibility: "contributor_only"
      actions: ["edit", "submit_for_review"]

    under_review:
      description: "Awaiting peer validation"
      visibility: "specialists_in_domain"
      actions: ["upvote", "downvote", "comment", "suggest_edit"]

    validated:
      description: "Peer consensus reached"
      visibility: "all_users"
      actions: ["use", "cite", "flag_outdated"]

    best_practice:
      description: "Proven through outcomes"
      visibility: "featured"
      actions: ["use", "cite", "track_usage"]

    archived:
      description: "Superseded or outdated"
      visibility: "historical"
      actions: ["view_history"]

  consensus_rules:
    promotion_to_validated:
      requires:
        - min_upvotes: 3
        - min_unique_reviewers: 2
        - no_unresolved_objections: true
        - domain_expert_approval: 1

    promotion_to_best_practice:
      requires:
        - validated_status: true
        - positive_outcome_correlation: 0.7
        - usage_count: 10
        - no_negative_feedback: true

    demotion_triggers:
      - contradicting_evidence_submitted: true
      - outdated_flag_count: 3
      - negative_outcome_correlation: 0.5

  feedback_mechanisms:
    upvote:
      meaning: "This is accurate and useful"
      weight: 1

    downvote:
      meaning: "This is inaccurate or not useful"
      weight: -1
      requires: "comment_explanation"

    citation:
      meaning: "I used this in my work"
      weight: 2
      tracks: "outcome_correlation"

    flag:
      types: ["outdated", "inaccurate", "incomplete", "duplicate"]
      triggers: "review_queue"
```

### Knowledge Enrichment

```yaml
enrichment:
  automatic:
    - "Link to related knowledge items"
    - "Tag with applicable domains/segments"
    - "Extract key entities and concepts"
    - "Generate summary and key points"
    - "Identify prerequisite knowledge"

  contextual:
    - "Add customer segment applicability"
    - "Add competitive context"
    - "Add temporal relevance (trending/evergreen)"
    - "Add confidence score"

  cross_reference:
    - "Link to checklist criteria"
    - "Link to playbook steps"
    - "Link to outcome data"
```

## Knowledge Delivery

### 1. Pull: Search & Browse

```yaml
pull_delivery:
  search:
    capabilities:
      - "Full-text search across all knowledge"
      - "Semantic/vector search for concept matching"
      - "Faceted filtering (domain, type, recency, validation)"
      - "Saved searches and alerts"

    ranking:
      factors:
        - relevance_score: 0.4
        - validation_level: 0.2
        - recency: 0.15
        - usage_count: 0.15
        - outcome_correlation: 0.1

  browse:
    views:
      - "By domain (security/search/observability)"
      - "By type (techniques/insights/warnings)"
      - "By use case"
      - "By customer segment"
      - "Trending this week"
      - "Top rated"

    personalization:
      - "Based on user role/specialty"
      - "Based on current engagement context"
      - "Based on past usage patterns"
```

### 2. Contextual Push: In-Workflow Suggestions

```yaml
contextual_delivery:
  triggers:
    playbook_execution:
      - trigger: "playbook_step_started"
        action: "surface relevant knowledge for current step"
        example: "Starting RFx response → show winning positioning patterns"

      - trigger: "checklist_criterion_addressed"
        action: "surface related best practices"
        example: "Addressing SEC_TD_002 → show MITRE coverage strategies"

    artifact_creation:
      - trigger: "creating_discovery_document"
        action: "suggest relevant discovery insights"

      - trigger: "creating_poc_plan"
        action: "surface similar POC learnings"

    context_detection:
      - trigger: "customer_industry_detected"
        action: "surface industry-specific knowledge"

      - trigger: "competitor_mentioned"
        action: "surface competitive intelligence"

  presentation:
    inline_suggestions:
      format: "Non-intrusive sidebar or tooltip"
      max_items: 3
      dismissable: true
      feedback: ["helpful", "not_relevant"]

    deep_dive:
      format: "Expandable panel with full knowledge item"
      includes: ["summary", "key_points", "source", "related"]
```

### 3. Proactive Alerts: New Knowledge Notifications

```yaml
proactive_delivery:
  subscription_model:
    user_subscriptions:
      - "Domains of interest"
      - "Specific topics/tags"
      - "Competitor updates"
      - "Customer segment updates"

    smart_subscriptions:
      - "Based on current engagements"
      - "Based on role/specialty"
      - "Based on past interactions"

  alert_types:
    new_best_practice:
      trigger: "knowledge promoted to best_practice"
      urgency: "normal"
      channel: "digest"

    trending_insight:
      trigger: "knowledge getting high engagement"
      urgency: "normal"
      channel: "digest"

    relevant_to_engagement:
      trigger: "new knowledge matches active engagement"
      urgency: "high"
      channel: "immediate"

    competitive_update:
      trigger: "new competitor intelligence"
      urgency: "high"
      channel: "immediate"

    knowledge_update:
      trigger: "knowledge you cited was updated"
      urgency: "normal"
      channel: "immediate"

  channels:
    immediate:
      - "In-app notification"
      - "Slack DM"

    digest:
      frequency: "daily or weekly (user preference)"
      format: "curated summary of relevant updates"
```

## Knowledge Types & Schema

### Best Practice

```yaml
best_practice:
  id: "BP_SEC_001"
  title: "MITRE ATT&CK Coverage Positioning"
  domain: "security"
  type: "technique"

  summary: "How to effectively position MITRE ATT&CK coverage in competitive evaluations"

  content:
    context: "When customer asks about MITRE coverage..."
    approach: |
      1. Start with coverage breadth (techniques covered)
      2. Emphasize detection quality, not just quantity
      3. Show real examples of detections firing
      4. Compare to competitor's actual coverage (not claimed)

    key_points:
      - "Quality over quantity - 80% coverage with high fidelity beats 95% with noise"
      - "Always demonstrate with live data if possible"
      - "Link detections to customer's actual threat landscape"

    examples:
      - scenario: "Financial services customer concerned about ransomware"
        approach: "Focus on TA0001-TA0003 coverage (Initial Access to Persistence)"
        outcome: "Customer impressed by specific ransomware family coverage"

    pitfalls:
      - "Don't just show a heat map - customers have seen those"
      - "Avoid coverage percentage claims without context"

  metadata:
    status: "best_practice"
    created_by: "security_specialist_jane"
    created_at: "2026-01-15"
    validated_at: "2026-01-22"
    validation_score: 4.8
    usage_count: 47
    outcome_correlation: 0.82

  relationships:
    checklist_criteria: ["SEC_TD_002"]
    playbooks: ["PB_SEC_002", "PB_SEC_007"]
    related_knowledge: ["BP_SEC_003", "IN_SEC_012"]
    source_artifacts:
      - "infohub/ACME/wins/security_eval_2026-01.md"
      - "infohub/BIGCO/poc/detection_demo_success.md"

  applicability:
    industries: ["financial_services", "healthcare", "retail"]
    segments: ["enterprise", "mid_market"]
    competitors: ["LegacySIEM", "CloudSIEM"]
```

### Insight

```yaml
insight:
  id: "IN_OBS_042"
  title: "SRE Teams Prioritize Error Budgets Over Alert Count"
  domain: "observability"
  type: "insight"

  summary: "Discovery pattern: mature SRE teams care more about error budget management than reducing alert count"

  content:
    observation: |
      In 8 of last 10 SRE-focused discoveries, teams explicitly stated
      that error budget visibility was more important than alert noise reduction.

    implication: |
      Lead with SLO/error budget capabilities rather than alert deduplication
      when engaging SRE teams.

    evidence:
      - "ACME discovery: 'We need to see burn rate, not just alerts'"
      - "BIGCO discovery: 'Error budgets drive our release decisions'"

  metadata:
    status: "validated"
    confidence: 0.8
    sample_size: 10
    created_at: "2026-01-20"

  applicability:
    audience: ["sre_teams", "platform_engineering"]
    maturity: ["high"]
```

### Warning

```yaml
warning:
  id: "WN_SRCH_007"
  title: "Avoid Promise of 'Out-of-Box' Relevance"
  domain: "search"
  type: "warning"

  summary: "Promising out-of-box relevance without tuning sets unrealistic expectations"

  content:
    pattern: |
      Multiple POCs have failed when customer expected perfect relevance
      without any tuning or configuration.

    recommendation: |
      Always set expectations that relevance tuning is part of implementation.
      Position tuning as a feature, not a bug.

    recovery: |
      If already promised, pivot to "rapid tuning workflow" positioning.

  metadata:
    status: "validated"
    severity: "high"
    failure_count: 5

  source_artifacts:
    - "infohub/FAILCO/poc/post_mortem.md"
```

## Integration Points

### With Checklists

```yaml
checklist_integration:
  bidirectional:
    knowledge_to_checklist:
      - "Best practices suggest new criteria"
      - "Insights inform weight adjustments"
      - "Warnings flag criteria gaps"

    checklist_to_knowledge:
      - "Criteria coverage triggers knowledge suggestions"
      - "Checklist gaps prompt knowledge search"
```

### With Playbooks

```yaml
playbook_integration:
  knowledge_hooks:
    - step: "analyze_requirements"
      suggests: "relevant past RFx insights"

    - step: "draft_responses"
      suggests: "winning positioning patterns"

    - step: "competitive_positioning"
      suggests: "competitive intelligence"

  capture_hooks:
    - trigger: "playbook_completion"
      action: "prompt for lessons learned capture"
```

### With InfoHub

```yaml
infohub_integration:
  extraction:
    - "Automatically extract insights from new artifacts"
    - "Link knowledge to source artifacts"
    - "Track outcome correlations"

  enrichment:
    - "Add knowledge references to artifacts"
    - "Surface related knowledge in artifact views"
```

## Governance

### Quality Metrics

```yaml
quality_metrics:
  knowledge_health:
    - "Validation rate (% reaching validated status)"
    - "Usage rate (% of knowledge being cited)"
    - "Freshness (average age of active knowledge)"
    - "Coverage (domains/topics with knowledge gaps)"

  contribution_health:
    - "Contributors per period"
    - "Contribution to validation ratio"
    - "Cross-domain contribution"

  impact_metrics:
    - "Knowledge-to-outcome correlation"
    - "Time saved (self-reported)"
    - "Engagement success rate delta"
```

### Maintenance

```yaml
maintenance:
  automated:
    - "Flag potentially outdated knowledge (>12 months)"
    - "Detect contradictions with newer knowledge"
    - "Identify low-usage candidates for review"

  scheduled:
    - frequency: "quarterly"
      action: "Domain expert review of all best practices"

    - frequency: "monthly"
      action: "Review flagged/outdated items"

  continuous:
    - "Monitor for negative feedback"
    - "Track outcome correlations"
    - "Update related links"
```

## Implementation Phases

### Phase 1: Foundation

Establish the knowledge graph structure and basic collection mechanisms. This phase creates the schema, storage, and interfaces that all subsequent phases build on. Without a solid foundation, knowledge remains scattered and unsearchable.

- Knowledge schema and storage
- Basic extraction from deal artifacts
- Search and browse interface
- Manual contribution workflow

### Phase 2: Validation

Add peer consensus so knowledge quality is community-driven rather than curator-bottlenecked. Validation transforms raw contributions into trusted, reusable assets that teams can rely on during engagements.

- Peer consensus workflow
- Upvote/downvote/citation tracking
- Validation lifecycle management
- Quality dashboards

### Phase 3: Active Delivery

Shift from pull-only to push delivery so knowledge finds users rather than waiting to be searched. Contextual suggestions during playbook execution and proactive alerts reduce the gap between available knowledge and applied knowledge.

- Contextual suggestions in playbooks
- Subscription and alert system
- Personalization engine
- Knowledge digest

### Phase 4: Intelligence

Close the loop with automated external monitoring and outcome correlation. This phase transforms the knowledge system from a curated library into an intelligence platform that continuously learns from both internal results and external signals.

- External source monitoring
- Automated extraction pipeline
- Cross-knowledge linking
- Outcome correlation analysis
