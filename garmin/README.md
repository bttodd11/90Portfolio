# Garmin running sync

Feeds the **Running** tab (`/#/running`) using
[python-garminconnect](https://github.com/cyberjunky/python-garminconnect).

There are two ways to update it:

- **Daily on Vercel (recommended).** A Vercel Cron job syncs once a day and
  serves the data at `/api/runs`. The site reads it from there, so new runs
  show up without a redeploy.
- **Locally.** `sync_runs.py` writes `my-app/public/data/runs.json`. The
  site uses this file when `REACT_APP_RUNS_URL` isn't set.

```
Vercel Cron (daily) ──▶ api/sync.py ──▶ Garmin
                             │
                             ▼
                      Upstash Redis: tokens (private) + runs payload
                             ▲
bttodd.io/#/running ──▶ api/runs.py (CDN-cached for 1h)
```

## Local setup (needed once, even for Vercel)

```bash
python3 -m venv garmin/.venv
garmin/.venv/bin/pip install -r garmin/requirements.txt
garmin/.venv/bin/python garmin/sync_runs.py
```

The first run asks for your Garmin email, password, and MFA code. It saves
tokens to `~/.garminconnect`, and later runs reuse them.

## Vercel setup

1. **Create a new Vercel project.** Choose *Add New → Project*, import
   `bttodd11/90Portfolio`, set **Root Directory** to `garmin`, and set
   **Framework** to *Other*. Then deploy.
2. **Add Redis.** In the project, go to *Storage → Create Database → Upstash
   for Redis* and connect it. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. **Add a cron secret.** Generate one with `openssl rand -hex 32`. In
   *Settings → Environment Variables*, add it as `CRON_SECRET` (Production).
   Vercel sends it with each cron call, and `/api/sync` rejects calls without it.
4. **Upload your tokens and current runs:**
   ```bash
   cd garmin && vercel link && vercel env pull .env.local && cd ..
   garmin/.venv/bin/python garmin/upload_tokens.py
   ```
5. **Redeploy**, then trigger one sync by hand:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" https://<project>.vercel.app/api/sync
   ```
   You should get back `{"runs": N, "updatedAt": ...}`. Then
   `https://<project>.vercel.app/api/runs` returns the data.
6. **Point the site at it.** Add
   `REACT_APP_RUNS_URL=https://<project>.vercel.app/api/runs` to `my-app/.env`,
   then run `npm run deploy` once.

The cron (`vercel.json`) runs daily at 11:00 UTC (6 AM Central during
daylight time, 5 AM in winter). Each run re-pulls the last 30 days, which
picks up edits and deletions, and keeps older history.

## When something breaks

| `/api/sync` returns | Meaning | Fix |
| --- | --- | --- |
| `409` "tokens were rejected" / "No Garmin tokens" | Refresh token expired or missing | Run `sync_runs.py` locally to log in, then `upload_tokens.py` |
| `502` | Garmin error or block (check *Logs*) | If Garmin keeps blocking Vercel, move the job to GitHub Actions |
| `401` | Missing or wrong `CRON_SECRET` | Check the env var and redeploy |

The page keeps showing the last good data while the sync is broken.

## What's published

Each run includes its date, name, distance, time, elevation gain, heart rate,
cadence, calories, and VO2 max. The data also includes personal records and
race predictions. **No GPS tracks or start coordinates are stored**, so the
public data doesn't reveal where your runs start. Garmin tokens stay private in
Redis and are never returned by `/api/runs`.
