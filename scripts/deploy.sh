#!/usr/bin/env bash
# Enterprise production deploy for Eventio.
# Supports path-filtered service flags, last-good tracking, and auto-rollback.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib/common.sh"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib/github-status.sh"

CONFIG_FILE="${EVENTIO_DEPLOY_CONFIG:-$ROOT_DIR/deploy/config.env}"
if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

: "${REPO_DIR:=$ROOT_DIR}"
: "${BACKEND_PORT:=3500}"
: "${APP_PORT:=4173}"
: "${COUNCIL_APP_PORT:=4174}"
: "${FACULTY_APP_PORT:=4175}"
: "${LOG_DIR:=/tmp/eventio}"
: "${RUN_DIR:=/tmp/eventio}"
: "${GIT_REMOTE:=origin}"
: "${GIT_BRANCH:=main}"
: "${NEXT_PUBLIC_SERVER_ADDRESS:=https://eventio.somaiya.edu}"
: "${SKIP_GIT_PULL:=0}"
: "${DEPLOY_BACKEND:=1}"
: "${DEPLOY_APP:=1}"
: "${DEPLOY_COUNCIL_APP:=1}"
: "${DEPLOY_FACULTY_APP:=1}"
: "${STOP_STUDENT_PREVIEW:=1}"
: "${STOP_OLD_COUNCIL_PREVIEW:=1}"
: "${AUTO_ROLLBACK:=1}"
: "${LAST_DEPLOYED_FILE:=/tmp/eventio/last-deployed.sha}"
: "${LAST_GOOD_FILE:=/tmp/eventio/last-good.sha}"
: "${EVENTIO_DEPLOY_SHA:=}"
: "${PRESERVE_WORKTREE:=1}"

DEPLOY_SHA=""
PREV_GOOD_SHA=""
GITHUB_STATUS_REPORTED=0
DEPLOY_FAILURE_MESSAGE=""
DEPLOY_LOG_FILE="${LOG_DIR}/last-deploy.log"
ROLLBACK_ATTEMPTED=0

mkdir -p "$LOG_DIR" "$RUN_DIR"

die() {
  DEPLOY_FAILURE_MESSAGE="$*"
  log "ERROR: $*"
  exit 1
}

on_deploy_err() {
  local exit_code=$?
  local line="$1"
  DEPLOY_FAILURE_MESSAGE="${DEPLOY_FAILURE_MESSAGE:-Command failed at line ${line}: ${BASH_COMMAND} (exit ${exit_code})}"
}

snapshot_last_good() {
  if [[ -f "$LAST_GOOD_FILE" ]]; then
    PREV_GOOD_SHA="$(tr -d '[:space:]' < "$LAST_GOOD_FILE" || true)"
  elif [[ -f "$LAST_DEPLOYED_FILE" ]]; then
    PREV_GOOD_SHA="$(tr -d '[:space:]' < "$LAST_DEPLOYED_FILE" || true)"
  fi
  if [[ -n "$PREV_GOOD_SHA" ]]; then
    log "Previous good SHA: ${PREV_GOOD_SHA:0:7}"
  else
    log "No previous good SHA recorded"
  fi
}

mark_good() {
  local sha="$1"
  echo "$sha" > "$LAST_GOOD_FILE"
  echo "$sha" > "$LAST_DEPLOYED_FILE"
  log "Marked ${sha:0:7} as last-good"
}

public_smoke() {
  local base="${PUBLIC_BASE_URL:-https://eventio.somaiya.edu}"
  local urls=(
    "${base}/api/v1/health"
    "${base}/login"
    "${base}/council/login"
    "${base}/faculty/login"
  )
  local url
  for url in "${urls[@]}"; do
    if ! curl -fsS --max-time 20 "$url" >/dev/null; then
      die "Public smoke failed: $url"
    fi
    log "Public smoke OK: $url"
  done
}

attempt_auto_rollback() {
  if [[ "$AUTO_ROLLBACK" != "1" ]]; then
    log "AUTO_ROLLBACK disabled"
    return 1
  fi
  if [[ "$ROLLBACK_ATTEMPTED" == "1" ]]; then
    log "Rollback already attempted"
    return 1
  fi
  if [[ -z "$PREV_GOOD_SHA" || "$PREV_GOOD_SHA" == "$DEPLOY_SHA" ]]; then
    log "No usable previous good SHA — cannot auto-rollback"
    return 1
  fi

  ROLLBACK_ATTEMPTED=1
  log "AUTO-ROLLBACK: restoring ${PREV_GOOD_SHA:0:7}"
  AUTO_ROLLBACK=0 EVENTIO_DEPLOY_SHA="$PREV_GOOD_SHA" PRESERVE_WORKTREE=0 \
    bash "$ROOT_DIR/scripts/rollback.sh" "$PREV_GOOD_SHA" || return 1
  return 0
}

