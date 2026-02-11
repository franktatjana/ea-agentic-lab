---
title: "End-to-End Walkthrough by Role"
order: 2
description: "Persona-based walkthroughs showing how each role uses the system from first contact through renewal, using the ACME Corp security consolidation as a running example"
category: "guide"
keywords: ["walkthrough", "how-to", "persona", "AE", "SA", "CSM", "end-to-end", "getting-started"]
last_updated: "2026-02-11"
---

# End-to-End Walkthrough by Role

This guide walks you through the system from the perspective of each role. Every walkthrough uses the same deal, the ACME Corp security consolidation, so you can see how roles collaborate and hand off to each other throughout the engagement lifecycle.

If you want to understand why each component exists, read [Understanding the System](understanding-the-system.md). If you need day-to-day reference, see the [User Handbook](../HANDBOOK.md). This guide fills the gap between concept and daily practice: what does a full engagement actually look like from your desk?

---

## The Deal: ACME Corp Security Consolidation

ACME Corporation, a German industrial manufacturer, recently acquired Industrietechnik GmbH. The combined entity now runs two overlapping security stacks: our platform (used by ACME's original team) and LegacySIEM (championed by Industrietechnik's CISO, Klaus Hoffman). The goal is to consolidate onto a single platform. This is a competitive displacement deal in the security domain on a premium track.

**Key stakeholders:**
- Marcus Weber (CTO), executive sponsor, budget authority
- Dr. Sarah Chen (Head of Engineering), technical champion, existing platform advocate
- Klaus Hoffman (CISO, via acquisition), technical decision maker with veto power, LegacySIEM loyalist
- Stefan Muller (Security Operations Lead), day-to-day evaluator

This deal touches every role in the system: the AE owns the commercial relationship, the SA drives the technical evaluation, Domain Specialists validate security capabilities, the CSM takes over after signature, and Sales Leadership monitors portfolio risk.

---

## Account Executive Walkthrough

You are James Park, Sales Director covering the ACME account. Here is your journey from the first email to deal close.

### Day 0: The Email

You receive an email from Marcus Weber: "With the Industrietechnik acquisition complete, we need to unify our security tooling. Can we set up a call to discuss consolidation options?"

**What you do in the system:**

**Step 1: Create the engagement.** Open the platform and navigate to the ACME Corp realm. Create a new node called "Security Consolidation." The system prompts you to classify the engagement.

**Step 2: Classify.** Three dimensions:
- Archetype: **Competitive Displacement** (LegacySIEM is the incumbent)
- Domain: **Security**
- Track: **Premium** (strategic deal, high value, complex stakeholder dynamics)

The system selects the security consolidation blueprint automatically. This activates competitive analysis playbooks, sets weekly governance cadence, and assigns the CI Agent alongside your standard agent team.

**Step 3: Initialize stakeholders.** Add Marcus Weber as executive sponsor. The AE Agent creates a stakeholder record in the Internal InfoHub with fields for influence level, budget authority, sentiment, and engagement history. You add his LinkedIn profile and note his role as CTO with budget authority.

At this point the AE Agent begins monitoring: it watches for commercial risk signals, tracks deal health, and alerts you when action is needed.

### Week 1: Discovery Meeting

You run the initial discovery call with Marcus. He mentions:
- Budget is allocated for Q2, approximately $1.2M
- Klaus Hoffman (new CISO from Industrietechnik) has veto power
- LegacySIEM has 18 months remaining on contract
- The board wants consolidation done before year-end

**What happens in the system:**

After the meeting, you submit your notes. The Meeting Notes Agent processes them and extracts:
- Two decisions: evaluate both platforms in parallel, POC by end of February
- Three actions: schedule introduction with Klaus (you, 48h), prepare competitive analysis (CI Agent, 72h), draft POC scope (SA, 1 week)
- One risk: Klaus has veto power and strong LegacySIEM loyalty

The Task Shepherd validates each action has an owner and due date. The Risk Radar creates a risk register entry for the Klaus veto scenario. The CI Agent starts building the LegacySIEM competitive analysis.

**Your next move:** The AE Agent surfaces a prompt: "New critical stakeholder identified (Klaus Hoffman, CISO, veto power). Recommended: schedule 1:1 within 5 business days. Approach: Respect, Educate, Prove, Partner." You schedule the meeting and update the stakeholder record with engagement priority P0.

