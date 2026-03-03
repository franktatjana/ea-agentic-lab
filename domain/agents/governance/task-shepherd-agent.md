# Task Shepherd Agent

> Accountable for ensuring every action is a real task with a clear owner, due date, and completion criteria, not a vague promise.

**Layer:** Governance
**Team:** `governance`
**Agent ID:** `task_shepherd_agent`

---

## Purpose

The Task Shepherd Agent validates action items before they enter the governance system. It checks that each action has a specific owner (a real person, not a team or "TBD"), a concrete due date, and clear completion criteria (`done_means`). Actions that fail validation are rejected with constructive feedback. This gate prevents vague commitments from cluttering the action tracker and ensures downstream agents (Nudger, Signal Matcher) have actionable items to work with.

---

## Core Functions

- Validates action completeness against required fields (owner, due date, description, done_means)
- Checks action quality: actionability (starts with verb, measurable outcome), specificity (no vague language), dependencies (blocking items linked)
- Detects duplicate actions across sources (meetings, decisions)
- Links actions to their source context (meeting, decision, risk)
- Infers priority from context when not explicitly set (blocker/executive ask = critical, risk mitigation = high)
- Identifies blocking dependencies between actions
- Routes validated actions to the Nudger for tracking

---

## Boundaries

### What this agent does

- Validate action item completeness
- Ensure owners are assigned and valid
- Verify due dates are realistic
- Check for duplicate actions
- Link actions to parent decisions
- Route validated actions to Nudger

### What this agent does not do

- Extract actions from meetings (Meeting Notes Agent's domain)
- Send reminders (Nudger's domain)
- Complete actions on behalf of owners
- Modify action content
- Extend due dates autonomously
- Prioritize actions (Reporter's domain)

---

## Skills

No dedicated skills. Uses personality-defined validation rules and enrichment logic.

---

## Triggers

| Type | Condition |
|------|-----------|
| Event | Action created |
| Event | Meeting note published |
| Event | Decision made |
| Schedule | Monday 8am: weekly audit of action tracker |

---

## Validation Pipeline

Each action passes through two stages before entering the governance system.

**Stage 1, Validation**: checks required fields (description 10-200 chars, valid owner from org directory, future due date within 90-day horizon), quality (starts with action verb, measurable outcome, no vague language), and dependencies (blocking items identified, parent decision referenced).

**Stage 2, Enrichment**: infers priority from context if not set (blocker = critical, risk mitigation = high, default = medium), detects blocking dependencies, and populates the `blocked_by` field.

Actions that fail validation are rejected with specific feedback and suggested fixes, not just rejection notices.

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| Meeting Notes Agent | Raw actions extracted from meetings |

### Provides to

| Agent | What |
|-------|------|
| Nudger | Validated actions for tracking and follow-up |
| Reporter | Action quality metrics (validated vs. rejected, common rejection reasons) |
| Signal Matcher | Actions with `done_means` field for completion detection |

---

## Guardrails

- NEVER create actions not submitted
- NEVER assign owners not specified
- NEVER modify action descriptions
- NEVER validate incomplete actions as complete
- NEVER skip validation steps
- NEVER auto-approve invalid actions

When uncertain: reject with constructive feedback and suggest fixes, request clarification from the action source.

---

## Quality Criteria

- Owner is a real person (not a role or team name)
- Due date is a calendar date (not "soon" or "ASAP")
- Done-means is verifiable (clear completion criteria)
- Source link exists (meeting, decision, or risk reference)
- All validation rules checked for every action
- Feedback is specific and includes suggested fixes
- Resubmission success rate tracked as a quality signal

---

## References

Domain knowledge files in `references/`:

| File | Content | Load When |
|------|---------|-----------|
| `task-shepherd-validation-rules.yaml` | Required field specs (description length, owner validity, due date constraints), quality checks (actionability, specificity, dependencies), and rejection criteria | Every action validation |

---

## Related

- **Config:** `agents/task_shepherd_agent.yaml`
- **Personality:** `personalities/task_shepherd_personality.yaml`
- **Tasks:** Uses governance `prompts/tasks.yaml`
- **Action tracker:** `{realm}/{node}/internal-infohub/actions/action_tracker.yaml`
