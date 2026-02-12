# DDR-005: Signal-Based Action Completion

**Status:** ACCEPTED
**Date:** 2026-02-10
**Category:** Domain Decision Record
**Specification:** [signal_matcher_agent.yaml](../../../domain/agents/governance/agents/signal_matcher_agent.yaml), [OP_ACT_002](../../../domain/playbooks/operational/OP_ACT_002_complete_action_from_signal.yaml)

## Context

Actions created from meetings and decisions require manual status updates to reach "done." In practice, sellers and account teams rarely update action statuses because it adds administrative burden with no immediate value to them. This leads to stale action trackers, false overdue alerts, and nudger fatigue where reminders are ignored because half the flagged items are already completed but not marked.

Industry research (Clari, Sybill, Revenue Grid, Gong) confirms a trend toward signal-based activity capture: reading seller behaviors from CRM updates, calendar events, email threads, and call transcripts rather than requiring explicit status clicks. The consensus is that eliminating admin burden increases data quality.

The question was whether to keep manual action completion or introduce automatic completion based on signals from daily operations already captured in the vault.

## Decision

Introduce a Signal Matcher Agent that reads vault artifacts (meeting notes, POC updates, decision logs) and matches them against open actions' `done_means` completion criteria using semantic analysis. Actions are completed automatically or flagged for confirmation based on a confidence score.

**Confidence scoring model** uses four weighted factors:

| Factor | Weight | What it measures |
|---|---|---|
| Semantic match | 0.35 | How closely the signal text matches the action's done_means |
| Source credibility | 0.25 | Meeting notes > informal updates, decision logs > chat messages |
| Temporal plausibility | 0.20 | Signal date is after action creation and near the expected timeframe |
| Actor overlap | 0.20 | Signal involves the action owner or related stakeholders |

**Three confidence tiers:**

| Tier | Threshold | Behavior |
|---|---|---|
| Auto-complete | >= 0.90 | Action marked done automatically, owner gets 48h revert window |
| Suggest complete | 0.60 - 0.89 | Owner gets one-tap confirm/reject notification |
| Evidence only | 0.30 - 0.59 | Evidence attached to action for human review, no status change |

**Safety rails:** Critical actions always require human confirmation regardless of score. Auto-completions include a 48h revert window. Multiple reverts on the same action trigger a review of the `done_means` clarity.

**Three new signals** added to the signal catalog: `SIG_HLT_005` (completion detected), `SIG_HLT_006` (completion confirmed by human), `SIG_HLT_007` (completion reverted by human).

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Manual-only completion | Simple, no false positives | High admin burden, stale trackers, nudger fatigue | Root cause of the problem we're solving |
| Fully automatic (no tiers) | Zero friction | No human oversight, risk of false completions on critical actions | Violates human-in-the-loop principle |
| External CRM integration | Rich signal source | Vendor dependency, not all teams use the same CRM, complex integration | Can be added later as additional signal source |
| Keyword matching only | Simple to implement | Misses semantic meaning, high false positive rate | Semantic matching needed for "done_means" criteria |

## Consequences

**Positive:**
- Sellers no longer need to manually click status buttons
- Action tracker stays current with actual work being done
- Nudger sends fewer false alerts, increasing trust in the system
- Evidence trail links completed actions to the specific artifact that proved completion

**Negative:**
- Confidence model requires tuning per domain (thresholds may need adjustment)
- Auto-completions could occasionally be wrong (mitigated by revert window)
- Adds complexity to the governance agent layer (one more agent to maintain)

**Risks:**
- If confidence thresholds are too low, false completions erode trust
- If too high, the system rarely auto-completes and feels no different from manual

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): vault artifacts serve as signal sources
- [DDR-004: Technology Signal Intelligence](DDR_004_tech_signal_intelligence.md): similar pattern of extracting structured insights from unstructured data

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-10 | ACCEPTED | Signal-based action completion model designed and agents defined |
