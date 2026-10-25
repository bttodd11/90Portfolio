"""Garmin fetch logic shared by the local script (sync_runs.py) and the
Vercel functions in api/."""

import sys
from datetime import date, datetime, timedelta, timezone

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


def build_payload(garmin, days, previous=None):
    """Fetch the last `days` of runs plus PRs and predictions.

    With `previous` (an earlier payload), runs older than the window are kept
    and everything inside it is replaced, so a short daily window still
    builds up a full history and picks up edits or deletions of recent runs.
    """
    end = date.today()
    start = end - timedelta(days=days)
    activities = garmin.get_activities_by_date(start.isoformat(), end.isoformat(), "running")
    runs = [slim_run(a) for a in activities]

    if previous:
        cutoff = start.isoformat()
        runs += [r for r in previous.get("runs", []) if (r.get("startTimeLocal") or "")[:10] < cutoff]

    # PRs and predictions are nice-to-haves; don't fail the sync without them.
    # Fall back to the previous values so a hiccup doesn't blank the page.
    try:
        records = personal_records(garmin)
    except Exception as err:
        print("Skipping personal records: %s" % err, file=sys.stderr)
        records = (previous or {}).get("personalRecords", [])
    try:
        predictions = race_predictions(garmin)
    except Exception as err:
        print("Skipping race predictions: %s" % err, file=sys.stderr)
        predictions = (previous or {}).get("racePredictions", [])

    runs.sort(key=lambda r: r.get("startTimeLocal") or "", reverse=True)
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "runs": runs,
        "personalRecords": records,
        "racePredictions": predictions,
    }
