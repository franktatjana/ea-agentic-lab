---
order: 7
---

# Customer Journey Mapping & Voice of Customer Adoption

Based on industry B2B customer experience best practices for enterprise software sales and customer success.

## Why Adopt This?

| Problem | Journey/VoC Solution |
|---------|---------------------|
| Customer experience is a black box | Visualized journey with touchpoints mapped |
| Feedback collected but not acted on | Structured VoC program with closed-loop process |
| Siloed view across pre/post-sales | Unified customer journey from prospect to advocate |
| Churn surprises | Early warning signals from journey analytics |
| No customer-centric culture | Data-driven customer insights inform decisions |

## Customer Journey Mapping

### What is a Customer Journey Map?

A **B2B Customer Journey Map** is a visual framework that documents the complete customer experience across all touchpoints, from initial awareness through advocacy. It organizes interactions into clear stages and helps identify opportunities for improvement.

### B2B Journey Characteristics

| Aspect | B2B Reality |
|--------|------------|
| Decision makers | 5-20 stakeholders per deal |
| Timeline | Months to years (vs B2C minutes/days) |
| Touchpoints | Average 13+ interactions before purchase |
| Complexity | Technical, commercial, and relationship factors |
| Post-sale | Ongoing value realization and expansion |

### Journey Stages

```yaml
customer_journey_stages:
  pre_sales:
    awareness:
      description: "Customer recognizes problem/opportunity"
      touchpoints:
        - "Content consumption (blog, webinar, analyst report)"
        - "Peer recommendation"
        - "Event/conference"
        - "Outbound contact"
      customer_questions:
        - "What problem am I trying to solve?"
        - "Who else has this problem?"
        - "What solutions exist?"

    consideration:
      description: "Customer actively evaluating options"
      touchpoints:
        - "Website visits"
        - "Demo requests"
        - "Technical discovery"
        - "Competitive research"
      customer_questions:
        - "Which solution fits my needs?"
        - "What are the trade-offs?"
        - "Who has done this before?"

    decision:
      description: "Customer making vendor selection"
      touchpoints:
        - "POV/POC"
        - "Proposal review"
        - "Executive presentations"
        - "Contract negotiation"
      customer_questions:
        - "Will this deliver promised value?"
        - "Can I trust this vendor?"
        - "What are the risks?"

  post_sales:
    onboarding:
      description: "Initial deployment and activation"
      touchpoints:
        - "Kickoff meeting"
        - "Implementation"
        - "Training"
        - "Go-live"
      customer_questions:
        - "How do I get started?"
        - "Who helps me succeed?"
        - "When will I see value?"

    adoption:
      description: "Growing usage and value realization"
      touchpoints:
        - "Health checks"
        - "QBRs"
        - "Support interactions"
        - "Feature discovery"
      customer_questions:
        - "Am I getting full value?"
        - "What else can I do?"
        - "How do I compare to peers?"

    expansion:
      description: "Growing relationship scope"
      touchpoints:
        - "Use case expansion"
        - "Department rollout"
        - "Upsell conversations"
      customer_questions:
        - "Where else can this help?"
        - "What's the ROI of expanding?"

    advocacy:
      description: "Customer becomes promoter"
      touchpoints:
        - "Reference calls"
        - "Case studies"
        - "Community participation"
        - "Referrals"
      customer_questions:
        - "How do I share my success?"
        - "What do I get for advocating?"
```

### Journey Mapping by Stakeholder

Different stakeholders have different journeys:

| Stakeholder | Primary Concerns | Key Touchpoints |
|-------------|-----------------|-----------------|
| **CTO/CIO** | Technical fit, architecture, roadmap | Discovery, architecture review, roadmap sessions |
| **CFO** | ROI, TCO, budget | Business case, QBRs, renewal reviews |
| **End Users** | Ease of use, training, support | Training, documentation, support tickets |
| **Security** | Compliance, risk | Security reviews, audits |
| **Procurement** | Terms, pricing, vendor risk | RFP, negotiation, vendor reviews |

---

## Voice of Customer (VoC) Program

### What is VoC?

**Voice of Customer** is a structured program for capturing, analyzing, and acting on customer feedback across all channels. The goal is to understand customer needs, expectations, and experiences to drive continuous improvement.

### VoC Framework: Listen → Analyze → Act

```yaml
voc_framework:
  listen:
    description: "Capture feedback from multiple channels"
    channels:
      quantitative:
        - type: "NPS (Net Promoter Score)"
          frequency: "Quarterly"
          question: "How likely are you to recommend us?"
          scale: "0-10"

        - type: "CSAT (Customer Satisfaction)"
          frequency: "After key interactions"
          question: "How satisfied were you with [interaction]?"
          scale: "1-5"

        - type: "CES (Customer Effort Score)"
          frequency: "After support/implementation"
          question: "How easy was it to [accomplish task]?"
          scale: "1-7"

      qualitative:
        - type: "Customer interviews"
          frequency: "Quarterly for strategic accounts"
          focus: "Deep dive on experience and needs"

        - type: "QBR feedback"
          frequency: "Quarterly"
          focus: "Relationship health and value"

        - type: "Support ticket analysis"
          frequency: "Continuous"
          focus: "Pain points and friction"

        - type: "Meeting feedback extraction"
          frequency: "After key meetings"
          focus: "Sentiment and concerns"

      behavioral:
        - type: "Usage analytics"
          frequency: "Continuous"
          focus: "Adoption patterns"

        - type: "Engagement signals"
          frequency: "Continuous"
          focus: "Health indicators"

        - type: "Support patterns"
          frequency: "Continuous"
          focus: "Issue trends"

  analyze:
    description: "Transform feedback into actionable insights"
    methods:
      - "Sentiment analysis on qualitative feedback"
      - "Trend analysis across time periods"
      - "Segmentation by account tier, use case, region"
      - "Root cause analysis on negative feedback"
      - "Correlation with churn/expansion signals"

    outputs:
      - "VoC dashboard with key metrics"
      - "Insight reports for leadership"
      - "Account-level sentiment tracking"
      - "Product feedback aggregation"

  act:
    description: "Close the loop and drive improvement"
    actions:
      immediate:
        - "Respond to detractors within 24-48 hours"
        - "Escalate critical issues"
        - "Thank promoters"

      tactical:
        - "Address top pain points"
        - "Improve low-scoring touchpoints"
        - "Share insights with relevant teams"

      strategic:
        - "Inform product roadmap"
        - "Adjust service delivery"
        - "Evolve engagement model"

    closing_the_loop:
      - "Acknowledge feedback received"
      - "Communicate actions taken"
      - "Follow up on resolution"
      - "Measure impact of changes"
```

