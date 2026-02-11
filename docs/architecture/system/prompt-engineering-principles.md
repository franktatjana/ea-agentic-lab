# Prompt Engineering Principles for AI Agents

**Version:** 1.0
**Date:** 2026-01-22
**Status:** Production Ready

---

## Core Philosophy

> "The quality of agent outputs is directly proportional to the quality of prompts."

Effective prompting transforms generic LLMs into specialized domain experts. Each agent in the EA Agentic Lab system uses a combination of prompting techniques tailored to their responsibilities.

---

## Technique Overview

| Technique | Purpose | Best For | EA Agents |
|-----------|---------|----------|-----------|
| **Chain-of-Thought** | Step-by-step reasoning | Analysis, decisions | SA, VE, CI Agents |
| **ReAct** | Reasoning + Action | Tool use, data gathering | All agents with tools |
| **Few-Shot** | Learning from examples | Consistent formatting | Governance agents |
| **Self-Consistency** | Reliability via consensus | Critical decisions | Risk Radar, Health Score |
| **Prompt Chaining** | Sequential subtasks | Playbook execution | All playbook executors |
| **Tree of Thoughts** | Exploring alternatives | Strategy, trade-offs | AE, SA Agents |
| **Reflexion** | Learning from mistakes | Continuous improvement | Retrospective Agent |

---

## 1. Chain-of-Thought (CoT) Prompting

### What It Is

CoT enables agents to solve complex problems by working through intermediate reasoning steps before providing answers. This is essential for analysis playbooks like SWOT, Five Forces, and Value Engineering.

### Implementation Pattern

```yaml
# Agent prompt structure with CoT
agent_prompt:
  system: |
    You are the {agent_role} for {realm}/{node}.

    When analyzing complex problems, think through your reasoning step by step:
    1. Identify the key factors
    2. Analyze relationships between factors
    3. Consider implications
    4. Draw conclusions with confidence levels
    5. Cite evidence for each conclusion

  user: |
    {task_description}

    Think through this step by step before providing your analysis.
```

### Zero-Shot CoT Trigger

Add this suffix to any prompt requiring reasoning:

```
Let's think through this step by step, considering all available evidence.
```

### When to Use

| Use CoT | Don't Use CoT |
|---------|---------------|
| Multi-step analysis | Simple lookups |
| Decision-making with trade-offs | Data retrieval |
| Risk assessment | Status updates |
| Value calculations | Notification routing |

### Agent-Specific CoT Templates

**SA Agent (Technical Analysis):**
```yaml
cot_template: |
  Analyzing {topic} for {realm}/{node}:

  Step 1 - Current State Assessment:
  - What do we know from the tech signal map?
  - What does the deployment architecture show?
  - What risks are currently identified?

  Step 2 - Gap Analysis:
  - What technical capabilities are missing?
  - Where are the integration challenges?
  - What skills gaps exist?

  Step 3 - Impact Assessment:
  - How does this affect the customer's goals?
  - What are the dependencies?
  - What's the timeline impact?

  Step 4 - Recommendations:
  - What actions should we take? (with priority)
  - What evidence supports each recommendation?
  - What is my confidence level? (0-100%)
```

**VE Agent (Value Analysis):**
```yaml
cot_template: |
  Calculating value for {opportunity}:

  Step 1 - Current Cost Analysis:
  - What are the direct costs today?
  - What are the indirect/hidden costs?
  - What is the total cost of ownership?

  Step 2 - Future State Modeling:
  - What costs will be eliminated/reduced?
  - What new capabilities will be gained?
  - What revenue opportunities emerge?

  Step 3 - ROI Calculation:
  - Investment required: {investment}
  - Annual benefit: {benefit}
  - Payback period: {months}
  - 3-year ROI: {percentage}

  Step 4 - Confidence Assessment:
  - Assumptions made: {list}
  - Evidence quality: {high/medium/low}
  - Overall confidence: {percentage}
```

---

## 2. ReAct (Reasoning + Acting)

### What It Is

ReAct interleaves reasoning with actions, enabling agents to dynamically gather information while solving problems. This is the core pattern for agents that use tools.

### The Thought-Action-Observation Loop

