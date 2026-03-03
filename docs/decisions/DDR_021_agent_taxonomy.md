# DDR-021: Agent Taxonomy

**Status:** ACCEPTED
**Date:** 2026-03-01
**Category:** Domain Decision Record
**Extends:** DDR-019 (agent system domain model), DDR-020 (profile and definition generation pipeline)

---

## Context

The system has 33 agent definitions and 33 agent profiles, generated 1:1. DDR-019 established that agents are digital twins of human roles, that sub-agents are warranted when capabilities require different tools/guardrails/autonomy, and that "profiles and definitions having different counts is structurally correct."

Despite this, profiles were generated one-per-definition, treating every agent as a peer. This created profiles for process functions that no human occupies as a job role:

| Agent | What it actually is | Job title? |
|-------|-------------------|------------|
| POC Agent | A process the SA runs | No |
| RFP Agent | A process the SA leads | No |
| Meeting Notes Agent | A governance function | No |
| Nudger Agent | An automated reminder system | No |
| Task Shepherd Agent | Action item validation | No |

Meanwhile, five intelligence agents (ACI, II, MNA, Tech Scout Scanner, Tech Scout Analyzer) perform analytical functions that belong to a single "Intelligence Analyst" role, not five separate human positions.

The result: profiles don't represent the human view DDR-019 intended. They're reformatted definitions.

---

## Decision

Classify all 33 agents into two categories: **role agents** (digital twins of human job titles) and **sub-agents** (process functions owned by a role or system function). Profiles represent roles. Definitions represent agents. The counts are intentionally different.

### The Taxonomy

12 roles own 33 agent definitions:

| # | Role | Category | Sub-agents |
|---|------|----------|------------|
| 1 | **Account Executive** | Sales | |
| 2 | **Competitive Intelligence** | Sales | |
| 3 | **Partner Manager** | Sales | |
| 4 | **Value Engineer** | Sales | |
| 5 | **Solution Architect** | Architecture | POC, RFP, InfoSec, Specialist Engagement, Observability Specialist, Search Specialist, Security Specialist |
| 6 | **Customer Architect** | Architecture | Retrospective |
| 7 | **Intelligence Analyst** | Intelligence | Account Intelligence, Industry Intelligence, Market News, Tech Scout Scanner, Tech Scout Analyzer |
| 8 | **Senior Manager** | Leadership | |
| 9 | **Product Manager** | Leadership | |
| 10 | **Delivery Manager** | Delivery | |
| 11 | **Professional Services** | Delivery | |
| 12 | **Governance** | System | Meeting Notes, Task Shepherd, Decision Registrar, Risk Radar, Nudger, Reporter, Signal Matcher, Playbook Curator, InfoHub Curator, Knowledge Vault Curator |

### Classification Criteria

A **role agent** meets all of these:
- Maps to a human job title someone would hold
- Has standalone accountability (owns outcomes, not just tasks)
- Makes decisions within its domain (not just executing a process)

A **sub-agent** meets one or more of these:
- Represents a process or function, not a job title
- Is activated by a parent role to handle a specific scenario
- Would be described as "something the [parent role] does" rather than "someone on the team"

### Governance as a System Function

The 10 governance agents form an automated system, not a human role. They operate on events and schedules (meeting_ended, action_created, Friday 5pm). No human's job title is "Nudger" or "Task Shepherd." They are system infrastructure that supports all roles, comparable to CI/CD pipelines or monitoring systems.

Governance agents still have definitions (the system needs them) but don't map to a human role profile. They are documented collectively as the "Governance System."

### Intelligence Analyst as a Composite Role

Intelligence analysis is a human function. Organizations have people who research accounts, track industries, monitor markets, and scout technologies. Rather than five separate roles (which no org would staff), these five agents serve one Intelligence Analyst role that provides research capabilities across different scopes: account-level (ACI), industry-level (II), market-level (MNA), and technology-level (Scanner + Analyzer).

---

## Alternatives Considered

### Keep flat 33 (status quo)

Every agent gets its own profile regardless of whether it's a human role.

- Pro: Simple, no reclassification needed
- Pro: Every agent is self-documenting
- Con: Profiles claim to be "human view" but nobody's job is "Nudger Agent"
- Con: Contradicts DDR-019's statement that profile/definition counts should differ
- **Rejected**: Sacrifices the conceptual integrity DDR-019 established

### Fold governance into Senior Manager

Senior Manager oversees governance, so governance agents become SM's sub-agents.

- Pro: Clear ownership
- Con: SM already has 6 runbooks and 18 prompts, adding 10 governance agents overloads the role
- Con: Governance operates autonomously on schedules, SM operates on escalations. Different operational patterns
- **Rejected**: SM oversees governance outcomes but doesn't own the operational mechanics

### Fold intelligence into AE

AE is the primary consumer of intelligence, so intelligence agents become AE's sub-agents.

- Pro: Intelligence feeds directly into deal execution
- Con: Intelligence serves multiple roles (SA, PM, CA also consume intelligence outputs)
- Con: Some orgs have dedicated CI/intelligence teams separate from sales
- **Rejected**: Intelligence serves the whole account team, not just AE. A separate composite role is more accurate.

---

## Consequences

### What Changes (Conceptual)

- Agents are classified as either role agents or sub-agents
- Profiles represent human roles (12), not individual agents (33)
- The profile index is restructured to show role hierarchy with sub-agents nested under parent roles
- Governance is explicitly a system function, not a human role

### What Changes (Structural, Future)

- Profile markdown files will be consolidated: sub-agent capabilities folded into parent role profiles
- Profile generator will need a "role profile" mode that aggregates sub-agent runbooks
- Profile index restructured now (this DDR), file reorganization deferred

### What Stays the Same

- All 33 agent definitions (unchanged, the system needs every agent)
- All personality YAML files
- All tasks.yaml prompt files
- The definition generator and its output
- Agent handoff relationships

---

## Related Decisions

- **DDR-019**: Agent system domain model (holonic architecture, digital twin concept, sub-agent criteria)
- **DDR-020**: Profile and definition generation pipeline (created the 33 profiles this DDR reclassifies)
- **DDR-015**: Curator agent specialization (governance agent design)
- **DDR-017**: Support agent dissolution (precedent for reclassifying agents)

---

## Status History

| Date | Status | Note |
|------|--------|------|
| 2026-03-01 | ACCEPTED | Agent taxonomy established. Profile index updated. File reorganization deferred. |
