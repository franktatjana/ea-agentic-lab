#!/usr/bin/env python3
"""
Runner script for CA Agent
Processes customer touchpoints and generates architecture/adoption insights
"""

import sys
from pathlib import Path
from datetime import datetime

# Add application/src to path
APPLICATION_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(APPLICATION_ROOT / "src"))

from core.config.paths import (
    EXAMPLE_REALM,
    ensure_directories,
    get_agent_output_dir
)
from core.tools.markdown_tools import (
    read_markdown_files_recursive,
    write_markdown_file
)
from agents.customer_architects.ca_agent_impl import CAAgent


def generate_customer_profile_md(customer_id: str, profile_data: dict) -> str:
    """Generate markdown content for a customer profile."""
    md = f"# Customer Profile: {customer_id.upper()}\n\n"

    md += "## Architecture Summary\n\n"
    arch = profile_data.get('architecture_summary', {})
    if arch.get('infrastructure'):
        md += "### Infrastructure\n"
        for infra in arch['infrastructure']:
            md += f"- **{infra.get('category', 'unknown')}**: {infra.get('value', 'N/A')}\n"
        md += "\n"

    if arch.get('integrations'):
        md += "### Integrations\n"
        for integration in arch['integrations']:
            md += f"- {integration}\n"
        md += "\n"

    if arch.get('recent_changes'):
        md += "### Recent Architecture Changes\n"
        for change in arch['recent_changes']:
            md += f"- {change.get('content', 'N/A')} ({change.get('date', 'unknown date')})\n"
        md += "\n"

    md += "## Adoption Health\n\n"
    adoption = profile_data.get('adoption', {})
    md += f"- **Level**: {adoption.get('level', 'Unknown')}\n"
    md += f"- **Trend**: {adoption.get('trend', 'Unknown')}\n"

    if adoption.get('blockers'):
        md += "\n### Adoption Blockers\n"
        for blocker in adoption['blockers']:
            md += f"- {blocker.get('description', 'N/A')}\n"

    md += "\n## Customer Health\n\n"
    health = profile_data.get('health', {})
    if health.get('nps_score') is not None:
        md += f"- **NPS Score**: {health['nps_score']}\n"
    if health.get('avg_csat') is not None:
        md += f"- **Avg CSAT**: {health['avg_csat']:.1f}\n"
    md += f"- **Sentiment**: {health.get('sentiment', 'Unknown')}\n"

    md += "\n## Key Stakeholders\n\n"
    for stakeholder in profile_data.get('stakeholders', []):
        md += f"- {stakeholder}\n"

    return md


def generate_adoption_dashboard_md(dashboard_data: dict) -> str:
    """Generate markdown content for adoption dashboard."""
    md = "# Customer Adoption Dashboard\n\n"
    md += f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"

    md += "## Adoption Overview\n\n"
    md += "| Level | Count |\n"
    md += "|-------|-------|\n"
    md += f"| High Adoption | {dashboard_data.get('high_adoption', 0)} |\n"
    md += f"| Medium Adoption | {dashboard_data.get('medium_adoption', 0)} |\n"
    md += f"| Low Adoption | {dashboard_data.get('low_adoption', 0)} |\n"
    md += f"| At Risk | {dashboard_data.get('at_risk', 0)} |\n"
    md += "\n"

    md += f"**Total Blockers Identified**: {dashboard_data.get('total_blockers', 0)}\n\n"

    if dashboard_data.get('trending_down'):
        md += "## Customers Trending Down\n\n"
        for customer in dashboard_data['trending_down']:
            md += f"- [[{customer.upper()}_Profile|{customer.upper()}]]\n"
        md += "\n"

    return md


def generate_integration_risk_md(risks: list) -> str:
    """Generate markdown content for integration risk register."""
    md = "# Integration Risk Register\n\n"
    md += f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"

    if not risks:
        md += "*No integration risks identified.*\n"
        return md

    # Group by customer
    from collections import defaultdict
    by_customer = defaultdict(list)
    for risk in risks:
        by_customer[risk.get('customer_id', 'unknown')].append(risk)

    for customer_id, customer_risks in sorted(by_customer.items()):
        md += f"## {customer_id.upper()}\n\n"
        for risk in customer_risks:
            severity = risk.get('severity', 'MEDIUM')
            md += f"### [{severity}] {risk.get('content', 'Unknown risk')}\n\n"
            md += f"- **Source**: {risk.get('source', 'Unknown')}\n"
            if risk.get('date'):
                md += f"- **Date**: {risk['date']}\n"
            md += "\n"

    return md


