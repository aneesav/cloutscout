# Clout Scout

A creator talent shortlisting tool for agencies. Built on a static TikTok dataset of 1,000 videos from 802 creators (Sep–Dec 2020).

## Stack

- **Backend**: Python 3.12, FastAPI, pandas, Anthropic Claude — `cloutscout/`
- **Frontend**: React + Vite (TypeScript) — `frontend/`
- **Data**: `data/2026datathon_interview_data.csv`

## Running

Two workflows run the app:

| Workflow | Command | Port |
|---|---|---|
| Backend API | `uv run uvicorn cloutscout.api:app --host 0.0.0.0 --port 8000` | 8000 |
| Start application | `cd frontend && npm run dev` | 5000 (preview) |

The frontend (port 5000) proxies `/api/*` to the backend (port 8000) via Vite's dev server proxy.

## API endpoints

- `GET /api/health` — liveness check
- `GET /api/dashboard` — dashboard summary (KPIs, ranked shortlist, quadrant chart data, callouts)
- `POST /api/qa` `{"question": "..."}` — plain-English Q&A over the data (requires `ANTHROPIC_API_KEY`)

## Environment variables / secrets

- `ANTHROPIC_API_KEY` — required for the `/api/qa` endpoint (Claude-powered Q&A). Set as a Replit Secret.

## Python package management

Uses `uv`. To add dependencies: `uv add <package>`. The `.python-version` file is set to `3.12` (the version available in this Replit environment).

## Docs

- `docs/spec.md` — full product spec (scoring model, dashboard layout, Q&A trustworthiness design)
- `docs/model-scoring.md` — Potential Score formula detail

## User preferences

- Dark navy theme for the frontend