### Week 2: Stakeholder Mapping

You run PB_203 (Stakeholder Mapping). The playbook walks you through identifying all stakeholders, their influence level, decision authority, and sentiment. For each stakeholder, you document:

| Stakeholder | Role | Influence | Sentiment | Priority |
|-------------|------|-----------|-----------|----------|
| Marcus Weber | CTO | Budget authority | Supportive | P0 |
| Dr. Sarah Chen | Head of Engineering | Technical champion | Strong advocate | P1 |
| Klaus Hoffman | CISO | Veto power | Skeptical but open | P0 |
| Stefan Muller | SecOps Lead | Day-to-day evaluator | Neutral | P1 |

The playbook runs gap detection and flags: Klaus has no LinkedIn profile documented (LOW severity), no 1:1 meeting history yet (MEDIUM severity), and no documented success criteria from his perspective (HIGH severity).

**Your next move:** Address the gaps. The 1:1 with Klaus is already scheduled. During that meeting, you need to surface his personal success criteria (not just the project criteria).

### Weeks 3-6: Deal Progression

During this phase, you monitor while the SA drives the POC. Your system interactions:

**Weekly health checks:** The AE Agent calculates deal health based on stage progression, stakeholder engagement frequency, risk count, and competitive positioning. You receive a weekly summary: "ACME Security Consolidation: Health YELLOW. Reason: Klaus engagement below threshold (1 interaction in 14 days, premium track expects 2/week)."

**Competitive monitoring:** The CI Agent delivers a battlecard after analyzing LegacySIEM's position. You see their strengths (established relationship, OT/ICS coverage), weaknesses (high cost per GB, limited cloud capabilities), and your counter-positioning. This lands in the Internal InfoHub, never visible to the customer.

**Value engineering:** Because the deal exceeds $100K, the VE Agent is triggered. It produces an ROI model: 30% TCO reduction ($450K/year), elimination of dual-licensing, unified dashboard reducing analyst context-switching by 40%. The financial model stays internal; a sanitized value summary goes to the External InfoHub for sharing with Marcus.

**Stakeholder engagement:** After each interaction with Klaus, you update his stakeholder record. His sentiment moves from "skeptical but open" to "cautiously interested" after the POC shows OT/ICS detection capabilities. The AE Agent tracks this progression.

### Week 7: Decision Support

The POC results are in. Your SA prepares the technical summary. Your job: build the business case for the executive sponsor.

**What you use:**
- **Value & Stakeholders Canvas**: auto-rendered from InfoHub data, shows the stakeholder landscape with value propositions tailored to each person
- **ROI model from VE Agent**: quantified business case with payback period (8 months)
- **Risk & Governance Canvas**: shows the active risks (Klaus conversion, LegacySIEM contract overlap) and mitigation status

You present these to Marcus. The External InfoHub has the customer-appropriate versions. Your internal preparation uses the full competitive analysis and stakeholder sentiment data from the Internal InfoHub.

### Week 8-10: Negotiation and Close

Deal negotiations begin. Because this deal exceeds $500K, the AE Agent escalates governance to the Senior Manager Agent. Your manager gets visibility into deal health, risk status, and forecast confidence without you writing a status report.

**At contract signature**, the system triggers the pre-sales to post-sales handoff:
- PB_175 (Post-Sales Handoff) creates the handoff checklist
- All InfoHub content is reviewed for completeness
- The Customer Success Plan is drafted from discovery and POC data
- An introductory call is scheduled between the CA/CSM and the customer

Your role shifts from owner to monitor. You stay engaged for expansion opportunities, but the CA now owns the customer relationship.

**What the system captured for you:** Every meeting note processed, every risk tracked, every stakeholder interaction logged, every competitive insight documented. If you leave the account tomorrow, your successor has the full picture.

---

## Solutions Architect Walkthrough

You are Alex Thompson, SA assigned to the ACME security consolidation. Your journey begins when the AE creates the engagement and you receive a notification.

### Week 1: Technical Qualification

The AE has set up the engagement. You receive a signal from the AE Agent: "New node created: ACME Security Consolidation. Archetype: Competitive Displacement. Domain: Security. Your role: technical lead."

