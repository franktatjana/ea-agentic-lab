"""
Nodes API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..models.schemas import (
    Node, NodeSummary, Realm, CreateNodeRequest, CreateNodeResponse,
    StanceProposalCreate, StanceProposalAction,
)
from ..services.yaml_loader import get_yaml_loader, YAMLLoader
from ..services.vault_service import VaultService, get_vault_service
from ..services.stance_service import StanceService, get_stance_service
from ..services.node_service import NodeService, get_node_service

router = APIRouter()


class UpdatePlaybookStatusRequest(BaseModel):
    status: str
    notes: Optional[str] = None


class AddPlaybookRequest(BaseModel):
    playbook_id: str
    name: str
    phase: str = "discovery"
    reason: str


class RemovePlaybookRequest(BaseModel):
    reason: str


@router.get("/realms", response_model=list[Realm])
async def list_realms(
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """List all realms"""
    return loader.list_realms()


@router.get("/realms/{realm_id}", response_model=Realm)
async def get_realm(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get a specific realm"""
    realm = loader.get_realm(realm_id)
    if not realm:
        raise HTTPException(status_code=404, detail=f"Realm {realm_id} not found")
    return realm


@router.get("/realms/{realm_id}/nodes", response_model=list[NodeSummary])
async def list_nodes(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """List all nodes in a realm with summary data"""
    return loader.list_nodes(realm_id)


@router.post("/realms/{realm_id}/nodes", response_model=CreateNodeResponse, status_code=201)
async def create_node(
    realm_id: str,
    body: CreateNodeRequest,
    svc: NodeService = Depends(get_node_service),
):
    """Create a new node with a composed blueprint"""
    response, status_code, message = svc.create_node(realm_id, body)
    if not response:
        raise HTTPException(status_code=status_code, detail=message)
    return response


@router.get("/nodes/{realm_id}/{node_id}", response_model=Node)
async def get_node(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get a specific node profile"""
    node = loader.get_node(realm_id, node_id)
    if not node:
        raise HTTPException(
            status_code=404, detail=f"Node {realm_id}/{node_id} not found"
        )
    return node


@router.get("/nodes/{realm_id}/{node_id}/blueprint")
async def get_blueprint(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get blueprint for a node"""
    data = loader.get_blueprint(realm_id, node_id)
    if not data:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return data


@router.get("/nodes/{realm_id}/{node_id}/stakeholders")
async def get_stakeholders(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get stakeholder map for a node"""
    data = loader.get_stakeholder_map(realm_id, node_id)
    if not data:
        raise HTTPException(status_code=404, detail="Stakeholder map not found")
    return data


@router.get("/nodes/{realm_id}/{node_id}/value")
async def get_value_tracker(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get value tracker for a node"""
    data = loader.get_value_tracker(realm_id, node_id)
    if not data:
        raise HTTPException(status_code=404, detail="Value tracker not found")
    return data


@router.get("/realms/{realm_id}/profile")
async def get_realm_profile(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get full realm profile data"""
    data = loader.get_realm_profile(realm_id)
    if not data:
        raise HTTPException(status_code=404, detail="Realm profile not found")
    return data


@router.patch("/nodes/{realm_id}/{node_id}/blueprint/playbooks/{playbook_id}/status")
async def update_playbook_status(
    realm_id: str,
    node_id: str,
    playbook_id: str,
    body: UpdatePlaybookStatusRequest,
    svc: VaultService = Depends(get_vault_service),
):
    """Update a playbook's status in the node's blueprint"""
    ok, msg, entry = svc.update_blueprint_playbook_status(
        realm_id, node_id, playbook_id, body.status, body.notes,
    )
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "ok", "changelog_entry": entry}


@router.post("/nodes/{realm_id}/{node_id}/blueprint/playbooks")
async def add_blueprint_playbook(
    realm_id: str,
    node_id: str,
    body: AddPlaybookRequest,
    svc: VaultService = Depends(get_vault_service),
):
    """Add a playbook to the node's blueprint"""
    ok, msg, entry = svc.add_blueprint_playbook(
        realm_id, node_id, body.playbook_id, body.name, body.phase, body.reason,
    )
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "ok", "changelog_entry": entry}


@router.delete("/nodes/{realm_id}/{node_id}/blueprint/playbooks/{playbook_id}")
async def remove_blueprint_playbook(
    realm_id: str,
    node_id: str,
    playbook_id: str,
    body: RemovePlaybookRequest,
    svc: VaultService = Depends(get_vault_service),
):
    """Remove a playbook from the node's blueprint (moves to blocked)"""
    ok, msg, entry = svc.remove_blueprint_playbook(
        realm_id, node_id, playbook_id, body.reason,
    )
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "ok", "changelog_entry": entry}


@router.get("/nodes/{realm_id}/{node_id}/blueprint/changelog")
async def get_blueprint_changelog(
    realm_id: str,
    node_id: str,
    svc: VaultService = Depends(get_vault_service),
):
    """Get blueprint modification changelog"""
    changelog = svc.get_blueprint_changelog(realm_id, node_id)
    if changelog is None:
        raise HTTPException(status_code=404, detail="Blueprint not found")
    return changelog


# ==========================================================================
# STANCE PROPOSALS
# ==========================================================================


@router.get("/nodes/{realm_id}/{node_id}/stakeholders/proposals")
async def list_stance_proposals(
    realm_id: str,
    node_id: str,
    svc: StanceService = Depends(get_stance_service),
):
    """List pending stance proposals for a node's stakeholders"""
    return svc.list_proposals(realm_id, node_id)


@router.post("/nodes/{realm_id}/{node_id}/stakeholders/proposals")
async def create_stance_proposal(
    realm_id: str,
    node_id: str,
    body: StanceProposalCreate,
    svc: StanceService = Depends(get_stance_service),
):
    """Create a new stance proposal"""
    proposal = svc.create_proposal(realm_id, node_id, body)
    if not proposal:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    return proposal


@router.post("/nodes/{realm_id}/{node_id}/stakeholders/proposals/{proposal_id}/approve")
async def approve_stance_proposal(
    realm_id: str,
    node_id: str,
    proposal_id: str,
    body: StanceProposalAction,
    svc: StanceService = Depends(get_stance_service),
):
    """Approve a stance proposal, updating the stakeholder's stance"""
    ok = svc.approve_proposal(realm_id, node_id, proposal_id, body.notes or "")
    if not ok:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "ok", "proposal_id": proposal_id, "action": "approved"}


@router.post("/nodes/{realm_id}/{node_id}/stakeholders/proposals/{proposal_id}/reject")
async def reject_stance_proposal(
    realm_id: str,
    node_id: str,
    proposal_id: str,
    body: StanceProposalAction,
    svc: StanceService = Depends(get_stance_service),
):
    """Reject a stance proposal"""
    ok = svc.reject_proposal(realm_id, node_id, proposal_id, body.reason or "")
    if not ok:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "ok", "proposal_id": proposal_id, "action": "rejected"}
