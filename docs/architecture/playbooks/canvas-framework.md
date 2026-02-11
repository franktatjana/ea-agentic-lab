---
order: 4
---

# Canvas Framework

Visual strategic artifacts for human consumption, rendered from InfoHub data.

## Overview

Canvases are structured one-page visual artifacts that turn InfoHub data into human-readable insights. The concept comes from the Business Model Canvas tradition (Osterwalder, 2010): force complex information into a single page with predefined sections and hard limits that require prioritization. A canvas is not a report, not a dashboard, not a slide deck. It is a structured snapshot designed to be consumed in one sitting and shared with stakeholders.

Each canvas is defined by a YAML spec that declares which InfoHub data feeds each section, validation rules that enforce completeness and consistency, and render triggers that automatically refresh the canvas when underlying data changes. When an SA completes a SWOT analysis, the Context Canvas and Value & Stakeholders Canvas re-render automatically. When a new risk is identified, the Risk & Governance Canvas updates. When a meeting is processed and a new decision is extracted, the Decision Canvas refreshes. The canvases are always current because they are rendered from live data, not maintained manually.

The system produces both HTML for visual presentation and Markdown for text-based consumption. Canvases are designed to be:

- **Visual**, formatted for human readability with color-coding and layout
- **Shareable**, can be presented to stakeholders and customers
- **Rendered**, generated automatically from InfoHub data
- **Tracked**, monitored for completeness, freshness, and gaps

## Architecture

[image: Canvas Data Flow - InfoHub data through canvas registry and specs to rendered visual artifacts]

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CANVAS FRAMEWORK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DATA SOURCES                        CANVAS SYSTEM                           │
│  ┌──────────────┐                   ┌──────────────────────┐                │
│  │ InfoHub      │                   │ Canvas Registry      │                │
│  │ - decisions/ │                   │ - Canvas types       │                │
│  │ - risks/     │──────────────────▶│ - Status (active)    │                │
│  │ - value/     │                   │ - Requirements       │                │
│  │ - discovery/ │                   └──────────┬───────────┘                │
│  └──────────────┘                              │                            │
│                                                ▼                            │
│  ┌──────────────┐                   ┌──────────────────────┐                │
│  │ Meeting Notes│                   │ Canvas Specs         │                │
│  │ (extracted)  │──────────────────▶│ - Sections           │                │
│  └──────────────┘                   │ - Data mappings      │                │
│                                     │ - Validation rules   │                │
│  ┌──────────────┐                   └──────────┬───────────┘                │
│  │ External     │                              │                            │
│  │ Scanning     │──────────────────▶           │                            │
│  │ (scheduled)  │                              ▼                            │
│  └──────────────┘                   ┌──────────────────────┐                │
│                                     │ PB_951 Render Canvas │                │
│                                     │ - Gathers data       │                │
│                                     │ - Validates content  │                │
│                                     │ - Outputs MD + HTML  │                │
│                                     └──────────┬───────────┘                │
│                                                │                            │
│                                                ▼                            │
│                                     ┌──────────────────────┐                │
│                                     │ Canvas Assets        │                │
│                                     │ {realm}/{node}/external-infohub/canvas│                │
│                                     │ - .md (git/agents)   │                │
│                                     │ - .html (humans)     │                │
│                                     └──────────────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
playbooks/canvas/
├── registry.yaml                 # Index of all canvas types
├── specs/                        # Canvas specifications
│   ├── context_canvas.yaml       # CORE: Boundaries & background
│   ├── decision_canvas.yaml      # CORE: 5 key decisions + questions
│   ├── architecture_decision.yaml
│   ├── architecture_communication.yaml
│   ├── problem_solution_fit.yaml
│   ├── value_stakeholders.yaml
│   ├── execution_map.yaml
│   └── risk_governance.yaml
└── templates/                    # HTML visual templates
    ├── context_canvas.html
    ├── decision_canvas.html
    ├── architecture_decision.html
    ├── architecture_communication.html
    ├── problem_solution_fit.html
    ├── value_stakeholders.html
    ├── execution_map.html
    └── risk_governance.html

{realm}/{node}/external-infohub/canvas/    # Rendered canvas assets
├── index.yaml                    # Canvas inventory for this node
├── architecture_decision_{id}.md
├── architecture_decision_{id}.html
└── ...
```

## Canvas Types

### Core Canvases (Generated for Every Realm/Node)

| Canvas | Owner | Use Case | Required By |
|--------|-------|----------|-------------|
| **Context Canvas** | SA/AE Agent | Boundaries, background, scope definition | All nodes (first canvas) |
| **Decision Canvas** | SA/PM Agent | 5 key decisions + open questions | All active engagements |

### Specialized Canvases

| Canvas | Owner | Use Case | Required By | Status |
|--------|-------|----------|-------------|--------|
| **Value & Stakeholders** | AE/SA Agent | Map stakeholder landscape and value props | Stage 2+, Value engineering | Active |
| **Architecture Communication** | SA Agent | Components, integrations, Quality Requirements | POC, Implementation kickoff | Active |
| **Execution Map** | CSM/SA Agent | MAP + success criteria + workstreams | Post-sales, POC execution | Active |
| **Risk & Governance** | PM/SA Agent | Top-tier risks + RACI + cadence | Active POC/implementation | Active |
| **Problem-Solution Fit** | SA Agent | Validate problem/solution alignment | Stage 2+ opportunities | Active |
| **Architecture Decision** | SA Agent | Document technical/architectural decisions | POC with architectural choices | Active |
| **Change Management** | CA Agent | Plan organizational change | Post-sales implementation | Planned |
| **Challenge Canvas** | SA Agent | Frame engagement challenges | Complex engagements | Planned |

## Canvas Spec Format

Each canvas type has a specification file that defines:

```yaml
# Canvas identification
canvas_id: architecture_decision
version: "1.0"
name: "Architecture Decision Canvas"

