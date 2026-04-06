"""Fix playbook_raci drift across all agent definitions.

Actions:
1. Remove RACI entries referencing playbook files that don't exist
2. Add missing playbooks (from catalog) to the responsible section
3. Create playbook_raci sections for agents that have playbooks but no RACI

Usage:
    python fix_raci.py          # preview changes (dry run)
    python fix_raci.py --apply  # apply changes
"""

import re
import sys
from pathlib import Path

import yaml

AGENTS_BASE = Path(__file__).resolve().parent.parent
PLAYBOOKS_BASE = AGENTS_BASE.parent / "playbooks"


def build_playbook_index() -> dict[str, list[dict]]:
    index: dict[str, list[dict]] = {}
    if not PLAYBOOKS_BASE.exists():
        return index
    for pb_file in sorted(PLAYBOOKS_BASE.rglob("*.yaml")):
        if "template" in pb_file.parts:
            continue
        try:
            data = yaml.safe_load(pb_file.read_text(encoding="utf-8"))
        except (yaml.YAMLError, OSError):
            continue
        if not isinstance(data, dict):
            continue
        role = data.get("intended_agent_role")
        if not role:
            continue
        team = str(pb_file.parent.relative_to(PLAYBOOKS_BASE))
        name = (
            data.get("framework_name")
            or data.get("steckbrief", {}).get("name", "")
            or pb_file.stem
        )
        pb_id = data.get("playbook_id", "")
        primary_obj = data.get("primary_objective", "")
        scope = primary_obj[:80] if primary_obj else name
        entry = {
            "file": pb_file.name,
            "team": team,
            "name": f"{name} ({pb_id})" if pb_id else name,
            "scope": scope,
            "playbook_id": pb_id,
        }
        index.setdefault(role, []).append(entry)
    return index


def find_raci_block(text: str) -> tuple[int, int] | None:
    """Find the start and end byte offsets of the playbook_raci: block."""
    match = re.search(r"^( +)playbook_raci:\s*\n", text, re.MULTILINE)
    if not match:
        return None
    start = match.start()
    base_indent = len(match.group(1))
    pos = match.end()
    while pos < len(text):
        line_match = re.match(r"( *)\S", text[pos:])
        if line_match:
            indent = len(line_match.group(1))
            if indent <= base_indent:
                break
        newline = text.find("\n", pos)
        if newline == -1:
            pos = len(text)
            break
        pos = newline + 1
    return start, pos


def build_raci_yaml(
    context: str | None,
    responsible: list[dict],
    accountable: list[dict],
    consulted: list[dict],
    informed: list[dict],
    indent: int = 4,
) -> str:
    """Build the playbook_raci YAML block as a string."""
    sp = " " * indent
    sp2 = " " * (indent + 2)
    lines = [f"{sp}playbook_raci:"]
    if context:
        escaped = context.replace("'", "''")
        lines.append(f"{sp2}context: '{escaped}'")

    for role_type, entries in [
        ("responsible", responsible),
        ("accountable", accountable),
        ("consulted", consulted),
        ("informed", informed),
    ]:
        if not entries:
            continue
        lines.append(f"{sp2}{role_type}:")
        for e in entries:
            name = e.get("name", e.get("playbook", ""))
            scope = e.get("scope", "")
            team = e.get("team", "")
            file_ref = e.get("file", "")
            lines.append(f"{sp2}- playbook: {name}")
            if scope:
                lines.append(f"{sp2}  scope: {scope}")
            if team:
                lines.append(f"{sp2}  team: {team}")
            if file_ref:
                lines.append(f"{sp2}  file: {file_ref}")
    lines.append("")
    return "\n".join(lines) + "\n" if lines[-1] != "" else "\n".join(lines)


def extract_existing_raci(data: dict) -> dict:
    """Extract playbook_raci from parsed YAML data."""
    xea = data.get("x-ea-agent", {})
    if not isinstance(xea, dict):
        return {}
    profile = xea.get("profile", {})
    if not isinstance(profile, dict):
        return {}
    return profile.get("playbook_raci", {}) or {}


def filter_valid_entries(entries: list, role_type: str) -> list[dict]:
    """Keep only RACI entries whose playbook files exist on disk."""
    valid = []
    if not isinstance(entries, list):
        return valid
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        file_ref = entry.get("file", "")
        team_ref = entry.get("team", "")
        if not file_ref or not team_ref:
            valid.append(entry)
            continue
        pb_path = PLAYBOOKS_BASE / team_ref / file_ref
        if pb_path.exists():
            valid.append(entry)
    return valid


