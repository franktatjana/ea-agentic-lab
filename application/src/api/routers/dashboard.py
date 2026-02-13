"""
Dashboard API Router
"""
from fastapi import APIRouter, Depends

from ..services.dashboard_service import DashboardService, get_dashboard_service

router = APIRouter()


@router.get("/dashboard/summary")
async def get_dashboard_summary(
    svc: DashboardService = Depends(get_dashboard_service),
):
    """Aggregated portfolio dashboard data"""
    return svc.get_summary()
