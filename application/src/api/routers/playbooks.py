"""Playbooks API Router"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..services.playbook_service import PlaybookService, get_playbook_service

router = APIRouter()


class RawYAMLBody(BaseModel):
    content: str


class FieldUpdateBody(BaseModel):
    updates: dict


@router.get("/playbooks")
async def list_playbooks(
    role: Optional[str] = None,
    status: Optional[str] = None,
    team: Optional[str] = None,
    search: Optional[str] = None,
    svc: PlaybookService = Depends(get_playbook_service),
):
    """List all playbooks with optional filters"""
    return svc.list_playbooks(role=role, status=status, team=team, search=search)


@router.get("/playbooks/{team}/{filename}")
async def get_playbook(
    team: str,
    filename: str,
    svc: PlaybookService = Depends(get_playbook_service),
):
    """Get a single playbook parsed"""
    data = svc.get_playbook(team, filename)
    if not data:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return data


@router.get("/playbooks/{team}/{filename}/raw")
async def get_playbook_raw(
    team: str,
    filename: str,
    svc: PlaybookService = Depends(get_playbook_service),
):
    """Get raw YAML content for editing"""
    content = svc.read_raw(team, filename)
    if content is None:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return {"content": content}


@router.put("/playbooks/{team}/{filename}/raw")
async def save_playbook_raw(
    team: str,
    filename: str,
    body: RawYAMLBody,
    svc: PlaybookService = Depends(get_playbook_service),
):
    """Save raw YAML content (validates before writing)"""
    ok, err = svc.save_raw(team, filename, body.content)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
    return {"status": "saved"}


@router.patch("/playbooks/{team}/{filename}")
async def update_playbook_fields(
    team: str,
    filename: str,
    body: FieldUpdateBody,
    svc: PlaybookService = Depends(get_playbook_service),
):
    """Update specific fields using format-preserving edits"""
    ok, err = svc.update_fields(team, filename, body.updates)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
    return {"status": "updated"}
