# Agents

This directory contains agent definitions for all 196 agents in the EA Agentic Lab system. Agents are organized across 25 team directories following the DDR-019 v3.0 domain model. Each agent is defined by a canonical `*-definition.yaml` file (Oracle Agent Spec 26.1.0) and supporting configuration files.

The system uses holonic decomposition extensively. Role-level orchestrator agents delegate specialized work to sub-agents while retaining routing and coordination responsibility. The specialist domain has expanded to 11 sub-domains (big data, cloud solutions, data engineering, database, DevOps, migrations, network, observability, platform, security, system design), each with its own orchestrator and sub-agents.

## Agent Catalog

### Leadership (2)

Strategic oversight, escalation resolution, and product alignment.

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `leadership/` | Senior Manager Agent | senior-manager-agent | Oversight, coaching, escalation resolution |
| `product_managers/` | PM Agent | pm-agent | Product roadmap alignment, feature requests |

### Sales (5 roles + 8 sub-agents)

Commercial strategy, competitive positioning, value quantification, partner alignment, and customer advocacy. The AE agent is an orchestrator with 8 sub-agents handling specialized sales workflows.

| Directory | Agent | ID | Type | Purpose |
|-----------|-------|----|------|---------|
| `account_executives/` | AE Agent | ae-agent | orchestrator | Account strategy, deal ownership, commercial decisions |
| `account_executives/` | Deal Diagnosis | ae-deal-diagnosis-agent | sub-agent | Deal health assessment and risk analysis |
| `account_executives/` | Meeting Prep | ae-meeting-prep-agent | sub-agent | Pre-call intelligence and agenda preparation |
| `account_executives/` | Opportunity Hygiene | ae-opportunity-hygiene-agent | sub-agent | CRM data quality and pipeline accuracy |
| `account_executives/` | Pipeline Gen | ae-pipeline-gen-agent | sub-agent | Prospecting and pipeline generation |
| `account_executives/` | Pipeline Mgmt | ae-pipeline-mgmt-agent | sub-agent | Pipeline velocity and stage progression |
| `account_executives/` | MEDDPICC | ae-meddpicc-agent | sub-agent | MEDDPICC qualification and scoring |
| `account_executives/` | Signal Detection | ae-signal-detection-agent | sub-agent | Buying signal identification and routing |
| `account_executives/` | Stakeholder Intel | ae-stakeholder-agent | sub-agent | Stakeholder mapping and influence analysis |
| `competitive_intelligence/` | CI Agent | ci-agent | standalone | Competitive intelligence, win/loss insights |
| `value_engineering/` | VE Agent | ve-agent | standalone | Business value quantification, ROI/TCO |
| `partners/` | Partner Agent | partner-agent | standalone | Partner ecosystem coordination |
| `customer_advocacy/` | Customer Advocate Agent | cad-agent | standalone | Customer references, case studies, proof points |

### Architecture (3 roles + 6 sub-agents + 11 domain specialist teams)

Technical integrity through solution design, customer architecture tracking, and domain expertise routing. The SA agent is an orchestrator with 6 sub-agents. The Specialist agent routes requests to 11 domain specialist teams (big data, cloud solutions, data engineering, database, DevOps, migrations, network, observability, platform, security, system design), each with its own orchestrator and sub-agents.

| Directory | Agent | ID | Type | Purpose |
|-----------|-------|----|------|---------|
| `solution_architects/` | SA Agent | sa-agent | orchestrator | Technical architecture, solution design |
| `solution_architects/` | Discovery | sa-discovery-agent | sub-agent | Technical discovery sessions |
| `solution_architects/` | Risk | sa-risk-agent | sub-agent | Technical risk assessment |
| `solution_architects/` | Decision Capture | sa-decision-capture-agent | sub-agent | Architecture decision documentation |
| `solution_architects/` | CSP | sa-csp-agent | sub-agent | Customer success plan creation |
| `solution_architects/` | Best Practices | sa-best-practices-agent | sub-agent | Best practice recommendations |
| `solution_architects/` | Journey | sa-journey-agent | sub-agent | Customer journey mapping |
| `customer_architects/` | CA Agent | ca-agent | standalone | Customer success, adoption tracking |
| `specialists/` | Specialist Agent | specialist-agent | standalone | Domain expertise routing |
| `specialists/observability/` | Observability Specialist | observability-specialist-agent | orchestrator | Observability and monitoring guidance (6 sub-agents) |
| `specialists/security/` | Security Specialist | security-specialist-agent | orchestrator | Security architecture guidance (6 sub-agents) |
| `specialists/big_data_architect/` | BDA Specialist | bda-specialist-agent | orchestrator | Big data architecture (6 sub-agents) |
| `specialists/cloud_solutions_architect/` | CSA Specialist | csa-specialist-agent | orchestrator | Cloud solutions architecture (6 sub-agents) |
| `specialists/data_engineer/` | DE Specialist | de-specialist-agent | orchestrator | Data engineering (6 sub-agents) |
| `specialists/database_architect/` | DBA Specialist | dba-specialist-agent | orchestrator | Database architecture (6 sub-agents) |
| `specialists/devops/` | DevOps Specialist | devops-specialist-agent | orchestrator | DevOps and SRE (6 sub-agents) |
| `specialists/migrations/` | Migration Specialist | mig-specialist-agent | orchestrator | Migration planning and execution (6 sub-agents) |
| `specialists/network_architect/` | Network Specialist | net-specialist-agent | orchestrator | Network architecture (6 sub-agents) |
| `specialists/platform_architect/` | Platform Specialist | pa-specialist-agent | orchestrator | Platform architecture (6 sub-agents) |
| `specialists/system_design/` | System Design Specialist | sd-specialist-agent | orchestrator | System design and scalability (6 sub-agents) |

