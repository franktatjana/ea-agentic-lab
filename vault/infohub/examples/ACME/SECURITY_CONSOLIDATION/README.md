# ACME Corporation InfoHub

## CRITICAL STATUS UPDATE

| Field | Change |
|-------|--------|
| **Situation** | Industrietechnik acquisition announced Jan 15 |
| **Deal Value** | $800K → $1.75M (+119%) |
| **Timeline** | 12 months → 6 months (-50%) |
| **New Stakeholder** | Klaus Hoffman (CISO) - LegacySIEM background |
| **Escalation Level** | VP Sales (Robert Chen) |

---

**Account Tier**: Strategic | **ARR**: $3,500,000 | **Health Score**: 68/100 (↓4) | **Last Updated**: 2026-01-16

## Quick Links

| Section | Description | Status |
|---------|-------------|--------|
| [Account Profile](account_profile.yaml) | Core account data | Needs update |
| [Risk Register](risks/risk_register.yaml) | 12 risks (4 critical) | **ESCALATED** |
| [Decision Log](decisions/decision_log.yaml) | 11 decisions | 6 new strategic |
| [Action Tracker](actions/action_tracker.yaml) | 18 actions | 8 P0 due |
| [Health Score](governance/health_score.yaml) | 68/100 | **DECLINING** |
| [Klaus Hoffman](stakeholders/klaus_hoffman.yaml) | CISO Profile | **CRITICAL** |
| [Value Tracker](value/value_tracker.yaml) | $840K realized | In validation |
| [POC Success Plan](opportunities/security_poc/poc_success_plan.yaml) | Master POC plan | Pending approval |
| [Competitive Context](competitive/competitive_context.yaml) | LegacySIEM intelligence | War room active |
| [Journey Map](journey/customer_journey_map.yaml) | Customer journey | Evaluation stage |

## Active Opportunity - EXPANDED

| Field | Previous (Jan 12) | Current (Jan 16) | Delta |
|-------|-------------------|------------------|-------|
| **Value** | $800,000 | $1,750,000 | +119% |
| **Scope** | 8 plants | 20 plants | +150% |
| **Timeline** | 12 months | 6 months | -50% |
| **Competition** | Microsoft, LegacySIEM | LegacySIEM only | Focused |
| **Probability** | 65% | 45% | -20% |

## Critical Risks (4)

| Risk | Severity | Description |
|------|----------|-------------|
| CISO_BIAS | CRITICAL | New CISO has LegacySIEM background, controls decision |
| TIMELINE_CRITICAL | CRITICAL | 6-month timeline, scope doubled |
| LEGACYSIEM_FIGHT | CRITICAL | Incumbent at both companies |
| SCALE_PROOF | CRITICAL | Must prove 20-plant OT/ICS capability |

## Recent Meetings

### External
| Date | Attendee | Outcome |
|------|----------|---------|
| [**2026-01-15**](meetings/external/2026-01-15_cto_strategic_shift.md) | CTO + CISO | **Acquisition announced - situation changed** |
| [2026-01-10](meetings/external/2026-01-10_head_of_engineering.md) | Head of Eng | Budget approved |

### Internal
| Date | Type | Outcome |
|------|------|---------|
| [**2026-01-16**](meetings/internal/2026-01-16_emergency_deal_review.md) | Emergency Review | Full pursuit approved (VP) |
| [2026-01-12](meetings/internal/2026-01-12_deal_review.md) | Deal Review | Superseded |

## Framework Analyses

| Date | Framework | Status |
|------|-----------|--------|
| [**2026-01-16**](frameworks/PB_201_swot_20260116_revised.md) | SWOT Revised | **CURRENT** |
| [2026-01-12](frameworks/PB_001_three_horizons_20260112.md) | Three Horizons | Valid |
| [2026-01-12](frameworks/PB_301_value_engineering_20260112.md) | Value Engineering | Needs revision |

## P0 Actions (Immediate)

| Action | Owner | Due |
|--------|-------|-----|
| Revised POC proposal | Alex | Jan 17 |
| OT/ICS architecture | Maria | Jan 17 |
| LegacySIEM competitive brief | CI | Jan 17 |
| Klaus 1:1 meeting | James | Jan 19 |
| LegacySIEM migration assessment | Nina | Jan 20 |

## Stakeholder Map (Updated)

| Name | Title | Role | Stance |
|------|-------|------|--------|
| Marcus Weber | CTO | Exec Sponsor | Supportive |
| **Klaus Hoffman** | CISO | **Decision Maker** | Skeptical |
| Dr. Sarah Chen | Head of Eng | Technical Advocate | Supportive |

## Win Strategy

> **Klaus**: "I'm pragmatic. Show me it works, I'll support it."

**Path to Win**: Convert Klaus through POC excellence
**Key Differentiator**: Unified platform (only vendor with obs + security)

---

## InfoHub Structure

```
SECURITY_CONSOLIDATION/
├── README.md                              # This file (node summary)
├── node_profile.yaml                      # Node configuration and status
│
├── context/                               # Node background and context
│   ├── node_overview.yaml                 # Comprehensive node background
│   ├── stakeholder_map.yaml               # Aggregated stakeholder view
│   └── engagement_history.md              # Timeline of key interactions
│
├── meetings/
│   ├── external/
│   │   ├── 2026-01-15_cto_strategic_shift.md   # Acquisition announcement
│   │   └── 2026-01-10_head_of_engineering.md
│   └── internal/
│       ├── 2026-01-16_emergency_deal_review.md # VP-level escalation
│       └── 2026-01-12_deal_review.md
│
├── risks/
│   ├── risk_register.yaml                 # 12 active risks (4 critical)
│   └── risk_history.yaml                  # Resolved/closed risks
│
├── decisions/
│   └── decision_log.yaml                  # 11 decisions tracked
│
├── frameworks/
│   ├── PB_201_swot_20260116_revised.md    # Current SWOT
│   ├── PB_001_three_horizons_20260112.md
│   ├── PB_201_swot_20260112.md            # Superseded
│   └── PB_301_value_engineering_20260112.md
│
├── actions/
│   └── action_tracker.yaml                # 18 actions (P0-P2)
│
├── stakeholders/
│   ├── marcus_weber.yaml                  # CTO - Executive Sponsor
│   ├── klaus_hoffman.yaml                 # CISO - Decision Maker
│   └── sarah_chen.yaml                    # Head of Eng - Champion
│
├── architecture/
│   └── ADR_001_security_platform.md       # TOGAF ADR
│
├── value/
│   └── value_tracker.yaml                 # $840K realized
│
├── opportunities/
│   └── security_poc/                      # POC opportunity
│       ├── discovery.yaml                 # Discovery findings
│       ├── requirements.yaml              # Customer requirements
│       ├── success_criteria.yaml          # POC success criteria
│       ├── poc_success_plan.yaml          # Master POC plan
│       └── poc_status/                    # Daily status updates
│           └── status_2026-01-16.yaml
│
├── competitive/
│   └── competitive_context.yaml           # Competitive intelligence
│
├── journey/
│   ├── customer_journey_map.yaml          # Customer journey tracking
│   └── touchpoint_log.yaml                # Interaction history
│
├── governance/
│   ├── operating_cadence.yaml             # Meeting rhythms
│   └── health_score.yaml                  # 68/100 (declining)
│
└── agent_work/
    └── scratchpad_sa_2026-01-22_*.yaml    # Agent working documents
```

---
*InfoHub maintained by: SA Agent*
*Last update: 2026-01-16*
*Next review: 2026-01-17 (daily during critical)*
