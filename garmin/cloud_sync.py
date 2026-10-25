"""Daily sync run by the Vercel cron job (api/sync.py)."""

import store
from garminconnect import Garmin, GarminConnectAuthenticationError
from sync_core import build_payload

# Re-pull this many days each run so recent edits/deletions are picked up;
# anything older is kept from the stored history.
WINDOW_DAYS = 30


class TokensMissing(Exception):
    pass


def run():
    tokens = store.get_raw(store.TOKENS_KEY)
    if not tokens:
        raise TokensMissing("No Garmin tokens in Redis. Run garmin/upload_tokens.py.")

    garmin = Garmin()
    try:
        # Inline JSON tokens; refreshes the access token if it's near expiry.
        garmin.login(tokens)
    except GarminConnectAuthenticationError as err:
        raise TokensMissing(
            "Saved Garmin tokens were rejected (%s). Run garmin/sync_runs.py "
            "locally to log in again, then garmin/upload_tokens.py." % err
        ) from err

    # Save right away: a refresh during login already rotated the refresh
    # token, and losing it would lock the sync out.
    store.set_raw(store.TOKENS_KEY, garmin.client.dumps())

    previous = store.get_json(store.RUNS_KEY)
    payload = build_payload(garmin, WINDOW_DAYS, previous)
    store.set_json(store.RUNS_KEY, payload)

    # Tokens can also be refreshed mid-run on a 401.
    store.set_raw(store.TOKENS_KEY, garmin.client.dumps())
    return {"runs": len(payload["runs"]), "updatedAt": payload["updatedAt"]}
