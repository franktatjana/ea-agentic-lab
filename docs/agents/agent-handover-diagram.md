# Agent Handover Diagrams

**Version:** 1.0
**Date:** 2026-01-16

---

## Overview

Visual representation of agent handovers, escalation paths, and information flow.

---

## 1. Strategic Agent Handover Flow

```mermaid
flowchart TB
    subgraph PRESALES["Pre-Sales Phase"]
        AE[AE Agent]
        RFP[RFP Agent]
        POC[POC Agent]
        CI[CI Agent]
        SA[SA Agent]
        INFOSEC[InfoSec Agent]
        SPEC[Specialist Agent]
        PM[PM Agent]
        VE[VE Agent]
    end

    subgraph POSTSALES["Post-Sales Phase"]
        DELIVERY[Delivery Agent]
        PS[PS Agent]
        CA[CA Agent]
        SUPPORT[Support Agent]
        PARTNER[Partner Agent]
    end

    subgraph LEADERSHIP["Leadership"]
        SM[Senior Manager]
    end

    %% Pre-Sales Flows
    AE -->|RFP received| RFP
    AE -->|POC requested| POC
    AE -->|Technical questions| SA
    AE -->|Competitor detected| CI
    AE -->|Security questionnaire| INFOSEC
    AE -->|Deal > $500K| SM

    RFP -->|Technical sections| SA
    RFP -->|Security sections| INFOSEC
    RFP -->|Competitive positioning| CI
    RFP -->|Borderline 45-55| SM
    RFP -->|RFP won| POC

    POC -->|Technical design| SA
    POC -->|Value criteria| VE
    POC -->|Blocker > 48h| SM
    POC -->|POC win| AE

    SA -->|Domain expertise| SPEC
    SA -->|Security review| INFOSEC
    SA -->|Product gap| PM
    SA -->|HIGH risk| SM

    CI -->|Competitor in POC| POC
    CI -->|Strategic threat| SM

    VE -->|POC metrics| POC
    VE -->|Value failure| SM

    %% Pre to Post-Sales Transition
    AE -->|Contract signed| DELIVERY
    POC -->|POC learnings| DELIVERY

    %% Post-Sales Flows
    DELIVERY -->|Implementation start| PS
    DELIVERY -->|Go-live| CA
    DELIVERY -->|Support needed| SUPPORT
    DELIVERY -->|HIGH risk| SM

    PS -->|SOW signed| DELIVERY
    PS -->|Training complete| CA

    CA -->|Architecture issue| SA
    CA -->|Health < 50| SM
    CA -->|Support pattern| SUPPORT

    SUPPORT -->|Pattern detected| CA
    SUPPORT -->|P0/Sev1| SM

    PARTNER -->|Referral| AE
    PARTNER -->|Technical issue| SA
    PARTNER -->|Risk| SM

    %% Escalation returns
    SM -.->|Decision| AE
    SM -.->|Decision| SA
    SM -.->|Decision| POC
```

---

## 2. Governance Agent Flow

```mermaid
flowchart LR
    subgraph INPUT["Input Sources"]
        MEETING[Meeting]
        SLACK[Slack/Email]
        DECISION[Decision Made]
        ACTION[Action Created]
        ARTIFACT[Artifact Created]
    end

    subgraph GOVERNANCE["Governance Agents"]
        MN[Meeting Notes Agent]
        TS[Task Shepherd Agent]
        DR[Decision Registrar]
        RR[Risk Radar Agent]
        NU[Nudger Agent]
        REP[Reporter Agent]
        PC[Playbook Curator]
        KC[Knowledge Curator]
    end

    subgraph OUTPUT["InfoHub"]
        MEETINGS_OUT[meetings/]
        ACTIONS_OUT[actions/]
        DECISIONS_OUT[decisions/]
        RISKS_OUT[risks/]
        REPORTS_OUT[reports/]
        GOV_OUT[governance/]
    end

    %% Input flows
    MEETING --> MN
    SLACK --> DR
    DECISION --> RR
    ACTION --> TS
    ARTIFACT --> KC

    %% Governance chain
    MN -->|actions| TS
    MN -->|decisions| DR
    MN -->|risks| RR
    MN -->|blockers| NU
    MN -->|artifact_created| KC

    TS -->|validated actions| ACTIONS_OUT
    TS -->|invalid| NU

    DR -->|logged decisions| DECISIONS_OUT
    DR -->|conflicts| SM[Senior Manager]

    RR -->|risks| RISKS_OUT
    RR -->|CRITICAL| SM

    NU -->|overdue > 5d| SM
    NU -->|reminders| ACTIONS_OUT

    REP -->|weekly digest| REPORTS_OUT
    REP -->|critical alerts| SM

    PC -->|violations| SM

    KC -->|semantic_conflict| SM
    KC -->|deprecation| GOV_OUT
    KC -->|staleness| GOV_OUT
```

