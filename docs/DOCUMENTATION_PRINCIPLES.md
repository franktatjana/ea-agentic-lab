# Documentation Principles

**Version:** 1.0
**Date:** 2026-01-23
**Audience:** Contributors, Agents, AI Systems

---

## Overview

EA Agentic Lab serves two audiences: **humans** and **machines** (agents, playbooks, checklists, RAG systems). This applies to:

1. **Operational Artifacts** (primary) - Meeting notes, decisions, risks, actions, canvases
2. **Project Documentation** (secondary) - Architecture, PRD, guides

Every artifact in InfoHub is consumed by agents. Every playbook output feeds another playbook. **If machines can't parse it, the system breaks.**

> "LLMs thrive on well-defined structure."
> — [Beyond Human-Readable: Writing Documentation for AI](https://www.linkedin.com/pulse/beyond-human-readable-writing-documentation-ai-sivakumar-yepuru-awmbe/)

---

## Core Principles

### 1. Clarity & Simplicity

| Principle | Do | Don't |
|-----------|-----|-------|
| **Concise language** | "The playbook validates inputs" | "The playbook, in essence, performs a validation step on the inputs" |
| **Single idea per paragraph** | One concept, fully explained | Multiple concepts interleaved |
| **Frontload key information** | Put the answer first, context second | Bury the key point at the end |
| **Consistent terminology** | Always use "Realm" for company | Mix "Realm", "Account", "Customer" |

**Example - Frontloading:**

```markdown
# Bad: Key info buried
The system has various components. After initialization,
configuration is loaded. Playbooks execute in sequence.
The playbook timeout is 30 seconds.

# Good: Key info first
Playbook timeout: 30 seconds.

The playbook engine executes playbooks in sequence after
loading configuration during system initialization.
```

### 2. Structure as Foundation

**Hierarchy matters.** Use semantic Markdown:

```markdown
# H1: Document title (one per file)
## H2: Major sections
### H3: Subsections
#### H4: Details (use sparingly)
```

**Use appropriate structures:**

| Content Type | Structure |
|--------------|-----------|
| Steps, sequences | Numbered lists |
| Features, options | Bulleted lists |
| Comparisons, specs | Tables |
| Code, commands | Fenced code blocks |
| Definitions | Definition lists or tables |

**Self-contained sections:** Each section should be understandable in isolation. RAG systems retrieve chunks, not full documents.

```markdown
## Risk Register

The risk register tracks identified risks for a node.

**Location:** `{realm}/{node}/risks/risk_register.yaml`

**Schema:**
- `risk_id`: Unique identifier (e.g., `RISK_001`)
- `severity`: `critical` | `high` | `medium` | `low`
- `status`: `open` | `mitigated` | `closed`

This section is complete without reading other sections.
```

### 3. Explicit Detail (Zero Ambiguity)

AI cannot infer missing information. Be ruthlessly explicit:

| Implicit (Bad) | Explicit (Good) |
|----------------|-----------------|
| "Set the timeout appropriately" | "Set timeout to 30000 (milliseconds)" |
| "Use a recent version" | "Requires Python >= 3.11" |
| "The field is optional" | "Optional. Default: `null`" |
| "Handle errors gracefully" | "On error: emit `SIG_ERR_001`, log to `runs/{id}/errors.log`" |

**Always specify:**

- Default values
- Required vs. optional
- Data types and constraints
- Error conditions and codes
- Units (seconds, milliseconds, bytes)

**Example - Complete specification:**

```yaml
# Bad: Ambiguous
threshold:
  health_score: 60  # Alert threshold

# Good: Explicit
threshold:
  health_score:
    value: 60
    unit: "percentage"
    comparison: "less_than"
    description: "Alert when health score drops below this value"
    default: 60
    range: [0, 100]
```

### 4. Semantic Enrichment

**Metadata matters.** Every document should have:

```yaml
---
title: "Playbook Execution Specification"
description: "How playbooks are loaded, validated, and executed"
category: "architecture"
keywords: ["playbook", "execution", "validation", "DLL"]
last_updated: "2026-01-23"
---
```

**Use consistent identifiers:**

- Playbook IDs: `PB_XXX`
- Signal IDs: `SIG_XXX_NNN`
- Check IDs: `CHK_XXX_NNN`
- Agent IDs: `{role}_agent`

**Cross-reference explicitly:**

```markdown
See [Playbook Framework](playbook-framework.md) for design principles.
Related: PB_970 (validation), PB_971 (gap scan).
```

---

## Operational Artifacts

These are the daily artifacts that agents consume and produce. **Machine-readability is critical.**

### Meeting Notes

```yaml
# Bad: Narrative blob
notes: "We discussed the security project. John mentioned risks. Timeline is tight."

# Good: Structured extraction
meeting_id: "MTG_2026_01_23_001"
date: "2026-01-23"
attendees:
  - name: "John Smith"
    role: "security_lead"
decisions:
  - decision_id: "DEC_047"
    description: "Proceed with Phase 1 deployment"
    owner: "John Smith"
    deadline: "2026-02-15"
actions:
  - action_id: "ACT_123"
    description: "Complete security assessment"
    assignee: "John Smith"
    due_date: "2026-01-30"
    priority: "P1"
risks_identified:
  - risk_id: "RISK_012"
    description: "Timeline pressure may compromise testing"
    severity: "high"
```

### Decision Log

```yaml
# Every decision must be queryable by agents
decision_id: "DEC_047"
title: "Phase 1 Deployment Approach"
status: "approved"              # proposed | approved | superseded | rejected
made_by: "John Smith"
made_on: "2026-01-23"
rationale: "Reduces risk by limiting initial scope"
alternatives_considered:
  - option: "Full deployment"
    rejected_reason: "Too risky given timeline"
impacts:
  - artifact: "project_plan.yaml"
    change: "Updated timeline"
supersedes: null                # DEC_XXX if replacing previous decision
```

### Risk Register

```yaml
# Agents must be able to filter, sort, escalate
risk_id: "RISK_012"
title: "Testing Timeline Compression"
description: "Aggressive timeline may reduce test coverage"
severity: "high"                # critical | high | medium | low
likelihood: "likely"            # almost_certain | likely | possible | unlikely | rare
status: "open"                  # open | mitigated | closed | accepted
owner: "John Smith"
identified_date: "2026-01-23"
review_date: "2026-01-30"       # When to reassess
mitigation_plan: "Add automated test suite"
related_decisions: ["DEC_047"]
```

### Action Tracker

```yaml
# Must support: filtering by priority, assignee, status, due date
action_id: "ACT_123"
title: "Complete security assessment"
description: "Run full security scan on Phase 1 components"
assignee: "John Smith"
status: "in_progress"           # pending | in_progress | blocked | completed | cancelled
priority: "P1"                  # P0 | P1 | P2 | P3
created_date: "2026-01-23"
due_date: "2026-01-30"
completed_date: null
blockers: []                    # List of blocking issues
source:                         # Provenance
  type: "meeting"
  reference: "MTG_2026_01_23_001"
```

---

## Machine-Readable Patterns

### For YAML/Config Files

```yaml
# Include inline documentation
playbook_id: "PB_201"  # Format: PB_NNN
version: "1.0"         # SemVer format

# Group related fields
thresholds:
  health_alert: 60     # Percentage (0-100)
  staleness_days: 7    # Days before artifact marked stale
```

### For Checklists

```yaml
# Machine-executable assertions
- rule_id: "CHK_PRE_001"
  name: "Required inputs available"
  assertion: "ALL(playbook.required_inputs, EXISTS($.path))"
  severity: "error"           # error | warning | info
  auto_fix_playbook: null     # PB_XXX or null if no auto-fix
  human_message: "One or more required input files are missing"
```

### For API Documentation

```markdown
## GET /api/v1/nodes/{realm}/{node}/health

Returns the current health score for a node.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| realm | string | Yes | Realm identifier (e.g., `ACME`) |
| node | string | Yes | Node identifier (e.g., `SECURITY_CONSOLIDATION`) |

**Response:** `200 OK`
```json
{
  "score": 75,
  "status": "healthy",
  "last_calculated": "2026-01-23T10:30:00Z"
}
```

**Errors:**

| Code | Meaning |
|------|---------|
| 404 | Node not found |
| 500 | Health score calculation failed |

---

## Document Types

### Operational Artifacts (Daily Use)

| Type | Audience | Machine Priority | Location |
|------|----------|------------------|----------|
| **Meeting notes** | Agents + Humans | Critical | `{realm}/{node}/meetings/` |
| **Decisions** | Agents + Humans | Critical | `{realm}/{node}/decisions/` |
| **Risks** | Agents + Humans | Critical | `{realm}/{node}/risks/` |
| **Actions** | Agents + Humans | Critical | `{realm}/{node}/actions/` |
| **Canvases** | Humans (rendered) | High | `{realm}/{node}/canvases/` |
| **Health scores** | Agents + Dashboards | Critical | `{realm}/{node}/governance/` |

### Project Documentation

| Type | Audience | Machine Priority | Location |
|------|----------|------------------|----------|
| **Config files** | Machines | Critical | `config/` |
| **Playbook specs** | Machines + Agents | Critical | `playbooks/` |
| **Architecture docs** | Humans + LLMs | High | `docs/architecture/` |
| **Reference catalogs** | LLMs + Humans | Very High | `docs/reference/` |
| **Operations guides** | Humans | Medium | `docs/operations/` |

---

## Checklist: Is This Artifact Machine-Ready?

Before saving any artifact (meeting note, decision, risk, action, canvas), verify:

- [ ] **Unique ID** assigned (e.g., `DEC_047`, `RISK_012`, `ACT_123`)
- [ ] **Status** uses defined enum values (not free text)
- [ ] **Dates** in ISO format (`2026-01-23`, not "next Tuesday")
- [ ] **Owner/Assignee** is a specific person (not "team" or "TBD")
- [ ] **Severity/Priority** uses defined levels (`P0`/`P1`/`P2`, `critical`/`high`/`medium`/`low`)
- [ ] **Related items** linked by ID (not description)
- [ ] **Provenance** captured (source meeting, playbook run)
- [ ] **No narrative blobs** - structured fields only
- [ ] **Terminology** matches the glossary (PRD Section 10)

---

## References

- [Beyond Human-Readable: Writing Documentation for AI](https://www.linkedin.com/pulse/beyond-human-readable-writing-documentation-ai-sivakumar-yepuru-awmbe/) - Sivakumar Yepuru
- [llms.txt Specification](https://llmstxt.org/) - Emerging standard for LLM-friendly docs
- [Schema.org Vocabulary](https://schema.org/) - Semantic markup standards
