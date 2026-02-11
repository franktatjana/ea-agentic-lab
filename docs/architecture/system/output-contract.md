# Output Contract: Playbook Run Artifacts

## Overview

This document defines the deterministic file structure produced by playbook execution. All playbook runs produce artifacts in a consistent, traceable format.

## Design Decision: Runs as Containers

**Selected Approach:** Multi-dimensional identity (customer + project + run_id)

```
runs/
  <run_id>/
    outputs/
      <object_type>/
        <object_file>.md
    report.md
    trace.json
    metadata.yaml
```

**Rationale:**
- **Atomic runs**: All outputs grouped together for easy comparison
- **Clean rollback**: Delete entire run directory if needed
- **Audit trail**: Clear history of what was produced when
- **No pollution**: Doesn't mix versioned objects with current state
- **Explicit promotion**: Human review required before moving to InfoHub

**Alternative considered:** Version as run_id (objects carry version in frontmatter)
- **Rejected because**: Mixes current state with historical versions, harder to rollback, no clear run boundaries

## Directory Structure

```
ea-agentic-lab/
├── InfoHub/                           # Current state (human-curated)
│   ├── clients/{client_id}/
│   ├── strategy/
│   ├── risks/
│   └── decisions/
│
└── runs/                              # Execution history (agent-generated)
    └── {run_id}/                      # Format: YYYY-MM-DD_HHMMSS_<playbook_id>_<client_id>
        ├── metadata.yaml              # Run metadata
        ├── trace.json                 # Execution trace
        ├── report.md                  # Human-readable summary
        └── outputs/                   # Structured outputs
            ├── decisions/
            ├── risks/
            ├── initiatives/
            ├── gaps/
            └── analysis/              # For generative playbooks (SWOT, etc.)
```

## Run ID Format

```
{YYYY-MM-DD}_{HHMMSS}_{playbook_id}_{client_id}
```

**Example:** `2026-01-12_143022_PB_201_c4`

**Components:**
- `YYYY-MM-DD`: Date of execution
- `HHMMSS`: Time of execution (24-hour)
- `playbook_id`: Playbook identifier (e.g., PB_201)
- `client_id`: Target client identifier

**Properties:**
- Lexicographically sortable (chronological order)
- Globally unique (timestamp + playbook + client)
- Self-documenting (reveals what/when/who)

## File Specifications

### 1. metadata.yaml

Run metadata and configuration.

```yaml
run_id: "2026-01-12_143022_PB_201_c4"
playbook_id: "PB_201"
playbook_name: "SWOT Analysis"
playbook_version: "2.0"
client_id: "c4"
agent_role: "SA Agent"
execution_timestamp: "2026-01-12T14:30:22Z"
execution_duration_seconds: 12.4

inputs:
  mandatory:
    - path: "InfoHub/clients/c4/overview.md"
      status: "found"
      last_modified: "2025-12-15T10:30:00Z"
    - path: "InfoHub/clients/c4/installed_base.md"
      status: "found"
      last_modified: "2025-12-10T09:15:00Z"
    - path: "InfoHub/risks/c4/*.md"
      status: "found"
      count: 3

  optional:
    - path: "InfoHub/stakeholders/c4/relationship_map.md"
      status: "not_found"

thresholds_used:
  high_threat_count: 2
  low_strength_count: 2
  min_opportunities: 2
  min_strengths: 2

validation_results:
  pre_execution:
    - check: "$.client_id EXISTS"
      status: "passed"
    - check: "$.inputs.mandatory.count >= 2"
      status: "passed"

  post_execution:
    - check: "$.swot.strengths.count >= 1"
      status: "passed"
    - check: "evidence_validation_passed"
      status: "passed"

outputs_generated:
  - type: "analysis"
    path: "outputs/analysis/swot_c4_2026-01-12.md"
    status: "created"
  - type: "decision"
    path: "outputs/decisions/defensive_posture_c4.md"
    status: "created"
  - type: "risk"
    path: "outputs/risks/competitive_technical_risk_c4.md"
    status: "created"

status: "completed"  # completed | failed | partial
errors: []
warnings:
  - "Optional input not found: stakeholders/c4/relationship_map.md"
```

