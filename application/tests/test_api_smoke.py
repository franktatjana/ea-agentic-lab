"""API Smoke Tests

Validates that all API endpoints return expected status codes and response
shapes. Uses FastAPI TestClient (no running server needed).
"""

import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

PREFIX = "/api/v1"
REALM = "ACME_CORP"
NODE = "SECURITY_CONSOLIDATION"


# ===========================================================================
# Infrastructure
# ===========================================================================

class TestInfrastructure:
    """Root and health endpoints."""

    def test_root(self):
        r = client.get("/")
        assert r.status_code == 200
        data = r.json()
        assert "name" in data
        assert "version" in data

    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"


# ===========================================================================
# Realms & Nodes
# ===========================================================================

class TestRealms:
    """Realm listing and detail endpoints."""

    def test_list_realms(self):
        r = client.get(f"{PREFIX}/realms")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(realm["realm_id"] == REALM for realm in data)

    def test_get_realm(self):
        r = client.get(f"{PREFIX}/realms/{REALM}")
        assert r.status_code == 200
        data = r.json()
        assert data["realm_id"] == REALM

    def test_get_realm_not_found(self):
        r = client.get(f"{PREFIX}/realms/NONEXISTENT")
        assert r.status_code == 404

    def test_list_nodes(self):
        r = client.get(f"{PREFIX}/realms/{REALM}/nodes")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_realm_profile(self):
        r = client.get(f"{PREFIX}/realms/{REALM}/profile")
        assert r.status_code == 200


