# Eventio deployment

> ℹ️ For the current folder map (active vs deprecated apps), ports, and env vars, see
> [`README.md`](README.md) and [`SETUP.md`](SETUP.md) — those are the source of truth. This file
> covers the production deploy pipeline only; confirm folder/port details there before relying on them.

Production runs on the SWDC server behind **Nginx Proxy Manager**. Deployments are triggered by a **server-side git poll** — no GitHub SSH secrets required.

## What gets deployed

| Service | Path | Port | Public URL |
|---------|------|------|------------|
| Backend API | `backend/` | 3500 | https://eventioapi.swdc.somaiya.edu |
| Student app (Next.js) | `frontend/app/` | 4173 | https://eventio.somaiya.edu |
| Council app (Next.js) | `frontend/council-app/` | 4174 | https://eventio-council.swdc.somaiya.edu |
| Faculty app (Next.js) | `frontend/faculty/` | 4175 | https://eventio-faculty.swdc.somaiya.edu |

NPM forwards `eventio.somaiya.edu` → `127.0.0.1:4173`, `eventio-council.swdc.somaiya.edu` → `127.0.0.1:4174`, and `eventio-faculty.swdc.somaiya.edu` → `127.0.0.1:4175`.

All Next.js apps are built with `NEXT_PUBLIC_SERVER_ADDRESS=https://eventioapi.swdc.somaiya.edu`. Ensure `COUNCIL_CLIENT_URL` and `FACULTY_CLIENT_URL` in `backend/.env` match the public URLs.

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
SKIP_GIT_PULL=1 DEPLOY_BACKEND=0 bash scripts/deploy.sh   # frontends only
DEPLOY_APP=0 bash scripts/deploy.sh                        # backend + council
DEPLOY_COUNCIL_APP=0 bash scripts/deploy.sh                # backend + student app
SKIP_GIT_PULL=1 DEPLOY_BACKEND=0 DEPLOY_APP=0 bash scripts/deploy.sh  # council only
SKIP_GIT_PULL=1 DEPLOY_BACKEND=0 DEPLOY_APP=0 DEPLOY_COUNCIL_APP=0 bash scripts/deploy.sh  # faculty only
```

Service logs: `/tmp/eventio/backend.log`, `/tmp/eventio/app.log`, `/tmp/eventio/council-app.log`, `/tmp/eventio/faculty.log`

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
- `http://127.0.0.1:4174/login`
- `http://127.0.0.1:4175/login`

Public verification:

- https://eventioapi.swdc.somaiya.edu/api/v1/health
- https://eventio.somaiya.edu/login
- https://eventio-council.swdc.somaiya.edu/login
- https://eventio-faculty.swdc.somaiya.edu/login

## GitHub Actions

`.github/workflows/deploy.yml` builds and pushes Docker images to GHCR on push to `main`.

`.github/workflows/deploy-status.yml` shows a **Production Deploy** check on each `main` commit. It waits for the server to report deployment success via the GitHub Deployments API.

### Show deploy status on GitHub

1. Create a GitHub token with **Deployments: Read and write** and **Commit statuses: Read and write** for `csikjsce/eventio-3.0`
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
- A commit check **`eventio/production-deploy`** with a short error summary on failure
- Deployment history under **Environments → production** with the full error message (up to 1000 chars) and recent log tail
- Link to https://eventio.somaiya.edu when deploy succeeds

On failure, the server also writes details to:
- `/tmp/eventio/last-deploy-failure.txt`
- `/tmp/eventio/last-deploy.log`
- `/tmp/eventio/deploy-<sha>.log`

If `GITHUB_TOKEN` is not set, deploys still work locally but GitHub will not show status.