### VoC Metrics

| Metric | Description | Target | Alert Threshold |
|--------|-------------|--------|-----------------|
| **NPS** | Net Promoter Score | >50 | <30 |
| **CSAT** | Customer Satisfaction | >4.0/5 | <3.5/5 |
| **CES** | Customer Effort Score | >5.5/7 | <4/7 |
| **Response Rate** | % of customers providing feedback | >30% | <15% |
| **Close Rate** | % of feedback with closed loop | >80% | <50% |
| **Time to Close** | Days from feedback to resolution | <7 days | >14 days |

---

## Agent Integration

### Ownership Model

| Agent | Journey/VoC Role |
|-------|-----------------|
| **SA Agent** | Pre-sales journey mapping, discovery touchpoints, technical experience |
| **CA Agent** | Post-sales journey ownership, VoC program management, health monitoring |
| **AE Agent** | Commercial touchpoints, relationship journey |
| **VE Agent** | Value realization tracking across journey |
| **Meeting Notes Agent** | Extract feedback and sentiment from meetings |
| **Nudger Agent** | Alert on VoC triggers (detractors, declining scores) |

### SA Agent Tasks (Pre-Sales)

- Map prospect journey from first touch
- Document stakeholder-specific journeys
- Capture buying committee dynamics
- Track touchpoint effectiveness
- Identify friction points in evaluation

### CA Agent Tasks (Post-Sales)

- Own ongoing customer journey map
- Manage VoC data collection
- Analyze feedback and sentiment
- Coordinate closed-loop actions
- Report on journey health
- Trigger interventions based on signals

---

## Integration with CSP

Customer Journey Mapping and VoC integrate into the Customer Success Plan lifecycle:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JOURNEY + VoC IN CSP LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STAGE 2-3         STAGE 4           ONBOARDING        ADOPTION              │
│  (Pre-Sales)       (Close)           (30-90 days)      (Ongoing)            │
│                                                                              │
│  ┌─────────┐      ┌─────────┐       ┌─────────┐      ┌─────────┐           │
│  │ Journey │      │ Journey │       │ Journey │      │ Journey │           │
│  │ Map     │      │ Handoff │       │ Track   │      │ Optimize│           │
│  │ Draft   │      │ to CA   │       │         │      │         │           │
│  └─────────┘      └─────────┘       └─────────┘      └─────────┘           │
│       │                │                 │                │                 │
│       ▼                ▼                 ▼                ▼                 │
│  Discovery        Close VoC         Onboarding       Continuous            │
│  feedback         baseline          survey           VoC program           │
│                                                                              │
│  CSP Sections:    CSP Sections:     CSP Sections:    CSP Sections:         │
│  - Stakeholders   - Journey Map     - Journey        - VoC Metrics         │
│  - Current state  - VoC Baseline    - VoC Tracking   - Journey Health      │
│  - Discovery      - Sentiment       - Feedback       - Improvements        │
│    insights                                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## InfoHub Storage

```text
infohub/{account}/
├── journey/
│   ├── customer_journey_map.yaml      # Master journey map
│   ├── stakeholder_journeys/          # Per-stakeholder views
│   │   ├── cto_journey.yaml
│   │   └── users_journey.yaml
│   └── touchpoint_log.yaml            # Interaction history
│
├── voc/
│   ├── voc_tracker.yaml               # Master VoC tracking
│   ├── surveys/                       # Survey responses
│   │   ├── nps_q1_2026.yaml
│   │   └── csat_onboarding.yaml
│   ├── feedback/                      # Qualitative feedback
│   │   ├── interview_2026-01-15.md
│   │   └── qbr_feedback_q4.yaml
│   └── actions/                       # Closed-loop tracking
│       └── action_log.yaml
```

---

## Implementation Checklist

- [ ] Create customer journey map template
- [ ] Add journey mapping tasks to SA Agent
- [ ] Add journey/VoC tasks to CA Agent
- [ ] Extend CSP template with journey and VoC sections
- [ ] Configure VoC triggers for Nudger Agent
- [ ] Add journey health to Reporter dashboards
- [ ] Create VoC data collection workflows
- [ ] Train Meeting Notes Agent on feedback extraction

---

## Sources

- [B2B Customer Journey Mapping Guide](https://www.coveo.com/blog/b2b-customer-journey-map/)
- [B2B Customer Journey Optimization 2025](https://www.linkgraph.com/blog/customer-journey-in-b2b/)
- [Voice of Customer Program Guide](https://www.nextiva.com/blog/voice-of-customer-programs.html)
- [VoC Methodologies](https://blog.hubspot.com/service/voice-of-the-customer-methodologies)
- [Building VoC Programs](https://www.enterpret.com/blog/the-ultimate-guide-to-building-a-voice-of-customer-program)
- Industry enterprise customer success best practices
