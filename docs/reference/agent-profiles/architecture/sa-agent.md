---
title: "Solution Architect Agent"
description: "Digital twin for decision capture, technical discovery, technical risk"
category: "reference"
keywords: ["sa_agent", "solution-architects", "agent", "profile", "digital_twin"]
last_updated: "2026-03-01"
---


# Solution Architect Agent

The Solution Architect Agent is the digital twin of the Solution Architect role. It operates as a single agent with 9 runbooks covering decision capture, technical discovery, technical risk, specialist engagement, infohub validation, meeting support, customer success plan, best practices, and customer journey. The SA Agent monitors technical signals across accounts, extracts decisions from meetings and daily operations, and surfaces risks before they escalate. It connects every technical decision to its architecture impact and validates that the InfoHub stays complete and current. When complex topics arise, it triggers specialist engagement rather than overreaching its own domain.

Its operating principle: accuracy over speed - verify before asserting.

## Identity

| Attribute | Value |
|-----------|-------|
| **Agent ID** | `sa-agent` |
| **Role** | Solution Architect (Architecture) |
| **Mode** | Human-paired |
| **Runbooks** | 9 |
| **Prompts** | 44 |
| **Operating Modes** | Proactive, Analytical |
| **Knowledge References** | 4 |


## Runbooks

Each runbook is a scenario process that sequences prompts into a multi-step workflow. The agent selects the appropriate runbook based on the incoming trigger, then executes its prompt sequence with data flowing between steps.


### Decision Capture

Capture technical decisions from meetings, frame their architecture impact, and generate ADRs when warranted

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `decision_capture_analyze` | Analyze input |
| 2 | `decision_capture_synthesize` | Synthesize findings |
| 3 | `decision_capture_output` | Generate output |


### Technical Discovery

Conduct structured technical discovery covering business outcomes, current state, requirements, stakeholders, and timeline

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `technical_discovery_analyze` | Analyze input |
| 2 | `technical_discovery_synthesize` | Synthesize findings |
| 3 | `technical_discovery_output` | Generate output |


### Technical Risk

Evaluate current deployment health and identify risks. Then diagnose reported performance issues, then assess capacity for planned growth, and finally evaluate risks in proposed or existing integrations.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `architecture_health_check` | Evaluate current deployment health and identify risks |
| 2 | `performance_investigation` | Diagnose reported performance issues |
| 3 | `capacity_planning` | Assess capacity for planned growth |
| 4 | `integration_risk_assessment` | Evaluate risks in proposed or existing integrations |


### Specialist Engagement

Determine if specialist involvement is needed, then prepare formal specialist request.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `specialist_need_assessment` | Determine if specialist involvement is needed |
| 2 | `specialist_request` | Prepare formal specialist request |


### Infohub Validation

Check if account InfoHub is complete and current, then identify stale content needing update.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `completeness_check` | Check if account InfoHub is complete and current |
| 2 | `staleness_report` | Identify stale content needing update |


### Meeting Support

Prepare for technical customer meeting. Then extract technical insights from meeting, and finally prepare for sizing/capacity discussion.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `technical_prep` | Prepare for technical customer meeting |
| 2 | `technical_debrief` | Extract technical insights from meeting |
| 3 | `sizing_session` | Prepare for sizing/capacity discussion |


### Customer Success Plan

Start CSP when opportunity enters Stage 2 with ARR > $100K. Then add technical evaluation plan to CSP, then define phased adoption plan in CSP, then complete CSP and prepare for customer presentation, and finally prepare CSP handoff from SA to CA at deal close.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `initiate_csp` | Start CSP when opportunity enters Stage 2 with ARR > $100K |
| 2 | `develop_csp_technical` | Add technical evaluation plan to CSP |
| 3 | `develop_csp_adoption` | Define phased adoption plan in CSP |
| 4 | `finalize_csp` | Complete CSP and prepare for customer presentation |
| 5 | `csp_handoff_prep` | Prepare CSP handoff from SA to CA at deal close |


### Best Practices

Document a new best practice following the standard template. Then prepare for customer meeting using best practice content, then create or update Q&A section for a best practice, then refresh best practice with new information, and finally identify missing best practices for solution area.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `create_best_practice` | Document a new best practice following the standard template |
| 2 | `meeting_prep_from_best_practice` | Prepare for customer meeting using best practice content |
| 3 | `generate_qa_content` | Create or update Q&A section for a best practice |
| 4 | `update_best_practice` | Refresh best practice with new information |
| 5 | `best_practice_gap_analysis` | Identify missing best practices for solution area |


