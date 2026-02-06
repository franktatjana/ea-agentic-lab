# Sample Data for EA Agentic Lab

Source data for demo scenarios. Use this to restore the InfoHub for demonstrations.

## Scenarios

| Realm | Scenario | Key Signals |
|-------|----------|-------------|
| **ACME_CORP** | Full lifecycle | Pre-sales won, now in adoption. Healthy account with expansion opportunity. |
| **GLOBEX** | At-risk account | Usage declining, champion departed, competitor circling. Renewal at risk. |
| **INITECH** | New opportunity | Fresh deal in technical evaluation. POC in progress, competitive. |

## Data Types

### Meeting Notes (`meetings/`)

External and internal meetings in markdown with YAML frontmatter.

**Format:**
```yaml
---
date: 2026-01-15
type: external_meeting | internal_sync | deal_review
attendees:
  - name: Person Name
    role: Title
    company: Company
tags:
  - client/REALM_NAME
  - person/firstname_lastname
  - tech/technology_name
  - competitor/competitor_name
---

# Meeting Title

## Summary
Brief summary of the meeting.

## Discussion
Meeting content with embedded signals...

## Actions
- [ ] Action item with owner and due date

## Decisions
- Decision made during the meeting

## Risks Identified
- Risk description
```

### Daily Operations (`daily-ops/`)

Field notes, observations, and daily intelligence from account teams.

**Format:**
```yaml
---
date: 2026-01-15
author: Team Member Name
source: slack | email | call | observation
tags:
  - client/REALM_NAME
  - signal/signal_type
---

# Daily Op Note

Content describing observations, conversations, or intelligence gathered.
```

## Demo Workflow

### 1. Reset InfoHub
```bash
rm -rf vault/infohub/ACME_CORP vault/infohub/GLOBEX vault/infohub/INITECH
```

### 2. Copy Sample Data
```bash
cp -r vault/sample-data/ACME_CORP vault/infohub/
cp -r vault/sample-data/GLOBEX vault/infohub/
cp -r vault/sample-data/INITECH vault/infohub/
```

### 3. Run Agents
```bash
# Process all realms
python application/scripts/run_sa_agent.py
python application/scripts/run_ca_agent.py
```

### 4. Review Outputs
Check `vault/infohub/{realm}/` for generated artifacts:
- `context/account_profile.md`
- `risks/risk_register.yaml`
- `decisions/decision_log.yaml`
- `actions/action_tracker.yaml`

## Signal Types for Testing

### Technical Signals (SA Agent)
- Architecture decisions
- Integration challenges
- Security concerns
- Performance issues
- Technical debt

### Commercial Signals (AE Agent)
- Budget discussions
- Timeline changes
- Stakeholder changes
- Competitive mentions
- Deal stage indicators

### Health Signals (CA Agent)
- Usage patterns
- Support tickets
- Adoption blockers
- Satisfaction feedback
- Churn indicators

### Competitive Signals (CI Agent)
- Competitor mentions
- Displacement threats
- Feature comparisons
- Pricing discussions

### Risk Categories
- `technical` - Architecture, integration, security
- `commercial` - Budget, timing, contract
- `relationship` - Champion, sponsor, stakeholder
- `competitive` - Displacement, feature gaps
- `timeline` - Delays, dependencies
- `resource` - Staffing, expertise
- `compliance` - Regulatory, audit

## Adding New Sample Data

1. Create markdown file in appropriate folder
2. Add YAML frontmatter with date, type, tags
3. Include natural language with embedded signals
4. Test with agents to verify signal detection
