# DDR-018: Agent Definition Alignment

**Status:** ACCEPTED
**Date:** 2026-02-28
**Category:** Domain Decision Record
**Extends:** DDR-003 (domain specialist agents), DDR-016 (skill architecture)

---

## Context

A gap analysis compared ea-agentic-lab's 33 agent definitions against the agent-lab project, which serves as the golden standard for agent design based on industry best practices from Anthropic, OpenAI, and Oracle Agent Spec 26.1.0.

The analysis revealed two structural gaps:

| Gap | Current State | Golden Standard |
|-----|---------------|-----------------|
| No human-facing specification | Agent identity is spread across 3 YAML files (config, personality, tasks) | Single .md spec per agent as source of truth |
| Knowledge bundled in personality | Signal keywords, classification examples, domain criteria embedded in personality YAML | Separate `references/` directory with domain knowledge files and load_when rules |

Both projects share strengths: clear boundaries, anti-hallucination safeguards, skill composition, and multi-agent coordination. The gap is structural, not conceptual.

---

## Decision

Adopt **lightweight alignment**: add a human-readable .md spec per agent and extract domain knowledge into `references/` directories. Preserve the existing four-file agent pattern (config YAML, personality YAML, tasks.yaml, skills/).

### What Changes

Each agent team directory gains two new elements:

1. **`{agent-name}.md`** (~100-150 lines): Human-readable spec covering identity, purpose, boundaries, skills, integration points, guardrails, and quality criteria. A non-technical reader should understand what the agent does and how it fits the system without opening YAML files.

2. **`references/`** directory: Domain knowledge extracted from personality files. Signal keywords, classification examples, validation rules, and domain-specific criteria become separate reusable files. Personality files retain behavior rules (scope, communication style, anti-hallucination, interaction protocols) but reference knowledge files instead of embedding them.

### What Stays the Same

- Agent config YAML (`agents/{name}_agent.yaml`)
- Personality YAML structure and behavior sections
- CAF task prompts (`prompts/tasks.yaml`)
- Skills directory and skill schema (per DDR-016)
- Skill catalog and cross-agent composition

### Updated Agent Directory Structure

```text
domain/agents/{team}/
├── {agent-name}.md              # NEW: Human-facing spec
├── agents/
│   └── {name}_agent.yaml        # Config (unchanged)
├── personalities/
│   └── {name}_personality.yaml  # Behavior only (knowledge extracted)
├── prompts/
│   └── tasks.yaml               # CAF prompts (unchanged)
├── skills/                      # Skills (unchanged)
│   └── *.yaml
└── references/                  # NEW: Extracted domain knowledge
    ├── glossary-and-resources.md
    └── {domain-specific}.yaml
```

---

## Alternatives Considered

### Full alignment with Oracle Agent Spec 26.1.0

Adopt the complete agent-lab structure: portable YAML definition (Oracle Agent Spec), examples/ directory with I/O fixtures, case-studies/ with narrative scenarios, visual/ with factsheets, discoverable personality variants.

- Pro: Framework-portable definitions, maximum documentation depth, full alignment with industry standard
- Pro: Enables future export to Claude Agent SDK, CrewAI, LangGraph
- Con: Heavy lift for 33 agents at current phase (domain model complete, runtime not yet operational)
- Con: Examples and case studies require running agents to generate realistic fixtures
- Con: Oracle Agent Spec compliance adds ~500 lines per agent with significant overlap to existing YAML
- **Deferred**: Revisit when agent runtime is operational and real execution data exists for examples/case studies. The lightweight alignment creates the structural foundation that full alignment would extend.

### Selective adoption for critical agents only

Apply alignment to governance layer agents (10) first, since they are closest to operational use, then extend to other layers later.

- Pro: Faster initial delivery, focused effort
- Con: Creates inconsistency across agent teams (some have specs, some don't)
- Con: Strategic and intelligence agents also benefit from human-readable specs
- **Rejected**: Lightweight alignment is small enough per agent to apply consistently across all 33. Inconsistency costs more than the incremental effort.

---

## Consequences

### Positive

- Every agent has a single human-readable document explaining what it does
- Domain knowledge becomes reusable across agents (signal keywords, classification criteria)
- Personality files focus on behavior, making them easier to review and maintain
- Structural foundation for future Oracle Agent Spec adoption
- Non-technical stakeholders can understand agent capabilities without reading YAML

### Negative

- Adds 2 new elements per agent directory (spec file + references directory)
- Personality files need editing to reference extracted knowledge
- Ongoing maintenance: spec must stay in sync with config/personality changes

### Risks

- **Spec drift**: Human-facing spec diverges from YAML config over time. Mitigated by keeping spec concise and linking to YAML sections rather than duplicating content.
- **Over-extraction**: Moving too much into references/ fragments the agent definition. Mitigated by keeping behavior in personality and only extracting pure domain knowledge.

---

## Related Decisions

- **DDR-003**: Domain specialist agents (bounded context principle)
- **DDR-016**: Skill architecture (three-layer capability hierarchy this extends)
- **DDR-015**: Curator agent specialization (governance pattern)

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-02-28 | ACCEPTED | Lightweight alignment with agent-lab golden standard. Full alignment deferred to post-runtime phase. |
