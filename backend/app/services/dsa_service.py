"""
DSA Service — handles seeding, sheet fetching, progress updates, XP awarding.
"""

import json
import logging
from pathlib import Path
from uuid import UUID
from datetime import datetime, date

from supabase import Client

from app.schemas.dsa import (
    DSAProgressUpdate,
    DSAProgressResponse,
    DSAProblemResponse,
    DSASheetSummary,
    DSATopicGroup,
    DSASubtopicGroup,
    DSASheetRow,
    TopicStat,
    DSARevisionLogCreate,
    DSARevisionLogResponse,
)
from app.utils.exceptions import NotFoundError

logger = logging.getLogger(__name__)

# XP awarded when a problem is first marked Solved
XP_TABLE = {"easy": 15, "medium": 30, "hard": 60}

SEED_FILE = Path(__file__).parent.parent / "data" / "striver_az.json"


class DSAService:
    def __init__(self, supabase: Client):
        self.db = supabase

    # -------------------------------------------------------------------------
    # Seed
    # -------------------------------------------------------------------------

    async def seed_problems(self, goal_id: UUID, user_id: UUID) -> int:
        """
        Idempotent seed:
        1. Upsert all problems from JSON into dsa_problems (by striver_order).
        2. Create dsa_user_progress rows for each problem × this goal (skip existing).
        Returns number of progress rows created.
        """
        goal_check = (
            self.db.table("goals")
            .select("id")
            .eq("id", str(goal_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        if not goal_check.data:
            raise NotFoundError(f"Goal {goal_id} not found")

        problems_json: list[dict] = json.loads(SEED_FILE.read_text(encoding="utf-8"))

        # Upsert master problems (striver_order is the unique key)
        self.db.table("dsa_problems").upsert(
            problems_json,
            on_conflict="striver_order",
        ).execute()

        # Fetch all problem IDs
        result = self.db.table("dsa_problems").select("id, striver_order").execute()
        problem_rows = result.data  # [{id, striver_order}, ...]

        # Build progress rows (ignore duplicates via ON CONFLICT DO NOTHING)
        progress_rows = [
            {
                "user_id": str(user_id),
                "problem_id": p["id"],
                "goal_id": str(goal_id),
                "status": "unsolved",
            }
            for p in problem_rows
        ]

        # upsert with ignore_duplicates prevents re-creating rows
        self.db.table("dsa_user_progress").upsert(
            progress_rows,
            on_conflict="user_id,problem_id,goal_id",
            ignore_duplicates=True,
        ).execute()

        return len(progress_rows)

    # -------------------------------------------------------------------------
    # Sheet Summary
    # -------------------------------------------------------------------------

    async def get_summary(self, goal_id: UUID, user_id: UUID) -> DSASheetSummary:
        result = self.db.table("dsa_user_progress").select(
            "status, dsa_problems(sheet_topic)"
        ).eq("goal_id", str(goal_id)).eq("user_id", str(user_id)).execute()

        rows = result.data
        total = len(rows)
        solved = sum(1 for r in rows if r["status"] == "solved")
        attempted = sum(1 for r in rows if r["status"] == "attempted")
        revision = sum(1 for r in rows if r["status"] == "revision")
        unsolved = total - solved - attempted - revision

        # Per-topic breakdown
        by_topic: dict[str, dict] = {}
        for r in rows:
            topic = r.get("dsa_problems", {}).get("sheet_topic", "Unknown")
            if topic not in by_topic:
                by_topic[topic] = {"total": 0, "solved": 0, "attempted": 0}
            by_topic[topic]["total"] += 1
            if r["status"] == "solved":
                by_topic[topic]["solved"] += 1
            elif r["status"] == "attempted":
                by_topic[topic]["attempted"] += 1

        topic_stats = {
            t: TopicStat(
                total=v["total"],
                solved=v["solved"],
                attempted=v["attempted"],
                percent=round(v["solved"] / v["total"] * 100, 1) if v["total"] else 0,
            )
            for t, v in by_topic.items()
        }

        return DSASheetSummary(
            total=total,
            solved=solved,
            attempted=attempted,
            revision=revision,
            unsolved=unsolved,
            percent_solved=round(solved / total * 100, 1) if total else 0,
            by_topic=topic_stats,
        )

    # -------------------------------------------------------------------------
    # Full Sheet (grouped by topic → subtopic)
    # -------------------------------------------------------------------------

    async def get_sheet(
        self,
        goal_id: UUID,
        user_id: UUID,
        status_filter: str | None = None,
        difficulty_filter: str | None = None,
        revision_only: bool = False,
        topic_filter: str | None = None,
    ) -> list[DSATopicGroup]:
        query = (
            self.db.table("dsa_user_progress")
            .select(
                "id, status, my_difficulty, time_taken_mins, revision_flag, "
                "revision_count, xp_awarded, "
                "dsa_problems(id, sheet_topic, sheet_subtopic, title, striver_order, platform_link)"
            )
            .eq("goal_id", str(goal_id))
            .eq("user_id", str(user_id))
        )

        if status_filter:
            query = query.eq("status", status_filter)
        if difficulty_filter:
            query = query.eq("my_difficulty", difficulty_filter)
        if revision_only:
            query = query.eq("revision_flag", True)
        if topic_filter:
            # Filter via join — use ilike on nested column
            query = query.ilike("dsa_problems.sheet_topic", f"%{topic_filter}%")

        result = query.execute()
        # Sort by striver_order in Python (postgrest 2.x dropped cross-table order() support)
        rows = sorted(result.data, key=lambda r: (r.get("dsa_problems") or {}).get("striver_order", 9999))

        # Build nested structure: topic → subtopic → rows
        topic_map: dict[str, dict[str, list]] = {}

        for r in rows:
            prob = r.get("dsa_problems") or {}
            topic = prob.get("sheet_topic", "Unknown")
            subtopic = prob.get("sheet_subtopic") or "General"

            if topic not in topic_map:
                topic_map[topic] = {}
            if subtopic not in topic_map[topic]:
                topic_map[topic][subtopic] = []

            topic_map[topic][subtopic].append(
                DSASheetRow(
                    progress_id=r["id"],
                    problem=DSAProblemResponse(
                        id=prob["id"],
                        sheet_topic=topic,
                        sheet_subtopic=subtopic,
                        title=prob["title"],
                        striver_order=prob["striver_order"],
                        platform_link=prob.get("platform_link"),
                    ),
                    status=r["status"],
                    my_difficulty=r.get("my_difficulty"),
                    time_taken_mins=r.get("time_taken_mins"),
                    revision_flag=r.get("revision_flag", False),
                    revision_count=r.get("revision_count", 0),
                    xp_awarded=r.get("xp_awarded", 0),
                )
            )

        groups: list[DSATopicGroup] = []
        for topic, subtopic_map in topic_map.items():
            all_rows = [row for rows_list in subtopic_map.values() for row in rows_list]
            solved = sum(1 for r in all_rows if r.status == "solved")

            subtopics = [
                DSASubtopicGroup(subtopic=st, rows=st_rows)
                for st, st_rows in subtopic_map.items()
            ]

            groups.append(
                DSATopicGroup(
                    topic=topic,
                    total=len(all_rows),
                    solved=solved,
                    subtopics=subtopics,
                )
            )

        return groups

    # -------------------------------------------------------------------------
    # Progress CRUD
    # -------------------------------------------------------------------------

    async def get_progress(self, progress_id: UUID, user_id: UUID) -> DSAProgressResponse:
        result = (
            self.db.table("dsa_user_progress")
            .select("*, dsa_problems(*)")
            .eq("id", str(progress_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        if not result.data:
            raise NotFoundError(f"Progress record {progress_id} not found")
        return self._build_progress_response(result.data[0])

    async def update_progress(
        self, progress_id: UUID, user_id: UUID, data: DSAProgressUpdate
    ) -> DSAProgressResponse:
        # Fetch existing to check ownership and current status
        existing_result = (
            self.db.table("dsa_user_progress")
            .select("*, dsa_problems(*)")
            .eq("id", str(progress_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        if not existing_result.data:
            raise NotFoundError(f"Progress record {progress_id} not found")

        existing = existing_result.data[0]
        update_dict = data.model_dump(exclude_unset=True, exclude_none=True)
        update_dict["updated_at"] = datetime.utcnow().isoformat()

        # ── XP award: only when transitioning TO solved for the first time ──
        xp_gained = 0
        if (
            data.status == "solved"
            and existing["status"] != "solved"
        ):
            difficulty = data.my_difficulty or existing.get("my_difficulty") or "medium"
            xp_gained = XP_TABLE.get(difficulty, 30)
            update_dict["xp_awarded"] = xp_gained
            update_dict["solved_at"] = update_dict.get("solved_at") or date.today().isoformat()

            # Increment goal xp_earned
            goal_id = existing["goal_id"]
            goal_result = self.db.table("goals").select("xp_earned").eq("id", goal_id).execute()
            if goal_result.data:
                current_xp = goal_result.data[0]["xp_earned"]
                self.db.table("goals").update(
                    {"xp_earned": current_xp + xp_gained}
                ).eq("id", goal_id).execute()

        # ── Revision tracking: log entry when re-solved ──
        if data.status == "revision" and existing["status"] == "solved":
            revision_count = existing.get("revision_count", 0) + 1
            update_dict["revision_count"] = revision_count
            update_dict["last_revised_at"] = date.today().isoformat()
            self.db.table("dsa_revision_log").insert(
                {"progress_id": str(progress_id)}
            ).execute()

        self.db.table("dsa_user_progress").update(update_dict).eq("id", str(progress_id)).execute()

        result = (
            self.db.table("dsa_user_progress")
            .select("*, dsa_problems(*)")
            .eq("id", str(progress_id))
            .execute()
        )
        return self._build_progress_response(result.data[0])

    # -------------------------------------------------------------------------
    # Revision Log
    # -------------------------------------------------------------------------

    async def log_revision(
        self, progress_id: UUID, user_id: UUID, data: DSARevisionLogCreate
    ) -> DSARevisionLogResponse:
        # Verify ownership
        await self.get_progress(progress_id, user_id)

        log_row = {"progress_id": str(progress_id)}
        if data.notes:
            log_row["notes"] = data.notes

        result = self.db.table("dsa_revision_log").insert(log_row).execute()

        # Bump revision_count
        existing = (
            self.db.table("dsa_user_progress")
            .select("revision_count")
            .eq("id", str(progress_id))
            .execute()
        )
        if existing.data:
            count = existing.data[0]["revision_count"] + 1
            self.db.table("dsa_user_progress").update(
                {
                    "revision_count": count,
                    "last_revised_at": date.today().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                }
            ).eq("id", str(progress_id)).execute()

        return DSARevisionLogResponse(**result.data[0])

    # -------------------------------------------------------------------------
    # Helper
    # -------------------------------------------------------------------------

    def _build_progress_response(self, row: dict) -> DSAProgressResponse:
        prob = row.get("dsa_problems") or {}
        return DSAProgressResponse(
            id=row["id"],
            user_id=row["user_id"],
            problem_id=row["problem_id"],
            goal_id=row["goal_id"],
            status=row["status"],
            my_difficulty=row.get("my_difficulty"),
            time_taken_mins=row.get("time_taken_mins"),
            solved_at=row.get("solved_at"),
            submission_link=row.get("submission_link"),
            video_solution_link=row.get("video_solution_link"),
            approach_notes=row.get("approach_notes"),
            key_insight=row.get("key_insight"),
            revision_flag=row.get("revision_flag", False),
            revision_count=row.get("revision_count", 0),
            last_revised_at=row.get("last_revised_at"),
            xp_awarded=row.get("xp_awarded", 0),
            problem=DSAProblemResponse(
                id=prob["id"],
                sheet_topic=prob.get("sheet_topic", ""),
                sheet_subtopic=prob.get("sheet_subtopic"),
                title=prob.get("title", ""),
                striver_order=prob.get("striver_order", 0),
                platform_link=prob.get("platform_link"),
            ),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
