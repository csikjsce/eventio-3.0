# Eventio deployment

Production runs on the SWDC server behind **Nginx Proxy Manager**. Deployments are triggered by a **server-side git poll** — no GitHub SSH secrets required.

## What gets deployed

| Service | Path | Port | Public URL |
|---------|------|------|------------|
| Backend API | `backend/` | 3500 | https://eventioapi.swdc.somaiya.edu |
| Student app (Next.js) | `frontend/app/` | 4173 | https://eventio.somaiya.edu |

NPM forwards `eventio.somaiya.edu` → `127.0.0.1:4173`.

## One-time server setup

```bash
cd /vm-storage/projects/eventio-3.0
cp deploy/config.env.example deploy/config.env
chmod +x scripts/deploy.sh scripts/poll-deploy.sh
```

Ensure `backend/.env` exists with production values.

### Enable auto-deploy (cron)

Poll `origin/main` every 2 minutes and deploy when a new commit appears:

```bash
(crontab -l 2>/dev/null | grep -v 'eventio-3.0/scripts/poll-deploy'; \
 echo '*/2 * * * * /vm-storage/projects/eventio-3.0/scripts/poll-deploy.sh >> /tmp/eventio/poll-deploy.log 2>&1') \
 | crontab -
```

Check logs:

```bash
tail -f /tmp/eventio/poll-deploy.log
```

## Manual deploy

```bash
bash /vm-storage/projects/eventio-3.0/scripts/deploy.sh
```

Useful env overrides:

```bash
SKIP_GIT_PULL=1 DEPLOY_BACKEND=0 bash scripts/deploy.sh   # app only
DEPLOY_APP=0 bash scripts/deploy.sh                        # backend only
```

Service logs: `/tmp/eventio/backend.log`, `/tmp/eventio/app.log`

## How it works

1. Push to `main` on GitHub
2. Cron runs `scripts/poll-deploy.sh` on the server
3. Script fetches `origin/main` and compares SHAs
4. If changed, runs `scripts/deploy.sh` (pull, migrate, build, restart, health-check)

A file lock prevents overlapping deploys if a build takes longer than the poll interval.

## Health checks

Deploy fails if these checks fail:

- `http://127.0.0.1:3500/api/v1/health`
- `http://127.0.0.1:4173/login`

Public verification:

- https://eventioapi.swdc.somaiya.edu/api/v1/health
- https://eventio.somaiya.edu/login

## GitHub Actions

`.github/workflows/deploy.yml` builds and pushes Docker images to GHCR on push to `main`.

`.github/workflows/deploy-status.yml` shows a **Production Deploy** check on each `main` commit. It waits for the server to report deployment success via the GitHub Deployments API.

### Show deploy status on GitHub

1. Create a GitHub token with **Deployments: Read and write** for `csikjsce/eventio-3.0`
   - Fine-grained PAT recommended
   - Or classic PAT with `repo` scope
2. Add it to the server config:

```bash
# deploy/config.env
GITHUB_TOKEN=ghp_...
GITHUB_REPO=csikjsce/eventio-3.0
```

3. Push to `main`

You will see:
- A **Production Deploy** check on the commit (pending → success/failure)
- Deployment history under **Environments → production**
- Link to https://eventio.somaiya.edu when deploy succeeds

If `GITHUB_TOKEN` is not set, deploys still work locally but GitHub will not show status.
