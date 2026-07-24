# Eventio 3.0 — Local & Deployed Setup / Testing Guide

> Practical run guide for coming back to the project. Covers **localhost** (fast dev +
> Playwright) and **deployed** testing. Focuses only on the **active** apps.
>
> **Secrets:** every credential below is a **placeholder**. Copy the real values from your
> existing gitignored files (`backend/.env`, `backend/.env.old`) or your password manager.
> Do **not** commit real secrets/DB passwords into this file.

---

## 0. What's actually active (ignore the rest)

The `frontend/` folder has 6 apps. Only **3 are in use** — all **Next.js 16 / React 19**:

| App | Folder | Role | Backend redirects here for role |
|---|---|---|---|
| Student | `frontend/app` | Student portal (PWA) | `USER` (default) → `CLIENT_URL` |
| Council | `frontend/council-app` | Council management | `COUNCIL` → `COUNCIL_CLIENT_URL` |
| Faculty | `frontend/faculty` | Faculty / Principal | `FACULTY`, `PRINCIPAL` → `FACULTY_CLIENT_URL` |

**Deprecated — do not run:** `frontend/student`, `frontend/council`, `frontend/dean`
(these are the old Vite apps the stale README still describes).

**Backend:** single folder `backend/` (Express + Prisma). The Prisma client
(`backend/utils/prisma_client.js`) auto-picks its driver from `DATABASE_URL`:
a `neon.tech` URL uses the Neon serverless adapter; anything else uses plain `pg`.
So you switch DB just by swapping `DATABASE_URL`.

### Databases

| DB | Host | Use | Adapter |
|---|---|---|---|
| **Neon** (dummy) | `ep-spring-block…neon.tech` | **localhost / Playwright** — safe to write test data | Neon serverless |
| **Azure** (real, deployed) | `ideahackathon.postgres.database.azure.com` | deployed / production only | `pg` |

> ⚠️ Keep localhost pointed at **Neon**. Don't run migrations or write test data against Azure.

---

## 1. How auth works (read this once — it explains the port mapping)

1. Each frontend sends the browser to `{NEXT_PUBLIC_SERVER_ADDRESS}/api/v1/auth/google`.
2. The **backend** performs the Google handshake. Google's redirect URI is
   `SERVER_URL + /api/v1/auth/google/callback` — so the callback lands on the **backend**, not the frontend.
3. After login the backend redirects back **by the user's role** (see table above), appending
   `/login?accessToken=…&refreshToken=…`.

Consequences for localhost:
- The **three** `*_CLIENT_URL` vars in `backend/.env` must point at the three Next ports, or a
  logged-in council/faculty user bounces to the wrong app.
- Those same three URLs are the **CORS allowlist** (`backend/main.js`), so they must match exactly.
- Domain-lock to `somaiya.edu` only applies when `NODE_ENV=production`. **Leave `NODE_ENV` unset
  locally** so you can log in with a normal Google account (e.g. a gmail).

---

## 2. One-time Google Cloud step (required for localhost login)

In the Google Cloud Console for OAuth client `689075584108-…apps.googleusercontent.com`
(the ID already in your `backend/.env`), under **Authorized redirect URIs**, add:

```
http://localhost:8000/api/v1/auth/google/callback
```

That's the only entry needed — the callback runs on the backend. The frontend origins don't need
to be authorized JS origins (they use the redirect flow, not Google One-Tap). If you lack access
to that project, ask whoever owns the `csikjsce` Google Cloud project to add it.

---

## 3. Prerequisites

