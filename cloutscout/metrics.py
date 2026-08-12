"""Creator-level metrics and the Potential Score.

Formulas here implement docs/spec.md section 3 and docs/model-scoring.md —
keep those docs and this module in sync if either changes.
"""

import numpy as np
import pandas as pd

from cloutscout.config import ENGAGEMENT_WEIGHT, LOW_CONFIDENCE_PERCENTILE, REACH_WEIGHT
from cloutscout.data import load_videos


def _min_max_normalize(series: pd.Series) -> pd.Series:
    lo, hi = series.min(), series.max()
    if hi == lo:
        return pd.Series(0.5, index=series.index)
    return (series - lo) / (hi - lo)


def compute_creator_metrics(videos: pd.DataFrame | None = None) -> pd.DataFrame:
    """Roll video-level rows up into one row per creator with the Potential Score."""
    if videos is None:
        videos = load_videos()

    videos = videos.copy()
    videos["engagement_actions"] = videos["likes"] + videos["comments"] + videos["shares"]

    grouped = videos.groupby("author_name").agg(
        reach=("views", "sum"),
        engagement_actions=("engagement_actions", "sum"),
        video_count=("video_id", "count"),
        verified=("author_verified", "any"),
    )
    grouped["engagement_rate"] = grouped["engagement_actions"] / grouped["reach"]
    grouped = grouped.drop(columns="engagement_actions")

    norm_engagement = _min_max_normalize(grouped["engagement_rate"])
    norm_reach = _min_max_normalize(np.log10(grouped["reach"]))
    grouped["potential_score"] = (
        100 * (ENGAGEMENT_WEIGHT * norm_engagement + REACH_WEIGHT * norm_reach)
    )

    reach_floor = grouped["reach"].quantile(LOW_CONFIDENCE_PERCENTILE)
    engagement_floor = grouped["engagement_rate"].quantile(LOW_CONFIDENCE_PERCENTILE)
    grouped["low_confidence"] = (grouped["reach"] < reach_floor) | (
        grouped["engagement_rate"] < engagement_floor
    )

    reach_median = grouped["reach"].median()
    engagement_median = grouped["engagement_rate"].median()
    high_reach = grouped["reach"] >= reach_median
    high_engagement = grouped["engagement_rate"] >= engagement_median
    grouped["quadrant"] = np.select(
        [
            high_reach & high_engagement,
            ~high_reach & high_engagement,
            high_reach & ~high_engagement,
        ],
        ["priority_partnerships", "rising_talent", "reach_without_traction"],
        default="not_a_fit",
    )

    grouped = grouped.reset_index().sort_values("potential_score", ascending=False)
    return grouped.reset_index(drop=True)


def compute_callouts(creators: pd.DataFrame, top_n: int = 5) -> list[str]:
    """Short, data-grounded highlights — same computed metrics as the rest of the dashboard."""
    callouts: list[str] = []

    confident = creators[~creators["low_confidence"]]
    if not confident.empty:
        top_engagement = confident.sort_values("engagement_rate", ascending=False).iloc[0]
        callouts.append(
            f"Highest engagement rate: @{top_engagement['author_name']} at "
            f"{top_engagement['engagement_rate']:.1%} "
            f"({int(top_engagement['reach']):,} views across "
            f"{int(top_engagement['video_count'])} video(s))"
        )

    repeat_creators = creators[creators["video_count"] >= 3]
    if not repeat_creators.empty:
        most_consistent = repeat_creators.sort_values("potential_score", ascending=False).iloc[0]
        callouts.append(
            f"Most consistent high performer: @{most_consistent['author_name']}, "
            f"{int(most_consistent['video_count'])} videos, "
            f"potential score {most_consistent['potential_score']:.0f}"
        )

    reach_without_traction = creators[creators["quadrant"] == "reach_without_traction"]
    if not reach_without_traction.empty:
        biggest_gap = reach_without_traction.sort_values("reach", ascending=False).iloc[0]
        callouts.append(
            f"Reach without engagement: @{biggest_gap['author_name']} — "
            f"{int(biggest_gap['reach']):,} views but engagement rate of only "
            f"{biggest_gap['engagement_rate']:.1%} (below median)"
        )

    rising_talent = creators[creators["quadrant"] == "rising_talent"]
    if not rising_talent.empty:
        top_rising = rising_talent.sort_values("potential_score", ascending=False).iloc[0]
        callouts.append(
            f"Rising talent to watch: @{top_rising['author_name']} — "
            f"{top_rising['engagement_rate']:.1%} engagement rate on "
            f"{int(top_rising['reach']):,} views, worth an early bet"
        )

    verified_low_potential = creators[
        creators["verified"] & (creators["quadrant"] == "reach_without_traction")
    ]
    if not verified_low_potential.empty:
        flagged = verified_low_potential.sort_values("reach", ascending=False).iloc[0]
        callouts.append(
            f"Verified but underperforming on engagement: @{flagged['author_name']}"
        )

    return callouts[:top_n]
