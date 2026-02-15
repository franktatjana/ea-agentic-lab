# DDR-014: Knowledge-to-Playbook Structural Feedback

**Status:** PROPOSED
**Date:** 2026-02-14
**Category:** Domain Decision Record
**Extends:** [DDR-013: Knowledge Capture Strategy](DDR_013_knowledge_capture_strategy.md), [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md), [DDR-012: Playbook Metadata Standardization](DDR_012_playbook_metadata_standardization.md)

## Context

DDR-013 closes the knowledge capture loop: raw inputs are mined, proposals reviewed, and validated items injected into agent context at runtime. DDR-008 established that agents receive relevant knowledge through `knowledge_context` during playbook execution.

Both decisions address runtime enrichment: the playbook stays the same, but the agent gets more context. This works for ephemeral guidance ("in 3 similar deals, procurement added 6 weeks"). It does not work when the insight should change the playbook itself.

### The structural feedback gap

DDR-013's feedback loop diagram shows content compounding:

```
better artifacts → richer raw material → better proposals → vault grows
```

The missing loop is structural:

```
validated knowledge → playbook improvement → better execution → richer raw material
```

When a knowledge item reaches `validated` status, it may warrant a permanent change to how work is done, not just what context agents see while doing it. Today nothing connects a validated insight to the playbooks it should change.

### Why runtime injection is insufficient

Consider a validated knowledge item: "Financial services procurement cycles add 4-8 weeks to every enterprise deal. Teams that account for this in discovery avoid timeline surprises in 87% of cases."

**Runtime injection (DDR-008 path):** The SA agent receives this as context while running PB_201 (Technical Discovery Framework). It may or may not incorporate the insight into its output. On the next engagement, a different agent instance receives the same context and may handle it differently. The insight is available but not operationalized.

