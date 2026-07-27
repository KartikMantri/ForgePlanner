# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
import logging

from app.database.client import get_supabase_client
from app.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/milestones", tags=["milestones"])


class MilestoneCreate(BaseModel):
    goal_id: str
    title: str
    target_date: str
    status: str = "pending"


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None


def _assert_goal_owned(db, goal_id: str, user_id: UUID) -> None:
    res = db.table("goals").select("id").eq("id", goal_id).eq("user_id", str(user_id)).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Goal not found")


def _assert_milestone_owned(db, milestone_id: str, user_id: UUID) -> None:
    res = (
        db.table("milestones")
        .select("id, goals(user_id)")
        .eq("id", milestone_id)
        .maybe_single()
        .execute()
    )
    owner = (res.data or {}).get("goals", {}).get("user_id")
    if not res.data or owner != str(user_id):
        raise HTTPException(status_code=404, detail="Milestone not found")


@router.post("")
async def create_milestone(data: MilestoneCreate, user_id: UUID = Depends(get_current_user_id)):
    """Create a new milestone for a goal."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_goal_owned(db, data.goal_id, user_id)
            res = db.table("milestones").insert({
                "goal_id": data.goal_id,
                "title": data.title,
                "target_date": data.target_date,
                "status": data.status,
            }).execute()
            return res.data[0]
        return await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in milestones router")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{milestone_id}")
async def update_milestone(milestone_id: str, data: MilestoneUpdate, user_id: UUID = Depends(get_current_user_id)):
    """Update a milestone's title, date, or status."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_milestone_owned(db, milestone_id, user_id)

            update_data: dict = {"updated_at": datetime.utcnow().isoformat()}
            if data.title is not None:
                update_data["title"] = data.title
            if data.target_date is not None:
                update_data["target_date"] = data.target_date
            if data.status is not None:
                update_data["status"] = data.status

            res = db.table("milestones").update(update_data).eq("id", milestone_id).execute()
            if not res.data:
                raise HTTPException(status_code=404, detail="Milestone not found")
            return res.data[0]
        return await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in milestones router")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{milestone_id}", status_code=204)
async def delete_milestone(milestone_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Delete a milestone."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_milestone_owned(db, milestone_id, user_id)
            db.table("milestones").delete().eq("id", milestone_id).execute()
        await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in milestones router")
        raise HTTPException(status_code=500, detail="Internal server error")
