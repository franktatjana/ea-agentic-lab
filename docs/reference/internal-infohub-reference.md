---
title: "Internal InfoHub Reference"
description: "Reference guide for the vendor-internal Internal InfoHub, covering structure, content rules, agent ownership, governance, and lifecycle"
category: "reference"
keywords: ["internal-infohub", "vendor-hub", "knowledge-vault", "risk-register", "governance", "competitive"]
last_updated: "2026-02-11"
---

# Internal InfoHub Reference

The Internal InfoHub is the vendor-internal operational workspace for an engagement. This is where the honest conversation happens: what are the real risks, how are we executing against our strategy, and what is our competitive position. None of this content is ever shared with the customer.

The Internal InfoHub exists because candid analysis requires a safe space. Risk assessments lose value when sanitized for customer consumption. Competitive intelligence becomes useless when stripped of specifics. Stakeholder profiles need internal observations about motivations and biases to be actionable. Separating this content structurally, not just by metadata, ensures that a single misconfigured tag cannot expose sensitive material.

For the architectural rationale behind the three-vault separation, see [DDR-001](../decisions/DDR_001_three_vault_knowledge_architecture.md). For the content boundary definition, see [DDR-006](../decisions/DDR_006_infohub_shared_screen_test.md). For the customer-facing counterpart, see the [External InfoHub Reference](external-infohub-reference.md).

## Directory Structure

The Internal InfoHub follows a consistent directory layout across all engagement nodes. Each top-level directory serves a distinct operational function and is owned by a specific agent or agent group. The structure below reflects the ACME_CORP / SECURITY_CONSOLIDATION example after the DDR-006 restructuring that moved engagement context, journey, decisions, opportunities, and value tracking here from the External InfoHub.

```text
internal-infohub/
├── context/
│   ├── node_overview.yaml             # Business and technical context
│   ├── engagement_history.md          # Timeline of key engagement events
│   └── stakeholder_map.yaml          # Stakeholder profiles with influence analysis
│
├── decisions/
│   └── decision_log.yaml             # Pursuit decisions and internal deliberations
│
├── journey/
│   ├── customer_journey_map.yaml     # Vendor's analysis of customer journey
│   └── touchpoint_log.yaml          # Record of all customer interactions
│
├── opportunities/
│   └── security_poc/
│       ├── discovery.yaml            # Discovery findings and requirements
│       ├── requirements.yaml         # Formal requirements
│       ├── success_criteria.yaml     # POC success criteria
│       ├── poc_success_plan.yaml     # Execution plan
│       └── poc_status/
│           └── status_2026-01-16.yaml
│
├── value/
│   └── value_tracker.yaml            # ROI projections and value tracking
│
├── risks/
│   ├── risk_register.yaml            # Active risk register with IDs and status
│   └── risk_history.yaml             # Historical risk evolution and closures
│
├── stakeholders/
│   ├── sarah_chen.yaml               # Individual profiles with internal notes
│   ├── klaus_hoffman.yaml
│   └── marcus_weber.yaml
│
├── competitive/
│   └── competitive_context.yaml      # Incumbent analysis, positioning strategy
│
├── governance/
│   ├── health_score.yaml             # Engagement health metrics
│   ├── operating_cadence.yaml        # Meeting cadence, review cycles
│   └── alerts/                       # Governance alerts and escalations
│
├── frameworks/
│   ├── PB_001_three_horizons_20260112.md       # Strategic framework outputs
│   ├── PB_201_swot_20260112.md
│   ├── PB_201_swot_20260116_revised.md
│   └── PB_301_value_engineering_20260112.md
│
├── market_intelligence/
│   └── news_digest.yaml              # Market signals, industry news
│
├── actions/
│   └── action_tracker.yaml           # Action items with IDs, owners, status
│
└── agent_work/
    └── scratchpad_sa_2026-01-22_displacement_analysis.yaml
```

## What Belongs Here

The Internal InfoHub contains everything the account team needs to execute effectively. This is operational content that requires vendor-internal confidentiality. The following content types belong in this hub.

- **Competitive intelligence**: incumbent analysis, displacement strategies, competitive positioning, win/loss factors
- **Deal reviews and internal decision-making**: commercial strategy, pricing rationale, negotiation notes
- **Internal meeting notes**: deal review summaries, team sync outcomes, strategy discussions
- **Risk assessments**: candid risk registers with probability, impact, and mitigation plans
- **Pricing strategy**: financial analysis, discount justification, margin impact
- **Stakeholder mapping with internal notes**: motivations, biases, political dynamics, influence networks
- **Agent scratchpads**: in-progress analysis, draft reasoning, intermediate work products
- **Health scores and governance metrics**: engagement health, cadence compliance, alert history
- **Escalation history**: blocked items, escalation paths taken, resolution outcomes
- **Framework outputs**: SWOT analyses, Three Horizons, Value Engineering calculations, strategic playbook results
- **Market intelligence**: news digests, technology signals, industry developments relevant to the account

## What Does NOT Belong Here

Some content types do not belong in the Internal InfoHub because they serve a different audience or scope. The following items should be directed elsewhere.

