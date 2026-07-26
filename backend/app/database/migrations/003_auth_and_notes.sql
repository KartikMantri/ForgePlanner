-- =============================================================================
-- Forge Migration 003: Real Auth + Notes Character Limit
-- Run this in the Supabase SQL Editor AFTER 001 and 002.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Auto-create a public.users row whenever someone signs up via Supabase Auth
--    Keeps the existing public.users table (and every FK that points at it)
--    working untouched — auth.users.id becomes the same id public.users uses.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Notes character limit — DB-level backstop (backend also validates this).
--    Caps the 'text' field of a note block's JSONB content at 300 characters.
--    Blocks without a 'text' key (future block types) are unaffected.
-- -----------------------------------------------------------------------------
ALTER TABLE note_blocks
    DROP CONSTRAINT IF EXISTS note_blocks_text_length_chk;

ALTER TABLE note_blocks
    ADD CONSTRAINT note_blocks_text_length_chk
    CHECK (NOT (content ? 'text') OR length(content->>'text') <= 300);

-- -----------------------------------------------------------------------------
-- 3. ONE-TIME DATA MIGRATION — run manually after your FIRST real sign-up.
--
--    Steps:
--    a) Sign up for real in the app (creates a row in auth.users + public.users
--       via the trigger above).
--    b) Find your new real user id:
--         select id, email from auth.users;
--    c) Replace <YOUR_NEW_USER_ID> below with that id and run this block once.
--       It moves every row currently owned by the old dev placeholder user
--       (00000000-0000-0000-0000-000000000001) over to your real account.
-- -----------------------------------------------------------------------------

-- UPDATE goals            SET user_id = '<YOUR_NEW_USER_ID>' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- UPDATE dsa_user_progress SET user_id = '<YOUR_NEW_USER_ID>' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- UPDATE weekly_reviews    SET user_id = '<YOUR_NEW_USER_ID>' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- UPDATE user_settings     SET user_id = '<YOUR_NEW_USER_ID>' WHERE user_id = '00000000-0000-0000-0000-000000000001';
-- -- note_pages/note_blocks/milestones/tasks/resources all cascade through
-- -- goals.user_id, so once goals is reassigned they follow automatically.

-- Once confirmed working, you can optionally delete the old placeholder user:
-- DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------------
-- 4. OPTIONAL — Row Level Security as defense-in-depth.
--    Not required: the FastAPI backend uses the service_role key, which
--    bypasses RLS entirely. This only matters if something ever talks to
--    Supabase directly with the anon key. Safe to run any time; the backend
--    keeps working exactly the same either way.
-- -----------------------------------------------------------------------------

-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY goals_owner ON goals
--     USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ALTER TABLE dsa_user_progress ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY dsa_progress_owner ON dsa_user_progress
--     USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ALTER TABLE note_pages ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY note_pages_owner ON note_pages
--     USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = note_pages.goal_id AND goals.user_id = auth.uid()));

-- ALTER TABLE note_blocks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY note_blocks_owner ON note_blocks
--     USING (EXISTS (
--         SELECT 1 FROM note_pages
--         JOIN goals ON goals.id = note_pages.goal_id
--         WHERE note_pages.id = note_blocks.page_id AND goals.user_id = auth.uid()
--     ));