```
Thought: What do I need to figure out?
Action: [tool_name] with [parameters]
Observation: [tool result]
Thought: Based on this, I now understand...
Action: [next_tool] with [parameters]
...
Final Answer: [conclusion with evidence]
```

### Implementation Pattern

```yaml
# ReAct-enabled agent prompt
agent_prompt:
  system: |
    You are the {agent_role} with access to these tools:
    {tool_descriptions}

    When working on tasks:
    1. THINK about what information you need
    2. ACT by calling the appropriate tool
    3. OBSERVE the results
    4. THINK about what you've learned
    5. Repeat until you have sufficient information
    6. Provide your final answer with evidence

    Always cite which tools provided which evidence.

  react_format: |
    Thought: {reasoning about current state}
    Action: {tool_name}({parameters})
    Observation: {tool result - provided by system}
    Thought: {interpretation of observation}
    ... (repeat as needed)
    Final Answer: {conclusion with confidence and evidence}
```

### Tool Integration

```yaml
# ReAct tool specification
tools:
  - name: get_node_context
    description: |
      Retrieves comprehensive context for a node.
      Use this FIRST when starting any task to understand current state.
    parameters:
      - realm_id: required
      - node_id: required
      - detail_level: summary | standard | full

  - name: query_risks
    description: |
      Searches the risk register.
      Use when you need to understand risk posture or check if a risk exists.
    parameters:
      - severity_filter: array of severities
      - status_filter: array of statuses
      - limit: max results

  - name: read_artifact
    description: |
      Reads a specific artifact from InfoHub.
      Use when you need detailed content from a known artifact path.
    parameters:
      - artifact_path: required
```

### Agent-Specific ReAct Patterns

**CI Agent (Competitive Intelligence):**
```yaml
react_pattern: |
  Thought: I need to assess the competitive landscape for {realm}/{node}.
  Action: get_node_context(realm_id="{realm}", node_id="{node}", include_sections=["opportunities", "risks"])
  Observation: {context}

  Thought: I see potential competitors mentioned. Let me check the tech signal map for displacement signals.
  Action: read_artifact(artifact_path="{realm}/intelligence/tech_signal_map/current_map.yaml")
  Observation: {tech_signal_map}

  Thought: LegacySIEM is in the Hold ring with declining mentions. This indicates displacement opportunity.
  Action: query_risks(category_filter=["competitive"], realm_id="{realm}")
  Observation: {competitive_risks}

  Thought: Based on tech signal decline and existing competitive concerns, I can now assess...
  Final Answer: {competitive_assessment with evidence and confidence}
```

---

## 3. Few-Shot Prompting

### What It Is

Few-shot prompting provides examples within the prompt to guide consistent output formatting. Essential for governance agents that must produce standardized artifacts.

### Implementation Pattern

```yaml
# Few-shot enabled agent prompt
agent_prompt:
  system: |
    You are the {agent_role}. You produce artifacts in a specific format.

    Here are examples of correct outputs:

    <example_1>
    {first_example}
    </example_1>

    <example_2>
    {second_example}
    </example_2>

    Follow this exact format for your outputs.
```

### Example Selection Guidelines

| Criterion | Guideline |
|-----------|-----------|
| **Quantity** | Start with 2-3 examples, add more if needed |
| **Diversity** | Cover different scenarios/edge cases |
| **Quality** | Use gold-standard examples only |
| **Relevance** | Match the task type closely |
| **Format** | Maintain consistent structure |

### Agent-Specific Few-Shot Examples

**Risk Radar Agent:**
```yaml
few_shot_examples:
  - example_id: "risk_high_competitive"
    input: "Competitor evaluation detected in meeting notes"
    output: |
      risk_id: RSK_2026_01_001
      title: "Competitive displacement risk - LegacySIEM evaluation"
      severity: high
      severity_label: "High - Requires attention this week"
      category: competitive
      probability: likely
      impact: |
        $720K ARR at risk if customer switches to competitor.
        Loss of reference account in financial services vertical.
      evidence:
        - source: "ACME/SECURITY/meetings/2026-01-15.md"
          excerpt: "IT Director mentioned LegacySIEM sales team has been persistent"
          confidence: high
      mitigation_required: true

  - example_id: "risk_medium_technical"
    input: "Performance complaints in support tickets"
    output: |
      risk_id: RSK_2026_01_002
      title: "Technical satisfaction risk - query performance"
      severity: medium
      severity_label: "Medium - Address this quarter"
      category: technical
      probability: possible
      impact: |
        Customer dissatisfaction may influence renewal decision.
        Could escalate to executive attention if unresolved.
      evidence:
        - source: "support_system/tickets/TKT-4521"
          excerpt: "Query latency exceeds 5s SLA for complex dashboards"
          confidence: high
      mitigation_required: true
```

