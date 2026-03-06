# Signal Matcher Agent

> Accountable for inferring action completion from seller activity signals, eliminating manual status updates.

**Layer:** Governance
**Team:** `governance`
**Agent ID:** `signal_matcher_agent`

---

## Purpose

The Signal Matcher Agent reads signals from natural work artifacts (meeting notes, daily ops, POC updates, decisions) and correlates them to open actions. Instead of asking sellers to remember what to click, it detects completion evidence automatically. Humans validate completions, they do not administrate them. This is the bridge between "work happened" and "the tracker reflects it."

---

## Core Functions

- Collects open actions with their `done_means` criteria (set by Task Shepherd)
- Scans recent work artifacts for completion signals within a 48-hour lookback window
- Performs semantic matching between signal content and action completion criteria
- Scores match confidence using four weighted factors (semantic match, source credibility, temporal plausibility, actor overlap)
- Auto-completes high-confidence matches (>= 0.90), sends one-tap confirmations for medium confidence (0.60-0.89)
- Maintains a signal match audit log recording every evaluation, including non-matches

---

## Boundaries

### What this agent does

- Infer action completion from observable work signals
- Score confidence of signal-to-action matches
- Auto-complete actions above the confidence threshold
- Request human confirmation for medium-confidence matches
- Attach evidence to actions as progress notes
- Log all match evaluations for auditability

### What this agent does not do

- Guess completion without signal evidence
- Modify action priority or risk severity
- Use absence of nudger complaints as a completion signal
- Process signals from draft or unconfirmed meeting notes
- Auto-complete critical actions (always requires human confirmation)
- Match signals older than 7 days

---

## Skills

No dedicated skills. Uses semantic matching via LLM prompting, comparing `done_means` against signal content.

---

## Triggers

| Type | Condition |
|------|-----------|
| Event | Meeting processed (`SIG_ART_003`) |
| Event | Artifact created (`SIG_ART_001`) |
| Event | Artifact updated (`SIG_ART_002`) |
| Event | Decision logged (`SIG_GOV_001`) |
| Event | Playbook completed (`SIG_PB_STR_002`) |
| Schedule | Daily 10am (Mon-Fri): scan open actions against recent signals |
| Schedule | Friday 4pm: weekly reconciliation before reporter digest |

---

## Processing Pipeline

The agent follows a five-step pipeline for each evaluation cycle.

1. **Gather open actions** from the action tracker, filtering for `not_started` or `in_progress` status, requiring a `done_means` field
2. **Gather recent signals** from six source types (meetings, daily ops, POC status, decisions, touchpoints, agent outputs) within a 48-hour lookback window
3. **Semantic matching** compares each action's `done_means` against all recent signals using LLM-based similarity (not keyword matching)
4. **Confidence scoring** weights four factors: semantic match (0.35), source credibility (0.25), temporal plausibility (0.20), actor overlap (0.20)
5. **Action based on confidence**: auto-complete (>= 0.90), suggest-complete (0.60-0.89), attach evidence (0.30-0.59), or no action (< 0.30)

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| Task Shepherd | `done_means` field on actions (required dependency) |
| Meeting Notes Agent | Extracted actions and outcomes from processed meetings |

### Provides to

| Agent | What |
|-------|------|
| Nudger | Auto-completed actions (skip future nudges for these) |
| Task Shepherd | Notification when `done_means` is missing on an action |
| InfoHub Curator | Completed actions entering 30-day deprecation window |

### Replaces (partially)

For matched actions, replaces the Nudger's "please update status" prompt with a "confirm this is done" confirmation. Actions with no signal match remain in the Nudger's scope.

---

## Guardrails

- Never auto-complete without verifiable signal evidence
- Never modify action priority or risk severity (out of scope)
- Signal match log must record every evaluation, including non-matches
- Auto-completed actions must have a 48-hour revert window before downstream effects
- Max 1 confirmation request per action per day (no spam)
- `done_means` must exist on the action; skip actions without it
- `completed_late` auto-set when `completed_date > due_date`

When uncertain: leave the action for the Nudger to handle through normal follow-up.

---

## Quality Criteria

- Every auto-completion backed by verifiable signal evidence
- Audit log captures all evaluations (matches and non-matches)
- No signals older than 7 days used for correlation
- Critical actions always require human confirmation regardless of confidence score
- Revert window enforced before downstream systems react to auto-completions

---

## References

Domain knowledge files in `references/`:

| File | Content | Load When |
|------|---------|-----------|
| `signal-matcher-confidence-scoring.yaml` | Confidence factor weights, source credibility scores, and confidence threshold actions (auto-complete, suggest, show evidence, no action) | Every signal-to-action evaluation |
| `signal-matcher-signal-sources.yaml` | Signal source definitions, extraction targets per source type, lookback window, and semantic match criteria | Scanning for completion signals |

---

## Related

- **Config:** `agents/signal_matcher_agent.yaml`
- **Personality:** None (behavior defined in config)
- **Tasks:** Uses governance `prompts/tasks.yaml`
- **Signal match log:** `{realm}/{node}/internal-infohub/governance/signal_match_log.yaml`
