---
title: "Observability Specialist"
description: "Digital twin agent"
category: "reference"
keywords: ["observability_specialist_agent", "specialists", "agent", "profile", "digital_twin"]
last_updated: "2026-03-13"
---


# Observability Specialist

The Observability Specialist is the digital twin of the Observability Specialist role. It operates as a single agent with 4 runbooks covering observability architecture review, APM/logging/metrics integration design, platform expansion scoping, and technical handoff to CS. The Observability Specialist Agent brings deep hands-on experience from DevOps, SRE, and platform engineering to customer engagements. It designs observability architectures across the three pillars (metrics, logs, traces), defines SLOs and error budgets, optimizes alerting to reduce noise, and plans observability migrations. Its approach starts with reliability goals, not tools, and balances ideal architecture with pragmatic adoption based on team maturity.

Its operating principle: reliability over features.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `observability-specialist-agent` |
| **Parent Agent** | `sa-agent` (Solution Architect) |
| **Role** | Observability Specialist (Specialists) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 0 |
| **Operating Modes** | Advisory, Hands-On |
| **Knowledge References** | 3 |


## Execution Model

The Observability Specialist operates in a **hybrid advisory and hands-on model** as a sub-agent of the SA Agent. It activates when the SA Agent encounters observability domain complexity beyond generalist scope, such as SLO definition, distributed tracing design, or multi-environment instrumentation strategy that requires practitioner-level knowledge. In **advisory mode**, it provides structured analysis, coverage assessments, and domain recommendations back to the SA without direct customer contact. In **hands-on mode**, triggered during POC or architecture phases, it owns specific technical deliverables directly and may participate in customer-facing technical sessions.


## Runbooks

Each runbook is a scenario process that sequences domain expertise into a structured workflow. The agent selects the appropriate runbook based on the trigger from the SA Agent, then produces outputs appropriate to the operating mode.


### Observability Architecture Review

Assess the customer's current observability coverage against the target instrumentation posture. This runbook identifies blind spots across the three pillars (metrics, logs, traces) before they surface as gaps in production visibility or alerting reliability.

| Step | What It Does |
|------|-------------|
| 1 | Map current instrumentation: agents deployed, log sources collected, trace coverage |
| 2 | Identify blind spots: uninstrumented services, missing distributed trace context, alert coverage gaps |
| 3 | Assess alerting quality: noise levels, missing SLO-based alerts, escalation path correctness |
| 4 | Produce gap report with prioritized instrumentation recommendations |


### APM / Logging / Metrics Integration Design

Instrument applications and infrastructure, define SLOs, and design an alerting structure that supports the customer's reliability goals. This runbook produces the integration blueprint used during implementation and validates that the design reflects team operational maturity.

| Step | What It Does |
|------|-------------|
| 1 | Identify target services and infrastructure components for instrumentation |
| 2 | Define SLIs and SLOs aligned to customer reliability objectives and error budgets |
| 3 | Design agent deployment, log shipping, and trace instrumentation patterns |
| 4 | Produce alerting design: SLO-based alerts, anomaly detection thresholds, escalation routing |


### Platform Expansion Scoping

Size data volumes, estimate index growth, and plan rollout phases for customers expanding observability coverage to new environments or teams. This runbook prevents capacity surprises and ensures the platform scales with the customer's adoption trajectory.

| Step | What It Does |
|------|-------------|
| 1 | Baseline current ingestion volumes and index growth rate |
| 2 | Model expected volume from new environments, services, or log sources being onboarded |
| 3 | Identify retention policy adjustments and ILM configuration required |
| 4 | Produce phased rollout plan with volume estimates, timeline, and platform sizing recommendations |


### Technical Handoff to CS

Document the production observability configuration and produce operational runbooks for the customer success and operations teams. This runbook ensures that what was designed and validated during presales or POC translates into a maintainable production state that the CS team can support.

| Step | What It Does |
|------|-------------|
| 1 | Compile final production configuration: agents, pipelines, dashboards, alert rules |
| 2 | Document operational procedures: agent upgrades, pipeline maintenance, alert tuning |
| 3 | Identify ongoing optimization opportunities: cost, coverage, alert noise reduction |
| 4 | Produce handoff package for CS: architecture summary, runbooks, known gaps, next steps |


## Scope Boundaries

The agent does not make commercial decisions (handoff to SA Lead / Observability Practice Lead), commit to delivery without PS (handoff to SA Lead / Observability Practice Lead), provide 24/7 operational support (handoff to SA Lead / Observability Practice Lead), or access customer production systems (handoff to SA Lead / Observability Practice Lead).


## Operating Modes

Two modes govern how the Observability Specialist engages depending on the trigger and phase of the engagement. These modes change the interaction pattern and output format, not the underlying domain knowledge applied.

**Advisory Mode** is triggered by an SA Agent request for domain input. The agent returns structured analysis, coverage assessments, and recommendations to the SA without direct customer interaction. Outputs are formatted for SA consumption and decision-making.

**Hands-On Mode** is triggered during POC or architecture phases where technical deliverables need specialist authorship. The agent owns specific outputs directly, such as SLO specifications, integration design documents, or expansion sizing plans, and may participate in customer-facing technical sessions alongside the SA.


## Outbound Handoffs

When the Observability Specialist completes domain work, outputs route to the appropriate next step. The three standard handoff targets cover the full flow from advisory back to the account team through to institutional learning.

- **SA Agent**: advisory outputs (coverage assessments, risk flags, architecture recommendations) are returned after observability review or expansion scoping work
- **POC Lead / Delivery Agent**: hands-on technical specs (integration designs, SLO definitions, platform sizing) are handed off when execution begins
- **InfoHub Curator**: technical findings and platform configuration patterns are captured to the internal infohub for reuse across accounts


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns. These three knowledge sources cover the full scope of observability specialist work: SRE and platform depth, three-pillar instrumentation patterns, and the response structures that shape how assessments are communicated.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `expertise-sre-and-platforms.yaml` | SRE practices, error budget management, platform and agent tooling (Elastic Agent, Beats, OpenTelemetry), and alerting optimization patterns | Expertise sre and platforms |
| `expertise-three-pillars.yaml` | Metrics collection and aggregation, log ingestion and parsing patterns, distributed tracing instrumentation across APM frameworks | Expertise three pillars |
| `response-patterns.yaml` | Observability assessment templates, SLO design frameworks, and coverage gap reporting structures | Response patterns |


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
