![Forge Logo](frontend/public/forge-logo.png)

# Forge

A Marvel-inspired personal goal operating system with a React frontend, a FastAPI backend, and real multi-user auth via Supabase.

Forge helps you plan goals, manage milestones, organize tasks, write notes, save resources, and power up DSA practice in one polished workspace — securely, per account.

**Live app:** https://forge-planener.vercel.app
**Live API:** https://forgeplanener-2.onrender.com

---

## 🌟 What is Forge?

Forge is a full-stack productivity and learning platform designed for makers, students, and coders.

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** FastAPI with modular routers and clean API design
- **Auth & Database:** Supabase (Auth + Postgres with Row Level Security)
- **Theme:** Marvel-inspired UI with bold colors and clear workflows
- **Goal:** Turn planning, study, and execution into a smooth daily habit

---

## 🚀 Core Features

- ✅ Real sign-up / sign-in / forgot-password / change-password flows (Supabase Auth)
- ✅ Goal creation, tracking, and progress insights — scoped per user
- ✅ Milestone planning and dependency support
- ✅ Task manager for daily work and learning habits
- ✅ Note taking and study journaling
- ✅ DSA practice section with the Striver A-Z sheet, seeded per DSA goal
- ✅ Resource library for bookmarks, articles, and guides
- ✅ Onboarding wizard for fast setup
- ✅ In-app Guide page documenting every feature and workflow
- ✅ Backend health-check plus CORS-ready API support

---

## 🧱 Project Structure

```
Forge/
├── backend/
│   ├── app/
│   │   ├── auth.py          # Supabase JWT verification (JWKS-based)
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── database/
│   │   └── migrations/      # RLS + schema migrations (run manually in Supabase)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/supabaseClient.ts
│   │   ├── pages/            # AuthPage, ResetPasswordPage, GuidePage, GoalDashboard, ...
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── vercel.json           # SPA rewrite so client-side routes don't 404
│   └── vite.config.ts
└── vercel.json                # fallback SPA rewrite (repo-root)
```

---

## 🛠️ Tech Stack

### Backend
- `FastAPI` + `Uvicorn`
- `supabase-py` — database access (server-side, uses the service-role key)
- `PyJWT` + `cryptography` — verifies Supabase-issued JWTs against its JWKS endpoint
- `pydantic` / `pydantic-settings` — config and validation
- Modular routers for: DSA, Notes, Goals, Tasks, Milestones, Resources

### Frontend
- `React` + `TypeScript` + `Vite`
- `@supabase/supabase-js` — auth (sign-up/in, password reset, session refresh)
- `Tailwind CSS`, `React Router`, `Axios`, `Lucide React`

---

## 🔐 Auth & Security Model

- The frontend talks to **Supabase Auth only** (never the data tables directly) to sign up, sign in, and manage sessions.
- Every API request carries the user's Supabase access token as a Bearer header; `backend/app/auth.py` verifies it against Supabase's public JWKS endpoint and extracts the real user ID — no hardcoded or shared user IDs.
- The backend queries Supabase with its own service-role key (bypasses RLS by design) but enforces per-user ownership on every read/write/delete itself.
- **Row Level Security (RLS)** is enabled on every table as a second, independent layer — see `backend/database/migrations/004_enable_rls.sql`. This protects against the public/anon key (which is necessarily embedded in the frontend bundle) ever being used to read or write another user's data directly against Supabase's REST API.
- CORS is restricted to the production domain and Vercel preview-deployment URLs — not a wildcard.

---

## ⚡ Quick Start

### Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL / SUPABASE_KEY / SUPABASE_SERVICE_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_API_URL / VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

Open the Vite dev URL shown in your terminal to view the app.

---

## 🧩 API Overview

The backend includes built-in documentation and a health endpoint.

- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

Included routers (all require a valid Supabase Bearer token except `/health`):
- `/api/v1/goals`
- `/api/v1/tasks`
- `/api/v1/milestones`
- `/api/v1/resources`
- `/api/v1/notes`
- `/api/v1/dsa`

---

## 🎨 Frontend Highlights

- `src/pages/AuthPage.tsx` — sign-up / sign-in / forgot-password
- `src/pages/ResetPasswordPage.tsx` — email-link recovery + logged-in change-password
- `src/pages/GuidePage.tsx` — full in-app feature guide
- `src/components/dsa` — DSA problem views and topic visualizations
- `src/components/notes` — note editor and note management
- `src/components/onboarding` — onboarding wizard and setup flow
- `src/pages/GoalDashboard.tsx` — central progress dashboard
- `src/services/api.ts` — shared frontend API client (attaches auth token, retries once on a stale-token 401)

---

## 💡 Next Improvements

- Rate limiting on auth-adjacent endpoints
- Restrict remaining free-text status/enum fields
- Add responsive mobile layout polish
- Expand DSA workflow with challenges, streaks, and badges
- Add richer resource filtering and search

---

## 👨‍💻 How to Contribute

1. Add or improve backend router logic in `backend/app/routers/`
2. Define stronger data validation in `backend/app/schemas`
3. Enhance UI components in `frontend/src/components`
4. Extend the API client in `frontend/src/services/api.ts`

---

## 🚀 Deployment

### Frontend on Vercel
- Deploy the `frontend` directory as a Vercel project.
- Required environment variables (set for Production **and** Preview):
  - `VITE_API_URL` — your deployed backend URL, e.g. `https://forgeplanener-2.onrender.com/api/v1`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY` (the `sb_publishable_...` key)
- `frontend/vercel.json` (and a repo-root fallback copy) rewrite all paths to `index.html` so client-side routes like `/login` don't 404 on direct load or refresh.

### Backend on Render
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set `PYTHON_VERSION=3.11.9` as an explicit environment variable (Render's native buildpack doesn't reliably honor `runtime.txt`).
- Required environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_KEY` (publishable/anon key)
  - `SUPABASE_SERVICE_KEY` (secret/service-role key — required for the backend to read/write across RLS as the trusted server)
  - `FRONTEND_URL` (comma-separated list of allowed origins, e.g. `http://localhost:5173,https://forge-planener.vercel.app`)

### Local deployment notes
- Use `backend/.env.example` / `frontend/.env.example` as templates.
- After enabling RLS in Supabase, make sure `SUPABASE_SERVICE_KEY` is set on the backend (both locally and on Render) — without it, the backend falls back to the anon key and RLS will block its own queries.

---

> Forge is built for rapid learning, creative planning, and joyful execution.
