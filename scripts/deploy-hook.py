#!/usr/bin/env python3
"""Minimal redeploy webhook for Eventio — teammates never need SSH.

POST /redeploy  Header: X-Deploy-Secret: <secret>
GET  /health
GET  /status
"""
from __future__ import annotations

import json
import os
import secrets
import subprocess
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = os.environ.get("DEPLOY_HOOK_HOST", "127.0.0.1")
PORT = int(os.environ.get("DEPLOY_HOOK_PORT", "3099"))
SECRET = os.environ.get("DEPLOY_HOOK_SECRET", "").strip()
SCRIPT = os.environ.get(
    "DEPLOY_SCRIPT",
    "/vm-storage/projects/eventio-3.0/scripts/ui-redeploy.sh",
)
STATE = Path("/tmp/eventio/deploy-hook-state.json")
LOG = Path("/tmp/eventio/ui-redeploy.log")

_lock = threading.Lock()
_running = False


def _load_state() -> dict:
    if STATE.exists():
        try:
            return json.loads(STATE.read_text())
        except Exception:
            pass
    return {"last_status": "never", "last_started": None, "last_finished": None}


def _save_state(data: dict) -> None:
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(data, indent=2))


def _run_redeploy() -> None:
    global _running
    state = _load_state()
    state["last_status"] = "running"
    state["last_started"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    _save_state(state)
    try:
        subprocess.run(["bash", SCRIPT], check=False)
        state = _load_state()
        state["last_status"] = "ok"
    except Exception as e:
        state = _load_state()
        state["last_status"] = f"error: {e}"
    state["last_finished"] = __import__("datetime").datetime.utcnow().isoformat() + "Z"
    _save_state(state)
    with _lock:
        _running = False


class Handler(BaseHTTPRequestHandler):
    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802
        if self.path.startswith("/health"):
            return self._json(200, {"ok": True})
        if self.path.startswith("/status"):
            st = _load_state()
            st["running"] = _running
            if LOG.exists():
                st["log_tail"] = LOG.read_text(errors="replace")[-4000:]
            return self._json(200, st)
        return self._json(404, {"error": "not found"})

    def do_POST(self):  # noqa: N802
        global _running
        if self.path.rstrip("/") != "/redeploy":
            return self._json(404, {"error": "not found"})
        got = self.headers.get("X-Deploy-Secret", "")
        if not SECRET or not secrets.compare_digest(got, SECRET):
            return self._json(401, {"error": "unauthorized"})
        with _lock:
            if _running:
                return self._json(200, {"status": "already_running"})
            _running = True
        threading.Thread(target=_run_redeploy, daemon=True).start()
        return self._json(202, {"status": "accepted", "message": "redeploy started"})

    def log_message(self, fmt: str, *args) -> None:
        return


def main() -> None:
    if not SECRET:
        raise SystemExit("DEPLOY_HOOK_SECRET is required")
    Path(SCRIPT).chmod(0o755)
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"eventio deploy hook on {HOST}:{PORT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
