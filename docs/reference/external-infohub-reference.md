---
title: "External InfoHub Reference"
description: "Reference guide for the customer-facing External InfoHub, covering structure, content rules, agent ownership, and governance"
category: "reference"
keywords: ["external-infohub", "customer-hub", "knowledge-vault", "content-rules", "governance"]
last_updated: "2026-02-10"
---

# External InfoHub Reference

The External InfoHub is the customer-facing knowledge base for an engagement. It answers three fundamental questions: what did we build, why did we choose this approach, and what value was delivered. Every artifact in this hub is designed to be shared with the customer, either during the engagement or as a lasting deliverable after it concludes.

This matters because the External InfoHub is the engagement's permanent record. When the deal closes, the customer keeps this as their solution knowledge base. It must be professional, self-contained, and free of any vendor-internal content.

For the architectural rationale behind the three-vault separation, see [DDR-001](../decisions/DDR_001_three_vault_knowledge_architecture.md). For the internal counterpart, see the [Internal InfoHub Reference](internal-infohub-reference.md).

## Directory Structure

The External InfoHub follows a consistent directory layout across all engagement nodes. Each top-level directory serves a distinct purpose and is owned by a specific agent. The structure below reflects the actual ACME_CORP / SECURITY_CONSOLIDATION example.

```text
external-infohub/
├── context/
│   ├── node_overview.yaml               # Business and technical context
│   ├── engagement_history.md            # Timeline of key engagement events
│   └── stakeholder_map.yaml            # Customer-facing stakeholder profiles
│
├── architecture/
│   └── ADR_001_security_platform.md    # Architecture decision records
│
├── decisions/
│   └── decision_log.yaml              # Customer-appropriate decision outcomes
│
├── opportunities/
│   └── security_poc/
│       ├── discovery.yaml             # Discovery findings and requirements
│       ├── requirements.yaml          # Formal requirements
│       ├── success_criteria.yaml      # POC success criteria
│       ├── poc_success_plan.yaml      # Execution plan
│       └── poc_status/
│           └── status_2026-01-16.yaml # Dated status updates
│
├── journey/
│   ├── customer_journey_map.yaml      # Engagement phases and milestones
│   └── touchpoint_log.yaml           # Record of customer interactions
│
└── value/
    └── value_tracker.yaml             # ROI metrics and value delivered
```

## What Belongs Here

The External InfoHub contains content that demonstrates value to the customer and supports their adoption of the solution. The following content types are appropriate for this hub.

- **Solution architecture and design artifacts**: ADRs, reference architectures, integration diagrams, deployment guides
- **Business and technical context**: engagement overview, stakeholder mapping (customer-visible roles only), engagement history
- **Decision records**: final decision outcomes with rationale, framed for a customer audience
- **POC and discovery artifacts**: discovery findings, requirements, success criteria, POC plans, status updates
- **Customer journey documentation**: journey maps, touchpoint logs, milestone tracking
- **Value metrics**: ROI analysis, adoption metrics, value delivery summaries
- **Training and enablement**: learning paths, training plans, customer guidelines
- **Professional services assets**: use case documentation, deployment runbooks, optimization guides

## What Does NOT Belong Here

Certain content types must never appear in the External InfoHub because they either expose vendor strategy or could damage the customer relationship. The following items belong in the [Internal InfoHub](internal-infohub-reference.md) or are excluded entirely.

- **Commercial information**: pricing, deal terms, discount structures, margin analysis
- **Competitive intelligence**: incumbent analysis, displacement strategies, competitive positioning
- **Internal meeting notes**: deal reviews, team syncs, candid internal discussions
- **Agent scratchpads**: in-progress analysis, draft work products, interim reasoning
- **Vendor strategy documents**: go-to-market plans, account strategy, expansion playbooks
- **Intermediary decisions**: internal deliberations that preceded the final customer-facing decision
- **Candid risk assessments**: unfiltered risk analysis with vendor-internal commentary
- **Stakeholder notes with internal observations**: motivations, biases, political dynamics

## Agent Ownership

Each directory in the External InfoHub has a single owning agent responsible for creating, updating, and maintaining its content. This table defines the ownership boundaries so that agents know where to write and where not to.

| Directory | Owner Agent | Content Scope |
|-----------|-------------|---------------|
| `context/` | RFP Agent | Business context, engagement history, customer-facing stakeholder profiles |
| `architecture/` | SA Agent | ADRs, solution design, reference architectures, integration docs |
| `decisions/` | Decision Registrar | Decision outcomes, rationale, and status (customer-appropriate framing) |
| `opportunities/` | AE Agent | Initiatives, POC plans, discovery findings, requirements, success criteria |
| `journey/` | Delivery, PS, POC Agents | Customer journey maps, touchpoint logs, milestone tracking |
| `value/` | VE Agent | Value tracker, ROI analysis, adoption metrics, success measurements |

