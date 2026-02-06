---
date: 2026-01-18
type: external_meeting
meeting_type: discovery
attendees:
  - name: Bill Lumbergh
    role: VP Technology
    company: Initech
  - name: Peter Gibbons
    role: Platform Engineering Lead
    company: Initech
  - name: Samir Nagheenanajar
    role: Senior Developer
    company: Initech
  - name: Maria Garcia
    role: Account Executive
    company: "TechVendor Inc"
  - name: Alex Thompson
    role: Solutions Architect
    company: "TechVendor Inc"
tags:
  - client/INITECH
  - person/bill_lumbergh
  - person/peter_gibbons
  - person/samir_nagheenanajar
  - tech/mongodb
  - tech/data-platform
  - tech/postgres
  - competitor/algolia
  - stage/discovery
---

# Initech Discovery Call - Enterprise Search Platform

## Summary

Initial discovery with Initech, a mid-market financial services software company. They're building a new enterprise search capability for their SaaS platform. Currently evaluating our platform vs Algolia. Peter Gibbons is the technical champion; Bill Lumbergh is the budget holder.

## Business Context

Initech provides HR software to mid-market companies. They have 2,000 customers and are growing 40% YoY. Their current platform lacks robust search capabilities, which is their #1 customer complaint.

Bill explained the business driver: "Our customers can't find anything in our platform. We're losing deals because competitors have better search. This is a board-level priority for 2026."

**Budget**: $100-150K ARR allocated for search solution
**Timeline**: Need solution in production by Q2 2026
**Decision**: Target decision by February 28th

## Technical Requirements

Peter walked through their needs:

1. **Document Search**: Search across 50M+ documents (PDFs, Word, text)
2. **Structured Data**: 500M employee records across customers
3. **Multi-tenancy**: Strict data isolation per customer
4. **Real-time**: Index updates within 30 seconds
5. **Relevance**: "Google-like" search experience
6. **Scale**: Support 10x growth over 3 years

Current tech stack:
- Application: Node.js microservices
- Database: PostgreSQL + MongoDB
- Infrastructure: AWS EKS
- Current search: PostgreSQL full-text (poor performance)

Samir asked about vector search: "We're interested in semantic search for the future. Can your platform handle that?"

Alex explained the semantic model and vector search capabilities. Samir was impressed.

## Competitive Landscape

Peter disclosed they're also evaluating Algolia:
- Met with Algolia last week
- Like their ease of use
- Concerned about cost at scale
- "Algolia seemed expensive for our data volume"

Bill mentioned a third option: "We could also build something ourselves with OpenSearch, but I'd rather not maintain search infrastructure."

**Competitive Position:**
- Algolia: Strong ease of use, weak on cost at scale
- OpenSearch: Free, but operational burden
- Our platform: Need to prove ease of use, win on TCO

## Technical Discussion

Alex presented our search capabilities:

**DECISION**: Initech wants to see a POC with their actual data to validate:
1. Ingestion performance for their document types
2. Search relevance quality
3. Multi-tenant architecture pattern
4. Vector search for future use cases

Peter's concern: "We have a small team. We can't spend 6 months learning a new platform. How quickly can we be productive?"

Alex proposed cloud deployment with App Search as starting point, with option to grow into the full platform for advanced use cases.

## Multi-Tenancy Discussion

Critical requirement - strict data isolation. Peter asked about implementation options.

Alex presented three patterns:
1. **Index per tenant** - Simple but doesn't scale
2. **Alias per tenant** - Good balance
3. **Document-level security** - Most efficient at scale

**DECISION**: Will prototype alias-per-tenant pattern during POC.

## Actions

- [ ] Alex: Prepare POC proposal with success criteria by Jan 20
- [ ] Peter: Provide sample document set (10K docs) by Jan 22
- [ ] Maria: Send pricing for 3-year terms by Jan 20
- [ ] Samir: Document vector search use cases by Jan 22

## Risks Identified

- **Team capacity** - Small team, limited bandwidth for POC
- **Algolia momentum** - They liked the Algolia demo
- **Timeline pressure** - Q2 go-live is aggressive
- **Technical complexity** - Multi-tenancy at scale is non-trivial

## Next Steps

POC proposal review call scheduled for January 22nd. Targeting POC kickoff January 27th if approved.
