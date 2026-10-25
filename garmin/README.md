# Garmin running sync

Feeds the **Running** tab (`/#/running`) using
[python-garminconnect](https://github.com/cyberjunky/python-garminconnect).

All of it runs in the **90-portfolio** Vercel project, next to the site:

```
Vercel Cron (daily) ──▶ my-app/api/sync.py ──▶ Garmin
                               │
                               ▼
                        Upstash Redis: tokens (private) + runs payload
                               ▲
bttodd.io/#/running ──▶ my-app/api/runs.py (CDN-cached for 1h)
                        └─ falls back to my-app/public/data/runs.json
```

| Path | What it is |
| --- | --- |
| `my-app/api/sync.py` | Daily cron job. It requires `CRON_SECRET`, re-pulls the last 30 days, and keeps older history |
| `my-app/api/runs.py` | Public, read-only data for the page |
| `my-app/api/_garmin/` | Shared code. The leading underscore keeps it from becoming a route |
| `my-app/vercel.json` | Cron schedule and function settings |
| `my-app/requirements.txt`, `.python-version` | Python dependencies and version (3.12) for the functions |
| `garmin/sync_runs.py` | Local sync that writes `my-app/public/data/runs.json` (the fallback) |
| `garmin/upload_tokens.py` | One-time upload of your local tokens and runs to Redis |

## Local setup (needed once)

```bash
python3 -m venv garmin/.venv
garmin/.venv/bin/pip install -r garmin/requirements.txt
garmin/.venv/bin/python garmin/sync_runs.py
```

The first run asks for your Garmin email, password, and MFA code. It saves
tokens to `~/.garminconnect`.

## Vercel setup (90-portfolio project)

1. **Add Redis.** In 90-portfolio, go to *Storage → Create Database → Upstash for Redis*
   and connect it. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. **`CRON_SECRET`** must be set under *Settings → Environment Variables*
   (Production). It's already there.
3. **Upload your tokens and current runs:**
   ```bash
   cd garmin && vercel link        # pick 90-portfolio
   vercel env pull .env.local && cd ..
   garmin/.venv/bin/python garmin/upload_tokens.py
   ```
4. **Deploy:** merge this branch into `master`. Vercel builds the site and the
   functions together and registers the cron.
5. **Run the first sync by hand:**
   ```bash
   curl -H "Authorization: Bearer <CRON_SECRET>" https://www.bttodd.io/api/sync
   ```
   You should get back `{"runs": N, "updatedAt": ...}`. Then
   `https://www.bttodd.io/api/runs` returns the data.

The page needs no extra setting. In production it reads `/api/runs` and
falls back to the bundled `runs.json`. The cron runs daily at 11:00 UTC
(6 AM Central during daylight time, 5 AM in winter).

## When something breaks

| `/api/sync` returns | Meaning | Fix |
| --- | --- | --- |
| `409` "tokens were rejected" / "No Garmin tokens" | Refresh token expired or missing | Run `sync_runs.py` locally to log in, then `upload_tokens.py` |
| `502` | Garmin error or block (check the project's *Logs*) | If Garmin keeps blocking Vercel, move the job to GitHub Actions |
| `401` | Missing or wrong `CRON_SECRET` | Check the env var and redeploy |

The page keeps showing the last good data while the sync is broken.

## What's published

Each run includes its date, name, distance, time, elevation gain, heart rate,
cadence, calories, and VO2 max. The data also includes personal records and
race predictions. **No GPS tracks or start coordinates are stored.** Garmin
tokens stay private in Redis and are never returned by `/api/runs`.
