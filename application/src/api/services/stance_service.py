"""Stance Service for managing stakeholder stance proposals and classifications"""

from datetime import date
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from ..models.schemas import StanceProposal, StanceProposalCreate


# Derivation rules: (sentiment, role_type) → stance
_SENTIMENT_TO_STANCE = {
    "highly_supportive": "champion",
    "supportive": "supporter",
    "skeptical_but_open": "neutral",
    "unknown": "neutral",
    "negative": "blocker",
    "resistant": "blocker",
    "hostile": "blocker",
}

_CHAMPION_ROLE_TYPES = {"champion"}


def derive_stance(stakeholder: dict[str, Any]) -> Optional[str]:
    """Derive stance from stakeholder data using sentiment + role heuristics."""
    sentiment = (
        stakeholder.get("relationship", {}).get("sentiment", "")
        if isinstance(stakeholder.get("relationship"), dict)
        else ""
    )
    role_type = (
        stakeholder.get("role_in_deal", {}).get("type", "")
        if isinstance(stakeholder.get("role_in_deal"), dict)
        else ""
    )
    champion_status = stakeholder.get("champion_status")

    if not sentiment:
        return None

    stance = _SENTIMENT_TO_STANCE.get(sentiment)
    if stance == "champion":
        return "champion"
    if stance == "supporter" and (role_type in _CHAMPION_ROLE_TYPES or champion_status == "active"):
        return "champion"
    return stance