**Step 1: Review context.** Open the node in the platform. The Context Canvas shows what the AE has captured: business context, stakeholders, competitive landscape. You see Klaus Hoffman is the technical decision maker with LegacySIEM expertise.

**Step 2: Run technical discovery.** You follow the SA Best Practices framework with five discovery dimensions:
- Current architecture (what they have today)
- Integration requirements (what connects to what)
- Scale requirements (20 plants, growing)
- Compliance requirements (German manufacturing regulations)
- Migration complexity (18 months of LegacySIEM data)

You capture findings in the External InfoHub under `opportunities/security_poc/discovery.yaml`. Customer-appropriate findings live here. Your internal assessment of migration risks goes to the Internal InfoHub.

### Week 2: POC Design

Based on discovery, you design the POC. You run PB_150 (Scope POC) which walks you through:

**Success criteria definition** (SMART format):
- Detect 95% of OT/ICS attack patterns from the MITRE ICS framework within 48 hours of deployment
- Process 10TB/day of security telemetry with sub-5-second search latency
- Demonstrate unified dashboard covering both security and observability data
- Complete LegacySIEM rule migration for top 50 detection rules within 2 weeks

These criteria go to the External InfoHub (`opportunities/security_poc/success_criteria.yaml`) because the customer needs to agree on them.

**POC execution plan:**
- Week 1: Environment setup and data onboarding
- Week 2: Detection rule migration and testing
- Week 3: Scale testing and OT/ICS scenarios
- Week 4: Results documentation and presentation

The plan goes to `opportunities/security_poc/poc_success_plan.yaml` in the External InfoHub.

**Your internal assessment** (Internal InfoHub): "High confidence on criteria 1-3. Criterion 4 (rule migration) is the risk area. LegacySIEM uses proprietary query language. Estimate 60% automated translation, 40% manual rewrite. Need Specialist input on OT/ICS detection coverage."

### Week 2: Request Specialist Support

You need domain expertise for OT/ICS security evaluation. The SA Agent sends a signal to the Security Specialist Agent. A security domain specialist is assigned to your engagement.

The specialist runs the security evaluation checklist from `domain/playbooks/specialists/security/checklists/`. They assess detection coverage, compliance mapping, and OT/ICS-specific capabilities. Their findings enrich both the External InfoHub (customer-appropriate evaluation results) and the Internal InfoHub (candid gap analysis).

### Weeks 3-6: POC Execution

During the POC, you run weekly checkpoints using PB_152 (Execute Checkpoint).

**Each checkpoint produces:**
- Status update (`poc_status/status_2026-01-23.yaml`) in the External InfoHub
- Technical decisions captured as ADRs in `architecture/`
- Risks identified during testing logged to the Internal InfoHub

**Architecture decisions** are critical. When you decide to use our agent-based collection instead of syslog forwarding for OT devices, you create ADR_001:

```
Decision: Agent-based collection for OT/ICS devices
Context: Syslog forwarding from OT devices introduces network topology changes
         that plant operations teams will resist
Status: Accepted
Consequences: Higher initial deployment effort, but no network changes required
```

This ADR goes to the External InfoHub (`architecture/ADR_001_security_platform.md`) because it documents the solution approach the customer is adopting.

**What the SA Agent does for you:**
- Monitors technical risk signals from checkpoint notes
- Tracks ADR count and flags if architectural decisions are accumulating without resolution
- Alerts you if a checkpoint is overdue
- Sends a signal to the AE Agent if a technical risk could impact deal health

### Week 6: Results Documentation

POC complete. You run PB_154 (Document Results) which produces:
- Results summary against each success criterion (pass/partial/fail)
- Performance data with evidence
- Architecture recommendation
- Migration assessment with timeline and effort estimate

The results summary goes to the External InfoHub. Your migration risk assessment (including the "40% manual rewrite" detail for LegacySIEM rules) goes to both hubs: a sanitized version externally, the full analysis internally.

### Handoff Preparation

As the deal moves toward close, you prepare for the pre-sales to post-sales handoff:
- All ADRs are complete and reviewed
- Technical risks are documented with mitigation plans
- The solution architecture is captured in the External InfoHub
- Open technical items have owners and timelines

