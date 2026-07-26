
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
import logging

from app.database.client import get_supabase_client
from app.auth import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])


class MilestoneCreate(BaseModel):
    title: str
    target_date: str


class GoalCreate(BaseModel):
    title: str
    category: str
    type: str
    start_date: str
    end_date: str
    milestones: List[MilestoneCreate]


# ── Background seed helper ─────────────────────────────────────────────────────
def _seed_dsa_background(goal_id: str, user_id: str) -> None:
    """
    Called as a FastAPI BackgroundTask right after a DSA goal is created.
    Runs while the HTTP response has already been sent to the client,
    so goal creation stays fast and the DSA sheet is ready on first open.
    """
    try:
        from app.services.dsa_service import DSAService
        import asyncio
        db = get_supabase_client()
        service = DSAService(db)
        # DSAService.seed_problems is async, run it in a new event loop
        asyncio.run(service.seed_problems(UUID(goal_id), UUID(user_id)))
        logger.info(f"Background DSA seed complete for goal {goal_id}")
    except Exception as e:
        # Non-fatal — the frontend has a fallback seed trigger
        logger.warning(f"Background DSA seed failed for goal {goal_id}: {e}")


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("")
async def list_goals(user_id: UUID = Depends(get_current_user_id)):
    db = get_supabase_client()
    try:
        def _run():
            return db.table("goals").select("*").eq("user_id", str(user_id)).execute()
        res = await run_in_threadpool(_run)
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{goal_id}")
async def get_goal(goal_id: str, user_id: UUID = Depends(get_current_user_id)):
    db = get_supabase_client()
    try:
        def _run():
            return (
                db.table("goals")
                .select("*, milestones(*)")
                .eq("id", goal_id)
                .eq("user_id", str(user_id))
                .maybe_single()
                .execute()
            )
        res = await run_in_threadpool(_run)
        if not res.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_goal(
    data: GoalCreate,
    background_tasks: BackgroundTasks,
    user_id: UUID = Depends(get_current_user_id),
):
    db = get_supabase_client()
    try:
        def _run():
            # Create goal
            goal_res = db.table("goals").insert({
                "user_id": str(user_id),
                "title": data.title,
                "category": data.category,
                "type": data.type,
                "start_date": data.start_date,
                "end_date": data.end_date,
                "status": "active",
            }).execute()

            goal = goal_res.data[0]
            goal_id = goal["id"]

            # Insert milestones
            if data.milestones:
                milestones_data = [
                    {"goal_id": goal_id, "title": m.title, "target_date": m.target_date}
                    for m in data.milestones
                    if m.title and m.target_date
                ]
                if milestones_data:
                    db.table("milestones").insert(milestones_data).execute()

            return goal_id

        goal_id = await run_in_threadpool(_run)

        # For DSA goals: seed the Striver A-Z sheet in the background
        # so it's ready by the time the user opens the DSA tab.
        if data.type == "dsa":
            background_tasks.add_task(_seed_dsa_background, goal_id, str(user_id))
            logger.info(f"Queued background DSA seed for goal {goal_id}")

        return {"id": goal_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Delete a goal and all related data (cascade handled by DB FK constraints)."""
    db = get_supabase_client()
    try:
        def _run():
            return db.table("goals").delete().eq("id", goal_id).eq("user_id", str(user_id)).execute()
        res = await run_in_threadpool(_run)
        if not res.data:
            raise HTTPException(status_code=404, detail="Goal not found or not yours")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
