# NextPR

Find GitHub issues you can actually merge. Issues are ranked for the signed-in user by language fit,
maintainer responsiveness, difficulty and freshness.

```
apps/
  api/   Express + TypeScript + MongoDB (GitHub OAuth, crawler, ranking)
  web/   Next.js (App Router) UI
```

## Quick start

```bash
npm install
docker compose up -d                       # MongoDB (or use Atlas)
cp apps/api/.env.example apps/api/.env     # fill it in (see below)
cp apps/web/.env.example apps/web/.env.local
npm run dev                                # API on :4000, web on :3000
```

Fill the database once the API is running:

```bash
curl -X POST http://localhost:4000/api/admin/crawl -H "x-admin-key: <ADMIN_KEY>"
```

Then open http://localhost:3000 and sign in with GitHub.

## apps/api/.env

- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: from a GitHub OAuth App (callback `http://localhost:4000/auth/github/callback`)
- `GITHUB_TOKEN`: personal access token with no scopes (crawler rate limits)
- `JWT_SECRET`, `ENCRYPTION_KEY`, `ADMIN_KEY`: three different values from `openssl rand -hex 32`
- `MONGODB_URI=mongodb://localhost:27017/nextpr`
- `FRONTEND_URL=http://localhost:3000`

## Scripts

| Command                               | What it does                                 |
| ------------------------------------- | -------------------------------------------- |
| `npm run dev`                         | API and web together                         |
| `npm run dev:api` / `npm run dev:web` | One at a time                                |
| `npm run build`                       | Build both                                   |
| `npm run typecheck`                   | Type-check both                              |
| `npm run format`                      | Format supported project files with Prettier |
| `npm run format:check`                | Check formatting without changing files      |

## Web pages

| Route            | Purpose                                                  |
| ---------------- | -------------------------------------------------------- |
| `/`              | Landing page                                             |
| `/dashboard`     | Personalized matches, filters, profile, experience level |
| `/browse`        | Public issue list with filters                           |
| `/saved`         | Saved issues                                             |
| `/auth/callback` | Receives the JWT after GitHub login                      |

API details are in `apps/api/README.md`.

## Deploying

- **Web:** Vercel, root directory `apps/web`, env `NEXT_PUBLIC_API_URL=<your API URL>`
- **API:** Render or Railway, root directory `apps/api`, build `npm install && npm run build`, start `npm start`
- Database: MongoDB Atlas
- Add your production callback URL to the GitHub OAuth App and set `FRONTEND_URL` on the API
