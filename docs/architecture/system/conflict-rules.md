# Conflict Detection Rules

**Version:** 1.0
**Date:** 2026-01-16

---

## Overview

The Conflict Detector analyzes processes to identify contradictions, overlaps, and gaps. This ensures the agent ecosystem remains consistent and predictable.

---

## Conflict Taxonomy

[image: Conflict Severity Spectrum - color-coded scale from critical through high, medium, low, to info]

### Severity Levels

| Level | Name | Description | Action |
|-------|------|-------------|--------|
| **CRITICAL** | System Halt | Could cause infinite loops or system failure | Block until resolved |
| **HIGH** | Contradiction | Processes produce conflicting outputs | Require human decision |
| **MEDIUM** | Ambiguity | Unclear ownership or overlapping responsibility | Flag for review |
| **LOW** | Inefficiency | Redundant work or suboptimal flow | Suggest optimization |
| **INFO** | Gap | Missing coverage for known scenarios | Inform human |

---

## Conflict Types

### 1. Trigger Collision (HIGH)

**Definition:** Multiple processes fire on the same event with incompatible actions.

**Detection Rule:**
```
IF process_A.trigger.event == process_B.trigger.event
   AND process_A.trigger.conditions OVERLAP process_B.trigger.conditions
   AND process_A.outputs CONFLICT_WITH process_B.outputs
THEN RAISE TriggerCollision(HIGH)
```

**Example:**
```yaml
# Process A
trigger:
  event: "deal_stage_changed"
  conditions:
    - field: "new_stage"
      value: "negotiation"
steps:
  - action: "create_business_case"

# Process B
trigger:
  event: "deal_stage_changed"
  conditions:
    - field: "new_stage"
      value: "negotiation"
steps:
  - action: "skip_to_contract"  # Contradicts A
```

**Resolution Options:**
1. **Prioritize:** Process A takes precedence, B only runs if A condition fails
2. **Merge:** Combine into single process with conditional branches
3. **Specialize:** Add conditions to make triggers mutually exclusive
4. **Deprecate:** Remove one process

---

### 2. Output Contradiction (HIGH)

**Definition:** Processes produce outputs that cannot both be true.

**Detection Rule:**
```
IF process_A.output.artifact == process_B.output.artifact
   AND process_A.output.value CONTRADICTS process_B.output.value
THEN RAISE OutputContradiction(HIGH)
```

**Example:**
```yaml
# Process A: After security review
output:
  artifact: "deal_status"
  value: "approved_to_proceed"

# Process B: After compliance review (same deal)
output:
  artifact: "deal_status"
  value: "blocked_pending_review"  # Contradicts A
```

**Contradiction Patterns:**
| Pattern | Example |
|---------|---------|
| Boolean flip | `approved` vs `rejected` |
| Status conflict | `active` vs `closed` |
| Assignment conflict | `owner: SA` vs `owner: AE` |
| Value overwrite | Both write to same field with different values |

**Resolution Options:**
1. **Sequence:** Define execution order, later wins
2. **Merge:** Combine outputs (if compatible)
3. **Condition:** Add mutual exclusion conditions
4. **Separate:** Different output artifacts

---

### 3. Circular Dependency (CRITICAL)

**Definition:** Process A triggers B, and B triggers A (directly or transitively).

**Detection Rule:**
```
BUILD dependency_graph FROM all processes
FOR each process P:
  IF path_exists(P → ... → P) in dependency_graph:
    RAISE CircularDependency(CRITICAL)
```

**Example:**
```yaml
# Process A
trigger:
  event: "risk_identified"
outputs:
  triggers:
    - process: "PROC_B"

# Process B
trigger:
  event: "PROC_A.completed"
steps:
  - action: "analyze_risk"
outputs:
  - artifact: "new_risk"  # This triggers PROC_A again!
```

**Detection Algorithm:**
```python
def detect_circular(processes):
    graph = build_dependency_graph(processes)

    def has_cycle(node, visited, stack):
        visited.add(node)
        stack.add(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                if has_cycle(neighbor, visited, stack):
                    return True
            elif neighbor in stack:
                return True  # Cycle detected

        stack.remove(node)
        return False

    for process in processes:
        if has_cycle(process, set(), set()):
            return True
    return False
```

**Resolution Options:**
1. **Break cycle:** Add termination condition
2. **Merge:** Combine circular processes into one
3. **Remove trigger:** One process stops triggering the other

---

### 4. Ownership Overlap (MEDIUM)

**Definition:** Multiple agents claim primary ownership for same responsibility.

**Detection Rule:**
```
IF process_A.ownership.primary_owner != process_B.ownership.primary_owner
   AND process_A.outputs.primary.artifact == process_B.outputs.primary.artifact
THEN RAISE OwnershipOverlap(MEDIUM)
```

