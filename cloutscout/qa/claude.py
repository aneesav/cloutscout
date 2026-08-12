"""LLM translation (NL -> query) and narration (result -> NL).

Per docs/spec.md section 5.2, the model's only two jobs are here: parse a
question into a StructuredQuery, and narrate an already-computed result set.
It never computes a number itself.
"""

import json

import anthropic

from cloutscout.config import CLAUDE_MODEL
from cloutscout.qa.schema import StructuredQuery

_METRIC_DEFINITIONS = """
Metric definitions (use these exact meanings, matching the dashboard):
- reach: a creator's total views, summed across all their videos in the dataset.
- engagement_rate: (likes + comments + shares) / views, pooled across all of a
  creator's videos. This is the PRIMARY signal — it measures what fraction of an
  earned audience actually responded, which is a stronger predictor of partnership
  potential than raw reach alone (you can't engage with a video you haven't viewed,
  so engagement is conditional on reach).
- potential_score: 0-100, weighted 65% normalized engagement_rate + 35% normalized
  reach (log-scaled). Engagement-led per the definitions above.
- verified: whether the creator's account is marked verified on the platform.
- low_confidence: the creator's reach or engagement_rate falls in the bottom
  quartile of the dataset, so their engagement_rate is a small-sample estimate —
  disclose this when narrating results that include such a creator.

This dataset is a static snapshot of TikTok videos (Sep-Dec 2020). It has no
follower counts, revenue, audience demographics, or data from other platforms.
"""

_PARSE_SYSTEM_PROMPT = f"""You translate a stakeholder's plain-English question about
creator performance into a StructuredQuery. You do not answer the question yourself —
you only produce the query that a deterministic executor will run against the real data.

{_METRIC_DEFINITIONS}

If the question asks for something outside this schema (follower counts, revenue,
demographics, platforms other than TikTok, anything not derivable from
views/likes/comments/shares/video metadata), set unsupported_reason to a short
explanation of what's missing and leave every other field at its default. Do not
guess a mapping to a similar-sounding field."""

_NARRATE_SYSTEM_PROMPT = f"""You narrate the result of a query already run against
real creator-performance data for a talent-shortlisting app. You are given the
original question, the query that was executed, and the exact result rows.

{_METRIC_DEFINITIONS}

Rules:
- State only what is present in the result rows you were given. Never introduce a
  number, creator, or claim that isn't in that data.
- If the result set is empty, say so plainly rather than speculating why.
- If any row has low_confidence: true, mention that its engagement rate is based on
  a small sample.
- Be direct and concise — a sentence or two, plus specific figures from the data.
- If unsupported_reason is set on the query, explain what data would be needed to
  answer the question, without answering it."""


def parse_question(question: str, client: anthropic.Anthropic | None = None) -> StructuredQuery:
    client = client or anthropic.Anthropic()
    response = client.messages.parse(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        output_config={"effort": "low"},
        system=_PARSE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": question}],
        output_format=StructuredQuery,
    )
    return response.parsed_output


def narrate_result(
    question: str,
    query: StructuredQuery,
    result_rows: list[dict],
    client: anthropic.Anthropic | None = None,
) -> str:
    client = client or anthropic.Anthropic()
    context = json.dumps(
        {
            "question": question,
            "query_executed": query.model_dump(exclude_none=True),
            "result_rows": result_rows,
        },
        default=str,
    )
    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1024,
        output_config={"effort": "low"},
        system=_NARRATE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": context}],
    )
    return next(block.text for block in response.content if block.type == "text")
