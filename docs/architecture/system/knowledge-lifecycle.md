---
title: "Knowledge Lifecycle"
order: 3
description: "How knowledge moves through the vault system: collection triggers, curation pipeline, sharing between vaults, quality gates, and feedback loops"
category: "architecture"
keywords: ["knowledge", "lifecycle", "curation", "collection", "sharing", "feedback", "quality"]
last_updated: "2026-03-12"
---

# Knowledge Lifecycle

The knowledge system's value depends not on where content is stored, but on how reliably good knowledge enters, how confidently it can be trusted once inside, and how effectively it finds users when they need it. This document covers all three: collection (how knowledge enters the system), curation (how it is validated and enriched), and delivery (how it reaches agents and practitioners at the right moment).

For the structural model, including vault directories, schema, and naming conventions, see [Vault Architecture](./vault-architecture.md). For day-to-day practitioner usage, see the [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md).

## Overview: The Knowledge Pipeline

Knowledge moves through three stages before it reaches agents and practitioners. The pipeline is designed so that nothing unvalidated can reach "all users" visibility, and nothing account-specific can enter the Global Knowledge Vault without anonymization.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KNOWLEDGE ECOSYSTEM                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   COLLECTION    │  │   CURATION      │  │   DELIVERY      │         │
│  │                 │  │                 │  │                 │         │
│  │ • Deal artifacts│  │ • Extraction    │  │ • Search/Browse │         │
│  │ • Field notes   │─▶│ • Validation    │─▶│ • Context push  │         │
│  │ • External intel│  │ • Enrichment    │  │ • Proactive     │         │
│  │ • Community     │  │ • Classification│  │   alerts        │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│           │                   │                    │                    │
│           └───────────────────┼────────────────────┘                    │
│                               ▼                                          │
│                    ┌─────────────────┐                                  │
│                    │ KNOWLEDGE GRAPH │                                  │
│                    │                 │                                  │
│                    │  Concepts ←→ Artifacts ←→ Outcomes                 │
│                    └─────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Vault to Vault

Knowledge flows in one direction: engagements produce account-level knowledge, and account-level knowledge feeds (after anonymization) into company-level knowledge. The Customer InfoHub is a separate output stream, never derived from internal content.

```text
Raw Inputs (meetings, field notes)
    │
    ├──→ External InfoHub     (solution knowledge → customer keeps)
    │
    ├──→ Internal InfoHub     (operational knowledge → vendor keeps)
    │         │
    │         └──→ Global Knowledge Vault (anonymized patterns → company learns)
    │
    └──→ Realm Intelligence   (account-level signals, tech maps)
```

The directional constraint is a security property. Content must be explicitly sanitized and anonymized before crossing from the Internal InfoHub to the Global Knowledge Vault. No automated process promotes content between these tiers without a human approval step.

## Phase 1: Collection

Knowledge collection draws from three source categories. Each category has different collection triggers and extraction approaches.

### Deal Artifacts (Primary Source)

Deal artifacts are the most valuable source because they represent real outcomes in real customer contexts. They are produced automatically as agents run playbooks and are located in the External InfoHub.

The following artifact types are extracted from deal workflows:

- **Discovery outputs** (`{realm}/{node}/external-infohub/context/`): pain points, requirements, stakeholder insights, architecture patterns, integration challenges
- **POC outputs** (`{realm}/{node}/external-infohub/journey/`): success factors, failure patterns, tuning insights, baseline comparisons, optimization techniques
- **RFx outputs** (`{realm}/{node}/external-infohub/context/`): winning positioning, objection handling, differentiators, counter-positioning
- **Outcome data** (`{realm}/{node}/external-infohub/value/`): decision factors, lessons learned, value delivered, improvement areas

### Field Expertise (Tribal Knowledge)

Experienced team members carry knowledge that never makes it into artifacts. The system captures this through three collection methods: post-engagement prompts triggered at playbook completion ("What worked well? What would you do differently?"), quarterly structured expertise interviews with top performers, and automated mining of internal channels (e.g., `#specialists`, `#technical-wins`, `#lessons-learned`).

Tacit knowledge is captured through pair engagement shadowing, expert retrospectives, and success story interviews. The goal is to surface repeatable patterns that exist in people's heads but not in any document.

### External Intelligence

External sources complement internal deal knowledge with market trends and competitive signals. The following source types are monitored:

