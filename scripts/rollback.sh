#!/usr/bin/env bash
# Roll back Eventio production to a previously known-good SHA.
# Usage: bash scripts/rollback.sh <sha>
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/scripts/lib/common.sh"

TARGET_SHA="${1:-}"
if [[ -z "$TARGET_SHA" ]]; then
  if [[ -f /tmp/eventio/last-good.sha ]]; then
    TARGET_SHA="$(tr -d '[:space:]' < /tmp/eventio/last-good.sha)"
  fi
fi

if [[ -z "$TARGET_SHA" ]]; then
  echo "Usage: $0 <sha>" >&2
  exit 1
fi

log "Rolling back to ${TARGET_SHA:0:7}"

export EVENTIO_DEPLOY_SHA="$TARGET_SHA"
export SKIP_GIT_PULL=0
export AUTO_ROLLBACK=0
export PRESERVE_WORKTREE=0
export DEPLOY_BACKEND="${DEPLOY_BACKEND:-1}"
export DEPLOY_APP="${DEPLOY_APP:-1}"
export DEPLOY_COUNCIL_APP="${DEPLOY_COUNCIL_APP:-1}"
export DEPLOY_FACULTY_APP="${DEPLOY_FACULTY_APP:-1}"

bash "$ROOT_DIR/scripts/deploy.sh"
