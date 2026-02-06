#!/usr/bin/env python3
"""
Runner script for SA Agent
Processes meeting notes and generates technical intelligence outputs
"""

import sys
from pathlib import Path

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
    write_markdown_file,
    generate_client_profile_md,
    generate_dashboard_md
)
from agents.solution_architects.sa_agent_impl import SAAgent


def main():
    print("=" * 60)
    print("EA Agentic Lab - SA Agent Runner")
    print("=" * 60)
    print()

    # Ensure directories exist
    print("Setting up directories...")
    ensure_directories()
    print()

    # Initialize SA Agent
    print("Initializing SA Agent...")
    config_path = APPLICATION_ROOT.parent / "domain" / "agents" / "solution_architects" / "agents" / "sa_agent.yaml"
    agent = SAAgent(config_path)
    print(f"✓ {agent.agent_id} initialized")
    print(f"  Purpose: {agent.config.purpose}")
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
  - client/acme
  - security-platform
  - security
---

# ACME Security Review

Discussed migration from LegacySIEM to unified security platform.

Risk: Timeline is aggressive for Q2 delivery.

Decision: Proceed with phased rollout starting with SIEM use case.

The team is concerned about integration challenges with existing SOAR platform.
"""
        write_markdown_file(sample_dir / "2025-01-15_security_review.md", sample_note)
        print("✓ Created sample meeting note")

    notes = read_markdown_files_recursive(meetings_dir)
    print(f"✓ Found {len(notes)} notes")
    print()

    if not notes:
        print("No notes found. Exiting.")
        return

    # Convert to daily notes format expected by SA Agent
    daily_notes = []
    for note in notes:
        daily_notes.append({
            'content': note.get('content', ''),
            'date': note.get('date'),
            'tags': note.get('tags', [])
        })

    # Process notes with SA Agent
    print("Processing notes with SA Agent...")
    result = agent.process({'daily_notes': daily_notes})
    print("✓ Processing complete")
    print()

    # Display summary
    outputs = result['outputs']
    dashboard_data = outputs['dashboard_data']
    client_profiles = outputs['client_profiles']
    risks = result['risks']
    escalations = result['escalations']

    print("Summary:")
    print(f"  Clients analyzed: {dashboard_data['total_clients']}")
    print(f"  Technologies tracked: {dashboard_data['total_technologies']}")
    print(f"  Technical decisions: {dashboard_data['total_decisions']}")
    print(f"  Active risks: {len(risks)}")
    print(f"  Escalations required: {len(escalations)}")
    print()

    # Get agent output directory
    output_dir = get_agent_output_dir('sa_agent')
    print(f"Writing outputs to: {output_dir}")

    # 1. Dashboard
    dashboard_md = generate_dashboard_md(dashboard_data)
    dashboard_path = output_dir / "_Dashboard.md"
    write_markdown_file(
        dashboard_path,
        dashboard_md,
        frontmatter={
            'generated_by': 'sa_agent',
            'generated_at': outputs['dashboard_data'].get('timestamp', 'now')
        }
    )
    print(f"✓ Dashboard written to: {dashboard_path}")

    # 2. Client Profiles
    clients_dir = output_dir / "clients"
    clients_dir.mkdir(exist_ok=True)

    for client_id, profile_data in client_profiles.items():
        profile_md = generate_client_profile_md(client_id, profile_data)
        profile_path = clients_dir / f"{client_id.upper()}_Profile.md"

        write_markdown_file(
            profile_path,
            profile_md,
            frontmatter={
                'client_id': client_id,
                'generated_by': 'sa_agent',
                'last_activity': profile_data.get('last_activity'),
                'technologies': profile_data.get('technologies', [])
            }
        )

    print(f"✓ {len(client_profiles)} client profiles written to: {clients_dir}")

    # 3. Risk Register
    if risks:
        risks_dir = output_dir / "risks"
        risks_dir.mkdir(exist_ok=True)

        risk_md = "# Technical Risk Register\n\n"
        risk_md += f"*Generated: {dashboard_data.get('timestamp', 'now')}*\n\n"

        for risk in risks:
            risk_md += f"## {risk['client'].upper()}\n\n"
            risk_md += f"**Severity:** {risk['severity']}\n\n"
            risk_md += f"**Risk:** {risk['risk']}\n\n"
            risk_md += f"**Date Identified:** {risk.get('date', 'Unknown')}\n\n"
            risk_md += "---\n\n"

        write_markdown_file(
            risks_dir / "Risk_Register.md",
            risk_md,
            frontmatter={'generated_by': 'sa_agent', 'total_risks': len(risks)}
        )

        print(f"✓ Risk register written to: {risks_dir}")

    # 4. Show escalations
    if escalations:
        print()
        print("⚠️  ESCALATIONS REQUIRED:")
        for esc in escalations:
            print(f"  [{esc['severity']}] {esc['description']}")
            print(f"    → {esc['recommended_action']}")

    print()
    print("=" * 60)
    print("✓ SA Agent processing complete!")
    print(f"  Results available in: {output_dir}")
    print("=" * 60)


if __name__ == "__main__":
    main()
