---
title: "Product Manager Agent"
description: "Digital twin for feature gap, feasibility, communication"
category: "reference"
keywords: ["pm_agent", "product-managers", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Product Manager Agent

The Product Manager Agent is the digital twin of the Product Manager role. It operates as a single agent with 5 runbooks covering feature gap, feasibility, communication, product feedback, and meeting support. The PM agent monitors customer requirements and maps them against the product roadmap to surface gaps, track dependencies, and classify feasibility. It prevents false promises by ensuring every feature-related customer communication is grounded in verified product state, serving as the bridge between what customers ask for and what the product can deliver.

Its operating principle: accuracy prevents false customer expectations.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `pm-agent` |
| **Role** | Product Manager (Leadership) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 11 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 1 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Feature Gap

Analyze gap between customer need and product capability. Then analyze customer dependency on roadmap items, and finally identify patterns in feature requests across accounts.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `gap_assessment` | Analyze gap between customer need and product capability |
| 2 | `roadmap_dependency` | Analyze customer dependency on roadmap items |
| 3 | `pattern_analysis` | Identify patterns in feature requests across accounts |


### Feasibility

Rapid feasibility assessment for customer request, then deep feasibility analysis for complex request.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `quick_feasibility` | Rapid feasibility assessment for customer request |
| 2 | `detailed_feasibility` | Deep feasibility analysis for complex request |


### Communication

Prepare response to customer roadmap inquiry, then prepare customer communication about feature gap.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `roadmap_response` | Prepare response to customer roadmap inquiry |
| 2 | `gap_messaging` | Prepare customer communication about feature gap |


### Product Feedback

Synthesize product feedback from account, then document customer enhancement request formally.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `feedback_synthesis` | Synthesize product feedback from account |
| 2 | `enhancement_request` | Document customer enhancement request formally |


### Meeting Support

Prepare for CAB meeting with customer, then prepare product demonstration for customer.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `cab_prep` | Prepare for CAB meeting with customer |
| 2 | `product_demo` | Prepare product demonstration for customer |


## Scope Boundaries

The agent does not commit to feature delivery dates (handoff to PM Director), promise unreleased features (handoff to PM Director), override product prioritization (handoff to PM Director), make architecture decisions (SA Agent's domain) (handoff to SA Agent), or assess commercial viability (AE Agent's domain) (handoff to PM Director).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Technical implementation feasibility needed | SA Agent | Requirement details for technical implementation feasibility |
| Feature gap impact on deal | AE Agent | Analysis results and recommendations |
| Product capability constraints | SA Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `signal-detection.yaml` | Feature Requests, Roadmap Dependencies, Feasibility Constraints | Signal detection |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Feasibility Note | `{account}-feasibility-note.md` | Feasibility note |
| Roadmap Alignment Reports | `{account}-roadmap-alignment-reports.md` | Roadmap alignment reports |
| Feature Gap Analysis | `{account}-feature-gap-analysis.md` | Feature gap analysis |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/product_managers/pm-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/product_managers/agents/pm_agent.yaml` | Agent configuration |
| `domain/agents/product_managers/personalities/pm_personality.yaml` | Behavioral specification |
| `domain/agents/product_managers/prompts/tasks.yaml` | 11 CAF prompts across 5 domains |
