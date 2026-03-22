---
title: "Hyperscaler Account Manager Agent"
description: "Digital twin for co-sell motion, marketplace transactions, and hyperscaler field alignment"
category: "reference"
keywords: ["ham-agent", "hyperscaler", "co-sell", "marketplace", "agent", "profile", "digital_twin"]
last_updated: "2026-03-22"
---


# Hyperscaler Account Manager Agent

The Hyperscaler Account Manager Agent is the digital twin of the Hyperscaler Account Manager role. It operates as an orchestrator with 4 specialized sub-agents covering co-sell opportunity qualification, marketplace transaction management, hyperscaler field alignment, and co-sell program health. Hyperscaler co-sell is a parallel sales system with its own qualification gates, consumption metrics, and incentive structures that most AEs cannot navigate alone. The agent tracks program mechanics, surfaces co-sell opportunities, monitors committed spend burn, and keeps marketplace listings current so that cloud budget becomes a buying catalyst rather than a procurement detour.

Its operating principle: co-sell is won or lost in the program mechanics, not the customer conversation.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `ham-agent` |
| **Role** | Hyperscaler Account Manager (Sales) |
| **Mode** | Human-paired |
| **Sub-Agents** | 4 |
| **Runbooks** | 4 |
| **Prompts** | 14 (runbook format) |
| **Skills** | 4 |
| **Knowledge References** | 3 |


## Sub-Agents

The orchestrator routes requests to specialized sub-agents. Each sub-agent owns one domain of the co-sell lifecycle.

| Sub-Agent | ID | Focus |
|-----------|----|----|
| Co-sell Qualification | `ham-cosell-qualification-agent` | Eligibility gates, readiness scoring, committed spend applicability |
| Marketplace | `ham-marketplace-agent` | Listing validation, private offers, procurement routing, consumption |
| Field Alignment | `ham-field-alignment-agent` | Session prep, opportunity registration, debrief capture |
| Program Health | `ham-program-health-agent` | Pipeline review, transaction summary, spend health, incentives |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps. All prompts follow the runbook design principles: STEP 0 input gate, numbered steps, named deliverables, quality checks, and run modes (FULL/QUICK/DISCOVERY).


### Co-sell Opportunity Qualification

Assess an inbound opportunity for co-sell eligibility, score readiness, and produce recommended next steps for the AE and Partner Manager.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `hyperscaler_involvement_check` | Confirm which hyperscaler(s) are active in the account and their current relationship tier |
| 2 | `committed_spend_applicability` | Assess whether the customer has uncommitted cloud spend eligible for marketplace draw-down |
| 3 | `ace_marketplace_fit` | Evaluate ACE/Partner Center eligibility gates: deal size, use case alignment, co-sell flag criteria |
| 4 | `cosell_readiness_score` | Produce co-sell readiness score (HIGH/MEDIUM/LOW) with recommended next steps and hyperscaler contact to engage |


### Marketplace Transaction Management

Track a deal through the full marketplace transaction lifecycle, from listing validation through consumption reporting, so procurement does not stall a qualified deal.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `listing_validation` | Verify that the correct SKU and pricing are live and available in the relevant marketplace |
| 2 | `private_offer_creation` | Generate private offer parameters: pricing, terms, duration, CPPO routing if applicable |
| 3 | `procurement_routing` | Confirm customer procurement path (direct marketplace, reseller, CPPO) and identify blockers |
| 4 | `consumption_reporting` | Report current consumption against committed spend and flag shortfall or overage risks |


### Hyperscaler Field Alignment

Prepare for and debrief a joint field session with AWS, Azure, or GCP reps, covering co-sell pitch, account mapping, and opportunity registration.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `field_session_prep` | Build joint account map, identify white space, align on co-sell pitch and hyperscaler rep ask |
| 2 | `opportunity_registration` | Register opportunity in ACE or Partner Center with required fields, co-sell flags, and deal metadata |
| 3 | `field_session_debrief` | Capture hyperscaler rep commitments, agreed next steps, and signals on account prioritization |


