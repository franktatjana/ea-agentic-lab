# DDR-013: Knowledge Capture Strategy

**Status:** PROPOSED
**Date:** 2026-02-12
**Category:** Domain Decision Record
**Extends:** [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md), [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md)

## Context

DDR-008 established a human-curated Knowledge Vault with dual ingestion: manual entry and agent proposals. It identified "low adoption" as a risk and proposed mitigation through "seeding with initial best practices and making the UI easy to use."

This mitigation is insufficient. The fundamental barrier to knowledge capture is not UI design or initial seeding. It is the economics of contribution itself.

### The real problem is not sharing, it is capture cost

The framing of "knowledge sharing" is part of the problem. "Sharing" implies a deliberate act: stop what you're doing, switch context, write something for someone else's benefit. That is a tax on the contributor with zero immediate return. Every knowledge management system that frames it as "please share your knowledge" is asking people to do unpaid work for a collective benefit. Classic commons problem, and it fails every time.

CRM adoption is the canonical example. Salesforce is famously resisted because it extracts from sellers (data entry) and gives to management (dashboards). The system takes from contributors and gives to consumers. Contributors get nothing back. The same dynamic applies to any knowledge management tool that asks people to author content for a shared repository.

### Three challenges, not one

**Capture friction.** An SA who just learned that financial services procurement cycles add 6 weeks to every deal has no low-effort way to get that into the system. Writing a knowledge article is 20 minutes they don't have. Switching context from deal execution to knowledge authoring interrupts the very work that produces the insight.

**Misaligned incentives.** Knowledge is power. In competitive sales organizations, a top performer's playbook is their advantage over peers, not just competitors. Sharing it literally reduces their relative standing. Imposed tools, monitoring, and KPIs create compliance without conviction: people enter minimum viable content to satisfy the metric, not to transfer genuine insight. This is the "violence" of imposing tools and monitoring. It produces compliance theater, not knowledge transfer.

**Delayed payoff.** The contributor pays the cost now. The benefit accrues to strangers on future engagements. The first 50 contributions feel like they go into a void. This is a classic commons problem, and altruism does not scale.

### Three gaps in DDR-008

**Gap 1: Agents only capture what flows through playbooks.** DDR-008's agent proposal mechanism requires a playbook to be running before an agent can propose knowledge. The most valuable knowledge is tacit: the insight from a failed POC, the relationship dynamic observed in a meeting, the pricing strategy that worked. That material lives in raw inputs (meeting notes, field notes, daily ops logs) and never touches a playbook execution path.

**Gap 2: The proposal flow is pull-based, not ambient.** An agent has to be running a playbook to propose knowledge. There is no "always-on" capture from the raw material that already exists in the system.

**Gap 3: The contributor does not benefit first.** When someone approves a knowledge proposal, what do they get? Nothing immediate. The next person on a similar deal benefits. That is altruism, and altruism does not scale.

### The uncomfortable question

Do we even need explicit knowledge sharing at all?

The three-vault architecture already creates a one-way flow: engagements produce account knowledge, account knowledge feeds (anonymized) into global knowledge. If agents handle extraction, anonymization, and promotion, the human's role is curation (approve/reject), not authorship.

The bottleneck then shifts from "people won't share" to three different problems:

1. **Raw material quality.** Are meeting notes rich enough for agents to extract from? Voice transcripts produce far richer material than typed summaries. A bullet-point note ("discussed pricing, follow up next week") yields nothing. A transcript or narrative summary yields actionable patterns.

2. **Curation throughput.** Will humans actually review proposals, or will the queue rot? Notification fatigue is real. If 30 proposals land per week, most will be ignored. The system needs confidence thresholds, batching, and expiration.

3. **Cold start.** The vault is empty on day one. The first engagements get no benefit. The self-learning differentiator ("the hundredth deal benefits from the ninety-nine before it") is true at scale but useless at deal one. This might require a manual seeding phase where domain experts dump their tribal knowledge, which is the very "imposed contribution" we want to avoid, but only once, as a bootstrap.

The answer: the system should be designed so that doing your job IS contributing, with no extra step. Raw inputs exist because people need them for their own work. Mining those inputs is the lowest-friction path to knowledge capture.

## Decision

Adopt "contribution as byproduct" as the primary knowledge capture strategy. The system mines raw inputs continuously. Humans curate, they do not author.

### Core Principles

