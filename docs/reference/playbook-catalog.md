# Customer Success Playbooks

Playbooks that guide customer engagements from qualification through renewal and expansion. Each playbook provides structured guidance for agents and human collaborators.

## Playbook Taxonomy

Our playbooks are organized by customer lifecycle stage and engagement type:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER SUCCESS PLAYBOOKS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STAGE ADOPTION               ENGAGEMENT CADENCE           HEALTH MANAGEMENT    │
│  ─────────────────           ──────────────────           ─────────────────     │
│  • Security Stage            • Discovery Calls            • Health Triage       │
│  • Observability Stage       • Cadence Calls              • Risk Intervention   │
│  • Search Stage              • Executive Reviews          • Renewal Protection  │
│  • Platform Adoption         • Value Workshops            • Escalation          │
│                                                                                  │
│  TECHNICAL ENABLEMENT        LIFECYCLE TRANSITIONS        ANALYSIS FRAMEWORKS   │
│  ────────────────────        ─────────────────────        ──────────────────    │
│  • Technical Workshop        • Pre-to-Post Handoff        • Five Whys           │
│  • Migration Playbook        • Renewal Planning           • Retrospective       │
│  • POV Execution             • Expansion Planning         • Account Planning    │
│  • Use Case Adoption         • Offboarding                • SWOT Analysis       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Stage Adoption Playbooks

Stage adoption playbooks guide customers through adopting specific product capabilities, from initial use cases to advanced maturity.

### Security Stage Adoption

**Path:** `playbooks/executable/PB_CS_101_security_stage_adoption.yaml`

Guides customers from basic SIEM deployment to advanced threat detection and response.

| Maturity Level | Description | Success Indicators |
|---------------|-------------|---------------------|
| **Foundation** | Basic log ingestion, initial dashboards | Data flowing, 1+ analyst using |
| **Operational** | Detection rules active, alerts configured | MTTD measurable, SOC integrated |
| **Advanced** | SOAR integration, custom detections | Automation in place, metrics improving |
| **Optimized** | Full XDR, threat hunting active | Reference customer, expanding use cases |

**Triggers:**
- New Security customer closes
- Security upgrade opportunity
- Competitive displacement

### Observability Stage Adoption

**Path:** `playbooks/executable/PB_CS_102_observability_stage_adoption.yaml`

Guides customers through APM, logging, and infrastructure monitoring adoption.

| Maturity Level | Description | Success Indicators |
|---------------|-------------|---------------------|
| **Foundation** | Agent deployed, basic metrics | Data ingesting, initial dashboards |
| **Operational** | APM traces, log correlation | MTTR measurable, SLOs defined |
| **Advanced** | Full stack visibility, alerting | SRE practices adopted, on-call integrated |
| **Optimized** | AIOps, predictive detection | Platform standard, business metrics tied |

### Search Stage Adoption

**Path:** `playbooks/executable/PB_CS_103_search_stage_adoption.yaml`

Guides customers through enterprise search and AI-powered retrieval adoption.

| Maturity Level | Description | Success Indicators |
|---------------|-------------|---------------------|
| **Foundation** | Index created, basic search | Search functional, initial users |
| **Operational** | Relevance tuned, integrations | User adoption growing, feedback positive |
| **Advanced** | Vector search, semantic queries | AI features active, multiple use cases |
| **Optimized** | RAG implementation, platform | Strategic capability, business impact |

---

## Engagement Cadence Playbooks

Structured engagement rhythms that maintain customer relationships and drive value realization.

### Discovery Engagement

**Path:** `playbooks/executable/PB_CS_201_discovery_engagement.yaml`

Structured approach to understanding customer needs, challenges, and success criteria.

| Discovery Type | Duration | Depth | Use Case |
|---------------|----------|-------|----------|
| **Conversational** | 30 min | Surface | Initial qualification |
| **Day in the Life** | 2-4 hours | Workflow | Use case understanding |
| **Focused Session** | Half day | Process | Specific pain points |
| **Value Workshop** | 1-2 days | Full analysis | Strategic accounts |

