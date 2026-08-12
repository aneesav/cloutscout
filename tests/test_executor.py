import pandas as pd
import pytest

from cloutscout.metrics import compute_creator_metrics
from cloutscout.qa.executor import run_query
from cloutscout.qa.schema import StructuredQuery


@pytest.fixture
def creators():
    videos = pd.DataFrame(
        [
            dict(
                views=1_000_000,
                likes=1_000,
                comments=0,
                shares=0,
                author_verified=False,
                author_name="reach_only",
                video_id=1,
            ),
            dict(
                views=10_000,
                likes=3_000,
                comments=0,
                shares=0,
                author_verified=True,
                author_name="engaged",
                video_id=2,
            ),
        ]
    )
    return compute_creator_metrics(videos)


def test_sort_and_limit(creators):
    query = StructuredQuery(sort_by="engagement_rate", limit=1)
    result = run_query(creators, query)
    assert len(result) == 1
    assert result.iloc[0]["author_name"] == "engaged"


def test_author_lookup_is_case_and_at_insensitive(creators):
    query = StructuredQuery(author_name="@Engaged")
    result = run_query(creators, query)
    assert len(result) == 1
    assert result.iloc[0]["author_name"] == "engaged"


def test_unsupported_reason_returns_no_rows(creators):
    query = StructuredQuery(unsupported_reason="follower counts aren't in this dataset")
    result = run_query(creators, query)
    assert result.empty


def test_verified_filter(creators):
    query = StructuredQuery(verified_only=True)
    result = run_query(creators, query)
    assert list(result["author_name"]) == ["engaged"]
