from functools import lru_cache

import pandas as pd

from cloutscout.config import DATA_CSV


@lru_cache(maxsize=1)
def load_videos() -> pd.DataFrame:
    """Load the raw video-level dataset. Cached — the CSV is a static snapshot."""
    return pd.read_csv(DATA_CSV)
