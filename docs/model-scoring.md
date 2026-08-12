# Model & Scoring — How the Potential Score Works

This document explains, in plain language, how the Potential Score (defined in [`spec.md`](./spec.md) section 3.3) is calculated and what kind of model it is.

## The formula

```
Potential Score = 0.65 * norm_engagement + 0.35 * norm_reach
```

## How it's calculated, step by step

**1. Start with each creator's two raw numbers**
- Their **engagement rate** — pooled `(likes + comments + shares) / views` across all their videos.
- Their **reach** — total views across all their videos.

**2. Put reach on a fairer scale first**
Reach is wildly skewed — some creators have hundreds of views, one video in the dataset has 250M. If raw view counts were used directly, that one mega-viral video would swamp everything else and reach would basically *become* the whole score. So reach is log-transformed (log10) first, to compress that range down to something reasonable before it's compared to anything else.

**3. Normalize both numbers to a 0–1 scale**
Engagement rate and (log) reach are measured in completely different units — a percentage vs. a view count — so they can't be added together as-is. Min-max normalization rescales each one so that, within the current creator set, the lowest creator scores 0, the highest scores 1, and everyone else falls proportionally in between. Now both numbers mean roughly "how does this creator rank relative to everyone else," on the same 0–1 scale.

**4. Blend them, weighted 65/35 toward engagement**
```
Potential Score = 0.65 × (normalized engagement rate) + 0.35 × (normalized reach)
```
Engagement gets nearly two-thirds of the weight, reach gets a bit over a third. A creator who's near the top on engagement but middling on reach will still score well — but a creator who's purely a reach outlier with weak engagement can't win on views alone.

**Important caveat:** the score is **relative to the current dataset**, not an absolute measure. Because min-max normalization stretches the current creator pool between 0 and 1, adding or removing creators shifts everyone else's score too, even if their own numbers didn't change.

## What kind of model this is

This is a **weighted linear index** (sometimes called a "scorecard model"), not a statistical or machine-learned model.

- Two features (normalized engagement rate, normalized reach) get multiplied by fixed weights and summed.
- The weights (0.65 / 0.35) were **chosen by human judgment**, based on the domain reasoning in `spec.md` section 2: engagement is conditional on views (you can't engage with something you haven't seen), so it's treated as the stronger signal of the two.
- There's no training step, no loss function, no optimization involved. The score can be computed on day one with zero historical outcomes to learn from.
- This pattern is common for scoring/ranking systems where labeled outcomes don't yet exist (ex. credit scores or RFM (recency/frequency/monetary) marketing scores). It's a deterministic, auditable index: a stakeholder can trace exactly why a creator scored the way they did, because every input and weight is visible and hand-set, not hidden inside a fitted or blackbox model.

## Why this approach, for now

A transparent, hand-weighted index is the more honest choice while there's no ground-truth outcome data (e.g. which shortlisted creators actually turned into successful partnerships). Without labeled outcomes to validate against, a fitted model would just be guessing at weights with extra steps and losing the auditability that makes the score trustworthy to a stakeholder in the first place.

If partnership outcome data becomes available later, the weighting (and possibly which features feed the score at all) is worth revisiting. See `spec.md` section 7 for this as an open question.