class StanceService:
    """Manages stakeholder stance proposals stored in stakeholder_map.yaml."""

    def __init__(self):
        settings = get_settings()
        self.vault_path = settings.vault_path
        self._realm_id_to_dir: dict[str, str] = {}
        self._build_realm_id_map()

    def _build_realm_id_map(self) -> None:
        if not self.vault_path.exists():
            return
        for realm_dir in self.vault_path.iterdir():
            if realm_dir.is_dir() and not realm_dir.name.startswith(".") and realm_dir.name != "knowledge":
                profile_path = realm_dir / "realm_profile.yaml"
                if profile_path.exists():
                    try:
                        with open(profile_path, "r", encoding="utf-8") as f:
                            profile = yaml.safe_load(f)
                        yaml_id = profile.get("realm_id", realm_dir.name) if profile else realm_dir.name
                        self._realm_id_to_dir[yaml_id] = realm_dir.name
                    except Exception:
                        pass
                self._realm_id_to_dir[realm_dir.name] = realm_dir.name

    def _stakeholder_map_path(self, realm_id: str, node_id: str) -> Path:
        dir_name = self._realm_id_to_dir.get(realm_id, realm_id)
        return (
            self.vault_path / dir_name / node_id
            / "internal-infohub" / "context" / "stakeholder_map.yaml"
        )

    def _load_map(self, realm_id: str, node_id: str) -> Optional[dict[str, Any]]:
        path = self._stakeholder_map_path(realm_id, node_id)
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception:
            return None

    def _save_map(self, realm_id: str, node_id: str, data: dict[str, Any]) -> bool:
        path = self._stakeholder_map_path(realm_id, node_id)
        try:
            with open(path, "w", encoding="utf-8") as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
            return True
        except Exception:
            return False

    def list_proposals(self, realm_id: str, node_id: str) -> list[StanceProposal]:
        data = self._load_map(realm_id, node_id)
        if not data:
            return []
        raw_proposals = data.get("stance_proposals") or []
        proposals = []
        for p in raw_proposals:
            try:
                proposals.append(StanceProposal(**p))
            except Exception:
                continue
        return proposals

    def create_proposal(
        self, realm_id: str, node_id: str, req: StanceProposalCreate
    ) -> Optional[StanceProposal]:
        data = self._load_map(realm_id, node_id)
        if not data:
            return None

        stakeholders = data.get("stakeholders", [])
        target = next((s for s in stakeholders if s.get("stakeholder_id") == req.stakeholder_id), None)
        if not target:
            return None

        proposals = data.get("stance_proposals") or []
        existing_ids = [p.get("proposal_id", "") for p in proposals]
        next_num = max((int(pid.replace("SP_", "")) for pid in existing_ids if pid.startswith("SP_")), default=0) + 1
        proposal_id = f"SP_{next_num:03d}"

        proposal_dict = {
            "proposal_id": proposal_id,
            "stakeholder_id": req.stakeholder_id,
            "stakeholder_name": target.get("name", "Unknown"),
            "current_stance": target.get("stance", ""),
            "proposed_stance": req.proposed_stance,
            "reason": req.reason,
            "proposed_by": req.proposed_by,
            "proposed_date": str(date.today()),
            "source": req.source,
        }

        proposals.append(proposal_dict)
        data["stance_proposals"] = proposals
        if not self._save_map(realm_id, node_id, data):
            return None

        return StanceProposal(**proposal_dict)

    def approve_proposal(
        self, realm_id: str, node_id: str, proposal_id: str, notes: str = ""
    ) -> bool:
        data = self._load_map(realm_id, node_id)
        if not data:
            return False

        proposals = data.get("stance_proposals") or []
        target_proposal = next((p for p in proposals if p.get("proposal_id") == proposal_id), None)
        if not target_proposal:
            return False

        stakeholder_id = target_proposal["stakeholder_id"]
        new_stance = target_proposal["proposed_stance"]

        stakeholders = data.get("stakeholders", [])
        for s in stakeholders:
            if s.get("stakeholder_id") == stakeholder_id:
                s["stance"] = new_stance
                break

        self._update_summary_counts(data)

        data["stance_proposals"] = [p for p in proposals if p.get("proposal_id") != proposal_id]

        changelog = data.get("change_log") or []
        changelog.insert(0, {
            "date": str(date.today()),
            "change": f"Stance updated: {target_proposal.get('stakeholder_name', stakeholder_id)} → {new_stance} (was: {target_proposal.get('current_stance', 'unset')}). {notes}".strip(),
            "by": "human_reviewer",
        })
        data["change_log"] = changelog

        return self._save_map(realm_id, node_id, data)

    def reject_proposal(
        self, realm_id: str, node_id: str, proposal_id: str, reason: str = ""
    ) -> bool:
        data = self._load_map(realm_id, node_id)
        if not data:
            return False

        proposals = data.get("stance_proposals") or []
        target_proposal = next((p for p in proposals if p.get("proposal_id") == proposal_id), None)
        if not target_proposal:
            return False

        data["stance_proposals"] = [p for p in proposals if p.get("proposal_id") != proposal_id]

        changelog = data.get("change_log") or []
        changelog.insert(0, {
            "date": str(date.today()),
            "change": f"Stance proposal rejected: {target_proposal.get('stakeholder_name', '')} → {target_proposal.get('proposed_stance', '')}. Reason: {reason}",
            "by": "human_reviewer",
        })
        data["change_log"] = changelog

        return self._save_map(realm_id, node_id, data)

    def _update_summary_counts(self, data: dict[str, Any]) -> None:
        """Recount stance classifications from stakeholder list."""
        stakeholders = data.get("stakeholders", [])
        counts = {"champion": 0, "supporter": 0, "neutral": 0, "blocker": 0}
        customer_count = 0
        for s in stakeholders:
            stance = s.get("stance")
            if stance in counts:
                counts[stance] += 1
                customer_count += 1

        summary = data.get("summary", {})
        summary["champions"] = counts["champion"]
        summary["supporters"] = counts["supporter"]
        summary["neutral"] = counts["neutral"]
        summary["blockers"] = counts["blocker"]
        summary["customer_stakeholders"] = customer_count
        summary["total_stakeholders"] = len(stakeholders)
        data["summary"] = summary


_stance_service: Optional[StanceService] = None


def get_stance_service() -> StanceService:
    global _stance_service
    if _stance_service is None:
        _stance_service = StanceService()
    return _stance_service
