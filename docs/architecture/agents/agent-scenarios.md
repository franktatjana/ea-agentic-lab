---
order: 3
---

# Agent-per-Team: End-to-End Scenarios

This document provides concrete, detailed scenarios showing how customer signals flow through the agent system to create automated insights and team alignment.

## How to Read These Scenarios

Each scenario follows the complete signal flow:
1. **Signal** → Customer or system event occurs
2. **Detection** → Agent identifies and classifies the signal
3. **InfoHub Update** → Relevant artifacts are automatically updated
4. **Prompt** → Owner receives actionable notification
5. **Alignment** → Team coordinates response

---

## Scenario 1: Technical Risk Detection (SA Agent)

[image: Scenario 1 Swimlane - technical risk detection signal flow across agents]

### Context
ACME Corp is a strategic account ($2.1M ARR) using the platform for security analytics. During a routine check-in call, the customer mentions performance issues.

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIGNAL                                                                       │
│ Customer: "Since we increased log ingestion to 50TB/day, search latency     │
│ has gone from 200ms to 3 seconds. Our SOC team is complaining."             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SA AGENT DETECTION                                                           │
│                                                                              │
│ Keywords matched: "latency", "ingestion", "complaining"                     │
│ Severity indicators: "SOC team" (production), "3 seconds" (degradation)     │
│ Classification: HIGH severity technical risk                                │
│                                                                              │
│ Extracted facts:                                                             │
│ • Current ingestion: 50TB/day                                               │
│ • Latency before: 200ms                                                     │
│ • Latency now: 3 seconds (15x degradation)                                  │
│ • Affected team: SOC (security operations)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ INFOHUB UPDATES (Automatic)                                                  │
│                                                                              │
│ 1. acme/security_consolidation/internal-infohub/risks/risk_register.yaml    │
│    + risk_id: RSK-2024-0047                                                 │
│    + description: "Search latency degradation after ingestion increase"     │
│    + severity: high                                                         │
│    + category: performance                                                  │
│    + source: "Customer call 2024-01-15"                                     │
│    + owner: [SA - pending assignment]                                       │
│                                                                              │
│ 2. acme/security_consolidation/external-infohub/architecture/adr/           │
│    + ADR-2024-012-capacity-review.md created                                │
│    + Status: "Investigation Required"                                       │
│    + Context: Current cluster sizing vs actual workload                     │
│                                                                              │
│ 3. acme/security_consolidation/internal-infohub/actions/action_tracker.yaml │
│    + action: "Perform capacity analysis for 50TB/day workload"              │
│    + owner: SA                                                              │
│    + due: 2024-01-17 (48h SLA for high severity)                           │
│    + linked_risk: RSK-2024-0047                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OWNER PROMPT (SA receives)                                                   │
│                                                                              │
│ ⚠️ HIGH PRIORITY: Performance risk detected - ACME Corp                     │
│                                                                              │
│ Customer reported 15x latency degradation (200ms → 3s) after increasing     │
│ ingestion to 50TB/day. SOC team affected.                                   │
│                                                                              │
│ Action required: Capacity analysis                                          │
│ Due: 2024-01-17                                                             │
│ Risk ID: RSK-2024-0047                                                      │
│                                                                              │
│ Quick actions:                                                               │
│ [Accept & Start] [Request Specialist] [Escalate] [Need More Context]        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM ALIGNMENT                                                               │
│                                                                              │
│ SA clicks [Request Specialist] → Specialist Agent triggered                 │
│                                                                              │
│ Specialist Agent:                                                            │
│ • Checks specialist availability                                             │
│ • Identifies this as "Complex sizing" (specialist trigger)                  │
│ • Creates specialist engagement request                                      │
│ • Notifies Specialist Lead                                                  │
│                                                                              │
│ AE Agent (parallel notification):                                           │
│ • Receives health signal: "Technical risk - high severity"                  │
│ • Updates account health score                                              │
│ • Adds to next customer call prep                                           │
│                                                                              │
│ Nudger Agent:                                                                │
│ • Tracks action due date                                                    │
│ • Will send reminder on 2024-01-16 (24h before due)                         │
│                                                                              │
│ Result: SA + Specialist aligned, AE aware, action tracked                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outcome
- Risk surfaced within minutes of customer mention
- Action created with clear owner and deadline
- Specialist engaged automatically based on complexity
- AE kept informed without manual update
- Follow-through guaranteed by Nudger

---

## Scenario 2: Commercial Risk & Deal Slippage (AE Agent)