**1. Raw vault as knowledge mine.** Meeting notes, field notes, and daily ops logs already land in `raw/` within each node's Internal Account Hub. A dedicated Knowledge Extraction Agent continuously scans raw inputs across all active nodes, identifies candidate patterns, and writes structured proposals to `vault/knowledge/.proposals/`. The SA never "shares" anything. They take their notes as part of their normal work, and the system mines them.

**2. Contributor is the first consumer.** When the Knowledge Vault surfaces a relevant insight during a future engagement ("3 deals with this archetype hit procurement delays, here's what worked"), the person who originally generated the raw input sees direct value from their past work. The incentive flips from "share for others" to "capture for yourself, others benefit as a side effect."

**3. Attribution without surveillance.** The system does not track who contributes (no KPIs, no dashboards counting articles). Instead, it tracks whose contributions get pulled into engagements. "Your insight about SIEM migration timelines was surfaced in 8 blueprints this quarter." This makes contribution visible through impact, not compliance.

**4. Curation over authorship.** Human effort shifts from writing knowledge articles to reviewing agent proposals. The decision is "is this correct and useful? yes/no", not "please write 500 words about what you learned." This reduces the contribution cost by an order of magnitude.

### Knowledge Flow

```
Raw inputs (meetings, field notes, daily ops)
  │
  ▼
Knowledge Extraction Agent (continuous scan)
  │
  ▼
Proposals (.proposals/ queue) ──── Human review ────► Global Knowledge Vault
  │                                    │
  │                              reject/refine
  │                                    │
  └──────────────── ◄─────────────────┘
```

The extraction agent:
- Scans new raw inputs as they appear
- Identifies patterns that recur across multiple engagements
- Anonymizes customer-specific details before proposing
- Tags proposals with source provenance (which node, which raw input, which date)
- Avoids re-proposing knowledge that already exists in the vault or was previously rejected

### What this changes about DDR-008

DDR-008's dual ingestion model (manual + agent proposals from playbook execution) remains valid but becomes the secondary path. The primary path is now:

| Path | Trigger | Human effort | Volume |
|---|---|---|---|
| **Raw mining** (primary) | New raw input appears | Approve/reject proposal | High, continuous |
| **Playbook proposals** (secondary) | Playbook completes | Approve/reject proposal | Medium, event-driven |
| **Manual entry** (supplementary) | Human decides to document | Full authorship | Low, sporadic |

## Alternatives Considered

| Alternative | Pros | Cons | Reason rejected |
|---|---|---|---|
| Gamification (badges, leaderboards) | Short-term engagement boost | Rewards quantity over quality, gaming risk, extrinsic motivation fades | Does not solve the capture friction problem |
| Mandatory contribution quotas | Guarantees volume | Creates minimum-viable-content, resentment, compliance theater | The "violence" we are explicitly avoiding |
| Incentive-based (bonuses for knowledge items) | Financial motivation | Same gaming risk, expensive, hard to measure quality | Paying for inputs, not outcomes |
| Fully automated (no human review) | Maximum throughput | Hallucination risk, quality degradation, trust erosion | DDR-008 principle: nothing enters without human review |
| Voice/chat capture ("hey agent, remember this") | Ultra-low friction for ad-hoc insights | Requires new input channel, unstructured data, harder to mine | Good supplementary mechanism for later |

## Consequences

**Positive:**
- Knowledge capture becomes a byproduct of normal work, not a separate task
- Raw vault (already populated as part of standard operations) becomes the primary source material
- Human effort shifts from authoring to curating, dramatically reducing contribution cost
- Attribution through impact creates organic motivation without surveillance
- Cold start problem partially addressed: existing raw inputs in current nodes can be retroactively mined

**Negative:**
- Extraction agent quality determines proposal quality. Poor extraction creates review fatigue.
- Review queue volume may overwhelm curators if extraction is too aggressive. Needs confidence thresholds and batching.
- Raw inputs must be rich enough to mine. Bullet-point meeting notes yield less than narrative summaries or transcripts.

**Risks:**
- **Review queue rot.** If proposals accumulate faster than humans review them, the queue becomes noise. Mitigated by: confidence-based filtering (only surface high-confidence proposals), batching into weekly digests, auto-expiring proposals older than 30 days.
- **Raw input quality.** If meeting notes are thin ("discussed pricing, follow up next week"), there is nothing to extract. Mitigated by: meeting processing playbook (OP_MTG_001) already produces structured notes, and the extraction agent can flag nodes with insufficient raw material. Voice transcripts are the highest-leverage improvement here.
- **Anonymization failures.** Customer-specific details leaking into the global vault. Mitigated by: extraction agent strips identifiers, human reviewer validates anonymization before approval.
- **Cold start.** The vault is empty on day one. First engagements get zero benefit from the learning system. The self-learning differentiator is true at scale but useless at deal one. Partial mitigation: retroactive mining of existing raw inputs in current nodes. Full mitigation may require a one-time seeding effort where domain experts contribute tribal knowledge, the only point where explicit contribution is tolerated, as a bootstrap, not a recurring expectation.

