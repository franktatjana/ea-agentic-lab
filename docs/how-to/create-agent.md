# How to Create a New Agent

Step-by-step guide for creating a new agent in the EA Agentic Lab.

## Before You Start

Determine if you need a new agent or can extend an existing one:

| Need a New Agent If | Extend Existing If |
|---------------------|-------------------|
| Different team/role | Same role, new capability |
| Different data sources | Same sources, different analysis |
| Unique output requirements | Standard output formats work |
| Distinct escalation paths | Existing escalations apply |

## Agent Creation Steps

### Step 1: Create Directory Structure

```bash
cd ea-agentic-lab

# Create agent directory
mkdir -p domain/agents/{team_name}/agents
mkdir -p domain/agents/{team_name}/personalities
mkdir -p domain/agents/{team_name}/prompts
```

Example for a "Partner" agent:
```bash
mkdir -p domain/agents/partners/agents
mkdir -p domain/agents/partners/personalities
mkdir -p domain/agents/partners/prompts
```

### Step 2: Create Agent Configuration

Create `domain/agents/{team}/agents/{agent_name}_agent.yaml`:

```yaml
# Partner Agent Configuration
agent:
  name: Partner Agent
  version: "1.0"
  type: strategic
  team: partners
  description: |
    Coordinates partner ecosystem activities including
    referrals, co-selling, and technical partnerships.

# Capabilities this agent provides
capabilities:
  - partner_identification
  - referral_tracking
  - co_sell_coordination
  - partner_enablement

# What this agent processes
inputs:
  required:
    - meetings  # Meeting notes involving partners
  optional:
    - partner_registry  # Existing partner data
    - opportunities     # Active deals

# What this agent produces
outputs:
  artifacts:
    - partner_engagement_log
    - referral_tracker
    - partner_recommendations
  formats:
    - yaml
    - markdown

# Signal detection patterns
signal_detection:
  patterns:
    # Partner mentions
    - pattern: "(partner|referral|co-sell|alliance)"
      type: partner_signal
      priority: medium

    # Partner risk signals
    - pattern: "(partner concern|relationship issue|conflict)"
      type: partner_risk
      priority: high

    # Partner opportunity
    - pattern: "(partner opportunity|referral lead|joint deal)"
      type: partner_opportunity
      priority: high

# Escalation rules
escalation:
  triggers:
    - condition: "partner_risk.severity == 'high'"
      target: senior_manager
      sla_hours: 24

    - condition: "partner_opportunity.value > 100000"
      target: partner_manager
      sla_hours: 48

# Related playbooks
playbooks:
  primary:
    - PB_601_partner_engagement
  secondary:
    - PB_201_swot_analysis

# Interaction with other agents
collaborates_with:
  - ae_agent  # Commercial alignment
  - sa_agent  # Technical fit
  - delivery_agent  # Implementation coordination
```

### Step 3: Create Personality File

Create `domain/agents/{team}/personalities/{agent_name}_personality.yaml`:

```yaml
# Partner Agent Personality
personality:
  name: Partner Agent
  role: Partner Ecosystem Coordinator
  team: partners

  # Core identity
  identity: |
    I am the Partner Agent, responsible for maximizing
    value from our partner ecosystem. I track partner
    engagements, identify co-sell opportunities, and
    ensure partner relationships are healthy.

  # Clear scope boundaries
  what_i_do:
    - Track partner engagements and referrals
    - Identify co-sell opportunities
    - Monitor partner relationship health
    - Coordinate partner enablement activities
    - Flag partner conflicts or issues
    - Recommend partner involvement in deals

  what_i_do_not:
    - Make commercial decisions (AE Agent domain)
    - Design technical solutions (SA Agent domain)
    - Negotiate partner contracts
    - Override partner manager decisions
    - Create partner commitments without approval

  # Communication style
  communication_style:
    tone: collaborative, relationship-focused
    format: structured, actionable
    emphasis:
      - Partner value articulation
      - Mutual benefit identification
      - Relationship health indicators

  # Anti-hallucination safeguards
  anti_hallucination:
    strict_rules:
      - NEVER invent partner names not in source data
      - NEVER assume partner capabilities without evidence
      - NEVER create referral status without explicit mention
      - Always cite source for partner information

    verification:
      - Check partner name exists in registry or notes
      - Verify referral status from explicit statements
      - Confirm engagement dates from source

    uncertainty_handling:
      - Use "potential partner" when unconfirmed
      - Add [NEEDS VERIFICATION] for inferred info
      - Omit rather than guess partner details

  # Quality standards
  quality_standards:
    - Every partner mention must have source citation
    - Referrals require explicit evidence
    - Recommendations include rationale
    - Conflicts flagged immediately

  # Signal detection specifics
  signal_detection:
    partner_signals:
      keywords:
        - "partner", "alliance", "referral"
        - "co-sell", "joint", "ecosystem"
        - "reseller", "ISV", "SI"
      context_required: true

    risk_signals:
      keywords:
        - "partner conflict", "channel issue"
        - "relationship strained", "partner concern"
        - "competing deal", "overlap"
      escalate: true

  # Output specifications
  output_formats:
    partner_engagement:
      fields:
        - partner_name
        - engagement_type
        - status
        - next_action
        - owner
        - source

    referral_record:
      fields:
        - referral_id
        - partner_name
        - opportunity_name
        - value
        - status
        - created_date
```

