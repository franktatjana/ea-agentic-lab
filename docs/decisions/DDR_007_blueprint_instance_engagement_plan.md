# DDR-007: Blueprint Instance as Engagement Plan

**Status:** ACCEPTED
**Date:** 2026-02-11
**Category:** Domain Decision Record
**Specification:** `vault/{realm}/{node}/blueprint.yaml`

## Context

The system has two distinct blueprint concepts operating at different levels:

1. **Reference blueprints** (`domain/blueprints/reference/{archetype}/`) define the ideal playbook composition, canvases, checklists, and governance for a given archetype and track combination. These are templates, authored once and reused across engagements.

2. **Blueprint instances** (`vault/{realm}/{node}/blueprint.yaml`) are created when an engagement starts. They record which playbooks were selected, their execution status, canvas progress, checklist results, success criteria, expected signals, timeline, and governance settings.

The question arose whether an "engagement plan" should be introduced as a separate artifact to track execution state, playbook additions mid-engagement, and plan evolution. This would sit between the reference blueprint and the operational governance files (action tracker, risk register, operating cadence) already in the vault.

## Decision

**The blueprint instance IS the engagement plan.** No separate entity is needed.

Each node's `blueprint.yaml` already tracks everything an engagement plan would contain: playbook composition with per-playbook status, canvas requirements with completion state, validation checklists, success criteria, expected signals, timeline, and governance rules. Adding a changelog section to capture plan evolution (playbooks added or removed mid-engagement, status transitions) completes the picture.

The lifecycle is:

```
Reference Blueprint (template, domain/)
    |  instantiate onto a node
    v
Blueprint Instance (engagement plan, vault/{realm}/{node}/blueprint.yaml)
    |-- playbooks[] with status (pending/active/in_progress/completed/skipped)
    |-- canvases[] with status
    |-- checklists[] with status
    |-- success_criteria[] with status
    |-- expected_signals[] with status
    |-- timeline
    |-- governance
    |-- changelog[] (plan evolution log)
    |
    |-- links to operational artifacts
            |-- action_tracker.yaml
            |-- risk_register.yaml
            |-- operating_cadence.yaml
```

The changelog section captures modifications with timestamp, action type, and details:

```yaml
changelog:
  - timestamp: "2026-01-15T10:00:00Z"
    action: "blueprint_instantiated"
    details: "Instantiated from reference blueprint A02_competitive"
  - timestamp: "2026-02-03T09:15:00Z"
    action: "playbook_added"
    details: "PB_202 (PESTLE Analysis) added, reason: compliance requirement identified"
```

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|-------------|------|------|-----------------|
| Separate `engagement_plan.yaml` | Clean separation between template output and execution state | Duplicates structure already in blueprint.yaml; requires syncing two files; adds conceptual overhead | The blueprint instance already contains all plan fields |
| Metadata overlay on reference blueprint | Minimal new data | Loses node-specific modifications; can't track additions or removals | Reference blueprints are shared templates, not per-node |
| Embed plan in `node_profile.yaml` | Single file per node | node_profile is identity and classification; mixing execution state into it violates SRP | Different change frequencies and audiences |

## Consequences

**Positive:**
- Single source of truth for engagement execution state per node
- No new file types or concepts to learn
- Existing Blueprint tab UI already renders this data, only needs edit capabilities added
- Changelog provides audit trail for plan evolution without a separate artifact
- Agents can read one file to understand the full engagement plan

**Negative:**
- `blueprint.yaml` grows larger as changelog accumulates (acceptable for demo scope)
- Write operations to blueprint.yaml need care to avoid data loss (read-modify-write pattern)

**Risks:**
- Concurrent writes from multiple agents could conflict. For the current demo scope (single-user, no concurrent agents writing), this is not a concern. Production would need file locking or a database.

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md) establishes the vault structure where blueprint instances live
- [DDR-002: Canvas Framework](DDR_002_canvas_framework.md) defines canvas artifacts tracked in the blueprint instance
- [DDR-005: Signal-Based Action Completion](DDR_005_signal_based_action_completion.md) defines the signal mechanism that expected_signals in the blueprint tracks

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-11 | ACCEPTED | Initial decision, blueprint instances confirmed as engagement plans with changelog |
