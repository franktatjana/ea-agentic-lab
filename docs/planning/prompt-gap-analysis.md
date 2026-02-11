# Prompt Gap Analysis

**Date:** 2026-01-22
**Purpose:** Compare existing agent prompts against adopted best practices

---

## Summary

**Analyzed:** 26 agent configs, 25 personality files
**Best Practices Sources:**

- `domain/prompts/prompt_engineering.yaml` (technique mappings)
- `domain/playbooks/templates/agent_prompt_template.yaml` (template structure)
- `docs/architecture/system/prompt-engineering-principles.md` (technique details)

### Overall Findings

| Category | Current State | Gap Severity |
|----------|---------------|--------------|
| Technique Instructions | Not implemented | **High** |
| Few-Shot Examples | Not implemented | **High** |
| Self-Consistency | Not implemented | **Medium** |
| Output Format Schemas | Partial | **Medium** |
| Error Handling Templates | Not implemented | **Medium** |
| Confidence Guidelines | Not implemented | **Medium** |
| Scope Boundaries | Well implemented | Low |
| Anti-Hallucination | Well implemented | Low |

---

## Detailed Gap Analysis by Agent

### 1. SA Agent (Solution Architect)

**Config:** `config/prompt_engineering.yaml` specifies:
```yaml
sa_agent:
  primary: react
  secondary: [cot, tot]
  use_cases:
    technical_analysis: [cot]
    architecture_review: [cot, tot]
    risk_assessment: [cot, self_consistency]
    poc_support: [react]
```

