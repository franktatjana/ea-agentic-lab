"""Validate agent definition YAML files against the golden standard structure.

Checks:
1. Required Zone 1 + Zone 2 fields present
2. Flow IDs match a2a capabilities
3. Prompt registry keys match flow workflow_shorthand references
4. Knowledge reference paths exist on disk
5. Disclaimer header present
6. Version consistency
7. Sequential step numbers in flows
8. Playbook RACI consistency (cross-reference with playbook files)

Usage:
    python validate_definitions.py              # validate all
    python validate_definitions.py <file.yaml>  # validate one
    python validate_definitions.py --raci       # RACI cross-reference only
"""

import sys
from pathlib import Path

import yaml

AGENTS_BASE = Path(__file__).resolve().parent.parent
PLAYBOOKS_BASE = AGENTS_BASE.parent / "playbooks"

REQUIRED_ZONE1 = [
    "agentspec_version", "component_type", "id", "name", "description",
    "metadata", "system_prompt", "human_in_the_loop", "llm_configuration",
    "inputs", "outputs", "tools", "flows", "a2a",
]

REQUIRED_METADATA = ["definition_version", "disclaimer", "tags", "responsibility"]

REQUIRED_LLM = ["model_id", "default_generation_parameters"]

REQUIRED_X_EA = [
    "prompt_registry", "guardrails", "boundaries", "permissions",
    "escalation_triggers", "memory", "context", "knowledge", "quality",
]


def validate_file(path: Path) -> list[str]:
    """Validate a single definition file. Returns list of issues."""
    issues = []
    rel = path.relative_to(AGENTS_BASE) if path.is_relative_to(AGENTS_BASE) else path

    # Check disclaimer header
    text = path.read_text(encoding="utf-8")
    if "DISCLAIMER" not in text[:500]:
        issues.append(f"{rel}: Missing disclaimer header")

    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as e:
        issues.append(f"{rel}: Invalid YAML: {e}")
        return issues

    if not isinstance(data, dict):
        issues.append(f"{rel}: Root is not a mapping")
        return issues

    # Zone 1 required fields
    for field in REQUIRED_ZONE1:
        if field not in data:
            issues.append(f"{rel}: Missing Zone 1 field: {field}")

    # Metadata sub-fields
    metadata = data.get("metadata", {})
    if isinstance(metadata, dict):
        for field in REQUIRED_METADATA:
            if field not in metadata:
                issues.append(f"{rel}: Missing metadata.{field}")

    # LLM config sub-fields
    llm = data.get("llm_configuration", {})
    if isinstance(llm, dict):
        for field in REQUIRED_LLM:
            if field not in llm:
                issues.append(f"{rel}: Missing llm_configuration.{field}")

    # x-ea-agent required fields
    xea = data.get("x-ea-agent", {})
    if not xea:
        issues.append(f"{rel}: Missing x-ea-agent section")
    elif isinstance(xea, dict):
        for field in REQUIRED_X_EA:
            if field not in xea:
                issues.append(f"{rel}: Missing x-ea-agent.{field}")

    # Flow IDs must match a2a capabilities
    flows = data.get("flows", [])
    flow_ids = set()
    if isinstance(flows, list):
        for flow in flows:
            if isinstance(flow, dict):
                fid = flow.get("id")
                if fid:
                    flow_ids.add(fid)

    a2a = data.get("a2a", {})
    if isinstance(a2a, dict):
        card = a2a.get("agent_card", {})
        if isinstance(card, dict):
            caps = set(card.get("capabilities", []))
            missing_caps = flow_ids - caps
            extra_caps = caps - flow_ids
            for mc in missing_caps:
                issues.append(f"{rel}: Flow '{mc}' missing from a2a capabilities")
            for ec in extra_caps:
                issues.append(f"{rel}: a2a capability '{ec}' has no matching flow")

    # Prompt registry vs flow references
    registry = xea.get("prompt_registry", {}) if isinstance(xea, dict) else {}
    registry_keys = set(registry.keys()) if isinstance(registry, dict) else set()

    if isinstance(flows, list):
        for flow in flows:
            if not isinstance(flow, dict):
                continue
            wf = flow.get("x-ea-agent", {})
            if not isinstance(wf, dict):
                continue
            steps = wf.get("workflow_shorthand", [])
            if not isinstance(steps, list):
                continue

            prev_step = 0
            for step in steps:
                if not isinstance(step, dict):
                    continue
                # Sequential step check
                step_num = step.get("step", 0)
                if step_num != prev_step + 1:
                    issues.append(f"{rel}: Flow '{flow.get('id')}' step {step_num} not sequential (expected {prev_step + 1})")
                prev_step = step_num

                # Prompt reference check
                prompt = step.get("prompt", "")
                if prompt and registry_keys and prompt not in registry_keys:
                    issues.append(f"{rel}: Flow '{flow.get('id')}' step {step_num} references prompt '{prompt}' not in registry")

    # Specialized agents $component_ref check
    agent_id = data.get("id", "")
    spec_agents = data.get("specialized_agents", [])
    if isinstance(spec_agents, list):
        for sa in spec_agents:
            if isinstance(sa, dict):
                ref = sa.get("agent", {}).get("$component_ref", "")
                if ref and ref != agent_id:
                    issues.append(f"{rel}: Specialized agent '{sa.get('id')}' references '{ref}' but agent id is '{agent_id}'")

    # Knowledge reference file existence
    knowledge = xea.get("knowledge", {}) if isinstance(xea, dict) else {}
    if isinstance(knowledge, dict):
        refs = knowledge.get("references", [])
        if isinstance(refs, list):
            for ref in refs:
                if isinstance(ref, dict):
                    ref_path = ref.get("path", "")
                    if ref_path:
                        full_path = path.parent / ref_path
                        if not full_path.exists():
                            issues.append(f"{rel}: Knowledge reference not found: {ref_path}")

    # Version consistency
    if data.get("agentspec_version") not in ("26.1.0", 26.1):
        issues.append(f"{rel}: agentspec_version should be '26.1.0', got '{data.get('agentspec_version')}'")

    if isinstance(metadata, dict) and metadata.get("definition_version") not in ("0.1.0", 0.1):
        issues.append(f"{rel}: definition_version should be '0.1.0', got '{metadata.get('definition_version')}'")

    # Empty required arrays
    for field in ["boundaries", "permissions", "quality"]:
        val = xea.get(field, []) if isinstance(xea, dict) else []
        if isinstance(val, list) and len(val) == 0:
            issues.append(f"{rel}: x-ea-agent.{field} is empty")

    return issues


