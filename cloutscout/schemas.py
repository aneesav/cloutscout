from pydantic import BaseModel


class CreatorMetrics(BaseModel):
    author_name: str
    potential_score: float
    engagement_rate: float
    reach: int
    video_count: int
    verified: bool
    low_confidence: bool
    quadrant: str


class DashboardKpis(BaseModel):
    creators_tracked: int
    videos_analyzed: int
    total_reach: int
    aggregate_engagement_rate: float
    pct_verified: float
    date_range_start: str
    date_range_end: str


class QuadrantPoint(BaseModel):
    author_name: str
    reach: int
    engagement_rate: float
    video_count: int
    verified: bool
    quadrant: str


class DashboardSummary(BaseModel):
    kpis: DashboardKpis
    shortlist: list[CreatorMetrics]
    quadrant_chart: list[QuadrantPoint]
    callouts: list[str]


class QARequest(BaseModel):
    question: str


class QAResponse(BaseModel):
    answer: str
    table: list[dict]
    low_confidence_note: bool