### 2. trace.json

Detailed execution trace for debugging and audit.

```json
{
  "run_id": "2026-01-12_143022_PB_201_c4",
  "execution_steps": [
    {
      "timestamp": "2026-01-12T14:30:22.100Z",
      "step": "load_playbook",
      "status": "success",
      "details": {
        "playbook_path": "playbooks/executable/PB_201_swot_analysis_v2.yaml",
        "schema_validation": "passed"
      }
    },
    {
      "timestamp": "2026-01-12T14:30:22.250Z",
      "step": "load_thresholds",
      "status": "success",
      "details": {
        "global_thresholds": 12,
        "playbook_thresholds": 4,
        "total": 16
      }
    },
    {
      "timestamp": "2026-01-12T14:30:22.400Z",
      "step": "validate_inputs",
      "status": "success",
      "details": {
        "mandatory_found": 4,
        "mandatory_missing": 0,
        "optional_found": 2,
        "optional_missing": 2
      }
    },
    {
      "timestamp": "2026-01-12T14:30:23.100Z",
      "step": "load_context",
      "status": "success",
      "details": {
        "context_size_bytes": 45231,
        "artifacts_loaded": 6
      }
    },
    {
      "timestamp": "2026-01-12T14:30:24.500Z",
      "step": "evaluate_decision_logic",
      "status": "success",
      "details": {
        "rules_evaluated": 3,
        "rules_fired": 2,
        "fired_rules": [
          {
            "rule_id": "defensive_posture_required",
            "condition": "$.swot.threats.items[?(@.impact=='high')].length >= 2 AND $.swot.strengths.count <= 2",
            "condition_substituted": "$.swot.threats.items[?(@.impact=='high')].length >= 2 AND $.swot.strengths.count <= 2",
            "left_value": 2,
            "right_value": 2,
            "operator": ">=",
            "result": true,
            "creates": ["Decision", "Risk"]
          },
          {
            "rule_id": "competitive_technical_risk",
            "condition": "$.swot.threats.items[?(@.category=='competitive')].length > 0 AND $.swot.weaknesses.items[?(@.category=='technical')].length > 0",
            "result": true,
            "creates": ["Risk", "Initiative"]
          }
        ]
      }
    },
    {
      "timestamp": "2026-01-12T14:30:32.800Z",
      "step": "generate_outputs",
      "status": "success",
      "details": {
        "outputs_created": 3,
        "analysis": 1,
        "decisions": 1,
        "risks": 1
      }
    },
    {
      "timestamp": "2026-01-12T14:30:33.200Z",
      "step": "validate_evidence",
      "status": "success",
      "details": {
        "items_validated": 12,
        "evidence_entries": 24,
        "validation_errors": 0
      }
    },
    {
      "timestamp": "2026-01-12T14:30:34.500Z",
      "step": "write_outputs",
      "status": "success",
      "details": {
        "files_written": 3,
        "total_bytes": 18742
      }
    }
  ],
  "execution_summary": {
    "start_time": "2026-01-12T14:30:22.100Z",
    "end_time": "2026-01-12T14:30:34.500Z",
    "duration_seconds": 12.4,
    "status": "completed",
    "total_steps": 8,
    "successful_steps": 8,
    "failed_steps": 0
  }
}
```

### 3. report.md

Human-readable summary of run results.

