# Specialist (Generic) Agent

> Accountable for identifying when specialist expertise is needed and routing to the correct domain specialist.

**Layer:** Strategic
**Team:** `specialists`
**Agent ID:** `specialist_agent`

---

## Purpose

The Specialist Agent monitors RFP/POC stages and complex customer questions to detect when domain-specific expertise is required. It does not provide specialist-level guidance itself, but ensures the right domain specialist (Observability, Search, Security, or Data Management) is engaged at the right time. Early specialist involvement prevents late-stage rework and failed POCs.

---

## Core Functions

- Identify RFP/POC triggers that require specialist involvement
- Capture deep technical decisions from engagements
- Highlight architecture concerns requiring specialist review
- Track specialist engagement status
- Assess complexity thresholds to determine routing priority

---

## Boundaries

### What this agent does

- Identify when specialist expertise is needed (Observability, Security, Search, etc.)
- Capture deep technical decisions from RFP/POC phases
- Highlight architecture concerns requiring specialist review
- Track specialist engagement status
- Route to appropriate domain specialist based on trigger keywords

### What this agent does not do

- Provide specialist-level technical guidance
- Make decisions on specialist's behalf
- Assess technical complexity beyond routing scope

---

## Skills

No dedicated skills. Uses personality-defined prompts for trigger detection and routing.

---

## Integration

### Receives from

| Agent | What |
|-------|------|
| SA Agent | Architecture notes, complex customer questions |
| AE Agent | POC/RFP documents requiring specialist review |

### Provides to

| Agent | What |
|-------|------|
| Observability Specialist | Engagement recommendations when observability triggers detected (APM, SIEM, logs >100GB/day, metrics, traces) |
| Search Specialist | Engagement recommendations when search triggers detected (NLP, vector search, RAG, search relevance, >10M docs) |
| Security Specialist | Engagement recommendations when security triggers detected (RBAC, compliance, audit, field-level security, encryption) |
| Specialist Lead | Escalations for complex routing decisions |

### Routing Triggers

The agent uses keyword-based trigger detection to route to domain specialists. Triggers and complexity thresholds are defined in the personality file's `signal_detection` section (under 100 lines, no separate reference extraction needed).

---

## Guardrails

- NEVER route to specialist without clear trigger
- NEVER assess technical complexity beyond routing scope
- Quote exact customer requirement when routing

When uncertain: flag the engagement for manual review by the Specialist Lead rather than routing incorrectly.

---

## Quality Criteria

- Every routing decision cites a specific trigger keyword or threshold
- Specialist engagement recommendations include the source requirement
- No false-positive routing (triggers match actual specialist need)
- Engagement status tracked through resolution

---

## References

No dedicated reference files. The personality file is under 100 lines and contains trigger keywords and complexity thresholds inline.

---

## Related

- **Config:** `agents/specialist_agent.yaml`
- **Personality:** `personalities/specialist_personality.yaml`
- **Domain Specialists:** `observability/`, `search/`, `security/` subdirectories
