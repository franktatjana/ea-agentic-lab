---
title: "External InfoHub Lifecycle"
order: 3
description: "Day-to-day guide for managing customer-facing InfoHub content, from creation to archival"
category: "guide"
keywords: ["external", "infohub", "lifecycle", "content", "review", "archival"]
last_updated: "2026-02-10"
---

# External InfoHub Lifecycle

This guide covers the practical day-to-day management of External InfoHub content. It explains when content is created, how it is reviewed, when it should be updated, and how archival works. For what belongs in the External InfoHub and its directory structure, see the [External InfoHub Reference](../../reference/external-infohub-reference.md).

## Content Creation

External InfoHub content is created through two paths: playbook execution and manual contribution. Both paths produce artifacts that are reviewed before becoming visible to the customer.

### Playbook-Driven Creation

Most External InfoHub content is produced by playbook execution. The playbook's `vault_routing` metadata determines that the output belongs in the external hub, and the owning agent writes it to the correct directory.

| Playbook | Output | Directory |
|----------|--------|-----------|
| PB_103 Technical Validation | Validation checklist, results | `architecture/` |
| PB_104 Solution Description | Solution architecture doc | `architecture/` |
| PB_404 Customer Guidelines | Guidelines document | `journey/training/` |
| PB_405 Training Plans | Training plan | `journey/training/` |
| PB_406 Adoption Guidance | Adoption roadmap | `journey/` |

### Manual Contribution

Practitioners can create content directly when it falls outside playbook coverage. Manual contributions follow the same directory structure and naming conventions. Every manually created artifact must have YAML frontmatter with title, description, and last_updated fields.

## Review Process

All content entering the External InfoHub must pass review before the customer accesses it. The review ensures that no vendor-internal information has leaked and that the content meets professional standards.

### Review Checklist

Before approving content for the External InfoHub, verify:

- [ ] No commercial information (pricing, deal terms, discounts)
- [ ] No competitive intelligence or vendor strategy
- [ ] No internal meeting notes or candid assessments
- [ ] No references to internal-infohub or agent_work content
- [ ] Professional tone, no casual language or abbreviations
- [ ] Factual claims are backed by evidence
- [ ] File follows naming conventions (`lowercase-kebab-case`)
- [ ] YAML frontmatter is complete (title, description, last_updated)
- [ ] Cross-references use correct relative paths

### Reviewers

| Content Type | Primary Reviewer | Secondary Reviewer |
|-------------|-----------------|-------------------|
| Architecture docs | SA Agent / SA | - |
| Decision records | Decision Registrar | SA or CA |
| Value metrics | VE Agent | AE |
| Journey/training | CA Agent | PS |
| Context docs | RFP Agent | AE |
| POC results | POC Agent | SA |

## Content Update Cadence

External InfoHub content should be kept current throughout the engagement and updated during post-sales. Stale content erodes customer trust and misrepresents the engagement.

### Recommended Update Frequency

| Content Type | Update Trigger | Minimum Frequency |
|-------------|---------------|-------------------|
| Engagement overview | Major engagement shifts, phase transitions | Quarterly |
| Account team | Team changes, role reassignments | As changes occur |
| Engagement timeline | Milestone completion, phase transitions | As events occur |
| Success criteria | Status changes (met/not met), scope adjustments | After each validation |
| Solution architecture | Design changes, new ADRs | As changes occur |
| Value tracker | Value milestones, QBR preparation | Monthly |
| Adoption progress | Usage data updates | Monthly |
| Meeting summaries | After each customer meeting | Within 48 hours |
| Training materials | Curriculum changes | As needed |

### Freshness Monitoring

The Knowledge Curator agent monitors content freshness automatically. Content older than 90 days without updates is flagged for review. The SA or CA is notified and must either update the content or confirm it remains accurate.

## Deprecation and Archival

Content in the External InfoHub is never deleted. Deprecated content is marked and archived to preserve the engagement record.

### When to Deprecate

Deprecate content when it is superseded by newer information, no longer accurate, or no longer relevant to the engagement. Common deprecation triggers include architecture changes that replace earlier designs, decision reversals, and scope changes that invalidate prior documentation.

### How to Deprecate

1. Add a deprecation notice at the top of the document:
   ```markdown
   > **Deprecated**: Superseded by [new-document.md](path/to/new-document.md) on YYYY-MM-DD.
   ```
2. Update `engagement_overview.md` to reflect the current state
3. Do not delete the deprecated file; it remains for audit trail purposes

### Engagement Close Archival

When an engagement transitions from pre-sales to post-sales, or when it closes entirely:

1. Review all External InfoHub content for accuracy
2. Update `overview.md` with final engagement summary
3. Mark the node's engagement status as closed in `node_profile.yaml`
4. The External InfoHub remains accessible to the customer as their solution knowledge base

## Quality Checklist

Use this checklist for periodic quality audits of the External InfoHub. The Knowledge Curator agent runs automated checks, but manual review catches nuances that automation misses.

- [ ] `engagement_overview.md` accurately reflects the current engagement state
- [ ] `account_team.yaml` has current contacts and escalation path
- [ ] `engagement_timeline.yaml` reflects latest phase and milestone status
- [ ] `success_criteria.yaml` criteria statuses are up to date
- [ ] All architecture docs match the current solution design
- [ ] Value tracker includes the latest metrics
- [ ] No orphaned files (documents not linked from any index)
- [ ] No broken internal links
- [ ] All files follow `lowercase-kebab-case` naming
- [ ] No content from the "Does NOT Belong" list has leaked in
- [ ] Dates are in ISO format (YYYY-MM-DD)
- [ ] Each directory has relevant content (no empty directories)

## Related Documentation

- [External InfoHub Reference](../../reference/external-infohub-reference.md): What belongs and directory structure
- [Knowledge Vault Guide](knowledge-vault-guide.md): Overall vault usage
- [Knowledge Vault Architecture](../../architecture/system/knowledge-vault-architecture.md): Design and security model
- [Documentation Principles](../../DOCUMENTATION_PRINCIPLES.md): Writing standards