```markdown
# Playbook Run Report

**Run ID:** 2026-01-12_143022_PB_201_c4
**Playbook:** SWOT Analysis (PB_201 v2.0)
**Client:** C4 Pharmaceutical
**Agent:** SA Agent
**Executed:** 2026-01-12 14:30:22 UTC
**Duration:** 12.4 seconds
**Status:** ✅ Completed

---

## Executive Summary

SWOT analysis identified **2 high-severity threats** combined with **limited strengths**, triggering defensive posture recommendation. Immediate action required to address competitive displacement risk amplified by technical gaps.

---

## Outputs Generated

### 1. Analysis
- **[SWOT Analysis](outputs/analysis/swot_c4_2026-01-12.md)**
  - 3 strengths identified (relationship: 2, technical: 1)
  - 2 weaknesses identified (technical: 1, competitive: 1)
  - 2 opportunities identified (expansion: 2)
  - 2 threats identified (competitive: 1, market: 1)

### 2. Decisions
- **[Defensive Posture Required](outputs/decisions/defensive_posture_c4.md)** (HIGH)
  - **Context:** Multiple high threats with limited strengths, account at risk
  - **Recommendation:** Prioritize threat mitigation over opportunity pursuit
  - **Actions:** Activate executive sponsor, engage specialists, defer new opportunities

### 3. Risks
- **[Competitive Technical Risk](outputs/risks/competitive_technical_risk_c4.md)** (HIGH)
  - **Context:** External competitive threat combined with internal technical weakness
  - **Recommendation:** Immediate competitive response and technical remediation
  - **Escalate to:** Sales Leadership + Product Team

---

## Decision Logic Evaluation

**Rules Evaluated:** 3
**Rules Fired:** 2

### Rule: defensive_posture_required
- **Condition:** `$.swot.threats.items[?(@.impact=='high')].length >= 2 AND $.swot.strengths.count <= 2`
- **Result:** ✅ TRUE (2 high threats, 3 strengths)
- **Severity:** HIGH
- **Creates:** Decision + Risk

### Rule: competitive_technical_risk
- **Condition:** `$.swot.threats.items[?(@.category=='competitive')].length > 0 AND $.swot.weaknesses.items[?(@.category=='technical')].length > 0`
- **Result:** ✅ TRUE (1 competitive threat, 1 technical weakness)
- **Severity:** HIGH
- **Creates:** Risk + Initiative

---

## Validation Results

### Pre-Execution
- ✅ Client ID exists in InfoHub
- ✅ At least 2 required inputs available

### Post-Execution
- ✅ At least one SWOT quadrant populated
- ✅ All entries have evidence citations
- ✅ All opportunities linked to strengths/weaknesses
- ✅ All threats have probability and impact ratings

### Evidence Validation
- ✅ 12 items validated
- ✅ 24 evidence entries
- ✅ 0 validation errors

---

## Inputs Used

### Mandatory (4/4 found)
- ✅ InfoHub/clients/c4/overview.md (2025-12-15)
- ✅ InfoHub/clients/c4/installed_base.md (2025-12-10)
- ✅ InfoHub/risks/c4/*.md (3 files)
- ✅ Account Plan

### Optional (2/4 found)
- ✅ InfoHub/competitive/c4/*.md (1 file)
- ✅ Support case history
- ⚠️ InfoHub/stakeholders/c4/relationship_map.md (not found)
- ⚠️ Win notes (not found)

---

## Thresholds Used

| Threshold | Value | Source |
|-----------|-------|--------|
| high_threat_count | 2 | PB_201_swot |
| low_strength_count | 2 | PB_201_swot |
| min_opportunities | 2 | PB_201_swot |
| min_strengths | 2 | PB_201_swot |
| early_stage_days | 90 | global |

---

## Warnings

- Optional input not found: stakeholders/c4/relationship_map.md
- Optional input not found: win notes

---

## Next Steps

1. **Review generated outputs** in `outputs/` directory
2. **Approve or reject** decision objects
3. **Promote approved artifacts** to InfoHub
4. **Execute recommended actions** from decision objects

---

## Trace

Full execution trace available in [trace.json](trace.json)
```

### 4. Output Objects

Output objects are structured markdown files with YAML frontmatter.

#### Decision Object

**Path:** `outputs/decisions/defensive_posture_c4.md`

