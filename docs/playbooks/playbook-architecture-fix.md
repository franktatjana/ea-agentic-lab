# Playbook Architecture Fix - Making Playbooks Executable

**Date:** 2026-01-11
**Issue:** Playbooks looked executable but weren't machine-readable

---

## Problems Identified

### 1. Undefined Decision Logic Language ❌

**Problem:** Conditions like `horizon_1_risks[severity=HIGH].count > 0` appeared executable but syntax was undefined.

**Fixed:** ✅

- Created [playbook-execution-specification.md](playbook-execution-specification.md)
- Defined Decision Logic Language (DLL): JSONPath + Python operators
- Specified evaluation engine interface
- Provided standard condition patterns

**Example:**

```yaml
# BEFORE (ambiguous)
condition: "horizon_1_risks[severity=HIGH].count > 0"

# AFTER (executable JSONPath)
condition: "$.risks[?(@.severity=='HIGH')].length > 0"
jsonpath: "$.risks[?(@.severity=='HIGH')].length"
operator: ">"
threshold: 0
```

---

### 2. Hard-Coded Thresholds ❌

**Problem:** Values like `ARR > $500K`, `ROI >= 300%`, `renewal <= 90 days` scattered across playbooks. Changing these requires editing YAML instead of config.

**Fixed:** ✅

- Created [config/playbook_thresholds.yaml](config/playbook_thresholds.yaml)
- Extracted all numeric thresholds to centralized config
- Defined global and playbook-specific thresholds
- Threshold substitution mechanism specified

**Example:**

```yaml
# BEFORE (hard-coded in playbook)
condition: "calculated_roi >= 3.0 AND payback_period_months <= 12"

# AFTER (config-driven)
condition: "$.roi >= ${thresholds.strong_roi_percentage} AND $.payback_months <= ${thresholds.fast_payback_months}"
threshold_ref: "PB_301_value_engineering.strong_roi_percentage"  # = 3.0 in config
```

---

### 3. Naming Inconsistencies ❌

**Problem:** `calculation_formula` vs `calculation_formulas`, `adr_conventions` only in some files.

**Fixed:** ✅

- Standardized schema in playbook-execution-specification.md
- Required blocks defined (must be in all playbooks)
- Optional blocks defined (framework-specific)
- Naming conventions: plurals for lists, singular for objects

**Standard Schema:**

```yaml
# REQUIRED (all playbooks)
framework_name: string
framework_source: string
playbook_mode: "VALIDATION" | "GENERATIVE"
intended_agent_role: string
primary_objective: string
validation_criteria: object
gap_detection: array
validation_inputs: object
validation_outputs: object
validation_checks: object
framework_reference: object
last_updated: "YYYY-MM-DD"
version: "X.Y"
status: string

# OPTIONAL (framework-specific)
calculation_formulas: object        # Plural, only if quantitative
adr_conventions: object             # Only for ADR playbooks
health_score_calculation: object    # Only for health score
```

---

### 4. Evidence Not Standardized ❌

**Problem:** Playbooks say "cite sources" but no standard evidence schema defined.

**Fixed:** ✅

- Defined evidence object schema in specification
- All output objects now require `evidence: []` field
- Evidence validation mechanism specified

**Evidence Schema:**

```yaml
evidence:
  - source_artifact: "InfoHub/stakeholders/c4/relationship_map.md"
    date: "2025-12-15"
    excerpt: "Monthly technical sync with CTO Andreas"
    confidence: "HIGH"
  - source_artifact: "daily_notes/2025-12-20.md"
    date: "2025-12-20"
    excerpt: "CTO praised platform performance"
    confidence: "HIGH"
```

**All Outputs Require Evidence:**

```yaml
# SWOT
strengths:
  - description: "Strong technical relationship"
    evidence: [...]  # REQUIRED

# Three Horizons
opportunities:
  - name: "GenAI search"
    estimated_arr: 550000
    evidence: [...]  # REQUIRED

# Decisions
decisions:
  - title: "Adopt defensive strategy"
    decision: "Prioritize threat mitigation"
    evidence: [...]  # REQUIRED
```

---

### 5. Agent Role Mapping Unclear ❌

**Problem:** Different playbooks reference different agent combinations (AE/SA/PM, CA/AE/SA, CI-led) but no clear mapping to 8-agent system.

**Fixed:** ✅

- Created [config/agent_role_mapping.yaml](config/agent_role_mapping.yaml)
- Defined playbook ownership (which agent owns which playbook)
- Defined contribution matrix (which agents contribute data)
- Clarified functions vs. agents (Exec Sponsor = AE function, Transformation = Delivery function)

**Agent-Playbook Matrix:**

```yaml
agents:
  ae_agent:
    playbooks_owned: ["PB_001", "PB_002", "PB_003", "PB_301", ...]
    functions_performed: ["exec_sponsor_coordination", "stakeholder_management"]

  sa_agent:
    playbooks_owned: ["PB_101", "PB_201", "PB_202", ...]

  delivery_agent:
    playbooks_owned: ["PB_401", "PB_402", "PB_403", "PB_404", "PB_405"]
    functions_performed: ["transformation_governance", "program_management"]

playbook_routing:
  PB_001:
    owner: "ae_agent"
    contributors: ["sa_agent", "pm_agent", "ci_agent", "ca_agent"]
```

---

## Files Created

### Specifications

