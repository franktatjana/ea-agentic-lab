---
title: "Guides"
order: 3
audience: both
summary: "How-to guides for practitioners and developers."
related:
  - ../START_HERE.md
---

# Guides

Practical guidance organized by reader intent. For a **reading order** across all documentation, start at [Start here](../START_HERE.md). The [Architecture docs](../architecture/) explain the design; these guides explain how to use and work within it.

---

## Orientation

Read these first. They are not role-specific.

| Guide | What it answers |
|-------|-----------------|
| [Understanding the System](understanding-the-system.md) | Why each component exists, how they connect, and what happens in practice through four scenario walkthroughs |
| [End-to-End Walkthrough by Role](end-to-end-walkthrough.md) | What a full deal looks like from the AE, SA, Specialist, CSM, and Sales Leadership desks, using a single running example |
| [RFP Agent: Executive Guide](rfp-agent.md) | How the RFP Agent orchestrates proposal responses and feeds product intelligence back to the PM team |

For a one-page overview of the entire platform, see [Executive summary](../overview/executive-summary.md) and [HANDBOOK.md](../HANDBOOK.md). For repo paths outside `docs/`, see [Repository path locator](../reference/repository-paths.md).

---

## For Practitioners

Adoption guides for the roles that use the system day-to-day. Each guide covers a specific workflow or framework and how it maps to the agent system.

| Guide | Role | What it covers |
|-------|------|----------------|
| [Knowledge Vault Guide](for-practitioners/knowledge-vault-guide.md) | All roles | Day-to-day usage: what to store where, naming conventions, how agents read the vault |
| [Internal InfoHub Lifecycle](for-practitioners/internal-infohub-lifecycle.md) | All roles | How vendor-internal artifacts are created, organized, and retired |
| [External InfoHub Lifecycle](for-practitioners/external-infohub-lifecycle.md) | All roles | How customer-facing artifacts flow from draft to published to archived |
| [SA Best Practices](for-practitioners/sa-best-practices.md) | SA | POV framework, technical discovery, opportunity hygiene, working agreements |
| [POC Success Plan](for-practitioners/poc-success-plan.md) | SA, CA | POC/POV lifecycle, qualification criteria, execution, conversion |
| [Customer Success Plan](for-practitioners/customer-success-plan.md) | CA, CSM | CSP framework, adoption milestones, health scoring, intervention triggers |
| [Customer Journey & VoC](for-practitioners/customer-journey-voc.md) | CA, CSM | Journey mapping and voice-of-customer frameworks |
| [Customer Success Playbooks](for-practitioners/customer-success-playbooks.md) | CA, CSM | Playbook library for post-sales success workflows |
| [Business Value Consulting](for-practitioners/business-value-consulting.md) | AE, VE | ROI modeling, value engineering, business case development |

---

## For Developers

Step-by-step instructions for running, building, and extending the platform.

| Guide | What it covers |
|-------|----------------|
| [Run a Demo](for-developers/run-demo.md) | Set up and run the ACME security consolidation demo end-to-end |
| [Create a New Agent](for-developers/create-agent.md) | Build a new agent from YAML definition to UI profile |
| [Run a Playbook](for-developers/run-playbook.md) | Execute strategic and operational playbooks via the API |
| [Run an Agent](for-developers/run-agent.md) | Execute SA, CA, and other agents with test inputs |

---

## Related

- [Reference](../reference/) — catalogs, agent profiles, terminology: for lookup, not sequential reading
- [Architecture](../architecture/) — how the system is designed
- [Operating Model](../operating-model/) — who is responsible for what and when
- [Decisions](../decisions/) — why things were built the way they were
