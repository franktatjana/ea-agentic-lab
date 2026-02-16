# Signal Catalog

**Version:** 1.0
**Date:** 2026-01-21
**Status:** Canonical Reference

---

## Overview

Signals are **immutable events** that flow between agents. They represent **facts about what happened**, not commands to do something. This distinction is critical:

| Aspect | Signal | Action |
|--------|--------|--------|
| Nature | Fact (past tense) | Command (imperative) |
| Mutability | Immutable once emitted | Can be retried/modified |
| Example | `meeting_processed` | `process_meeting` |
| Direction | Broadcast to subscribers | Targeted to executor |

### Key Principles

1. **Signals are immutable** - Once emitted, a signal cannot be changed
2. **Signals are facts** - They describe what happened, not what should happen
3. **Producers don't know consumers** - Loose coupling via subscription
4. **Consumers react independently** - Each consumer decides how to respond
5. **Custom signals require validation** - Orchestrator must approve new signals

---

## Machine-Readable Contract

The authoritative signal definitions are in: **[domain/catalogs/signal_catalog.yaml](../../domain/catalogs/signal_catalog.yaml)**

This document provides human context. The YAML file is what agents and system components consume.

---

## Signal Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SIGNAL CATEGORIES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SIG_LC_*      Lifecycle        Node creation, status, mode changes         │
│  SIG_ART_*     Artifact         Documents, meetings, RFPs                   │
│  SIG_STK_*     Stakeholder      People and relationships                    │
│  SIG_COM_*     Commercial       Deals, opportunities, competitors           │
│  SIG_HLT_*     Health           Risks, health scores, overdue items         │
│  SIG_GOV_*     Governance       Decisions, escalations                      │
│  SIG_PB_*      Playbook         Execution start, completion, steps          │
│  SIG_TECH_*    Technology Scout  Technology trends, job scans, insights      │
│  SIG_MNA_*     Market News      Company, industry, solution-domain news    │
│  SIG_ACI_*     Account Intel    Account research, orgcharts, opportunities │
│  SIG_TSCT_*    Tech Scout Ext   Vendor landscapes, technology adoption     │
│  SIG_II_*      Industry Intel   Industry trends, regulatory changes        │
│  SIG_CUSTOM_*  Custom           User-defined (requires validation)          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Signal Flow Diagrams

### Meeting Processing Flow

```
┌──────────────┐
│   Meeting    │
│   Occurs     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     SIG_ART_003           ┌─────────────────────┐
│ Meeting Notes│─────meeting_processed────▶│ Multiple Consumers  │
│    Agent     │                           │                     │
└──────────────┘                           │ ┌─────────────────┐ │
                                           │ │ Action Tracker  │ │
                                           │ │ → Register      │ │
                                           │ │   actions       │ │
                                           │ └─────────────────┘ │
                                           │ ┌─────────────────┐ │
                                           │ │ Risk Radar      │ │
                                           │ │ → Assess risks  │ │
                                           │ └─────────────────┘ │
                                           │ ┌─────────────────┐ │
                                           │ │ Decision Reg.   │ │
                                           │ │ → Log decisions │ │
                                           │ └─────────────────┘ │
                                           │ ┌─────────────────┐ │
                                           │ │ VoC Agent       │ │
                                           │ │ → Capture       │ │
                                           │ │   feedback      │ │
                                           │ └─────────────────┘ │
                                           └─────────────────────┘
```

### Deal Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEAL LIFECYCLE SIGNALS                             │
└─────────────────────────────────────────────────────────────────────────────┘

  SIG_LC_001              SIG_COM_001              SIG_COM_001
  node_created           deal_stage_changed       deal_stage_changed
       │                       │                       │
       ▼                       ▼                       ▼
  ┌─────────┐            ┌─────────┐            ┌─────────┐
  │ Planning│───────────▶│Discovery│───────────▶│ Qualify │
  └─────────┘            └─────────┘            └─────────┘
                                                      │
       ┌──────────────────────────────────────────────┘
       │
       ▼
  ┌─────────┐            ┌─────────┐            ┌─────────┐
  │ Propose │───────────▶│Negotiate│───────────▶│  Close  │
  └─────────┘            └─────────┘            └────┬────┘
                                                     │
                              SIG_COM_002            │
                              deal_closed            │
                         ┌───────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
       ┌─────────┐              ┌──────────┐
       │   WON   │              │   LOST   │
       └────┬────┘              └────┬─────┘
            │                        │
            │  SIG_LC_003            │  SIG_LC_002
            │  operating_mode        │  node_status_changed
            │  → implementation      │  → cancelled/archived
            ▼                        ▼
       ┌─────────┐              ┌──────────┐
       │Post-Sale│              │Retrospect│
       └─────────┘              └──────────┘
