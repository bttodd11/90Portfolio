"""GET /api/sync: called daily by Vercel Cron (see vercel.json).

Vercel sends `Authorization: Bearer $CRON_SECRET` with cron requests; anything
without it is rejected so strangers can't trigger Garmin logins.
"""

import hmac
import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import cloud_sync  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def _send(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def do_GET(self):
        secret = os.getenv("CRON_SECRET")
        auth = self.headers.get("Authorization", "")
        if not secret or not hmac.compare_digest(auth, "Bearer %s" % secret):
            return self._send(401, {"error": "unauthorized"})

        try:
            self._send(200, cloud_sync.run())
        except cloud_sync.TokensMissing as err:
            print(err, file=sys.stderr)
            self._send(409, {"error": str(err)})
        except Exception as err:
            traceback.print_exc()
            self._send(502, {"error": "sync failed: %s" % type(err).__name__})
