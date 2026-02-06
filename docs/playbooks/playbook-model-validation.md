# Playbook Model - Validation & Gap Detection

**Date:** 2026-01-11

---

## Core Principle

**Playbooks DO NOT generate artifacts.**

Playbooks are **continuous validation engines** that:
- Assess account/project health against framework criteria
- Detect gaps in strategy, architecture, relationships, execution
- Warn humans about missing elements or risks
- Monitor account state continuously (not one-time execution)

---

## Validation vs. Generation Model

### OLD Model (Incorrect)
```yaml
Trigger → Gather Inputs → Execute Analysis → Generate Outputs
                                              ↓
                                    Create markdown files
                                    Create decision objects
                                    Update InfoHub artifacts
```

### NEW Model (Correct)
```yaml
Continuous Monitoring → Validate Against Framework → Detect Gaps → Warn Human
                             ↓                           ↓
                    Check if elements exist      List what's missing
                    Assess completeness          Flag degradation
                    Monitor trends               Escalate risks
```

---

## Validation Playbook Structure

```yaml
framework_name: "Three Horizons of Growth"
validation_mode: true  # Not generative

# What the playbook CHECKS (not generates)
validation_criteria:
  horizon_1_checks:
    - exists: "Current ARR documented"
    - exists: "Active use cases identified"
    - exists: "Renewal risks assessed"
    - threshold: "H1 ARR < 80% of total (healthy portfolio balance)"

  horizon_2_checks:
    - exists: "Expansion opportunities documented"
    - exists: "Pipeline value quantified"
    - threshold: "H2 pipeline >= $500K (sufficient growth path)"

  horizon_3_checks:
    - exists: "Future vision documented"
    - exists: "Strategic initiatives aligned with roadmap"

# What the playbook WARNS about
gap_detection:
  - if_missing: "H2 opportunities"
    severity: "HIGH"
    warning: "Account has no documented growth path beyond current deployment"
    action: "AE should conduct expansion discovery workshop"

  - if_threshold_violated: "H1 > 80% of total pipeline"
    severity: "MEDIUM"
    warning: "Revenue concentration risk - account over-reliant on current business"
    action: "Focus on H2 expansion to diversify"

# How often to check
validation_frequency: "Monthly + on account plan update"

# Output is WARNING, not ARTIFACT
output_type: "Gap Report"
output_format: "List of missing elements + severity + recommended actions"
```

---

## Agent-Playbook Integration

### Agents Use Playbooks to Validate Account State

**AE Agent runs validation playbooks:**
- Three Horizons → Checks if growth strategy is documented
- Ansoff Matrix → Validates market penetration vs. diversification strategy exists
- BCG Matrix → Checks if use cases are prioritized
- Value Proposition Canvas → Validates executive value narrative documented

**SA Agent runs validation playbooks:**
- SWOT → Checks if strengths/weaknesses/opportunities/threats are assessed
- PESTLE → Validates regulatory/environmental context captured
- Decision Tree → Checks if decisions are documented with alternatives
- Risk Heat Map → Validates all risks have severity + likelihood ratings
- 7S Framework → Checks organizational alignment factors

**Output:** Gap reports to humans, NOT generated artifacts

---

## Example Validation Output

### Three Horizons Validation Report for Client C4

**Validation Date:** 2026-01-11
**Account:** C4
**Framework:** Three Horizons of Growth
**Status:** ⚠️ GAPS DETECTED

---

**Horizon 1 (Defend & Extend):**
- ✅ Current ARR documented: $720K
- ✅ Active use cases identified: Pharmaceutical search, data management
- ⚠️ **GAP:** Renewal risks not formally assessed
- ⚠️ **GAP:** Competitor evaluation (Qdrant) mentioned but no mitigation plan

**Horizon 2 (Growth):**
- ✅ Expansion opportunities documented: GenAI search, Neo4j integration
- ⚠️ **GAP:** Pipeline value not quantified (no dollar estimates)
- ⚠️ **GAP:** No timeline for H2 opportunities