[image: Scenario 2 Swimlane - commercial risk escalation across AE, VE, and Senior Manager]

### Context
Global Manufacturing Inc has a $1.5M expansion opportunity in Stage 3 (Validation). The AE notices concerning signals in email communication.

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIGNAL                                                                       │
│ Email from customer: "Hi, I need to let you know that our CFO has called    │
│ for a budget review of all new IT investments. Our decision timeline has    │
│ moved from Q1 to 'TBD'. I'll keep you posted."                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ AE AGENT DETECTION                                                           │
│                                                                              │
│ Keywords matched: "budget review", "decision delayed", "TBD"                │
│ Severity indicators: "CFO" (executive level), "all new IT investments"     │
│ Classification: HIGH severity commercial risk                               │
│                                                                              │
│ Pattern identified: DEAL_SLIP_RISK                                          │
│ • Close date at risk                                                        │
│ • Decision maker change implied (CFO involvement)                           │
│ • Budget uncertainty introduced                                             │
│                                                                              │
│ Extracted facts:                                                             │
│ • Original timeline: Q1                                                     │
│ • New timeline: TBD (undefined)                                             │
│ • Trigger: CFO budget review                                                │
│ • Scope: All IT investments (not platform-specific)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ INFOHUB UPDATES (Automatic)                                                  │
│                                                                              │
│ 1. global_mfg/expansion/internal-infohub/risks/risk_register.yaml           │
│    + risk_id: RSK-2024-0048                                                 │
│    + description: "CFO-triggered budget review, timeline moved to TBD"      │
│    + severity: high                                                         │
│    + category: commercial                                                   │
│    + churn_indicator: true                                                  │
│                                                                              │
│ 2. global_mfg/expansion/internal-infohub/commercial/forecast_notes.yaml     │
│    + close_date_confidence: LOW (was HIGH)                                  │
│    + risk_factors: ["CFO budget review", "Timeline TBD"]                    │
│    + recommended_action: "Engage executive sponsor"                         │
│                                                                              │
│ 3. global_mfg/expansion/internal-infohub/stakeholders/                      │
│    + CFO added as key stakeholder (influence: HIGH, sentiment: UNKNOWN)     │
│                                                                              │
│ 4. global_mfg/expansion/raw/meetings/next_call_prep.md                      │
│    + Added: "Address budget review concerns"                                │
│    + Added: "Confirm CFO requirements"                                      │
│    + Added: "Revisit value justification"                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OWNER PROMPT (AE receives)                                                   │
│                                                                              │
│ 🚨 DEAL SLIP RISK: Global Manufacturing Inc - $1.5M Expansion               │
│                                                                              │
│ Customer reported CFO budget review affecting all IT investments.           │
│ Timeline moved from Q1 to TBD.                                              │
│                                                                              │
│ Recommended actions:                                                         │
│ 1. Update CRM close date and add risk flag                                  │
│ 2. Engage Executive Sponsor for CFO-level conversation                      │
│ 3. Prepare revised value justification (VE engagement recommended)          │
│ 4. Schedule internal deal review                                            │
│                                                                              │
│ Risk ID: RSK-2024-0048                                                      │
│                                                                              │
│ Quick actions:                                                               │
│ [Update CRM] [Request Exec Sponsor] [Engage VE] [Schedule Review]           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM ALIGNMENT                                                               │
│                                                                              │
│ AE clicks [Engage VE] and [Request Exec Sponsor]                            │
│                                                                              │
│ VE Agent triggered:                                                          │
│ • Pulls existing value hypothesis from InfoHub                              │
│ • Identifies: original business case may need CFO-level framing             │
│ • Creates action: "Develop CFO-focused ROI summary"                         │
│ • Schedules VE engagement within 48h                                        │
│                                                                              │
│ Senior Manager Agent notified:                                              │
│ • Deal >$1M at risk → automatic escalation                                  │
│ • Executive sponsor engagement requested                                     │
│ • Receives briefing pack with risk context                                  │
│                                                                              │
│ SA Agent (parallel notification):                                           │
│ • Receives signal: "Commercial risk - timeline slip"                        │
│ • Pauses any pending technical proposals                                    │
│ • Adds note: "Await commercial clarity before next architecture session"    │
│                                                                              │
│ Reporter Agent:                                                              │
│ • Updates forecast dashboard                                                │
│ • Flags deal in weekly pipeline review                                      │
│                                                                              │
│ Result: AE + VE + Exec Sponsor + SA aligned, deal review scheduled          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outcome
- Commercial risk identified from email signal
- CRM and InfoHub synchronized
- Value Engineering engaged to strengthen business case
- Executive sponsor involvement triggered
- SA pauses technical work pending commercial clarity
- Deal flagged for leadership review

