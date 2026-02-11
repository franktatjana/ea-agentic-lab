"""Blueprints API Router"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ..services.blueprint_service import BlueprintService, get_blueprint_service

router = APIRouter()


@router.get("/blueprints/archetypes")
async def get_archetypes(svc: BlueprintService = Depends(get_blueprint_service)):
    """Full archetypes catalog"""
    return svc.get_archetypes()


@router.get("/blueprints/tracks")
async def get_tracks(svc: BlueprintService = Depends(get_blueprint_service)):
    """Full engagement tracks"""
    return svc.get_engagement_tracks()


@router.get("/blueprints/checklists")
async def get_checklist_definitions(svc: BlueprintService = Depends(get_blueprint_service)):
    """Checklist definitions lookup (rule_id -> name, assertion, severity)"""
    return svc.get_checklist_definitions()


@router.get("/blueprints/reference")
async def list_reference_blueprints(
    archetype: Optional[str] = None,
    svc: BlueprintService = Depends(get_blueprint_service),
):
    """List reference blueprints, optionally filtered by archetype"""
    return svc.list_reference_blueprints(archetype=archetype)


@router.get("/blueprints/reference/{archetype}/{blueprint_id}")
async def get_reference_blueprint(
    archetype: str,
    blueprint_id: str,
    svc: BlueprintService = Depends(get_blueprint_service),
):
    """Get a single reference blueprint parsed"""
    data = svc.get_reference_blueprint(archetype, blueprint_id)
    if not data:
        raise HTTPException(status_code=404, detail="Reference blueprint not found")
    return data


@router.get("/blueprints/reference/{archetype}/{blueprint_id}/raw")
async def get_reference_blueprint_raw(
    archetype: str,
    blueprint_id: str,
    svc: BlueprintService = Depends(get_blueprint_service),
):
    """Get raw YAML content"""
    content = svc.get_reference_blueprint_raw(archetype, blueprint_id)
    if content is None:
        raise HTTPException(status_code=404, detail="Reference blueprint not found")
    return {"content": content}
