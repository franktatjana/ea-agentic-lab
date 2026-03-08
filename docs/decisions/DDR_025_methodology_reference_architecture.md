# DDR-025: Methodology Reference Architecture

**Status:** ACCEPTED
**Date:** 2026-03-08
**Version:** 1.0
**Category:** Domain Decision Record
**Extends:** DDR-019 (domain model, knowledge layer), DDR-012 (playbook metadata standardization)

---

## Context

Playbooks define execution logic: phases, decisions, routing, and outputs. Practitioner knowledge, the domain expertise that tells an agent how to think about a problem, has no standardized home. This creates three failure modes observed during SA competency gap closing.

| Gap | Evidence |
|-----|----------|
| Knowledge embedded in playbooks | Early playbooks mixed execution phases with methodology content, making both harder to maintain independently |
| Knowledge absent entirely | Playbooks without domain knowledge rely on LLM general knowledge, the "hallucination risk" DDR-019 warns about |
| Knowledge duplicated across playbooks | Discovery techniques appeared in PB_SA_014 and PB_SA_015 with no single source of truth |
| Vendor-specific content not abstractable | PDF source materials contain valuable practitioner methodology but cannot be copy-pasted due to vendor-specific framing |

DDR-019 established Knowledge as a mandatory agent-owned layer but did not specify how playbooks consume it. DDR-012 standardized playbook metadata but did not include a knowledge binding field. This decision closes both gaps.

---

## Decision

Introduce a `knowledge_refs` field in playbooks that binds execution logic to methodology reference files. Methodology references are YAML files in the agent's `references/` directory that contain vendor-neutral practitioner knowledge.

### 1. Separation of Concerns

Three atomic units, each independently versioned and updatable:

| Unit | Contains | Changes when |
|------|----------|-------------|
| **Playbook** | Phases, decisions, flow_bindings, outputs, RACI | Execution process changes |
| **Methodology reference** | Domain knowledge, techniques, frameworks, signals, discussion areas | Practitioner expertise evolves |
| **Skill** | Agent capability, workflow steps, prompt refs | Agent behavior changes |

A playbook declares what to do. A methodology reference declares how to think about it. A skill declares what the agent can do. Each changes for different reasons, owned by different concerns.

### 2. knowledge_refs Field

Every playbook gains an optional `knowledge_refs` section:

```yaml
knowledge_refs:
  - ref: "references/discovery-methodology.yaml"
    load_when: "All discovery sessions"
    provides: "Discussion areas, persona engagement guides, SA-AE collaboration model"
  - ref: "references/solution-fit-methodology.yaml"
    load_when: "Assessing opportunity shape"
    provides: "Transactional vs strategic signals, capability framework, roadmap guidance"
```

Fields:
- `ref`: relative path to methodology file from the agent's directory
- `load_when`: condition describing when the agent should load this knowledge
- `provides`: summary of what the reference contributes to playbook execution

### 3. Methodology Reference Structure

Methodology files follow a consistent YAML structure:

```yaml
# {Methodology Name} Reference
# Referenced by: {playbook_id} ({playbook_name})
# Load when: {condition}

# Sections organized by knowledge domain
{domain_area}:
  purpose: "Why this area matters"
  key_questions:
    - "What to ask or assess"
  techniques:
    - "How to approach it"
  signals:
    - "What to look for"
  red_flags:
    - "What indicates problems"
```

Sections are domain-specific. A discovery methodology has discussion areas and persona guides. A qualification methodology has scoring criteria and threshold signals. The structure adapts to the knowledge domain while maintaining consistent YAML patterns.

### 4. Applicability Threshold

Not every playbook needs a methodology reference. The threshold rule:

**Create a methodology reference when:**
- The playbook encodes practitioner expertise that could change independently from execution logic
- Multiple playbooks share the same domain knowledge
- Source knowledge requires vendor-neutralization from proprietary materials
- Knowledge curators would update methodology without changing playbook structure

**Keep knowledge inline when:**
- The playbook's decision logic IS the methodology (framework applications like SWOT, decision trees)
- The playbook is purely structural with no practitioner nuance
- The knowledge is trivially simple and unlikely to evolve

### 5. Cross-Playbook Sharing

