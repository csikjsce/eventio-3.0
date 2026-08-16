#!/usr/bin/env bash
# UI / webhook redeploy for Eventio — no human SSH required.
# Pulls main, rebuilds images, recreates Coolify-managed stack, records Jenkins-style metadata.
set -euo pipefail

ROOT="/vm-storage/projects/eventio-3.0"
COMPOSE=(docker compose -f "$ROOT/docker-compose.prod.yml" --env-file "$ROOT/.env.docker")
SERVICE_UUID="${COOLIFY_SERVICE_UUID:-op8cvha6gvpoohoq85lfqgj0}"
LOG="/tmp/eventio/ui-redeploy.log"
LOCK="/tmp/eventio/ui-redeploy.lock"
META="/tmp/eventio/last-deploy.json"
HISTORY="/tmp/eventio/deploy-history.jsonl"
REPO="${EVENTIO_GITHUB_REPO:-csikjsce/eventio-3.0}"
APP_URL="${EVENTIO_APP_URL:-https://eventio.somaiya.edu}"
BOARD_URL="${EVENTIO_CICD_URL:-https://cicd.arnabbhowmik.in}"
mkdir -p /tmp/eventio

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "Redeploy already running" | tee -a "$LOG"
  exit 0
fi

gh_deploy() {
  local state="$1"
  local desc="$2"
  [[ -n "${DEPLOY_ID:-}" ]] || return 0
  unset GITHUB_TOKEN || true
  gh api --method POST "repos/${REPO}/deployments/${DEPLOY_ID}/statuses" --input - >/dev/null 2>&1 <<EOF || true
{"state":"${state}","description":"${desc}","environment":"production","environment_url":"${APP_URL}","log_url":"${BOARD_URL}"}
EOF
}

write_meta() {
  local status="$1"
  python3 - "$META" "$HISTORY" "$status" <<'PY'
import json, os, sys, datetime
meta_path, hist_path, status = sys.argv[1:4]
payload = {
  "status": status,
  "sha": os.environ.get("DEPLOY_SHA", ""),
  "short": os.environ.get("DEPLOY_SHA", "")[:7],
  "subject": os.environ.get("DEPLOY_SUBJECT", ""),
  "author": os.environ.get("DEPLOY_AUTHOR", ""),
  "started": os.environ.get("DEPLOY_STARTED", ""),
  "finished": os.environ.get("DEPLOY_FINISHED", ""),
  "github_deployment_id": os.environ.get("DEPLOY_ID", ""),
  "source": os.environ.get("DEPLOY_SOURCE", "hook"),
}
open(meta_path, "w").write(json.dumps(payload, indent=2) + "\n")
if status in ("success", "failure"):
    with open(hist_path, "a") as f:
        f.write(json.dumps(payload) + "\n")
PY
}

{
  echo "==== $(date -Is) redeploy start ===="
  cd "$ROOT"

  echo "-- git pull origin main --"
  git fetch origin main
  git pull --rebase --autostash origin main

  export DEPLOY_SHA="$(git rev-parse HEAD)"
  export DEPLOY_SUBJECT="$(git log -1 --format='%s')"
  export DEPLOY_AUTHOR="$(git log -1 --format='%an <%ae>')"
  export DEPLOY_STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  export DEPLOY_FINISHED=""
  export DEPLOY_SOURCE="${DEPLOY_SOURCE:-hook}"
  echo "$DEPLOY_SHA" > /tmp/eventio/last-deployed.sha
  echo "-- deploying $DEPLOY_SHA ($DEPLOY_SUBJECT) --"

  unset GITHUB_TOKEN || true
  DEPLOY_ID=""
  DEPLOY_ID="$(gh api --method POST "repos/${REPO}/deployments" --input - <<EOF | python3 -c 'import sys,json; print(json.load(sys.stdin).get("id",""))' || true
{"ref":"${DEPLOY_SHA}","environment":"production","description":"Eventio production deploy","auto_merge":false,"required_contexts":[]}
EOF
)"
  export DEPLOY_ID
  echo "-- github deployment id=${DEPLOY_ID:-none} --"
  gh_deploy in_progress "Building images and recreating Coolify stack"
  write_meta running

  echo "-- docker build --"
  "${COMPOSE[@]}" build

  echo "-- recreate Coolify compose stack --"
  COOLIFY_DIR="/vm-storage/coolify/services/${SERVICE_UUID}"
  if [[ -f "$COOLIFY_DIR/docker-compose.yml" ]]; then
    (cd "$COOLIFY_DIR" && docker compose up -d --force-recreate --remove-orphans)
  else
    "${COMPOSE[@]}" up -d --force-recreate --remove-orphans
  fi

  echo "-- smoke --"
  ok=1
  for i in $(seq 1 30); do
    if curl -fsS "http://127.0.0.1:3500/api/v1/health" >/dev/null; then
      break
    fi
    sleep 2
  done
  for u in \
    "http://127.0.0.1:3500/api/v1/health" \
    "http://127.0.0.1:4173/login" \
    "http://127.0.0.1:4174/council/login" \
    "http://127.0.0.1:4175/faculty/login"; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$u" || echo err)
    echo "$code $u"
    if [[ "$code" != "200" && "$code" != "302" ]]; then
      ok=0
    fi
  done

  export DEPLOY_FINISHED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  if [[ "$ok" == "1" ]]; then
    echo "$DEPLOY_SHA" > /tmp/eventio/last-good.sha
    cp -f "$LOG" /tmp/eventio/last-deploy.log || true
    gh_deploy success "Live on production: ${DEPLOY_SHA:0:7} ${DEPLOY_SUBJECT}"
    write_meta success
    echo "==== $(date -Is) redeploy done (success) ===="
  else
    echo "smoke failed" > /tmp/eventio/last-deploy-failure.txt
    gh_deploy failure "Smoke checks failed after ${DEPLOY_SHA:0:7}"
    write_meta failure
    echo "==== $(date -Is) redeploy done (failure) ===="
    exit 1
  fi
} >>"$LOG" 2>&1
