"""Knowledge Vault API Router"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ..models.knowledge_schemas import (
    KnowledgeActivity,
    KnowledgeItem,
    KnowledgeItemCreate,
    KnowledgeItemUpdate,
    KnowledgeProposal,
    KnowledgeStats,
    ProposalAction,
)
from ..services.knowledge_service import KnowledgeService, get_knowledge_service

router = APIRouter()


@router.get("/knowledge", response_model=list[KnowledgeItem])
async def list_knowledge(
    category: Optional[str] = None,
    domain: Optional[str] = None,
    archetype: Optional[str] = None,
    phase: Optional[str] = None,
    type: Optional[str] = None,
    confidence: Optional[str] = None,
    search: Optional[str] = None,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """List knowledge items with optional filters"""
    return svc.list_items(
        category=category,
        domain=domain,
        archetype=archetype,
        phase=phase,
        item_type=type,
        confidence=confidence,
        search=search,
    )


@router.get("/knowledge/stats", response_model=KnowledgeStats)
async def get_stats(
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Get knowledge vault summary statistics"""
    return svc.get_stats()


@router.get("/knowledge/activity", response_model=KnowledgeActivity)
async def get_knowledge_activity(
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Get rich activity analytics for the knowledge sharing dashboard"""
    return svc.get_activity()


@router.get("/knowledge/relevant", response_model=list[KnowledgeItem])
async def get_relevant(
    domain: str,
    archetype: str = "all",
    phase: str = "all",
    agent_role: Optional[str] = None,
    max_items: int = 10,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Get knowledge items relevant to a specific engagement context"""
    return svc.get_relevant_knowledge(
        domain=domain,
        archetype=archetype,
        phase=phase,
        agent_role=agent_role,
        max_items=max_items,
    )


@router.get("/knowledge/proposals", response_model=list[KnowledgeProposal])
async def list_proposals(
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """List pending knowledge proposals from agents"""
    return svc.list_proposals()


@router.get("/knowledge/{item_id}", response_model=KnowledgeItem)
async def get_knowledge_item(
    item_id: str,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Get a single knowledge item"""
    item = svc.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    return item


@router.post("/knowledge", response_model=KnowledgeItem, status_code=201)
async def create_knowledge_item(
    body: KnowledgeItemCreate,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Create a new knowledge item"""
    return svc.create_item(body)


@router.put("/knowledge/{item_id}", response_model=KnowledgeItem)
async def update_knowledge_item(
    item_id: str,
    body: KnowledgeItemUpdate,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Update an existing knowledge item"""
    item = svc.update_item(item_id, body)
    if not item:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    return item


@router.delete("/knowledge/{item_id}")
async def delete_knowledge_item(
    item_id: str,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Delete a knowledge item"""
    if not svc.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    return {"status": "deleted"}


@router.post("/knowledge/proposals/{proposal_id}/approve", response_model=KnowledgeItem)
async def approve_proposal(
    proposal_id: str,
    body: ProposalAction,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Approve a knowledge proposal and move to main vault"""
    item = svc.approve_proposal(proposal_id, body.reviewer_notes)
    if not item:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return item


@router.post("/knowledge/proposals/{proposal_id}/reject")
async def reject_proposal(
    proposal_id: str,
    body: ProposalAction,
    svc: KnowledgeService = Depends(get_knowledge_service),
):
    """Reject a knowledge proposal"""
    if not svc.reject_proposal(proposal_id, body.reviewer_notes):
        raise HTTPException(status_code=404, detail="Proposal not found")
    return {"status": "rejected"}
