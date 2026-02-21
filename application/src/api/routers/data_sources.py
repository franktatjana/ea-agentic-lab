"""Data Sources API Router"""

from fastapi import APIRouter, Depends

from ..services.data_source_service import DataSourceService, get_data_source_service

router = APIRouter()


@router.get("/data-sources")
async def list_data_sources(
    svc: DataSourceService = Depends(get_data_source_service),
):
    """List all page sections with their enriched data source metadata"""
    return svc.list_all_sources()


@router.get("/data-sources/{page_section}")
async def get_data_sources(
    page_section: str,
    svc: DataSourceService = Depends(get_data_source_service),
):
    """Get enriched data source metadata for a specific page section"""
    return svc.get_data_sources(page_section)
