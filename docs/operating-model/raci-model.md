---
order: 4
---

# RACI Model - EA Agentic Lab

## Overview

RACI is a responsibility assignment matrix that defines roles for every activity, decision, and deliverable. In EA Agentic Lab, RACI governs both human and agent accountability.

---

## RACI Definitions

| Role | Symbol | Meaning | Characteristics |
|------|--------|---------|-----------------|
| **Responsible** | R | Does the work | Executes the task; can be human or agent |
| **Accountable** | A | Owns the outcome | Signs off; only ONE per activity; usually human |
| **Consulted** | C | Provides input | Two-way communication; expertise needed |
| **Informed** | I | Kept in loop | One-way communication; receives updates |

### Key Rules

These four rules prevent the most common RACI failures. Violating any of them leads to either diffused accountability (nobody owns it) or decision paralysis (everybody owns it).

1. **One A per activity** - Only one person/role is Accountable
2. **R without A is risky** - Someone must own the outcome
3. **A can also be R** - The accountable person can do the work
4. **Minimize C and I** - Too many slows things down

---

## Platform-Wide RACI

### Teams and Roles

| Team | Code | Primary Function |
|------|------|------------------|
| Strategy | STRAT | Strategic consulting frameworks |
| Solution Architects | SA | Technical architecture and qualification |
| Account Executives | AE | Sales, account management, deal ownership |
| Customer Architects | CA | Customer success, health, adoption |
| Competitive Intelligence | CI | Competitive analysis, market positioning |
| Value Engineering | VE | ROI/TCO, business case development |
| Specialists | SPEC | Domain expertise (security, cloud, etc.) |
| Delivery | DEL | Implementation, professional services |
| Management | MGMT | Leadership, strategic decisions |
| Admins | ADMIN | Platform operations, governance |
| InfoHub Curators | INFO | Knowledge management, content curation |

### Cross-Functional RACI Matrix

| Activity | STRAT | SA | AE | CA | CI | VE | SPEC | DEL | MGMT | ADMIN |
|----------|-------|----|----|----|----|----|----|-----|------|-------|
| Strategic Account Planning | C | C | A/R | C | C | I | I | I | I | - |
| Technical Qualification | I | A/R | C | I | I | C | C | I | I | - |
| Deal Progression | I | C | A/R | I | C | C | I | I | I | - |
| Customer Health Monitoring | I | C | C | A/R | I | I | I | C | I | - |
| Competitive Positioning | C | C | I | I | A/R | I | I | I | I | - |
| Business Case Development | C | C | C | I | I | A/R | I | I | I | - |
| POC Execution | I | A | C | I | I | I | R | C | I | - |
| Implementation Delivery | I | C | I | C | I | I | C | A/R | I | - |
| Strategic Decisions | R | C | C | C | C | C | I | I | A | - |
| Platform Governance | I | I | I | I | I | I | I | I | C | A/R |

---

## Playbook-Specific RACI

### By Playbook Category

#### Strategic Analysis Playbooks

| Playbook | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Three Horizons | Strategy Agent | Management | SA, AE | Leadership |
| Ansoff Matrix | Strategy Agent | Management | SA, Product | Leadership |
| BCG Matrix | Strategy Agent | Management | SA, Finance | Leadership |
| SWOT Analysis | SA Agent | SA Lead | AE, CA | Management |
| PESTLE Analysis | AE Agent | AE Lead | SA, Legal, Compliance | Leadership |
| Stakeholder Mapping | Strategy Agent | AE | SA, CA | Management |

#### Technical Playbooks

| Playbook | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| TOGAF ADM | SA Agent | SA Lead | Specialists | AE, Management |
| TECHDRIVE | SA Agent | SA Lead | AE, Specialists | Management |
| Five Whys | SA Agent | SA | Specialists | AE |
| POC Success Plan | POC Agent | SA | AE, Specialists | Management |

#### Sales Playbooks

| Playbook | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| MEDDPICC | AE Agent | AE | SA, VE | Sales Management |
| Account Planning | AE Agent | AE | SA, CA, CI | Management |
| Retrospective | AE Agent | Sales Management | SA, CA | Leadership |
| RFP Processing | RFP Agent | AE | SA, VE, Legal | Management |

#### Customer Success Playbooks

| Playbook | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Customer Health Score | CA Agent | CA Lead | AE, Support | Management |
| Customer Success Plan | CA Agent | CA | AE, SA | Management |
| Customer Journey VoC | CA Agent | CA | AE, Product | Management |
| Cadence Calls | CA Agent | CA | AE | - |
| Health Triage | CA Agent | CA Lead | AE, Support, SA | Management |

