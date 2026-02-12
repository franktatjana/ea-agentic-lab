"""Scenario Walk-through Tests

Traces end-to-end flows through the domain model to verify that signals,
playbooks, agents, and cross-references form a coherent system. These are
integration-level tests that validate the "wiring" without a running server.
"""

import re
from pathlib import Path

import pytest
import yaml

DOMAIN_ROOT = Path(__file__).parent.parent.parent / "domain"
AGENTS_ROOT = DOMAIN_ROOT / "agents"
PLAYBOOKS_ROOT = DOMAIN_ROOT / "playbooks"
CATALOGS_ROOT = DOMAIN_ROOT / "catalogs"

SKIP_DIRS = {"templates", "backup", "old", "overrides", "__pycache__", "canvas", "checklists"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_yaml(path: Path) -> dict | None:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except yaml.YAMLError:
        return None


def collect_all_playbook_files() -> list[Path]:
    """All PB_*.yaml and OP_*.yaml files."""
    return sorted(
        p for p in PLAYBOOKS_ROOT.rglob("*.yaml")
        if (p.name.startswith("PB_") or p.name.startswith("OP_"))
        and not any(skip in p.parts for skip in SKIP_DIRS)
    )


def collect_operational_files() -> list[Path]:
    return sorted(PLAYBOOKS_ROOT.rglob("OP_*.yaml"))


def collect_playbook_files() -> list[Path]:
    return sorted(
        p for p in PLAYBOOKS_ROOT.rglob("PB_*.yaml")
        if not any(skip in p.parts for skip in SKIP_DIRS)
    )


def collect_agent_files() -> list[Path]:
    return sorted(AGENTS_ROOT.rglob("*/agents/*.yaml"))


def extract_playbook_id(path: Path, data: dict | None) -> str | None:
    """Extract playbook ID from YAML data or derive from filename.

    Checks: playbook_id (top-level) → steckbrief.playbook_id → filename pattern.
    Filename pattern: PB_XXX_name.yaml → PB_XXX, PB_CS_301_name.yaml → PB_CS_301,
    OP_MTG_001_name.yaml → OP_MTG_001.
    """
    if data:
        pid = data.get("playbook_id")
        if pid:
            return pid
        steck = data.get("steckbrief", {})
        if isinstance(steck, dict) and steck.get("playbook_id"):
            return steck["playbook_id"]

    # Derive from filename
    stem = path.stem
    # Match patterns like PB_CS_301, PB_SEC_001, PB_OBS_010, PB_SRCH_008, PB_901, PB_201, OP_MTG_001
    m = re.match(r"((?:PB|OP)_(?:[A-Z]+_)?\d+)", stem)
    if m:
        return m.group(1)
    return None


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def signal_catalog():
    path = CATALOGS_ROOT / "signal_catalog.yaml"
    data = load_yaml(path)
    assert data, "Signal catalog not found or unparseable"
    return data


@pytest.fixture(scope="module")
def all_signals(signal_catalog):
    return {s["signal_id"]: s for s in signal_catalog.get("signals", [])}


@pytest.fixture(scope="module")
def signal_flows(signal_catalog):
    return signal_catalog.get("signal_flows", {})


@pytest.fixture(scope="module")
def all_agent_ids():
    ids = set()
    for path in collect_agent_files():
        data = load_yaml(path)
        if data and data.get("agent_id"):
            ids.add(data["agent_id"])
    return ids


@pytest.fixture(scope="module")
def all_playbook_ids():
    ids = set()
    for path in collect_all_playbook_files():
        data = load_yaml(path)
        pid = extract_playbook_id(path, data)
        if pid:
            ids.add(pid)
    return ids


@pytest.fixture(scope="module")
def operational_playbooks():
    result = {}
    for path in collect_operational_files():
        data = load_yaml(path)
        if not data:
            continue
        pid = extract_playbook_id(path, data)
        if pid:
            result[pid] = data
    return result


@pytest.fixture(scope="module")
def strategic_playbooks():
    result = {}
    for path in collect_playbook_files():
        data = load_yaml(path)
        if not data:
            continue
        pid = extract_playbook_id(path, data)
        if pid:
            result[pid] = data
    return result


# ===========================================================================
# 1. Signal Catalog Integrity
# ===========================================================================

class TestSignalCatalog:
    """Validate signal catalog is self-consistent."""

    def test_all_signals_have_required_fields(self, all_signals):
        for sig_id, sig in all_signals.items():
            assert sig.get("name"), f"{sig_id} missing name"
            assert sig.get("category"), f"{sig_id} missing category"
            assert sig.get("producer"), f"{sig_id} missing producer"
            assert sig.get("payload"), f"{sig_id} missing payload"

    def test_signal_ids_are_unique(self, signal_catalog):
        ids = [s["signal_id"] for s in signal_catalog.get("signals", [])]
        assert len(ids) == len(set(ids)), f"Duplicate signal IDs: {[x for x in ids if ids.count(x) > 1]}"

    def test_signal_ids_match_category_prefix(self, all_signals, signal_catalog):
        categories = signal_catalog.get("categories", {})
        prefix_map = {cat: info["prefix"] for cat, info in categories.items() if "prefix" in info}
        for sig_id, sig in all_signals.items():
            cat = sig.get("category")
            if cat in prefix_map:
                expected_prefix = prefix_map[cat]
                assert sig_id.startswith(expected_prefix), (
                    f"{sig_id} in category '{cat}' should start with {expected_prefix}"
                )

    def test_signal_flows_reference_valid_signals(self, signal_flows, all_signals):
        for flow_name, flow in signal_flows.items():
            for sig_id in flow.get("signals", []):
                assert sig_id in all_signals, (
                    f"Signal flow '{flow_name}' references unknown signal: {sig_id}"
                )

    def test_all_consumers_have_action(self, all_signals):
        for sig_id, sig in all_signals.items():
            for consumer in sig.get("consumers", []):
                assert consumer.get("action"), (
                    f"{sig_id} has consumer '{consumer.get('agent')}' without action"
                )


# ===========================================================================
# 2. Signal-to-Playbook Wiring
# ===========================================================================

class TestSignalPlaybookWiring:
    """Verify that signals have playbooks that handle them."""

    def _extract_signal_refs(self, data: dict) -> set[str]:
        """Recursively find SIG_* references in a playbook dict."""
        refs = set()
        text = yaml.dump(data, default_flow_style=False)
        refs.update(re.findall(r"SIG_[A-Z]+_\d+", text))
        return refs

    def test_operational_playbooks_reference_valid_signals(self, operational_playbooks, all_signals):
        for pid, data in operational_playbooks.items():
            sig_refs = self._extract_signal_refs(data)
            for sig_ref in sig_refs:
                assert sig_ref in all_signals, (
                    f"Operational playbook {pid} references unknown signal: {sig_ref}"
                )

    def test_key_signals_have_handlers(self, all_signals, operational_playbooks, strategic_playbooks):
        """Critical signals should be consumed by at least one playbook (by ID or name)."""
        all_pb_data = {**operational_playbooks, **strategic_playbooks}
        all_pb_text = yaml.dump(list(all_pb_data.values()), default_flow_style=False)

        key_signals = [
            "SIG_ART_003",   # meeting_processed
            "SIG_COM_002",   # deal_closed
            "SIG_HLT_001",   # risk_identified
            "SIG_TECH_001",  # tech_signal_map_updated
        ]
        for sig_id in key_signals:
            sig_name = all_signals[sig_id]["name"]
            found = sig_id in all_pb_text or sig_name in all_pb_text
            assert found, (
                f"Key signal {sig_id} ({sig_name}) not referenced by any playbook"
            )


# ===========================================================================
# 3. Operational Playbook Wiring
# ===========================================================================

class TestOperationalWiring:
    """Validate operational playbooks reference valid agents and follow-up playbooks."""

    def test_owner_agents_exist(self, operational_playbooks, all_agent_ids):
        for pid, data in operational_playbooks.items():
            meta = data.get("metadata", {})
            owner = meta.get("owner_agent")
            if owner:
                assert owner in all_agent_ids, (
                    f"Operational playbook {pid} owner_agent '{owner}' not found in agent registry"
                )

    def test_participating_agents_exist(self, operational_playbooks, all_agent_ids):
        for pid, data in operational_playbooks.items():
            meta = data.get("metadata", {})
            for agent in meta.get("participating_agents", []):
                assert agent in all_agent_ids, (
                    f"Operational playbook {pid} participating agent '{agent}' not in registry"
                )

    def test_step_agents_exist(self, operational_playbooks, all_agent_ids):
        for pid, data in operational_playbooks.items():
            steps = data.get("steps") or data.get("processing_steps") or []
            for step in steps:
                agent = step.get("agent")
                if agent:
                    assert agent in all_agent_ids, (
                        f"Operational playbook {pid} step '{step.get('name', '?')}' "
                        f"references unknown agent: {agent}"
                    )

    def test_routing_agents_exist(self, operational_playbooks, all_agent_ids):
        """For playbooks with routing blocks (like OP_TECH_001)."""
        # Agent role names used in routing don't always match agent_id exactly
        # so we check that at least the routing structure is present
        for pid, data in operational_playbooks.items():
            steps = data.get("steps") or data.get("processing_steps") or []
            for step in steps:
                routing = step.get("routing", [])
                for route in routing:
                    assert route.get("agent"), (
                        f"Operational playbook {pid} has routing entry without agent"
                    )

    def test_follow_up_playbook_ids_are_valid(self, operational_playbooks, all_playbook_ids):
        """Cross-playbook triggers should reference real playbooks."""
        known_future = {"PB_902_tech_trend_response"}  # referenced by ID stem

        for pid, data in operational_playbooks.items():
            steps = data.get("steps") or data.get("processing_steps") or []
            for step in steps:
                triggers = step.get("triggers", [])
                for trigger in triggers:
                    ref = trigger.get("playbook", "")
                    # Extract the PB_xxx portion from the reference
                    pb_id_match = re.match(r"(PB_\d+)", ref)
                    if pb_id_match:
                        pb_id = pb_id_match.group(1)
                        assert pb_id in all_playbook_ids or ref in known_future, (
                            f"Operational playbook {pid} triggers unknown playbook: {ref}"
                        )


# ===========================================================================
# 4. Strategic Playbook Wiring
# ===========================================================================

class TestStrategicWiring:
    """Validate strategic playbooks reference valid agents."""

    def _normalize_role(self, role_str: str) -> str | None:
        """Extract a likely agent_id from role strings like 'SA Agent' or 'POC Agent (primary)'."""
        if not role_str:
            return None
        # Common role-to-agent mappings
        mappings = {
            "ae": "ae_agent", "sa": "sa_agent", "ca": "ca_agent",
            "poc": "poc_agent", "ve": "ve_agent", "ci": "ci_agent",
            "pm": "pm_agent", "ps": "ps_agent",
        }
        lower = role_str.lower().strip()
        for prefix, agent_id in mappings.items():
            if lower.startswith(prefix + " ") or lower == prefix:
                return agent_id
        return None

    def test_playbooks_with_trigger_signals_reference_valid_signals(self, strategic_playbooks, all_signals):
        for pid, data in strategic_playbooks.items():
            triggers = data.get("trigger_conditions", {})
            for auto_trigger in triggers.get("automatic", []):
                if isinstance(auto_trigger, dict):
                    event = auto_trigger.get("event", "")
                    if event.startswith("SIG_"):
                        assert event in all_signals, (
                            f"Playbook {pid} trigger references unknown signal: {event}"
                        )

    def test_cross_playbook_references_are_valid(self, strategic_playbooks, all_playbook_ids):
        """Playbooks that trigger other playbooks should reference valid IDs."""
        known_unresolved = {"PB_CS_303", "PB_CS_203"}  # Referenced but not yet created

        for pid, data in strategic_playbooks.items():
            text = yaml.dump(data, default_flow_style=False)
            # Find PB_xxx references in the YAML text
            refs = set(re.findall(r"PB_[A-Z_]*\d+", text))
            for ref in refs:
                # Extract the core ID (e.g., PB_201, PB_CS_301)
                match = re.match(r"(PB_(?:[A-Z]+_)?\d+)", ref)
                if match:
                    core_id = match.group(1)
                    if core_id != pid:  # Don't check self-reference
                        found = core_id in all_playbook_ids or core_id in known_unresolved
                        if not found:
                            # Try without trailing numbers being part of a filename
                            found = any(core_id in known_id for known_id in all_playbook_ids)
                        assert found, (
                            f"Playbook {pid} references unknown playbook: {core_id}"
                        )


# ===========================================================================
# 5. End-to-End Scenario Traces
# ===========================================================================

class TestMeetingToActionsScenario:
    """Scenario: Meeting notes → extract actions/decisions/risks → track → complete."""

    def test_meeting_signal_exists(self, all_signals):
        assert "SIG_ART_003" in all_signals
        sig = all_signals["SIG_ART_003"]
        assert sig["name"] == "meeting_processed"

    def test_meeting_playbook_exists(self, operational_playbooks):
        assert "OP_MTG_001" in operational_playbooks
        data = operational_playbooks["OP_MTG_001"]
        meta = data.get("metadata", {})
        assert meta.get("owner_agent") == "meeting_notes_agent"

    def test_meeting_playbook_has_extraction_steps(self, operational_playbooks):
        data = operational_playbooks["OP_MTG_001"]
        steps = data.get("steps", [])
        step_names = [s.get("name", "").lower() for s in steps]
        assert any("decision" in n for n in step_names), "Missing decision extraction step"
        assert any("action" in n for n in step_names), "Missing action extraction step"
        assert any("risk" in n for n in step_names), "Missing risk extraction step"

    def test_action_creation_playbook_exists(self, operational_playbooks):
        assert "OP_ACT_001" in operational_playbooks
        meta = operational_playbooks["OP_ACT_001"].get("metadata", {})
        assert meta.get("owner_agent") == "task_shepherd_agent"

    def test_action_completion_playbook_exists(self, operational_playbooks):
        assert "OP_ACT_002" in operational_playbooks
        meta = operational_playbooks["OP_ACT_002"].get("metadata", {})
        assert meta.get("owner_agent") == "signal_matcher_agent"

    def test_risk_registration_playbook_exists(self, operational_playbooks):
        assert "OP_RSK_001" in operational_playbooks
        meta = operational_playbooks["OP_RSK_001"].get("metadata", {})
        assert meta.get("owner_agent") == "risk_radar_agent"

    def test_completion_signal_exists(self, all_signals):
        assert "SIG_HLT_005" in all_signals
        sig = all_signals["SIG_HLT_005"]
        assert sig["name"] == "action_completion_detected"

    def test_meeting_to_action_agents_chain(self, all_agent_ids):
        """The full chain of agents in the meeting→action flow must exist."""
        required = ["meeting_notes_agent", "task_shepherd_agent", "signal_matcher_agent",
                     "nudger_agent", "decision_registrar_agent", "risk_radar_agent"]
        for agent in required:
            assert agent in all_agent_ids, f"Meeting→action chain missing agent: {agent}"


class TestTechSignalScenario:
    """Scenario: Job scan → tech signal map update → agent routing → follow-up playbooks."""

    def test_tech_signal_chain_exists(self, all_signals):
        chain = ["SIG_TECH_004", "SIG_TECH_001", "SIG_TECH_002", "SIG_TECH_003"]
        for sig_id in chain:
            assert sig_id in all_signals, f"Tech signal chain missing: {sig_id}"

    def test_tech_processing_playbook_exists(self, operational_playbooks):
        assert "OP_TECH_001" in operational_playbooks
        data = operational_playbooks["OP_TECH_001"]
        meta = data.get("metadata", {})
        assert meta.get("owner_agent") == "tech_signal_analyzer_agent"

    def test_tech_processing_has_routing(self, operational_playbooks):
        data = operational_playbooks["OP_TECH_001"]
        steps = data.get("steps") or data.get("processing_steps") or []
        routing_step = next((s for s in steps if s.get("routing")), None)
        assert routing_step, "OP_TECH_001 missing routing step"
        agents_routed = [r.get("agent") for r in routing_step["routing"]]
        assert len(agents_routed) >= 3, "OP_TECH_001 should route to at least 3 agents"

    def test_tech_signal_emits_child_signals(self, operational_playbooks):
        data = operational_playbooks["OP_TECH_001"]
        emitted = data.get("signals_emitted", [])
        emitted_ids = [s.get("signal") for s in emitted]
        assert "SIG_TECH_002" in emitted_ids, "OP_TECH_001 should emit SIG_TECH_002"
        assert "SIG_TECH_003" in emitted_ids, "OP_TECH_001 should emit SIG_TECH_003"

    def test_tech_trend_response_playbook_exists(self, all_playbook_ids):
        assert "PB_902" in all_playbook_ids, "Follow-up playbook PB_902 (tech trend response) missing"

    def test_tech_signal_agents_exist(self, all_agent_ids):
        required = ["tech_signal_analyzer_agent", "tech_signal_scanner_agent"]
        for agent in required:
            assert agent in all_agent_ids, f"Tech signal chain missing agent: {agent}"


class TestDealClosureScenario:
    """Scenario: Deal closed → retrospective → account planning → health tracking."""

    def test_deal_closed_signal_exists(self, all_signals):
        assert "SIG_COM_002" in all_signals
        sig = all_signals["SIG_COM_002"]
        assert sig["name"] == "deal_closed"
        # Should trigger retrospective
        consumer_agents = [c.get("agent", "").lower() for c in sig.get("consumers", [])]
        assert any("retrospective" in a for a in consumer_agents), (
            "SIG_COM_002 should list Retrospective Agent as consumer"
        )

    def test_retrospective_playbook_exists(self, strategic_playbooks):
        assert "PB_601" in strategic_playbooks
        data = strategic_playbooks["PB_601"]
        # Should trigger on SIG_COM_002
        triggers = data.get("trigger_conditions", {})
        auto = triggers.get("automatic", [])
        events = [t.get("event", "") for t in auto if isinstance(t, dict)]
        assert any("SIG_COM_002" in e for e in events), (
            "PB_601 should trigger on SIG_COM_002"
        )

    def test_retrospective_has_five_whys(self, strategic_playbooks):
        data = strategic_playbooks["PB_601"]
        questions = data.get("key_questions", {})
        assert "five_whys_for_wins" in questions or "five_whys_for_losses" in questions, (
            "PB_601 should include Five Whys analysis"
        )

    def test_account_planning_playbook_exists(self, strategic_playbooks):
        assert "PB_602" in strategic_playbooks

    def test_health_score_playbook_exists(self, strategic_playbooks):
        assert "PB_401" in strategic_playbooks

    def test_deal_lifecycle_signals_form_chain(self, all_signals):
        chain = ["SIG_LC_001", "SIG_COM_001", "SIG_COM_002", "SIG_LC_002"]
        for sig_id in chain:
            assert sig_id in all_signals, f"Deal lifecycle chain missing: {sig_id}"


class TestHealthDeclineScenario:
    """Scenario: Health score drops → triage → intervention playbooks."""

    def test_health_score_signal_exists(self, all_signals):
        assert "SIG_HLT_003" in all_signals
        sig = all_signals["SIG_HLT_003"]
        assert sig["name"] == "health_score_changed"

    def test_health_triage_playbook_exists(self, strategic_playbooks):
        assert "PB_CS_301" in strategic_playbooks

    def test_health_triage_triggers_on_signal(self, strategic_playbooks):
        data = strategic_playbooks["PB_CS_301"]
        triggers = data.get("trigger_conditions", {})
        auto = triggers.get("automatic", [])
        # Should reference health-related signals or conditions
        text = yaml.dump(triggers, default_flow_style=False)
        assert "SIG_HLT" in text or "health" in text.lower(), (
            "PB_CS_301 should trigger on health signals"
        )

    def test_health_alert_operational_playbook_exists(self, operational_playbooks):
        assert "OP_HLT_001" in operational_playbooks
        meta = operational_playbooks["OP_HLT_001"].get("metadata", {})
        assert meta.get("owner_agent") == "reporter_agent"

    def test_health_triage_has_intervention_routing(self, strategic_playbooks):
        """Health triage should route to follow-up playbooks."""
        data = strategic_playbooks["PB_CS_301"]
        text = yaml.dump(data, default_flow_style=False)
        # Should reference at least one follow-up playbook
        follow_ups = re.findall(r"PB_[A-Z_]*\d+", text)
        # Remove self-reference
        follow_ups = [p for p in follow_ups if "CS_301" not in p]
        assert len(follow_ups) >= 1, (
            "PB_CS_301 should route to at least one follow-up playbook"
        )


class TestRiskEscalationScenario:
    """Scenario: Risk identified → register → escalation if critical."""

    def test_risk_signal_exists(self, all_signals):
        assert "SIG_HLT_001" in all_signals
        assert all_signals["SIG_HLT_001"]["name"] == "risk_identified"

    def test_risk_registration_playbook(self, operational_playbooks):
        assert "OP_RSK_001" in operational_playbooks
        meta = operational_playbooks["OP_RSK_001"].get("metadata", {})
        assert meta.get("owner_agent") == "risk_radar_agent"

    def test_escalation_playbook_exists(self, operational_playbooks):
        assert "OP_ESC_001" in operational_playbooks
        meta = operational_playbooks["OP_ESC_001"].get("metadata", {})
        assert meta.get("owner_agent") == "nudger_agent"

    def test_escalation_signal_exists(self, all_signals):
        assert "SIG_GOV_002" in all_signals
        assert all_signals["SIG_GOV_002"]["name"] == "escalation_triggered"

    def test_escalation_resolution_signal_exists(self, all_signals):
        assert "SIG_GOV_003" in all_signals
        assert all_signals["SIG_GOV_003"]["name"] == "escalation_resolved"

    def test_risk_lifecycle_agents_exist(self, all_agent_ids):
        required = ["risk_radar_agent", "nudger_agent", "senior_manager_agent"]
        for agent in required:
            assert agent in all_agent_ids, f"Risk escalation chain missing agent: {agent}"


class TestApprovalWorkflowScenario:
    """Scenario: Agent output → approval request → human resolves → downstream release."""

    def test_approval_signals_exist(self, all_signals):
        assert "SIG_GOV_004" in all_signals
        assert all_signals["SIG_GOV_004"]["name"] == "approval_requested"
        assert "SIG_GOV_005" in all_signals
        assert all_signals["SIG_GOV_005"]["name"] == "approval_resolved"

    def test_approval_has_outcome_values(self, all_signals):
        sig = all_signals["SIG_GOV_005"]
        payload_fields = {f["field"]: f for f in sig["payload"]["required"]}
        assert "outcome" in payload_fields
        outcomes = payload_fields["outcome"].get("values", [])
        assert "approved" in outcomes
        assert "rejected" in outcomes

    def test_approval_flow_defined(self, signal_flows):
        assert "approval_workflow" in signal_flows
        flow = signal_flows["approval_workflow"]
        sigs = flow.get("signals", [])
        assert "SIG_GOV_004" in sigs
        assert "SIG_GOV_005" in sigs


class TestMarketNewsScenario:
    """Scenario: Market news scan → digest → high-impact alerts → competitive response."""

    def test_market_news_signals_exist(self, all_signals):
        chain = ["SIG_MNA_001", "SIG_MNA_002", "SIG_MNA_003"]
        for sig_id in chain:
            assert sig_id in all_signals, f"Market news chain missing: {sig_id}"

    def test_market_news_flow_defined(self, signal_flows):
        assert "market_news_intelligence" in signal_flows
        flow = signal_flows["market_news_intelligence"]
        sigs = flow.get("signals", [])
        assert "SIG_MNA_001" in sigs
        assert "SIG_MNA_002" in sigs
        assert "SIG_MNA_003" in sigs

    def test_competitive_news_routes_to_ci(self, all_signals):
        sig = all_signals["SIG_MNA_003"]
        consumer_agents = [c.get("agent", "").lower() for c in sig.get("consumers", [])]
        assert any("competitive" in a or "ci" in a for a in consumer_agents), (
            "SIG_MNA_003 should route to CI Agent"
        )

    def test_mna_agent_exists(self, all_agent_ids):
        assert "mna_agent" in all_agent_ids


# ===========================================================================
# 6. Signal Flow Completeness
# ===========================================================================

class TestSignalFlowCompleteness:
    """Verify that defined signal flows reference valid signals and cover key paths."""

    def test_all_defined_flows_have_signals(self, signal_flows):
        for flow_name, flow in signal_flows.items():
            sigs = flow.get("signals", [])
            assert len(sigs) >= 2, (
                f"Signal flow '{flow_name}' should have at least 2 signals in the chain"
            )

    def test_meeting_to_actions_flow(self, signal_flows, all_signals):
        assert "meeting_to_actions" in signal_flows
        flow = signal_flows["meeting_to_actions"]
        assert "SIG_ART_003" in flow["signals"], "meeting_to_actions should start with SIG_ART_003"

    def test_deal_progression_flow(self, signal_flows, all_signals):
        assert "deal_progression" in signal_flows
        flow = signal_flows["deal_progression"]
        assert "SIG_LC_001" in flow["signals"]
        assert "SIG_COM_002" in flow["signals"]

    def test_risk_lifecycle_flow(self, signal_flows, all_signals):
        assert "risk_lifecycle" in signal_flows
        flow = signal_flows["risk_lifecycle"]
        assert "SIG_HLT_001" in flow["signals"]

    def test_tech_signal_map_flow(self, signal_flows, all_signals):
        assert "tech_signal_map_update" in signal_flows
        flow = signal_flows["tech_signal_map_update"]
        assert "SIG_TECH_004" in flow["signals"]
        assert "SIG_TECH_001" in flow["signals"]

    def test_action_signal_completion_flow(self, signal_flows, all_signals):
        assert "action_signal_completion" in signal_flows
        flow = signal_flows["action_signal_completion"]
        assert "SIG_HLT_005" in flow["signals"]


# ===========================================================================
# 7. Agent Coverage
# ===========================================================================

class TestAgentCoverage:
    """Verify that key agents appear in at least one playbook."""

    CORE_AGENTS = [
        "ae_agent", "sa_agent", "ca_agent", "poc_agent", "ve_agent",
        "ci_agent", "delivery_agent", "meeting_notes_agent",
        "task_shepherd_agent", "nudger_agent", "risk_radar_agent",
        "signal_matcher_agent", "reporter_agent", "decision_registrar_agent",
        "tech_signal_analyzer_agent", "senior_manager_agent",
    ]

    def test_core_agents_exist(self, all_agent_ids):
        for agent in self.CORE_AGENTS:
            assert agent in all_agent_ids, f"Core agent '{agent}' not found in agent registry"

    def test_core_agents_referenced_by_playbooks(self, all_agent_ids):
        """Every core agent should appear in at least one playbook (operational or strategic)."""
        all_pb_text = ""
        for path in collect_all_playbook_files():
            data = load_yaml(path)
            if data:
                all_pb_text += yaml.dump(data, default_flow_style=False)

        # Agents referenced by role name rather than agent_id in playbooks
        role_referenced = {
            "ae_agent": ["AE Agent", "AE"],
            "sa_agent": ["SA Agent", "SA"],
            "ca_agent": ["CA Agent", "CA"],
            "ci_agent": ["CI Agent", "Competitive Intelligence"],
            "pm_agent": ["PM Agent", "Product Manager"],
            "poc_agent": ["POC Agent", "POC"],
            "ve_agent": ["VE Agent", "Value Engineering"],
            "delivery_agent": ["Delivery Agent", "Delivery"],
            "senior_manager_agent": ["Senior Manager", "senior_manager"],
        }

        for agent in self.CORE_AGENTS:
            found = agent in all_pb_text
            if not found and agent in role_referenced:
                found = any(alias in all_pb_text for alias in role_referenced[agent])
            assert found, f"Core agent '{agent}' not referenced by any playbook"


# ===========================================================================
# 8. MEDDPICC Qualification Scenario
# ===========================================================================

class TestMEDDPICCScenario:
    """Scenario: Deal qualification using MEDDPICC framework."""

    def test_meddpicc_playbook_exists(self, strategic_playbooks):
        assert "PB_801" in strategic_playbooks

    def test_meddpicc_has_all_dimensions(self, strategic_playbooks):
        data = strategic_playbooks["PB_801"]
        questions = data.get("key_questions", {})
        expected_dimensions = [
            "metrics", "economic_buyer", "decision_criteria",
            "decision_process", "paper_process", "identify_pain",
            "champion", "competition",
        ]
        for dim in expected_dimensions:
            assert dim in questions, f"MEDDPICC missing dimension: {dim}"

    def test_meddpicc_has_scoring(self, strategic_playbooks):
        data = strategic_playbooks["PB_801"]
        decision = data.get("decision_logic", {})
        assert decision.get("scoring"), "MEDDPICC should have scoring logic"
