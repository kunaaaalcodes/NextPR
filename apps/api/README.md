# NextPR API

Backend for NextPR: recommends GitHub issues you can actually get merged, ranked for the signed-in user.

**Stack:** Node.js, Express, TypeScript, MongoDB (Mongoose), GitHub OAuth + REST API, JWT, node-cron.

## Setup

1. Create a GitHub OAuth App (https://github.com/settings/developers)
   - Callback URL: `http://localhost:4000/auth/github/callback`
2. `cp .env.example .env` and fill it in. Generate secrets with `openssl rand -hex 32`
   (use it for `JWT_SECRET`, `ENCRYPTION_KEY` (must be 64 hex chars) and `ADMIN_KEY`).
   Add a `GITHUB_TOKEN` (personal access token, no scopes) so the crawler gets 5,000 requests/hour.
3. Start MongoDB: `docker run -d -p 27017:27017 mongo:7` (or use Atlas)
4. `npm install && npm run dev`
5. Fill the database with issues:
   `curl -X POST localhost:4000/api/admin/crawl -H "x-admin-key: <ADMIN_KEY>"`
   (it also runs automatically on the `CRAWL_CRON` schedule, hourly by default)

Docker: `docker compose up --build`

## How the frontend uses it

1. Link the "Sign in" button to `GET /auth/github`.
2. After login the API redirects to `FRONTEND_URL/auth/callback?token=<JWT>`. Save the token.
3. Send `Authorization: Bearer <token>` on every `/api` call (except the public ones).

## Endpoints

| Method       | Path                      | Auth          | Description                                     |
| ------------ | ------------------------- | ------------- | ----------------------------------------------- |
| GET          | `/auth/github`            | no            | Start GitHub login                              |
| GET          | `/auth/github/callback`   | no            | OAuth callback (redirects to frontend with JWT) |
| GET          | `/api/me`                 | yes           | Profile: languages, topics, experience          |
| POST         | `/api/me/refresh-profile` | yes           | Re-analyze GitHub repos                         |
| PATCH        | `/api/me/preferences`     | yes           | `{ experience?, extraLanguages? }`              |
| DELETE       | `/api/me`                 | yes           | Delete account                                  |
| GET          | `/api/issues/matches`     | yes           | **Personalized ranked feed**                    |
| GET          | `/api/issues`             | no            | Browse all issues                               |
| GET          | `/api/issues/:id`         | no            | Issue + repo details                            |
| GET          | `/api/saved`              | yes           | Saved issues                                    |
| PUT / DELETE | `/api/saved/:issueId`     | yes           | Save / unsave                                   |
| POST         | `/api/admin/crawl`        | `x-admin-key` | Trigger a crawl                                 |
| GET          | `/health`                 | no            | Health check                                    |

Query params for `/api/issues` and `/api/issues/matches`: `language` (comma separated), `difficulty` (easy|medium|hard), `label` (one or more comma-separated labels, matched case-insensitively), `minResponsiveness` (0-100), `page`, `pageSize`. Matches also accepts `minScore`.

Each match includes `score` (0-100), `mergeChance` (low|medium|high), and `reasons[]` ("why this fits you").

## How ranking works (score out of 100)

- 40: language match with your GitHub repos
- 30: maintainer responsiveness (merge rate + median time to merge over the last 30 closed PRs)
- 10: difficulty fit for your experience level
- 10: freshness of the issue
- 10: shared topics

Stale issues (assigned, 20+ comments, or inactive for 120+ days) are filtered out.

## Project structure

```
src/
  config.ts        env validation
  models/          User, Issue, Repo
  services/        github, profile, scoring, crawler
  routes/          auth, me, issues
  middleware/      auth, error handling
```

## Next improvements

- Embeddings + Atlas Vector Search for semantic matching
- BullMQ + Redis queue for crawling at scale
- Weekly email/Telegram digest
- Tests (Vitest + mongodb-memory-server)
