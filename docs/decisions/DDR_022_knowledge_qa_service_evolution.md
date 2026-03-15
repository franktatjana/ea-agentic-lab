# DDR-022: Knowledge Q&A Service Evolution

**Status:** ACCEPTED
**Date:** 2026-03-05
**Version:** 1.0
**Category:** Domain Decision Record
**Extends:** DDR-019 (domain model, knowledge layer), DDR-008 (knowledge vault learning system), DDR-013 (knowledge capture strategy)

---

## Context

The framework defines knowledge as a mandatory agent layer (DDR-019): every agent must declare what domain theory and reference material it reasons against. The current implementation uses static YAML references with manual `load_when` triggers that describe when each reference should be injected into context.

| Problem | Evidence |
|---------|----------|
| Static dump, not Q&A | When the UI renders a knowledge reference, it displays raw YAML content. Neither humans nor agents can query it contextually |
| Manual load triggers are redundant | `load_when: Analyzing deal signals from communications or CRM data` duplicates what the platform already knows from the current workflow step |
| Inline content bloats definitions | 5 agent definitions embed full knowledge content (signal detection keywords, risk scoring formulas) directly in the YAML, making files 800+ lines |
| 6 SA sub-agents have no knowledge block | sa-discovery, sa-risk, sa-decision-capture, sa-csp, sa-best-practices, sa-journey violate DDR-019's mandate |
| 4 agents declare empty references | partner, delivery, specialist-router, ca-agent have knowledge blocks with no references |
| No retrieval intelligence | The existing `knowledge_enricher.py` does metadata-based matching but cannot synthesize, summarize, or answer questions against reference material |

The platform should provide a Knowledge Q&A Service (analogous to a corporate RAG system) where agents declare their reasoning scope and the platform retrieves, synthesizes, and delivers relevant knowledge contextually during workflow execution.

---

## Decision

Evolve knowledge declarations from trigger-based loading to scope-based retrieval. The agent declares what domains and archetypes it reasons within. The platform uses workflow step context combined with agent scope to formulate retrieval queries against the knowledge corpus.

### 1. Add `scope` block to knowledge declarations

Each agent declares the domains it reasons within and the customer archetypes it applies to. The platform uses scope to focus retrieval, reducing noise and improving relevance.

```yaml
knowledge:
  scope:
    domains: [signal-detection, risk-assessment]
    archetypes: [enterprise, regulated-industries]
  references:
    - path: references/signal-detection.yaml
      description: "Commercial risk keywords, severity indicators"
    - path: references/risk-classification.yaml
      description: "Severity definitions and escalation criteria"
```

### 2. Remove `load_when` from individual references

The platform determines when to load knowledge based on the current workflow step's intent combined with the agent's scope. Manual `load_when` strings on each reference are redundant and create a maintenance burden.

### 3. Remove inline `content` blocks from definitions

Inline content belongs in reference files, not in agent definitions. Content that currently lives inline (signal detection keywords, risk scoring formulas) already exists in the corresponding reference files. Moving it out keeps definitions focused on structure.

### 4. Keep `path` and `description` on references

Reference metadata serves two purposes: traceability (which file informed this agent's output) and indexing (the description helps the knowledge hub build its search index). Both remain valuable in the Q&A model.

### 5. Add knowledge blocks to non-compliant agents

The 6 SA sub-agents and 4 empty-reference agents receive knowledge blocks with appropriate scope and references, closing the DDR-019 compliance gap.

### 6. Knowledge enricher evolution path

The existing `knowledge_enricher.py` evolves through three phases:

| Phase | Retrieval Mode | How It Works |
|-------|---------------|--------------|
| Current | Metadata match | Match agent scope + step context to reference file metadata |
| Next | Q&A retrieval | Platform formulates step-specific questions from step intent + agent scope, retrieves and synthesizes answers from reference corpus |
| Future | Proactive push | Platform monitors engagement context and proactively surfaces relevant knowledge before the agent requests it |

The three-vault model, reference file corpus (82 files across 19 agents), and curator agents remain unchanged. The Q&A service is a retrieval layer on top of existing infrastructure.

---

## Alternatives Considered

**A. Keep `load_when` alongside scope.** Rejected: redundant. The platform already knows the step context, and `load_when` strings rarely add information beyond what the step description provides. Maintaining both creates a consistency burden.

**B. Remove references entirely, let platform discover.** Rejected: loses traceability. Without explicit references, there is no audit trail connecting agent output to specific knowledge sources. References also help the knowledge hub prioritize indexing.

**C. Agent-side Q&A tool.** Each agent would call a `query-knowledge-hub` tool explicitly. Rejected: adds tool overhead to every agent, creates inconsistent retrieval patterns, and shifts retrieval responsibility from platform to agent.

---

## Consequences

### What Changes

- Knowledge block format across 47 agent definitions: add scope, remove load_when, remove inline content
- Domain model documentation: knowledge properties updated to reflect scope-based retrieval
- Knowledge architecture documentation: Q&A service section added
- Knowledge collection/sharing spec: contextual push section expanded
- Frontend definitions page: renders scope badges instead of load_when triggers
- 10 agents gain knowledge blocks they were missing (6 SA sub-agents, 4 empty-reference agents)

### What Stays the Same

- Three-vault knowledge architecture (Customer InfoHub, Internal Account Hub, Global Knowledge Vault)
- Reference file corpus (82 files, 19 agent directories)
- Curator agent responsibility for knowledge quality
- `path` and `description` on every reference
- DDR-019 mandate: every agent and sub-agent must declare knowledge

---

## Reference

- Full specification: [Domain Model](../architecture/system/domain-model.md) Section 4.1 (Knowledge)
- Knowledge architecture: [Three-Vault Model](../architecture/system/vault-architecture.md)
- Knowledge delivery: [Knowledge Lifecycle](../architecture/system/knowledge-lifecycle.md)
- Knowledge enricher: `platform/knowledge/knowledge_enricher.py`

---

## Decision Participants

Designed through analysis of the current knowledge layer implementation across 47 agent definitions, 82 reference files, and the platform knowledge service infrastructure.
