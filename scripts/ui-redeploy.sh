#!/usr/bin/env bash
# UI / webhook redeploy for Eventio — no human SSH required.
# Pulls main, rebuilds images, restarts Coolify-managed stack.
set -euo pipefail

ROOT="/vm-storage/projects/eventio-3.0"
COMPOSE=(docker compose -f "$ROOT/docker-compose.prod.yml" --env-file "$ROOT/.env.docker")
SERVICE_UUID="${COOLIFY_SERVICE_UUID:-op8cvha6gvpoohoq85lfqgj0}"
LOG="/tmp/eventio/ui-redeploy.log"
LOCK="/tmp/eventio/ui-redeploy.lock"
mkdir -p /tmp/eventio

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "Redeploy already running" | tee -a "$LOG"
  exit 0
fi

{
  echo "==== $(date -Is) redeploy start ===="
  cd "$ROOT"

  echo "-- git pull origin main --"
  git fetch origin main
  git pull --rebase --autostash origin main

  echo "-- docker build --"
  "${COMPOSE[@]}" build

  # Recreate from newly built local tags via Coolify's compose project.
  # Do NOT also call Coolify /restart — it races with force-recreate ("marked for removal").
  echo "-- recreate Coolify compose stack --"
  COOLIFY_DIR="/vm-storage/coolify/services/${SERVICE_UUID}"
  if [[ -f "$COOLIFY_DIR/docker-compose.yml" ]]; then
    (cd "$COOLIFY_DIR" && docker compose up -d --force-recreate --remove-orphans)
  else
    "${COMPOSE[@]}" up -d --force-recreate --remove-orphans
  fi

  echo "-- smoke --"
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
  done
  echo "==== $(date -Is) redeploy done ===="
} >>"$LOG" 2>&1