---

## Scenario 3: Feature Gap & Roadmap Dependency (PM Agent)

[image: Scenario 3 Swimlane - feature gap coordination between PM, SA, and AE]

### Context
FinServ Corp ($800K ARR) is evaluating expansion into a new use case. During discovery, a critical feature gap is identified.

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIGNAL                                                                       │
│ Meeting notes: "Customer requires real-time correlation across 10+ data     │
│ sources with sub-second alerting. Current capability is 5 sources with      │
│ 30-second delay. Customer stated this is a 'must-have' for the SOC          │
│ consolidation project. Asked if this is on the roadmap."                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PM AGENT DETECTION                                                           │
│                                                                              │
│ Keywords matched: "roadmap", "must-have", "capability", "requires"          │
│ Pattern identified: FEATURE_GAP                                             │
│                                                                              │
│ Gap analysis:                                                                │
│ • Required: 10+ sources, sub-second alerting                                │
│ • Current: 5 sources, 30-second delay                                       │
│ • Gap severity: SIGNIFICANT (2x sources, 30x latency improvement)           │
│ • Customer priority: MUST-HAVE (blocking)                                   │
│                                                                              │
│ Roadmap check (automatic):                                                  │
│ • Feature: "Extended correlation sources" - Planned Q3                      │
│ • Feature: "Sub-second alerting" - Not on roadmap                           │
│ • Classification: PARTIAL_ROADMAP + ENHANCEMENT_REQUIRED                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ INFOHUB UPDATES (Automatic)                                                  │
│                                                                              │
│ 1. finserv/soc_consolidation/internal-infohub/governance/product/feature_requests.yaml │
│    + request_id: FR-2024-0089                                               │
│    + description: "10+ source correlation with sub-second alerting"         │
│    + customer_priority: must-have                                           │
│    + gap_severity: significant                                              │
│    + roadmap_status: partial (sources Q3, alerting not planned)             │
│    + deal_impact: blocking                                                  │
│                                                                              │
│ 2. finserv/soc_consolidation/internal-infohub/risks/risk_register.yaml      │
│    + risk_id: RSK-2024-0049                                                 │
│    + description: "Feature gap may block SOC consolidation deal"            │
│    + severity: high                                                         │
│    + category: product                                                      │
│    + mitigation_options: ["Workaround", "Roadmap acceleration", "Scope"]    │
│                                                                              │
│ 3. finserv/soc_consolidation/external-infohub/decisions/decision_log.yaml   │
│    + decision_needed: "Accept gap / propose workaround / escalate to PM"    │
│    + deadline: 2024-01-20                                                   │
│    + stakeholders: [AE, SA, PM]                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OWNER PROMPT (PM receives)                                                   │
│                                                                              │
│ 📋 FEATURE GAP: FinServ Corp - SOC Consolidation ($800K)                    │
│                                                                              │
│ Customer requires capability beyond current product:                         │
│ • 10+ source correlation (current: 5) - Planned Q3                          │
│ • Sub-second alerting (current: 30s) - NOT on roadmap                       │
│                                                                              │
│ Customer marked as "must-have" for deal.                                    │
│                                                                              │
│ Options to evaluate:                                                         │
│ 1. Confirm Q3 timeline acceptable for source expansion                      │
│ 2. Assess feasibility of sub-second alerting                                │
│ 3. Propose architectural workaround                                         │
│ 4. Escalate for roadmap consideration                                       │
│                                                                              │
│ Request ID: FR-2024-0089                                                    │
│                                                                              │
│ Quick actions:                                                               │
│ [Feasibility Assessment] [Propose Workaround] [Escalate] [Decline]          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM ALIGNMENT                                                               │
│                                                                              │
│ PM clicks [Feasibility Assessment] for alerting                             │
│ PM confirms Q3 timeline acceptable for sources                              │
│                                                                              │
│ PM Agent updates:                                                            │
│ • Feature request status: "Under feasibility review"                        │
│ • Expected response: 5 business days                                        │
│ • Partial green light: Source expansion Q3 confirmed                        │
│                                                                              │
│ SA Agent notified:                                                           │
│ • Receives: "Feature gap identified, workaround may be needed"              │
│ • Creates action: "Design interim architecture for 30s→sub-second"          │
│ • Evaluates: Can streaming + pre-aggregation close the gap?                 │
│                                                                              │
│ AE Agent notified:                                                           │
│ • Receives: "Product dependency for FinServ deal"                           │
│ • Updates deal risk factors                                                 │
│ • Prepares customer messaging options                                       │
│                                                                              │
│ Decision Registrar:                                                          │
│ • Logs: "Feature gap assessment initiated"                                  │
│ • Sets review deadline: 2024-01-20                                          │
│ • Links all related artifacts                                               │
│                                                                              │
│ Result: PM assessing, SA designing workaround, AE prepared for messaging    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outcome
- Feature gap immediately visible to product and field teams
- Roadmap status automatically checked and classified
- Risk created linking product gap to deal impact
- SA proactively designing workaround
- AE prepared with messaging options
- Clear decision deadline set