---

## 3. Escalation Hierarchy

```mermaid
flowchart BT
    subgraph LEVEL1["Level 1: Agents"]
        AE[AE Agent]
        SA[SA Agent]
        POC[POC Agent]
        RFP[RFP Agent]
        INFOSEC[InfoSec Agent]
        CA[CA Agent]
        DELIVERY[Delivery Agent]
        VE[VE Agent]
        RR[Risk Radar]
        NU[Nudger]
    end

    subgraph LEVEL2["Level 2: Senior Manager"]
        SM[Senior Manager Agent]
    end

    subgraph LEVEL3["Level 3: Executive"]
        VP[VP / C-Level]
        LEGAL[Legal]
        PRODUCT[Product Leadership]
    end

    %% Escalations to Senior Manager
    AE -->|Forecast > 15%| SM
    AE -->|Deal > $500K| SM
    SA -->|HIGH tech risk| SM
    POC -->|Scope change| SM
    POC -->|Blocker > 48h| SM
    RFP -->|Score 45-55| SM
    INFOSEC -->|No workaround| SM
    CA -->|Health < 50| SM
    DELIVERY -->|HIGH impl risk| SM
    VE -->|Value failure| SM
    RR -->|CRITICAL risk| SM
    NU -->|Overdue > 5d| SM

    %% Senior Manager escalations
    SM -->|Deal > $2M| VP
    SM -->|Contract terms| LEGAL
    SM -->|Strategic feature| PRODUCT
```

---

## 4. Deal Lifecycle Handover

```mermaid
sequenceDiagram
    participant AE as AE Agent
    participant CI as CI Agent
    participant RFP as RFP Agent
    participant SA as SA Agent
    participant VE as VE Agent
    participant POC as POC Agent
    participant SM as Senior Manager
    participant DEL as Delivery Agent
    participant PS as PS Agent
    participant CA as CA Agent

    Note over AE: Opportunity Identified

    AE->>CI: Competitor detected
    CI-->>AE: Competitive brief

    AE->>RFP: RFP received
    RFP->>SA: Technical sections
    RFP->>CI: Competitive positioning
    SA-->>RFP: Technical responses
    CI-->>RFP: Battle cards
    RFP-->>AE: Bid recommendation

    alt Deal > $500K
        AE->>SM: Go/no-go decision
        SM-->>AE: Approved
    end

    AE->>POC: POC requested
    POC->>SA: Technical design
    POC->>VE: Value criteria
    SA-->>POC: Architecture
    VE-->>POC: Success metrics

    Note over POC: POC Execution

    POC-->>AE: POC Win

    Note over AE: Negotiation & Close

    AE->>DEL: Contract signed
    DEL->>PS: Implementation planning
    PS-->>DEL: SOW signed

    Note over DEL: Implementation

    DEL->>CA: Go-live complete

    Note over CA: Adoption & Success
```

---

## 5. Governance Processing Pipeline

```mermaid
sequenceDiagram
    participant MTG as Meeting
    participant MN as Meeting Notes
    participant TS as Task Shepherd
    participant DR as Decision Registrar
    participant RR as Risk Radar
    participant NU as Nudger
    participant REP as Reporter
    participant SM as Senior Manager

    MTG->>MN: Transcript/notes uploaded

    MN->>MN: Extract decisions, actions, risks

    par Parallel Processing
        MN->>TS: Actions extracted
        MN->>DR: Decisions extracted
        MN->>RR: Risks extracted
    end

    TS->>TS: Validate (owner, due date, criteria)

    alt Validation fails
        TS->>NU: Invalid action
        NU-->>TS: Owner notified
    end

    DR->>DR: Log decision, check conflicts

    alt Conflicting decisions
        DR->>SM: Conflict detected
        SM-->>DR: Resolution
    end

    RR->>RR: Classify severity

    alt CRITICAL risk
        RR->>SM: Immediate alert
    end

    Note over NU: Daily 9am & 2pm

    NU->>NU: Check overdue actions

    alt Overdue > 5 days
        NU->>SM: Escalation
    end

    Note over REP: Friday 5pm

    REP->>REP: Aggregate week's data
    REP-->>SM: Weekly digest
```

