"""Knowledge Vault Service for reading, writing, and querying knowledge items"""

import re
import shutil
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any, Optional

import yaml

from ..config import get_settings
from ..models.knowledge_schemas import (
    KnowledgeActivity,
    KnowledgeItem,
    KnowledgeItemCreate,
    KnowledgeItemUpdate,
    KnowledgeProposal,
    KnowledgeSource,
    KnowledgeStats,
    ProposalSource,
)

# Separator between YAML frontmatter and markdown content
_FRONTMATTER_SEP = re.compile(r"^---\s*$", re.MULTILINE)

# Category-to-subdirectory mapping
_CATEGORY_DIRS = {
    "operations": "operations",
    "content": "content",
    "external": "external",
    "asset": "assets",
}

# Confidence ordering for sorting (higher = better)
_CONFIDENCE_RANK = {"validated": 3, "reviewed": 2, "proposed": 1}


def _parse_knowledge_file(path: Path) -> Optional[dict[str, Any]]:
    """Parse a knowledge YAML file with frontmatter + markdown content."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return None

    parts = _FRONTMATTER_SEP.split(text, maxsplit=2)
    if len(parts) < 3:
        # Try plain YAML (no markdown body)
        try:
            data = yaml.safe_load(text)
            if isinstance(data, dict):
                data.setdefault("content", "")
                return data
        except Exception:
            return None
        return None

    # parts[0] is empty (before first ---), parts[1] is YAML, parts[2] is markdown
    try:
        data = yaml.safe_load(parts[1])
        if not isinstance(data, dict):
            return None
        data["content"] = parts[2].strip()
        return data
    except Exception:
        return None


def _to_knowledge_item(data: dict[str, Any], file_path: Path) -> KnowledgeItem:
    """Convert parsed YAML data to KnowledgeItem."""
    source_data = data.get("source", {})
    if isinstance(source_data, dict):
        source = KnowledgeSource(
            type=source_data.get("type", "expert"),
            origin=source_data.get("origin", ""),
            author=source_data.get("author", ""),
        )
    else:
        source = KnowledgeSource(type="expert")

    item = KnowledgeItem(
        id=data.get("id", file_path.stem),
        title=data.get("title", file_path.stem),
        type=data.get("type", "best_practice"),
        category=data.get("category", "content"),
        domain=data.get("domain", "general"),
        archetype=data.get("archetype", "all"),
        phase=data.get("phase", "all"),
        relevance=data.get("relevance", []),
        tags=data.get("tags", []),
        confidence=data.get("confidence", "proposed"),
        source=source,
        content=data.get("content", ""),
        created=str(data.get("created", "")),
        updated=str(data.get("updated", "")),
    )
    item._file_path = str(file_path)
    return item


def _to_proposal(data: dict[str, Any], file_path: Path) -> KnowledgeProposal:
    """Convert parsed YAML data to KnowledgeProposal."""
    source_data = data.get("source", {})
    if isinstance(source_data, dict):
        source = KnowledgeSource(
            type=source_data.get("type", "expert"),
            origin=source_data.get("origin", ""),
            author=source_data.get("author", ""),
        )
    else:
        source = KnowledgeSource(type="expert")

    proposed_from_data = data.get("proposed_from", {})
    proposed_from = ProposalSource(
        realm=proposed_from_data.get("realm", "ANONYMIZED"),
        node=proposed_from_data.get("node", ""),
        run_id=proposed_from_data.get("run_id", ""),
    )

    return KnowledgeProposal(
        id=data.get("id", file_path.stem),
        title=data.get("title", file_path.stem),
        type=data.get("type", "best_practice"),
        category=data.get("category", "content"),
        domain=data.get("domain", "general"),
        archetype=data.get("archetype", "all"),
        phase=data.get("phase", "all"),
        relevance=data.get("relevance", []),
        tags=data.get("tags", []),
        confidence=data.get("confidence", "proposed"),
        source=source,
        content=data.get("content", ""),
        created=str(data.get("created", "")),
        updated=str(data.get("updated", "")),
        proposed_by=data.get("proposed_by", ""),
        proposed_from=proposed_from,
        proposal_status=data.get("proposal_status", "pending"),
        proposal_date=str(data.get("proposal_date", "")),
        reviewer_notes=data.get("reviewer_notes", ""),
    )


def _write_knowledge_yaml(path: Path, item_data: dict[str, Any]) -> None:
    """Write a knowledge item as YAML frontmatter + markdown content."""
    content = item_data.pop("content", "")
    path.parent.mkdir(parents=True, exist_ok=True)

    lines = ["---"]
    lines.append(yaml.dump(item_data, default_flow_style=False, allow_unicode=True, sort_keys=False).rstrip())
    lines.append("---")
    if content:
        lines.append("")
        lines.append(content)
    lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


class KnowledgeService:
    """Service for managing Knowledge Vault items"""

    def __init__(self):
        settings = get_settings()
        self.base_path = settings.vault_path / "knowledge"
        self.proposals_path = self.base_path / ".proposals"

    def _scan_items(self) -> list[tuple[dict[str, Any], Path]]:
        """Scan all YAML knowledge items (excluding proposals and READMEs)."""
        results = []
        if not self.base_path.exists():
            return results
        for yaml_file in sorted(self.base_path.rglob("*.yaml")):
            if ".proposals" in yaml_file.parts:
                continue
            if yaml_file.name.lower() == "readme.md":
                continue
            data = _parse_knowledge_file(yaml_file)
            if data and "id" in data:
                results.append((data, yaml_file))
        return results

    def list_items(
        self,
        category: Optional[str] = None,
        domain: Optional[str] = None,
        archetype: Optional[str] = None,
        phase: Optional[str] = None,
        item_type: Optional[str] = None,
        tags: Optional[list[str]] = None,
        confidence: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[KnowledgeItem]:
        """List knowledge items with optional filters."""
        items = []
        for data, file_path in self._scan_items():
            item = _to_knowledge_item(data, file_path)
            if category and item.category != category:
                continue
            if domain and item.domain != domain:
                continue
            if archetype and item.archetype != archetype and item.archetype != "all":
                continue
            if phase and item.phase != phase and item.phase != "all":
                continue
            if item_type and item.type != item_type:
                continue
            if confidence and item.confidence != confidence:
                continue
            if tags:
                if not any(t in item.tags for t in tags):
                    continue
            if search:
                q = search.lower()
                if (
                    q not in item.title.lower()
                    and q not in item.content.lower()
                    and q not in " ".join(item.tags).lower()
                ):
                    continue
            items.append(item)
        return items

    def get_item(self, item_id: str) -> Optional[KnowledgeItem]:
        """Get a single knowledge item by ID."""
        for data, file_path in self._scan_items():
            if data.get("id") == item_id:
                return _to_knowledge_item(data, file_path)
        return None

    def get_relevant_knowledge(
        self,
        domain: str,
        archetype: str = "all",
        phase: str = "all",
        agent_role: Optional[str] = None,
        max_items: int = 10,
    ) -> list[KnowledgeItem]:
        """Return knowledge items relevant to a specific engagement context.

        Scoring:
        - Exact match (domain + archetype + phase): 3
        - Domain + archetype (any phase): 2
        - Domain only (archetype="all"): 1
        - General knowledge: 0.5
        Sorted by score descending, then confidence level.
        """
        scored: list[tuple[float, int, KnowledgeItem]] = []

        for data, file_path in self._scan_items():
            item = _to_knowledge_item(data, file_path)
            score = 0.0

            domain_match = item.domain == domain or item.domain == "general"
            arch_match = item.archetype == archetype or item.archetype == "all"
            phase_match = item.phase == phase or item.phase == "all"

            if not domain_match and item.domain != "general":
                continue

            if item.domain == domain and arch_match and phase_match:
                score = 3.0
            elif item.domain == domain and arch_match:
                score = 2.0
            elif item.domain == domain:
                score = 1.0
            elif item.domain == "general":
                score = 0.5

            if agent_role and item.relevance and agent_role not in item.relevance:
                score *= 0.5

            conf_rank = _CONFIDENCE_RANK.get(item.confidence, 0)
            scored.append((score, conf_rank, item))

        scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
        return [item for _, _, item in scored[:max_items]]

    def create_item(self, create_data: KnowledgeItemCreate) -> KnowledgeItem:
        """Create a new knowledge item."""
        today = date.today().isoformat()
        next_id = self._next_id()

        category_dir = _CATEGORY_DIRS.get(create_data.category, create_data.category)
        domain_dir = create_data.domain if create_data.category == "content" else ""
        slug = re.sub(r"[^a-z0-9]+", "_", create_data.title.lower()).strip("_")[:60]
        filename = f"{next_id}_{slug}.yaml"

        if domain_dir:
            target = self.base_path / category_dir / domain_dir / filename
        else:
            # For operations, pick a default subdirectory
            sub = "engagement-management"
            target = self.base_path / category_dir / sub / filename

        item_dict = {
            "id": next_id,
            "title": create_data.title,
            "type": create_data.type,
            "category": create_data.category,
            "domain": create_data.domain,
            "archetype": create_data.archetype,
            "phase": create_data.phase,
            "relevance": create_data.relevance,
            "tags": create_data.tags,
            "confidence": create_data.confidence,
            "source": {
                "type": create_data.source.type,
                "origin": create_data.source.origin,
                "author": create_data.source.author,
            },
            "created": today,
            "updated": today,
            "content": create_data.content,
        }

        _write_knowledge_yaml(target, dict(item_dict))
        item_dict["content"] = create_data.content
        return _to_knowledge_item(item_dict, target)

    def update_item(self, item_id: str, updates: KnowledgeItemUpdate) -> Optional[KnowledgeItem]:
        """Update an existing knowledge item."""
        for data, file_path in self._scan_items():
            if data.get("id") == item_id:
                update_dict = updates.model_dump(exclude_none=True)
                if "source" in update_dict:
                    update_dict["source"] = {
                        "type": update_dict["source"].get("type", data.get("source", {}).get("type", "expert")),
                        "origin": update_dict["source"].get("origin", data.get("source", {}).get("origin", "")),
                        "author": update_dict["source"].get("author", data.get("source", {}).get("author", "")),
                    }
                data.update(update_dict)
                data["updated"] = date.today().isoformat()
                _write_knowledge_yaml(file_path, dict(data))
                data["content"] = data.get("content", "")
                return _to_knowledge_item(data, file_path)
        return None

    def delete_item(self, item_id: str) -> bool:
        """Delete a knowledge item file."""
        for data, file_path in self._scan_items():
            if data.get("id") == item_id:
                file_path.unlink()
                return True
        return False

    def get_stats(self) -> KnowledgeStats:
        """Get summary statistics."""
        items = self.list_items()
        proposals = self.list_proposals()

        by_category = dict(Counter(i.category for i in items))
        by_domain = dict(Counter(i.domain for i in items))
        by_confidence = dict(Counter(i.confidence for i in items))
        by_type = dict(Counter(i.type for i in items))

        return KnowledgeStats(
            total_items=len(items),
            by_category=by_category,
            by_domain=by_domain,
            by_confidence=by_confidence,
            by_type=by_type,
            pending_proposals=len([p for p in proposals if p.proposal_status == "pending"]),
        )

    def get_activity(self) -> KnowledgeActivity:
        """Get rich activity analytics for the knowledge dashboard."""
        items = self.list_items()
        proposals = self.list_proposals()

        by_confidence = dict(Counter(i.confidence for i in items))
        by_category = dict(Counter(i.category for i in items))
        by_domain = dict(Counter(i.domain for i in items))
        by_type = dict(Counter(i.type for i in items))
        by_source_type = dict(Counter(i.source.type for i in items))

        known_domains = ["security", "observability", "search", "platform", "general"]
        domain_coverage = []
        for domain in known_domains:
            domain_items = [i for i in items if i.domain == domain]
            categories = dict(Counter(i.category for i in domain_items))
            domain_coverage.append({
                "domain": domain,
                "count": len(domain_items),
                "categories": categories,
            })

        pending = len([p for p in proposals if p.proposal_status == "pending"])
        rejected = len([p for p in proposals if p.proposal_status == "rejected"])

        sorted_items = sorted(items, key=lambda i: i.created, reverse=True)
        recent_items = [
            {
                "id": i.id,
                "title": i.title,
                "domain": i.domain,
                "type": i.type,
                "confidence": i.confidence,
                "category": i.category,
                "created": i.created,
            }
            for i in sorted_items[:10]
        ]

        total = len(items)
        reviewed_or_validated = by_confidence.get("reviewed", 0) + by_confidence.get("validated", 0)
        ratio = reviewed_or_validated / total if total > 0 else 0
        if total >= 100 and ratio > 0.5:
            maturity = "mature"
        elif total >= 30 and ratio > 0.3:
            maturity = "maturing"
        elif total >= 10:
            maturity = "growing"
        else:
            maturity = "seeding"

        return KnowledgeActivity(
            total_items=total,
            by_confidence=by_confidence,
            by_category=by_category,
            by_domain=by_domain,
            by_type=by_type,
            by_source_type=by_source_type,
            domain_coverage=domain_coverage,
            pending_proposals=pending,
            rejected_proposals=rejected,
            recent_items=recent_items,
            vault_maturity=maturity,
        )

    # ── Proposals ────────────────────────────────────────────────────────

    def list_proposals(self) -> list[KnowledgeProposal]:
        """List all proposals."""
        proposals = []
        if not self.proposals_path.exists():
            return proposals
        for yaml_file in sorted(self.proposals_path.glob("*.yaml")):
            data = _parse_knowledge_file(yaml_file)
            if data and "id" in data:
                proposals.append(_to_proposal(data, yaml_file))
        return proposals

    def get_proposal(self, proposal_id: str) -> Optional[KnowledgeProposal]:
        """Get a single proposal by ID."""
        for yaml_file in self.proposals_path.glob("*.yaml"):
            data = _parse_knowledge_file(yaml_file)
            if data and data.get("id") == proposal_id:
                return _to_proposal(data, yaml_file)
        return None

    def approve_proposal(self, proposal_id: str, reviewer_notes: str = "") -> Optional[KnowledgeItem]:
        """Approve a proposal: move from .proposals/ to main vault."""
        for yaml_file in self.proposals_path.glob("*.yaml"):
            data = _parse_knowledge_file(yaml_file)
            if data and data.get("id") == proposal_id:
                data["proposal_status"] = "approved"
                data["reviewer_notes"] = reviewer_notes
                data["confidence"] = "reviewed"
                data["updated"] = date.today().isoformat()

                # Determine target path
                category_dir = _CATEGORY_DIRS.get(data.get("category", "content"), "content")
                domain = data.get("domain", "general")
                slug = re.sub(r"[^a-z0-9]+", "_", data.get("title", "untitled").lower()).strip("_")[:60]
                filename = f"{data['id']}_{slug}.yaml"

                if data.get("category") == "content":
                    target = self.base_path / category_dir / domain / filename
                elif data.get("category") == "operations":
                    target = self.base_path / category_dir / "engagement-management" / filename
                else:
                    target = self.base_path / category_dir / filename

                # Remove proposal-specific fields before writing to main vault
                clean = {k: v for k, v in data.items() if k not in (
                    "proposed_by", "proposed_from", "proposal_status", "proposal_date", "reviewer_notes"
                )}
                _write_knowledge_yaml(target, dict(clean))

                # Remove proposal file
                yaml_file.unlink()

                clean["content"] = clean.get("content", "")
                return _to_knowledge_item(clean, target)
        return None

    def reject_proposal(self, proposal_id: str, reason: str = "") -> bool:
        """Reject a proposal (keep file for audit, mark as rejected)."""
        for yaml_file in self.proposals_path.glob("*.yaml"):
            data = _parse_knowledge_file(yaml_file)
            if data and data.get("id") == proposal_id:
                data["proposal_status"] = "rejected"
                data["reviewer_notes"] = reason
                data["updated"] = date.today().isoformat()
                _write_knowledge_yaml(yaml_file, dict(data))
                return True
        return False

    # ── Helpers ───────────────────────────────────────────────────────────

    def _next_id(self) -> str:
        """Generate next KV_NNN ID."""
        max_num = 0
        for data, _ in self._scan_items():
            item_id = data.get("id", "")
            match = re.match(r"KV_(\d+)", item_id)
            if match:
                max_num = max(max_num, int(match.group(1)))
        # Also check proposals
        if self.proposals_path.exists():
            for yaml_file in self.proposals_path.glob("*.yaml"):
                data = _parse_knowledge_file(yaml_file)
                if data:
                    item_id = data.get("id", "")
                    match = re.match(r"KV_(\d+)", item_id)
                    if match:
                        max_num = max(max_num, int(match.group(1)))
        return f"KV_{max_num + 1:03d}"


# Singleton
_knowledge_service = KnowledgeService()


def get_knowledge_service() -> KnowledgeService:
    return _knowledge_service
