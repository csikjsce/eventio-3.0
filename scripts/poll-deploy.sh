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

mkdir -p "$LOG_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Deploy already running, skipping poll"
  exit 0
fi

LOCAL_SHA="$(git -C "$REPO_DIR" rev-parse HEAD)"
git -C "$REPO_DIR" fetch "$GIT_REMOTE" "$GIT_BRANCH" --quiet
REMOTE_SHA="$(git -C "$REPO_DIR" rev-parse "${GIT_REMOTE}/${GIT_BRANCH}")"

if [[ "$LOCAL_SHA" == "$REMOTE_SHA" ]]; then
  log "No new commits on ${GIT_REMOTE}/${GIT_BRANCH} (${LOCAL_SHA:0:7})"
  exit 0
fi

log "New commit detected: ${LOCAL_SHA:0:7} -> ${REMOTE_SHA:0:7}"
bash "$ROOT_DIR/scripts/deploy.sh"
