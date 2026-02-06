# Curator Agents Specification

**Version:** 1.0
**Date:** 2026-01-16

---

## Overview

Two curator agents govern different domains:

| Curator | Domain | Governs |
|---------|--------|---------|
| **Playbook Curator** | Playbook System | Structure, completeness, correctness |
| **Knowledge Curator** | Knowledge Artifacts | Semantic integrity, lifecycle |

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
- Does not manage knowledge artifacts (that's Knowledge Curator)

---

## Knowledge Curator

**Mission:** Govern semantic integrity and lifecycle of knowledge artifacts

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
infohub/{realm}/{node}/
├── architecture/       ✓ Read
├── decisions/          ✓ Read
├── risks/              ✓ Read
├── competitive/        ✓ Read
├── value/              ✓ Read
├── security/           ✓ Read
├── commercial/         ✓ Read
└── governance/         ✓ Read
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
| Meeting Notes | Meeting Notes Agent | Knowledge Curator | Knowledge Curator |
| Decisions | Decision Registrar | Knowledge Curator | Decision Registrar + Knowledge Curator |
| Risks | Risk Radar Agent | Knowledge Curator | Risk Radar Agent |
| Actions | Task Shepherd Agent | Knowledge Curator | Task Shepherd Agent |
| Architecture Docs | SA Agent | Knowledge Curator | SA Agent + Knowledge Curator |
| Competitive Intel | CI Agent | Knowledge Curator | CI Agent + Knowledge Curator |
| Value Artifacts | VE Agent | Knowledge Curator | VE Agent |
| Security Docs | InfoSec Agent | Knowledge Curator | InfoSec Agent |
| Commercial Data | AE Agent | Knowledge Curator | AE Agent |
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
    artifact_path: "infohub/ACME/SECURITY_CONSOLIDATION/meetings/2026-01-16_kickoff.md"
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
    - "Knowledge Curator"
```

### Signal Types

| Signal Type | Source | Subscribers | Purpose |
|-------------|--------|-------------|---------|
| `artifact_created` | Any agent | Knowledge Curator, relevant agents | New artifact available |
| `artifact_updated` | Any agent | Knowledge Curator | Artifact modified |
| `artifact_deprecated` | Knowledge Curator | All agents | Artifact no longer valid |
| `semantic_conflict` | Knowledge Curator | Owning agents | Contradiction detected |
| `staleness_detected` | Knowledge Curator | Owning agent | Artifact needs refresh |
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
    └──► Knowledge Curator
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
   │Knowledge│  │Risk     │  │Senior   │  │Senior   │
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

## Curator Comparison

| Aspect | Playbook Curator | Knowledge Curator |
|--------|------------------|-------------------|
| **Domain** | Playbook system | Knowledge artifacts |
| **Reads** | `playbooks/`, `blueprints/` | `infohub/{realm}/{node}/` |
| **Writes** | Validation reports, TODOs | Deprecation tags, conflicts |
| **Validates** | Structure, thresholds, boundaries | Semantics, lifecycle, consistency |
| **Creates** | Never (flags issues) | Deprecation records |
| **Modifies** | Never | Lifecycle state only |
| **Triggers** | `playbook_modified`, `on_change` | `artifact_created`, `artifact_updated` |

---

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
Knowledge Curator
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
| Knowledge Curator | Governance | Semantic integrity, artifact lifecycle |

**Communication:** Signal-based, not shared records.

**Governance count:** Now 8 (was 7, added Knowledge Curator)

---

**Related Docs:**
- [agent-responsibilities.md](agent-responsibilities.md)
- [playbook-model-validation.md](playbook-model-validation.md)
