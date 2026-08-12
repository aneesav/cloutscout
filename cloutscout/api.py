"""Clout Scout backend API.

Two surfaces, per docs/spec.md:
  GET  /api/dashboard  -> the at-a-glance summary (section 4)
  POST /api/qa         -> the plain-English Q&A flow (section 5)

This is a backend-only service. It intentionally ships no frontend and no
deployment config — see README.md for how a frontend (e.g. built on Replit)
is expected to consume it.
"""

import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from cloutscout.config import DEFAULT_SHORTLIST_SIZE
from cloutscout.data import load_videos
from cloutscout.metrics import compute_callouts, compute_creator_metrics
from cloutscout.qa.claude import narrate_result, parse_question
from cloutscout.qa.executor import run_query
from cloutscout.schemas import (
    CreatorMetrics,
    DashboardKpis,
    DashboardSummary,
    QARequest,
    QAResponse,
    QuadrantPoint,
)

app = FastAPI(title="Clout Scout API")

# Wide open for local development / Replit-hosted frontends on a different
# origin. Tighten to specific origins before a real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard() -> DashboardSummary:
    videos = load_videos()
    creators = compute_creator_metrics(videos)

    total_reach = int(creators["reach"].sum())
    total_engagement_actions = (videos["likes"] + videos["comments"] + videos["shares"]).sum()
    kpis = DashboardKpis(
        creators_tracked=len(creators),
        videos_analyzed=len(videos),
        total_reach=total_reach,
        aggregate_engagement_rate=float(total_engagement_actions / videos["views"].sum()),
        pct_verified=float(creators["verified"].mean()),
        date_range_start=str(videos["upload_date"].min()),
        date_range_end=str(videos["upload_date"].max()),
    )

    shortlist = [
        CreatorMetrics(**row)
        for row in creators.head(DEFAULT_SHORTLIST_SIZE).to_dict(orient="records")
    ]
    quadrant_chart = [
        QuadrantPoint(**row)
        for row in creators[
            ["author_name", "reach", "engagement_rate", "video_count", "verified", "quadrant"]
        ].to_dict(orient="records")
    ]
    callouts = compute_callouts(creators)

    return DashboardSummary(
        kpis=kpis, shortlist=shortlist, quadrant_chart=quadrant_chart, callouts=callouts
    )


@app.post("/api/qa", response_model=QAResponse)
def ask_question(request: QARequest) -> QAResponse:
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="question must not be empty")

    creators = compute_creator_metrics()

    try:
        query = parse_question(request.question)
        result = run_query(creators, query)
        result_rows = result.to_dict(orient="records")
        answer = narrate_result(request.question, query, result_rows)
    except TypeError as e:
        # The Anthropic SDK raises a bare TypeError (not an APIError subclass)
        # when it can't resolve credentials at all — e.g. ANTHROPIC_API_KEY unset.
        raise HTTPException(
            status_code=503,
            detail=f"Q&A is unavailable: Claude credentials aren't configured ({e}). "
            "Set ANTHROPIC_API_KEY in .env and restart the server.",
        ) from e
    except anthropic.APIStatusError as e:
        raise HTTPException(
            status_code=502, detail=f"Q&A is unavailable: Claude API error ({e.message})"
        ) from e
    except anthropic.APIConnectionError as e:
        raise HTTPException(
            status_code=502, detail=f"Q&A is unavailable: couldn't reach Claude ({e})"
        ) from e

    return QAResponse(
        answer=answer,
        table=result_rows,
        low_confidence_note=bool(result["low_confidence"].any()) if not result.empty else False,
    )
