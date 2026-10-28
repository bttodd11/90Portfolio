"""GET /api/runs: the latest runs payload for the Running page.

Public and read-only. Vercel's CDN caches it for 5 minutes: short enough that a
sync or backfill shows up almost right away, long enough that page views
rarely reach the function or Redis.
"""

import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from _garmin import store  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            body = store.get_raw(store.RUNS_KEY)
        except Exception:
            traceback.print_exc()
            body = None

        self.send_response(200 if body else 404)
        self.send_header("Content-Type", "application/json")
        # The data is public anyway, and a fixed value keeps CDN caching simple.
        self.send_header("Access-Control-Allow-Origin", "*")
        if body:
            self.send_header("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60")
        else:
            self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write((body or '{"error": "no runs synced yet"}').encode())
