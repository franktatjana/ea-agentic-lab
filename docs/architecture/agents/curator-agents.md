---
order: 5
---

# Curator Agents Specification

**Version:** 1.0
**Date:** 2026-01-16

---

## Overview

Three curator agents govern different domains:

| Curator | Domain | Governs |
|---------|--------|---------|
| **Playbook Curator** | Playbook System | Structure, completeness, correctness |
| **InfoHub Curator** | InfoHub Artifacts (Vaults 1 & 2) | Semantic integrity, lifecycle |
| **Knowledge Vault Curator** | Global Knowledge Vault (Vault 3) | Anonymization, proposal validation, knowledge-playbook alignment |

---

## Playbook Curator

**Mission:** Govern playbook completeness, correctness, and alignment with blueprints

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Existence Validation** | Check required playbooks exist |
| **Structure Alignment** | Validate playbook structure matches schema |
| **Blueprint Correspondence** | Ensure playbooks map to blueprints (A01-A06, B01-B10, C01-C07) |
| **Boundary Validation** | Verify playbooks don't cross category boundaries |
| **Threshold Validation** | Check thresholds are correct, suggest updates |
| **Framework Suggestions** | Identify missing frameworks, suggest new playbooks |
| **System TODOs** | Track what needs to be built/fixed |

### Outputs

| Output | Path | Description |
|--------|------|-------------|
| Validation Reports | `governance/playbook_validations/` | Pass/fail for each playbook |
| Framework Gaps | `governance/framework_gaps.yaml` | Missing frameworks |
| Threshold Updates | `governance/threshold_recommendations.yaml` | Suggested threshold changes |
| System TODOs | `governance/playbook_todos.yaml` | Action items for system |

### Does NOT Do

