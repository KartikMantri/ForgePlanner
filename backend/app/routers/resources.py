from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.database.client import get_supabase_client

router = APIRouter(prefix="/api/v1/resources", tags=["resources"])


class ResourceCreate(BaseModel):
    goal_id: str
    filename: str
    url: Optional[str] = None
    file_type: str = "url"  # "url" | "pdf" | "txt"


@router.get("")
async def list_resources(goal_id: str):
    """Fetch all resources for a goal."""
    db = get_supabase_client()
    try:
        res = db.table("resources").select("*").eq("goal_id", goal_id).order("uploaded_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_resource(data: ResourceCreate):
    """Add a new resource link or file reference to a goal."""
    db = get_supabase_client()
    try:
        res = db.table("resources").insert({
            "goal_id": data.goal_id,
            "filename": data.filename,
            "file_path": data.url or "",
            "file_type": data.file_type
        }).execute()
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{resource_id}")
async def delete_resource(resource_id: str):
    """Delete a resource."""
    db = get_supabase_client()
    try:
        db.table("resources").delete().eq("id", resource_id).execute()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
