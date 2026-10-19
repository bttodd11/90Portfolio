"""Pull running data from Garmin Connect and write it to the portfolio site.

Uses python-garminconnect (https://github.com/cyberjunky/python-garminconnect).
The site is static, so instead of calling Garmin from the browser this script
runs on your machine and writes a slim JSON file the Running page reads:

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
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from garminconnect import (
    Garmin,
    GarminConnectAuthenticationError,
    GarminConnectConnectionError,
    GarminConnectTooManyRequestsError,
)

TOKENSTORE = os.getenv("GARMINTOKENS", "~/.garminconnect")
OUTPUT = Path(__file__).resolve().parent.parent / "my-app" / "public" / "data" / "runs.json"

# Running personal record typeIds, per the library's get_personal_record docs.
# 1-6 are times in seconds; 7 is the longest run in meters.
PR_TYPES = {
    1: "1K",
    2: "1 Mile",
    3: "5K",
    4: "10K",
    5: "Half Marathon",
    6: "Marathon",
    7: "Longest Run",
}

RACE_PREDICTIONS = {
    "time5K": "5K",
    "time10K": "10K",
    "timeHalfMarathon": "Half Marathon",
    "timeMarathon": "Marathon",
}


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


def slim_run(activity):
    # Deliberately leaves out GPS/polyline and start coordinates so the
    # public JSON never reveals where runs start (i.e. home).
    return {
        "id": activity.get("activityId"),
        "name": activity.get("activityName"),
        "startTimeLocal": activity.get("startTimeLocal"),
        "distanceMeters": activity.get("distance"),
        "durationSeconds": activity.get("duration"),
        "movingSeconds": activity.get("movingDuration"),
        "elevationGainMeters": activity.get("elevationGain"),
        "averageHR": activity.get("averageHR"),
        "maxHR": activity.get("maxHR"),
        "cadence": activity.get("averageRunningCadenceInStepsPerMinute"),
        "calories": activity.get("calories"),
        "vo2Max": activity.get("vO2MaxValue"),
    }


def personal_records(garmin):
    records = []
    for record in garmin.get_personal_record() or []:
        label = PR_TYPES.get(record.get("typeId"))
        if not label or record.get("activityType") not in (None, "running"):
            continue
        records.append({
            "typeId": record["typeId"],
            "label": label,
            "value": record.get("value"),
            "unit": "meters" if record["typeId"] == 7 else "seconds",
            "activityId": record.get("activityId"),
            "date": record.get("prStartTimeLocalFormatted") or record.get("actStartDateTimeInGMTFormatted"),
        })
    return sorted(records, key=lambda r: r["typeId"])


def race_predictions(garmin):
    raw = garmin.get_race_predictions() or {}
    return [
        {"label": label, "seconds": raw[key]}
        for key, label in RACE_PREDICTIONS.items()
        if raw.get(key)
    ]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--days", type=int, default=365, help="how far back to pull runs (default 365)")
    args = parser.parse_args()

    try:
        garmin = login()
        end = date.today()
        start = end - timedelta(days=args.days)
        activities = garmin.get_activities_by_date(start.isoformat(), end.isoformat(), "running")

        # PRs and predictions are nice-to-haves; don't fail the sync without them.
        try:
            records = personal_records(garmin)
        except Exception as err:
            print("Skipping personal records: %s" % err, file=sys.stderr)
            records = []
        try:
            predictions = race_predictions(garmin)
        except Exception as err:
            print("Skipping race predictions: %s" % err, file=sys.stderr)
            predictions = []
    except GarminConnectTooManyRequestsError:
        sys.exit("Garmin rate limited this login. Wait a few minutes and try again.")
    except (GarminConnectAuthenticationError, GarminConnectConnectionError) as err:
        sys.exit("Garmin login failed: %s" % err)

    runs = sorted((slim_run(a) for a in activities), key=lambda r: r["startTimeLocal"] or "", reverse=True)
    payload = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "rangeDays": args.days,
        "runs": runs,
        "personalRecords": records,
        "racePredictions": predictions,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2))
    print("Wrote %d runs to %s" % (len(runs), OUTPUT))


if __name__ == "__main__":
    main()
