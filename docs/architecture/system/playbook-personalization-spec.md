# Playbook Personalization Specification

## Overview

This specification defines how users can customize playbooks without modifying base definitions. Personalization enables individuals and teams to adapt playbooks to their working style, regional requirements, or role-specific needs while maintaining a single source of truth.

---

## Architecture

### Resolution Order (Cascade)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Playbook Resolution Chain                     │
├─────────────────────────────────────────────────────────────────┤
│  Priority 1: User Override      (highest - wins conflicts)      │
│  Priority 2: Team Override      (team-level customizations)     │
│  Priority 3: Region Override    (geo/compliance requirements)   │
│  Priority 4: Base Playbook      (default - always present)      │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
domain/
└── playbooks/
    ├──            # Base playbooks (read-only for users)
    │   ├── strategy/
    │   ├── solution_architects/
    │   └── ...
    │
    └── overrides/            # NEW: Customization layer
        ├── _schema/          # Override validation schemas
        │   └── override_schema.yaml
        │
        ├── regions/          # Region-specific overrides
        │   ├── emea/
        │   │   └── PB_201_swot_analysis.override.yaml
        │   ├── apac/
        │   └── americas/
        │
        ├── teams/            # Team-level overrides
        │   ├── enterprise/
        │   ├── commercial/
        │   └── public_sector/
        │
        └── users/            # Personal overrides
            └── {user_id}/
                └── PB_201_swot_analysis.override.yaml
```

---

## Override Schema

### Base Override Structure

```yaml
# File: PB_201_swot_analysis.override.yaml
# Location: domain/playbooks/overrides/users/{user_id}/

schema_version: "1.0"
override_metadata:
  playbook_id: "PB_201_swot_analysis"
  override_type: "user"           # user | team | region
  owner: "tatjana.frank"
  created_at: "2026-02-03"
  updated_at: "2026-02-03"
  description: "Personal tweaks for enterprise strategic accounts"

# What this override modifies
applies_to:
  base_playbook: "strategy/PB_201_swot_analysis.yaml"
  version_constraint: ">=1.0"     # Compatible base versions

# The actual customizations
overrides:
  # ... (see sections below)
```

---

## Customizable Capabilities

### 1. Prompt Customization

Modify or extend prompts used in playbook steps.

```yaml
overrides:
  prompts:
    # Override existing prompt
    strengths_analysis:
      mode: "replace"             # replace | prepend | append
      content: |
        Analyze strengths with focus on:
        - Technical differentiation vs LegacySIEM
        - Cloud-native architecture advantages
        - Total cost of ownership benefits

    # Add to existing prompt
    weaknesses_analysis:
      mode: "append"
      content: |
        Additionally consider:
        - Regional competitor presence in EMEA
        - Language/localization gaps

    # Add entirely new prompt
    custom_esg_analysis:
      mode: "add"
      insert_after: "opportunities_analysis"
      content: |
        Evaluate ESG (Environmental, Social, Governance) factors:
        - Sustainability alignment with customer goals
        - Social impact considerations
        - Governance and compliance posture
```

### 2. Step Customization

Add, skip, or reorder playbook steps.

```yaml
overrides:
  steps:
    # Skip a step entirely
    - step_id: "competitor_deep_dive"
      action: "skip"
      reason: "Not relevant for greenfield accounts"

    # Add a new step
    - step_id: "regional_compliance_check"
      action: "add"
      insert_after: "initial_assessment"
      definition:
        name: "Regional Compliance Check"
        description: "Verify GDPR and regional data requirements"
        agent: "compliance_checker"
        inputs:
          - customer_region
          - data_residency_requirements
        outputs:
          - compliance_gaps
          - required_certifications

    # Modify step parameters
    - step_id: "stakeholder_mapping"
      action: "modify"
      changes:
        timeout_minutes: 30        # Override default
        retry_count: 3
        parameters:
          depth: "extended"        # More thorough analysis
