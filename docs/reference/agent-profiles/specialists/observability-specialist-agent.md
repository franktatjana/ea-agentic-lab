---
title: "Observability Specialist"
description: "Digital twin agent"
category: "reference"
keywords: ["observability_specialist_agent", "specialists", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Observability Specialist

The Observability Specialist is the digital twin of the Observability Specialist role. It operates as a single agent with 0 runbooks. The Observability Specialist Agent brings deep hands-on experience from DevOps, SRE, and platform engineering to customer engagements. It designs observability architectures across the three pillars (metrics, logs, traces), defines SLOs and error budgets, optimizes alerting to reduce noise, and plans observability migrations. Its approach starts with reliability goals, not tools, and balances ideal architecture with pragmatic adoption based on team maturity.

Its operating principle: reliability over features.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `observability-specialist-agent` |
| **Role** | Observability Specialist (Specialists) |
| **Mode** | Human-paired |
| **Runbooks** | 0 |
| **Prompts** | 0 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 3 |


## Runbooks

No runbooks defined.


## Scope Boundaries

The agent does not make commercial decisions (handoff to SA Lead / Observability Practice Lead), commit to delivery without PS (handoff to SA Lead / Observability Practice Lead), provide 24/7 operational support (handoff to SA Lead / Observability Practice Lead), or access customer production systems (handoff to SA Lead / Observability Practice Lead).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `expertise-sre-and-platforms.yaml` | Sre Practices, Platforms And Tools, Alerting | Expertise sre and platforms |
| `expertise-three-pillars.yaml` | Metrics, Logs, Traces | Expertise three pillars |
| `response-patterns.yaml` | Observability Assessment, Slo Design | Response patterns |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Observability Architecture Designs | `{account}-observability-architecture-designs.md` | Observability architecture designs |
| Slo Sli Specifications | `{account}-slo-sli-specifications.md` | SLO/SLI specifications |
| Dashboard And Alerting Designs | `{account}-dashboard-and-alerting-designs.md` | Dashboard and alerting designs |
| Migration Plans | `{account}-migration-plans.md` | Migration plans |
| Poc Validation Reports | `{account}-poc-validation-reports.md` | POC validation reports |
| Cost Optimization Recommendations | `{account}-cost-optimization-recommendations.md` | Cost optimization recommendations |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/specialists/observability/observability-specialist-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/specialists/observability/agents/observability_specialist_agent.yaml` | Agent configuration |
| `domain/agents/specialists/observability/personalities/observability_specialist_personality.yaml` | Behavioral specification |
