---
order: 4
---

# SA Best Practices Adoption

Industry best practices adopted for the EA Agentic Lab based on leading enterprise sales engineering methodologies.

[image: POV Timeline - phases from qualification through kickoff, execution, and conclusion with key milestones]

## 1. POV Framework Enhancement

Current POC Agent enhanced with structured POV approach:

### POV Types (all 4 supported)

| Type | Duration | Intensity | Use Case |
|------|----------|-----------|----------|
| **Guided POV** | 14-45 days | Regular touchpoints | Standard enterprise evaluation |
| **On-site POV** | 3-5 days | Daily SA involvement | High-touch strategic accounts |
| **Paid POV** | 60+ days | Extended engagement | Complex enterprise with budget |
| **Lite POV** | 1-2 weeks | Minimal touchpoints | Commercial/velocity deals |

### Qualification Criteria (before POV starts)

```yaml
pov_qualification:
  required:
    - "Opportunity ARR > threshold (e.g., $100K)"
    - "Customer provides dedicated technical resource"
    - "Champion and economic buyer aligned on success criteria"
    - "Business case documented"
    - "Max 5 success criteria defined"

  blockers:
    - "No clear business outcome defined"
    - "Customer expects self-service evaluation"
    - "No technical counterpart assigned"
    - "Success criteria unbounded"
```

### POV Meeting Cadence

```yaml
pov_meetings:
  internal_kickoff:
    timing: "Before customer kickoff"
    purpose: "Align internal team on approach"
    attendees: ["SA", "AE", "Specialist if needed"]

  external_kickoff:
    timing: "Day 1"
    purpose: "Establish cadence, confirm success criteria"
    deliverable: "Mutual action plan"

  weekly_retrospective:
    timing: "Weekly"
    purpose: "Track progress, remove blockers"
    deliverable: "Status update, updated risk register"

  conclusion:
    timing: "Final day"
    purpose: "Validate value, determine next steps"
    deliverable: "POV summary, recommendation"
```

---

[image: Discovery Dimensions - five discovery areas from business outcomes through current state, requirements, stakeholders, to timeline]

## 2. Technical Discovery Framework

Extracted as reusable process:

### Discovery Dimensions

```yaml
technical_discovery:
  business_outcomes:
    questions:
      - "What business problem are you solving?"
      - "How do you measure success today?"
      - "What happens if you don't solve this?"
    outputs:
      - "Business outcome statement"
      - "Success metrics"
      - "Cost of inaction"

  current_state:
    questions:
      - "What tools do you use today?"
      - "What is your current architecture?"
      - "What are your pain points?"
    outputs:
      - "Technology inventory"
      - "Architecture diagram"
      - "Gap analysis"

  requirements:
    questions:
      - "What are your must-haves vs nice-to-haves?"
      - "What are your scale requirements?"
      - "What are your compliance requirements?"
    outputs:
      - "Requirements matrix (must/should/could)"
      - "Sizing inputs"
      - "Compliance checklist"

  stakeholders:
    questions:
      - "Who are the decision makers?"
      - "Who are the technical evaluators?"
      - "Who will use the solution daily?"
    outputs:
      - "Stakeholder map"
      - "Influence/interest matrix"
      - "Communication plan"

  timeline:
    questions:
      - "What is your decision timeline?"
      - "What is your implementation timeline?"
      - "Are there hard deadlines?"
    outputs:
      - "Decision timeline"
      - "Implementation roadmap"
      - "Critical path items"
```

### Discovery Playbook

```yaml
discovery_playbook:
  before_meeting:
    - "Research company (news, financials, tech stack)"
    - "Review any prior interactions"
    - "Prepare discovery questions"
    - "Identify likely use cases"

  during_meeting:
    - "Confirm attendees and roles"
    - "Set agenda and expectations"
    - "Ask open-ended questions"
    - "Listen more than talk"
    - "Capture verbatim quotes"
    - "Confirm understanding before moving on"

  after_meeting:
    - "Document findings in InfoHub"
    - "Update stakeholder map"
    - "Identify follow-up questions"
    - "Share summary with account team"
    - "Plan next steps"
```

---

[image: Opportunity Health Stoplight - green, yellow, red indicators with criteria for each state]

## 3. Opportunity Hygiene Process

Weekly updates required for InfoHub:

### Weekly Hygiene Checklist

