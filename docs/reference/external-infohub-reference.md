---
title: "External InfoHub Reference"
description: "Reference guide for the customer-facing External InfoHub: customer deliverables that pass the shared screen test"
category: "reference"
keywords: ["external-infohub", "customer-hub", "knowledge-vault", "shared-screen-test", "deliverables"]
last_updated: "2026-02-11"
---

# External InfoHub Reference

The External InfoHub stores customer deliverables: content that passes the **shared screen test**. If you would project it during a customer meeting without hesitation, it belongs here. Everything else belongs in the [Internal InfoHub](internal-infohub-reference.md).

This principle was established in [DDR-006](../decisions/DDR_006_infohub_shared_screen_test.md) after recognizing that vendor analysis *about* the customer (journey maps, stakeholder influence assessments, pursuit decisions) is not the same as content *for* the customer. The External InfoHub is intentionally slim: solution architecture and technical deliverables that the customer co-owns.

For the architectural rationale behind the three-vault separation, see [DDR-001](../decisions/DDR_001_three_vault_knowledge_architecture.md). For the internal counterpart, see the [Internal InfoHub Reference](internal-infohub-reference.md).

## Directory Structure

The External InfoHub contains only customer-safe deliverables. The structure below reflects the ACME_CORP / SECURITY_CONSOLIDATION example after the DDR-006 restructuring.

```text
external-infohub/
├── engagement_overview.md              # Narrative overview: objective, why now, expected outcomes
├── account_team.yaml                   # Named contacts, roles, escalation path
├── engagement_timeline.yaml            # Phases, milestones, upcoming decision points
├── success_criteria.yaml               # Jointly agreed POC/evaluation criteria
└── architecture/
    └── ADR_001_security_platform.md    # Architecture decision records
```

Additional directories may be added as customer deliverables are produced:

```text
external-infohub/
├── engagement_overview.md   # Always created first, narrative entry point
├── account_team.yaml        # Team contacts and escalation
├── engagement_timeline.yaml # Phases and milestones
├── success_criteria.yaml    # Evaluation criteria with owners
├── architecture/            # ADRs, reference architectures, integration diagrams
├── technical-guides/        # Implementation guides, configuration recommendations
├── deliverables/            # Proposals, SOWs, project plans co-owned with customer
└── outcomes/                # Customer-approved success metrics, realized value reports
```

## What Belongs Here

Every artifact must pass the shared screen test: safe to project during a customer meeting. The following content types are appropriate for this hub.

- **Engagement overview**: narrative summary of objective, why now, expected outcomes, and next steps
- **Account team**: named contacts with roles, responsibilities, and escalation path
- **Engagement timeline**: phases, milestones, and upcoming decision points
- **Success criteria**: jointly agreed POC or evaluation criteria with owners and validation methods
- **Solution architecture**: ADRs, reference architectures, integration diagrams, deployment guides
- **Technical guidelines**: implementation guides, configuration recommendations, best practices specific to their environment
- **Customer deliverables**: proposals, SOWs, project plans that the customer co-owns
- **Agreed outcomes**: customer-approved success criteria, realized value metrics (not internal projections)
- **Training and enablement**: learning paths, training plans, customer guidelines
- **Professional services assets**: use case documentation, deployment runbooks, optimization guides

## What Does NOT Belong Here

Content that fails the shared screen test belongs in the [Internal InfoHub](internal-infohub-reference.md). This includes all vendor analysis about the customer, even if it seems professional.

- **Stakeholder maps with influence analysis**: internal observations about motivations, biases, political dynamics
- **Journey maps and touchpoint logs**: vendor's analysis of customer buying journey
- **Discovery findings and requirements**: internal capture of customer needs
- **Decision logs**: internal pursuit decisions ("Full Strategic Pursuit Approved")
- **Value projections**: internal ROI models and value hypotheses (realized metrics are fine)
- **Engagement context**: node overview with internal framing, engagement history timeline
- **Opportunity and POC tracking**: pipeline data, POC status, deal-level analysis
- **Commercial information**: pricing, deal terms, discount structures
- **Competitive intelligence**: incumbent analysis, displacement strategies
- **Agent scratchpads**: in-progress analysis, draft work products
- **Risk assessments**: candid risk analysis with vendor-internal commentary

