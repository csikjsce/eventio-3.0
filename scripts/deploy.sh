#!/usr/bin/env bash
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
: "${LOG_DIR:=/tmp/eventio}"
: "${RUN_DIR:=/tmp/eventio}"
: "${GIT_REMOTE:=origin}"
: "${GIT_BRANCH:=main}"
: "${NEXT_PUBLIC_SERVER_ADDRESS:=https://eventioapi.swdc.somaiya.edu}"
: "${SKIP_GIT_PULL:=0}"
: "${DEPLOY_BACKEND:=1}"
: "${DEPLOY_APP:=1}"
: "${DEPLOY_COUNCIL_APP:=1}"
: "${STOP_STUDENT_PREVIEW:=1}"
: "${STOP_OLD_COUNCIL_PREVIEW:=1}"

DEPLOY_SHA=""
GITHUB_STATUS_REPORTED=0

on_deploy_exit() {
  local exit_code=$?

  if [[ "$GITHUB_STATUS_REPORTED" == "1" ]]; then
    return
  fi

  if [[ "$exit_code" -eq 0 ]]; then
    github_deployment_report success "Deployed to production"
  else
    github_deployment_report failure "Deploy failed on SWDC server"
  fi
}

deploy_repo() {
  if [[ "$SKIP_GIT_PULL" == "1" ]]; then
    log "Skipping git pull"
    return
  fi

  log "Updating repository (${GIT_REMOTE}/${GIT_BRANCH})"
  git -C "$REPO_DIR" fetch "$GIT_REMOTE" "$GIT_BRANCH"
  git -C "$REPO_DIR" checkout "$GIT_BRANCH"
  git -C "$REPO_DIR" pull --ff-only "$GIT_REMOTE" "$GIT_BRANCH"
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
  wait_for_http "http://127.0.0.1:${COUNCIL_APP_PORT}/login"
}

main() {
  trap on_deploy_exit EXIT

  log "Eventio deploy started"
  deploy_repo

  DEPLOY_SHA="$(git -C "$REPO_DIR" rev-parse HEAD)"
  github_deployment_start "$DEPLOY_SHA"

  [[ "$DEPLOY_BACKEND" == "1" ]] && deploy_backend
  [[ "$DEPLOY_APP" == "1" ]] && deploy_app
  [[ "$DEPLOY_COUNCIL_APP" == "1" ]] && deploy_council_app

  GITHUB_STATUS_REPORTED=1
  github_deployment_report success "Deployed to production"
  echo "$DEPLOY_SHA" > "${LAST_DEPLOYED_FILE:-/tmp/eventio/last-deployed.sha}"
  log "Eventio deploy finished successfully"
}

main "$@"