### Co-sell Program Health Review

Periodic review of program status across registered pipeline, closed transactions, consumption against committed spend, and co-sell incentive utilization.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `pipeline_registered_review` | Summarize registered pipeline by hyperscaler: stage, deal value, co-sell flag status |
| 2 | `transactions_closed_summary` | Summarize closed marketplace transactions in period: deal count, transaction value, hyperscaler split |
| 3 | `committed_spend_health` | Compare consumption to committed spend baseline, project burn rate, flag shortfall risk |


## Scope Boundaries

The agent does not own AE relationships or direct customer sales cycles (AE Agent's domain), negotiate contract terms with the customer (AE Agent), manage ISV or reseller partner programs (Partner Manager), make commitments on marketplace listing changes without product sign-off, or make pricing decisions (Deal Desk's domain).


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** monitors ACE pipeline, committed spend burn rates, and upcoming marketplace renewal windows. Surfaces alerts on stalled registrations, burn shortfalls, or expiring private offers without prompting. Prioritizes timeliness and keeps outputs concise and action-oriented.

**Analytical Mode** provides deep-dives into co-sell program performance, win/loss patterns by hyperscaler, and consumption shortfall root cause. Synthesizes across pipeline, transaction history, and field engagement data. Prioritizes accuracy and evidence trails over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `hyperscaler-program-mechanics.yaml` | AWS ISV Accelerate, Azure IP Co-sell, GCP Partner Advantage program rules, tiers, and incentive structures | Qualifying opportunities or reviewing program eligibility |
| `marketplace-transaction-playbook.yaml` | Private offer flows, CPPO mechanics, procurement routing for AWS Marketplace, Azure Marketplace, and GCP Marketplace | Managing an active marketplace transaction or training an AE on buying options |
| `cosell-qualification-criteria.yaml` | ACE/Partner Center eligibility gates, committed spend thresholds, co-sell scoring rubric | Running co-sell readiness scoring or preparing for a field alignment session |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Co-sell Readiness Score | `{account}-co-sell-readiness.md` | Co-sell eligibility assessment with score and recommended next steps |
| Marketplace Transaction Status | `{account}-marketplace-status.md` | Current transaction lifecycle status and procurement routing |
| Field Alignment Brief | `{account}-field-alignment-brief.md` | Joint session prep and debrief for hyperscaler field engagement |
| Program Health Summary | `{period}-co-sell-program-health.md` | Periodic review of registered pipeline, closed transactions, and committed spend |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/hyperscaler_account_managers/ham-agent-definition.yaml` | Orchestrator: routing, tools, profile, challenges, scenarios |
| `domain/agents/hyperscaler_account_managers/ham-cosell-qualification-definition.yaml` | Sub-agent: co-sell eligibility and readiness scoring |
| `domain/agents/hyperscaler_account_managers/ham-marketplace-definition.yaml` | Sub-agent: marketplace transaction lifecycle |
| `domain/agents/hyperscaler_account_managers/ham-field-alignment-definition.yaml` | Sub-agent: hyperscaler field session coordination |
| `domain/agents/hyperscaler_account_managers/ham-program-health-definition.yaml` | Sub-agent: program health and committed spend monitoring |
| `domain/agents/hyperscaler_account_managers/agents/ham_agent.yaml` | Agent runtime configuration |
| `domain/agents/hyperscaler_account_managers/personalities/ham_personality.yaml` | Orchestrator behavioral specification |
| `domain/agents/hyperscaler_account_managers/prompts/tasks.yaml` | 14 runbook prompts across 4 domains |
| `domain/agents/hyperscaler_account_managers/skills/SK_HAM_*.yaml` | 4 skill definitions |
| `domain/agents/hyperscaler_account_managers/references/*.yaml` | 3 knowledge reference files |
