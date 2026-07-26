from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.database.client import get_supabase_client
from app.auth import get_current_user_id

router = APIRouter(prefix="/api/v1/resources", tags=["resources"])


class ResourceCreate(BaseModel):
    goal_id: str
    filename: str
    url: Optional[str] = None
    file_type: str = "url"  # "url" | "pdf" | "txt"


def _assert_goal_owned(db, goal_id: str, user_id: UUID) -> None:
    res = db.table("goals").select("id").eq("id", goal_id).eq("user_id", str(user_id)).maybe_single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Goal not found")


def _assert_resource_owned(db, resource_id: str, user_id: UUID) -> None:
    res = (
        db.table("resources")
        .select("id, goals(user_id)")
        .eq("id", resource_id)
        .maybe_single()
        .execute()
    )
    owner = (res.data or {}).get("goals", {}).get("user_id")
    if not res.data or owner != str(user_id):
        raise HTTPException(status_code=404, detail="Resource not found")


@router.get("")
async def list_resources(goal_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Fetch all resources for a goal."""
    db = get_supabase_client()
    try:
        _assert_goal_owned(db, goal_id, user_id)
        res = db.table("resources").select("*").eq("goal_id", goal_id).order("uploaded_at", desc=True).execute()
        return res.data or []
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_resource(data: ResourceCreate, user_id: UUID = Depends(get_current_user_id)):
    """Add a new resource link or file reference to a goal."""
    db = get_supabase_client()
    try:
        _assert_goal_owned(db, data.goal_id, user_id)
        res = db.table("resources").insert({
            "goal_id": data.goal_id,
            "filename": data.filename,
            "file_path": data.url or "",
            "file_type": data.file_type
        }).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{resource_id}")
async def delete_resource(resource_id: str, user_id: UUID = Depends(get_current_user_id)):
    """Delete a resource."""
    db = get_supabase_client()
    try:
        _assert_resource_owned(db, resource_id, user_id)
        db.table("resources").delete().eq("id", resource_id).execute()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
