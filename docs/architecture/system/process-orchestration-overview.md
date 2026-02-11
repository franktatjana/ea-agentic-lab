---
title: "Process Orchestration Overview"
description: "Conceptual guide explaining what processes are, why they exist as a layer above playbooks, and how the orchestration pipeline works"
category: "architecture"
keywords: ["process", "orchestration", "multi-agent", "conflict-detection", "process-registry"]
last_updated: "2026-02-10"
---

# Process Orchestration Overview

Playbooks tell a single agent how to do its job. Processes tell multiple agents how to work together. Without processes, 24+ agents would execute independently with no coordination, producing conflicting outputs or missing handoffs between phases.

This document explains the conceptual model. For the normalized schema, see [Process Schema](process-schema.md). For conflict detection rules, see [Conflict Rules](conflict-rules.md). For the orchestration agent itself, see [Orchestration Agent Architecture](../agents/orchestration-agent.md).

## The Coordination Gap

The system has three execution layers, each solving a different problem.

```
Human (describes what should happen)
  → Process (who does what, in what order)
    → Playbook (how each agent does its part)
      → Signal (events that flow between agents)
```

**Signals** are atomic events, a single thing happened (artifact created, risk identified, deal stage changed). **Playbooks** are single-agent instruction sets, one agent following one framework to produce one output. Neither of these defines the choreography when a business event requires multiple agents to produce a coordinated result.

That choreography is the process. A process defines: which event triggers the workflow, which agents participate, what each agent produces, how outputs flow between steps, what deadlines apply, and what happens when things conflict.

## What a Process Contains

Every process follows a consistent structure regardless of how the human described it (natural language, YAML, spreadsheet, or bullet points). The Orchestration Agent's Process Parser normalizes all input into this shape.

| Element | Purpose | Example |
|---------|---------|---------|
| Trigger | The event that starts the workflow | "New RFP received in CRM pipeline" |
| Owner | The primary responsible agent | SA Agent |
| Steps | Ordered sequence of agent actions | Technical analysis, then commercial assessment, then competitive positioning, then consolidation |
| Outputs | Artifacts produced | Unified RFP response brief |
| Constraints | Deadlines, quality gates, escalation paths | 5 business days, security review gate if RFP has security section |
| Relationships | Dependencies on or triggers for other processes | Triggers PROC-005 Proposal Review on completion |

Steps are the subprocesses within a process. Each step has its own owner, inputs, outputs, dependencies, deadline, and success criteria. Steps can run sequentially (step 2 depends on step 1) or in parallel (steps 2 and 3 run concurrently after step 1).

## The Four Registered Processes

The process registry currently contains four processes that represent the most common multi-agent coordination patterns.

### PROC-2024-041: RFP Technical & Commercial Analysis

**Trigger**: New RFP received in CRM pipeline.
**Owner**: SA Agent.

Three agents produce independent analyses that must merge into a single response. The challenge is that each agent scores "fit" differently: SA uses technical feature coverage (0-100), AE uses commercial viability matrix (A-D). Without the process defining the consolidation step and scoring standard, these outputs would conflict.

**Steps**:
1. SA Agent analyzes technical requirements, maps to solution capabilities
2. AE Agent assesses commercial fit, pricing model, deal qualification
3. CI Agent provides competitive positioning and win/loss intelligence
4. Consolidation merges outputs into unified RFP response brief

**Known conflicts**: SA and AE define "solution fit score" differently. Suggested resolution is a composite score (70% technical + 30% commercial, normalized to 0-100).

**Known gaps**: No handoff defined between CI competitive analysis and SA technical differentiation. Missing SLA for 48-hour response window.

### PROC-2024-027: Monthly Customer Health Review

**Trigger**: Scheduled, first Monday of each month.
**Owner**: CA Agent.

A recurring process where three agents each assess health from their domain. The composite score depends on all three inputs, so partial delivery (one agent misses its deadline) produces an incomplete health picture.

**Steps**:
1. CA Agent collects usage metrics, support ticket trends, NPS scores
2. SA Agent reviews technical adoption depth and feature utilization
3. AE Agent assesses relationship health, renewal risk, expansion signals
4. Consolidation calculates composite health score and updates customer record

**Known conflicts**: CA and AE use conflicting definitions of "engagement score" (product usage frequency vs. executive meeting cadence). Suggested resolution is a two-dimension model (product engagement + relationship engagement) weighted by account tier.

**Known gaps**: No feedback loop from health score updates back to individual agents. Agents cannot see how their inputs affected the final score.

### PROC-2024-033: Competitive Threat Response

**Trigger**: CI Agent detects competitive threat signal.
**Owner**: CI Agent.

A reactive process triggered by an external event. Speed matters because competitive threats degrade quickly, but the response must still pass through SWOT analysis and validation before reaching field teams.

**Steps**:
1. CI Agent validates threat signal and classifies severity
2. SA Agent performs SWOT analysis against detected competitor
3. AE Agent prepares counter-positioning and customer talking points
4. CI Agent updates battlecards and distributes to field teams

**Known conflicts**: SA SWOT template and CI battlecard format have overlapping "strengths" sections. Resolution: SWOT feeds into battlecard as source data, battlecard maintains summarized view.

**Known gaps**: No priority classification for threat severity (all threats trigger the same full workflow). No validation step before battlecard distribution.

