from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_KEY: str = ""  # Service role key (bypasses RLS)

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, e.g.
    # "http://localhost:5173,https://your-app.vercel.app"
    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_URL.split(",") if origin.strip()]

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
