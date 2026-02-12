# DDR-009: Stakeholder Stance Classification

**Status:** ACCEPTED
**Date:** 2026-02-11
**Category:** Domain Decision Record
**Extends:** [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md)

## Context

The Stakeholders tab displayed Total: 9 stakeholders but showed Champions: 0, Supporters: 0, Neutral: 0, Blockers: 0. Investigation revealed a three-layer data model mismatch:

1. **YAML data** stored sentiment nested under `relationship.sentiment` with descriptive values (`supportive`, `skeptical_but_open`, `highly_supportive`)
2. **Frontend** read `s.stance || s.sentiment` at the top level of each stakeholder object, expecting enum values (`champion`, `supporter`, `neutral`, `blocker`)
3. **Backend** returned raw YAML dict with no transformation, so the nested `relationship.sentiment` was never found by the top-level check

Beyond fixing the display bug, the question was: how should stakeholders get classified into stance categories going forward? The system needs a mechanism for classification that keeps humans in control while benefiting from agent analysis.

## Decision

Implement a **human-confirmed stance classification** system where agents propose stance changes and humans approve or reject them. This follows the same propose-then-confirm pattern established by DDR-008 for the Knowledge Vault.

### What Was Decided

1. **Explicit stance field**: Each customer stakeholder in `stakeholder_map.yaml` gets a top-level `stance` field with one of four values: `champion`, `supporter`, `neutral`, `blocker`. This is the canonical classification field the frontend reads.

2. **Derivation rules for bootstrapping**: Initial stance is derived from existing data using deterministic rules:

   | Condition | Stance |
   |-----------|--------|
   | `sentiment: highly_supportive` AND (champion role OR champion_status) | champion |
   | `sentiment: supportive` | supporter |
   | `sentiment: skeptical_but_open` OR `unknown` OR missing | neutral |
   | `sentiment: negative` OR `resistant` OR `hostile` | blocker |

3. **Agent-propose, human-confirm**: Agents propose stance changes through a `stance_proposals` section in the stakeholder map. Proposals include the stakeholder, current stance, proposed stance, reason, and source. Humans approve or reject via the Stakeholders tab.

4. **Stance is deal-level, not profile-level**: Stance lives in `stakeholder_map.yaml` (the aggregated deal view), not in individual stakeholder profile YAML files. The same person could have different stances across different nodes.

5. **Vendor team excluded from stance**: Only customer stakeholders receive a stance classification. Vendor team members in the stakeholder array have no stance field.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Fully manual classification | Simple, humans always in control | Requires human attention for every change, no agent input | Agents see engagement signals humans might miss |
| Fully automatic (agents set stance directly) | No human overhead, immediate updates | Humans lose visibility into classification changes, risk of incorrect classification affecting strategy | Violates principle that humans control deal-critical decisions |
| Signal-only (compute from signals, no stored field) | Always fresh, no stale data | No way to override, every page load recomputes, complex signal aggregation needed | Over-engineering, and humans can't correct misclassifications |
| Derive from sentiment field (no explicit stance) | No new field needed | Frontend logic becomes complex, sentiment values don't map cleanly to stance categories, lossy | Sentiment and stance are different concepts: sentiment is how they feel, stance is their deal position |

## Consequences

**Positive:**
- Stakeholder counts now display correctly in the UI
- Agents can propose reclassifications based on engagement signals (meeting outcomes, POC results, sentiment shifts)
- Humans retain final say on deal-critical stakeholder classification
- Audit trail via change_log in stakeholder_map.yaml
- Same propose-then-confirm pattern as Knowledge Vault, reducing cognitive overhead

**Negative:**
- Initial stance values are manually bootstrapped (one-time effort per node)
- Proposal review creates human overhead (mitigated by showing proposals inline in the Stakeholders tab)

**Risks:**
- Stale classification: stance may not be updated after significant engagement changes. Mitigated by agent proposals and periodic review prompts.
- Over-proposal: agents could generate too many stance proposals. Mitigated by limiting proposals to meaningful sentiment shifts detected via signals.

## Implementation Summary

| Component | Location |
|---|---|
| Stance field in YAML data | `vault/{realm}/{node}/internal-infohub/context/stakeholder_map.yaml` |
| Pydantic models | `application/src/api/models/schemas.py` (Stance, StanceProposal, StanceProposalCreate) |
| Stance service | `application/src/api/services/stance_service.py` |
| API endpoints | `application/src/api/routers/nodes.py` (4 endpoints under `/stakeholders/proposals`) |
| Frontend proposal UI | `application/frontend/src/app/realms/[realmId]/nodes/[nodeId]/page.tsx` (StakeholdersTab) |

## Related Decisions

- [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md): Established the propose-then-confirm pattern this decision reuses
- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Stakeholder data lives in Internal Account Hub (vendor-only)

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-11 | PROPOSED | Identified display bug and data model mismatch in stakeholder stance classification |
| 2026-02-11 | ACCEPTED | Agent-propose, human-confirm pattern implemented for stance classification |
