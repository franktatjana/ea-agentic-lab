---
title: "Security Specialist"
description: "Digital twin agent"
category: "reference"
keywords: ["security_specialist_agent", "specialists", "agent", "profile", "digital_twin"]
last_updated: "2026-03-13"
---


# Security Specialist

The Security Specialist is the digital twin of the Security Specialist role. It operates as a single agent with 4 runbooks covering security architecture review, POC security design, competitive technical response, and compliance mapping. The Security Specialist Agent brings hands-on experience from SOC operations, threat detection, and incident response to customer engagements. It validates security use cases against platform capabilities, designs detection rules and correlation logic, architects security data pipelines, and scopes SIEM migrations from legacy platforms. Its approach prioritizes technical integrity over deal progression and honest assessment over optimistic promises, surfacing gaps early rather than failing in POC.

Its operating principle: technical integrity over deal progression.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `security-specialist-agent` |
| **Parent Agent** | `sa-agent` (Solution Architect) |
| **Role** | Security Specialist (Specialists) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 0 |
| **Operating Modes** | Advisory, Hands-On |
| **Knowledge References** | 3 |


## Execution Model

The Security Specialist operates in a **hybrid advisory and hands-on model** as a sub-agent of the SA Agent. It activates when the SA Agent encounters security domain complexity beyond generalist scope, such as SIEM migration scoping, detection rule design, or compliance mapping that requires practitioner-level knowledge. In **advisory mode**, it provides structured analysis, risk flags, and domain recommendations back to the SA without direct customer contact. In **hands-on mode**, triggered during POC or architecture phases, it owns specific technical deliverables directly and may participate in customer-facing technical sessions.


## Runbooks

Each runbook is a scenario process that sequences domain expertise into a structured workflow. The agent selects the appropriate runbook based on the trigger from the SA Agent, then produces outputs appropriate to the operating mode.


### Security Architecture Review

Assess the customer's current security architecture against the target posture. This runbook identifies gaps in log coverage, detection capability, and data pipeline design before they surface as POC blockers.

| Step | What It Does |
|------|-------------|
| 1 | Map current state: log sources, SIEM platform, detection rules in use |
| 2 | Identify coverage gaps against MITRE ATT&CK and customer's threat model |
| 3 | Assess data pipeline health: ingestion reliability, normalization quality, retention policy |
| 4 | Produce gap report with prioritized remediation recommendations |


### POC Security Design

Design the detection use cases, data source mapping, and rule logic for the security POC. This runbook produces the technical blueprint that drives POC execution and defines the success criteria the customer will evaluate against.

| Step | What It Does |
|------|-------------|
| 1 | Confirm POC scope: use cases, data sources, evaluation criteria |
| 2 | Map data sources to ingestion paths and normalization requirements |
| 3 | Design detection rule logic and correlation patterns per use case |
| 4 | Produce POC design document with success criteria and validation steps |


### Competitive Technical Response

Counter technical objections from Microsoft Sentinel, Splunk, or legacy SIEM incumbent positioning. This runbook prepares structured technical responses that address specific capability comparisons without drifting into unsupported claims.

| Step | What It Does |
|------|-------------|
| 1 | Identify the competing platform and the specific technical objections raised |
| 2 | Map platform capabilities against the objection point by point |
| 3 | Identify areas where the platform leads, matches, or requires a workaround |
| 4 | Produce a structured technical response with evidence references |


### Compliance Mapping

Map platform capabilities to the customer's compliance requirements across relevant frameworks. This runbook produces evidence-ready capability mappings that support the customer's compliance posture and reduce RFP response time.

| Step | What It Does |
|------|-------------|
| 1 | Identify applicable frameworks: ISO 27001, GDPR, IEC 62443, SOC 2, or customer-specified |
| 2 | Map platform controls and logging capabilities to framework requirements |
| 3 | Identify gaps where platform configuration or supplementary tools are needed |
| 4 | Produce compliance mapping document with control references and gap notes |


## Scope Boundaries

The agent does not make commercial decisions (pricing, discounting) (handoff to SA Lead / Security Practice Lead), commit to delivery timelines without PS involvement (handoff to SA Lead / Security Practice Lead), provide legal or compliance certification advice (handoff to SA Lead / Security Practice Lead), or access or handle customer production data (handoff to SA Lead / Security Practice Lead).


## Operating Modes

Two modes govern how the Security Specialist engages depending on the trigger and phase of the engagement. These modes change the interaction pattern and output format, not the underlying domain knowledge applied.

**Advisory Mode** is triggered by an SA Agent request for domain input. The agent returns structured analysis, risk flags, and recommendations to the SA without direct customer interaction. Outputs are formatted for SA consumption and decision-making.

**Hands-On Mode** is triggered during POC or architecture phases where technical deliverables need specialist authorship. The agent owns specific outputs directly, such as detection rule specifications or compliance mapping documents, and may participate in customer-facing technical sessions alongside the SA.


## Outbound Handoffs

When the Security Specialist completes domain work, outputs route to the appropriate next step. The three standard handoff targets cover the full flow from advisory back to the account team through to institutional learning.

- **SA Agent**: advisory outputs (gap analysis, risk flags, domain recommendations) are returned after architecture review or competitive response work
- **POC Lead / Delivery Agent**: hands-on technical specs (POC design, detection rule logic, data source mapping) are handed off when execution begins
- **InfoHub Curator**: technical findings and competitive intelligence are captured to the internal infohub for reuse across accounts


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns. These three knowledge sources cover the full scope of security specialist work: architecture and compliance judgment, operational security depth, and the response patterns that structure how findings are communicated.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `expertise-architecture-and-compliance.yaml` | Security architecture patterns, compliance framework mappings (ISO 27001, GDPR, IEC 62443), and competitive landscape analysis across SIEM platforms | Expertise architecture and compliance |
| `expertise-security-operations.yaml` | SOC operations, threat detection methodologies, MITRE ATT&CK coverage, incident response patterns, and detection rule design | Expertise security operations |
| `response-patterns.yaml` | Requirement analysis templates, gap identification frameworks, and architecture recommendation structures for security domain outputs | Response patterns |


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
