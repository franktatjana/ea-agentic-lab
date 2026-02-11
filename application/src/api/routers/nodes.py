"""
Nodes API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends

from ..models.schemas import Node, NodeSummary, Realm
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


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