def build_playbook_index() -> dict[str, list[dict]]:
    """Scan all playbook YAMLs and index by intended_agent_role."""
    index: dict[str, list[dict]] = {}
    if not PLAYBOOKS_BASE.exists():
        return index
    for pb_file in sorted(PLAYBOOKS_BASE.rglob("*.yaml")):
        if pb_file.name == "README.md" or "template" in pb_file.parts:
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
        entry = {
            "file": pb_file.name,
            "team": team,
            "path": pb_file,
            "name": data.get("framework_name") or data.get("steckbrief", {}).get("name", pb_file.stem),
            "playbook_id": data.get("playbook_id", ""),
        }
        index.setdefault(role, []).append(entry)
    return index


def validate_raci() -> list[str]:
    """Cross-reference playbook_raci in definitions against actual playbook files."""
    issues = []
    pb_index = build_playbook_index()
    defs = sorted(AGENTS_BASE.rglob("*-definition.yaml"))

    for def_path in defs:
        try:
            data = yaml.safe_load(def_path.read_text(encoding="utf-8"))
        except (yaml.YAMLError, OSError):
            continue
        if not isinstance(data, dict):
            continue

        agent_id = data.get("id", "")
        rel = def_path.relative_to(AGENTS_BASE) if def_path.is_relative_to(AGENTS_BASE) else def_path
        xea = data.get("x-ea-agent", {})
        if not isinstance(xea, dict):
            continue
        profile = xea.get("profile", {})
        if not isinstance(profile, dict):
            continue
        raci = profile.get("playbook_raci")

        catalog_playbooks = pb_index.get(agent_id, [])
        catalog_files = {p["file"] for p in catalog_playbooks}

        if not raci:
            if catalog_playbooks:
                names = ", ".join(p["name"] for p in catalog_playbooks[:5])
                suffix = f" (and {len(catalog_playbooks) - 5} more)" if len(catalog_playbooks) > 5 else ""
                issues.append(f"RACI {rel}: No playbook_raci section but {len(catalog_playbooks)} playbooks target this agent: {names}{suffix}")
            continue

        if not isinstance(raci, dict):
            continue

        raci_files: set[str] = set()
        for role_type in ("responsible", "accountable", "consulted", "informed"):
            entries = raci.get(role_type, [])
            if not isinstance(entries, list):
                continue
            for entry in entries:
                if not isinstance(entry, dict):
                    continue
                file_ref = entry.get("file", "")
                team_ref = entry.get("team", "")
                if file_ref:
                    raci_files.add(file_ref)
                    pb_path = PLAYBOOKS_BASE / team_ref / file_ref if team_ref else None
                    if pb_path and not pb_path.exists():
                        issues.append(f"RACI {rel}: {role_type} entry '{entry.get('playbook', '')}' references missing file: {team_ref}/{file_ref}")

        if agent_id in pb_index:
            missing = catalog_files - raci_files
            for pb in catalog_playbooks:
                if pb["file"] in missing:
                    issues.append(f"RACI {rel}: Playbook '{pb['name']}' ({pb['team']}/{pb['file']}) targets {agent_id} but is not in playbook_raci")

    orphan_roles = set(pb_index.keys())
    defined_ids = set()
    for def_path in defs:
        try:
            data = yaml.safe_load(def_path.read_text(encoding="utf-8"))
        except (yaml.YAMLError, OSError):
            continue
        if isinstance(data, dict):
            defined_ids.add(data.get("id", ""))
    for role in sorted(orphan_roles - defined_ids):
        count = len(pb_index[role])
        issues.append(f"RACI orphan: {count} playbook(s) target '{role}' but no agent definition with that ID exists")

    return issues


def main():
    raci_only = "--raci" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("-")]

    issues = []

    if raci_only:
        print("Validating playbook RACI consistency...\n")
        issues = validate_raci()
    elif args:
        path = Path(args[0]).resolve()
        issues = validate_file(path)
    else:
        defs = sorted(AGENTS_BASE.rglob("*-definition.yaml"))
        print(f"Validating {len(defs)} definition files...\n")
        for f in defs:
            issues.extend(validate_file(f))
        print("Running playbook RACI cross-reference...\n")
        issues.extend(validate_raci())

    if issues:
        print(f"Found {len(issues)} issues:\n")
        for issue in issues:
            print(f"  WARNING: {issue}")
        print(f"\nTotal: {len(issues)} issues")
    else:
        print("All definitions valid!")

    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
