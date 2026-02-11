# Tech Signal Map

**Version:** 1.0
**Date:** 2026-01-21
**Status:** Production Ready

---

## Overview

The **Tech Signal Map** is a decision-support artifact embedded into playbooks, governance, and agent workflows. It provides **technology intelligence** for each realm by analyzing job postings from associated companies.

> *Inspired by multiple industry models, including technology radars, but adapted for decision governance and agent-based operations.*

### Key Capabilities

- **Technology Adoption Patterns** - What technologies are being hired for
- **Skills Gap Analysis** - How our offerings align with customer needs
- **Competitive Intelligence** - Competitor tool adoption and displacement opportunities
- **Hiring Velocity** - Investment signals based on hiring activity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECH SIGNAL MAP ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐     Job Postings      ┌─────────────────────┐
  │  Tech Signal    │◀────────────────────── │   Job Sources       │
  │  Scanner Agent  │      (Scheduled)       │   • LinkedIn API    │
  └────────┬────────┘                        │   • Indeed API      │
           │                                 │   • Career Pages    │
           │ SIG_TECH_004                    └─────────────────────┘
           │ job_scan_completed
           ▼
  ┌─────────────────┐                        ┌─────────────────────┐
  │  Tech Signal    │────────────────────────│   InfoHub           │
  │  Analyzer Agent │   Writes signal map    │   {realm}/          │
  └────────┬────────┘                        │   intelligence/     │
           │                                 │   tech_signal_map/  │
           │ SIG_TECH_001/002/003            │   • current_map     │
           ▼                                 │   • map_history/    │
                                             └─────────────────────┘
  ┌─────────────────────────────────────────────────────────────────┐
  │                        CONSUMERS                                 │
  │                                                                  │
  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
  │  │ SA Agent  │  │ AE Agent  │  │ CI Agent  │  │ PM Agent  │    │
  │  │           │  │           │  │           │  │           │    │
  │  │ • Tech    │  │ • Sales   │  │ • Compete │  │ • Product │    │
  │  │   advice  │  │   opps    │  │   intel   │  │   gaps    │    │
  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
  └─────────────────────────────────────────────────────────────────┘
```

---

## Signal Reference

### Tech Signal Map Signals (SIG_TECH_*)

| Signal ID | Name | Producer | Key Consumers |
|-----------|------|----------|---------------|
| SIG_TECH_001 | `tech_signal_map_updated` | Tech Signal Analyzer Agent | SA, AE, CI Agents |
| SIG_TECH_002 | `new_technology_detected` | Tech Signal Analyzer Agent | SA, PM Agents |
| SIG_TECH_003 | `technology_trending` | Tech Signal Analyzer Agent | SA, CI Agents |
| SIG_TECH_004 | `job_scan_completed` | Tech Signal Scanner Agent | Analyzer Agent |

### Signal Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TECH SIGNAL MAP SIGNAL FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  Scheduled Scan                            Manual Trigger
  (Weekly Sun 2AM)                          (POST /tech-signal-map/scan)
        │                                         │
        └─────────────┬───────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Scanner Agent │
              │               │
              │ • Fetch jobs  │
              │ • Extract tech│
              │ • Dedup       │
              └───────┬───────┘
                      │
                      │ SIG_TECH_004
                      │ job_scan_completed
                      ▼
              ┌───────────────┐
              │ Analyzer Agent│
              │               │
              │ • Aggregate   │
              │ • Assign rings│
              │ • Skills gap  │
              └───────┬───────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
  SIG_TECH_001  SIG_TECH_002  SIG_TECH_003
  map_updated    new_tech     trending
         │            │            │
         ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ All Team │ │ SA + PM  │ │ SA + CI  │
  │ Agents   │ │ Agents   │ │ Agents   │
  └──────────┘ └──────────┘ └──────────┘
```

---

## Technology Classification

### Quadrants

Technologies are classified into four quadrants:

| Quadrant | Description | Examples |
|----------|-------------|----------|
| **Techniques** | Processes and methodologies | DevSecOps, SRE, GitOps, Zero Trust |
| **Tools** | Development and operations tools | Terraform, GitHub Actions, ArgoCD |
| **Platforms** | Infrastructure and cloud | AWS, Azure, Kubernetes, Docker |
| **Languages & Frameworks** | Programming technologies | Python, Go, React, Spring |

### Rings

Technologies are assigned to rings based on hiring signals:

| Ring | Criteria | Interpretation |
|------|----------|----------------|
| **Adopt** | ≥20 mentions, ≥70% required | Mature, widely adopted |
| **Trial** | 10-19 mentions, ≥50% required | Growing adoption, worth investing |
| **Assess** | 3-9 mentions or new | Emerging, evaluate carefully |
| **Hold** | Trend ≤-20% | Declining, avoid for new projects |

### Ring Assignment Logic

```python
IF total_mentions >= 20 AND required_ratio >= 0.7:
    ring = "Adopt"
ELIF total_mentions >= 10 AND required_ratio >= 0.5:
    ring = "Trial"
ELIF total_mentions >= 3 OR is_new:
    ring = "Assess"

# Override for declining technologies
IF trend_30d <= -20%:
    ring = "Hold"
```

