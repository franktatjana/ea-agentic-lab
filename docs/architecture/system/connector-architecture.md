# Connector Architecture: External Data Sources

**Version:** 1.0
**Date:** 2026-02-10
**Status:** Concept
**Audience:** Contributors, Architects, AI Systems

---

## Purpose

Connectors bring external system data into InfoHub. The system currently has connectors for content ingestion (meeting notes from filesystem, GitHub, Google Drive). This document defines the conceptual architecture for six additional external data sources that feed the onboarding and ongoing synchronization of Nodes.

The system does not connect to live external systems today. All connectors described here operate in **mock mode**, returning fixture data that exercises the same data paths a live integration would use.

---

## Two Data Modes

External systems produce two distinct types of data. The existing connector interface handles content. This architecture adds context.

| Mode | What It Carries | Output Type | Consumer | Existing Support |
|------|----------------|-------------|----------|------------------|
| **Content Ingestion** | Unstructured text for agent processing (meeting transcripts, documents, messages) | `Note` dataclass | Meeting Notes Agent pipeline | Filesystem, GitHub, Google Drive |
| **Context Import** | Structured fields that populate InfoHub artifacts directly (opportunity data, stakeholder records, cadence definitions) | Typed dicts matching existing YAML schemas | Direct write to vault, signal emission | Not yet implemented |

Content flows through agents. Context flows into artifacts. Both land in InfoHub, but through different paths.

```
Content Ingestion (existing):
  External Source  -->  Note  -->  Meeting Notes Agent  -->  InfoHub artifacts

Context Import (new):
  External Source  -->  ContextBundle  -->  Vault writer  -->  InfoHub artifacts
                                                          -->  Signal emission
```

