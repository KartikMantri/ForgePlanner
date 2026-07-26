from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID

from app.schemas.dsa import (
    DSAProgressUpdate,
    DSAProgressResponse,
    DSASheetSummary,
    DSATopicGroup,
    DSARevisionLogCreate,
    DSARevisionLogResponse,
)
from app.services.dsa_service import DSAService
from app.database.client import get_supabase_client
from app.utils.exceptions import NotFoundError

router = APIRouter(prefix="/api/v1/dsa", tags=["dsa"])


# ── Dependencies ──────────────────────────────────────────────────────────────

def get_dsa_service(supabase=Depends(get_supabase_client)) -> DSAService:
    return DSAService(supabase)


def get_current_user_id() -> UUID:
    """Placeholder — replace with real auth in post-P0."""
    return UUID("00000000-0000-0000-0000-000000000001")


# ── Seed ──────────────────────────────────────────────────────────────────────

@router.post(
    "/seed/{goal_id}",
    status_code=status.HTTP_201_CREATED,
    summary="Seed Striver A-Z problems for a DSA goal",
)
async def seed_dsa_sheet(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        count = await service.seed_problems(goal_id, user_id)
        return {"message": f"Seeded {count} problem progress records", "goal_id": str(goal_id)}
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Sheet ─────────────────────────────────────────────────────────────────────

@router.get(
    "/sheet/{goal_id}/summary",
    response_model=DSASheetSummary,
    summary="Get overall + per-topic progress stats",
)
async def get_sheet_summary(
    goal_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        return await service.get_summary(goal_id, user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/sheet/{goal_id}",
    response_model=list[DSATopicGroup],
    summary="Get full sheet grouped by topic/subtopic with filters",
)
async def get_sheet(
    goal_id: UUID,
    status: str | None = Query(None, description="unsolved|attempted|solved|revision"),
    difficulty: str | None = Query(None, description="easy|medium|hard"),
    revision_only: bool = Query(False),
    topic: str | None = Query(None),
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        return await service.get_sheet(
            goal_id, user_id,
            status_filter=status,
            difficulty_filter=difficulty,
            revision_only=revision_only,
            topic_filter=topic,
        )
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Progress ──────────────────────────────────────────────────────────────────

@router.get(
    "/progress/{progress_id}",
    response_model=DSAProgressResponse,
    summary="Get single problem progress record",
)
async def get_progress(
    progress_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        return await service.get_progress(progress_id, user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put(
    "/progress/{progress_id}",
    response_model=DSAProgressResponse,
    summary="Update problem progress (awards XP if newly solved)",
)
async def update_progress(
    progress_id: UUID,
    data: DSAProgressUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        return await service.update_progress(progress_id, user_id, data)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Revision Log ──────────────────────────────────────────────────────────────

@router.post(
    "/progress/{progress_id}/revision",
    response_model=DSARevisionLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a revision attempt for a problem",
)
async def log_revision(
    progress_id: UUID,
    data: DSARevisionLogCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: DSAService = Depends(get_dsa_service),
):
    try:
        return await service.log_revision(progress_id, user_id, data)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
