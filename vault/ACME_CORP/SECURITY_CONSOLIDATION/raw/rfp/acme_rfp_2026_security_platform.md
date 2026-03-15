# Request for Proposal: Unified Security Platform

**Issuer:** ACME Corporation
**RFP Reference:** ACME-RFP-2026-SEC-001
**Issue Date:** 2026-03-01
**Response Deadline:** 2026-03-28
**Decision Target:** 2026-04-15
**Contact:** Stefan Muller, Security Operations Lead (s.muller@acme-corp.de)

---

## 1. Background and Purpose

ACME Corporation (Ingolstadt, Germany) recently completed the acquisition of Industrietechnik GmbH. The combined entity now operates two separate security stacks across 20 manufacturing plants: our existing SIEM and observability platform, and LegacySIEM deployed at Industrietechnik facilities. The board has mandated a single unified security platform to be operational by Q4 2026.

ACME is issuing this RFP to evaluate vendors capable of supporting the consolidation. The selected vendor must handle the migration from LegacySIEM without disruption to ongoing security operations at any of the 20 plants.

---

## 2. Scope of Evaluation

### In Scope
- Unified security event management (SIEM) across all 20 plants
- Log ingestion, normalization, and correlation from heterogeneous sources
- Threat detection and automated alerting
- Compliance reporting for ISO 27001 and GDPR
- Role-based access control across business units
- Integration with existing OT/SCADA monitoring at 6 critical infrastructure plants

### Out of Scope
- Physical security systems
- Endpoint protection (handled separately under a different contract)
- Cloud WAF (deferred to 2027 program)

---

## 3. Requirements

### 3.1 Mandatory Requirements (Must Meet All)

| ID | Requirement | Evaluation Criteria |
|----|-------------|---------------------|
| M-01 | Ingest logs from Windows, Linux, and OT/SCADA sources | Demonstrated in POC or reference |
| M-02 | ISO 27001 certification for the platform | Certificate provided |
| M-03 | GDPR-compliant data residency in EU (Germany preferred) | Data processing agreement, hosting documentation |
| M-04 | SLA: 99.9% uptime with 4-hour RTO for critical alerts | SLA documentation |
| M-05 | Role-based access: plant-level data isolation | Technical documentation + demo |
| M-06 | Migration support: LegacySIEM rule conversion tooling | Migration plan with tooling description |
| M-07 | 24/7 support in German and English | Support contract terms |

### 3.2 Scored Requirements

| ID | Requirement | Weight | Notes |
|----|-------------|--------|-------|
| S-01 | Detection rules coverage (MITRE ATT&CK framework) | 20% | Number of out-of-box detections |
| S-02 | Alert correlation and noise reduction | 18% | False positive rate in similar deployments |
| S-03 | OT/SCADA native integration depth | 15% | Number of native connectors, not third-party |
| S-04 | AI/ML-driven anomaly detection | 12% | Describe the approach and model update cadence |
| S-05 | Ease of migration from LegacySIEM | 12% | Migration timeline estimate, automation coverage |
| S-06 | Reporting and compliance dashboard | 10% | ISO 27001 and GDPR report templates |
| S-07 | Vendor financial stability and roadmap | 8% | Last two years' financials or audited accounts |
| S-08 | Customer references in manufacturing / OT | 5% | Minimum 2 references in relevant industries |

### 3.3 Commercial Requirements

- Fixed-price implementation preferred
- 3-year contract minimum with annual renewal options thereafter
- Payment terms: net 60 from invoice
- Pricing must be submitted in EUR

---

## 4. Response Instructions

Vendors must respond to each requirement individually. Responses must include:

1. **Executive Summary** (max 2 pages): company overview, solution approach, and why ACME should select you
2. **Technical Response**: requirement-by-requirement compliance matrix (Compliant / Partial / Non-Compliant with explanation)
3. **Migration Plan**: LegacySIEM migration approach, timeline, and risk mitigation
4. **Pricing**: implementation, licensing (per user and per event volume), and support tiers
5. **References**: minimum 2 customer references in manufacturing or critical infrastructure
6. **Legal and Compliance**: ISO 27001 certificate, GDPR data processing agreement, SLA terms

Late submissions will not be accepted. Questions must be submitted by 2026-03-15 to s.muller@acme-corp.de.

---

## 5. Evaluation Process

| Stage | Date | Activity |
|-------|------|----------|
| Questions deadline | 2026-03-15 | Written questions only |
| Response deadline | 2026-03-28 | Full submission |
| Shortlist notification | 2026-04-05 | Top 2-3 vendors |
| Vendor presentations | 2026-04-10 to 11 | 2-hour slot per vendor |
| Final decision | 2026-04-15 | Board approval |

Final decision requires approval from Marcus Weber (CTO) and Klaus Hoffman (CISO, via acquisition).

---

## 6. Evaluation Committee

| Name | Role | Voting |
|------|------|--------|
| Stefan Muller | Security Operations Lead | Technical lead |
| Klaus Hoffman | CISO (Industrietechnik) | Technical veto |
| Dr. Sarah Chen | Head of Engineering | Technical advisor |
| Marcus Weber | CTO | Final approval |