- **Node 18+** (you're on v25 — fine). npm (or yarn; backend has both lockfiles).
- Network access to Neon (localhost DB).
- 4 free ports: **8000** (API), **3000** (student), **3001** (council), **3002** (faculty).

---

## 4. Localhost setup

### 4a. Backend

Create `backend/.env` (or back up the current prod one first — it's gitignored):

```env
# --- LOCAL DEV (Neon dummy DB) ---
DATABASE_URL='<neon URL from backend/.env.old — ep-spring-block…neon.tech>'
LOG_LEVEL='debug'
# NODE_ENV intentionally UNSET locally (disables somaiya.edu domain lock)

GOOGLE_CLIENT_ID="<from backend/.env>"
GOOGLE_CLIENT_SECRET="<from backend/.env>"
GOOGLE_CALLBACK_URL="/api/v1/auth/google/callback"
FRONTEND_REDIRECT_PATH="/login"

JWT_SECRET="local_dev_jwt_secret_changeme"
SESSION_SECRET="local_dev_session_secret_changeme"

# Must match the Next dev ports below (role-based redirect + CORS allowlist)
CLIENT_URL="http://localhost:3000"
COUNCIL_CLIENT_URL="http://localhost:3001"
FACULTY_CLIENT_URL="http://localhost:3002"
DEAN_CLIENT_URL="http://localhost:3002"
SERVER_URL="http://localhost:8000"
PORT=8000

AT_EXPIRATION="5h"
RT_EXPIRATION="7d"

EMAIL_USER="<from backend/.env — optional; only needed for email features>"
EMAIL_PASS="<from backend/.env — optional>"
```

Run:

```bash
cd backend
npm install                 # node_modules already present, but safe to run
npx prisma generate         # required — schema uses driverAdapters preview
npx prisma migrate deploy   # applies existing migrations to the Neon dummy DB
node main.js                # starts on http://localhost:8000
```

Health check: <http://localhost:8000/api/v1/health> → `{"status":"up and running"}`

> `DIRECT_URL` isn't referenced by `schema.prisma` (datasource uses only `DATABASE_URL`), so you
> can ignore it locally despite the old README mentioning it.

### 4b. Frontends

⚠️ `app` and `faculty` **fall back to the production API** in their `next.config.ts` if
`NEXT_PUBLIC_SERVER_ADDRESS` is unset — so you **must** set it locally or they silently hit prod.

Each app now ships a committed `.env.example` — the fastest path is `cp .env.example .env.local`
in each. The resulting `.env.local` (gitignored) should contain:

`frontend/app/.env.local`
```env
NEXT_PUBLIC_SERVER_ADDRESS=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`frontend/council-app/.env.local`
```env
NEXT_PUBLIC_SERVER_ADDRESS=http://localhost:8000
```

`frontend/faculty/.env.local`
```env
NEXT_PUBLIC_SERVER_ADDRESS=http://localhost:8000
```

Run each in its own terminal (pin the ports so they match `backend/.env`):

```bash
# Student
cd frontend/app         && npm install && npm run dev -- -p 3000
# Council
cd frontend/council-app && npm install && npm run dev -- -p 3001
# Faculty  (this one has no node_modules yet — install is required)
cd frontend/faculty     && npm install && npm run dev -- -p 3002
```

| App | URL |
|---|---|
| Student | http://localhost:3000 |
| Council | http://localhost:3001 |
| Faculty | http://localhost:3002 |
| API health | http://localhost:8000/api/v1/health |

### 4c. Login walkthrough (localhost)

1. Open the app for the role you want to test.
2. Click login → you're sent to `localhost:8000/api/v1/auth/google` → Google → back to the app's
   `/login?accessToken=…`.
3. Role is decided server-side from the DB (`role` column). A brand-new Google account is created
   as `USER`. To test COUNCIL/FACULTY, set that user's `role` in the Neon DB (or seed an
   `admins` row — see `backend/main.js` `resolveRoleForNewUser`), then log in again.

---

## 5. Deployed testing (real Azure DB)

The prod stack is already live (Docker Compose + GHCR + Watchtower; see `DEPLOY.md`). For a full
go-through you normally just use the deployed URLs in a browser:

| App | Deployed URL |
|---|---|
| Student | https://eventio.somaiya.edu |
| Council | https://eventio-council.swdc.somaiya.edu |
| Faculty | https://eventio-faculty.swdc.somaiya.edu |
| API | https://eventioapi.swdc.somaiya.edu/api/v1/health |

The deployed `backend/.env` (already on the server) differs from local in these keys:

```env
DATABASE_URL='<Azure URL — ideahackathon.postgres.database.azure.com>'
NODE_ENV=production          # enables somaiya.edu domain lock → only @somaiya.edu accounts
CLIENT_URL="https://eventio.somaiya.edu"
COUNCIL_CLIENT_URL="https://eventio-council.swdc.somaiya.edu"
FACULTY_CLIENT_URL="https://eventio-faculty.swdc.somaiya.edu"
SERVER_URL="https://eventioapi.swdc.somaiya.edu"
```

The Google OAuth client must (already) list
`https://eventioapi.swdc.somaiya.edu/api/v1/auth/google/callback` as a redirect URI.

> To point a **local frontend at the deployed backend** (test new UI against real data — read-only,
> be careful), set that frontend's `.env.local` to
> `NEXT_PUBLIC_SERVER_ADDRESS=https://eventioapi.swdc.somaiya.edu` and run `npm run dev`. Note the
> deployed API's CORS only allows the prod origins, so cross-origin calls from `localhost` may be
> blocked — the reliable full test is on the deployed URLs themselves.

---

## 6. Playwright / automation (localhost)

Point tests at the local ports (`3000`/`3001`/`3002`) against the Neon dummy DB. Google's real
consent screen can't be scripted reliably, so for automation either:

- **Recommended — bypass the OAuth UI:** the frontends read tokens from
  `"/login?accessToken=…&refreshToken=…"` and store them (see `frontend/app/components/screens/LoginScreen.tsx`
  and each `lib/api.ts`). Mint a JWT for a seeded Neon test user with `JWT_SECRET` and load that URL,
  or set the token in `localStorage` directly, so tests skip Google entirely. Each app uses its own
  `localStorage` keys:

  | App (port) | access token key | refresh token key |
  |---|---|---|
  | `app` (3000) | `accessToken` | `refreshToken` |
  | `council-app` (3001) | `council_accessToken` | `council_refreshToken` |
  | `faculty` (3002) | `faculty_accessToken` | `faculty_refreshToken` |
- Or reuse a saved `storageState` from one manual login.

Bring the stack up before tests (backend + the app under test), targeting Neon.

---

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Frontend hits `eventioapi.swdc.somaiya.edu` instead of localhost | `NEXT_PUBLIC_SERVER_ADDRESS` not set — `app`/`faculty` fall back to prod in `next.config.ts`. Add `.env.local` and restart `next dev` (env is read at startup). |
| Login redirects to the wrong app / a prod URL | `*_CLIENT_URL` in `backend/.env` don't match your local ports. Fix and restart the backend. |
| CORS error in console | Same cause — the origin isn't in `CLIENT_URL/COUNCIL_CLIENT_URL/FACULTY_CLIENT_URL`. |
| Google "redirect_uri_mismatch" | `http://localhost:8000/api/v1/auth/google/callback` not added to the OAuth client (§2). |
| Only `@somaiya.edu` accounts allowed locally | `NODE_ENV=production` is set locally — unset it. |
| Prisma "adapter"/connection error | Wrong `DATABASE_URL`, or you skipped `npx prisma generate`. Neon URL → Neon adapter; other → `pg`. |
| `faculty` won't start | It has no `node_modules` yet — run `npm install` in `frontend/faculty`. |

---

## 8. Quick reference

```
Backend      cd backend         → node main.js                 (:8000, Neon)
Student      cd frontend/app         → npm run dev -- -p 3000
Council      cd frontend/council-app → npm run dev -- -p 3001
Faculty      cd frontend/faculty     → npm run dev -- -p 3002
Health       http://localhost:8000/api/v1/health
```
