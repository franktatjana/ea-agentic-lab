# Blueprints

## Overview

Blueprints define the composition of playbooks, canvases, and validation rules for specific project types.

## Hierarchy

```text
Engagement = Archetype × Domain × Track

Archetype (engagement pattern, domain-agnostic)
│   e.g., "Competitive Displacement", "Greenfield Adoption"
│
├── Domain (specialist area, orthogonal)
│   e.g., Security, Search, Observability
│
└── Track (service tier, orthogonal)
    e.g., POC, Economy, Premium, Fast Track

Archetype × Domain → Reference Blueprint selection
│   e.g., Competitive Displacement × Security → A02_competitive
│
└── + Track → Blueprint Instance (scoped per Realm/Node)
    │   e.g., ACME/SEC_CONSOL/blueprint.yaml
    │
    └── Playbooks (executed)
            e.g., PB_102, PB_201, PB_701, PB_SEC_001
```

## Structure

```text
config/
├── archetypes.yaml              # Archetype definitions + Reference Blueprint variants
└── engagement_tracks.yaml       # Service tier policies

blueprints/
├── reference/                   # Reference Blueprint files
│   └── {archetype}/
│       ├── A01_basic.yaml
│       ├── A02_competitive.yaml
│       └── ...
└── README.md
```

## Terminology

| Term | Definition |
|------|------------|
| **Archetype** | Engagement pattern classified by signals, independent of technology domain. |
| **Domain** | Specialist area (Security, Search, Observability). Orthogonal to Archetype. |
| **Reference Blueprint** | Reusable playbook/asset composition. Multiple variants (A01-A06) per Archetype. |
| **Blueprint Instance** | Node-specific instance (lives in InfoHub: `{realm}/{node}/blueprint.yaml`) |
| **Engagement Track** | Service tier policy overlay (POC, Economy, Premium, Fast Track). Orthogonal to Archetype and Domain. |

## Reference Blueprint Schema

```yaml
version: "1.0"
archetype: "{archetype_id}"

metadata:
  name: "Human-readable name"
  description: "What this blueprint governs"
  owner: "team_id"

playbooks:
  all_tracks:
    required: [...]      # Always required
  economy:
    required: [...]      # Additional for Economy
    blocked: [...]       # Not allowed in Economy
  premium:
    required: [...]      # Additional for Premium

canvases:
  economy:
    required: [...]
    template_only: true
  premium:
    required: [...]
    custom_allowed: true

checklists:
  discovery_complete: [...]
  implementation_ready: [...]

success_criteria:
  discovery: [...]
  implementation: [...]
```

## Creating a Node Blueprint

When a Node is created, a Blueprint instance is generated:

1. Select Archetype (based on signals or manual selection)
2. Select Engagement Track (based on deal size or policy)
3. Instantiate from Reference Blueprint
4. Customize for node-specific requirements
5. Store at `{realm}/{node}/blueprint.yaml`

## Gap Scan

PB_971 validates:

- Blueprint exists for Node
- Blueprint references valid Reference Blueprint
- All required playbooks for track executed
- All required canvases rendered
- Success criteria met
