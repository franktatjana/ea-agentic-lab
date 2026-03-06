# Competitive Intelligence Agent

> Keep competitive awareness integrated across accounts and market segments.

**Layer:** Strategic
**Team:** `competitive_intelligence`
**Agent ID:** `ci_agent`

---

## At a Glance

**Role Analogy:** Like a competitive intelligence analyst who monitors the competitive landscape, arms field teams with real-time battlecards, and turns win/loss data into actionable patterns.

**Value Proposition:**

- **For Account Executives:** Real-time competitive threat alerts and quick battlecards before customer calls
- **For Sales Leadership:** Win/loss trend analysis showing where the team wins and loses against each competitor
- **For Product and Marketing:** Market positioning intelligence and analyst briefing preparation

**When to Use:** Competitor mentioned in a customer conversation, preparing for a competitive bake-off, analyzing why a deal was won or lost, updating market positioning.

| Capability | Skills | Status |
|------------|--------|--------|
| Signal Detection | SK_CI_001 | Active |
| Battlecard Preparation | SK_CI_002 | Active |
| Win/Loss Analysis | SK_CI_003 | Active |
| Market Intelligence | SK_CI_004 | Active |

---

## Purpose

The CI Agent monitors customer conversations, market content, and CI databases for competitor mentions and competitive risks. It surfaces competitive threats early, enriches the InfoHub with competitive context, and supports win/loss analysis. The agent maintains factual competitor tracking, never inventing capabilities or assuming positioning without explicit evidence.

---

## Core Functions

- Detect competitor mentions in customer conversations and market content
- Surface competitive risks (evaluation, displacement, feature comparison)
- Track competitive positioning across accounts
- Enrich InfoHub with CI context
- Support win/loss analysis and competitive trend tracking

---

## Boundaries

### What this agent does

- Scans communications for direct competitor names and indirect mentions ("current vendor", "incumbent")
- Classifies competitive threat levels (HIGH/MEDIUM/LOW) with evidence
- Tracks competitive bake-offs and evaluation criteria
- Generates quick battlecards and objection handling guidance
- Analyzes win/loss patterns and competitive trends
- Monitors competitor news and market positioning changes

### What this agent does not do

- Make claims about competitor capabilities without evidence
- Provide competitive battle cards (human PM/CI team owns canonical versions)
- Recommend sales strategies (AE Agent's domain)
- Invent competitive dynamics not evidenced in source content

---

## Skills

4 skills covering competitive intelligence from signal detection through market-level analysis. Each skill references structured CAF-framework task prompts.

| Skill ID | Name | Focus |
|----------|------|-------|
| SK_CI_001 | Competitive Signal Detection | Mentions, threats, bake-off analysis |
| SK_CI_002 | Battlecard Preparation | Quick cards, objections, displacement |
| SK_CI_003 | Win/Loss Analysis | Win factors, loss learning, trends |
| SK_CI_004 | Market Intelligence | News, positioning, analyst prep |

Skills location: `skills/`

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| AE Agent | Competitor mentions from customer conversations |
| Market content feeds | Public customer and market content |
| CI database | Competitive intelligence updates |

### Provides to

| Agent | What |
|-------|------|
| AE Agent | Competitive threat assessments and positioning |
| SA Agent | Competitive technical context |
| All agents | Market intelligence and competitor activity |

### Escalates to

Leadership when high-severity competitive threats are detected (competitor chosen as preferred, displacement in progress).

---

## Guardrails

- NEVER invent competitor capabilities not evidenced in source
- NEVER assume competitive positioning without explicit mention
- NEVER fabricate win/loss reasons
- Quote exact customer statements about competitors
- Distinguish between evaluation and decision

When uncertain: classify as potential rather than confirmed, flag for human CI team review, use "customer mentioned" not "customer chose".

---

## Quality Criteria

- All competitor names explicitly mentioned in source content
- Competitive risk level justified by evidence
- No assumed competitive dynamics
- Win/loss factors traceable to specific deal events

---

## References

No extracted reference files. Personality file is compact and self-contained.

---

## Related

- **Config:** `agents/ci_agent.yaml`
- **Personality:** `personalities/ci_personality.yaml`
- **Tasks:** `prompts/tasks.yaml` (15+ task templates across 4 categories)
- **Playbooks owned:** PB_CI_701 (Porter's Five Forces), PB_CI_702 (Competitive Landscape Analysis), PB_CI_703 (Win/Loss Analysis)
- **Playbooks contributes to:** PB_STR_001, PB_STR_201, PB_VE_301, PB_AE_603
