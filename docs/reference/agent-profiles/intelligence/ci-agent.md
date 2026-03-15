---
title: "Competitive Intelligence Agent"
description: "Digital twin for competitive signal detection, battlecard preparation, win/loss analysis"
category: "reference"
keywords: ["ci_agent", "competitive-intelligence", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Competitive Intelligence Agent

The Competitive Intelligence Agent is the digital twin of the Competitive Intelligence role. It operates as a single agent with 4 runbooks covering competitive signal detection, battlecard preparation, win/loss analysis, and market intelligence. Monitors customer conversations, market content, and CI databases for competitor mentions and competitive risks. Surfaces threats early, enriches the InfoHub with competitive context, and supports win/loss pattern analysis across accounts and market segments.

Its operating principle: accurate ci enables effective positioning.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ci-agent` |
| **Role** | Competitive Intelligence (Sales) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 12 |
| **Operating Modes** | Reactive, Strategic |
| **Knowledge References** | 3 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Competitive Signal Detection

Scan communications for competitor mentions, assess threat levels, and analyze competitive bake-offs.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `competitor_mention_scan` | Scan communications for competitor mentions, context, sentiment, threat level |
| 2 | `threat_assessment` | Assess competitive threat per competitor with position, strengths, win probability |
| 3 | `bake_off_analysis` | Analyze competitive evaluation with criteria matrix and win strategy |


### Battlecard Preparation

Generate quick battlecards, handle competitive objections, and develop displacement strategies.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `quick_battlecard` | Generate quick battlecard with differentiators, claims vs responses, trap questions |
| 2 | `objection_handling` | Handle competitive objection with validity, full truth, response, redirect |
| 3 | `displacement_playbook` | Develop displacement strategy with entry point, switching cost, messaging |


### Win/Loss Analysis

Analyze competitive wins and losses to extract patterns, learnings, and replicable strategies.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `win_analysis` | Analyze win factors, competitive advantages, close calls, replicable elements |
| 2 | `loss_analysis` | Analyze loss factors (stated vs real), competitor advantages, gaps, learnings |
| 3 | `competitive_trends` | Identify win/loss trends, common factors, emerging competitive threats |


### Market Intelligence

Analyze competitor news, update market positioning, and prepare for analyst interactions.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `competitor_news` | Analyze competitor news implications, opportunity/threat, field messaging |
| 2 | `market_positioning` | Update market positioning with evolution, competitor moves, differentiation |
| 3 | `analyst_prep` | Prepare for analyst interaction with key messages, proof points, anticipated Q&A |


## Scope Boundaries

The agent does not make claims about competitor capabilities without evidence, provide canonical battle cards (handoff to human PM/CI team), recommend sales strategies (handoff to AE Agent), invent competitive dynamics not evidenced in source content, or make pricing decisions or product commitments.


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Reactive Mode** Focus on speed and immediate actionability. When a competitor is mentioned in a live conversation or recent communication, classify the threat level immediately and generate a quick battlecard. Prioritize the most urgent signals. Keep output concise, action-ready. Skip deep market analysis in favor of fast positioning guidance.

**Strategic Mode** Focus on depth and pattern recognition. Analyze win/loss trends over time, identify emerging competitive threats, and prepare comprehensive market positioning analysis. Synthesize across multiple data points. Prioritize accuracy and defensibility over speed. Include sample size caveats and confidence levels in trend analysis.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal-detection.yaml` | Competitor keywords (direct and indirect), competitive risk levels (HIGH/MEDIUM/LOW), market signals | Scanning content for competitor mentions or competitive risk signals |
| `threat-classification.yaml` | Threat severity definitions, response criteria timelines, escalation thresholds | Classifying competitive threats or determining response urgency |
| `competitor-framework.yaml` | Battlecard structure, win/loss analysis dimensions, market positioning categories | Preparing battlecards, analyzing win/loss patterns, or tracking market positioning |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Threat Assessment | `{account}-competitive-threat.md` | Competitive threat assessment for a specific account |
| Battlecard | `{competitor}-quick-battlecard.md` | Quick competitive battlecard for a specific competitor |
| Win Loss Report | `{deal}-win-loss-analysis.md` | Win/loss analysis report for a completed deal |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/competitive_intelligence/ci-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/competitive_intelligence/agents/ci_agent.yaml` | Agent configuration |
| `domain/agents/competitive_intelligence/personalities/ci_personality.yaml` | Behavioral specification |
| `domain/agents/competitive_intelligence/prompts/tasks.yaml` | 12 CAF prompts across 4 domains |