**Example:**
```yaml
# Process A (AE Agent owns)
ownership:
  primary_owner:
    agent: "AE Agent"
outputs:
  primary:
    artifact: "pricing_decision"

# Process B (SA Agent owns)
ownership:
  primary_owner:
    agent: "SA Agent"
outputs:
  primary:
    artifact: "pricing_decision"  # Same output, different owner
```

**Resolution Options:**
1. **Single owner:** Assign to one agent
2. **Split artifact:** Different aspects to different owners
3. **Collaboration:** One owns, other contributes

---

### 5. Resource Contention (MEDIUM)

**Definition:** Processes compete for limited resources (time slots, people, budgets).

**Detection Rule:**
```
IF process_A.constraints.resources INTERSECTS process_B.constraints.resources
   AND resource.availability < sum(A.demand, B.demand)
THEN RAISE ResourceContention(MEDIUM)
```

**Example:**
```yaml
# Process A
steps:
  - action: "schedule_meeting"
    params:
      attendee: "executive_sponsor"
      time: "weekly_slot_1"

# Process B
steps:
  - action: "schedule_meeting"
    attendee: "executive_sponsor"
    time: "weekly_slot_1"  # Same slot!
```

**Resolution Options:**
1. **Queue:** First come, first served
2. **Priority:** Higher priority process wins
3. **Expand resource:** Add more slots/people
4. **Merge:** Combine meetings

---

### 6. Gap Detection (INFO)

**Definition:** Known events or scenarios have no process handling.

**Detection Rule:**
```
FOR each known_event in event_catalog:
  IF NOT exists process WHERE process.trigger.event == known_event:
    RAISE GapDetection(INFO, event=known_event)

FOR each process output:
  IF output.triggers contains unknown_process:
    RAISE GapDetection(INFO, missing_process=unknown_process)
```

**Example:**
```yaml
# Known events from system
known_events:
  - "rfp_received"        # ✓ Handled by PROC_001
  - "partner_referral"    # ✗ No process
  - "contract_signed"     # ✗ No process
  - "churn_risk_detected" # ✓ Handled by PROC_015
```

**Gap Report:**
```markdown
## Gap Analysis

### Unhandled Events
- `partner_referral`: No process defined
- `contract_signed`: No process defined

### Orphan Triggers
- PROC_005 triggers "PROC_099" which doesn't exist

### Dead Ends
- PROC_012 has no downstream processes (terminal)
```

---

### 7. Deadline Conflict (LOW)

**Definition:** Process deadlines are impossible given dependencies.

**Detection Rule:**
```
IF process_A triggers process_B
   AND process_A.deadline > process_B.deadline
THEN RAISE DeadlineConflict(LOW)

IF sum(step.deadlines) > process.total_deadline:
  RAISE DeadlineConflict(LOW)
```

**Example:**
```yaml
# Process A
deadline: "5 days"
outputs:
  triggers:
    - process: "PROC_B"

# Process B
deadline: "3 days from trigger"  # B must complete before A!
```

---

### 8. Redundant Process (LOW)

**Definition:** Two processes do essentially the same thing.

**Detection Rule:**
```
IF similarity(process_A, process_B) > 0.8:
  RAISE RedundantProcess(LOW)

similarity = weighted_avg(
  trigger_similarity,
  step_similarity,
  output_similarity,
  owner_similarity
)
```

**Example:**
```yaml
# Process A: RFP Analysis
trigger: "rfp_received"
steps: [extract_requirements, create_proposal]
owner: "SA Agent"

# Process B: RFP Response
trigger: "rfp_received"
steps: [analyze_requirements, write_proposal]  # Nearly identical
owner: "SA Agent"
```

---

## Conflict Matrix

Shows which conflict types can coexist:

| Conflict | Trigger | Output | Circular | Ownership | Resource | Gap | Deadline | Redundant |
|----------|---------|--------|----------|-----------|----------|-----|----------|-----------|
| Trigger Collision | - | Often | Sometimes | Often | Rarely | N/A | Sometimes | Often |
| Output Contradiction | Often | - | Sometimes | Often | Rarely | N/A | Rarely | Often |
| Circular Dependency | Sometimes | Sometimes | - | N/A | N/A | N/A | Always | Rarely |
| Ownership Overlap | Often | Often | N/A | - | Sometimes | N/A | Rarely | Often |
| Resource Contention | Rarely | Rarely | N/A | Sometimes | - | N/A | Often | Rarely |
| Gap Detection | N/A | N/A | N/A | N/A | N/A | - | N/A | N/A |
| Deadline Conflict | Sometimes | Rarely | Always | Rarely | Often | N/A | - | Sometimes |
| Redundant Process | Often | Often | Rarely | Often | Rarely | N/A | Sometimes | - |

---

[image: Conflict Resolution Flow - detect, classify, report, suggest, decide, apply, verify, log sequence]

## Conflict Resolution Workflow

