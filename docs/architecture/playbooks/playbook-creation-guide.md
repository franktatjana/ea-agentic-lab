# Validation Playbook Creation Plan - All 25 Frameworks

**Date:** 2026-01-11
**Status:** 2/25 Created, 23 Remaining

---

## Completed Validation Playbooks ✅

1. **PB_001** - Three Horizons of Growth (McKinsey) - AE Agent
   - Location: `playbooks/executable/` (needs refactor to validation mode)
   - Status: Created as generative, needs conversion to validation

2. **PB_002** - Ansoff Growth Matrix (Igor Ansoff) - AE Agent ✅
   - Location: `playbooks/validation/PB_002_ansoff_matrix.yaml`
   - Status: Complete validation playbook

3. **PB_003** - BCG Growth-Share Matrix (BCG) - AE Agent ✅
   - Location: `playbooks/validation/PB_003_bcg_matrix.yaml`
   - Status: Complete validation playbook

---

## AE / Account Strategy Agent - Remaining (5/8)

### PB_004 - Porter's Generic Strategies
**Validates:** Cost leadership vs. differentiation positioning clarity
**Gap Detection:**
- No competitive positioning documented
- Value narrative unclear (price vs. premium)
- Competitive differentiation not articulated
- Positioning conflicts with actual pricing (claiming premium but discounting heavily)

### PB_005 - Value Proposition Canvas
**Validates:** Executive-level value framing documented
**Gap Detection:**
- Customer jobs/pains/gains not mapped
- Platform value proposition not customized to customer
- Executive value narrative missing or generic
- Pain relievers and gain creators not specified

### PB_006 - Elements of Value Pyramid
**Validates:** Functional, emotional, life-changing, social impact value documented for C-level
**Gap Detection:**
- Only functional value articulated (missing emotional/strategic layers)
- Value not customized by stakeholder (CTO vs. CFO vs. CEO)
- Business transformation value not documented
- Social/strategic impact missing for enterprise buyers

### PB_007 - Power Curve
**Validates:** Where customer generates profit is documented
**Gap Detection:**
- Customer's profit centers not identified
- How Platform impacts customer profitability not documented
- Revenue-critical use cases not prioritized
- ROI not linked to customer's business model

### PB_008 - Blue Ocean Strategy
**Validates:** Differentiation beyond "LegacySIEM replacement" documented
**Gap Detection:**
- Still positioned as commodity replacement (Red Ocean)
- Unique value curve not created
- Competing on features/price instead of creating new value space
- No strategy to escape competitive market

---

## SA / Architecture & Decision Agent - All Remaining (7/7)

### PB_201 - SWOT Analysis (Refactor)
**Current:** Generative playbook
**Needs:** Convert to validation mode
**Validates:** Strengths, weaknesses, opportunities, threats assessed and current

### PB_202 - PESTLE Analysis
**Validates:** Political, Economic, Social, Technological, Environmental, Legal context captured
**Gap Detection:**
- Regulatory requirements not documented (GDPR, industry-specific)
- Economic constraints not assessed (budget cycles, financial health)
- Technology trends not monitored (cloud mandates, GenAI adoption)
- Environmental factors ignored (energy, sustainability requirements)

### PB_203 - Decision Tree Analysis
**Validates:** Decisions documented with alternatives and rationale
**Gap Detection:**
- Decisions made but not documented
- No alternatives considered (single-path thinking)
- Decision rationale unclear (why X chosen over Y)
- Downstream impacts not assessed

### PB_204 - Risk Heat Map
**Validates:** All risks classified by severity x likelihood
**Gap Detection:**
- Risks exist but not classified
- Severity/likelihood ratings missing
- Risk register incomplete
- No risk prioritization

### PB_205 - McKinsey 7S Framework
**Validates:** Strategy, Structure, Systems, Shared Values, Skills, Style, Staff alignment
**Gap Detection:**
- Technical solution conflicts with customer organization (misaligned structure)
- Skills gap not addressed (customer lacks expertise)
- Cultural fit not assessed (Platform approach vs. customer culture)
- Systems not integrated (Platform siloed from customer workflows)

### PB_206 - Pace-Layered Application Strategy
**Validates:** Systems of Record, Differentiation, Innovation classified and change velocity understood
**Gap Detection:**
- All systems treated as same pace (undifferentiated)
- Innovation layer treated like SOR (too slow)
- SOR layer treated like Innovation (too risky)
- Change management approach not tailored to layer

### PB_207 - Cost-Benefit Analysis
**Validates:** Architecture alternatives compared financially
**Gap Detection:**
- Technical options presented without cost comparison
- Total cost of ownership not calculated
- Benefits quantified but not costs (or vice versa)
- Break-even analysis missing

---

## Exec Sponsor / Stakeholder Agent - All New (5/5)

**Note:** Agent type not in current 8-agent system. Maps to governance role + stakeholder management.

### PB_301 - Stakeholder Mapping (Power-Interest Grid)
**Validates:** Key stakeholders mapped by power and interest
**Gap Detection:**
- Stakeholders identified but not classified (power/interest unknown)
- No engagement strategy per stakeholder type
- Champions/blockers not identified
- Decision-makers not mapped

### PB_302 - Influence Model
**Validates:** Influence strategies documented per stakeholder
**Gap Detection:**
- Stakeholder engagement is transactional (no influence strategy)
- Behavior change approach not documented
- Resistance not anticipated or addressed
- Influence tactics not tailored to stakeholder type