---

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/realms/{realm_id}/tech-signal-map` | GET | Current map with all technologies |
| `/realms/{realm_id}/tech-signal-map/technologies` | GET | Filtered technology list |
| `/realms/{realm_id}/tech-signal-map/export` | GET | JSON/CSV format export |
| `/realms/{realm_id}/tech-signal-map/export/file` | GET | Download as file |

### Analysis Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/realms/{realm_id}/tech-signal-map/skills-gap` | GET | Our offerings vs customer stack |
| `/realms/{realm_id}/tech-signal-map/competitive` | GET | Competitor tool insights |
| `/realms/{realm_id}/tech-signal-map/hiring-velocity` | GET | Hiring trend metrics |
| `/realms/{realm_id}/tech-signal-map/highlights` | GET | Key changes and trends |

### Management Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/realms/{realm_id}/tech-signal-map/scan` | POST | Trigger manual scan |
| `/realms/{realm_id}/tech-signal-map/history` | GET | Historical map snapshots |
| `/realms/{realm_id}/tech-signal-map/diff` | GET | Compare map versions |

---

## Skills Gap Analysis

The system automatically identifies opportunities and gaps by mapping detected technologies to our product offerings.

### Opportunities

Technologies where our products align strongly:

| Our Offering | Related Technologies |
|--------------|---------------------|
| **Platform Security** | SIEM, EDR, DevSecOps, Zero Trust, SOC |
| **Platform Observability** | APM, Logging, SRE, Monitoring, OpenTelemetry |
| **Platform Search** | Search, RAG, Vector Search, AI Search |

### Competitive Intelligence

Competitor tools are automatically flagged:

| Competitor | Competes With | Signal |
|------------|---------------|--------|
| LegacySIEM | Platform Security | Declining = displacement opportunity |
| ObservabilityVendorA | Platform Observability | Track adoption trends |
| OpenSourceStack | Platform Observability | Monitor consolidation signals |
| SecurityVendorA | Platform Security | Track security stack decisions |

---

## Integration with Playbooks

The Tech Signal Map is a decision-support artifact designed to integrate seamlessly with governance playbooks and agent workflows.

### Playbooks That Consume Tech Signal Map

| Playbook | Integration Point |
|----------|-------------------|
| **SWOT Analysis** | Opportunities from tech trends, threats from competitor adoption |
| **Five Forces** | Industry technology dynamics |
| **MEDDPICC** | Economic buyer technology priorities |
| **Value Engineering** | Quantify value based on tech investments |
| **Tech Trend Response** | Triggered by competitor tech signals |

### Signal Subscriptions

```yaml
# Example: SA Agent subscription
subscriptions:
  - signal: "SIG_TECH_001"
    action: "Review tech changes for account alignment"
  - signal: "SIG_TECH_002"
    condition: "is_new AND (our_offering_match OR is_competitor)"
    action: "Evaluate new technology for customer recommendations"
  - signal: "SIG_TECH_003"
    condition: "trend_direction == 'down' AND is_competitor"
    action: "Identify displacement opportunity"
```

---

## Export Format

The export supports standard CSV and JSON formats for integration with visualization tools.

### CSV Format

```csv
name,ring,quadrant,isNew,description
Kubernetes,Adopt,Platforms,FALSE,Mentioned in 67 job postings
ArgoCD,Trial,Tools,FALSE,GitOps deployment tool gaining traction
Rust,Assess,Languages & Frameworks,TRUE,Emerging in 5 senior engineering roles
LegacySIEM,Hold,Tools,FALSE,Legacy SIEM being phased out
```

### JSON Format

```json
{
  "entries": [
    {
      "name": "Kubernetes",
      "ring": "Adopt",
      "quadrant": "Platforms",
      "isNew": "FALSE",
      "description": "Mentioned in 67 job postings"
    }
  ]
}
```

---

## Configuration

### Technology Patterns

Defined in `config/tech_signal_map_config.yaml`:

```yaml
technology_patterns:
  languages:
    - pattern: "\\b(Python|python)\\b"
      canonical: "Python"
      quadrant: "Languages & Frameworks"

  competitors:
    - pattern: "\\b(LegacySIEM)\\b"
      canonical: "LegacySIEM"
      quadrant: "Tools"
      is_competitor: true
      competitor_to: "Platform Security"
```

### Ring Assignment Rules

```yaml
ring_rules:
  adopt:
    min_mentions: 20
    min_required_ratio: 0.7
    min_seniority_score: 2.5

  trial:
    min_mentions: 10
    max_mentions: 19
    min_required_ratio: 0.5

  assess:
    min_mentions: 3
    max_mentions: 9
    auto_assign_new: true

  hold:
    negative_trend_threshold: -20
```

---

## Metrics

### Key Metrics Tracked

| Metric | Description |
|--------|-------------|
| `technologies_on_map` | Total unique technologies |
| `new_technologies_detected` | New this scan period |
| `ring_changes` | Technologies that moved rings |
| `competitor_technologies_tracked` | Competitor tools detected |
| `jobs_scanned_total` | Total job postings analyzed |
| `hiring_velocity` | Job posting volume trend |

### Health Indicators

| Indicator | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| Jobs scanned | ≥50 | 20-49 | <20 |
| Technologies extracted | ≥10 | 5-9 | <5 |
| Scan success rate | ≥95% | 80-94% | <80% |

---

## Related Documentation

- [config/tech_signal_map_config.yaml](../../domain/catalogs/tech_signal_map_config.yaml) - Technology taxonomy
- [config/signal_catalog.yaml](../../domain/catalogs/signal_catalog.yaml) - Signal definitions
- [agents/tech_signal_map/](../../domain/agents/tech_signal_map/agents/) - Agent configurations
- [Signal Catalog](signal-catalog.md) - All system signals

---

**This document is the canonical reference for the Tech Signal Map system.**
