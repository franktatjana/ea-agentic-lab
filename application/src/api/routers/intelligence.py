"""Intelligence endpoints - serve agent-generated intelligence artifacts"""
from fastapi import APIRouter, Depends

from ..services.yaml_loader import YAMLLoader, get_yaml_loader

router = APIRouter()


@router.get("/realms/{realm_id}/intelligence/company-profile")
async def get_company_profile(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    return loader.get_company_intelligence(realm_id) or {}


@router.get("/realms/{realm_id}/intelligence/organigram")
async def get_organigram(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    return loader.get_organigram(realm_id) or {}


@router.get("/realms/{realm_id}/intelligence/opportunities")
async def get_opportunities(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    return loader.get_opportunity_map(realm_id) or {}


@router.get("/realms/{realm_id}/intelligence/industry")
async def get_industry_intelligence(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    return loader.get_industry_intelligence(realm_id)


@router.get("/realms/{realm_id}/intelligence/vendors")
async def get_vendor_landscape(
    realm_id: str,
    loader: YAMLLoader = Depends(get_yaml_loader),
):
    return loader.get_vendor_landscape(realm_id) or {}
