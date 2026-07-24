# Eventio 3.0 — Agent Context

Context and hard rules for AI agents (Claude Code, Cursor, etc.) working in this repo.
Human-facing docs: [`README.md`](README.md) (overview) and [`SETUP.md`](SETUP.md) (run guide).
Cursor rules with more detail live in `.cursor/rules/`.

---

## Golden rule: active vs dead code

`frontend/` has 6 apps. **Only 4 workspaces are active. Never read, search, edit, copy from, or
reference the deprecated ones** — treat them as if they do not exist.

| Path | Status | Role | Stack |
|---|---|---|---|
| `backend/` | ✅ active | REST API, auth, Prisma, business logic | Express 4, Node 18+ |
| `frontend/app/` | ✅ active | **Student** portal | Next.js 16 App Router |
| `frontend/council-app/` | ✅ active | **Council** portal | Next.js 16 App Router |
| `frontend/faculty/` | ✅ active | **Faculty / Principal** portal | Next.js 16 App Router |
| `frontend/student/` | ❌ **dead** | old student SPA | Vite — ignore |
| `frontend/council/` | ❌ **dead** | old council SPA | Vite — ignore |
| `frontend/dean/` | ❌ **dead** | old dean SPA | Vite — ignore |

> The stale idea that this is a Vite project comes from the dead apps. The **active** frontends are
> **Next.js 16 / React 19** — a version with breaking changes vs older Next.js. Check each app's
> local `AGENTS.md` and consult `node_modules/next/dist/docs/` before writing Next.js code.

---

## Ports & run commands

| Service | Port | Run (from repo root) |
|---|---|---|
| Backend API | 8000 | `cd backend && node main.js` |
| Student `app` | 3000 | `cd frontend/app && npm run dev -- -p 3000` |
| Council `council-app` | 3001 | `cd frontend/council-app && npm run dev -- -p 3001` |
| Faculty `faculty` | 3002 | `cd frontend/faculty && npm run dev -- -p 3002` |

Health: `http://localhost:8000/api/v1/health`. Full setup incl. env + Google OAuth: [`SETUP.md`](SETUP.md).

---

## Databases

Prisma client (`backend/utils/prisma_client.js`) auto-selects the adapter from `DATABASE_URL`:
`neon.tech` host → Neon serverless adapter; anything else → plain `pg`.

- **Neon** (`ep-…neon.tech`) — dev / local / test DB. Safe to write.
- **Azure** (`…postgres.database.azure.com`) — **production**. Do not run migrations or write test data against it.

`schema.prisma` datasource uses **only** `DATABASE_URL` (no `directUrl`).

---

## Auth & roles

- Google OAuth only (redirect flow). Frontend → `${SERVER}/api/v1/auth/google` → backend handshake →
  callback on the **backend** → redirect to a frontend `/login?accessToken=…&refreshToken=…`.
- Post-login redirect target is chosen **by role** (`backend/routes/auth.route.js`):
  `USER`→`CLIENT_URL`, `COUNCIL`→`COUNCIL_CLIENT_URL`, `FACULTY`/`PRINCIPAL`→`FACULTY_CLIENT_URL`.
  These same three URLs are the CORS allowlist (`backend/main.js`) — keep them in sync with the ports.
- `somaiya.edu` domain lock applies only when `NODE_ENV=production`.
- Roles: `USER`, `COUNCIL`, `FACULTY`, `PRINCIPAL`, `ADMIN`. API prefix: `/api/v1`.
- Per-app `localStorage` token keys: `app` → `accessToken`; `council-app` → `council_accessToken`;
  `faculty` → `faculty_accessToken` (each with a matching `*refreshToken`).

---

## Key backend files

- `backend/main.js` — entry, Passport/OAuth, CORS, rate limits, route mounting
- `backend/prisma/schema.prisma` — data models & enums (event `STATE` machine)
- `backend/routes/` — `auth`, `user`, `event`, `council`, `mailer`, `document`, `budget`, `announcement`
- `backend/middleware/auth.middleware.js` — JWT verification
- `backend/middleware/field-validator.middlware.js` — role-based field allowlist on event updates
- `backend/utils/faculty-access.js` — role resolution / faculty-advisor promotion

## Frontend conventions

- All three apps read `NEXT_PUBLIC_SERVER_ADDRESS` and call `${it}/api/v1` (see each `lib/api.ts`,
  which has the 401→refresh interceptor). `app` and `faculty` fall back to the prod API if it's unset.
- Keep event types and `transformEvent` logic aligned between `council-app` and `faculty` `lib/api.ts`.
- Backend is shared — an API change may require updates in all three frontends.
- Match each app's existing Tailwind tokens and component patterns.

---

## Working rules

- Minimize diff scope; match existing patterns in the touched app.
- Never touch or reference the deprecated Vite folders.
- Do not commit unless explicitly asked. Never commit secrets, DB URLs, or tokens.
- Point local work at the Neon dev DB, never Azure prod.