```

### Risk Escalation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RISK ESCALATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              SIG_HLT_001
                             risk_identified
                                   │
                                   ▼
                           ┌───────────────┐
                           │  Risk Radar   │
                           │    Agent      │
                           └───────┬───────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │   LOW    │  │  MEDIUM  │  │  HIGH/   │
              │          │  │          │  │ CRITICAL │
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   │             │             │ SIG_GOV_002
                   │             │             │ escalation_triggered
                   │             │             ▼
                   │             │      ┌───────────────┐
                   │             │      │  Governance   │
                   │             │      │    Agent      │
                   │             │      └───────┬───────┘
                   │             │              │
                   │             │              ▼
                   │             │      ┌───────────────┐
                   │             │      │  Escalation   │
                   │             │      │   Target      │
                   │             │      └───────┬───────┘
                   │             │              │
                   │             │              │ SIG_GOV_003
                   │             │              │ escalation_resolved
                   ▼             ▼              ▼
              ┌─────────────────────────────────────┐
              │           SIG_HLT_002               │
              │        risk_status_changed          │
              │      (mitigated/closed/etc.)        │
              └─────────────────────────────────────┘
```

### Market News Intelligence Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MARKET NEWS INTELLIGENCE FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐     News Sources        ┌─────────────────────┐
  │  Market News     │◀────────────────────────│   External Sources  │
  │  Analysis Agent  │      (Scheduled)         │   • News feeds      │
  └────────┬─────────┘                          │   • Press releases  │
           │                                    │   • Analyst reports  │
           │ Classify & Score                   └─────────────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌────────┐
│ Realm  │  │ Node   │
│ Digest │  │ Digest │
└───┬────┘  └───┬────┘
    │           │
    │  SIG_MNA_001 (market_news_digest_updated)
    │           │
    ▼           ▼
