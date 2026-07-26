from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

NOTE_TEXT_MAX_LENGTH = 300


# ---------------------------------------------------------------------------
# Note Page
# ---------------------------------------------------------------------------

class NotePageCreate(BaseModel):
    title: str = Field(default="Untitled", max_length=255)


class NotePageUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    is_pinned: Optional[bool] = None


class NotePageResponse(BaseModel):
    id: UUID
    goal_id: UUID
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Note Block
# ---------------------------------------------------------------------------

ALLOWED_BLOCK_TYPES = {
    "text", "heading", "bullet_list", "numbered_list",
    "toggle", "code", "image", "divider", "callout",
    "math", "quote", "todo",
}


class NoteBlockData(BaseModel):
    """Single block in the note editor. Content schema varies by type."""
    type: str = Field(..., description=f"One of: {', '.join(sorted(ALLOWED_BLOCK_TYPES))}")
    content: dict[str, Any] = Field(default_factory=dict)
    sort_order: int = Field(default=0, ge=0)

    @field_validator("content")
    @classmethod
    def _enforce_text_length(cls, content: dict[str, Any]) -> dict[str, Any]:
        text = content.get("text")
        if isinstance(text, str) and len(text) > NOTE_TEXT_MAX_LENGTH:
            raise ValueError(f"Note text exceeds {NOTE_TEXT_MAX_LENGTH} characters")
        return content


class NoteBlockResponse(NoteBlockData):
    id: UUID
    page_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Note Page with all blocks (full page fetch)
# ---------------------------------------------------------------------------

class NotePageWithBlocks(NotePageResponse):
    blocks: list[NoteBlockResponse] = []


# ---------------------------------------------------------------------------
# Block save request (full replace)
# ---------------------------------------------------------------------------

class SaveBlocksRequest(BaseModel):
    blocks: list[NoteBlockData]


