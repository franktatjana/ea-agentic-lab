"""Vault data router - surfaces meetings, frameworks, journey, opportunities, agent work, infohubs"""
from fastapi import APIRouter, HTTPException, Depends

from ..services.vault_service import get_vault_service, VaultService

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/vault")
async def get_vault_data(
    realm_id: str,
    node_id: str,
    service: VaultService = Depends(get_vault_service),
):
    """Get all unsurfaced vault data for a node."""
    data = service.get_all(realm_id, node_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return data


@router.get("/nodes/{realm_id}/{node_id}/external-infohub")
async def get_external_infohub(
    realm_id: str,
    node_id: str,
    service: VaultService = Depends(get_vault_service),
):
    """Get all customer-facing External InfoHub data for a node."""
    data = service.get_external_infohub(realm_id, node_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return data


@router.get("/nodes/{realm_id}/{node_id}/internal-infohub")
async def get_internal_infohub(
    realm_id: str,
    node_id: str,
    service: VaultService = Depends(get_vault_service),
):
    """Get all vendor-internal InfoHub data for a node."""
    data = service.get_internal_infohub(realm_id, node_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Node not found")
    return data
