from supabase import create_client, Client
from app.config import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Return the singleton Supabase client using the service key to bypass RLS."""
    global _supabase_client
    if _supabase_client is None:
        # Prefer service role key (bypasses RLS), fall back to anon key
        key = settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_KEY
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            key,
        )
    return _supabase_client
