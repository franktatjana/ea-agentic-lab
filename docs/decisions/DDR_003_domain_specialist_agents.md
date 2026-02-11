# DDR-003: Domain Specialist Agent Pattern

**Status:** ACCEPTED
**Date:** 2026-02-06
**Category:** Domain Decision Record
**Specification:** [agent-architecture.md](../architecture/agents/agent-architecture.md)

## Context

The agent model initially used role-based agents (AE, SA, CA, CI) that operate horizontally across all technology domains. This works for general engagement governance but breaks down when deep domain expertise is required. A security consolidation engagement needs SIEM migration knowledge, MITRE ATT&CK mapping, and SOC workflow analysis. An observability renewal needs SLO/SLI design, distributed tracing architecture, and alerting strategy. The SA agent cannot hold this depth across all domains simultaneously.

The question was how to add vertical expertise without creating a separate agent for every technology sub-domain.

## Decision

Introduce a Domain Specialist agent pattern: a small set of specialist agents that provide deep technical expertise in specific technology verticals. Specialists are activated by the SA, POC, or Specialist (router) agent when domain-specific validation, architecture review, or competitive analysis is needed.

**Three specialists, aligned to the platform's core domains:**

| Specialist | Domain | Playbook prefix | Example capabilities |
|---|---|---|---|
| Security Specialist | SIEM, threat detection, SOC workflows | `PB_SEC` | MITRE ATT&CK coverage analysis, SIEM migration planning, compliance framework mapping |
| Observability Specialist | APM, SLO/SLI, distributed tracing | `PB_OBS` | SLO design, trace analysis, monitoring stack assessment |
| Search Specialist | Relevance tuning, vector search, RAG | `PB_SRCH` | Schema design, relevance benchmarking, RAG architecture |

**Activation pattern:** The Specialist (router) agent acts as the entry point. When an engagement's domain matches a specialist's area, the router activates the appropriate specialist. Specialists do not operate independently; they are always invoked in the context of an engagement node.

**Relationship to SA agent:** SA owns the overall solution architecture. Specialists provide domain-specific depth that feeds into the SA's holistic design. The SA remains the architectural decision-maker; specialists advise.

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Expand SA agent with domain knowledge | Single agent, simpler model | Context window limits, domain knowledge conflicts, SA becomes a "god agent" | Violates bounded context and single responsibility |
| One specialist per sub-domain (10+ agents) | Maximum depth | Agent sprawl, coordination overhead, most specialists rarely activated | Over-segmentation for current scale |
| External tool integrations (no specialist agents) | No new agents | Loses the agent collaboration model, tool results need interpretation | Agents provide contextual judgment, not just data retrieval |
| Domain knowledge as playbook parameters | Reuses existing agents | Domain expertise cannot be reduced to parameters; it requires judgment | Playbooks encode process, not expertise |

## Consequences

**Positive:**
- Deep domain expertise available on demand without bloating the SA agent
- Each specialist owns domain-specific playbooks, keeping them current and focused
- Bounded context maintained: specialists know their domain, SA knows the architecture
- Pattern is extensible: new domains (e.g., data analytics, platform engineering) can add specialists

**Negative:**
- Three additional agents to maintain (configs, personalities, playbooks)
- Activation routing logic adds complexity (Specialist router agent needed)
- Risk of underuse: specialists are only activated when the domain matches

**Risks:**
- Boundary confusion between SA and specialist. Mitigated by clear rule: SA owns architecture decisions, specialists advise on domain-specific technical validation.
- Specialist knowledge staleness. Mitigated by domain-specific playbooks that encode current best practices and are updated independently.

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): specialist outputs routed to appropriate vault
- [DDR-002: Canvas Framework](DDR_002_canvas_framework.md): specialists can generate domain-specific canvases

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-06 | ACCEPTED | Three domain specialists established at project inception (security, observability, search) |
| 2026-02-11 | Documented | Retroactive documentation of domain decision |
