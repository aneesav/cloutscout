"""Deterministic execution of a StructuredQuery against real creator metrics.

No LLM involvement here — this is the "no invented numbers" guarantee from
docs/spec.md section 5.2. The LLM only produces the query (see claude.py)
and narrates this function's output; it never computes anything itself.
"""

import pandas as pd

from cloutscout.qa.schema import StructuredQuery


def run_query(creators: pd.DataFrame, query: StructuredQuery) -> pd.DataFrame:
    if query.unsupported_reason is not None:
        return creators.iloc[0:0]

    result = creators

    if query.author_name is not None:
        result = result[result["author_name"].str.lower() == query.author_name.lower().lstrip("@")]
        return result

    if query.verified_only is not None:
        result = result[result["verified"] == query.verified_only]

    if query.reach_min_percentile is not None:
        threshold = creators["reach"].quantile(query.reach_min_percentile / 100)
        result = result[result["reach"] >= threshold]
    if query.reach_max_percentile is not None:
        threshold = creators["reach"].quantile(query.reach_max_percentile / 100)
        result = result[result["reach"] <= threshold]

    if query.engagement_min_percentile is not None:
        threshold = creators["engagement_rate"].quantile(query.engagement_min_percentile / 100)
        result = result[result["engagement_rate"] >= threshold]
    if query.engagement_max_percentile is not None:
        threshold = creators["engagement_rate"].quantile(query.engagement_max_percentile / 100)
        result = result[result["engagement_rate"] <= threshold]

    result = result.sort_values(query.sort_by, ascending=not query.sort_desc)
    return result.head(query.limit)