**Horizon 3 (Transform):**
- ❌ **CRITICAL GAP:** No H3 vision documented
- ❌ **CRITICAL GAP:** No strategic initiatives aligned with product roadmap

---

**Risk Assessment:**
- **SEVERITY:** HIGH
- **REASON:** H1 at risk (Qdrant evaluation) + no H2 quantification + missing H3 vision

**Recommended Actions:**
1. **IMMEDIATE:** Document Qdrant competitive mitigation strategy
2. **HIGH:** Quantify H2 pipeline ($400K-$700K GenAI, $300K-$500K Neo4j)
3. **MEDIUM:** Conduct H3 visioning workshop with customer

**Escalation:** AE (Tanja Frank) - Account needs strategic planning session

---

## Validation Playbook vs. Traditional Playbook

| Aspect | Traditional (Generation) | Validation (Gap Detection) |
|--------|-------------------------|----------------------------|
| **Purpose** | Create new artifacts | Check existing state |
| **Trigger** | Event-driven (account planning initiated) | Continuous + scheduled (monthly) |
| **Inputs** | Raw data (notes, usage, CRM) | Existing InfoHub artifacts |
| **Process** | Analyze → Synthesize → Generate | Check → Compare → Detect gaps |
| **Outputs** | Markdown files, decision objects | Gap reports, warnings |
| **Human Action** | Review generated content | Address detected gaps |
| **Frequency** | One-time per trigger | Continuous monitoring |

---

## Implementation for 25 Frameworks

All 25 user-requested frameworks will be operationalized as **validation playbooks**:

### AE Agent Validation Playbooks (8)
1. Three Horizons → Validate growth strategy completeness
2. Ansoff Matrix → Validate market strategy clarity
3. BCG Matrix → Validate use case prioritization
4. Porter's Generic Strategies → Validate cost/differentiation positioning
5. Value Proposition Canvas → Validate executive value narrative
6. Elements of Value Pyramid → Validate C-level stakeholder value articulation
7. Power Curve → Validate where customer generates profit is documented
8. Blue Ocean Strategy → Validate differentiation beyond commodity competition

### SA Agent Validation Playbooks (7)
1. SWOT → Validate strategic position assessment exists
2. PESTLE → Validate regulatory/environmental context captured
3. Decision Tree → Validate decisions documented with alternatives
4. Risk Heat Map → Validate all risks properly classified
5. 7S Framework → Validate organizational alignment documented
6. Pace-Layered Application Strategy → Validate change velocity understanding
7. Cost-Benefit Analysis → Validate architecture alternatives have financial comparison

### Exec Sponsor / Stakeholder Agent Validation Playbooks (5)
1. Stakeholder Mapping → Validate power/interest grid exists for key stakeholders
2. Influence Model → Validate influence strategies documented
3. RACI Matrix → Validate role clarity for key activities
4. McKinsey 5 Frames → Validate execution readiness assessed
5. Results Delivery Framework → Validate post-meeting follow-up tracked

### Transformation / Governance Agent Validation Playbooks (5)
1. Kotter's 8-Step → Validate change management approach documented
2. Three Lines of Defense → Validate governance structure for security/risk/compliance
3. Operating Model Canvas → Validate strategy-to-execution link documented
4. OKR Framework → Validate objectives and key results tracked
5. Transformation Office Model → Validate program-level governance exists

---

## Benefits of Validation Model

1. **Continuous Assessment** - Account health monitored over time, not point-in-time
2. **Early Warning System** - Gaps detected before they become crises
3. **Human-Centric** - Agents warn, humans decide what to do
4. **Lightweight** - No artifact generation overhead
5. **Scalable** - Same playbook validates 50 accounts simultaneously
6. **Knowledge Reinforcement** - Frameworks become checklists, not documents

---

**Status:** Validation model defined, ready to refactor existing 6 playbooks and create remaining 19 as validators.
