"""Documentation API Router - serves markdown docs for the frontend documentation browser."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..services.docs_service import DocsService, get_docs_service

router = APIRouter()


@router.get("/docs/tree")
async def get_docs_tree(
    svc: DocsService = Depends(get_docs_service),
):
    """Return the full documentation directory tree for sidebar navigation."""
    return svc.get_tree()


@router.get("/docs-assets/{asset_path:path}")
async def get_doc_asset(
    asset_path: str,  # Relative path within docs/, e.g. "guides/screenshots/rfp-agent-guardrails.png"
    svc: DocsService = Depends(get_docs_service),
):
    """Serve image assets from the docs/ directory for inline rendering in the docs browser."""
    file_path = svc.get_asset_path(asset_path)
    if file_path is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return FileResponse(file_path)


@router.get("/docs/{doc_path:path}")
async def get_doc_content(
    doc_path: str,  # Relative path within docs/, e.g. "architecture/agents/agent-architecture.md"
    svc: DocsService = Depends(get_docs_service),
):
    """Return the raw markdown content of a specific documentation file."""
    content = svc.get_content(doc_path)
    if content is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"path": doc_path, "content": content}
