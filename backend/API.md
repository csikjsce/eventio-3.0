# Eventio 3.0 — Backend API Reference

Base URL: `https://<server>/api/v1`

All protected endpoints (`/p/...`) require:
```
Authorization: Bearer <accessToken>
```

---

## Auth (`/auth`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/auth/google` | — | — | Redirect to Google OAuth |
| GET | `/auth/google/callback` | — | — | Redirect to client with `?accessToken=&refreshToken=` |
| POST | `/auth/googleToken` | — | `{ code }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh-token` | — | `{ refreshToken }` | `{ accessToken }` |

---

## User (`/user`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/user/p/me` | ✅ | — | `{ user }` |
| POST | `/user/p/update` | ✅ | `{ degree, branch, gender, interests, phone_number, roll_number, year, college, signature }` | success |

---

## Events (`/event`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/event/p/get` | ✅ | Role-filtered event list. Cached 90s for COUNCIL. |
| POST | `/event/p/get/me` | ✅ | User's registered events |
| POST | `/event/p/get/:id` | ✅ | Single event + user participation |
| POST | `/event/p/create` | ✅ COUNCIL | Body: full event fields |
| POST | `/event/p/update/:id` | ✅ COUNCIL/FACULTY/PRINCIPAL | Partial update; appends state_history |
| GET | `/event/p/search/?q=` | ✅ | Fulltext search (limit 10) |
| GET | `/event/p/stats` | ✅ | Participant stats per event. Cached 5 min. |
| POST | `/event/p/get-children/:id` | ✅ | Sub-events |
| POST | `/event/p/get-calendar` | ✅ | Calendar view |
| POST | `/event/p/register-for-event` | ✅ | `{ event_id, more_details? }` |
| POST | `/event/p/create-team` | ✅ | `{ event_id, team_name, more_details? }` |
| POST | `/event/p/join-team` | ✅ | `{ event_id, invite_code, more_details? }` |
| POST | `/event/p/delete-team` | ✅ | `{ event_id, team_id }` |
| POST | `/event/p/remove-from-team` | ✅ | `{ team_id, user_id }` |
| POST | `/event/p/team-submission` | ✅ | `{ team_id, submissions }` |
| POST | `/event/p/rate` | ✅ | `{ event_id, rating }` (1–5) |
| POST | `/event/p/claim-ticket` | ✅ | `{ event_id }` |
| GET | `/event/get-event-participants/:id` | ✅ | Teams + participants for event |
| POST | `/event/checkin` | ✅ | `{ event_id, participant_id }` |
| GET | `/event/p/attendance-report/:id` | ✅ COUNCIL+ | PDF stream |

---

## Councils (`/council`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/council/p/get` | ✅ | All councils. Cached 10 min. |
| GET | `/council/p/profile/:id` | ✅ | Public council profile + events |
| GET | `/council/p/me` | ✅ COUNCIL | Own extended profile |
| PUT | `/council/p/me` | ✅ COUNCIL | Update profile (tagline, about, banner_url, instagram, website, faculty_advisors, members, name, photo_url, council_type) |
| GET | `/council/p/members` | ✅ COUNCIL | Get members JSON array |
| POST | `/council/p/members` | ✅ COUNCIL | Replace full `{ members: [{name, email, role, team}] }` array |

---

## Documents (`/document`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/document/p/:eventId` | ✅ | List docs for event. Cached 2 min. |
| POST | `/document/p` | ✅ COUNCIL+ | Body: `{ event_id, name, type, url, required? }`. Types: PROPOSAL, REPORT, GEOTAG, BUDGET, CERTIFICATE, OTHER |
| PUT | `/document/p/:docId` | ✅ COUNCIL+ | Update `{ name?, url? }` |
| DELETE | `/document/p/:docId` | ✅ COUNCIL+ | Delete document |

---

## Budget (`/budget`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/budget/p/:eventId` | ✅ COUNCIL+ | Items + summary `{ income, expense, net }`. Cached 2 min. |
| POST | `/budget/p` | ✅ COUNCIL+ | `{ event_id, category, description, amount, type (INCOME|EXPENSE), date? }` |
| PUT | `/budget/p/:itemId` | ✅ COUNCIL+ | Partial update |
| DELETE | `/budget/p/:itemId` | ✅ COUNCIL+ | Delete item |

---

## Announcements (`/announcement`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/announcement/p/:eventId` | ✅ COUNCIL+ | List. Cached 2 min. |
| POST | `/announcement/p` | ✅ COUNCIL+ | `{ event_id, title, body, channel (EMAIL|PUSH|BOTH) }`. Sends email to registered participants automatically. |
| DELETE | `/announcement/p/:announcementId` | ✅ COUNCIL+ | Delete |

---

## Caching Summary

| Layer | Key pattern | TTL | Invalidated by |
|-------|-------------|-----|----------------|
| Auth user lookup | `user:<googleId>` | 2 min | — |
| Council event list | `events:council:<userId>` | 90 sec | Event create/update |
| Student event list | `events:student:all` | 90 sec | Event create/update |
| Calendar events | `events:calendar` | 90 sec | Event create/update |
| Single event | `event:<id>` | 5 min | Event update |
| Stats | `stats:all` | 5 min | Event update |
| Council list | `councils:all` | 10 min | Council profile update |
| Council profile | `council:profile:<id>` | 10 min | Council profile update |
| Budget items | `budget:<eventId>` | 2 min | Budget CRUD |
| Documents | `docs:<eventId>` | 2 min | Document CRUD |
| Announcements | `announcements:<eventId>` | 2 min | Announcement CRUD |

---

## Rate Limits

- Global: 300 req / 60 sec per IP
- Auth endpoints: 30 req / 15 min per IP
