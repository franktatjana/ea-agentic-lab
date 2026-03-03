"""Agent Definitions API Router - serves parsed agent definition YAML files."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse

from ..services.definitions_service import DefinitionsService, get_definitions_service

router = APIRouter()


@router.get("/definitions")
async def list_definitions(
    svc: DefinitionsService = Depends(get_definitions_service),
):
    """Return summary list of all agent definitions."""
    return svc.list_definitions()


@router.get("/definitions/{agent_id}")
async def get_definition(
    agent_id: str,
    svc: DefinitionsService = Depends(get_definitions_service),
):
    """Return the full parsed definition for a specific agent."""
    definition = svc.get_definition(agent_id)
    if definition is None:
        raise HTTPException(status_code=404, detail="Agent definition not found")
    return definition


@router.get("/definitions/{agent_id}/raw")
async def get_definition_raw(
    agent_id: str,
    svc: DefinitionsService = Depends(get_definitions_service),
):
    """Return the raw YAML text for download."""
    result = svc.get_raw_yaml(agent_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Agent definition not found")
    content, filename = result
    return PlainTextResponse(
        content=content,
        media_type="application/x-yaml",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/definitions/{agent_id}/prompts/{prompt_key}")
async def get_prompt_content(
    agent_id: str,
    prompt_key: str,
    svc: DefinitionsService = Depends(get_definitions_service),
):
    """Resolve a prompt source reference and return the actual prompt content."""
    result = svc.resolve_prompt(agent_id, prompt_key)
    if result is None:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return result