on_deploy_exit() {
  local exit_code=$?

  if [[ -n "${DEPLOY_SHA:-}" ]]; then
    cp -f "$DEPLOY_LOG_FILE" "${LOG_DIR}/deploy-${DEPLOY_SHA}.log" 2>/dev/null || true
  fi

  if [[ "$exit_code" -ne 0 && "$ROLLBACK_ATTEMPTED" == "0" ]]; then
    if attempt_auto_rollback; then
      log "Auto-rollback succeeded after failed deploy"
      if [[ "$GITHUB_STATUS_REPORTED" != "1" ]]; then
        github_report_failure "Deploy failed; auto-rolled back to ${PREV_GOOD_SHA:0:7}"
      fi
      return
    fi
  fi

  if [[ "$GITHUB_STATUS_REPORTED" == "1" ]]; then
    return
  fi

  if [[ "$exit_code" -eq 0 ]]; then
    github_report_success "Deployed to production"
  else
    local failure_msg
    failure_msg="$(github_build_failure_message "$exit_code")"
    echo "$failure_msg" > "${LOG_DIR}/last-deploy-failure.txt"
    log "Deploy failure details written to ${LOG_DIR}/last-deploy-failure.txt"
    github_report_failure "$failure_msg"
  fi
}

deploy_repo() {
  if [[ "$SKIP_GIT_PULL" == "1" ]]; then
    log "Skipping git pull"
    return
  fi

  local target_sha="${EVENTIO_DEPLOY_SHA:-}"
  log "Updating repository (${GIT_REMOTE}/${GIT_BRANCH})"
  git -C "$REPO_DIR" fetch "$GIT_REMOTE" "$GIT_BRANCH" --tags --force

  # Stash local WIP so CI reset does not destroy in-progress operator edits
  if [[ "$PRESERVE_WORKTREE" == "1" ]]; then
    git -C "$REPO_DIR" stash push -u -m "eventio-deploy-autostash-$(date -u +%Y%m%d%H%M%S)" || true
  fi

  if [[ -n "$target_sha" ]]; then
    log "Checking out requested SHA ${target_sha:0:7}"
    git -C "$REPO_DIR" checkout --force "$target_sha"
  else
    git -C "$REPO_DIR" checkout --force "$GIT_BRANCH"
    git -C "$REPO_DIR" reset --hard "${GIT_REMOTE}/${GIT_BRANCH}"
  fi
}

deploy_backend() {
  log "Deploying backend"
  load_nvm
  cd "$REPO_DIR/backend"

  npm ci --omit=dev
  npx prisma generate
  npx prisma migrate deploy

  start_detached backend "$REPO_DIR/backend" "$BACKEND_PORT" bash -lc "set -a && source .env && set +a && exec node main.js"
  wait_for_http "http://127.0.0.1:${BACKEND_PORT}/api/v1/health"
}

deploy_app() {
  log "Deploying frontend/app (Next.js)"
  load_nvm
  cd "$REPO_DIR/frontend/app"

  export NEXT_PUBLIC_SERVER_ADDRESS
  npm ci
  npm run build

  if [[ "$STOP_STUDENT_PREVIEW" == "1" ]]; then
    stop_port "$APP_PORT"
  fi

  start_detached app "$REPO_DIR/frontend/app" "$APP_PORT" env PORT="$APP_PORT" npm run start -- --port "$APP_PORT"
  wait_for_http "http://127.0.0.1:${APP_PORT}/login"
}

deploy_council_app() {
  log "Deploying frontend/council-app (Next.js)"
  load_nvm
  cd "$REPO_DIR/frontend/council-app"

  export NEXT_PUBLIC_SERVER_ADDRESS
  npm ci
  npm run build

  if [[ "$STOP_OLD_COUNCIL_PREVIEW" == "1" ]]; then
    stop_port "$COUNCIL_APP_PORT"
  fi

  start_detached council-app "$REPO_DIR/frontend/council-app" "$COUNCIL_APP_PORT" \
    env PORT="$COUNCIL_APP_PORT" npm run start -- --port "$COUNCIL_APP_PORT"
  wait_for_http "http://127.0.0.1:${COUNCIL_APP_PORT}/council/login"
}

deploy_faculty_app() {
  log "Deploying frontend/faculty (Next.js)"
  load_nvm
  cd "$REPO_DIR/frontend/faculty"

  export NEXT_PUBLIC_SERVER_ADDRESS
  npm ci
  npm run build

  start_detached faculty "$REPO_DIR/frontend/faculty" "$FACULTY_APP_PORT" \
    env PORT="$FACULTY_APP_PORT" npm run start -- --port "$FACULTY_APP_PORT"
  wait_for_http "http://127.0.0.1:${FACULTY_APP_PORT}/faculty/login"
}

main() {
  trap 'on_deploy_err $LINENO' ERR
  trap on_deploy_exit EXIT

  : > "$DEPLOY_LOG_FILE"
  exec > >(tee -a "$DEPLOY_LOG_FILE") 2>&1

  log "Eventio deploy started"
  snapshot_last_good
  deploy_repo

  DEPLOY_SHA="$(git -C "$REPO_DIR" rev-parse HEAD)"
  github_deployment_start "$DEPLOY_SHA"

  [[ "$DEPLOY_BACKEND" == "1" ]] && deploy_backend
  [[ "$DEPLOY_APP" == "1" ]] && deploy_app
  [[ "$DEPLOY_COUNCIL_APP" == "1" ]] && deploy_council_app
  [[ "$DEPLOY_FACULTY_APP" == "1" ]] && deploy_faculty_app

  public_smoke
  mark_good "$DEPLOY_SHA"

  GITHUB_STATUS_REPORTED=1
  github_report_success "Deployed to production (${DEPLOY_SHA:0:7})"
  log "Eventio deploy finished successfully"
}

main "$@"
