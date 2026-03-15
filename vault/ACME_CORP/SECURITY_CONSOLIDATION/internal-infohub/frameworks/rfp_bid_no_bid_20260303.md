---
framework_id: "RFP_BND_001"
framework_name: "Bid/No-Bid Assessment"
framework_source: "RFP Agent - Bid Assessment Framework"
execution_date: "2026-03-03"
executed_by: "rfp_agent"
account: "ACME_CORP"
node: "SECURITY_CONSOLIDATION"
rfp_ref: "ACME-RFP-2026-SEC-001"
context_source:
  - "ACME_CORP/SECURITY_CONSOLIDATION/raw/rfp/acme_rfp_2026_security_platform.md"
  - "ACME_CORP/SECURITY_CONSOLIDATION/internal-infohub/competitive/competitive_context.yaml"
  - "ACME_CORP/SECURITY_CONSOLIDATION/internal-infohub/context/stakeholder_map.yaml"
trigger: "rfp_received"
status: "complete"
recommendation: "STRONG_BID"
overall_score: 82
escalation_required: false
---

# Bid/No-Bid Assessment: ACME Security Platform RFP

## Recommendation: STRONG BID

**Overall Score: 82 / 100** — Threshold for Strong Bid: ≥ 75

This RFP is winnable. ACME is an existing customer with a proven relationship, the technical fit is high, and the competitive position is strong relative to LegacySIEM. Klaus Hoffman (CISO via acquisition) is the primary risk: he is the incumbent's champion and has evaluation veto. A dedicated strategy to convert or neutralize Klaus is required before submission. Leadership approval requested before resources are committed.

---

## Scoring Matrix

### Strategic Fit — 22 / 25

| Factor | Score | Rationale |
|--------|-------|-----------|
| Alignment with target markets | 9/10 | Manufacturing / OT security is a stated target segment. This deal is reference-worthy. |
| Reference value potential | 8/10 | 20-plant unified deployment with LegacySIEM migration is a strong reference case for competitive displacement. |
| Strategic account status | 5/5 | ACME is an existing customer. Losing this to LegacySIEM would be a visible loss. |

### Competitive Position — 21 / 25

| Factor | Score | Rationale |
|--------|-------|-----------|
| Relationship strength | 7/10 | Strong with Marcus Weber (CTO) and Dr. Sarah Chen (Head of Engineering). Weak with Klaus Hoffman (CISO). |
| Solution fit percentage | 9/10 | 6 of 7 mandatory requirements met natively. M-03 (EU data residency) requires confirmation of Frankfurt region availability. |
| Known competitive threats | 5/5 | LegacySIEM is the only confirmed competitor. Klaus Hoffman is their internal champion. No third-party vendor confirmed. |

### Solution Fit — 16 / 20

| Factor | Score | Rationale |
|--------|-------|-----------|
| Requirements coverage | 7/10 | Mandatory: 6/7 confirmed, 1 needs verification (GDPR data residency). Scored: strong on detection, correlation, and AI/ML. OT/SCADA native connector depth needs SA confirmation. |
| Technical gap severity | 5/5 | No blocking gaps. M-03 is clarifiable, not a blocker. OT/SCADA gap is addressable via existing partner connector. |
| Integration complexity | 4/5 | LegacySIEM migration is manageable. Rule conversion tooling exists. 20-plant rollout adds implementation complexity but is within scope of standard PS delivery. |

### Resource Availability — 13 / 15

| Factor | Score | Rationale |
|--------|-------|-----------|
| Team capacity | 5/5 | SA team has bandwidth. InfoSec Agent available for compliance sections. |
| SME availability | 4/5 | OT/SCADA SME needed for S-03 response. Check with PS team by 2026-03-10. |
| Timeline feasibility | 4/5 | 25-day response window is tight. Kickoff by 2026-03-05 required to hit deadline. |

### Commercial Viability — 10 / 15

| Factor | Score | Rationale |
|--------|-------|-----------|
| Deal size vs effort | 4/5 | Expected $800K-$1.2M ARR for unified 20-plant deployment. Implementation PS services additional. Strong ROI on bid effort. |
| Margin potential | 3/5 | Fixed-price preference (as stated in RFP) compresses margin. Value-based pricing negotiation needed in commercial discussions. |
| Payment terms | 3/5 | Net 60, EUR pricing. Standard for German enterprise. No issue. |

---

## Risk Flags

| Risk | Severity | Mitigation |
|------|----------|------------|
| Klaus Hoffman (CISO) has LegacySIEM loyalty and evaluation veto | HIGH | AE to arrange 1:1 with Klaus before submission. Frame migration as reducing his operational burden, not replacing his choice. |
| M-03 (EU data residency) not confirmed for all data types | MEDIUM | SA to verify Frankfurt region scope covers OT log data by 2026-03-07. |
| OT/SCADA native connector depth (S-03) is weak vs. LegacySIEM | MEDIUM | PS OT SME needed for accurate scoring response. Avoid overstating native coverage. |
| 25-day response window is tight for full cross-functional team | LOW | Assign section owners immediately. Compliance sections to InfoSec Agent. Technical to SA. Commercial to AE. |

---

## Recommended Actions Before Submission

| Action | Owner | Due |
|--------|-------|-----|
| AE arranges 1:1 meeting with Klaus Hoffman | AE Agent | 2026-03-07 |
| SA verifies EU data residency scope (M-03) | SA Agent | 2026-03-07 |
| PS OT SME confirmed for S-03 response section | PS / SA | 2026-03-10 |
| Response kickoff meeting with full team | RFP Agent | 2026-03-05 |
| Leadership approval to proceed | Marcus Weber (CTO) | 2026-03-05 |

---

## Win Themes (Initial)

Based on existing account context and RFP priorities:

1. **Proven continuity**: ACME already runs our platform. This is an expansion, not a rip-and-replace for ACME's existing 14 plants. The risk is only in migrating Industrietechnik's 6 plants.

2. **LegacySIEM migration credibility**: We have migration tooling and documented reference migrations. LegacySIEM will struggle to argue against replacing itself.

3. **Unified observability + security**: ACME already uses our observability layer. Unifying security onto the same platform eliminates the cross-tool correlation gap that their current split stack creates.

4. **OT/SCADA readiness for manufacturing**: Frame response around their 6 critical infrastructure plants. ISO 27001 and the OT connector story need to be front and center for Klaus Hoffman.