**Current State (domain/agents/solution_architects/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| ReAct format instructions | ❌ Missing | No Thought/Action/Observation format |
| CoT trigger phrases | ❌ Missing | No step-by-step prompting |
| Tree of Thoughts template | ❌ Missing | No branching exploration |
| Few-shot examples | ❌ Missing | No example inputs/outputs |
| Self-consistency for risk assessment | ❌ Missing | Single path only |
| Output format schemas | ⚠️ Partial | Has structure but not YAML schema |
| Confidence guidelines | ❌ Missing | No 0-100% scale calibration |
| Error handling templates | ❌ Missing | No insufficient_evidence pattern |
| Scope boundaries | ✅ Good | Well-defined what_i_do/what_i_do_not_do |
| Anti-hallucination | ✅ Good | Strong safeguards |

---

### 2. Risk Radar Agent

**Config specifies:**
```yaml
risk_radar_agent:
  primary: few_shot
  secondary: [cot]
  self_consistency:
    enabled: true
    paths: 3
  use_cases:
    risk_classification: [few_shot, self_consistency]
    severity_assessment: [cot, self_consistency]
```

**Current State (domain/agents/governance/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| Few-shot examples | ❌ Missing | **Critical** - Primary technique not implemented |
| Self-consistency (3 paths) | ❌ Missing | No multiple reasoning paths |
| CoT severity assessment | ❌ Missing | No step-by-step for severity |
| Risk classification examples | ❌ Missing | No input→output examples |
| Confidence voting | ❌ Missing | No majority vote aggregation |
| Output format schemas | ⚠️ Partial | Has fields but not formal schema |
| Error handling | ❌ Missing | No conflicting_evidence pattern |
| Scope boundaries | ✅ Good | Clear what_i_do/what_i_do_not_do |

---

### 3. VE Agent (Value Engineering)

**Config specifies:**
```yaml
ve_agent:
  primary: cot
  secondary: [react]
  self_consistency:
    enabled: true
    paths: 3
  use_cases:
    roi_calculation: [cot, self_consistency]
    value_hypothesis: [cot]
    tco_analysis: [cot, react]
```

**Current State (domain/agents/value_engineering/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| CoT trigger phrases | ❌ Missing | No "Let's think step by step" |
| Self-consistency for ROI | ❌ Missing | Should use 3 paths for ROI calculations |
| ReAct for TCO analysis | ❌ Missing | No tool-use interleaving |
| Few-shot examples | ❌ Missing | No ROI calculation examples |
| Confidence calibration | ❌ Missing | No uncertainty handling |
| Output format schemas | ⚠️ Partial | Has frameworks but not output schema |
| Error handling | ❌ Missing | No conflicting_evidence pattern |

---

### 4. Retrospective Agent

**Config specifies:**
```yaml
retrospective_agent:
  primary: reflexion
  secondary: [cot]
  memory_enabled: true
  use_cases:
    win_loss_analysis: [reflexion, cot]
    pattern_extraction: [cot]
    lesson_generation: [reflexion]
```

**Current State (domain/agents/retrospective/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| Reflexion technique | ❌ Missing | **Critical** - Primary technique not implemented |
| Memory storage path | ❌ Missing | No reflection storage defined |
| CoT for pattern extraction | ❌ Missing | No step-by-step |
| Reflexion format | ❌ Missing | No "What worked/What to improve/Future guidance" |
| Few-shot examples | ❌ Missing | No retrospective examples |
| Output format schemas | ⚠️ Partial | Has framework but not reflexion output |

---

### 5. AE Agent (Account Executive)

**Config specifies:**
```yaml
ae_agent:
  primary: react
  secondary: [cot, tot]
  use_cases:
    account_strategy: [cot, tot]
    stakeholder_analysis: [react]
    opportunity_qualification: [cot, self_consistency]
```

**Current State (domain/agents/account_executives/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| ReAct format | ❌ Missing | No Thought/Action/Observation |
| CoT for strategy | ❌ Missing | No step-by-step |
| ToT for strategy | ❌ Missing | No branching exploration |
| Self-consistency for qualification | ❌ Missing | Single path only |
| Few-shot examples | ❌ Missing | No examples provided |
| Output format schemas | ❌ Missing | Very minimal output spec |

---

### 6. CA Agent (Customer Architect)

**Config specifies:**
```yaml
ca_agent:
  primary: cot
  secondary: [react, few_shot]
  self_consistency:
    enabled: true
    paths: 3
  use_cases:
    adoption_assessment: [cot]
    health_evaluation: [cot, self_consistency]
    success_planning: [cot, prompt_chaining]
```

**Current State (domain/agents/customer_architects/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| CoT trigger phrases | ❌ Missing | No step-by-step prompting |
| Self-consistency for health | ❌ Missing | Should use 3 paths |
| Prompt chaining for planning | ❌ Missing | No stage definitions |
| Few-shot examples | ❌ Missing | No examples |
| Output format schemas | ❌ Missing | Minimal output spec |

---

### 7. Meeting Notes Agent

**Config specifies:**
```yaml
meeting_notes_agent:
  primary: few_shot
  secondary: [cot]
  use_cases:
    note_extraction: [few_shot]
    action_identification: [cot]
    risk_signal_detection: [cot]
```

**Current State (domain/agents/governance/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| Few-shot examples | ❌ Missing | **Critical** - No extraction examples |
| CoT for action identification | ❌ Missing | No step-by-step |
| Output format templates | ✅ Good | Has ultra_lean, micro_summary formats |
| Extraction rules | ✅ Good | Well-defined decision/action formats |
| Quality gates | ✅ Good | Clear validation rules |

---

### 8. CI Agent (Competitive Intelligence)

**Config specifies:**
```yaml
ci_agent:
  primary: react
  secondary: [cot]
  use_cases:
    competitive_analysis: [cot]
    market_research: [react]
    battlecard_generation: [cot, few_shot]
```

**Current State (domain/agents/competitive_intelligence/):**

| Required Element | Status | Notes |
|-----------------|--------|-------|
| ReAct for research | ❌ Missing | No Thought/Action/Observation |
| CoT for analysis | ❌ Missing | No step-by-step |
| Few-shot for battlecards | ❌ Missing | No battlecard examples |

---

## What's Working Well

### Consistently Good Patterns

1. **Scope Boundaries** - Most agents have clear `what_i_do` / `what_i_do_not_do`
2. **Anti-Hallucination Safeguards** - SA, Risk Radar have strong guardrails
3. **Signal Detection** - SA has good keyword/pattern detection
4. **Quality Gates** - Meeting Notes has excellent validation rules
5. **Output Formats** - Meeting Notes has well-structured templates
6. **Escalation Rules** - Most agents define escalation triggers/targets

---

## Critical Gaps to Address

### Priority 1: Missing Primary Techniques

| Agent | Primary Technique | Status |
|-------|-------------------|--------|
| Risk Radar | Few-Shot | ❌ No examples |
| Retrospective | Reflexion | ❌ No reflexion format |
| Meeting Notes | Few-Shot | ❌ No examples |

### Priority 2: Missing Self-Consistency

| Agent | Should Use Self-Consistency For | Status |
|-------|--------------------------------|--------|
| Risk Radar | Risk classification, severity | ❌ Not implemented |
| VE Agent | ROI calculations | ❌ Not implemented |
| CA Agent | Health evaluation | ❌ Not implemented |
| AE Agent | Opportunity qualification | ❌ Not implemented |

### Priority 3: Missing ReAct Format

| Agent | Should Use ReAct For | Status |
|-------|---------------------|--------|
| SA Agent | POC support | ❌ No Thought/Action/Observation |
| AE Agent | Stakeholder analysis | ❌ Not implemented |
| CI Agent | Market research | ❌ Not implemented |
| VE Agent | TCO analysis | ❌ Not implemented |

---

## Recommended Actions

### Immediate (High Priority)

1. **Add Few-Shot Examples** to:
   - `domain/agents/governance/personalities/risk_radar_personality.yaml`
   - `domain/agents/governance/personalities/meeting_notes_personality.yaml`
   - Create `domain/config/few_shot_examples/risk_radar/` directory

2. **Add Reflexion Format** to:
   - `domain/agents/retrospective/agents/retrospective_agent.yaml`
   - Include memory_storage_path

3. **Add Technique Instructions** to all personality files:
   ```yaml
   technique_instructions:
     chain_of_thought: |
       When analyzing, break down step by step:
       Step 1: [What we know]
       Step 2: [Key factors]
       Step 3: [Analysis]
       Step 4: [Conclusion with confidence]
   ```

### Medium Priority

4. **Add Self-Consistency** where configured:
   - Risk Radar: 3 paths for severity assessment
   - VE Agent: 3 paths for ROI calculation
   - CA Agent: 3 paths for health evaluation

5. **Add Output Format Schemas** matching template:
   ```yaml
   output_formats:
     analysis_output:
       schema: |
         analysis:
           summary: "{2-3 sentences}"
           confidence: {0-100}
           key_findings: [...]
           recommendations: [...]
   ```

6. **Add Error Handling Templates**:
   ```yaml
   error_handling:
     insufficient_evidence:
       response: |
         I don't have enough evidence to answer with high confidence.
         Available: {what_i_found}
         Missing: {what_i_need}
         Recommendation: {suggested_sources}
   ```

### Lower Priority

7. **Add Confidence Calibration** to all agents:
   ```yaml
   confidence_guidelines:
     90-100: "Very high - multiple strong sources agree"
     70-89: "High - good evidence, minor uncertainties"
     50-69: "Moderate - some evidence, gaps exist"
     30-49: "Low - limited evidence, significant assumptions"
     0-29: "Very low - mostly speculation, flag for review"
   ```

---

## Implementation Approach

### Option A: Update Personality Files

Add missing sections to existing `*_personality.yaml` files. This keeps the format consistent with current architecture.

### Option B: Create Technique-Specific Prompts

Create separate prompt files in `domain/agents/{team}/prompts/` for each technique:
- `cot_technical_analysis.yaml`
- `react_poc_support.yaml`
- `few_shot_risk_classification.yaml`

### Option C: Use Agent Prompt Template

Migrate all agents to use `playbooks/templates/agent_prompt_template.yaml` structure. Most comprehensive but largest change.

**Recommendation:** Start with Option A for 2-3 high-priority agents, validate approach, then expand.

---

## Example Implementation: Risk Radar Agent

**File:** `domain/agents/governance/personalities/risk_radar_personality.yaml`

The Risk Radar personality was updated as the reference implementation. Each section includes documentation explaining:

### What Was Added

| Section | Purpose | Lines Added |
|---------|---------|-------------|
| `prompting_techniques` | Defines primary (few-shot) and secondary (CoT) techniques | ~60 |
| `few_shot_examples` | 4 risk classification examples + 1 pattern detection | ~150 |
| `confidence_guidelines` | 0-100% calibration scale with criteria | ~40 |
| `output_schemas` | YAML schema for risk classification output | ~30 |
| `error_handling` | Templates for insufficient/conflicting evidence | ~50 |

### Documentation Pattern for Each Section

Every technique section now includes:

```yaml
# WHY THIS WAS ADDED:
# - Problem it solves
# - Research/evidence supporting the technique

# EXPECTED OUTCOMES:
# - What "good" looks like after implementation
# - Specific measurable improvements

# QUALITY METRICS TO TRACK:
# - How to measure if it's working
# - Target thresholds (e.g., >90% consistency)

# FEEDBACK LOOP FOR IMPROVEMENT:
# - What to do if quality declines
# - When to update/add examples
# - When to remove techniques that aren't helping
```

### Quality Metrics Defined

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Consistency Rate | >90% | Same risk type → same severity across runs |
| Reasoning Quality | 100% | Step-by-step cites actual evidence |
| Confidence Calibration | ±10% | 80% confidence is correct ~80% of time |
| Self-Consistency Agreement | >70% | How often 3 paths agree |
| Human Override Rate | <15% | How often humans change classifications |

### Feedback Loop Instructions

The documentation specifies when to update:

| Trigger | Action |
|---------|--------|
| High human override rate | Add corrected examples to few-shot set |
| Low consistency | Add more examples for edge cases |
| Poor calibration | Adjust confidence_guidelines thresholds |
| Paths never agree | Simplify self-consistency criteria |
| Error template overused | Review if sources are incomplete |

---

## Verification Checklist

After implementing changes:

- [x] Risk Radar has 3+ few-shot examples for risk classification ✅ (4 examples added)
- [x] Risk Radar has self-consistency instructions ✅ (3-path conservative)
- [x] Risk Radar has confidence calibration scale ✅ (0-100% with criteria)
- [x] Risk Radar has error handling templates ✅ (3 error types)
- [x] Risk Radar has WHY/EXPECT/MEASURE documentation ✅
- [ ] Retrospective Agent has reflexion format with memory storage
- [ ] Meeting Notes has extraction examples
- [ ] SA Agent prompts include ReAct format for POC support
- [ ] VE Agent includes 3-path self-consistency for ROI
- [ ] CA Agent has prompt chaining for success planning
- [ ] All agents have confidence calibration scale
- [ ] All agents have error handling templates

---

## Related Documentation

- [Prompt Engineering Principles](../architecture/system/prompt-engineering-principles.md)
- [Tool Design Principles](../architecture/system/tool-design-principles.md)
- [Agent Prompt Template](../../domain/playbooks/templates/agent_prompt_template.yaml)
- [Prompt Engineering Config](../../domain/prompts/prompt_engineering.yaml)