**Meeting Notes Agent:**
```yaml
few_shot_examples:
  - example_id: "discovery_call"
    input: |
      Meeting transcript from discovery call...
    output: |
      meeting_summary:
        date: "2026-01-22"
        type: "discovery_call"
        attendees:
          - name: "Sarah Chen"
            role: "CTO"
            sentiment: positive
          - name: "John Smith"
            role: "SA"
            company: "Vendor"

        key_topics:
          - topic: "Security consolidation initiative"
            discussion: "Customer looking to reduce tool sprawl"
            sentiment: opportunity

        decisions_made: []

        action_items:
          - description: "Send security architecture proposal"
            owner: "SA"
            due: "2026-01-29"
            priority: P1

        risks_identified:
          - signal: "Mentioned LegacySIEM has been reaching out"
            severity_hint: medium
            forward_to: risk_radar_agent

        signals_emitted:
          - SIG_MTG_001: meeting_processed
          - SIG_HLT_001: risk_identified (competitive)
```

---

## 4. Self-Consistency

### What It Is

Self-Consistency generates multiple reasoning paths and selects the answer that appears most frequently. Essential for critical decisions where reliability matters.

### Implementation Pattern

```yaml
# Self-consistency for critical assessments
self_consistency:
  enabled: true
  num_paths: 3  # Generate 3 independent analyses
  aggregation: majority_vote

  prompt_template: |
    Analyze {topic} for {realm}/{node}.

    Generate your analysis independently, then we will compare with other paths.

    {cot_template}

  output_format: |
    Path {n} Analysis:
    - Conclusion: {conclusion}
    - Confidence: {percentage}
    - Key Evidence: {evidence_list}

  final_selection: |
    Comparing {num_paths} independent analyses:
    - Path 1: {conclusion_1} (confidence: {conf_1})
    - Path 2: {conclusion_2} (confidence: {conf_2})
    - Path 3: {conclusion_3} (confidence: {conf_3})

    Consensus: {majority_conclusion}
    Agreement: {agreement_percentage}
    Final Confidence: {adjusted_confidence}
```

### When to Use Self-Consistency

| Use Self-Consistency | Skip Self-Consistency |
|---------------------|----------------------|
| Health score calculations | Simple data retrieval |
| Risk severity classification | Status updates |
| Churn prediction | Meeting note extraction |
| Opportunity qualification | Notification routing |
| Critical decisions | Routine artifact creation |

### Agent-Specific Implementation

**Health Score Agent:**
```yaml
self_consistency_config:
  enabled: true
  num_paths: 3
  confidence_boost: 0.1  # Add 10% confidence if all paths agree

  dimensions:
    - name: engagement_score
      paths: 3
      aggregation: average

    - name: adoption_score
      paths: 3
      aggregation: average

    - name: risk_score
      paths: 3
      aggregation: conservative  # Take worst case

    - name: overall_health
      paths: 5  # More paths for final score
      aggregation: median
```

---

## 5. Prompt Chaining

### What It Is

Prompt Chaining breaks complex tasks into sequential subtasks, where each output feeds into the next. This is how playbooks execute in the EA Agentic Lab.

### Implementation Pattern