┌─────────────────────────────────────────────┐
│              High Impact?                    │
│                                              │
│  YES: SIG_MNA_002 → AE, Risk Radar, Orch.  │
│  Competitive: SIG_MNA_003 → CI, SA, AE     │
└─────────────────────────────────────────────┘
```

---

## Signal Reference (Quick Index)

### Lifecycle Signals (SIG_LC_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_LC_001 | `node_created` | Orchestration Agent | All Agents |
| SIG_LC_002 | `node_status_changed` | Governance Agent | Orchestration, Nudger |
| SIG_LC_003 | `operating_mode_changed` | Governance Agent | Playbook Curator |

### Artifact Signals (SIG_ART_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_ART_001 | `artifact_created` | Any Agent | InfoHub Curator |
| SIG_ART_002 | `artifact_updated` | Any Agent | InfoHub Curator |
| SIG_ART_003 | `meeting_processed` | Meeting Notes Agent | Action Tracker, Risk Radar, Decision Registrar, VoC |
| SIG_ART_004 | `rfp_received` | Document Ingestion | SA Agent, AE Agent, CI Agent |

### Stakeholder Signals (SIG_STK_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_STK_001 | `stakeholder_added` | Stakeholder Agent | AE Agent, Journey Agent |
| SIG_STK_002 | `stakeholder_role_changed` | Stakeholder Agent | AE Agent, Risk Radar |

### Commercial Signals (SIG_COM_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_COM_001 | `deal_stage_changed` | AE Agent | SA Agent, VE Agent, POC Agent |
| SIG_COM_002 | `deal_closed` | AE Agent | Retrospective Agent, Governance Agent, **PB_CS_501 Handoff** |
| SIG_COM_003 | `competitor_identified` | CI Agent | SA Agent, AE Agent |

### Health Signals (SIG_HLT_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_HLT_001 | `risk_identified` | Risk Radar Agent | Governance Agent, Nudger, AE Agent, **PB_CS_301 Health Triage** |
| SIG_HLT_002 | `risk_status_changed` | Risk Radar Agent | Governance Agent, Health Score Agent |
| SIG_HLT_003 | `health_score_changed` | Health Score Agent | Governance Agent, AE Agent, Nudger, **PB_CS_301 Health Triage** |
| SIG_HLT_004 | `action_overdue` | Action Tracker Agent | Nudger, Governance Agent |

### Governance Signals (SIG_GOV_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_GOV_001 | `decision_logged` | Decision Registrar | InfoHub Curator |
| SIG_GOV_002 | `escalation_triggered` | Governance Agent | Notification Service, Audit Logger |
| SIG_GOV_003 | `escalation_resolved` | Governance Agent | Original Requester, Audit Logger |

### Playbook Signals (SIG_PB_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_PB_001 | `playbook_started` | Playbook Engine | Orchestration Agent, Audit Logger |
| SIG_PB_002 | `playbook_completed` | Playbook Engine | Orchestration Agent, Dependent Processes |
| SIG_PB_003 | `playbook_step_completed` | Playbook Engine | Orchestration Agent |

### Technology Scout Signals (SIG_TECH_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_TECH_001 | `technology_scout_updated` | Tech Signal Analyzer Agent | SA Agent, CI Agent, AE Agent |
| SIG_TECH_002 | `new_technology_detected` | Tech Signal Analyzer Agent | SA Agent, PM Agent |
| SIG_TECH_003 | `technology_trending` | Tech Signal Analyzer Agent | SA Agent, CI Agent |
| SIG_TECH_004 | `job_scan_completed` | Tech Signal Scanner Agent | Tech Signal Analyzer Agent |

For detailed Technology Scout documentation, see: [Technology Scout Architecture](tech-signal-map.md)

### Market News Analysis Signals (SIG_MNA_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_MNA_001 | `market_news_digest_updated` | Market News Analysis Agent | AE Agent, SA Agent, Risk Radar |
| SIG_MNA_002 | `high_impact_news_detected` | Market News Analysis Agent | AE Agent, Risk Radar, Orchestration Agent |
| SIG_MNA_003 | `competitive_news_detected` | Market News Analysis Agent | CI Agent, SA Agent, AE Agent |

### Account Intelligence Signals (SIG_ACI_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_ACI_001 | `account_intelligence_updated` | ACI Agent | AE Agent, CI Agent, II Agent, SA Agent |
| SIG_ACI_002 | `organigram_updated` | ACI Agent | AE Agent, SA Agent |
| SIG_ACI_003 | `new_opportunity_identified` | ACI Agent | AE Agent, SA Agent |

### Technology Scout Extended Signals (SIG_TSCT_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_TSCT_001 | `vendor_landscape_updated` | Tech Signal Analyzer Agent | CI Agent, SA Agent, AE Agent |
| SIG_TSCT_002 | `technology_adoption_signal` | Tech Signal Analyzer Agent | SA Agent, CI Agent, ACI Agent |

### Industry Intelligence Signals (SIG_II_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_II_001 | `industry_intelligence_updated` | II Agent | AE Agent, CI Agent, ACI Agent, SA Agent |
| SIG_II_002 | `industry_trend_detected` | II Agent | AE Agent, CI Agent, SA Agent |
| SIG_II_003 | `regulatory_change_detected` | II Agent | AE Agent, SA Agent, Risk Radar Agent |

---

## Anti-Patterns

### Signal Design Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|--------------|---------|------------------|
| **Command as Signal** | Using signals to tell agents what to do | Signals describe facts; use processes for commands |
| **Mutable Signal** | Modifying signal payload after emission | Create new signal for updated state |
| **Tight Coupling** | Producer expects specific consumer behavior | Producers emit and forget; consumers decide |
| **Signal Spam** | Emitting signals for trivial changes | Only emit on meaningful state changes |
| **Missing Context** | Payload lacks sufficient information | Include all context consumers need |
| **Circular Signals** | Signal A triggers B which triggers A | Use conflict detection; break cycles |

### Emission Anti-Patterns

```yaml
# BAD: Command disguised as signal
signal_name: "process_this_meeting"  # Imperative = command
emitted_when: "User requests processing"

