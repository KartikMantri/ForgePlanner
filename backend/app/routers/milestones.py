# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.database.client import get_supabase_client

router = APIRouter(prefix="/api/v1/milestones", tags=["milestones"])


def get_current_user_id() -> str:
    return "00000000-0000-0000-0000-000000000001"


class MilestoneCreate(BaseModel):
    goal_id: str
    title: str
    target_date: str
    status: str = "pending"


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None


@router.post("")
async def create_milestone(data: MilestoneCreate, user_id: str = Depends(get_current_user_id)):
    """Create a new milestone for a goal."""
    db = get_supabase_client()
    try:
        res = db.table("milestones").insert({
            "goal_id": data.goal_id,
            "title": data.title,
            "target_date": data.target_date,
            "status": data.status,
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{milestone_id}")
async def update_milestone(milestone_id: str, data: MilestoneUpdate):
    """Update a milestone's title, date, or status."""
    db = get_supabase_client()
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{milestone_id}", status_code=204)
async def delete_milestone(milestone_id: str):
    """Delete a milestone."""
    db = get_supabase_client()
    try:
        db.table("milestones").delete().eq("id", milestone_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
