"""One-time setup: copy your local Garmin tokens (and current runs.json, if
any) into the 90-portfolio project's Redis so the daily cron can take over.

    cd garmin && vercel env pull .env.local     # gets KV_REST_API_URL/TOKEN
    cd .. && garmin/.venv/bin/python garmin/upload_tokens.py

Re-run it after logging in again locally with sync_runs.py.
"""

import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOKENS_FILE = Path(os.getenv("GARMINTOKENS", "~/.garminconnect")).expanduser() / "garmin_tokens.json"
RUNS_FILE = HERE.parent / "my-app" / "public" / "data" / "runs.json"
sys.path.insert(0, str(HERE.parent / "my-app" / "api"))


def load_env_file(path):
    # Minimal .env parser so this needs no extra dependency.
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def main():
    load_env_file(HERE / ".env.local")
    from _garmin import store

    if not TOKENS_FILE.exists():
        sys.exit("No tokens at %s. Run garmin/sync_runs.py first to log in." % TOKENS_FILE)
    tokens = TOKENS_FILE.read_text()
    if not json.loads(tokens).get("di_refresh_token"):
        sys.exit("%s has no refresh token. Run garmin/sync_runs.py to log in again." % TOKENS_FILE)

    try:
        store.set_raw(store.TOKENS_KEY, tokens)
        print("Uploaded Garmin tokens.")
        if RUNS_FILE.exists():
            payload = json.loads(RUNS_FILE.read_text())
            store.set_json(store.RUNS_KEY, payload)
            print("Uploaded %d runs from %s." % (len(payload.get("runs", [])), RUNS_FILE))
    except RuntimeError as err:
        sys.exit("%s\nCopy REDIS_URL from Vercel (Storage -> your Redis store) into garmin/.env.local as REDIS_URL=..." % err)


if __name__ == "__main__":
    main()