### PB_303 - RACI Matrix
**Validates:** Roles clear for key activities (Responsible, Accountable, Consulted, Informed)
**Gap Detection:**
- Role ambiguity for critical activities
- No one accountable (multiple Rs, no A)
- Everyone consulted (decision paralysis)
- RACI conflicts (two As for same activity)

### PB_304 - McKinsey 5 Frames of Performance
**Validates:** Aspiration, Assessment, Architecture, Action, Advance assessed
**Gap Detection:**
- Goals set but no baseline assessment
- Strategy defined but no architecture for execution
- Plans exist but no action timeline
- Initiatives launched but no progress tracking

### PB_305 - Results Delivery Framework
**Validates:** Post-meeting follow-up tracked and executed
**Gap Detection:**
- Meeting action items not captured
- Commitments made but not tracked
- Follow-ups overdue
- Results not measured against commitments

---

## Transformation / Governance / Control Tower Agent - All New (5/5)

**Note:** Maps to Delivery Agent + governance role from the governance model.

### PB_401 - Kotter's 8-Step Change Model (Refactor)
**Validates:** Urgency, coalition, vision, communication, empowerment, short-term wins, consolidation, anchoring
**Gap Detection:**
- Change initiative without urgency created
- No guiding coalition identified
- Vision exists but not communicated broadly
- Obstacles not removed
- Short-term wins not planned
- Change not anchored in culture

### PB_402 - Three Lines of Defense
**Validates:** Governance structure for security/risk/compliance (Operational, Oversight, Assurance)
**Gap Detection:**
- No first line (operational risk management)
- No second line (risk oversight function)
- No third line (independent assurance)
- Lines of defense overlap or have gaps

### PB_403 - Operating Model Canvas
**Validates:** Strategy-to-execution link documented (Value proposition, processes, capabilities, organization, technology)
**Gap Detection:**
- Strategy defined but no operating model
- Processes not aligned with value proposition
- Capability gaps not identified
- Organization structure misaligned with strategy

### PB_404 - OKR Framework
**Validates:** Objectives and Key Results defined, tracked, and reviewed
**Gap Detection:**
- Objectives vague (not ambitious and qualitative)
- Key Results not measurable (no metrics)
- OKRs not tracked (set and forget)
- No quarterly review cadence

### PB_405 - Transformation Office Model
**Validates:** Program-level governance exists (PMO, steering committee, workstream leads)
**Gap Detection:**
- Transformation without governance structure
- No program manager or PMO
- Workstreams not coordinated
- No steering committee for escalations
- Status reporting ad hoc

---

## Additional Validation Playbooks Created (6 - Keep)

These were created as generative but should be refactored to validation mode:

1. **PB_101** - TOGAF ADR (SA Agent) - Refactor to validation
2. **PB_301_old** - Value Engineering (AE Agent) - Refactor to validation
3. **PB_401_old** - Customer Health Score (CA Agent) - Refactor to validation
4. **PB_701** - Porter's Five Forces (CI Agent) - Refactor to validation

---

## Creation Priority

### Phase 1 - Complete AE Agent (Immediate)
1. PB_004 - Porter's Generic Strategies
2. PB_005 - Value Proposition Canvas
3. PB_006 - Elements of Value Pyramid
4. PB_007 - Power Curve
5. PB_008 - Blue Ocean Strategy

### Phase 2 - Complete SA Agent (High Priority)
1. PB_202 - PESTLE Analysis
2. PB_203 - Decision Tree Analysis
3. PB_204 - Risk Heat Map
4. PB_205 - McKinsey 7S Framework
5. PB_206 - Pace-Layered Application Strategy
6. PB_207 - Cost-Benefit Analysis

### Phase 3 - Create Exec Sponsor Agent + Playbooks (New Agent)
1. Create agent configuration
2. Create agent personality
3. PB_301 - Stakeholder Mapping
4. PB_302 - Influence Model
5. PB_303 - RACI Matrix
6. PB_304 - McKinsey 5 Frames
7. PB_305 - Results Delivery Framework

### Phase 4 - Create Transformation Agent + Playbooks (New Role)
1. Extend Delivery Agent with governance role
2. PB_401 - Kotter's 8-Step
3. PB_402 - Three Lines of Defense
4. PB_403 - Operating Model Canvas
5. PB_404 - OKR Framework
6. PB_405 - Transformation Office Model

### Phase 5 - Refactor Existing Generative Playbooks
1. PB_001 - Three Horizons → Validation
2. PB_201 - SWOT → Validation
3. PB_101 - TOGAF ADR → Validation
4. PB_301_old - Value Engineering → Validation
5. PB_401_old - Customer Health Score → Validation
6. PB_701 - Five Forces → Validation

---

## Implementation Approach

Each validation playbook follows this structure:

```yaml
framework_name: "Framework Name"
playbook_mode: "VALIDATION"  # Not generative
intended_agent_role: "Agent Name"

validation_criteria:
  # What to check for existence/completeness

gap_detection:
  # What warnings to generate when gaps detected

validation_inputs:
  # Where to look for data to validate

validation_outputs:
  # Gap reports, not generated artifacts

framework_reference:
  # Quick reference for humans reviewing gaps
```

---

**Status:** Foundation established, 3/25 complete, need to create remaining 22 validation playbooks and refactor 6 generative playbooks.