---

## Scenario 4: Meeting → Governance Flow (Meeting Notes + Governance Agents)

[image: Scenario 4 Swimlane - meeting notes triggering parallel governance processing]

### Context
Weekly steering committee meeting for TechCorp strategic account. Meeting notes are submitted for processing.

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIGNAL                                                                       │
│ Meeting notes submitted:                                                     │
│ "Attendees: John (AE), Sarah (SA), Mike (Customer CTO)                      │
│                                                                              │
│ Mike confirmed they will proceed with Phase 2 expansion ($500K).            │
│ Decision: Use platform for SIEM consolidation starting Q2.                   │
│                                                                              │
│ Sarah raised concern about current cluster capacity for Phase 2 load.       │
│ Risk: May need infrastructure upgrade before go-live.                       │
│                                                                              │
│ Action: John to send revised SOW by Friday.                                 │
│ Action: Sarah to complete capacity assessment by next Tuesday.              │
│                                                                              │
│ Open question: Who will be the project sponsor on customer side?"           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ MEETING NOTES AGENT EXTRACTION                                               │
│                                                                              │
│ Decisions extracted:                                                         │
│ • "Proceed with Phase 2 expansion ($500K)" - Maker: Mike (CTO)              │
│ • "Use platform for SIEM consolidation starting Q2" - Maker: Mike (CTO)     │
│                                                                              │
│ Actions extracted:                                                           │
│ • "Send revised SOW" - Owner: John - Due: Friday                            │
│ • "Complete capacity assessment" - Owner: Sarah - Due: next Tuesday         │
│                                                                              │
│ Risks extracted:                                                             │
│ • "Infrastructure upgrade may be needed before go-live" - Raised: Sarah     │
│                                                                              │
│ Questions extracted:                                                         │
│ • "Who will be project sponsor on customer side?" - Status: OPEN            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ GOVERNANCE AGENT PROCESSING (Parallel)                                       │
│                                                                              │
│ TASK SHEPHERD validates actions:                                             │
│ ✓ "Send revised SOW" - Owner valid, due date set, actionable               │
│ ✓ "Complete capacity assessment" - Owner valid, due date set, actionable   │
│ → Both actions validated and routed to Nudger                               │
│                                                                              │
│ DECISION REGISTRAR logs decisions:                                           │
│ • DEC-2024-0156: Phase 2 expansion confirmed                                │
│   - Maker: Mike (Customer CTO)                                              │
│   - Value: $500K                                                            │
│   - Context: Steering committee 2024-01-15                                  │
│ • DEC-2024-0157: SIEM consolidation approach confirmed                      │
│   - Maker: Mike (Customer CTO)                                              │
│   - Timeline: Q2                                                            │
│   - Context: Steering committee 2024-01-15                                  │
│                                                                              │
│ RISK RADAR classifies risk:                                                  │
│ • RSK-2024-0050: Infrastructure upgrade dependency                          │
│   - Severity: MEDIUM (manageable with planning)                             │
│   - Likelihood: POSSIBLE                                                    │
│   - Category: Technical/Delivery                                            │
│   - Linked to: Phase 2 go-live                                              │
│                                                                              │
│ NUDGER creates tracking:                                                     │
│ • ACT-2024-0201: SOW revision                                               │
│   - Owner: John                                                             │
│   - Due: 2024-01-19 (Friday)                                                │
│   - Reminder scheduled: 2024-01-18                                          │
│ • ACT-2024-0202: Capacity assessment                                        │
│   - Owner: Sarah                                                            │
│   - Due: 2024-01-23 (Tuesday)                                               │
│   - Reminder scheduled: 2024-01-22                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ INFOHUB UPDATES (Automatic)                                                  │
│                                                                              │
│ techcorp/phase2/raw/meetings/2024-01-15-steering.md                         │
│ + Full meeting notes archived                                               │
│ + Linked: DEC-2024-0156, DEC-2024-0157, RSK-2024-0050                       │
│ + Linked: ACT-2024-0201, ACT-2024-0202                                      │
│                                                                              │
│ techcorp/phase2/external-infohub/decisions/decision_log.yaml                │
│ + 2 new decisions registered                                                │
│                                                                              │
│ techcorp/phase2/internal-infohub/risks/risk_register.yaml                   │
│ + 1 new risk registered                                                     │
│                                                                              │
│ techcorp/phase2/internal-infohub/actions/action_tracker.yaml                │
│ + 2 new actions tracked                                                     │
│                                                                              │
│ techcorp/phase2/internal-infohub/governance/open_questions.yaml             │
│ + 1 new question: Project sponsor identification                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ OWNER PROMPTS                                                                │
│                                                                              │
│ John (AE) receives:                                                          │
│ ✅ Meeting processed: TechCorp Steering 2024-01-15                          │
│ 📋 Your action: Send revised SOW                                            │
│    Due: Friday (2024-01-19)                                                 │
│ ❓ Open question assigned: Identify customer project sponsor                │
│                                                                              │
│ Sarah (SA) receives:                                                         │
│ ✅ Meeting processed: TechCorp Steering 2024-01-15                          │
│ 📋 Your action: Complete capacity assessment                                │
│    Due: Tuesday (2024-01-23)                                                │
│ ⚠️ Risk you raised now tracked: RSK-2024-0050                               │
│                                                                              │
│ Senior Manager receives:                                                     │
│ 📊 TechCorp steering summary:                                               │
│ • 2 decisions: Phase 2 confirmed ($500K), SIEM approach locked             │
│ • 1 risk: Infrastructure capacity                                           │
│ • 2 actions: SOW + Capacity assessment                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ TEAM ALIGNMENT                                                               │
│                                                                              │
│ All stakeholders have:                                                       │
│ • Same understanding of decisions made                                      │
│ • Clear action ownership with deadlines                                     │
│ • Risk visibility across the team                                           │
│ • Open questions tracked for follow-up                                      │
│                                                                              │
│ Automatic follow-through:                                                    │
│ • Nudger will remind John on Thursday (day before SOW due)                  │
│ • Nudger will remind Sarah on Monday (day before assessment due)            │
│ • If actions slip, escalation path activates automatically                  │
│                                                                              │
│ Knowledge persists:                                                          │
│ • Decisions searchable in decision log                                      │
│ • Risk tracked until mitigated                                              │
│ • Meeting context preserved for future reference                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outcome
- Single meeting notes submission triggers complete governance flow
- Decisions, actions, risks extracted without manual effort
- All items linked to source meeting
- Owners notified with clear expectations
- Follow-through automated via Nudger
- Knowledge preserved in InfoHub for continuity

