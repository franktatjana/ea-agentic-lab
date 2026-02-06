---
date: 2026-01-20
author: Alex Thompson
source: observation
tags:
  - client/INITECH
  - signal/competitive_active
  - signal/technical_evaluation
  - competitor/algolia
  - person/peter_gibbons
---

# Initech Competitive Notes - Jan 20

## Algolia Evaluation Intel

Got some intel from Peter about their Algolia evaluation:

**What they liked:**
- Very fast to set up (had search working in hours)
- Clean dashboard and analytics
- Good documentation
- Instant search UI components

**What concerned them:**
- Pricing at their projected scale ($200K+/year)
- Limited customization of relevance
- No vector/semantic search yet
- Vendor lock-in with proprietary format

Peter: "Algolia is definitely easier to start with, but I'm worried about where we'll be in 2 years. We don't want to migrate again."

## Our Differentiation Strategy

Based on their concerns, our pitch should focus on:

1. **TCO at Scale**
   - Their 50M docs + 500M records = huge Algolia bill
   - Our estimate: $120K vs Algolia $220K at their projected scale
   - Savings: $100K/year = $300K over 3 years

2. **Future-Proofing**
   - Vector search built-in (Algolia doesn't have it)
   - Semantic model for search out of the box
   - Pathway to ML-powered relevance

3. **Flexibility**
   - Open APIs, not locked into proprietary format
   - Can customize everything
   - Multi-cloud options

## POC Success Criteria

Worked with Peter to define POC success criteria:

| Criteria | Metric | Target |
|----------|--------|--------|
| Ingestion Speed | Time to index 10K docs | < 5 minutes |
| Search Latency | P95 query response | < 100ms |
| Relevance | User satisfaction score | > 4/5 |
| Multi-tenancy | Data isolation validation | 100% isolation |
| Developer Experience | Time to first search | < 4 hours |

The "developer experience" metric is key - they want to match Algolia's ease of use.

## Technical Champion Development

Peter is warming up to our platform:
- He has prior experience with the platform stack from a previous job
- Interested in the observability story for their platform
- Sees long-term value in unified search + observability

**Opportunity**: If we win search, there's a follow-on observability opportunity worth $80-100K.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Algolia ease-of-use wins | Medium | High | Focus POC on App Search, quick time-to-value |
| Team bandwidth | High | Medium | Offer hands-on POC support |
| Q2 deadline missed | Low | High | Start POC ASAP, parallel workstreams |

## Stakeholder Notes

- **Bill Lumbergh** (VP Tech): Budget holder, wants low risk. Lean toward "safe" choice.
- **Peter Gibbons** (Platform Lead): Technical champion, pragmatic, focused on long-term
- **Samir** (Sr Dev): Excited about vector search, ML capabilities

Bill is the wild card - need to build his confidence in our platform as the safe choice.

## Actions for This Week

1. POC proposal sent - waiting for feedback
2. Schedule Bill Lumbergh 1:1 to address risk concerns
3. Prepare "getting started in 4 hours" demo
4. Research their specific document types for POC prep

## Competitive Response Plan

If Algolia offers aggressive discount:
- Match on first year only
- Emphasize 3-year TCO (we win)
- Offer extended POC with hands-on support
- Executive sponsorship from our side
