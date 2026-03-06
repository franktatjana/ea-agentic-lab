# DDR-017: Support Agent Dissolution into Signals and CA Skill

**Status:** ACCEPTED
**Date:** 2026-02-27
**Category:** Domain Decision Record
**Related:** DDR-005 (signal-based action completion), DDR-016 (skill architecture)

---

## Context

The ea-agentic-lab system included a dedicated Support Agent (`domain/agents/support/`) responsible for tracking support cases, coordinating DSE engagement, managing escalations, and producing support health summaries. The agent had its own configuration, personality specification, and task prompts.

A review revealed a fundamental design problem: the Support Agent replicated support-as-a-function rather than bridging the gap between the support team and the account team. Its core tasks (ticket triage, SLA tracking, DSE coordination) duplicated what a real support team already does. The agent was acting as a shadow support department instead of translating support data into account intelligence.

This violated two design principles established in prior decisions:

| Principle | Source | Violation |
|-----------|--------|-----------|
| Agents bridge teams, they don't replace them | Agent design philosophy | Support Agent replaced support team functions |
| Signals are the integration mechanism | DDR-005 | Support Agent consumed raw data instead of typed signals |

The Support Agent also created coupling problems. Five other agents (`ca_agent`, `ps_agent`, `ae_agent`, `sa_agent`, `delivery_agent`) had `collaborates_with: support_agent` references, creating a hub-and-spoke dependency on an agent that shouldn't exist.

---

## Decision

Dissolve the Support Agent entirely. Replace its functions with two mechanisms:

**1. Support signals in the signal catalog (SIG_SUP_001 through SIG_SUP_006).** The real support team emits typed signals when meaningful events occur. The system translates support data into account intelligence without pretending to do support.

| Signal | Emitted When |
|--------|-------------|
| SIG_SUP_001 `support_health_change` | CSAT drops below 4.0 or ticket volume spikes >50% |
| SIG_SUP_002 `repeat_issue_detected` | Same root cause appears in 3+ tickets within 30 days |
| SIG_SUP_003 `escalation_triggered` | Customer escalates to leadership or SLA breached |
| SIG_SUP_004 `critical_incident` | P1/critical production-down ticket opened |
| SIG_SUP_005 `dse_engagement_needed` | Complex deployment or high-volume account needs named support |
| SIG_SUP_006 `support_pattern_insight` | Aggregated quarterly support trends ready for QBR |

**2. CA Agent skill SK_CA_001 (Support Intelligence Triage).** The CA Agent receives support signals, enriches them with account context, classifies them (adoption issue, architecture gap, relationship risk, expansion signal), and routes actions to the appropriate agent. This follows the skill architecture established in DDR-016.

**3. Four new playbooks for the C06 blueprint** replace the Support Agent's former responsibilities:

| Playbook | Owner | Purpose |
|----------|-------|---------|
| PB_CA_187 Track Support Case | CA Agent | Processes SIG_SUP_001/002, classifies root causes |
| PB_CA_188 Escalate Support Issue | CA Agent | Processes SIG_SUP_003/004, three-tier escalation |
| PB_DEL_189 Engage DSE | PS Agent | Evaluates DSE eligibility with weighted scoring |
| PB_CA_190 Review Support Health | CA Agent | Quarterly support trends for QBR (PB_CA_174) |

The `domain/agents/support/` directory was removed. All `collaborates_with: support_agent` references in other agent configs were replaced with signal consumption or CA Agent collaboration.

---

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|-------------|------|------|-----------------|
| **Keep Support Agent, refocus on bridge role** | No structural change, lower effort | Still creates a fake support team. Bridge-only functions are too thin to justify a dedicated agent. | The remaining bridge functions map cleanly to signals + CA skill, making a standalone agent unnecessary overhead |
| **Merge Support Agent into CA Agent directly** | Simpler, one less agent | CA Agent absorbs all support logic, violating single responsibility. Tasks and personality get bloated. | Merging entire agents creates god objects. The skill layer (DDR-016) exists precisely to add scoped capabilities without bloating the host agent |
| **Replace with a lightweight "Support Liaison" agent** | Preserves dedicated support interface | Still an agent that doesn't do real support. Name change doesn't fix the design problem. | Cosmetic fix. The liaison pattern works for external teams, but here the support team's output is better modeled as signals |