---

## 6. Conflict Detection Flow (Orchestration)

```mermaid
flowchart TD
    subgraph INPUT["Human Input"]
        TEXT[Free-form Text]
        YAML[YAML]
        TABLE[Table]
    end

    subgraph PARSER["Process Parser"]
        PARSE[Parse Input]
        NORMALIZE[Normalize to Schema]
    end

    subgraph DETECTOR["Conflict Detector"]
        TRIGGER[Check Trigger Collision]
        OUTPUT[Check Output Contradiction]
        CIRCULAR[Check Circular Dependency]
        OWNER[Check Ownership Overlap]
        GAP[Check Gaps]
    end

    subgraph SEVERITY["Severity Classification"]
        CRITICAL[CRITICAL - Block]
        HIGH[HIGH - Human Decision]
        MEDIUM[MEDIUM - Flag]
        LOW[LOW - Suggest]
        INFO[INFO - Inform]
    end

    subgraph RESOLUTION["Resolution"]
        HUMAN[Human Decision]
        AUTO[Auto-Resolve]
        CREATE[Create Process]
    end

    TEXT --> PARSE
    YAML --> PARSE
    TABLE --> PARSE

    PARSE --> NORMALIZE
    NORMALIZE --> TRIGGER
    NORMALIZE --> OUTPUT
    NORMALIZE --> CIRCULAR
    NORMALIZE --> OWNER
    NORMALIZE --> GAP

    TRIGGER --> CRITICAL
    TRIGGER --> HIGH
    OUTPUT --> HIGH
    CIRCULAR --> CRITICAL
    OWNER --> MEDIUM
    GAP --> INFO

    CRITICAL --> HUMAN
    HIGH --> HUMAN
    MEDIUM --> AUTO
    LOW --> AUTO
    INFO --> CREATE

    HUMAN --> CREATE
    AUTO --> CREATE
```

---

## 7. Quick Reference: Who Handles What

| Scenario | Primary Agent | Handover To | Escalation |
|----------|--------------|-------------|------------|
| New opportunity | AE Agent | - | SM if >$500K |
| RFP received | RFP Agent | SA, InfoSec, CI | SM if score 45-55 |
| POC requested | POC Agent | SA, VE | SM if blocker >48h |
| Technical question | SA Agent | Specialist | SM if HIGH risk |
| Competitor detected | CI Agent | RFP, POC | SM if strategic |
| Security questionnaire | InfoSec Agent | - | SM if blocker |
| Contract signed | Delivery Agent | PS | SM if HIGH risk |
| Implementation | PS Agent | Delivery | SA if technical |
| Go-live | CA Agent | Support | SM if health <50 |
| Support issue | Support Agent | CA, SA | SM if P0/Sev1 |
| Partner engagement | Partner Agent | AE, SA | SM if risk |
| Meeting completed | Meeting Notes | TS, DR, RR | - |
| Action created | Task Shepherd | Nudger | - |
| Decision made | Decision Registrar | RR | SM if conflict |
| Risk identified | Risk Radar | - | SM if CRITICAL |
| Overdue action | Nudger Agent | - | SM if >5 days |
| Artifact created | Knowledge Curator | Owning agent | SM if conflict |
| Semantic conflict | Knowledge Curator | Owning agents | SM if unresolved |
| Stale artifact | Knowledge Curator | Owning agent | - |

---

## 8. SLA Reference

| Priority | Acknowledgment | Escalation After |
|----------|----------------|------------------|
| **Critical** | 1 hour | Immediate to SM |
| **High** | 4 hours | 4 hours to SM |
| **Medium** | 24 hours | 24 hours to Nudger |
| **Low** | 48 hours | 48 hours to Nudger |

| Escalation Level | Trigger | SLA |
|------------------|---------|-----|
| Agent → SM | Defined thresholds | 4h (urgent) / 24h (standard) |
| SM → VP | Deal >$2M | Same day |
| SM → Legal | Contract terms | 24h |
| SM → Product | Strategic feature | 48h |

---

**Note:** These diagrams use Mermaid syntax and can be rendered in any Mermaid-compatible viewer.