- **Anonymized patterns**: belong in the Global Knowledge Vault (`vault/knowledge/`), not in account-specific storage
- **Customer-identifiable best practices**: must be anonymized before promotion to the Global Knowledge Vault
- **Customer-facing documentation**: solution architecture, ADRs, and value summaries belong in the [External InfoHub](external-infohub-reference.md)
- **Raw meeting recordings**: land in `raw/meetings/` for processing, not directly in the Internal InfoHub

## Agent Ownership

Each directory in the Internal InfoHub has a single owning agent or agent group. Ownership determines who creates, updates, and maintains content in that directory. Other agents may read from any directory but must not write outside their owned scope.

| Directory | Owner Agent | Content Scope |
|-----------|-------------|---------------|
| `risks/` | Risk Radar | Risk register, risk history, risk evolution tracking |
| `stakeholders/` | AE Agent | Individual stakeholder profiles with internal notes and observations |
| `competitive/` | CI Agent | Competitive context, incumbent analysis, displacement positioning |
| `governance/` | Governance Agents | Health scores, operating cadence, alerts, escalation tracking |
| `frameworks/` | Strategic Playbooks | SWOT, Three Horizons, Value Engineering, and other framework outputs |
| `actions/` | Task Shepherd, Nudger | Action tracker, blocked items, follow-up reminders |
| `decisions/` | Decision Registrar | Internal decision records with full deliberation context |
| `agent_work/` | All Agents | Scratchpads, in-progress analysis, intermediate work products |

## Content Standards

Content in the Internal InfoHub prioritizes accuracy and actionability over polish. These standards ensure the hub remains useful as a working operational tool.

- **Structured data preferred**: use YAML for registers, trackers, profiles, and metrics; reserve Markdown for framework narratives and analysis documents
- **Candor expected**: risk assessments, competitive analysis, and stakeholder notes should reflect the team's honest assessment, not a sanitized version
- **Attribution required**: every artifact must identify its source agent, creation date, and the playbook or trigger that produced it
- **IDs mandatory**: risks use `RISK_ID` format (e.g., `CISO_BIAS`), actions use `ACT_NNN`, decisions use `DEC_NNN`
- **Provenance links**: link back to the raw input, meeting note, or playbook that generated the content
- **Consistent naming**: follow kebab-case for file names, playbook outputs use `PB_{number}_{name}_YYYYMMDD` format, scratchpads use `scratchpad_{agent}_{date}_{topic}` format

## Governance Rules

These rules protect sensitive content and ensure the Internal InfoHub remains a reliable operational workspace throughout the engagement.

- **Never share with customers**: no content from this hub may be shared externally without explicit sanitization and relocation to the External InfoHub
- **Single owner per directory**: one agent owns each directory, preventing conflicting updates
- **kebab-case naming**: all file and directory names use lowercase kebab-case
- **Structured over prose**: prefer YAML with defined schemas over free-form Markdown where possible
- **Archive on completion**: when an engagement closes, the Internal InfoHub is archived, not deleted
- **Anonymize before promoting**: any content promoted to the Global Knowledge Vault must be stripped of customer-identifiable information first

## Lifecycle

The Internal InfoHub follows a four-phase lifecycle that governs content from creation through knowledge extraction. Each phase has specific activities and responsibilities.

**Creation**: the hub is scaffolded when a new engagement node is initialized, with empty directories and starter templates for each content type.

**Active**: agents populate and update content throughout the engagement. This is the primary operational phase where risk registers, stakeholder profiles, and competitive analysis are continuously maintained.

**Archival**: when the engagement closes or transitions, the hub is archived as a complete snapshot. Content is frozen but remains accessible for reference.

**Knowledge Extraction**: key learnings are anonymized and promoted to the Global Knowledge Vault (`vault/knowledge/`). Patterns, risk indicators, and success factors feed back into the system's institutional memory.

### Staleness Thresholds

Different content types have different freshness requirements. Content that exceeds these thresholds should be reviewed and either updated or marked as stale.

| Content Type | Staleness Threshold | Rationale |
|-------------|---------------------|-----------|
| Risk register | 7 days | Risks evolve rapidly, stale assessments create blind spots |
| Health scores | Weekly | Engagement health must reflect current reality |
| Action tracker | 7 days | Overdue actions need escalation, not silence |
| Competitive intelligence | 60 days | Market positioning shifts quarterly, not daily |
| Agent scratchpads | 30 days post-close | Scratchpads lose relevance quickly after engagement ends |

## Creating a New Internal InfoHub

When a new engagement node is created, the Internal InfoHub is instantiated from a standard template. The template provides the full directory scaffold with empty registers, placeholder profiles, and README instructions for each section.

Reference template location: `vault/_templates/node/internal-infohub/README.md`

The template includes the eight standard directories (`risks/`, `stakeholders/`, `competitive/`, `governance/`, `frameworks/`, `actions/`, `decisions/`, `agent_work/`) with starter YAML files that define the expected schema for each content type.

## Related Documentation

- [Knowledge Vault Architecture](../architecture/system/knowledge-vault-architecture.md): full three-vault model, data flows, and security boundaries
- [External InfoHub Reference](external-infohub-reference.md): customer-facing counterpart to this hub
- [DDR-001: Three-Vault Knowledge Architecture](../decisions/DDR_001_three_vault_knowledge_architecture.md): decision rationale for the three-vault separation
- [Agent Quick Reference](../architecture/agents/agent-quick-reference.md): agent responsibilities and InfoHub path mapping
