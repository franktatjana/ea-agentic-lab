# POC Success Plan Adoption

Based on industry enterprise POV/POC best practices for maximizing evaluation-to-win conversion.

## Why Adopt This?

| Problem | POC Success Plan Solution |
|---------|--------------------------|
| POCs that drag on without decision | Clear timeline with committed milestones |
| "Free consulting" without commitment | Documented customer commitments upfront |
| Unclear success criteria | Mutually agreed, measurable criteria signed off |
| Technical win but no deal | Decision maker engagement and timeline locked |
| Scope creep mid-evaluation | Signed scope with change management process |
| No handoff to post-sales | Structured transition plan to implementation |

## Philosophy

**"A POC is a buying process, not a science experiment."**

Core principles:
1. **No POC without commitment** - Customer must have skin in the game
2. **Shorter is better** - 2-4 weeks, not 3 months
3. **Prove value, not features** - Tied to business outcomes
4. **Agreed criteria before starting** - No moving goalposts
5. **Decision timeline locked** - Know when you'll get an answer

---

## POC Success Plan Overview

### What is a POC Success Plan?

A **POC Success Plan** is a mutually agreed document that defines:
- What will be proven during the POC
- How success will be measured
- What each party commits to
- When decisions will be made
- What happens after success

### POC Success Plan vs CSP

| Aspect | POC Success Plan | Customer Success Plan |
|--------|------------------|----------------------|
| **Timing** | Pre-sales evaluation | Pre-sale through post-sales |
| **Duration** | 1-8 weeks | Ongoing relationship |
| **Focus** | Proving technical fit | Realizing business value |
| **Owner** | POC Agent | SA → CA |
| **Outcome** | Go/No-Go decision | Value realization |

The POC Success Plan feeds into the CSP - successful POC criteria become baseline metrics for value tracking.

---

## POC Success Plan Lifecycle

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POC SUCCESS PLAN LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  QUALIFICATION     PLANNING        EXECUTION        CONCLUSION    TRANSITION │
│  (Go/No-Go)        (Design)        (Prove)          (Decide)      (Handoff)  │
│                                                                              │
│  ┌─────────┐      ┌─────────┐     ┌─────────┐     ┌─────────┐    ┌────────┐ │
│  │ Assess  │      │ Create  │     │ Execute │     │ Document│    │ Hand   │ │
│  │ Fit &   │ ──── │ Success │ ─── │ & Track │ ─── │ Results │ ───│ Off to │ │
│  │ Commit  │      │ Plan    │     │         │     │         │    │ CSP    │ │
│  └─────────┘      └─────────┘     └─────────┘     └─────────┘    └────────┘ │
│       │                │               │               │              │      │
│       ▼                ▼               ▼               ▼              ▼      │
│  Commitment       Success         Milestone        Decision       Success   │
│  Checklist        Criteria        Reviews          Summary        Baseline  │
│                   Sign-off                         & Next Steps              │
│                                                                              │
│  Deliverables:    Deliverables:   Deliverables:   Deliverables:  Delivs:   │
│  - Go/No-Go       - POC Success   - Status        - Results      - CSP     │
│    assessment       Plan signed     updates         summary        update   │
│  - Commitments    - Mutual        - Checkpoint    - Win/Loss     - Journey │
│    documented       Action Plan     reviews         recommendation  map     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Customer Commitments Framework

### Commitment Categories

```yaml
customer_commitments:
  resources:
    technical_lead:
      description: "Named technical evaluator with authority"
      commitment: "X hours/week dedicated to POC"
      verification: "Calendar blocks visible"

    subject_matter_experts:
      description: "Access to domain experts as needed"
      commitment: "Available within 24h when requested"

    system_access:
      description: "Access to systems for integration"
      commitment: "Credentials/access provided by Day 1"

  data:
    test_data:
      description: "Representative data for evaluation"
      commitment: "Production-like data available"
      requirement: "Minimum X records/events"

    data_quality:
      description: "Data meets evaluation needs"
      commitment: "Customer validates data suitability"

  time:
    kickoff_attendance:
      description: "Key stakeholders at kickoff"
      commitment: "Executive sponsor + technical team"

    checkpoint_attendance:
      description: "Midpoint and final reviews"
      commitment: "Decision maker attendance confirmed"

    feedback_turnaround:
      description: "Timely response to questions"
      commitment: "< 24h response SLA"

  decision:
    decision_maker:
      description: "Person who can say YES"
      commitment: "Named and engaged"

    decision_timeline:
      description: "When decision will be made"
      commitment: "Within X days of POC completion"

    decision_criteria:
      description: "What determines success"
      commitment: "Signed success criteria document"

  executive:
    sponsor_engagement:
      description: "Executive visibility"
      commitment: "Briefed at kickoff and conclusion"

    budget_confirmation:
      description: "Budget availability"
      commitment: "Budget confirmed or approval path clear"
```

