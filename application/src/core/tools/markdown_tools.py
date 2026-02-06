"""
Markdown file handling tools
Read and write markdown files with YAML frontmatter
"""

import re
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime


def parse_markdown_with_frontmatter(file_path: Path) -> Dict[str, Any]:
    """
    Parse a markdown file with YAML frontmatter

    Returns:
        {
            'frontmatter': dict of YAML data,
            'content': str of markdown content,
            'tags': list of tags from frontmatter
        }
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract frontmatter
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)

    if frontmatter_match:
        frontmatter_str = frontmatter_match.group(1)
        markdown_content = frontmatter_match.group(2)

        try:
            frontmatter = yaml.safe_load(frontmatter_str)
        except yaml.YAMLError:
            frontmatter = {}
    else:
        frontmatter = {}
        markdown_content = content

    # Extract tags
    tags = frontmatter.get('tags', [])
    if isinstance(tags, str):
        tags = [tags]

    return {
        'frontmatter': frontmatter,
        'content': markdown_content,
        'tags': tags,
        'file_path': str(file_path),
        'file_name': file_path.name
    }


def extract_date_from_filename(filename: str) -> Optional[str]:
    """Extract date from filename like 2025-12-03.md"""
    match = re.match(r'(\d{4}-\d{2}-\d{2})', filename)
    return match.group(1) if match else None


def read_markdown_files(directory: Path, pattern: str = '*.md') -> List[Dict[str, Any]]:
    """
    Read all markdown files from a directory

    Args:
        directory: Path to directory
        pattern: Glob pattern for files (default: *.md)

    Returns list of parsed files with metadata
    """
    files = []

    if not directory.exists():
        print(f"Warning: Directory does not exist: {directory}")
        return files

    for md_file in sorted(directory.glob(pattern)):
        try:
            parsed = parse_markdown_with_frontmatter(md_file)
            parsed['date'] = extract_date_from_filename(md_file.name)
            files.append(parsed)
        except Exception as e:
            print(f"Error reading {md_file.name}: {e}")

    return files


def read_markdown_files_recursive(directory: Path, pattern: str = '**/*.md') -> List[Dict[str, Any]]:
    """
    Read all markdown files from a directory recursively

    Args:
        directory: Path to directory
        pattern: Glob pattern for files (default: **/*.md)

    Returns list of parsed files with metadata
    """
    files = []

    if not directory.exists():
        print(f"Warning: Directory does not exist: {directory}")
        return files

    for md_file in sorted(directory.glob(pattern)):
        try:
            parsed = parse_markdown_with_frontmatter(md_file)
            parsed['date'] = extract_date_from_filename(md_file.name)
            files.append(parsed)
        except Exception as e:
            print(f"Error reading {md_file.name}: {e}")

    return files


def write_markdown_file(file_path: Path, content: str, frontmatter: Optional[Dict] = None):
    """
    Write markdown file with optional frontmatter

    Args:
        file_path: Path to write to
        content: Markdown content
        frontmatter: Optional dict to write as YAML frontmatter
    """
    file_path.parent.mkdir(parents=True, exist_ok=True)

    output = ""

    if frontmatter:
        output += "---\n"
        output += yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True)
        output += "---\n\n"

    output += content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(output)


def generate_client_profile_md(client_id: str, profile_data: Dict) -> str:
    """Generate markdown for a client technical profile"""
    md = f"# {client_id.upper()} - Technical Profile\n\n"

    md += f"**Last Activity:** {profile_data.get('last_activity', 'Unknown')}\n\n"

    # Technologies
    technologies = profile_data.get('technologies', [])
    if technologies:
        md += "## Technologies in Use\n\n"
        for tech in sorted(technologies):
            md += f"- {tech}\n"
        md += "\n"

    # Key People
    people = profile_data.get('key_people', [])
    if people:
        md += "## Key Contacts\n\n"
        for person in sorted(people):
            md += f"- {person}\n"
        md += "\n"

    # Technical Decisions
    decisions = profile_data.get('recent_decisions', [])
    if decisions:
        md += f"## Recent Technical Decisions ({len(decisions)})\n\n"
        for decision in decisions:
            md += f"**{decision.get('date', '')}:** {decision.get('decision', '')}\n\n"

    # Active Risks
    risks = profile_data.get('active_risks', [])
    if risks:
        md += f"## Active Technical Risks ({len(risks)})\n\n"
        for risk in risks:
            severity = risk.get('severity', 'MEDIUM')
            md += f"- **[{severity}]** {risk.get('risk', '')}\n"
        md += "\n"

    # Statistics
    md += "## Statistics\n\n"
    md += f"- Total Technical Decisions: {profile_data.get('technical_decisions', 0)}\n"
    md += f"- Open Risks: {profile_data.get('open_risks', 0)}\n"

    return md


def generate_dashboard_md(dashboard_data: Dict) -> str:
    """Generate markdown for the main dashboard"""
    md = f"# Agent Dashboard\n\n"
    md += f"*Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*\n\n"

    md += "## Overview\n\n"
    md += f"- **Total Clients:** {dashboard_data.get('total_clients', 0)}\n"
    md += f"- **Technologies Tracked:** {dashboard_data.get('total_technologies', 0)}\n"
    md += f"- **Total Technical Decisions:** {dashboard_data.get('total_decisions', 0)}\n"
    md += f"- **Active Risks:** {dashboard_data.get('total_risks', 0)}\n"
    md += f"- **Clients with Risks:** {dashboard_data.get('clients_with_risks', 0)}\n\n"

    # Most used technologies
    top_tech = dashboard_data.get('most_used_technologies', [])
    if top_tech:
        md += "## Most Used Technologies\n\n"
        md += "| Technology | Clients |\n"
        md += "|------------|------|\n"
        for tech, clients in top_tech:
            md += f"| {tech} | {len(clients)} |\n"
        md += "\n"

    return md


if __name__ == "__main__":
    from core.config.paths import EXAMPLE_REALM

    # Test reading from example realm
    meetings_dir = EXAMPLE_REALM / "SECURITY_CONSOLIDATION" / "meetings"
    if meetings_dir.exists():
        files = read_markdown_files_recursive(meetings_dir)
        print(f"✓ Read {len(files)} markdown files from example realm")
        if files:
            print(f"  First file: {files[0]['file_name']}")
    else:
        print(f"Example realm not found at: {meetings_dir}")