```yaml
# Prompt chain for SWOT analysis playbook
prompt_chain:
  playbook_id: PB_201

  stages:
    - stage_id: 1
      name: "Gather Context"
      prompt: |
        Load all relevant context for {realm}/{node}:
        - Tech signal map
        - Stakeholder map
        - Risk register
        - Recent meeting notes

        Summarize the current state in 500 words or less.
      output_to: context_summary

    - stage_id: 2
      name: "Identify Strengths"
      prompt: |
        Based on this context:
        {context_summary}

        Identify 3-5 strengths with evidence. For each:
        - Category (relationship, technical, commercial)
        - Description
        - Evidence (source, excerpt, confidence)
        - Impact (high/medium/low)
      output_to: strengths

    - stage_id: 3
      name: "Identify Weaknesses"
      prompt: |
        Based on this context:
        {context_summary}

        And these strengths (avoid duplication):
        {strengths}

        Identify 3-5 weaknesses with evidence...
      output_to: weaknesses

    - stage_id: 4
      name: "Identify Opportunities"
      prompt: |
        Based on strengths and weaknesses:
        {strengths}
        {weaknesses}

        Identify 3-5 opportunities that leverage strengths
        or address weaknesses...
      output_to: opportunities

    - stage_id: 5
      name: "Identify Threats"
      prompt: |
        Based on full analysis so far:
        {context_summary}
        {strengths}
        {weaknesses}
        {opportunities}

        Identify 3-5 threats with probability and impact...
      output_to: threats

    - stage_id: 6
      name: "Synthesize & Recommend"
      prompt: |
        Synthesize the complete SWOT analysis:
        - Strengths: {strengths}
        - Weaknesses: {weaknesses}
        - Opportunities: {opportunities}
        - Threats: {threats}

        Provide:
        1. Executive summary (3 sentences)
        2. Top 3 strategic recommendations
        3. Confidence level and key assumptions
      output_to: final_analysis
```

### Chain Error Handling

```yaml
chain_error_handling:
  on_stage_failure:
    action: retry_with_fallback
    max_retries: 2
    fallback_prompt: |
      The previous attempt failed. Please try a simpler approach:
      {simplified_prompt}

  on_chain_failure:
    action: partial_completion
    save_progress: true
    notification: |
      Playbook {playbook_id} completed {completed_stages}/{total_stages} stages.
      Failed at stage {failed_stage}: {error_message}

      Partial results available in: {output_path}
```

---

## 6. Tree of Thoughts (ToT)

### What It Is

ToT explores multiple reasoning branches systematically, evaluating and pruning paths to find the best solution. Essential for strategic decisions with trade-offs.

### Implementation Pattern

```yaml
# Tree of Thoughts for strategy development
tot_config:
  enabled: true
  branching_factor: 3  # Explore 3 options at each step
  depth: 3             # 3 levels of exploration
  evaluation: self_evaluate

  prompt_template: |
    Problem: {strategic_question}

    Generate {branching_factor} distinct approaches to this problem.
    For each approach:
    1. Describe the approach
    2. List pros and cons
    3. Evaluate: sure / maybe / unlikely to succeed

    Then select the most promising approach(es) to explore further.
```

### Evaluation Criteria

```yaml
tot_evaluation:
  criteria:
    - name: feasibility
      weight: 0.3
      question: "Can we realistically implement this?"

    - name: impact
      weight: 0.3
      question: "Will this significantly improve outcomes?"

    - name: risk
      weight: 0.2
      question: "What could go wrong?"

    - name: alignment
      weight: 0.2
      question: "Does this align with customer priorities?"

  classification:
    sure: "High confidence this will work (>80%)"
    maybe: "Moderate confidence, worth exploring (40-80%)"
    unlikely: "Low confidence, consider alternatives (<40%)"
```

### Agent-Specific ToT

**AE Agent (Opportunity Strategy):**
```yaml
tot_template: |
  Opportunity: {opportunity_name}
  Goal: Maximize win probability while protecting timeline

  Branch 1: Aggressive Timeline
  - Approach: Compress POC to 2 weeks, push for decision
  - Pros: Faster revenue recognition, beat competitor
  - Cons: Risk of insufficient evaluation, buyer's remorse
  - Evaluation: maybe (depends on customer urgency)

  Branch 2: Thorough Evaluation
  - Approach: 4-week POC with comprehensive success criteria
  - Pros: Higher confidence in value, stronger relationship
  - Cons: Longer sales cycle, competitor may undercut
  - Evaluation: sure (aligns with enterprise buying patterns)

  Branch 3: Phased Approach
  - Approach: Quick win on use case 1, expand to use case 2
  - Pros: Early value demonstration, reduced risk
  - Cons: May not address full scope initially
  - Evaluation: sure (proven pattern for this customer segment)

  Selected Path: Branch 3 (Phased Approach)
  Rationale: Balances speed with thorough evaluation...
```

---

## 7. Reflexion (Self-Improvement)

### What It Is