### Step 4: Create Prompt Templates (Optional)

Create `domain/agents/{team}/prompts/tasks.yaml`:

```yaml
# Partner Agent Task Prompts
tasks:
  partner_identification:
    description: Identify partners mentioned in source data
    prompt: |
      Review the following content and identify any partner
      organizations mentioned. For each partner found:

      1. Extract the partner name exactly as written
      2. Note the context of the mention
      3. Identify the engagement type (referral, co-sell, technical)
      4. Flag any relationship concerns

      Content to analyze:
      {content}

      Output in YAML format:
      partners:
        - name: "Partner Name"
          mention_context: "Quote from source"
          engagement_type: referral|co_sell|technical|unknown
          concerns: []

  referral_tracking:
    description: Track referral opportunities
    prompt: |
      Analyze the content for referral activities.
      Look for:
      - New referral leads
      - Referral status updates
      - Referral conversions
      - Referral issues

      Content:
      {content}

      Output:
      referrals:
        - partner: "Partner Name"
          opportunity: "Deal Name"
          status: new|qualified|converted|lost
          value: amount
          notes: "Context"
```

### Step 5: Create Implementation (Python)

Create `application/src/agents/{team}/{agent_name}_impl.py`:

```python
"""
Partner Agent Implementation

Processes partner-related intelligence from meeting notes
and daily operations.
"""

from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path

from core.agent_framework.base_agent import BaseAgent


class PartnerAgent(BaseAgent):
    """
    Partner ecosystem coordination agent.

    Responsibilities:
    - Track partner engagements
    - Identify referral opportunities
    - Monitor partner relationship health
    """

    def __init__(self, config_path: Optional[Path] = None):
        super().__init__(
            agent_type="partner",
            config_path=config_path or Path("domain/agents/partners/agents/partner_agent.yaml")
        )

    def process(self, realm_id: str, node_id: str = "MAIN") -> Dict:
        """
        Process partner intelligence for a realm/node.

        Returns:
            Dict with partner_engagements, referrals, risks
        """
        results = {
            "partners_identified": [],
            "referrals": [],
            "partner_risks": [],
            "recommendations": [],
            "processed_at": datetime.now().isoformat()
        }

        # Load source data
        notes = self._load_meeting_notes(realm_id, node_id)

        # Process each note
        for note in notes:
            # Extract partner mentions
            partners = self._extract_partners(note)
            results["partners_identified"].extend(partners)

            # Extract referral signals
            referrals = self._extract_referrals(note)
            results["referrals"].extend(referrals)

            # Detect partner risks
            risks = self._detect_partner_risks(note)
            results["partner_risks"].extend(risks)

        # Generate recommendations
        results["recommendations"] = self._generate_recommendations(results)

        # Save outputs
        self._save_outputs(realm_id, node_id, results)

        return results

    def _extract_partners(self, note: Dict) -> List[Dict]:
        """Extract partner mentions from note."""
        partners = []

        content = note.get("content", "")
        patterns = self.config.get("signal_detection", {}).get("patterns", [])

        for pattern in patterns:
            if pattern.get("type") == "partner_signal":
                # Pattern matching logic here
                pass

        return partners

    def _extract_referrals(self, note: Dict) -> List[Dict]:
        """Extract referral information."""
        referrals = []
        # Implementation here
        return referrals

    def _detect_partner_risks(self, note: Dict) -> List[Dict]:
        """Detect partner relationship risks."""
        risks = []
        # Implementation here
        return risks

    def _generate_recommendations(self, results: Dict) -> List[Dict]:
        """Generate partner engagement recommendations."""
        recommendations = []

        # Example: Recommend engagement for new partners
        for partner in results["partners_identified"]:
            if partner.get("status") == "new":
                recommendations.append({
                    "action": f"Schedule introductory call with {partner['name']}",
                    "priority": "medium",
                    "owner": "partner_agent"
                })

        return recommendations
```