**Structural change (what's missing):** PB_201's discovery step for timeline estimation should include "procurement cycle assessment" as a required input. PB_102 (Qualification Criteria Checklist) should add "procurement governance identified" as a qualification gate. The competitive displacement blueprint (A02) should adjust `discovery_weeks` for financial services from 3 to 5. These changes are permanent improvements that every future engagement benefits from, regardless of whether the agent reads its context carefully.

### The cross-team problem

A single insight can affect multiple playbooks owned by different teams:

**Example: "Multi-stakeholder deals above $500K require separate technical and business tracks"**

| Affected playbook | Team | What changes |
|---|---|---|
| PB_102: Stakeholder Mapping | SA | Add step: "Identify if separate tracks needed based on deal size and stakeholder count" |
| PB_301: Competitive Positioning | SA | Add conditional: "For multi-track deals, produce per-track positioning" |
| PB_103: Business Case Development | AE | Add section: "Per-track value articulation" |
| A02: Competitive Displacement blueprint | SA | Add optional playbook for multi-track governance |

No single person owns all four changes. The SA team owns three, the AE team owns one, and the blueprint has its own governance. Without a coordination mechanism, either nothing gets updated (most likely), or one team updates their playbook while others remain inconsistent.

### When to change structure vs. inject context

Not every knowledge item warrants a playbook change. The distinction:

| Signal | Action | Example |
|---|---|---|
| Insight is **situational**, applies to a subset of engagements | Runtime injection (DDR-008) | "Healthcare deals in DACH region require local data residency discussion" |
| Insight is **universal**, applies to every engagement matching domain/archetype/phase | Structural change (this DDR) | "Every competitive displacement requires incumbent contract analysis" |
| Insight **contradicts** a current playbook step | Structural change | "Skip ROI calculator for deals under $100K, it reduces win rate" |
| Insight **adds a missing step** that repeatedly causes failures when absent | Structural change | "Add procurement assessment to discovery for financial services" |
| Insight is **informational**, adds depth but not new actions | Runtime injection | "Average POC duration in manufacturing is 6 weeks, not 4" |

The trigger for structural change: when the same runtime-injected knowledge item is surfaced in 5+ engagements AND correlates with improved outcomes, it should be promoted from context to structure.

## Decision

Introduce a **Knowledge Impact Assessment** that connects validated knowledge items to the playbooks and blueprints they should change, routed to each affected team's owner for independent review.

### How it works

**Step 1: Impact detection.** When a knowledge item's confidence reaches `validated` (or is approved with high confidence), the system identifies affected playbooks by matching:
- `domain` overlap (knowledge domain matches playbook domain/archetype)
- `phase` overlap (knowledge phase matches playbook phase)
- `relevance` overlap (knowledge agent roles match playbook `intended_agent_role`)
- `tags` overlap (knowledge tags match playbook category/tags)

**Step 2: Impact record creation.** For each affected playbook, the system creates a Knowledge Impact Record:

```yaml
impact_id: "KIR_001"
knowledge_item: "KV_003"
knowledge_title: "Multi-Stakeholder Deals Need Separate Tracks"
affected_playbook: "PB_102"
affected_team: "sa_strategic"
impact_type: "add_step"  # add_step | modify_step | add_condition | update_timeline | add_input | add_output
suggested_change: "Add stakeholder track assessment after stakeholder identification step"
status: "pending"  # pending | accepted | rejected | deferred
created: "2026-02-14"
reviewed_by: null
review_notes: ""
```

**Step 3: Routing.** Impact records are grouped by `affected_team` and surfaced to the team's playbook owner. Each owner reviews independently. Accepting an impact record on PB_102 does not require accepting the related record on PB_103. Teams operate at their own pace.

**Step 4: Execution.** An accepted impact record becomes a playbook change. The change follows the existing playbook edit flow (DDR-012 field standardization, raw YAML edit via API). The impact record is marked `accepted` and linked to the resulting playbook version.

### What this does NOT do

- **Auto-modify playbooks.** DDR-008 principle: humans control agent behavior. Impact records are proposals, not auto-applied changes.
- **Block playbook execution.** Pending impact records do not prevent playbooks from running. They are improvement suggestions, not blockers.
- **Replace runtime injection.** Knowledge items continue to be injected at runtime (DDR-008 path). Structural changes are an additional, slower feedback path for insights that have proven universal value.

### Knowledge Impact Record lifecycle

```
Knowledge item reaches "validated"
  │
  ▼
System identifies affected playbooks (domain + phase + role + tags matching)
  │
  ▼
Impact records created, one per affected playbook
  │
  ▼
Records grouped by team, surfaced to playbook owners
  │
  ├── Owner accepts → playbook updated, record closed
  ├── Owner rejects → record closed with reason
  └── Owner defers → record stays pending, re-surfaced in 30 days
```

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Single "adapt to playbook" button on knowledge articles | Simple UI, direct action | Creates new playbooks instead of improving existing ones, no cross-team coordination, user must know which playbook to target | Does not solve the routing or multi-playbook problem |
| Automatic playbook modification by agents | Zero human effort | Violates DDR-008 principle, unauditable, risk of drift, teams lose ownership | Humans must control playbook changes |
| Knowledge items as playbook dependencies (linked at runtime) | No playbook changes needed, always fresh | Playbooks become unpredictable as knowledge changes, harder to test, no stable baseline | Stability matters for playbook governance |
| Centralized change board reviews all impacts | Consistent governance | Bottleneck, does not scale, reduces team autonomy | Cross-team routing to individual owners is more scalable |

## Consequences

**Positive:**
- Knowledge flows back into the structural layer, not just runtime context
- Cross-team impacts are identified and routed to the right owner
- Each team reviews independently, preserving ownership and autonomy
- Impact records create an audit trail: "this playbook step was added because of KV_003"
- The distinction between runtime context and structural change is explicit

**Negative:**
- Impact detection matching may produce false positives (irrelevant playbooks flagged)
- Review burden on playbook owners if many knowledge items reach `validated` simultaneously
- Impact records add another queue alongside knowledge proposals (DDR-013)

**Risks:**
- **Impact queue rot.** Same risk as DDR-013's proposal queue. Mitigated by: deferred records auto-resurface in 30 days, expired records after 90 days, batched weekly digests per team.
- **Matching accuracy.** Domain/phase/tag matching may be too coarse. A knowledge item about "financial services procurement" should not flag every playbook that mentions "financial services." Mitigated by: requiring at least 2 of 4 matching dimensions (domain + phase, or domain + tags, etc.), and allowing owners to permanently dismiss false matches.
- **Change coordination.** When 4 playbooks need related changes, there is no guarantee all 4 owners accept. Partial adoption is acceptable: each playbook improvement is independently valuable, even if not all related playbooks update simultaneously.

## Open Questions

1. **Promotion threshold.** How many engagements must benefit from runtime-injected knowledge before the system suggests a structural change? Proposed: 5 engagements with positive outcome correlation.
2. **Impact record format.** Should `suggested_change` be free text, a structured diff, or a reference to a specific playbook step/line?
3. **Blueprint impacts.** Should impact records also target blueprints (timeline changes, playbook additions to tracks), or only individual playbooks?
4. **Consumption tracking prerequisite.** DDR-013 Open Question #5 asks whether the system should track which knowledge items are used during execution. This DDR assumes the answer is "yes," because promotion from runtime to structure requires usage data.

## Related Decisions

- [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md): Established runtime injection and human curation principle
- [DDR-012: Playbook Metadata Standardization](DDR_012_playbook_metadata_standardization.md): Standardized playbook fields that impact records reference
- [DDR-013: Knowledge Capture Strategy](DDR_013_knowledge_capture_strategy.md): Established contribution-as-byproduct and the feedback loop this DDR extends

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-14 | PROPOSED | Identified structural feedback gap between DDR-013 knowledge capture and playbook improvement |
