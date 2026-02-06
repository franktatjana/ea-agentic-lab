---
date: 2026-01-10
author: Tom Rodriguez
source: observation
tags:
  - client/ACME_CORP
  - signal/champion_engagement
  - signal/technical_validation
  - person/jennifer_liu
---

# ACME Field Notes - Jan 10

## Champion Development

Had a sidebar call with Jennifer Liu today. She's genuinely excited about the platform evaluation. Key insights:

- She used the search platform at her previous company (FinTech startup) and loved it
- Frustrated with LegacySIEM's licensing model and vendor lock-in
- Already started researching the query language on her own time
- Concerned about pushback from analysts who are comfortable with SPL

**Opportunity**: Jennifer could become a strong internal advocate. Should invest time in enabling her to sell internally.

## Technical Intelligence

Jennifer shared some details about their environment I didn't get in the formal meeting:

- They're actually ingesting 650GB/day, not 500GB (growth happened faster than expected)
- Have 3 LegacySIEM admins who do nothing but maintain the platform
- Last month had a 4-hour outage due to LegacySIEM licensing issues
- Their Kafka setup is held together with "duct tape and prayers" (her words)

**Insight**: The ops burden is higher than initially understood. This strengthens our cloud-managed value prop.

## Competitive Signal

Jennifer mentioned that a LegacySIEM rep called Marcus yesterday offering "whatever it takes" to keep the account. She said Marcus was annoyed by the desperation and it actually made him more interested in evaluating alternatives.

**Action needed**: We should accelerate the POC timeline if possible. LegacySIEM is going to get aggressive.

## Relationship Map Update

Based on today's conversations:

- **Sarah Chen (CTO)**: Executive sponsor, wants strategic outcome
- **Marcus Weber (VP Eng)**: Decision maker, focused on cost and simplification
- **Jennifer Liu (Sec Eng Lead)**: Technical champion, platform advocate
- **David Kim (Sr Analyst)**: Key user, skeptical but open-minded
- **Unknown**: CFO involvement needed for final approval?

Need to understand CFO relationship and approval process.

## Next Actions

1. Send Jennifer some query language learning resources
2. Ask Lisa about CFO engagement strategy
3. Prepare "day in the life" demo for analyst team
