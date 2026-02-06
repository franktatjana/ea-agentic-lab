# Playbook Execution Specification
# Machine-readable playbook definition

**Date:** 2026-01-11 (Updated: 2026-01-14)
**Status:** DRAFT - Defines how agents execute playbooks

---

## Playbook Categories

The system uses two distinct playbook categories:

### Strategic Assessment Playbooks

**Purpose:** Governance choreography for humans. Holistic synthesis.

**Characteristics:**
- Serve humans first, agents second
- Value is end-to-end closure, not individual steps
- Require holistic synthesis across multiple inputs
- Updateable based on context changes (customer or internal)
- Blueprint-like by nature

**Location:** `playbooks/executable/`

**Examples:**
- PB_001: Three Horizons Analysis
- PB_101: TOGAF ADM
- PB_201: SWOT Analysis
- PB_301: Value Engineering
- PB_401: Customer Health Score
- PB_701: Porter's Five Forces

### Operational Playbooks

**Purpose:** Event-driven tactical procedures. Discrete artifacts.

**Characteristics:**
- Triggered by events, signals, or thresholds
- Can run partially or repeatedly
- Produce clear artifacts or actions
- No holistic synthesis required
- Machine-executable, atomic steps

**Location:** `playbooks/operational/`

**Schema:** See [operational-playbook-spec.md](operational-playbook-spec.md)

**Examples:**
- OP_RSK_001: Register New Risk
- OP_ACT_001: Create Action Item
- OP_ESC_001: Escalate Blocked Action
- OP_MTG_001: Process Meeting Notes
- OP_HLT_001: Health Score Alert

### Relationship Between Categories

```
Strategic Assessment Playbook
         │
         │ may trigger (event/threshold)
         ▼
Operational Playbook(s)
         │
         │ produces
         ▼
    InfoHub Artifacts
```

---

## Problem Statement

Current playbooks contain:
- Pseudo-conditions that look executable but aren't (`horizon_1_risks[severity=HIGH].count > 0`)
- Hard-coded thresholds scattered across files (`ARR > $500K`, `ROI >= 300%`)
- Inconsistent schema field names (`calculation_formula` vs `calculation_formulas`)
- No standard for evidence citation
- Unclear agent role mapping

**This specification defines the execution model.**

---

## 1. Decision Logic Language (DLL)

### Syntax Definition

Decision logic uses **JSONPath queries** + **Python comparison operators** evaluated against InfoHub data.

```yaml
# SYNTAX
condition: "<jsonpath_expression> <operator> <value>"

# OPERATORS
<, >, <=, >=, ==, !=  # Comparison
AND, OR, NOT          # Logical
IN, NOT IN            # Membership
EXISTS, NOT EXISTS    # Presence check

# JSONPATH
$.risks[?(@.severity=='HIGH')].length  # Count high-severity risks
$.horizon_1.arr_value                   # Access nested field
$.opportunities[*].estimated_arr        # Array of all opportunity values
```

### Evaluation Engine

```python
# core/playbook_engine/decision_evaluator.py

class DecisionEvaluator:
    def evaluate_condition(self, condition: str, infohub_data: dict) -> bool:
        """
        Evaluate playbook condition against InfoHub data.

        Args:
            condition: "$.risks[?(@.severity=='HIGH')].length > 0"
            infohub_data: Parsed InfoHub artifacts as dict

        Returns:
            True if condition met, False otherwise
        """
        # 1. Parse condition into: <jsonpath> <operator> <value>
        jsonpath_expr, operator, threshold = self._parse_condition(condition)

        # 2. Execute JSONPath against infohub_data
        result = jsonpath.parse(jsonpath_expr).find(infohub_data)

        # 3. Apply operator
        return self._apply_operator(result, operator, threshold)
```

### Standard Condition Patterns

```yaml
# EXISTS check
condition: "$.horizon_2.opportunities EXISTS"
evaluation: "Check if InfoHub path exists"

# COUNT check
condition: "$.risks[?(@.severity=='HIGH')].length >= 2"
evaluation: "Count array elements matching filter"

# THRESHOLD check
condition: "$.horizon_1.arr_percentage > 0.80"
evaluation: "Compare numeric value to threshold"

# CONTAINS check
condition: "'qdrant' IN $.competitive.competitors[*].name.lower()"
evaluation: "Check if value in array"

# MISSING check
condition: "$.swot.strengths.count == 0"
evaluation: "Detect empty or missing data"
```

### InfoHub Data Structure

```json
{
  "client_id": "c4",
  "horizon_1": {
    "arr_value": 720000,
    "arr_percentage": 0.65,
    "risks": [
      {"severity": "HIGH", "description": "Qdrant evaluation"}
    ]
  },
  "horizon_2": {
    "opportunities": [
      {"name": "GenAI search", "estimated_arr": 550000}
    ],
    "pipeline_total": 1200000
  },
  "risks": [
    {"severity": "HIGH", "category": "competitive"},
    {"severity": "MEDIUM", "category": "technical"}
  ],
  "swot": {
    "strengths": {"count": 3, "items": [...]},
    "weaknesses": {"count": 2, "items": [...]}
  }
}
```

