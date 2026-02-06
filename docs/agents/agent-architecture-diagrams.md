# Agent Architecture

## Overview

The agent system is divided into two categories:
- **Strategic Agents**: Exercise judgment, apply frameworks, make recommendations
- **Governance Agents**: Enforce process, maintain artifacts, reduce entropy

## Agent Landscape

```mermaid
flowchart TB
    subgraph Leadership["Leadership Layer"]
        SM[Senior Manager Agent]
    end

    subgraph Strategic["Strategic Agents"]
        direction TB
        subgraph Sales["Sales & Commercial"]
            AE[AE Agent]
            RFP[RFP Agent]
            VE[Value Engineering]
        end
        subgraph Technical["Technical"]
            SA[SA Agent]
            CA[CA Agent]
            POC[POC Agent]
        end
        subgraph Specialists["Specialists"]
            CI[CI Agent]
            IS[InfoSec Agent]
            PM[PM Agent]
            SP[Specialist Agent]
        end
        subgraph Delivery["Delivery & Support"]
            DL[Delivery Agent]
            PS[PS Agent]
            SUP[Support Agent]
            PT[Partner Agent]
        end
    end

    subgraph Governance["Governance Agents"]
        direction LR
        MN[Meeting Notes]
        NU[Nudger]
        TS[Task Shepherd]
        DR[Decision Registrar]
        RP[Reporter]
        RR[Risk Radar]
    end

    subgraph InfoHub["InfoHub (Artifacts)"]
        direction LR
        MT[meetings/]
        AC[actions/]
        DC[decisions/]
        RS[risks/]
        SK[stakeholders/]
        VL[value/]
        GV[governance/]
    end

    %% Escalation flows to Senior Manager
    AE -->|escalates| SM
    SA -->|escalates| SM
    RFP -->|escalates| SM
    POC -->|escalates| SM
    IS -->|escalates| SM
    RR -->|escalates| SM

    %% Strategic collaboration
    RFP -.->|orchestrates| SA
    RFP -.->|orchestrates| AE
    RFP -.->|orchestrates| CI
    RFP -.->|orchestrates| IS
    POC -.->|coordinates| SA
    POC -.->|coordinates| AE

    %% Governance writes to InfoHub
    MN -->|writes| MT
    MN -->|extracts| AC
    MN -->|extracts| DC
    MN -->|extracts| RS
    TS -->|validates| AC
    DR -->|maintains| DC
    RR -->|populates| RS
    NU -->|reads| AC
    RP -->|aggregates| InfoHub
```

## Escalation Hierarchy

```mermaid
flowchart BT
    subgraph Tier1["Tier 1: Execution"]
        SA[SA Agent]
        AE[AE Agent]
        CA[CA Agent]
        CI[CI Agent]
        POC[POC Agent]
        RFP[RFP Agent]
        IS[InfoSec Agent]
        PS[PS Agent]
        SUP[Support Agent]
        VE[VE Agent]
    end

    subgraph Tier2["Tier 2: Oversight"]
        SM[Senior Manager Agent]
    end

    subgraph Tier3["Tier 3: Executive"]
        VP[VP / C-Level]
        LG[Legal]
        PD[Product]
    end

    SA -->|technical blockers| SM
    AE -->|commercial decisions > $500K| SM
    POC -->|scope creep, disengagement| SM
    RFP -->|borderline bid/no-bid| SM
    IS -->|security blockers| SM
    CI -->|competitive threats| SM
    PS -->|delivery risks, scope mismatch| SM
    SUP -->|P1 incidents, SLA breach| SM
    VE -->|value not realized| SM

    SM -->|deals > $2M| VP
    SM -->|non-standard terms| LG
    SM -->|strategic features| PD
```

## Governance Agent Flow

```mermaid
flowchart LR
    subgraph Input["Meeting Input"]
        RAW[Raw Notes]
        TR[Transcript]
        AG[Agenda]
    end

    subgraph Processing["Governance Processing"]
        MN[Meeting Notes Agent]
        TS[Task Shepherd]
        DR[Decision Registrar]
        RR[Risk Radar]
        NU[Nudger]
        RP[Reporter]
    end

    subgraph Output["InfoHub Artifacts"]
        MT[Meeting Note]
        AT[Action Tracker]
        DL[Decision Log]
        RG[Risk Register]
        WD[Weekly Digest]
    end

    RAW --> MN
    TR --> MN
    AG --> MN

    MN -->|creates| MT
    MN -->|extracts actions| TS
    MN -->|extracts decisions| DR
    MN -->|extracts risks| RR

    TS -->|validates & links| AT
    DR -->|registers| DL
    RR -->|classifies| RG

    AT --> NU
    NU -->|reminds owners| AT

    AT --> RP
    DL --> RP
    RG --> RP
    RP -->|generates| WD
```

