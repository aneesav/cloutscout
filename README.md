# cloutscout

A package that helps agencies identify and shortlist promising creator talent for partner engagement.

See [`docs/spec.md`](docs/spec.md) for the product spec and [`docs/model-scoring.md`](docs/model-scoring.md) for how the Potential Score is calculated.

## What's here

This repo currently contains the **backend only**: a Python API that computes creator metrics from the dataset in `data/` and answers natural-language questions about them. There is no frontend yet; a third party UI is expected to consume this API. See "Handing off the frontend" below.

```
cloutscout/
  config.py       # tunable constants (score weights, model name, etc.)
  data.py         # loads the raw video dataset
  metrics.py      # creator-level aggregation + Potential Score (docs/model-scoring.md)
  schemas.py      # API response models
  api.py          # FastAPI app — the only entry point a frontend needs
  qa/
    schema.py     # the structured query the LLM is allowed to produce
    executor.py   # runs a structured query against real data (no LLM involved)
    claude.py     # NL -> query, and result -> NL narration, via Claude
docs/             # spec, data summary, scoring writeup
data/             # source dataset
tests/
```

## Running locally

Requires [`uv`](https://docs.astral.sh/uv/).

```sh
uv sync
cp .env.example .env   # then fill in ANTHROPIC_API_KEY — required for /api/qa
uv run uvicorn cloutscout.api:app --reload
```

The API is now at `http://127.0.0.1:8000`:

- `GET /api/health` — liveness check
- `GET /api/dashboard` — the at-a-glance summary (KPIs, ranked shortlist, quadrant chart data, callouts)
- `POST /api/qa` `{"question": "..."}` — plain-English Q&A over the same data

`/api/dashboard` works with no API key. `/api/qa` needs `ANTHROPIC_API_KEY` set, since it calls Claude to translate the question into a query and narrate the result (see `docs/spec.md` section 5 for how that's kept grounded in real data).

## Inspecting the API locally

With the server running, FastAPI provides an interactive explorer with no extra setup:

- `http://127.0.0.1:8000/docs` — Swagger UI: try each endpoint from the browser, see request/response schemas
- `http://127.0.0.1:8000/redoc` — ReDoc: read-only, cleaner for skimming the schema

Or hit it directly:

```sh
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/dashboard
curl -X POST http://127.0.0.1:8000/api/qa \
  -H "content-type: application/json" \
  -d '{"question": "which creators get the most engagement?"}'
```

## Handing off the frontend

The backend is intentionally decoupled from any UI or deployment config:

- CORS is wide open (`app/api.py`) so a frontend on a different origin (e.g. a Replit-hosted app) can call it directly during development.
- No Dockerfile, Procfile, or hosting config is included; a deliberate gap for frontend/deployment to fill in.
- The API is the contract: point a frontend at `/api/dashboard` and `/api/qa` and everything in `docs/spec.md` sections 4 and 5 is available.
