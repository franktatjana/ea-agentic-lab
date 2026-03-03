---
title: "InfoSec Agent"
description: "Digital twin for questionnaires, gap analysis, risk translation"
category: "reference"
keywords: ["infosec_agent", "infosec", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# InfoSec Agent

The InfoSec Agent is the digital twin of the InfoSec role. It operates as a single agent with 5 runbooks covering questionnaires, gap analysis, risk translation, deal enablement, and compliance tracking. The InfoSec Agent completes security questionnaires, assesses customer security requirements against vendor capabilities, and translates security concerns into business risk. It classifies compliance gaps using a four-tier framework (blocker, workaround, roadmap, compliant) and finds creative paths to resolve security blockers. The agent operates on the principle that transparency builds trust faster than perfection, and that compensating controls are valid solutions.

Its operating principle: security enables business, doesn't block it.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `infosec-agent` |
| **Role** | InfoSec (Deal Execution) |
| **Mode** | Human-paired |
| **Runbooks** | 5 |
| **Prompts** | 13 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 2 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Questionnaires

Complete security questionnaire for customer. Then draft answer to specific security question, and finally generate responses for multiple questions.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `process_questionnaire` | Complete security questionnaire for customer |
| 2 | `answer_question` | Draft answer to specific security question |
| 3 | `bulk_questionnaire_response` | Generate responses for multiple questions |


### Gap Analysis

Analyze customer security requirements vs capabilities. Then assess gaps for specific compliance framework, and finally assess data residency requirements and options.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `assess_customer_requirements` | Analyze customer security requirements vs capabilities |
| 2 | `compliance_gap_assessment` | Assess gaps for specific compliance framework |
| 3 | `data_residency_assessment` | Assess data residency requirements and options |


### Risk Translation

Convert security concern to business impact, then prepare security briefing for customer meeting.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `translate_security_concern` | Convert security concern to business impact |
| 2 | `prepare_security_briefing` | Prepare security briefing for customer meeting |


### Deal Enablement

Find path to resolve security blocker. Then fast-track questionnaire completion, and finally provide certification roadmap for customer.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `unblock_security_issue` | Find path to resolve security blocker |
| 2 | `expedite_questionnaire` | Fast-track questionnaire completion |
| 3 | `certification_roadmap` | Provide certification roadmap for customer |


### Compliance Tracking

Update on certification status, then update evidence library for compliance.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `certification_status_update` | Update on certification status |
| 2 | `evidence_library_update` | Update evidence library for compliance |


## Scope Boundaries

The agent does not make exceptions to security policies (handoff to Leadership), commit to certification timelines not confirmed (handoff to Leadership), downplay legitimate security gaps (handoff to Leadership), design customer security architecture (SA Agent's domain) (handoff to SA Agent), negotiate security contract terms (Legal's domain) (handoff to Leadership), or fabricate compliance status (handoff to Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Customer security architecture design needed | SA Agent | Requirement details for customer security architecture design |
| Feature roadmap timelines needed | PM Agent | Requirement details for feature roadmap timelines |
| Security questionnaire responses | RFP Agent | Analysis results and recommendations |
| Deal risk assessment from security perspective | AE Agent | Analysis results and recommendations |
| Compliance context for architecture decisions | SA Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `gap-classification.yaml` | Blocker, Workaround, Roadmap | Gap classification |
| `signal-detection.yaml` | Security Concerns, Compliance Signals, Industry Specific | Signal detection |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/infosec/infosec-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/infosec/agents/infosec_agent.yaml` | Agent configuration |
| `domain/agents/infosec/personalities/infosec_personality.yaml` | Behavioral specification |
| `domain/agents/infosec/prompts/tasks.yaml` | 13 CAF prompts across 5 domains |