## RFP Workflow

```mermaid
flowchart TB
    subgraph Intake["Day 1: Intake"]
        RFP_IN[RFP Document]
        BNB{Bid/No-Bid?}
    end

    subgraph Team["Response Team"]
        RFP_LEAD[RFP Agent<br/>Lead]
        SA_TECH[SA Agent<br/>Technical]
        AE_COMM[AE Agent<br/>Commercial]
        IS_SEC[InfoSec Agent<br/>Security]
        CI_COMP[CI Agent<br/>Competitive]
    end

    subgraph Phases["Response Phases"]
        STR[Strategy<br/>Days 2-3]
        DRF[Draft<br/>50% time]
        REV[Review<br/>25% time]
        POL[Polish<br/>15% time]
        SUB[Submit<br/>10% time]
    end

    RFP_IN --> RFP_LEAD
    RFP_LEAD --> BNB

    BNB -->|score >= 70| Team
    BNB -->|score < 50| NO[No Bid]
    BNB -->|50-70| SM[Escalate to SM]

    RFP_LEAD --> STR
    SA_TECH --> DRF
    AE_COMM --> DRF
    IS_SEC --> DRF
    CI_COMP --> DRF

    DRF --> REV --> POL --> SUB
```

## POC Lifecycle

```mermaid
flowchart LR
    subgraph Qualify["Qualification"]
        Q1{Budget?}
        Q2{Timeline?}
        Q3{Criteria?}
        Q4{Resources?}
    end

    subgraph Execute["Execution"]
        S[Setup<br/>Days 1-2]
        C[Core<br/>Days 3-7]
        E[Extended<br/>Days 8-12]
        W[Wrap-up<br/>Days 13-14]
    end

    subgraph Outcome["Decision"]
        WIN[Win]
        COND[Conditional]
        LOSS[Loss]
        STALL[No Decision]
    end

    Q1 -->|yes| Q2
    Q2 -->|< 90 days| Q3
    Q3 -->|agreed| Q4
    Q4 -->|committed| S

    S --> C --> E --> W

    W --> WIN
    W --> COND
    W --> LOSS
    W --> STALL

    STALL -->|escalate| SM[Senior Manager]
```

## Agent Summary Table

| Category | Agent | Purpose | Escalates To |
|----------|-------|---------|--------------|
| **Leadership** | Senior Manager | Oversight, coaching, escalation resolution | VP/C-Level |
| **Strategic** | AE Agent | Account strategy, commercial decisions | Senior Manager |
| **Strategic** | SA Agent | Technical architecture, solution design | Senior Manager |
| **Strategic** | CA Agent | Customer architecture tracking | SA Agent |
| **Strategic** | CI Agent | Competitive intelligence | Senior Manager |
| **Strategic** | RFP Agent | RFP response orchestration | Senior Manager |
| **Strategic** | InfoSec Agent | Security/compliance enablement | Senior Manager |
| **Strategic** | POC Agent | Proof of concept execution | Senior Manager |
| **Strategic** | PM Agent | Project coordination | Senior Manager |
| **Strategic** | Delivery Agent | Implementation delivery | PM Agent |
| **Strategic** | Partner Agent | Partner ecosystem | AE Agent |
| **Strategic** | Specialist Agent | Domain expertise | SA Agent |
| **Strategic** | PS Agent | Professional Services pre/post sales | Senior Manager |
| **Strategic** | Support Agent | Support/DSE coordination | Senior Manager |
| **Strategic** | Value Engineering Agent | Business value quantification & tracking | Senior Manager |
| **Governance** | Meeting Notes | Decision-grade meeting artifacts | Nudger |
| **Governance** | Nudger | Follow-up enforcement | Governance Lead |
| **Governance** | Task Shepherd | Action validation | - |
| **Governance** | Decision Registrar | Decision tracking | - |
| **Governance** | Reporter | Weekly digest generation | - |
| **Governance** | Risk Radar | Risk detection and tracking | Senior Manager |
