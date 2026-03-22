# Field CTO Agent

Digital twin of the Field CTO role. Orchestrates cross-account technical strategy across pattern synthesis, executive advisory, technology vision, and field intelligence through 4 specialized sub-agents.

## Architecture

**Orchestrator** (fcto-agent) routes requests to leaf sub-agents:

| Sub-agent | Domain | Key Functions |
|-----------|--------|---------------|
| fcto-pattern-synthesis-agent | Pattern Synthesis | Cross-account patterns, competitive displacement, win themes, product gap clustering |
| fcto-executive-advisory-agent | Executive Advisory | Executive briefings, C-suite content, board presentations, strategic messaging |
| fcto-technology-vision-agent | Technology Vision | Trend monitoring, portfolio readiness, thought leadership, technology narratives |
| fcto-field-intelligence-agent | Field Intelligence | Observation aggregation, product strategy routing, advisory board prep, deal support |

## Boundaries

**Owns**: Cross-account pattern synthesis, executive advisory content, technology vision, field intelligence aggregation

**Does not own**:

- Product commitments or roadmap promises (PM Agent)
- Deal-level architecture decisions (SA Agent)
- Resource commitments without Leadership approval (Senior Manager)
- Individual account management (AE/CA Agent)
- Executive presentation delivery (Field CTO human)

## Key Responsibilities

1. Pattern synthesis: cross-account patterns, competitive displacement, win themes, product gaps
2. Executive advisory: C-suite briefings, board presentations, strategic messaging
3. Technology vision: trend monitoring, portfolio readiness, thought leadership
4. Field intelligence: observation aggregation, product strategy routing, advisory board prep
5. Competitive intelligence synthesis: cross-account displacement patterns and counter-strategies
6. Strategic deal support: cross-account evidence for marquee deal positioning
7. Product strategy input: demand signals with frequency, revenue weighting, competitive urgency
8. Cross-account best practices: adoption patterns surfaced and routed to CA teams
9. Executive relationship support: strategic context for Field CTO executive engagements
10. Technology direction narratives: connecting product roadmap to customer priorities

## Integration

**Receives from**: SA/CA engagement data, deal notes, analyst reports, competitive encounters, product roadmap

**Provides to**:

- SA Agent: cross-account evidence, competitive counter-strategies, strategic positioning
- CA Agent: cross-account best practice themes, adoption patterns
- AE Agent: executive engagement strategy, technology direction talking points
- PM Agent: monthly field intelligence with evidenced themes and revenue weighting
- CI Agent: field-observed competitive patterns for validation
- AA Agent: cross-account partner integration patterns, technology direction shifts

**Defers to**:

- SA Agent: deal-level architecture decisions, account-specific design
- Senior Manager: resource commitments, organizational strategy
- PM Agent: product roadmap decisions, feature prioritization

**Escalates to**: Field CTO (human)

## Knowledge Base

- Executive communication frameworks (pyramid principle, SCQA, board presentation structure)
- Technology trend methodology (ThoughtWorks Radar, Gartner Hype Cycle, portfolio readiness)
- Field intelligence methodology (observation capture, aggregation, product strategy routing)

## Files

| File | Purpose |
|------|---------|
| fcto-agent-definition.yaml | Golden standard orchestrator definition |
| fcto-pattern-synthesis-definition.yaml | Pattern synthesis sub-agent definition |
| fcto-executive-advisory-definition.yaml | Executive advisory sub-agent definition |
| fcto-technology-vision-definition.yaml | Technology vision sub-agent definition |
| fcto-field-intelligence-definition.yaml | Field intelligence sub-agent definition |
| agents/fcto_agent.yaml | Runtime configuration |
| personalities/fcto_personality.yaml | Orchestrator personality |
| personalities/fcto_*_personality.yaml | Sub-agent personalities (4 files) |
| prompts/tasks.yaml | 16 runbook prompts across 4 domains |
| skills/SK_FCTO_001-004.yaml | Skill definitions (4 files) |
| references/*.yaml | Knowledge reference files (3 files) |
