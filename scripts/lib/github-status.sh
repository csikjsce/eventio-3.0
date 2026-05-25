#!/usr/bin/env bash

# Report production deploy status to GitHub Deployments API.

: "${GITHUB_REPO:=csikjsce/eventio-3.0}"
: "${DEPLOY_ENVIRONMENT:=production}"
: "${DEPLOY_ENVIRONMENT_URL:=https://eventio.somaiya.edu}"
: "${DEPLOY_LOG_URL:=}"

GITHUB_DEPLOYMENT_ID=""

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

github_deployment_start() {
  local sha="$1"
  local response

  if ! github_status_enabled; then
    log "GitHub deploy status disabled (GITHUB_TOKEN not set)"
    return 0
  fi

  response="$(github_api POST deployments "$(cat <<EOF
{
  "ref": "${sha}",
  "environment": "${DEPLOY_ENVIRONMENT}",
  "auto_merge": false,
  "required_contexts": [],
  "description": "Eventio production deploy",
  "production_environment": true
}
EOF
)")"

  GITHUB_DEPLOYMENT_ID="$(echo "$response" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*\([0-9]*\).*/\1/p' | head -1)"

  if [[ -z "$GITHUB_DEPLOYMENT_ID" ]]; then
    log "WARNING: Could not create GitHub deployment"
    return 0
  fi

  log "GitHub deployment ${GITHUB_DEPLOYMENT_ID} created for ${sha:0:7}"
  github_deployment_report pending "Deploy started on SWDC server"
}

github_deployment_report() {
  local state="$1"
  local description="$2"

  if ! github_status_enabled || [[ -z "$GITHUB_DEPLOYMENT_ID" ]]; then
    return 0
  fi

  local payload
  payload="$(cat <<EOF
{
  "state": "${state}",
  "environment": "${DEPLOY_ENVIRONMENT}",
  "environment_url": "${DEPLOY_ENVIRONMENT_URL}",
  "description": "${description}",
  "auto_inactive": false
}
EOF
)"

  if [[ -n "$DEPLOY_LOG_URL" ]]; then
    payload="$(echo "$payload" | sed 's/}$/,"log_url":"'"${DEPLOY_LOG_URL}"'"}/')"
  fi

  github_api POST "deployments/${GITHUB_DEPLOYMENT_ID}/statuses" "$payload" >/dev/null \
    && log "GitHub deployment status: ${state}" \
    || log "WARNING: Failed to report GitHub deployment status"
}