```markdown
---
object_type: decision
object_id: defensive_posture_c4_2026-01-12
run_id: 2026-01-12_143022_PB_201_c4
playbook_id: PB_201
client_id: c4
created: 2026-01-12T14:30:32Z
severity: HIGH
status: pending_review
stakeholders:
  - AE
  - SA
  - Executive Sponsor
  - Sales Leadership
owner: AE
---

# Decision: Adopt Defensive Strategy for C4

## Context

Multiple high threats with limited strengths, account at risk. SWOT analysis revealed 2 high-impact threats combined with only 3 strengths (threshold: ≤2 for defensive posture).

## Recommendation

Prioritize threat mitigation and strength building over opportunity pursuit.

## Actions Required

1. **Activate executive sponsor immediately**
   - Owner: AE
   - Urgency: IMMEDIATE
   - Status: pending

2. **Engage specialists to address technical weaknesses**
   - Owner: SA
   - Urgency: HIGH
   - Status: pending

3. **Defer new opportunity pursuit until threats mitigated**
   - Owner: AE
   - Urgency: MEDIUM
   - Status: pending

## Evidence

### High Threat: Competitive Displacement Risk

**Source:** InfoHub/competitive/c4/legacysiem_evaluation.md
**Date:** 2025-12-18
**Excerpt:** "C4 IT evaluating LegacySIEM for observability consolidation. Decision expected Q1 2026."
**Confidence:** HIGH

### High Threat: Budget Freeze

**Source:** InfoHub/clients/c4/overview.md
**Date:** 2025-12-15
**Excerpt:** "CFO announced 20% budget reduction for 2026 IT spend."
**Confidence:** MEDIUM

### Limited Strength: Relationship Depth

**Source:** InfoHub/stakeholders/c4/notes.md
**Date:** 2025-12-10
**Excerpt:** "Primary contact (IT Manager) has limited influence. No executive sponsor."
**Confidence:** HIGH

## Decision Logic Fired

**Rule ID:** defensive_posture_required
**Condition:** `$.swot.threats.items[?(@.impact=='high')].length >= 2 AND $.swot.strengths.count <= 2`
**Evaluation:** TRUE (2 high threats, 3 strengths)

## Related Objects

- **Risk:** [Competitive Technical Risk](../risks/competitive_technical_risk_c4.md)
- **Analysis:** [SWOT Analysis](../analysis/swot_c4_2026-01-12.md)

---

*Generated by SA Agent via SWOT Analysis Playbook (PB_201 v2.0)*
*Run ID: 2026-01-12_143022_PB_201_c4*
```

#### Risk Object

**Path:** `outputs/risks/competitive_technical_risk_c4.md`

```markdown
---
object_type: risk
object_id: competitive_technical_risk_c4_2026-01-12
run_id: 2026-01-12_143022_PB_201_c4
playbook_id: PB_201
client_id: c4
created: 2026-01-12T14:30:32Z
severity: HIGH
category: competitive
probability: high
impact: high
status: open
escalate_to:
  - Sales Leadership
  - Product Team
---

# Risk: Competitive Displacement Risk Amplified by Technical Gaps

## Description

External competitive threat (LegacySIEM evaluation) combined with internal technical weakness (performance issues) creates compound risk of account loss.

## Probability & Impact

- **Probability:** HIGH
- **Impact:** HIGH (ARR: $720K at risk)
- **Risk Score:** CRITICAL

## Root Cause

**External Threat:**
- C4 evaluating LegacySIEM for observability consolidation
- Decision timeline: Q1 2026
- Competitive pressure amplified by budget constraints

**Internal Weakness:**
- Performance issues with log ingestion pipeline
- Customer complaints documented in support cases
- No mitigation plan in place

## Mitigation Plan

### Immediate Actions

1. **CI Agent: Generate battlecard and positioning**
   - Owner: CI Agent
   - Deadline: 2026-01-15
   - Status: pending

2. **SA Agent: Prioritize technical gap resolution**
   - Owner: SA Agent
   - Deadline: 2026-01-20
   - Status: pending

3. **Engage specialist for performance tuning**
   - Owner: SA Agent
   - Deadline: 2026-01-17
   - Status: pending

4. **Schedule customer meeting to address concerns**
   - Owner: AE Agent
   - Deadline: 2026-01-19
   - Status: pending

### Success Criteria

- Performance issues resolved (< 2 second query response time)
- Competitive positioning document delivered to customer
- Customer confirms platform remains in consideration

## Evidence

### Competitive Threat

**Source:** InfoHub/competitive/c4/legacysiem_evaluation.md
**Date:** 2025-12-18
**Excerpt:** "C4 IT evaluating LegacySIEM for observability consolidation. Decision expected Q1 2026."
**Confidence:** HIGH

### Technical Weakness

**Source:** InfoHub/support/c4/case_history.md
**Date:** 2025-12-20
**Excerpt:** "Customer reports log ingestion pipeline frequently exceeds 5 second latency SLA."
**Confidence:** HIGH

### Performance Complaints

**Source:** daily_notes/2025-12-15.md
**Date:** 2025-12-15
**Excerpt:** "IT Manager frustrated with query performance, mentioned 'LegacySIEM didn't have these issues.'"
**Confidence:** MEDIUM

## Decision Logic Fired

**Rule ID:** competitive_technical_risk
**Condition:** `$.swot.threats.items[?(@.category=='competitive')].length > 0 AND $.swot.weaknesses.items[?(@.category=='technical')].length > 0`
**Evaluation:** TRUE (1 competitive threat, 1 technical weakness)

## Related Objects

- **Decision:** [Defensive Posture Required](../decisions/defensive_posture_c4.md)
- **Analysis:** [SWOT Analysis](../analysis/swot_c4_2026-01-12.md)

---

*Generated by SA Agent via SWOT Analysis Playbook (PB_201 v2.0)*
*Run ID: 2026-01-12_143022_PB_201_c4*
```

