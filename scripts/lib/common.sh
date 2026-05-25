#!/usr/bin/env bash

log() {
  printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
    nvm use "${NODE_VERSION:-22}" >/dev/null
  fi
}

port_pid() {
  local port="$1"
  ss -tlnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { print $0 }' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1
}

stop_port() {
  local port="$1"
  local pid
  pid="$(port_pid "$port")"
  if [[ -n "$pid" ]]; then
    log "Stopping process on port ${port} (pid ${pid})"
    kill "$pid" 2>/dev/null || true
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="${2:-30}"
  local delay="${3:-2}"
  local i=1

  while (( i <= attempts )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "Healthy: ${url}"
      return 0
    fi
    sleep "$delay"
    ((i++))
  done

  die "Health check failed for ${url}"
}

start_detached() {
  local name="$1"
  local workdir="$2"
  local port="$3"
  shift 3
  local log_file="${LOG_DIR}/${name}.log"
  local pid_file="${RUN_DIR}/${name}.pid"

  mkdir -p "$LOG_DIR" "$RUN_DIR"
  stop_port "$port"

  log "Starting ${name} on port ${port}"
  (
    cd "$workdir" || exit 1
    load_nvm
    export PORT="$port"
    # Prevent long-running services from inheriting the poll-deploy flock fd.
    for fd in $(seq 3 9); do eval "exec ${fd}>&-" 2>/dev/null || true; done
    nohup "$@" >"$log_file" 2>&1 &
    echo $! >"$pid_file"
  )

  sleep 2
}
