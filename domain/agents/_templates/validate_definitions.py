"""Validate agent definition YAML files against the golden standard structure.

Checks:
1. Required Zone 1 + Zone 2 fields present
2. Flow IDs match a2a capabilities
3. Prompt registry keys match flow workflow_shorthand references
4. Knowledge reference paths exist on disk
5. Disclaimer header present
6. Version consistency
7. Sequential step numbers in flows

Usage:
    python validate_definitions.py              # validate all
    python validate_definitions.py <file.yaml>  # validate one
"""

import sys
from pathlib import Path

import yaml

AGENTS_BASE = Path(__file__).resolve().parent.parent

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


def main():
    if len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
        path = Path(sys.argv[1]).resolve()
        issues = validate_file(path)
    else:
        defs = sorted(AGENTS_BASE.rglob("*-definition.yaml"))
        print(f"Validating {len(defs)} definition files...\n")
        issues = []
        for f in defs:
            file_issues = validate_file(f)
            issues.extend(file_issues)

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