# GOOD: Fact about what happened
signal_name: "meeting_processed"  # Past tense = fact
emitted_when: "Meeting Notes Agent completes processing"
```

```yaml
# BAD: Emitting on every minor change
emitted_when: "Health score recalculated"  # Could be every minute

# GOOD: Emitting on meaningful threshold crossings
emitted_when: "Health score crosses defined thresholds (50, 70, 85)"
```

```yaml
# BAD: Insufficient context
payload:
  risk_id: "RSK_001"  # Consumer must fetch details

# GOOD: Self-contained payload
payload:
  risk_id: "RSK_001"
  title: "Budget approval delayed"
  severity: "high"
  category: "commercial"
  # Consumer has what it needs
```

---

## Custom Signal Registration

Custom signals are allowed but **must be validated by the Orchestrator**.

### Registration Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CUSTOM SIGNAL REGISTRATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

  1. DEFINE                          2. SUBMIT
  ┌──────────────────────┐           ┌──────────────────────┐
  │ Create signal spec   │──────────▶│ Submit to            │
  │ following schema     │           │ Orchestration Agent  │
  └──────────────────────┘           └───────────┬──────────┘
                                                 │
                                                 ▼
  4. REGISTER                        3. VALIDATE
  ┌──────────────────────┐           ┌──────────────────────┐
  │ Add to custom_signals│◀──────────│ Check schema         │
  │ in catalog YAML      │  APPROVED │ Check conflicts      │
  └──────────────────────┘           │ Verify consumers     │
                                     └──────────────────────┘
                                                 │
                                                 │ REJECTED
                                                 ▼
                                     ┌──────────────────────┐
                                     │ Return rejection     │
                                     │ reason to requester  │
                                     └──────────────────────┘
```

### Custom Signal Template

```yaml
# Submit this to Orchestration Agent for validation
signal_id: "SIG_CUSTOM_XYZ"  # Must match pattern: SIG_CUSTOM_[A-Z0-9]{3,}
name: "my_custom_event"      # Must match pattern: ^[a-z][a-z0-9_]*$
category: "custom"
version: 1
description: "Clear description of what this signal represents"

producer: "My Agent"  # Must be a valid registered agent
consumers:
  - agent: "Target Agent"
    action: "What consumer will do"

payload:
  required:
    - field: "field_name"
      type: "string"
      description: "What this field contains"
  optional: []

emitted_when: "Clear description of emission trigger"

anti_patterns:
  - "When NOT to emit this signal"
```

### Rejection Reasons

Custom signals will be rejected if:

1. **Name conflict** - Signal name already exists
2. **Invalid schema** - Missing required fields
3. **No consumers** - No agent will subscribe
4. **Duplicates existing** - Functionality covered by existing signal
5. **Command pattern** - Signal is a command, not a fact

---

## Subscription Matrix

Which agents subscribe to which signals:

