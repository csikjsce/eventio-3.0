#!/usr/bin/env bash
# Legacy poll entrypoint — disabled in favor of GitHub Actions webhooks.
# Kept so old cron lines fail closed with a clear message.
set -euo pipefail
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] poll-deploy disabled: use GitHub Actions Deploy Production workflow" >&2
exit 0
