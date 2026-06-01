-- =============================================================================
-- Forge Migration 002: P1 Features
-- DSA Sheet Module, Goal Onboarding Wizard, Notes Module
-- Run after 001_init_schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extend goals table with P1 columns
-- -----------------------------------------------------------------------------
ALTER TABLE goals ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS availability         JSONB    DEFAULT '{}';
ALTER TABLE goals ADD COLUMN IF NOT EXISTS template             VARCHAR(50);

-- -----------------------------------------------------------------------------
-- 2. DSA Problems master catalog
--    Seeded from backend/app/data/striver_az.json on first DSA goal creation.
--    striver_order is the canonical position on the Striver A-Z sheet.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsa_problems (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_topic     VARCHAR(100) NOT NULL,
    sheet_subtopic  VARCHAR(100),
    title           VARCHAR(255) NOT NULL,
    striver_order   INTEGER      NOT NULL,
    platform_link   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT dsa_problems_order_unique UNIQUE (striver_order)
);

CREATE INDEX IF NOT EXISTS idx_dsa_problems_topic ON dsa_problems(sheet_topic);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_order ON dsa_problems(striver_order);

-- -----------------------------------------------------------------------------
-- 3. DSA User Progress
--    One row per (user, problem, goal). Stores all personal tracking fields.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsa_user_progress (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    problem_id          UUID        NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
    goal_id             UUID        NOT NULL REFERENCES goals(id)        ON DELETE CASCADE,
    -- Status
    status              VARCHAR(20) NOT NULL DEFAULT 'unsolved',
        -- allowed: unsolved | attempted | solved | revision
    -- Personal difficulty rating
    my_difficulty       VARCHAR(10),
        -- allowed: easy | medium | hard
    -- Timing
    time_taken_mins     INTEGER,
    solved_at           DATE,
    -- Links
    submission_link     TEXT,
    video_solution_link TEXT,
    -- Notes
    approach_notes      TEXT,
    key_insight         TEXT,
    -- Revision tracking
    revision_flag       BOOLEAN     NOT NULL DEFAULT FALSE,
    revision_count      INTEGER     NOT NULL DEFAULT 0,
    last_revised_at     DATE,
    -- XP
    xp_awarded          INTEGER     NOT NULL DEFAULT 0,
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT dsa_progress_unique UNIQUE (user_id, problem_id, goal_id)
);

CREATE INDEX IF NOT EXISTS idx_dsa_progress_user_goal ON dsa_user_progress(user_id, goal_id);
CREATE INDEX IF NOT EXISTS idx_dsa_progress_problem   ON dsa_user_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_dsa_progress_status    ON dsa_user_progress(status);
CREATE INDEX IF NOT EXISTS idx_dsa_progress_revision
    ON dsa_user_progress(revision_flag)
    WHERE revision_flag = TRUE;

-- -----------------------------------------------------------------------------
-- 4. DSA Revision Log
--    Audit trail of every re-attempt on a problem.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsa_revision_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    progress_id UUID NOT NULL REFERENCES dsa_user_progress(id) ON DELETE CASCADE,
    revised_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_revision_log_progress ON dsa_revision_log(progress_id);
CREATE INDEX IF NOT EXISTS idx_revision_log_time     ON dsa_revision_log(revised_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Note Pages
--    One page per note inside a goal. Sorted by updated_at DESC.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS note_pages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id    UUID        NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    is_pinned  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_pages_goal    ON note_pages(goal_id);
CREATE INDEX IF NOT EXISTS idx_note_pages_updated ON note_pages(updated_at DESC);

-- -----------------------------------------------------------------------------
-- 6. Note Blocks
--    Individual content blocks inside a note page (Notion-style).
--    content is flexible JSONB — schema varies by block type.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS note_blocks (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id    UUID        NOT NULL REFERENCES note_pages(id) ON DELETE CASCADE,
    type       VARCHAR(30) NOT NULL DEFAULT 'text',
        -- allowed: text | heading | bullet_list | numbered_list | toggle |
        --          code | image | divider | callout | math | quote | todo
    content    JSONB       NOT NULL DEFAULT '{}',
    sort_order INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_blocks_page ON note_blocks(page_id, sort_order);