def process_definition(def_path: Path, pb_index: dict, apply: bool) -> list[str]:
    """Process a single agent definition. Returns log messages."""
    logs = []
    try:
        text = def_path.read_text(encoding="utf-8")
        data = yaml.safe_load(text)
    except (yaml.YAMLError, OSError) as e:
        logs.append(f"  SKIP {def_path.name}: {e}")
        return logs

    if not isinstance(data, dict):
        return logs

    agent_id = data.get("id", "")
    rel = def_path.relative_to(AGENTS_BASE) if def_path.is_relative_to(AGENTS_BASE) else def_path
    raci = extract_existing_raci(data)
    catalog = pb_index.get(agent_id, [])
    catalog_files = {p["file"] for p in catalog}

    if not raci and not catalog:
        return logs

    # Collect existing valid entries per RACI role
    responsible = filter_valid_entries(raci.get("responsible", []), "responsible")
    accountable = filter_valid_entries(raci.get("accountable", []), "accountable")
    consulted = filter_valid_entries(raci.get("consulted", []), "consulted")
    informed = filter_valid_entries(raci.get("informed", []), "informed")

    # Count removed stale entries
    orig_count = sum(
        len(raci.get(r, []) or [])
        for r in ("responsible", "accountable", "consulted", "informed")
        if isinstance(raci.get(r), list)
    )
    valid_count = len(responsible) + len(accountable) + len(consulted) + len(informed)
    removed = orig_count - valid_count

    # Find catalog playbooks missing from RACI responsible
    raci_files: set[str] = set()
    for entries in (responsible, accountable, consulted, informed):
        for e in entries:
            f = e.get("file", "")
            if f:
                raci_files.add(f)

    added = []
    for pb in catalog:
        if pb["file"] not in raci_files:
            responsible.append({
                "playbook": pb["name"],
                "name": pb["name"],
                "scope": pb["scope"],
                "team": pb["team"],
                "file": pb["file"],
            })
            added.append(pb["name"])

    if removed == 0 and not added:
        return logs

    context = raci.get("context") if isinstance(raci, dict) else None

    # Determine indent from file
    raci_block = find_raci_block(text)
    if raci_block:
        indent_match = re.search(r"^( +)playbook_raci:", text, re.MULTILINE)
        indent = len(indent_match.group(1)) if indent_match else 4
    else:
        indent = 4

    new_block = build_raci_yaml(context, responsible, accountable, consulted, informed, indent)

    if removed > 0:
        logs.append(f"  {rel}: removed {removed} stale RACI entries")
    if added:
        logs.append(f"  {rel}: added {len(added)} playbooks to responsible")

    if apply:
        if raci_block:
            start, end = raci_block
            new_text = text[:start] + new_block + text[end:]
        else:
            # Insert playbook_raci before fallback_model or at end of profile
            insert_match = re.search(r"^( +)fallback_model:", text, re.MULTILINE)
            if insert_match:
                insert_pos = insert_match.start()
                new_text = text[:insert_pos] + new_block + text[insert_pos:]
            else:
                # Try inserting before validation section
                insert_match = re.search(r"^( +)validation:", text, re.MULTILINE)
                if insert_match:
                    insert_pos = insert_match.start()
                    new_text = text[:insert_pos] + new_block + text[insert_pos:]
                else:
                    logs.append(f"  {rel}: WARNING could not find insertion point for playbook_raci")
                    return logs
        def_path.write_text(new_text, encoding="utf-8")
        logs.append(f"  {rel}: WRITTEN")

    return logs


def main():
    apply = "--apply" in sys.argv
    mode = "APPLYING" if apply else "DRY RUN (use --apply to write)"
    print(f"=== RACI Fix Script ({mode}) ===\n")

    pb_index = build_playbook_index()
    defs = sorted(AGENTS_BASE.rglob("*-definition.yaml"))

    total_logs = []
    files_changed = 0

    for def_path in defs:
        logs = process_definition(def_path, pb_index, apply)
        if logs:
            files_changed += 1
            total_logs.extend(logs)

    if total_logs:
        for log in total_logs:
            print(log)
        print(f"\n{files_changed} files {'modified' if apply else 'would be modified'}")
    else:
        print("No RACI drift found.")


if __name__ == "__main__":
    main()
