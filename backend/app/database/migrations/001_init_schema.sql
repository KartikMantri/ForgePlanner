-- =============================================================================
-- Forge Migration 001: Initial Schema (P0)
-- Run this FIRST in Supabase SQL Editor before 002_p1_features.sql
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) UNIQUE NOT NULL,
    username   VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    category     VARCHAR(50)  NOT NULL,
    type         VARCHAR(50)  NOT NULL,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'active',
    health_score INTEGER      NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    xp_earned    INTEGER      NOT NULL DEFAULT 0   CHECK (xp_earned >= 0),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id   ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status    ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID        NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE         NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
    xp_value    INTEGER      NOT NULL DEFAULT 0 CHECK (xp_value >= 0),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_goal_id     ON milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status      ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON milestones(target_date);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID        NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending',
    xp_value     INTEGER      NOT NULL DEFAULT 0 CHECK (xp_value >= 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at   ON tasks(created_at);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id     UUID        NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    file_path   TEXT         NOT NULL,
    file_type   VARCHAR(50)  NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_goal_id ON resources(goal_id);

-- Weekly reviews table
CREATE TABLE IF NOT EXISTS weekly_reviews (
    id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE    NOT NULL,
    ai_summary TEXT,
    xp_earned  INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id   ON weekly_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_week_start ON weekly_reviews(week_start DESC);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme              VARCHAR(20)  DEFAULT 'light',
    notification_prefs JSONB        DEFAULT '{}',
    availability_hours JSONB        DEFAULT '{}',
    is_ai_generated    BOOLEAN      DEFAULT FALSE,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =============================================================================
-- Mock user for P0/P1 development (matches hardcoded UUID in backend)
-- =============================================================================
INSERT INTO users (id, email, username)
VALUES ('00000000-0000-0000-0000-000000000001', 'dev@forge.local', 'devuser')
ON CONFLICT (id) DO NOTHING;