---

## 2. Configurable Thresholds

### Threshold Configuration File

```yaml
# config/playbook_thresholds.yaml

global_thresholds:
  minimum_account_arr: 500000  # $500K
  strategic_account_arr: 2000000  # $2M
  early_stage_days: 90
  renewal_warning_days: 90

playbook_thresholds:
  PB_001_three_horizons:
    horizon_1_concentration_max: 0.80  # H1 should be < 80% of total
    horizon_2_pipeline_min: 500000     # H2 >= $500K
    account_minimum_arr: 500000        # Skip if < $500K

  PB_301_value_engineering:
    strong_roi_threshold: 3.0          # 300% ROI
    acceptable_roi_threshold: 2.0      # 200% ROI
    max_payback_months: 24
    strategic_deal_arr: 2000000

  PB_401_customer_health:
    health_score_red: 50               # < 50 = RED
    health_score_yellow: 70            # 50-70 = YELLOW
    health_score_green: 70             # >= 70 = GREEN
    usage_decline_threshold: -0.15     # -15% = warning
    renewal_warning_days: 90

  PB_101_togaf_adm:
    # No numeric thresholds (qualitative framework)

  PB_701_five_forces:
    # No numeric thresholds (qualitative framework)
```

### Threshold Access in Playbooks

```yaml
# BEFORE (hard-coded)
condition: "horizon_1_arr / total_arr > 0.80"

# AFTER (config-driven)
condition: "$.horizon_1.arr_percentage > ${thresholds.horizon_1_concentration_max}"
threshold_ref: "playbook_thresholds.PB_001_three_horizons.horizon_1_concentration_max"
```

### Threshold Loader

```python
# core/playbook_engine/threshold_manager.py

class ThresholdManager:
    def __init__(self, config_path: str):
        self.thresholds = yaml.safe_load(open(config_path))

    def get(self, playbook_id: str, threshold_key: str) -> Any:
        """Get threshold value for playbook."""
        return self.thresholds['playbook_thresholds'][playbook_id][threshold_key]

    def substitute(self, condition: str, playbook_id: str) -> str:
        """Replace ${thresholds.key} placeholders in conditions."""
        # Example: "${thresholds.strong_roi_threshold}" → "3.0"
        pass
```

---

## 3. Standardized Schema

### Field Name Conventions

```yaml
# STANDARDIZE (singular vs plural)
calculation_formula:   # WRONG
calculation_formulas:  # CORRECT (always plural for lists)

# STANDARDIZE (optional sections)
adr_conventions:       # Optional, only if framework-specific
framework_reference:   # Required, always present

# STANDARDIZE (metadata)
last_updated: "YYYY-MM-DD"  # Required
version: "X.Y"              # Required
status: "production_ready"  # Required
```

### Required Schema Blocks (All Playbooks)

```yaml
# MANDATORY BLOCKS
framework_name: string
framework_source: string
playbook_mode: "VALIDATION" | "GENERATIVE"
intended_agent_role: string
primary_objective: string
validation_frequency: string  # For validation playbooks
trigger_conditions: object    # For generative playbooks

validation_criteria: object   # For validation
gap_detection: array          # For validation
decision_logic: array         # For generative

validation_inputs: object
validation_outputs: object
validation_checks: object

framework_reference: object   # Always include

# METADATA
last_updated: "YYYY-MM-DD"
version: "X.Y"
status: string
```

### Optional Schema Blocks

```yaml
# OPTIONAL (framework-specific)
calculation_formulas: object  # Only if quantitative framework
adr_conventions: object       # Only for ADR playbooks
health_score_calculation: object  # Only for health score
```

---

## 4. Evidence Citation Standard

### Evidence Object Schema

```yaml
evidence_schema:
  source_artifact: "string (InfoHub path or external reference)"
  date: "YYYY-MM-DD"
  excerpt: "string (verbatim quote or data point)"
  confidence: "HIGH|MEDIUM|LOW"

# EXAMPLE
strengths:
  - description: "Strong technical relationship with CTO"
    evidence:
      - source_artifact: "InfoHub/stakeholders/c4/relationship_map.md"
        date: "2025-12-15"
        excerpt: "Monthly technical sync with CTO Andreas"
        confidence: "HIGH"
      - source_artifact: "daily_notes/2025-12-20.md"
        date: "2025-12-20"
        excerpt: "CTO praised platform performance in meeting"
        confidence: "HIGH"
```

### All Output Objects Require Evidence

```yaml
# SWOT Analysis
swot:
  strengths:
    - category: "relationship"
      description: "string"
      evidence: [array of evidence objects]  # REQUIRED
      impact: "high|medium|low"

  weaknesses:
    - category: "technical"
      description: "string"
      evidence: [array of evidence objects]  # REQUIRED
      severity: "high|medium|low"

# Three Horizons
horizon_2:
  opportunities:
    - name: "string"
      estimated_arr: number
      evidence: [array of evidence objects]  # REQUIRED
      timeline: "string"

# Decision Objects
decisions:
  - title: "string"
    decision: "string"
    evidence: [array of evidence objects]  # REQUIRED
    rationale: "string"
```