**Key Questions:**
- Business: What outcomes matter most? What's the cost of the current state?
- Technical: What's the current architecture? What are the constraints?
- People: Who are the stakeholders? Who will use this daily?
- Process: What workflows will change? What's the change management approach?

### Cadence Calls

**Path:** `playbooks/executable/PB_CS_202_cadence_calls.yaml`

Regular touchpoint framework for maintaining engagement and tracking progress.

| Call Type | Frequency | Audience | Focus |
|-----------|-----------|----------|-------|
| **Technical Check-in** | Weekly/Biweekly | Technical champion | Issues, blockers, adoption |
| **Business Review** | Monthly | Sponsor + Champion | Outcomes, metrics, roadmap |
| **Executive Review** | Quarterly | Executive Sponsor | Strategic alignment, value |
| **Renewal Planning** | T-90 days | All stakeholders | Value delivered, renewal path |

**Preparation Checklist:**
- [ ] Review health score and recent signals
- [ ] Check action items from last call
- [ ] Review usage metrics and trends
- [ ] Prepare talking points and questions
- [ ] Confirm attendees and logistics

### Executive Business Reviews (EBR)

**Path:** `playbooks/executable/PB_CS_203_executive_review.yaml`

Quarterly executive engagement for strategic alignment and relationship building.

**Structure:**
1. **Business Update** (5 min) - Customer shares priorities
2. **Value Delivered** (10 min) - Outcomes achieved, metrics
3. **Adoption Progress** (10 min) - Journey status, next phase
4. **Roadmap Alignment** (10 min) - Product direction, customer needs
5. **Strategic Discussion** (15 min) - Future vision, expansion
6. **Action Items** (5 min) - Clear next steps, owners

---

## Health Management Playbooks

Proactive engagement based on customer health indicators.

### Health Triage

**Path:** `playbooks/executable/PB_CS_301_health_triage.yaml`

Structured response to declining health scores and risk indicators.

| Health Zone | Score Range | Response | Cadence |
|------------|-------------|----------|---------|
| **Green** | 80-100 | Maintain rhythm, focus on expansion | Standard |
| **Yellow** | 60-79 | Increased engagement, address concerns | 1.5x frequency |
| **Orange** | 40-59 | Active intervention, recovery plan | 2x frequency |
| **Red** | 0-39 | Executive escalation, retention focus | Daily/Weekly |

**Triage Steps:**
1. Analyze health score components
2. Identify root cause with Five Whys
3. Create recovery plan
4. Engage appropriate resources
5. Track progress to green

### Risk Intervention

**Path:** `playbooks/executable/PB_CS_302_risk_intervention.yaml`

Response playbook when specific risk indicators trigger.

| Risk Type | Indicators | Response |
|-----------|------------|----------|
| **Usage Decline** | 30%+ drop in usage metrics | Technical check-in, enablement |
| **Champion Loss** | Key contact departed | Stakeholder mapping, relationship rebuild |
| **Competitive Threat** | Competitor mentioned, RFP activity | CI engagement, value reinforcement |
| **Technical Issues** | Support escalations, blockers | SA/Support engagement, resolution focus |
| **Commercial Risk** | Payment issues, budget concerns | AE engagement, value justification |

### Renewal Protection

**Path:** `playbooks/executable/PB_CS_303_renewal_protection.yaml`

Systematic approach to ensuring successful renewals.

| Timeline | Focus | Activities |
|----------|-------|------------|
| **T-180** | Assessment | Health review, risk identification |
| **T-120** | Value Story | Document outcomes, prepare case study |
| **T-90** | Renewal Kickoff | Stakeholder alignment, expansion discussion |
| **T-60** | Commercial | Quote preparation, negotiation support |
| **T-30** | Close | Signature pursuit, last objection handling |
| **T-0** | Celebration | Success announcement, next year planning |

---

## Technical Enablement Playbooks

Hands-on technical engagement to drive adoption and value realization.

### Technical Workshop

**Path:** `playbooks/executable/PB_CS_401_technical_workshop.yaml`

Structured technical sessions to enable customer teams.