```
1. DETECT
   Orchestration Agent scans all processes

2. CLASSIFY
   Assign severity and type to each conflict

3. REPORT
   Generate conflict report for human review

4. SUGGEST
   Provide resolution options with trade-offs

5. DECIDE
   Human selects resolution (or proposes alternative)

6. APPLY
   Orchestration Agent implements resolution

7. VERIFY
   Re-scan to confirm conflict resolved
   Check for new conflicts introduced

8. LOG
   Record resolution in audit trail
```

---

## Conflict Report Format

```yaml
# Generated conflict report
report:
  generated_at: "2026-01-16T10:00:00Z"
  processes_analyzed: 47
  conflicts_found: 5

  conflicts:
    - id: "CONF_001"
      type: "trigger_collision"
      severity: "HIGH"
      processes: ["PROC_012", "PROC_023"]
      description: |
        Both processes fire on "health_score < 50".
        PROC_012 schedules rescue call.
        PROC_023 triggers churn analysis.
        Actions may contradict.
      suggested_resolutions:
        - option: "sequence"
          description: "Run churn analysis first, then rescue call if confirmed"
          impact: "Adds 1-2 days before rescue action"
        - option: "merge"
          description: "Single process does both"
          impact: "Simplifies, but larger process"
        - option: "condition"
          description: "PROC_012 for tier=enterprise, PROC_023 for others"
          impact: "Specialized handling by tier"
      human_decision_required: true

    - id: "CONF_002"
      type: "circular_dependency"
      severity: "CRITICAL"
      processes: ["PROC_005", "PROC_008", "PROC_005"]
      path: "PROC_005 → PROC_008 → PROC_005"
      description: |
        Risk creation triggers analysis, analysis creates risks.
        Infinite loop potential.
      suggested_resolutions:
        - option: "termination_condition"
          description: "PROC_005 only runs if risk is new (not from PROC_008)"
          impact: "Breaks cycle safely"
      human_decision_required: true
      blocking: true  # Must resolve before system can run

  gaps:
    - event: "partner_referral"
      description: "No process handles partner referrals"
      suggested_action: "Create Partner Agent process"

  summary:
    critical: 1
    high: 2
    medium: 1
    low: 1
    info: 2
    blocking_resolution_required: true
```

---

## Automatic Resolution (Low Severity)

For LOW and some MEDIUM conflicts, Orchestration Agent can auto-resolve:

```yaml
auto_resolution_rules:
  - conflict_type: "redundant_process"
    severity: "LOW"
    action: "merge_and_deprecate_older"
    requires_human_confirmation: true

  - conflict_type: "deadline_conflict"
    severity: "LOW"
    action: "adjust_downstream_deadline"
    requires_human_confirmation: false

  - conflict_type: "gap_detection"
    severity: "INFO"
    action: "create_stub_process"
    requires_human_confirmation: true
```

---

## Implementation Pseudocode

```python
class ConflictDetector:
    def __init__(self, process_registry):
        self.registry = process_registry
        self.conflicts = []

    def analyze_all(self):
        processes = self.registry.get_all_active()

        # Pairwise comparisons
        for i, proc_a in enumerate(processes):
            for proc_b in processes[i+1:]:
                self.check_trigger_collision(proc_a, proc_b)
                self.check_output_contradiction(proc_a, proc_b)
                self.check_ownership_overlap(proc_a, proc_b)
                self.check_resource_contention(proc_a, proc_b)
                self.check_redundancy(proc_a, proc_b)

        # Graph analysis
        self.check_circular_dependencies(processes)
        self.check_deadline_feasibility(processes)

        # Gap analysis
        self.check_event_coverage(processes)
        self.check_orphan_triggers(processes)

        return self.generate_report()

    def check_trigger_collision(self, a, b):
        if a.trigger.event != b.trigger.event:
            return

        if not self.conditions_overlap(a.trigger.conditions, b.trigger.conditions):
            return

        if self.outputs_conflict(a.outputs, b.outputs):
            self.conflicts.append(Conflict(
                type="trigger_collision",
                severity="HIGH",
                processes=[a.id, b.id],
                details=f"Both fire on {a.trigger.event} with conflicting outputs"
            ))

    def check_circular_dependencies(self, processes):
        graph = self.build_trigger_graph(processes)
        cycles = self.find_cycles(graph)

        for cycle in cycles:
            self.conflicts.append(Conflict(
                type="circular_dependency",
                severity="CRITICAL",
                processes=cycle,
                blocking=True
            ))

    def generate_report(self):
        return ConflictReport(
            conflicts=self.conflicts,
            summary=self.summarize()
        )
```

---

## Conflict Prevention (Design Time)

Best practices to avoid conflicts when designing processes:

1. **Unique triggers:** Add conditions to make triggers mutually exclusive
2. **Clear ownership:** One agent owns each output artifact
3. **Explicit sequencing:** Use `depends_on` instead of implicit triggers
4. **Termination conditions:** Always include exit criteria for loops
5. **Deadline buffers:** Allow slack between dependent deadlines
6. **Namespace outputs:** Prefix artifacts with process ID

---

**Next:** See [orchestration-agent.md](../agents/orchestration-agent.md) for full architecture.