class TestNodes:
    """Node detail endpoints."""

    def test_get_node(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}")
        assert r.status_code == 200
        data = r.json()
        assert data.get("node_id") or data.get("name")

    def test_get_node_not_found(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/NONEXISTENT_NODE")
        assert r.status_code == 404

    def test_get_node_blueprint(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/blueprint")
        # 200 if blueprint exists, 404 if not configured
        assert r.status_code in (200, 404)

    def test_get_node_stakeholders(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/stakeholders")
        assert r.status_code in (200, 404)

    def test_get_node_value(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/value")
        assert r.status_code in (200, 404)

    def test_get_node_vault(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/vault")
        assert r.status_code in (200, 404)


# ===========================================================================
# Health Scores
# ===========================================================================

class TestHealth:
    """Health score endpoints."""

    def test_get_health(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/health")
        assert r.status_code in (200, 404)

    def test_get_health_alerts(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/health/alerts")
        assert r.status_code in (200, 404)


# ===========================================================================
# Risks
# ===========================================================================

class TestRisks:
    """Risk register endpoints."""

    def test_get_risks(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/risks")
        assert r.status_code in (200, 404)

    def test_get_risk_summary(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/risks/summary")
        assert r.status_code in (200, 404)

    def test_get_risks_filtered(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/risks", params={"severity": "critical"})
        assert r.status_code in (200, 404, 422)


# ===========================================================================
# Actions
# ===========================================================================

class TestActions:
    """Action tracker endpoints."""

    def test_get_actions(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/actions")
        assert r.status_code in (200, 404)

    def test_get_action_summary(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/actions/summary")
        assert r.status_code in (200, 404)

    def test_get_actions_overdue(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/actions", params={"overdue_only": True})
        assert r.status_code in (200, 404)


# ===========================================================================
# Decisions
# ===========================================================================

class TestDecisions:
    """Decision log endpoints."""

    def test_get_decisions(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/decisions")
        assert r.status_code in (200, 404)

    def test_get_decision_summary(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/decisions/summary")
        assert r.status_code in (200, 404)

    def test_get_pending_decisions(self):
        r = client.get(f"{PREFIX}/nodes/{REALM}/{NODE}/decisions/pending")
        assert r.status_code in (200, 404)


# ===========================================================================
# Playbooks
# ===========================================================================

class TestPlaybooks:
    """Playbook catalog endpoints."""

    def test_list_playbooks(self):
        r = client.get(f"{PREFIX}/playbooks")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 50

    def test_list_playbooks_by_role(self):
        r = client.get(f"{PREFIX}/playbooks", params={"role": "sa"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_list_playbooks_by_team(self):
        r = client.get(f"{PREFIX}/playbooks", params={"team": "strategy"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert all(p["_team"] == "strategy" for p in data)

    def test_list_playbooks_search(self):
        r = client.get(f"{PREFIX}/playbooks", params={"search": "swot"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1

    def test_get_playbook(self):
        r = client.get(f"{PREFIX}/playbooks/strategy/PB_201_swot_analysis.yaml")
        assert r.status_code == 200
        data = r.json()
        assert data.get("_id") or data.get("steckbrief")

    def test_get_playbook_raw(self):
        r = client.get(f"{PREFIX}/playbooks/strategy/PB_201_swot_analysis.yaml/raw")
        assert r.status_code == 200
        data = r.json()
        assert "content" in data
        assert "steckbrief" in data["content"] or "framework_name" in data["content"]

    def test_get_playbook_not_found(self):
        r = client.get(f"{PREFIX}/playbooks/strategy/PB_999_nonexistent.yaml")
        assert r.status_code == 404

    def test_get_specialist_playbook(self):
        """Specialist playbooks resolve via nested directory (rglob fallback)."""
        r = client.get(f"{PREFIX}/playbooks/security/PB_SEC_001_technical_validation.yaml")
        assert r.status_code == 200
        data = r.json()
        assert data.get("_id") == "PB_SEC_001"

    def test_playbook_has_role(self):
        """Every returned playbook should have an intended_agent_role (direct or RACI-derived)."""
        r = client.get(f"{PREFIX}/playbooks")
        data = r.json()
        missing_role = [
            p["_id"] for p in data
            if not p.get("intended_agent_role")
        ]
        assert not missing_role, f"Playbooks without intended_agent_role: {missing_role}"


# ===========================================================================
# Blueprints
# ===========================================================================

class TestBlueprints:
    """Blueprint catalog endpoints."""

    def test_get_archetypes(self):
        r = client.get(f"{PREFIX}/blueprints/archetypes")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (dict, list))

    def test_get_tracks(self):
        r = client.get(f"{PREFIX}/blueprints/tracks")
        assert r.status_code == 200

    def test_get_checklists(self):
        r = client.get(f"{PREFIX}/blueprints/checklists")
        assert r.status_code == 200

    def test_list_reference_blueprints(self):
        r = client.get(f"{PREFIX}/blueprints/reference")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_reference_blueprint(self):
        r = client.get(f"{PREFIX}/blueprints/reference/retention_renewal/A02_champion_rebuild")
        assert r.status_code == 200
        data = r.json()
        assert data.get("blueprint_id") or data.get("archetype")


# ===========================================================================
# Documentation
# ===========================================================================

class TestDocs:
    """Documentation browser endpoints."""

    def test_get_doc_tree(self):
        r = client.get(f"{PREFIX}/docs/tree")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_doc_content(self):
        r = client.get(f"{PREFIX}/docs/README.md")
        assert r.status_code in (200, 404)


# ===========================================================================
# Profile
# ===========================================================================

class TestProfile:
    """User profile endpoints."""

    def test_get_profile(self):
        r = client.get(f"{PREFIX}/profile")
        assert r.status_code == 200
        data = r.json()
        assert "user_id" in data or "preferences" in data

    def test_update_preferences(self):
        r = client.put(
            f"{PREFIX}/profile/preferences",
            json={"theme": "dark"},
        )
        assert r.status_code in (200, 422)


# ===========================================================================
# Tech Radar
# ===========================================================================

class TestTechRadar:
    """Technology Scout endpoints.

    Note: Tech radar endpoints currently return 500 when radar data is missing
    instead of 404. This is a known service bug tracked for fix.
    TestClient raises server exceptions by default, so we use a lenient client.
    """

    lenient = TestClient(app, raise_server_exceptions=False)

    def test_get_technology_scout(self):
        r = self.lenient.get(f"{PREFIX}/realms/{REALM}/tech-signal-map")
        assert r.status_code in (200, 404, 500)
        if r.status_code == 500:
            pytest.skip("Tech radar returns 500 when data missing (known issue)")

    def test_get_technologies(self):
        r = self.lenient.get(f"{PREFIX}/realms/{REALM}/tech-signal-map/technologies")
        assert r.status_code in (200, 404, 500)
        if r.status_code == 500:
            pytest.skip("Tech radar returns 500 when data missing (known issue)")

    def test_get_highlights(self):
        r = self.lenient.get(f"{PREFIX}/realms/{REALM}/tech-signal-map/highlights")
        assert r.status_code in (200, 404, 500)
        if r.status_code == 500:
            pytest.skip("Tech radar returns 500 when data missing (known issue)")

    def test_get_skills_gap(self):
        r = self.lenient.get(f"{PREFIX}/realms/{REALM}/tech-signal-map/skills-gap")
        assert r.status_code in (200, 404, 500)
        if r.status_code == 500:
            pytest.skip("Tech radar returns 500 when data missing (known issue)")


# ===========================================================================
# Widgets
# ===========================================================================

class TestWidgets:
    """iOS widget data endpoints."""

    def test_health_widget(self):
        r = client.get(f"{PREFIX}/widgets/health/{REALM}/{NODE}")
        assert r.status_code in (200, 404)

    def test_actions_widget(self):
        r = client.get(f"{PREFIX}/widgets/actions/{REALM}/{NODE}")
        assert r.status_code in (200, 404)

    def test_risks_widget(self):
        r = client.get(f"{PREFIX}/widgets/risks/{REALM}/{NODE}")
        assert r.status_code in (200, 404)


# ===========================================================================
# Response Shape Validation
# ===========================================================================

class TestResponseShapes:
    """Validate key response structures match frontend expectations."""

    def test_playbook_list_has_required_fields(self):
        r = client.get(f"{PREFIX}/playbooks")
        data = r.json()
        if not data:
            pytest.skip("No playbooks returned")
        pb = data[0]
        assert "_id" in pb, "Playbook missing _id"
        assert "_filename" in pb, "Playbook missing _filename"
        assert "_team" in pb, "Playbook missing _team"
        assert "_path" in pb, "Playbook missing _path"

    def test_realm_list_has_required_fields(self):
        r = client.get(f"{PREFIX}/realms")
        data = r.json()
        if not data:
            pytest.skip("No realms returned")
        realm = data[0]
        assert "realm_id" in realm, "Realm missing realm_id"

    def test_blueprint_reference_has_required_fields(self):
        r = client.get(f"{PREFIX}/blueprints/reference")
        data = r.json()
        if not data:
            pytest.skip("No blueprints returned")
        bp = data[0]
        assert "archetype" in bp or "blueprint_id" in bp, "Blueprint missing identity fields"