| Workshop Type | Duration | Audience | Outcome |
|--------------|----------|----------|---------|
| **Quick Start** | 2 hours | New users | Basic proficiency |
| **Use Case Deep Dive** | Half day | Technical team | Use case expertise |
| **Admin Training** | Full day | Platform admins | Operational readiness |
| **Architecture Review** | Half day | Architects | Optimization recommendations |

### Migration Playbook

**Path:** `playbooks/executable/PB_CS_402_migration.yaml`

Structured guidance for customers migrating from competitive solutions.

**Phases:**
1. **Assessment** - Current state, data inventory, requirements
2. **Planning** - Migration approach, timeline, resources
3. **Execution** - Data migration, configuration, validation
4. **Cutover** - Go-live support, parallel running, decommission
5. **Optimization** - Tuning, advanced features, value capture

**Common Migration Paths:**
- SIEM: LegacySIEM, LegacySIEM3, LegacySIEM2 → Platform Security
- Observability: ObservabilityVendorA, ObservabilityVendorC, ObservabilityVendorB → Platform Observability
- Search: Custom Solr, legacy search → Platform Cloud

### POV Execution

**Path:** `playbooks/executable/PB_CS_403_pov_execution.yaml`

Proof of Value execution framework for technical evaluations.

See also: POC Success Plan guidance in the POC Agent configuration.

| POV Type | Duration | Depth | Typical Use |
|----------|----------|-------|-------------|
| **Guided POV** | 2-4 weeks | Comprehensive | Strategic deals, competitive |
| **Lite POV** | 1 week | Focused | Mid-market, single use case |
| **Self-Guided** | Flexible | Basic | SMB, technical buyers |
| **Paid POV** | 2-8 weeks | Production-like | Enterprise, complex requirements |

---

## Lifecycle Transition Playbooks

Smooth handoffs between stages and teams.

### Pre-to-Post Sales Handoff

**Path:** `playbooks/executable/PB_CS_501_handoff_presales_postsales.yaml`

Structured handoff from SA/AE to CA/AM.

**Handoff Checklist:**
- [ ] CSP complete and up-to-date
- [ ] Stakeholder map transferred
- [ ] Technical architecture documented
- [ ] Open items and risks captured
- [ ] First 90-day plan defined
- [ ] Introductory call scheduled
- [ ] CRM updated with handoff notes

**Context Transfer:**
| Item | Owner | Recipient |
|------|-------|-----------|
| Business outcomes | AE | AM |
| Technical decisions | SA | CA |
| Stakeholder relationships | AE/SA | CA/AM |
| Risks and concerns | SA | CA |
| Expansion opportunities | AE | AM |

### Expansion Planning

**Path:** `playbooks/executable/PB_CS_502_expansion_planning.yaml`

Systematic approach to identifying and executing expansion opportunities.

**Expansion Types:**
- **Use Case Expansion** - Additional use cases on existing platform
- **User Expansion** - More users within existing use case
- **Capacity Expansion** - Higher tiers, more resources
- **Geographic Expansion** - New regions or business units
- **Solution Expansion** - New product areas (Security → Observability)

---

## Analysis Framework Playbooks

Strategic analysis tools integrated into customer success workflows.

### Five Whys Analysis

**Path:** `playbooks/solution_architects/PB_105_five_whys_analysis.yaml`

Root cause analysis for customer issues and blockers.

Use when:
- Customer issue recurs despite resolution attempts
- Health score decline with unclear cause
- Deal loss or significant churn
- Strategic blocker preventing expansion

### Retrospective

**Path:** `playbooks/executable/PB_601_retrospective.yaml`

Structured reflection on wins and losses.

Use when:
- Deal closes (won or lost)
- Major milestone completed
- Customer churn event
- Project completion

### Account Planning

**Path:** `playbooks/executable/PB_602_account_planning.yaml`

Annual strategic planning with integrated root cause analysis.

Use when:
- Annual planning cycle (Q4)
- New strategic account designation
- Executive sponsor change
- Significant account event (acquisition, reorganization)

### SWOT Analysis

**Path:** `playbooks/executable/PB_201_swot_analysis.yaml`

Strategic position analysis for account strategy.

