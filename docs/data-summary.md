# Data Summary — `2026datathon_interview_data.csv`

**1,000 rows × 13 columns**, one row per TikTok video, no duplicate `video_id`s.

## Schema

| Column | Type | Nulls | Notes |
|---|---|---|---|
| `views` | int64 | 0 | 465 – 250,800,000 |
| `likes` | int64 | 0 | 13 – 31,000,000 |
| `comments` | int64 | 0 | 0 – 625,700 |
| `shares` | int64 | 0 | 0 – 220,100 |
| `author_verified` | bool | 0 | `False`/`True` |
| `primary_hashtag` | str | 147 | 424 unique values |
| `music_name` | str | 0 | 378 unique values |
| `music_is_original` | bool | 0 | `False`/`True` |
| `duration_sec` | int64 | 0 | 4 – 60 sec |
| `caption` | str | 38 | free text |
| `upload_date` | str (YYYY-MM-DD) | 0 | 2020-09-22 → 2020-12-21 |
| `author_name` | str | 0 | 802 unique creators (1000 rows) |
| `video_id` | int64 | 0 | unique key |

## Engagement stats

Views/likes/comments/shares are heavily right-skewed — a few viral outliers dwarf the median.

| | views | likes | comments | shares | duration_sec |
|---|---|---|---|---|---|
| median | 82,500 | 7,413 | 123 | 80 | 14 |
| mean | 1,029,213 | 96,798 | 1,272 | 1,905 | 19.1 |
| max | 250.8M | 31M | 625,700 | 220,100 | 60 |

## Categorical breakdowns

- **`author_verified`**: 944 False / 56 True (5.6% verified)
- **`music_is_original`**: 746 True / 254 False (most use original sound)
- **`primary_hashtag`**: 147 null (14.7%); top values are `fyp` (112), `foryou` (51), `horadearrasar` (35), `fy` (30), `foryoupage` (30), `duet` (29) — a long tail of niche tags after that
- **`music_name`**: dominated by localized "original sound" variants — `original sound` (324, EN), `origineel geluid` (124, NL), `sonido original` (27, ES), `оригинальный звук` (25, RU), `som original` (24, PT) — suggests a multi-region/multi-language creator base
- **`author_name`**: 802 unique creators; some appear repeatedly (`timmytimmadome` ×28, `evan_holmes_` ×19, `benjamin_robert_graham` ×12) — multiple videos per creator in some cases
- **`caption`**: 38 nulls (3.8%), otherwise free-text with hashtags/emoji mixed in

## Time window

All uploads fall within a 3-month span (Sep 22 – Dec 21, 2020) — this is a snapshot, not a live feed.