The SA Agent generates a technical handoff summary. The CA (Customer Architect) who takes over post-sales receives your full technical context without a 30-minute "brain dump" call being the only knowledge transfer.

---

## Domain Specialist Walkthrough

You are a Security Domain Specialist brought into the ACME engagement to validate security-specific capabilities.

### Engagement Entry

You receive a signal: "Specialist support requested for ACME Security Consolidation. Domain: Security. Focus: OT/ICS detection capabilities and LegacySIEM migration assessment."

**Step 1: Review context.** Open the node. Read the discovery findings and POC success criteria. Understand what needs to be validated.

**Step 2: Run domain evaluation.** You work through the security evaluation checklist at `domain/playbooks/specialists/security/checklists/`. This is a structured assessment covering:

- Detection coverage: MITRE ATT&CK and ICS framework mapping
- Compliance: German KRITIS regulations, ISO 27001 controls
- Integration: SOAR platform compatibility, ticketing system integration
- Migration: LegacySIEM rule translation feasibility
- Scale: Multi-site deployment architecture for 20 plants

For each area, you document findings with evidence, gaps, and recommendations.

### Evaluation Output

Your assessment produces two outputs:

**External InfoHub** (customer-shareable): "Security capabilities assessment: 94% MITRE ATT&CK coverage, OT/ICS detection verified across 3 protocol families, compliance mapping complete for KRITIS and ISO 27001."

**Internal InfoHub** (vendor-only): "Gap identified in OPC-UA protocol monitoring. Workaround exists using custom ingest pipeline but adds 2 weeks to deployment. Recommend product team prioritize native OPC-UA support. LegacySIEM migration: automated translation covers ~60% of rules. Remaining 40% require manual rewrite, estimated 3 weeks of specialist time."

### Cross-Pollination

After the engagement, your findings are anonymized and contributed to the Global Knowledge Vault. The OPC-UA gap and the LegacySIEM migration estimates become reusable patterns. The next security specialist working on a similar deal benefits from your experience without starting from scratch.

---

## Customer Success Manager Walkthrough

You are the CSM assigned to ACME Corp after the security consolidation deal closes. Your journey begins at contract signature.

### Day 0: Handoff

The deal is signed. PB_175 (Post-Sales Handoff) triggers automatically.

**What you receive:**
- Full External InfoHub with solution architecture, ADRs, POC results, and value metrics
- Internal InfoHub with stakeholder mapping (including sentiment history), competitive intelligence, risk register, and candid assessments
- Customer Success Plan draft, pre-populated from discovery and POC data
- First 90-day execution plan with milestones

**Step 1: Review the handoff.** Open the node and read the Context Canvas for a one-page summary. Then read the stakeholder profiles. You learn that Klaus Hoffman started skeptical but became cautiously supportive after the POC. His priorities: no disruption to security operations, clear migration path, team enablement plan.

**Step 2: Schedule introductory call.** The system has already suggested this. You reach out to Marcus Weber and Klaus Hoffman for a kickoff meeting within the first week.

### Week 1: Onboarding

You run PB_167 (Onboard Customer). The playbook walks you through:

- Confirm customer contacts and escalation paths
- Validate the success plan with the customer (they should agree on outcomes, not just deliverables)
- Set engagement cadence: weekly technical check-ins with Stefan Muller, biweekly business reviews with Marcus, monthly executive touchpoints

The CA Agent begins monitoring customer health. It tracks product usage, support cases, and engagement frequency.

### Month 1: Success Plan

You run PB_402 (Customer Success Plan) to formalize the post-sales roadmap:

**Stage adoption targets:**
- Foundation (weeks 1-2): Core log ingestion, basic dashboards, initial alert rules
- Operational (weeks 4-6): Detection rules migrated from LegacySIEM, SOC workflows active, alert triage process defined
- Advanced (weeks 8-12): SOAR integration, custom detections for OT/ICS, cross-site correlation
- Optimized (months 4-6): Full platform consolidation, LegacySIEM decommissioned, reference customer potential

Each stage has measurable criteria. The CA Agent tracks progress against these milestones and alerts you when a stage is at risk of slipping.

### Month 2: Health Monitoring

PB_401 (Customer Health Score) runs on its monthly cycle. The health score formula:

- Product Usage (40%): daily active users, data volume ingested, feature adoption breadth
- Relationship Quality (30%): executive sponsor engagement, champion strength, meeting cadence adherence
- Support Health (15%): case volume trend, resolution time, escalation frequency
- Business Outcomes (15%): objectives achieved vs. plan, ROI tracking, expansion interest signals

**This month's score: 72 (GREEN).** Product usage is ramping. Relationship is strong. One concern: Stefan's team is filing more support cases than expected on detection rule migration.

**What you do:** The CA Agent flags the support trend and recommends a training session focused on detection rule authoring. You schedule it and update the success plan.

### Month 4: Intervention Scenario

Health score drops to 58 (YELLOW). The CA Agent alerts: "Health declining. Primary driver: product usage dropped 30% week-over-week. Secondary: no executive touchpoint in 45 days."

**What the system does:**
- PB_173 (Success Intervention) triggers automatically
- Engagement cadence increases by 1.5x (from biweekly to weekly business reviews)
- The CA Agent recommends specific actions: re-engage Marcus Weber, investigate usage drop, assess if the migration timeline is slipping

**What you do:** You discover that Stefan's team hit a wall with OT/ICS detection customization. They reverted to LegacySIEM for OT monitoring, splitting their workflow again. You pull in the SA and Security Specialist for a technical rescue session. They resolve the detection gap within a week. Usage recovers.

**What gets recorded:** The intervention, root cause, resolution, and timeline are captured in the Internal InfoHub. This pattern (OT/ICS detection gap causing partial reversion) is flagged for the Global Knowledge Vault so future CSMs can watch for it.

### Month 8: Value Realization and Expansion

Health score is stable at 78 (GREEN). The value tracker shows:
- 28% TCO reduction (target was 30%, tracking well)
- 3 analysts freed from dual-platform context switching
- Compliance audit passed with unified reporting
- LegacySIEM contract not renewed, saving $450K/year

**Expansion signal detected:** Marcus mentions in a QBR that the observability team is interested in unifying their monitoring stack too. The CA Agent sends a signal to the AE Agent: "Expansion opportunity identified. Domain: Observability. Estimated ARR uplift."

The AE re-engages for the expansion opportunity. A new node is created under the ACME realm for the observability initiative. The cycle begins again, but this time with a warm customer relationship and proven platform success.

### Pre-Renewal (T-90)

PB_303 (Renewal Protection) triggers at T-180 and enters its active phase at T-90. The system prepares:
- Value delivered summary (quantified outcomes vs. original business case)
- Health score trend over the contract period
- Stakeholder engagement history
- Expansion pipeline status

You compile a renewal recommendation. The AE takes ownership of the commercial negotiation. Your job: ensure the customer's success story is documented and the value case is clear.

---

## Sales Leadership Walkthrough

You are the regional VP overseeing the team that includes James Park (AE) and Alex Thompson (SA). Your interaction with the system is primarily through portfolio views, not individual deal execution.

### Portfolio Health

Your dashboard aggregates health scores across all active engagements in your region. You see:

| Account | Node | Health | Stage | Risk Count | Next Milestone |
|---------|------|--------|-------|------------|----------------|
| ACME Corp | Security Consolidation | GREEN (78) | Adoption | 2 low | QBR in 3 weeks |
| Globex | Observability POC | YELLOW (55) | POC Week 3 | 1 high | Checkpoint Friday |
| Initech | Search Modernization | GREEN (82) | Value Realization | 0 | Renewal T-120 |

You don't need to ask for status updates. The system aggregates deal health from agent assessments, stakeholder engagement data, and milestone tracking.

### Risk Pattern Detection

The system surfaces patterns across your portfolio:
- "3 of 5 premium-track deals have stakeholder engagement gaps in weeks 3-4 of POC execution. Consider adding a mandatory mid-POC executive touchpoint."
- "Competitive displacement deals in the security domain have a 40% higher risk of POC timeline slip when OT/ICS is in scope. Average slip: 1.5 weeks."

These patterns come from the Global Knowledge Vault, enriched by every completed engagement across the organization.

### Escalation Management

When the AE Agent escalates (deals above $500K, unusual discount requests, at-risk renewals), you receive a structured escalation with full context:
- What triggered the escalation
- Current deal health and trajectory
- Risk register summary
- Recommended actions
- Historical outcomes for similar situations

