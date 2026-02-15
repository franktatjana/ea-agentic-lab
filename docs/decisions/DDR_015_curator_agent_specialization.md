# DDR-015: Curator Agent Specialization

**Status:** PROPOSED
**Date:** 2026-02-15
**Category:** Domain Decision Record
**Extends:** [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md), [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md), [DDR-014: Knowledge-to-Playbook Structural Feedback](DDR_014_knowledge_to_playbook_feedback.md)

## Context

DDR-001 established three vaults with distinct security boundaries and lifecycles. DDR-008 brought the Global Knowledge Vault to life with structured knowledge items and pre-loaded context injection. DDR-013 added continuous knowledge capture from raw inputs. DDR-014 introduced structural feedback from validated knowledge back into playbooks.

Throughout this evolution, a governance gap persisted: InfoHubs (Vaults 1 & 2) are governed by the Knowledge Curator Agent, but the Global Knowledge Vault (Vault 3) has no dedicated governance agent. Proposals sit in `.proposals/` with no agent validating anonymization, checking for duplicates, or verifying tagging accuracy. No agent tracks whether knowledge items are consumed during playbook execution. No agent identifies which playbook contexts lack coverage. The Knowledge Curator Agent's scope statement says "Maintain InfoHub as single source of truth," and its triggers, reads, and writes are all scoped to `{realm}/{node}/` paths, not `vault/knowledge/`.

The two vault types have fundamentally different characteristics:

| Dimension | InfoHubs (Vaults 1 & 2) | Global Knowledge Vault (Vault 3) |
|-----------|------------------------|----------------------------------|
| Scope | Per-engagement, per-node | Cross-engagement, company-wide |
| Lifecycle | Created at node init, archived at close | Persistent, grows indefinitely |
| Content | Account-specific artifacts | Anonymized patterns and best practices |
| Update frequency | Continuous during engagement | Periodic, after engagement retrospectives |
| Governance need | Freshness, naming, link integrity, conflict detection | Anonymization, deduplication, tagging accuracy, usage tracking |
| Contributors | Agents create, humans review | Agents propose, humans approve |

A single agent governing both would mix per-engagement ephemeral concerns with cross-engagement institutional concerns, violating single-responsibility principle and creating a god-object.

## Decision

Split the Knowledge Curator Agent into two specialized agents:

### 1. InfoHub Curator Agent (renamed from Knowledge Curator)

`agent_id: infohub_curator_agent` (was `knowledge_curator_agent`)

All existing responsibilities preserved: semantic integrity, lifecycle management, staleness detection, naming compliance, link integrity for InfoHub artifacts. Scope explicitly limited to Vaults 1 & 2. New capability: emits `engagement_learnings_ready` signal when engagements close, enabling the Knowledge Vault Curator to ensure learnings are processed for potential knowledge extraction.

### 2. Knowledge Vault Curator Agent (new)

`agent_id: knowledge_vault_curator_agent`

The Global Knowledge Vault's librarian. Facilitates institutional knowledge management while preserving human ownership. Core responsibilities:

- **Proposal validation**: Check schema compliance, anonymization, tagging accuracy, and deduplication before surfacing proposals to human reviewers
- **Anonymization enforcement**: No customer-identifiable data in Vault 3 (non-negotiable blocker)
- **Semantic integrity**: Detect contradictions across vault items
- **Knowledge lifecycle**: Manage confidence progression (proposed -> validated_pending -> reviewed -> validated -> obsolete -> archived)
- **Playbook seeding**: Track which items are consumed during playbook execution, identify coverage gaps (domains/archetypes with no matching items), recommend confidence promotions based on usage patterns
- **Obsolescence detection**: Flag items not consumed in 12 months, contradicted by recent patterns, or from deprecated domains

The Knowledge Vault Curator is a facilitator. Humans own the vault. The agent validates and prepares; humans approve and reject.

### Contributor model

The Knowledge Vault has two contributor types:

- **Humans**: Direct entry via Knowledge Vault UI, and final approval/rejection authority over all proposals
- **Agents**: Propose items via `.proposals/` queue during playbook execution, engagement retrospectives, or raw input mining (DDR-013)

The Knowledge Vault Curator is not a contributor. It validates, organizes, and facilitates the flow from proposal to human review.

### Collaboration between curators

The primary collaboration occurs around engagement transitions. During active engagements, the InfoHub Curator operates independently on Vaults 1 & 2. When an engagement closes, it emits `engagement_learnings_ready` so the Knowledge Vault Curator ensures retrospective outputs are processed. If the Knowledge Vault Curator detects a vault item contradicted by recent engagement artifacts, it can signal back to the InfoHub Curator to flag the relevant engagement content.

### New signals

| Signal | Producer | Consumers | Purpose |
|--------|----------|-----------|---------|
| `knowledge_proposal_received` | Any agent | Knowledge Vault Curator | Proposal submitted to `.proposals/` |
| `knowledge_proposal_validated` | Knowledge Vault Curator | Nudger, notification | Proposal ready for human review |
| `knowledge_gap_detected` | Knowledge Vault Curator | Playbook Curator, Reporter | Playbook context lacks matching knowledge |
| `knowledge_item_obsolete` | Knowledge Vault Curator | Notification | Item flagged for potential retirement |
| `engagement_learnings_ready` | InfoHub Curator | Knowledge Vault Curator | Engagement closing, artifacts available |

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Extend Knowledge Curator to cover all 3 vaults | No new agent, simpler | Mixes per-engagement scope with cross-engagement scope. Different lifecycles, triggers, and quality gates create a god-object | Violates single-responsibility principle |
| No dedicated agent for Vault 3 (current state) | Simplest | No anonymization validation, no usage tracking, no gap analysis, proposals accumulate without processing | The governance gap DDR-008 acknowledged as a risk |
| Merge vault curation into Playbook Curator | Knowledge items serve playbooks | Conflates playbook structure governance with knowledge content governance. Different domains, different expertise | Playbook Curator governs playbook structure, not knowledge quality |

## Consequences

**Positive:**
- Vault 3 gets dedicated governance with anonymization enforcement
- Clear responsibility boundaries between engagement-scoped and cross-engagement-scoped curation
- Knowledge-playbook alignment tracked (feeds into DDR-014 structural feedback)
- Proposal queue actively managed instead of accumulating without review
- Contributor model (humans + agents) explicitly documented

**Negative:**
- Agent count increases from 23 to 24 (governance agents from 8 to 9)
- Broad documentation update across 20+ files for agent rename
- Signal catalog expanded with 5 new signals

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Established the three-vault model this decision governs
- [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md): Established vault structure and human curation principle
- [DDR-013: Knowledge Capture Strategy](DDR_013_knowledge_capture_strategy.md): Established contribution-as-byproduct feeding the proposal queue
- [DDR-014: Knowledge-to-Playbook Structural Feedback](DDR_014_knowledge_to_playbook_feedback.md): Knowledge Impact Assessment that the Knowledge Vault Curator facilitates

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-15 | PROPOSED | Identified governance gap in Vault 3 and lifecycle mismatch in single-curator model |
