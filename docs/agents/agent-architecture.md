# EA Agentic Lab - Agent Architecture

**Version:** 2.0
**Date:** 2026-01-14
**Status:** Production

## Overview

The EA Agentic Lab implements a multi-agent governance system for strategic account management. Agents are organized into two categories: **Strategic Agents** (15) that exercise judgment and **Governance Agents** (8) that enforce process.

All agents operate at **Node level** within the Realm/Node hierarchy. See [core-entities.md](core-entities.md) for entity definitions.

---

## Agent Summary

| Category | Count | Purpose |
|----------|-------|---------|
| Strategic Agents | 15 | Exercise judgment, apply frameworks, make recommendations |
| Governance Agents | 8 | Enforce process, maintain artifacts, reduce entropy |
| Orchestration Agent | 1 | Meta-layer process management |
| **Total** | **24** | |

---

## Strategic Agents (15)

Exercise judgment, apply frameworks, make recommendations.

| Agent | Team | Purpose | Status |
|-------|------|---------|--------|
| SA Agent | solution_architects | Technical architecture, solution design | Implemented |
| AE Agent | account_executives | Account strategy, commercial decisions | Configured |
| CA Agent | customer_architects | Customer architecture tracking | Configured |
| CI Agent | competitive_intelligence | Competitive intelligence | Configured |
| RFP Agent | rfp | RFP response orchestration | Configured |
| InfoSec Agent | infosec | Security/compliance enablement | Configured |
| POC Agent | poc | Proof of concept execution | Configured |
| PM Agent | product_managers | Product roadmap alignment | Configured |
| Delivery Agent | delivery | Implementation delivery | Configured |
| Partner Agent | partners | Partner ecosystem coordination | Configured |
| Specialist Agent | specialists | Domain expertise | Configured |
| PS Agent | professional_services | Professional Services pre/post sales | Configured |
| Support Agent | support | Support/DSE coordination | Configured |
| VE Agent | value_engineering | Business value quantification | Configured |
| Senior Manager Agent | leadership | Oversight, coaching, escalation resolution | Configured |

---

## Governance Agents (8)

Enforce process, maintain artifacts, reduce entropy.

| Agent | Purpose | Trigger |
|-------|---------|---------|
| Meeting Notes Agent | Extract decisions/actions/risks from meetings | meeting_notes_available |
| Nudger Agent | Reminder and escalation enforcement | Schedule + events |
| Task Shepherd Agent | Action validation and linkage | action_created |
| Decision Registrar Agent | Decision lifecycle tracking | decision_mentioned |
| Reporter Agent | Weekly digest generation | Schedule (Friday 5pm) |
| Risk Radar Agent | Risk detection and classification | Events + schedule |
| Playbook Curator Agent | Playbook validation, structure governance | on_change |
| Knowledge Curator Agent | Semantic integrity, artifact lifecycle | artifact_created/updated |

---

## Directory Structure

```text
ea-agentic-lab/
├── teams/                                   # Agent definitions (24 agents)
│   ├── governance/                          # 8 governance agents
│   │   └── agents/
│   │       ├── meeting_notes_agent.yaml
│   │       ├── nudger_agent.yaml
│   │       ├── task_shepherd_agent.yaml
│   │       ├── decision_registrar_agent.yaml
│   │       ├── reporter_agent.yaml
│   │       ├── risk_radar_agent.yaml
│   │       └── playbook_curator_agent.yaml
│   │
│   ├── solution_architects/                 # Strategic agents
│   │   └── agents/sa_agent.yaml
│   ├── account_executives/
│   │   └── agents/ae_agent.yaml
│   ├── customer_architects/
│   │   └── agents/ca_agent.yaml
│   ├── competitive_intelligence/
│   │   └── agents/ci_agent.yaml
│   ├── value_engineering/
│   │   └── agents/ve_agent.yaml
│   ├── leadership/
│   │   └── agents/senior_manager_agent.yaml
│   └── [... other strategic teams]
│
├── core/
│   ├── playbook_engine/                     # Playbook execution
│   ├── workflows/                           # Governance orchestrator
│   └── tools/                               # Utilities
│
├── playbooks/
│   ├── executable/                          # Strategic playbooks (production)
│   ├── operational/                         # Operational playbooks
│   └── validation/                          # Strategic playbooks (testing)
│
└── examples/
    └── infohub/{realm}/{node}/              # Test data (Realm/Node structure)
```

---

## Agent Communication

Agents communicate via the **InfoHub** at Node level:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        AGENT COMMUNICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Strategic Agents ──────► InfoHub ◄────── Governance Agents        │
│                              │                                       │
│                              ▼                                       │
│                    infohub/{realm}/{node}/                          │
│                    ├── meetings/                                     │
│                    ├── actions/                                      │
│                    ├── decisions/                                    │
│                    ├── risks/                                        │
│                    ├── frameworks/                                   │
│                    └── governance/                                   │
│                                                                      │
│   - Each agent writes to shared InfoHub structure                   │
│   - Agents can read outputs from other agents                       │
│   - No direct agent-to-agent messaging                              │
│   - InfoHub is single source of truth                               │
│   - All operations scoped to single Node                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Playbook Categories

| Category | Prefix | Purpose | Execution |
|----------|--------|---------|-----------|
| Strategic | PB_xxx | Framework operationalization, holistic synthesis | End-to-end, human review |
| Operational | OP_xxx | Event-driven tactical procedures | Triggered, automated |

Both categories execute at **Node level only**.

---

## Key Design Principles

1. **Node-Centric** - All operations scoped to single Node
2. **Modularity** - Each agent is independent
3. **Configurability** - Behavior defined in YAML
4. **InfoHub-Centric** - Shared knowledge base per Node
5. **Human-in-the-Loop** - Escalations, not full autonomy
6. **Separation of Concerns** - Strategic vs Governance agents
7. **Single Decision Authority** - Each decision type has one authoritative playbook

---

## Related Documentation

- [Core Entities](core-entities.md) - Blueprint, Realm, Node definitions
- [Playbook Specification](playbook-execution-specification.md) - Strategic playbooks
- [Operational Playbook Spec](../playbooks/operational-playbook-spec.md) - Tactical playbooks

---

*Last Updated: 2026-01-14*
