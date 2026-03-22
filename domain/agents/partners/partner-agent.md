# Partner Manager Agent

Digital twin of the Partner Manager role. Orchestrates partner ecosystem management across enablement, co-sell execution, program health, and risk governance through 4 specialized sub-agents.

## Architecture

**Orchestrator** (partner-agent) routes requests to leaf sub-agents:

| Sub-agent | Domain | Key Functions |
|-----------|--------|---------------|
| partner-enablement-agent | Enablement & Certification | Onboarding readiness, certification compliance, training gaps, maturity assessment |
| partner-cosell-agent | Co-sell Pipeline & Planning | Pipeline overlap, deal registration, JBP preparation, joint positioning |
| partner-program-health-agent | Program Health & Reporting | Engagement health (GREEN/YELLOW/RED), dependency tracking, scorecards, QBR reviews |
| partner-risk-agent | Risk Governance | Risk classification, issue resolution, escalation prep, channel conflict detection |

## Boundaries

**Owns**: Commercial partner alignment, enablement tracking, co-sell coordination, program health, risk governance

**Does not own**:
- Technical integration design (Alliance Architect Agent)
- Partner relationship management (Partner Manager human)
- Partner commitments or promises
- Hyperscaler co-sell mechanics (HAM Agent)

## Key Responsibilities

1. Partner enablement: onboarding, certification, training, maturity
2. Co-sell execution: pipeline overlap, deal registration, JBP, positioning
3. Program health: engagement scoring, dependencies, scorecards, QBR
4. Risk governance: risk classification, issue resolution, escalation, channel conflict
5. Certification compliance: expiry tracking, lapse alerting, active deal impact
6. Deal registration coordination: attribution reconciliation, conflict resolution
7. Joint business planning: mutual objectives, shared metrics, commitment tracking
8. Partner performance reporting: benchmarked scorecards, trend analysis
9. Account-level partner coordination: alignment with account plans, handoffs
10. Ecosystem strategy support: capability data and co-sell metrics for leadership

## Integration

**Receives from**: CRM, partner portals, certification databases, account plans, communication threads

**Provides to**:
- AE Agent: partner involvement status, co-sell support, deal registration
- Delivery Agent: partner delivery dependencies, handoff coordination
- HAM Agent: partner CPPO eligibility, ISV program context

**Defers to**:
- Alliance Architect: technical integration, joint solution architecture
- HAM Agent: hyperscaler co-sell mechanics, marketplace transactions
- Senior Manager: partner investment decisions, executive escalations

**Escalates to**: Partner Manager (human)

## Knowledge Base

- Partner ecosystem frameworks (maturity models, JBP methodology, PRM)
- Co-sell methodology (pipeline overlap, deal registration, account mapping)
- Partner enablement benchmarks (certification ROI, revenue impact, deal metrics)

## Files

| File | Purpose |
|------|---------|
| partner-agent-definition.yaml | Golden standard orchestrator definition |
| partner-enablement-definition.yaml | Enablement sub-agent definition |
| partner-cosell-definition.yaml | Co-sell sub-agent definition |
| partner-program-health-definition.yaml | Program health sub-agent definition |
| partner-risk-definition.yaml | Risk sub-agent definition |
| agents/partner_agent.yaml | Runtime configuration |
| personalities/partner_personality.yaml | Orchestrator personality |
| personalities/partner_*_personality.yaml | Sub-agent personalities (4 files) |
| prompts/tasks.yaml | 16 runbook prompts across 4 domains |
| skills/SK_PTR_001-004.yaml | Skill definitions (4 files) |
| references/*.yaml | Knowledge reference files (3 files) |
