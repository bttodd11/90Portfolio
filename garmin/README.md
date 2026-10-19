# Garmin running sync

Feeds the **Running** tab (`/#/running`) using
[python-garminconnect](https://github.com/cyberjunky/python-garminconnect).

The site is a static build on GitHub Pages, so nothing calls Garmin from the
browser. Instead, `sync_runs.py` runs on your machine and writes
`my-app/public/data/runs.json`. The Running page reads that file. This keeps
your Garmin login off the public site.

## Setup (once)

```bash
python3 -m venv garmin/.venv
garmin/.venv/bin/pip install -r garmin/requirements.txt
garmin/.venv/bin/python garmin/sync_runs.py
```

The first run asks for your Garmin email, password, and MFA code (if MFA is
on). It saves tokens to `~/.garminconnect`; set `GARMINTOKENS` to use a
different location. Later runs reuse those tokens and don't prompt.

## Updating the dashboard

```bash
garmin/.venv/bin/python garmin/sync_runs.py   # or: cd my-app && npm run sync-runs (uses system python3)
cd my-app && npm run deploy
```

Use `--days 730` to pull a longer history (the default is 365 days).

## What's published

Each run includes its date, name, distance, time, elevation gain, heart rate,
cadence, calories, and VO2 max. The file also holds personal records and race
predictions. **No GPS tracks or start coordinates are written**, so the public
JSON doesn't reveal where your runs start.
