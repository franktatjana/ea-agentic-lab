---
order: 6
---

# Customer Success Plan (CSP) Adoption

Based on industry enterprise SA best practices for customer success planning and value realization.

## What is a Customer Success Plan?

A **customer-facing, mutually agreed roadmap** for achieving value. It shifts conversations from product features to business outcomes.

## Why Adopt This?

| Problem | CSP Solution |
|---------|--------------|
| Pre-sales promises lost in handoff | Documented outcomes and success criteria |
| Post-sales team starts from scratch | Structured context transfer |
| No shared definition of success | Mutually agreed milestones |
| Value delivered but not tracked | Built-in value tracking framework |
| Customer relationship fragmented | Single living document across lifecycle |

## When to Create a CSP

| Condition | CSP Required |
|-----------|--------------|
| Opportunity > $100K ARR, Stage 2+ | **YES** |
| SA-validated technical evaluation (any ARR) | **YES** |
| Strategic account (any opportunity) | **YES** |
| Commercial account < $100K | Optional (SA Manager discretion) |

## CSP Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CSP LIFECYCLE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE 2          STAGE 3           STAGE 4          POST-SALES             │
│  (Scoping)        (Technical)       (Proposal)       (Adoption)             │
│                                                                              │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐            │
│  │ INITIATE│ ──── │ DEVELOP │ ──── │ FINALIZE│ ──── │ EXECUTE │            │
│  │         │      │         │      │         │      │         │            │
│  │ • Biz   │      │ • Tech  │      │ • Review│      │ • Track │            │
│  │   context│     │   eval  │      │   with  │      │   value │            │
│  │ • Stakes│      │ • Success│     │   cust  │      │ • Update│            │
│  │ • Goals │      │   criteria     │ • Agree │      │   metrics│           │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘            │
│                                                                              │
│  Owner: SA        Owner: SA        Owner: SA        Owner: CA               │
│                                          │                                   │
│                                          ▼                                   │
│                                    ┌──────────┐                             │
│                                    │ HANDOFF  │                             │
│                                    │ SA → CA  │                             │
│                                    └──────────┘                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agent Integration

### Which Agents Touch the CSP?

| Agent | Role | CSP Sections |
|-------|------|--------------|
| **SA Agent** | Creates & maintains (pre-sales) | All sections during creation |
| **AE Agent** | Commercial context | Business outcomes, stakeholders |
| **CA Agent** | Owns post-sales | Value tracking, adoption journey |
| **Delivery Agent** | Implementation status | Technical activities, milestones |
| **VE Agent** | Value quantification | Outcomes, metrics, value tracking |
| **Meeting Notes Agent** | Extracts updates | Populates from meeting notes |
| **Nudger Agent** | Tracks milestones | Alerts on milestone due dates |

### CSP Tasks by Agent

#### SA Agent Tasks (Pre-Sales)

```yaml
csp_tasks:
  initiate_csp:
    name: "Initialize Customer Success Plan"
    trigger: "Opportunity enters Stage 2 with ARR > $100K"
    prompt: |
      Context: New opportunity {opportunity_name} at {account_name}
      has entered Stage 2 with value {arr}.

      Action: Initialize Customer Success Plan with:
      - Customer background from discovery
      - Key stakeholders identified
      - Preliminary business outcomes
      - Current state assessment

      Format: Populate CSP template sections 1-3

  develop_csp:
    name: "Develop Technical Evaluation Plan"
    trigger: "Technical evaluation beginning"
    prompt: |
      Context: {account_name} CSP in development.
      Discovery findings: {discovery_summary}

      Action: Add to CSP:
      - Success criteria (max 5)
      - Technical evaluation plan
      - Resource requirements
      - Timeline and milestones

      Format: Populate CSP template sections 4-5

  finalize_csp:
    name: "Finalize CSP for Customer Review"
    trigger: "Before Stage 4 proposal"
    prompt: |
      Context: {account_name} CSP ready for customer review.
      Technical evaluation status: {status}

      Action: Finalize CSP:
      - Confirm all sections complete
      - Add phased adoption journey
      - Document risks and mitigations
      - Prepare for customer presentation

      Format: Complete all CSP sections, mark ready for review
```

#### CA Agent Tasks (Post-Sales)