# Sections (visual boxes)
sections:
  problem_context:
    label: "Problem & Context"
    prompt: "Describe the context and the specific architectural problem"
    required: true
    max_items: null
    source:
      type: "infohub"
      path: "decisions/{decision_id}.yaml"
      field: "context"

# Render triggers
triggers:
  on_create: ["New decision record created"]
  on_update: ["Decision status changes"]
  scheduled:
    frequency: "weekly"
    condition: "decision.status == 'Proposed'"

# Validation rules
validation:
  completeness:
    minimum_sections: ["problem_context", "considered_options"]
  consistency:
    - rule: "deciders must exist in stakeholder_map"
      severity: "error"

# Output paths
output:
  markdown:
    path: "{realm}/{node}/external-infohub/canvas/{canvas_type}_{context_id}.md"
  html:
    path: "{realm}/{node}/external-infohub/canvas/{canvas_type}_{context_id}.html"
    template: "playbooks/canvas/templates/{canvas_type}.html"
```

## Playbooks

### PB_951: Render Canvas

Renders any canvas type from InfoHub data:

1. Load canvas spec from registry
2. Gather data from source paths
3. Validate content against rules
4. Output markdown (for agents/git)
5. Output HTML (for humans)
6. Update canvas index

**Triggers:**
- Data change (new decision, updated risk, etc.)
- Scheduled refresh (per spec cadence)
- Manual request

### PB_952: Canvas Gap Analysis

Checks canvas coverage across nodes:

1. Determine required canvases for node context
2. Check for missing canvases
3. Check for incomplete canvases (validation failures)
4. Check for stale canvases (not updated within cadence)
5. Generate gap report with health score

**Gap Categories:**

| Gap Type | Description | Severity |
|----------|-------------|----------|
| Missing | Required canvas does not exist | High |
| Incomplete | Canvas exists but fails validation | Medium |
| Stale | Canvas not updated within cadence | Medium |
| Orphan | Source data no longer exists | Low |

## Dual Output Format

Each canvas produces two outputs:

### Markdown (.md)
- Version-controllable in git
- Readable by agents
- Table-based layout
- Includes validation warnings

### HTML (.html)
- Visual one-page format
- Color-coded sections
- Print/PDF-ready
- Shareable with stakeholders

## Integration with InfoHub

Canvas assets are stored in the node's canvas folder:

```
{realm}/{node}/external-infohub/canvas/
├── index.yaml                          # Canvas inventory
├── architecture_decision_ADR001.md
├── architecture_decision_ADR001.html
├── problem_solution_fit_OPP123.md
├── problem_solution_fit_OPP123.html
└── gap_report_2026-01-22.yaml          # Latest gap analysis
```

### Canvas Index Schema

```yaml
# {realm}/{node}/external-infohub/canvas/index.yaml
canvases:
  - canvas_type: architecture_decision
    context_id: ADR001
    last_rendered: 2026-01-22T10:30:00Z
    status: published
    validation: pass
    source_refs:
      - decisions/ADR001.yaml

  - canvas_type: problem_solution_fit
    context_id: OPP123
    last_rendered: 2026-01-15T14:00:00Z
    status: stale
    validation: warn
    source_refs:
      - discovery/pain_points.yaml
      - value/value_hypothesis.yaml
```

## Canvas Lifecycle

[image: Canvas Lifecycle - state transitions from draft through review, published, stale, to archived]

```
┌─────────┐    ┌─────────┐    ┌───────────┐    ┌─────────┐    ┌──────────┐
│ Trigger │───▶│ Render  │───▶│ Validate  │───▶│ Publish │───▶│ Monitor  │
│         │    │         │    │           │    │         │    │          │
└─────────┘    └─────────┘    └───────────┘    └─────────┘    └──────────┘
                                   │                              │
                                   │ Fail                         │ Stale
                                   ▼                              ▼
                              ┌─────────┐                    ┌─────────┐
                              │ Draft   │                    │ Refresh │
                              │ (warn)  │                    │ or      │
                              └─────────┘                    │ Archive │
                                                             └─────────┘
```

**States:**
- **Draft** - Canvas created but incomplete
- **Review** - Canvas complete, pending human review
- **Published** - Canvas approved for sharing
- **Stale** - Canvas not updated within cadence
- **Archived** - Canvas superseded or no longer relevant

## Related Documentation

- [Playbook Framework](playbook-framework.md) - How playbooks work
- [Output Contract](../system/output-contract.md) - Artifact output standards
- [Knowledge Vault Architecture](../system/knowledge-vault-architecture.md) - Data storage model