```yaml
opportunity_hygiene:
  weekly_required:
    - "Update opportunity stage if changed"
    - "Confirm close date is realistic"
    - "Update next steps field"
    - "Log recent customer interactions"
    - "Update risk assessment"
    - "Confirm stakeholder engagement"

  health_indicators:
    green:
      - "Customer engaged in last 7 days"
      - "Next meeting scheduled"
      - "Champion active"
      - "No blocking issues"

    yellow:
      - "No customer contact in 14 days"
      - "Decision maker not engaged"
      - "Competitive activity detected"
      - "Timeline slipping"

    red:
      - "No customer contact in 21+ days"
      - "Champion gone dark"
      - "Budget/priority changed"
      - "Competitor preferred"

  automation:
    - "Nudger alerts for stale opportunities"
    - "Auto-flag opportunities without recent activity"
    - "Weekly hygiene report to AE"
```

---

## 4. Working Agreements

Mutual expectations between functions:

### Cross-Agent Working Agreements

```yaml
working_agreements:
  ae_sa:
    ae_commits_to:
      - "Include SA in technical discussions"
      - "Share customer context before meetings"
      - "Respect SA time for preparation"
      - "Update opportunity with commercial context"

    sa_commits_to:
      - "Respond to requests within 24 hours"
      - "Provide technical risk assessment"
      - "Update InfoHub with technical findings"
      - "Flag commercial implications of technical issues"

  sa_specialist:
    sa_commits_to:
      - "Complete initial technical discovery before request"
      - "Provide clear scope and questions"
      - "Own customer relationship during engagement"
      - "Handle follow-up after specialist engagement"

    specialist_commits_to:
      - "Respond to qualified requests within SLA"
      - "Provide clear deliverables"
      - "Hand back to SA with full context"
      - "Document reusable patterns"

  account_team_delivery:
    account_team_commits_to:
      - "Provide complete handoff documentation"
      - "Remain engaged during implementation"
      - "Handle commercial escalations"
      - "Manage customer expectations"

    delivery_commits_to:
      - "Provide regular status updates"
      - "Escalate risks early"
      - "Document implementation learnings"
      - "Coordinate support handoff"
```

---

## 5. Communities of Practice

Organized by domain expertise for cross-account learning:

### Practice Areas

```yaml
communities_of_practice:
  security_analytics:
    focus: "SIEM, threat detection, compliance"
    members: "SAs working on security use cases"
    activities:
      - "Monthly knowledge share"
      - "Win/loss analysis review"
      - "Competitive positioning updates"
      - "Reference architecture evolution"

  observability:
    focus: "APM, logging, metrics, tracing"
    members: "SAs working on observability"
    activities:
      - "Integration pattern sharing"
      - "Performance benchmark updates"
      - "Customer success stories"

  search:
    focus: "Enterprise search, RAG, vector search"
    members: "SAs working on search use cases"
    activities:
      - "Use case pattern library"
      - "Sizing model refinement"
      - "Demo environment sharing"

  operations:
    cadence: "Monthly meeting + async Slack"
    artifacts:
      - "Best practice library per domain"
      - "Objection handling guides"
      - "Reference architectures"
      - "Customer story repository"
```

---

## 6. Deliberate Practice Program

Intentional skill development:

### Skill Development Framework

```yaml
deliberate_practice:
  skills:
    technical:
      - "Product deep-dives"
      - "Architecture design"
      - "Sizing and performance"
      - "Competitive differentiation"

    consulting:
      - "Discovery questioning"
      - "Whiteboard facilitation"
      - "Objection handling"
      - "Executive communication"

    commercial:
      - "Value articulation"
      - "Business case development"
      - "Negotiation support"

  methods:
    ride_alongs:
      description: "Shadow experienced SA on customer calls"
      frequency: "Monthly for new SAs"
      documentation: "Ride-along feedback form"

    mock_sessions:
      description: "Practice demos/discoveries with peers"
      frequency: "Weekly optional sessions"
      feedback: "Structured peer feedback"

    deal_reviews:
      description: "Analyze won/lost deals for learnings"
      frequency: "Quarterly"
      output: "Pattern library updates"

  tracking:
    - "Skills matrix per SA"
    - "Practice log"
    - "Peer feedback history"
    - "Certification progress"
```

---

## 7. Request & Triage SLAs

Clear SLAs defined:

### Engagement Request SLAs