## Knowledge Consumption

DDR-013 primarily addresses the contribution side: how knowledge enters the vault. This section addresses the consumption side: how agents use vault knowledge to produce better outcomes. A vault that nobody reads is as useless as a vault that nobody writes to.

### Two consumption paths

Agents access the Knowledge Vault through two paths, each serving a different execution context.

**Path A: Playbook-driven injection (DDR-008 design).** During playbook execution, the PlaybookExecutor enriches the context at Step 3 with relevant knowledge items matched by domain, archetype, phase, and agent role. The agent receives this as `knowledge_context` in its `process()` inputs without any code changes. This is the primary consumption path for structured work: running analysis playbooks, generating assessments, evaluating risks.

**Path B: Direct agent access.** Agents that operate outside playbook execution, such as the Knowledge Extraction Agent scanning raw inputs, signal extraction from meeting notes, or ad-hoc analysis, need vault access without a playbook context. `BaseAgent.get_knowledge(domain, archetype, phase)` gives every agent direct vault access using the same relevance scoring as the enricher. The agent's role is used for relevance filtering.

| Path | When used | Knowledge flow | Implemented |
|---|---|---|---|
| **Playbook injection** | Structured playbook execution | Executor enriches context at Step 3, agent receives via inputs | Yes (knowledge_enricher.py) |
| **Direct access** | Raw input processing, signal extraction, ad-hoc | Agent calls `self.get_knowledge()` | Yes (BaseAgent.get_knowledge) |

### The feedback loop

Consumption closes the learning loop. Knowledge flows in a cycle:

```text
Raw inputs (meetings, field notes)
  │
  ▼
Agents process raw inputs ──► extract signals, generate artifacts
  │                                │
  │                          get_knowledge() ◄── Knowledge Vault
  │                                │
  ▼                                ▼
Better artifacts ──► richer raw material ──► better proposals
  │
  ▼
Knowledge Extraction Agent ──► proposals ──► human review ──► vault grows
```

The key insight: agents that consume knowledge produce better outputs, which become richer raw material for the next extraction cycle. This is the compounding effect described in the README's "self-learning system" differentiator. The hundredth deal benefits from the ninety-nine before it, but only if agents actually read the vault during execution.

### What prevents consumption from working

**Irrelevant knowledge.** If relevance scoring is too loose, agents receive items that don't help. The current scoring (domain + archetype + phase matching with confidence weighting) is a starting point, but may need tuning as the vault grows. Agents that consistently receive irrelevant items will learn to ignore `knowledge_context`, defeating the purpose.

**Stale knowledge.** Items that were valid two years ago may be wrong today. The confidence progression (proposed → reviewed → validated) helps, but there is no expiration mechanism. A validated item that has been contradicted by recent engagements should decay. This is an open design question.

**Empty vault.** During cold start, agents request knowledge and receive nothing. The system must degrade gracefully: agents work without knowledge context and produce baseline-quality outputs. As the vault fills, outputs improve. This gradual improvement must be invisible to the user, not a mode switch.

## Open Questions

1. **Retroactive mining.** Should the extraction agent scan existing raw inputs in all current nodes on first deployment, or only process new inputs going forward?
2. **Extraction frequency.** Continuous (on file change), daily batch, or weekly batch?
3. **Voice/chat capture.** Should a lightweight "quick note" input channel be added alongside structured raw inputs? Potentially the highest-value addition for tacit knowledge that never reaches a meeting note.
4. **Knowledge decay.** Should validated items have a review-by date? Should confidence degrade over time without re-validation?
5. **Consumption metrics.** Should the system track which knowledge items are actually used during execution, to identify high-value vs dead-weight items?

## Related Decisions

- [DDR-001: Three-Vault Knowledge Architecture](DDR_001_three_vault_knowledge_architecture.md): Established raw inputs within Internal Account Hub
- [DDR-008: Knowledge Vault Learning System](DDR_008_knowledge_vault_learning_system.md): Established agent proposals and human curation, which this decision extends with continuous extraction

## Status History

| Date | Status | Note |
|---|---|---|
| 2026-02-12 | PROPOSED | Identified that DDR-008's adoption risk requires a structural solution, not a UI one |
