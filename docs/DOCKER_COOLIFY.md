# Eventio Docker + Coolify

## Runtime
- Containers: `eventio-api`, `eventio-app`, `eventio-council`, `eventio-faculty`
- Host ports (NPM unchanged): API `3500`, app `4173`, council `4174`, faculty `4175`
- Coolify: team **Eventio** → project **eventio-3.0** → service `eventio-stack-op8cvha6gvpoohoq85lfqgj0`
- UI: https://coolify.arnabbhowmik.in

## Rebuild images (after code changes)
```bash
cd /vm-storage/projects/eventio-3.0
docker compose -f docker-compose.prod.yml --env-file .env.docker build
# then Restart the service in Coolify UI
```

## Env
- Source of truth for secrets: `/vm-storage/projects/eventio-3.0/.env.docker` (gitignored)
- Also synced into Coolify environment variables for the service

## Rollback to bare processes
Use `scripts/deploy.sh` / previous process start, after `docker stop` the four eventio containers.
