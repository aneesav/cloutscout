from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_CSV = REPO_ROOT / "data" / "2026datathon_interview_data.csv"

# Weighting for the Potential Score — see docs/model-scoring.md.
# Engagement rate is the primary ranking signal; reach is a secondary,
# confirming signal. Kept as a single named constant so the weighting can
# be tuned without touching scoring logic elsewhere.
ENGAGEMENT_WEIGHT = 0.65
REACH_WEIGHT = 1 - ENGAGEMENT_WEIGHT

# Creators below this percentile of reach or engagement rate are flagged
# low_confidence rather than excluded — see docs/spec.md section 3.2.
LOW_CONFIDENCE_PERCENTILE = 0.25

DEFAULT_SHORTLIST_SIZE = 20

CLAUDE_MODEL = "claude-opus-5"