def main():
    print("=" * 60)
    print("EA Agentic Lab - CA Agent Runner")
    print("=" * 60)
    print()

    # Ensure directories exist
    print("Setting up directories...")
    ensure_directories()
    print()

    # Initialize CA Agent
    print("Initializing CA Agent...")
    config_path = APPLICATION_ROOT.parent / "domain" / "agents" / "customer_architects" / "agents" / "ca_agent.yaml"
    agent = CAAgent(config_path)
    print(f"✓ {agent.agent_id} initialized")
    print(f"  Purpose: {agent.config.purpose}")
    print(f"  Team: {agent.config.team}")
    print()

    # Read meeting notes from example realm
    meetings_dir = EXAMPLE_REALM / "SECURITY_CONSOLIDATION" / "meetings"
    print(f"Reading notes from: {meetings_dir}")

    if not meetings_dir.exists():
        print("Note: Example realm not found. Creating sample data...")
        # Create sample meeting notes for demo
        sample_dir = meetings_dir / "external"
        sample_dir.mkdir(parents=True, exist_ok=True)

        sample_note = """---
tags:
  - customer/acme
  - architecture
---

# ACME Architecture Review

Customer is migrating from on-prem to AWS.

There's an integration challenge with our API versioning.

Customer expects real-time but platform designed for batch processing.

Not satisfied with current documentation quality.

Actively using the security features across 5 teams.
"""
        write_markdown_file(sample_dir / "2025-01-20_arch_review.md", sample_note)
        print("✓ Created sample meeting note")

    notes = read_markdown_files_recursive(meetings_dir)
    print(f"✓ Found {len(notes)} notes")
    print()

    if not notes:
        print("No notes found. Exiting.")
        return

    # Convert notes to meeting note format for CA Agent
    meeting_notes = []
    for note in notes:
        meeting_notes.append({
            'content': note.get('content', ''),
            'date': note.get('date'),
            'customer_id': None,  # Will be extracted from tags
            'tags': note.get('tags', []),
            'participants': []
        })

    # Process notes with CA Agent
    print("Processing notes with CA Agent...")
    result = agent.process({'meeting_notes': meeting_notes})
    print("✓ Processing complete")
    print()

    # Display summary
    outputs = result['outputs']
    dashboard_data = outputs['dashboard_data']
    risks = result['risks']
    escalations = result['escalations']

    print("Summary:")
    print(f"  Customers tracked: {dashboard_data['total_customers']}")
    print(f"  Architecture changes: {dashboard_data['architecture_changes']}")
    print(f"  Integration risks: {dashboard_data['integration_risks']}")
    print(f"  Design mismatches: {dashboard_data['design_mismatches']}")
    print(f"  VoC signals: {dashboard_data['voc_signals']}")
    print(f"  Customers at risk: {dashboard_data['customers_at_risk']}")
    print(f"  Escalations required: {len(escalations)}")
    print()

    # Get agent output directory
    output_dir = get_agent_output_dir('ca_agent')
    print(f"Writing outputs to: {output_dir}")

    # 1. Adoption Dashboard
    adoption_dashboard = outputs['adoption_dashboard']
    dashboard_md = generate_adoption_dashboard_md(adoption_dashboard)
    dashboard_path = output_dir / "_Adoption_Dashboard.md"
    write_markdown_file(
        dashboard_path,
        dashboard_md,
        frontmatter={
            'generated_by': 'ca_agent',
            'generated_at': dashboard_data.get('timestamp', 'now')
        }
    )
    print(f"✓ Adoption dashboard written to: {dashboard_path}")

    # 2. Customer Profiles
    customer_profiles = outputs['customer_profiles']
    if customer_profiles:
        customers_dir = output_dir / "customers"
        customers_dir.mkdir(exist_ok=True)

        for customer_id, profile_data in customer_profiles.items():
            profile_md = generate_customer_profile_md(customer_id, profile_data)
            profile_path = customers_dir / f"{customer_id.upper()}_Profile.md"

            write_markdown_file(
                profile_path,
                profile_md,
                frontmatter={
                    'customer_id': customer_id,
                    'generated_by': 'ca_agent',
                    'last_activity': profile_data.get('last_activity'),
                    'adoption_level': profile_data.get('adoption', {}).get('level')
                }
            )

        print(f"✓ {len(customer_profiles)} customer profiles written to: {customers_dir}")

    # 3. Integration Risk Register
    if risks:
        risks_dir = output_dir / "risks"
        risks_dir.mkdir(exist_ok=True)

        risk_md = generate_integration_risk_md(risks)
        write_markdown_file(
            risks_dir / "Integration_Risk_Register.md",
            risk_md,
            frontmatter={'generated_by': 'ca_agent', 'total_risks': len(risks)}
        )

        print(f"✓ Integration risk register written to: {risks_dir}")

    # 4. Design Mismatch Report
    design_mismatches = outputs['design_mismatch_report']
    if design_mismatches:
        mismatch_md = "# Design Mismatch Report\n\n"
        mismatch_md += f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"

        for mismatch in design_mismatches:
            mismatch_md += f"## {mismatch.get('customer_id', 'Unknown').upper()}\n\n"
            mismatch_md += f"**Mismatch**: {mismatch.get('content', 'N/A')}\n\n"
            mismatch_md += f"- **Severity**: {mismatch.get('severity', 'MEDIUM')}\n"
            mismatch_md += f"- **Source**: {mismatch.get('source', 'Unknown')}\n"
            mismatch_md += "\n---\n\n"

        write_markdown_file(
            output_dir / "Design_Mismatch_Report.md",
            mismatch_md,
            frontmatter={'generated_by': 'ca_agent', 'total_mismatches': len(design_mismatches)}
        )
        print(f"✓ Design mismatch report written to: {output_dir}")

    # 5. Show escalations
    if escalations:
        print()
        print("⚠️  ESCALATIONS REQUIRED:")
        for esc in escalations:
            print(f"  [{esc['severity']}] {esc['description']}")
            print(f"    → {esc['recommended_action']} (to {esc.get('escalation_to', 'SA/PM')})")

    print()
    print("=" * 60)
    print("✓ CA Agent processing complete!")
    print(f"  Results available in: {output_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
