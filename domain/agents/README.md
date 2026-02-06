# Teams

This directory contains the agent definitions for all 24 agents in the EA Agentic Lab system. Agents are organized by team, with each team representing a functional area.

## Agent Categories

### Strategic Agents (15)

Exercise judgment, apply frameworks, and make recommendations.

| Team Directory | Agent | Purpose |
|----------------|-------|---------|
| `account_executives/` | AE Agent | Account strategy, commercial decisions, deal ownership |
| `solution_architects/` | SA Agent | Technical architecture, solution design, technical discovery |
| `customer_architects/` | CA Agent | Customer success, adoption tracking, post-sales |
| `competitive_intelligence/` | CI Agent | Competitive intelligence, win/loss insights |
| `value_engineering/` | VE Agent | Business value quantification, ROI/TCO |
| `poc/` | POC Agent | Proof of concept/value execution |
| `product_managers/` | PM Agent | Product roadmap alignment, feature requests |
| `delivery/` | Delivery Agent | Implementation delivery coordination |
| `partners/` | Partner Agent | Partner ecosystem coordination |
| `specialists/` | Specialist Agent | Domain expertise engagement |
| `professional_services/` | PS Agent | Professional Services pre/post sales |
| `support/` | Support Agent | Support/DSE coordination |
| `rfp/` | RFP Agent | RFP response orchestration |
| `infosec/` | InfoSec Agent | Security/compliance enablement |
| `leadership/` | Senior Manager Agent | Oversight, coaching, escalation resolution |

### Governance Agents (8)

Enforce process, maintain artifacts, and reduce entropy.

| Team Directory | Agent | Purpose |
|----------------|-------|---------|
| `governance/` | Meeting Notes Agent | Extract decisions/actions/risks from meetings |
| `governance/` | Nudger Agent | Reminder and escalation enforcement |
| `governance/` | Task Shepherd Agent | Action validation and linkage |
| `governance/` | Decision Registrar Agent | Decision lifecycle tracking |
| `governance/` | Reporter Agent | Weekly digest generation |
| `governance/` | Risk Radar Agent | Risk detection and classification |
| `governance/` | Playbook Curator Agent | Playbook validation and governance |
| `governance/` | Knowledge Curator Agent | Semantic integrity, artifact lifecycle |

### Specialized Agents

| Team Directory | Agent | Purpose |
|----------------|-------|---------|
| `retrospective/` | Retrospective Agent | Win/loss analysis, lessons learned |

## Team Directory Structure

Each team follows a consistent structure:

```text
teams/{team_name}/
├── agents/
│   └── {agent}_agent.yaml      # Agent configuration
├── personalities/
│   └── {agent}_personality.yaml # Personality and behavior spec
└── prompts/
    ├── tasks.yaml              # Task-specific prompts (CAF format)
    └── context_template.md     # Context injection template
```

## Agent Configuration

### Agent YAML (`agents/{agent}_agent.yaml`)

Defines the agent's operational configuration:

```yaml
agent_id: "agent_name"
team: "team_name"
category: "strategic|governance"
purpose: "Primary purpose statement"

core_functions:
  - "Function 1"
  - "Function 2"

triggers:
  automatic:
    - event: "trigger_event"
      condition: "when to trigger"

integrations:
  reads_from: ["data_sources"]
  writes_to: ["output_locations"]
  collaborates_with: ["other_agents"]

prompts_dir: "teams/{team}/prompts/"
```

### Personality YAML (`personalities/{agent}_personality.yaml`)

Defines the agent's behavior and communication style:

```yaml
name: "Agent Display Name"
role: "Agent Role"
team: "team_name"

scope:
  what_i_do: []
  what_i_do_not_do: []

signal_detection:
  keywords: []
  patterns: []

tone: "communication style"
communication_principles: {}

hallucination_prevention:
  strict_rules: []
  verification_requirements: {}

values: []
priorities: {}
```

### Task Prompts (`prompts/tasks.yaml`)

Task-specific prompts using the CAF framework (Context, Action, Format):

```yaml
task_category:
  task_name:
    name: "Display Name"
    description: "What this task does"
    prompt: |
      Context: {context_variables}

      Action: What the agent should do

      Format:
      - Expected output structure
```

## Teams with Task Prompts

The following teams have comprehensive task prompts implemented:

| Team | Categories | Task Count |
|------|------------|------------|
| `account_executives/` | deal_diagnosis, pipeline, stakeholder, commercial, meeting_prep, opportunity_hygiene | 20+ |
| `solution_architects/` | technical_discovery, technical_risk, decision_capture, specialist_engagement, infohub_validation, meeting_support, customer_success_plan, best_practices | 35+ |
| `customer_architects/` | adoption, customer_architecture, value_realization, customer_health, csp_tasks | 18+ |
| `value_engineering/` | value_discovery, value_hypothesis, value_calculation, value_stream_workshop, value_proof, value_realization, value_amplification | 25+ |
| `poc/` | pov_qualification, pov_kickoff, pov_execution, pov_conclusion, pov_conversion, pov_metrics | 20+ |
| `retrospective/` | win_retrospective, loss_retrospective, pattern_analysis, knowledge_sharing, process_improvement | 15+ |
| `specialists/` | engagement, knowledge_transfer | 10+ |
| `delivery/` | implementation, handoff | 10+ |
| `partners/` | partner_engagement, joint_planning | 10+ |
| `competitive_intelligence/` | competitive_analysis, battlecards | 10+ |
| `product_managers/` | roadmap_alignment, feature_requests | 10+ |

## Agent Collaboration

Agents collaborate through:

1. **InfoHub** - Shared knowledge repository per account
2. **Signals** - Events that trigger agent actions
3. **Escalations** - Passing issues to appropriate agents
4. **Playbooks** - Coordinated execution of workflows

### Collaboration Example

```
Customer Signal → AE Agent detects → InfoHub updated
                                    ↓
                              SA Agent prompted
                                    ↓
                              Technical assessment
                                    ↓
                              VE Agent calculates value
                                    ↓
                              All agents aligned
```

## Related Documentation

- [Agent Architecture](../docs/agent-architecture.md) - Full architecture overview
- [Agent Scenarios](../docs/agent-scenarios.md) - End-to-end scenario examples
- [Core Entities](../docs/core-entities.md) - Entity definitions