### Commitment Verification

| Commitment | Verification Method | Red Flag |
|------------|--------------------|-----------|
| Technical lead | Named in plan, calendar visible | "We'll assign someone" |
| Data access | Test connection successful | "We're working on it" |
| Decision maker | Attends kickoff | "They're too busy" |
| Decision timeline | Date in writing | "Depends on results" |
| Budget | Written confirmation | "We'll figure it out" |

---

## Success Criteria Framework

### SMART Criteria Design

Success criteria must be:

| Element | Description | Example |
|---------|-------------|---------|
| **S**pecific | Clear, unambiguous | "Ingest logs from LegacySIEM forwarder" |
| **M**easurable | Quantifiable metric | "Ingest 10,000 EPS sustained" |
| **A**chievable | Realistic in POC scope | "Within 2-week POC timeline" |
| **R**elevant | Tied to business outcome | "Enable real-time threat detection" |
| **T**ime-bound | Specific milestone date | "Demonstrate by Day 7" |

### Criteria Categories

```yaml
success_criteria_categories:
  technical_validation:
    description: "Prove technical capabilities"
    examples:
      - "Ingest X events/second from source Y"
      - "Query response < Z seconds at scale"
      - "Integration with tool A functional"
      - "Meet compliance requirement B"

  use_case_proof:
    description: "Prove use case value"
    examples:
      - "Detect scenario X within Y minutes"
      - "Reduce investigation time by Z%"
      - "Replace N manual steps with automation"
      - "Achieve visibility into previously dark area"

  operational_fit:
    description: "Prove operational viability"
    examples:
      - "Team self-sufficient after training"
      - "Deployment completed in X hours"
      - "Administration overhead acceptable"
      - "Performance within requirements"

  business_outcome:
    description: "Prove business value"
    examples:
      - "Demonstrate $X cost savings potential"
      - "Show Y% efficiency improvement"
      - "Prove compliance gap closure"
      - "Enable capability Z previously impossible"
```

### Criteria Limits

**Maximum 5 success criteria per POC**

| Count | Recommendation |
|-------|----------------|
| 1-3 | Ideal - focused evaluation |
| 4-5 | Acceptable - comprehensive |
| 6+ | Too many - negotiate down |
| 10+ | Red flag - scope is undefined |

---

## POC Types

| Type | Duration | Intensity | Use Case | Commitment Level |
|------|----------|-----------|----------|------------------|
| **Lite POV** | 1-2 weeks | Minimal | Velocity deals, clear fit | Standard |
| **Guided POV** | 2-4 weeks | Regular | Standard enterprise | High |
| **On-site POV** | 3-5 days | Daily | Strategic accounts | Very High |
| **Paid POV** | 4-8 weeks | Extended | Complex enterprise | Premium |

### When to Use Each Type

```yaml
poc_type_selection:
  lite_pov:
    criteria:
      - "Clear technical fit from discovery"
      - "Single use case focus"
      - "Customer has internal expertise"
      - "ARR < $100K"
    commitment: "Light - async updates, 1 review call"

  guided_pov:
    criteria:
      - "Standard enterprise evaluation"
      - "Multiple use cases to prove"
      - "Customer needs guidance"
      - "ARR $100K-$500K"
    commitment: "Standard - weekly calls, midpoint review"

  onsite_pov:
    criteria:
      - "Strategic account"
      - "High complexity or risk"
      - "Requires immersive engagement"
      - "ARR > $500K"
    commitment: "High - daily presence, executive engagement"

  paid_pov:
    criteria:
      - "Extended evaluation required"
      - "Customer has budget for evaluation"
      - "Complex multi-phase validation"
      - "ARR > $500K with expansion potential"
    commitment: "Premium - dedicated resources, PS involvement"
```

---

## Execution Phases

### Phase Details

