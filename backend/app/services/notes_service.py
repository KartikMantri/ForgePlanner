"""
Notes Service — CRUD for note pages and blocks.
"""

import logging
from uuid import UUID
from datetime import datetime

from supabase import Client
from fastapi.concurrency import run_in_threadpool

from app.schemas.notes import (
    NotePageCreate,
    NotePageResponse,
    NotePageUpdate,
    NotePageWithBlocks,
    NoteBlockData,
    NoteBlockResponse,
)
from app.utils.exceptions import NotFoundError

logger = logging.getLogger(__name__)


class NotesService:
    def __init__(self, supabase: Client):
        self.db = supabase

    # -------------------------------------------------------------------------
    # Pages
    # -------------------------------------------------------------------------

    async def create_page(self, goal_id: UUID, user_id: UUID, data: NotePageCreate) -> NotePageResponse:
        """Create a new note page for a goal (verifies goal ownership first)."""
        def _run() -> NotePageResponse:
            self._verify_goal_ownership(goal_id, user_id)
            result = self.db.table("note_pages").insert(
                {"goal_id": str(goal_id), "title": data.title}
            ).execute()
            return NotePageResponse(**result.data[0])

        return await run_in_threadpool(_run)

    async def list_pages(self, goal_id: UUID, user_id: UUID) -> list[NotePageResponse]:
        """List all pages for a goal, pinned first then sorted by updated_at desc."""
        def _run() -> list[NotePageResponse]:
            self._verify_goal_ownership(goal_id, user_id)
            result = (
                self.db.table("note_pages")
                .select("*")
                .eq("goal_id", str(goal_id))
                .order("is_pinned", desc=True)
                .order("updated_at", desc=True)
                .execute()
            )
            return [NotePageResponse(**row) for row in result.data]

        return await run_in_threadpool(_run)

    async def get_page(self, page_id: UUID, user_id: UUID) -> NotePageWithBlocks:
        """Get a full page with all its blocks, verifying ownership via the goal."""
        def _run() -> NotePageWithBlocks:
            page = self._fetch_page(page_id, user_id)
            blocks_result = (
                self.db.table("note_blocks")
                .select("*")
                .eq("page_id", str(page_id))
                .order("sort_order")
                .execute()
            )
            blocks = [NoteBlockResponse(**b) for b in blocks_result.data]
            return NotePageWithBlocks(**page, blocks=blocks)

        return await run_in_threadpool(_run)

    async def update_page(
        self, page_id: UUID, user_id: UUID, data: NotePageUpdate
    ) -> NotePageResponse:
        """Update page title or pin status."""
        def _run() -> NotePageResponse:
            self._fetch_page(page_id, user_id)  # ownership check
            update_dict = data.model_dump(exclude_unset=True, exclude_none=True)
            update_dict["updated_at"] = datetime.utcnow().isoformat()
            result = (
                self.db.table("note_pages")
                .update(update_dict)
                .eq("id", str(page_id))
                .execute()
            )
            return NotePageResponse(**result.data[0])

        return await run_in_threadpool(_run)

    async def delete_page(self, page_id: UUID, user_id: UUID) -> None:
        """Delete page and all blocks (cascade handles blocks)."""
        def _run() -> None:
            self._fetch_page(page_id, user_id)  # ownership check
            self.db.table("note_pages").delete().eq("id", str(page_id)).execute()

        await run_in_threadpool(_run)

    # -------------------------------------------------------------------------
    # Blocks — full replace strategy
    # -------------------------------------------------------------------------

    async def save_blocks(
        self, page_id: UUID, user_id: UUID, blocks: list[NoteBlockData]
    ) -> list[NoteBlockResponse]:
        """
        Full-replace all blocks for a page:
        1. Delete all existing blocks.
        2. Re-insert in sorted order.
        3. Touch page updated_at.
        """
        def _run() -> list[NoteBlockResponse]:
            self._fetch_page(page_id, user_id)  # ownership check

            # Delete existing
            self.db.table("note_blocks").delete().eq("page_id", str(page_id)).execute()

            # Insert new
            if blocks:
                rows = [
                    {
                        "page_id": str(page_id),
                        "type": block.type,
                        "content": block.content,
                        "sort_order": i,
                    }
                    for i, block in enumerate(blocks)
                ]
                result = self.db.table("note_blocks").insert(rows).execute()
                saved_blocks = [NoteBlockResponse(**b) for b in result.data]
            else:
                saved_blocks = []

            # Touch page updated_at
            self.db.table("note_pages").update(
                {"updated_at": datetime.utcnow().isoformat()}
            ).eq("id", str(page_id)).execute()

            return saved_blocks

        return await run_in_threadpool(_run)

    # -------------------------------------------------------------------------
    # Search
    # -------------------------------------------------------------------------

    async def search_pages(self, user_id: UUID, query: str) -> list[NotePageResponse]:
        """
        Full-text search across note page titles for a user.
        (Block content search via ilike on JSONB — best-effort.)
        """
        if not query or len(query.strip()) < 2:
            return []

        def _run() -> list[NotePageResponse]:
            # Search by title (fast, indexed)
            result = (
                self.db.table("note_pages")
                .select("*, goals!inner(user_id)")
                .ilike("title", f"%{query}%")
                .eq("goals.user_id", str(user_id))
                .order("updated_at", desc=True)
                .limit(20)
                .execute()
            )
            return [NotePageResponse(**row) for row in result.data]

        return await run_in_threadpool(_run)

    # -------------------------------------------------------------------------
    # Internal helpers
    # -------------------------------------------------------------------------

    def _verify_goal_ownership(self, goal_id: UUID, user_id: UUID) -> None:
        result = (
            self.db.table("goals")
            .select("id")
            .eq("id", str(goal_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        if not result.data:
            raise NotFoundError(f"Goal {goal_id} not found")

    def _fetch_page(self, page_id: UUID, user_id: UUID) -> dict:
        """Fetch page row and verify ownership through the goal relationship."""
        result = (
            self.db.table("note_pages")
            .select("*, goals!inner(user_id)")
            .eq("id", str(page_id))
            .execute()
        )
        if not result.data:
            raise NotFoundError(f"Note page {page_id} not found")
        page = result.data[0]
        if page.get("goals", {}).get("user_id") != str(user_id):
            raise NotFoundError(f"Note page {page_id} not found")
        # Return clean page dict (without nested goals)
        page.pop("goals", None)
        return page