### Step 6: Create Runner Script

Create `application/scripts/run_partner_agent.py`:

```python
#!/usr/bin/env python3
"""
Partner Agent Runner

Usage:
    python run_partner_agent.py [--realm REALM] [--verbose]
"""

import argparse
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from agents.partners.partner_agent_impl import PartnerAgent


def main():
    parser = argparse.ArgumentParser(description="Run Partner Agent")
    parser.add_argument("--realm", help="Specific realm to process")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    args = parser.parse_args()

    agent = PartnerAgent()

    if args.realm:
        realms = [args.realm]
    else:
        # Get all realms from infohub
        infohub = Path("vault/infohub")
        realms = [d.name for d in infohub.iterdir() if d.is_dir()]

    for realm in realms:
        print(f"Processing {realm}...")
        results = agent.process(realm_id=realm)

        if args.verbose:
            print(f"  Partners found: {len(results['partners_identified'])}")
            print(f"  Referrals tracked: {len(results['referrals'])}")
            print(f"  Risks detected: {len(results['partner_risks'])}")


if __name__ == "__main__":
    main()
```

### Step 7: Add Tests

Create `application/tests/agents/test_partner_agent.py`:

```python
"""Tests for Partner Agent"""

import pytest
from pathlib import Path

from agents.partners.partner_agent_impl import PartnerAgent


class TestPartnerAgent:
    """Partner Agent test suite."""

    def test_agent_initialization(self):
        """Test agent initializes correctly."""
        agent = PartnerAgent()
        assert agent.agent_type == "partner"

    def test_partner_extraction(self):
        """Test partner mention extraction."""
        agent = PartnerAgent()

        note = {
            "content": "Discussed referral opportunity with PartnerAlpha. "
                      "They may have a joint deal at ACME.",
            "tags": ["partner/partneralpha"]
        }

        partners = agent._extract_partners(note)
        assert len(partners) >= 1

    def test_risk_detection(self):
        """Test partner risk detection."""
        agent = PartnerAgent()

        note = {
            "content": "Partner conflict brewing with PartnerBeta. "
                      "They're pursuing the same deal.",
            "tags": ["partner/partnerbeta", "signal/conflict"]
        }

        risks = agent._detect_partner_risks(note)
        assert len(risks) >= 1
```

### Step 8: Register Agent

Add to `domain/catalogs/agent_catalog.yaml`:

```yaml
agents:
  # ... existing agents ...

  partner_agent:
    name: Partner Agent
    type: strategic
    team: partners
    status: implemented
    config_path: domain/agents/partners/agents/partner_agent.yaml
    implementation: application/src/agents/partners/partner_agent_impl.py
```

## Validation Checklist

- [ ] Agent config YAML is valid
- [ ] Personality file defines scope clearly
- [ ] Anti-hallucination rules are comprehensive
- [ ] Signal patterns cover key scenarios
- [ ] Escalation rules are appropriate
- [ ] Implementation inherits from BaseAgent
- [ ] Tests cover core functionality
- [ ] Agent is registered in catalog

## Related Documentation

- [Agent Architecture](../agents/agent-architecture.md)
- [Agent Responsibilities](../agents/agent-responsibilities.md)
- [Base Agent Framework](../design/core-entities.md)
