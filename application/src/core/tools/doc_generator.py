"""
Documentation Generator - Auto-generates governance documentation from code

Generates documentation by introspecting:
- Playbook definitions (YAML)
- Agent configurations (YAML)
- Threshold configurations (YAML)
- Workflow definitions (Python)

Output: Markdown documentation suitable for InfoHub or external publishing.
"""

from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime
import yaml


class DocGenerator:
    """
    Generates governance documentation from structured configurations.

    Responsibilities:
    - Extract playbook metadata and structure
    - Document agent capabilities and ownership
    - Generate threshold reference tables
    - Create workflow documentation
    """

    def __init__(self, project_root: Path):
        """
        Initialize generator with project paths.

        Args:
            project_root: Root directory of the ea-agentic-lab project
        """
        self.project_root = project_root
        self.playbooks_dir = project_root / "playbooks" / "executable"
        self.config_dir = project_root / "config"
        self.teams_dir = project_root / "teams"

    def generate_playbook_catalog(self) -> str:
        """
        Generate markdown catalog of all playbooks.

        Returns:
            Markdown string documenting all playbooks
        """
        lines = [
            "# Playbook Catalog",
            "",
            f"*Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*",
            "",
            "| ID | Framework | Source | Agent Owner | Status |",
            "| --- | --- | --- | --- | --- |"
        ]

        playbooks = sorted(self.playbooks_dir.glob("*.yaml"))

        for pb_path in playbooks:
            try:
                with open(pb_path) as f:
                    pb = yaml.safe_load(f)

                pb_id = pb_path.stem.split("_")[0] + "_" + pb_path.stem.split("_")[1]
                framework = pb.get("framework_name", "Unknown")
                source = pb.get("framework_source", "Unknown")
                agent = pb.get("intended_agent_role", "Unassigned")

                lines.append(f"| {pb_id} | {framework} | {source} | {agent} | Production |")
            except Exception as e:
                lines.append(f"| {pb_path.stem} | Error loading | - | - | Error: {e} |")

        lines.extend([
            "",
            "## Playbook Structure",
            "",
            "Each playbook contains:",
            "* **Metadata**: Framework name, source, version",
            "* **Trigger Conditions**: When playbook executes (automatic/manual/conditional)",
            "* **Required Inputs**: Data needed from InfoHub context",
            "* **Decision Logic**: DLL rules with thresholds",
            "* **Expected Outputs**: Artifacts produced",
            "* **Validation Checks**: Pre/post execution validation",
            ""
        ])

        return "\n".join(lines)

    def generate_agent_reference(self) -> str:
        """
        Generate markdown reference for all agents.

        Returns:
            Markdown string documenting all agents
        """
        lines = [
            "# Agent Reference",
            "",
            f"*Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*",
            ""
        ]

        # Load agent role mapping
        role_mapping_path = self.config_dir / "agent_role_mapping.yaml"
        if role_mapping_path.exists():
            with open(role_mapping_path) as f:
                role_mapping = yaml.safe_load(f)
        else:
            role_mapping = {"agents": {}}

        teams = sorted(self.teams_dir.iterdir())

        for team_dir in teams:
            if not team_dir.is_dir():
                continue

            agent_configs = list(team_dir.glob("agents/*.yaml"))

            for config_path in agent_configs:
                try:
                    with open(config_path) as f:
                        config = yaml.safe_load(f)

                    agent_id = config.get("agent_id", config_path.stem)
                    purpose = config.get("purpose", "Not specified")

                    lines.extend([
                        f"## {agent_id}",
                        "",
                        f"**Purpose**: {purpose}",
                        "",
                        f"**Team**: {config.get('team', 'Unknown')}",
                        "",
                        "**Core Functions**:",
                        ""
                    ])

                    for func in config.get("core_functions", []):
                        lines.append(f"* {func}")

                    lines.extend([
                        "",
                        "**Inputs**:",
                        ""
                    ])

                    for inp in config.get("inputs", []):
                        lines.append(f"* {inp}")

                    lines.extend([
                        "",
                        "**Outputs**:",
                        ""
                    ])

                    for out in config.get("outputs", []):
                        lines.append(f"* {out}")

                    # Add playbook ownership from role mapping
                    agent_roles = role_mapping.get("agents", {}).get(agent_id, {})
                    playbooks_owned = agent_roles.get("playbooks_owned", [])
                    if playbooks_owned:
                        lines.extend([
                            "",
                            "**Playbooks Owned**:",
                            ""
                        ])
                        for pb in playbooks_owned:
                            lines.append(f"* {pb}")

                    lines.extend([
                        "",
                        f"**Escalation**: {config.get('escalation_to', 'Not specified')}",
                        "",
                        "---",
                        ""
                    ])

                except Exception as e:
                    lines.append(f"Error loading {config_path}: {e}\n")

        return "\n".join(lines)

    def generate_threshold_reference(self) -> str:
        """
        Generate markdown reference for all thresholds.

        Returns:
            Markdown string documenting all thresholds
        """
        lines = [
            "# Threshold Reference",
            "",
            f"*Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}*",
            ""
        ]

        thresholds_path = self.config_dir / "playbook_thresholds.yaml"
        if not thresholds_path.exists():
            return "# Threshold Reference\n\nNo threshold configuration found."

        with open(thresholds_path) as f:
            thresholds = yaml.safe_load(f)

        # Global thresholds
        global_thresholds = thresholds.get("global_thresholds", {})
        if global_thresholds:
            lines.extend([
                "## Global Thresholds",
                "",
                "| Threshold | Value | Description |",
                "| --- | --- | --- |"
            ])

            for key, value in global_thresholds.items():
                desc = self._infer_threshold_description(key)
                lines.append(f"| {key} | {value} | {desc} |")

            lines.append("")

        # Playbook-specific thresholds
        for key, value in thresholds.items():
            if key.startswith("PB_") and isinstance(value, dict):
                lines.extend([
                    f"## {key} Thresholds",
                    "",
                    "| Threshold | Value |",
                    "| --- | --- |"
                ])

                for t_key, t_value in value.items():
                    lines.append(f"| {t_key} | {t_value} |")

                lines.append("")

        return "\n".join(lines)

    def _infer_threshold_description(self, key: str) -> str:
        """Infer description from threshold key name."""
        descriptions = {
            "minimum_account_arr": "Minimum ARR for governance activation",
            "strategic_account_arr": "ARR threshold for strategic account classification",
            "enterprise_account_arr": "ARR threshold for enterprise account classification",
            "critical_risk_count": "Max critical risks before escalation",
            "high_risk_count": "Max high risks before review",
        }
        return descriptions.get(key, "See playbook documentation")

    def generate_all(self, output_dir: Path) -> List[Path]:
        """
        Generate all documentation files.

        Args:
            output_dir: Directory to write generated docs

        Returns:
            List of generated file paths
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        generated = []

        # Playbook catalog
        playbook_doc = output_dir / "GENERATED_PLAYBOOK_CATALOG.md"
        playbook_doc.write_text(self.generate_playbook_catalog())
        generated.append(playbook_doc)

        # Agent reference
        agent_doc = output_dir / "GENERATED_AGENT_REFERENCE.md"
        agent_doc.write_text(self.generate_agent_reference())
        generated.append(agent_doc)

        # Threshold reference
        threshold_doc = output_dir / "GENERATED_THRESHOLD_REFERENCE.md"
        threshold_doc.write_text(self.generate_threshold_reference())
        generated.append(threshold_doc)

        return generated


def main():
    """Generate documentation from command line."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate governance documentation")
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Project root directory"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent / "docs" / "generated",
        help="Output directory for generated docs"
    )

    args = parser.parse_args()

    generator = DocGenerator(args.project_root)
    generated = generator.generate_all(args.output_dir)

    print(f"Generated {len(generated)} documentation files:")
    for path in generated:
        print(f"  - {path}")


if __name__ == "__main__":
    main()