- Does not execute playbooks
- Does not modify playbook content (only flags issues)
- Does not manage InfoHub artifacts (that's InfoHub Curator)
- Does not manage the Global Knowledge Vault (that's Knowledge Vault Curator)

---

## InfoHub Curator

**Mission:** Govern semantic integrity and lifecycle of InfoHub artifacts (Vaults 1 & 2)

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Semantic Integrity** | Ensure knowledge artifacts are consistent and non-contradictory |
| **Lifecycle Management** | Track artifact state: active → stale → deprecated → archived |
| **Deprecation Tagging** | Tag knowledge as deprecated when superseded |
| **Conflict Detection** | Raise issues when semantic conflicts detected |
| **Staleness Detection** | Flag artifacts not updated within expected cadence |

### Scope

**Reads from:**
```
{realm}/{node}/external-infohub/
├── architecture/       ✓ Read
├── decisions/          ✓ Read
├── value/              ✓ Read
├── context/            ✓ Read
├── journey/            ✓ Read
└── opportunities/      ✓ Read

{realm}/{node}/internal-infohub/
├── risks/              ✓ Read
├── competitive/        ✓ Read
├── stakeholders/       ✓ Read
├── governance/         ✓ Read
├── frameworks/         ✓ Read
├── actions/            ✓ Read
└── agent_work/         ✓ Read
```

**Does NOT write raw content:**
- Meeting notes (Meeting Notes Agent writes)
- Daily notes
- Mentions
- Events
- Actions (Task Shepherd writes)

**CAN write:**
- Deprecation tags
- Semantic conflict issues
- Lifecycle state changes
- Staleness flags

### Artifact Ownership Matrix

| Artifact Type | Owner (Creates) | Curator (Validates) | Deprecator (Retires) |
|---------------|-----------------|---------------------|----------------------|
| Meeting Notes | Meeting Notes Agent | InfoHub Curator | InfoHub Curator |
| Decisions | Decision Registrar | InfoHub Curator | Decision Registrar + InfoHub Curator |
| Risks | Risk Radar Agent | InfoHub Curator | Risk Radar Agent |
| Actions | Task Shepherd Agent | InfoHub Curator | Task Shepherd Agent |
| Architecture Docs | SA Agent | InfoHub Curator | SA Agent + InfoHub Curator |
| Competitive Intel | CI Agent | InfoHub Curator | CI Agent + InfoHub Curator |
| Value Artifacts | VE Agent | InfoHub Curator | VE Agent |
| Security Docs | InfoSec Agent | InfoHub Curator | InfoSec Agent |
| Commercial Data | AE Agent | InfoHub Curator | AE Agent |
| Knowledge Items | Agents + Humans | Knowledge Vault Curator | Knowledge Vault Curator (human approval) |
| Playbooks | Orchestration Agent | Playbook Curator | Playbook Curator |
| Processes | Orchestration Agent | Playbook Curator | Orchestration Agent |

### Deprecation Rules

| Artifact Type | Auto-Deprecate After | Manual Deprecation |
|---------------|---------------------|-------------------|
| Meeting Notes | 90 days (staleness) | Owner or Curator |
| Decisions | Never (audit trail) | Only supersede |
| Risks | When mitigated + 30 days | Risk owner |
| Actions | When completed + 30 days | Task owner |
| Architecture Docs | When superseded | SA Agent |
| Competitive Intel | 60 days (market changes) | CI Agent |

### Outputs

| Output | Path | Description |
|--------|------|-------------|
| Semantic Conflicts | `governance/semantic_conflicts.yaml` | Detected contradictions |
| Staleness Report | `governance/staleness_report.yaml` | Stale artifacts |
| Deprecation Log | `governance/deprecation_log.yaml` | What was deprecated, when, why |
| Lifecycle Dashboard | `governance/artifact_lifecycle.yaml` | State of all artifacts |

---

[image: Signal Subscription Flow - Meeting Notes Agent triggering parallel subscriptions to governance agents]

## Signal-Based Communication

### Principle

> **All agents communicate via signals, not shared notes/records.**

Agents do NOT:
- Write to each other's output files
- Read and modify shared records
- Pass context through file contents

Agents DO:
- Emit signals when events occur
- Subscribe to relevant signals
- React to signals with their own actions

### Signal Format

```yaml
signal:
  id: "SIG_20260116_001"
  timestamp: "2026-01-16T10:30:00Z"
  source_agent: "Meeting Notes Agent"
  signal_type: "artifact_created"
  payload:
    artifact_type: "meeting_note"
    artifact_path: "ACME/SECURITY_CONSOLIDATION/meetings/2026-01-16_kickoff.md"
    realm: "ACME"
    node: "SECURITY_CONSOLIDATION"
    metadata:
      participants: ["AE", "SA", "Customer"]
      extracted_decisions: 2
      extracted_actions: 5
      extracted_risks: 1
  subscribers:
    - "Task Shepherd Agent"
    - "Decision Registrar"
    - "Risk Radar Agent"
    - "InfoHub Curator"
```

### Signal Types

| Signal Type | Source | Subscribers | Purpose |
|-------------|--------|-------------|---------|
| `artifact_created` | Any agent | InfoHub Curator, relevant agents | New artifact available |
| `artifact_updated` | Any agent | InfoHub Curator | Artifact modified |
| `artifact_deprecated` | InfoHub Curator | All agents | Artifact no longer valid |
| `semantic_conflict` | InfoHub Curator | Owning agents | Contradiction detected |
| `staleness_detected` | InfoHub Curator | Owning agent | Artifact needs refresh |
| `decision_made` | Decision Registrar | Risk Radar, SA Agent | Decision logged |
| `risk_identified` | Risk Radar | Senior Manager (if critical) | Risk surfaced |
| `action_created` | Task Shepherd | Nudger Agent | Action needs tracking |
| `action_overdue` | Nudger Agent | Senior Manager | Escalation needed |
| `playbook_violation` | Playbook Curator | Orchestration Agent | Playbook issue |
| `threshold_breach` | Any agent | Relevant curator | Threshold exceeded |
| `handover_requested` | Any agent | Receiving agent | Work transfer |

### Signal Flow Example

```
Meeting Ends
    │
    ▼
Meeting Notes Agent
    │ emits: artifact_created (meeting_note)
    │
    ├──► Task Shepherd Agent
    │        receives signal
    │        extracts actions
    │        emits: artifact_created (actions)
    │
    ├──► Decision Registrar
    │        receives signal
    │        extracts decisions
    │        emits: decision_made
    │
    ├──► Risk Radar Agent
    │        receives signal
    │        extracts risks
    │        emits: risk_identified (if any)
    │
    └──► InfoHub Curator
             receives signal
             validates semantic integrity
             emits: semantic_conflict (if found)
```

### Signal Bus Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SIGNAL BUS                             │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ artifact│  │ decision│  │  risk   │  │ action  │  ...  │
│  │ _created│  │ _made   │  │_identified│ │_overdue │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
└───────┼────────────┼────────────┼────────────┼─────────────┘
        │            │            │            │
   ┌────┴────┐  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐
   │InfoHub  │  │Risk     │  │Senior   │  │Senior   │
   │Curator  │  │Radar    │  │Manager  │  │Manager  │
   └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### Signal Persistence

Signals are logged for audit:

```
signal_log/
├── 2026-01-16.jsonl      # Daily signal log
├── 2026-01-15.jsonl
└── ...
```

Each signal is immutable once emitted.

---

## Knowledge Vault Curator

**Mission:** Facilitate institutional knowledge management in the Global Knowledge Vault (Vault 3)

### Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Proposal Validation** | Validate proposals for schema, anonymization, deduplication, tagging |
| **Anonymization Enforcement** | Ensure no customer-identifiable data in Vault 3 (non-negotiable) |
| **Semantic Integrity** | Detect contradictions across vault items |
| **Knowledge Lifecycle** | Manage confidence progression (proposed -> reviewed -> validated) |
| **Usage Tracking** | Track which items are consumed during playbook execution |
| **Gap Analysis** | Identify domains/archetypes lacking knowledge coverage |
| **Obsolescence Detection** | Flag items not consumed in 12 months or contradicted |

### Scope

**Reads from:**
```
vault/knowledge/
├── operations/           ✓ Read
├── content/              ✓ Read
├── external/             ✓ Read
├── assets/               ✓ Read
└── .proposals/           ✓ Read + validate
```

**CAN write:**
- Proposal validation metadata
- Vault health reports
- Usage index
- Knowledge gap reports
- Obsolescence flags

### Does NOT Do

- Create knowledge content (agents and humans author)
- Approve or reject proposals (humans decide)
- Govern InfoHub artifacts (InfoHub Curator's domain)
- Execute playbooks or inject knowledge at runtime

### Contributors to the Knowledge Vault

The Knowledge Vault has two contributor types. The Knowledge Vault Curator is not a contributor, it is a facilitator.

| Contributor | How | Approval |
|-------------|-----|----------|
| **Humans** | Direct entry via Knowledge Vault UI | Immediate (human is the authority) |
| **Agents** | Proposals via `.proposals/` queue | Requires human approval after curator validation |

### Outputs

| Output | Path | Description |
|--------|------|-------------|
| Vault Health | `governance/vault_health.yaml` | Overall vault health metrics |
| Proposal Validations | `governance/proposal_validations.yaml` | Validation outcomes log |
| Usage Index | `governance/vault_usage_index.yaml` | Knowledge-to-playbook consumption mapping |
| Knowledge Gaps | `governance/knowledge_gaps.yaml` | Domains lacking coverage |
| Obsolescence Report | `governance/obsolescence_report.yaml` | Items flagged for retirement |

---

## Curator Comparison

| Aspect | Playbook Curator | InfoHub Curator | Knowledge Vault Curator |
|--------|------------------|-----------------|-------------------------|
| **Domain** | Playbook system | InfoHub artifacts (Vaults 1 & 2) | Global Knowledge Vault (Vault 3) |
| **Reads** | `playbooks/`, `blueprints/` | `{realm}/{node}/external-infohub/`, `{realm}/{node}/internal-infohub/` | `vault/knowledge/`, `vault/knowledge/.proposals/` |
| **Writes** | Validation reports, TODOs | Deprecation tags, conflicts | Validation metadata, usage index, gap reports |
| **Validates** | Structure, thresholds, boundaries | Semantics, lifecycle, consistency | Anonymization, tagging, deduplication, usage |
| **Creates** | Never (flags issues) | Deprecation records | Validation and health reports |
| **Modifies** | Never | Lifecycle state only | Proposal status only |
| **Triggers** | `playbook_modified`, `on_change` | `artifact_created`, `artifact_updated` | `knowledge_proposal_received`, `playbook_completed` |
| **Ownership** | Agent governs | Agent governs | Humans own, agent facilitates |

---

[image: Artifact Ownership Map - which agents create, validate, and retire each artifact type]

## Integration with Orchestration

```
Human describes process
        │
        ▼
Orchestration Agent
        │ parses, creates playbook
        │ emits: playbook_created
        │
        ▼
Playbook Curator
        │ validates structure, thresholds
        │ emits: playbook_validated OR playbook_violation
        │
        ▼
If validated → Playbook active
If violation → Human notified, must fix
```

```
Agent creates artifact
        │
        ▼
InfoHub Curator
        │ checks semantic integrity
        │ checks for contradictions with existing
        │
        ├─► No conflict → artifact active
        │
        └─► Conflict detected
                │ emits: semantic_conflict
                │
                ▼
            Owning agents notified
                │
                ▼
            Human resolves (if needed)
```

---

## Summary

| Agent | Category | Purpose |
|-------|----------|---------|
| Playbook Curator | Governance | Playbook completeness, correctness, alignment |
| InfoHub Curator | Governance | Semantic integrity, InfoHub artifact lifecycle (Vaults 1 & 2) |
| Knowledge Vault Curator | Governance | Anonymization, proposal validation, knowledge-playbook alignment (Vault 3) |

**Communication:** Signal-based, not shared records.

**Governance count:** Now 9 (was 8, added Knowledge Vault Curator; renamed Knowledge Curator to InfoHub Curator per DDR-015)

---

**Related Docs:**
- [agent-responsibilities.md](agent-responsibilities.md)
- [playbook-model-validation.md](../playbooks/playbook-model-validation.md)
