from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID

from app.schemas.notes import (
    NotePageCreate,
    NotePageUpdate,
    NotePageResponse,
    NotePageWithBlocks,
    NoteBlockResponse,
    SaveBlocksRequest,
)
from app.services.notes_service import NotesService
from app.database.client import get_supabase_client
from app.utils.exceptions import NotFoundError
from app.auth import get_current_user_id

router = APIRouter(prefix="/api/v1/notes", tags=["notes"])


# ── Dependencies ──────────────────────────────────────────────────────────────

def get_notes_service(supabase=Depends(get_supabase_client)) -> NotesService:
    return NotesService(supabase)


# ── Pages ─────────────────────────────────────────────────────────────────────

@router.post(
    "/goals/{goal_id}/pages",
    response_model=NotePageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new note page for a goal",
)
async def create_page(
    goal_id: UUID,
    data: NotePageCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        return await service.create_page(goal_id, user_id, data)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/goals/{goal_id}/pages",
    response_model=list[NotePageResponse],
    summary="List all note pages for a goal (pinned first, then by recency)",
)
async def list_pages(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        return await service.list_pages(goal_id, user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/pages/{page_id}",
    response_model=NotePageWithBlocks,
    summary="Get a note page with all its blocks",
)
async def get_page(
    page_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        return await service.get_page(page_id, user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put(
    "/pages/{page_id}",
    response_model=NotePageResponse,
    summary="Update page title or pin status",
)
async def update_page(
    page_id: UUID,
    data: NotePageUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        return await service.update_page(page_id, user_id, data)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete(
    "/pages/{page_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a note page and all its blocks",
)
async def delete_page(
    page_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        await service.delete_page(page_id, user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Blocks ────────────────────────────────────────────────────────────────────

@router.put(
    "/pages/{page_id}/blocks",
    response_model=list[NoteBlockResponse],
    summary="Full-replace all blocks in a page (auto-saves editor state)",
)
async def save_blocks(
    page_id: UUID,
    data: SaveBlocksRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    try:
        return await service.save_blocks(page_id, user_id, data.blocks)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Search ────────────────────────────────────────────────────────────────────

@router.get(
    "/search",
    response_model=list[NotePageResponse],
    summary="Search note pages by title across all goals",
)
async def search_pages(
    q: str = Query(..., min_length=2, description="Search query"),
    user_id: UUID = Depends(get_current_user_id),
    service: NotesService = Depends(get_notes_service),
):
    return await service.search_pages(user_id, q)