The distinction matters because context data (a Salesforce opportunity amount, a stakeholder's title) does not need agent interpretation. It maps directly to known fields in `node_profile.yaml` or `realm_profile.yaml`. Routing it through the Meeting Notes Agent would add latency and interpretation error with no benefit.

---

## Connector Inventory

Six external sources, grouped by the value they add during Node onboarding.

### Tier 1: High Onboarding Value

These two sources provide the structured context that populates the core Node artifacts. Without them, an AE manually enters opportunity data and stakeholder records.

#### CRM (Salesforce)

Salesforce holds the canonical commercial and relationship data for an engagement.

**What it provides:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Opportunity amount | Opportunity | `node_profile.yaml` | `.commercial.opportunity_arr` |
| Deal stage | Opportunity | `node_profile.yaml` | `.commercial.stage` |
| Close probability | Opportunity | `node_profile.yaml` | `.commercial.probability` |
| Next milestone | Opportunity | `node_profile.yaml` | `.commercial.next_milestone` |
| Close date | Opportunity | `node_profile.yaml` | `.commercial.next_milestone_date` |
| Company name | Account | `realm_profile.yaml` | `.realm_name` |
| Industry | Account | `realm_profile.yaml` | `.company_profile.industry` |
| Employee count | Account | `realm_profile.yaml` | `.company_profile.company_overview.employees` |
| Annual revenue | Account | `realm_profile.yaml` | `.company_profile.company_overview.annual_revenue` |
| Region | Account | `realm_profile.yaml` | `.classification.region` |
| Contact name, title, role | Contact | `stakeholders/*.yaml` | Per-stakeholder YAML file |
| Contact email | Contact | `stakeholders/*.yaml` | `.email` |
| Contact department | Contact | `stakeholders/*.yaml` | `.department` |
| Activity history | Activity | `context/engagement_history.md` | Narrative timeline |
| Competitors on deal | Opportunity.Competitor | `node_profile.yaml` | `.competitive.incumbents[]` |

**Mode:** Context Import (structured fields, not unstructured text).

**Mock behavior:** Reads existing `realm_profile.yaml` and `node_profile.yaml` from the vault and returns their contents as if pulled from Salesforce. This validates the import pipeline without fixture duplication.

**Signals emitted on import:**
- `SIG_LC_001` (node_created) when a new Node is initialized from CRM data
- `SIG_STK_001` (stakeholder_added) per imported contact
- `SIG_COM_001` (deal_stage_changed) when commercial data is written

**Connector config:**

```yaml
salesforce:
  enabled: false
  mode: mock            # mock | live
  config:
    instance_url: null  # e.g. https://company.my.salesforce.com
    api_version: "v59.0"
    credentials_ref: "SALESFORCE_TOKEN"  # env var name
    sync_interval: null                  # manual trigger only in v1
  field_mappings:
    opportunity_arr: "Amount"
    stage: "StageName"
    probability: "Probability"
    close_date: "CloseDate"
```

---

#### Calendar (Google Calendar / Outlook)

Calendar data establishes meeting history and operating cadence for a Node. Past meetings feed the Meeting Notes Agent. Cadence patterns populate governance artifacts.

**What it provides:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Past meeting date | Event | `meetings/external/` or `meetings/internal/` | New meeting note file |
| Meeting subject | Event | Meeting note | `.title` |
| Attendees | Event | Meeting note | `.participants[]` |
| Duration | Event | Meeting note | `.raw_metadata.duration_minutes` |
| Location / link | Event | Meeting note | `.raw_metadata.location` |
| Has recording | Event | Meeting note | `.raw_metadata.has_recording` |
| Upcoming meetings | Event | `governance/operating_cadence.yaml` | `.upcoming[]` |
| Recurring patterns | Recurring Event | `governance/operating_cadence.yaml` | `.cadences[]` |

**Mode:** Both Content Ingestion (past meetings become `Note` objects) and Context Import (cadence patterns become structured YAML).

For past meetings, the calendar connector creates `Note` objects with `note_type: "meeting"` and feeds them into the existing Meeting Notes Agent pipeline. The agent extracts decisions, actions, and risks as usual.

For cadence data, the connector writes directly to `operating_cadence.yaml` because recurring event patterns (weekly exec sync every Thursday at 10:00) are structured data, not content for interpretation.

**Mock behavior:** Loads fixture data from `vault/{realm}/{node}/raw/mock_calendar.yaml`. This file contains a small set of past meetings, upcoming meetings, and recurring cadences sufficient to test both data paths.

**Mock fixture structure:**

```yaml
# vault/{realm}/{node}/raw/mock_calendar.yaml
past_meetings:
  - id: "MTG-001"
    subject: "Initial Discovery Call"
    date: "2026-01-10T10:00:00Z"
    duration_minutes: 60
    attendees:
      - name: "Klaus Hoffman"
        company: "external"
      - name: "Jane Smith"
        company: "internal"
    location: "Zoom"
    has_recording: true
    classification: "external"   # external | internal

upcoming_meetings:
  - id: "MTG-005"
    subject: "POC Planning Session"
    date: "2026-02-14T10:00:00Z"
    duration_minutes: 60
    attendees:
      - name: "Dr. Sarah Chen"
        company: "external"
      - name: "Jane Smith"
        company: "internal"
    location: "On-site"

cadences:
  - name: "Weekly Executive Sync"
    frequency: "weekly"
    day: "Thursday"
    time: "10:00"
    attendees: ["Klaus Hoffman", "Jane Smith"]
  - name: "Bi-weekly Technical Review"
    frequency: "biweekly"
    day: "Tuesday"
    time: "14:00"
    attendees: ["Dr. Sarah Chen", "Tom Richards"]
```

**Signals emitted on import:**
- `SIG_ART_001` (artifact_created) per meeting note created
- `SIG_ART_002` (artifact_updated) when `operating_cadence.yaml` is written

**Connector config:**

```yaml
calendar:
  enabled: false
  mode: mock
  config:
    provider: null        # google | outlook
    credentials_ref: null
    calendar_ids: []      # which calendars to scan
    lookback_days: 90     # how far back to import meetings
    attendee_filter: []   # only import meetings with these domains
```

---

### Tier 2: Medium Onboarding Value

These sources provide supplementary context. Valuable during ongoing operation, but an AE can defer their setup without blocking Node activation.

#### Slack

Slack channels capture informal decisions, escalations, and action items that never make it into formal meeting notes. The deal room channel is often the most honest record of engagement health.

**What it provides:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Channel messages | Message | `Note` objects | Meeting Notes Agent pipeline |
| Thread summaries | Thread | `Note` objects | Meeting Notes Agent pipeline |
| Escalations | Flagged messages | `risks/risk_register.yaml` | New risk entry |
| Blocked actions | Thread with blockers | `actions/action_tracker.yaml` | Status update |
| Channel activity level | Channel metadata | `raw/slack_context.yaml` | `.activity_level` |
| Last activity date | Channel metadata | `raw/slack_context.yaml` | `.last_activity` |

**Mode:** Primarily Content Ingestion. Slack messages are unstructured, so they route through the Meeting Notes Agent for extraction. The exception is channel metadata (member count, activity level), which is Context Import.

**Note:** `ConnectorType.SLACK` already exists in the `ConnectorType` enum. No implementation exists yet.

**Mock behavior:** Loads fixture data from `vault/{realm}/{node}/raw/mock_slack.yaml`.

**Mock fixture structure:**

```yaml
# vault/{realm}/{node}/raw/mock_slack.yaml
channel:
  name: "#acme-security-deal"
  created: "2026-01-08"
  members: 8
  purpose: "ACME Security Consolidation deal coordination"
  activity_level: "active"      # active | moderate | quiet
  last_activity: "2026-02-07"

threads:
  - timestamp: "2026-02-07T09:15:00Z"
    author: "Jane Smith"
    message: "Heads up: Klaus mentioned budget review moved to March. Could impact our timeline."
    thread_replies: 4
    note_type: "risk"

  - timestamp: "2026-02-06T16:30:00Z"
    author: "Tom Richards"
    message: "POC environment ready. 3 of 5 data sources connected. Blocked on Kafka connector, need access credentials from ACME."
    thread_replies: 2
    note_type: "action"
    extracted_action:
      description: "Request Kafka connector credentials from ACME"
      owner: "Jane Smith"
      due: "2026-02-10"
      status: "blocked"

  - timestamp: "2026-02-04T08:45:00Z"
    author: "Jane Smith"
    message: "Escalation: No response from Marcus Weber on procurement timeline for 2 weeks."
    note_type: "escalation"
    resolved: false

escalation_count: 1
unresolved_action_count: 1
```

**Signals emitted on import:**
- `SIG_ART_001` (artifact_created) per thread converted to Note
- `SIG_HLT_001` (risk_identified) per escalation detected

**Connector config:**

```yaml
slack:
  enabled: false
  mode: mock
  config:
    bot_token_ref: "SLACK_BOT_TOKEN"
    channels: []           # channel IDs or names to monitor
    lookback_days: 30
    include_threads: true
    include_reactions: false
    escalation_keywords: ["escalation", "blocked", "urgent", "help"]
```

---

#### Email (Gmail / Outlook)

Email threads capture formal correspondence that often contains commitments, decisions, and relationship signals not captured elsewhere. The primary value is staleness detection: identifying contacts who have gone silent.

**What it provides:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Thread summary | Thread | `Note` objects | Meeting Notes Agent pipeline |
| Participants | Thread | `Note` | `.participants[]` |
| Sentiment indicator | Thread metadata | `raw/email_context.yaml` | `.threads[].sentiment` |
| Days since last reply | Thread metadata | `raw/email_context.yaml` | `.threads[].days_since_reply` |
| Staleness flags | Computed | Triggers `SIG_HLT` signals | Nudger Agent |
| Extracted commitments | Thread content | `Note` | Agent extraction |

**Mode:** Primarily Content Ingestion. Thread summaries become `Note` objects for agent processing. Staleness metadata is Context Import, written to `raw/email_context.yaml` for the Nudger Agent.

**The staleness signal is the highest-value output.** "Marcus Weber hasn't replied in 17 days" is a risk condition that should trigger `SIG_HLT_001` (risk_identified) and reach the Nudger. This is more valuable than the email content itself.

**Mock fixture structure:**

```yaml
# vault/{realm}/{node}/raw/mock_email.yaml
threads:
  - thread_id: "THR-001"
    subject: "Re: Security Platform Evaluation - Next Steps"
    participants:
      - name: "Klaus Hoffman"
        email: "k.hoffman@acme.com"
        role: "external"
      - name: "Jane Smith"
        email: "jane.smith@internal.com"
        role: "internal"
    last_message_date: "2026-02-06"
    message_count: 8
    summary: >
      Agreement on POC scope. Klaus confirmed budget owner sign-off.
      Requested formal POC proposal by Feb 14.
    sentiment: "positive"
    days_since_reply: 4
    staleness_flag: false

  - thread_id: "THR-002"
    subject: "ACME Internal: Procurement Process Questions"
    participants:
      - name: "Marcus Weber"
        email: "m.weber@acme.com"
        role: "external"
      - name: "Jane Smith"
        email: "jane.smith@internal.com"
        role: "internal"
    last_message_date: "2026-01-24"
    message_count: 3
    summary: >
      Procurement requires 3 vendor quotes for deals over 500K EUR.
      Marcus unresponsive since Jan 24.
    sentiment: "neutral"
    days_since_reply: 17
    staleness_flag: true

staleness_threshold_days: 14
stale_thread_count: 1
```

**Signals emitted on import:**
- `SIG_ART_001` (artifact_created) per thread converted to Note
- `SIG_HLT_001` (risk_identified) when stale threads exceed threshold

**Connector config:**

```yaml
email:
  enabled: false
  mode: mock
  config:
    provider: null         # gmail | outlook
    credentials_ref: null
    mailbox: null           # email address to scan
    lookback_days: 60
    thread_filter:
      domains: []           # only threads with contacts from these domains
      exclude_automated: true
    staleness_threshold_days: 14
```

---

### Tier 3: Lower Priority

These extend existing connectors rather than adding new ones.

#### Google Docs (extends existing Google Drive connector)

The Google Drive connector already fetches Docs, Sheets, and markdown as `Note` objects. The gap is structured metadata extraction from documents, particularly RFPs and technical requirements.

**What it adds to existing connector:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Document metadata | Doc | `raw/documents_index.yaml` | `.documents[]` |
| Key requirements | RFP Doc | `opportunities/requirements.yaml` | `.requirements[]` |
| Section structure | Doc | `raw/documents_index.yaml` | `.documents[].sections[]` |

**Mode:** Content Ingestion exists. Context Import adds a document index and requirement extraction.

**No separate mock fixture needed.** The existing Google Drive connector already handles document content. The conceptual extension adds a metadata index that catalogs imported documents with their types, key sections, and extracted requirements. This index helps agents locate relevant documents without scanning all content.

---

#### Excel / Google Sheets (extends existing Google Drive connector)

Spreadsheets contain evaluation matrices, financial models, and comparison tables. The data is highly variable across engagements, making a standardized connector premature.

**What it could provide:**

| Data Element | Source Object | Target Artifact | Target Field Path |
|-------------|--------------|-----------------|-------------------|
| Evaluation scores | Feature comparison sheet | `competitive/competitive_context.yaml` | `.evaluation_matrix` |
| TCO/ROI figures | Financial model sheet | `value/value_tracker.yaml` | `.financial_model` |
| Timeline milestones | Project plan sheet | `governance/milestones.yaml` | `.milestones[]` |

**Mode:** Context Import (structured data extraction from tabular format).

**Recommendation: defer.** Spreadsheet structures vary too much across engagements to justify a standardized connector. The existing Google Drive connector can pull spreadsheet content as Notes. Formalize a schema only after observing patterns across multiple real engagements.

---

## Data Provenance

Every Node should track which connectors have provided data, when they last synced, and whether the data is mock or live. This enables governance agents to assess data freshness and the Nudger to flag stale imports.

**Proposed addition to `node_profile.yaml`:**

```yaml
data_sources:
  - connector: salesforce
    mode: mock                  # mock | live
    last_sync: "2026-02-10T08:00:00Z"
    artifacts_imported:         # which InfoHub artifact types were populated
      - commercial
      - stakeholders
      - competitive
    record_count: 7             # total records imported
    status: synced              # synced | stale | error | not_connected
    source_ref: "OPP-2026-0142"  # external system ID for traceability

  - connector: calendar
    mode: mock
    last_sync: "2026-02-10T08:00:00Z"
    artifacts_imported:
      - meetings
      - cadence
    record_count: 5
    status: synced

  - connector: slack
    mode: not_connected
    status: not_connected

  - connector: email
    mode: not_connected
    status: not_connected
```

**Staleness rule:** If `last_sync` is older than the connector's configured `sync_interval` (or a global default of 7 days), the Nudger should flag the data source as stale and prompt a re-sync.

---

## Connector Configuration Extension

The existing `domain/config/connectors.yaml` adds new connector entries alongside the current filesystem, github, and google_drive sections.

```yaml
# Addition to domain/config/connectors.yaml

connectors:
  # ... existing filesystem, github, google_drive entries ...

  salesforce:
    enabled: false
    mode: mock
    config:
      instance_url: null
      api_version: "v59.0"
      credentials_ref: "SALESFORCE_TOKEN"
      sync_interval: null
    field_mappings:
      opportunity_arr: "Amount"
      stage: "StageName"
      probability: "Probability"
      close_date: "CloseDate"

  calendar:
    enabled: false
    mode: mock
    config:
      provider: null
      credentials_ref: null
      calendar_ids: []
      lookback_days: 90
      attendee_filter: []

  slack:
    enabled: false
    mode: mock
    config:
      bot_token_ref: "SLACK_BOT_TOKEN"
      channels: []
      lookback_days: 30
      include_threads: true
      escalation_keywords: ["escalation", "blocked", "urgent", "help"]

  email:
    enabled: false
    mode: mock
    config:
      provider: null
      credentials_ref: null
      lookback_days: 60
      staleness_threshold_days: 14
      thread_filter:
        domains: []
        exclude_automated: true

# Realm-specific connector mappings (extended)
realm_connectors:
  # Example: ACME realm configuration
  # ACME:
  #   - type: salesforce
  #     mode: mock
  #     opportunity_id: "OPP-2026-0142"
  #   - type: calendar
  #     mode: mock
  #     calendar_ids: ["acme-deal-calendar"]
  #   - type: slack
  #     mode: mock
  #     channels: ["#acme-security-deal"]
  #   - type: email
  #     mode: mock
  #     domains: ["acme.com"]

# Note type mappings (extended)
note_type_mappings:
  # ... existing github and google_drive mappings ...

  slack:
    keywords:
      risk: ["risk", "concern", "worried", "blocker"]
      decision: ["decided", "agreed", "approved", "go/no-go"]
      action: ["action", "todo", "need to", "follow up"]
      escalation: ["escalation", "escalate", "urgent", "help needed"]

  email:
    staleness_indicators:
      stale: ["no response", "awaiting reply", "pending"]
    thread_classification:
      decision: ["approved", "confirmed", "agreed"]
      action: ["please", "could you", "action required"]
```

---

## ConnectorType Enum Extension

The existing `ConnectorType` enum in `application/src/core/connectors/base.py` adds three new values.

```
Current:
  FILESYSTEM = "filesystem"
  GITHUB = "github"
  GOOGLE_DRIVE = "google_drive"
  SLACK = "slack"

Extended:
  SALESFORCE = "salesforce"
  CALENDAR = "calendar"
  EMAIL = "email"
```

`SLACK` already exists in the enum but has no implementation.

---

## Interface Extension: ContextBundle

The existing `BaseConnector` ABC defines `fetch_notes()` for content ingestion. A new `fetch_context()` method handles structured data import.

**ContextBundle fields:**

| Field | Type | Description |
|-------|------|-------------|
| `source` | `ConnectorType` | Which connector produced this data |
| `fetched_at` | `datetime` | When the data was retrieved |
| `artifacts` | `Dict[str, Any]` | Keyed by InfoHub artifact type. Values are dicts matching existing YAML schemas |
| `record_count` | `int` | Total records across all artifact types |
| `source_ref` | `Optional[str]` | External system identifier (e.g. Salesforce Opportunity ID) |

**Artifact keys in the `artifacts` dict:**

| Key | Target File | Schema Reference |
|-----|-------------|-----------------|
| `commercial` | `node_profile.yaml` `.commercial` section | `Commercial` Pydantic model |
| `company_profile` | `realm_profile.yaml` `.company_profile` section | Realm profile YAML schema |
| `stakeholders` | `stakeholders/*.yaml` | `Stakeholder` Pydantic model (list) |
| `competitive` | `node_profile.yaml` `.competitive` section | `Competitor` Pydantic model (list) |
| `meetings` | `meetings/external/` or `meetings/internal/` | `Note` dataclass (list) |
| `cadence` | `governance/operating_cadence.yaml` | Operating cadence YAML schema |
| `engagement_history` | `context/engagement_history.md` | Markdown string |
| `channel_summary` | `raw/slack_context.yaml` | Slack channel metadata |
| `thread_summaries` | `raw/email_context.yaml` | Email thread metadata (list) |
| `staleness_flags` | Triggers signals, no file write | Contact staleness records (list) |
| `documents_index` | `raw/documents_index.yaml` | Document metadata (list) |

The `fetch_context()` method is optional. Connectors that only provide content (Slack, existing GitHub and filesystem connectors) return `None`.

---

## Onboarding Data Flow

When an AE creates a new Node, the following sequence populates InfoHub from connected sources.

```
Step 1: CLASSIFY
  AE selects: Realm (existing or new) + Archetype + Domain + Track
  System creates: node_profile.yaml with classification, blueprint.yaml from reference

Step 2: CONNECT & IMPORT
  For each enabled connector:
    If connector.mode == "mock":
      Load fixture data from vault/{realm}/{node}/raw/mock_{type}.yaml
      Or read existing vault data (CRM mock reads realm_profile + node_profile)
    If connector.mode == "live":
      Call external API with realm/node-specific credentials

    Content data  -->  Note objects  -->  fetch_notes() pipeline (existing)
    Context data  -->  ContextBundle -->  Direct vault write

Step 3: SIGNAL EMISSION
  Per imported artifact:
    Emit appropriate signal from signal catalog
    Governance agents respond to signals as usual

Step 4: GOVERNANCE VALIDATION
  Blueprint Gap Scan (PB_971) checks required artifacts
  Task Shepherd validates imported actions
  Risk Radar processes imported risks
  Health Score recalculates with new data

Step 5: HUMAN APPROVAL GATE
  System emits SIG_GOV_004 (approval_requested)
    approval_type: "node_activation"
    summary: "Node ready for activation with imported data from {connectors}"
    approver: AE or Senior Manager (based on deal value)
  System blocks Node activation until human resolves
  Nudger tracks approval SLA and sends reminders
  Human reviews imported data in UI, then:
    approved       -->  SIG_GOV_005 emitted, proceed to Step 6
    changes_requested --> Agent revises, re-triggers Step 4
    rejected       -->  Node stays in "planning", AE notified

Step 6: ACTIVATE
  Node status transitions from "planning" to "active"
  data_sources section written to node_profile.yaml
  AE can access Node via UI
```

---

## Mock Strategy

Mock connectors serve three purposes: demonstrating the data flow, testing agent behavior, and validating InfoHub artifact schemas.

**Design principle:** Mock connectors should not require separate fixture maintenance. Where possible, they read from existing vault data and re-present it as if it came from an external source.

| Connector | Mock Data Source | Rationale |
|-----------|-----------------|-----------|
| CRM (Salesforce) | Existing `realm_profile.yaml` + `node_profile.yaml` | Commercial, stakeholder, and competitive data already populated for ACME_CORP |
| Calendar | `raw/mock_calendar.yaml` (new fixture) | Meeting history and cadence data does not exist in current vault structure |
| Slack | `raw/mock_slack.yaml` (new fixture) | Channel activity data does not exist in current vault structure |
| Email | `raw/mock_email.yaml` (new fixture) | Email thread data does not exist in current vault structure |
| Google Docs | Existing Google Drive connector | Document content already handled, metadata index is the only new artifact |
| Excel/Sheets | Deferred | Too variable to standardize at this stage |

**Fixture location:** `vault/{realm}/{node}/raw/mock_*.yaml`. The `raw/` directory is designed for source data (per the knowledge architecture), making it the natural location for mock fixtures.

---

## Signal Mapping

All connector events map to existing signals in the signal catalog. No new signals are required.

| Connector Event | Signal ID | Signal Name | Consumer |
|----------------|-----------|-------------|----------|
| New Node initialized from CRM | `SIG_LC_001` | node_created | All Agents |
| Node commercial data updated | `SIG_COM_001` | deal_stage_changed | AE Agent, VE Agent |
| Stakeholder imported | `SIG_STK_001` | stakeholder_added | AE Agent, SA Agent |
| Meeting note created from calendar | `SIG_ART_001` | artifact_created | Meeting Notes Agent |
| Operating cadence written | `SIG_ART_002` | artifact_updated | Nudger Agent |
| Risk detected in Slack thread | `SIG_HLT_001` | risk_identified | Risk Radar Agent |
| Stale email thread detected | `SIG_HLT_001` | risk_identified | Nudger Agent |
| Document imported | `SIG_ART_001` | artifact_created | InfoHub Curator |
| Node ready for activation | `SIG_GOV_004` | approval_requested | Notification Service, Nudger Agent |
| Human approves/rejects Node | `SIG_GOV_005` | approval_resolved | Orchestration Agent |

---

## Agent Consumption

Each agent interacts with connector data through InfoHub, not through the connectors directly. Agents never call connector methods. They read artifacts that connectors produced.

| Agent | What It Reads from Connector Data | How It Uses It |
|-------|----------------------------------|----------------|
| **AE Agent** | `node_profile.yaml` (commercial, stakeholders) | Deal progression, stakeholder management |
| **SA Agent** | `stakeholders/*.yaml`, `architecture/` docs | Technical architecture validation |
| **Meeting Notes Agent** | `Note` objects from calendar, Slack, email | Decision/action/risk extraction |
| **Nudger Agent** | `operating_cadence.yaml`, staleness flags | Follow-through enforcement, overdue detection |
| **Risk Radar Agent** | Slack escalations, email staleness | Early risk surfacing |
| **VE Agent** | `node_profile.yaml` (commercial), `value/` | ROI/TCO quantification |
| **CI Agent** | `node_profile.yaml` (competitive) | Competitive positioning |
| **Task Shepherd Agent** | Actions extracted from Slack/email | Action validation and enrichment |
| **InfoHub Curator** | Documents index, imported artifacts | Semantic integrity, staleness checks |

---

## Graduation Path: Mock to Live

The connector interface is identical for mock and live modes. Graduating a connector means replacing the data source, not the data contract.

| Stage | Data Source | Authentication | Use Case |
|-------|-----------|----------------|----------|
| **Mock** | Vault YAML files | None | Demo, development, agent testing |
| **Sandbox** | External system sandbox instance | OAuth / API key (test credentials) | Integration testing |
| **Live** | Production external system | OAuth / API key (production credentials) | Production operation |

**What changes between stages:** The `config` section in `connectors.yaml` (credentials, URLs, instance IDs). The `mode` field switches from `mock` to `live`.

**What stays identical:** The `ContextBundle` output schema, the artifact keys, the signal emissions, the InfoHub write paths, and the agent consumption patterns.

---

## UI Representation

The Streamlit onboarding page presents connectors as cards. Each card shows:

| Field | Description | Source |
|-------|-------------|--------|
| Connector name | Display name (e.g. "Salesforce CRM") | Static |
| Mode | "Mock" or "Live" | `connectors.yaml` |
| Status | "Connected", "Stale", "Error", "Not Connected" | `node_profile.yaml` `.data_sources[].status` |
| Last sync | Timestamp of last import | `node_profile.yaml` `.data_sources[].last_sync` |
| Artifacts available | What this connector can import | Connector definition |
| Artifacts imported | What has been imported for this Node | `node_profile.yaml` `.data_sources[].artifacts_imported` |
| Import action | Button to trigger import | Calls connector's fetch methods |

**Card states:**

| State | Visual | Action Available |
|-------|--------|-----------------|
| Not connected | Grey, disabled | "Configure" (admin only) |
| Mock ready | Blue outline | "Import Mock Data" |
| Live ready | Green outline | "Sync Now" |
| Synced | Green filled | "Re-sync" |
| Stale | Yellow filled | "Re-sync" (with warning) |
| Error | Red filled | "Retry" (with error detail) |

---

## Related Documents

- [Core Entities](core-entities.md): Realm, Node, InfoHub definitions
- [Knowledge Architecture](knowledge-architecture.md): Three-vault model and data flow
- [Signal Catalog](../../reference/signal-catalog.md): Signal definitions and contracts
- [Data Directory Guide](data-directory-guide.md): Vault directory structure
- [Documentation Principles](../../DOCUMENTATION_PRINCIPLES.md): Artifact formatting standards
- [Existing Connector Config](../../../domain/config/connectors.yaml): Current connector configuration