- **Analyst reports** (Gartner, Forrester, IDC, GigaOm): market trends, buyer priorities, vendor positioning
- **Industry publications** (trade journals, tech blogs, research papers): emerging practices, technology trends
- **Competitor monitoring** (changelogs, press releases, product docs, blogs, case studies): new capabilities, positioning changes, messaging patterns
- **Review sites** (G2, Gartner Peer Insights, TrustRadius): competitor weaknesses, buyer priorities
- **Technical communities** (Reddit, HackerNews, StackOverflow, Discord): pain points, feature requests, sentiment
- **Open source ecosystems** (GitHub, CNCF, Apache): adoption patterns, integration trends

## Phase 2: Curation

Raw content becomes trusted knowledge through an extraction, validation, and enrichment pipeline. The pipeline is designed to handle both high-confidence automated extraction and cases requiring human judgment.

### Extraction Pipeline

Automatic extraction identifies the following from raw content:

- Key concepts and entities
- Actionable insights
- Success and failure patterns
- Quantitative outcomes
- Domain classification (security, search, observability)
- Type classification (technique, insight, warning, reference)
- Applicability tagging (industry, segment, use case)

Human-assisted extraction is triggered when high-value content is detected (ambiguous classification, contradictory information, or high-signal material that needs nuance added). Human reviewers refine extractions, add context, and complete tagging.

### Peer Consensus Validation

Validation uses a peer consensus model rather than a single-curator bottleneck. Items progress through five lifecycle states:

| State | Description | Visibility | Available Actions |
|-------|-------------|------------|-------------------|
| `draft` | Initial extraction, not yet validated | Contributor only | edit, submit_for_review |
| `under_review` | Awaiting peer validation | Domain specialists | upvote, downvote, comment, suggest_edit |
| `validated` | Peer consensus reached | All users | use, cite, flag_outdated |
| `best_practice` | Proven through outcomes | Featured | use, cite, track_usage |
| `archived` | Superseded or outdated | Historical | view_history |

**Promotion to `validated`** requires: 3 or more upvotes, at least 2 unique reviewers, no unresolved objections, and 1 domain expert approval.

**Promotion to `best_practice`** requires: `validated` status, positive outcome correlation of 0.7 or higher, 10 or more usage citations, and no negative feedback.

**Demotion triggers:** contradicting evidence submitted, 3 or more outdated flags, or negative outcome correlation of 0.5 or higher.

### Feedback Mechanisms

Feedback signals drive both item quality scores and confidence transitions. The system tracks four feedback types:

- **Upvote** (weight: +1): "This is accurate and useful"
- **Downvote** (weight: -1): "This is inaccurate or not useful" (requires a comment explanation)
- **Citation** (weight: +2): "I used this in my work" (also tracks outcome correlation)
- **Flag** (types: outdated, inaccurate, incomplete, duplicate): triggers a review queue entry

### Knowledge Enrichment

After validation, items are enriched to improve their usefulness at retrieval time. Automatic enrichment adds links to related knowledge items, domain and segment tags, key entity extraction, a generated summary, and identification of prerequisite knowledge. Contextual enrichment adds customer segment applicability, competitive context, temporal relevance (trending vs. evergreen), and a confidence score. Cross-reference enrichment links items to checklist criteria, playbook steps, and outcome data.

### Playbook Vault Routing

Playbooks declare `vault_routing` metadata that specifies where their outputs are written. This makes output destinations explicit and auditable at the moment of creation, rather than relying on post-hoc classification.

| Playbook | Primary Vault | Secondary Vault |
|----------|---------------|-----------------|
| PB_SA_002 Sizing Estimation | Internal InfoHub | External InfoHub (sanitized summary) |
| CL_SA_103 Technical Validation | External InfoHub | Internal InfoHub (internal notes) |
| PB_SA_003 Solution Description | External InfoHub | Internal InfoHub (architecture notes) |
| PB_CA_010 Customer Guidelines | External InfoHub | - |
| PB_CA_011 Training Plans | External InfoHub | - |
| PB_CA_012 Adoption Guidance | External InfoHub | Internal InfoHub (candid assessment) |

## Phase 3: Delivery

Knowledge that is collected and curated has no value if it never reaches the people and agents who need it. The delivery layer operates in three modes: pull (search and browse), contextual push (in-workflow injection), and proactive alerts (subscription-based notifications).

### Pull: Search and Browse

Pull delivery allows practitioners to search and browse the knowledge base on demand. The following capabilities are supported:

- Full-text search across all knowledge
- Semantic and vector search for concept matching
- Faceted filtering (domain, type, recency, validation level)
- Saved searches and alerts

