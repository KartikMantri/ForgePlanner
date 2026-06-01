# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# ── Import all routers ────────────────────────────────────────────────────────
# P0 routers (goals / milestones / tasks) will be added here once built
# P1 routers
from app.routers import dsa, notes, onboarding, goals, tasks, resources, milestones

app = FastAPI(
    title="Forge API",
    description="Personal Goal Operating System — backend API",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(dsa.router)
app.include_router(notes.router)
app.include_router(onboarding.router)
app.include_router(goals.router)
app.include_router(tasks.router)
app.include_router(resources.router)
app.include_router(milestones.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "version": "0.2.0",
        "ai": {
            "gemini": bool(settings.GEMINI_API_KEY),
            "groq": bool(settings.GROQ_API_KEY),
        },
    }
