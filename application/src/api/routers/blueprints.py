"""Blueprints API Router"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..services.blueprint_service import BlueprintService, get_blueprint_service
from ..services.composition_service import CompositionService, get_composition_service

router = APIRouter()


class ComposeRequest(BaseModel):
    archetype: str
    domain: str
    track: str
    variant: Optional[str] = None


class SaveBlueprintRequest(BaseModel):
    blueprint: dict
    archetype: str
    blueprint_id: str


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


@router.get("/blueprints/playbook-index")
async def get_playbook_index(
    svc: CompositionService = Depends(get_composition_service),
):
    """All playbooks indexed by ID with name, team, category, objective"""
    return svc.get_playbook_index()


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


@router.post("/blueprints/compose")
async def compose_blueprint(
    body: ComposeRequest,
    svc: CompositionService = Depends(get_composition_service),
):
    """Compose a blueprint from archetype + domain + track"""
    result = svc.compose(
        archetype=body.archetype,
        domain=body.domain,
        track=body.track,
        variant=body.variant,
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/blueprints/compose/save")
async def save_composed_blueprint(
    body: SaveBlueprintRequest,
    svc: CompositionService = Depends(get_composition_service),
):
    """Save a composed blueprint as a reference blueprint YAML"""
    ok, msg = svc.save_blueprint(body.blueprint, body.archetype, body.blueprint_id)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "ok", "path": msg}
