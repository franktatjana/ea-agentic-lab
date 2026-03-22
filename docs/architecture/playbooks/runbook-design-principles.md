# Runbook Design Principles

These ten principles are the runbook design standard for this project. Every runbook author must read and apply them before building or modifying a runbook prompt. They hold true regardless of whether the runbook is triaging signals, assessing health, planning renewals, or anything else.

The principles apply to all agent task prompts in `domain/agents/*/prompts/tasks.yaml` and specialist prompt files. Strategic playbooks (`domain/playbooks/`) should follow these principles in their step definitions and output specifications.

## Principle 1: Validate Before You Score

No runbook should begin its real work without first inventorying what it actually received. The input gate is infrastructure, not a feature of any single runbook. Every runbook takes inputs, and in every real-world scenario some of those inputs will be missing, stale, or ambiguous. If the runbook does not check, it fills gaps with confident-sounding fabrication.

The pattern is always the same:

1. List expected inputs
2. Classify each as PRESENT / PARTIAL / ABSENT
3. Select a run mode (FULL / DEGRADED / DEFER)
4. If the mode is degraded, carry that degradation visibly through every downstream deliverable

This is a reusable preamble. Every runbook must include it as STEP 0.

## Principle 2: Confidence Travels with Every Score

Any time a runbook produces a number, a category, or a recommendation, it must also state how much data that conclusion rests on. A "3.2" with telemetry behind it and a "3.2" based on one stakeholder comment are not the same output, but they look identical without confidence metadata.

When one runbook's output becomes another runbook's input, untagged confidence creates compounding false precision: every downstream step inherits certainty that never existed.

The rule: no score without a confidence level (HIGH / MEDIUM / LOW with basis stated), and any runbook consuming a scored input must acknowledge the confidence it inherited.

## Principle 3: Allow Compound Classification

Wherever a runbook classifies something into categories, resist the instinct to force "exactly one." Real-world signals, risks, and opportunities almost always span multiple categories simultaneously. The clean routing that single classification provides is not worth the information it destroys.

The pattern that works:

- **One primary category** for routing and ownership
- **Secondary flags** for completeness, so the action plan can address the full picture without ambiguity about who leads

Example: a risk might be primarily TECHNICAL but also flagged COMMERCIAL and PROCESS. The SA owns it, but the AE and delivery lead are aware of their dimensions.

## Principle 4: Handle Empty States Explicitly

Beyond the input gate, individual steps within a runbook can encounter emptiness even when the overall inputs are sufficient: no signal history, no competitive mentions, no prior actions logged. Each step that depends on a data set that could plausibly be empty needs a one-line fallback.

The fallback must:

1. State what is missing
2. Note the implication for the deliverable
3. Proceed without fabrication

Explicit emptiness is always better than implicit fabrication. Without this, the model either skips silently (and the consumer does not know a dimension was missed) or invents something to fill the gap.

## Principle 5: Actions Include Prerequisites

Every runbook that produces an action plan will be tempted to stop at "what, who, when." But the most common failure mode for action plans is not unclear ownership, it is unstated dependencies.

An action that says "schedule executive business review with CTO" is useless if nobody has the CTO's contact, or if the AE has not yet agreed to co-own the meeting.

Every action needs a **"what must be true before this can start"** field. This is the difference between a plan that looks good in a slide and one that actually executes.

Action table format: `Priority | Action | Owner | Timeline | Prerequisites | Expected Impact`

## Principle 6: State Changes at Field Level

If a runbook's output is supposed to update an account's health score, risk register, or any shared record, the output must say exactly what changed: field path, old value, new value, evidence.

"Update health score" is a suggestion. "Technical health: 3.2 → 2.6, based on three unresolved P1 tickets in 14 days" is an instruction.

This is what makes runbooks chainable: the output of one becomes a precise, consumable input for the next. This also means every runbook references a shared account state schema, so nothing writes state in its own format.

State delta format: `Field | Previous | Updated | Evidence | Runbook Source`

## Principle 7: Quality Checks Cover Every Deliverable

When you add steps to a runbook (input gate, temporal analysis, state delta, etc.), the quality checks at the bottom must expand to match. Unchecked deliverables are effectively optional: the model will deprioritize them when balancing output length against instruction compliance.

The rule: one quality check per deliverable, minimum. If a deliverable does not have a corresponding check, either the check is missing or the deliverable is not necessary.

## Principle 8: Explicit Run Modes

Not every run of a runbook needs every deliverable. A weekly check-in does not need the same depth as a quarterly review. If you do not provide a mode parameter, people will either skip the runbook entirely because it is too heavy for routine use, or run the full version and skim the output.

Standard modes:

| Mode | When | Produces |
|------|------|----------|
| FULL | Quarterly reviews, deep analysis, first-time runs | All deliverables, full depth |
| QUICK | Weekly check-ins, status updates, routine monitoring | Executive summary + state delta + highest-priority action only |
| DISCOVERY | Zero-data situations, new accounts, acquisition targets | Signal acquisition plan + data source inventory + observation checklist |

Define what each mode produces and what it skips. The input gate's run mode (FULL/DEGRADED/DEFER) is separate: it handles data quality. The execution mode handles desired depth.

Add a `run_mode` parameter to the context block of every runbook prompt, defaulting to FULL if not specified.

## Principle 9: Trends Require Two Data Points

Any time a runbook asks the model to assess whether something is "improving," "stable," or "declining," it must compare at least two time-separated observations. Without this constraint, the model will infer trend from tone: a positive-sounding email becomes "improving," a terse one becomes "declining."

The rule: no trend without comparison. If only one observation exists, the trend is "INSUFFICIENT DATA," not "stable."

## Principle 10: Executive Summary as Contract

Every runbook ends with an executive summary, and it should be treated as a binding contract between the runbook and its consumer. It states:

1. The conclusion (score, classification, or assessment)
2. The weakest point (lowest confidence area, biggest gap, highest risk)
3. The single most urgent action

The quality check for the summary: can someone act on just these sentences without reading the rest? If yes, the summary works. If no, it is a preamble, not a summary.

The quality checks section must include a specific check validating that the executive summary is self-sufficient and actionable.

---

## Applying These Principles

When building a new runbook or retrofitting an existing one, use this checklist:

- [ ] STEP 0 input gate with PRESENT/PARTIAL/ABSENT classification and run mode selection
- [ ] `run_mode` parameter in context block (FULL / QUICK / DISCOVERY)
- [ ] Every score, classification, or recommendation includes confidence level with basis
- [ ] Classifications use primary + secondary flags, not forced single category
- [ ] Each step handles its own empty state explicitly (what is missing, what it means, proceed)
- [ ] Action plans include prerequisites column, not just owner and timeline
- [ ] State delta step specifies field path, old value, new value, evidence
- [ ] Quality checks section has one check per deliverable, minimum
- [ ] Trend claims reference two or more time-separated data points, or state "INSUFFICIENT DATA"
- [ ] Executive summary states conclusion, weakest point, and most urgent action
- [ ] Quality checks include a self-sufficiency check for the executive summary

## Reference Implementations

The following agent task prompts serve as reference implementations of these principles:

- **Value Engineering** (`domain/agents/value_engineering/prompts/tasks.yaml`): comprehensive input gates, confidence metadata, state deltas
- **Account Executives** (`domain/agents/account_executives/prompts/tasks.yaml`): MEDDPICC dimension health with observable/interpretive layer separation
- **Customer Architects** (`domain/agents/customer_architects/prompts/tasks.yaml`): adoption health scoring with temporal analysis
