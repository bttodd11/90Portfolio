"""Tiny wrapper over Upstash Redis's REST API (no extra dependency).

Holds the Garmin tokens (private) and the latest runs payload. Garmin issues
a new refresh token on every refresh, so tokens must live somewhere the
function can write back to; an env var would go stale after one day.
"""

import json
import os

import requests

TOKENS_KEY = "garmin:tokens"
RUNS_KEY = "garmin:runs"


def _config():
    # Vercel's Upstash integration sets the KV_* names; Upstash's own console uses UPSTASH_*.
    url = os.getenv("KV_REST_API_URL") or os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("KV_REST_API_TOKEN") or os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if not url or not token:
        raise RuntimeError("Redis is not configured: set KV_REST_API_URL and KV_REST_API_TOKEN")
    return url, token


def _command(*args):
    url, token = _config()
    res = requests.post(url, headers={"Authorization": "Bearer %s" % token}, json=list(args), timeout=10)
    res.raise_for_status()
    body = res.json()
    if "error" in body:
        raise RuntimeError("Redis error: %s" % body["error"])
    return body.get("result")


def get_raw(key):
    return _command("GET", key)


def set_raw(key, value):
    _command("SET", key, value)


def get_json(key):
    value = get_raw(key)
    return json.loads(value) if value else None


def set_json(key, value):
    set_raw(key, json.dumps(value))