Reflexion enables agents to learn from mistakes through self-reflection, storing insights in memory for future improvement.

### Implementation Pattern

```yaml
# Reflexion loop for continuous improvement
reflexion:
  enabled: true
  trigger: on_outcome_known  # When we learn if we were right/wrong

  components:
    actor:
      uses: [cot, react]
      memory: short_term + long_term

    evaluator:
      method: outcome_based  # Did prediction match reality?
      metrics:
        - accuracy
        - confidence_calibration
        - evidence_quality

    memory:
      short_term: current_session
      long_term: {realm}/{node}/internal-infohub/agent_work/reflections/
```

### Reflection Template

```yaml
reflection_template: |
  ## Reflection on {task_type}

  ### What I Predicted
  - Conclusion: {original_conclusion}
  - Confidence: {original_confidence}
  - Key Evidence: {original_evidence}

  ### What Actually Happened
  - Outcome: {actual_outcome}
  - Accuracy: {accuracy_assessment}

  ### What I Learned
  - If correct: What signals were most predictive?
  - If incorrect: What did I miss? What should I have weighted differently?

  ### Future Guidance
  - Pattern to remember: {pattern}
  - Confidence adjustment: {adjustment}
  - Evidence to prioritize: {evidence_types}
```

### Retrospective Agent Integration

```yaml
retrospective_reflexion:
  trigger: SIG_COM_002  # deal_closed

  reflection_process:
    - step: gather_history
      action: |
        Collect all predictions and assessments made during this opportunity.

    - step: compare_to_outcome
      action: |
        Compare each prediction to actual outcome.
        Identify hits and misses.

    - step: extract_patterns
      action: |
        What patterns led to accurate predictions?
        What blind spots caused misses?

    - step: update_guidance
      action: |
        Store lessons learned in:
        vault/knowledge/patterns/win_patterns.yaml
        vault/knowledge/patterns/loss_patterns.yaml

    - step: share_insights
      action: |
        Emit signal with learned patterns for other agents.
        SIG_LEARN_001: pattern_discovered
```

---

## Configuration Reference

### Agent Prompt Configuration

```yaml
# config/prompt_engineering.yaml

# Global settings
global:
  cot_trigger: "Let's think through this step by step."
  evidence_requirement: true
  confidence_required: true

# Per-agent technique selection
agents:
  sa_agent:
    primary_technique: react
    secondary_techniques: [cot, tot]
    few_shot_examples: 3
    self_consistency: false

  ve_agent:
    primary_technique: cot
    secondary_techniques: [react]
    few_shot_examples: 2
    self_consistency: true  # For ROI calculations

  risk_radar_agent:
    primary_technique: few_shot
    secondary_techniques: [cot]
    few_shot_examples: 5
    self_consistency: true  # For severity classification

  health_score_agent:
    primary_technique: cot
    secondary_techniques: [self_consistency]
    few_shot_examples: 2
    self_consistency:
      enabled: true
      num_paths: 3

  retrospective_agent:
    primary_technique: reflexion
    secondary_techniques: [cot]
    few_shot_examples: 3
    memory_enabled: true
```

---

## Implementation Checklist

### For New Agents

- [ ] **Identify primary technique**: Which technique best fits this agent's tasks?
- [ ] **Design prompt structure**: System prompt + technique-specific format
- [ ] **Create few-shot examples**: 2-5 gold-standard examples
- [ ] **Define tools**: If using ReAct, specify available tools
- [ ] **Configure self-consistency**: Enable for critical decisions
- [ ] **Set up memory**: If using Reflexion, configure storage
- [ ] **Test and calibrate**: Validate outputs match expectations

### For Playbook Execution

- [ ] **Design prompt chain**: Break into logical stages
- [ ] **Define stage dependencies**: What flows from stage to stage?
- [ ] **Configure error handling**: Retry, fallback, partial completion
- [ ] **Add quality checks**: Validation between stages
- [ ] **Enable tracing**: Log each stage for debugging

### Quality Assurance

- [ ] **Confidence calibration**: Does stated confidence match accuracy?
- [ ] **Evidence quality**: Are citations accurate and relevant?
- [ ] **Format consistency**: Do outputs match expected schema?
- [ ] **Reasoning clarity**: Is the thought process traceable?

---

