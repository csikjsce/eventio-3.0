#!/usr/bin/env bash
# Poll origin/main and deploy when a new commit is available.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib/common.sh"

CONFIG_FILE="${EVENTIO_DEPLOY_CONFIG:-$ROOT_DIR/deploy/config.env}"
if [[ -f "$CONFIG_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG_FILE"
fi

: "${REPO_DIR:=$ROOT_DIR}"
: "${GIT_REMOTE:=origin}"
: "${GIT_BRANCH:=main}"
: "${LOG_DIR:=/tmp/eventio}"
: "${LOCK_FILE:=/tmp/eventio/poll-deploy.lock}"
: "${LAST_DEPLOYED_FILE:=/tmp/eventio/last-deployed.sha}"

mkdir -p "$LOG_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Deploy already running, skipping poll"
  exit 0
fi

git -C "$REPO_DIR" fetch "$GIT_REMOTE" "$GIT_BRANCH" --quiet
REMOTE_SHA="$(git -C "$REPO_DIR" rev-parse "${GIT_REMOTE}/${GIT_BRANCH}")"
LAST_DEPLOYED=""
if [[ -f "$LAST_DEPLOYED_FILE" ]]; then
  LAST_DEPLOYED="$(tr -d '[:space:]' < "$LAST_DEPLOYED_FILE")"
fi

if [[ "$REMOTE_SHA" == "$LAST_DEPLOYED" ]]; then
  log "Already deployed ${REMOTE_SHA:0:7}"
  exit 0
fi

LOCAL_SHA="$(git -C "$REPO_DIR" rev-parse HEAD)"
log "Deploy needed: last=${LAST_DEPLOYED:0:7} remote=${REMOTE_SHA:0:7} local=${LOCAL_SHA:0:7}"
bash "$ROOT_DIR/scripts/deploy.sh"
