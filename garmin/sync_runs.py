"""Pull running data from Garmin Connect and write it to the portfolio site.

Uses python-garminconnect (https://github.com/cyberjunky/python-garminconnect).
Writes a slim JSON file the Running page reads when it isn't pointed at the
daily Vercel sync (see README.md):

    my-app/public/data/runs.json

First run asks for your Garmin email/password (and MFA code if enabled) and
saves tokens to ~/.garminconnect. Later runs reuse those tokens.

    python3 garmin/sync_runs.py            # last 365 days
    python3 garmin/sync_runs.py --days 730
"""

import argparse
import getpass
import json
import os
import sys
from pathlib import Path

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

# The fetch logic lives with the Vercel functions so both share one copy.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "my-app" / "api"))
from _garmin.sync_core import build_payload  # noqa: E402

TOKENSTORE = os.getenv("GARMINTOKENS", "~/.garminconnect")
OUTPUT = Path(__file__).resolve().parent.parent / "my-app" / "public" / "data" / "runs.json"


def login():
    """Log in with saved tokens, falling back to an interactive login."""
    tokenstore = str(Path(TOKENSTORE).expanduser())
    try:
        garmin = Garmin()
        garmin.login(tokenstore)
        return garmin
    except (GarminConnectAuthenticationError, FileNotFoundError):
        pass

    print("No saved Garmin tokens; logging in (tokens will be saved to %s)." % tokenstore)
    email = input("Garmin email: ").strip()
    password = getpass.getpass("Garmin password: ")
    garmin = Garmin(email, password, prompt_mfa=lambda: input("MFA code: ").strip())
    garmin.login(tokenstore)
    return garmin


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--days", type=int, default=365, help="how far back to pull runs (default 365)")
    args = parser.parse_args()

    try:
        payload = build_payload(login(), args.days)
    except GarminConnectTooManyRequestsError:
        sys.exit("Garmin rate limited this login. Wait a few minutes and try again.")
    except (GarminConnectAuthenticationError, GarminConnectConnectionError) as err:
        sys.exit("Garmin login failed: %s" % err)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2))
    print("Wrote %d runs to %s" % (len(payload["runs"]), OUTPUT))


if __name__ == "__main__":
    main()
