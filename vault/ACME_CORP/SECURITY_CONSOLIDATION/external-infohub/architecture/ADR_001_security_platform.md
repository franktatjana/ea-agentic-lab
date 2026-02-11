---
adr_id: "ADR_001"
title: "Security Platform Selection for Combined Entity"
status: "proposed"
date_proposed: "2026-01-16"
date_decided: null
decision_makers:
  - "Klaus Hoffman (CISO)"
  - "Marcus Weber (CTO)"
context_owner: "Maria Santos (SA)"
account: "ACME_CORP"
framework: "TOGAF ADR"
linked_playbook: "PB_101"
---

# ADR-001: Security Platform Selection for Combined Entity

## Status
**PROPOSED** - Pending POC completion and stakeholder decision

## Context

### Business Context
ACME Corporation is acquiring Industrietechnik GmbH (closing April 2026). The combined entity requires unified security operations across 20 manufacturing plants within 6 months of close (October 2026).

### Current State

| Entity | Security Stack | Annual Cost | Pain Points |
|--------|---------------|-------------|-------------|
| ACME (8 plants) | LegacySIEM SIEM, SecurityVendorA, NetworkSecVendor, Legacy on-prem | $1.2M | Tool sprawl, no observability integration |
| Industrietechnik (12 plants) | LegacySIEM SIEM, SecurityVendorA, NetworkSecVendor | ~$1.0M | Separate management, different configs |
| **Combined** | 6 overlapping tools | ~$2.2M | Unification required by board mandate |

### Technical Requirements
1. **Scale**: Support 20 manufacturing plants
2. **OT/ICS**: Industrial control system security (critical for manufacturing)
3. **Integration**: Unified visibility with existing Platform observability
4. **Timeline**: Full deployment within 6 months
5. **Compliance**: ISO 27001, IEC 62443
6. **Data Residency**: EU (German data centers)

### Constraints
- Board mandate: unified platform by October 2026
- Budget: €3M allocated
- Existing LegacySIEM contract: 18 months remaining at Industrietechnik
- New CISO (Klaus Hoffman) has LegacySIEM expertise

## Decision Drivers

| Driver | Weight | Description |
|--------|--------|-------------|
| Platform Integration | High | Unified observability + security on single platform |
| OT/ICS Capability | High | Manufacturing environment security |
| TCO | High | 3-year total cost of ownership |
| Deployment Speed | High | 6-month timeline |
| Vendor Lock-in | Medium | Future flexibility |
| Team Familiarity | Medium | Learning curve for operations |

## Options Considered

### Option A: Security solution (Recommended)

**Description**: Consolidate to our Security solution, leveraging existing observability investment

**Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                 Security solution                    │
├─────────────────────┬─────────────────────┬─────────────────┤
│   SIEM/Analytics    │    Endpoint         │   OT/ICS        │
│   - Log analysis    │    - Platform Agent  │   - ICS rules   │
│   - ML detection    │    - EDR            │   - OT protocol │
│   - Threat intel    │    - Response       │   - Asset disc  │
├─────────────────────┴─────────────────────┴─────────────────┤
│              Unified Data Layer (search_platform)              │
│                 (Existing ACME clusters)                     │
├─────────────────────────────────────────────────────────────┤
│              Existing Observability Stack                    │
│           APM | Logs | Metrics | Dashboards                  │
└─────────────────────────────────────────────────────────────┘
```

**Pros**:
- Native integration with existing observability (unique differentiator)
- Single platform for obs + security (reduced complexity)
- Lower TCO ($800K vs $1.5M LegacySIEM)
- 3-year proven relationship
- Open platform, no vendor lock-in

**Cons**:
- Security team unfamiliar with our solution
- CISO has LegacySIEM expertise
- Migration effort for LegacySIEM data
- OT/ICS capability requires validation

**Cost**: $800K/year + $150K implementation

### Option B: LegacySIEM Enterprise Security

**Description**: Consolidate both entities onto LegacySIEM ES with contract consolidation

**Pros**:
- CISO familiarity
- No migration from existing LegacySIEM
- Incumbent, lower change risk

**Cons**:
- No observability integration (would strand our observability investment)
- Higher TCO (~$1.5M/year)
- Vendor lock-in concerns
- Would require separate observability platform

**Cost**: ~$1.5M/year

### Option C: CloudSIEM

**Description**: Move to Azure-native SIEM

**Status**: **ELIMINATED** - Customer stated "we're not an Azure shop"

## Recommendation

**Option A: Security solution**

### Rationale
1. **Unique Integration Value**: Only option that unifies observability and security on single platform
2. **TCO Advantage**: 30% lower 3-year cost vs LegacySIEM
3. **Existing Investment**: Leverages $3.5M existing deployment
4. **Strategic Alignment**: Supports customer's vendor consolidation mandate
5. **Proven Relationship**: 3 years successful partnership

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| CISO skepticism | POC to prove capabilities, executive engagement |
| OT/ICS validation | Dedicated POC environment, specialist resources |
| Migration complexity | Phased approach, parallel operation period |
| Timeline pressure | Pre-staged resources, accelerated deployment model |

## Validation Plan (POC)

### POC Scope
- Duration: 7 weeks (Jan 27 - Mar 15)
- Environment: Dedicated OT/ICS lab simulating 20 plants
- Data: Sample from both ACME and Industrietechnik

### Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Threat Detection | 95% known patterns | Detection rate test |
| OT/ICS Coverage | 5 protocol types | Protocol validation |
| Query Performance | <1 second | Response time test |
| Scale Simulation | 20 plants | Load test |
| Migration Feasibility | Demonstrated | LegacySIEM data import |

### POC Timeline
```
Week 1-2: Environment setup, data ingestion
Week 3-4: Detection rule validation
Week 5-6: Scale testing, OT/ICS scenarios
Week 7: Executive review, decision
```

## Decision

**Status**: PENDING POC COMPLETION

**Target Decision Date**: March 15, 2026

**Decision Makers**:
- Klaus Hoffman (CISO) - Technical recommendation
- Marcus Weber (CTO) - Final approval

## Consequences

### If Platform Selected
- LegacySIEM contract negotiation for early termination
- Team training program (4-6 weeks)
- Phased deployment: pilot plants → full rollout
- Unified platform for future capabilities (ML, Search)

### If LegacySIEM Selected
- Platform observability investment continues separately
- No unified visibility (ops + security silos)
- Higher ongoing costs
- Integration complexity remains

## References

- [Value Engineering Analysis](../frameworks/PB_301_value_engineering_20260112.md)
- [SWOT Analysis](../frameworks/PB_201_swot_20260116_revised.md)
- [Risk Register](../risks/risk_register.yaml)
- [CTO Meeting Notes](../meetings/external/2026-01-15_cto_strategic_shift.md)

---
*ADR created by: SA Agent*
*Framework: TOGAF Architecture Decision Record*
*Last updated: 2026-01-16*
