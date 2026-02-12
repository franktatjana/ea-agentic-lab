"""Pydantic models for Knowledge Vault API"""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class KnowledgeSource(BaseModel):
    type: Literal["engagement", "expert", "research", "analyst_report"]
    origin: str = ""
    author: str = ""


class KnowledgeItem(BaseModel):
    id: str
    title: str
    type: Literal["best_practice", "lesson_learned", "pattern", "research", "asset"]
    category: Literal["operations", "content", "external", "asset"]
    domain: str
    archetype: str = "all"
    phase: str = "all"
    relevance: list[str] = []
    tags: list[str] = []
    confidence: Literal["proposed", "reviewed", "validated"] = "proposed"
    source: KnowledgeSource = Field(default_factory=lambda: KnowledgeSource(type="expert"))
    content: str = ""
    created: str = ""
    updated: str = ""
    _file_path: str = ""


class KnowledgeItemCreate(BaseModel):
    title: str
    type: Literal["best_practice", "lesson_learned", "pattern", "research", "asset"]
    category: Literal["operations", "content", "external", "asset"]
    domain: str
    archetype: str = "all"
    phase: str = "all"
    relevance: list[str] = []
    tags: list[str] = []
    confidence: Literal["proposed", "reviewed", "validated"] = "reviewed"
    source: KnowledgeSource = Field(default_factory=lambda: KnowledgeSource(type="expert"))
    content: str = ""


class KnowledgeItemUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[Literal["best_practice", "lesson_learned", "pattern", "research", "asset"]] = None
    category: Optional[Literal["operations", "content", "external", "asset"]] = None
    domain: Optional[str] = None
    archetype: Optional[str] = None
    phase: Optional[str] = None
    relevance: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    confidence: Optional[Literal["proposed", "reviewed", "validated"]] = None
    source: Optional[KnowledgeSource] = None
    content: Optional[str] = None


class ProposalSource(BaseModel):
    realm: str = "ANONYMIZED"
    node: str = ""
    run_id: str = ""


class KnowledgeProposal(KnowledgeItem):
    proposed_by: str = ""
    proposed_from: ProposalSource = Field(default_factory=ProposalSource)
    proposal_status: Literal["pending", "approved", "rejected"] = "pending"
    proposal_date: str = ""
    reviewer_notes: str = ""


class ProposalAction(BaseModel):
    reviewer_notes: str = ""


class KnowledgeStats(BaseModel):
    total_items: int = 0
    by_category: dict[str, int] = {}
    by_domain: dict[str, int] = {}
    by_confidence: dict[str, int] = {}
    by_type: dict[str, int] = {}
    pending_proposals: int = 0
