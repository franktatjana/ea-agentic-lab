---
framework_id: "PB_001"
framework_name: "Three Horizons of Growth"
framework_source: "McKinsey & Company"
execution_date: "2026-01-12"
executed_by: "ae_agent"
account: "ACME_CORP"
context_source: "infohub/ACME_CORP/account_profile.yaml"
trigger: "deal_review"
status: "complete"
evidence:
  - "account_profile.yaml:revenue"
  - "meetings/internal/2026-01-12_deal_review.md"
---

# Three Horizons Analysis: ACME Corporation

## Executive Summary

ACME Corporation's revenue portfolio shows **high concentration risk in Horizon 1** (100% current ARR), with emerging Horizon 2 pipeline in security. Immediate action required to accelerate Horizon 2 conversion to reduce dependency on existing observability business.

## Horizon Analysis

### Horizon 1: Core Business (Defend & Extend)
**Current Revenue: $3,500,000 ARR (100%)**

| Product | Use Case | ARR Contribution | Health |
|---------|----------|------------------|--------|
| Search solution | Operational Analytics | $2,100,000 | Stable |
| Kibana | Dashboards | $700,000 | Growing |
| APM | Performance Monitoring | $700,000 | Growing |

**Assessment**:
- Strong product adoption (250 active users)
- Plant observability expansion in progress
- No immediate churn risk identified
- Growth potential: 10-15% through user expansion

**Recommended Actions**:
1. Complete plant observability rollout (June 2026)
2. Drive Kibana adoption in additional departments
3. Expand APM to cover remaining 55 services

### Horizon 2: Emerging Business (Build & Scale)
**Pipeline: $800,000 ARR (60% probability)**

| Opportunity | Stage | Value | Timeline |
|-------------|-------|-------|----------|
| Security Consolidation | Discovery | $800,000 | Q4 2026 |

**Assessment**:
- Budget approved by board
- Strong executive sponsorship (CTO)
- Competitive situation (Microsoft, LegacySIEM)
- Timeline aggressive but achievable with POC-first approach

**Recommended Actions**:
1. Execute POC by March 2026
2. Secure CTO direct engagement
3. Build security team champion
4. Develop TCO justification vs. incumbents

### Horizon 3: Future Options (Explore & Experiment)
**Pipeline: $400,000 ARR (20% probability)**

| Opportunity | Stage | Value | Timeline |
|-------------|-------|-------|----------|
| ML/AI Analytics | Concept | $400,000 | 2027+ |

**Assessment**:
- Early stage, customer has expressed interest in ML capabilities
- Manufacturing predictive maintenance use case identified
- Requires successful H2 execution first
- Long-term strategic play

**Recommended Actions**:
1. Document ML use cases during security engagement
2. Identify data science stakeholders
3. Plan discovery session for Q3 2026

## Risk Assessment

### Concentration Risk: HIGH

```
Current State:
H1: ████████████████████████████████████████ 100% ($3.5M)
H2: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
H3: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%

Target State (12 months):
H1: ████████████████████████████████         80% ($3.5M)
H2: ████████████                             18% ($800K)
H3: ██                                        2% (pipeline)
```

**Threshold Breach**: H1 concentration (100%) exceeds maximum threshold (80%)

### Mitigation Priority
1. **Accelerate H2 conversion** - Security POC must succeed
2. **Protect H1 base** - Ensure observability renewal
3. **Seed H3 conversations** - Document future opportunities

## Decision Outputs

### Risks Generated

| Risk ID | Severity | Description | Owner |
|---------|----------|-------------|-------|
| RISK_001 | HIGH | Revenue concentration in H1 exceeds 80% threshold | AE Agent |
| RISK_002 | MEDIUM | H2 opportunity dependent on single initiative | AE Agent |
| RISK_003 | LOW | H3 pipeline underdeveloped | AE Agent |

### Actions Generated

| Action ID | Priority | Action | Owner | Due Date |
|-----------|----------|--------|-------|----------|
| ACT_001 | P1 | Execute security POC successfully | SA Agent | 2026-03-15 |
| ACT_002 | P1 | Secure H1 renewal commitment | AE Agent | 2026-06-30 |
| ACT_003 | P2 | Identify H3 stakeholders | AE Agent | 2026-03-31 |

## Validation

- **Pre-execution checks**: PASSED
  - Account profile loaded: Yes
  - Revenue data available: Yes
  - Pipeline data available: Yes

- **Post-execution checks**: PASSED
  - All horizons analyzed: Yes
  - Concentration calculated: Yes
  - Risks generated: 3
  - Actions generated: 3

---
*Framework executed by: AE Agent*
*Evidence sources: 2*
*Next review: 2026-02-12*