Methodology references can be consumed by multiple playbooks. The reference declares its consumers in its header comment. Playbooks declare their dependencies via `knowledge_refs`. This creates bidirectional traceability matching the existing `playbook_refs` / `flow_bindings` pattern.

```
Playbook A ──knowledge_refs──→ methodology-x.yaml ←──knowledge_refs── Playbook B
```

This sub-linear scaling means adding playbooks does not proportionally increase methodology files. Knowledge consolidates while execution logic specializes.

### 6. File Location Convention

```
domain/agents/{role}/references/{methodology-name}.yaml
```

Each role's references directory contains its methodology files. Cross-role sharing is possible via relative paths but should be rare, as different roles typically need role-specific knowledge even for similar domains (SA discovery methodology differs from AE discovery methodology).

---

## Alternatives Considered

### A. Embed methodology content directly in playbooks

**Pro:** Single file per playbook, no cross-references to manage.
**Con:** Playbooks become bloated with knowledge content. Methodology changes require touching every playbook that uses it. Shared knowledge gets duplicated. Violates DDR-019's separation of Knowledge as an independent layer.
**Rejected:** Couples execution logic to domain knowledge, both change for different reasons.

### B. Centralized knowledge base separate from agent directories

**Pro:** All methodology in one place, easy to browse.
**Con:** Breaks agent atomicity (DDR-019 requires agents carry their own knowledge). Creates a shared dependency that couples agents through a common knowledge store. Makes it harder to reason about what knowledge an agent has access to.
**Rejected:** Violates the atomicity principle that each agent is self-contained.

### C. Methodology as a separate artifact type with its own registry

**Pro:** Full lifecycle management with versioning, approval workflows, and formal registry.
**Con:** Over-engineers the solution. Methodology references are consumed by playbooks, not independently executed. Adding registry overhead for read-only knowledge files adds complexity without proportional benefit. The existing `knowledge_refs` binding provides sufficient traceability.
**Rejected:** Adds architectural weight beyond what the use case requires.

---

## Consequences

### Positive

- Playbooks stay focused on execution logic, methodology references stay focused on domain knowledge
- Knowledge curators can update practitioner expertise without modifying playbook structure
- Vendor-neutral methodology can be extracted from proprietary sources once and shared across playbooks
- Sub-linear scaling: more playbooks share fewer methodology files
- Consistent with DDR-019's mandatory knowledge layer and atomicity principles
- `knowledge_refs` follows the same declarative binding pattern as `playbook_refs` and `flow_bindings`

### Negative

- Additional files to maintain per role (typically 2-5 methodology references per role)
- Cross-reference integrity between `knowledge_refs` and reference file headers needs validation
- Definition authors need to understand when to create a methodology reference vs. keeping knowledge inline

### Risks

- Reference files could become stale if not included in regular review cycles
- Threshold rule is subjective, different authors may make different separation decisions for similar playbooks

---

## Change Log

| Change | Affected Files |
|--------|---------------|
| Add `knowledge_refs` field to playbook schema | docs/architecture/system/domain-model.md |
| SA methodology references (implemented) | domain/agents/solution_architects/references/discovery-methodology.yaml |
| SA methodology references (implemented) | domain/agents/solution_architects/references/solution-fit-methodology.yaml |
| PB_SA_014 knowledge_refs binding (implemented) | domain/playbooks/solution_architects/PB_SA_014_technical_discovery.yaml |
| PB_SA_015 knowledge_refs binding (implemented) | domain/playbooks/solution_architects/PB_SA_015_solution_fit_assessment.yaml |
| Document methodology reference pattern | docs/architecture/system/domain-model.md (knowledge layer section) |

---

## Related Decisions

- [DDR-019: Agent System Domain Model](DDR_019_agent_system_domain_model.md), establishes Knowledge as mandatory agent-owned layer
- [DDR-012: Playbook Metadata Standardization](DDR_012_playbook_metadata_standardization.md), standardized playbook structure that this decision extends
- [DDR-016: Skill Architecture](DDR_016_skill_architecture.md), defines skill layer that methodology references complement

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-03-08 | ACCEPTED | Initial decision: methodology reference pattern with knowledge_refs binding, SA implementation as reference |