## Agent Ownership

| File / Directory | Owner Agent | Content Scope |
|-----------|-------------|---------------|
| `engagement_overview.md` | AE Agent | Narrative overview, objectives, why now, next steps |
| `account_team.yaml` | AE Agent | Named contacts, roles, escalation path |
| `engagement_timeline.yaml` | AE Agent, CA Agent | Phases, milestones, decision points |
| `success_criteria.yaml` | SA Agent, POC Agent | Evaluation criteria, validation methods, owners |
| `architecture/` | SA Agent | ADRs, solution design, reference architectures, integration docs |
| `technical-guides/` | SA Agent, Specialist Agents | Implementation guidance, configuration docs |
| `deliverables/` | AE Agent | Customer-approved proposals, SOWs, shared project plans |
| `outcomes/` | VE Agent | Agreed success metrics, realized value reports |

## Content Standards

Content in the External InfoHub represents the vendor to the customer. Every artifact must meet these standards before it is shared.

- **Professional tone**: factual, clear, free of internal jargon or abbreviations the customer would not recognize
- **Self-contained sections**: each document should be understandable without requiring access to internal content
- **No vendor-internal references**: do not link to internal-infohub paths, agent scratchpads, or internal meeting notes
- **Consistent naming**: follow kebab-case for file names, `YYYY-MM-DD` prefixes for dated artifacts

## Governance Rules

- **Shared screen test**: before adding content, ask "would I project this during a customer meeting?" If no, it belongs in the Internal InfoHub
- **Review before sharing**: all content must be reviewed for accuracy and tone before being shared with the customer
- **No deletion without archive**: artifacts are never deleted, only archived with a dated suffix if superseded
- **Singular ownership**: each directory has one owning agent, no shared write access across agents
- **90-day freshness review**: content older than 90 days without updates should be reviewed for accuracy and relevance

## Lifecycle

The External InfoHub has a longer lifecycle than its internal counterpart because it becomes the customer's permanent solution knowledge base.

**Pre-sales**: the SA Agent populates architecture decisions and technical approach documents. Content is lean, focused on demonstrating the technical approach.

**Post-sales handoff**: when the deal closes, technical guidelines and deployment guides are added. The External InfoHub becomes the customer's solution knowledge base.

**Adoption and optimization**: the Customer Success Manager takes over ownership. Realized outcome metrics are added as the customer adopts the solution. Training and enablement materials are produced.

**Ongoing maintenance**: content is reviewed on a 90-day cycle for freshness. Architecture decisions may be updated as the solution evolves.

## Playbook Vault Routing

Playbooks that produce customer deliverables write directly to the External InfoHub via `vault_routing` metadata.

| Playbook | Output | Target |
|----------|--------|--------|
| PB_101 Discovery & Qualification | Engagement overview, account team contacts | `engagement_overview.md`, `account_team.yaml` |
| PB_102 Stakeholder Mapping | Engagement timeline with decision points | `engagement_timeline.yaml` |
| PB_103 Technical Validation | Validation checklist, success criteria | `architecture/`, `success_criteria.yaml` |
| PB_104 Solution Description | Solution design document, reference architecture | `architecture/` |
| PB_404 Customer Guidelines | Customer-facing guidelines, best practices | `technical-guides/` |
| PB_405 Training Plans | Learning paths, training schedules | `deliverables/` |

## Related Documentation

- [Knowledge Vault Architecture](../architecture/system/knowledge-vault-architecture.md): full three-vault model, data flows, and security boundaries
- [External InfoHub Lifecycle](../guides/for-practitioners/external-infohub-lifecycle.md): creation, active use, handoff, and post-sales maintenance
- [Internal InfoHub Reference](internal-infohub-reference.md): vendor-internal counterpart to this hub
- [DDR-001: Three-Vault Knowledge Architecture](../decisions/DDR_001_three_vault_knowledge_architecture.md): decision rationale for the three-vault separation
- [DDR-006: InfoHub Shared Screen Test](../decisions/DDR_006_infohub_shared_screen_test.md): content boundary restructuring
- [Agent Quick Reference](../architecture/agents/agent-quick-reference.md): agent responsibilities and InfoHub path mapping
