# EC2 backend + Vercel frontends

## Recommended layout

Run only the API on EC2 using `docker-compose.backend.yml`. Deploy the three
Next.js apps independently on Vercel. This avoids running three Node/Next
servers on a small free-tier VPS.

For one public origin, use a Cloudflare Worker (or a small Vercel proxy
project) for `eventio.csi-kjsce.org`:

- `/api/*` → the EC2 API origin
- `/council/*` → the council Vercel deployment
- `/faculty/*` → the faculty Vercel deployment
- everything else → the student Vercel deployment

For test deployments on separate domains, set `NEXT_PUBLIC_BASE_PATH` to an
empty value. For the college deployment, set it to `/council` or `/faculty` in
the corresponding Vercel Production environment. The Next.js configs use the
production path by default, so an unset variable does not change the college
deployment. Set each app's `NEXT_PUBLIC_SERVER_ADDRESS` to
`https://eventio-api.csi-kjsce.org`. Vercel alone does not reliably compose three
separate projects under path prefixes without this proxy/rewrite layer.

## EC2 setup

```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker ubuntu
git clone <repository-url> /opt/eventio
cd /opt/eventio
cp backend/.env.example backend/.env   # create/populate test-only values
mkdir -p backend/cert           # add certificates if the API needs them
docker compose -f docker-compose.backend.yml up -d --build
```

For this test deployment, the server-side `backend/.env` must include:

```env
CLIENT_URL="https://eventio.csi-kjsce.org"
COUNCIL_CLIENT_URL="https://eventio-council.csi-kjsce.org"
FACULTY_CLIENT_URL="https://eventio-faculty.csi-kjsce.org"
SERVER_URL="https://eventio-api.csi-kjsce.org"
```

Point `eventio-api.csi-kjsce.org` to the EC2 instance, terminate HTTPS with
Nginx or Caddy, and proxy it to `127.0.0.1:8000`. The Vercel projects should
use `NEXT_PUBLIC_SERVER_ADDRESS=https://eventio-api.csi-kjsce.org`.

Keep `.env` and certificates only on the server. Bind the API to localhost as
the Compose file does, and expose it through Nginx/Caddy or the Cloudflare
proxy. Do not open port 8000 publicly.

## GitHub Actions secrets

Add `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, and `EC2_APP_DIR` (for example
`/opt/eventio`) as repository or production-environment secrets. The workflow
deploys automatically after changes to `main` that affect the backend.

The EC2 deploy key should be restricted to this repository and the server
firewall should allow SSH only from trusted IPs where possible.
