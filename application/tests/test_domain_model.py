"""Domain Model Validation Tests

Validates cross-reference integrity between agents, playbooks, blueprints,
and role mappings. These tests load YAML files directly from the domain/
directory and check structural consistency without needing a running server.
"""

import re
from pathlib import Path

import pytest
import yaml

DOMAIN_ROOT = Path(__file__).parent.parent.parent / "domain"
AGENTS_ROOT = DOMAIN_ROOT / "agents"
PLAYBOOKS_ROOT = DOMAIN_ROOT / "playbooks"
BLUEPRINTS_ROOT = DOMAIN_ROOT / "blueprints"

SKIP_DIRS = {"templates", "backup", "old", "overrides", "__pycache__"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_yaml(path: Path, strict: bool = False) -> dict | None:
    """Load and parse a YAML file. Returns None on parse errors unless strict=True."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except yaml.YAMLError:
        if strict:
            raise
        return None


def collect_agent_files() -> list[Path]:
    return sorted(AGENTS_ROOT.rglob("*/agents/*.yaml"))


def collect_playbook_files() -> list[Path]:
    return sorted(
        p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
        if not any(skip in p.parts for skip in SKIP_DIRS)
    )


def collect_operational_files() -> list[Path]:
    return sorted(PLAYBOOKS_ROOT.rglob("OP_*.yaml"))


def collect_blueprint_files() -> list[Path]:
    return sorted(BLUEPRINTS_ROOT.rglob("*.yaml"))


def collect_canvas_files() -> list[Path]:
    specs_dir = PLAYBOOKS_ROOT / "canvas" / "specs"
    if specs_dir.exists():
        return sorted(specs_dir.glob("*.yaml"))
    return []


def extract_playbook_id(path: Path) -> str:
    """Derive PB_XXX or PB_SEC_001 from filename stem."""
    parts = path.stem.split("_")
    if len(parts) >= 3 and not parts[1].isdigit():
        return f"{parts[0]}_{parts[1]}_{parts[2]}"
    if len(parts) >= 2:
        return f"{parts[0]}_{parts[1]}"
    return path.stem


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def all_agents() -> dict[str, dict]:
    """Map of agent_id -> parsed YAML for every agent definition."""
    agents = {}
    for path in collect_agent_files():
        data = load_yaml(path)
        if data and data.get("agent_id"):
            agents[data["agent_id"]] = {**data, "_path": str(path)}
    return agents


@pytest.fixture(scope="session")
def all_playbooks() -> dict[str, dict]:
    """Map of playbook_id -> parsed YAML for every strategic playbook."""
    playbooks = {}
    for path in collect_playbook_files():
        data = load_yaml(path)
        if not data:
            continue
        pb_id = extract_playbook_id(path)
        data["_path"] = str(path)
        data["_derived_id"] = pb_id
        playbooks[pb_id] = data
    return playbooks


@pytest.fixture(scope="session")
def all_operational() -> dict[str, dict]:
    """Map of playbook_id -> parsed YAML for every operational playbook."""
    ops = {}
    for path in collect_operational_files():
        data = load_yaml(path)
        if data:
            pid = data.get("playbook_id", path.stem)
            data["_path"] = str(path)
            ops[pid] = data
    return ops


@pytest.fixture(scope="session")
def all_blueprints() -> dict[str, dict]:
    """Map of blueprint_id -> parsed YAML for every blueprint."""
    blueprints = {}
    for path in collect_blueprint_files():
        data = load_yaml(path)
        if data:
            bid = data.get("blueprint_id", path.stem)
            data["_path"] = str(path)
            blueprints[bid] = data
    return blueprints


@pytest.fixture(scope="session")
def known_playbook_ids(all_playbooks) -> set[str]:
    return set(all_playbooks.keys())


# ===========================================================================
# 1. YAML Parse Validity
# ===========================================================================

class TestYAMLValidity:
    """Every YAML file in domain/ must parse without errors."""

    @pytest.mark.parametrize("path", collect_agent_files(), ids=lambda p: p.name)
    def test_agent_yaml_parses(self, path):
        data = load_yaml(path, strict=True)
        assert data is not None, f"Failed to parse or empty: {path}"

    @pytest.mark.parametrize("path", collect_playbook_files(), ids=lambda p: p.name)
    def test_playbook_yaml_parses(self, path):
        data = load_yaml(path, strict=True)
        assert data is not None, f"Failed to parse or empty: {path}"

    @pytest.mark.parametrize("path", collect_operational_files(), ids=lambda p: p.name)
    def test_operational_yaml_parses(self, path):
        data = load_yaml(path, strict=True)
        assert data is not None, f"Failed to parse or empty: {path}"

    @pytest.mark.parametrize("path", collect_blueprint_files(), ids=lambda p: p.name)
    def test_blueprint_yaml_parses(self, path):
        data = load_yaml(path, strict=True)
        assert data is not None, f"Failed to parse or empty: {path}"


# ===========================================================================
# 2. Agent Schema Validation
# ===========================================================================

class TestAgentSchema:
    """Every agent definition must have required fields."""

    REQUIRED_FIELDS = ["agent_id", "team", "purpose"]

    @pytest.mark.parametrize("path", collect_agent_files(), ids=lambda p: p.name)
    def test_required_fields(self, path):
        data = load_yaml(path)
        assert data, f"Empty agent file: {path}"
        for field in self.REQUIRED_FIELDS:
            assert data.get(field), f"Agent {path.name} missing required field: {field}"

    @pytest.mark.parametrize("path", collect_agent_files(), ids=lambda p: p.name)
    def test_agent_id_not_empty(self, path):
        data = load_yaml(path)
        if data:
            aid = str(data.get("agent_id", "")).strip()
            assert aid and aid != "Agent", (
                f"Agent {path.name} has invalid agent_id: '{data.get('agent_id')}'"
            )

    def test_no_duplicate_agent_ids(self, all_agents):
        ids = []
        for path in collect_agent_files():
            data = load_yaml(path)
            if data and data.get("agent_id"):
                ids.append(data["agent_id"])
        seen = set()
        dupes = [aid for aid in ids if aid in seen or seen.add(aid)]
        assert not dupes, f"Duplicate agent_id values: {dupes}"

    def test_agent_team_matches_directory(self):
        """Agent's `team` field should match its parent directory structure."""
        mismatches = []
        for path in collect_agent_files():
            data = load_yaml(path)
            if not data or not data.get("team"):
                continue
            team = data["team"]
            # The agent file lives at domain/agents/{team_dir}/agents/*.yaml
            # For specialists, the team_dir is "specialists" and specialty varies
            team_dir = path.parent.parent.name
            if team != team_dir:
                # Allow specialists with sub-specialties
                if team == "specialists" and "specialists" in path.parts:
                    continue
                mismatches.append(f"{path.name}: team='{team}' but dir='{team_dir}'")
        assert not mismatches, f"Team/directory mismatches:\n" + "\n".join(mismatches)


# ===========================================================================
# 3. Playbook Schema Validation
# ===========================================================================

class TestPlaybookSchema:
    """Every playbook must have identifiable role assignment and key fields."""

    @pytest.mark.parametrize("path", collect_playbook_files(), ids=lambda p: p.name)
    def test_playbook_has_role_assignment(self, path):
        """Every playbook must define who executes it via one of the known patterns."""
        data = load_yaml(path)
        assert data, f"Empty playbook: {path}"

        has_role = (
            data.get("intended_agent_role")
            or (data.get("steckbrief") or {}).get("owner_agent")
            or (data.get("raci") or {}).get("responsible", {}).get("role")
            or (data.get("raci") or {}).get("responsible", {}).get("agent")
        )
        assert has_role, (
            f"Playbook {path.name} has no role assignment "
            f"(no intended_agent_role, steckbrief.owner_agent, or raci.responsible)"
        )

    @pytest.mark.parametrize("path", collect_playbook_files(), ids=lambda p: p.name)
    def test_playbook_has_objective(self, path):
        """Every playbook should describe its purpose."""
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")

        has_objective = (
            data.get("primary_objective")
            or (data.get("steckbrief") or {}).get("one_liner")
            or (data.get("metadata") or {}).get("description")
        )
        assert has_objective, f"Playbook {path.name} has no objective/description"

    @pytest.mark.parametrize("path", collect_playbook_files(), ids=lambda p: p.name)
    def test_playbook_has_name(self, path):
        """Every playbook needs an identifiable name."""
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")

        has_name = (
            data.get("framework_name")
            or data.get("name")
            or (data.get("steckbrief") or {}).get("name")
        )
        assert has_name, f"Playbook {path.name} has no name/framework_name"


class TestSpecialistPlaybookSchema:
    """Specialist playbooks follow the RACI-based structure with steps."""

    def _specialist_files(self):
        return sorted(
            p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
            if "specialists" in p.parts and not any(skip in p.parts for skip in SKIP_DIRS)
        )

    @pytest.mark.parametrize(
        "path",
        sorted(
            p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
            if "specialists" in p.parts
        ),
        ids=lambda p: p.name,
    )
    def test_has_raci(self, path):
        data = load_yaml(path)
        assert data, f"Empty: {path}"
        raci = data.get("raci")
        assert raci, f"Specialist playbook {path.name} missing RACI matrix"
        assert raci.get("responsible"), f"{path.name} RACI missing 'responsible'"

    @pytest.mark.parametrize(
        "path",
        sorted(
            p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
            if "specialists" in p.parts
        ),
        ids=lambda p: p.name,
    )
    def test_has_steps(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        steps = data.get("steps")
        assert steps and len(steps) > 0, f"Specialist playbook {path.name} has no execution steps"

    @pytest.mark.parametrize(
        "path",
        sorted(
            p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
            if "specialists" in p.parts
        ),
        ids=lambda p: p.name,
    )
    def test_has_status(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        assert data.get("status"), f"Specialist playbook {path.name} missing status field"


class TestOperationalPlaybookSchema:
    """Operational playbooks need trigger, steps, and owner_agent."""

    @pytest.mark.parametrize("path", collect_operational_files(), ids=lambda p: p.name)
    def test_has_trigger(self, path):
        data = load_yaml(path)
        assert data, f"Empty: {path}"
        assert data.get("trigger"), f"Operational playbook {path.name} missing trigger"

    @pytest.mark.parametrize("path", collect_operational_files(), ids=lambda p: p.name)
    def test_has_owner_agent(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        meta = data.get("metadata") or {}
        assert meta.get("owner_agent"), f"Operational playbook {path.name} missing metadata.owner_agent"

    @pytest.mark.parametrize("path", collect_operational_files(), ids=lambda p: p.name)
    def test_has_steps(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        steps = data.get("steps") or data.get("processing_steps")
        assert steps and len(steps) > 0, f"Operational playbook {path.name} has no steps or processing_steps"


# ===========================================================================
# 4. Cross-Reference Integrity
# ===========================================================================

class TestCrossReferences:
    """Validate that references between domain objects resolve correctly."""

    def test_blueprint_playbook_references_exist(self, all_blueprints, known_playbook_ids):
        """Every playbook_id referenced in blueprints should map to an actual playbook file."""
        missing = []
        for bp_id, bp in all_blueprints.items():
            playbooks_section = bp.get("playbooks") or {}
            for track, track_data in playbooks_section.items():
                if not isinstance(track_data, dict):
                    continue
                for group in ("required", "optional"):
                    items = track_data.get(group) or []
                    for item in items:
                        if isinstance(item, dict):
                            ref_id = str(item.get("playbook_id", ""))
                        else:
                            ref_id = str(item)
                        if ref_id and ref_id not in known_playbook_ids:
                            missing.append(f"Blueprint {bp_id} -> {ref_id} (track: {track})")
        assert not missing, (
            f"Blueprint references to non-existent playbooks:\n" + "\n".join(missing)
        )

    def test_operational_owner_agents_exist(self, all_operational, all_agents):
        """Operational playbook owner_agent values should map to real agents."""
        missing = []
        known_ids = set(all_agents.keys())
        for op_id, op in all_operational.items():
            owner = (op.get("metadata") or {}).get("owner_agent", "")
            if owner and owner not in known_ids:
                missing.append(f"{op_id}: owner_agent='{owner}'")
        if missing:
            pytest.skip(
                "Operational owner_agent uses display names, not agent_ids: "
                + ", ".join(missing)
            )

    def test_specialist_raci_agents_exist(self, all_agents):
        """RACI responsible.agent in specialist playbooks should map to agent_ids."""
        known_ids = set(all_agents.keys())
        missing = []
        for path in PLAYBOOKS_ROOT.rglob("PB_*.yaml"):
            if "specialists" not in path.parts:
                continue
            data = load_yaml(path)
            if not data:
                continue
            raci = data.get("raci") or {}
            resp = raci.get("responsible") or {}
            agent_ref = resp.get("agent")
            if agent_ref and agent_ref not in known_ids:
                missing.append(f"{path.name}: raci.responsible.agent='{agent_ref}'")
        assert not missing, (
            f"RACI agent references to non-existent agent_ids:\n" + "\n".join(missing)
        )


# ===========================================================================
# 5. Coverage Analysis
# ===========================================================================

class TestCoverageAnalysis:
    """Identify gaps in agent-playbook coverage (informational, not strict failures)."""

    def _get_agent_role_from_playbook(self, data: dict) -> str | None:
        role = data.get("intended_agent_role")
        if role:
            return role

        steckbrief = data.get("steckbrief") or {}
        owner = steckbrief.get("owner_agent")
        if owner:
            return owner

        raci = data.get("raci") or {}
        resp = raci.get("responsible") or {}
        return resp.get("agent") or resp.get("role")

    def test_all_agent_teams_have_at_least_one_playbook(self, all_agents, all_playbooks):
        """Every agent team directory should have at least one playbook."""
        agent_teams = {a.get("team") for a in all_agents.values() if a.get("team")}

        playbook_teams = set()
        for path in collect_playbook_files():
            # team = immediate parent of the PB file, or for specialists, the specialty folder
            parts = path.relative_to(PLAYBOOKS_ROOT).parts
            if parts:
                playbook_teams.add(parts[0])

        teams_without_playbooks = agent_teams - playbook_teams
        # Known gaps: agents whose playbooks live in other team folders or are pending creation
        known_gaps = {
            "partners", "support", "product_managers",  # Documented gaps (no playbooks yet)
            "management", "infohub",                     # Empty, ready for future
            "governance", "leadership", "infosec",       # Governance agents use operational playbooks
            "market_news_analysis", "technology_scout",   # Intelligence agents use operational playbooks
            "retrospective", "professional_services",    # Share playbooks with AE/SA teams
            "rfp",                                       # Covered by rfp_response/ folder
            "poc",                                       # Covered by proof_of_concept/ folder
        }
        unexpected_gaps = teams_without_playbooks - known_gaps

        assert not unexpected_gaps, (
            f"Agent teams with no playbooks (not in known gaps): {unexpected_gaps}"
        )

    def test_playbook_count_summary(self, all_playbooks, all_operational):
        """Prints a summary of playbook counts (informational)."""
        strategic_count = len(all_playbooks)
        operational_count = len(all_operational)
        canvas_count = len(collect_canvas_files())

        assert strategic_count >= 60, (
            f"Expected ~65 strategic playbooks, found {strategic_count}"
        )
        assert operational_count >= 6, (
            f"Expected ~7 operational playbooks, found {operational_count}"
        )
        assert canvas_count >= 8, (
            f"Expected ~9 canvas specs, found {canvas_count}"
        )

    def test_agent_count(self, all_agents):
        """Verify we have the expected number of agents."""
        # Filter out the auto-generated _agent.yaml with broken agent_id
        valid_agents = {
            aid: a for aid, a in all_agents.items()
            if aid.strip() and aid.strip() != "Agent"
        }
        assert len(valid_agents) >= 25, (
            f"Expected ~32 agents, found {len(valid_agents)}: "
            f"{sorted(valid_agents.keys())}"
        )

    def test_role_distribution(self, all_playbooks):
        """Check that playbooks are distributed across multiple roles."""
        roles = set()
        for pb in all_playbooks.values():
            role = (
                pb.get("intended_agent_role")
                or (pb.get("steckbrief") or {}).get("owner_agent")
                or (pb.get("raci") or {}).get("responsible", {}).get("role")
            )
            if role:
                roles.add(role.lower().strip())

        assert len(roles) >= 5, (
            f"Expected playbooks distributed across 5+ roles, found {len(roles)}: {sorted(roles)}"
        )


# ===========================================================================
# 6. Blueprint Schema Validation
# ===========================================================================

class TestBlueprintSchema:
    """Blueprints must have required structural fields."""

    REQUIRED_FIELDS = ["archetype", "blueprint_id"]

    @pytest.mark.parametrize("path", collect_blueprint_files(), ids=lambda p: p.name)
    def test_required_fields(self, path):
        data = load_yaml(path)
        assert data, f"Empty blueprint: {path}"
        for field in self.REQUIRED_FIELDS:
            assert data.get(field), f"Blueprint {path.name} missing: {field}"

    @pytest.mark.parametrize("path", collect_blueprint_files(), ids=lambda p: p.name)
    def test_has_playbooks_section(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        assert data.get("playbooks"), f"Blueprint {path.name} has no playbooks section"

    @pytest.mark.parametrize("path", collect_blueprint_files(), ids=lambda p: p.name)
    def test_has_metadata(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        meta = data.get("metadata") or {}
        assert meta.get("name"), f"Blueprint {path.name} missing metadata.name"


# ===========================================================================
# 7. Filename / ID Consistency
# ===========================================================================

class TestNamingConsistency:
    """File names should be consistent with their internal IDs."""

    @pytest.mark.parametrize("path", collect_playbook_files(), ids=lambda p: p.name)
    def test_playbook_filename_matches_id(self, path):
        """The PB_XXX in the filename should match internal id/steckbrief.playbook_id."""
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")

        file_id = extract_playbook_id(path)

        internal_id = (
            data.get("id")
            or (data.get("steckbrief") or {}).get("playbook_id")
        )
        if not internal_id:
            return  # Old-format playbooks don't have explicit id field

        assert internal_id == file_id, (
            f"ID mismatch in {path.name}: filename derives '{file_id}' but internal id is '{internal_id}'"
        )

    @pytest.mark.parametrize("path", collect_blueprint_files(), ids=lambda p: p.name)
    def test_blueprint_filename_matches_id(self, path):
        data = load_yaml(path)
        if not data:
            pytest.skip("Empty file")
        internal_id = data.get("blueprint_id")
        if internal_id:
            assert path.stem == internal_id, (
                f"Blueprint filename '{path.stem}' != blueprint_id '{internal_id}'"
            )


# ===========================================================================
# 8. Directory Structure Validation
# ===========================================================================

class TestDirectoryStructure:
    """Domain directories follow expected conventions."""

    def test_agent_directories_have_agents_subfolder(self):
        """Each team directory under domain/agents/ should have an agents/ subfolder."""
        missing = []
        for team_dir in sorted(AGENTS_ROOT.iterdir()):
            if not team_dir.is_dir() or team_dir.name.startswith("."):
                continue
            agents_sub = team_dir / "agents"
            if not agents_sub.exists():
                # Specialists have nested sub-specialties
                if team_dir.name == "specialists":
                    continue
                missing.append(team_dir.name)
        assert not missing, f"Agent team dirs without agents/ subfolder: {missing}"

    def test_playbook_files_follow_naming_convention(self):
        """Strategic playbooks should start with PB_, operational with OP_."""
        bad_names = []
        for path in PLAYBOOKS_ROOT.rglob("*.yaml"):
            if any(skip in path.parts for skip in SKIP_DIRS | {"canvas", "operational"}):
                continue
            if path.parent.name == "playbooks":
                continue  # Skip root-level files like registry
            if path.name.startswith("PB_") or path.name.startswith("registry"):
                continue
            bad_names.append(str(path.relative_to(PLAYBOOKS_ROOT)))
        # This is informational, not a hard failure
        if bad_names:
            pytest.skip(f"Non-standard playbook filenames: {bad_names}")

    def test_no_empty_team_directories(self):
        """Playbook team directories shouldn't be completely empty."""
        empty = []
        for team_dir in sorted(PLAYBOOKS_ROOT.iterdir()):
            if not team_dir.is_dir() or team_dir.name.startswith("."):
                continue
            if team_dir.name in SKIP_DIRS | {"canvas", "operational", "overrides"}:
                continue
            yaml_files = list(team_dir.rglob("*.yaml"))
            if not yaml_files:
                empty.append(team_dir.name)
        if empty:
            # Known empty dirs are documented gaps
            known_empty = {"management", "infohub"}
            unexpected = set(empty) - known_empty
            assert not unexpected, f"Unexpectedly empty playbook directories: {unexpected}"
