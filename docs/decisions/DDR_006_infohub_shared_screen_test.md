# DDR-006: InfoHub Shared Screen Test

**Status:** ACCEPTED
**Date:** 2026-02-11
**Category:** Domain Decision Record

## Context

The External InfoHub was designed as the "customer-facing knowledge base" for an engagement. In practice, it accumulated vendor analysis *about* the customer alongside truly customer-safe content. Journey maps with internal stage analysis, stakeholder maps with influence and bias assessments, pursuit decision logs, discovery findings with internal framing, and value projections all lived in the External InfoHub.

This created a structural risk: the physical separation between External and Internal InfoHub, which DDR-001 established as the primary security boundary, was undermined by content that would be embarrassing or damaging if a customer saw it. A stakeholder map noting "Klaus has LegacySIEM bias, influence: high" is vendor analysis, not a customer deliverable.

## Decision

**The External InfoHub passes the "shared screen test"**: every artifact must be safe to project on a shared screen during a customer meeting. Content that fails this test belongs in the Internal InfoHub.

### What stays in External InfoHub

- **Solution architecture**: ADRs, technical approach documents, reference architectures
- **Technical guidelines**: implementation guides, configuration recommendations, best practices
- **Customer deliverables**: proposals, SOWs, project plans co-owned with the customer
- **Agreed outcomes**: customer-approved success criteria, realized value metrics

### What moves to Internal InfoHub

- **Engagement context**: node overview, stakeholder map (contains influence analysis), engagement history
- **Decision logs**: internal pursuit decisions ("Full Strategic Pursuit Approved")
- **Journey maps**: vendor's analysis of customer buying journey, touchpoint logs
- **Discovery artifacts**: requirements capture, POC planning and status tracking
- **Opportunities**: deal-level pipeline data
- **Value tracking**: internal ROI projections and value hypotheses

These content types are vendor analysis about the customer, not content for the customer.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|-------------|------|------|-----------------|
| Metadata-based filtering | No file moves needed, flexible | DDR-001 explicitly chose structural over metadata separation; one missed tag exposes sensitive content | Contradicts foundational architecture decision |
| Create a third "shared" hub | Clean semantic distinction | Proliferates vault structure, adds complexity for demo app | Over-engineering |
| Keep current structure, add content guidelines | No code changes | Guidelines are not enforced structurally; agents need clear rules about where to write | Soft controls don't prevent accidents |

## Consequences

**Positive:**
- External InfoHub is genuinely safe to share, matching its stated purpose
- Internal InfoHub becomes the single source of truth for all vendor analysis
- Simpler mental model: External = deliverables, Internal = everything else
- Agents have a clear, testable rule for content placement

**Negative:**
- External InfoHub becomes very slim (primarily architecture docs)
- Existing documentation and path references need updating

**Risks:**
- None significant; this is a data reorganization with backend path updates

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md) establishes structural separation as the security model
- [DDR-002: Canvas Framework](DDR_002_canvas_framework.md) defines canvas artifacts that may live in either hub depending on audience

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-11 | ACCEPTED | Initial decision, applied to vault structure and backend services |