```yaml
poc_phases:
  phase_0_qualification:
    name: "Pre-POC Qualification"
    duration: "Before POC starts"
    activities:
      - "Validate go/no-go criteria"
      - "Capture customer commitments"
      - "Design success criteria"
      - "Align internal team"
    exit_criteria:
      - "All mandatory commitments confirmed"
      - "Success criteria signed off"
      - "Resources allocated"
    deliverable: "POC Success Plan (draft)"

  phase_1_kickoff:
    name: "Kickoff & Setup"
    duration: "Days 1-2"
    activities:
      - "Internal kickoff (before customer)"
      - "Customer kickoff meeting"
      - "Environment provisioning"
      - "Data source connection"
      - "Initial configuration"
    exit_criteria:
      - "Customer can log in"
      - "Data flowing"
      - "Mutual Action Plan confirmed"
    deliverable: "POC Success Plan (signed)"

  phase_2_core_validation:
    name: "Core Validation"
    duration: "Days 3-7"
    activities:
      - "Primary use case implementation"
      - "Success criteria testing"
      - "Customer hands-on sessions"
      - "Daily async updates"
    exit_criteria:
      - "Primary criteria demonstrable"
      - "Customer has hands-on experience"
    checkpoint: "Midpoint review (Day 5)"

  phase_3_extended_validation:
    name: "Extended Validation (if needed)"
    duration: "Days 8-12"
    activities:
      - "Secondary use cases"
      - "Edge case handling"
      - "Integration refinement"
      - "Performance validation"
    exit_criteria:
      - "All agreed criteria addressed"
      - "No blocking issues"
    conditional: "Only if needed for scope"

  phase_4_conclusion:
    name: "Conclusion & Decision"
    duration: "Days 13-14"
    activities:
      - "Results documentation"
      - "Customer feedback session"
      - "Decision maker presentation"
      - "Go/no-go recommendation"
    exit_criteria:
      - "Clear decision from customer"
      - "Next steps agreed"
    deliverable: "POC Results Summary"

  phase_5_transition:
    name: "Transition (if won)"
    duration: "Post-decision"
    activities:
      - "Hand off to AE for negotiation"
      - "Document success baseline"
      - "Update CSP with POC results"
      - "Update journey map"
    deliverable: "CSP and Journey Map updates"
```

---

## Risk Management

### Common POC Risks

| Risk | Indicators | Mitigation |
|------|-----------|------------|
| **Scope Creep** | New requirements mid-POC | Document original scope, change requires sign-off |
| **Disengaged Customer** | Missed meetings, no usage | Escalate to sponsor, reduce timeline |
| **Technical Blockers** | Integration failures | Escalate early, pivot approach |
| **Moving Goalposts** | New stakeholders, changed criteria | Reference signed plan |
| **Champion Gone Dark** | Unresponsive contact | Find alternate sponsor |
| **Competitor Activity** | Competitive POC mentioned | Engage CI Agent, differentiate |

### Escalation Triggers

- Customer disengagement > 3 days
- Technical blocker unresolved > 48 hours
- Scope change requested
- Timeline extension > 1 week
- New competitor introduced
- Decision maker unavailable

---

## Agent Integration

### POC Agent Responsibilities

| Phase | POC Agent Tasks |
|-------|-----------------|
| Qualification | Assess readiness, validate commitments |
| Planning | Create success plan, design criteria |
| Execution | Track progress, manage risks, status updates |
| Conclusion | Document results, drive decision |
| Transition | Hand off to AE/SA, update CSP |

### Cross-Agent Collaboration

| Agent | POC Collaboration |
|-------|-------------------|
| **SA Agent** | Technical criteria design, architecture validation |
| **AE Agent** | Commercial context, decision maker relationships |
| **VE Agent** | Value criteria, ROI validation |
| **CI Agent** | Competitive positioning during POC |
| **Nudger Agent** | Milestone reminders, commitment tracking |

---

## InfoHub Storage

```text
infohub/{account}/
├── opportunities/
│   └── {opportunity_name}/
│       ├── poc_success_plan.yaml      # Master POC Success Plan
│       ├── success_criteria.yaml       # Detailed criteria
│       ├── commitment_tracker.yaml     # Customer commitments
│       ├── poc_status/                 # Status updates
│       │   └── status_{date}.yaml
│       ├── poc_results/                # Final results
│       │   └── poc_summary.yaml
│       └── checkpoint_notes/           # Review notes
│           ├── kickoff.md
│           ├── midpoint.md
│           └── conclusion.md
```

---

## Metrics

### POC Performance Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| POC-to-Win Rate | ≥70% | <50% |
| Average Duration | ≤3 weeks | >6 weeks |
| Time to Decision | ≤30 days post-POC | >60 days |
| Criteria Met Rate | ≥90% | <70% |
| Customer Engagement | Daily activity | No activity >3 days |
| Scope Changes | 0-1 | >2 |

### Health Indicators

```yaml
poc_health:
  green:
    - "All criteria on track"
    - "Customer engaged daily"
    - "No blocking issues"
    - "Timeline holding"

  yellow:
    - "1-2 criteria at risk"
    - "Customer engagement declining"
    - "Minor technical issues"
    - "Timeline pressure"

  red:
    - "Multiple criteria failing"
    - "Customer disengaged >3 days"
    - "Major technical blocker"
    - "Timeline extension needed"
```

---

## Implementation Checklist

- [ ] Create POC Success Plan template
- [ ] Add POC success plan tasks to POC Agent
- [ ] Update CSP template with POC linkage
- [ ] Configure commitment tracking
- [ ] Add POC health to Nudger triggers
- [ ] Create POC portfolio dashboard
- [ ] Train agents on POC success plan workflow

---

## Sources

- Industry enterprise POV/POC best practices
- Solution engineering evaluation methodologies
- Value-based selling frameworks
- Enterprise software sales processes