---

## Playbook Integration

### With Signals

Playbooks automatically trigger based on signal events:

| Signal | Playbook Triggered |
|--------|-------------------|
| `SIG_HLT_001` (Health Alert) | Health Triage |
| `SIG_LC_003` (Renewal Mode) | Renewal Protection |
| `SIG_COM_002` (Deal Closed) | Retrospective, Handoff |
| `SIG_TECH_001` (Tech Signal Map) | Stage Adoption refresh |

### With Agents

| Agent | Primary Playbooks |
|-------|------------------|
| **CA Agent** | Stage Adoption, Cadence, Health Triage |
| **SA Agent** | Discovery, POV, Technical Workshop |
| **AE Agent** | Account Planning, Expansion Planning |
| **VE Agent** | Value Workshop, Executive Review |
| **Governance Agent** | Health Triage, Risk Intervention |

### With InfoHub

Playbook outputs stored in structured paths:

```
{realm}/{node}/
├── external-infohub/
│   ├── value/
│   │   ├── csp.yaml                 # Customer Success Plan
│   │   └── value_tracking.yaml      # Realized value
│   ├── journey/
│   │   └── adoption_journey.yaml    # Stage adoption status
│   └── decisions/
│       └── deal_retro_2026_01.md    # Deal retrospective
├── internal-infohub/
│   ├── governance/
│   │   └── account_plan_2026.md     # Annual account plan
│   └── actions/
│       └── expansion_plan.md        # Expansion opportunities
├── meetings/
│   ├── ebr_2026_q1.md              # Executive review notes
│   ├── workshops/                   # Workshop artifacts
│   └── calls/                       # Call notes
```

---

## Creating New Playbooks

### Playbook Structure

All playbooks follow the [Playbook Execution Specification v1.0](../architecture/playbooks/playbook-execution-specification.md):

```yaml
# Required metadata
framework_name: "Playbook Name"
framework_source: "Origin/methodology"
playbook_mode: "ANALYTICAL|GENERATIVE|OPERATIONAL"
intended_agent_role: "Primary agent"
secondary_agents: []

primary_objective: "What this playbook achieves"

# Trigger conditions
trigger_conditions:
  automatic: []
  manual: []

# Required inputs
validation_inputs:
  mandatory: []
  optional: []

# Key questions
key_questions: {}

# Decision logic
decision_logic:
  rules: []

# Expected outputs
expected_outputs:
  primary_artifact: {}
  notifications: []

# Stop conditions
stop_conditions:
  escalate_to_human: []
```

### Naming Convention

```
PB_CS_{NNN}_{descriptive_name}.yaml

Where:
- CS = Customer Success category
- NNN = Sequential number within category
- 1xx = Stage Adoption
- 2xx = Engagement Cadence
- 3xx = Health Management
- 4xx = Technical Enablement
- 5xx = Lifecycle Transitions
```

---

## Metrics & Measurement

### Playbook Effectiveness

| Metric | Definition | Target |
|--------|------------|--------|
| **Execution Rate** | % of triggered playbooks executed | > 90% |
| **Completion Rate** | % of playbooks completed successfully | > 85% |
| **Time to Value** | Days from playbook start to outcome | Varies |
| **Outcome Achievement** | % of playbook objectives met | > 80% |

### Stage Adoption Metrics

| Metric | Definition | Healthy Range |
|--------|------------|---------------|
| **Adoption Score** | % of expected features used | > 60% |
| **Time to First Value** | Days to first meaningful use | < 30 days |
| **Stage Progression** | % moving to next maturity level | > 50% / year |
| **Use Case Expansion** | Additional use cases adopted | 1+ / year |

### Engagement Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Engagement Rate** | % of cadence calls held | > 90% |
| **Executive Engagement** | Quarterly EBR completion | 100% |
| **NPS Trend** | Customer satisfaction trajectory | Stable/Improving |
| **Health Score Trend** | Account health trajectory | Stable/Improving |

---

## References

- [Playbook Execution Specification](../architecture/playbooks/playbook-execution-specification.md)
- [Signal Catalog](signal-catalog.md)
