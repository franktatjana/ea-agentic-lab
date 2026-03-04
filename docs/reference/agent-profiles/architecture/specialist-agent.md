---
title: "Specialist Engagement Agent"
description: "Sub-agent of SA for domain expertise routing and coordination"
category: "reference"
keywords: ["specialist_agent", "specialists", "agent", "profile", "digital_twin", "sub-agent"]
last_updated: "2026-03-04"
---


# Specialist Engagement Agent

The Specialist Engagement Agent is the digital twin of the Specialist Engagement role. It operates as a single agent with 4 runbooks covering engagement triage, technical deep dive, rfp poc, and knowledge transfer. The Specialist Agent monitors RFP/POC stages and complex customer questions to detect when domain-specific expertise is required. It does not provide specialist-level guidance itself, but ensures the right domain specialist (Observability, Search, Security, or Data Management) is engaged at the right time. Early specialist involvement prevents late-stage rework and failed POCs.

Its operating principle: early specialist engagement prevents late-stage rework.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `specialist-agent` |
| **Parent Agent** | `sa-agent` (Solution Architect) |
| **Role** | Specialist Engagement (Architecture) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 11 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 0 |
| **Toolbox** | `specialist-intelligence` |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Engagement Triage

Qualify incoming specialist engagement request. Then prioritize multiple specialist requests, and finally define clear scope for specialist engagement.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `request_qualification` | Qualify incoming specialist engagement request |
| 2 | `prioritization` | Prioritize multiple specialist requests |
| 3 | `scope_definition` | Define clear scope for specialist engagement |


### Technical Deep Dive

Conduct deep architecture review. Then perform detailed sizing for complex scenario, and finally analyze complex performance issue.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `architecture_review` | Conduct deep architecture review |
| 2 | `sizing_deep_dive` | Perform detailed sizing for complex scenario |
| 3 | `performance_analysis` | Analyze complex performance issue |


### Rfp Poc

Prepare technical content for RFP response. Then design POC architecture and success criteria, and finally review POC results and prepare customer presentation.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `rfp_technical_response` | Prepare technical content for RFP response |
| 2 | `poc_design` | Design POC architecture and success criteria |
| 3 | `poc_review` | Review POC results and prepare customer presentation |


### Knowledge Transfer

Prepare handback to SA after specialist engagement, then document best practices from engagement.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `sa_handback` | Prepare handback to SA after specialist engagement |
| 2 | `best_practice_doc` | Document best practices from engagement |


## Scope Boundaries

The agent does not provide specialist-level technical guidance (handoff to Specialist Lead), or make decisions on specialist's behalf (handoff to Specialist Lead).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

No dedicated knowledge references.


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Tech Summary | `{account}-tech-summary.md` | Tech summary |
| Specialist Engagement Recommendations | `{account}-specialist-engagement-recommendations.md` | Specialist engagement recommendations |
| Best Practice Alignment Reports | `{account}-best-practice-alignment-reports.md` | Best practice alignment reports |


## Autonomy

The Specialist Engagement Agent operates under the SA orchestrator with the following autonomy contract.

**Triggers:**

- SA orchestrator dispatches specialist engagement requests
- POC Agent escalates high technical risk scenarios
- RFP Agent routes deep technical sections requiring domain input

**Outputs:**

- Returns specialist findings and recommendations to SA orchestrator
- Triggers SA decision capture flow when engagement completes
- Alerts SA for high-complexity findings and blocked engagements

**Dependencies:** Security Specialist (SIEM, MITRE ATT&CK), Observability Specialist (APM, SLO/SLI), Search Specialist (vector search, RAG)

**Toolbox:** Exposes `get-engagement-status` and `get-specialist-findings` to peer agents via the `specialist-intelligence` toolbox.


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/specialists/specialist-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails, autonomy |
| `domain/agents/specialists/agents/specialist_agent.yaml` | Agent configuration |
| `domain/agents/specialists/personalities/specialist_personality.yaml` | Behavioral specification |
| `domain/agents/specialists/prompts/tasks.yaml` | 11 CAF prompts across 4 domains |