### Evidence Validation

```python
# core/playbook_engine/evidence_validator.py

class EvidenceValidator:
    def validate_output(self, output: dict) -> List[str]:
        """
        Validate all output objects have evidence.

        Returns:
            List of validation errors (empty if valid)
        """
        errors = []

        # Check all strengths, weaknesses, opportunities, threats
        for category in ['strengths', 'weaknesses', 'opportunities', 'threats']:
            if category in output:
                for item in output[category]:
                    if 'evidence' not in item or len(item['evidence']) == 0:
                        errors.append(f"{category} item '{item['description']}' lacks evidence")

        return errors
```

---

## 5. Agent Role Mapping

### Agent System Role Matrix

```yaml
# config/agent_role_mapping.yaml

agents:
  ae_agent:
    primary_roles: ["commercial", "account_strategy", "growth_planning"]
    playbooks_owned: ["PB_001", "PB_002", "PB_003", "PB_005", "PB_006", "PB_007", "PB_008", "PB_301"]
    playbooks_contribute_to: ["PB_201", "PB_401", "PB_701"]
    functions: ["exec_sponsor_coordination", "stakeholder_management"]

  sa_agent:
    primary_roles: ["technical", "architecture", "risk_management"]
    playbooks_owned: ["PB_101", "PB_201", "PB_202", "PB_203", "PB_204", "PB_205", "PB_206", "PB_207"]
    playbooks_contribute_to: ["PB_001", "PB_301", "PB_701"]

  specialist_agent:
    primary_roles: ["deep_technical", "domain_expertise"]
    playbooks_owned: []
    playbooks_contribute_to: ["PB_101", "PB_201", "PB_701"]

  pm_agent:
    primary_roles: ["product_roadmap", "feature_gaps"]
    playbooks_owned: []
    playbooks_contribute_to: ["PB_001", "PB_201", "PB_203"]

  ci_agent:
    primary_roles: ["competitive_intelligence", "market_analysis"]
    playbooks_owned: ["PB_701"]
    playbooks_contribute_to: ["PB_001", "PB_201", "PB_005"]

  delivery_agent:
    primary_roles: ["implementation", "project_management"]
    playbooks_owned: ["PB_401", "PB_402", "PB_403", "PB_404", "PB_405"]
    playbooks_contribute_to: ["PB_201", "PB_401"]
    functions: ["transformation_governance"]

  partner_agent:
    primary_roles: ["partner_coordination", "ecosystem"]
    playbooks_owned: []
    playbooks_contribute_to: ["PB_001", "PB_201"]

  ca_agent:
    primary_roles: ["customer_success", "adoption", "retention"]
    playbooks_owned: ["PB_401"]
    playbooks_contribute_to: ["PB_001", "PB_201"]
```

### Playbook Execution Routing

```python
# core/playbook_engine/playbook_router.py

class PlaybookRouter:
    def __init__(self, agent_role_mapping: dict):
        self.mapping = agent_role_mapping

    def get_primary_agent(self, playbook_id: str) -> str:
        """Return agent that owns this playbook."""
        for agent, config in self.mapping['agents'].items():
            if playbook_id in config['playbooks_owned']:
                return agent
        raise ValueError(f"No owner for playbook {playbook_id}")

    def get_contributing_agents(self, playbook_id: str) -> List[str]:
        """Return agents that contribute data to this playbook."""
        contributors = []
        for agent, config in self.mapping['agents'].items():
            if playbook_id in config.get('playbooks_contribute_to', []):
                contributors.append(agent)
        return contributors
```

---

## 6. Implementation Priority

### Phase 1 - Core Engine
1. Create `core/playbook_engine/` module
2. Implement `DecisionEvaluator` (JSONPath + operators)
3. Implement `ThresholdManager` (config-driven thresholds)
4. Implement `EvidenceValidator` (enforce citations)
5. Implement `PlaybookRouter` (agent role mapping)

### Phase 2 - Refactor Existing Playbooks
1. Extract all hard-coded thresholds to `config/playbook_thresholds.yaml`
2. Rewrite decision logic conditions in standard DLL syntax
3. Add `evidence: []` fields to all output schemas
4. Standardize field names (plurals, optional blocks)
5. Update `intended_agent_role` to match 24-agent system

### Phase 3 - Create Remaining Playbooks
1. Use standardized schema from Phase 2
2. All thresholds in config file
3. All conditions in DLL syntax
4. All outputs require evidence
5. Clear agent role mapping

---

## Status

- ✅ Specification defined
- ⏳ Core engine implementation (Phase 1)
- ⏳ Playbook refactoring (Phase 2)
- ⏳ Remaining playbooks (Phase 3)

**This document is the contract between playbook authors and the execution engine.**
