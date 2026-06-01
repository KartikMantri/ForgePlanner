from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str = ""  # Service role key (bypasses RLS)

    # ── CORS ──────────────────────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"

    # ── AI Keys ───────────────────────────────────────────────────────────────
    # Gemini is primary; Groq is automatic fallback if Gemini fails or key missing
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Module-level singleton for convenience imports
settings = get_settings()