Search results are ranked by a weighted combination of: relevance score (0.4), validation level (0.2), recency (0.15), usage count (0.15), and outcome correlation (0.1).

Browse views are available by domain (security, search, observability), by type (techniques, insights, warnings), by use case, by customer segment, and by recency (trending, top-rated). Views are personalized based on user role, current engagement context, and past usage patterns.

### Contextual Push: In-Workflow Injection

The most impactful delivery mode injects relevant knowledge into agent context at the moment it is needed, without requiring the agent to search. Two mechanisms operate in parallel.

**Q&A retrieval (active mode):** During playbook execution (step 3 of the pipeline), the PlaybookExecutor calls the KnowledgeService to fetch items matching the node's blueprint classification (domain, archetype, phase). The knowledge enricher (`platform/knowledge/knowledge_enricher.py`) formulates step-specific questions from the workflow step's intent combined with the agent's declared knowledge scope, retrieves relevant passages from the reference corpus, and synthesizes a step-specific knowledge context. This context is injected into the agent's input as `knowledge_context`. Agents receive richer inputs without any code changes to their `process()` methods.

**Trigger-based suggestions (reactive mode):** Specific workflow events surface relevant knowledge as non-intrusive suggestions (sidebar or tooltip, maximum 3 items, dismissable). Triggers include:

- `playbook_step_started`: surface relevant knowledge for the current step (e.g., starting an RFx response surfaces winning positioning patterns)
- `checklist_criterion_addressed`: surface related best practices (e.g., addressing SEC_TD_002 surfaces MITRE coverage strategies)
- `creating_discovery_document`: suggest relevant discovery insights
- `creating_poc_plan`: surface similar POC learnings
- `customer_industry_detected`: surface industry-specific knowledge
- `competitor_mentioned`: surface competitive intelligence

### Retrieval Modes

The knowledge enricher supports three retrieval modes, each building on the previous.

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Metadata match** | Agent scope + step context | Match domain tags and descriptions to find relevant references. Baseline mode, always available |
| **Q&A retrieval** | Step intent + agent scope | Platform formulates step-specific questions, retrieves and synthesizes answers from reference corpus. Returns contextual knowledge, not raw files |
| **Proactive push** | Engagement context changes | Platform monitors engagement signals and surfaces relevant knowledge before the agent requests it. Subscription-based delivery |

### Proactive Alerts

Practitioners subscribe to domains, topics, competitors, or customer segments and receive alerts when relevant new knowledge is added or existing items are updated. Smart subscriptions are also generated automatically based on current engagements, role, and past interactions.

Alert types and urgency levels include the following. High-urgency alerts are delivered immediately via in-app notification and Slack DM. Normal-urgency alerts are batched into a daily or weekly digest (user preference).

| Alert Type | Trigger | Urgency |
|------------|---------|---------|
| `new_best_practice` | Knowledge promoted to best_practice | Normal |
| `trending_insight` | Knowledge getting high engagement | Normal |
| `relevant_to_engagement` | New knowledge matches active engagement | High |
| `competitive_update` | New competitor intelligence added | High |
| `knowledge_update` | Knowledge you cited was updated | Normal |

## Feedback Loop: Agent Outputs Back to Knowledge

Agent outputs close the loop by feeding new knowledge proposals back into the collection pipeline. This is the mechanism through which every engagement makes future engagements better.

### Agent Proposals

When agents identify a reusable pattern during an engagement, they emit a `knowledge_proposal` signal. Proposed items land in `vault/knowledge/.proposals/`, where the **Knowledge Vault Curator** agent validates schema compliance, anonymization completeness, and relevance metadata accuracy. Humans then review and approve via the Knowledge Vault UI (`/knowledge`).

Two ingestion paths, both requiring human approval:

1. **Manual entry**: Practitioners add items directly through the Knowledge Vault UI, providing structured YAML frontmatter and markdown content
2. **Agent proposals**: Agents emit `knowledge_proposal` signals; items land in `.proposals/` and are processed through the curator workflow described above

### Integration with Checklists and Playbooks

The feedback loop is bidirectional between knowledge and the operational tools that use it. Best practices suggest new checklist criteria, insights inform weight adjustments, and warnings flag criteria gaps. In the other direction, checklist coverage triggers knowledge suggestions, and checklist gaps prompt knowledge search. Playbooks capture lessons learned at completion, and knowledge hooks in playbook steps surface relevant items at the moment of use.