#### Gap Object (for validation playbooks)

**Path:** `outputs/gaps/missing_h2_opportunities_c4.md`

```markdown
---
object_type: gap
object_id: missing_h2_opportunities_c4_2026-01-12
run_id: 2026-01-12_143022_PB_002_c4
playbook_id: PB_002
client_id: c4
created: 2026-01-12T15:45:12Z
severity: MEDIUM
status: open
owner: AE
---

# Gap: Missing H2 Opportunities

## Description

No Horizon 2 expansion opportunities documented in account plan. Account lacks pipeline beyond current products (H1), creating revenue growth risk.

## Framework Validation Failed

**Framework:** Ansoff Matrix (PB_002)
**Check:** Horizon 2 pipeline > ${minimum_h2_pipeline}
**Expected:** > $500,000
**Actual:** $0

## Impact

- **Revenue Risk:** No growth pipeline beyond renewals
- **Strategic Risk:** Account stagnation, vulnerable to competitive displacement
- **Opportunity Cost:** Missing expansion potential in existing relationship

## Required Actions

1. **Conduct discovery for H2 opportunities**
   - Owner: AE Agent + SA Agent
   - Action: Schedule discovery workshop with customer stakeholders
   - Deadline: 2026-02-01

2. **Identify expansion use cases**
   - Owner: SA Agent
   - Action: Map customer IT initiatives to platform capabilities
   - Deadline: 2026-02-15

3. **Quantify pipeline value**
   - Owner: AE Agent
   - Action: Estimate ARR potential for top 3 opportunities
   - Deadline: 2026-02-20

## Evidence

### Missing H2 Data

**Source:** InfoHub/strategy/c4_three_horizons.md
**Date:** 2025-12-10
**Excerpt:** "Horizon 2 section empty. No expansion opportunities identified."
**Confidence:** HIGH

### Account Plan Gap

**Source:** InfoHub/clients/c4/account_plan.md
**Date:** 2025-11-15
**Excerpt:** "Growth strategy: Focus on renewal and adoption of existing products."
**Confidence:** HIGH

## Related Artifacts

- **Analysis:** Three Horizons Analysis (last run: 2025-12-10)
- **Account Plan:** InfoHub/clients/c4/account_plan.md

---

*Generated by AE Agent via Ansoff Matrix Validation Playbook (PB_002 v1.0)*
*Run ID: 2026-01-12_154512_PB_002_c4*
```

## Output Promotion Workflow

Outputs generated in `runs/<run_id>/outputs/` are reviewed by humans before promotion to InfoHub.

### Promotion Process

1. **Human reviews** output in run directory
2. **Human approves** (or rejects with feedback)
3. **Agent promotes** approved artifact to InfoHub
4. **Agent updates** frontmatter with promotion metadata