### Deal Execution (3)

Structured processes that convert opportunities into wins.

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `rfp/` | RFP Agent | rfp-agent | RFP response orchestration |
| `poc/` | POC Agent | poc-agent | Proof of concept/value execution |
| `infosec/` | InfoSec Agent | infosec-agent | Security/compliance enablement |

### Delivery (2)

Bridge what was sold with what gets implemented.

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `delivery/` | Delivery Agent | delivery-agent | Implementation delivery coordination |
| `professional_services/` | PS Agent | ps-agent | Professional Services pre/post sales |

### Governance (10)

Process enforcement, artifact maintenance, and entropy reduction.

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `governance/` | Meeting Notes Agent | meeting-notes-agent | Extract decisions/actions/risks from meetings |
| `governance/` | Nudger Agent | nudger-agent | Reminder and escalation enforcement |
| `governance/` | Task Shepherd Agent | task-shepherd-agent | Action validation and linkage |
| `governance/` | Decision Registrar Agent | decision-registrar-agent | Decision lifecycle tracking |
| `governance/` | Reporter Agent | reporter-agent | Weekly digest generation |
| `governance/` | Risk Radar Agent | risk-radar-agent | Risk detection and classification |
| `governance/` | Playbook Curator Agent | playbook-curator-agent | Playbook validation and governance |
| `governance/` | InfoHub Curator Agent | infohub-curator-agent | InfoHub semantic integrity, artifact lifecycle |
| `governance/` | Knowledge Vault Curator Agent | knowledge-vault-curator-agent | Vault 3 governance, proposal validation |
| `governance/` | Signal Matcher Agent | signal-matcher-agent | Signal-to-playbook matching and routing |

### Intelligence (5)

Account, industry, and technology intelligence from public sources. These agents share a source registry to avoid duplicate research.

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `account_intelligence/` | ACI Agent | aci-agent | Company research, organigram, opportunity identification |
| `industry_intelligence/` | II Agent | ii-agent | Industry strategy, market trends, regulatory landscape |
| `technology_scout/` | Tech Signal Scanner | tech-signal-scanner-agent | Job posting scanning, tech blog monitoring |
| `technology_scout/` | Tech Signal Analyzer | tech-signal-analyzer-agent | Technology trend analysis, vendor landscape |
| `market_news_analysis/` | MNA Agent | mna-agent | Lightweight news monitoring, signal feeds |

### Operations (2)

| Directory | Agent | ID | Purpose |
|-----------|-------|----|---------|
| `retrospective/` | Retrospective Agent | retrospective-agent | Win/loss analysis, lessons learned |
| `technical_writing/` | Technical Writer Agent | tw-agent | Technical content, documentation strategy, sales enablement content |

## Orchestrator Pattern (Holonic Decomposition)

Two agents use holonic decomposition: the AE agent (8 sub-agents) and the SA agent (6 sub-agents). The orchestrator handles routing and coordination, while sub-agents execute specialized workflows.

Sub-agent definition files sit at the directory root alongside the parent definition. Sub-agents share the parent's `prompts/`, `skills/`, and `references/` folders. Each sub-agent has its own personality file.

```text
account_executives/
├── ae-agent-definition.yaml            # parent orchestrator
├── ae-deal-diagnosis-definition.yaml   # sub-agent
├── ae-meeting-prep-definition.yaml     # sub-agent
├── ae-pipeline-mgmt-definition.yaml    # sub-agent
├── ae-meddpicc-definition.yaml    # sub-agent
├── ...                                 # 4 more sub-agent definitions
├── ae-agent.md                         # parent profile doc
├── agents/
│   └── ae_agent.yaml
├── personalities/
│   ├── ae_personality.yaml
│   ├── ae_deal_diagnosis_personality.yaml
│   └── ...
├── prompts/
│   └── tasks.yaml                      # shared prompt registry
├── skills/
└── references/
```

The parent definition declares `invoke-*` tools and `specialized_agents` blocks. Each sub-agent definition sets `metadata.parent_agent` to the parent's ID.