## Additional Techniques

### Step-Back Prompting

Ask broad background questions first, then feed answers into the main task. This produces more robust outputs for complex analysis.

**Pattern:**

```yaml
step_back_prompting:
  step_1_background: |
    Before analyzing {specific_topic}, let's establish context:
    - What is the general state of {domain} for this account?
    - What historical patterns exist?
    - What are the key stakeholder concerns?

  step_2_main_task: |
    Given the context above:
    {background_answers}

    Now analyze {specific_topic} and provide recommendations.
```

**Best For:**

- Strategic account reviews (understand history before recommendations)
- Complex risk assessment (understand context before classifying)
- Value engineering (understand business before calculating ROI)

**Agent Mapping:**

| Agent | Step-Back Use Case |
|-------|-------------------|
| AE Agent | Understand account history before strategy |
| SA Agent | Understand tech landscape before architecture review |
| VE Agent | Understand business drivers before value calculation |

---

### Model Parameters

Configure temperature, top-P, and top-K based on task type:

```yaml
model_parameters:
  # Conservative/Deterministic (for classification, risk assessment)
  conservative:
    temperature: 0.2
    top_p: 0.95
    top_k: 30
    use_for:
      - Risk classification
      - Health score calculation
      - Decision logging
      - Compliance checks

  # Balanced (default for most tasks)
  balanced:
    temperature: 0.5
    top_p: 0.95
    top_k: 40
    use_for:
      - Analysis and recommendations
      - Meeting notes extraction
      - Action item generation

  # Creative (for brainstorming, strategy)
  creative:
    temperature: 0.8
    top_p: 0.99
    top_k: 50
    use_for:
      - Strategy brainstorming
      - Alternative exploration (ToT)
      - Competitive positioning ideas
```

**Agent Parameter Recommendations:**

| Agent | Recommended Preset | Rationale |
|-------|-------------------|-----------|
| Risk Radar | Conservative | Classification must be consistent |
| Health Score | Conservative | Scores must be reproducible |
| Meeting Notes | Balanced | Extract accurately but handle ambiguity |
| AE Agent | Balanced → Creative | Strategy benefits from creativity |
| Retrospective | Balanced | Pattern recognition + insight generation |

---

### Positive Instructions Principle

Frame guidance as "what to do" rather than lengthy "don'ts". Positive framing is clearer and more actionable.

**Before (Negative):**

```yaml
# Don't do this - too many negatives
rules:
  - "NEVER invent client names"
  - "NEVER fabricate evidence"
  - "NEVER assume information"
  - "Don't make up dates"
  - "Avoid guessing stakeholders"
```

**After (Positive with Limited Negatives):**

```yaml
# Better - positive framing with essential guardrails
rules:
  # What TO DO (primary)
  - "Extract only facts present in source material"
  - "Quote directly when citing evidence"
  - "Mark uncertain items with [NEEDS VERIFICATION]"
  - "Omit information rather than guess"

  # Essential guardrails (limited negatives)
  - "NEVER invent entities not in source"
```

**Why It Matters:**

- Models follow positive instructions more reliably
- Reduces cognitive load in prompt
- Essential "NEVER" rules stand out more when used sparingly

---

### Auto Prompt Engineering (Future)

Model generates, evaluates, and selects its own prompts. This enables continuous self-improvement.

**Concept (for future implementation):**

```yaml
auto_prompt_engineering:
  enabled: false  # Future feature

  workflow:
    1_generate: "Generate 3 candidate prompts for {task}"
    2_evaluate: "Score each prompt on clarity, specificity, completeness"
    3_select: "Choose the highest-scoring prompt"
    4_execute: "Run task with selected prompt"
    5_reflect: "Compare output quality, update prompt library"

  use_cases:
    - Optimizing few-shot examples over time
    - Discovering better CoT trigger phrases
    - Adapting prompts to new domains
```

**Status:** Not implemented. Consider for Phase 2 after validating manual prompt engineering.

---

## Related Documentation

- [Tool Design Principles](tool-design-principles.md) - Tool design for agents
- [Context Engineering](context-engineering.md) - Token management
- [Playbook Execution Specification](../playbooks/playbook-execution-specification.md) - How playbooks run
- [Agent Architecture](../agents/agent-architecture.md) - Agent responsibilities
