---
title: "Retrospective Agent"
description: "Digital twin for win retrospective, loss retrospective, pattern analysis"
category: "reference"
keywords: ["retrospective_agent", "retrospective", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Retrospective Agent

The Retrospective Agent is the digital twin of the Retrospective role. It operates as a single agent with 5 runbooks covering win retrospective, loss retrospective, pattern analysis, knowledge sharing, and process improvement. The Retrospective agent conducts structured win/loss analysis after deal completion, extracting actionable lessons and identifying recurring patterns. It operates on the principle that every deal outcome, whether a win or a loss, contains learnings that can improve future performance. By maintaining a blame-free analytical approach and distributing insights across the organization, it turns individual deal experiences into organizational knowledge.

Its operating principle: learning over blame.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `retrospective-agent` |
| **Role** | Retrospective (Governance) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 16 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 3 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Win Retrospective

Start structured retrospective for closed-won deal. Then deep analysis of why we won, and finally create win retrospective document.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `initiate_win_retro` | Start structured retrospective for closed-won deal |
| 2 | `analyze_win_factors` | Deep analysis of why we won |
| 3 | `document_win_learnings` | Create win retrospective document |


### Loss Retrospective

Start structured retrospective for closed-lost deal. Then deep analysis of why we lost, then create loss retrospective document, and finally detailed analysis when lost to specific competitor.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `initiate_loss_retro` | Start structured retrospective for closed-lost deal |
| 2 | `analyze_loss_factors` | Deep analysis of why we lost |
| 3 | `document_loss_learnings` | Create loss retrospective document |
| 4 | `competitive_loss_deep_dive` | Detailed analysis when lost to specific competitor |


### Pattern Analysis

Find recurring patterns in wins and losses. Then analyze trends over time, and finally create periodic pattern report for leadership.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `identify_patterns` | Find recurring patterns in wins and losses |
| 2 | `trend_analysis` | Analyze trends over time |
| 3 | `generate_pattern_report` | Create periodic pattern report for leadership |


### Knowledge Sharing

Create shareable lessons learned document. Then extract competitive insights for CI team, and finally document product feedback from loss retrospective.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `create_lessons_summary` | Create shareable lessons learned document |
| 2 | `create_competitive_brief` | Extract competitive insights for CI team |
| 3 | `create_product_feedback` | Document product feedback from loss retrospective |


### Process Improvement

Create actionable process improvements from patterns. Then track status of retrospective recommendations, and finally evaluate if retrospective program is working.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `generate_recommendations` | Create actionable process improvements from patterns |
| 2 | `track_implementation` | Track status of retrospective recommendations |
| 3 | `retrospective_effectiveness` | Evaluate if retrospective program is working |


## Scope Boundaries

The agent does not assign blame to individuals (handoff to Leadership), override deal outcome classifications (handoff to Leadership), make personnel decisions (handoff to Leadership), share confidential details outside need-to-know (handoff to Leadership), conduct retrospectives during active deals (handoff to Leadership), or guarantee future outcomes based on learnings (handoff to Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Pattern reports, escalations | Senior Manager Agent | Analysis results and recommendations |
| Product feedback from losses | PM Agent | Analysis results and recommendations |
| Lessons learned summaries | All Agents | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `feedback-categories.yaml` | Sales Process, Technical Execution, Competitive | Feedback categories |
| `methodology.yaml` | Timing, Participants, Structure | Methodology |
| `signal-detection.yaml` | Retrospective Triggers, Pattern Indicators | Signal detection |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Deal Retrospective | `{account}-deal-retrospective.md` | deal_retrospective |
| Lessons Learned | `{account}-lessons-learned.md` | lessons_learned |
| Pattern Analysis | `{account}-pattern-analysis.md` | pattern_analysis |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/retrospective/retrospective-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/retrospective/agents/retrospective_agent.yaml` | Agent configuration |
| `domain/agents/retrospective/personalities/retrospective_personality.yaml` | Behavioral specification |
| `domain/agents/retrospective/prompts/tasks.yaml` | 16 CAF prompts across 5 domains |