### PROC-2024-038: Quarterly Business Review Prep

**Trigger**: Scheduled, quarterly.
**Owner**: AE Agent.
**Status**: Draft (not yet active).

A preparation workflow for customer-facing QBR meetings. Currently in draft status, meaning the process definition exists but has not been validated through the conflict detection pipeline.

## The Orchestration Pipeline

When a human describes a new process, the Orchestration Agent runs a five-step pipeline. The pipeline is designed to catch problems before they enter the system, not after.

**Step 1: Parse.** The Process Parser accepts any input format (natural language, YAML, table, bullet points) and normalizes it into the standard process schema. It extracts triggers by matching event patterns, identifies agents by role keywords, parses deadlines from temporal expressions, and generates a process ID.

**Step 2: Conflict Detection.** The Conflict Detector compares the new process against all existing processes in the registry. It checks for eight conflict types:

| Type | Severity | What It Catches |
|------|----------|-----------------|
| Circular Dependency | CRITICAL | Process A triggers B, B triggers A (infinite loop) |
| Trigger Collision | HIGH | Same event fires two processes with incompatible outputs |
| Output Contradiction | HIGH | Two processes write conflicting values to the same artifact |
| Ownership Overlap | MEDIUM | Multiple agents claim primary ownership of the same output |
| Resource Contention | MEDIUM | Processes compete for limited resources (e.g., same meeting slot) |
| Deadline Conflict | LOW | Parent process deadline shorter than child process duration |
| Redundant Process | LOW | New process is >80% similar to an existing one |
| Gap Detection | INFO | Known events have no process handling them |

**Step 3: Decision Gate.** The pipeline routes based on conflict severity:
- CRITICAL: blocked, must resolve before proceeding
- HIGH: requires human decision between resolution options
- MEDIUM: auto-suggests resolution, proceeds unless human objects
- LOW/INFO: logged, no blocking action

**Step 4: Generation.** If no blocking conflicts exist, the Agent Factory checks whether new agents are needed (for roles not covered by existing agents). The Playbook Generator transforms process steps into playbooks with triggers, conditions, and handoffs. Auto-generated agents start in `pending_approval` status.

**Step 5: Registry and Audit.** The process is saved to the registry, versioned by the Version Controller, and logged by the Audit Logger with SHA256 integrity checksums. Every decision, conflict, and resolution is recorded in an immutable append-only audit trail.

## Supporting Components

The orchestration layer is composed of six components, each with a single responsibility.

| Component | Responsibility | Key Capability |
|-----------|---------------|----------------|
| Process Parser | Normalize any input format to structured schema | Auto-detects format (text, YAML, table, bullets) |
| Conflict Detector | Identify contradictions, overlaps, and gaps | 8 conflict types with severity-based routing |
| Agent Factory | Generate new agent definitions when needed | Checks known agent registry before creating |
| Playbook Generator | Transform process steps into playbooks | Maps steps to triggers, conditions, outputs |
| Version Controller | Track all changes with snapshot history | Supports rollback to any previous version |
| Audit Logger | Immutable record of all orchestration decisions | JSONL format, daily rotation, SHA256 checksums |

## Implementation Status

The backend orchestration components are implemented as Python modules in `application/src/core/orchestration/`. The Process Parser, Conflict Detector, Agent Factory, Playbook Generator, Version Controller, and Audit Logger all exist as working code.

The frontend at `application/frontend/src/app/orchestration/page.tsx` is a **prototype with mock data**. The four processes are hardcoded constants, the "Parse & Analyze" button returns canned results after a simulated delay, and there is no API router connecting the frontend to the backend pipeline. The process registry directory (`application/src/process_registry/`) exists but contains no process files created through the pipeline.

**What works end-to-end**: The Python orchestration pipeline can parse input, detect conflicts, generate agents and playbooks, version processes, and produce audit logs.

**What is not yet wired**: No FastAPI router exposes the orchestration pipeline to the frontend. The UI demonstrates the concept with mock data but does not call the backend.

## Design Principles

**Anti-Conway's Law**: Processes are designed to optimize outcomes, not mirror organizational structure. Agents own outcomes, not departments. Cross-functional coordination is the default. Conflict resolution favors efficiency over politics.

**Human-on-the-loop (HOTL)**: The orchestration pipeline runs autonomously through parsing, conflict detection, and generation. Humans are pulled in only when the system detects HIGH or CRITICAL conflicts that require judgment. Routine process creation flows through without human intervention.

**Agents never call connectors directly**: Processes produce artifacts in the InfoHub. Agents read those artifacts. This indirection means processes can be changed without modifying agent code.

## Related Documents

- [Process Schema](process-schema.md): Normalized schema specification with all field definitions and examples
- [Conflict Rules](conflict-rules.md): Conflict taxonomy, detection pseudocode, and resolution workflow
- [Orchestration Agent Architecture](../agents/orchestration-agent.md): Full agent architecture, interaction model, and pipeline diagram
- [Orchestration Agent Profile](../../reference/agent-profiles/meta/orchestration-agent.md): Quick reference card
- [Core Entities](core-entities.md): Realm, Node, Blueprint, Playbook entity definitions
- [Signal Catalog](../../reference/signal-catalog.md): Signal definitions consumed and produced by processes
