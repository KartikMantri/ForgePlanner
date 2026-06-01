from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID


# ---------------------------------------------------------------------------
# DSA Problem (master catalog)
# ---------------------------------------------------------------------------

class DSAProblemResponse(BaseModel):
    id: UUID
    sheet_topic: str
    sheet_subtopic: Optional[str] = None
    title: str
    striver_order: int
    platform_link: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# DSA User Progress
# ---------------------------------------------------------------------------

class DSAProgressUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        description="One of: unsolved | attempted | solved | revision",
    )
    my_difficulty: Optional[str] = Field(
        None,
        description="One of: easy | medium | hard",
    )
    time_taken_mins: Optional[int] = Field(None, ge=0)
    solved_at: Optional[date] = None
    submission_link: Optional[str] = None
    video_solution_link: Optional[str] = None
    approach_notes: Optional[str] = None
    key_insight: Optional[str] = None
    revision_flag: Optional[bool] = None


class DSAProgressResponse(BaseModel):
    id: UUID
    user_id: UUID
    problem_id: UUID
    goal_id: UUID
    status: str
    my_difficulty: Optional[str] = None
    time_taken_mins: Optional[int] = None
    solved_at: Optional[date] = None
    submission_link: Optional[str] = None
    video_solution_link: Optional[str] = None
    approach_notes: Optional[str] = None
    key_insight: Optional[str] = None
    revision_flag: bool
    revision_count: int
    last_revised_at: Optional[date] = None
    xp_awarded: int
    problem: DSAProblemResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# DSA Sheet Summary (aggregated)
# ---------------------------------------------------------------------------

class TopicStat(BaseModel):
    total: int
    solved: int
    attempted: int
    percent: float


class DSASheetSummary(BaseModel):
    total: int
    solved: int
    attempted: int
    revision: int
    unsolved: int
    percent_solved: float
    by_topic: dict[str, TopicStat]


# ---------------------------------------------------------------------------
# DSA Sheet Row (problem + progress combined, used in grouped sheet response)
# ---------------------------------------------------------------------------

class DSASheetRow(BaseModel):
    progress_id: UUID
    problem: DSAProblemResponse
    status: str
    my_difficulty: Optional[str] = None
    time_taken_mins: Optional[int] = None
    revision_flag: bool
    revision_count: int
    xp_awarded: int


class DSASubtopicGroup(BaseModel):
    subtopic: str
    rows: list[DSASheetRow]


class DSATopicGroup(BaseModel):
    topic: str
    total: int
    solved: int
    subtopics: list[DSASubtopicGroup]


# ---------------------------------------------------------------------------
# Revision Log
# ---------------------------------------------------------------------------

class DSARevisionLogCreate(BaseModel):
    notes: Optional[str] = None


class DSARevisionLogResponse(BaseModel):
    id: UUID
    progress_id: UUID
    revised_at: datetime
    notes: Optional[str] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# AI responses
# ---------------------------------------------------------------------------

class DSAHintResponse(BaseModel):
    hint: str


class DSAApproachReviewResponse(BaseModel):
    review: str
