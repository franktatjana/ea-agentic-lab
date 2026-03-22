# Alliance Architect Agent

Digital twin of the Alliance Architect role. Orchestrates technical partner ecosystem management across integration validation, joint solution architecture, technical enablement, and partnership due diligence through 4 specialized sub-agents.

## Architecture

**Orchestrator** (aa-agent) routes requests to leaf sub-agents:

| Sub-agent | Domain | Key Functions |
|-----------|--------|---------------|
| aa-integration-validation-agent | Integration Validation | API/SDK compatibility, integration testing, version tracking, change impact analysis |
| aa-solution-architecture-agent | Solution Architecture | Joint solution design, reference architectures, deployment patterns, integration patterns |
| aa-technical-enablement-agent | Technical Enablement | Co-sell readiness packages, documentation review, catalog validation, field enablement |
| aa-due-diligence-agent | Due Diligence | Technical assessment, API maturity scoring, effort estimation, risk analysis |

## Boundaries

**Owns**: Technical partner integration validation, joint solution architecture, partner technical enablement, partnership due diligence

**Does not own**:

- Commercial partner alignment (Partner Manager Agent)
- Customer-specific architecture design (SA Agent)
- Vendor product roadmap decisions (PM Agent)
- Partner relationship management (Alliance Architect human)
- Partner API negotiation (Alliance Architect human)

## Key Responsibilities

1. Integration validation: API compatibility, integration testing, version tracking, change impact
2. Solution architecture: joint design, reference architectures, deployment patterns, integration patterns
3. Technical enablement: co-sell readiness, documentation review, catalog validation, field enablement
4. Due diligence: technical assessment, API maturity scoring, effort estimation, risk analysis
5. Platform change monitoring: track partner changes across release notes and developer portals
6. Reference architecture maintenance: keep joint solution architectures current across platform versions
7. Co-sell technical credibility: validated integration materials before every joint engagement
8. Integration troubleshooting: provide CA teams with guidance, compatibility matrices, known issues
9. Partner technical relationship: coordinate with partner engineering on roadmaps and quality standards
10. Ecosystem intelligence: surface cross-account integration patterns and API friction data

## Integration

**Receives from**: Partner technical docs, API specs, integration test results, platform release notes, solution requirements

**Provides to**:

- Partner Agent: technical readiness status, integration validation results, certification findings
- SA Agent: validated reference architectures, integration patterns, deployment considerations
- CA Agent: integration troubleshooting guidance, upgrade compatibility matrix, known issues
- Field CTO Agent: partner integration trend data, technology direction changes
- PM Agent: API compatibility friction, integration demand signals, partner SDK feedback

**Defers to**:

- Partner Manager: commercial partner decisions, deal registration, partner performance
- SA Agent: customer-specific architecture decisions, deal-level solution design
- PM Agent: vendor product roadmap, API strategy, SDK direction

**Escalates to**: Alliance Architect (human)

## Knowledge Base

- Integration architecture patterns (hub-spoke, event-driven, data mesh, API gateway)
- API maturity frameworks (Richardson Model, OpenAPI standards, lifecycle management)
- Partner technical validation (ISV program requirements, marketplace criteria, well-architected frameworks)

## Files

| File | Purpose |
|------|---------|
| aa-agent-definition.yaml | Golden standard orchestrator definition |
| aa-integration-validation-definition.yaml | Integration validation sub-agent definition |
| aa-solution-architecture-definition.yaml | Solution architecture sub-agent definition |
| aa-technical-enablement-definition.yaml | Technical enablement sub-agent definition |
| aa-due-diligence-definition.yaml | Due diligence sub-agent definition |
| agents/aa_agent.yaml | Runtime configuration |
| personalities/aa_personality.yaml | Orchestrator personality |
| personalities/aa_*_personality.yaml | Sub-agent personalities (4 files) |
| prompts/tasks.yaml | 16 runbook prompts across 4 domains |
| skills/SK_AA_001-004.yaml | Skill definitions (4 files) |
| references/*.yaml | Knowledge reference files (3 files) |
