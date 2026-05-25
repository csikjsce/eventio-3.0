#!/usr/bin/env bash

# Report production deploy status to GitHub Deployments + Commit Status APIs.

: "${GITHUB_REPO:=csikjsce/eventio-3.0}"
: "${DEPLOY_ENVIRONMENT:=production}"
: "${DEPLOY_ENVIRONMENT_URL:=https://eventio.somaiya.edu}"
: "${DEPLOY_LOG_URL:=}"
: "${DEPLOY_STATUS_CONTEXT:=eventio/production-deploy}"

GITHUB_DEPLOYMENT_ID=""
GITHUB_DEPLOY_SHA=""

github_status_enabled() {
  [[ -n "${GITHUB_TOKEN:-}" ]]
}

github_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"

  if [[ -n "$data" ]]; then
    curl -fsS -X "$method" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      -H "Content-Type: application/json" \
      "https://api.github.com/repos/${GITHUB_REPO}/${path}" \
      -d "$data"
  else
    curl -fsS -X "$method" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${GITHUB_REPO}/${path}"
  fi
}

github_truncate() {
  local max="$1"
  shift
  python3 -c "import sys; s=sys.argv[1]; print(s[:int(sys.argv[0])])" "$max" "$*"
}

github_set_deploy_sha() {
  GITHUB_DEPLOY_SHA="$1"
}

github_deployment_start() {
  local sha="$1"
  local response
  local payload

  github_set_deploy_sha "$sha"

  if ! github_status_enabled; then
    log "GitHub deploy status disabled (GITHUB_TOKEN not set)"
    return 0
  fi

  payload="$(python3 - "$sha" "$DEPLOY_ENVIRONMENT" <<'PY'
import json
import sys

sha, environment = sys.argv[1:3]
print(json.dumps({
    "ref": sha,
    "environment": environment,
    "auto_merge": False,
    "required_contexts": [],
    "description": "Eventio production deploy",
    "production_environment": True,
}))
PY
)"

  response="$(github_api POST deployments "$payload")"

  GITHUB_DEPLOYMENT_ID="$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || true)"

  if [[ -z "$GITHUB_DEPLOYMENT_ID" ]]; then
    log "WARNING: Could not create GitHub deployment"
    return 0
  fi

  log "GitHub deployment ${GITHUB_DEPLOYMENT_ID} created for ${sha:0:7}"
  github_deployment_report pending "Deploy started on SWDC server"
  github_commit_status pending "Deploy started on SWDC server"
}

github_deployment_report() {
  local state="$1"
  local description="$2"

  if ! github_status_enabled || [[ -z "$GITHUB_DEPLOYMENT_ID" ]]; then
    return 0
  fi

  local payload
  payload="$(python3 - "$state" "$description" "$DEPLOY_ENVIRONMENT" "$DEPLOY_ENVIRONMENT_URL" "$DEPLOY_LOG_URL" <<'PY'
import json
import sys

state, description, environment, environment_url, log_url = sys.argv[1:6]
payload = {
    "state": state,
    "environment": environment,
    "environment_url": environment_url,
    "description": description[:1000],
    "auto_inactive": False,
}
if log_url:
    payload["log_url"] = log_url
print(json.dumps(payload))
PY
)"

  github_api POST "deployments/${GITHUB_DEPLOYMENT_ID}/statuses" "$payload" >/dev/null \
    && log "GitHub deployment status: ${state}" \
    || log "WARNING: Failed to report GitHub deployment status"
}

github_commit_status() {
  local state="$1"
  local description="$2"

  if ! github_status_enabled || [[ -z "$GITHUB_DEPLOY_SHA" ]]; then
    return 0
  fi

  local payload
  payload="$(python3 - "$state" "$description" "$DEPLOY_STATUS_CONTEXT" "$DEPLOY_ENVIRONMENT_URL" <<'PY'
import json
import sys

state, description, context, target_url = sys.argv[1:5]
print(json.dumps({
    "state": state,
    "description": description[:140],
    "context": context,
    "target_url": target_url,
}))
PY
)"

  github_api POST "statuses/${GITHUB_DEPLOY_SHA}" "$payload" >/dev/null \
    && log "GitHub commit status (${DEPLOY_STATUS_CONTEXT}): ${state}" \
    || log "WARNING: Failed to report GitHub commit status"
}

github_report_success() {
  local description="${1:-Deployed to production}"
  github_deployment_report success "$description"
  github_commit_status success "$description"
}

github_report_failure() {
  local description="${1:-Deploy failed on SWDC server}"
  github_deployment_report failure "$description"
  github_commit_status failure "$(github_truncate 140 "$description")"
}

github_build_failure_message() {
  local exit_code="$1"
  local headline="${DEPLOY_FAILURE_MESSAGE:-Deploy failed on SWDC server (exit ${exit_code})}"
  local log_file="${DEPLOY_LOG_FILE:-}"

  python3 - "$headline" "$log_file" <<'PY'
import sys

headline = sys.argv[1]
log_file = sys.argv[2]
parts = [headline]

if log_file:
    try:
        with open(log_file, encoding="utf-8", errors="replace") as fh:
            lines = [ln.rstrip() for ln in fh.readlines() if ln.strip()]
        for line in reversed(lines):
            if "ERROR:" in line or "error" in line.lower() or "failed" in line.lower():
                parts.append(line.strip()[-400:])
                break
        tail = "\n".join(lines[-8:])
        if tail:
            parts.append("Recent log:\n" + tail[-700:])
    except OSError:
        pass

print("\n\n".join(parts)[:1000])
PY
}
