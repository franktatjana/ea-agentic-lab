---
order: 9
---

# Customer Success Playbooks Adoption

A comprehensive framework for customer engagement, health management, and value realization. Adapted from industry customer success best practices.

## Why Adopt This?

| Problem | Playbook Solution |
|---------|------------------|
| Inconsistent customer engagement | Structured cadence framework |
| Reactive health management | Proactive triage and intervention |
| Undefined adoption journey | Stage-based maturity model |
| Siloed customer knowledge | Integrated InfoHub artifacts |
| Unclear escalation paths | Decision logic with triggers |

[image: CS Playbook Flow - how stage adoption, engagement, health management, and enablement playbooks connect]

## Framework Overview

### Playbook Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SUCCESS PLAYBOOKS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE ADOPTION (PB_CS_1xx)         ENGAGEMENT (PB_CS_2xx)                  │
│  ─────────────────────────          ──────────────────────                  │
│  Security: PB_CS_101                Discovery: PB_CS_201                    │
│  Observability: PB_CS_102           Cadence: PB_CS_202                      │
│  Search: PB_CS_103                  Executive Review: PB_CS_203             │
│                                                                              │
│  HEALTH MANAGEMENT (PB_CS_3xx)      ENABLEMENT (PB_CS_4xx)                  │
│  ──────────────────────────         ─────────────────────                   │
│  Health Triage: PB_CS_301           Technical Workshop: PB_CS_401           │
│  Risk Intervention: PB_CS_302       Migration: PB_CS_402                    │
│  Renewal Protection: PB_CS_303      POV Execution: PB_CS_403                │
│                                                                              │
│  LIFECYCLE (PB_CS_5xx)              ANALYSIS (PB_5xx/6xx)                   │
│  ─────────────────────              ────────────────────                    │
│  Handoff: PB_CS_501                 Five Whys: PB_105                       │
│  Expansion: PB_CS_502               Retrospective: PB_601                   │
│                                     Account Planning: PB_602                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Concepts

[image: Maturity-Health Matrix - stage adoption progression mapped against health zones]

#### Stage Adoption Model

Customers progress through maturity stages for each solution area:

| Stage | Description | Key Indicators |
|-------|-------------|----------------|
| **Foundation** | Basic deployment, initial use | Data flowing, users active |
| **Operational** | Active daily use, core workflows | Processes integrated, metrics tracked |
| **Advanced** | Automation, advanced features | Efficiency gains, custom development |
| **Optimized** | Strategic capability, full value | Reference potential, expanding |

#### Health Zones

Health scoring drives engagement intensity:

| Zone | Score | Engagement | Response |
|------|-------|------------|----------|
| **Green** | 80-100 | Standard | Maintain, optimize, expand |
| **Yellow** | 60-79 | 1.5x | Proactive intervention |
| **Orange** | 40-59 | 2x | Active recovery |
| **Red** | 0-39 | 3x | Crisis management |

#### Cadence Framework

Structured engagement rhythm based on account tier:

| Account Tier | Technical | Business | Executive |
|--------------|-----------|----------|-----------|
| Strategic | Weekly | Monthly | Quarterly |
| Enterprise | Biweekly | Monthly | Quarterly |
| Commercial | Monthly | Quarterly | Semi-annual |
| At-Risk | Weekly | Biweekly | Monthly |

## Agent Integration

### Which Agents Use These Playbooks?

| Agent | Primary Playbooks | Role |
|-------|------------------|------|
| **CA Agent** | Stage Adoption, Cadence, Health Triage | Owns post-sales customer journey |
| **SA Agent** | Technical Workshop, POV, Migration | Technical enablement and evaluation |
| **AE Agent** | Account Planning, Expansion | Commercial strategy and growth |
| **VE Agent** | Value Workshop, Executive Review | Value quantification and communication |
| **Governance Agent** | Health Triage, Risk Intervention | Oversight and escalation |
| **Meeting Notes Agent** | All | Extracts updates from meetings |

### Playbook Triggers

Playbooks execute automatically based on signals:

```yaml
signal_triggers:
  SIG_LC_002:  # New customer
    playbook: "PB_CS_101_security_stage_adoption"
    condition: "solution_area == 'security'"

  SIG_HLT_001:  # Health alert
    playbook: "PB_CS_301_health_triage"
    condition: "health_score < 70"

  SIG_LC_003:  # Renewal mode
    playbook: "PB_CS_303_renewal_protection"
    condition: "days_to_renewal <= 180"

  cadence_call_due:
    playbook: "PB_CS_202_cadence_calls"
    timing: "3 days before scheduled"
```

## Implementation Guide

### Phase 1: Foundation Playbooks

Start with core playbooks that provide immediate value:

- [x] `PB_CS_202_cadence_calls.yaml` - Engagement framework
- [x] `PB_CS_301_health_triage.yaml` - Health management
- [x] `PB_CS_101_security_stage_adoption.yaml` - Stage adoption model

### Phase 2: Extend Coverage

Add playbooks for complete lifecycle coverage:

