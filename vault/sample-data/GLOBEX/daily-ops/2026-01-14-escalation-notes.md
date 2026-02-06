---
date: 2026-01-14
author: Amy Chen
source: slack
tags:
  - client/GLOBEX
  - signal/escalation
  - signal/stakeholder_frustration
  - person/robert_martinez
  - person/emily_watson
---

# Globex Escalation Notes - Jan 14

## Executive Call Outcome

James called Robert Martinez this morning. Key takeaways:

**Robert's Frustrations:**
- Feels "abandoned" after initial sale
- Support response times unacceptable
- Doesn't see the strategic value we promised
- CFO asking why they're spending $180K/year

**Robert's Requirements to Continue:**
1. Dedicated technical resource for 90 days
2. Support SLA with teeth (credits if missed)
3. Clear roadmap for their use cases
4. Price reduction "to reflect actual value received"

Robert was direct: "I need to see change in the next 30 days or we're moving to ObservabilityVendorA. My team has already started a parallel evaluation."

**CRITICAL**: ObservabilityVendorA evaluation is confirmed. We have 30 days.

## Competitor Intel

Emily shared more details in a follow-up call with Kevin:

- ObservabilityVendorA demo scheduled for January 20th
- 3 developers already have ObservabilityVendorA accounts (free tier)
- ObservabilityVendorA offering 40% discount on first year
- ObservabilityVendorA rep promising "white glove migration"

Emily seems more open to staying than Robert: "I don't want to go through a migration. If you can make this work, I'll advocate internally."

**Opportunity**: Emily could be our internal ally if we can address the technical issues.

## Support Ticket Analysis

Pulled the last 90 days of support tickets:

| Severity | Count | Avg Resolution | SLA Met |
|----------|-------|----------------|---------|
| P1 | 2 | 5.2 hours | 0% |
| P2 | 8 | 72 hours | 62% |
| P3 | 15 | 5 days | 80% |

**Pattern**: Both P1 tickets were cluster performance issues. Root cause: They haven't upgraded to latest version which has significant performance improvements.

**Quick Win**: Version upgrade could resolve performance issues and improve experience.

## Usage Deep Dive

Analyzed usage patterns to find quick wins:

**Underutilized Features:**
- Alerting (only 10% of capacity)
- APM tracing (disabled after Michael left)
- Log correlation (never configured)

**Opportunities:**
1. Re-enable APM tracing - addresses developer ObservabilityVendorA interest
2. Configure log correlation - immediate value visibility
3. Alert optimization - reduce noise, increase signal

## Stakeholder Mapping Update

| Person | Role | Sentiment | Influence | Action |
|--------|------|-----------|-----------|--------|
| Robert Martinez | VP Ops | Hostile | Decision Maker | Exec attention |
| Emily Watson | IT Director | Neutral | Technical Lead | Enable as champion |
| Dev Team (unknown) | Developers | Negative | Users | APM focus |
| CFO (unknown) | Finance | Skeptical | Budget | ROI evidence |

**Gap**: Need to identify and engage the development team. They're driving ObservabilityVendorA interest.

## Action Items Status

- [x] James called Robert - done
- [x] Support review - completed
- [ ] Health check assessment - scheduled Jan 19
- [ ] Competitive deck - Kevin working on it
- [ ] Version upgrade proposal - need to prepare
- [ ] Developer engagement plan - need owner

## Risk Level

**CRITICAL**: This account will churn without intervention.

Timeline:
- Jan 20: ObservabilityVendorA demo (block if possible)
- Jan 30: Robert's 30-day deadline
- April: Renewal date

We need visible progress by Jan 25 to have any chance.