```yaml
csp_tasks:
  accept_handoff:
    name: "Accept CSP Handoff from SA"
    trigger: "Deal closed, handoff initiated"
    prompt: |
      Context: {account_name} deal closed. CSP handoff from {sa_name}.

      Action: Review and accept CSP:
      - Verify all context transferred
      - Confirm open items understood
      - Establish ongoing cadence
      - Update ownership

      Format: CSP handoff checklist, ownership transfer

  track_value:
    name: "Update CSP Value Tracking"
    trigger: "Monthly value review"
    prompt: |
      Context: Monthly value update for {account_name}.
      Current CSP: {csp_link}

      Action: Update value tracking:
      - Utilization metrics
      - Outcome progress
      - Health indicators
      - Milestone status

      Format: Updated CSP section 8

  refresh_csp:
    name: "Quarterly CSP Refresh"
    trigger: "Quarterly review"
    prompt: |
      Context: Quarterly CSP refresh for {account_name}.

      Action: Refresh CSP:
      - Review and update all sections
      - Assess phase completion
      - Plan next phase
      - Update risks
      - Prepare for customer QBR

      Format: Refreshed CSP, QBR talking points
```

## InfoHub Integration

### CSP Storage Location

```
infohub/{account_name}/
├── success_plan/
│   ├── csp.yaml                    # The Customer Success Plan
│   ├── csp_history/                # Version history
│   │   ├── csp_v1_2024-01-15.yaml
│   │   └── csp_v2_2024-04-15.yaml
│   └── csp_artifacts/              # Supporting documents
│       ├── stakeholder_map.md
│       ├── architecture_diagram.png
│       └── value_model.xlsx
```

### Cross-Reference with Other Artifacts

```yaml
csp_links:
  decisions:
    - "Link CSP outcomes to decisions in decision_log.yaml"
    - "Reference CSP when logging architecture decisions"

  risks:
    - "CSP risks sync with risk_register.yaml"
    - "Risk Radar monitors CSP risk section"

  actions:
    - "CSP milestones create actions in action_tracker.yaml"
    - "Nudger tracks CSP milestone due dates"

  meetings:
    - "Meeting Notes Agent extracts CSP updates"
    - "QBR prep pulls from CSP value tracking"
```

## Workflow Automation

### Automatic CSP Triggers

```yaml
automation:
  csp_creation:
    trigger: "Opportunity.stage == 'Stage 2' AND Opportunity.arr > 100000"
    action: "SA Agent initiates CSP"
    notification: "SA receives CSP creation task"

  csp_review_reminder:
    trigger: "CSP.last_updated > 30 days"
    action: "Nudger sends review reminder"
    notification: "Owner receives stale CSP alert"

  milestone_tracking:
    trigger: "CSP.milestone.due_date approaching"
    action: "Nudger sends milestone reminder"
    timing: "7 days before, 1 day before, day of"

  handoff_trigger:
    trigger: "Opportunity.stage == 'Closed Won'"
    action: "Initiate SA → CA handoff workflow"
    notification: "SA and CA receive handoff task"

  value_review:
    trigger: "Monthly on account anniversary"
    action: "CA Agent prompted for value update"
    notification: "CA receives value tracking task"
```

### CSP Health Monitoring

```yaml
csp_health:
  complete:
    criteria:
      - "All required sections populated"
      - "Success criteria defined (1-5)"
      - "Stakeholders identified"
      - "Adoption phases defined"
      - "Value metrics baselined"

  healthy:
    criteria:
      - "Updated within last 30 days"
      - "Milestones on track"
      - "No RED risks without mitigation"
      - "Customer reviewed within quarter"

  at_risk:
    indicators:
      - "Not updated in 60+ days"
      - "Milestones overdue"
      - "Value metrics declining"
      - "Customer not engaged"

  alerts:
    - condition: "CSP incomplete at Stage 4"
      action: "Block proposal until CSP complete"

    - condition: "CSP stale > 60 days (post-sales)"
      action: "Escalate to CA Manager"
```

## Customer-Facing View

The CSP should be shareable with customers. Key principles:

### What to Share

- Business outcomes and success criteria
- Adoption journey and milestones
- Value tracking progress
- Joint responsibilities

### What to Keep Internal

- Internal stakeholder assessments
- Competitive context
- Risk details (share mitigations, not full analysis)
- Commercial notes

### Customer Review Cadence

| Phase | Cadence | Focus |
|-------|---------|-------|
| Pre-sales | Per major milestone | Align on success criteria |
| Implementation | Bi-weekly | Track progress |
| Post go-live | Monthly | Value realization |
| Steady state | Quarterly | Strategic alignment |

## Implementation Checklist

- [ ] Add CSP template to `playbooks/templates/`
- [ ] Add CSP tasks to SA Agent prompts
- [ ] Add CSP tasks to CA Agent prompts
- [ ] Configure CSP storage in InfoHub structure
- [ ] Add CSP triggers to governance orchestrator
- [ ] Add CSP health monitoring to Reporter Agent
- [ ] Create CSP handoff workflow
- [ ] Train agents on CSP extraction from meetings

## Source

- Industry enterprise SA best practices for customer success planning