### Promoted Object Example

After promotion, object moves to InfoHub with updated frontmatter:

**Path:** `InfoHub/decisions/defensive_posture_c4.md`

```yaml
---
object_type: decision
object_id: defensive_posture_c4_2026-01-12
run_id: 2026-01-12_143022_PB_201_c4
playbook_id: PB_201
client_id: c4
created: 2026-01-12T14:30:32Z
promoted: 2026-01-12T16:45:00Z  # ← Added
promoted_by: human_reviewer       # ← Added
severity: HIGH
status: approved                  # ← Changed from pending_review
# ... rest of frontmatter
---
```

## Validation Playbook Outputs

Validation playbooks produce **gap objects** instead of analysis artifacts.

**Key difference:**
- **Generative playbooks** (SWOT): Create `analysis/` outputs
- **Validation playbooks** (Ansoff Matrix): Create `gaps/` outputs

Example run structure for validation playbook:

```
runs/2026-01-12_154512_PB_002_c4/
├── metadata.yaml
├── trace.json
├── report.md
└── outputs/
    └── gaps/
        ├── missing_h2_opportunities_c4.md
        ├── unbalanced_portfolio_c4.md
        └── no_diversification_strategy_c4.md
```

## Integration with InfoHub

### Current State vs Run History

```
InfoHub/                              # Current approved state
├── clients/c4/
│   ├── overview.md                   # Latest approved version
│   └── installed_base.md
├── strategy/
│   └── swot_c4.md                    # Promoted from run
├── decisions/
│   └── defensive_posture_c4.md       # Promoted from run
└── risks/
    └── competitive_technical_risk_c4.md  # Promoted from run

runs/                                 # Execution history
├── 2026-01-12_143022_PB_201_c4/      # SWOT run
│   └── outputs/...
├── 2026-01-12_154512_PB_002_c4/      # Ansoff run
│   └── outputs/...
└── 2026-01-11_091533_PB_201_c4/      # Previous SWOT run
    └── outputs/...
```

### Querying Run History

```bash
# Find all runs for client C4
ls runs/ | grep _c4

# Find all SWOT runs
ls runs/ | grep _PB_201_

# Find runs in date range
ls runs/ | grep "^2026-01-1[0-2]"

# Compare two SWOT runs
diff runs/2026-01-11_091533_PB_201_c4/report.md \
     runs/2026-01-12_143022_PB_201_c4/report.md
```

## Error Handling

### Failed Run Structure

```
runs/2026-01-12_160022_PB_201_c4/
├── metadata.yaml              # status: failed
├── trace.json                 # execution_summary.status: failed
├── report.md                  # Shows error details
└── error.log                  # ← Full error trace
```

**metadata.yaml for failed run:**

```yaml
status: "failed"
errors:
  - timestamp: "2026-01-12T16:00:45.200Z"
    step: "validate_evidence"
    error_type: "EvidenceValidationError"
    message: "Item 'Performance issues' lacks evidence field"
    details:
      item_index: 2
      item_description: "Performance issues"
      validation_errors:
        - "weaknesses[1] ('Performance issues') lacks evidence field"
```

### Partial Run Structure

When some outputs succeed but others fail:

```yaml
status: "partial"
outputs_generated:
  - type: "analysis"
    path: "outputs/analysis/swot_c4_2026-01-12.md"
    status: "created"
  - type: "decision"
    path: "outputs/decisions/defensive_posture_c4.md"
    status: "failed"
    error: "Evidence validation failed"
```

## Summary

**Contract guarantees:**
1. ✅ **Deterministic paths**: Run ID format ensures uniqueness and sortability
2. ✅ **Complete audit trail**: metadata.yaml + trace.json + report.md
3. ✅ **Atomic runs**: All outputs grouped in single directory
4. ✅ **Human review**: Explicit promotion step before InfoHub update
5. ✅ **Debuggability**: Trace shows exactly what conditions fired and why
6. ✅ **Testability**: Can compare run outputs byte-for-byte in tests

**Next step:** Integration test that loads SWOT v2, executes against realistic context, and validates output contract.
