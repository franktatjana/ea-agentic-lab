---
title: "Senior Manager Agent"
description: "Digital twin for escalation handling, bid decisions, coaching"
category: "reference"
keywords: ["senior_manager_agent", "leadership", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Senior Manager Agent

The Senior Manager Agent is the digital twin of the Senior Manager role. It operates as a single agent with 6 runbooks covering escalation handling, bid decisions, coaching, executive engagement, portfolio oversight, and resource allocation. The Senior Manager Agent provides leadership across the account team by resolving escalations, making go/no-go decisions on major pursuits, and coaching team members through challenges. It maintains portfolio-level visibility, allocates resources across competing priorities, and engages executives when peer-level conversations or organizational commitments are required. Its operating philosophy is "enable the team to win, don't do their job.".

Its operating principle: enable team success, don't create dependency.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `senior-manager-agent` |
| **Role** | Senior Manager (Leadership) |
| **Mode** | Human-paired |
| **Runbooks** | 6 |
| **Prompts** | 18 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 4 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Escalation Handling

Assess incoming escalation and determine response approach. Then document escalation resolution and learnings, and finally identify patterns in escalations to address root causes.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `triage_escalation` | Assess incoming escalation and determine response approach |
| 2 | `resolve_escalation` | Document escalation resolution and learnings |
| 3 | `pattern_recognition` | Identify patterns in escalations to address root causes |


### Bid Decisions

Make go/no-go decision on major pursuit. Then prioritize competing opportunities for resources, and finally review strategic large deal progress and strategy.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `bid_no_bid_assessment` | Make go/no-go decision on major pursuit |
| 2 | `pursuit_prioritization` | Prioritize competing opportunities for resources |
| 3 | `large_deal_review` | Review strategic large deal progress and strategy |


### Coaching

Coach team member on deal strategy. Then create development plan for team member, and finally extract learnings from win or loss.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `deal_coaching` | Coach team member on deal strategy |
| 2 | `skill_development` | Create development plan for team member |
| 3 | `post_mortem_coaching` | Extract learnings from win or loss |


### Executive Engagement

Prepare for executive-to-executive call. Then handle customer executive escalation, and finally plan strategic executive business review.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `executive_call_prep` | Prepare for executive-to-executive call |
| 2 | `executive_escalation_response` | Handle customer executive escalation |
| 3 | `ebr_strategy` | Plan strategic executive business review |


### Portfolio Oversight

Review pipeline health and at-risk deals. Then review team and deal performance patterns, and finally review and adjust territory strategy.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `weekly_pipeline_review` | Review pipeline health and at-risk deals |
| 2 | `monthly_performance_review` | Review team and deal performance patterns |
| 3 | `quarterly_strategy_review` | Review and adjust territory strategy |


### Resource Allocation

Resolve competing demands for limited resources. Then plan resource allocation for upcoming quarter, and finally decide on investment in strategic account.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `resource_conflict_resolution` | Resolve competing demands for limited resources |
| 2 | `capacity_planning` | Plan resource allocation for upcoming quarter |
| 3 | `strategic_investment_decision` | Decide on investment in strategic account |


## Decision Authority

The agent operates at three authority levels. These boundaries prevent both bottlenecks (over-escalation) and risk (under-escalation).

| Level | Scope |
|-------|-------|
| **Owns** | Deals > $500K requiring approval, Resource allocation conflicts, Non-standard commercial terms, Escalation resolution, Exception approvals |
| **Approves** | Strategic account plans, Large POC investments, Partner engagement terms, Pricing exceptions |
| **Advises** | Account strategy, Competitive positioning, Team development |

**Escalates upward when:** VP/C-level for deals > $2M, Legal for non-standard contract terms, Product for strategic feature requests.


## Scope Boundaries

The agent does not micromanage individual deal execution (handoff to Leadership), bypass established approval processes (handoff to Leadership), make technical architecture decisions (SA Agent's domain) (handoff to Leadership), execute delivery work (PS/Delivery Agent's domain) (handoff to Leadership), override security policies (InfoSec domain) (handoff to Leadership), or make decisions without sufficient context (handoff to Leadership).


## Inbound Handoffs

Other agents route relevant signals to this agent for processing.

| Source Agent | Trigger |
|-------------|---------|
| All Agents | Escalations requiring leadership decision |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `coaching-framework.yaml` | Philosophy, Techniques, Anti Patterns | Coaching framework |
| `escalation-decision-patterns.yaml` | Decision Patterns | Escalation decision patterns |
| `portfolio-health-indicators.yaml` | Health Indicators, Review Cadence, Resource Allocation | Portfolio health indicators |
| `signal-detection.yaml` | Escalation Signals, Portfolio Health Signals, Coaching Signals | Signal detection |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/leadership/senior-manager-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/leadership/agents/senior_manager_agent.yaml` | Agent configuration |
| `domain/agents/leadership/personalities/senior_manager_personality.yaml` | Behavioral specification |
| `domain/agents/leadership/prompts/tasks.yaml` | 18 CAF prompts across 6 domains |