```yaml
request_slas:
  sa_support:
    standard:
      response: "24 hours"
      engagement_start: "48 hours"
    urgent:
      response: "4 hours"
      engagement_start: "Same day"
    criteria_for_urgent:
      - "Strategic account"
      - "Competitive bake-off"
      - "Executive involved"
      - "Deal closing this week"

  specialist_support:
    standard:
      response: "48 hours"
      engagement_start: "5 business days"
    urgent:
      response: "24 hours"
      engagement_start: "48 hours"
    criteria_for_urgent:
      - "POV blocking issue"
      - "Production incident"
      - "Executive escalation"

  escalation_path:
    level_1: "Requesting agent follows up"
    level_2: "Team lead intervenes (after SLA breach)"
    level_3: "Senior Manager escalation (after 2x SLA)"
```

---

## 8. Activity Capture Standards

Consistent logging required:

### Activity Types

```yaml
activity_capture:
  required_logging:
    customer_meetings:
      fields:
        - "Date and duration"
        - "Attendees (customer and internal)"
        - "Meeting type (discovery, demo, QBR, etc.)"
        - "Key discussion points"
        - "Decisions made"
        - "Action items with owners"
      destination: "InfoHub meetings/"

    internal_collaboration:
      fields:
        - "Type (deal review, strategy session, etc.)"
        - "Participants"
        - "Decisions made"
        - "Action items"
      destination: "InfoHub internal/"

    async_support:
      fields:
        - "Request type"
        - "Time spent"
        - "Resolution/outcome"
      destination: "Activity log"

  meeting_notes_template:
    sections:
      - "## Attendees"
      - "## Objectives"
      - "## Discussion Summary"
      - "## Decisions"
      - "## Action Items"
      - "## Next Steps"
```

---

## Implementation Priority

| Addition | Effort | Impact | Priority | Status |
|----------|--------|--------|----------|--------|
| POV Framework Enhancement | Medium | High | P1 | DONE |
| Technical Discovery Framework | Low | High | P1 | DONE |
| Working Agreements | Low | Medium | P2 | Pending |
| Opportunity Hygiene | Medium | High | P1 | DONE |
| Request SLAs | Low | Medium | P2 | Pending |
| Communities of Practice | Medium | Medium | P3 | Pending |
| Deliberate Practice | High | Medium | P3 | Pending |
| Activity Capture Standards | Low | Medium | P2 | Pending |
| Deal Retrospective Practice | Medium | High | P1 | DONE |

## Implementation Notes

### POV Framework Enhancement (DONE)

- Created `teams/poc/prompts/tasks.yaml` with 20+ task prompts
- Implemented POV types: Guided, On-site, Paid, Lite
- Added qualification, kickoff, execution, conclusion, conversion task categories
- Updated `teams/poc/agents/poc_agent.yaml` with prompts_dir reference

### Technical Discovery Framework (DONE)

- Added `technical_discovery` section to `teams/solution_architects/prompts/tasks.yaml`
- 8 discovery task prompts covering all dimensions:
  - Discovery preparation (research, questions)
  - Business outcomes discovery
  - Current state discovery
  - Requirements discovery
  - Stakeholder discovery
  - Timeline discovery
  - Discovery synthesis
  - Post-discovery debrief

### Opportunity Hygiene (DONE)

- Added `opportunity_hygiene` section to `teams/account_executives/prompts/tasks.yaml`
- 5 hygiene task prompts:
  - Weekly hygiene check (update stage, dates, next steps)
  - Opportunity health indicators (GREEN/YELLOW/RED criteria)
  - Stale opportunity alert (14+ days no contact)
  - Hygiene report (weekly summary for AE/Manager)
  - CRM update checklist (fields, activities, notes)

### Deal Retrospective Practice (DONE)

- Created new Retrospective Agent: `teams/retrospective/`
  - `agents/retrospective_agent.yaml` - Agent configuration
  - `personalities/retrospective_personality.yaml` - Blame-free analysis personality
  - `prompts/tasks.yaml` - 15+ task prompts in 5 categories
- Task categories:
  - Win retrospective (initiate, analyze factors, document learnings)
  - Loss retrospective (initiate, analyze factors, document, competitive deep-dive)
  - Pattern analysis (identify patterns, trend analysis, generate reports)
  - Knowledge sharing (lessons summary, competitive brief, product feedback)
  - Process improvement (recommendations, track implementation, program effectiveness)
- Created `playbooks/templates/deal_retrospective_template.yaml`
  - Standardized win/loss retrospective format
  - Deal snapshot, analysis sections, learnings, recommendations
  - Distribution and sign-off tracking

---

## Sources

- Industry SA best practices
- Enterprise sales engineering methodologies
- Value-based selling frameworks
