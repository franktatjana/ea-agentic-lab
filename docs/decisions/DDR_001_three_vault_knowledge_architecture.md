# DDR-001: Three-Vault Knowledge Architecture

**Status:** ACCEPTED
**Date:** 2026-02-09
**Category:** Domain Decision Record
**Specification:** [knowledge-architecture.md](../architecture/system/knowledge-architecture.md)

## Context

Enterprise engagements produce knowledge at different levels of sensitivity and audience. The original project structure used two containers: `vault/infohub/` (per-account content, mixed customer-facing and internal) and `vault/knowledge/` (cross-account best practices). This created a fundamental problem: there was no clear boundary between what the customer should see and what only the vendor team should access.

In practice, an SA creates architecture documentation (customer-facing), competitive positioning notes (vendor-only), and sizing estimations with commercial implications (vendor-only). All of this ended up in the same `infohub/` directory with no separation. The risk: sharing the wrong content with a customer, or failing to share content the customer should have.

## Decision

Separate knowledge into three vaults, each with distinct audience, access rules, content standards, and lifecycle.

1. **Customer InfoHub** (per account, shareable): solution architecture, ADRs, POC plans, learning paths, professional services assets. No commercial information, no intermediary decisions, no competitive intelligence. Content is either collected from existing assets or created specifically for this customer. The customer keeps this beyond the engagement.

2. **Internal Account Hub** (per account, vendor-only): competitive intelligence, deal reviews, internal meeting notes, candid risk assessments, pricing strategy, stakeholder mapping, agent scratchpads. Account-specific and identifiable.

3. **Global Knowledge Vault** (cross-account, vendor-only): anonymized best practices, winning patterns, evolved evaluation criteria, tribal knowledge. No customer-identifiable information.

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into company-level knowledge. The Customer InfoHub is a separate output stream, never derived from internal content.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Two vaults (infohub + knowledge) | Simpler, already implemented | No separation between customer-facing and vendor-internal account content. Sharing risk. | The problem we're solving |
| Four vaults (add "shared workspace") | Covers collaboration scenarios | Over-segmentation. Collaboration happens in the Internal Account Hub. | Added complexity without clear benefit |
| Tag-based access control (single vault, metadata tags) | Flexible, no structural change | Relies on correct tagging for security boundary. One missed tag = content leak. | Security boundary should be structural, not metadata-dependent |
| Customer gets a generated export (not a vault) | Clean separation | Export is a snapshot, not a living document. Doesn't support ongoing post-sales updates. | Customer InfoHub must be a living artifact updated during adoption |

## Consequences

**Positive:**
- Clear security boundary: customer-facing content is structurally separated from vendor-internal content
- Each vault has explicit "contains" and "does NOT contain" rules, reducing ambiguity
- Playbooks can declare `vault_routing` metadata, making output destinations explicit
- Global Knowledge Vault grows with every engagement through anonymized contribution
- Customer InfoHub becomes a professional services deliverable with lasting value

**Negative:**
- Current `vault/infohub/` structure needs separation (migration effort)
- Every playbook that writes to a vault needs `vault_routing` metadata (6 new playbooks already include this)
- Content creators must decide which vault an artifact belongs to (decision overhead)

**Risks:**
- Content misclassification: an artifact placed in the wrong vault. Mitigated by playbook vault_routing rules and future validator checks (see [ADR-001](ADR_001_streamlit_playbook_viewer.md)).
- Duplication: same information in Customer InfoHub and Internal Account Hub. Mitigated by the rule that Customer InfoHub content is never derived from internal content, it flows separately.

## Impact on Existing Artifacts

The following playbooks now include `vault_routing` metadata aligned with this decision:
- PB_102 Sizing Estimation → Internal Account Hub (primary), Customer InfoHub (sanitized summary)
- PB_103 Technical Validation Checklist → Customer InfoHub (primary), Internal Account Hub (internal notes)
- PB_104 Solution Description → Customer InfoHub (primary), Internal Account Hub (internal architecture notes)
- PB_404 Customer Guidelines → Customer InfoHub
- PB_405 Training Plans → Customer InfoHub
- PB_406 Adoption Guidance → Customer InfoHub (primary), Internal Account Hub (candid assessment)

Existing playbooks without `vault_routing` metadata need to be updated. This is tracked as a documentation consistency task.

## Related Decisions

- [ADR-001: Streamlit Playbook Viewer](ADR_001_streamlit_playbook_viewer.md): validator view should check vault routing consistency across all playbooks

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-09 | PROPOSED | Identified that mixed infohub content has no customer-facing vs vendor-internal boundary |
| 2026-02-09 | ACCEPTED | Three-vault model confirmed, 6 new playbooks created with vault_routing metadata |