## Content Standards

Content in the External InfoHub represents the vendor to the customer. Every artifact must meet these standards before it is shared.

- **Professional tone**: factual, clear, free of internal jargon or abbreviations the customer would not recognize
- **Self-contained sections**: each document should be understandable without requiring access to internal content
- **Structured data preferred**: use YAML for structured artifacts (stakeholder maps, decision logs, value trackers) and Markdown for narrative documents (ADRs, engagement history)
- **No vendor-internal references**: do not link to internal-infohub paths, agent scratchpads, or internal meeting notes
- **Attribution**: reference playbook IDs and decision IDs where applicable, but only those visible to the customer
- **Consistent naming**: follow kebab-case for file names, `YYYY-MM-DD` prefixes for dated artifacts

## Governance Rules

These rules ensure the External InfoHub remains a trustworthy, well-maintained customer deliverable throughout the engagement lifecycle.

- **Review before sharing**: all content must be reviewed for accuracy and tone before being shared with the customer
- **No deletion without archive**: artifacts are never deleted, only archived with a dated suffix if superseded
- **Singular ownership**: each directory has one owning agent, no shared write access across agents
- **kebab-case naming**: all file and directory names use lowercase kebab-case (e.g., `poc-success-plan.yaml`)
- **90-day freshness review**: content older than 90 days without updates should be reviewed for accuracy and relevance
- **Playbook vault routing**: playbooks that write to the External InfoHub must declare `vault_routing` metadata targeting this vault explicitly

## Lifecycle

The External InfoHub has a longer lifecycle than its internal counterpart because it becomes the customer's permanent solution knowledge base. Content evolves through distinct phases with different ownership and update patterns.

**Pre-sales**: the hub is populated during the engagement with context, architecture decisions, POC plans, and discovery findings. The SA Agent and AE Agent are the primary contributors. Content focuses on demonstrating the approach and building the technical narrative.

**Post-sales handoff**: when the deal closes, the External InfoHub is handed to the customer as their solution knowledge base. Content is reviewed for completeness, accuracy, and tone. Any gaps identified during the engagement are filled before handoff.

**Adoption and optimization**: the Customer Success Manager takes over ownership. Value metrics are updated as the customer adopts the solution. Journey maps evolve to reflect post-deployment milestones, training completion, and expansion opportunities.

**Ongoing maintenance**: content is reviewed on a 90-day cycle for freshness. Architecture decisions may be updated as the solution evolves. Value trackers are refreshed with current metrics.

## Playbook Vault Routing

Several playbooks write their outputs directly to the External InfoHub. The `vault_routing` metadata in each playbook declares this explicitly, ensuring outputs land in the correct vault without manual intervention.

| Playbook | Output | Directory |
|----------|--------|-----------|
| PB_103 Technical Validation | Validation checklist, technical requirements | `architecture/` |
| PB_104 Solution Description | Solution design document, reference architecture | `architecture/` |
| PB_404 Customer Guidelines | Customer-facing guidelines, best practices | `journey/` |
| PB_405 Training Plans | Learning paths, training schedules | `journey/` |
| PB_406 Adoption Guidance | Adoption roadmap, success milestones | `value/` |

Some playbooks write to both the External and Internal InfoHubs. In these cases, the external output is a sanitized summary while the internal output contains the full analysis. For example, PB_102 (Sizing Estimation) writes a high-level sizing summary to the External InfoHub and the detailed financial model to the Internal InfoHub.

## Creating a New External InfoHub

When a new engagement node is created, the External InfoHub is instantiated from a standard template. The template provides the full directory scaffold with placeholder files and README instructions for each section.

Reference template location: `vault/_templates/node/external-infohub/README.md`

The template includes the six standard directories (`context/`, `architecture/`, `decisions/`, `opportunities/`, `journey/`, `value/`) with starter YAML files that define the expected schema for each content type.

## Related Documentation

- [Knowledge Vault Architecture](../architecture/system/knowledge-vault-architecture.md): full three-vault model, data flows, and security boundaries
- [External InfoHub Lifecycle](../guides/for-practitioners/external-infohub-lifecycle.md): creation, active use, handoff, and post-sales maintenance
- [Internal InfoHub Reference](internal-infohub-reference.md): vendor-internal counterpart to this hub
- [DDR-001: Three-Vault Knowledge Architecture](../decisions/DDR_001_three_vault_knowledge_architecture.md): decision rationale for the three-vault separation
- [Agent Quick Reference](../architecture/agents/agent-quick-reference.md): agent responsibilities and InfoHub path mapping
