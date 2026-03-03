# Delivery Continuity Agent

> Maintain continuity between delivery and account teams through health monitoring and risk surfacing.

**Layer:** Strategic
**Team:** `delivery`
**Agent ID:** `delivery_agent`

---

## Purpose

The Delivery Agent tracks delivery progress from Jira, status reports, and customer escalations, then flags risks and generates health summaries for account teams. It bridges the gap between delivery execution and account awareness, ensuring that project blockers, milestone slips, and go-live risks are visible to the broader team before they become surprises.

---

## Core Functions

- Track delivery progress signals from notes, Jira, and status reports
- Flag delivery risks (blocked, rescoped, delayed, resource constrained)
- Generate health summaries for account teams
- Connect delivery status to account context
- Manage phase transitions and handoffs (support, account team)

---

## Boundaries

### What this agent does

- Analyzes project status reports and Jira data for risk signals
- Classifies delivery risks by severity (HIGH/MEDIUM/LOW) with evidence
- Tracks milestone completion and timeline adherence
- Generates go-live readiness assessments
- Prepares escalation briefs for leadership
- Coordinates handoffs to support team post go-live

### What this agent does not do

- Manage delivery execution (Delivery Manager's domain)
- Assign delivery tasks or resources
- Make scope decisions
- Report delivery status not evidenced in source content

---

## Skills

No dedicated skills. Uses personality-defined prompts and 12+ task templates across 4 categories: project health, blocker management, handoffs, and risk/issue management.

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| Jira / status reports | Project status data |
| Customer escalations | Delivery-related escalations |
| SA Agent | Technical context for delivery risks |

### Provides to

| Agent | What |
|-------|------|
| AE Agent | Delivery health signals affecting deal/account context |
| CA Agent | Delivery context for adoption tracking |
| All account team agents | Project status visibility |

### Escalates to

Delivery Manager when critical path is blocked, go-live is at risk, or customer escalations are received.

---

## Guardrails

- NEVER report delivery status not evidenced in source data
- NEVER invent blockers or delays
- NEVER assume project health without signals
- Quote exact status statements from source content

When uncertain: flag for Delivery Manager review, state "status unclear" rather than inferring, add [NEEDS VERIFICATION] marker.

---

## Quality Criteria

- All delivery status claims sourced from Jira, status reports, or meeting notes
- All risks have severity justification with evidence
- No inferred project health
- Go/No-Go recommendations backed by specific checklist items

---

## References

No extracted reference files. Personality file is compact and self-contained.

---

## Related

- **Config:** `agents/delivery_agent.yaml`
- **Personality:** `personalities/delivery_personality.yaml`
- **Tasks:** `prompts/tasks.yaml` (12+ task templates across 4 categories)
- **Playbooks owned:** PB_DEL_001 (Implementation Kickoff), PB_DEL_002 (Go-Live Readiness), PB_DEL_003 (Implementation Risk Review), PB_DEL_004 (Post-Implementation Review)
- **Playbooks contributes to:** PB_CS_101 (Security Stage Adoption), PB_902 (Technology Trend Response)
