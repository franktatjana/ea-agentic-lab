"""
Widgets API Router
Optimized endpoints for iOS home screen widgets
"""
from fastapi import APIRouter, HTTPException, Depends

from ..models.schemas import WidgetHealthData, WidgetActionData, WidgetRiskData, Trend, HealthStatus
from ..services.yaml_loader import get_yaml_loader, YAMLLoader

router = APIRouter()


@router.get("/widgets/health/{realm_id}/{node_id}", response_model=WidgetHealthData)
async def get_widget_health_data(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Optimized endpoint for health score widget"""
    node = loader.get_node(realm_id, node_id)
    health = loader.get_health_score(realm_id, node_id)

    if not node:
        raise HTTPException(
            status_code=404, detail=f"Node {realm_id}/{node_id} not found"
        )

    if not health:
        # Return default health data if not available
        return WidgetHealthData(
            node_id=f"{realm_id}/{node_id}",
            node_name=node.name,
            score=0,
            previous_score=0,
            trend=Trend.stable,
            status=HealthStatus.at_risk,
            top_risk=None,
        )

    # Get top risk from alerts
    top_risk = None
    if health.alerts.active:
        top_risk = health.alerts.active[0].alert

    return WidgetHealthData(
        node_id=f"{realm_id}/{node_id}",
        node_name=node.name,
        score=health.health_score.current,
        previous_score=health.health_score.previous or health.health_score.current,
        trend=health.health_score.trend,
        status=health.health_score.status,
        top_risk=top_risk,
    )


@router.get("/widgets/actions/{realm_id}/{node_id}", response_model=WidgetActionData)
async def get_widget_action_data(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Optimized endpoint for action count widget"""
    node = loader.get_node(realm_id, node_id)
    actions = loader.get_action_tracker(realm_id, node_id)

    if not node:
        raise HTTPException(
            status_code=404, detail=f"Node {realm_id}/{node_id} not found"
        )

    if not actions:
        return WidgetActionData(
            node_id=f"{realm_id}/{node_id}",
            node_name=node.name,
            critical_count=0,
            high_count=0,
            medium_count=0,
            overdue_count=0,
            completed_count=0,
            total_count=0,
        )

    return WidgetActionData(
        node_id=f"{realm_id}/{node_id}",
        node_name=node.name,
        critical_count=actions.summary.critical,
        high_count=actions.summary.high,
        medium_count=actions.summary.medium,
        overdue_count=actions.summary.overdue,
        completed_count=actions.summary.completed,
        total_count=actions.summary.total_actions,
    )


@router.get("/widgets/risks/{realm_id}/{node_id}", response_model=WidgetRiskData)
async def get_widget_risk_data(
    realm_id: str,
    node_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    """Optimized endpoint for risk alert widget"""
    node = loader.get_node(realm_id, node_id)
    risks = loader.get_risk_register(realm_id, node_id)

    if not node:
        raise HTTPException(
            status_code=404, detail=f"Node {realm_id}/{node_id} not found"
        )

    if not risks:
        return WidgetRiskData(
            node_id=f"{realm_id}/{node_id}",
            node_name=node.name,
            critical_count=0,
            high_count=0,
            top_risks=[],
            escalation_status=None,
        )

    # Get top 3 risks (critical and high)
    top_risks = []
    for risk in risks.risks:
        if risk.severity.value in ["critical", "high"] and risk.status.value == "open":
            top_risks.append(
                {
                    "risk_id": risk.risk_id,
                    "title": risk.title,
                    "severity": risk.severity.value,
                    "category": risk.category.value,
                }
            )
            if len(top_risks) >= 3:
                break

    # Get escalation status
    escalation_status = None
    if risks.escalation:
        escalation_status = risks.escalation.get("status")

    return WidgetRiskData(
        node_id=f"{realm_id}/{node_id}",
        node_name=node.name,
        critical_count=risks.summary.critical,
        high_count=risks.summary.high,
        top_risks=top_risks,
        escalation_status=escalation_status,
    )