### Outcome Correlation

The system tracks which knowledge items were cited during engagements and correlates citations with engagement outcomes. This data drives the `outcome_correlation` field on each knowledge item and is a required input for promotion to `best_practice` status (threshold: 0.7 positive correlation). Items with a negative outcome correlation of 0.5 or higher are automatically flagged for demotion review.

## Artifact Lifecycle and Staleness

Content does not stay active indefinitely. Staleness thresholds and lifecycle states govern when artifacts are reviewed, deprecated, or archived.

### Staleness Thresholds

| Content Type | Stale After | Action |
|-------------|------------|--------|
| Meeting notes | 90 days | Auto-deprecate |
| Competitive intelligence | 60 days | Review for accuracy |
| Risk register entries | 7 days without update | Nudger reminder |
| Health scores | 7 days without update | Flag for review |
| Actions | 7 days unchanged | Nudger check-in |
| Decisions | Never auto-deprecate | Manual only (audit trail) |
| Architecture docs | 90 days | SA review |
| Agent scratchpads | 30 days after engagement close | Clear |

### Lifecycle States

All artifacts follow a four-state lifecycle: **Active -> Stale -> Deprecated -> Archived**

- **Active**: current and maintained
- **Stale**: no update within the threshold period; flagged for review
- **Deprecated**: superseded by newer content; kept for reference
- **Archived**: engagement closed; content preserved but not actively maintained

### Global Vault Maintenance

The Global Knowledge Vault runs additional maintenance processes to prevent stale knowledge from degrading retrieval quality:

- Flag potentially outdated knowledge (items older than 12 months)
- Detect contradictions with newer knowledge items
- Identify low-usage candidates for review

Scheduled reviews include quarterly domain expert review of all best practices and monthly review of flagged or outdated items.

## Governance Metrics

The following metrics are tracked to monitor the health of the knowledge system. These are not vanity metrics: each one signals a specific failure mode.

### Knowledge Health

- **Validation rate**: percentage of contributed items that reach `validated` status (low rate signals a broken review process)
- **Usage rate**: percentage of knowledge items that are cited in engagements (low rate signals poor relevance or delivery)
- **Freshness**: average age of active knowledge (high average age signals insufficient contribution)
- **Coverage**: domains and topics with knowledge gaps (gaps signal where institutional knowledge is at risk)

### Contribution Health

- Contributors per period
- Contribution-to-validation ratio
- Cross-domain contribution (prevents knowledge siloing by domain)

### Impact Metrics

- Knowledge-to-outcome correlation (does citing knowledge improve win rates?)
- Time saved (self-reported by practitioners)
- Engagement success rate delta (trend over time as knowledge base grows)

## Implementation Phases

The knowledge lifecycle was designed to be built incrementally. Each phase adds capability without requiring a rewrite of what came before.

**Phase 1: Foundation** establishes the knowledge graph structure and basic collection mechanisms: schema and storage, basic extraction from deal artifacts, search and browse interface, and manual contribution workflow.

**Phase 2: Validation** adds peer consensus so knowledge quality is community-driven rather than curator-bottlenecked. Adds the peer consensus workflow, upvote/downvote/citation tracking, validation lifecycle management, and quality dashboards.

**Phase 3: Active Delivery** shifts from pull-only to push delivery so knowledge finds users rather than waiting to be searched. Adds contextual suggestions in playbooks, subscription and alert system, personalization engine, and knowledge digest.

**Phase 4: Intelligence** closes the loop with automated external monitoring and outcome correlation, transforming the knowledge system from a curated library into an intelligence platform that continuously learns from both internal results and external signals.

## Related Documentation

- [Vault Architecture](./vault-architecture.md): Structure, schema, naming conventions, and access model
- [Knowledge Vault Guide](../../guides/for-practitioners/knowledge-vault-guide.md): Practitioner usage guide
- [DDR-001: Three-Vault Knowledge Architecture](../../decisions/DDR_001_three_vault_knowledge_architecture.md): Decision rationale
- [DDR-015: Curator Agent Specialization](../../decisions/DDR_015_curator_agent_specialization.md): Governance model
- [DDR-022: Knowledge Q&A Service](../../decisions/DDR_022_knowledge_qa_service_evolution.md): Retrieval model
- [External InfoHub Reference](../../reference/external-infohub-reference.md): Customer hub reference
- [Internal InfoHub Reference](../../reference/internal-infohub-reference.md): Internal hub reference