#### Other Playbooks

| Playbook | Responsible | Accountable | Consulted | Informed |
|----------|-------------|-------------|-----------|----------|
| Five Forces | CI Agent | CI Lead | SA, Product | AE, Marketing |
| Value Engineering | VE Agent | VE Lead | SA, AE | Management |
| Security Stage Adoption | Delivery Agent | CA | SA, Specialists | AE |
| Tech Trend Response | Delivery Agent | SA | CI, Product | Management |

---

## RACI in Playbook Definition

Every playbook YAML file must include a `raci` section:

```yaml
raci:
  responsible:
    role: "solution_architects"      # Team responsible for execution
    agent: "sa_agent"                # Agent that executes
    description: "Executes the analysis and generates outputs"

  accountable:
    role: "sa_lead"                  # Role that approves/owns outcome
    human_required: true             # Requires human sign-off
    description: "Reviews and approves final deliverable"
    approval_actions:
      - "approve"                    # Accept the output
      - "request_revision"           # Send back for changes
      - "reject"                     # Reject entirely
      - "escalate"                   # Escalate to higher authority

  consulted:
    - role: "customer_architects"
      on_steps:                      # Which steps need their input
        - "customer_context"
        - "health_assessment"
      input_type: "async"            # async | sync | review

    - role: "account_executives"
      on_steps:
        - "deal_context"
        - "stakeholder_input"
      input_type: "sync"

  informed:
    - role: "management"
      notify_on:
        - "completion"               # When playbook completes
        - "escalation"               # When issues escalate
        - "approval_required"        # When approval needed
      channel: "email"               # email | slack | in_app

    - role: "customer_team"
      notify_on:
        - "completion"
      channel: "in_app"
```

---

## RACI for Agent Operations

### Agent Execution RACI

| Activity | Agent | Human |
|----------|-------|-------|
| Execute playbook steps | R | I |
| Generate analysis | R | I |
| Make recommendations | R | A |
| Approve recommendations | I | A/R |
| Escalate issues | R | A |
| Override agent decision | - | A/R |
| Deploy changes | R | A |

### Human Override Rules

1. **Humans can always override** agent recommendations
2. **Agents must escalate** when confidence is low
3. **Critical decisions require** human approval (A)
4. **Agents inform** but don't decide on business-critical matters

---

[image: Escalation Ladder - how issues flow from responsible through accountable to management and leadership]

## RACI Governance

### Escalation Matrix

| Situation | First Escalation | Second Escalation | Final Authority |
|-----------|------------------|-------------------|-----------------|
| Playbook failure | Responsible role | Accountable role | Management |
| Approval timeout | Accountable role | Management | Leadership |
| Quality dispute | Consulted roles | Accountable role | Management |
| Cross-team conflict | Both Accountable | Management | Leadership |

### RACI Review Cadence

| Review Type | Frequency | Participants | Output |
|-------------|-----------|--------------|--------|
| Playbook RACI | Per playbook change | Owner team | Updated RACI |
| Cross-functional RACI | Quarterly | All team leads | Alignment matrix |
| Platform RACI | Annually | Leadership | Governance update |

---

## RACI Anti-Patterns

### Avoid These

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Multiple A's | No clear ownership | Single accountable per activity |
| R without A | No one owns outcome | Assign accountable role |
| Everyone is C | Decision paralysis | Limit consulted roles |
| A is always manager | Bottleneck | Delegate accountability |
| No I's defined | Surprises for stakeholders | Define informed roles |
| Agent as A | No human accountability | Human must be accountable |

---

## Implementation Checklist

### For New Playbooks

- [ ] Define single Accountable role
- [ ] Identify Responsible role/agent
- [ ] List necessary Consulted roles with specific steps
- [ ] Define Informed roles with notification triggers
- [ ] Document in playbook YAML `raci` section
- [ ] Review with affected teams

### For Existing Playbooks

- [ ] Audit current implicit RACI
- [ ] Formalize in playbook definition
- [ ] Validate with stakeholders
- [ ] Update documentation

---

## Related Documentation

- [Playbooks README](../../domain/playbooks/README.md) - Playbook structure and catalog
- [Playbook Personalization](../architecture/system/playbook-personalization-spec.md) - Customization system

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-03 | Initial RACI model documentation |
