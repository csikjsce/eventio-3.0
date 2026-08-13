#!/usr/bin/env bash
# Cut over Eventio from bare node/next processes to Docker Compose.
set -euo pipefail

ROOT="/vm-storage/projects/eventio-3.0"
COMPOSE=(docker compose -f "$ROOT/docker-compose.prod.yml" --env-file "$ROOT/.env.docker")
STATE=/tmp/eventio

mkdir -p "$STATE"
cd "$ROOT"

echo "== Stopping bare processes (free ports 3500/4173-4175) =="
for name in backend app council-app faculty; do
  pid_file="$STATE/${name}.pid"
  if [[ -f "$pid_file" ]]; then
    pid="$(cat "$pid_file" || true)"
    if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
      echo "stop $name pid=$pid"
      kill "$pid" 2>/dev/null || true
      sleep 1
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$pid_file"
  fi
done

# Also kill anything still bound to the ports
for port in 3500 4173 4174 4175; do
  pids="$(ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p"$" {print}' | grep -oP 'pid=\K[0-9]+' || true)"
  for pid in $pids; do
    echo "free port $port -> kill $pid"
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    kill -9 "$pid" 2>/dev/null || true
  done
done

sleep 2

echo "== Starting Docker Compose stack =="
"${COMPOSE[@]}" up -d --remove-orphans

echo "== Waiting for health =="
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:3500/api/v1/health" >/dev/null 2>&1 \
    && curl -fsS -o /dev/null -w '' "http://127.0.0.1:4173/login" \
    && curl -fsS -o /dev/null -w '' "http://127.0.0.1:4174/council/login" \
    && curl -fsS -o /dev/null -w '' "http://127.0.0.1:4175/faculty/login"; then
    echo "healthy after ${i}s"
    break
  fi
  sleep 2
  if [[ "$i" -eq 60 ]]; then
    echo "TIMEOUT waiting for health"
    "${COMPOSE[@]}" ps
    exit 1
  fi
done

echo "== Public smoke =="
for u in \
  "https://eventio.somaiya.edu/api/v1/health" \
  "https://eventio.somaiya.edu/login" \
  "https://eventio.somaiya.edu/council/login" \
  "https://eventio.somaiya.edu/faculty/login"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$u" || echo err)"
  echo "$code $u"
done

"${COMPOSE[@]}" ps
echo "Done. Manage with: cd $ROOT && docker compose -f docker-compose.prod.yml --env-file .env.docker ..."
