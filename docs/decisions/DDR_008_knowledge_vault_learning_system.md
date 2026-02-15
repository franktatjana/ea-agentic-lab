# DDR-008: Knowledge Vault Learning System

**Status:** ACCEPTED
**Date:** 2026-02-11
**Category:** Domain Decision Record
**Specification:** [knowledge-vault-architecture.md](../architecture/system/knowledge-vault-architecture.md)
**Extends:** [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md)

## Context

DDR-001 established the three-vault knowledge architecture with a Global Knowledge Vault (`vault/knowledge/`) for cross-account institutional memory. However, this vault remained empty: no mechanism existed to populate it, no agent read from it, and no UI surfaced it. Agents operated with static knowledge from hardcoded personality YAML rules and fresh signal extraction from raw inputs. Every engagement started from zero, with no cross-engagement learning.

The system's agent descriptions and playbooks contained generic, copy-pasted content with no connection to real field experience. There was no way for insights from one engagement to benefit the next.

## Decision

Implement a human-curated Knowledge Vault learning system where agents pull relevant knowledge at runtime without their personalities, prompts, or playbooks being auto-modified.

### Core Principle

The **static layer** (agent personality + playbooks) stays stable and human-controlled. The **dynamic layer** (Knowledge Vault content) grows over time. Agents receive relevant knowledge as enriched context at runtime.

### What Was Decided

1. **Source-first vault structure**: Reorganize `vault/knowledge/` into `operations/` (how the team works), `content/` (how team works with customer, per domain), `external/` (public research, industry standards), and `assets/` (reusable deliverables). This matches how humans think about knowledge origin.

2. **Structured knowledge items**: Each item is a YAML file with machine-queryable frontmatter (id, type, category, domain, archetype, phase, relevance, tags, confidence) and markdown content body.

3. **Pre-loaded context injection**: During playbook execution, the PlaybookExecutor fetches relevant items (matched by domain, archetype, phase from the node's blueprint) and injects them into the agent's input context. No agent code changes required.

4. **Dual ingestion with human curation**: Humans add items directly via UI. Agents propose items from engagements into a review queue (`.proposals/`). Humans approve or reject. Nothing enters the vault without human review.

5. **Confidence progression**: Items start as `proposed` (agent-generated), become `reviewed` (human-approved), and reach `validated` (proven across multiple engagements).

6. **Agent behavior never auto-modified**: Personality YAML, prompts, and playbook definitions are never changed by the system. Humans would be confused if plans and agent behavior shifted without their knowledge.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Auto-modify agent personalities based on outcomes | Fully autonomous learning, no human overhead | Plans become untrackable, humans confused by changing behavior, risk of drift, no audit trail | Violates principle that humans control agent behavior |
| RAG with vector database over past engagements | Semantic search, flexible retrieval | Requires new infrastructure (vector DB), harder to audit what agents receive, risk of surfacing customer-identifiable data | Over-engineering for current stage, YAML-based approach is consistent with rest of system |
| Static knowledge base (no runtime injection) | Simple, just documentation | Agents don't benefit, knowledge sits unread, same as current state | Doesn't solve the problem |
| LLM-based knowledge distillation | Could generate insights automatically | Hallucination risk, no human validation, expensive, hard to trace origin | Quality and trust concerns |

## Consequences

**Positive:**
- Every engagement benefits from prior experience without manual lookup
- Human oversight preserved: nothing enters the vault or changes agent behavior without review
- Backwards-compatible: agents that don't check `knowledge_context` continue working unchanged
- Knowledge items are auditable YAML files with clear provenance (source, author, confidence)
- UI enables browsing, searching, creating, and reviewing knowledge items
- Relevance scoring ensures agents receive the most applicable knowledge for their context

**Negative:**
- Initial vault is empty, value grows only as knowledge is added over time
- Human review creates a bottleneck for agent-proposed knowledge
- File-based scanning on every request (no index cache) may need optimization at scale

**Risks:**
- Low adoption: if humans don't add knowledge, the vault stays empty. Mitigated by seeding with initial best practices and making the UI easy to use.
- Irrelevant knowledge injection: agents receive items that don't help. Mitigated by relevance scoring (domain + archetype + phase matching) and confidence filtering.

## Implementation Summary

| Component | Location |
|---|---|
| Vault structure | `vault/knowledge/{operations,content,external,assets,.proposals}/` |
| Knowledge schemas | `application/src/api/models/knowledge_schemas.py` |
| Knowledge service | `application/src/api/services/knowledge_service.py` |
| API router | `application/src/api/routers/knowledge.py` |
| Context injection | `application/src/core/playbook_engine/knowledge_enricher.py` |
| Frontend page | `application/frontend/src/app/knowledge/page.tsx` |

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Established the vault structure this decision brings to life
- [DDR-003: Domain Specialist Agents](DDR_003_domain_specialist_agents.md): Specialist agents are primary consumers of domain-specific knowledge items
- [DDR-015: Curator Agent Specialization](DDR_015_curator_agent_specialization.md): Introduced dedicated Knowledge Vault Curator agent to govern Vault 3

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-11 | PROPOSED | Identified that Vault 3 was empty and agents had no cross-engagement learning |
| 2026-02-11 | ACCEPTED | Human-curated knowledge vault with pre-loaded context injection implemented |
