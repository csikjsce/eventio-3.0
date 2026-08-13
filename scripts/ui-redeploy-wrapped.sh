#!/usr/bin/env bash
set -euo pipefail
set -a
source /vm-storage/projects/eventio-3.0/deploy/hook.env
set +a
exec /vm-storage/projects/eventio-3.0/scripts/ui-redeploy.sh