### Customer Journey

Start journey mapping when opportunity enters Stage 2. Then document touchpoints after discovery meetings, then create detailed journey view per key stakeholder, then document POV/POC journey touchpoints, then prepare journey map handoff at deal close, and finally document qualitative feedback from interactions.

| Step | Prompt | What It Does |
|------|--------|-------------|
| 1 | `initiate_journey_map` | Start journey mapping when opportunity enters Stage 2 |
| 2 | `map_discovery_touchpoints` | Document touchpoints after discovery meetings |
| 3 | `map_stakeholder_journeys` | Create detailed journey view per key stakeholder |
| 4 | `map_evaluation_journey` | Document POV/POC journey touchpoints |
| 5 | `journey_handoff_to_ca` | Prepare journey map handoff at deal close |
| 6 | `capture_presales_feedback` | Document qualitative feedback from interactions |


## Scope Boundaries

The agent does not make technical decisions on behalf of humans (handoff to PM/Leadership), recommend specific architectures without human review (handoff to PM/Leadership), promise features or capabilities not documented (handoff to PM/Leadership), invent information not present in source content (handoff to PM/Leadership), override human decisions or assessments (handoff to PM/Leadership), handle commercial/sales activities (AE Agent's domain) (handoff to AE Agent), track delivery progress (Delivery Agent's domain) (handoff to Delivery Agent), or monitor competitive intelligence (CI Agent's domain) (handoff to PM/Leadership).


## Handoffs

### Outbound (this agent to others)

| Trigger | Receiving Agent | Context Passed |
|---------|-----------------|----------------|
| Commercial decisions, customer relationship health needed | AE Agent | Requirement details for commercial decisions, customer relationship health |
| Roadmap questions, feature feasibility needed | PM Agent | Requirement details for roadmap questions, feature feasibility |
| Implementation status, delivery risks needed | Delivery Agent | Requirement details for implementation status, delivery risks |
| Technical context for their domain | All Agents | Analysis results and recommendations |
| Technical risk impact on commercial outcomes | AE Agent | Analysis results and recommendations |
| Customer technical requirements | PM Agent | Analysis results and recommendations |


## Operating Modes

Two specialized modes adjust behavior without changing the underlying runbooks or prompts.

**Proactive Mode** scans for signals and surfaces insights without prompting. Prioritizes timeliness over depth. Keeps outputs concise and action-oriented.

**Analytical Mode** provides deep analysis with comprehensive evidence trails. Synthesizes across multiple data points. Prioritizes accuracy and defensibility over speed.


## Knowledge Base

The agent draws on reference knowledge that encodes domain expertise and decision patterns.

| Reference | Content | Loaded By |
|-----------|---------|-----------|
| `infohub-validation.yaml` | Completeness Checks, Staleness Thresholds | Infohub validation |
| `signal-detection.yaml` | Technical Risks, Technical Decisions, Architecture Patterns | Signal detection |
| `specialist-triggers.yaml` | When To Flag, Domains | Specialist triggers |
| `glossary-and-resources.md` | Glossary And Resources | Glossary and resources |


## Output Artifacts

The agent produces artifact types stored per account in the Node's InfoHub.

| Artifact | Format | Purpose |
|----------|--------|---------|
| Risk Notes | `{account}-risk-notes.md` | Risk notes |
| Technical Decision Logs | `{account}-technical-decision-logs.md` | Technical decision logs |
| Architecture Impact Assessments | `{account}-architecture-impact-assessments.md` | Architecture impact assessments |
| Client Technical Profiles | `{account}-client-technical-profiles.md` | Client technical profiles |


## Source Files

| File | Purpose |
|------|---------|
| `domain/agents/solution_architects/sa-agent-definition.yaml` | System view: runbooks, tools, prompts, guardrails |
| `domain/agents/solution_architects/agents/sa_agent.yaml` | Agent configuration |
| `domain/agents/solution_architects/personalities/sa_personality.yaml` | Behavioral specification |
| `domain/agents/solution_architects/prompts/tasks.yaml` | 44 CAF prompts across 9 domains |
