---
title: "Repository path locator"
order: 0
audience: both
summary: "Where archetypes, blueprints, playbooks, and sample vault data live relative to the repo root."
related:
  - TERMINOLOGY_MODEL.md
  - ../START_HERE.md
---

# Repository path locator

The in-app documentation browser serves files under `docs/` only. Machine-readable definitions and sample vault data live elsewhere in the repository. Paths below are **relative to the repository root** (clone or GitHub tree).

## Classification and blueprint sources

| Asset | Path | Notes |
|-------|------|--------|
| Archetype definitions | `domain/catalogs/archetypes.yaml` | Drives blueprint and playbook selection |
| Engagement tracks | `domain/mappings/engagement_tracks.yaml` | POC, economy, premium, fast track, SLAs |
| Reference blueprints | `domain/blueprints/` | Composable templates per classification |
| Blueprint README | `domain/blueprints/README.md` | Schema and hierarchy overview |

Conceptual overview: [Terminology model](TERMINOLOGY_MODEL.md), [Blueprint catalog](blueprint-catalog.md).

## Blueprint and agent registries

| Asset | Path |
|-------|------|
| Agent catalog | `domain/catalogs/agent_catalog.yaml` |
| Agent definitions (YAML) | `domain/agents/` |

Design docs: [Agent architecture](../architecture/agents/agent-architecture.md), [Domain model](../architecture/system/domain-model.md).

## Playbooks and canvases

| Asset | Path |
|-------|------|
| Playbook library | `domain/playbooks/` |
| Canvas specs | `domain/playbooks/canvas/specs/` |

Design docs: [Playbook system](../architecture/playbooks/playbook-system.md), [Playbook catalog](playbook-catalog.md).

## Specialist evaluation checklists

| Domain | Path |
|--------|------|
| Security | `domain/playbooks/specialists/security/checklists/` |
| Search | `domain/playbooks/specialists/search/checklists/` |
| Observability | `domain/playbooks/specialists/observability/checklists/` |

## Demo and sample vault (ACME)

| Asset | Path |
|-------|------|
| All sample customers | `vault/` (e.g. ACME_CORP, GLOBEX, INITECH) |
| ACME three-vault example | `vault/ACME_CORP/SECURITY_CONSOLIDATION/` |
| ACME external InfoHub | `vault/ACME_CORP/SECURITY_CONSOLIDATION/external-infohub/` |
| Global knowledge patterns | `vault/knowledge/` |

Guided tour: [Run the demo](../guides/for-developers/run-demo.md).

**See also:** [Start here](../START_HERE.md) for reading order, [Documentation home](../README.md) for the full doc map.