---

## Consequences

**Positive:**
- Clean separation: the support team does support, the system translates support data into account intelligence
- Follows the signal architecture (DDR-005) consistently: support events are signals like any other domain event
- CA Agent gains support awareness through a composable skill (DDR-016) rather than ad-hoc collaboration
- Five agents lose a coupling dependency (`collaborates_with: support_agent`), replaced by loosely-coupled signal consumption
- C06 blueprint now has concrete playbooks (PB_CA_187-190) instead of unimplemented agent references

**Negative:**
- Support signals require the real support team to emit structured events, adding an integration requirement
- CA Agent's scope grows (now owns support intelligence triage), requiring monitoring for scope creep
- Any future support-specific logic must be added as signals + playbooks rather than agent tasks, which is more ceremony for simple additions

**Risks:**
- If the support team cannot emit signals reliably, the system loses support visibility entirely. Mitigation: PB_CA_190 (quarterly review) can fall back to manual data collection
- CA Agent accumulating too many skills could become a god agent over time. Mitigation: monitor skill count per agent, split if SK count exceeds 5-7

---

## Files Changed

| Action | Path |
|--------|------|
| EDIT | `domain/catalogs/signal_catalog.yaml` (added SIG_SUP_001-006) |
| CREATE | `domain/agents/customer_architects/skills/SK_CA_001_support_intelligence_triage.yaml` |
| EDIT | `domain/catalogs/skill_catalog.yaml` (registered SK_CA_001) |
| EDIT | `domain/agents/customer_architects/agents/ca_agent.yaml` (added skill, updated integrations) |
| EDIT | `domain/agents/customer_architects/prompts/tasks.yaml` (migrated support bridge tasks) |
| EDIT | `domain/agents/professional_services/agents/ps_agent.yaml` (updated collaborates_with) |
| EDIT | `domain/agents/account_executives/agents/ae_agent.yaml` (removed support_agent ref) |
| EDIT | `domain/agents/solution_architects/agents/sa_agent.yaml` (removed support_agent ref) |
| CREATE | `domain/playbooks/customer_architects/PB_CA_187_track_support_case.yaml` |
| CREATE | `domain/playbooks/customer_architects/PB_CA_188_escalate_support_issue.yaml` |
| CREATE | `domain/playbooks/delivery/PB_DEL_189_engage_dse.yaml` |
| CREATE | `domain/playbooks/customer_architects/PB_CA_190_review_support_health.yaml` |
| EDIT | `docs/architecture/blueprints/post-sales-model.md` (C06 ownership updated) |
| EDIT | `docs/architecture/agents/agent-handover-diagram.md` (Support Agent removed from flow) |
| EDIT | `docs/architecture/agents/agent-responsibilities.md` (section 12 removed) |
| REMOVE | `domain/agents/support/` (entire directory: agent config, personality, tasks) |

---

## Related Decisions

- **DDR-005** (Signal-Based Action Completion): establishes signals as the integration mechanism. This decision extends the signal catalog with support-domain signals.
- **DDR-016** (Skill Architecture): establishes skills as composable agent capabilities. SK_CA_001 is the first skill created specifically to absorb a dissolved agent's functions.
- **DDR-003** (Domain Specialist Agents): defines agent boundaries. This decision enforces those boundaries by removing an agent that violated them.

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-27 | PROPOSED | Review identified Support Agent as replicating support-as-a-function |
| 2026-02-27 | ACCEPTED | Option A (full dissolution into signals + CA skill) chosen and implemented |
