# Eventio Enterprise CI/CD + Observability

This document is the operator guide for the enterprise delivery platform.

## Architecture (P0)

| Layer | Implementation |
|-------|----------------|
| CI | `.github/workflows/ci.yml` — path-filtered build + CodeQL |
| CD | `.github/workflows/deploy-production.yml` — self-hosted runner `eventio` |
| Deploy script | `scripts/deploy.sh` — clean checkout, health gates, public smoke |
| Auto-rollback | On failed health/smoke → restore `/tmp/eventio/last-good.sha` via `scripts/rollback.sh` |
| Artifacts | GHCR images tagged `:sha` and `:latest` |
| Observability | `monitoring/docker-compose.yml` — Prometheus, Grafana, Loki, Tempo, Blackbox, Alertmanager |

## Public routing

| URL | Service |
|-----|---------|
| https://eventio.somaiya.edu/ | Student |
| https://eventio.somaiya.edu/council | Council |
| https://eventio.somaiya.edu/faculty | Faculty |
| https://eventio.somaiya.edu/api | API |

### Monitoring / management (`arnabbhowmik.in`)

| URL | Service |
|-----|---------|
| https://cicd.arnabbhowmik.in | **CI/CD control dashboard** |
| https://grafana.arnabbhowmik.in | Grafana |
| https://prometheus.arnabbhowmik.in | Prometheus |
| https://alerts.arnabbhowmik.in | Alertmanager |

Start the CI/CD dashboard (if not running):

```bash
nohup node /vm-storage/projects/eventio-3.0/ops/cicd-dashboard.js > /tmp/eventio/cicd-dashboard.log 2>&1 &
```


## One-time setup

### 1. GitHub Environment

1. Repo → **Settings → Environments → New environment** → `production`
2. Enable **Required reviewers** (recommended for enterprise demos)
3. Add secret `EVENTIO_DEPLOY_GITHUB_TOKEN` (fine-grained PAT with `deployments` + `statuses` write) if `GITHUB_TOKEN` permissions are insufficient

### 2. Self-hosted runner (SWDC)

```bash
mkdir -p ~/actions-runner && cd ~/actions-runner
# Download runner from GitHub → Settings → Actions → Runners → New self-hosted runner
./config.sh --url https://github.com/csikjsce/eventio-3.0 --token <REGISTRATION_TOKEN> --labels eventio
sudo ./svc.sh install
sudo ./svc.sh start
```

Required label: **`eventio`** (workflow uses `runs-on: [self-hosted, eventio]`).

Optional env for the runner service:

```bash
EVENTIO_REPO_DIR=/vm-storage/projects/eventio-3.0
```

### 3. Disable legacy poll cron

```bash
crontab -l | grep -v 'eventio-3.0/scripts/poll-deploy' | crontab -
```

### 4. Start monitoring stack

```bash
cd /vm-storage/projects/eventio-3.0/monitoring
docker compose up -d
```

- Grafana: http://127.0.0.1:3005 or https://grafana.arnabbhowmik.in  
  - **Login:** `admin` / `eventio-change-me` (override with `GRAFANA_ADMIN_PASSWORD`)
- Prometheus: http://127.0.0.1:9095 or https://prometheus.arnabbhowmik.in
- Alertmanager: http://127.0.0.1:9093 or https://alerts.arnabbhowmik.in  
  - Email alerts via Gmail SMTP as `csi-kjsce@somaiya.edu` → `arnab.b@somaiya.edu`  
  - Password file: `monitoring/alertmanager/smtp_password` (gitignored)

Grafana root URL is set via `GRAFANA_ROOT_URL=https://grafana.arnabbhowmik.in`.

### 5. Branch protection

Protect `main`:

- Require PR
- Require status check **CI gate**
- Restrict direct pushes

## Day-2 operations

### Manual deploy

GitHub → Actions → **Deploy Production** → Run workflow  
Inputs: `services=all|backend|app|council|faculty`, optional `sha`, `skip_rollback`.

### Manual rollback

```bash
bash /vm-storage/projects/eventio-3.0/scripts/rollback.sh <good-sha>
# or
bash /vm-storage/projects/eventio-3.0/scripts/rollback.sh   # uses last-good.sha
```

### Auto-rollback behavior

1. Before deploy, previous `/tmp/eventio/last-good.sha` is remembered  
2. Deploy + local health checks + public smoke  
3. On failure → automatically redeploy last-good (unless `AUTO_ROLLBACK=0`)  
4. GitHub Deployment marked failed with rollback note  

### State files

| File | Meaning |
|------|---------|
| `/tmp/eventio/last-deployed.sha` | Last attempted/successful deploy SHA |
| `/tmp/eventio/last-good.sha` | Last SHA that passed smoke |
| `/tmp/eventio/last-deploy.log` | Latest deploy log |
| `/tmp/eventio/*.log` | Service logs (Promtail scrapes these) |

## Demo script (enterprise pitch)

1. Open a PR → show CI + CodeQL  
2. Merge to `main` → Actions **Deploy Production**  
3. Approve **production** environment  
4. Watch health gates + public smoke  
5. Open Grafana golden dashboard (synthetics)  
6. Force a bad deploy / kill API → show alert + auto-rollback  

## Roadmap

| Phase | Status |
|-------|--------|
| P0 CI/CD + rollback + monitoring skeleton | **This doc** |
| P1 Staging env + Slack/PagerDuty receivers | Next |
| P2 Digest-based container runtime + cosign | Next |
| P3 Full OTel instrumentation + SLO burn alerts | Next |
