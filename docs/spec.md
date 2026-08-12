# Clout Scout — Application Spec

## 1. Purpose

Clout Scout helps agency stakeholders shortlist creator talent for partnership opportunities. It is built on a static dataset of 1,000 TikTok videos from 802 creators (see [`data-summary.md`](./data-summary.md)).

The app has two surfaces:

1. **At-a-glance dashboard** — a single screen that answers "where should I focus?" the moment a stakeholder opens the app.
2. **Plain-English Q&A** — a natural-language follow-up flow, powered by an LLM, that answers questions grounded in the real data.

## 2. Core assumption: how we define "creator potential"

This is the logic for both surfaces:

- **Views measure reach.** A high view count means a creator can get in front of a lot of people — that's a real, standalone signal of potential.
- **Likes, comments, and shares measure engagement.** These require a view to happen first — a viewer must see a video before they can like, comment, or share it. So engagement is *conditional* on views: it can never exceed what views make possible.
- **The inverse never happens**: you can have views with zero engagement (a video that gets seen but doesn't land), but you cannot have engagement without views. This asymmetry is why raw view count alone is a weak proxy for partnership fit — it tells you a creator *can* get seen, not that their audience *does anything* when they see it.
- **Conclusion: engagement rate is a stronger predictor of creator potential than views alone**, because it measures what fraction of an earned audience actually responded. Views still matter — they set the ceiling and indicate scale — but they are treated as a secondary, confirming signal rather than the primary ranking signal.

This ordering (engagement rate primary, views secondary) drives the scoring model in section 3.

## 3. Metrics & scoring

### 3.1 Video-level metrics

| Metric | Formula |
|---|---|
| Engagement Rate (video) | `(likes + comments + shares) / views` |

### 3.2 Creator-level aggregation

The dataset is video-level; the product is creator-level. Videos are rolled up per `author_name`:

| Metric | Formula | Why |
|---|---|---|
| Creator Reach | `sum(views)` across the creator's videos | Total demonstrated audience reach, not just one video's luck |
| Creator Engagement Rate | `sum(likes + comments + shares) / sum(views)` across the creator's videos | A pooled ratio (not an average-of-ratios) so one small video with a fluky high rate can't skew the result |
| Video Count | count of videos by that creator in the dataset | Sample size / confidence signal |
| Verified | `True` if `author_verified` is `True` on any of their videos | Informational badge, not a scoring input (see §3.4) |

**Low-sample guard:** creators below the 25th percentile of Creator Reach and Creator Engagement Rate are flagged `low_confidence` in the UI (small denominator → noisy engagement rate) rather than excluded outright. They still appear, just visually de-emphasized, so the app never silently hides talent.

### 3.3 Potential Score

A single ranking number, weighted toward engagement per  section 2, normalized because both inputs are on very different, skewed scales (views range from hundreds to hundreds of millions):

```
norm_engagement = min_max_normalize(Creator Engagement Rate)
norm_reach       = min_max_normalize(log10(Creator Reach))

Potential Score = 0.65 * norm_engagement + 0.35 * norm_reach
```

- Log-transforming reach before normalizing prevents a handful of mega-viral outliers (e.g. the 250M-view video) from dominating the reach term.
- Normalizing both (log) reach (a view count) and engagement (a percentage) rescales each one to matching units so the lowest creator scores 0, the highest scores 1 and everyone else falls proportionally in between.
- The 65/35 split is a configurable constant (`ENGAGEMENT_WEIGHT`), not a hardcoded belief; so a creator who's near the top on engagement but middling on reach will still score well, but a creator who's purely a reach outlier with weak engagement can't win on views alone.
- Score is recomputed across the full creator set, so it's always relative to the current dataset, not an absolute scale.

*Takeaway:* each creator gets ranked mostly on what fraction of their audience actually reacted (engagement), with how big that audience was (reach)
  folded in as a secondary boost and both numbers are rescaled first so neither a wildly viral video nor mismatched units distorts the blend.

### 3.4 Signals that inform but don't score

These appear as context/filters, not score inputs, because the data doesn't support treating them as reliable potential predictors on their own:

- `author_verified` — shown as a badge; verified creators skew toward established reach, not necessarily engagement, so it's a filter, not a weight.
- `primary_hashtag`, `music_name`, `music_is_original`, `duration_sec`, `upload_date` — available for the Q&A layer to slice by, and for explaining *why* a creator scored the way they did, but excluded from the Potential Score itself since the spec's directive is specifically about views vs. engagement.

## 4. Screen 1 — At-a-Glance Dashboard

Single screen, no scrolling required to get the headline answer. Loads with the full creator set already ranked.

### 4.1 Layout

**A. Summary strip (top)** — KPI tiles giving dataset-wide context:
- Creators tracked / Videos analyzed
- Aggregate reach (total views)
- Aggregate engagement rate (pooled, dataset-wide)
- % verified creators
- Date range of underlying data (Sep 22 – Dec 21, 2020) — signals this is a historical snapshot, not live

**B. Shortlist table (primary focus area)** — top-ranked creators by Potential Score:

| Column | Notes |
|---|---|
| Creator | `author_name`, verified badge if applicable |
| Potential Score | 0–100 scale, sorted descending by default |
| Engagement Rate | formatted %, this is the primary driver — shown prominently |
| Reach (views) | secondary column, abbreviated (e.g. "12.4M") |
| Videos | count in dataset; low-confidence creators show a subtle flag |

Default view: top 20. Sortable/filterable by any column, filterable by verified status and low-confidence flag.

**C. Quadrant chart** — the visual answer to "where should I focus":
- X-axis: Reach (log scale)
- Y-axis: Engagement Rate
- Each point = one creator, sized by video count, colored by verified status
- Quadrants labeled directly on the chart:
  - **Top-right** — High reach + high engagement → *priority partnerships*
  - **Top-left** — Low reach + high engagement → *rising talent, worth early bets*
  - **Bottom-right** — High reach + low engagement → *reach without traction, deprioritize despite view counts*
  - **Bottom-left** — Low reach + low engagement → *not a fit right now*

This chart is the direct visual expression of section 2's thesis: it's built specifically so a stakeholder can see that top-right and top-left (both high-engagement) outrank bottom-right (high-views-only) at a glance.

**D. Callouts panel** — 3–5 auto-generated one-line highlights, e.g.:
- "Highest engagement rate: `@handle` at X% (only Y views — small but reacting audience)"
- "Most consistent: `@handle`, N videos, engagement rate within a tight band"
- "Reach without engagement: `@handle` — Nx more views than the median but engagement rate below the 25th percentile"

These are generated from the same computed metrics as the table/chart so the dashboard and Q&A layer never disagree.

## 5. Screen 2 — Plain-English Q&A

### 5.1 Goal

Let a stakeholder ask something like *"which creators get the most engagement?"* or *"who are the rising creators with low reach but strong engagement?"* and get an answer that is accurate to the underlying data.

### 5.2 Trustworthiness principle

**The LLM never invents numbers.** It only narrates results that were computed by deterministic code against the actual dataset. Concretely:

```
User question (NL)
   -> LLM parses intent into a structured query
      (metric, filter, sort, aggregation — constrained to a known schema:
       creator, video, or metric fields defined in §3)
   -> Structured query validated against an allow-list of fields/operations
   -> Query executed against the real (pandas/SQL) data — deterministic, no LLM involved
   -> Result set (numbers + supporting rows) returned
   -> LLM narrates the result set in plain English, citing the actual figures
   -> UI shows the NL answer AND the supporting table/chart it was generated from
```

The LLM's two jobs are translation (NL → structured query) and narration (result → NL). It never performs the computation itself and never answers from parametric memory. If a question can't be mapped to a valid query against the known schema, the app says so explicitly rather than guessing.

### 5.3 Guardrails

- **Schema-constrained parsing**: the structured query can only reference fields that exist in the data model (section 3), so the LLM can't fabricate a metric like "virality index" that isn't defined.
- **Grounded narration**: the narration prompt is given only the computed result set as context, with an explicit instruction to state only what's in that result set.
- **Show the work**: every NL answer is paired with the underlying table/number it came from, so a stakeholder can verify it without trusting the model.
- **Explicit refusal path**: if the question is out of scope (asks about something not in the dataset — e.g. follower counts, revenue, audience demographics) or ambiguous, the app says what it can't answer and, where possible, offers the closest available alternative — it never fills the gap with a plausible-sounding fabrication.
- **Consistent definitions**: "engagement," "reach," and "potential score" mean exactly what §3 defines, in both the dashboard and the Q&A layer. The narration prompt is given those definitions so its phrasing matches the dashboard's.
- **Low-confidence disclosure**: if a result set involves a `low_confidence`-flagged creator (§3.2), the narrated answer says so (e.g. "based on only 1 video").

### 5.4 Example flows

| User question | Structured query (illustrative) | Answer grounding |
|---|---|---|
| "Which creators get the most engagement?" | sort creators by `Creator Engagement Rate` desc, top 10 | Table of 10 creators + their engagement rate, reach, video count |
| "Who has a lot of views but people don't engage?" | filter reach > 75th percentile AND engagement rate < 25th percentile | Table of matching creators, explicitly framed as the bottom-right quadrant from Screen 1 |
| "Is `@handle` verified?" | lookup `author_verified` for creator | Direct fact from data |
| "What's `@handle`'s follower count?" | field not in schema | Refusal: "That field isn't in this dataset — it only tracks per-video performance, not follower counts." |
| "Which creators should we partner with?" | sort by `Potential Score` desc, top N | Table + one-line explanation referencing §3.3's weighting (engagement-led) |

## 6. Non-goals

- No prediction/forecasting model (e.g. ML-based future virality prediction) — scoring is a transparent, deterministic formula over historical data, not a black-box model.
- No live data ingestion — the dataset is a static 3-month snapshot (Sep–Dec 2020); the app does not claim real-time creator standing.
- No follower/audience-size or demographic data — not present in the dataset, so not part of scoring or answerable via Q&A.
- No cross-platform data — TikTok only, per the source dataset.

## 7. Open questions / future work areas

- **Engagement weighting (65/35)** is a reasonable starting default consistent with section 2's directive, not an empirically fit value. Worth revisiting if partnership outcome data (e.g. actual campaign performance) becomes available to validate against.
