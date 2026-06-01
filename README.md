# 🔥 Forge

A Marvel-inspired personal goal operating system with a bright React frontend and a flexible FastAPI backend.

Forge helps you plan goals, manage milestones, organize tasks, write notes, save resources, and power up DSA practice in one polished workspace.

---

## 🌟 What is Forge?

Forge is a full-stack productivity and learning platform designed for makers, students, and coders.

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI with modular routers and clean API design
- **Theme:** Marvel-inspired UI with bold colors and clear workflows
- **Goal:** Turn planning, study, and execution into a smooth daily habit

---

## 🚀 Core Features

- ✅ Goal creation, tracking, and progress insights
- ✅ Milestone planning and dependency support
- ✅ Task manager for daily work and learning habits
- ✅ Note taking and study journaling
- ✅ DSA practice section with interactive problem organization
- ✅ Resource library for bookmarks, articles, and guides
- ✅ Onboarding wizard for fast setup
- ✅ Backend health-check plus CORS-ready API support

---

## 🧱 Project Structure

```
Forge/
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── database/
│   ├── requirements.txt
│   └── seed_goal.py
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🛠️ Tech Stack

### Backend
- `FastAPI`
- `Uvicorn`
- `python-dotenv` / environment config via `app.config`
- Modular routers for:
  - DSA
  - Notes
  - Onboarding
  - Goals
  - Tasks
  - Milestones
  - Resources

### Frontend
- `React` + `TypeScript`
- `Vite`
- `Tailwind CSS`
- `React Router`
- `Axios`
- `Lucide React`

---

## ⚡ Quick Start

### Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite dev URL shown in your terminal to view the app.

---

## 🧩 API Overview

The backend includes built-in documentation and a health endpoint.

- Swagger UI: `http://localhost:8000/docs`
- Redoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

Included routers:
- `/dsa`
- `/notes`
- `/onboarding`
- `/goals`
- `/tasks`
- `/resources`
- `/milestones`

---

## 🎨 Frontend Highlights

- `src/components/dsa` — DSA problem views and topic visualizations
- `src/components/notes` — note editor and note management
- `src/components/onboarding` — onboarding wizard and setup flow
- `src/pages/GoalDashboard.tsx` — central progress dashboard
- `src/services/api.ts` — shared frontend backend API client

---

## 💡 Next Improvements

- Add user authentication and multi-user support
- Persist data with a production-ready database
- Add responsive mobile layout and animated dashboards
- Expand DSA workflow with challenges, streaks, and badges
- Add richer resource filtering and search

---

## 👨‍💻 How to Contribute

1. Add or improve backend router logic in `backend/app/main.py`
2. Define stronger data validation in `backend/app/schemas`
3. Enhance UI components in `frontend/src/components`
4. Extend the API client in `frontend/src/services/api.ts`

---

> Forge is built for rapid learning, creative planning, and joyful execution.
