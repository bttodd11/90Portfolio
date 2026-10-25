"""Tiny key/value wrapper over Redis.

Holds the Garmin tokens (private) and the latest runs payload. Garmin issues
a new refresh token on every refresh, so tokens must live somewhere the
function can write back to; an env var would go stale after one day.

Works with either connection Vercel's storage integrations provide:
- REDIS_URL (Vercel's Redis integration): a redis:// connection string
- KV_REST_API_URL + KV_REST_API_TOKEN (Upstash): Upstash's REST API
"""

import json
import os

import requests

TOKENS_KEY = "garmin:tokens"
RUNS_KEY = "garmin:runs"

_redis_client = None


def _rest_config():
    # Vercel's Upstash integration sets the KV_* names; Upstash's own console uses UPSTASH_*.
    url = os.getenv("KV_REST_API_URL") or os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("KV_REST_API_TOKEN") or os.getenv("UPSTASH_REDIS_REST_TOKEN")
    return (url, token) if url and token else None


def _rest_command(config, *args):
    url, token = config
    res = requests.post(url, headers={"Authorization": "Bearer %s" % token}, json=list(args), timeout=10)
    res.raise_for_status()
    body = res.json()
    if "error" in body:
        raise RuntimeError("Redis error: %s" % body["error"])
    return body.get("result")


def _redis():
    global _redis_client
    if _redis_client is None:
        import redis  # only needed for REDIS_URL connections

        _redis_client = redis.Redis.from_url(
            os.environ["REDIS_URL"], decode_responses=True, socket_timeout=10, socket_connect_timeout=10
        )
    return _redis_client


def _command(*args):
    rest = _rest_config()
    if rest:
        return _rest_command(rest, *args)
    if os.getenv("REDIS_URL"):
        return _redis().execute_command(*args)
    raise RuntimeError("Redis is not configured: set REDIS_URL (or KV_REST_API_URL and KV_REST_API_TOKEN)")


def get_raw(key):
    return _command("GET", key)


def set_raw(key, value):
    _command("SET", key, value)


def get_json(key):
    value = get_raw(key)
    return json.loads(value) if value else None


def set_json(key, value):
    set_raw(key, json.dumps(value))
