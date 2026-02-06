# Agent Quick Reference Card

**Version:** 1.0 | **Date:** 2026-01-16

---

## Strategic Agents (15)

| Agent | Mission | Scope | Escalates To |
|-------|---------|-------|--------------|
| **AE** | Commercial clarity | Deals ≤$500K, pipeline | SM (>$500K, variance >15%) |
| **SA** | Technical integrity | Architecture, design | SM (HIGH risk) |
| **CA** | Customer architecture | Customer-side tracking | SM (health <50) |
| **CI** | Competitive awareness | Market intel, battle cards | SM (strategic threat) |
| **VE** | Value quantification | ROI, business case | SM (value failure) |
| **Senior Manager** | Strategic oversight | >$500K, escalations | VP (>$2M) |
| **RFP** | Bid decisions | RFP analysis, response | SM (score 45-55) |
| **POC** | POC execution | Qualification → decision | SM (blocker >48h) |
| **InfoSec** | Security enablement | Compliance, questionnaires | SM (blocker, no workaround) |
| **Delivery** | Implementation | Sales → delivery handoff | SM (HIGH impl risk) |
| **PS** | Services bridge | Pre/post-sales services | SM (scope issues) |
| **Support** | Support coordination | Ticket patterns, DSE | SM (P0/Sev1) |
| **Partner** | Partner ecosystem | Partner engagement | SM (dependency risk) |
| **PM** | Product alignment | Roadmap, features | SM (strategic feature) |
| **Specialist** | Domain expertise | Vertical/use-case experts | SA (validation) |

---

## Governance Agents (8)

| Agent | Trigger | Output | Quality Gate |
|-------|---------|--------|--------------|
| **Meeting Notes** | meeting_ended | Notes, actions, decisions, risks | Max 12 lines |
| **Task Shepherd** | action_created | Validated actions | Single owner, due date |
| **Decision Registrar** | decision_mentioned | Decision log | Required fields |
| **Risk Radar** | various | Risk register | Severity, owner |
| **Nudger** | Daily 9am/2pm | Reminders, escalations | Max 1/action/day |
| **Reporter** | Friday 5pm | Weekly digest | 10 lines max |
| **Playbook Curator** | playbook_modified | Validation results | No CRITICAL violations |
| **Knowledge Curator** | artifact_created/updated | Deprecation, conflicts | No semantic conflicts |

---

## Orchestration Agent

| Component | Purpose |
|-----------|---------|
| Process Parser | Free-form → structured |
| Conflict Detector | 8 conflict types |
| Agent Factory | Auto-create agents |
| Playbook Generator | Auto-create playbooks |
| Version Controller | Rollback, audit |
| Audit Logger | Immutable trail |

---

## Key Handover Triggers

### Pre-Sales Handovers

```
AE → RFP        : RFP received
AE → POC        : POC requested
AE → SA         : Technical questions
AE → CI         : Competitor detected
AE → InfoSec    : Security questionnaire
AE → SM         : Deal > $500K

RFP → SA        : Technical sections
RFP → InfoSec   : Security sections
RFP → CI        : Competitive positioning
RFP → SM        : Borderline score (45-55)

POC → SA        : Technical design
POC → VE        : Value criteria
POC → SM        : Blocker > 48h, scope change
POC → AE        : POC complete (win)
```

### Post-Sales Handovers

```
AE → Delivery   : Contract signed
Delivery → PS   : Implementation start
Delivery → CA   : Go-live complete
Delivery → Support : Support needed

CA → SA         : Architecture issue
CA → SM         : Health < 50

Support → CA    : Pattern detected
Support → SM    : P0/Sev1
```

### Governance Chain

```
Meeting → Meeting Notes → Task Shepherd (actions)
                       → Decision Registrar (decisions)
                       → Risk Radar (risks)
                       → Nudger (blockers)

Task Shepherd → Nudger (invalid actions)
Decision Registrar → SM (conflicts)
Risk Radar → SM (CRITICAL)
Nudger → SM (overdue > 5 days)
```

---

## Escalation Thresholds

| Condition | Escalate To | SLA |
|-----------|-------------|-----|
| Deal > $500K | Senior Manager | Before bid |
| Deal > $2M | VP/C-Level | Same day |
| Forecast variance > 15% | Senior Manager | 4 hours |
| HIGH/CRITICAL tech risk | Senior Manager | 4 hours |
| Security blocker | Senior Manager | Immediate |
| POC blocker > 48h | Senior Manager | 24 hours |
| RFP score 45-55 | Senior Manager | 24 hours |
| Customer health < 50 | Senior Manager | 24 hours |
| Action overdue > 5 days | Senior Manager | 24 hours |
| Decision conflict | Senior Manager | 48 hours |

---

## Decision Authority

| Decision Type | Authority |
|---------------|-----------|
| Deals ≤ $500K | AE Agent |
| Deals $500K - $2M | Senior Manager |
| Deals > $2M | VP + Senior Manager |
| Standard terms | AE Agent |
| Non-standard terms | Senior Manager + Legal |
| Technical design | SA Agent |
| Resource conflicts | Senior Manager |
| Bid/no-bid | RFP Agent (SM if borderline) |
| POC qualification | POC Agent |
| Security gaps | InfoSec Agent |

---

## InfoHub Paths

```
infohub/{realm}/{node}/
├── meetings/       ← Meeting Notes Agent
├── actions/        ← Task Shepherd, Nudger
├── decisions/      ← Decision Registrar
├── risks/          ← Risk Radar
├── architecture/   ← SA Agent
├── commercial/     ← AE Agent
├── competitive/    ← CI Agent
├── value/          ← VE Agent
├── security/       ← InfoSec Agent
├── governance/     ← Governance Agents
└── reports/        ← Reporter Agent
```

---

## Conflict Severity

| Severity | Action | Examples |
|----------|--------|----------|
| **CRITICAL** | Block | Circular dependency, system halt |
| **HIGH** | Human decision | Trigger collision, output contradiction |
| **MEDIUM** | Flag for review | Ownership overlap, resource contention |
| **LOW** | Suggest fix | Redundant process, deadline conflict |
| **INFO** | Inform | Gap detected |

---

## Common Workflows

### New Deal

```
1. AE identifies opportunity
2. AE → CI (if competitor)
3. AE → RFP (if RFP received)
4. AE → POC (if POC requested)
5. AE → SM (if > $500K)
6. AE → Delivery (on contract)
```

### RFP Response

```
1. RFP Agent receives RFP
2. RFP → SA (technical)
3. RFP → InfoSec (security)
4. RFP → CI (competitive)
5. RFP Agent consolidates
6. RFP → SM (if borderline)
7. RFP → AE (recommendation)
```

### Meeting Processing

```
1. Meeting ends
2. Meeting Notes extracts
3. → Task Shepherd (actions)
4. → Decision Registrar (decisions)
5. → Risk Radar (risks)
6. Daily: Nudger checks overdue
7. Friday: Reporter summarizes
```

---

## Cheat Sheet

**When in doubt:**
- Technical question → SA Agent
- Commercial question → AE Agent
- Competitive question → CI Agent
- Security question → InfoSec Agent
- Action not done → Nudger Agent
- Big decision needed → Senior Manager

**Escalation rule of thumb:**
- Money > $500K → Senior Manager
- Risk = HIGH/CRITICAL → Senior Manager
- Blocked > 48 hours → Senior Manager
- Health < 50 → Senior Manager

---

**Full documentation:** [agent-responsibilities.md](agent-responsibilities.md)