1. **[playbook-execution-specification.md](playbook-execution-specification.md)**
   - Decision Logic Language (DLL) syntax
   - Threshold management system
   - Standardized schema definition
   - Evidence citation standard
   - Agent role mapping

### Configuration

2. **[config/playbook_thresholds.yaml](config/playbook_thresholds.yaml)**
   - Global thresholds (ARR minimums, timeline thresholds, risk triggers)
   - Playbook-specific thresholds (PB_001 through PB_701)
   - Versioned and documented

3. **[config/agent_role_mapping.yaml](config/agent_role_mapping.yaml)**
   - 8-agent system definition
   - Playbook ownership matrix
   - Contribution matrix
   - Function-to-agent mapping

### Architecture Documentation

4. **[playbook-architecture-fix.md](playbook-architecture-fix.md)** (this file)
   - Problem summary
   - Solutions implemented
   - Remaining work

---

## Implementation Roadmap

### Phase 1 - Core Engine (Need to Build)

```
core/playbook_engine/
├── __init__.py
├── decision_evaluator.py      # JSONPath + operator evaluation
├── threshold_manager.py        # Load and substitute thresholds
├── evidence_validator.py       # Enforce evidence citations
├── playbook_router.py          # Route playbooks to agents
└── playbook_executor.py        # Orchestrate execution
```

**Status:** ⏳ Not started

### Phase 2 - Refactor Existing Playbooks (Need to Fix)

**10 Playbooks to Refactor:**

#### Generative Playbooks (6)

1. `playbooks/executable/PB_001_three_horizons.yaml`
   - Extract thresholds → `config/playbook_thresholds.yaml`
   - Rewrite conditions in DLL syntax
   - Add evidence fields to output schemas
   - Standardize field names

2. `playbooks/executable/PB_201_swot_analysis.yaml`
3. `playbooks/executable/PB_301_value_engineering.yaml`
4. `playbooks/executable/PB_701_five_forces.yaml`
5. `playbooks/executable/PB_101_togaf_adm.yaml`
6. `playbooks/executable/PB_401_customer_health_score.yaml`

#### Validation Playbooks (4)

7. `playbooks/validation/PB_002_ansoff_matrix.yaml`
8. `playbooks/validation/PB_003_bcg_matrix.yaml`
9. `playbooks/validation/PB_202_pestle_analysis.yaml`
10. `playbooks/validation/PB_301_stakeholder_mapping.yaml`

**Status:** ⏳ Not started

### Phase 3 - Create Remaining 21 Playbooks (Use Standard)

All new playbooks will:

- Use standardized schema
- Reference thresholds from config
- Write conditions in DLL syntax
- Require evidence for all outputs
- Map to 8-agent system clearly

**Status:** ⏳ Not started (waiting for Phase 2 completion)

---

## What Changed

### Before (Not Executable)

```yaml
# Playbook had pseudo-code that looked executable but wasn't
decision_logic:
  - condition: "horizon_1_arr / total_arr > 0.80"  # Undefined syntax
    decision: "Focus on H2 expansion"
    threshold: 500000  # Hard-coded, can't change without editing YAML
```

### After (Executable)

```yaml
# Playbook references config and uses defined language
decision_logic:
  - condition: "$.horizon_1.arr_percentage > ${thresholds.horizon_1_concentration_max}"
    jsonpath: "$.horizon_1.arr_percentage"
    operator: ">"
    threshold_ref: "PB_001_three_horizons.horizon_1_concentration_max"  # From config
    decision: "Focus on H2 expansion"
    evidence_required: true
```

**Config file:**

```yaml
# config/playbook_thresholds.yaml
PB_001_three_horizons:
  horizon_1_concentration_max: 0.80  # Change here, not in playbook YAML
```

---

## Benefits of This Fix

### 1. Machine-Executable

- Decision conditions can be evaluated by code
- No ambiguity about what conditions mean
- Automation possible

### 2. Maintainable

- Thresholds in one place, not scattered across 25+ files
- Change threshold once, applies to all playbooks
- Versioned thresholds for A/B testing

### 3. Traceable

- Every output has evidence linking back to source
- No "trust me" outputs
- Audit trail for all assessments

### 4. Clear Ownership

- Every playbook has one owner agent
- Contributors clearly defined
- No ambiguity about who executes what

### 5. Standardized

- All playbooks follow same schema
- Consistent field names
- Programmatic validation possible

---

## Status Summary

✅ **Completed:**

- Execution specification defined
- Threshold configuration created
- Agent role mapping created
- Architecture problems identified and solved conceptually

⏳ **Remaining:**

- Implement playbook execution engine (Phase 1)
- Refactor 10 existing playbooks (Phase 2)
- Create 21 remaining playbooks using standards (Phase 3)

---

## Next Action

**User Decision Required:**

1. **Proceed with Phase 1 (Build Engine)?**
   - Implement `core/playbook_engine/` module
   - Create DecisionEvaluator, ThresholdManager, EvidenceValidator

2. **Or Proceed with Phase 2 (Refactor Playbooks)?**
   - Fix existing 10 playbooks to match new standard
   - Validate they're machine-readable

3. **Or Proceed with Phase 3 (Complete 21 Playbooks)?**
   - Create remaining validation playbooks
   - Use standardized format from start

**Recommendation:** Phase 2 first (refactor existing), then Phase 3 (create remaining), then Phase 1 (build engine). This ensures all playbooks follow the standard before implementing the engine.
