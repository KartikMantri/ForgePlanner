-- =============================================================================
-- Forge Migration 004: Enable Row Level Security — CRITICAL SECURITY FIX
--
-- Do this FIRST, before running anything below:
--   1. Go to Supabase Dashboard -> Settings -> API -> reveal the "service_role" key.
--   2. Set SUPABASE_SERVICE_KEY in backend/.env (local) AND in your Render env vars
--      (production backend) to that value.
--   3. Restart the backend so it picks up the service role key.
--
-- Why this order matters: the backend currently runs on the *anon* key (the
-- same public key baked into the frontend bundle). Right now there is NO
-- Row Level Security on any table, which means anyone who inspects your
-- frontend's network requests or bundled JS can find that anon key and use
-- it to read/write/delete ANY row in ANY table directly against Supabase's
-- REST API — completely bypassing this backend, its JWT verification, and
-- every ownership check that's been built. This was confirmed directly:
-- a plain unauthenticated request with just the anon key could read every
-- user's email from `users`, and could insert/delete rows in `goals`.
--
-- Once the backend is on the service_role key (which always bypasses RLS),
-- turning RLS on below only affects the anon-key path — i.e. it locks out
-- exactly the hole above, without touching how the backend itself works.
-- If you enable RLS BEFORE switching the backend to the service role key,
-- the backend will break, because it isn't currently forwarding each user's
-- JWT to Supabase — it authenticates its own callers itself and queries
-- Supabase as a trusted backend, which is what the service role key is for.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users — contains real email addresses. Each user can only see their own row.
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_self ON users
    FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- goals — the core per-user table everything else hangs off.
-- -----------------------------------------------------------------------------
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_owner ON goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- milestones — owned via goals.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY milestones_owner ON milestones
    FOR ALL USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = milestones.goal_id AND goals.user_id = auth.uid())
    );

-- -----------------------------------------------------------------------------
-- tasks — owned via milestones -> goals.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_owner ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM milestones
            JOIN goals ON goals.id = milestones.goal_id
            WHERE milestones.id = tasks.milestone_id AND goals.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- resources — owned via goals.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY resources_owner ON resources
    FOR ALL USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = resources.goal_id AND goals.user_id = auth.uid())
    );

-- -----------------------------------------------------------------------------
-- weekly_reviews, user_settings — direct user_id column
-- -----------------------------------------------------------------------------
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY weekly_reviews_owner ON weekly_reviews
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_owner ON user_settings
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- dsa_problems — shared read-only catalog (problem definitions), not per-user.
-- Any logged-in user can read it; only the backend (service role) can write it.
-- -----------------------------------------------------------------------------
ALTER TABLE dsa_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY dsa_problems_read ON dsa_problems
    FOR SELECT USING (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- dsa_user_progress — direct user_id column
-- -----------------------------------------------------------------------------
ALTER TABLE dsa_user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY dsa_progress_owner ON dsa_user_progress
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- dsa_revision_log — owned via dsa_user_progress.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE dsa_revision_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY dsa_revision_log_owner ON dsa_revision_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM dsa_user_progress
            WHERE dsa_user_progress.id = dsa_revision_log.progress_id
            AND dsa_user_progress.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- note_pages — owned via goals.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE note_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY note_pages_owner ON note_pages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM goals WHERE goals.id = note_pages.goal_id AND goals.user_id = auth.uid())
    );

-- -----------------------------------------------------------------------------
-- note_blocks — owned via note_pages -> goals.user_id
-- -----------------------------------------------------------------------------
ALTER TABLE note_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY note_blocks_owner ON note_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM note_pages
            JOIN goals ON goals.id = note_pages.goal_id
            WHERE note_pages.id = note_blocks.page_id AND goals.user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- Verify after running: as a completely anonymous request (just the anon key,
-- no Authorization/session), this should now return an EMPTY array instead of
-- real rows:
--   GET {SUPABASE_URL}/rest/v1/users?select=id,email
-- =============================================================================
