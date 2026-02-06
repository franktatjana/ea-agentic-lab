"""
Decisions API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.schemas import Decision, DecisionLog, DecisionSummary, DecisionStatus, DecisionCategory
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/decisions", response_model=DecisionLog)
async def get_decision_log(
    realm_id: str,
    node_id: str,
    status: Optional[DecisionStatus] = Query(None, description="Filter by status"),
    category: Optional[DecisionCategory] = Query(None, description="Filter by category"),
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get decision log for a node"""
    decisions = loader.get_decision_log(realm_id, node_id)
    if not decisions:
        raise HTTPException(
            status_code=404,
            detail=f"Decision log for {realm_id}/{node_id} not found",
        )

    # Apply filters if specified
    if status or category:
        filtered_decisions = decisions.decisions
        if status:
            filtered_decisions = [d for d in filtered_decisions if d.status == status]
        if category:
            filtered_decisions = [
                d for d in filtered_decisions if d.category == category
            ]
        decisions.decisions = filtered_decisions

    return decisions


@router.get("/nodes/{realm_id}/{node_id}/decisions/summary", response_model=DecisionSummary)
async def get_decision_summary(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get decision log summary"""
    decisions = loader.get_decision_log(realm_id, node_id)
    if not decisions:
        raise HTTPException(
            status_code=404,
            detail=f"Decision log for {realm_id}/{node_id} not found",
        )
    return decisions.summary


@router.get("/nodes/{realm_id}/{node_id}/decisions/pending", response_model=list[Decision])
async def get_pending_decisions(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get pending decisions requiring attention"""
    decisions = loader.get_decision_log(realm_id, node_id)
    if not decisions:
        raise HTTPException(
            status_code=404,
            detail=f"Decision log for {realm_id}/{node_id} not found",
        )
    return [d for d in decisions.decisions if d.status == DecisionStatus.pending_approval]


@router.get("/nodes/{realm_id}/{node_id}/decisions/{decision_id}", response_model=Decision)
async def get_decision(
    realm_id: str,
    node_id: str,
    decision_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get a specific decision"""
    decisions = loader.get_decision_log(realm_id, node_id)
    if not decisions:
        raise HTTPException(
            status_code=404,
            detail=f"Decision log for {realm_id}/{node_id} not found",
        )

    for decision in decisions.decisions:
        if decision.decision_id == decision_id:
            return decision

    raise HTTPException(status_code=404, detail=f"Decision {decision_id} not found")