```

### 3. Output Customization

Change output format, sections, or add custom fields.

```yaml
overrides:
  outputs:
    # Change output format
    format: "executive_summary"    # detailed | executive_summary | bullet_points

    # Modify sections
    sections:
      - section_id: "recommendations"
        mode: "modify"
        changes:
          max_items: 5             # Limit to top 5
          include_confidence: true

      - section_id: "technical_appendix"
        mode: "skip"
        reason: "Not needed for exec presentations"

      - section_id: "next_steps"
        mode: "add"
        template: |
          ## Recommended Next Steps
          Based on the analysis:
          {{#each recommendations}}
          - [ ] {{this.action}} (Owner: {{this.owner}}, Due: {{this.due_date}})
          {{/each}}

    # Custom fields to include
    custom_fields:
      - name: "deal_stage"
        source: "context.opportunity.stage"
      - name: "account_tier"
        source: "context.account.tier"
      - name: "regional_notes"
        type: "freetext"
        prompt: "Any region-specific considerations?"
```

### 4. Input Customization

Define additional required or optional inputs.

```yaml
overrides:
  inputs:
    # Add required inputs
    additional_required:
      - name: "customer_industry_vertical"
        type: "enum"
        options: ["financial_services", "healthcare", "retail", "manufacturing", "technology"]
        description: "Primary industry vertical for tailored analysis"

      - name: "deal_size_tier"
        type: "enum"
        options: ["strategic", "enterprise", "commercial"]
        description: "Deal size classification"

    # Add optional inputs
    additional_optional:
      - name: "previous_swot_id"
        type: "reference"
        description: "Link to previous SWOT for comparison"

      - name: "competitor_focus"
        type: "list"
        item_type: "string"
        description: "Specific competitors to analyze"
        default: ["LegacySIEM", "CloudSIEM", "ObservabilityVendorA"]

    # Override input defaults
    default_overrides:
      analysis_depth: "comprehensive"
      include_financials: true
```

### 5. Trigger Customization

Modify when playbook auto-executes.

```yaml
overrides:
  triggers:
    # Disable auto-trigger
    - trigger_id: "on_opportunity_created"
      action: "disable"

    # Add new trigger
    - trigger_id: "weekly_account_review"
      action: "add"
      definition:
        event: "scheduled"
        schedule: "0 9 * * MON"    # Every Monday 9am
        conditions:
          - "account.tier == 'strategic'"
          - "account.owner == '${user_id}'"

    # Modify trigger conditions
    - trigger_id: "on_deal_stage_change"
      action: "modify"
      conditions:
        add:
          - "deal.value >= 100000"
        remove:
          - "deal.stage == 'prospecting'"
```

### 6. Agent Customization

Override which agent executes steps or agent parameters.

```yaml
overrides:
  agents:
    # Use different agent for a step
    - step_id: "market_analysis"
      agent_override: "ci_agent_v2"    # Use newer agent

    # Modify agent parameters
    - agent_id: "sa_agent"
      parameter_overrides:
        temperature: 0.3               # More deterministic
        max_tokens: 4000
        model_preference: "claude-sonnet"

    # Add agent instructions
    - agent_id: "sa_agent"
      additional_instructions: |
        For this user's playbook executions:
        - Always include ROI calculations
        - Reference customer's public financial data
        - Use formal tone for executive stakeholders
```

### 7. Template Customization

Custom templates for outputs.

```yaml
overrides:
  templates:
    # Override output template
    report_template:
      mode: "replace"
      content: |
        # {{playbook_name}} - {{customer_name}}

        **Prepared by:** {{user_name}}
        **Date:** {{execution_date}}
        **Classification:** {{confidentiality_level}}

        ---

        ## Executive Summary
        {{executive_summary}}

        ## Key Findings
        {{#each findings}}
        ### {{this.category}}
        {{this.content}}
        {{/each}}

        ---
        *Generated via EA Agentic Lab - {{playbook_id}} v{{playbook_version}}*

    # Add custom template section
    custom_sections:
      regional_disclaimer:
        position: "footer"
        content: |
          **EMEA Compliance Notice:** This analysis complies with GDPR
          requirements. Customer data processed under DPA ref: {{dpa_reference}}.
```

---

## Examples

### Example 1: Sales Executive Personal Override

**Scenario:** AE wants MEDDPICC with shorter output and custom deal stages.

```yaml
# File: overrides/users/john.smith/PB_801_meddpicc.override.yaml

schema_version: "1.0"
override_metadata:
  playbook_id: "PB_801_meddpicc"
  override_type: "user"
  owner: "john.smith"
  description: "Streamlined MEDDPICC for quick deal reviews"

overrides:
  outputs:
    format: "bullet_points"
    sections:
      - section_id: "detailed_metrics"
        mode: "skip"
      - section_id: "action_items"
        mode: "modify"
        changes:
          max_items: 3

  prompts:
    decision_criteria:
      mode: "append"
      content: |
        Focus on:
        - Budget approval process
        - Technical validation requirements
        - Security review timeline

  inputs:
    default_overrides:
      include_competitor_analysis: false
      quick_mode: true
```

### Example 2: Team Override for Public Sector

**Scenario:** Public sector team needs compliance-focused playbooks.

```yaml
# File: overrides/teams/public_sector/PB_201_swot_analysis.override.yaml

schema_version: "1.0"
override_metadata:
  playbook_id: "PB_201_swot_analysis"
  override_type: "team"
  owner: "public_sector_team"
  description: "SWOT with FedRAMP and compliance focus"

overrides:
  inputs:
    additional_required:
      - name: "compliance_frameworks"
        type: "list"
        options: ["FedRAMP", "StateRAMP", "IL4", "IL5", "CJIS", "ITAR"]
        description: "Required compliance certifications"

  steps:
    - step_id: "compliance_gap_analysis"
      action: "add"
      insert_after: "weaknesses_analysis"
      definition:
        name: "Compliance Gap Analysis"
        description: "Assess gaps against required frameworks"
        inputs: ["compliance_frameworks", "current_certifications"]
        outputs: ["compliance_gaps", "remediation_timeline"]

  prompts:
    strengths_analysis:
      mode: "prepend"
      content: |
        IMPORTANT: For public sector analysis, prioritize:
        - FedRAMP authorization status
        - Data sovereignty capabilities
        - Government reference customers

  outputs:
    custom_fields:
      - name: "ato_pathway"
        type: "enum"
        options: ["FedRAMP_High", "FedRAMP_Moderate", "Agency_ATO", "StateRAMP"]

  templates:
    custom_sections:
      compliance_footer:
        position: "footer"
        content: |
          **Compliance Classification:** {{compliance_level}}
          **Data Handling:** CUI/FOUO as applicable
          **Distribution:** Limited to authorized personnel
```

### Example 3: Regional Override for EMEA

**Scenario:** EMEA region needs GDPR-aware playbooks.

```yaml
# File: overrides/regions/emea/PB_403_customer_journey_voc.override.yaml

schema_version: "1.0"
override_metadata:
  playbook_id: "PB_403_customer_journey_voc"
  override_type: "region"
  owner: "emea_operations"
  description: "GDPR-compliant customer journey tracking"

overrides:
  inputs:
    additional_required:
      - name: "gdpr_consent_status"
        type: "enum"
        options: ["full_consent", "limited_consent", "no_consent"]
        description: "Customer's GDPR consent level"

      - name: "data_residency"
        type: "enum"
        options: ["eu_only", "eu_uk", "global"]
        description: "Data residency requirements"

  steps:
    - step_id: "collect_sentiment"
      action: "modify"
      conditions:
        add:
          - "gdpr_consent_status != 'no_consent'"
      fallback:
        action: "skip"
        message: "Skipped due to GDPR consent limitations"

    - step_id: "gdpr_data_check"
      action: "add"
      insert_before: "journey_analysis"
      definition:
        name: "GDPR Data Verification"
        description: "Verify data processing compliance"
        outputs: ["processing_legal_basis", "retention_period"]

  prompts:
    voc_collection:
      mode: "prepend"
      content: |
        GDPR NOTICE: Only collect and process data for which we have
        documented legal basis. Do not include:
        - Personal opinions attributed to individuals without consent
        - Sensitive personal data (health, political views, etc.)
        - Data from minors without parental consent

  templates:
    custom_sections:
      gdpr_notice:
        position: "header"
        content: |
          **GDPR Compliance Notice**
          Data Controller: {vendor} Ltd
          Processing Basis: {{processing_legal_basis}}
          Retention: {{retention_period}}
          DPO Contact: dpo@{vendor}.com
```

---

## Expected Input/Output

### Input: Override Resolution Request

```json
{
  "playbook_id": "PB_201_swot_analysis",
  "execution_context": {
    "user_id": "tatjana.frank",
    "team": "enterprise",
    "region": "emea",
    "account_id": "ACME_CORP",
    "opportunity_id": "OPP-2026-001"
  },
  "runtime_inputs": {
    "customer_industry_vertical": "financial_services",
    "deal_size_tier": "strategic",
    "competitor_focus": ["LegacySIEM", "CloudSIEM"]
  }
}
```

### Output: Resolved Playbook

```json
{
  "resolved_playbook": {
    "id": "PB_201_swot_analysis",
    "version": "1.0",
    "resolved_at": "2026-02-03T14:30:00Z",

    "resolution_chain": [
      {"layer": "base", "source": "strategy/PB_201_swot_analysis.yaml"},
      {"layer": "region", "source": "overrides/regions/emea/PB_201_swot_analysis.override.yaml"},
      {"layer": "team", "source": "overrides/teams/enterprise/PB_201_swot_analysis.override.yaml"},
      {"layer": "user", "source": "overrides/users/tatjana.frank/PB_201_swot_analysis.override.yaml"}
    ],

    "merged_config": {
      "steps": ["...merged steps..."],
      "prompts": {"...merged prompts..."},
      "inputs": {"...merged inputs with defaults..."},
      "outputs": {"...merged output config..."}
    },

    "validation": {
      "status": "valid",
      "warnings": [
        "User override skips 'competitor_deep_dive' step"
      ]
    }
  }
}
```

### Output: Playbook Execution Result

```json
{
  "execution_id": "exec-2026-02-03-143000-swot",
  "playbook_id": "PB_201_swot_analysis",
  "status": "completed",

  "applied_overrides": {
    "region": "emea",
    "team": "enterprise",
    "user": "tatjana.frank",
    "total_customizations": 12
  },

  "outputs": {
    "format": "executive_summary",
    "sections": {
      "strengths": "...",
      "weaknesses": "...",
      "opportunities": "...",
      "threats": "...",
      "esg_analysis": "...",         // Added by user override
      "compliance_notice": "..."      // Added by region override
    },
    "custom_fields": {
      "deal_stage": "technical_validation",
      "account_tier": "strategic",
      "gdpr_consent_status": "full_consent"
    }
  },

  "artifacts": {
    "report_path": "vault/ACME_CORP/SECURITY_CONSOLIDATION/internal-infohub/frameworks/SWOT_2026-02-03.md",
    "data_path": "vault/ACME_CORP/SECURITY_CONSOLIDATION/internal-infohub/frameworks/SWOT_2026-02-03.yaml"
  }
}
```

---

## Implementation Requirements

### 1. Override Loader Service

```python
class PlaybookOverrideLoader:
    """
    Loads and merges playbook overrides in priority order.
    """

    def resolve_playbook(
        self,
        playbook_id: str,
        user_id: str,
        team: str,
        region: str
    ) -> ResolvedPlaybook:
        """
        Resolution order:
        1. Load base playbook
        2. Apply region override (if exists)
        3. Apply team override (if exists)
        4. Apply user override (if exists)
        5. Validate merged result
        6. Return resolved playbook
        """
        pass
```

### 2. Override Validator

```python
class OverrideValidator:
    """
    Validates override files against schema and base playbook.
    """

    def validate(self, override: dict, base_playbook: dict) -> ValidationResult:
        """
        Checks:
        - Schema compliance
        - Referenced step_ids exist in base
        - No circular dependencies
        - Required fields present
        - Type compatibility
        """
        pass
```

### 3. Merge Strategy

```python
class PlaybookMerger:
    """
    Deep merges playbook configurations with conflict resolution.
    """

    MERGE_STRATEGIES = {
        "prompts": "deep_merge",      # Combine by mode (replace/append/prepend)
        "steps": "ordered_merge",     # Respect insert_before/after
        "inputs": "extend",           # Add new, override defaults
        "outputs": "deep_merge",      # Combine sections
        "triggers": "list_merge",     # Combine trigger lists
    }
```

### 4. Required Infrastructure

| Component | Purpose | Priority |
|-----------|---------|----------|
| Override file storage | Store user/team/region overrides | P0 |
| User identity service | Know current user context | P0 |
| Override validation API | Validate before save | P0 |
| Merge engine | Combine base + overrides | P0 |
| Override UI | Create/edit overrides | P1 |
| Override versioning | Track override history | P1 |
| Override sharing | Share overrides between users | P2 |
| Override analytics | Usage and effectiveness | P2 |

---

## Security Considerations

1. **Permission model**: Users can only create personal overrides; team overrides require team lead approval
2. **Validation**: All overrides validated against schema before activation
3. **Audit trail**: Log all override changes with user attribution
4. **Rollback**: Easy revert to previous override version
5. **Isolation**: User overrides cannot affect other users' executions

---

## Migration Path

### Phase 1: Foundation
- [ ] Create `overrides/` folder structure
- [ ] Define override schema v1.0
- [ ] Implement override loader
- [ ] Implement merge engine

### Phase 2: User Overrides
- [ ] Personal override storage
- [ ] Simple override creation (YAML files)
- [ ] Override validation

### Phase 3: Team & Region
- [ ] Team override support
- [ ] Region override support
- [ ] Approval workflows

### Phase 4: UI & Analytics
- [ ] Override editor UI
- [ ] Override templates/presets
- [ ] Usage analytics

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-03 | Initial specification |
