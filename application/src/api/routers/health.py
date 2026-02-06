"""
Health Score API Router
"""
from fastapi import APIRouter, HTTPException, Depends

from ..models.schemas import HealthScore, HealthAlert
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/health", response_model=HealthScore)
async def get_health_score(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get health score for a node"""
    health = loader.get_health_score(realm_id, node_id)
    if not health:
        raise HTTPException(
            status_code=404,
            detail=f"Health score for {realm_id}/{node_id} not found",
        )
    return health


@router.get("/nodes/{realm_id}/{node_id}/health/alerts", response_model=list[HealthAlert])
async def get_health_alerts(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get active health alerts for a node"""
    health = loader.get_health_score(realm_id, node_id)
    if not health:
        raise HTTPException(
            status_code=404,
            detail=f"Health score for {realm_id}/{node_id} not found",
        )
    return health.alerts.active