- [ ] `PB_CS_102_observability_stage_adoption.yaml`
- [ ] `PB_CS_103_search_stage_adoption.yaml`
- [ ] `PB_CS_201_discovery_engagement.yaml`
- [ ] `PB_CS_203_executive_review.yaml`

### Phase 3: Advanced Playbooks

Complete the framework with specialized playbooks:

- [ ] `PB_CS_302_risk_intervention.yaml`
- [ ] `PB_CS_303_renewal_protection.yaml`
- [ ] `PB_CS_401_technical_workshop.yaml`
- [ ] `PB_CS_501_handoff_presales_postsales.yaml`

## InfoHub Integration

### Storage Structure

```
{realm}/{node}/
├── external-infohub/
│   ├── value/
│   │   ├── csp.yaml                     # Customer Success Plan
│   │   └── value_tracking.yaml          # Value realization
│   └── journey/
│       └── adoption_journey.yaml        # Stage adoption tracking
├── internal-infohub/
│   ├── governance/
│   │   ├── health_score.yaml            # Health metrics
│   │   └── health_triage_*.md           # Triage reports
│   └── actions/
│       └── account_plan_2026.md         # Annual planning
├── meetings/
│   ├── cadence_tracker.yaml             # Engagement schedule
│   ├── calls/                           # Meeting notes
│   │   ├── technical_2026_01_15.md
│   │   └── ebr_2026_q1.md
│   └── prep/                            # Call preparation
```

### Cross-Playbook Integration

Playbooks reference and trigger each other:

```yaml
# Health Triage triggers Stage Adoption
health_triage:
  component_declining: "adoption"
  triggers: "PB_CS_101_security_stage_adoption"
  reason: "Assess adoption stage and blockers"

# Stage Adoption triggers Five Whys
stage_adoption:
  blocker_persists: 30  # days
  triggers: "PB_105_five_whys_analysis"
  reason: "Root cause analysis for adoption blocker"

# Health Triage informs Cadence
health_triage:
  zone_change: true
  triggers: "PB_CS_202_cadence_calls"
  reason: "Adjust engagement frequency"
```

## Key Playbook Details

### Stage Adoption (PB_CS_101)

**Purpose:** Guide customers through solution adoption journey

**Key Features:**
- Four-stage maturity model (Foundation → Operational → Advanced → Optimized)
- Stage-specific success criteria
- Enablement activities per stage
- Blocker identification and resolution

**Outputs:**
- `adoption_journey.yaml` - Current stage and progression plan
- Action items for enablement activities
- Stage transition notifications

### Cadence Calls (PB_CS_202)

**Purpose:** Maintain structured engagement rhythm

**Call Types:**
- Technical Check-in (weekly/biweekly)
- Business Review (monthly)
- Executive Business Review (quarterly)
- Renewal Planning (T-90, T-60, T-30)

**Features:**
- Agenda templates per call type
- Preparation checklists
- Attendance tracking
- Missed call alerting

### Health Triage (PB_CS_301)

**Purpose:** Respond to health indicators systematically

**Health Components:**
- Engagement - Customer interaction quality
- Adoption - Solution usage depth
- Outcomes - Business results achieved
- Support - Technical experience
- Relationship - Stakeholder strength
- Commercial - Business health

**Intervention Playbooks:**
- Engagement Recovery
- Adoption Acceleration
- Value Recovery
- Technical Crisis

## Metrics & Measurement

### Playbook Effectiveness

| Metric | Target | Measurement |
|--------|--------|-------------|
| Execution Rate | > 90% | Triggered playbooks executed |
| Completion Rate | > 85% | Playbooks completed successfully |
| Outcome Achievement | > 80% | Objectives met |
| Time to Green | < 60 days | Orange/Red to Green recovery |

### Stage Adoption Metrics

| Metric | Healthy | At-Risk |
|--------|---------|---------|
| Stage Progression | 50%+ advance per year | Stalled 90+ days |
| Time to Foundation | < 30 days | > 60 days |
| Adoption Score | > 60% | < 40% |

### Engagement Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Cadence Adherence | > 90% | < 70% |
| Executive Engagement | Quarterly EBRs | Missed EBR |
| Response Rate | > 80% | < 50% |

## Adoption Checklist

### Prerequisites

- [ ] Health score framework operational (`PB_401_customer_health_score`)
- [ ] InfoHub structure established
- [ ] Signal catalog includes CS signals
- [ ] Agent configurations updated

### Playbook Deployment

- [x] Deploy `PB_CS_202_cadence_calls.yaml`
- [x] Deploy `PB_CS_301_health_triage.yaml`
- [x] Deploy `PB_CS_101_security_stage_adoption.yaml`
- [ ] Configure signal triggers
- [ ] Train agents on playbook usage
- [ ] Establish review cadence

### Operational Readiness

- [ ] CA team trained on playbooks
- [ ] Playbook metrics dashboard created
- [ ] Escalation paths documented
- [ ] Integration testing complete

## References

- [Playbook Catalog](../../reference/playbook-catalog.md)
- [Signal Catalog](../../reference/signal-catalog.md)
- [Playbook Execution Specification](../../architecture/playbooks/playbook-execution-specification.md)

## Sources

- Industry customer success best practices
- Enterprise account management methodologies
- Value realization frameworks
