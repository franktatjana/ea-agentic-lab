---
title: "Search Specialist"
description: "Digital twin agent"
category: "reference"
keywords: ["search_specialist_agent", "specialists", "agent", "profile", "digital_twin"]
last_updated: "2026-03-13"
---


# Search Specialist

The Search Specialist is the digital twin of the Search Specialist role. It operates as a single agent with 4 runbooks covering search architecture review, search POC design, search platform migration, and performance and scale design. The Search Specialist Agent brings deep expertise in information retrieval, search architecture, and relevance engineering to customer engagements. It understands both traditional keyword search (BM25, TF-IDF) and modern vector/semantic search approaches, and helps customers design search experiences that deliver the right information at the right time. It bridges the gap between search science and business outcomes, focusing on measurable relevance improvements over theoretical perfection.

Its operating principle: user experience over technical elegance.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `search-specialist-agent` |
| **Parent Agent** | `sa-agent` (Solution Architect) |
| **Role** | Search Specialist (Specialists) |
| **Mode** | Human-paired |
| **Runbooks** | 4 |
| **Prompts** | 0 |
| **Operating Modes** | Advisory, Hands-On |
| **Knowledge References** | 3 |


## Execution Model

The Search Specialist operates in a **hybrid advisory and hands-on model** as a sub-agent of the SA Agent. It activates when the SA Agent encounters search domain complexity beyond generalist scope, such as relevance tuning strategy, vector search architecture, RAG pipeline design, or migration from legacy search platforms that requires practitioner-level knowledge. In **advisory mode**, it provides structured analysis, relevance assessments, and domain recommendations back to the SA without direct customer contact. In **hands-on mode**, triggered during POC or architecture phases, it owns specific technical deliverables directly and may participate in customer-facing technical sessions.


## Runbooks

Each runbook is a scenario process that sequences domain expertise into a structured workflow. The agent selects the appropriate runbook based on the trigger from the SA Agent, then produces outputs appropriate to the operating mode.


### Search Architecture Review

Assess the customer's current search setup against their relevance requirements and data ingestion patterns. This runbook identifies architectural gaps, indexing inefficiencies, and relevance weaknesses before they affect POC outcomes or production search quality.

| Step | What It Does |
|------|-------------|
| 1 | Map current state: data sources, index structure, ingestion pipelines, query patterns |
| 2 | Assess relevance approach: scoring model, field weighting, language analysis configuration |
| 3 | Identify gaps: missing data sources, poor normalization, lack of semantic coverage |
| 4 | Produce architecture assessment with prioritized improvement recommendations |


### Search POC Design

Define the corpus, relevance criteria, and evaluation metrics for the search POC. This runbook produces a blueprint that makes success measurable and avoids subjective relevance debates during customer evaluation.

| Step | What It Does |
|------|-------------|
| 1 | Confirm POC scope: use cases, target corpus, user query patterns |
| 2 | Define relevance criteria: precision, recall, nDCG targets, and business-specific ranking rules |
| 3 | Design index schema, field mappings, and relevance pipeline (BM25, vector, or hybrid) |
| 4 | Produce POC design document with evaluation metrics, test query sets, and success thresholds |


### Search Platform Migration

Map the customer's current search platform to the target architecture and define a cutover approach that minimizes risk to production search availability. This runbook handles both feature-parity gaps and index rebuild logistics.

| Step | What It Does |
|------|-------------|
| 1 | Inventory existing platform: index schemas, synonym files, boosting rules, custom analyzers |
| 2 | Map each element to the target platform equivalent, flagging gaps requiring redesign |
| 3 | Design data reingestion plan: source connectors, transformation logic, validation criteria |
| 4 | Produce migration plan with phased cutover approach, rollback triggers, and cutover checklist |


### Performance and Scale Design

Design shard strategy, replica configuration, and query optimization patterns to ensure the search cluster performs under production load. This runbook prevents performance regressions that surface after go-live and are expensive to fix post-deployment.

| Step | What It Does |
|------|-------------|
| 1 | Baseline performance requirements: query latency targets, indexing throughput, peak load profile |
| 2 | Design shard strategy: primary shard count, shard sizing, rollover or ILM policy if time-series |
| 3 | Configure replica topology for search throughput and availability requirements |
| 4 | Produce query optimization recommendations: caching strategy, async search patterns, slow query patterns to avoid |


## Scope Boundaries

The agent does not make commercial decisions (handoff to SA Lead / Search Practice Lead), commit to delivery without PS (handoff to SA Lead / Search Practice Lead), write production-ready ML models (handoff to SA Lead / Search Practice Lead), or access customer production data (handoff to SA Lead / Search Practice Lead).


## Operating Modes

Two modes govern how the Search Specialist engages depending on the trigger and phase of the engagement. These modes change the interaction pattern and output format, not the underlying domain knowledge applied.

**Advisory Mode** is triggered by an SA Agent request for domain input. The agent returns structured analysis, relevance assessments, and recommendations to the SA without direct customer interaction. Outputs are formatted for SA consumption and decision-making.

**Hands-On Mode** is triggered during POC or architecture phases where technical deliverables need specialist authorship. The agent owns specific outputs directly, such as index schema specifications, relevance pipeline designs, or migration plans, and may participate in customer-facing technical sessions alongside the SA.


## Outbound Handoffs

When the Search Specialist completes domain work, outputs route to the appropriate next step. The three standard handoff targets cover the full flow from advisory back to the account team through to institutional learning.

- **SA Agent**: advisory outputs (architecture assessments, relevance risk flags, domain recommendations) are returned after search review or platform evaluation work
- **POC Lead / Delivery Agent**: hands-on technical specs (POC design, index schema, migration plan, performance design) are handed off when execution begins
- **InfoHub Curator**: technical findings, relevance tuning configurations, and competitive intelligence are captured to the internal infohub for reuse across accounts


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns. These three knowledge sources cover the full scope of search specialist work: advanced retrieval and RAG design, foundational search theory and practice, and the response structures that shape how assessments are communicated.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `expertise-advanced-search.yaml` | Vector search architecture, dense retrieval models, hybrid BM25+vector approaches, RAG pipeline design, and semantic relevance engineering | Expertise advanced search |
| `expertise-search-fundamentals.yaml` | Traditional information retrieval (BM25, TF-IDF), index design, language analysis, field mapping patterns, synonym management, and relevance scoring fundamentals | Expertise search fundamentals |
| `response-patterns.yaml` | Architecture recommendation templates, relevance assessment frameworks, and migration analysis structures for search domain outputs | Response patterns |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Search Architecture Designs | `{account}-search-architecture-designs.md` | Search architecture designs |
| Index Schema Specifications | `{account}-index-schema-specifications.md` | Index schema specifications |
| Relevance Tuning Configurations | `{account}-relevance-tuning-configurations.md` | Relevance tuning configurations |
| Query Optimization Recommendations | `{account}-query-optimization-recommendations.md` | Query optimization recommendations |
| Poc Validation Reports | `{account}-poc-validation-reports.md` | POC validation reports |
| Migration Plans | `{account}-migration-plans.md` | Migration plans |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/specialists/search/search-specialist-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/specialists/search/agents/search_specialist_agent.yaml` | Agent configuration |
| `domain/agents/specialists/search/personalities/search_specialist_personality.yaml` | Behavioral specification |
