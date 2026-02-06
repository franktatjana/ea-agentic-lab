"""
Risks API Router
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.schemas import Risk, RiskRegister, RiskSummary, Severity, RiskStatus
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/risks", response_model=RiskRegister)
async def get_risk_register(
    realm_id: str,
    node_id: str,
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    status: Optional[RiskStatus] = Query(None, description="Filter by status"),
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get risk register for a node"""
    risks = loader.get_risk_register(realm_id, node_id)
    if not risks:
        raise HTTPException(
            status_code=404,
            detail=f"Risk register for {realm_id}/{node_id} not found",
        )

    # Apply filters if specified
    if severity or status:
        filtered_risks = risks.risks
        if severity:
            filtered_risks = [r for r in filtered_risks if r.severity == severity]
        if status:
            filtered_risks = [r for r in filtered_risks if r.status == status]
        risks.risks = filtered_risks

    return risks


@router.get("/nodes/{realm_id}/{node_id}/risks/summary", response_model=RiskSummary)
async def get_risk_summary(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get risk register summary"""
    risks = loader.get_risk_register(realm_id, node_id)
    if not risks:
        raise HTTPException(
            status_code=404,
            detail=f"Risk register for {realm_id}/{node_id} not found",
        )
    return risks.summary


@router.get("/nodes/{realm_id}/{node_id}/risks/{risk_id}", response_model=Risk)
async def get_risk(
    realm_id: str,
    node_id: str,
    risk_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Get a specific risk"""
    risks = loader.get_risk_register(realm_id, node_id)
    if not risks:
        raise HTTPException(
            status_code=404,
            detail=f"Risk register for {realm_id}/{node_id} not found",
        )

    for risk in risks.risks:
        if risk.risk_id == risk_id:
            return risk

    raise HTTPException(status_code=404, detail=f"Risk {risk_id} not found")
