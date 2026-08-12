"""The structured query the LLM is allowed to produce.

This is the allow-list from docs/spec.md section 5.3 ("schema-constrained
parsing"): the model can only ask for fields, sorts, and percentile filters
defined here. It cannot invent a metric or reach outside this schema — any
question that doesn't fit becomes `unsupported_reason` instead of a guess.
"""

from typing import Literal

from pydantic import BaseModel, Field

SortField = Literal["potential_score", "engagement_rate", "reach", "video_count"]


class StructuredQuery(BaseModel):
    """A validated, schema-constrained query over creator metrics.

    All percentile fields are 0-100 and are resolved against the live
    dataset by the executor — the model reasons in relative terms
    ("top quartile") rather than guessing absolute numbers it can't know.
    """

    author_name: str | None = Field(
        default=None,
        description="Exact creator handle to look up directly, for single-creator questions.",
    )
    verified_only: bool | None = Field(
        default=None,
        description="True to require verified creators, False to require unverified, None for no filter.",
    )
    reach_min_percentile: float | None = Field(
        default=None, ge=0, le=100, description="Only creators at or above this reach percentile."
    )
    reach_max_percentile: float | None = Field(
        default=None, ge=0, le=100, description="Only creators at or below this reach percentile."
    )
    engagement_min_percentile: float | None = Field(
        default=None,
        ge=0,
        le=100,
        description="Only creators at or above this engagement rate percentile.",
    )
    engagement_max_percentile: float | None = Field(
        default=None,
        ge=0,
        le=100,
        description="Only creators at or below this engagement rate percentile.",
    )
    sort_by: SortField = Field(
        default="potential_score", description="Field to sort the result by."
    )
    sort_desc: bool = Field(default=True, description="Sort descending if true.")
    limit: int = Field(default=10, ge=1, le=100, description="Max rows to return.")
    unsupported_reason: str | None = Field(
        default=None,
        description=(
            "Set this (and leave every other field at its default) when the question asks for "
            "something not in this schema — e.g. follower counts, revenue, demographics, "
            "audience data, or anything not derivable from views/likes/comments/shares/video "
            "metadata. State plainly what data would be needed."
        ),
    )
