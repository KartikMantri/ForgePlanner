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

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    goal_id: str
    milestone_id: Optional[str] = None
    xp_value: int = 10


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None


def _assert_goal_owned(db, goal_id: str, user_id: UUID) -> None:
    res = db.table("goals").select("id").eq("id", goal_id).eq("user_id", str(user_id)).maybe_single().execute()
    if not res or not res.data:
        raise HTTPException(status_code=404, detail="Goal not found")


def _assert_task_owned(db, task_id: str, user_id: UUID) -> None:
    res = (
        db.table("tasks")
        .select("id, milestones(goals(user_id))")
        .eq("id", task_id)
        .maybe_single()
        .execute()
    )
    data = res.data if res else None
    owner = ((data or {}).get("milestones") or {}).get("goals", {}).get("user_id")
    if not data or owner != str(user_id):
        raise HTTPException(status_code=404, detail="Task not found")


@router.get("")
async def list_tasks(goal_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Fetch all tasks for a goal by joining through milestones."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_goal_owned(db, goal_id, user_id)
            milestones = db.table("milestones").select("id").eq("goal_id", goal_id).execute()
            if not milestones.data:
                return []
            milestone_ids = [m["id"] for m in milestones.data]
            tasks = db.table("tasks").select("*").in_("milestone_id", milestone_ids).order("created_at").execute()
            return tasks.data or []
        return await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in tasks router")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("")
async def create_task(data: TaskCreate, user_id: UUID = Depends(get_current_user_id)):
    """Create a task. Auto-attaches to the first milestone; creates one if none exist."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_goal_owned(db, data.goal_id, user_id)

            milestone_id = data.milestone_id
            if not milestone_id:
                ms = db.table("milestones").select("id").eq("goal_id", data.goal_id).limit(1).execute()
                if ms.data:
                    milestone_id = ms.data[0]["id"]
                else:
                    # Create a default "Daily Tasks" milestone so the task has a home
                    new_ms = db.table("milestones").insert({
                        "goal_id": data.goal_id,
                        "title": "Daily Tasks",
                        "target_date": "2026-12-31",
                        "status": "in_progress"
                    }).execute()
                    milestone_id = new_ms.data[0]["id"]

            res = db.table("tasks").insert({
                "milestone_id": milestone_id,
                "title": data.title,
                "status": "pending",
                "xp_value": data.xp_value
            }).execute()
            return res.data[0]
        return await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in tasks router")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/{task_id}")
async def update_task(task_id: str, data: TaskUpdate, user_id: UUID = Depends(get_current_user_id)):
    """Update a task's status or title."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_task_owned(db, task_id, user_id)

            update_data: dict = {}
            if data.status is not None:
                update_data["status"] = data.status
                if data.status == "completed":
                    update_data["completed_at"] = datetime.utcnow().isoformat()
                else:
                    update_data["completed_at"] = None
            if data.title is not None:
                update_data["title"] = data.title

            res = db.table("tasks").update(update_data).eq("id", task_id).execute()
            if not res.data:
                raise HTTPException(status_code=404, detail="Task not found")
            return res.data[0]
        return await run_in_threadpool(_run)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in tasks router")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/{task_id}")
async def delete_task(task_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Delete a task."""
    db = get_supabase_client()
    try:
        def _run():
            _assert_task_owned(db, task_id, user_id)
            db.table("tasks").delete().eq("id", task_id).execute()
        await run_in_threadpool(_run)
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unhandled error in tasks router")
        raise HTTPException(status_code=500, detail="Internal server error")