| Agent | Subscribes To |
|-------|---------------|
| **Orchestration Agent** | SIG_LC_*, SIG_PB_* |
| **AE Agent** | SIG_COM_*, SIG_STK_001, SIG_HLT_001, SIG_TECH_001, SIG_MNA_001, SIG_MNA_002, SIG_ACI_001, SIG_ACI_002, SIG_ACI_003, SIG_TSCT_001, SIG_II_001, SIG_II_002, SIG_II_003 |
| **SA Agent** | SIG_ART_004, SIG_COM_001, SIG_COM_003, SIG_TECH_001, SIG_TECH_002, SIG_TECH_003, SIG_MNA_001, SIG_MNA_003, SIG_ACI_001, SIG_ACI_002, SIG_ACI_003, SIG_TSCT_001, SIG_TSCT_002, SIG_II_001, SIG_II_002 |
| **CA Agent** | SIG_LC_003, SIG_COM_002, SIG_HLT_003 |
| **CI Agent** | SIG_COM_003, SIG_TECH_001, SIG_TECH_003, SIG_MNA_003, SIG_ACI_001, SIG_TSCT_001, SIG_TSCT_002, SIG_II_001, SIG_II_002 |
| **PM Agent** | SIG_TECH_002 |
| **Risk Radar Agent** | SIG_ART_003, SIG_STK_002, SIG_HLT_*, SIG_MNA_001, SIG_MNA_002, SIG_II_003 |
| **Governance Agent** | SIG_LC_002, SIG_HLT_001, SIG_HLT_003, SIG_HLT_004 |
| **InfoHub Curator** | SIG_ART_001, SIG_ART_002, SIG_GOV_001 |
| **Nudger Agent** | SIG_LC_002, SIG_HLT_003, SIG_HLT_004 |
| **Action Tracker** | SIG_ART_003 |
| **Decision Registrar** | SIG_ART_003 |
| **Retrospective Agent** | SIG_COM_002 |
| **POC Agent** | SIG_COM_001 |
| **VoC Agent** | SIG_ART_003 |
| **Playbook Curator** | SIG_LC_003 |
| **Audit Logger** | SIG_GOV_002, SIG_GOV_003, SIG_PB_001, SIG_PB_002 |
| **Tech Signal Analyzer Agent** | SIG_TECH_004 |
| **Market News Analysis Agent** | SIG_LC_001, SIG_MNA_001 |
| **ACI Agent** | SIG_ACI_*, SIG_TSCT_002, SIG_II_001 |
| **II Agent** | SIG_II_*, SIG_ACI_001 |

---

## Implementation Notes

### Idempotency

All signal consumers must be idempotent. If the same signal is received twice:
- Consumer should detect duplicate (via signal_id + timestamp)
- Consumer should not produce duplicate side effects
- Consumer should log duplicate detection for debugging

### Ordering

Signals within a Node are ordered by timestamp. Consumers should:
- Process signals in order when order matters
- Handle out-of-order delivery gracefully
- Use `depends_on` relationships for strict ordering requirements

### Delivery Guarantees

- **At-least-once delivery** - Signals may be delivered multiple times
- **No guaranteed ordering across Nodes** - Only within a Node
- **Persistence** - All signals are persisted in audit log

---

## Customer Success Playbook Triggers

Signals that trigger customer success playbooks for automated engagement management:

| Signal | Playbook Triggered | Condition |
|--------|-------------------|-----------|
| SIG_LC_002 | **PB_CS_101** Security Stage Adoption | `solution_area == 'security'` |
| SIG_HLT_001 | **PB_CS_301** Health Triage | `severity >= 'high'` |
| SIG_HLT_003 | **PB_CS_301** Health Triage | `health_score < 70` |
| SIG_COM_002 | **PB_CS_501** Pre-to-Post Handoff | `outcome == 'won'` |
| SIG_COM_002 | **PB_601** Retrospective | Always |
| SIG_LC_003 | **PB_CS_303** Renewal Protection | `new_mode == 'renewal'` |
| SIG_TECH_001 | **PB_CS_101** Stage Adoption Refresh | `ring_changes_count >= 3` |
| SIG_MNA_002 | **PB_CS_301** Health Triage | `category == 'competitive' AND urgency == 'IMMEDIATE'` |
| (scheduled) | **PB_CS_202** Cadence Calls | `cadence_call_due` |
| (scheduled) | **PB_602** Account Planning | `annual_planning_cycle` |

For complete customer success playbook documentation, see: [Playbook Catalog](playbook-catalog.md)

---

## Related Documentation

- [domain/catalogs/signal_catalog.yaml](../../domain/catalogs/signal_catalog.yaml) - Machine-readable definitions
- [Orchestration Agent](../architecture/agents/orchestration-agent.md) - Signal routing and validation
- [Process Schema](../architecture/system/process-schema.md) - How signals trigger processes
- [Conflict Rules](../architecture/system/conflict-rules.md) - Signal conflict detection
- [Playbook Catalog](playbook-catalog.md) - Customer success playbook catalog

---

**This document is the canonical human reference for the signal system.**
