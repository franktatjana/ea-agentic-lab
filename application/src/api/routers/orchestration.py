"""Orchestration API Router"""

from fastapi import APIRouter, Depends, HTTPException

from ..services.orchestration_service import OrchestrationService, get_orchestration_service

router = APIRouter()


@router.get("/orchestration/processes")
async def list_processes(
    svc: OrchestrationService = Depends(get_orchestration_service),
):
    return svc.list_processes()


@router.get("/orchestration/stats")
async def registry_stats(
    svc: OrchestrationService = Depends(get_orchestration_service),
):
    return svc.get_registry_stats()


@router.get("/orchestration/traceability")
async def traceability_matrix(
    svc: OrchestrationService = Depends(get_orchestration_service),
):
    return svc.get_traceability()


@router.get("/orchestration/processes/{process_id}")
async def get_process(
    process_id: str,
    svc: OrchestrationService = Depends(get_orchestration_service),
):
    data = svc.get_process(process_id)
    if data is None:
        raise HTTPException(status_code=404, detail=f"Process {process_id} not found")
    return data


@router.get("/orchestration/processes/{process_id}/analyze")
async def analyze_process(
    process_id: str,
    svc: OrchestrationService = Depends(get_orchestration_service),
):
    result = svc.analyze_process(process_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
