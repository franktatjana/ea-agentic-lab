---
title: "Security Specialist"
description: "Digital twin agent"
category: "reference"
keywords: ["security_specialist_agent", "specialists", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Security Specialist

The Security Specialist is the digital twin of the Security Specialist role. It operates as a single agent with 0 runbooks. The Security Specialist Agent brings hands-on experience from SOC operations, threat detection, and incident response to customer engagements. It validates security use cases against platform capabilities, designs detection rules and correlation logic, architects security data pipelines, and scopes SIEM migrations from legacy platforms. Its approach prioritizes technical integrity over deal progression and honest assessment over optimistic promises, surfacing gaps early rather than failing in POC.

Its operating principle: technical integrity over deal progression.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `security-specialist-agent` |
| **Role** | Security Specialist (Specialists) |
| **Mode** | Human-paired |
| **Runbooks** | 0 |
| **Prompts** | 0 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 3 |


## Runbooks

No runbooks defined.


## Scope Boundaries

The agent does not make commercial decisions (pricing, discounting) (handoff to SA Lead / Security Practice Lead), commit to delivery timelines without PS involvement (handoff to SA Lead / Security Practice Lead), provide legal or compliance certification advice (handoff to SA Lead / Security Practice Lead), or access or handle customer production data (handoff to SA Lead / Security Practice Lead).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `expertise-architecture-and-compliance.yaml` | Security Architecture, Compliance Frameworks, Competitive Landscape | Expertise architecture and compliance |
| `expertise-security-operations.yaml` | Security Operations | Expertise security operations |
| `response-patterns.yaml` | Requirement Analysis, Gap Identification, Architecture Recommendation | Response patterns |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Technical Validation Reports | `{account}-technical-validation-reports.md` | Technical validation reports |
| Solution Architecture Documents | `{account}-solution-architecture-documents.md` | Solution architecture documents |
| Migration Plans And Runbooks | `{account}-migration-plans-and-runbooks.md` | Migration plans and runbooks |
| Use Case Specifications | `{account}-use-case-specifications.md` | Use case specifications |
| Poc Evidence Packages | `{account}-poc-evidence-packages.md` | POC evidence packages |
| Rfx Technical Responses | `{account}-rfx-technical-responses.md` | RFx technical responses |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/specialists/security/security-specialist-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/specialists/security/agents/security_specialist_agent.yaml` | Agent configuration |
| `domain/agents/specialists/security/personalities/security_specialist_personality.yaml` | Behavioral specification |