You make the decision with full information. No "can we hop on a quick call so I can explain the situation?"

### Governance Review

Using the [RACI model](../operating-model/raci-model.md), you review accountability across your team:
- Are all premium-track deals getting weekly health checks?
- Are escalation SLAs being met (24 hours for premium)?
- Which engagement archetypes produce the best win rates?
- Where are playbook adoption gaps (teams skipping stakeholder mapping or competitive analysis)?

The system tracks playbook execution, so you can see which frameworks are being applied consistently and which are being skipped.

---

## How the Roles Connect

The ACME deal is not five separate journeys. It is one engagement where roles hand off responsibility at defined trigger points.

```text
AE (James Park)
│
├─ Discovery & Qualification ──────────────────────┐
│  Creates engagement, classifies, maps stakeholders│
│                                                    │
│  ┌─ SA (Alex Thompson) ◄──────────────────────────┘
│  │  Technical discovery, POC design & execution
│  │
│  │  ┌─ Specialist ◄──────────────────────────────┐
│  │  │  Domain evaluation (security/OT/ICS)       │
│  │  │  Returns findings to SA                    │
│  │  └────────────────────────────────────────────┘
│  │
│  │  POC complete, results documented
│  └─ Technical handoff prepared ──────────────────┐
│                                                    │
├─ Negotiation & Close ────────────────────────────┐│
│  Builds business case, closes deal               ││
│                                                   ││
│  Contract signed ─────────────────────────────────┘│
│                                                    │
│  ┌─ CSM ◄─────────────────────────────────────────┘
│  │  Receives full context (no knowledge loss)
│  │  Onboarding → Adoption → Value Realization
│  │
│  │  Expansion signal detected ───────────────────┐
│  └───────────────────────────────────────────────┘│
│                                                    │
├─ Expansion opportunity ◄──────────────────────────┘
│  New node, cycle repeats
│
└─ Sales Leadership (VP)
   Monitors portfolio health across all of the above
   Receives escalations, reviews patterns, sets governance
```

**Critical handoff: Pre-Sales to Post-Sales.** This is where most organizations lose knowledge. In this system, the CSM does not receive a slide deck and a 30-minute call. They receive:
- Complete External InfoHub (customer-appropriate solution record)
- Complete Internal InfoHub (stakeholder sentiment, competitive context, risk history)
- Pre-populated Customer Success Plan
- Documented architecture decisions with rationale
- Value metrics baseline for tracking ROI delivery

The engagement's institutional memory transfers structurally, not through tribal knowledge.

---

## Quick Reference: Your First Actions by Role

| Role | Trigger | First 3 Actions |
|------|---------|-----------------|
| **AE** | Customer inquiry | 1. Create realm/node 2. Classify engagement 3. Map initial stakeholders |
| **SA** | Assignment to node | 1. Review Context Canvas 2. Run technical discovery 3. Design POC scope |
| **Specialist** | Support request | 1. Review discovery findings 2. Run domain evaluation checklist 3. Document findings (external + internal) |
| **CSM** | Contract signature | 1. Review handoff package 2. Schedule kickoff call 3. Validate success plan with customer |
| **Sales Leadership** | Portfolio review | 1. Check health dashboard 2. Review escalations 3. Analyze win/loss patterns |

---

## Related Documentation

- [User Handbook](../HANDBOOK.md): day-to-day reference for all roles
- [Understanding the System](understanding-the-system.md): why each component exists and how they connect
- [SA Best Practices](for-practitioners/sa-best-practices.md): detailed SA workflows and frameworks
- [POC Success Plan](for-practitioners/poc-success-plan.md): POC lifecycle and execution
- [Customer Success Plan](for-practitioners/customer-success-plan.md): CSP framework and agent integration
- [Business Value Consulting](for-practitioners/business-value-consulting.md): value engineering frameworks
- [Pre-Sales Governance](../operating-model/pre-sales-model.md): B-Level governance model
- [Post-Sales Governance](../operating-model/post-sales-model.md): C-Level governance model
- [RACI Model](../operating-model/raci-model.md): accountability matrix across all roles
- [Playbook Catalog](../reference/playbook-catalog.md): complete playbook library
- [ACME Demo](for-developers/run-demo.md): run the demo scenarios yourself
