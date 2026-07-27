# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# ── Import all routers ────────────────────────────────────────────────────────
# P0 routers (goals / milestones / tasks) will be added here once built
# P1 routers
from app.routers import dsa, notes, goals, tasks, resources, milestones

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
    allow_origins=settings.cors_origins,
    # Also allow Vercel preview deployments (e.g. forge-planener-<hash>-<team>.vercel.app),
    # which get a unique URL per build and can't be listed statically. Safe since every
    # endpoint still requires a valid Supabase JWT regardless of origin.
    allow_origin_regex=r"https://forge-planener(-[a-z0-9-]+)?-kartikmantris-projects\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(dsa.router)
app.include_router(notes.router)
app.include_router(goals.router)
app.include_router(tasks.router)
app.include_router(resources.router)
app.include_router(milestones.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "version": "0.2.0"}
