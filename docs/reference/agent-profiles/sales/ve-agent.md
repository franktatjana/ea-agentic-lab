---
title: "Value Engineering Agent"
description: "Digital twin for value discovery, value hypothesis, value calculation"
category: "reference"
keywords: ["ve_agent", "value-engineering", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Value Engineering Agent

The Value Engineering Agent is the digital twin of the Value Engineering role. It operates as a single agent with 8 runbooks covering value discovery, value hypothesis, value calculation, value stream workshop, value proof, value realization, value amplification, and ve engagement. Builds and defends the business case for investment across the full customer lifecycle, from pre-sales value discovery through post-sales realization tracking. Quantifies outcomes in the customer's language, tracks hypotheses against actuals, and packages realized value for renewals and expansions.

Its operating principle: if you can't prove value, you can't defend price.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ve-agent` |
| **Role** | Value Engineering (Sales) |
| **Mode** | Human-paired |
| **Runbooks** | 8 |
| **Prompts** | 27 |
| **Operating Modes** | Standard |
| **Knowledge References** | 3 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Value Discovery

Assess customer current state costs, identify value drivers, and quantify pain points to establish a value baseline.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `current_state_assessment` | Assess current spending, hidden costs, inefficiencies, and risk exposure |
| 2 | `value_driver_identification` | Map value drivers per stakeholder with priority and measurement criteria |
| 3 | `pain_point_quantification` | Quantify each pain point by cost, frequency, and annual impact |


### Value Hypothesis

Create quantified value hypotheses, stakeholder-specific narratives, and comprehensive business cases.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `create_value_hypothesis` | Create hypothesis with baseline, target, timeline, and confidence level |
| 2 | `stakeholder_value_narrative` | Create targeted narrative with metrics, language, and objection handling |
| 3 | `business_case_development` | Build full business case with investment, benefits, ROI, and cost of inaction |


### Value Calculation

Calculate ROI, analyze TCO, assess cost of inaction, and quantify value across all value types.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `roi_calculation` | Calculate 3-year ROI with sensitivity analysis and payback period |
| 2 | `tco_analysis` | Compare current vs proposed TCO with cost drivers and net savings |
| 3 | `cost_of_inaction` | Calculate ongoing inefficiency costs, risk accumulation, and missed opportunities |
| 4 | `value_quantification_by_type` | Quantify hard savings, soft savings, risk avoidance, and revenue enablement |


### Value Stream Workshop

Prepare and facilitate value stream workshops, map current and future state, and synthesize into value model.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `workshop_preparation` | Define objectives, prepare data request, build agenda and facilitator guide |
| 2 | `current_state_mapping` | Map workflows, tool inventory, handoff points, pain points, baseline metrics |
| 3 | `future_state_design` | Design future workflow with eliminated pain points and target metrics |
| 4 | `workshop_synthesis` | Synthesize into value opportunity, quick wins, phased roadmap, prioritization |


### Value Proof

Track value metrics during POV, compare to benchmarks, and document quick wins.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `pov_value_tracking` | Track POV metrics against baseline, document early wins, forecast success |
| 2 | `benchmark_comparison` | Compare to industry benchmarks, identify gaps, project achievable improvement |
| 3 | `quick_win_documentation` | Document quick wins with quantified value, validation, and amplification plan |


### Value Realization

Track realized value monthly, prepare QBR value content, develop success stories, and assess comprehensive value delivered.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `value_tracker_update` | Update hypothesis vs actual, evidence log, highlights, forecast |
| 2 | `qbr_value_content` | Prepare QBR value content with metrics, ROI to date, and roadmap |
| 3 | `success_story_development` | Develop success story with narrative, headline metrics, and customer quote |
| 4 | `realized_value_assessment` | Full assessment comparing original hypothesis to realized value |


### Value Amplification

Build renewal justification, expansion business cases, case studies, and competitive value differentiation.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `renewal_value_justification` | Build renewal case with ROI, cost avoidance, value at risk, price justification |
| 2 | `expansion_business_case` | Build expansion case with incremental value, synergies, and expansion ROI |
| 3 | `case_study_creation` | Create formal case study with challenge, solution, results, and customer quote |
| 4 | `competitive_value_differentiation` | Differentiate on value with TCO comparison, unique value points, proof points |


### VE Engagement

Qualify opportunities for VE engagement and prepare executive value presentations.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `engagement_qualification` | Qualify for VE engagement with criteria checklist and recommended level |
| 2 | `executive_presentation_prep` | Prepare executive presentation with outline, key messages, and Q&A |


## Scope Boundaries

The agent does not set or negotiate pricing (handoff to AE Agent), promise product features (handoff to PM Agent), design technical architecture (handoff to SA Agent), fabricate value metrics without evidence, make financial commitments on behalf of customer, or guarantee specific outcomes.


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**VE Agent (Pre-Sales) Mode** Focus on building compelling forward-looking business cases. Emphasize value discovery, hypothesis creation, and ROI/TCO calculations for new opportunities. Use competitive value differentiation when positioning against alternatives. Build urgency through cost-of- inaction analysis. Keep calculations conservative and defensible. Tailor narratives to the primary decision maker's language.

**VE Agent (Post-Sales) Mode** Focus on realized value evidence and proven outcomes. Track hypotheses against actuals, document value delivered, and build renewal justification from evidence. Create success stories and case studies from verified results. Support expansion business cases by building on current proven value. Be conservative on claims, only report value that is documented and validated.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal-detection.yaml` | Value keywords, stakeholder language per persona, buying signals, realization signals | Parsing communications for value opportunities or risks |
| `value-lifecycle.yaml` | Five-phase lifecycle (discovery, hypothesis, proof, realization, amplification) | Planning engagement approach or tracking lifecycle stage |
| `calculation-frameworks.yaml` | TCO components, ROI formula and factors, value driver categories | Building business cases, running calculations, or designing value models |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Business Case | `{account}-business-case.md` | Comprehensive business case for customer investment decision |
| Roi Model | `{account}-roi-model.md` | ROI calculation with sensitivity analysis |
| Value Tracker | `{account}-value-tracker.md` | Value hypothesis and realization tracking document |
| Success Story | `{account}-success-story.md` | Customer success story for reference program |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/value_engineering/ve-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/value_engineering/agents/ve_agent.yaml` | Agent configuration |
| `domain/agents/value_engineering/personalities/ve_personality.yaml` | Behavioral specification |
| `domain/agents/value_engineering/prompts/tasks.yaml` | 27 CAF prompts across 8 domains |