---

## Scenario 5: Escalation Chain (Nudger + Senior Manager)

[image: Scenario 5 Swimlane - escalation chain timeline from overdue to resolution]

### Context
An action item has been overdue for 5 days with no response from the owner.

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TIMELINE                                                                     │
│                                                                              │
│ Day 0: Action created "Finalize security questionnaire" - Owner: Tom        │
│        Due: 2024-01-10                                                      │
│                                                                              │
│ Day -1 (Jan 9): Nudger sends reminder                                       │
│        "Action due tomorrow: Finalize security questionnaire"               │
│        Tom: No response                                                     │
│                                                                              │
│ Day 0 (Jan 10): Nudger sends due-day reminder                              │
│        "Action due today: Finalize security questionnaire"                  │
│        Tom: No response                                                     │
│                                                                              │
│ Day +1 (Jan 11): Nudger sends overdue notice                               │
│        "Action overdue by 1 day: Finalize security questionnaire"           │
│        Tom: No response                                                     │
│                                                                              │
│ Day +3 (Jan 13): Nudger sends second overdue notice                        │
│        "Action overdue by 3 days: Finalize security questionnaire"          │
│        Tom: No response                                                     │
│                                                                              │
│ Day +5 (Jan 15): ESCALATION TRIGGERED                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ NUDGER AGENT ESCALATION                                                      │
│                                                                              │
│ Escalation criteria met:                                                     │
│ • Overdue > 5 days ✓                                                        │
│ • Owner unresponsive after 2 nudges ✓                                       │
│ • Action blocking: InfoSec review (customer-facing commitment)              │
│                                                                              │
│ Escalation path activated:                                                   │
│ • Level 1 (Direct owner): Exhausted - 4 nudges, no response                │
│ • Level 2 (Owner's manager): ACTIVATING                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SENIOR MANAGER AGENT RECEIVES                                                │
│                                                                              │
│ 🚨 ESCALATION: Overdue Action - Customer Commitment at Risk                 │
│                                                                              │
│ Action: Finalize security questionnaire                                     │
│ Owner: Tom                                                                  │
│ Due: 2024-01-10                                                             │
│ Status: Overdue by 5 days                                                   │
│ Previous nudges: 4 (no response)                                            │
│                                                                              │
│ Blocking: InfoSec review for customer RFP                                   │
│ Customer impact: RFP response deadline 2024-01-20                           │
│                                                                              │
│ Context:                                                                     │
│ • Tom has 3 other overdue items this month                                  │
│ • Pattern suggests capacity issue                                           │
│                                                                              │
│ Recommended actions:                                                         │
│ 1. Contact Tom directly                                                     │
│2. Reassign if capacity issue confirmed                                     │
│ 3. Escalate to leadership if pattern continues                              │
│                                                                              │
│ Quick actions:                                                               │
│ [Contact Owner] [Reassign] [Extend Deadline] [Escalate Further]             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESOLUTION FLOW                                                              │
│                                                                              │
│ Senior Manager clicks [Contact Owner]                                       │
│ → Discovers Tom is on unexpected medical leave                              │
│ → Clicks [Reassign] → Selects: Maria                                        │
│                                                                              │
│ Nudger Agent updates:                                                        │
│ • Owner changed: Tom → Maria                                                │
│ • New due date: 2024-01-17 (2 days to complete)                             │
│ • Escalation resolved                                                       │
│ • Note added: "Reassigned due to owner unavailability"                      │
│                                                                              │
│ Maria receives:                                                              │
│ 📋 Action reassigned to you: Finalize security questionnaire               │
│    Due: 2024-01-17                                                          │
│    Context: Originally assigned to Tom, reassigned by Senior Manager        │
│    Priority: HIGH (blocking customer RFP)                                   │
│                                                                              │
│ InfoSec Agent notified:                                                      │
│ • Dependency update: Security questionnaire now ETA 2024-01-17              │
│ • RFP timeline impact: Still achievable if delivered on time                │
│                                                                              │
│ Reporter Agent:                                                              │
│ • Logs escalation event                                                     │
│ • Updates follow-through metrics                                            │
│ • Notes pattern: Tom - 3 overdue items (capacity review recommended)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Outcome
- Overdue action automatically escalated after defined period
- Manager received full context without manual research
- Reassignment handled smoothly with proper handoff
- Dependent teams (InfoSec) notified of timeline change
- Pattern identified for proactive capacity management
- Full audit trail maintained

---

## Summary: Agent Coordination Patterns

| Pattern | Trigger | Primary Agent | Supporting Agents | InfoHub Artifacts |
|---------|---------|---------------|-------------------|-------------------|
| Technical Risk | Customer mentions performance/issue | SA Agent | Specialist, AE | Risk register, ADR, Actions |
| Commercial Risk | Deal slip signals in communication | AE Agent | VE, Senior Manager, SA | Commercial risks, Forecast |
| Feature Gap | Roadmap mismatch identified | PM Agent | SA, AE | Feature requests, Risks, Decisions |
| Meeting Processing | Notes submitted | Meeting Notes | Task Shepherd, Decision Registrar, Risk Radar, Nudger | All governance artifacts |
| Escalation | Action overdue + unresponsive | Nudger | Senior Manager | Action tracker, Escalation log |

---

## Key Principles Demonstrated

1. **Signal Detection is Keyword + Pattern Based**: Agents use defined keywords and severity indicators, not guesswork
2. **InfoHub is Updated Automatically**: Every signal creates/updates relevant artifacts without manual effort
3. **Owners Receive Actionable Prompts**: Clear next steps with quick-action buttons, not just notifications
4. **Cross-Agent Coordination is Automatic**: SA risk triggers AE notification; PM gap triggers SA workaround
5. **Escalation is Predictable**: Defined timelines and paths, not ad-hoc
6. **Knowledge Persists**: All decisions, risks, actions linked and searchable for continuity
