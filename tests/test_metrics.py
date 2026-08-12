import pandas as pd

from cloutscout.metrics import compute_creator_metrics


def _videos(rows):
    return pd.DataFrame(rows)


def test_engagement_rate_is_pooled_not_averaged():
    # One low-view video with a fluky 100% rate should not dominate a creator's
    # overall engagement rate once pooled with a much larger video.
    videos = _videos(
        [
            dict(
                views=10,
                likes=10,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="a",
                video_id=1,
            ),
            dict(
                views=10_000,
                likes=100,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="a",
                video_id=2,
            ),
        ]
    )
    creators = compute_creator_metrics(videos)
    row = creators.iloc[0]
    # pooled: (10 + 100) / (10 + 10_000), not a 55% average-of-rates
    assert row["engagement_rate"] < 0.02


def test_potential_score_favors_engagement_over_reach():
    videos = _videos(
        [
            # huge reach, weak engagement
            dict(
                views=1_000_000,
                likes=100,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="reach_only",
                video_id=1,
            ),
            # modest reach, strong engagement
            dict(
                views=10_000,
                likes=3_000,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="engaged",
                video_id=2,
            ),
        ]
    )
    creators = compute_creator_metrics(videos).set_index("author_name")
    assert creators.loc["engaged", "potential_score"] > creators.loc["reach_only", "potential_score"]


def test_low_confidence_flag_and_quadrant_are_set():
    videos = _videos(
        [
            dict(
                views=100,
                likes=1,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="tiny",
                video_id=1,
            ),
            dict(
                views=1_000_000,
                likes=200_000,
                comments=0,
                shares=0,
                author_verified=True,
                author_name="big",
                video_id=2,
            ),
        ]
    )
    creators = compute_creator_metrics(videos)
    assert set(creators["quadrant"]) <= {
        "priority_partnerships",
        "rising_talent",
        "reach_without_traction",
        "not_a_fit",
    }
    assert creators["low_confidence"].any()
