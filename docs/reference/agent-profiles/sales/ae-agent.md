---
title: "Account Executive Agent"
description: "Digital twin for deal diagnosis, pipeline management, stakeholder intelligence"
category: "reference"
keywords: ["ae_agent", "account-executive", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Account Executive Agent

The Account Executive Agent is the digital twin of the Account Executive role. It operates as a single agent with 6 runbooks covering deal diagnosis, pipeline management, stakeholder intelligence, commercial signal detection, meeting preparation, and opportunity hygiene. Monitors CRM stage changes, customer communications, and meeting notes to detect commercial risks and relationship health signals. Provides early warning on forecast risks, tracks follow-up actions, and generates meeting briefs with commercial context. Every risk surfaces with a suggested mitigation action.

Its operating principle: commercial accuracy protects forecast integrity.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ae-agent` |
| **Role** | Account Executive (Sales) |
| **Mode** | Human-paired |
| **Runbooks** | 6 |
| **Prompts** | 21 |
| **Operating Modes** | Standard |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Deal Diagnosis

Diagnose deal health, identify stall causes, analyze losses, and find resurrection opportunities.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `analyze_deal_health` | Identify top risks and positive signals, assign health score (RED/YELLOW/GREEN) |
| 2 | `diagnose_stalled_deal` | Identify stall cause, contributing factors, unstall actions |
| 3 | `loss_analysis` | Timeline of key moments, warning signs, competitor analysis, learnings |
| 4 | `resurrect_dead_deal` | Identify resurrection candidates with changed conditions and triggers |


### Pipeline Management

Assess forecast accuracy, analyze pipeline coverage, and identify daily priority actions.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `forecast_accuracy` | Assess commit confidence per deal based on engagement and signals |
| 2 | `pipeline_coverage` | Calculate coverage ratio, identify gap, recommend pipeline generation |
| 3 | `next_best_action` | Top 5 priority actions ranked by deal impact and urgency |


### Stakeholder Intelligence

Map stakeholder relationships and influence, assess champion health, and prepare executive briefs.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `relationship_map` | Map decision-making unit with sentiment, influence, and engagement gaps |
| 2 | `champion_health` | Assess champion strength (1-10), evidence, risks, strengthening actions |
| 3 | `executive_brief` | Prepare executive brief with priorities, value delivered, ask, objections |


### Commercial Signal Detection

Detect budget signals, competitive threats, and expansion opportunities from customer communications.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `budget_signal_scan` | Extract budget availability, constraints, fiscal timing, approval processes |
| 2 | `competitive_threat` | Assess competitive activity, threat levels, differentiation, defensive actions |
| 3 | `expansion_opportunity` | Identify upsell/cross-sell signals, value estimates, stakeholders to engage |


### Meeting Preparation

Prepare customer call briefs, QBR materials, and generate post-call summaries with action items.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `call_prep` | Last interaction summary, open items, objectives, questions, risks |
| 2 | `qbr_prep` | Value delivered, adoption metrics, health scorecard, expansion points |
| 3 | `post_call_summary` | Executive summary, decisions, action items with owners, follow-up, CRM updates |


### Opportunity Hygiene

Run weekly hygiene checks, assess health indicators, detect stale opportunities, and generate reports.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `weekly_hygiene_check` | Check stage accuracy, close dates, next steps, last contact, risk status |
| 2 | `opportunity_health_indicators` | Evaluate GREEN/YELLOW/RED criteria, identify concerns, improvement actions |
| 3 | `stale_opportunity_alert` | Detect stale opportunities with WARNING (14d) and CRITICAL (21d) alert levels |
| 4 | `hygiene_report` | Overall hygiene score, health distribution, activity metrics, recommendations |
| 5 | `crm_update_checklist` | Generate CRM field updates, activity logging, and InfoHub update checklist |


## Scope Boundaries

The agent does not make pricing decisions or negotiate terms, assess technical risks (handoff to SA Agent), track delivery status (handoff to Delivery Agent), make product roadmap commitments (handoff to PM Agent), auto-change CRM data (recommends updates for human review), or invent stakeholder sentiments not expressed in source content.


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**AE Agent (Deal Focus) Mode** Focus on individual deal health and urgency. Diagnose stalled deals, identify immediate risks, and recommend next-best-actions for today. Prioritize deals closest to close or at highest risk. Keep output action-oriented with specific stakeholders to engage and messages to deliver. Emphasize speed and proactive engagement.

**AE Agent (Pipeline Focus) Mode** Focus on portfolio-level analysis and operational hygiene. Assess forecast accuracy, pipeline coverage ratios, and systematic health indicators across all opportunities. Prioritize data completeness and consistent metrics. Identify patterns across deals rather than individual deal tactics. Generate weekly hygiene reports with week-over-week comparisons.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal-detection.yaml` | Commercial risk keywords, severity indicators, relationship health signals, pipeline signals | Processing meeting notes, Slack, or email content |
| `risk-classification.yaml` | Severity definitions (HIGH/MEDIUM/LOW) and escalation trigger criteria | Classifying risks or determining escalation |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Deal Health Report | `{account}-deal-health.md` | Deal health assessment for a specific opportunity |
| Pipeline Report | `{ae_name}-pipeline-report.md` | Pipeline status and forecast risk report |
| Hygiene Report | `{ae_name}-weekly-hygiene.md` | Weekly opportunity hygiene report |
| Call Brief | `{account}-call-brief.md` | Customer call preparation brief |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/account_executives/ae-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/account_executives/agents/ae_agent.yaml` | Agent configuration |
| `domain/agents/account_executives/personalities/ae_personality.yaml` | Behavioral specification |
| `domain/agents/account_executives/prompts/tasks.yaml` | 21 CAF prompts across 6 domains |
