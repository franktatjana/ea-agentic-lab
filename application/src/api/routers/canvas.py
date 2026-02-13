"""Canvas data router - serves assembled canvas data for visual rendering"""
from fastapi import APIRouter, HTTPException, Depends

from ..services.canvas_service import get_canvas_service, CanvasService

router = APIRouter()


@router.get("/nodes/{realm_id}/{node_id}/canvas/{canvas_id}")
async def get_canvas(
    realm_id: str,
    node_id: str,
    canvas_id: str,
    service: CanvasService = Depends(get_canvas_service),
):
    """Get assembled canvas data for visual rendering."""
    data = service.get_canvas_data(realm_id, node_id, canvas_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Canvas or node not found")
    return data
