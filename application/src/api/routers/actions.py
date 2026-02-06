"""
Actions API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.schemas import Action, ActionTracker, ActionSummary, Priority, ActionStatus
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/actions", response_model=ActionTracker)
async def get_action_tracker(
    realm_id: str,
    node_id: str,
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    status: Optional[ActionStatus] = Query(None, description="Filter by status"),
    owner: Optional[str] = Query(None, description="Filter by owner"),
    overdue_only: bool = Query(False, description="Show only overdue actions"),
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get action tracker for a node"""
    actions = loader.get_action_tracker(realm_id, node_id)
    if not actions:
        raise HTTPException(
            status_code=404,
            detail=f"Action tracker for {realm_id}/{node_id} not found",
        )

    # Apply filters if specified
    if priority or status or owner or overdue_only:
        filtered_actions = actions.actions
        if priority:
            filtered_actions = [a for a in filtered_actions if a.priority == priority]
        if status:
            filtered_actions = [a for a in filtered_actions if a.status == status]
        if owner:
            filtered_actions = [
                a for a in filtered_actions if owner.lower() in a.owner.lower()
            ]
        if overdue_only:
            from datetime import date

            today = date.today()
            filtered_actions = [
                a
                for a in filtered_actions
                if a.due_date
                and a.due_date < today
                and a.status not in [ActionStatus.completed, ActionStatus.completed_late]
            ]
        actions.actions = filtered_actions

    return actions


@router.get("/nodes/{realm_id}/{node_id}/actions/summary", response_model=ActionSummary)
async def get_action_summary(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get action tracker summary"""
    actions = loader.get_action_tracker(realm_id, node_id)
    if not actions:
        raise HTTPException(
            status_code=404,
            detail=f"Action tracker for {realm_id}/{node_id} not found",
        )
    return actions.summary


@router.get("/nodes/{realm_id}/{node_id}/actions/{action_id}", response_model=Action)
async def get_action(
    realm_id: str,
    node_id: str,
    action_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get a specific action"""
    actions = loader.get_action_tracker(realm_id, node_id)
    if not actions:
        raise HTTPException(
            status_code=404,
            detail=f"Action tracker for {realm_id}/{node_id} not found",
        )

    for action in actions.actions:
        if action.action_id == action_id:
            return action

    raise HTTPException(status_code=404, detail=f"Action {action_id} not found")