## Agent Directory Structure

Every agent directory follows the structure defined in `domain/config/agent-scaffold.yaml`. The `*-definition.yaml` is the canonical source of truth for each agent (Oracle Agent Spec 26.1.0).

```text
{team_name}/
├── {role}-agent-definition.yaml          # [mandatory] Canonical agent spec
├── {role}-agent.md                       # [mandatory] Human-readable profile
├── agents/
│   └── {role}_agent.yaml                 # [mandatory] Runtime config
├── personalities/
│   └── {role}_personality.yaml           # [mandatory] Personality traits
├── prompts/
│   ├── tasks.yaml                        # [mandatory] Prompt registry (CAF)
│   └── context_template.md               # [optional]  Context injection
├── skills/
│   └── {skill_name}.yaml                 # [optional]  Skill definitions
└── references/
    └── {reference_name}.yaml             # [optional]  Domain knowledge
```

### Definition YAML Structure

The definition file contains all agent configuration in a single spec. Required blocks include: `system_prompt`, `human_in_the_loop`, `llm_configuration`, `inputs`, `outputs`, `tools` (with resolver field), `flows`, and `a2a`. The `x-ea-agent` extension adds: `prompt_registry`, `profile`, `knowledge`, `guardrails`, `handoffs`, and `autonomy`.

When modifying any agent, update ALL related files. The definition YAML, profile doc, personality, agent config, prompts, and skills must stay in sync (DDR-018/019/020).

## Skills

Skills are named, composable workflows between atomic prompts (tasks.yaml) and orchestrated processes (playbooks). A skill formalizes what an agent can do with defined inputs, outputs, quality criteria, and guardrails. Skills enable cross-agent composition: one agent can import another agent's skill to build on its output.

Skills are scoped to agent directories following the bounded-context principle. The skill catalog (`domain/catalogs/skill_catalog.yaml`) indexes all skills for cross-agent discovery. Architecture decision: DDR-016.

### Skill ID Convention

`SK_{TEAM_PREFIX}_{NNN}` where the prefix matches the team abbreviation:

| Prefix | Team |
|--------|------|
| `SK_ACI` | Account Intelligence |
| `SK_GOV` | Governance |
| `SK_SA` | Solution Architects |
| `SK_II` | Industry Intelligence |
| `SK_TSCT` | Technology Scout |

### Implemented Skills

| Skill ID | Name | Owner | Category |
|----------|------|-------|----------|
| SK_ACI_001 | Company Research | aci_agent | intelligence_gathering |
| SK_ACI_002 | Organigram Building | aci_agent | intelligence_gathering |
| SK_ACI_003 | Opportunity Identification | aci_agent | intelligence_analysis |
| SK_GOV_001 | Process Meeting Notes | meeting_notes_agent | meeting_processing |
| SK_GOV_002 | Extract Decisions | decision_registrar_agent | decision_management |
| SK_SA_001 | Technical Discovery | sa_agent | technical_assessment |
| SK_SA_002 | Decision Capture | sa_agent | decision_management |

### Adding a New Skill

1. Create `{skill_name}.yaml` in `domain/agents/{team}/skills/` using `_templates/skill_template.yaml`
2. Add `skills.owned` entry to the agent's config YAML
3. Register the skill in `domain/catalogs/skill_catalog.yaml`
4. If the skill imports from another agent, add `imports` to the skill file and `skills.imports` to the agent config

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
| `account_intelligence/` | company_research, organigram, opportunities | 6+ |
| `industry_intelligence/` | industry_analysis, regulatory, trends | 6+ |
| `technology_scout/` | scanning, analysis, vendor_landscape, digest | 10+ |
| `market_news_analysis/` | realm_news, node_news, digests, impact_assessment | 10+ |
| `product_managers/` | roadmap_alignment, feature_requests | 10+ |

## Agent Collaboration

Agents collaborate through four mechanisms:

1. **InfoHub**: shared knowledge repository per account, organized as External InfoHub (customer), Internal InfoHub (vendor), and Global Knowledge Vault (cross-account)
2. **Signals**: events that trigger agent actions, matched to playbooks by the Signal Matcher agent
3. **Escalations**: passing issues to appropriate agents via `handoffs.agent_escalation`
4. **Playbooks**: coordinated cross-agent execution with trust tiers (autonomous / review / human-decides)

## Related Documentation

- [Agent Architecture](../../docs/architecture/agents/agent-architecture.md) - Full architecture overview
- [Agent Responsibilities](../../docs/architecture/agents/agent-responsibilities.md) - Per-agent responsibility breakdown
- [Agent Scenarios](../../docs/architecture/agents/agent-scenarios.md) - End-to-end scenario examples
- [Domain Model](../../docs/architecture/system/domain-model.md) - Layer hierarchy and composition rules
- [Agent Scaffold](../config/agent-scaffold.yaml) - Folder structure, tool registry, validation rules
