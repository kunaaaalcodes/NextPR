# Deploy NextPR on Railway

The app runs as two Railway services: the Next.js web app and the Express API. Both are npm workspaces in this repository. Create each service from the same repository and use the `production` branch.

## Services

Keep the repository root (`/`) as each service's root directory so Railway can use the root `package-lock.json` and npm workspaces.

| Service | Build command | Start command | Health check |
| --- | --- | --- | --- |
| API | `npm run build -w apps/api` | `npm run start -w apps/api` | `/health` |
| Web | `npm run build -w apps/web` | `npm run start -w apps/web` | `/` |

Railway can automatically detect npm workspaces when importing the repository. If it doesn't stage both services, create two services from this repository and set the commands above in each service's Settings. Generate a public domain for both services.

Railway supplies `PORT` at runtime. The API reads it directly, and the web's `next start` command now honors it. Do not hardcode a Railway port.

## Variables

Add these variables to the **API** service:

```text
NODE_ENV=production
MONGODB_URI=<your MongoDB connection string>
FRONTEND_URL=https://<your-web-domain>
GITHUB_CLIENT_ID=<your GitHub OAuth client ID>
GITHUB_CLIENT_SECRET=<your GitHub OAuth client secret>
GITHUB_CALLBACK_URL=https://<your-api-domain>/auth/github/callback
GITHUB_TOKEN=<optional GitHub token for higher API rate limits>
JWT_SECRET=<random secret, at least 16 characters>
ENCRYPTION_KEY=<64 hexadecimal characters>
ADMIN_KEY=<random secret, at least 16 characters>
CRAWL_CRON=0 * * * *
CRAWL_LANGUAGES=TypeScript,JavaScript
```

Add this variable to the **Web** service:

```text
NEXT_PUBLIC_API_URL=https://<your-api-domain>
```

Set `NEXT_PUBLIC_API_URL` before building the web service. Next.js embeds `NEXT_PUBLIC_` variables in the browser bundle at build time. After generating or changing either Railway domain, update the matching variables and redeploy.

In the GitHub OAuth app, set the homepage URL to the web domain and the callback URL to the exact `GITHUB_CALLBACK_URL` above. The API uses `FRONTEND_URL` for CORS and the post-login redirect.

Generate secrets with `openssl rand -hex 32`; use separate values for `JWT_SECRET`, `ENCRYPTION_KEY`, and `ADMIN_KEY`. Do not commit real secrets. Rotate any credentials previously pasted into chat before adding them to Railway.

## MongoDB Atlas access

The API must be able to reach Atlas from Railway. If your Atlas access list only contains your home IP, Railway cannot connect. Railway's static outbound IP feature is available on the Pro plan; enable it for the API service, add every assigned address to Atlas Network Access, then redeploy the API. Otherwise, use a database/network setup that permits Railway's outbound connection.

## Local environment files

Use `apps/api/.env.example` and `apps/web/.env.example` as templates for local development. Keep real `.env` files out of Git.
