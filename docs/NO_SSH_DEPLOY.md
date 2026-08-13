# Eventio deploy without teammate SSH

## Model
- **Host SSH**: only Coolify (`swdc-kjsse` key) and server admins
- **Teammates**: Coolify UI + CI/CD board only
- **Automatic**: push to `main` → GitHub Action → deploy hook → build + recreate

## URLs
| What | URL |
|------|-----|
| Coolify | https://coolify.arnabbhowmik.in |
| Redeploy UI | https://cicd.arnabbhowmik.in → **Redeploy now** |
| Deploy hook | https://eventio-deploy.arnabbhowmik.in/redeploy |
| App | https://eventio.somaiya.edu |

## Coolify
- Team: **Eventio**
- Project: **eventio-3.0**
- Service UUID: `op8cvha6gvpoohoq85lfqgj0`
- Teammates are **admin** on the Eventio team (can Restart / view logs) — not Linux users

## Manual GitHub secrets (required once)
Repo `csikjsce/eventio-3.0` → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|--------|
| `EVENTIO_DEPLOY_HOOK_URL` | `https://eventio-deploy.arnabbhowmik.in/redeploy` |
| `EVENTIO_DEPLOY_HOOK_SECRET` | from `/vm-storage/projects/eventio-3.0/deploy/hook.env` (`DEPLOY_HOOK_SECRET=`) |

## Day-to-day
1. Merge/push to `main` → auto redeploy, **or**
2. Open CI/CD board → **Redeploy now**, **or**
3. Coolify → Eventio → service → **Restart** (restarts containers; does not rebuild code — use Redeploy for code)

## Ops files (server only)
- `/vm-storage/projects/eventio-3.0/deploy/hook.env` (secret + Coolify token)
- `/tmp/eventio/ui-redeploy.log`
- Deploy hook PID: `/tmp/eventio/deploy-hook.pid`
